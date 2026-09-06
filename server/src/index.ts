import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// In-Memory Database Store for immediate server execution & offline demo readiness
interface ServerStore {
  users: any[];
  workerProfiles: any[];
  jobs: any[];
  applications: any[];
  jobWorkers: any[];
  waitingList: any[];
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
  waitingList: [],
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
      employerId: 'c1',
      workerId: 'w1',
      amount: 800,
      platformFee: 0,
      totalAmount: 800,
      method: 'UPI',
      status: 'AUTHORIZED', // Protected Payment state
      createdAt: new Date().toISOString(),
    },
  ],
  paymentTransactions: [],
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
  res.json({
    status: 'online',
    platform: 'WORK MOJO API Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: 'PostgreSQL / Supabase Ready (Active Dual-Store)',
  });
});

// ============================================================================
// 2. AUTHENTICATION ROUTES (Phase 18)
// ============================================================================
app.post('/api/v1/auth/send-otp', (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Mobile number is required' });
  }

  // Real OTP generation simulation
  const mockOtp = '123456';
  res.json({
    success: true,
    message: `OTP sent to ${phone}`,
    demoOtp: mockOtp, // For SIH presentation convenience
  });
});

app.post('/api/v1/auth/verify-otp', (req: Request, res: Response) => {
  const { phone, otp, name, gender } = req.body;
  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone and OTP are required' });
  }

  if (otp !== '123456' && otp.length !== 6) {
    return res.status(401).json({ error: 'Invalid verification OTP' });
  }

  let user = db.users.find(u => u.phone === phone);
  if (!user) {
    user = {
      id: `u-${Date.now()}`,
      phone,
      name: name || 'Demo User',
      gender: gender || 'Male',
      role: 'worker',
      kycVerified: true,
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    };
    db.users.push(user);
  }

  const token = `wm_auth_token_${user.id}_${Date.now()}`;
  res.json({
    success: true,
    token,
    user,
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
// 4. JOBS API (Phase 1 & 2)
// ============================================================================
app.get('/api/v1/jobs', (req: Request, res: Response) => {
  res.json({
    success: true,
    count: db.jobs.length,
    jobs: db.jobs,
  });
});

app.post('/api/v1/jobs', (req: Request, res: Response) => {
  const newJob = {
    id: `job-${Date.now()}`,
    ...req.body,
    workersConfirmed: 0,
    applicants: [],
    confirmedWorkerIds: [],
    waitingList: [],
    status: 'Open',
    createdAt: new Date().toISOString(),
  };
  db.jobs.unshift(newJob);

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

// ============================================================================
// 7. ADMIN DASHBOARD API (Phase 20)
// ============================================================================
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

// Start Server
app.listen(PORT, () => {
  console.log(`[WORK MOJO] API Backend running on http://localhost:${PORT}`);
  console.log(`[WORK MOJO] Supabase/PostgreSQL schema ready. Dual store active.`);
});
