import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  User,
  Job,
  Application,
  NotificationItem,
  RatingRecord,
  ReportRecord,
  BlockRecord,
  UserRole,
  AvailabilityStatus,
  WorkCategory,
  FilterState,
  SupportedLanguage,
  WorkerPreferences,
  JobStatus,
  AttendanceRecord,
  PaymentRecord,
  DigitalReceiptData,
} from '../types';
import {
  INITIAL_CURRENT_USER,
  SEED_WORKERS,
  SEED_CUSTOMERS,
  SEED_JOBS,
  INITIAL_NOTIFICATIONS,
} from '../data/seedData';
import { calculateMatchScore } from '../services/matchingService';
import { translations, Translations } from '../data/translations';

interface AppContextType {
  // Auth & User
  user: User;
  isAuthenticated: boolean;
  onboardingStep: 'splash' | 'login' | 'otp' | 'gender' | 'kyc_intro' | 'kyc_docs' | 'live_photo' | 'kyc_verifying' | 'kyc_verified' | 'app';
  setOnboardingStep: (step: AppContextType['onboardingStep']) => void;
  loginPhone: string;
  setLoginPhone: (phone: string) => void;
  activeRole: UserRole;
  toggleRole: () => void;
  setRole: (role: UserRole) => void;
  setUserAvailability: (status: AvailabilityStatus) => void;
  updateUserPreferences: (prefs: Partial<WorkerPreferences>) => void;
  changePhoneNumber: (newPhone: string) => void;
  deleteAccount: () => void;
  completeAuthFlow: (userData?: Partial<User>) => void;

  // Language
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: Translations;

  // Jobs
  jobs: Job[];
  allWorkers: User[];
  allCustomers: User[];
  savedJobIds: string[];
  toggleSaveJob: (jobId: string) => void;
  applyToJob: (jobId: string) => { success: boolean; isWaitingList: boolean; position?: number };
  cancelConfirmedJob: (jobId: string) => void;
  createJob: (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'applicants' | 'confirmedWorkerIds' | 'waitingList' | 'workersConfirmed'>) => Job;
  confirmWorkerForJob: (jobId: string, workerId: string) => void;
  autoSelectWorkersForJob: (jobId: string) => void;
  simulateCompleteJob: (jobId: string) => void;
  rehireWorker: (workerId: string, category: WorkCategory) => void;

  // Applications
  applications: Application[];

  // Navigation & Active View
  activeScreen: string;
  setActiveScreen: (screen: string) => void;
  selectedJobId: string | null;
  setSelectedJobId: (id: string | null) => void;

  // Filters & Search
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;

  // Ratings
  ratings: RatingRecord[];
  submitRating: (jobId: string, toUserId: string, stars: number, comment?: string) => void;
  pendingRatingJob: Job | null;
  setPendingRatingJob: (job: Job | null) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => void;

  // Safety: SOS, Report, Block
  reports: ReportRecord[];
  blockedUsers: BlockRecord[];
  submitReport: (reportedUserId: string, reason: string, description: string, jobId?: string) => void;
  blockUser: (targetUserId: string) => void;
  unblockUser: (targetUserId: string) => void;
  triggerSOS: (jobId: string, note?: string) => void;

  // Attendance System (Phase 6 & 7)
  attendanceRecords: AttendanceRecord[];
  recordAttendanceCheckIn: (jobId: string, workerId: string, lat?: number, lng?: number) => void;
  recordAttendanceCheckOut: (jobId: string, workerId: string) => void;

  // Protected Payment Flow (Phases 8–13)
  payments: PaymentRecord[];
  activeReceipt: DigitalReceiptData | null;
  setActiveReceipt: (receipt: DigitalReceiptData | null) => void;
  authorizeJobPayment: (jobId: string, amount: number) => PaymentRecord;
  releaseJobPayment: (paymentId: string, utrNumber?: string) => void;
  disputeJobPayment: (paymentId: string, reason: string) => void;

  // Worker Directory Direct Invites (Phase 5)
  inviteWorkerToJob: (workerId: string, jobId: string) => void;

  // Demo Control Panel Actions
  resetDemoData: () => void;
  advanceDemoTime: (minutes: number) => void;
  triggerCancellationDemo: () => void;
  activeLiveTrackingJobId: string | null;
  setActiveLiveTrackingJobId: (id: string | null) => void;
  systemMode: 'demo' | 'production';
  toggleSystemMode: () => void;
}

const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  selectedCategories: [],
  maxDistance: 15,
  minWage: 0,
  timeSlot: 'All',
  duration: 'All',
  urgency: 'All',
  kycOnly: false,
  minRating: 0,
  skillMatchOnly: false,
  sortBy: 'Best Match',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'workmojo_v1_';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- Persistent State Initialization ---
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'user');
    return saved ? JSON.parse(saved) : INITIAL_CURRENT_USER;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'auth');
    return saved ? JSON.parse(saved) : true; // default true for instant SIH presentation, user can logout or re-onboard
  });

  const [onboardingStep, setOnboardingStep] = useState<AppContextType['onboardingStep']>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'onboardingStep');
    return saved ? (saved as any) : 'app';
  });

  const [loginPhone, setLoginPhone] = useState<string>('9876543210');
  const [activeRole, setActiveRole] = useState<UserRole>(user.role || 'worker');

  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'language');
    return (saved as SupportedLanguage) || 'en';
  });

  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'jobs');
    return saved ? JSON.parse(saved) : SEED_JOBS;
  });

  const [allWorkers, setAllWorkers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'workers');
    return saved ? JSON.parse(saved) : SEED_WORKERS;
  });

  const [allCustomers, setAllCustomers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'customers');
    return saved ? JSON.parse(saved) : SEED_CUSTOMERS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [ratings, setRatings] = useState<RatingRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'ratings');
    return saved ? JSON.parse(saved) : [];
  });

  const [reports, setReports] = useState<ReportRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'reports');
    return saved ? JSON.parse(saved) : [];
  });

  const [blockedUsers, setBlockedUsers] = useState<BlockRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'blocks');
    return saved ? JSON.parse(saved) : [];
  });

  const [savedJobIds, setSavedJobIds] = useState<string[]>(user.savedJobIds || ['job-3', 'job-5']);
  const [activeScreen, setActiveScreen] = useState<string>('home');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [pendingRatingJob, setPendingRatingJob] = useState<Job | null>(null);
  const [activeLiveTrackingJobId, setActiveLiveTrackingJobId] = useState<string | null>(null);

  // System Mode (Demo vs Production API)
  const [systemMode, setSystemMode] = useState<'demo' | 'production'>('demo');

  // Attendance Records (Phase 6 & 7)
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'attendance');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: 'att-1',
            jobId: 'job-1',
            workerId: 'w1',
            workerName: 'Arun Kumar',
            qrToken: 'WM-QR-job-1-w1',
            checkInTime: null,
            checkOutTime: null,
            status: 'PENDING',
          },
        ];
  });

  // Protected Payments (Phases 8–13)
  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'payments');
    return saved
      ? JSON.parse(saved)
      : [
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
            method: 'UPI',
            status: 'AUTHORIZED', // Protected Payment held
            isSimulatedDemo: true,
            createdAt: new Date().toISOString(),
          },
        ];
  });

  const [activeReceipt, setActiveReceipt] = useState<DigitalReceiptData | null>(null);

  const toggleSystemMode = () => {
    setSystemMode(prev => (prev === 'demo' ? 'production' : 'demo'));
  };

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'auth', JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'onboardingStep', onboardingStep);
  }, [onboardingStep]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'ratings', JSON.stringify(ratings));
  }, [ratings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'reports', JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'blocks', JSON.stringify(blockedUsers));
  }, [blockedUsers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'attendance', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'payments', JSON.stringify(payments));
  }, [payments]);

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
  };

  const t = translations[language] || translations.en;

  // --- Dynamic Applications Generator based on Job Applicants ---
  const applications: Application[] = jobs.flatMap(job => {
    const allCandidateIds = Array.from(new Set([...job.applicants, ...job.confirmedWorkerIds, ...job.waitingList]));
    return allCandidateIds.map(wId => {
      const worker = allWorkers.find(w => w.id === wId) || user;
      const match = calculateMatchScore(worker, job);
      let status: Application['status'] = 'applied';
      if (job.confirmedWorkerIds.includes(wId)) {
        status = 'confirmed';
      } else if (job.waitingList.includes(wId)) {
        status = 'waiting_list';
      }

      return {
        id: `app-${job.id}-${wId}`,
        jobId: job.id,
        workerId: wId,
        workerName: worker.name,
        workerPhoto: worker.profilePhoto,
        workerRating: worker.rating,
        workerKyc: worker.kycStatus === 'verified',
        workerSkills: worker.skills,
        workerExperience: worker.experience,
        workerReliability: worker.reliabilityScore,
        workerDistanceKm: job.approximateDistanceKm,
        status,
        appliedAt: job.createdAt,
        matchScore: match.score,
        matchBreakdown: match.breakdown,
      };
    });
  });

  // Role switching
  const toggleRole = () => {
    const newRole = activeRole === 'worker' ? 'customer' : 'worker';
    setActiveRole(newRole);
    setUser(prev => ({ ...prev, role: newRole }));
  };

  const setRole = (role: UserRole) => {
    setActiveRole(role);
    setUser(prev => ({ ...prev, role }));
  };

  const setUserAvailability = (status: AvailabilityStatus) => {
    setUser(prev => ({ ...prev, availability: status }));
  };

  const updateUserPreferences = (prefs: Partial<WorkerPreferences>) => {
    setUser(prev => ({
      ...prev,
      preferredCategories: prefs.preferredCategories ?? prev.preferredCategories,
      preferredDistance: prefs.preferredDistance ?? prev.preferredDistance,
      preferredWage: prefs.minimumWage ?? prev.preferredWage,
      skills: prefs.skills ?? prev.skills,
    }));
  };

  const addNotification = useCallback((notif: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Toggle Save Job
  const toggleSaveJob = (jobId: string) => {
    setSavedJobIds(prev => {
      const exists = prev.includes(jobId);
      const next = exists ? prev.filter(id => id !== jobId) : [...prev, jobId];
      setUser(u => ({ ...u, savedJobIds: next }));
      return next;
    });
  };

  // Apply to Job with Waiting List Logic
  const applyToJob = (jobId: string): { success: boolean; isWaitingList: boolean; position?: number } => {
    let isWaiting = false;
    let position = 0;

    setJobs(prevJobs => {
      return prevJobs.map(job => {
        if (job.id !== jobId) return job;

        // Check if job is filled or all positions confirmed
        if (job.workersConfirmed >= job.workersRequired || job.status === 'Filled') {
          isWaiting = true;
          const nextWaitingList = job.waitingList.includes(user.id)
            ? job.waitingList
            : [...job.waitingList, user.id];
          position = nextWaitingList.indexOf(user.id) + 1;

          addNotification({
            recipientId: user.id,
            title: `Waiting List (#${position})`,
            message: `You are #${position} on the waiting list for ${job.title}. If a confirmed worker cancels, you'll be automatically promoted!`,
            type: 'alert_triggered',
            targetJobId: job.id,
            actionScreen: 'job_details',
          });

          return {
            ...job,
            waitingList: nextWaitingList,
            updatedAt: new Date().toISOString(),
          };
        }

        // Standard application
        const nextApplicants = job.applicants.includes(user.id)
          ? job.applicants
          : [...job.applicants, user.id];

        // Notify customer
        addNotification({
          recipientId: job.customerId,
          title: 'New Applicant Received!',
          message: `${user.name} (${user.rating}★, ${user.reliabilityScore}% Reliability) applied for "${job.title}".`,
          type: 'application_received',
          targetJobId: job.id,
          actionScreen: 'applicants',
        });

        // Notify worker
        addNotification({
          recipientId: user.id,
          title: 'Application Submitted',
          message: `Your application for "${job.title}" was submitted. Waiting for customer confirmation.`,
          type: 'application_received',
          targetJobId: job.id,
          actionScreen: 'job_details',
        });

        return {
          ...job,
          applicants: nextApplicants,
          status: 'Applied' as JobStatus,
          updatedAt: new Date().toISOString(),
        };
      });
    });

    return { success: true, isWaitingList: isWaiting, position };
  };

  // Confirm Worker (Manual or Auto Selection)
  const confirmWorkerForJob = (jobId: string, workerId: string) => {
    setJobs(prevJobs => {
      return prevJobs.map(job => {
        if (job.id !== jobId) return job;

        const isAlreadyConfirmed = job.confirmedWorkerIds.includes(workerId);
        if (isAlreadyConfirmed) return job;

        const updatedConfirmed = [...job.confirmedWorkerIds, workerId];
        const updatedApplicants = job.applicants.filter(id => id !== workerId);
        const count = updatedConfirmed.length;
        const isFull = count >= job.workersRequired;

        const workerObj = allWorkers.find(w => w.id === workerId) || user;

        // Notify Worker: Exact location unlocked!
        addNotification({
          recipientId: workerId,
          title: '🎉 Job Confirmed! Exact Location Unlocked',
          message: `Customer confirmed you for "${job.title}". Exact workplace address & live navigation are now unlocked!`,
          type: 'job_confirmed',
          targetJobId: job.id,
          actionScreen: 'confirmed_job',
        });

        // Notify Customer
        addNotification({
          recipientId: job.customerId,
          title: 'Worker Confirmed',
          message: `${workerObj.name} has been confirmed. Total confirmed: ${count}/${job.workersRequired}.`,
          type: 'application_accepted',
          targetJobId: job.id,
          actionScreen: 'customer_job',
        });

        return {
          ...job,
          confirmedWorkerIds: updatedConfirmed,
          workersConfirmed: count,
          applicants: updatedApplicants,
          status: (isFull ? 'Filled' : 'Posted') as JobStatus,
          updatedAt: new Date().toISOString(),
        };
      });
    });
  };

  // Automatic Worker Selection
  const autoSelectWorkersForJob = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;

    const remainingSlots = job.workersRequired - job.workersConfirmed;
    if (remainingSlots <= 0) return;

    // Rank available applicants by Match Score
    const eligibleWorkers = allWorkers.filter(w =>
      job.applicants.includes(w.id) && !job.confirmedWorkerIds.includes(w.id)
    );

    const ranked = eligibleWorkers
      .map(w => ({ worker: w, match: calculateMatchScore(w, job) }))
      .sort((a, b) => b.match.score - a.match.score);

    const toConfirm = ranked.slice(0, remainingSlots);

    toConfirm.forEach(item => {
      confirmWorkerForJob(jobId, item.worker.id);
    });
  };

  // Worker Cancellation with AUTOMATIC WAITING LIST REPLACEMENT
  const cancelConfirmedJob = (jobId: string) => {
    setJobs(prevJobs => {
      return prevJobs.map(job => {
        if (job.id !== jobId) return job;

        // Remove user from confirmed
        const updatedConfirmed = job.confirmedWorkerIds.filter(id => id !== user.id);
        let newConfirmed = [...updatedConfirmed];
        let newWaitingList = [...job.waitingList];

        // Check if there is someone in the waiting list to replace them!
        let promotedWorkerId: string | null = null;
        if (newWaitingList.length > 0) {
          promotedWorkerId = newWaitingList[0];
          newWaitingList = newWaitingList.slice(1);
          newConfirmed.push(promotedWorkerId);

          const promotedWorker = allWorkers.find(w => w.id === promotedWorkerId) || user;

          // Notify Promoted Worker
          addNotification({
            recipientId: promotedWorkerId,
            title: '⭐ Promoted from Waiting List!',
            message: `A position opened up for "${job.title}". You are now confirmed! Exact workplace details are unlocked.`,
            type: 'waiting_list_promoted',
            targetJobId: job.id,
            actionScreen: 'confirmed_job',
          });

          // Notify Customer of Automatic Replacement
          addNotification({
            recipientId: job.customerId,
            title: 'Worker Replaced Automatically',
            message: `${user.name} cancelled. Waiting List #1 (${promotedWorker.name}) was automatically confirmed!`,
            type: 'waiting_list_promoted',
            targetJobId: job.id,
            actionScreen: 'customer_job',
          });
        } else {
          // No waiting list candidate: open slot again
          addNotification({
            recipientId: job.customerId,
            title: 'Worker Cancelled Job Slot',
            message: `${user.name} cancelled their slot on "${job.title}". The slot is now open for new applications.`,
            type: 'worker_cancelled',
            targetJobId: job.id,
            actionScreen: 'customer_job',
          });
        }

        const newCount = newConfirmed.length;
        const newStatus: JobStatus = (newCount >= job.workersRequired ? 'Filled' : 'Posted') as JobStatus;

        return {
          ...job,
          confirmedWorkerIds: newConfirmed,
          workersConfirmed: newCount,
          waitingList: newWaitingList,
          status: newStatus,
          updatedAt: new Date().toISOString(),
        };
      });
    });

    // Update user's cancellation metric
    setUser(prev => ({
      ...prev,
      cancellationCount: prev.cancellationCount + 1,
      reliabilityScore: Math.max(70, prev.reliabilityScore - 2),
    }));

    addNotification({
      recipientId: user.id,
      title: 'Job Cancelled',
      message: 'You have cancelled your slot. Waiting list replacement has been activated.',
      type: 'worker_cancelled',
      actionScreen: 'my_jobs',
    });
  };

  // Create New Job
  const createJob = (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'applicants' | 'confirmedWorkerIds' | 'waitingList' | 'workersConfirmed'>): Job => {
    const newJob: Job = {
      ...jobData,
      id: 'job-' + Date.now(),
      applicants: [],
      confirmedWorkerIds: [],
      waitingList: [],
      workersConfirmed: 0,
      status: 'Posted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setJobs(prev => [newJob, ...prev]);

    // Check if new job matches worker preferences and fire Alert
    if (user.preferredCategories.includes(newJob.category) && newJob.wage >= user.preferredWage) {
      addNotification({
        recipientId: user.id,
        title: `New Matching Job Alert! (${newJob.category})`,
        message: `"${newJob.title}" with ₹${newJob.wage} wage in ${newJob.approximateArea} matches your preferences.`,
        type: 'new_match',
        targetJobId: newJob.id,
        actionScreen: 'job_details',
      });
    }

    return newJob;
  };

  // Simulate Job Completion (Scheduled time reached)
  const simulateCompleteJob = (jobId: string) => {
    const targetJob = jobs.find(j => j.id === jobId);
    if (!targetJob) return;

    setJobs(prev =>
      prev.map(j => (j.id === jobId ? { ...j, status: 'Finished' as JobStatus, updatedAt: new Date().toISOString() } : j))
    );

    // Stop live tracking if active
    setActiveLiveTrackingJobId(null);

    // Notify worker and trigger rating
    addNotification({
      recipientId: user.id,
      title: 'Job Shift Finished ✓',
      message: `Shift ended for "${targetJob.title}". Please rate your experience with ${targetJob.customerName}.`,
      type: 'job_finished',
      targetJobId: targetJob.id,
      actionScreen: 'rating',
    });

    // Notify customer
    addNotification({
      recipientId: targetJob.customerId,
      title: 'Job Completed',
      message: `Scheduled time ended for "${targetJob.title}". Please rate your workers.`,
      type: 'job_finished',
      targetJobId: targetJob.id,
      actionScreen: 'rating',
    });

    setPendingRatingJob(targetJob);
  };

  // Rehire Worker
  const rehireWorker = (workerId: string, category: WorkCategory) => {
    const workerObj = allWorkers.find(w => w.id === workerId);
    if (!workerObj) return;

    const quickJob = createJob({
      customerId: user.id,
      customerName: user.name,
      customerPhoto: user.profilePhoto,
      customerRating: user.rating,
      customerKyc: user.kycStatus === 'verified',
      businessName: 'Direct Re-Hire',
      title: `${category} Work (Re-Hire)`,
      category,
      description: `Direct re-hire request for ${workerObj.name} based on previous successful job experience.`,
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
      wage: Math.max(750, workerObj.preferredWage || 700),
      startTime: '09:00 AM',
      endTime: '05:00 PM',
      duration: '8 hours',
      urgency: 'Tomorrow',
      approximateArea: 'Indiranagar (approx 2.5 km)',
      approximateDistanceKm: 2.5,
      exactLocation: {
        approximateArea: 'Indiranagar (approx 2.5 km)',
        exactAddress: 'Direct client site, Indiranagar 100ft Road',
        lat: 12.9719,
        lng: 77.6412,
      },
      workersRequired: 1,
      selectionMode: 'manual',
      status: 'Posted',
      recurring: 'none',
    });

    // Auto add worker to applicants
    confirmWorkerForJob(quickJob.id, workerId);
    setSelectedJobId(quickJob.id);
    setActiveScreen('job_details');
  };

  // --- ATTENDANCE SYSTEM METHODS (Phase 6 & 7) ---
  const recordAttendanceCheckIn = (jobId: string, workerId: string, lat?: number, lng?: number) => {
    setAttendanceRecords(prev => {
      const existing = prev.find(a => a.jobId === jobId && a.workerId === workerId);
      if (existing) {
        return prev.map(a =>
          a.id === existing.id
            ? {
                ...a,
                checkInTime: new Date().toISOString(),
                checkInLat: lat || null,
                checkInLng: lng || null,
                geofenceVerified: Boolean(lat && lng),
                status: 'CHECKED_IN',
              }
            : a
        );
      }
      return [
        ...prev,
        {
          id: 'att-' + Date.now(),
          jobId,
          workerId,
          qrToken: `WM-QR-${jobId}-${workerId}`,
          checkInTime: new Date().toISOString(),
          checkInLat: lat || null,
          checkInLng: lng || null,
          geofenceVerified: Boolean(lat && lng),
          status: 'CHECKED_IN',
        },
      ];
    });

    // Automatically transition Job to Ongoing
    setJobs(prev =>
      prev.map(j => (j.id === jobId && j.status !== 'Finished' ? { ...j, status: 'Ongoing' } : j))
    );

    addNotification({
      recipientId: user.id,
      title: 'Shift Check-In Verified ✓',
      message: 'Your attendance has been logged. Workplace safety tracking active.',
      type: 'attendance_checked_in',
      targetJobId: jobId,
    });
  };

  const recordAttendanceCheckOut = (jobId: string, workerId: string) => {
    setAttendanceRecords(prev =>
      prev.map(a =>
        a.jobId === jobId && a.workerId === workerId
          ? { ...a, checkOutTime: new Date().toISOString(), status: 'CHECKED_OUT' }
          : a
      )
    );
  };

  // --- PROTECTED PAYMENT WORKFLOW (Phases 8–13) ---
  const authorizeJobPayment = (jobId: string, amount: number): PaymentRecord => {
    const targetJob = jobs.find(j => j.id === jobId);
    const workerId = targetJob?.confirmedWorkerIds[0] || user.id;
    const worker = allWorkers.find(w => w.id === workerId) || user;

    const newPayment: PaymentRecord = {
      id: 'pay-' + Date.now(),
      jobId,
      jobTitle: targetJob?.title || 'Shift Work',
      employerId: targetJob?.customerId || 'c1',
      employerName: targetJob?.customerName || 'Customer',
      workerId,
      workerName: worker.name,
      amount,
      platformFee: 0.0, // Cooperative zero cut
      totalAmount: amount,
      method: 'UPI',
      status: 'AUTHORIZED', // Protected state
      isSimulatedDemo: systemMode === 'demo',
      createdAt: new Date().toISOString(),
    };

    setPayments(prev => [newPayment, ...prev]);

    addNotification({
      recipientId: workerId,
      title: `Wage Authorized: ₹${amount} (Protected)`,
      message: `Payment authorized for "${newPayment.jobTitle}". Will release upon shift completion.`,
      type: 'payment_authorized',
      targetJobId: jobId,
    });

    return newPayment;
  };

  const releaseJobPayment = (paymentId: string, utrNumber?: string) => {
    setPayments(prev =>
      prev.map(p => {
        if (p.id !== paymentId) return p;
        const utr = utrNumber || `UPI-WM-${Date.now().toString().slice(-8)}`;
        return {
          ...p,
          status: 'PAID',
          utrNumber: utr,
          transactionRef: `WM-TXN-${Date.now().toString().slice(-8)}`,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    const targetPayment = payments.find(p => p.id === paymentId);
    if (targetPayment) {
      addNotification({
        recipientId: targetPayment.workerId,
        title: `Payment Released: ₹${targetPayment.amount} ✓`,
        message: `Employer released payment via ${targetPayment.method}. Transaction confirmed.`,
        type: 'payment_released',
        targetJobId: targetPayment.jobId,
      });
    }
  };

  const disputeJobPayment = (paymentId: string, reason: string) => {
    setPayments(prev =>
      prev.map(p => (p.id === paymentId ? { ...p, status: 'DISPUTED', updatedAt: new Date().toISOString() } : p))
    );

    const targetPayment = payments.find(p => p.id === paymentId);
    if (targetPayment) {
      submitReport(
        targetPayment.workerId,
        'Payment Dispute: ' + reason,
        `Dispute logged on payment ₹${targetPayment.amount} for job ${targetPayment.jobTitle}`,
        targetPayment.jobId
      );

      addNotification({
        recipientId: targetPayment.workerId,
        title: 'Payment Placed on Hold (Disputed)',
        message: `Dispute reason: ${reason}. Under administrative review.`,
        type: 'payment_disputed',
        targetJobId: targetPayment.jobId,
      });
    }
  };

  // --- WORKER DIRECTORY DIRECT INVITE (Phase 5) ---
  const inviteWorkerToJob = (workerId: string, jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    const worker = allWorkers.find(w => w.id === workerId);
    if (!job || !worker) return;

    addNotification({
      recipientId: workerId,
      title: 'Direct Job Invitation 🤝',
      message: `${job.customerName} invited you to work on "${job.title}" (₹${job.wage}).`,
      type: 'new_match',
      targetJobId: jobId,
      actionScreen: 'job_details',
    });
  };

  // Submit Rating
  const submitRating = (jobId: string, toUserId: string, stars: number, comment?: string) => {
    const newRating: RatingRecord = {
      id: 'rate-' + Date.now(),
      jobId,
      fromUserId: user.id,
      toUserId,
      stars,
      comment,
      createdAt: new Date().toISOString(),
    };

    setRatings(prev => [newRating, ...prev]);

    // Update target user's rating & completed jobs
    if (toUserId === user.id) {
      setUser(prev => ({
        ...prev,
        rating: Number(((prev.rating * prev.completedJobs + stars) / (prev.completedJobs + 1)).toFixed(1)),
        completedJobs: prev.completedJobs + 1,
        reliabilityScore: Math.min(100, prev.reliabilityScore + 1),
      }));
    } else {
      setAllWorkers(prev =>
        prev.map(w => {
          if (w.id === toUserId) {
            const nextCount = w.completedJobs + 1;
            const newR = Number(((w.rating * w.completedJobs + stars) / nextCount).toFixed(1));
            return {
              ...w,
              rating: newR,
              completedJobs: nextCount,
              reliabilityScore: Math.min(100, w.reliabilityScore + 1),
            };
          }
          return w;
        })
      );
    }

    setPendingRatingJob(null);
  };

  // Safety actions
  const submitReport = (reportedUserId: string, reason: string, description: string, jobId?: string) => {
    const report: ReportRecord = {
      id: 'rep-' + Date.now(),
      reporterId: user.id,
      reportedUserId,
      jobId,
      reason,
      description,
      createdAt: new Date().toISOString(),
    };
    setReports(prev => [report, ...prev]);

    addNotification({
      recipientId: user.id,
      title: 'Report Submitted',
      message: 'Your report has been logged. Our safety team will review it shortly.',
      type: 'alert_triggered',
    });
  };

  const blockUser = (targetUserId: string) => {
    const block: BlockRecord = {
      id: 'blk-' + Date.now(),
      blockerId: user.id,
      blockedUserId: targetUserId,
      createdAt: new Date().toISOString(),
    };
    setBlockedUsers(prev => [...prev, block]);

    addNotification({
      recipientId: user.id,
      title: 'User Blocked',
      message: 'This user will no longer appear in your job searches or candidate lists.',
      type: 'alert_triggered',
    });
  };

  const unblockUser = (targetUserId: string) => {
    setBlockedUsers(prev => prev.filter(b => b.blockedUserId !== targetUserId));
  };

  const triggerSOS = (jobId: string, note?: string) => {
    addNotification({
      recipientId: user.id,
      title: '🚨 Emergency SOS Dispatched',
      message: `Emergency response alert triggered for Job #${jobId}. Coordinates shared with local community emergency contacts. Note: ${note || 'Immediate assist requested.'}`,
      type: 'alert_triggered',
      actionScreen: 'sos',
    });
  };

  // Change phone number with simulated OTP
  const changePhoneNumber = (newPhone: string) => {
    setUser(prev => ({ ...prev, phone: newPhone }));
    addNotification({
      recipientId: user.id,
      title: 'Phone Number Updated',
      message: `Your verified contact number was updated to ${newPhone}.`,
      type: 'alert_triggered',
    });
  };

  // Delete Account
  const deleteAccount = () => {
    localStorage.clear();
    setUser(INITIAL_CURRENT_USER);
    setIsAuthenticated(false);
    setOnboardingStep('login');
    setActiveScreen('login');
  };

  const completeAuthFlow = (userData?: Partial<User>) => {
    if (userData) {
      setUser(prev => ({ ...prev, ...userData, kycStatus: 'verified' }));
    } else {
      setUser(prev => ({ ...prev, kycStatus: 'verified' }));
    }
    setIsAuthenticated(true);
    setOnboardingStep('app');
    setActiveScreen('home');
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  // --- DEMO CONTROL PANEL UTILITIES ---
  const resetDemoData = () => {
    localStorage.clear();
    setUser(INITIAL_CURRENT_USER);
    setIsAuthenticated(true);
    setOnboardingStep('app');
    setActiveRole('worker');
    setJobs(SEED_JOBS);
    setAllWorkers(SEED_WORKERS);
    setAllCustomers(SEED_CUSTOMERS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setRatings([]);
    setReports([]);
    setBlockedUsers([]);
    setSavedJobIds(['job-3', 'job-5']);
    setSelectedJobId(null);
    setActiveScreen('home');
    setFilters(DEFAULT_FILTERS);
    setActiveLiveTrackingJobId(null);
  };

  const advanceDemoTime = (_minutes: number) => {
    // If there is any ongoing/confirmed job, complete it immediately for judge demonstration!
    const activeJob = jobs.find(j => j.status === 'Ongoing' || j.status === 'Confirmed' || j.confirmedWorkerIds.includes(user.id));
    if (activeJob) {
      simulateCompleteJob(activeJob.id);
    } else if (jobs.length > 0) {
      // Pick Job-1 to complete
      simulateCompleteJob(jobs[0].id);
    }
  };

  const triggerCancellationDemo = () => {
    // Simulate Worker Ravi cancelling Job 1 or Job 4 to trigger Waiting List replacement!
    const filledJob = jobs.find(j => j.waitingList.length > 0 && j.confirmedWorkerIds.length > 0);
    if (filledJob) {
      const workerToCancel = filledJob.confirmedWorkerIds[0];
      const promotedWorkerId = filledJob.waitingList[0];
      const remainingWaiting = filledJob.waitingList.slice(1);
      const updatedConfirmed = filledJob.confirmedWorkerIds.filter(id => id !== workerToCancel).concat(promotedWorkerId);

      const promotedWorker = allWorkers.find(w => w.id === promotedWorkerId) || user;
      const cancelledWorker = allWorkers.find(w => w.id === workerToCancel) || user;

      setJobs(prev =>
        prev.map(j => {
          if (j.id !== filledJob.id) return j;
          return {
            ...j,
            confirmedWorkerIds: updatedConfirmed,
            waitingList: remainingWaiting,
            updatedAt: new Date().toISOString(),
          };
        })
      );

      // Create rich notifications
      addNotification({
        recipientId: user.id,
        title: '⭐ Demo: Automatic Replacement Triggered!',
        message: `${cancelledWorker.name} cancelled slot for "${filledJob.title}". Waiting list #1 (${promotedWorker.name}) was automatically promoted to Confirmed!`,
        type: 'waiting_list_promoted',
        targetJobId: filledJob.id,
        actionScreen: 'confirmed_job',
      });
    } else {
      // Cancel user's first confirmed job
      const userJob = jobs.find(j => j.confirmedWorkerIds.includes(user.id));
      if (userJob) {
        cancelConfirmedJob(userJob.id);
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isAuthenticated,
        onboardingStep,
        setOnboardingStep,
        loginPhone,
        setLoginPhone,
        activeRole,
        toggleRole,
        setRole,
        setUserAvailability,
        updateUserPreferences,
        changePhoneNumber,
        deleteAccount,
        completeAuthFlow,

        language,
        setLanguage,
        t,

        jobs,
        allWorkers,
        allCustomers,
        savedJobIds,
        toggleSaveJob,
        applyToJob,
        cancelConfirmedJob,
        createJob,
        confirmWorkerForJob,
        autoSelectWorkersForJob,
        simulateCompleteJob,
        rehireWorker,

        applications,

        activeScreen,
        setActiveScreen,
        selectedJobId,
        setSelectedJobId,

        filters,
        setFilters,
        resetFilters,

        ratings,
        submitRating,
        pendingRatingJob,
        setPendingRatingJob,

        notifications,
        markNotificationAsRead,
        clearAllNotifications,
        addNotification,

        reports,
        blockedUsers,
        submitReport,
        blockUser,
        unblockUser,
        triggerSOS,

        resetDemoData,
        advanceDemoTime,
        triggerCancellationDemo,
        activeLiveTrackingJobId,
        setActiveLiveTrackingJobId,

        // New Full-Stack & Feature Extensions
        attendanceRecords,
        recordAttendanceCheckIn,
        recordAttendanceCheckOut,
        payments,
        activeReceipt,
        setActiveReceipt,
        authorizeJobPayment,
        releaseJobPayment,
        disputeJobPayment,
        inviteWorkerToJob,
        systemMode,
        toggleSystemMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
