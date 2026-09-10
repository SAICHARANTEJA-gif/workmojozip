// Application Persistence & Cross-Device Flow End-to-End Test
const BASE_URL = 'http://localhost:5055/api/v1';

async function runTests() {
  console.log('=== WORKMOJO APPLICATION PERSISTENCE & APPLICANTS TEST SUITE ===\n');

  // Set test port before importing server (which automatically calls app.listen)
  process.env.PORT = '5055';
  const { app } = await import('../server/dist/index.js');
  
  // Wait a brief moment for Express to bind to port 5055
  await new Promise(resolve => setTimeout(resolve, 600));

  const testJobId = `job-test-${Date.now()}`;
  const testWorkerId = `worker-me`;

  // 1. Post a new Job as Employer
  console.log('--- 1. Employer creates Job J ---');
  const postJobRes = await fetch(`${BASE_URL}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: testJobId,
      title: 'Warehouse Shifting Specialist',
      category: 'Loading/Unloading',
      wage: 950,
      startTime: '09:00 AM',
      duration: '8 hours',
      urgency: 'Today',
      workersRequired: 2,
      workersConfirmed: 0,
      approximateArea: 'Indiranagar',
      customerId: 'cust-kumar',
      customerName: 'Kumar Stores',
    }),
  });
  const postJobData = await postJobRes.json();
  console.log('POST /jobs status:', postJobRes.status, 'success:', postJobData.success);
  if (!postJobData.success) throw new Error('Failed to create test job');
  console.log('✅ PASS: Job created successfully with ID:', testJobId);

  // 2. Worker W applies to Job J
  console.log('\n--- 2. Worker W applies to Job J ---');
  const applyRes = await fetch(`${BASE_URL}/jobs/${testJobId}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workerId: testWorkerId,
      workerName: 'Arun Kumar',
      workerPhone: '+91 98765 43210',
      workerPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      workerRating: 4.8,
      workerReliability: 95,
      workerSkills: ['Loading/Unloading', 'Labour'],
      matchScore: 92,
    }),
  });
  const applyData = await applyRes.json();
  console.log('POST /jobs/:id/apply status:', applyRes.status, 'result:', applyData);
  if (!applyData.success || applyData.status !== 'applied') {
    throw new Error(`Apply failed: ${JSON.stringify(applyData)}`);
  }
  console.log('✅ PASS: Worker application submitted successfully!');

  // 3. Duplicate Application Protection
  console.log('\n--- 3. Duplicate Application Protection ---');
  const dupApplyRes = await fetch(`${BASE_URL}/jobs/${testJobId}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workerId: testWorkerId,
      workerName: 'Arun Kumar',
      matchScore: 92,
    }),
  });
  const dupApplyData = await dupApplyRes.json();
  console.log('POST /jobs/:id/apply duplicate attempt status:', dupApplyRes.status, 'result:', dupApplyData);
  if (!dupApplyData.success) {
    throw new Error('Duplicate application threw an unhandled error');
  }
  console.log('✅ PASS: Duplicate application handled idempotently without error');

  // 4. Employer retrieves Applications for Job J
  console.log('\n--- 4. Employer retrieves Applications for Job J ---');
  const getAppsRes = await fetch(`${BASE_URL}/jobs/${testJobId}/applications`);
  const getAppsData = await getAppsRes.json();
  console.log('GET /jobs/:id/applications status:', getAppsRes.status, 'count:', getAppsData.count);
  const foundWorker = getAppsData.applications?.find(a => a.workerId === testWorkerId);
  if (!foundWorker) {
    throw new Error(`Worker ${testWorkerId} not found in applications list!`);
  }
  console.log('Found applicant in response:', {
    workerId: foundWorker.workerId,
    workerName: foundWorker.workerName,
    workerRating: foundWorker.workerRating,
    status: foundWorker.status,
  });
  console.log('✅ PASS: Employer Applicants API successfully retrieves Worker W!');

  // 5. Verify GET /jobs reconstructs applicants array
  console.log('\n--- 5. Verify GET /jobs includes Worker W in applicants ---');
  const getJobsRes = await fetch(`${BASE_URL}/jobs`);
  const getJobsData = await getJobsRes.json();
  const retrievedJob = getJobsData.jobs?.find(j => j.id === testJobId);
  if (!retrievedJob) throw new Error('Job not found in GET /jobs');
  if (!retrievedJob.applicants?.includes(testWorkerId)) {
    throw new Error(`Job.applicants does not contain workerId: ${JSON.stringify(retrievedJob.applicants)}`);
  }
  console.log('Job applicants list from GET /jobs:', retrievedJob.applicants);
  console.log('✅ PASS: GET /jobs includes Worker W, protecting against refresh wipeouts!');

  console.log('\n=============================================================');
  console.log('🎉 ALL APPLICATION PERSISTENCE & APPLICANTS TESTS PASSED!');
  console.log('=============================================================');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
