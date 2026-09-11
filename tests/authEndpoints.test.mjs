// End-to-End HTTP API Test for /api/v1/auth/send-otp and /api/v1/auth/verify-otp
import assert from 'assert';

const BASE_URL = 'http://localhost:5056/api/v1';

async function runAuthApiTests() {
  console.log('=== WORKMOJO AUTH HTTP ENDPOINTS TEST SUITE ===\n');

  // Set test port and initialize live test mode
  process.env.PORT = '5056';
  process.env.DEMO_OTP_BYPASS = 'false';

  const {
    setMockSmsSenderForTesting,
    clearOtpStoreForTesting,
  } = await import('../server/dist/services/otpService.js');

  const { app } = await import('../server/dist/index.js');
  await new Promise(resolve => setTimeout(resolve, 600));

  let capturedOtp = null;
  setMockSmsSenderForTesting(async (phone, otp) => {
    capturedOtp = otp;
    return { success: true };
  });

  const testPhone = '9876500001';
  const cleanPhone = '+919876500001';

  // 1. Missing Phone Validation
  console.log('--- 1. Validation Failures ---');
  const resNoPhone = await fetch(`${BASE_URL}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  assert.strictEqual(resNoPhone.status, 400);
  const dataNoPhone = await resNoPhone.json();
  assert.strictEqual(dataNoPhone.success, false);
  console.log('✅ PASS: Rejects missing phone number with HTTP 400');

  const resShortPhone = await fetch(`${BASE_URL}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '12345' }),
  });
  assert.strictEqual(resShortPhone.status, 400);
  console.log('✅ PASS: Rejects phone shorter than 10 digits with HTTP 400');

  // 2. Successful Send OTP
  console.log('\n--- 2. Successful Send OTP ---');
  clearOtpStoreForTesting();
  const resSend = await fetch(`${BASE_URL}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: testPhone }),
  });
  assert.strictEqual(resSend.status, 200);
  const dataSend = await resSend.json();
  assert.strictEqual(dataSend.success, true);
  assert.strictEqual(typeof capturedOtp, 'string');
  assert.strictEqual(capturedOtp.length, 6);
  // Guarantee response does NOT leak the OTP
  assert.strictEqual(dataSend.otp, undefined);
  console.log('✅ PASS: OTP sent successfully, no OTP leaked in HTTP response');

  // 3. Verify with Invalid OTP
  console.log('\n--- 3. Invalid OTP Rejection ---');
  const resWrongOtp = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: testPhone, otp: '000000' }),
  });
  assert.strictEqual(resWrongOtp.status, 401);
  const dataWrong = await resWrongOtp.json();
  assert.strictEqual(dataWrong.success, false);
  assert(dataWrong.error.includes('attempt'));
  console.log('✅ PASS: Wrong OTP rejected with HTTP 401 and attempt countdown');

  // 4. Successful Verification and User Profile Creation
  console.log('\n--- 4. Successful Verification & User Session ---');
  const resValidOtp = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: testPhone,
      otp: capturedOtp,
      name: 'Test Auth User',
      gender: 'Male',
      role: 'worker',
    }),
  });
  assert.strictEqual(resValidOtp.status, 200);
  const dataValid = await resValidOtp.json();
  assert.strictEqual(dataValid.success, true);
  assert(dataValid.token.startsWith('wm_auth_token_'));
  assert.strictEqual(dataValid.user.phone, cleanPhone);
  assert.strictEqual(dataValid.user.name, 'Test Auth User');
  console.log('✅ PASS: OTP verified successfully, session token issued, user profile initialized');

  // 5. Replay / Single-Use Check
  console.log('\n--- 5. Single-Use Verification Check ---');
  const resReplay = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: testPhone, otp: capturedOtp }),
  });
  assert.strictEqual(resReplay.status, 401);
  console.log('✅ PASS: Replay attempt with already-verified OTP rejected with HTTP 401');

  // 6. Provider Unconfigured Error (when DEMO_OTP_BYPASS=false)
  console.log('\n--- 6. Provider Unconfigured Error Handling ---');
  process.env.DEMO_OTP_BYPASS = 'false';
  setMockSmsSenderForTesting(null);
  delete process.env.TWILIO_ACCOUNT_SID;
  delete process.env.FAST2SMS_API_KEY;
  clearOtpStoreForTesting();

  const resUnconfigured = await fetch(`${BASE_URL}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '9876500099' }),
  });
  assert.strictEqual(resUnconfigured.status, 503);
  const dataUnconfigured = await resUnconfigured.json();
  assert.strictEqual(dataUnconfigured.success, false);
  assert(dataUnconfigured.error.includes('temporarily unavailable'));
  console.log('✅ PASS: Unconfigured SMS provider cleanly returns HTTP 503 when DEMO_OTP_BYPASS=false');

  // 7. Temporary Demo Mode (DEMO_OTP_BYPASS=true)
  console.log('\n--- 7. Temporary Demo Mode (DEMO_OTP_BYPASS=true) ---');
  process.env.DEMO_OTP_BYPASS = 'true';
  clearOtpStoreForTesting();

  // Send OTP in demo mode (succeeds even without provider)
  const resDemoSend = await fetch(`${BASE_URL}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone: '9876500077' }),
  });
  assert.strictEqual(resDemoSend.status, 200);
  const dataDemoSend = await resDemoSend.json();
  assert.strictEqual(dataDemoSend.success, true);
  assert.strictEqual(dataDemoSend.demoModeActive, true);
  assert(dataDemoSend.message.includes('Demo OTP mode active'));
  console.log('✅ PASS: send-otp succeeds in demo mode without SMS provider, indicating demo mode');

  // Verify with 123456
  const resDemoVerify1 = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: '9876500077',
      otp: '123456',
      name: 'Demo Tester 1',
      role: 'worker',
    }),
  });
  assert.strictEqual(resDemoVerify1.status, 200);
  const dataDemoVerify1 = await resDemoVerify1.json();
  assert.strictEqual(dataDemoVerify1.success, true);
  assert.strictEqual(dataDemoVerify1.demoModeActive, true);
  assert(dataDemoVerify1.token.startsWith('wm_auth_token_'));
  assert.strictEqual(dataDemoVerify1.user.name, 'Demo Tester 1');
  console.log('✅ PASS: verify-otp accepts 123456 and creates session in demo mode');

  // Verify with another arbitrary 6-digit code: 999999
  const resDemoVerify2 = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: '9876500088',
      otp: '999999',
      name: 'Demo Tester 2',
      role: 'customer',
    }),
  });
  assert.strictEqual(resDemoVerify2.status, 200);
  const dataDemoVerify2 = await resDemoVerify2.json();
  assert.strictEqual(dataDemoVerify2.success, true);
  assert.strictEqual(dataDemoVerify2.demoModeActive, true);
  console.log('✅ PASS: verify-otp accepts 999999 in demo mode');

  // Verify non-6-digit code is still rejected in demo mode
  const resDemoBadCode = await fetch(`${BASE_URL}/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: '9876500088',
      otp: '12',
    }),
  });
  assert.strictEqual(resDemoBadCode.status, 400);
  console.log('✅ PASS: verify-otp still strictly validates 6-digit format in demo mode');

  // Cleanly restore DEMO_OTP_BYPASS to false
  process.env.DEMO_OTP_BYPASS = 'false';

  console.log('\n=============================================================');
  console.log('🎉 ALL AUTH HTTP ENDPOINT TESTS PASSED SUCCESSFULLY!');
  console.log('=============================================================');
  process.exit(0);
}

runAuthApiTests().catch(err => {
  console.error('\n❌ AUTH HTTP TEST FAILED:', err);
  process.exit(1);
});
