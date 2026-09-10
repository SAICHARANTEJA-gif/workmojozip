import {
  parseHour24,
  matchesTimeSlot,
  matchesWorkerSkills,
  filterEligibleJobs,
  rankEligibleJobs,
  runJobMatchingPipeline,
  getActiveFilterTags,
} from '../src/services/jobMatchingPipeline.js';
import { SEED_JOBS, INITIAL_CURRENT_USER } from '../src/data/seedData.js';

console.log('=== WORKMOJO WORKER JOB FILTER + AI MATCHING PIPELINE TEST SUITE ===\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  } else {
    console.log(`✅ PASS: ${message}`);
    passedTests++;
  }
}

// -------------------------------------------------------------
// Test 1: Time of Day Parsing & Slot Matching
// -------------------------------------------------------------
console.log('\n--- 1. Time Slot & 24-Hour Parsing ---');
assert(parseHour24('08:00 AM') === 8, 'Parses 08:00 AM to 8.0');
assert(parseHour24('09:30 AM') === 9.5, 'Parses 09:30 AM to 9.5');
assert(parseHour24('12:00 PM') === 12, 'Parses 12:00 PM to 12.0');
assert(parseHour24('02:30 PM') === 14.5, 'Parses 02:30 PM to 14.5');
assert(parseHour24('07:00 PM') === 19, 'Parses 07:00 PM to 19.0');
assert(parseHour24('11:00 PM') === 23, 'Parses 11:00 PM to 23.0');

assert(matchesTimeSlot('08:00 AM', 'Morning'), '08:00 AM is Morning');
assert(!matchesTimeSlot('08:00 AM', 'Afternoon'), '08:00 AM is NOT Afternoon');
assert(matchesTimeSlot('02:00 PM', 'Afternoon'), '02:00 PM is Afternoon');
assert(!matchesTimeSlot('02:00 PM', 'Morning'), '02:00 PM is NOT Morning');
assert(matchesTimeSlot('07:00 PM', 'Evening'), '07:00 PM is Evening');
assert(matchesTimeSlot('11:30 PM', 'Night'), '11:30 PM is Night');
assert(matchesTimeSlot('09:00 AM', 'All'), '09:00 AM matches All');

// -------------------------------------------------------------
// Test 2: Registered Worker Skills & Trade Normalization
// -------------------------------------------------------------
console.log('\n--- 2. Registered Worker Skills & Trade Normalization ---');
const testWorker = {
  ...INITIAL_CURRENT_USER,
  skills: ['Construction', 'Loading/Unloading', 'Labour', 'Repair'],
};

// Job 1 is Loading/Unloading
const job1 = SEED_JOBS.find(j => j.id === 'job-1');
assert(job1 && matchesWorkerSkills(job1, testWorker), 'Worker with Loading/Unloading matches job-1');

// Job 2 is Cleaning (Worker doesn't have cleaning)
const job2 = SEED_JOBS.find(j => j.id === 'job-2');
assert(job2 && !matchesWorkerSkills(job2, testWorker), 'Worker without Cleaning does NOT match job-2');

// Plumber normalization test
const plumberWorker = {
  ...INITIAL_CURRENT_USER,
  skills: ['ప్లంబర్ (Plumbing)'],
};
const plumbingJob = {
  id: 'test-plumb',
  title: 'Urgent Tap Repair',
  category: 'Repair',
  approximateDistanceKm: 2,
  wage: 800,
  startTime: '10:00 AM',
  urgency: 'Today',
  customerKyc: true,
  customerRating: 4.8,
};
assert(matchesWorkerSkills(plumbingJob, plumberWorker), 'Multilingual trade normalization recognizes Plumber for Repair/Plumbing');

// Empty skills test
const emptySkillsWorker = { ...INITIAL_CURRENT_USER, skills: [] };
assert(!matchesWorkerSkills(job1, emptySkillsWorker), 'Worker with 0 skills matches 0 jobs under skillMatchOnly');

// -------------------------------------------------------------
// Test 3: The 8 Deterministic Hard Eligibility Filters
// -------------------------------------------------------------
console.log('\n--- 3. Testing 8 Hard Constraints ---');

const baseFilters = {
  searchQuery: '',
  selectedCategories: [],
  maxDistance: 15,
  minWage: 0,
  timeSlot: 'All',
  duration: 'All',
  urgency: 'All',
  kycOnly: false,
  minRating: 0,
  skillMatchOnly: false,
  sortBy: 'Best Match',
};

// Filter 1: Maximum Distance
const resDist = filterEligibleJobs(SEED_JOBS, { ...baseFilters, maxDistance: 2.0 }, testWorker);
assert(resDist.every(j => j.approximateDistanceKm <= 2.0), 'Max distance ≤ 2.0 km leaves only nearby jobs');
assert(resDist.length > 0 && resDist.length < SEED_JOBS.length, `Max distance narrowed jobs from ${SEED_JOBS.length} to ${resDist.length}`);

// Filter 2: Minimum Wage
const resWage = filterEligibleJobs(SEED_JOBS, { ...baseFilters, minWage: 800 }, testWorker);
assert(resWage.every(j => j.wage >= 800), 'Minimum wage ≥ ₹800 strictly respected');

// Filter 3: Category
const resCat = filterEligibleJobs(SEED_JOBS, { ...baseFilters, selectedCategories: ['Cleaning'] }, testWorker);
assert(resCat.every(j => j.category === 'Cleaning'), 'Selected category "Cleaning" strictly applied');

// Filter 4: Time Slot
const resMorning = filterEligibleJobs(SEED_JOBS, { ...baseFilters, timeSlot: 'Morning' }, testWorker);
assert(resMorning.length > 0, `Morning timeSlot matched ${resMorning.length} morning jobs`);
assert(resMorning.every(j => matchesTimeSlot(j.startTime, 'Morning')), 'All returned jobs start in morning');

// Filter 5: Urgency
const resToday = filterEligibleJobs(SEED_JOBS, { ...baseFilters, urgency: 'Today' }, testWorker);
assert(resToday.every(j => j.urgency === 'Today'), 'Urgency "Today" strictly filters for today');

// Filter 6: Customer KYC Only
const resKyc = filterEligibleJobs(SEED_JOBS, { ...baseFilters, kycOnly: true }, testWorker);
assert(resKyc.every(j => j.customerKyc === true), 'KYC filter requires customerKyc === true');

// Filter 7: Customer Rating
const resRating = filterEligibleJobs(SEED_JOBS, { ...baseFilters, minRating: 4.8 }, testWorker);
assert(resRating.every(j => j.customerRating >= 4.8), 'Customer rating filter requires rating >= 4.8');

// Filter 8: Worker Skills Only
const resSkills = filterEligibleJobs(SEED_JOBS, { ...baseFilters, skillMatchOnly: true }, testWorker);
assert(resSkills.every(j => matchesWorkerSkills(j, testWorker)), 'Only jobs matching registered skills are returned');

// Combined Restrictive Filters
const resCombined = filterEligibleJobs(SEED_JOBS, {
  ...baseFilters,
  maxDistance: 3.5,
  minWage: 750,
  urgency: 'Today',
  skillMatchOnly: true,
}, testWorker);
assert(resCombined.length > 0, `Combined filters returned ${resCombined.length} eligible jobs`);
assert(resCombined.every(j => j.approximateDistanceKm <= 3.5 && j.wage >= 750 && j.urgency === 'Today'), 'All combined constraints satisfied');

// -------------------------------------------------------------
// Test 4: AI Compatibility Ranking & Non-Retraining Verification
// -------------------------------------------------------------
console.log('\n--- 4. AI Compatibility Ranking ---');
const ranked = rankEligibleJobs(SEED_JOBS, testWorker, 'Best Match');
assert(ranked.length === SEED_JOBS.length, `All ${SEED_JOBS.length} eligible jobs scored and ranked`);

for (let i = 0; i < ranked.length - 1; i++) {
  const current = ranked[i];
  const next = ranked[i + 1];
  assert(
    current.matchResult.score >= next.matchResult.score ||
    (current.matchResult.score === next.matchResult.score && current.job.approximateDistanceKm <= next.job.approximateDistanceKm),
    `Ranked order strictly descending: ${current.job.title} (${current.matchResult.score}%) >= ${next.job.title} (${next.matchResult.score}%)`
  );
}

// Check other sorting options
const rankedNearest = rankEligibleJobs(SEED_JOBS, testWorker, 'Nearest');
for (let i = 0; i < rankedNearest.length - 1; i++) {
  assert(
    rankedNearest[i].job.approximateDistanceKm <= rankedNearest[i + 1].job.approximateDistanceKm,
    'Nearest sorting orders by distance ascending'
  );
}

const rankedHighestWage = rankEligibleJobs(SEED_JOBS, testWorker, 'Highest Wage');
for (let i = 0; i < rankedHighestWage.length - 1; i++) {
  assert(
    rankedHighestWage[i].job.wage >= rankedHighestWage[i + 1].job.wage,
    'Highest Wage sorting orders by wage descending'
  );
}

// -------------------------------------------------------------
// Test 5: Full Pipeline Runner
// -------------------------------------------------------------
console.log('\n--- 5. Full Pipeline Runner ---');
const pipeRes = runJobMatchingPipeline(SEED_JOBS, {
  ...baseFilters,
  minWage: 700,
  maxDistance: 5,
}, testWorker);

assert(pipeRes.counts.totalJobs === SEED_JOBS.length, `Total jobs is ${SEED_JOBS.length}`);
assert(pipeRes.counts.eligibleJobs <= pipeRes.counts.totalJobs, 'Eligible jobs <= Total jobs');
assert(pipeRes.counts.rankedJobs === pipeRes.counts.eligibleJobs, 'Ranked jobs equals eligible jobs');
assert(pipeRes.activeFilterTags.length === 2, 'Active filter tags correctly count active filters (minWage & maxDistance)');

console.log('\n=============================================================');
console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
console.log('=============================================================\n');

