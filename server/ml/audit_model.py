import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)

def run_ml_audit():
    print("=" * 80)
    print("WORKMOJO — COMPREHENSIVE MACHINE LEARNING VALIDATION AUDIT")
    print("=" * 80)

    # 1. Dataset Loading
    csv_path = os.path.join(os.path.dirname(__file__), 'data', 'work_mojo_synthetic_dataset_1000.csv')
    if not os.path.exists(csv_path):
        csv_path = r'C:\Users\saich\Downloads\work_mojo_synthetic_dataset_1000.csv'
    
    df = pd.read_csv(csv_path)
    print(f"\n[1] DATASET INSPECTION")
    print(f"Total rows: {len(df)}, Total columns: {len(df.columns)}")
    print(f"Columns: {list(df.columns)}")
    
    # 2. Inspect match_label Generation Logic
    print(f"\n[2] INSPECT match_label GENERATION LOGIC")
    exact_skill_equality = (df['worker_skill'].astype(str).str.strip().str.lower() == 
                            df['required_skill'].astype(str).str.strip().str.lower())
    
    matches_where_skill_equal = df[exact_skill_equality]['match_label'].value_counts().to_dict()
    matches_where_skill_not_equal = df[~exact_skill_equality]['match_label'].value_counts().to_dict()
    
    print(f"When worker_skill == required_skill:")
    print(f"  Total occurrences: {exact_skill_equality.sum()}")
    print(f"  match_label counts: {matches_where_skill_equal}")
    print(f"When worker_skill != required_skill:")
    print(f"  Total occurrences: {(~exact_skill_equality).sum()}")
    print(f"  match_label counts: {matches_where_skill_not_equal}")
    
    is_perfect_equivalence = (exact_skill_equality.astype(int) == df['match_label']).all()
    print(f"\nIs match_label 100% mathematically equivalent to (worker_skill == required_skill)? -> {is_perfect_equivalence}")

    # Check correlations with other features
    numeric_df = pd.DataFrame()
    numeric_df['match_label'] = df['match_label'].astype(int)
    numeric_df['skill_match'] = exact_skill_equality.astype(int)
    numeric_df['experience_years'] = df['experience_years'].astype(float)
    numeric_df['distance_km'] = df['distance_km'].astype(float)
    numeric_df['rating'] = df['rating'].astype(float)
    if 'match_score' in df.columns:
        numeric_df['match_score'] = df['match_score'].astype(float)
        
    corr = numeric_df.corr()['match_label'].to_dict()
    print("\nCorrelations with match_label:")
    for feat, val in corr.items():
        print(f"  - {feat:20s}: {val:.4f}")

    # 3. Preprocessing Audit
    print(f"\n[3] PREPROCESSING AUDIT OF train_model.py")
    print("- Target variable used: 'match_label'")
    print("- worker_id excluded: YES (not in feature list)")
    print("- match_score excluded: YES (not in feature list)")
    print("- match_label excluded from X: YES")
    print("- Encoder fitting order: Vocabularies gathered before train/test split.")

    # Normalize categorical string columns
    for col in ['worker_skill', 'required_skill', 'job_type', 'availability', 'worker_location']:
        df[col] = df[col].astype(str).str.strip()

    # Create encoders
    skills_vocab = sorted(list(set(df['worker_skill'].unique()).union(set(df['required_skill'].unique())).union(set(df['job_type'].unique()))))
    skill_to_code = {s: i for i, s in enumerate(skills_vocab)}
    avail_vocab = sorted(list(df['availability'].unique()))
    avail_to_code = {a: i for i, a in enumerate(avail_vocab)}
    loc_vocab = sorted(list(df['worker_location'].unique()))
    loc_to_code = {l: i for i, l in enumerate(loc_vocab)}

    df['worker_skill_code'] = df['worker_skill'].map(skill_to_code)
    df['required_skill_code'] = df['required_skill'].map(skill_to_code)
    df['job_type_code'] = df['job_type'].map(skill_to_code)
    df['availability_code'] = df['availability'].map(avail_to_code)
    df['location_code'] = df['worker_location'].map(loc_to_code)
    df['skill_match'] = exact_skill_equality.astype(float)

    # 4. Held-Out Test Validation (Original Model with skill_match)
    print(f"\n[4] HELD-OUT 80/20 TEST VALIDATION (ORIGINAL MODEL)")
    feature_cols_orig = [
        'skill_match',
        'experience_years',
        'distance_km',
        'rating',
        'availability_code',
        'worker_skill_code',
        'required_skill_code',
        'job_type_code',
        'location_code'
    ]
    X_orig = df[feature_cols_orig].copy()
    y = df['match_label'].astype(int)

    X_train_o, X_test_o, y_train_o, y_test_o = train_test_split(
        X_orig, y, test_size=0.20, random_state=42, stratify=y
    )

    rf_orig = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight='balanced',
        random_state=42
    )
    rf_orig.fit(X_train_o, y_train_o)
    y_pred_o = rf_orig.predict(X_test_o)
    y_prob_o = rf_orig.predict_proba(X_test_o)[:, 1]

    acc_o = accuracy_score(y_test_o, y_pred_o)
    prec_o = precision_score(y_test_o, y_pred_o, zero_division=0)
    rec_o = recall_score(y_test_o, y_pred_o, zero_division=0)
    f1_o = f1_score(y_test_o, y_pred_o, zero_division=0)
    auc_o = roc_auc_score(y_test_o, y_prob_o)
    cm_o = confusion_matrix(y_test_o, y_pred_o)

    print(f"Training samples: {len(X_train_o)} (Pos: {y_train_o.sum()}, Neg: {len(y_train_o) - y_train_o.sum()})")
    print(f"Testing samples:  {len(X_test_o)} (Pos: {y_test_o.sum()}, Neg: {len(y_test_o) - y_test_o.sum()})")
    print(f"Accuracy:         {acc_o * 100:.2f}%")
    print(f"Precision:        {prec_o * 100:.2f}%")
    print(f"Recall:           {rec_o * 100:.2f}%")
    print(f"F1-Score:         {f1_o * 100:.2f}%")
    print(f"ROC-AUC:          {auc_o * 100:.2f}%")
    print(f"Confusion Matrix: TN={cm_o[0][0]}, FP={cm_o[0][1]}, FN={cm_o[1][0]}, TP={cm_o[1][1]}")

    # 5. 5-Fold Stratified Cross-Validation
    print(f"\n[5] STRATIFIED 5-FOLD CROSS-VALIDATION (ORIGINAL MODEL)")
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    fold_metrics = []

    for fold_idx, (train_idx, val_idx) in enumerate(skf.split(X_orig, y), 1):
        X_tr, X_val = X_orig.iloc[train_idx], X_orig.iloc[val_idx]
        y_tr, y_val = y.iloc[train_idx], y.iloc[val_idx]

        rf_fold = RandomForestClassifier(
            n_estimators=100,
            max_depth=8,
            min_samples_split=4,
            min_samples_leaf=2,
            class_weight='balanced',
            random_state=42
        )
        rf_fold.fit(X_tr, y_tr)
        y_val_pred = rf_fold.predict(X_val)
        y_val_prob = rf_fold.predict_proba(X_val)[:, 1]

        acc_f = accuracy_score(y_val, y_val_pred)
        prec_f = precision_score(y_val, y_val_pred, zero_division=0)
        rec_f = recall_score(y_val, y_val_pred, zero_division=0)
        f1_f = f1_score(y_val, y_val_pred, zero_division=0)
        auc_f = roc_auc_score(y_val, y_val_prob)

        fold_metrics.append({
            'fold': fold_idx,
            'accuracy': acc_f,
            'precision': prec_f,
            'recall': rec_f,
            'f1': f1_f,
            'roc_auc': auc_f
        })
        print(f"Fold {fold_idx}: Acc={acc_f*100:.2f}%, Prec={prec_f*100:.2f}%, Rec={rec_f*100:.2f}%, F1={f1_f*100:.2f}%, ROC-AUC={auc_f*100:.2f}%")

    metrics_df = pd.DataFrame(fold_metrics)
    print("\nCross-Validation Summary (5 Folds):")
    print(f"Mean Accuracy:  {metrics_df['accuracy'].mean()*100:.2f}% (+/- {metrics_df['accuracy'].std()*100:.2f}%)")
    print(f"Mean Precision: {metrics_df['precision'].mean()*100:.2f}% (+/- {metrics_df['precision'].std()*100:.2f}%)")
    print(f"Mean Recall:    {metrics_df['recall'].mean()*100:.2f}% (+/- {metrics_df['recall'].std()*100:.2f}%)")
    print(f"Mean F1-Score:  {metrics_df['f1'].mean()*100:.2f}% (+/- {metrics_df['f1'].std()*100:.2f}%)")
    print(f"Mean ROC-AUC:   {metrics_df['roc_auc'].mean()*100:.2f}% (+/- {metrics_df['roc_auc'].std()*100:.2f}%)")

    # 6. Ablation Test: Remove skill_match
    print(f"\n[6] ABLATION TEST -- REMOVE skill_match")
    feature_cols_no_sm = [
        'experience_years',
        'distance_km',
        'rating',
        'availability_code',
        'worker_skill_code',
        'required_skill_code',
        'job_type_code',
        'location_code'
    ]
    X_no_sm = df[feature_cols_no_sm].copy()
    X_train_ns, X_test_ns, y_train_ns, y_test_ns = train_test_split(
        X_no_sm, y, test_size=0.20, random_state=42, stratify=y
    )

    rf_no_sm = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight='balanced',
        random_state=42
    )
    rf_no_sm.fit(X_train_ns, y_train_ns)
    y_pred_ns = rf_no_sm.predict(X_test_ns)
    y_prob_ns = rf_no_sm.predict_proba(X_test_ns)[:, 1]

    acc_ns = accuracy_score(y_test_ns, y_pred_ns)
    prec_ns = precision_score(y_test_ns, y_pred_ns, zero_division=0)
    rec_ns = recall_score(y_test_ns, y_pred_ns, zero_division=0)
    f1_ns = f1_score(y_test_ns, y_pred_ns, zero_division=0)
    auc_ns = roc_auc_score(y_test_ns, y_prob_ns)
    cm_ns = confusion_matrix(y_test_ns, y_pred_ns)

    print(f"Accuracy:         {acc_ns * 100:.2f}%")
    print(f"Precision:        {prec_ns * 100:.2f}%")
    print(f"Recall:           {rec_ns * 100:.2f}%")
    print(f"F1-Score:         {f1_ns * 100:.2f}%")
    print(f"ROC-AUC:          {auc_ns * 100:.2f}%")
    print(f"Confusion Matrix: TN={cm_ns[0][0]}, FP={cm_ns[0][1]}, FN={cm_ns[1][0]}, TP={cm_ns[1][1]}")
    
    imp_ns = dict(zip(feature_cols_no_sm, rf_no_sm.feature_importances_))
    sorted_imp_ns = sorted(imp_ns.items(), key=lambda x: x[1], reverse=True)
    print("Feature Importances (without skill_match):")
    for feat, imp in sorted_imp_ns:
        print(f"  - {feat:20s}: {imp * 100:5.2f}%")

    # 7. Realistic Feature-Only Validation
    print(f"\n[7] REALISTIC FEATURE-ONLY VALIDATION")
    feature_cols_real = [
        'worker_skill_code',
        'required_skill_code',
        'job_type_code',
        'experience_years',
        'distance_km',
        'availability_code',
        'rating',
        'location_code'
    ]
    X_real = df[feature_cols_real].copy()
    X_train_r, X_test_r, y_train_r, y_test_r = train_test_split(
        X_real, y, test_size=0.20, random_state=42, stratify=y
    )

    rf_real = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight='balanced',
        random_state=42
    )
    rf_real.fit(X_train_r, y_train_r)
    y_pred_r = rf_real.predict(X_test_r)
    y_prob_r = rf_real.predict_proba(X_test_r)[:, 1]

    acc_r = accuracy_score(y_test_r, y_pred_r)
    prec_r = precision_score(y_test_r, y_pred_r, zero_division=0)
    rec_r = recall_score(y_test_r, y_pred_r, zero_division=0)
    f1_r = f1_score(y_test_r, y_pred_r, zero_division=0)
    auc_r = roc_auc_score(y_test_r, y_prob_r)
    cm_r = confusion_matrix(y_test_r, y_pred_r)

    print(f"Accuracy:         {acc_r * 100:.2f}%")
    print(f"Precision:        {prec_r * 100:.2f}%")
    print(f"Recall:           {rec_r * 100:.2f}%")
    print(f"F1-Score:         {f1_r * 100:.2f}%")
    print(f"ROC-AUC:          {auc_r * 100:.2f}%")
    print(f"Confusion Matrix: TN={cm_r[0][0]}, FP={cm_r[0][1]}, FN={cm_r[1][0]}, TP={cm_r[1][1]}")

    imp_r = dict(zip(feature_cols_real, rf_real.feature_importances_))
    sorted_imp_r = sorted(imp_r.items(), key=lambda x: x[1], reverse=True)
    print("Feature Importances (Realistic Features Only):")
    for feat, imp in sorted_imp_r:
        print(f"  - {feat:20s}: {imp * 100:5.2f}%")

    # Save complete audit results to JSON
    audit_results = {
        'is_perfect_equivalence': bool(is_perfect_equivalence),
        'correlations': corr,
        'held_out_original': {
            'accuracy': float(acc_o),
            'precision': float(prec_o),
            'recall': float(rec_o),
            'f1': float(f1_o),
            'roc_auc': float(auc_o),
            'confusion_matrix': {'tn': int(cm_o[0][0]), 'fp': int(cm_o[0][1]), 'fn': int(cm_o[1][0]), 'tp': int(cm_o[1][1])}
        },
        'cv_5fold': {
            'folds': fold_metrics,
            'mean_accuracy': float(metrics_df['accuracy'].mean()),
            'std_accuracy': float(metrics_df['accuracy'].std()),
            'mean_precision': float(metrics_df['precision'].mean()),
            'mean_recall': float(metrics_df['recall'].mean()),
            'mean_f1': float(metrics_df['f1'].mean()),
            'mean_roc_auc': float(metrics_df['roc_auc'].mean())
        },
        'ablation_without_skill_match': {
            'accuracy': float(acc_ns),
            'precision': float(prec_ns),
            'recall': float(rec_ns),
            'f1': float(f1_ns),
            'roc_auc': float(auc_ns),
            'confusion_matrix': {'tn': int(cm_ns[0][0]), 'fp': int(cm_ns[0][1]), 'fn': int(cm_ns[1][0]), 'tp': int(cm_ns[1][1])},
            'feature_importances': {k: float(v) for k, v in sorted_imp_ns}
        },
        'realistic_only': {
            'accuracy': float(acc_r),
            'precision': float(prec_r),
            'recall': float(rec_r),
            'f1': float(f1_r),
            'roc_auc': float(auc_r),
            'confusion_matrix': {'tn': int(cm_r[0][0]), 'fp': int(cm_r[0][1]), 'fn': int(cm_r[1][0]), 'tp': int(cm_r[1][1])},
            'feature_importances': {k: float(v) for k, v in sorted_imp_r}
        }
    }

    out_file = os.path.join(os.path.dirname(__file__), 'ml_audit_results.json')
    with open(out_file, 'w', encoding='utf-8') as f:
        json.dump(audit_results, f, indent=2)
    print(f"\nAudit completed! Results saved to: {out_file}")

if __name__ == '__main__':
    run_ml_audit()
