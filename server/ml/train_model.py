import os
import json
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report
)
import joblib

def main():
    print('=' * 60)
    print('WorkMojo Machine Learning Pipeline: Training Random Forest')
    print('=' * 60)

    # 1. Locate dataset
    data_paths = [
        os.path.join(os.path.dirname(__file__), 'data', 'work_mojo_synthetic_dataset_1000.csv'),
        r'C:\Users\saich\Downloads\work_mojo_synthetic_dataset_1000.csv',
    ]
    csv_path = None
    for p in data_paths:
        if os.path.exists(p):
            csv_path = p
            break

    if not csv_path:
        raise FileNotFoundError('Could not locate work_mojo_synthetic_dataset_1000.csv')

    print(f'Loading dataset from: {csv_path}')
    df = pd.read_csv(csv_path)
    print(f'Dataset Shape: {df.shape[0]} rows, {df.shape[1]} columns')

    # 2. Check for missing values
    missing = df.isnull().sum()
    print('\nMissing Value Summary:')
    print(missing)

    # 3. Target and Feature Definition
    # We strictly exclude 'worker_id' (identifier) and 'match_score' (continuous target proxy)
    target_col = 'match_label'
    y = df[target_col].astype(int)

    # Normalize categorical string columns
    for col in ['worker_skill', 'required_skill', 'job_type', 'availability', 'worker_location']:
        df[col] = df[col].astype(str).str.strip()

    # Feature Engineering: exact skill match interaction
    df['skill_match'] = (df['worker_skill'].str.lower() == df['required_skill'].str.lower()).astype(float)

    # Build unique category vocabularies
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

    feature_cols = [
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

    X = df[feature_cols].copy()
    for col in ['experience_years', 'distance_km', 'rating']:
        X[col] = X[col].astype(float)

    print('\nFeature Matrix Shape:', X.shape)
    print('Class Distribution:\n', y.value_counts())

    # 4. Stratified Train/Test Split (80% Train, 20% Test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    print(f'\nTraining samples: {len(X_train)} ({sum(y_train==1)} positive matches)')
    print(f'Testing samples:  {len(X_test)} ({sum(y_test==1)} positive matches)')

    # 5. Train Random Forest Classifier
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=8,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight='balanced',
        random_state=42
    )
    rf.fit(X_train, y_train)

    # 6. Model Evaluation on Test Set
    y_pred = rf.predict(X_test)
    y_prob = rf.predict_proba(X_test)[:, 1]

    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred, zero_division=0)
    rec = recall_score(y_test, y_pred, zero_division=0)
    f1 = f1_score(y_test, y_pred, zero_division=0)
    cm = confusion_matrix(y_test, y_pred)

    print('\n' + '=' * 60)
    print('TEST SET PERFORMANCE METRICS')
    print('=' * 60)
    print(f'Accuracy:         {acc * 100:.2f}%')
    print(f'Precision:        {prec * 100:.2f}%')
    print(f'Recall:           {rec * 100:.2f}%')
    print(f'F1-Score:         {f1 * 100:.2f}%')
    print('\nConfusion Matrix:')
    print(f'  TN (Correct Non-Match): {cm[0][0]}    FP (False Alarm): {cm[0][1]}')
    print(f'  FN (Missed Match):      {cm[1][0]}    TP (Correct Match): {cm[1][1]}')

    print('\nDetailed Classification Report:')
    print(classification_report(y_test, y_pred, target_names=['Non-Match (0)', 'Match (1)']))

    # Feature Importances
    importances = dict(zip(feature_cols, rf.feature_importances_))
    sorted_importances = sorted(importances.items(), key=lambda x: x[1], reverse=True)
    print('Feature Importances:')
    for feat, imp in sorted_importances:
        print(f'  - {feat:20s}: {imp * 100:5.2f}%')

    # 7. Export Model to JSON (Zero-dependency Node.js execution format)
    trees_json = []
    for tree_estimator in rf.estimators_:
        tree = tree_estimator.tree_
        nodes = []
        for i in range(tree.node_count):
            # Compute class probability at this node
            val = tree.value[i][0] # class counts [count_0, count_1]
            total = float(val.sum())
            prob_1 = float(val[1] / total) if total > 0 else 0.0

            node_data = {
                'id': i,
                'feature': int(tree.feature[i]), # -2 represents a leaf node
                'threshold': float(tree.threshold[i]),
                'left': int(tree.children_left[i]),
                'right': int(tree.children_right[i]),
                'prob1': round(prob_1, 4),
            }
            nodes.append(node_data)
        trees_json.append(nodes)

    model_payload = {
        'model_type': 'RandomForestClassifier',
        'n_estimators': len(trees_json),
        'max_depth': 8,
        'feature_names': feature_cols,
        'categorical_maps': {
            'skills': skill_to_code,
            'availability': avail_to_code,
            'location': loc_to_code
        },
        'metrics': {
            'test_accuracy': round(float(acc), 4),
            'test_precision': round(float(prec), 4),
            'test_recall': round(float(rec), 4),
            'test_f1': round(float(f1), 4),
            'confusion_matrix': {
                'tn': int(cm[0][0]),
                'fp': int(cm[0][1]),
                'fn': int(cm[1][0]),
                'tp': int(cm[1][1])
            }
        },
        'feature_importances': {feat: round(float(imp), 4) for feat, imp in sorted_importances},
        'trees': trees_json
    }

    out_dir = os.path.dirname(__file__)
    json_path = os.path.join(out_dir, 'model_random_forest.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(model_payload, f, indent=2)
    print(f'\nExported portable JSON model to: {json_path} ({os.path.getsize(json_path)} bytes)')

    # Also copy to server/src/ml for direct TypeScript import
    src_ml_dir = os.path.join(out_dir, '..', 'src', 'ml')
    os.makedirs(src_ml_dir, exist_ok=True)
    src_json_path = os.path.join(src_ml_dir, 'model_random_forest.json')
    with open(src_json_path, 'w', encoding='utf-8') as f:
        json.dump(model_payload, f, indent=2)
    print(f'Mirrored model to backend source: {src_json_path}')

    # Save joblib artifact
    joblib_path = os.path.join(out_dir, 'model.joblib')
    joblib.dump({
        'model': rf,
        'feature_cols': feature_cols,
        'categorical_maps': model_payload['categorical_maps'],
        'metrics': model_payload['metrics']
    }, joblib_path)
    print(f'Exported Python joblib artifact to: {joblib_path}')

    # Save training report summary
    report_path = os.path.join(out_dir, 'training_report.json')
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump({
            'dataset_rows': int(len(df)),
            'train_rows': int(len(X_train)),
            'test_rows': int(len(X_test)),
            'metrics': model_payload['metrics'],
            'feature_importances': model_payload['feature_importances'],
            'status': 'SUCCESS'
        }, f, indent=2)
    print(f'Saved training report to: {report_path}')
    print('\nTraining and model export completed successfully!')

if __name__ == '__main__':
    main()
