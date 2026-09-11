// Image Upload & Persistence Integration Test Suite
const BASE_URL = 'http://localhost:5056/api/v1';

async function runTests() {
  console.log('=== WORKMOJO IMAGES, PROFILE & JOB PERSISTENCE TEST SUITE ===\n');

  process.env.PORT = '5056';
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

  // 1. Test POST /upload/image with valid base64
  console.log('\n--- 1. Test Image Upload Endpoint ---');
  const sampleBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const uploadRes = await fetch(`${BASE_URL}/upload/image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      base64Data: sampleBase64,
      folder: 'profiles',
      mimeType: 'image/png',
    }),
  });
  const uploadData = await uploadRes.json();
  console.log('POST /upload/image response:', uploadData);
  assert(uploadRes.status === 200, 'Image upload returns HTTP 200');
  assert(uploadData.success === true, 'Image upload response indicates success');
  assert(typeof uploadData.url === 'string' && uploadData.url.length > 0, 'Image upload returns a valid URL string');

  // 2. Test POST /upload/image validation (invalid mime type)
  console.log('\n--- 2. Test Image Upload Validation ---');
  const invalidRes = await fetch(`${BASE_URL}/upload/image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      base64Data: 'not-an-image',
      folder: 'profiles',
      mimeType: 'application/pdf',
    }),
  });
  const invalidData = await invalidRes.json();
  assert(invalidRes.status === 400, 'Uploading non-image MIME type returns HTTP 400');
  assert(invalidData.success === false, 'Invalid upload reports success: false');

  // 3. Test POST /users/profile (DP persistence)
  console.log('\n--- 3. Test Profile DP Persistence ---');
  const testUserId = `user-test-${Date.now()}`;
  const profilePhotoUrl = uploadData.url;
  const profileRes = await fetch(`${BASE_URL}/users/profile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: testUserId,
      name: 'Ravi Kumar Test',
      phone: '+91 99887 76655',
      profilePhoto: profilePhotoUrl,
      role: 'worker',
    }),
  });
  const profileData = await profileRes.json();
  console.log('POST /users/profile response:', profileData);
  assert(profileRes.status === 200, 'Profile update returns HTTP 200');
  assert(profileData.success === true, 'Profile update indicates success: true');
  assert(profileData.user?.profilePhoto === profilePhotoUrl, 'Profile photo matches uploaded URL');

  // 4. Test POST /jobs with persistent image URL
  console.log('\n--- 4. Test Job Creation with Persistent Image ---');
  const testJobId = `job-img-test-${Date.now()}`;
  const customJobImage = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800';
  const postJobRes = await fetch(`${BASE_URL}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: testJobId,
      title: 'Warehouse Loader with Equipment',
      category: 'Loading/Unloading',
      wage: 900,
      image: customJobImage,
      startTime: '08:00 AM',
      duration: '8 hours',
      urgency: 'Today',
      workersRequired: 2,
      customerId: 'cust-test',
      customerName: 'Test Employer',
    }),
  });
  const postJobData = await postJobRes.json();
  console.log('POST /jobs response:', postJobData);
  assert(postJobRes.status === 201, 'Job creation returns HTTP 201');
  assert(postJobData.job?.image === customJobImage, 'Created job preserves custom image URL');

  // 5. Test GET /jobs propagates image and category fallback
  console.log('\n--- 5. Test GET /jobs image propagation & fallback ---');
  const getJobsRes = await fetch(`${BASE_URL}/jobs`);
  const getJobsData = await getJobsRes.json();
  assert(getJobsRes.status === 200, 'GET /jobs returns HTTP 200');
  const retrievedJob = getJobsData.jobs?.find(j => j.id === testJobId);
  assert(!!retrievedJob, 'Created job is returned in GET /jobs');
  assert(retrievedJob?.image === customJobImage, 'Retrieved job has exact custom image URL');

  // Check all jobs have fallback images and are not empty
  const allJobsHaveImages = getJobsData.jobs.every(j => typeof j.image === 'string' && j.image.length > 0);
  assert(allJobsHaveImages, 'Every job in GET /jobs has a non-empty image URL (no broken image)');

  // 6. Test Worker Apply to Persisted Job (Foreign Key satisfied)
  console.log('\n--- 6. Test Worker Apply to Persisted Job ---');
  const applyRes = await fetch(`${BASE_URL}/jobs/${testJobId}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workerId: testUserId,
      workerName: 'Ravi Kumar Test',
      workerPhoto: profilePhotoUrl,
      matchScore: 95,
    }),
  });
  const applyData = await applyRes.json();
  console.log('POST /jobs/:id/apply response:', applyData);
  assert(applyRes.status === 200, 'Apply to persisted job returns HTTP 200');
  assert(applyData.success === true, 'Application succeeds without foreign key errors');

  console.log(`\n========================================`);
  console.log(`ALL TESTS PASSED: ${passed}/${total}`);
  console.log(`========================================\n`);
  setTimeout(() => process.exit(0), 100);
}

runTests().catch(err => {
  console.error('Fatal test runner failure:', err);
  process.exit(1);
});

