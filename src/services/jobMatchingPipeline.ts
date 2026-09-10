import { Job, User, FilterState, WorkTimePreference } from '../types';
import { calculateMatchScore, normalizeTradeSkill, MatchResult } from './matchingService';

export interface PipelineStageCounts {
  totalJobs: number;
  eligibleJobs: number;
  rankedJobs: number;
  activeFilterCount: number;
}

export interface EvaluatedJob {
  job: Job;
  matchResult: MatchResult;
  isEligible: boolean;
}

export interface PipelineResult {
  allJobsCount: number;
  eligibleJobs: Job[];
  rankedJobs: EvaluatedJob[];
  counts: PipelineStageCounts;
  activeFilterTags: string[];
}

/**
 * Parses time string like "09:00 AM", "02:30 PM", "14:00" into 24-hour decimal number
 */
export function parseHour24(timeStr: string): number | null {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const cleaned = timeStr.trim();
  const match = cleaned.match(/(\d{1,2}):?(\d{2})?\s*(AM|PM)?/i);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2] ? parseInt(match[2], 10) : 0;
  const period = match[3] ? match[3].toUpperCase() : null;

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours + minutes / 60;
}

/**
 * Validates whether a job start time falls within a given time slot preference:
 * - Morning: 05:00 - 11:59
 * - Afternoon: 12:00 - 16:59
 * - Evening: 17:00 - 20:59
 * - Night: 21:00 - 04:59
 */
export function matchesTimeSlot(timeStr: string, slot: WorkTimePreference | 'All'): boolean {
  if (!slot || slot === 'All' || slot === 'Flexible') return true;
  const hour = parseHour24(timeStr);
  if (hour === null) return true; // If unparseable, do not arbitrarily disqualify

  switch (slot) {
    case 'Morning':
      return hour >= 5 && hour < 12;
    case 'Afternoon':
      return hour >= 12 && hour < 17;
    case 'Evening':
      return hour >= 17 && hour < 21;
    case 'Night':
      return hour >= 21 || hour < 5;
    default:
      return true;
  }
}

/**
 * Verifies whether the job category or title matches any of the worker's registered skills
 * using multilingual trade normalization.
 */
export function matchesWorkerSkills(job: Job, worker: User): boolean {
  if (!worker || !worker.skills || worker.skills.length === 0) {
    return false;
  }

  const jobCategoryNorm = normalizeTradeSkill(job.category).toLowerCase();
  const jobTitleNorm = normalizeTradeSkill(job.title).toLowerCase();
  const jobCategoryLower = job.category.toLowerCase().trim();
  const jobTitleLower = job.title.toLowerCase().trim();

  return worker.skills.some(skill => {
    const sLower = skill.toLowerCase().trim();
    if (sLower === jobCategoryLower || jobTitleLower.includes(sLower) || sLower.includes(jobCategoryLower)) {
      return true;
    }
    const workerTradeNorm = normalizeTradeSkill(skill).toLowerCase();
    if (workerTradeNorm === jobCategoryNorm || workerTradeNorm === jobTitleNorm) {
      return true;
    }
    return false;
  });
}

/**
 * Stage 2: Deterministic Hard Eligibility Filters
 * Strictly filters candidate jobs based on the 8 hard constraints.
 * ZERO ML retraining occurs here.
 */
export function filterEligibleJobs(jobs: Job[], filters: FilterState, user: User): Job[] {
  if (!Array.isArray(jobs)) return [];

  return jobs.filter(job => {
    // 1. Search Query
    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const titleMatch = job.title.toLowerCase().includes(q);
      const catMatch = job.category.toLowerCase().includes(q);
      const descMatch = job.description.toLowerCase().includes(q);
      const areaMatch = job.approximateArea.toLowerCase().includes(q);
      const customerMatch = job.customerName.toLowerCase().includes(q);
      if (!titleMatch && !catMatch && !descMatch && !areaMatch && !customerMatch) {
        return false;
      }
    }

    // 2. Maximum Distance
    if (typeof filters.maxDistance === 'number' && filters.maxDistance > 0) {
      if (job.approximateDistanceKm > filters.maxDistance) {
        return false;
      }
    }

    // 3. Minimum Daily Wage
    if (typeof filters.minWage === 'number' && filters.minWage > 0) {
      if (job.wage < filters.minWage) {
        return false;
      }
    }

    // 4. Work Category
    if (filters.selectedCategories && filters.selectedCategories.length > 0) {
      if (!filters.selectedCategories.includes(job.category)) {
        return false;
      }
    }

    // 5. Time of Day
    if (filters.timeSlot && filters.timeSlot !== 'All') {
      if (!matchesTimeSlot(job.startTime, filters.timeSlot)) {
        return false;
      }
    }

    // 6. Urgency / Start Date
    if (filters.urgency && filters.urgency !== 'All') {
      if (job.urgency !== filters.urgency) {
        return false;
      }
    }

    // 7. Customer KYC Verification
    if (filters.kycOnly) {
      if (!job.customerKyc) {
        return false;
      }
    }

    // 8. Customer Rating
    if (typeof filters.minRating === 'number' && filters.minRating > 0) {
      if (job.customerRating < filters.minRating) {
        return false;
      }
    }

    // 9. Registered Worker Skills Only
    if (filters.skillMatchOnly) {
      if (!matchesWorkerSkills(job, user)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Stage 3 & 4: AI Compatibility Scoring & Final Ranking
 * Evaluates surviving eligible jobs with the pre-trained Random Forest ensemble
 * without retraining. Sorts the output according to user's selected preference.
 */
export function rankEligibleJobs(
  eligibleJobs: Job[],
  user: User,
  sortBy: FilterState['sortBy'] = 'Best Match'
): EvaluatedJob[] {
  // Deduplicate eligible jobs by ID
  const seenIds = new Set<string>();
  const uniqueEligible: Job[] = [];
  for (const job of eligibleJobs) {
    if (!seenIds.has(job.id)) {
      seenIds.add(job.id);
      uniqueEligible.push(job);
    }
  }

  // Stage 3: AI Compatibility / Suitability evaluation (Inference Only)
  const evaluated: EvaluatedJob[] = uniqueEligible.map(job => ({
    job,
    matchResult: calculateMatchScore(user, job),
    isEligible: true,
  }));

  // Stage 4: Final Sorting
  const sorted = [...evaluated];
  switch (sortBy) {
    case 'Nearest':
      return sorted.sort((a, b) => a.job.approximateDistanceKm - b.job.approximateDistanceKm);
    case 'Highest Wage':
      return sorted.sort((a, b) => b.job.wage - a.job.wage);
    case 'Earliest Start':
      return sorted.sort((a, b) => {
        const hA = parseHour24(a.job.startTime) ?? 99;
        const hB = parseHour24(b.job.startTime) ?? 99;
        return hA - hB;
      });
    case 'Latest Posted':
      return sorted.sort((a, b) => new Date(b.job.createdAt).getTime() - new Date(a.job.createdAt).getTime());
    case 'Best Match':
    default:
      // Primary: AI Compatibility Score (Random Forest + Domain)
      // Secondary: Proximity (Hyperlocal tie-breaker)
      return sorted.sort((a, b) => {
        if (b.matchResult.score !== a.matchResult.score) {
          return b.matchResult.score - a.matchResult.score;
        }
        return a.job.approximateDistanceKm - b.job.approximateDistanceKm;
      });
  }
}

/**
 * Returns human-readable tags of all active filters for UI chips and empty states
 */
export function getActiveFilterTags(filters: FilterState): string[] {
  const tags: string[] = [];
  if (filters.searchQuery && filters.searchQuery.trim()) {
    tags.push(`Search: "${filters.searchQuery.trim()}"`);
  }
  if (typeof filters.maxDistance === 'number' && filters.maxDistance < 15) {
    tags.push(`Within ${filters.maxDistance} km`);
  }
  if (typeof filters.minWage === 'number' && filters.minWage > 0) {
    tags.push(`Min ₹${filters.minWage}`);
  }
  if (filters.selectedCategories && filters.selectedCategories.length > 0) {
    tags.push(`${filters.selectedCategories.length} Categories`);
  }
  if (filters.timeSlot && filters.timeSlot !== 'All') {
    tags.push(`Time: ${filters.timeSlot}`);
  }
  if (filters.urgency && filters.urgency !== 'All') {
    tags.push(`Urgency: ${filters.urgency}`);
  }
  if (filters.kycOnly) {
    tags.push('KYC Verified Customer');
  }
  if (typeof filters.minRating === 'number' && filters.minRating > 0) {
    tags.push(`Rating ${filters.minRating}+ ★`);
  }
  if (filters.skillMatchOnly) {
    tags.push('My Registered Skills Only');
  }
  return tags;
}

/**
 * Master Pipeline Runner
 * Connects all 4 stages:
 * ALL JOBS -> Hard Eligibility Filters -> Eligible Jobs -> AI Compatibility -> Final Ranking -> Recommended Jobs
 */
export function runJobMatchingPipeline(
  jobs: Job[],
  filters: FilterState,
  user: User
): PipelineResult {
  const allJobsCount = Array.isArray(jobs) ? jobs.length : 0;
  const eligibleJobs = filterEligibleJobs(jobs, filters, user);
  const rankedJobs = rankEligibleJobs(eligibleJobs, user, filters.sortBy);
  const activeFilterTags = getActiveFilterTags(filters);

  return {
    allJobsCount,
    eligibleJobs,
    rankedJobs,
    counts: {
      totalJobs: allJobsCount,
      eligibleJobs: eligibleJobs.length,
      rankedJobs: rankedJobs.length,
      activeFilterCount: activeFilterTags.length,
    },
    activeFilterTags,
  };
}

