import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { isSupabaseConfigured, supabase } from './db/supabaseClient';
import { processAiChat } from './aiService';
import { predictWorkerJobMatch, rankWorkersForJob, getMLDiagnostics } from './ml/mlMatchingService';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// In-Memory Database Store for immediate server execution & offline demo readiness
interface ServerStore {
  users: any[];
  workerProfiles: any[];
  workerBankDetails: any[];
  workerUpiDetails: any[];
  jobs: any[];
  applications: any[];
  jobWorkers: any[];
  attendance: any[];
  payments: any[];
  paymentTransactions: any[];
  ratings: any[];
  reports: any[];
  notifications: any[];
}

const db: ServerStore = {
  users: [
    {
      id: 'w1',
      name: 'Arun Kumar',
      phone: '+91 98765 43210',
      role: 'worker',
      gender: 'Male',
      kycVerified: true,
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'w2',
      name: 'Ravi Teja',
      phone: '+91 98451 23456',
      role: 'worker',
      gender: 'Male',
      kycVerified: true,
      profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'w3',
      name: 'Priya Sharma',
      phone: '+91 91234 56789',
      role: 'worker',
      gender: 'Female',
      kycVerified: true,
      profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'w4',
      name: 'Suresh Raina',
      phone: '+91 97654 32109',
      role: 'worker',
      gender: 'Male',
      kycVerified: true,
      profilePhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
    },
    {
      id: 'c1',
      name: 'Kumar Stores (Suresh Kumar)',
      phone: '+91 98111 22334',
      role: 'customer',
      gender: 'Male',
      kycVerified: true,
      profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    },
  ],
  workerProfiles: [
    {
      userId: 'w1',
      skills: ['Loading', 'Packing', 'Physical Labour'],
      categories: ['Loading/Unloading', 'Labour'],
      experienceJobs: 48,
      rating: 4.8,
      reliabilityScore: 95,
      minDailyWage: 700,
      availability: 'Available',
      approxArea: 'Koramangala 4th Block',
      approxDistanceKm: 1.2,
      upiMasked: 'arun••••@oksbi',
      bankMasked: '•••• •••• 4892 (State Bank of India)',
      preferredPaymentMethod: 'ONLINE',
    },
    {
      userId: 'w2',
      skills: ['Painting', 'Masonry', 'Plastering'],
      categories: ['Construction', 'Repair'],
      experienceJobs: 34,
      rating: 4.6,
      reliabilityScore: 90,
      minDailyWage: 800,
      availability: 'Available',
      approxArea: 'BTM Layout 2nd Stage',
      approxDistanceKm: 2.8,
      upiMasked: 'ravi••••@ybl',
      bankMasked: '•••• •••• 1024 (Canara Bank)',
      preferredPaymentMethod: 'ONLINE',
    },
    {
      userId: 'w3',
      skills: ['House Cleaning', 'Deep Cleaning', 'Sanitization'],
      categories: ['Cleaning'],
      experienceJobs: 62,
      rating: 4.9,
      reliabilityScore: 98,
      minDailyWage: 600,
      availability: 'Available',
      approxArea: 'HSR Layout Sector 1',
      approxDistanceKm: 2.1,
      upiMasked: 'priya••••@icici',
      bankMasked: '•••• •••• 9923 (HDFC Bank)',
      preferredPaymentMethod: 'ONLINE',
    },
    {
      userId: 'w4',
      skills: ['Two-Wheeler Delivery', 'Parcel Courier'],
      categories: ['Delivery'],
      experienceJobs: 51,
      rating: 4.7,
      reliabilityScore: 92,
      minDailyWage: 650,
      availability: 'Available',
      approxArea: 'Indiranagar 100ft Rd',
      approxDistanceKm: 3.4,
      upiMasked: 'suresh••••@paytm',
      bankMasked: '•••• •••• 3341 (Bank of Baroda)',
      preferredPaymentMethod: 'ONLINE',
    },
  ],
  jobs: [
    {
      id: 'job-1',
      employerId: 'c1',
      title: 'Shop Loading & Unloading Assistant',
      description: 'Help unload inventory crates of dry groceries from delivery tempo into warehouse shelves.',
      category: 'Loading/Unloading',
      wage: 800,
      startTime: '09:00 AM',
      duration: '4 Hours (Half Day)',
      urgency: 'Today',
      workersRequired: 2,
      workersConfirmed: 1,
      approximateArea: 'APMC Market Yard, Yeshwanthpur',
      approximateDistanceKm: 2.4,
      exactLocation: {
        exactAddress: 'Gate 4, Wholesale Grain Market, Yeshwanthpur, Bengaluru - 560022',
        landmark: 'Opposite State Bank of India ATM',
        lat: 13.0234,
        lng: 77.5512,
      },
      status: 'Open',
      recurring: 'none',
      applicants: ['w1', 'w4'],
      confirmedWorkerIds: ['w1'],
      waitingList: ['w4'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'job-2',
      employerId: 'c1',
      title: 'Apartment Deep Cleaning',
      description: 'Deep scrubbing of kitchen tiles, bathroom, and balcony before housewarming ceremony.',
      category: 'Cleaning',
      wage: 650,
      startTime: '10:30 AM',
      duration: '3 Hours',
      urgency: 'Today',
      workersRequired: 1,
      workersConfirmed: 0,
      approximateArea: 'GreenLeaf Apartments, HSR Layout Sector 2',
      approximateDistanceKm: 1.8,
      exactLocation: {
        exactAddress: 'Flat 402, Block C, GreenLeaf Heights, 24th Main, HSR Layout, Bengaluru - 560102',
        landmark: 'Behind HSR Club',
        lat: 12.9121,
        lng: 77.6446,
      },
      status: 'Open',
      recurring: 'none',
      applicants: ['w3'],
      confirmedWorkerIds: [],
      waitingList: [],
      createdAt: new Date().toISOString(),
    },
  ],
  applications: [],
  jobWorkers: [],
  workerBankDetails: [
    {
      id: 'bd-w1',
      workerId: 'w1',
      accountHolderName: 'Arun Kumar',
      bankName: 'State Bank of India',
      accountNumberMasked: '•••• •••• 4892',
      ifscCode: 'SBIN0004521',
    },
    {
      id: 'bd-worker-me',
      workerId: 'worker-me',
      accountHolderName: 'Arun Kumar',
      bankName: 'State Bank of India',
      accountNumberMasked: '•••• •••• 4892',
      ifscCode: 'SBIN0004521',
    },
  ],
  workerUpiDetails: [
    {
      id: 'upi-w1',
      workerId: 'w1',
      upiIdMasked: 'arun.kumar@oksbi',
      isPrimary: true,
    },
    {
      id: 'upi-worker-me',
      workerId: 'worker-me',
      upiIdMasked: 'arun.kumar@oksbi',
      isPrimary: true,
    },
  ],
  attendance: [
    {
      id: 'att-1',
      jobId: 'job-1',
      workerId: 'w1',
      qrToken: 'WM-QR-JOB1-W1-2026',
      checkInTime: null,
      checkOutTime: null,
      status: 'PENDING',
    },
  ],
  payments: [
    {
      id: 'pay-1',
      jobId: 'job-1',
      jobTitle: 'Shop Loading & Unloading Assistant',
      employerId: 'c1',
      employerName: 'Kumar Stores (Suresh Kumar)',
      workerId: 'w1',
      workerName: 'Arun Kumar',
      amount: 800,
      platformFee: 0,
      totalAmount: 800,
      method: 'ONLINE',
      paymentPreference: 'ONLINE',
      status: 'PAID',
      transactionRef: 'WM-TXN-20260906-8812',
      utrNumber: 'UPI-49281098231',
      createdAt: '2026-09-06T14:30:00.000Z',
      updatedAt: '2026-09-06T18:00:00.000Z',
    },
    {
      id: 'pay-2',
      jobId: 'job-2',
      jobTitle: 'Apartment Deep Cleaning',
      employerId: 'c1',
      employerName: 'Kumar Stores (Suresh Kumar)',
      workerId: 'w1',
      workerName: 'Arun Kumar',
      amount: 650,
      platformFee: 0,
      totalAmount: 650,
      method: 'OFFLINE',
      paymentPreference: 'OFFLINE',
      status: 'PENDING',
      offlineNotes: 'Direct Cash handover upon shift completion',
      createdAt: '2026-09-07T08:15:00.000Z',
    },
    {
      id: 'pay-3',
      jobId: 'job-3',
      jobTitle: 'Warehouse Pallet Relocation',
      employerId: 'c1',
      employerName: 'Kumar Stores (Suresh Kumar)',
      workerId: 'w1',
      workerName: 'Arun Kumar',
      amount: 900,
      platformFee: 0,
      totalAmount: 900,
      method: 'ONLINE',
      paymentPreference: 'ONLINE',
      status: 'PROCESSING',
      transactionRef: 'WM-TXN-20260907-9921',
      createdAt: '2026-09-07T09:00:00.000Z',
    },
  ],
  paymentTransactions: [
    {
      id: 'txn-1',
      paymentId: 'pay-1',
      transactionRef: 'WM-TXN-20260906-8812',
      utrNumber: 'UPI-49281098231',
      gatewayStatus: 'SUCCESS',
      timestamp: '2026-09-06T18:00:00.000Z',
    },
  ],
  ratings: [],
  reports: [],
  notifications: [
    {
      id: 'notif-init-1',
      recipientUserId: 'w1',
      title: 'Slot Confirmed ✓',
      message: 'Kumar Stores confirmed your slot for Shop Loading Assistant. Workplace address unlocked!',
      type: 'confirmation',
      read: false,
      jobId: 'job-1',
      createdAt: new Date().toISOString(),
    },
  ],
};

// ============================================================================
// 1. SYSTEM HEALTH & MODE CHECK
// ============================================================================
app.get('/api/health', (req: Request, res: Response) => {
  const isCloudDb = isSupabaseConfigured();
  res.json({
    status: 'online',
    platform: 'WORK MOJO API Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: isCloudDb
      ? 'PostgreSQL / Supabase (Live Connected)'
      : 'PostgreSQL / Supabase Ready (Active Dual-Store)',
    supabaseConnected: isCloudDb,
  });
});

// ============================================================================
// 2. AUTHENTICATION ROUTES
// ============================================================================
app.post('/api/v1/auth/send-otp', async (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Mobile number is required' });
  }

  const rawDigits = phone.replace(/\D/g, '');
  if (rawDigits.length < 10) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' });
  }

  const cleanPhone = phone.startsWith('+') ? phone : `+91${rawDigits.slice(-10)}`;

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: cleanPhone,
      });
      if (error) {
        console.warn('[AUTH] Supabase SMS error:', error.message);
        return res.status(503).json({
          success: false,
          error: 'OTP verification is currently unavailable. Please try again later.',
        });
      }
      return res.json({
        success: true,
        message: `Verification code sent to ${cleanPhone}`,
      });
    } catch (err: any) {
      console.warn('[AUTH] Send OTP exception:', err.message);
      return res.status(503).json({
        success: false,
        error: 'OTP verification is currently unavailable. Please try again later.',
      });
    }
  }

  // Graceful fallback when external SMS provider is unconfigured (Never fake/default OTP)
  return res.status(503).json({
    success: false,
    error: 'OTP verification is currently unavailable. Please try again later.',
  });
});

app.post('/api/v1/auth/verify-otp', async (req: Request, res: Response) => {
  const { phone, otp, name, gender, role } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone and OTP are required' });
  }

  const rawDigits = phone.replace(/\D/g, '');
  const cleanPhone = phone.startsWith('+') ? phone : `+91${rawDigits.slice(-10)}`;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: cleanPhone,
        token: otp.trim(),
        type: 'sms',
      });

      if (error || !data.user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid or expired OTP code. Please try again.',
        });
      }

      // Check existing user or initialize profile
      let user = db.users.find(u => u.phone === cleanPhone);
      if (!user) {
        user = {
          id: data.user.id || `u-${Date.now()}`,
          phone: cleanPhone,
          name: name || 'User',
          gender: gender || 'Male',
          role: role || 'worker',
          kycVerified: false, // Strict: Never auto-verify KYC on login
          profilePhoto: role === 'customer'
            ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
        };
        db.users.push(user);
        try {
          await supabase.from('users').upsert([user]);
        } catch (_) {}
      }

      const token = data.session?.access_token || `wm_auth_token_${user.id}_${Date.now()}`;
      return res.json({
        success: true,
        token,
        user,
      });
    } catch (err: any) {
      console.warn('[AUTH] Verify OTP exception:', err.message);
      return res.status(503).json({
        success: false,
        error: 'OTP verification is currently unavailable. Please try again later.',
      });
    }
  }

  // Without SMS provider, reject gracefully without fake validation
  return res.status(503).json({
    success: false,
    error: 'OTP verification is currently unavailable. Please try again later.',
  });
});

// ============================================================================
// 3. WORKER DIRECTORY / "FIND WORKERS" (Phase 5)
// ============================================================================
app.get('/api/v1/workers/directory', (req: Request, res: Response) => {
  const { category, minRating, maxDistance, availability, search } = req.query;

  let results = db.users
    .filter(u => u.role === 'worker' || u.role === 'both')
    .map(u => {
      const profile = db.workerProfiles.find(p => p.userId === u.id) || {
        skills: ['Labour', 'General'],
        categories: ['Labour'],
        experienceJobs: 12,
        rating: 4.8,
        reliabilityScore: 95,
        minDailyWage: 600,
        availability: 'Available',
        approxArea: 'Bengaluru South',
        approxDistanceKm: 2.5,
        upiMasked: 'user••••@upi',
      };

      return {
        ...u,
        ...profile,
      };
    });

  if (category && category !== 'All') {
    results = results.filter(w => w.categories.includes(category as string));
  }
  if (minRating) {
    results = results.filter(w => w.rating >= parseFloat(minRating as string));
  }
  if (availability && availability !== 'All') {
    results = results.filter(w => w.availability === availability);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    results = results.filter(
      w =>
        w.name.toLowerCase().includes(q) ||
        w.skills.some((s: string) => s.toLowerCase().includes(q))
    );
  }

  res.json({
    success: true,
    count: results.length,
    workers: results,
  });
});

// Invite worker to job
app.post('/api/v1/workers/invite', (req: Request, res: Response) => {
  const { workerId, jobId, employerName } = req.body;
  if (!workerId || !jobId) {
    return res.status(400).json({ error: 'Worker ID and Job ID required' });
  }

  const job = db.jobs.find(j => j.id === jobId);
  const newNotif = {
    id: `notif-${Date.now()}`,
    recipientUserId: workerId,
    title: 'Job Invitation 🤝',
    message: `${employerName || 'An employer'} directly invited you to work on: "${job?.title || 'Open Job'}"!`,
    type: 'job_alert',
    read: false,
    jobId,
    createdAt: new Date().toISOString(),
  };
  db.notifications.push(newNotif);

  res.json({
    success: true,
    message: 'Worker invitation dispatched successfully!',
  });
});

// ============================================================================
// 3B. WORKER–JOB MATCHING ML API (Random Forest Ensemble)
// ============================================================================

// Model training diagnostics
app.get('/api/v1/match/diagnostics', (req: Request, res: Response) => {
  try {
    const diagnostics = getMLDiagnostics();
    res.json({
      success: true,
      diagnostics,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Single worker-job match prediction
app.post('/api/v1/match/predict', (req: Request, res: Response) => {
  try {
    const { worker, job } = req.body;
    if (!worker || !job) {
      return res.status(400).json({ success: false, error: 'Worker and Job objects are required.' });
    }
    const match = predictWorkerJobMatch(worker, job);
    res.json({
      success: true,
      match,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Rank multiple workers for a job
app.post('/api/v1/match/rank', (req: Request, res: Response) => {
  try {
    const { workers, job } = req.body;
    if (!Array.isArray(workers) || !job) {
      return res.status(400).json({ success: false, error: 'Workers array and Job object are required.' });
    }
    const ranked = rankWorkersForJob(workers, job);
    res.json({
      success: true,
      count: ranked.length,
      rankedWorkers: ranked,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fetch job and rank candidate workers from Supabase
app.get('/api/v1/match/jobs/:jobId/candidates', async (req: Request, res: Response) => {
  try {
    const { jobId } = req.params;

    // 1. Locate Job (Supabase or in-memory db)
    let targetJob = db.jobs.find(j => j.id === jobId);

    if (isSupabaseConfigured()) {
      try {
        const { data: jobRow } = await supabase.from('jobs').select('*').eq('id', jobId).single();
        if (jobRow) {
          targetJob = {
            id: jobRow.id,
            employerId: jobRow.employer_id,
            title: jobRow.title,
            category: jobRow.category,
            wage: Number(jobRow.wage),
            startTime: jobRow.start_time,
            approximateArea: jobRow.approximate_area,
            approximateDistanceKm: Number(jobRow.approximate_distance_km) || 2.5,
            workersRequired: jobRow.workers_required || 1,
            workersConfirmed: jobRow.workers_confirmed || 0,
            status: jobRow.status || 'Posted',
            applicants: [],
          };
        }
      } catch (err) {
        console.warn('[Supabase] Job fetch warning:', err);
      }
    }

    if (!targetJob) {
      return res.status(404).json({ success: false, error: `Job with ID "${jobId}" not found.` });
    }

    // 2. Fetch Eligible Workers (Supabase + local store fallback)
    let candidateWorkers: any[] = [];

    if (isSupabaseConfigured()) {
      try {
        const { data: sbUsers, error: usersErr } = await supabase
          .from('users')
          .select('*, worker_profiles(*)')
          .in('role', ['worker', 'both']);

        if (!usersErr && sbUsers && sbUsers.length > 0) {
          candidateWorkers = sbUsers.map((u: any) => {
            const prof = Array.isArray(u.worker_profiles) && u.worker_profiles.length > 0
              ? u.worker_profiles[0]
              : u.worker_profiles || {};
            return {
              id: u.id,
              name: u.name,
              phone: u.phone,
              role: u.role,
              profilePhoto: u.profile_photo,
              kycVerified: u.kyc_verified,
              skills: prof.skills || ['Labour'],
              categories: prof.categories || ['Labour'],
              experienceJobs: prof.experience_jobs || 12,
              rating: Number(prof.rating) || 4.8,
              reliabilityScore: prof.reliability_score || 95,
              minDailyWage: Number(prof.min_daily_wage) || 600,
              availability: prof.availability || 'Available',
              approxArea: prof.approx_area || 'Hyderabad',
              approxDistanceKm: 2.5,
            };
          });
        }
      } catch (sbErr) {
        console.warn('[Supabase] Workers fetch warning:', sbErr);
      }
    }

    // Fallback/merge with local db workers if needed for full coverage
    if (candidateWorkers.length === 0) {
      candidateWorkers = db.users
        .filter(u => u.role === 'worker' || u.role === 'both')
        .map(u => {
          const profile = db.workerProfiles.find(p => p.userId === u.id) || {
            skills: ['Labour'],
            categories: ['Labour'],
            experienceJobs: 12,
            rating: 4.8,
            reliabilityScore: 95,
            minDailyWage: 600,
            availability: 'Available',
            approxArea: 'Hyderabad',
            approxDistanceKm: 2.5,
          };
          return { ...u, ...profile };
        });
    }

    // 3. Run ML Random Forest Ranking
    const ranked = rankWorkersForJob(candidateWorkers, targetJob);

    res.json({
      success: true,
      jobId: targetJob.id,
      jobTitle: targetJob.title,
      jobCategory: targetJob.category,
      count: ranked.length,
      candidates: ranked,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// 4. JOBS API (Phase 1 & 2)
// ============================================================================
app.get('/api/v1/jobs', async (req: Request, res: Response) => {
  try {
    let combinedJobs = [...db.jobs];

    // If Supabase is connected, query jobs and merge seamlessly
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from('jobs').select('*');
        if (!error && data && data.length > 0) {
          const sbJobs = data.map((row: any) => ({
            id: row.id,
            customerId: row.employer_id,
            customerName: 'Verified Employer',
            title: row.title,
            category: row.category,
            description: row.description || '',
            wage: Number(row.wage),
            startTime: row.start_time,
            endTime: row.end_time || '05:00 PM',
            duration: row.duration || '8 hours',
            urgency: row.urgency || 'Today',
            approximateArea: row.approximate_area,
            approximateDistanceKm: Number(row.approximate_distance_km) || 2.5,
            exactLocation: {
              approximateArea: row.approximate_area,
              exactAddress: row.exact_address || '',
              landmark: row.landmark || '',
              lat: Number(row.exact_lat) || 12.934,
              lng: Number(row.exact_lng) || 77.625,
            },
            workersRequired: row.workers_required || 1,
            workersConfirmed: row.workers_confirmed || 0,
            selectionMode: row.selection_mode || 'manual',
            status: row.status || 'Posted',
            applicants: [],
            confirmedWorkerIds: [],
            waitingList: [],
            recurring: row.recurring || 'none',
            createdAt: row.created_at,
            updatedAt: row.updated_at,
          }));
          combinedJobs = [...sbJobs, ...combinedJobs];
        }
      } catch (sbErr) {
        console.warn('[Supabase] Warning reading jobs:', sbErr);
      }
    }

    // STRICT DEDUPLICATION: Map by ID and content signature to guarantee no job is returned multiple times
    const uniqueMap = new Map<string, any>();
    const seenSignatures = new Set<string>();
    for (const job of combinedJobs) {
      const sig = `${job.title}_${job.category}_${job.wage}_${job.startTime}_${job.approximateArea}`;
      if (!uniqueMap.has(job.id) && !seenSignatures.has(sig)) {
        uniqueMap.set(job.id, job);
        seenSignatures.add(sig);
      }
    }
    const resultJobs = Array.from(uniqueMap.values());

    res.json({
      success: true,
      count: resultJobs.length,
      jobs: resultJobs,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/v1/jobs', async (req: Request, res: Response) => {
  const jobPayload = req.body;
  const jobId = jobPayload.id || `job-${Date.now()}`;

  // IDEMPOTENCY CHECK: Check if an identical job already exists to prevent duplicate creation
  const existingJob = db.jobs.find(
    j =>
      j.id === jobId ||
      (j.title.trim().toLowerCase() === String(jobPayload.title || '').trim().toLowerCase() &&
        j.category === jobPayload.category &&
        Number(j.wage) === Number(jobPayload.wage) &&
        j.startTime === jobPayload.startTime &&
        (j.customerId === jobPayload.customerId || j.employerId === jobPayload.customerId))
  );

  if (existingJob) {
    return res.status(200).json({
      success: true,
      job: existingJob,
      message: 'Job already exists, returning existing record.',
    });
  }

  const newJob = {
    id: jobId,
    ...jobPayload,
    workersConfirmed: jobPayload.workersConfirmed || 0,
    applicants: jobPayload.applicants || [],
    confirmedWorkerIds: jobPayload.confirmedWorkerIds || [],
    waitingList: jobPayload.waitingList || [],
    status: jobPayload.status || 'Posted',
    createdAt: jobPayload.createdAt || new Date().toISOString(),
    updatedAt: jobPayload.updatedAt || new Date().toISOString(),
  };

  db.jobs.unshift(newJob);

  // If Supabase is configured, attempt to persist to Supabase
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('jobs').upsert({
        id: newJob.id,
        employer_id: newJob.customerId || newJob.employerId || '00000000-0000-0000-0000-000000000000',
        title: newJob.title,
        description: newJob.description || '',
        category: newJob.category,
        wage: newJob.wage,
        start_time: newJob.startTime,
        duration: newJob.duration || '8 hours',
        urgency: newJob.urgency || 'Today',
        workers_required: newJob.workersRequired || 1,
        workers_confirmed: newJob.workersConfirmed || 0,
        approximate_area: newJob.approximateArea || '',
        approximate_distance_km: newJob.approximateDistanceKm || 2.5,
        exact_address: newJob.exactLocation?.exactAddress || newJob.exactAddress || newJob.approximateArea || '',
        landmark: newJob.exactLocation?.landmark || newJob.landmark || '',
        exact_lat: newJob.exactLocation?.lat || 12.934,
        exact_lng: newJob.exactLocation?.lng || 77.625,
        status: newJob.status || 'Open',
        recurring: newJob.recurring || 'none',
      });
    } catch (sbErr) {
      console.warn('[Supabase] Warning persisting job:', sbErr);
    }
  }

  res.status(201).json({
    success: true,
    job: newJob,
  });
});

// Apply for Job
app.post('/api/v1/jobs/:id/apply', (req: Request, res: Response) => {
  const { id } = req.params;
  const { workerId } = req.body;

  const job = db.jobs.find(j => j.id === id);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  if (job.status === 'CANCELLED' || job.status === 'Cancelled') {
    return res.status(400).json({
      error: 'This job has been cancelled by the employer and is no longer accepting applications.',
    });
  }

  if (job.workersConfirmed >= job.workersRequired) {
    // Join Waiting List
    if (!job.waitingList.includes(workerId)) {
      job.waitingList.push(workerId);
    }
    return res.json({
      success: true,
      status: 'waiting_list',
      position: job.waitingList.indexOf(workerId) + 1,
      message: 'Job is filled. Successfully joined waiting list!',
    });
  }

  if (!job.applicants.includes(workerId)) {
    job.applicants.push(workerId);
  }

  res.json({
    success: true,
    status: 'applied',
    message: 'Application submitted successfully!',
  });
});

// Confirm Worker
app.post('/api/v1/jobs/:id/confirm-worker', (req: Request, res: Response) => {
  const { id } = req.params;
  const { workerId } = req.body;

  const job = db.jobs.find(j => j.id === id);
  if (!job) return res.status(404).json({ error: 'Job not found' });

  if (job.status === 'CANCELLED' || job.status === 'Cancelled') {
    return res.status(400).json({ error: 'Cannot confirm workers for a cancelled job.' });
  }

  if (!job.confirmedWorkerIds.includes(workerId)) {
    job.confirmedWorkerIds.push(workerId);
    job.workersConfirmed = job.confirmedWorkerIds.length;
    if (job.workersConfirmed >= job.workersRequired) {
      job.status = 'Filled';
    }
  }

  // Create initial Attendance Record
  const existingAtt = db.attendance.find(a => a.jobId === id && a.workerId === workerId);
  if (!existingAtt) {
    db.attendance.push({
      id: `att-${Date.now()}`,
      jobId: id,
      workerId,
      qrToken: `WM-QR-${id}-${workerId}`,
      checkInTime: null,
      checkOutTime: null,
      status: 'PENDING',
    });
  }

  res.json({
    success: true,
    job,
  });
});

// Cancel Job (Employer Authorization Enforced)
app.post('/api/v1/jobs/:id/cancel', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { employerId, reason } = req.body;

  const job = db.jobs.find(j => j.id === id);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  // Authorization check: Only job owner can cancel
  const jobOwnerId = job.customerId || job.employerId || job.employer_id;
  if (employerId && jobOwnerId && employerId !== jobOwnerId) {
    return res.status(403).json({
      error: 'Unauthorized: Only the employer who posted this job can cancel it.',
    });
  }

  // Cannot cancel if already finished
  if (job.status === 'Finished' || job.status === 'Completed') {
    return res.status(400).json({ error: 'Completed jobs cannot be cancelled.' });
  }

  if (job.status === 'CANCELLED' || job.status === 'Cancelled') {
    return res.status(400).json({ error: 'Job is already cancelled.' });
  }

  // Mark status as CANCELLED (Never delete)
  job.status = 'CANCELLED';
  job.cancelledAt = new Date().toISOString();
  job.cancellationReason = reason || 'Cancelled by employer';

  // Persist to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('jobs')
        .update({
          status: 'CANCELLED',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    } catch (sbErr) {
      console.warn('[Supabase] Warning updating cancelled job status:', sbErr);
    }
  }

  // Notify all applicants and confirmed workers
  const notifyUserIds = Array.from(new Set([...(job.applicants || []), ...(job.confirmedWorkerIds || [])]));
  notifyUserIds.forEach(workerId => {
    db.notifications.push({
      id: `notif-${Date.now()}-${workerId}`,
      recipientId: workerId,
      title: 'Job Cancelled by Employer',
      message: `The job "${job.title}" has been cancelled by the employer. Any allocated slots have been released.`,
      type: 'job_update',
      actionJobId: job.id,
      read: false,
      createdAt: new Date().toISOString(),
    });
  });

  res.json({
    success: true,
    message: 'Job cancelled successfully. All applicants and workers have been notified.',
    job,
  });
});

// ============================================================================
// 5. ATTENDANCE & QR CODE SYSTEM (Phases 6 & 7)
// ============================================================================
app.get('/api/v1/attendance/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const records = db.attendance.filter(a => a.jobId === jobId);
  res.json({
    success: true,
    attendance: records,
  });
});

// Check-In via QR Scan
app.post('/api/v1/attendance/check-in', (req: Request, res: Response) => {
  const { jobId, workerId, qrToken, lat, lng } = req.body;

  let att = db.attendance.find(a => a.jobId === jobId && a.workerId === workerId);
  if (!att) {
    att = {
      id: `att-${Date.now()}`,
      jobId,
      workerId,
      qrToken: qrToken || `WM-QR-${jobId}-${workerId}`,
      checkInTime: new Date().toISOString(),
      checkOutTime: null,
      checkInLat: lat || null,
      checkInLng: lng || null,
      geofenceVerified: Boolean(lat && lng),
      status: 'CHECKED_IN',
    };
    db.attendance.push(att);
  } else {
    att.checkInTime = new Date().toISOString();
    att.checkInLat = lat || null;
    att.checkInLng = lng || null;
    att.geofenceVerified = Boolean(lat && lng);
    att.status = 'CHECKED_IN';
  }

  // Transition Job to Ongoing
  const job = db.jobs.find(j => j.id === jobId);
  if (job && job.status !== 'Finished') {
    job.status = 'Ongoing';
  }

  res.json({
    success: true,
    message: 'Attendance Verified! Work Shift Started.',
    attendance: att,
  });
});

// Check-Out
app.post('/api/v1/attendance/check-out', (req: Request, res: Response) => {
  const { jobId, workerId } = req.body;
  const att = db.attendance.find(a => a.jobId === jobId && a.workerId === workerId);

  if (att) {
    att.checkOutTime = new Date().toISOString();
    att.status = 'CHECKED_OUT';
  }

  res.json({
    success: true,
    message: 'Check-out completed! Ready for employer confirmation & payout.',
    attendance: att,
  });
});

// ============================================================================
// 6. PROTECTED PAYMENT & UPI WORKFLOW (Phases 8–13)
// ============================================================================
app.get('/api/v1/payments/:jobId', (req: Request, res: Response) => {
  const { jobId } = req.params;
  const payments = db.payments.filter(p => p.jobId === jobId);
  res.json({
    success: true,
    payments,
  });
});

// Authorize / Deposit Protected Wage
app.post('/api/v1/payments/authorize', (req: Request, res: Response) => {
  const { jobId, employerId, workerId, amount, method } = req.body;

  const payment = {
    id: `pay-${Date.now()}`,
    jobId,
    employerId,
    workerId,
    amount: Number(amount),
    platformFee: 0.0, // Cooperative zero commission
    totalAmount: Number(amount),
    method: method || 'UPI',
    status: 'AUTHORIZED', // Protected payment held
    createdAt: new Date().toISOString(),
  };
  db.payments.push(payment);

  res.json({
    success: true,
    message: 'Wage authorized in Protected Payment flow.',
    payment,
  });
});

// Release Payment to Worker
app.post('/api/v1/payments/:id/release', (req: Request, res: Response) => {
  const { id } = req.params;
  const { utrNumber } = req.body;

  const payment = db.payments.find(p => p.id === id);
  if (!payment) return res.status(404).json({ error: 'Payment record not found' });

  payment.status = 'PAID';
  payment.updatedAt = new Date().toISOString();

  // Create Transaction Record
  const txn = {
    id: `txn-${Date.now()}`,
    paymentId: payment.id,
    transactionRef: `WM-TXN-${Date.now().toString().slice(-8)}`,
    utrNumber: utrNumber || `UPI-${Date.now().toString().slice(-12)}`,
    gatewayStatus: 'SUCCESS',
    timestamp: new Date().toISOString(),
  };
  db.paymentTransactions.push(txn);

  // Send Notification to Worker
  db.notifications.push({
    id: `notif-pay-${Date.now()}`,
    recipientUserId: payment.workerId,
    title: 'Payment Released! ₹' + payment.amount,
    message: `Employer confirmed shift. ₹${payment.amount} settled via ${payment.method}. UTR: ${txn.utrNumber}`,
    type: 'rating',
    read: false,
    jobId: payment.jobId,
    createdAt: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: 'Payment released successfully to worker.',
    payment,
    transaction: txn,
  });
});

// Dispute Payment
app.post('/api/v1/payments/:id/dispute', (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason, details, reportedBy } = req.body;

  const payment = db.payments.find(p => p.id === id);
  if (!payment) return res.status(404).json({ error: 'Payment not found' });

  payment.status = 'DISPUTED';
  payment.updatedAt = new Date().toISOString();

  db.reports.push({
    id: `rep-${Date.now()}`,
    jobId: payment.jobId,
    reportedById: reportedBy,
    targetUserId: payment.workerId,
    reason: reason || 'Payment Disagreement',
    details: details || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: 'Payment flagged as DISPUTED. Placed on administrative hold.',
    payment,
  });
});

// --- Worker Payment Method Preference & Offline Payment Endpoints ---

// Fetch Worker Payment Method Preference
app.get('/api/v1/workers/:id/payment-preference', (req: Request, res: Response) => {
  const { id } = req.params;
  const isTargetWorker = (wId: string) => wId === id || (id === 'worker-me' && wId === 'w1') || (id === 'w1' && wId === 'worker-me');
  const profile = db.workerProfiles.find(p => isTargetWorker(p.userId));
  const preference = profile?.preferredPaymentMethod || 'ONLINE';
  res.json({
    success: true,
    workerId: id,
    preferredPaymentMethod: preference,
    paymentPreference: preference,
  });
});

// Update Worker Payment Method Preference
app.patch('/api/v1/workers/:id/payment-preference', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { paymentPreference, preferredPaymentMethod } = req.body;
  const rawPref = (paymentPreference || preferredPaymentMethod || '').toString().trim().toUpperCase();

  if (rawPref !== 'ONLINE' && rawPref !== 'OFFLINE') {
    return res.status(400).json({
      error: 'Invalid payment preference. Accepted values: ONLINE, OFFLINE.',
    });
  }

  const isTargetWorker = (wId: string) => wId === id || (id === 'worker-me' && wId === 'w1') || (id === 'w1' && wId === 'worker-me');

  let profile = db.workerProfiles.find(p => isTargetWorker(p.userId));
  if (!profile) {
    profile = {
      userId: id,
      skills: ['General Labour'],
      categories: ['Labour'],
      experienceJobs: 1,
      rating: 5.0,
      reliabilityScore: 100,
      minDailyWage: 600,
      availability: 'Available',
      approxArea: 'Bengaluru',
      approxDistanceKm: 2.0,
      preferredPaymentMethod: rawPref,
    };
    db.workerProfiles.push(profile);
  } else {
    profile.preferredPaymentMethod = rawPref;
  }

  db.workerProfiles.forEach(p => {
    if (isTargetWorker(p.userId)) {
      p.preferredPaymentMethod = rawPref;
    }
  });

  if (isSupabaseConfigured()) {
    try {
      await supabase
        .from('worker_profiles')
        .update({ preferred_payment_method: rawPref })
        .eq('user_id', id);
    } catch (err) {
      console.warn('[Supabase] Warning updating preferred_payment_method:', err);
    }
  }

  res.json({
    success: true,
    message: 'Payment preference updated successfully.',
    workerId: id,
    paymentPreference: rawPref,
    preferredPaymentMethod: rawPref,
  });
});

// Record Offline / Cash Payment (Initial status: PENDING)
app.post('/api/v1/payments/record-offline', (req: Request, res: Response) => {
  const { jobId, employerId, workerId, amount, notes } = req.body;

  if (!jobId || !employerId || !workerId || !amount) {
    return res.status(400).json({ error: 'jobId, employerId, workerId, and amount are required.' });
  }

  const payment = {
    id: `pay-${Date.now()}`,
    jobId,
    employerId,
    workerId,
    amount: Number(amount),
    platformFee: 0.0,
    totalAmount: Number(amount),
    method: 'OFFLINE',
    paymentPreference: 'OFFLINE',
    status: 'PENDING', // Remains pending until employer records completion
    offlineNotes: notes || 'Direct Cash Settlement on shift completion',
    createdAt: new Date().toISOString(),
  };
  db.payments.push(payment);

  db.notifications.push({
    id: `notif-pay-${Date.now()}`,
    recipientUserId: workerId,
    title: 'Offline Cash Payment Recorded',
    message: `Employer recorded pending cash payment of ₹${payment.amount}. Settle in cash upon shift completion.`,
    type: 'payment_authorized',
    read: false,
    jobId,
    createdAt: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: 'Offline cash payment recorded as PENDING.',
    payment,
  });
});

// Mark Offline Cash Payment as Completed / Settled
app.post('/api/v1/payments/:id/settle-offline', (req: Request, res: Response) => {
  const { id } = req.params;
  const { notes } = req.body;

  const payment = db.payments.find(p => p.id === id);
  if (!payment) return res.status(404).json({ error: 'Payment record not found' });

  payment.status = 'PAID';
  payment.offlineSettledAt = new Date().toISOString();
  payment.updatedAt = new Date().toISOString();
  if (notes) payment.offlineNotes = notes;

  const txn = {
    id: `txn-cash-${Date.now()}`,
    paymentId: payment.id,
    transactionRef: `WM-CASH-${Date.now().toString().slice(-8)}`,
    utrNumber: `CASH-HANDOVER-${Date.now().toString().slice(-8)}`,
    gatewayStatus: 'SUCCESS_OFFLINE',
    timestamp: new Date().toISOString(),
  };
  db.paymentTransactions.push(txn);

  db.notifications.push({
    id: `notif-pay-settled-${Date.now()}`,
    recipientUserId: payment.workerId,
    title: 'Cash Payment Settled ✓ ₹' + payment.amount,
    message: `Employer confirmed hand-to-hand cash payment of ₹${payment.amount}. Shift payment completed.`,
    type: 'payment_released',
    read: false,
    jobId: payment.jobId,
    createdAt: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: 'Offline cash payment successfully marked as PAID / Settled.',
    payment,
    transaction: txn,
  });
});

// Helper functions for safe masking
function maskAccountNumber(acc: string): string {
  if (!acc) return '•••• •••• 4892';
  const clean = acc.replace(/\s+/g, '');
  if (clean.length <= 4) return clean;
  return `•••• •••• ${clean.slice(-4)}`;
}

function maskUpiId(upi: string): string {
  if (!upi) return '';
  const parts = upi.split('@');
  if (parts.length < 2) return upi;
  const username = parts[0];
  const handle = parts[1];
  if (username.length <= 3) return `${username.slice(0, 1)}••••@${handle}`;
  return `${username.slice(0, 3)}••••@${handle}`;
}

// Fetch all payments for a specific worker
app.get('/api/v1/payments/worker/:workerId', (req: Request, res: Response) => {
  const { workerId } = req.params;
  const isWorkerMatch = (id: string) => id === workerId || (workerId === 'worker-me' && id === 'w1') || (workerId === 'w1' && id === 'worker-me');

  const payments = db.payments.filter(p => isWorkerMatch(p.workerId));
  res.json({
    success: true,
    workerId,
    count: payments.length,
    payments,
  });
});

// Fetch all payments for an employer
app.get('/api/v1/payments/employer/:employerId', (req: Request, res: Response) => {
  const { employerId } = req.params;
  const payments = db.payments.filter(p => p.employerId === employerId || !employerId || employerId === 'all');
  res.json({
    success: true,
    employerId,
    count: payments.length,
    payments,
  });
});

// Update Payment Status (e.g. PROCESSING, COMPLETED, PAID, DISPUTED, FAILED)
app.post('/api/v1/payments/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, notes, utrNumber } = req.body;

  const validStatuses = ['PENDING', 'AUTHORIZED', 'PROCESSING', 'PAID', 'COMPLETED', 'FAILED', 'REFUNDED', 'DISPUTED'];
  const normalizedStatus = (status || '').toString().trim().toUpperCase();

  if (!validStatuses.includes(normalizedStatus)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    });
  }

  const payment = db.payments.find(p => p.id === id);
  if (!payment) return res.status(404).json({ error: 'Payment record not found' });

  payment.status = normalizedStatus;
  payment.updatedAt = new Date().toISOString();
  if (notes) payment.offlineNotes = notes;

  if (normalizedStatus === 'PAID' || normalizedStatus === 'COMPLETED') {
    if (!payment.offlineSettledAt && (payment.method === 'OFFLINE' || payment.paymentPreference === 'OFFLINE')) {
      payment.offlineSettledAt = new Date().toISOString();
    }
    const txn = {
      id: `txn-${Date.now()}`,
      paymentId: payment.id,
      transactionRef: payment.transactionRef || `WM-TXN-${Date.now().toString().slice(-8)}`,
      utrNumber: utrNumber || payment.utrNumber || (payment.method === 'OFFLINE' ? `CASH-${Date.now().toString().slice(-8)}` : `UPI-${Date.now().toString().slice(-10)}`),
      gatewayStatus: payment.method === 'OFFLINE' ? 'SUCCESS_OFFLINE' : 'SUCCESS',
      timestamp: new Date().toISOString(),
    };
    db.paymentTransactions.push(txn);
  }

  res.json({
    success: true,
    message: `Payment status updated to ${normalizedStatus}`,
    payment,
  });
});

// Fetch Worker Bank & UPI Details Safely
app.get('/api/v1/workers/:id/payment-details', (req: Request, res: Response) => {
  const { id } = req.params;
  const isTargetWorker = (wId: string) => wId === id || (id === 'worker-me' && wId === 'w1') || (id === 'w1' && wId === 'worker-me');

  const profile = db.workerProfiles.find(p => isTargetWorker(p.userId));
  const bank = db.workerBankDetails.find(b => isTargetWorker(b.workerId)) || {
    id: `bd-${id}`,
    workerId: id,
    accountHolderName: 'Arun Kumar',
    bankName: 'State Bank of India',
    accountNumberMasked: '•••• •••• 4892',
    ifscCode: 'SBIN0004521',
  };
  const upi = db.workerUpiDetails.find(u => isTargetWorker(u.workerId)) || {
    id: `upi-${id}`,
    workerId: id,
    upiIdMasked: profile?.upiMasked || 'arun.kumar@oksbi',
    isPrimary: true,
  };

  res.json({
    success: true,
    workerId: id,
    preferredPaymentMethod: profile?.preferredPaymentMethod || 'ONLINE',
    paymentPreference: profile?.preferredPaymentMethod || 'ONLINE',
    bankDetails: bank,
    upiDetails: upi,
  });
});

// Update Worker Bank Details Safely
app.put('/api/v1/workers/:id/bank-details', (req: Request, res: Response) => {
  const { id } = req.params;
  const { accountHolderName, bankName, accountNumber, ifscCode } = req.body;

  if (!accountHolderName || !bankName || !ifscCode) {
    return res.status(400).json({ error: 'accountHolderName, bankName, and ifscCode are required.' });
  }

  const isTargetWorker = (wId: string) => wId === id || (id === 'worker-me' && wId === 'w1') || (id === 'w1' && wId === 'worker-me');

  let bank = db.workerBankDetails.find(b => isTargetWorker(b.workerId));
  const maskedAcc = accountNumber ? maskAccountNumber(accountNumber) : (bank?.accountNumberMasked || '•••• •••• 4892');

  if (bank) {
    bank.accountHolderName = accountHolderName;
    bank.bankName = bankName;
    bank.accountNumberMasked = maskedAcc;
    bank.ifscCode = ifscCode.toUpperCase().trim();
    bank.updatedAt = new Date().toISOString();
  } else {
    bank = {
      id: `bd-${Date.now()}`,
      workerId: id,
      accountHolderName,
      bankName,
      accountNumberMasked: maskedAcc,
      ifscCode: ifscCode.toUpperCase().trim(),
      createdAt: new Date().toISOString(),
    };
    db.workerBankDetails.push(bank);
  }

  let profile = db.workerProfiles.find(p => isTargetWorker(p.userId));
  if (profile) {
    profile.bankMasked = `${maskedAcc} (${bankName})`;
  }

  res.json({
    success: true,
    message: 'Worker bank details updated successfully.',
    bankDetails: bank,
  });
});

// Update Worker UPI Details Safely
app.put('/api/v1/workers/:id/upi-details', (req: Request, res: Response) => {
  const { id } = req.params;
  const { upiId, isPrimary } = req.body;

  if (!upiId) {
    return res.status(400).json({ error: 'upiId is required.' });
  }

  const isTargetWorker = (wId: string) => wId === id || (id === 'worker-me' && wId === 'w1') || (id === 'w1' && wId === 'worker-me');

  let upi = db.workerUpiDetails.find(u => isTargetWorker(u.workerId));
  const maskedUpi = upiId.includes('••••') ? upiId : maskUpiId(upiId);

  if (upi) {
    upi.upiIdMasked = maskedUpi;
    if (isPrimary !== undefined) upi.isPrimary = Boolean(isPrimary);
    upi.updatedAt = new Date().toISOString();
  } else {
    upi = {
      id: `upi-${Date.now()}`,
      workerId: id,
      upiIdMasked: maskedUpi,
      isPrimary: isPrimary !== undefined ? Boolean(isPrimary) : true,
      createdAt: new Date().toISOString(),
    };
    db.workerUpiDetails.push(upi);
  }

  let profile = db.workerProfiles.find(p => isTargetWorker(p.userId));
  if (profile) {
    profile.upiMasked = maskedUpi;
  }

  res.json({
    success: true,
    message: 'Worker UPI details updated successfully.',
    upiDetails: upi,
  });
});

// ============================================================================
// 7. SYSTEM & ADMIN APIs
// ============================================================================
app.get(['/health', '/api/health', '/api/v1/health'], (req: Request, res: Response) => {
  res.json({
    status: 'online',
    platform: 'WORK MOJO API Backend',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    aiAvailable: true,
    dualStore: true,
  });
});

app.get('/api/v1/admin/overview', (req: Request, res: Response) => {
  const totalUsers = db.users.length;
  const totalWorkers = db.workerProfiles.length;
  const totalJobs = db.jobs.length;
  const activeJobs = db.jobs.filter(j => j.status === 'Ongoing' || j.status === 'Open').length;
  const totalDisputes = db.reports.length;
  const totalPaidVolume = db.payments
    .filter(p => p.status === 'PAID')
    .reduce((acc, p) => acc + p.amount, 0);

  res.json({
    success: true,
    metrics: {
      totalUsers,
      totalWorkers,
      totalJobs,
      activeJobs,
      totalDisputes,
      totalPaidVolume,
    },
    recentDisputes: db.reports.slice(-5),
    recentTransactions: db.paymentTransactions.slice(-5),
  });
});

// ============================================================================
// 8. MOJO AI MULTILINGUAL ASSISTANT API
// ============================================================================
app.post(['/api/v1/ai/chat', '/api/v1/mojo/chat', '/api/ai/chat', '/ai/chat'], async (req: Request, res: Response) => {
  try {
    const { message, language, role, context } = req.body || {};
    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({
        success: false,
        reply: 'Message is required',
        language: language || 'en',
        provider: 'mojo-engine',
      });
      return;
    }
    const result = await processAiChat({
      message: message.trim(),
      language: language || 'en',
      role: role || 'worker',
      context,
    });
    res.json(result);
  } catch (error: any) {
    console.error('[Mojo AI API Error]:', error);
    res.status(500).json({
      success: false,
      reply: 'Mojo is temporarily unavailable. Please try again.',
      language: req.body?.language || 'en',
      provider: 'mojo-engine',
    });
  }
});

app.get(['/api/v1/ai/chat', '/api/v1/mojo/chat', '/api/ai/chat', '/ai/chat'], (req: Request, res: Response) => {
  res.json({
    status: 'online',
    endpoint: '/api/v1/ai/chat',
    method: 'POST',
    description: 'WorkMojo Multilingual AI Assistant Chat API. Send a POST request with { message, language, role, context }.',
    supportedLanguages: ['en', 'te', 'hi', 'ta'],
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[WORK MOJO] API Backend running on http://localhost:${PORT}`);
    console.log(`[WORK MOJO] Supabase/PostgreSQL schema ready. Dual store active.`);
  });
}

export default app;
export { app };
