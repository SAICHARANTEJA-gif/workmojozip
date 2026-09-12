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
  WorkerPaymentPreference,
  WorkerBankDetails,
  WorkerUpiDetails,
  PaymentStatus,
} from '../types';
import {
  GUEST_USER,
  INITIAL_CURRENT_USER,
  SEED_WORKERS,
  SEED_CUSTOMERS,
  SEED_JOBS,
  INITIAL_NOTIFICATIONS,
  SEED_PAYMENTS,
} from '../data/seedData';
import { calculateMatchScore } from '../services/matchingService';
import { translations, Translations } from '../data/translations';
import {
  api,
  pendingApplicationsStorage,
  PendingApplication,
  ApplicationState,
} from '../services/api';

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
  updateUserProfile: (data: Partial<User>) => void;
  changePhoneNumber: (newPhone: string) => void;
  deleteAccount: () => void;
  logout: () => void;
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
  applyToJob: (
    jobId: string
  ) => Promise<{ success: boolean; isWaitingList: boolean; position?: number; status?: ApplicationState; error?: string; message?: string }>;
  cancelConfirmedJob: (jobId: string) => void;
  createJob: (jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'applicants' | 'confirmedWorkerIds' | 'waitingList' | 'workersConfirmed'>) => Promise<Job>;
  refreshJobs: () => Promise<Job[] | null>;
  fetchJobApplications: (jobId: string) => Promise<any[]>;
  isSyncingJobs: boolean;
  confirmWorkerForJob: (jobId: string, workerId: string) => void;
  autoSelectWorkersForJob: (jobId: string) => void;
  simulateCompleteJob: (jobId: string) => void;
  rehireWorker: (workerId: string, category: WorkCategory) => Promise<void>;
  cancelJob: (jobId: string, reason?: string) => Promise<{ success: boolean; message?: string; error?: string }>;

  // Applications
  applications: Application[];
  pendingApplications: PendingApplication[];
  syncPendingApplications: () => Promise<{ syncedCount: number; failedCount: number }>;
  getApplicationState: (jobId: string, workerId?: string) => ApplicationState;
  isApplicationPending: (jobId: string, workerId?: string) => boolean;

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
  updateWorkerPaymentPreference: (pref: WorkerPaymentPreference) => Promise<boolean>;
  updateBankDetails: (details: WorkerBankDetails) => void;
  updateUpiDetails: (details: WorkerUpiDetails) => void;
  updatePaymentStatus: (paymentId: string, status: PaymentStatus, notes?: string) => void;
  authorizeJobPayment: (jobId: string, amount: number) => PaymentRecord;
  releaseJobPayment: (paymentId: string, utrNumber?: string) => void;
  disputeJobPayment: (paymentId: string, reason: string) => void;
  recordOfflinePayment: (jobId: string, amount: number, notes?: string) => PaymentRecord;
  settleOfflinePayment: (paymentId: string, notes?: string) => void;

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

  // Theme (Dark / Light Mode)
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
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
  // Purge any legacy dummy sessions with worker-me or hardcoded demo phone
  try {
    const oldUser = localStorage.getItem(STORAGE_KEY_PREFIX + 'user');
    if (oldUser) {
      const parsed = JSON.parse(oldUser);
      if (parsed.id === 'worker-me' || parsed.phone === '+91 98765 43210' || !parsed.phone) {
        localStorage.removeItem(STORAGE_KEY_PREFIX + 'auth');
        localStorage.removeItem(STORAGE_KEY_PREFIX + 'onboardingStep');
        localStorage.removeItem(STORAGE_KEY_PREFIX + 'user');
      }
    }
  } catch (_) {}

  // --- Persistent State Initialization ---
  const [user, setUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.phone && parsed.phone !== '+91 98765 43210' && parsed.id !== 'worker-me') {
          return parsed;
        }
      } catch (_) {}
    }
    return GUEST_USER;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'auth');
    const savedUser = localStorage.getItem(STORAGE_KEY_PREFIX + 'user');
    if (saved && savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u && u.phone && u.phone !== '+91 98765 43210' && u.id !== 'worker-me' && u.kycVerified && JSON.parse(saved) === true) {
          return true;
        }
      } catch (_) {}
    }
    return false; // Real login-first: false on initial launch
  });

  const [onboardingStep, setOnboardingStep] = useState<AppContextType['onboardingStep']>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'onboardingStep');
    const savedAuth = localStorage.getItem(STORAGE_KEY_PREFIX + 'auth');
    const savedUser = localStorage.getItem(STORAGE_KEY_PREFIX + 'user');
    if (saved && savedAuth && savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u && u.phone && u.phone !== '+91 98765 43210' && u.id !== 'worker-me' && u.kycVerified && JSON.parse(savedAuth) === true) {
          return saved as any;
        }
      } catch (_) {}
    }
    return 'login'; // Real login-first: always open the login page of the user first!
  });

  const [loginPhone, setLoginPhone] = useState<string>('');
  const [activeRole, setActiveRole] = useState<UserRole>(user.role || 'worker');

  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'language');
    return (saved as SupportedLanguage) || 'en';
  });

  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'jobs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Strictly deduplicate by ID and content signature to purge any legacy duplicates
          const map = new Map<string, Job>();
          const seenSignatures = new Set<string>();
          for (const j of parsed) {
            const sig = `${j.customerId || j.customerName}_${j.title}_${j.wage}_${j.startTime}_${j.category}`;
            if (!map.has(j.id) && !seenSignatures.has(sig)) {
              map.set(j.id, j);
              seenSignatures.add(sig);
            }
          }
          return Array.from(map.values());
        }
      } catch (_) {}
    }
    return SEED_JOBS;
  });

  const [allWorkers, setAllWorkers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'workers');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const map = new Map<string, User>();
          SEED_WORKERS.forEach(w => map.set(w.id, w));
          parsed.forEach((w: User) => map.set(w.id, { ...(map.get(w.id) || {}), ...w }));
          return Array.from(map.values());
        }
      } catch (_) {}
    }
    return SEED_WORKERS;
  });

  const [allCustomers, setAllCustomers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'customers');
    return saved ? JSON.parse(saved) : SEED_CUSTOMERS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const addNotification = useCallback((notif: Omit<NotificationItem, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

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
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (_) {}
    }
    return SEED_PAYMENTS;
  });

  const [activeReceipt, setActiveReceipt] = useState<DigitalReceiptData | null>(null);

  // Resilient Offline Pending Applications State
  const [pendingApplications, setPendingApplications] = useState<PendingApplication[]>(() => {
    return pendingApplicationsStorage.getPending();
  });

  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'theme');
    return (saved as 'dark' | 'light') || 'dark';
  });

  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    localStorage.setItem(STORAGE_KEY_PREFIX + 'theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

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

  // --- Cross-Device Job Synchronization (Supabase PostgreSQL + Render Backend) ---
  const [isSyncingJobs, setIsSyncingJobs] = useState<boolean>(false);

  const refreshJobsFromServer = useCallback(async (): Promise<Job[] | null> => {
    setIsSyncingJobs(true);
    try {
      const res = await api.getJobs();
      if (res && res.success && Array.isArray(res.jobs)) {
        setJobs(prevJobs => {
          const map = new Map<string, Job>();
          const seenSignatures = new Set<string>();

          // Remote jobs (from Supabase PostgreSQL & Render backend) have priority for cross-device consistency
          for (const sj of res.jobs) {
            const existing = prevJobs.find(p => p.id === sj.id);
            const mergedApplicants = Array.from(new Set([...(sj.applicants || []), ...(existing?.applicants || [])]));
            const mergedConfirmed = Array.from(new Set([...(sj.confirmedWorkerIds || []), ...(existing?.confirmedWorkerIds || [])]));
            const mergedWaiting = Array.from(new Set([...(sj.waitingList || []), ...(existing?.waitingList || [])]));

            const mergedJob: Job = {
              ...sj,
              applicants: mergedApplicants,
              confirmedWorkerIds: mergedConfirmed,
              waitingList: mergedWaiting,
            };

            const sig = `${sj.title.trim().toLowerCase()}_${sj.category}_${sj.wage}_${sj.startTime}_${sj.approximateArea}`;
            if (!map.has(sj.id) && !seenSignatures.has(sig)) {
              map.set(sj.id, mergedJob);
              seenSignatures.add(sig);
            }
          }

          // Merge locally pending jobs that may not have completed syncing
          for (const pj of prevJobs) {
            const sig = `${pj.title.trim().toLowerCase()}_${pj.category}_${pj.wage}_${pj.startTime}_${pj.approximateArea}`;
            if (!map.has(pj.id) && !seenSignatures.has(sig)) {
              map.set(pj.id, pj);
              seenSignatures.add(sig);
            }
          }

          return Array.from(map.values());
        });
        return res.jobs;
      }
    } catch (err) {
      console.warn('[AppContext] Failed to fetch remote jobs from backend:', err);
    } finally {
      setIsSyncingJobs(false);
    }
    return null;
  }, []);

  // Resilient Offline Applications Synchronization
  const syncPendingApplications = useCallback(async () => {
    try {
      const pending = pendingApplicationsStorage.getPending();
      if (pending.length === 0) return { syncedCount: 0, failedCount: 0 };

      const syncResult = await api.syncPendingApplications((syncedItem, apiRes) => {
        setJobs(prevJobs =>
          prevJobs.map(job => {
            if (job.id === syncedItem.jobId) {
              const isWaiting = apiRes.status === 'waiting_list';
              if (isWaiting) {
                const nextWaiting = job.waitingList.includes(syncedItem.workerId)
                  ? job.waitingList
                  : [...job.waitingList, syncedItem.workerId];
                return { ...job, waitingList: nextWaiting, updatedAt: new Date().toISOString() };
              } else {
                const nextApps = job.applicants.includes(syncedItem.workerId)
                  ? job.applicants
                  : [...job.applicants, syncedItem.workerId];
                return { ...job, applicants: nextApps, updatedAt: new Date().toISOString() };
              }
            }
            return job;
          })
        );

        addNotification({
          recipientId: syncedItem.workerId,
          title: 'Application Synced ✓',
          message: 'Your saved application has been synced and received by the employer.',
          type: 'application_received',
          targetJobId: syncedItem.jobId,
          actionScreen: 'job_details',
        });
      });

      setPendingApplications(pendingApplicationsStorage.getPending());
      if (syncResult.syncedCount > 0) {
        refreshJobsFromServer();
      }
      return { syncedCount: syncResult.syncedCount, failedCount: syncResult.failedCount };
    } catch (err) {
      console.warn('[OfflineSync] Failed syncing pending applications:', err);
      return { syncedCount: 0, failedCount: 0 };
    }
  }, [addNotification, refreshJobsFromServer]);

  const isApplicationPending = useCallback(
    (jobId: string, workerId?: string) => {
      const wId = workerId || user.id;
      return pendingApplications.some(p => p.jobId === jobId && p.workerId === wId);
    },
    [pendingApplications, user.id]
  );

  const getApplicationState = useCallback(
    (jobId: string, workerId?: string): ApplicationState => {
      const wId = workerId || user.id;
      const targetJob = jobs.find(j => j.id === jobId);
      if (
        targetJob?.applicants.includes(wId) ||
        targetJob?.confirmedWorkerIds.includes(wId) ||
        targetJob?.waitingList.includes(wId)
      ) {
        return 'APPLIED';
      }
      if (pendingApplications.some(p => p.jobId === jobId && p.workerId === wId)) {
        return 'SYNC_PENDING';
      }
      return 'NOT_APPLIED';
    },
    [jobs, pendingApplications, user.id]
  );

  // Initial fetch on mount + reactive window focus & visibility sync + auto-sync pending applications
  useEffect(() => {
    refreshJobsFromServer();
    syncPendingApplications();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshJobsFromServer();
        syncPendingApplications();
      }
    };

    const handleFocus = () => {
      refreshJobsFromServer();
      syncPendingApplications();
    };

    const handleOnline = () => {
      console.log('[WorkMojo] Network online detected — syncing pending applications...');
      refreshJobsFromServer();
      syncPendingApplications();
    };

    // Background sync every 25 seconds when browser tab is active
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshJobsFromServer();
        syncPendingApplications();
      }
    }, 25000);

    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, [refreshJobsFromServer, syncPendingApplications]);


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
      paymentPreference: prefs.paymentPreference ?? prev.paymentPreference,
      preferredPaymentMethod: prefs.paymentPreference ?? prev.preferredPaymentMethod,
    }));

    if (prefs.paymentPreference) {
      const pref = prefs.paymentPreference;
      setAllWorkers(prev =>
        prev.map(w =>
          w.id === user.id
            ? { ...w, paymentPreference: pref, preferredPaymentMethod: pref }
            : w
        )
      );
      try {
        fetch(`/api/v1/workers/${user.id}/payment-preference`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentPreference: pref }),
        }).catch(() => {});
      } catch (_) {}
    }
  };

  const updateUserProfile = (data: Partial<User>) => {
    setUser(prev => {
      const updated = { ...prev, ...data };
      api.updateUserProfile({
        userId: updated.id,
        phone: updated.phone,
        profilePhoto: updated.profilePhoto,
        name: updated.name,
        gender: updated.gender,
        role: updated.role,
      }).catch(err => console.warn('[ProfileSync] Warning syncing profile to server:', err));
      return updated;
    });
    setAllWorkers(prev =>
      prev.map(w => (w.id === user.id ? { ...w, ...data } : w))
    );
  };

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

  // Apply to Job with Resilient Offline-First Fallback and Backend Sync
  const applyToJob = async (
    jobId: string
  ): Promise<{
    success: boolean;
    isWaitingList: boolean;
    position?: number;
    status: ApplicationState;
    error?: string;
    message?: string;
  }> => {
    const currentJob = jobs.find(j => j.id === jobId);
    if (!currentJob) {
      return { success: false, isWaitingList: false, status: 'NOT_APPLIED', error: 'Job not found.' };
    }

    if (currentJob.status === 'Cancelled' || currentJob.status === 'CANCELLED') {
      addNotification({
        recipientId: user.id,
        title: 'Job Not Available',
        message: 'This job has been cancelled by the employer and is no longer accepting applications.',
        type: 'alert_triggered',
        targetJobId: jobId,
      });
      return {
        success: false,
        isWaitingList: false,
        status: 'NOT_APPLIED',
        error: 'This job has been cancelled by the employer.',
      };
    }

    // 1. Duplicate Application Protection
    const alreadyApplied =
      currentJob.applicants.includes(user.id) ||
      currentJob.confirmedWorkerIds.includes(user.id) ||
      currentJob.waitingList.includes(user.id);
    const alreadyPending = pendingApplicationsStorage.isPending(jobId, user.id);

    if (alreadyApplied || alreadyPending) {
      return {
        success: false,
        isWaitingList: false,
        status: alreadyApplied ? 'APPLIED' : 'SYNC_PENDING',
        error: 'You have already applied to this job.',
        message: 'You have already applied to this job.',
      };
    }

    const match = calculateMatchScore(user, currentJob);

    const appPayload = {
      workerId: user.id,
      workerName: user.name || 'Verified Worker',
      workerPhone: user.phone || '',
      workerPhoto: user.profilePhoto || '',
      workerRating: user.rating || 4.8,
      workerReliability: user.reliabilityScore || 95,
      workerSkills: user.skills || [],
      matchScore: match.score,
    };

    // 2. Try the backend application API first
    let res: any = null;
    try {
      res = await api.applyForJob(jobId, appPayload);
    } catch (netErr: any) {
      res = { success: false, error: netErr.message || 'Network error' };
    }

    // 3. If backend + Supabase succeeds:
    if (res && res.success) {
      pendingApplicationsStorage.removePending(jobId, user.id);
      setPendingApplications(pendingApplicationsStorage.getPending());

      const isWaiting = res.status === 'waiting_list';
      const position = res.position;

      setJobs(prevJobs => {
        return prevJobs.map(job => {
          if (job.id !== jobId) return job;

          if (isWaiting) {
            const nextWaitingList = job.waitingList.includes(user.id)
              ? job.waitingList
              : [...job.waitingList, user.id];
            const pos = position || (nextWaitingList.indexOf(user.id) + 1);

            addNotification({
              recipientId: user.id,
              title: `Waiting List (#${pos})`,
              message: `You are #${pos} on the waiting list for ${job.title}. If a confirmed worker cancels, you'll be automatically promoted!`,
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
            message: 'Application submitted successfully! ✓',
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

      return {
        success: true,
        isWaitingList: isWaiting,
        position,
        status: 'APPLIED',
        message: 'Application submitted successfully! ✓',
      };
    }

    // 4. Backend failure, timeout, 5xx, or temporary database failure:
    // DO NOT show PostgreSQL/Supabase/RLS/foreign-key errors to the worker!
    console.warn('[OfflineFallback] Backend/DB application write failed. Reason suppressed from worker:', res?.error);

    const pendingItem: PendingApplication = {
      applicationId: `pending-${jobId}-${user.id}-${Date.now()}`,
      jobId,
      workerId: user.id,
      createdAt: new Date().toISOString(),
      status: 'SYNC_PENDING',
      payload: appPayload,
    };

    pendingApplicationsStorage.savePending(pendingItem);
    setPendingApplications(pendingApplicationsStorage.getPending());

    // Immediately show worker friendly offline notification
    addNotification({
      recipientId: user.id,
      title: 'Application Saved',
      message: "Application saved. We'll sync it when you're back online. ✓",
      type: 'application_received',
      targetJobId: jobId,
      actionScreen: 'job_details',
    });

    return {
      success: true,
      isWaitingList: false,
      status: 'SYNC_PENDING',
      message: "Application saved. We'll sync it when you're back online. ✓",
    };
  };

  // Fetch Remote Applications for a selected Job
  const fetchJobApplications = useCallback(async (jobId: string): Promise<any[]> => {
    try {
      const res = await api.getJobApplications(jobId);
      if (res && res.success && Array.isArray(res.applications)) {
        // Hydrate allWorkers with any remote worker profiles returned
        setAllWorkers(prevWorkers => {
          const map = new Map<string, User>();
          prevWorkers.forEach(w => map.set(w.id, w));

          for (const app of res.applications) {
            if (!map.has(app.workerId) && app.workerId !== 'guest') {
              map.set(app.workerId, {
                id: app.workerId,
                name: app.workerName || 'Verified Worker',
                phone: app.workerPhone || '+91 98765 43210',
                profilePhoto: app.workerPhoto || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
                gender: 'Other',
                role: 'worker',
                alternateRoles: ['worker'],
                kycStatus: 'verified',
                kycVerified: true,
                rating: Number(app.workerRating) || 4.8,
                completedJobs: 14,
                jobsPosted: 0,
                skills: Array.isArray(app.workerSkills) && app.workerSkills.length > 0 ? app.workerSkills : ['Labour'],
                experience: '2 years',
                availability: 'Available',
                preferredCategories: [],
                preferredDistance: 5,
                preferredWage: 500,
                preferredWorkingTimes: ['Morning'],
                languages: ['English', 'Hindi'],
                reliabilityScore: Number(app.workerReliability) || 95,
                cancellationCount: 0,
                savedJobIds: [],
                paymentPreference: 'ONLINE',
                bio: 'Verified gig worker on WorkMojo.',
                createdAt: app.createdAt || new Date().toISOString(),
              });
            }
          }
          return Array.from(map.values());
        });

        // Also ensure current job in memory includes all remote applicant IDs
        setJobs(prevJobs =>
          prevJobs.map(j => {
            if (j.id !== jobId) return j;
            const remoteApplicantIds = res.applications
              .filter((a: any) => a.status === 'applied')
              .map((a: any) => a.workerId);
            const merged = Array.from(new Set([...j.applicants, ...remoteApplicantIds]));
            return { ...j, applicants: merged };
          })
        );

        return res.applications;
      }
    } catch (err) {
      console.warn('[AppContext] Error fetching applications for job:', jobId, err);
    }
    return [];
  }, []);

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
          status: (isFull ? 'Filled' : 'Open') as JobStatus,
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
        const newStatus: JobStatus = (newCount >= job.workersRequired ? 'Filled' : 'Open') as JobStatus;

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

  // Create New Job (Optimistic local save + async POST to backend / Supabase)
  const createJob = async (
    jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'applicants' | 'confirmedWorkerIds' | 'waitingList' | 'workersConfirmed'>
  ): Promise<Job> => {
    const newJobId = 'job-' + Date.now();
    const newJob: Job = {
      ...jobData,
      id: newJobId,
      applicants: [],
      confirmedWorkerIds: [],
      waitingList: [],
      workersConfirmed: 0,
      status: 'Open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('[JOB PUBLISH] Initiating job publish in AppContext:', newJob.id, {
      title: newJob.title,
      category: newJob.category,
      wage: newJob.wage,
      workersRequired: newJob.workersRequired,
      status: newJob.status,
    });

    // Optimistic local update: ensure only deduplicated by exact ID
    setJobs(prev => {
      const map = new Map<string, Job>();
      map.set(newJob.id, newJob);
      for (const j of prev) {
        if (!map.has(j.id)) {
          map.set(j.id, j);
        }
      }
      return Array.from(map.values());
    });

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

    // Sync newly created job to backend API (and Supabase if configured)
    try {
      console.log('[JOB PUBLISH] Submitting job payload to backend API:', newJob.id);
      const res = await api.postJob(newJob);
      if (res && res.success && res.job) {
        console.log('[JOB PUBLISH] Backend confirmed job creation:', res.job.id, 'persistedToSupabase:', res.persistedToSupabase);
        setJobs(prev => prev.map(j => (j.id === newJob.id ? { ...j, ...res.job } : j)));
        return { ...newJob, ...res.job };
      } else if (res && !res.success) {
        console.error('[JOB PUBLISH] Backend rejected job creation:', res.error);
        setJobs(prev => prev.filter(j => j.id !== newJob.id));
        throw new Error(res.error || 'Failed to persist job to database.');
      }
    } catch (err: any) {
      console.error('[JOB PUBLISH] Error syncing job to backend:', err.message);
      setJobs(prev => prev.filter(j => j.id !== newJob.id));
      throw err;
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
  const rehireWorker = async (workerId: string, category: WorkCategory) => {
    const workerObj = allWorkers.find(w => w.id === workerId);
    if (!workerObj) return;

    const quickJob = await createJob({
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
      status: 'Open',
      recurring: 'none',
    });

    // Auto add worker to applicants
    confirmWorkerForJob(quickJob.id, workerId);
    setSelectedJobId(quickJob.id);
    setActiveScreen('job_details');
  };

  // Cancel Job (Employer Operation with Backend & Supabase Sync)
  const cancelJob = async (jobId: string, reason?: string): Promise<{ success: boolean; message?: string; error?: string }> => {
    const targetJob = jobs.find(j => j.id === jobId);
    if (!targetJob) {
      return { success: false, error: 'Job not found' };
    }
    if (targetJob.status === 'Finished') {
      return { success: false, error: 'Completed jobs cannot be cancelled.' };
    }
    if (targetJob.status === 'Cancelled' || targetJob.status === 'CANCELLED') {
      return { success: false, error: 'Job is already cancelled.' };
    }

    // Call backend API (handles authorization and Supabase sync)
    try {
      await api.cancelJob(jobId, user.id, reason);
    } catch (err: any) {
      console.warn('[AppContext] Backend cancelJob notice:', err.message);
    }

    // Update local jobs state
    setJobs(prev =>
      prev.map(j => {
        if (j.id !== jobId) return j;
        return {
          ...j,
          status: 'CANCELLED',
          updatedAt: new Date().toISOString(),
        };
      })
    );

    // Notify all applicants and confirmed workers
    const notifyUserIds = Array.from(new Set([...(targetJob.applicants || []), ...(targetJob.confirmedWorkerIds || [])]));
    notifyUserIds.forEach(workerId => {
      addNotification({
        recipientId: workerId,
        title: 'Job Cancelled by Employer',
        message: `The job "${targetJob.title}" has been cancelled by the employer. Any allocated slots have been released.`,
        type: 'alert_triggered',
        targetJobId: targetJob.id,
      });
    });

    // Notify employer
    addNotification({
      recipientId: user.id,
      title: 'Job Cancelled',
      message: `Your job "${targetJob.title}" has been successfully marked as cancelled.`,
      type: 'alert_triggered',
      targetJobId: targetJob.id,
    });

    return { success: true, message: 'Job cancelled successfully.' };
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

  // --- PROTECTED PAYMENT WORKFLOW (Phases 8–13) & OFFLINE SETTLEMENT ---
  const updateWorkerPaymentPreference = async (pref: WorkerPaymentPreference): Promise<boolean> => {
    try {
      setUser(prev => ({
        ...prev,
        paymentPreference: pref,
        preferredPaymentMethod: pref,
      }));

      setAllWorkers(prev =>
        prev.map(w =>
          w.id === user.id
            ? { ...w, paymentPreference: pref, preferredPaymentMethod: pref }
            : w
        )
      );

      const res = await fetch(`/api/v1/workers/${user.id}/payment-preference`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentPreference: pref }),
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      addNotification({
        recipientId: user.id,
        title: 'Payment Method Updated',
        message: `Preferred payout set to ${
          pref === 'ONLINE' ? 'Online Payment (Protected UPI/Bank)' : 'Offline Payment (Cash on Shift Completion)'
        }.`,
        type: 'alert_triggered',
      });

      return true;
    } catch (err) {
      console.error('[Payment Preference Save Error]', err);
      return false;
    }
  };

  const authorizeJobPayment = (jobId: string, amount: number): PaymentRecord => {
    const targetJob = jobs.find(j => j.id === jobId);
    const workerId = targetJob?.confirmedWorkerIds[0] || user.id;
    const worker = allWorkers.find(w => w.id === workerId) || user;
    const pref: WorkerPaymentPreference =
      worker.paymentPreference ||
      (worker.preferredPaymentMethod === 'Cash' || worker.preferredPaymentMethod === 'OFFLINE'
        ? 'OFFLINE'
        : 'ONLINE');

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
      method: pref === 'OFFLINE' ? 'OFFLINE' : 'UPI',
      paymentPreference: pref,
      status: pref === 'OFFLINE' ? 'PENDING' : 'AUTHORIZED',
      isSimulatedDemo: systemMode === 'demo',
      createdAt: new Date().toISOString(),
    };

    setPayments(prev => [newPayment, ...prev]);

    addNotification({
      recipientId: workerId,
      title: pref === 'OFFLINE' ? `Offline Cash Wage Set: ₹${amount}` : `Wage Authorized: ₹${amount} (Protected)`,
      message:
        pref === 'OFFLINE'
          ? `Employer recorded shift payment of ₹${amount} in Cash upon completion.`
          : `Payment authorized for "${newPayment.jobTitle}". Will release upon shift completion.`,
      type: 'payment_authorized',
      targetJobId: jobId,
    });

    return newPayment;
  };

  const recordOfflinePayment = (jobId: string, amount: number, notes?: string): PaymentRecord => {
    const targetJob = jobs.find(j => j.id === jobId);
    const workerId = targetJob?.confirmedWorkerIds[0] || user.id;
    const worker = allWorkers.find(w => w.id === workerId) || user;

    const newPayment: PaymentRecord = {
      id: 'pay-off-' + Date.now(),
      jobId,
      jobTitle: targetJob?.title || 'Shift Work',
      employerId: targetJob?.customerId || 'c1',
      employerName: targetJob?.customerName || 'Customer',
      workerId,
      workerName: worker.name,
      amount,
      platformFee: 0.0,
      totalAmount: amount,
      method: 'OFFLINE',
      paymentPreference: 'OFFLINE',
      status: 'PENDING',
      offlineNotes: notes || 'Direct Cash Settlement on shift completion',
      isSimulatedDemo: systemMode === 'demo',
      createdAt: new Date().toISOString(),
    };

    setPayments(prev => [newPayment, ...prev]);

    try {
      fetch('/api/v1/payments/record-offline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          employerId: targetJob?.customerId || 'c1',
          workerId,
          amount,
          notes,
        }),
      }).catch(() => {});
    } catch (_) {}

    addNotification({
      recipientId: workerId,
      title: `Offline Cash Payment Recorded: ₹${amount}`,
      message: `Pending cash payment of ₹${amount} recorded for "${newPayment.jobTitle}". Employer will mark as paid upon handover.`,
      type: 'payment_authorized',
      targetJobId: jobId,
    });

    return newPayment;
  };

  const settleOfflinePayment = (paymentId: string, notes?: string) => {
    setPayments(prev =>
      prev.map(p => {
        if (p.id !== paymentId) return p;
        return {
          ...p,
          status: 'PAID',
          offlineSettledAt: new Date().toISOString(),
          offlineNotes: notes || p.offlineNotes || 'Cash handed over in full upon shift completion.',
          updatedAt: new Date().toISOString(),
        };
      })
    );

    const targetPayment = payments.find(p => p.id === paymentId);
    if (targetPayment) {
      try {
        fetch(`/api/v1/payments/${paymentId}/settle-offline`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes }),
        }).catch(() => {});
      } catch (_) {}

      addNotification({
        recipientId: targetPayment.workerId,
        title: `Cash Payment Settled: ₹${targetPayment.amount} ✓`,
        message: `Employer confirmed handover of ₹${targetPayment.amount} in Cash. Payment completed.`,
        type: 'payment_released',
        targetJobId: targetPayment.jobId,
      });
    }
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

  const updateBankDetails = (details: WorkerBankDetails) => {
    setUser(prev => ({
      ...prev,
      bankDetails: details,
    }));
    setAllWorkers(prev =>
      prev.map(w => (w.id === user.id ? { ...w, bankDetails: details } : w))
    );
    try {
      fetch(`/api/v1/workers/${user.id}/bank-details`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountHolderName: details.accountHolderName,
          bankName: details.bankName,
          accountNumber: details.accountNumberMasked,
          ifscCode: details.ifscCode,
        }),
      }).catch(() => {});
    } catch (_) {}

    addNotification({
      recipientId: user.id,
      title: 'Bank Details Updated',
      message: `Direct payout account updated to ${details.bankName} (${details.accountNumberMasked}).`,
      type: 'alert_triggered',
    });
  };

  const updateUpiDetails = (details: WorkerUpiDetails) => {
    setUser(prev => ({
      ...prev,
      upiDetails: details,
    }));
    setAllWorkers(prev =>
      prev.map(w => (w.id === user.id ? { ...w, upiDetails: details } : w))
    );
    try {
      fetch(`/api/v1/workers/${user.id}/upi-details`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          upiId: details.upiIdMasked,
          isPrimary: details.isPrimary,
        }),
      }).catch(() => {});
    } catch (_) {}

    addNotification({
      recipientId: user.id,
      title: 'UPI Details Updated',
      message: `Primary UPI ID updated to ${details.upiIdMasked}.`,
      type: 'alert_triggered',
    });
  };

  const updatePaymentStatus = (paymentId: string, status: PaymentStatus, notes?: string) => {
    setPayments(prev =>
      prev.map(p => {
        if (p.id !== paymentId) return p;
        return {
          ...p,
          status,
          offlineNotes: notes || p.offlineNotes,
          offlineSettledAt: (status === 'PAID' || status === 'COMPLETED') ? (p.offlineSettledAt || new Date().toISOString()) : p.offlineSettledAt,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    try {
      fetch(`/api/v1/payments/${paymentId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      }).catch(() => {});
    } catch (_) {}
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
    setUser(GUEST_USER);
    setIsAuthenticated(false);
    setOnboardingStep('login');
    setActiveScreen('login');
  };

  // Log Out
  const logout = () => {
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'auth');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'onboardingStep');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'user');
    setUser(GUEST_USER);
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
    setPayments(SEED_PAYMENTS);
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
        updateUserProfile,
        changePhoneNumber,
        deleteAccount,
        logout,
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
        cancelJob,
        refreshJobs: refreshJobsFromServer,
        fetchJobApplications,
        isSyncingJobs,

        applications,
        pendingApplications,
        syncPendingApplications,
        getApplicationState,
        isApplicationPending,

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
        updateWorkerPaymentPreference,
        updateBankDetails,
        updateUpiDetails,
        updatePaymentStatus,
        authorizeJobPayment,
        releaseJobPayment,
        disputeJobPayment,
        recordOfflinePayment,
        settleOfflinePayment,
        inviteWorkerToJob,
        systemMode,
        toggleSystemMode,
        theme,
        setTheme,
        toggleTheme,
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
