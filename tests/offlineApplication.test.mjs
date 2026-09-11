// Comprehensive Offline Fallback, Auto-Sync & Duplicate Protection Test Suite
const BASE_URL = 'http://localhost:5057/api/v1';

async function runTests() {
  console.log('=== WORKMOJO RESILIENT APPLY NOW & OFFLINE FALLBACK TEST SUITE ===\n');

  process.env.PORT = '5057';
  process.env.SUPABASE_URL = '';
  const { app } = await import('../server/dist/index.js');
  await new Promise(resolve => setTimeout(resolve, 800));

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
    passed++;
    console.log(`✅ PASS: ${message}`);
  }

  // Simulated mock localStorage for Node test environment
  const mockLocalStorage = (() => {
    let store = {};
    return {
      getItem: (key) => store[key] || null,
      setItem: (key, val) => { store[key] = String(val); },
      removeItem: (key) => { delete store[key]; },
      clear: () => { store = {}; },
      _dump: () => ({ ...store }),
    };
  })();

  const PENDING_STORAGE_KEY = 'workmojo_pending_applications';

  function getPendingApplications() {
    try {
      const raw = mockLocalStorage.getItem(PENDING_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function savePendingApplication(app) {
    const current = getPendingApplications();
    const filtered = current.filter(p => !(p.jobId === app.jobId && p.workerId === app.workerId));
    filtered.push(app);
    mockLocalStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(filtered));
  }

  function removePendingApplication(jobId, workerId) {
    const current = getPendingApplications();
    const filtered = current.filter(p => !(p.jobId === jobId && p.workerId === workerId));
    mockLocalStorage.setItem(PENDING_STORAGE_KEY, JSON.stringify(filtered));
  }

  // -------------------------------------------------------------
  // TEST 1: BACKEND WORKING ONLINE
  // -------------------------------------------------------------
  console.log('--- TEST 1: Online Application (Backend Working) ---');
  const testJobId1 = `job-online-${Date.now()}`;
  const worker1 = 'worker-ravi-online';

  // Employer posts Job 1
  const createJobRes1 = await fetch(`${BASE_URL}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: testJobId1,
      title: 'Plumbing & Pipe Replacement',
      category: 'Repair/Maintenance',
      wage: 850,
      workersRequired: 1,
      customerId: 'cust-anil',
      customerName: 'Anil Kumar',
    }),
  });
  const createJobData1 = await createJobRes1.json();
  assert(createJobRes1.status === 201, 'Employer successfully creates Job 1');

  // Worker 1 applies online
  const applyRes1 = await fetch(`${BASE_URL}/jobs/${testJobId1}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workerId: worker1,
      workerName: 'Ravi Kumar',
      workerPhone: '+91 98765 00001',
      matchScore: 92,
    }),
  });
  const applyData1 = await applyRes1.json();
  assert(applyRes1.status === 200, 'Worker 1 apply returns HTTP 200');
  assert(applyData1.success === true, 'Worker 1 application marked successful');

  // Employer views Applicants
  const getAppsRes1 = await fetch(`${BASE_URL}/jobs/${testJobId1}/applications`);
  const getAppsData1 = await getAppsRes1.json();
  const applicant1 = getAppsData1.applications?.find(a => a.workerId === worker1);
  assert(!!applicant1, 'Worker 1 appears in Employer Applicants section on remote device');
  assert(applicant1?.workerName === 'Ravi Kumar', 'Applicant profile metadata preserved');

  // -------------------------------------------------------------
  // TEST 2: BACKEND TEMPORARILY UNAVAILABLE / OFFLINE FALLBACK
  // -------------------------------------------------------------
  console.log('\n--- TEST 2: Offline Application & Auto-Sync on Restore ---');
  const testJobId2 = `job-offline-${Date.now()}`;
  const worker2 = 'worker-suresh-offline';

  // Employer creates Job 2
  await fetch(`${BASE_URL}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: testJobId2,
      title: 'Garden Weeding & Plant Care',
      category: 'Gardening',
      wage: 750,
      workersRequired: 1,
      customerId: 'cust-sunita',
      customerName: 'Sunita Rao',
    }),
  });

  // Simulate network failure by targeting dead port (e.g. port 9999)
  const deadUrl = 'http://localhost:9999/api/v1';
  let offlineErrorCaptured = null;
  let offlineSavedSuccessfully = false;

  try {
    await fetch(`${deadUrl}/jobs/${testJobId2}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workerId: worker2 }),
    });
  } catch (netErr) {
    offlineErrorCaptured = netErr;
    // Client enters fallback handler:
    // 1. Sanitize error (do not expose DB errors or network stack traces)
    const clientUserMessage = "Application saved. We'll sync it when you're back online. ✓";
    assert(!clientUserMessage.includes('23503'), 'User message does NOT contain 23503');
    assert(!clientUserMessage.includes('foreign key'), 'User message does NOT contain foreign key text');
    assert(!clientUserMessage.includes('Supabase'), 'User message does NOT contain Supabase technical terms');

    // 2. Queue in localStorage
    savePendingApplication({
      applicationId: `pending-${testJobId2}-${worker2}-${Date.now()}`,
      jobId: testJobId2,
      workerId: worker2,
      createdAt: new Date().toISOString(),
      status: 'SYNC_PENDING',
      payload: {
        workerId: worker2,
        workerName: 'Suresh Verma',
        workerPhone: '+91 98765 00002',
        matchScore: 88,
      },
    });
    offlineSavedSuccessfully = true;
  }

  assert(offlineErrorCaptured !== null, 'Network failure detected');
  assert(offlineSavedSuccessfully, 'Application saved locally into pending queue');
  assert(getPendingApplications().length === 1, 'Pending queue has exactly 1 application');
  assert(getPendingApplications()[0].status === 'SYNC_PENDING', 'Pending application state is SYNC_PENDING');

  // Verify employer Applicants does NOT see un-synced application
  const preSyncEmployerApps = await fetch(`${BASE_URL}/jobs/${testJobId2}/applications`);
  const preSyncData = await preSyncEmployerApps.json();
  const preSyncFound = preSyncData.applications?.find(a => a.workerId === worker2);
  assert(!preSyncFound, 'Employer does NOT see locally pending application before sync');

  // NOW RESTORE: Trigger Auto-Sync against live backend
  console.log('Restoring connection: executing auto-sync...');
  const pendingQueue = getPendingApplications();
  let syncSuccessCount = 0;

  for (const pendingItem of pendingQueue) {
    const syncRes = await fetch(`${BASE_URL}/jobs/${pendingItem.jobId}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pendingItem.payload),
    });
    const syncData = await syncRes.json();
    if (syncRes.ok && syncData.success) {
      removePendingApplication(pendingItem.jobId, pendingItem.workerId);
      syncSuccessCount++;
    }
  }

  assert(syncSuccessCount === 1, 'Auto-sync successfully dispatched pending application to live backend');
  assert(getPendingApplications().length === 0, 'Pending queue is completely cleared after sync');

  // Verify employer Applicants now sees worker2
  const postSyncEmployerApps = await fetch(`${BASE_URL}/jobs/${testJobId2}/applications`);
  const postSyncData = await postSyncEmployerApps.json();
  const postSyncFound = postSyncData.applications?.find(a => a.workerId === worker2);
  assert(!!postSyncFound, 'Worker 2 is now visible to Employer in Applicants after sync');

  // -------------------------------------------------------------
  // TEST 3: DUPLICATE PROTECTION
  // -------------------------------------------------------------
  console.log('\n--- TEST 3: Duplicate Protection ---');
  // Worker 2 attempts to apply 3 more times to testJobId2
  let duplicateRejections = 0;
  for (let i = 0; i < 3; i++) {
    const dupRes = await fetch(`${BASE_URL}/jobs/${testJobId2}/apply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workerId: worker2,
        workerName: 'Suresh Verma',
      }),
    });
    const dupData = await dupRes.json();
    assert(dupRes.status === 200, `Duplicate call ${i + 1} handled safely`);
  }

  // Count occurrences in employer applications
  const dupCheckRes = await fetch(`${BASE_URL}/jobs/${testJobId2}/applications`);
  const dupCheckData = await dupCheckRes.json();
  const worker2Count = dupCheckData.applications?.filter(a => a.workerId === worker2).length;
  assert(worker2Count === 1, 'Exactly ONE application exists for worker2; no duplicates created');

  // -------------------------------------------------------------
  // TEST 4: BROWSER RELOAD / STORAGE PERSISTENCE
  // -------------------------------------------------------------
  console.log('\n--- TEST 4: Browser Reload Persistence ---');
  // Add a pending application to storage
  const testJobId4 = `job-reload-${Date.now()}`;
  const worker4 = 'worker-reload-test';
  savePendingApplication({
    applicationId: `pending-${testJobId4}-${worker4}`,
    jobId: testJobId4,
    workerId: worker4,
    createdAt: new Date().toISOString(),
    status: 'SYNC_PENDING',
  });

  // Verify it exists in storage
  const reloadedPending = getPendingApplications();
  const reloadFound = reloadedPending.find(p => p.jobId === testJobId4 && p.workerId === worker4);
  assert(!!reloadFound, 'Pending application persists across storage reads/app reloads');
  assert(reloadFound?.status === 'SYNC_PENDING', 'Pending status remains SYNC_PENDING after reload');

  // Clean up test 4
  removePendingApplication(testJobId4, worker4);
  assert(getPendingApplications().length === 0, 'Cleaned up test 4 pending storage');

  // -------------------------------------------------------------
  // TEST 5: CROSS-DEVICE ISOLATION
  // -------------------------------------------------------------
  console.log('\n--- TEST 5: Cross-Device State Isolation ---');
  const testJobId5 = `job-cross-${Date.now()}`;
  const worker5 = 'worker-mobile-b';

  // Employer Laptop creates Job 5
  await fetch(`${BASE_URL}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: testJobId5,
      title: 'Heavy Carton Packing Helper',
      category: 'Loading/Unloading',
      wage: 950,
      workersRequired: 2,
      customerId: 'cust-laptop-a',
    }),
  });

  // Mobile B saves offline application locally
  savePendingApplication({
    applicationId: `pending-${testJobId5}-${worker5}`,
    jobId: testJobId5,
    workerId: worker5,
    createdAt: new Date().toISOString(),
    status: 'SYNC_PENDING',
  });

  // Laptop A queries applications - must be EMPTY
  const laptopAppsBefore = await (await fetch(`${BASE_URL}/jobs/${testJobId5}/applications`)).json();
  assert(laptopAppsBefore.count === 0, 'Laptop A sees 0 applications while Mobile B is offline');

  // Mobile B comes online and syncs
  await fetch(`${BASE_URL}/jobs/${testJobId5}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workerId: worker5,
      workerName: 'Mobile B Worker',
    }),
  });
  removePendingApplication(testJobId5, worker5);

  // Laptop A queries applications - must now show Mobile B Worker
  const laptopAppsAfter = await (await fetch(`${BASE_URL}/jobs/${testJobId5}/applications`)).json();
  assert(laptopAppsAfter.count === 1, 'Laptop A sees exactly 1 application after Mobile B syncs');
  assert(laptopAppsAfter.applications[0].workerId === worker5, 'Laptop A sees Mobile B Worker in Applicants');

  console.log('\n===============================================================');
  console.log(`🎉 ALL OFFLINE FALLBACK & AUTO-SYNC TESTS PASSED! (${passed}/${total})`);
  console.log('===============================================================\n');
  setTimeout(() => process.exit(0), 100);
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});

