// Automated Production OTP Service Test Suite
import assert from 'assert';

async function runOtpTests() {
  console.log('=== WORKMOJO PRODUCTION OTP SERVICE TEST SUITE ===\n');

  // Dynamically import the compiled or TypeScript otpService
  // First test if dist exists, or use tsx
  const otpService = await import('../server/dist/services/otpService.js');

  const {
    normalizePhoneNumber,
    generateSecureOtp,
    hashOtp,
    requestOtp,
    verifyOtp,
    getActiveSmsProvider,
    setMockSmsSenderForTesting,
    clearOtpStoreForTesting,
  } = otpService;

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(err);
      throw err;
    }
  }

  async function asyncTest(name, fn) {
    total++;
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(err);
      throw err;
    }
  }

  console.log('--- 1. Phone Normalization ---');
  test('Normalizes 10-digit number to +91XXXXXXXXXX', () => {
    assert.strictEqual(normalizePhoneNumber('9876543210'), '+919876543210');
  });

  test('Normalizes number with country code +91', () => {
    assert.strictEqual(normalizePhoneNumber('+919876543210'), '+919876543210');
  });

  test('Normalizes formatted mobile with spaces and dashes', () => {
    assert.strictEqual(normalizePhoneNumber('+91 98765-43210'), '+919876543210');
  });

  test('Rejects numbers with fewer than 10 digits', () => {
    assert.strictEqual(normalizePhoneNumber('12345'), '');
    assert.strictEqual(normalizePhoneNumber(''), '');
  });

  console.log('\n--- 2. Cryptographic OTP Generation & Salted Hashing ---');
  test('Generates exactly 6-digit numeric OTP', () => {
    for (let i = 0; i < 20; i++) {
      const code = generateSecureOtp();
      assert.strictEqual(code.length, 6);
      assert.match(code, /^\d{6}$/);
      const num = parseInt(code, 10);
      assert(num >= 100000 && num <= 999999);
    }
  });

  test('Generates non-deterministic codes across runs', () => {
    const codes = new Set();
    for (let i = 0; i < 30; i++) {
      codes.add(generateSecureOtp());
    }
    assert(codes.size > 20, 'Expected diverse cryptographic randomness');
  });

  test('Hashes OTP with SHA-256 HMAC and salt', () => {
    const salt1 = 'test-salt-1';
    const salt2 = 'test-salt-2';
    const hash1 = hashOtp('123456', salt1);
    const hash2 = hashOtp('123456', salt2);
    assert.strictEqual(hash1.length, 64);
    assert.notStrictEqual(hash1, hash2);
    assert.notStrictEqual(hash1, '123456');
  });

  console.log('\n--- 3. Unconfigured Provider Protection ---');
  await asyncTest('Returns 503 error when no SMS provider is configured', async () => {
    clearOtpStoreForTesting();
    setMockSmsSenderForTesting(null);
    delete process.env.TWILIO_ACCOUNT_SID;
    delete process.env.FAST2SMS_API_KEY;

    const res = await requestOtp('+919876543210');
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.status, 503);
    assert(res.error.includes('temporarily unavailable'));
  });

  console.log('\n--- 4. OTP Request & Mock SMS Delivery ---');
  let lastDispatchedOtp = null;
  let lastDispatchedPhone = null;

  setMockSmsSenderForTesting(async (phone, otp) => {
    lastDispatchedPhone = phone;
    lastDispatchedOtp = otp;
    return { success: true };
  });

  await asyncTest('Requests OTP and dispatches via mocked provider', async () => {
    clearOtpStoreForTesting();
    const res = await requestOtp('+919876543210');
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(lastDispatchedPhone, '+919876543210');
    assert.strictEqual(typeof lastDispatchedOtp, 'string');
    assert.strictEqual(lastDispatchedOtp.length, 6);
  });

  console.log('\n--- 5. Resend Cooldown (60 Seconds) ---');
  await asyncTest('Blocks immediate re-request within 60 seconds', async () => {
    const res = await requestOtp('+919876543210');
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.status, 429);
    assert(res.error.includes('Please wait'));
    assert(res.retryAfterSeconds > 0 && res.retryAfterSeconds <= 60);
  });

  console.log('\n--- 6. OTP Verification (Success & Single-Use) ---');
  test('Successfully verifies correct OTP code', () => {
    const verifyRes = verifyOtp('+919876543210', lastDispatchedOtp);
    assert.strictEqual(verifyRes.success, true);
    assert.strictEqual(verifyRes.status, 200);
  });

  test('Enforces single-use policy (OTP burned immediately on success)', () => {
    const secondVerify = verifyOtp('+919876543210', lastDispatchedOtp);
    assert.strictEqual(secondVerify.success, false);
    assert.strictEqual(secondVerify.status, 401);
    assert(secondVerify.error.includes('No active verification code'));
  });

  console.log('\n--- 7. Wrong OTP & Attempt Limiting (Max 5 Attempts) ---');
  await asyncTest('Tracks wrong attempts and locks after 5 failures', async () => {
    clearOtpStoreForTesting();
    const reqRes = await requestOtp('+919123456789');
    assert.strictEqual(reqRes.success, true);

    // Attempt 1: wrong
    const a1 = verifyOtp('+919123456789', '000000');
    assert.strictEqual(a1.success, false);
    assert.strictEqual(a1.status, 401);
    assert(a1.error.includes('4 attempts remaining'));

    // Attempt 2: wrong
    const a2 = verifyOtp('+919123456789', '111111');
    assert.strictEqual(a2.status, 401);
    assert(a2.error.includes('3 attempts remaining'));

    // Attempt 3: wrong
    const a3 = verifyOtp('+919123456789', '222222');
    assert.strictEqual(a3.status, 401);

    // Attempt 4: wrong
    const a4 = verifyOtp('+919123456789', '333333');
    assert.strictEqual(a4.status, 401);
    assert(a4.error.includes('1 attempt remaining'));

    // Attempt 5: locks out
    const a5 = verifyOtp('+919123456789', '444444');
    assert.strictEqual(a5.status, 429);
    assert(a5.error.includes('Too many failed attempts'));

    // Attempt 6: record was purged
    const a6 = verifyOtp('+919123456789', lastDispatchedOtp);
    assert.strictEqual(a6.status, 401);
    assert(a6.error.includes('No active verification code'));
  });

  console.log('\n--- 8. 3-Per-10-Minute Rate Limit ---');
  await asyncTest('Blocks more than 3 requests within a 10-minute window', async () => {
    clearOtpStoreForTesting();
    const testPhone = '+919999988888';

    // Mock Date.now to test rate limit window while bypassing 60s cooldown
    let fakeTime = 1000000;
    const realDateNow = Date.now;

    try {
      Date.now = () => fakeTime;

      // Request 1
      const r1 = await requestOtp(testPhone);
      assert.strictEqual(r1.success, true);

      // Advance time by 65 seconds (cooldown passes)
      fakeTime += 65000;
      // Request 2
      const r2 = await requestOtp(testPhone);
      assert.strictEqual(r2.success, true);

      // Advance time by 65 seconds (cooldown passes)
      fakeTime += 65000;
      // Request 3
      const r3 = await requestOtp(testPhone);
      assert.strictEqual(r3.success, true);

      // Advance time by 65 seconds (cooldown passes, but 3 requests exist in 10-min window)
      fakeTime += 65000;
      // Request 4 (should be blocked by 3-per-10-min limit)
      const r4 = await requestOtp(testPhone);
      assert.strictEqual(r4.success, false);
      assert.strictEqual(r4.status, 429);
      assert(r4.error.includes('Too many OTP requests'));

      // Advance time beyond 10-minute window (600,000 ms)
      fakeTime += 600000;
      const r5 = await requestOtp(testPhone);
      assert.strictEqual(r5.success, true);
    } finally {
      Date.now = realDateNow;
    }
  });

  console.log('\n--- 9. Temporary Demo OTP Bypass Mode ---');
  test('Accepts any valid 6-digit OTP when DEMO_OTP_BYPASS=true', () => {
    process.env.DEMO_OTP_BYPASS = 'true';
    clearOtpStoreForTesting();

    const sampleCodes = ['123456', '111111', '000000', '654321', '987654'];
    for (const code of sampleCodes) {
      const res = verifyOtp('+919876543210', code);
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.demoModeActive, true);
    }

    // Phone validation is still enforced
    const badPhoneRes = verifyOtp('123', '123456');
    assert.strictEqual(badPhoneRes.success, false);
    assert.strictEqual(badPhoneRes.status, 400);

    // 6-digit code format is still enforced
    const badOtpRes = verifyOtp('+919876543210', '123');
    assert.strictEqual(badOtpRes.success, false);
    assert.strictEqual(badOtpRes.status, 400);
  });

  test('Strictly rejects arbitrary OTPs when DEMO_OTP_BYPASS=false', () => {
    process.env.DEMO_OTP_BYPASS = 'false';
    clearOtpStoreForTesting();

    const res = verifyOtp('+919876543210', '123456');
    assert.strictEqual(res.success, false);
    assert.strictEqual(res.status, 401);
  });

  console.log('\n=============================================================');
  console.log(`🎉 ALL ${passed}/${total} OTP SERVICE TESTS PASSED SUCCESSFULLY!`);
  console.log('=============================================================');
}

runOtpTests().catch(err => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
