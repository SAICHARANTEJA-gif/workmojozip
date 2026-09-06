import { Job, User } from '../types';

export interface MatchResult {
  score: number; // 0 - 100
  breakdown: {
    skills: number;      // max 30
    distance: number;    // max 20
    availability: number;// max 20
    rating: number;      // max 15
    experience: number;  // max 10
    reliability: number; // max 5
  };
  reasons: string[];
}

export function calculateMatchScore(worker: User, job: Job): MatchResult {
  let skillPoints = 0;
  let distancePoints = 0;
  let availabilityPoints = 0;
  let ratingPoints = 0;
  let experiencePoints = 0;
  let reliabilityPoints = 0;
  const reasons: string[] = [];

  // 1. Skills match (30%)
  const hasDirectCategorySkill = worker.skills.some(
    s => s.toLowerCase() === job.category.toLowerCase()
  );
  const hasPreferredCategory = worker.preferredCategories.some(
    c => c.toLowerCase() === job.category.toLowerCase()
  );

  if (hasDirectCategorySkill) {
    skillPoints = 30;
    reasons.push(`${job.category} skills verified`);
  } else if (hasPreferredCategory) {
    skillPoints = 22;
    reasons.push(`Preferred work category`);
  } else {
    skillPoints = 12;
  }

  // 2. Distance match (20%)
  const dist = job.approximateDistanceKm;
  if (dist <= 2.0) {
    distancePoints = 20;
    reasons.push(`Very close (${dist} km away)`);
  } else if (dist <= 4.0) {
    distancePoints = 16;
    reasons.push(`Within walking/bike reach (${dist} km)`);
  } else if (dist <= 6.0) {
    distancePoints = 12;
    reasons.push(`Reasonable distance (${dist} km)`);
  } else if (dist <= 10.0) {
    distancePoints = 8;
  } else {
    distancePoints = 4;
  }

  // 3. Availability match (20%)
  if (worker.availability === 'Available') {
    availabilityPoints = 20;
    reasons.push('Worker currently Available');
  } else if (worker.availability === 'Busy') {
    availabilityPoints = 8;
  } else {
    availabilityPoints = 4;
  }

  // 4. Rating match (15%)
  if (worker.rating >= 4.8) {
    ratingPoints = 15;
    reasons.push(`Top-rated (${worker.rating}★)`);
  } else if (worker.rating >= 4.5) {
    ratingPoints = 13;
    reasons.push(`High customer satisfaction (${worker.rating}★)`);
  } else if (worker.rating >= 4.0) {
    ratingPoints = 10;
  } else {
    ratingPoints = 6;
  }

  // 5. Experience & completed jobs (10%)
  if (worker.completedJobs >= 100) {
    experiencePoints = 10;
    reasons.push(`100+ verified jobs completed`);
  } else if (worker.completedJobs >= 50) {
    experiencePoints = 8;
    reasons.push(`Experienced gig worker`);
  } else if (worker.completedJobs >= 10) {
    experiencePoints = 6;
  } else {
    experiencePoints = 4;
  }

  // 6. Reliability Score (5%)
  if (worker.reliabilityScore >= 95) {
    reliabilityPoints = 5;
    reasons.push(`Exceptional ${worker.reliabilityScore}% reliability`);
  } else if (worker.reliabilityScore >= 90) {
    reliabilityPoints = 4;
  } else {
    reliabilityPoints = 2;
  }

  const total = Math.min(
    100,
    skillPoints + distancePoints + availabilityPoints + ratingPoints + experiencePoints + reliabilityPoints
  );

  return {
    score: total,
    breakdown: {
      skills: skillPoints,
      distance: distancePoints,
      availability: availabilityPoints,
      rating: ratingPoints,
      experience: experiencePoints,
      reliability: reliabilityPoints,
    },
    reasons,
  };
}

export function rankApplicants(workers: User[], job: Job): Array<{ worker: User; match: MatchResult }> {
  return workers
    .map(worker => ({
      worker,
      match: calculateMatchScore(worker, job),
    }))
    .sort((a, b) => b.match.score - a.match.score);
}
