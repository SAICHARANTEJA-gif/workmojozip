// Comprehensive Job Publishing Pipeline Verification Test Suite
// Tests both Live Production (Render + Supabase PostgreSQL) and Local Patched Server
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

if (fs.existsSync('./server/.env')) {
  const envContent = fs.readFileSync('./server/.env', 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const LIVE_RENDER_URL = 'https://workmojozip.onrender.com/api/v1';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://hwgvlkpdvdfhfmgstbyv.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

const supabaseDirect = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const LOCAL_PORT = '5063';
const LOCAL_BASE_URL = `http://localhost:${LOCAL_PORT}/api/v1`;

async function runTests() {
  console.log('=== WORKMOJO JOB PUBLISHING PIPELINE & PRODUCTION VERIFICATION ===\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      process.exit(1);
    }
    passed++;
    console.log(`✅ PASS: ${message}`);
  }

  // ==========================================================================
  // SECTION 1: LIVE DEPLOYED RENDER & SUPABASE PERSISTENCE VERIFICATION
  // ==========================================================================
  console.log('--- SECTION 1: Live Render Backend & Supabase Database Verification ---');

  const liveJobId = `live-job-chennai-${Date.now()}`;
  const liveJobPayload = {
    id: liveJobId,
    customerId: `cust-kumar-${Date.now()}`,
    customerName: 'Kumar Sanu',
    title: 'Plumber',
    category: 'Plumbing',
    description: 'Need experienced plumbers',
    wage: 900,
    workersRequired: 5,
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    duration: '8 hours',
    urgency: 'Tomorrow',
    approximateArea: 'Chennai Central',
    approximateDistanceKm: 1.5,
    exactLocation: {
      approximateArea: 'Chennai Central',
      exactAddress: '12 Mount Road, Anna Salai, Chennai',
      lat: 13.0827,
      lng: 80.2707,
      landmark: 'Near Central Station',
    },
    selectionMode: 'manual',
    status: 'Open',
  };

  try {
    const livePostRes = await fetch(`${LIVE_RENDER_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(liveJobPayload),
    });

    const liveData = await livePostRes.json();
    assert(livePostRes.status === 201, `Live Render returned HTTP 201 Created (got ${livePostRes.status})`);
    assert(liveData.success === true, 'Live Render returned success: true');
    assert(liveData.persistedToSupabase === true, 'Live Render successfully persisted job to Supabase (persistedToSupabase: true)');
    assert(liveData.job.status === 'Open', 'Job status is Open');

    // Query Supabase directly via standard client to verify row exists with status 'Open'
    const { data: sbRow, error: sbErr } = await supabaseDirect
      .from('jobs')
      .select('id, title, category, wage, workers_required, status, employer_id')
      .eq('id', liveJobId)
      .single();

    assert(!sbErr, `Direct Supabase query succeeded: ${sbErr?.message}`);
    assert(sbRow && sbRow.id === liveJobId, 'Job exists in Supabase jobs table');
    assert(sbRow.status === 'Open', 'Supabase row status satisfies check constraint with "Open"');
    assert(Number(sbRow.wage) === 900, 'Supabase row wage is 900');
    assert(Number(sbRow.workers_required) === 5, 'Supabase row workers_required is 5');
    assert(sbRow.category === 'Plumbing', 'Supabase row category is Plumbing');
  } catch (err) {
    console.error('Live Render verification encountered an issue:', err);
    throw err;
  }

  // ==========================================================================
  // SECTION 2: LOCAL PATCHED SERVER END-TO-END PIPELINE VERIFICATION
  // ==========================================================================
  console.log('\n--- SECTION 2: Local Patched Server Pipeline Verification ---');

  process.env.PORT = LOCAL_PORT;
  process.env.SUPABASE_URL = ''; // Isolated in-memory dual-store for local tests

  // Import compiled server
  const { app } = await import('../server/dist/index.js');
  await new Promise(resolve => setTimeout(resolve, 800));

  const localJobId1 = `local-job-chennai-1-${Date.now()}`;
  const localJobId2 = `local-job-chennai-2-${Date.now()}`;

  const localJobPayload1 = {
    id: localJobId1,
    customerId: 'cust-kumar',
    customerName: 'Kumar Sanu',
    title: 'Plumber',
    category: 'Plumbing',
    description: 'Need experienced plumbers for site 1',
    wage: 900,
    workersRequired: 5,
    startTime: '09:00 AM',
    endTime: '05:00 PM',
    duration: '8 hours',
    urgency: 'Tomorrow',
    approximateArea: 'Chennai Central',
    approximateDistanceKm: 1.5,
    exactLocation: {
      approximateArea: 'Chennai Central',
      exactAddress: 'Anna Salai, Chennai',
      lat: 13.0827,
      lng: 80.2707,
    },
    selectionMode: 'manual',
    status: 'Open',
  };

  const localJobPayload2 = {
    ...localJobPayload1,
    id: localJobId2,
    description: 'Need plumbers for site 2 (second legitimate job in same trade)',
    workersRequired: 3,
    approximateArea: 'T Nagar, Chennai',
  };

  // 1. Create Job 1
  const res1 = await fetch(`${LOCAL_BASE_URL}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(localJobPayload1),
  });
  const data1 = await res1.json();
  assert(res1.status === 201, 'Job 1 created with HTTP 201');
  assert(data1.job.id === localJobId1, 'Job 1 ID matches');

  // 2. Create Job 2 (same category, wage, employer, but different job)
  const res2 = await fetch(`${LOCAL_BASE_URL}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(localJobPayload2),
  });
  const data2 = await res2.json();
  assert(res2.status === 201, 'Job 2 created with HTTP 201 (NOT blocked by overzealous duplicate check!)');
  assert(data2.job.id === localJobId2, 'Job 2 ID matches');

  // 3. Exact Duplicate ID Retry (Idempotency)
  const resDup = await fetch(`${LOCAL_BASE_URL}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(localJobPayload1),
  });
  const dataDup = await resDup.json();
  assert(resDup.status === 200, 'Exact same ID submission returns HTTP 200 (idempotent duplicate prevented)');
  assert(dataDup.job.id === localJobId1, 'Duplicate returns existing job');

  // 4. Worker Discovery: Both jobs present in GET /jobs
  const jobsRes = await fetch(`${LOCAL_BASE_URL}/jobs`);
  const jobsData = await jobsRes.json();
  const jobsList = jobsData.jobs || jobsData;
  assert(Array.isArray(jobsList), 'GET /jobs returns job array');
  const found1 = jobsList.find(j => j.id === localJobId1);
  const found2 = jobsList.find(j => j.id === localJobId2);
  assert(Boolean(found1), 'Job 1 visible in worker job feed');
  assert(Boolean(found2), 'Job 2 visible in worker job feed');

  // 5. Worker Application Flow
  const applyRes = await fetch(`${LOCAL_BASE_URL}/jobs/${localJobId1}/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workerId: 'w-chennai-1',
      workerName: 'Mani Kandan',
      workerPhone: '9876543210',
      workerRating: 4.8,
      matchScore: 95,
      distanceKm: 1.2,
    }),
  });
  assert(applyRes.status === 200, 'Worker successfully applied to Job 1');

  const checkJobsRes = await fetch(`${LOCAL_BASE_URL}/jobs`);
  const checkJobsData = await checkJobsRes.json();
  const refreshedJob1 = (checkJobsData.jobs || checkJobsData).find(j => j.id === localJobId1);
  assert(refreshedJob1 && refreshedJob1.applicants.some(a => a === 'w-chennai-1' || a.workerId === 'w-chennai-1'), 'Employer sees applicant in applicants list');

  // ==========================================================================
  // SECTION 3: MOJO VOICE & TEXT PUBLISHING INTENTS ACROSS 4 LANGUAGES
  // ==========================================================================
  console.log('\n--- SECTION 3: Mojo Voice & Text Publishing Intents Across 4 Languages ---');

  // English
  const mojoEn = await fetch(`${LOCAL_BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Publish it now',
      language: 'en',
      role: 'customer',
      conversationState: {
        jobDraft: { title: 'Plumber', category: 'Plumbing', workersRequired: 5, wage: 900 },
      },
    }),
  });
  const mojoEnData = await mojoEn.json();
  assert(mojoEnData.intent === 'JOB_PUBLISH', `English "Publish it now" classified as JOB_PUBLISH (got ${mojoEnData.intent})`);
  assert(mojoEnData.action?.type === 'PUBLISH_JOB', 'English action type is PUBLISH_JOB');
  assert(mojoEnData.action?.jobDraft?.workersRequired === 5, 'Job draft workersRequired preserved');

  // Telugu
  const mojoTe = await fetch(`${LOCAL_BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'దయచేసి పనిని పబ్లిష్ చేయండి',
      language: 'te',
      role: 'customer',
      conversationState: {
        jobDraft: { title: 'ప్లంబర్', category: 'Plumbing', workersRequired: 5, wage: 900 },
      },
    }),
  });
  const mojoTeData = await mojoTe.json();
  assert(mojoTeData.intent === 'JOB_PUBLISH', `Telugu "పబ్లిష్ చేయండి" classified as JOB_PUBLISH (got ${mojoTeData.intent})`);
  assert(mojoTeData.action?.type === 'PUBLISH_JOB', 'Telugu action type is PUBLISH_JOB');

  // Hindi
  const mojoHi = await fetch(`${LOCAL_BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'काम को पब्लिश कर दो',
      language: 'hi',
      role: 'customer',
      conversationState: {
        jobDraft: { title: 'प्लंबर', category: 'Plumbing', workersRequired: 5, wage: 900 },
      },
    }),
  });
  const mojoHiData = await mojoHi.json();
  assert(mojoHiData.intent === 'JOB_PUBLISH', `Hindi "पब्लिश कर दो" classified as JOB_PUBLISH (got ${mojoHiData.intent})`);
  assert(mojoHiData.action?.type === 'PUBLISH_JOB', 'Hindi action type is PUBLISH_JOB');

  // Tamil
  const mojoTa = await fetch(`${LOCAL_BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'வேலை வெளியிடுங்கள்',
      language: 'ta',
      role: 'customer',
      conversationState: {
        jobDraft: { title: 'பிளம்பர்', category: 'Plumbing', workersRequired: 5, wage: 900 },
      },
    }),
  });
  const mojoTaData = await mojoTa.json();
  assert(mojoTaData.intent === 'JOB_PUBLISH', `Tamil "வேலை வெளியிடுங்கள்" classified as JOB_PUBLISH (got ${mojoTaData.intent})`);
  assert(mojoTaData.action?.type === 'PUBLISH_JOB', 'Tamil action type is PUBLISH_JOB');

  console.log(`\n=============================================================`);
  console.log(`🎉 ALL ${passed}/${total} PRODUCTION & PIPELINE VERIFICATION TESTS PASSED!`);
  console.log(`=============================================================`);
  process.exit(0);
}

runTests();
