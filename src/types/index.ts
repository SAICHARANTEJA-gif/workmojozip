export type UserRole = 'worker' | 'customer';
export type Gender = 'Male' | 'Female' | 'Other';
export type KycStatus = 'verified' | 'pending' | 'rejected';
export type AvailabilityStatus = 'Available' | 'Busy' | 'Away';

export type WorkCategory = 
  | 'Labour'
  | 'Cleaning'
  | 'Delivery'
  | 'Gardening'
  | 'Construction'
  | 'Loading/Unloading'
  | 'Repair'
  | 'Shop/Store Help'
  | 'Other';

export type JobStatus =
  | 'Draft'
  | 'Posted'
  | 'Applied'
  | 'Waiting for Approval'
  | 'Waiting List'
  | 'Filled'
  | 'Confirmed'
  | 'Ongoing'
  | 'Finished'
  | 'Cancelled';

export type ApplicationStatus =
  | 'applied'
  | 'selected'
  | 'confirmed'
  | 'waiting_list'
  | 'cancelled'
  | 'rejected';

export type SelectionMode = 'manual' | 'auto';
export type WorkTimePreference = 'Morning' | 'Afternoon' | 'Evening' | 'Night' | 'Flexible';
export type JobUrgency = 'Today' | 'Tomorrow' | 'Scheduled';

export interface LocationData {
  approximateArea: string;
  exactAddress: string;
  lat: number;
  lng: number;
  landmark?: string;
}

// Bank & UPI Details (Phase 3)
export interface WorkerBankDetails {
  accountHolderName: string;
  bankName: string;
  accountNumberMasked: string; // e.g. "•••• •••• 4892"
  ifscCode: string;
}

export interface WorkerUpiDetails {
  upiIdMasked: string; // e.g. "arun••••@oksbi"
  qrImageUrl?: string;
  isPrimary: boolean;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  profilePhoto: string;
  gender: Gender;
  role: UserRole;
  alternateRoles?: UserRole[];
  kycStatus: KycStatus;
  rating: number;
  completedJobs: number;
  jobsPosted: number;
  skills: string[];
  experience: string; // e.g. "4 years"
  availability: AvailabilityStatus;
  preferredCategories: WorkCategory[];
  preferredDistance: number; // in km
  preferredWage: number; // in INR
  preferredWorkingTimes: WorkTimePreference[];
  languages: string[];
  reliabilityScore: number; // percentage (e.g. 95)
  cancellationCount: number;
  savedJobIds: string[];
  bankDetails?: WorkerBankDetails;
  upiDetails?: WorkerUpiDetails;
  preferredPaymentMethod?: 'UPI' | 'Cash' | 'Direct Transfer';
  createdAt: string;
}

export interface Job {
  id: string;
  customerId: string;
  customerName: string;
  customerPhoto: string;
  customerRating: number;
  customerKyc: boolean;
  businessName?: string;
  title: string;
  category: WorkCategory;
  description: string;
  voiceDescriptionUrl?: string;
  image: string;
  wage: number; // in INR
  startTime: string; // e.g. "09:00 AM"
  endTime: string;   // e.g. "06:00 PM"
  duration: string;  // e.g. "9 hours"
  urgency: JobUrgency;
  approximateArea: string;
  approximateDistanceKm: number;
  exactLocation: LocationData;
  workersRequired: number;
  workersConfirmed: number;
  selectionMode: SelectionMode;
  status: JobStatus;
  applicants: string[]; // workerIds
  confirmedWorkerIds: string[]; // workerIds
  waitingList: string[]; // workerIds in FIFO order
  recurring?: 'none' | 'daily' | 'weekly';
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  workerId: string;
  workerName: string;
  workerPhoto: string;
  workerRating: number;
  workerKyc: boolean;
  workerSkills: string[];
  workerExperience: string;
  workerReliability: number;
  workerDistanceKm: number;
  status: ApplicationStatus;
  appliedAt: string;
  matchScore: number;
  matchBreakdown: {
    skills: number;
    distance: number;
    availability: number;
    rating: number;
    experience: number;
    reliability: number;
  };
}

// Attendance Workflow (Phase 6 & 7)
export type AttendanceStatus = 'PENDING' | 'CHECKED_IN' | 'CHECKED_OUT' | 'ABSENT' | 'FLAGGED';

export interface AttendanceRecord {
  id: string;
  jobId: string;
  workerId: string;
  workerName?: string;
  qrToken: string;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  checkInLat?: number | null;
  checkInLng?: number | null;
  geofenceVerified?: boolean;
  status: AttendanceStatus;
}

// Protected Payment Workflow (Phases 8–13)
export type PaymentStatus =
  | 'PENDING'
  | 'AUTHORIZED'
  | 'PROCESSING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'
  | 'DISPUTED';

export interface PaymentRecord {
  id: string;
  jobId: string;
  jobTitle: string;
  employerId: string;
  employerName: string;
  workerId: string;
  workerName: string;
  amount: number;
  platformFee: number;
  totalAmount: number;
  method: 'UPI' | 'Cash' | 'Direct Transfer';
  status: PaymentStatus;
  transactionRef?: string;
  utrNumber?: string;
  isSimulatedDemo: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface DigitalReceiptData {
  receiptNumber: string;
  jobTitle: string;
  employerName: string;
  workerName: string;
  date: string;
  hoursWorked: string;
  wageAmount: number;
  platformFee: number;
  totalAmount: number;
  paymentMethod: string;
  transactionId: string;
  utrNumber: string;
  status: string;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  title: string;
  message: string;
  type: 
    | 'application_received'
    | 'application_accepted'
    | 'job_confirmed'
    | 'job_starting'
    | 'waiting_list_promoted'
    | 'worker_cancelled'
    | 'job_finished'
    | 'rating_reminder'
    | 'new_match'
    | 'alert_triggered'
    | 'attendance_checked_in'
    | 'payment_authorized'
    | 'payment_released'
    | 'payment_disputed';
  read: boolean;
  targetJobId?: string;
  actionScreen?: string;
  createdAt: string;
}

export interface RatingRecord {
  id: string;
  jobId: string;
  fromUserId: string;
  toUserId: string;
  stars: number; // 1-5
  comment?: string;
  createdAt: string;
}

export interface ReportRecord {
  id: string;
  reporterId: string;
  reportedUserId: string;
  jobId?: string;
  reason: string;
  description: string;
  evidenceUrl?: string;
  status?: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

export interface BlockRecord {
  id: string;
  blockerId: string;
  blockedUserId: string;
  createdAt: string;
}

export interface WorkerPreferences {
  preferredCategories: WorkCategory[];
  preferredDistance: number; // 1, 3, 5, 10, 15
  minimumWage: number;
  preferredTime: WorkTimePreference;
  skills: string[];
}

export type SupportedLanguage = 'en' | 'te' | 'hi' | 'ta';

export interface FilterState {
  searchQuery: string;
  selectedCategories: WorkCategory[];
  maxDistance: number; // km
  minWage: number;
  timeSlot: WorkTimePreference | 'All';
  duration: 'All' | 'Short' | 'Half Day' | 'Full Day';
  urgency: 'All' | JobUrgency;
  kycOnly: boolean;
  minRating: number;
  skillMatchOnly: boolean;
  sortBy: 'Nearest' | 'Highest Wage' | 'Best Match' | 'Earliest Start' | 'Latest Posted';
}
