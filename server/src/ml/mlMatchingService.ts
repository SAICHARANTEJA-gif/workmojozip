import fs from 'fs';
import path from 'path';

export interface TreeNode {
  id: number;
  feature: number; // -2 means leaf node
  threshold: number;
  left: number;
  right: number;
  prob1: number;
}

export interface ModelMetrics {
  test_accuracy: number;
  test_precision: number;
  test_recall: number;
  test_f1: number;
  confusion_matrix: {
    tn: number;
    fp: number;
    fn: number;
    tp: number;
  };
}

export interface ModelPayload {
  model_type: string;
  n_estimators: number;
  max_depth: number;
  feature_names: string[];
  categorical_maps: {
    skills: Record<string, number>;
    availability: Record<string, number>;
    location: Record<string, number>;
  };
  metrics: ModelMetrics;
  feature_importances: Record<string, number>;
  trees: TreeNode[][];
}

export interface MLMatchResult {
  score: number;             // 0 - 100 hybrid score
  mlProbability: number;     // 0.0 to 1.0 (Random Forest class 1 probability)
  isMatch: boolean;          // true if mlProbability >= 0.50
  breakdown: {
    skills: number;          // max 30
    distance: number;        // max 20
    availability: number;    // max 20
    rating: number;          // max 15
    experience: number;      // max 10
    reliability: number;     // max 5
  };
  reasons: string[];
  modelInfo: {
    modelType: string;
    treesCount: number;
    testAccuracy: number;
    testF1: number;
    featureImportances: Record<string, number>;
  };
  featureVector: {
    skillMatch: number;
    experienceYears: number;
    distanceKm: number;
    rating: number;
    availabilityCode: number;
    workerSkillCode: number;
    requiredSkillCode: number;
    jobTypeCode: number;
    locationCode: number;
  };
}

let cachedModel: ModelPayload | null = null;

function loadModel(): ModelPayload {
  if (cachedModel) return cachedModel;

  const candidatePaths = [
    path.join(__dirname, 'model_random_forest.json'),
    path.join(__dirname, '..', '..', 'ml', 'model_random_forest.json'),
    path.join(process.cwd(), 'ml', 'model_random_forest.json'),
    path.join(process.cwd(), 'server', 'ml', 'model_random_forest.json'),
    path.join(__dirname, '..', 'ml', 'model_random_forest.json'),
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, 'utf8');
        cachedModel = JSON.parse(raw);
        console.log(`[MLService] Successfully loaded Random Forest model from ${p} (${cachedModel?.n_estimators} trees)`);
        return cachedModel!;
      } catch (err) {
        console.warn(`[MLService] Failed parsing model at ${p}:`, err);
      }
    }
  }

  throw new Error('[MLService] Could not find model_random_forest.json in any expected path');
}

/**
 * Normalizes any category or skill trade string to canonical dataset vocab
 */
export function normalizeTradeSkill(trade: string): string {
  const t = (trade || '').toLowerCase().trim();
  if (t.includes('plumb') || t.includes('ప్లంబ') || t.includes('प्लंबर') || t.includes('tap') || t.includes('pipe') || t.includes('drain')) return 'Plumber';
  if (t.includes('electr') || t.includes('ఎలక్ట్రీ') || t.includes('इलेक्ट्री')) return 'Electrician';
  if (t.includes('carpent') || t.includes('వడ్రంగి') || t.includes('बढ़ई')) return 'Carpenter';
  if (t.includes('paint') || t.includes('పెయింట') || t.includes('पेंटर')) return 'Painter';
  if (t.includes('clean') || t.includes('శుభ్రం') || t.includes('सफाई')) return 'Cleaner';
  if (t.includes('driv') || t.includes('డ్రైవ') || t.includes('ड्राइव')) return 'Driver';
  if (t.includes('garden') || t.includes('తోట') || t.includes('माली')) return 'Gardener';
  if (t.includes('cook') || t.includes('chef') || t.includes('domestic') || t.includes('helper') || t.includes('housekeep') || t.includes('వంట')) return 'Domestic Helper';
  if (t.includes('care') || t.includes('nurse') || t.includes('elder')) return 'Caregiver';
  if (t.includes('tech') || t.includes('repair') || t.includes('mechanic') || t.includes('appliance')) return 'Technician';
  return 'Domestic Helper';
}

/**
 * Normalizes location string to dataset city vocabulary
 */
export function normalizeLocation(loc: string): string {
  const l = (loc || '').toLowerCase().trim();
  if (l.includes('secunderabad')) return 'Secunderabad';
  if (l.includes('hyderabad') || l.includes('koramangala') || l.includes('indiranagar') || l.includes('btm') || l.includes('hsr') || l.includes('whitefield')) return 'Hyderabad';
  if (l.includes('vijayawada')) return 'Vijayawada';
  if (l.includes('guntur')) return 'Guntur';
  if (l.includes('warangal')) return 'Warangal';
  if (l.includes('hanamkonda')) return 'Hanamkonda';
  if (l.includes('visakhapatnam') || l.includes('vizag')) return 'Visakhapatnam';
  if (l.includes('tirupati')) return 'Tirupati';
  return 'Hyderabad';
}

/**
 * Evaluates a single decision tree on the numerical feature array
 */
function evaluateTree(nodes: TreeNode[], features: number[]): number {
  if (!nodes || nodes.length === 0) return 0.5;
  let curr = nodes[0];
  while (curr && curr.feature !== -2) {
    const val = features[curr.feature];
    const nextId = val <= curr.threshold ? curr.left : curr.right;
    if (nextId === -1 || !nodes[nextId]) break;
    curr = nodes[nextId];
  }
  return curr ? curr.prob1 : 0.5;
}

/**
 * Predict match score using the trained Random Forest ensemble + domain factors
 */
export function predictWorkerJobMatch(worker: any, job: any): MLMatchResult {
  const model = loadModel();

  // Extract skills from worker (handles Supabase worker_profiles and local User objects)
  const workerSkillsList: string[] = Array.isArray(worker.skills)
    ? worker.skills
    : typeof worker.skills === 'string'
    ? [worker.skills]
    : worker.categories || [];

  const jobCategory = job.category || job.title || 'General';
  const normRequired = normalizeTradeSkill(jobCategory);

  // Check if any worker skill matches required trade
  const hasExactTradeMatch = workerSkillsList.some(s => {
    const norm = normalizeTradeSkill(s);
    return norm.toLowerCase() === normRequired.toLowerCase();
  });

  const workerPrimaryTrade = workerSkillsList.length > 0 ? normalizeTradeSkill(workerSkillsList[0]) : (hasExactTradeMatch ? normRequired : 'Domestic Helper');

  const skillMatchVal = hasExactTradeMatch ? 1.0 : 0.0;

  // Numerical metrics
  const completedShifts = Number(worker.experienceJobs || worker.completedJobs || worker.experience_jobs || 12);
  const experienceYears = Number(worker.experienceYears || worker.experience_years || Math.min(20, Math.max(0, Math.round(completedShifts / 5 * 10) / 10)));
  const distanceKm = Number(job.approximateDistanceKm || worker.approxDistanceKm || worker.approx_distance_km || 2.5);
  const rating = Number(worker.rating || 4.5);

  // Availability normalization
  const rawAvail = String(worker.availability || 'Available');
  let availStr = 'Available';
  if (rawAvail.toLowerCase().includes('morning')) availStr = 'Available Morning';
  else if (rawAvail.toLowerCase().includes('evening')) availStr = 'Available Evening';
  else if (rawAvail.toLowerCase().includes('busy')) availStr = 'Busy';

  // Location normalization
  const locStr = normalizeLocation(worker.approxArea || worker.locationArea || worker.approx_area || 'Hyderabad');

  // Encodings from model maps
  const skillMap = model.categorical_maps.skills;
  const availMap = model.categorical_maps.availability;
  const locMap = model.categorical_maps.location;

  const workerSkillCode = skillMap[workerPrimaryTrade] ?? 0;
  const requiredSkillCode = skillMap[normRequired] ?? 0;
  const jobTypeCode = skillMap[normRequired] ?? 0;
  const availCode = availMap[availStr] ?? 0;
  const locCode = locMap[locStr] ?? 2;

  // Feature vector matching order in model:
  // 0: skill_match
  // 1: experience_years
  // 2: distance_km
  // 3: rating
  // 4: availability_code
  // 5: worker_skill_code
  // 6: required_skill_code
  // 7: job_type_code
  // 8: location_code
  const features = [
    skillMatchVal,
    experienceYears,
    distanceKm,
    rating,
    availCode,
    workerSkillCode,
    requiredSkillCode,
    jobTypeCode,
    locCode
  ];

  // Run ensemble inference across all 100 trees
  let sumProb = 0;
  for (let i = 0; i < model.trees.length; i++) {
    sumProb += evaluateTree(model.trees[i], features);
  }
  const mlProb = sumProb / model.trees.length; // 0.0 to 1.0

  // Domain score breakdown (max 100)
  // Skills 30, Distance 20, Availability 20, Rating 15, Experience 10, Reliability 5
  const skillPoints = skillMatchVal === 1.0 ? 30 : (workerSkillsList.length > 0 ? 15 : 5);

  let distancePoints = 5;
  if (distanceKm <= 2.0) distancePoints = 20;
  else if (distanceKm <= 4.0) distancePoints = 16;
  else if (distanceKm <= 6.0) distancePoints = 12;
  else if (distanceKm <= 10.0) distancePoints = 8;

  let availPoints = 8;
  if (availStr === 'Available') availPoints = 20;
  else if (availStr.includes('Available')) availPoints = 15;
  else if (availStr === 'Busy') availPoints = 6;

  let ratingPoints = 6;
  if (rating >= 4.8) ratingPoints = 15;
  else if (rating >= 4.5) ratingPoints = 13;
  else if (rating >= 4.0) ratingPoints = 10;

  let expPoints = 4;
  if (experienceYears >= 10 || completedShifts >= 50) expPoints = 10;
  else if (experienceYears >= 5 || completedShifts >= 25) expPoints = 8;
  else if (experienceYears >= 2 || completedShifts >= 10) expPoints = 6;

  const reliabilityScore = Number(worker.reliabilityScore || worker.reliability_score || 90);
  let relPoints = 2;
  if (reliabilityScore >= 95) relPoints = 5;
  else if (reliabilityScore >= 90) relPoints = 4;

  const domainScore = skillPoints + distancePoints + availPoints + ratingPoints + expPoints + relPoints;

  // Hybrid Formula: 70% Random Forest Probability + 30% Domain Criteria
  const mlScore = Math.round(mlProb * 100);
  const hybridScore = Math.min(100, Math.max(30, Math.round((0.70 * mlScore) + (0.30 * domainScore))));

  // Explainable AI (XAI) Reasons
  const reasons: string[] = [];
  if (skillMatchVal === 1.0) {
    reasons.push(`Verified ${normRequired} Trade Match (${workerPrimaryTrade})`);
  } else {
    reasons.push(`General Gig Worker (Available for ${normRequired})`);
  }

  if (distanceKm <= 3.0) {
    reasons.push(`Hyperlocal Proximity (${distanceKm} km away)`);
  } else if (distanceKm <= 7.0) {
    reasons.push(`Within transit reach (${distanceKm} km)`);
  }

  if (availStr === 'Available') {
    reasons.push('Available for immediate shift assignment');
  }

  if (rating >= 4.6) {
    reasons.push(`Top-rated customer feedback (${rating}★)`);
  }

  if (experienceYears >= 3 || completedShifts >= 20) {
    reasons.push(`${experienceYears} yrs experience (${completedShifts} completed shifts)`);
  }

  if (reliabilityScore >= 92) {
    reasons.push(`High attendance reliability (${reliabilityScore}%)`);
  }

  return {
    score: hybridScore,
    mlProbability: Math.round(mlProb * 1000) / 1000,
    isMatch: mlProb >= 0.50,
    breakdown: {
      skills: skillPoints,
      distance: distancePoints,
      availability: availPoints,
      rating: ratingPoints,
      experience: expPoints,
      reliability: relPoints
    },
    reasons,
    modelInfo: {
      modelType: model.model_type,
      treesCount: model.n_estimators,
      testAccuracy: model.metrics.test_accuracy,
      testF1: model.metrics.test_f1,
      featureImportances: model.feature_importances
    },
    featureVector: {
      skillMatch: skillMatchVal,
      experienceYears,
      distanceKm,
      rating,
      availabilityCode: availCode,
      workerSkillCode,
      requiredSkillCode,
      jobTypeCode,
      locationCode: locCode
    }
  };
}

/**
 * Rank a list of workers for a specific job posting
 */
export function rankWorkersForJob(workers: any[], job: any): Array<{ worker: any; match: MLMatchResult }> {
  return workers
    .map(worker => ({
      worker,
      match: predictWorkerJobMatch(worker, job)
    }))
    .sort((a, b) => b.match.score - a.match.score);
}

/**
 * Get Model Training Diagnostics
 */
export function getMLDiagnostics() {
  const model = loadModel();
  return {
    modelType: model.model_type,
    nEstimators: model.n_estimators,
    maxDepth: model.max_depth,
    featureNames: model.feature_names,
    metrics: model.metrics,
    featureImportances: model.feature_importances
  };
}
