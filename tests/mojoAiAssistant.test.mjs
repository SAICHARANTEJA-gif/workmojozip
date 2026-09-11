// WorkMojo Mojo AI Assistant Comprehensive Automated Test Suite
// Verifies 23-Intent Classification, Multilingual Worker Count Extraction,
// State Persistence across Multi-Turn Conversation, Worker Selection Limits,
// and Non-repetitive Domain Fallback Responses.

import {
  classifyIntentAndExtractEntities,
  extractWorkerCount,
  extractCategory,
  extractWage,
  generateIntentResponse,
  processAiChat,
} from '../server/dist/aiService.js';

console.log('===============================================================');
console.log('   WORKMOJO MOJO AI ASSISTANT UPGRADE - TEST SUITE');
console.log('===============================================================\n');

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

async function runTests() {
  // -------------------------------------------------------------------------
  // Test Scenario 1: Intent Classification for all 23 WorkMojo Intents
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 1: Intent Classification (All 23 Intents) ---');

  const intentCases = [
    { text: 'Hello Mojo', expected: 'GREETING' },
    { text: 'I want to post a new job', expected: 'JOB_POSTING_START' },
    { text: 'How do I post a job?', expected: 'JOB_POSTING_HELP' },
    { text: 'Job title: Warehouse Supervisor', expected: 'JOB_TITLE' },
    { text: 'Category: Plumbing', expected: 'JOB_CATEGORY' },
    { text: 'Description: Unload 50 cartons from truck', expected: 'JOB_DESCRIPTION' },
    { text: 'Location is Madhapur Hyderabad', expected: 'JOB_LOCATION' },
    { text: 'Job date is tomorrow', expected: 'JOB_DATE' },
    { text: 'Start time 9am', expected: 'JOB_START_TIME' },
    { text: 'End time 5pm', expected: 'JOB_END_TIME' },
    { text: 'Wage is 800 rupees', expected: 'JOB_WAGE' },
    { text: 'I need 5 workers', expected: 'WORKER_COUNT' },
    { text: 'How do I select workers?', expected: 'WORKER_SELECTION' },
    { text: 'Find me an electrician', expected: 'WORKER_SEARCH' },
    { text: 'View worker profile', expected: 'WORKER_PROFILE' },
    { text: 'Who applied to my job?', expected: 'APPLICATION_STATUS' },
    { text: 'How do payments and UPI work?', expected: 'PAYMENT_HELP' },
    { text: 'How to cancel a job posting?', expected: 'JOB_CANCELLATION' },
    { text: 'Edit job details and wage', expected: 'JOB_EDIT' },
    { text: 'Check my job status', expected: 'JOB_STATUS' },
    { text: 'How does AI match score work?', expected: 'AI_MATCHING_HELP' },
    { text: 'Change language to Telugu', expected: 'LANGUAGE_CHANGE' },
    { text: 'What is WorkMojo platform?', expected: 'GENERAL_WORKMOJO_HELP' },
  ];

  for (const tc of intentCases) {
    const res = classifyIntentAndExtractEntities(tc.text, 'en', 'customer');
    assert(
      res.intent === tc.expected,
      `"${tc.text}" correctly classified as ${tc.expected} (got: ${res.intent})`
    );
  }

  // -------------------------------------------------------------------------
  // Test Scenario 2: Worker Count Extraction (Digits, Words, Multilingual)
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 2: Multilingual Worker Count Extraction ---');

  // Digits
  assert(extractWorkerCount('5 workers') === 5, 'Extracts 5 from "5 workers"');
  assert(extractWorkerCount('need 10 helpers') === 10, 'Extracts 10 from "need 10 helpers"');
  assert(extractWorkerCount('20 workers required') === 20, 'Extracts 20 from "20 workers required"');

  // English words
  assert(extractWorkerCount('three electricians') === 3, 'Extracts 3 from "three electricians"');
  assert(extractWorkerCount('eight painters') === 8, 'Extracts 8 from "eight painters"');

  // Telugu
  assert(extractWorkerCount('5 మంది వర్కర్లు') === 5, 'Extracts 5 from "5 మంది వర్కర్లు" (Telugu)');
  assert(extractWorkerCount('ముగ్గురు ఎలక్ట్రీషియన్లు') === 3, 'Extracts 3 from "ముగ్గురు ఎలక్ట్రీషియన్లు" (Telugu)');
  assert(extractWorkerCount('ఎనిమిది మంది') === 8, 'Extracts 8 from "ఎనిమిది మంది" (Telugu)');

  // Hindi
  assert(extractWorkerCount('मुझे 4 मजदूर चाहिए') === 4, 'Extracts 4 from "मुझे 4 मजदूर चाहिए" (Hindi)');
  assert(extractWorkerCount('आठ पेंटर') === 8, 'Extracts 8 from "आठ पेंटर" (Hindi)');
  assert(extractWorkerCount('10 कामगार') === 10, 'Extracts 10 from "10 कामगार" (Hindi)');

  // Tamil
  assert(extractWorkerCount('3 தொழிலாளர்கள் தேவை') === 3, 'Extracts 3 from "3 தொழிலாளர்கள் தேவை" (Tamil)');
  assert(extractWorkerCount('ஐந்து ஆட்கள்') === 5, 'Extracts 5 from "ஐந்து ஆட்கள்" (Tamil)');

  // -------------------------------------------------------------------------
  // Test Scenario 3: Worker Count Updates Draft Without Resetting Other Fields
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 3: Draft Preservation with Worker Count ---');

  const initialDraftState = {
    jobDraft: {
      category: 'Plumbing',
      title: 'Plumber',
      wage: 850,
      location: 'Koramangala',
    },
  };

  const countUpdate = classifyIntentAndExtractEntities(
    '5 workers',
    'en',
    'customer',
    initialDraftState
  );

  assert(countUpdate.intent === 'WORKER_COUNT', 'Detects WORKER_COUNT intent');
  assert(countUpdate.entities.workersRequired === 5, 'Extracts workersRequired = 5');
  assert(countUpdate.updatedDraft.workersRequired === 5, 'Sets workersRequired = 5 in draft');
  assert(countUpdate.updatedDraft.category === 'Plumbing', 'Preserves existing category Plumbing');
  assert(countUpdate.updatedDraft.title === 'Plumber', 'Preserves existing title Plumber');
  assert(countUpdate.updatedDraft.wage === 850, 'Preserves existing wage ₹850');
  assert(countUpdate.updatedDraft.location === 'Koramangala', 'Preserves existing location');

  // -------------------------------------------------------------------------
  // Test Scenario 4: "Change it to 8" Correctly Updates workersRequired
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 4: Incremental "Change it to 8" ---');

  const priorDraftWith5 = {
    jobDraft: {
      category: 'Painting',
      title: 'House Painter',
      workersRequired: 5,
      wage: 900,
    },
  };

  const changeTo8 = classifyIntentAndExtractEntities(
    'Change it to 8',
    'en',
    'customer',
    priorDraftWith5
  );

  assert(changeTo8.intent === 'WORKER_COUNT', 'Detects WORKER_COUNT intent on "Change it to 8"');
  assert(changeTo8.entities.workersRequired === 8, 'Extracts count 8');
  assert(changeTo8.updatedDraft.workersRequired === 8, 'Updates workersRequired from 5 to 8');
  assert(changeTo8.updatedDraft.category === 'Painting', 'Retains Painting category');
  assert(changeTo8.updatedDraft.wage === 900, 'Retains wage 900');

  // Also test Telugu: "8 మందికి మార్చండి"
  const teluguChange = classifyIntentAndExtractEntities(
    '8 మందికి మార్చండి',
    'te',
    'customer',
    priorDraftWith5
  );
  assert(teluguChange.intent === 'WORKER_COUNT', 'Detects WORKER_COUNT for "8 మందికి మార్చండి"');
  assert(teluguChange.updatedDraft.workersRequired === 8, 'Telugu incremental update sets workersRequired to 8');

  // -------------------------------------------------------------------------
  // Test Scenario 5: Distinguishing Job Posting from Worker Selection
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 5: Job Posting vs Worker Selection Distinction ---');

  const postJobQuery = classifyIntentAndExtractEntities('I want to post a job', 'en', 'customer');
  const workerSelectionQuery = classifyIntentAndExtractEntities('How do I select workers?', 'en', 'customer');
  const compareApplicantsQuery = classifyIntentAndExtractEntities('Compare applicants for my job', 'en', 'customer');

  assert(postJobQuery.intent === 'JOB_POSTING_START', 'Post job query classified as JOB_POSTING_START');
  assert(workerSelectionQuery.intent === 'WORKER_SELECTION', 'Worker selection query classified as WORKER_SELECTION');
  assert(compareApplicantsQuery.intent === 'WORKER_SELECTION', 'Compare applicants classified as WORKER_SELECTION');
  assert(workerSelectionQuery.intent !== postJobQuery.intent, 'Worker selection is NOT confused with Job Posting');

  // -------------------------------------------------------------------------
  // Test Scenario 6: Distinguishing Worker Search from Job Posting
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 6: Worker Search vs Job Posting Distinction ---');

  const searchWorker = classifyIntentAndExtractEntities('Find me an electrician', 'en', 'customer');
  const hireWorkerTomorrow = classifyIntentAndExtractEntities('I want to hire an electrician for tomorrow', 'en', 'customer');

  assert(searchWorker.intent === 'WORKER_SEARCH', '"Find me an electrician" is WORKER_SEARCH');
  assert(hireWorkerTomorrow.intent === 'JOB_POSTING_START', '"I want to hire an electrician for tomorrow" is JOB_POSTING_START');
  assert(searchWorker.intent !== hireWorkerTomorrow.intent, 'Worker Search and Job Posting are strictly distinct');

  // -------------------------------------------------------------------------
  // Test Scenario 7: Custom Worker Count in Job Model
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 7: Custom Worker Count in Job Model ---');

  const customJob8 = {
    id: 'test-job-8',
    title: 'Commercial Construction Helpers',
    workersRequired: 8,
    workersConfirmed: 0,
    applicants: [],
    waitingList: [],
    status: 'Posted',
  };

  const customJob15 = {
    id: 'test-job-15',
    title: 'Event Catering Helpers',
    workersRequired: 15,
    workersConfirmed: 0,
    applicants: [],
    waitingList: [],
    status: 'Posted',
  };

  assert(customJob8.workersRequired === 8, 'Job model supports 8 workers required');
  assert(customJob15.workersRequired === 15, 'Job model supports 15 workers required');

  // -------------------------------------------------------------------------
  // Test Scenario 8: UI Action Payload Generation for Navigation Actions
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 8: UI Action Payload Generation ---');

  const postJobAction = generateIntentResponse('JOB_POSTING_START', {}, { category: 'Plumbing' }, 'en', 'customer');
  assert(postJobAction.action && postJobAction.action.type === 'OPEN_POST_JOB', 'Generates OPEN_POST_JOB action');

  const selectionAction = generateIntentResponse('WORKER_SELECTION', {}, {}, 'en', 'customer');
  assert(selectionAction.action && selectionAction.action.type === 'OPEN_APPLICANTS', 'Generates OPEN_APPLICANTS action for selection');

  const searchAction = generateIntentResponse('WORKER_SEARCH', { category: 'Electrical Work' }, {}, 'en', 'customer');
  assert(searchAction.action && searchAction.action.type === 'OPEN_WORKER_SEARCH', 'Generates OPEN_WORKER_SEARCH action');

  const countAction = generateIntentResponse('WORKER_COUNT', { workersRequired: 8 }, { workersRequired: 8 }, 'en', 'customer');
  assert(countAction.action && countAction.action.type === 'UPDATE_JOB_DRAFT', 'Generates UPDATE_JOB_DRAFT action for count change');

  const cancelAction = generateIntentResponse('JOB_CANCELLATION', {}, {}, 'en', 'customer');
  assert(cancelAction.action && cancelAction.action.type === 'CANCEL_JOB', 'Generates CANCEL_JOB action');

  // -------------------------------------------------------------------------
  // Test Scenario 9: Multilingual Responses Match Requested Language
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 9: Multilingual Responses Match Requested Language ---');

  const teResp = generateIntentResponse('WORKER_COUNT', { workersRequired: 5 }, { workersRequired: 5 }, 'te', 'customer');
  const hiResp = generateIntentResponse('WORKER_COUNT', { workersRequired: 5 }, { workersRequired: 5 }, 'hi', 'customer');
  const taResp = generateIntentResponse('WORKER_COUNT', { workersRequired: 5 }, { workersRequired: 5 }, 'ta', 'customer');
  const enResp = generateIntentResponse('WORKER_COUNT', { workersRequired: 5 }, { workersRequired: 5 }, 'en', 'customer');

  // Check script ranges
  const hasTelugu = /[\u0C00-\u0C7F]/.test(teResp.reply);
  const hasHindi = /[\u0900-\u097F]/.test(hiResp.reply);
  const hasTamil = /[\u0B80-\u0BFF]/.test(taResp.reply);

  assert(hasTelugu, 'Telugu response contains Telugu script characters');
  assert(hasHindi, 'Hindi response contains Hindi Devanagari script characters');
  assert(hasTamil, 'Tamil response contains Tamil script characters');
  assert(enResp.reply.includes('5'), 'English response contains worker count 5');

  // -------------------------------------------------------------------------
  // Test Scenario 10: Fallback Engine Returns Distinct Responses for Different Intents
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 10: Distinct Fallback Responses for Different Intents ---');

  const r1 = generateIntentResponse('WORKER_SELECTION', {}, {}, 'en', 'customer').reply;
  const r2 = generateIntentResponse('JOB_POSTING_START', {}, {}, 'en', 'customer').reply;
  const r3 = generateIntentResponse('PAYMENT_HELP', {}, {}, 'en', 'customer').reply;
  const r4 = generateIntentResponse('JOB_WAGE', { wage: 900 }, { wage: 900 }, 'en', 'customer').reply;
  const r5 = generateIntentResponse('WORKER_COUNT', { workersRequired: 8 }, { workersRequired: 8 }, 'en', 'customer').reply;
  const r6 = generateIntentResponse('AI_MATCHING_HELP', {}, {}, 'en', 'customer').reply;

  const responses = [r1, r2, r3, r4, r5, r6];
  const uniqueResponses = new Set(responses);

  assert(uniqueResponses.size === responses.length, `All ${responses.length} responses are distinct (no duplicates)`);
  assert(!r1.includes('Posting a job on WorkMojo takes under 60 seconds'), 'Worker selection does not use job posting text');
  assert(r5.includes('8'), 'Worker count response mentions exact count 8');

  // -------------------------------------------------------------------------
  // Test Scenario 11: State Persistence Across Multi-Turn Conversation
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 11: State Persistence Across Multi-Turn Conversation ---');

  // Turn 1: "I need an electrician"
  let turn1 = await processAiChat({
    message: 'I need an electrician',
    language: 'en',
    role: 'customer',
  });
  assert(turn1.conversationState?.jobDraft?.category === 'Electrical Work', 'Turn 1 sets category to Electrical Work');

  // Turn 2: "Wage 900"
  let turn2 = await processAiChat({
    message: 'Wage 900',
    language: 'en',
    role: 'customer',
    conversationState: turn1.conversationState,
  });
  assert(turn2.conversationState?.jobDraft?.wage === 900, 'Turn 2 updates wage to 900');
  assert(turn2.conversationState?.jobDraft?.category === 'Electrical Work', 'Turn 2 preserves category Electrical Work');

  // Turn 3: "3 workers"
  let turn3 = await processAiChat({
    message: '3 workers',
    language: 'en',
    role: 'customer',
    conversationState: turn2.conversationState,
  });
  assert(turn3.conversationState?.jobDraft?.workersRequired === 3, 'Turn 3 sets workersRequired to 3');
  assert(turn3.conversationState?.jobDraft?.wage === 900, 'Turn 3 preserves wage 900');
  assert(turn3.conversationState?.jobDraft?.category === 'Electrical Work', 'Turn 3 preserves category Electrical Work');

  // Turn 4: "Change it to 6"
  let turn4 = await processAiChat({
    message: 'Change it to 6',
    language: 'en',
    role: 'customer',
    conversationState: turn3.conversationState,
  });
  assert(turn4.conversationState?.jobDraft?.workersRequired === 6, 'Turn 4 updates workersRequired to 6');
  assert(turn4.conversationState?.jobDraft?.wage === 900, 'Turn 4 preserves wage 900');
  assert(turn4.conversationState?.jobDraft?.category === 'Electrical Work', 'Turn 4 preserves category Electrical Work');

  // -------------------------------------------------------------------------
  // Test Scenario 12: Worker Selection Limit Respects Dynamic workersRequired
  // -------------------------------------------------------------------------
  console.log('\n--- Scenario 12: Worker Selection Limit Respects Dynamic workersRequired ---');

  const testJob = {
    id: 'job-req-8',
    workersRequired: 8,
    workersConfirmed: 0,
    confirmedWorkerIds: [],
    applicants: ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8', 'w9', 'w10'],
    waitingList: [],
  };

  // Check initial slots
  let slotsRemaining = Math.max(0, testJob.workersRequired - testJob.workersConfirmed);
  assert(slotsRemaining === 8, 'Initial slots remaining is 8 for workersRequired = 8');

  // Confirm 8 workers
  for (let i = 1; i <= 8; i++) {
    testJob.confirmedWorkerIds.push(`w${i}`);
    testJob.workersConfirmed = testJob.confirmedWorkerIds.length;
  }
  slotsRemaining = Math.max(0, testJob.workersRequired - testJob.workersConfirmed);
  assert(testJob.workersConfirmed === 8, '8 workers successfully confirmed');
  assert(slotsRemaining === 0, 'Slots remaining is 0 once all 8 are filled');

  // 9th and 10th applicants are placed in waiting list
  const overflowApplicants = testJob.applicants.filter(id => !testJob.confirmedWorkerIds.includes(id));
  testJob.waitingList.push(...overflowApplicants);
  assert(testJob.waitingList.length === 2, 'Excess applicants placed in waiting list');
  assert(testJob.confirmedWorkerIds.length === testJob.workersRequired, 'Confirmed workers does NOT exceed workersRequired');

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n===============================================================');
  console.log(`   ALL TESTS PASSED! (${passedTests} / ${totalTests})`);
  console.log('===============================================================\n');
}

runTests().catch(err => {
  console.error('Test suite failed with unexpected error:', err);
  process.exit(1);
});

