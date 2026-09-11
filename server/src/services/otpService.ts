import crypto from 'crypto';

// ============================================================================
// WORKMOJO CRYPTOGRAPHIC OTP SERVICE & MULTI-PROVIDER SMS DISPATCHER
// ============================================================================

export interface OtpRecord {
  phone: string;
  salt: string;
  hash: string;
  expiresAt: number;
  attempts: number;
  createdAt: number;
}

export interface RateLimitEntry {
  requests: number[];
  lastRequestedAt: number;
}

// In-memory verification store: phone -> OtpRecord
const otpStore = new Map<string, OtpRecord>();

// In-memory rate limiting store: phone -> RateLimitEntry
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration Constants
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_VERIFICATION_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS_PER_WINDOW = 3;

/**
 * Normalizes Indian phone numbers consistently to +91XXXXXXXXXX
 */
export const normalizePhoneNumber = (phone: string): string => {
  if (!phone || typeof phone !== 'string') return '';
  const rawDigits = phone.replace(/\D/g, '');
  if (rawDigits.length < 10) return '';
  return `+91${rawDigits.slice(-10)}`;
};

/**
 * Generates a cryptographically random 6-digit numeric OTP code
 * Uses crypto.randomInt(100000, 1000000) for uniform randomness
 */
export const generateSecureOtp = (): string => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Hashes an OTP code using salted SHA-256
 */
export const hashOtp = (otp: string, salt: string): string => {
  return crypto.createHmac('sha256', salt).update(otp).digest('hex');
};

/**
 * Identifies the active SMS provider based on configured environment variables
 */
export type SmsProvider = 'twilio' | 'fast2sms' | 'none';

export const getActiveSmsProvider = (): SmsProvider => {
  if (
    Boolean(process.env.TWILIO_ACCOUNT_SID) &&
    Boolean(process.env.TWILIO_AUTH_TOKEN) &&
    Boolean(process.env.TWILIO_PHONE_NUMBER)
  ) {
    return 'twilio';
  }
  if (Boolean(process.env.FAST2SMS_API_KEY)) {
    return 'fast2sms';
  }
  return 'none';
};

/**
 * Checks whether the DEMO_OTP_BYPASS mode is explicitly activated via environment variable.
 * Must be strictly 'true' (string); default is false.
 */
export const isDemoOtpBypassEnabled = (): boolean => {
  return process.env.DEMO_OTP_BYPASS === 'true';
};

// Optional mock sender hook for automated unit testing (never used in production)
type SmsSenderFn = (phone: string, otp: string) => Promise<{ success: boolean; error?: string }>;
let mockSmsSender: SmsSenderFn | null = null;

export const setMockSmsSenderForTesting = (sender: SmsSenderFn | null) => {
  mockSmsSender = sender;
};

export const clearOtpStoreForTesting = () => {
  otpStore.clear();
  rateLimitStore.clear();
};

/**
 * Sends SMS via Twilio REST API using native Node fetch
 */
async function sendViaTwilio(phone: string, otp: string): Promise<{ success: boolean; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID!;
  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER!;

  const basicAuth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  const params = new URLSearchParams({
    To: phone,
    From: fromNumber,
    Body: `Your WorkMojo verification code is: ${otp}. Valid for 5 minutes. Do not share this code with anyone.`,
  });

  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!res.ok) {
      const errData: any = await res.json().catch(() => ({}));
      console.error('[SMS/Twilio] Dispatch failed with HTTP status:', res.status, errData.code || '');
      return {
        success: false,
        error: 'Unable to deliver SMS to this mobile number. Please check your number and try again.',
      };
    }
    return { success: true };
  } catch (err: any) {
    console.error('[SMS/Twilio] Network transport error');
    return {
      success: false,
      error: 'SMS service is temporarily unreachable. Please try again in a few moments.',
    };
  }
}

/**
 * Sends SMS via Fast2SMS Quick SMS API using native Node fetch
 */
async function sendViaFast2SMS(phone: string, otp: string): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.FAST2SMS_API_KEY!;
  const tenDigitNumber = phone.replace(/^\+91/, '');

  try {
    const res = await fetch('https://www.fast2sms.com/dev/bulkV2', {
      method: 'POST',
      headers: {
        'authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        route: 'otp',
        variables_values: otp,
        numbers: tenDigitNumber,
      }),
    });

    const data: any = await res.json().catch(() => ({}));
    if (!res.ok || data.return === false) {
      console.error('[SMS/Fast2SMS] Dispatch failed with response code:', res.status);
      return {
        success: false,
        error: 'Unable to deliver SMS to this mobile number. Please verify the number and try again.',
      };
    }
    return { success: true };
  } catch (err: any) {
    console.error('[SMS/Fast2SMS] Network transport error');
    return {
      success: false,
      error: 'SMS service is temporarily unreachable. Please try again in a few moments.',
    };
  }
}

/**
 * Request OTP for a phone number:
 * 1. Validates and normalizes phone number
 * 2. Checks cooldown & 3-per-10-minute rate limits
 * 3. Generates cryptographically random 6-digit OTP
 * 4. Stores salted SHA-256 hash (never plaintext)
 * 5. Dispatches SMS through configured provider
 */
export const requestOtp = async (
  rawPhone: string
): Promise<{ success: boolean; status: number; message?: string; error?: string; retryAfterSeconds?: number; demoModeActive?: boolean }> => {
  const phone = normalizePhoneNumber(rawPhone);
  if (!phone) {
    return {
      success: false,
      status: 400,
      error: 'Please enter a valid 10-digit mobile number.',
    };
  }

  const isDemoBypass = isDemoOtpBypassEnabled();
  const now = Date.now();

  // Rate Limiting Checks
  const rateLimit = rateLimitStore.get(phone) || { requests: [], lastRequestedAt: 0 };

  // Check 60-second cooldown
  if (rateLimit.lastRequestedAt && now - rateLimit.lastRequestedAt < RESEND_COOLDOWN_MS) {
    const waitSec = Math.ceil((RESEND_COOLDOWN_MS - (now - rateLimit.lastRequestedAt)) / 1000);
    return {
      success: false,
      status: 429,
      error: `Please wait ${waitSec} seconds before requesting a new verification code.`,
      retryAfterSeconds: waitSec,
    };
  }

  // Check 3-requests-per-10-minute window
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const recentRequests = rateLimit.requests.filter(timestamp => timestamp > windowStart);
  if (recentRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldest = recentRequests[0];
    const waitSec = Math.ceil((oldest + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return {
      success: false,
      status: 429,
      error: `Too many OTP requests. Please wait ${Math.max(waitSec, 1)} seconds before trying again.`,
      retryAfterSeconds: waitSec,
    };
  }

  // Check active SMS provider
  const provider = getActiveSmsProvider();
  if (provider === 'none' && !mockSmsSender && !isDemoBypass) {
    return {
      success: false,
      status: 503,
      error: 'SMS service is temporarily unavailable. Please try again later.',
    };
  }

  // Generate cryptographically random OTP and salt
  const otp = generateSecureOtp();
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashOtp(otp, salt);

  // Dispatch SMS (if provider is configured or mock sender hook is present)
  if (mockSmsSender || provider !== 'none') {
    let sendResult: { success: boolean; error?: string };
    if (mockSmsSender) {
      sendResult = await mockSmsSender(phone, otp);
    } else if (provider === 'twilio') {
      sendResult = await sendViaTwilio(phone, otp);
    } else if (provider === 'fast2sms') {
      sendResult = await sendViaFast2SMS(phone, otp);
    } else {
      sendResult = { success: false, error: 'No SMS provider configured.' };
    }

    if (!sendResult.success && !isDemoBypass) {
      return {
        success: false,
        status: 503,
        error: sendResult.error || 'Failed to dispatch SMS verification code.',
      };
    }
  }

  // Record rate limit request
  recentRequests.push(now);
  rateLimitStore.set(phone, {
    requests: recentRequests,
    lastRequestedAt: now,
  });

  // Store hashed OTP record
  otpStore.set(phone, {
    phone,
    salt,
    hash,
    expiresAt: now + OTP_EXPIRY_MS,
    attempts: 0,
    createdAt: now,
  });

  return {
    success: true,
    status: 200,
    message: isDemoBypass
      ? 'Demo OTP mode active: enter any 6-digit code to continue.'
      : `Verification code sent to ${phone}`,
    demoModeActive: isDemoBypass ? true : undefined,
  };
};

/**
 * Verifies submitted OTP for a phone number:
 * 1. Checks record existence, expiration, and attempt limit
 * 2. Compares hash with crypto.timingSafeEqual
 * 3. Immediately burns/deletes record on success (single-use guarantee)
 */
export const verifyOtp = (
  rawPhone: string,
  enteredOtp: string
): { success: boolean; status: number; error?: string; demoModeActive?: boolean } => {
  const phone = normalizePhoneNumber(rawPhone);
  if (!phone) {
    return {
      success: false,
      status: 400,
      error: 'Please enter a valid 10-digit mobile number.',
    };
  }

  const cleanOtp = (enteredOtp || '').trim();
  if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
    return {
      success: false,
      status: 400,
      error: 'Please enter a valid 6-digit verification code.',
    };
  }

  // When DEMO_OTP_BYPASS=true: accept ANY valid 6-digit OTP
  if (isDemoOtpBypassEnabled()) {
    otpStore.delete(phone);
    return {
      success: true,
      status: 200,
      demoModeActive: true,
    };
  }

  const record = otpStore.get(phone);

  if (!record) {
    return {
      success: false,
      status: 401,
      error: 'No active verification code found for this number. Please request a new one.',
    };
  }

  const now = Date.now();

  // Check expiration
  if (now > record.expiresAt) {
    otpStore.delete(phone);
    return {
      success: false,
      status: 401,
      error: 'Verification code has expired. Please request a new code.',
    };
  }

  // Check maximum attempts
  if (record.attempts >= MAX_VERIFICATION_ATTEMPTS) {
    otpStore.delete(phone);
    return {
      success: false,
      status: 429,
      error: 'Too many failed attempts. This verification code has been invalidated. Please request a new one.',
    };
  }

  // Compute submitted hash
  const submittedHash = hashOtp(cleanOtp, record.salt);
  const expectedBuffer = Buffer.from(record.hash, 'hex');
  const actualBuffer = Buffer.from(submittedHash, 'hex');

  // Constant-time comparison
  const isMatch =
    expectedBuffer.length === actualBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, actualBuffer);

  if (!isMatch) {
    record.attempts += 1;
    if (record.attempts >= MAX_VERIFICATION_ATTEMPTS) {
      otpStore.delete(phone);
      return {
        success: false,
        status: 429,
        error: 'Too many failed attempts. This verification code has been invalidated. Please request a new one.',
      };
    }
    const remaining = MAX_VERIFICATION_ATTEMPTS - record.attempts;
    return {
      success: false,
      status: 401,
      error: `Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
    };
  }

  // SUCCESS: Burn OTP immediately (single-use guarantee)
  otpStore.delete(phone);

  return {
    success: true,
    status: 200,
  };
};

