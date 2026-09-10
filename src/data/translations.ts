import { SupportedLanguage } from '../types';

export interface Translations {
  appName: string;
  tagline: string;
  workerMode: string;
  customerMode: string;
  available: string;
  busy: string;
  away: string;
  nearbyJobs: string;
  recommendedForYou: string;
  applyNow: string;
  waitingList: string;
  confirmed: string;
  ongoing: string;
  finished: string;
  cancelled: string;
  postJob: string;
  workersNeeded: string;
  matchScore: string;
  reliable: string;
  sosEmergency: string;
  navigate: string;
  liveLocation: string;
  save: string;
  saved: string;
  searchPlaceholder: string;
  filterTitle: string;
  clearFilters: string;
  applyFilters: string;
  rateExperience: string;
  submitRating: string;
  changeLanguage: string;
  changeMobile: string;
  deleteAccount: string;
  mojoHelp: string;

  // Navigation & Tabs
  navHome: string;
  navJobs: string;
  navMyJobs: string;
  navApplicants: string;
  navPayments: string;
  navAlerts: string;
  navProfile: string;

  // Sub Tabs
  tabConfirmed: string;
  tabOngoing: string;
  tabApplied: string;
  tabWaitingList: string;
  tabFinished: string;
  tabSaved: string;

  // Categories
  catLoading: string;
  catCleaning: string;
  catConstruction: string;
  catDelivery: string;
  catGardening: string;
  catLabour: string;
  catRepair: string;
  catShopHelp: string;
  catOther: string;

  // Quick Actions & Headers
  myPreferences: string;
  jobAlerts: string;
  workCategories: string;
  viewAll: string;
  topWageGigs: string;
  startingToday: string;
  perShift: string;
  fromYou: string;
  slotsOpen: string;
  privacyShielded: string;
  callOwner: string;
  hiringProgress: string;
  applicantPipeline: string;
  reviewApplicants: string;
  autoFill: string;
  compareCandidates: string;
  liveShifts: string;
  hireAgain: string;
  statusLabel: string;
  namaste: string;

  // Auth & KYC
  loginTitle: string;
  mobileNumberLabel: string;
  continueOtp: string;
  verifyOtpTitle: string;
  aadhaarVerification: string;
  panVerification: string;
  livePhotoTitle: string;
  kycVerifiedTitle: string;

  // Payments
  paymentsTitle: string;
  totalEarnings: string;
  inEscrow: string;
  availableBalance: string;
  preferredPayoutMethod: string;
  onlineInstantPayout: string;
  offlineCashSettlement: string;
  transactionHistory: string;
  noTransactions: string;
  directWageRetained: string;
  commissionFreeNotice: string;
  payoutUpiNotice: string;
  payoutCashNotice: string;
  statusPaid: string;
  statusPending: string;
  statusProcessing: string;
  statusDisputed: string;

  // Customer / Employer
  employerDashboard: string;
  postNewJobBtn: string;
  findWorkersBtn: string;
  activePostings: string;
  noActivePostings: string;
  acceptAndHire: string;
  candidateHired: string;
  manageJob: string;
  viewApplicants: string;

  // Post Job Wizard
  stepBasicInfo: string;
  stepLocation: string;
  stepWageTiming: string;
  stepReview: string;
  jobTitleLabel: string;
  jobCategoryLabel: string;
  jobDescriptionLabel: string;
  workplaceLocationLabel: string;
  landmarkLabel: string;
  wagePerShiftLabel: string;
  shiftTimingLabel: string;
  workersNeededCountLabel: string;
  postJobNowBtn: string;
  postingJobProgress: string;
  jobPostedSuccessMsg: string;

  // Job Details
  aboutTheWork: string;
  workplaceLocation: string;
  transparentAiMatch: string;
  timingLabel: string;
  distanceLabel: string;
  requiredLabel: string;
  exactAddressUnlocked: string;
  cancelSlotBtn: string;
  joinWaitingListBtn: string;

  // Profile & Settings
  personalProfile: string;
  workAndSkills: string;
  identityAndKyc: string;
  switchRoleAction: string;
  gigsDoneCount: string;
  postedCount: string;
  experienceCount: string;
  helpSupport: string;
  logoutBtn: string;

    clearChat: string;
  retryAction: string;
  cancelAction: string;
  confirmAction: string;
  backAction: string;
  nextAction: string;
  closeAction: string;

  // Production Readiness Keys
  loginBtn: string;
  signUpBtn: string;
  completeProfile: string;
  completeKyc: string;
  otpUnavailable: string;
  invalidOtp: string;
  cancelJob: string;
  cancelJobConfirm: string;
  jobCancelled: string;
  mapLoading: string;
  mapUnavailable: string;
  uploadProfilePhoto: string;
  uploadFailed: string;
  authRequired: string;
}

export const translations: Record<SupportedLanguage, Translations> = {
  en: {
    appName: 'WORK MOJO',
    tagline: 'Find Work. Find Workers. Get It Done.',
    workerMode: 'Worker Mode',
    customerMode: 'Customer Mode',
    available: 'Available for Work',
    busy: 'Busy on a Job',
    away: 'Away',
    nearbyJobs: 'Closest Gigs Near You',
    recommendedForYou: 'Recommended for You',
    applyNow: 'Apply Now',
    waitingList: 'Join Waiting List',
    confirmed: 'Job Confirmed ✓',
    ongoing: 'Job Ongoing',
    finished: 'Job Finished ✓',
    cancelled: 'Cancelled',
    postJob: 'Post a New Job (Hire Workers)',
    workersNeeded: 'workers needed',
    matchScore: 'Match',
    reliable: 'Reliable',
    sosEmergency: 'SOS Emergency Help',
    navigate: 'Navigate to Workplace',
    liveLocation: 'Live Location ON',
    save: 'Save Job',
    saved: 'Saved',
    searchPlaceholder: 'Search delivery, cleaning, loading...',
    filterTitle: 'Filter Jobs',
    clearFilters: 'Clear All',
    applyFilters: 'Apply Filters',
    rateExperience: 'How was your experience?',
    submitRating: 'Submit Rating',
    changeLanguage: 'Language Settings',
    changeMobile: 'Change Mobile Number',
    deleteAccount: 'Delete Account',
    mojoHelp: 'Ask Mojo AI Assistant',

    navHome: 'Home',
    navJobs: 'Jobs',
    navMyJobs: 'My Gigs',
    navApplicants: 'Applicants',
    navPayments: 'Payments',
    navAlerts: 'Alerts',
    navProfile: 'Profile',

    tabConfirmed: 'Confirmed',
    tabOngoing: 'Ongoing',
    tabApplied: 'Applied',
    tabWaitingList: 'Waiting List',
    tabFinished: 'Finished',
    tabSaved: 'Saved',

    catLoading: 'Loading/Unloading',
    catCleaning: 'Cleaning',
    catConstruction: 'Construction',
    catDelivery: 'Delivery',
    catGardening: 'Gardening',
    catLabour: 'Labour',
    catRepair: 'Repair',
    catShopHelp: 'Shop/Store Help',
    catOther: 'Other Work',

    myPreferences: 'My Preferences',
    jobAlerts: 'Job Alerts',
    workCategories: 'Work Categories',
    viewAll: 'View All',
    topWageGigs: 'Top Wage Gigs (₹800+)',
    startingToday: 'Starting Today',
    perShift: 'per shift',
    fromYou: 'away from you',
    slotsOpen: 'slot(s) open',
    privacyShielded: 'Privacy Shielded',
    callOwner: 'Call Owner',
    hiringProgress: 'Hiring Progress',
    applicantPipeline: 'Applicant Pipeline',
    reviewApplicants: 'Review Applicants',
    autoFill: 'Auto-Fill',
    compareCandidates: 'Compare Candidates',
    liveShifts: 'Live & Active Shifts',
    hireAgain: 'Hire Again',
    statusLabel: 'Status:',
    namaste: 'Namaste',

    loginTitle: 'Sign In to Work Mojo',
    mobileNumberLabel: 'Mobile Number (+91)',
    continueOtp: 'Continue with OTP',
    verifyOtpTitle: 'Verify Six-Digit OTP',
    aadhaarVerification: 'Aadhaar Verification',
    panVerification: 'PAN Card Verification',
    livePhotoTitle: 'Live Photo Face Capture',
    kycVerifiedTitle: 'KYC Verified ✓',

    // Payments
    paymentsTitle: 'Earnings & Payouts',
    totalEarnings: 'Total Earnings',
    inEscrow: 'In Escrow',
    availableBalance: 'Available Balance',
    preferredPayoutMethod: 'Preferred Payout Method',
    onlineInstantPayout: 'Online Instant Payout (UPI / Bank)',
    offlineCashSettlement: 'Offline Direct Cash Settlement',
    transactionHistory: 'Transaction History',
    noTransactions: 'No transactions recorded yet',
    directWageRetained: '100% Retained Direct Wage',
    commissionFreeNotice: 'Zero Commission: 100% of your earned wage goes directly to you.',
    payoutUpiNotice: 'Direct deposit to your linked bank account or UPI ID on shift completion.',
    payoutCashNotice: 'Collect exact cash payment directly from the employer with verified digital receipt.',
    statusPaid: 'PAID',
    statusPending: 'PENDING',
    statusProcessing: 'PROCESSING',
    statusDisputed: 'DISPUTED',

    // Customer / Employer
    employerDashboard: 'Employer Dashboard',
    postNewJobBtn: 'Post a New Job',
    findWorkersBtn: 'Find Workers',
    activePostings: 'Active Postings',
    noActivePostings: 'No active job postings yet',
    acceptAndHire: 'Accept & Hire',
    candidateHired: 'Candidate Hired ✓',
    manageJob: 'Manage Posting',
    viewApplicants: 'View Applicants',

    // Post Job Wizard
    stepBasicInfo: 'Job Details',
    stepLocation: 'Location',
    stepWageTiming: 'Wage & Shift',
    stepReview: 'Review & Post',
    jobTitleLabel: 'Job Title',
    jobCategoryLabel: 'Select Category',
    jobDescriptionLabel: 'Description & Requirements',
    workplaceLocationLabel: 'Workplace Address',
    landmarkLabel: 'Nearby Landmark',
    wagePerShiftLabel: 'Wage per Worker (₹)',
    shiftTimingLabel: 'Shift Start Time',
    workersNeededCountLabel: 'Workers Required',
    postJobNowBtn: 'Post Job Now',
    postingJobProgress: 'Publishing Job...',
    jobPostedSuccessMsg: 'Job Posted Successfully!',

    // Job Details
    aboutTheWork: 'About the Work',
    workplaceLocation: 'Workplace Location',
    transparentAiMatch: 'Transparent AI Match',
    timingLabel: 'Timing',
    distanceLabel: 'Distance',
    requiredLabel: 'Required',
    exactAddressUnlocked: 'Exact address unlocked upon confirmation',
    cancelSlotBtn: 'Cancel My Slot',
    joinWaitingListBtn: 'Job Filled — Join Waiting List',

    // Profile & Settings
    personalProfile: 'Personal Profile',
    workAndSkills: 'Work & Skills',
    identityAndKyc: 'Identity & KYC',
    switchRoleAction: 'Switch to',
    gigsDoneCount: 'Gigs Done',
    postedCount: 'Posted',
    experienceCount: 'Experience',
    helpSupport: 'Help & Support',
    logoutBtn: 'Log Out',

    // AI & Common
    clearChat: 'Clear Chat',
    retryAction: 'Retry',
    cancelAction: 'Cancel',
    confirmAction: 'Confirm',
    backAction: 'Back',
    nextAction: 'Next',
    closeAction: 'Close',

    // Production Readiness
    loginBtn: 'Log In',
    signUpBtn: 'Sign Up',
    completeProfile: 'Complete Profile',
    completeKyc: 'Complete KYC Verification',
    otpUnavailable: 'OTP verification is currently unavailable. Please try again later.',
    invalidOtp: 'Invalid or expired OTP code. Please try again.',
    cancelJob: 'Cancel Job',
    cancelJobConfirm: 'Are you sure you want to cancel this job? This will notify all applicants and mark the job as cancelled.',
    jobCancelled: 'Job Cancelled',
    mapLoading: 'Loading live work map...',
    mapUnavailable: 'Live map currently unavailable',
    uploadProfilePhoto: 'Upload Profile Photo',
    uploadFailed: 'Upload failed. Please ensure the image is JPEG, PNG, or WebP under 5MB.',
    authRequired: 'Authentication Required',
  },

  te: {
    appName: 'వర్క్ మోజో',
    tagline: 'పనిని కనుగొనండి. కార్మికులను పొందండి.',
    workerMode: 'వర్కర్ మోడ్',
    customerMode: 'యజమాని మోడ్',
    available: 'పని కోసం సిద్ధంగా ఉన్నారు',
    busy: 'పనిలో ఉన్నారు',
    away: 'అందుబాటులో లేరు',
    nearbyJobs: 'మీకు దగ్గరలోని పనులు',
    recommendedForYou: 'మీ కోసం సిఫార్సు చేసిన పనులు',
    applyNow: 'దరఖాస్తు చేయండి',
    waitingList: 'వెయిటింగ్ లిస్ట్‌లో చేరండి',
    confirmed: 'పని నిర్ధారించబడింది ✓',
    ongoing: 'పని కొనసాగుతోంది',
    finished: 'పని పూర్తయింది ✓',
    cancelled: 'రద్దు చేయబడింది',
    postJob: 'కొత్త పనిని పోస్ట్ చేయండి',
    workersNeeded: 'కార్మికులు అవసరం',
    matchScore: 'సరిపోలిక',
    reliable: 'విశ్వసనీయత',
    sosEmergency: 'SOS అత్యవసర సహాయం',
    navigate: 'కార్యాలయానికి దారి చూడు',
    liveLocation: 'లైవ్ లొకేషన్ ఆన్',
    save: 'పనిని సేవ్ చేయండి',
    saved: 'సేవ్ చేయబడింది',
    searchPlaceholder: 'డెలివరీ, క్లీనింగ్, లోడింగ్ వెతకండి...',
    filterTitle: 'ఫిల్టర్లు',
    clearFilters: 'అన్నీ తొలగించండి',
    applyFilters: 'ఫిల్టర్లను వర్తింపజేయండి',
    rateExperience: 'మీ అనుభవం ఎలా ఉంది?',
    submitRating: 'రేటింగ్ సమర్పించండి',
    changeLanguage: 'భాష సెట్టింగులు',
    changeMobile: 'మొబైల్ నంబర్ మార్చండి',
    deleteAccount: 'ఖాతాను తొలగించండి',
    mojoHelp: 'మోజో AI సహాయం అడగండి',

    navHome: 'హోమ్',
    navJobs: 'పనులు',
    navMyJobs: 'నా పనులు',
    navApplicants: 'దరఖాస్తుదారులు',
    navPayments: 'చెల్లింపులు',
    navAlerts: 'నోటిఫికేషన్లు',
    navProfile: 'ప్రొఫైల్',

    tabConfirmed: 'నిర్ధారించబడినవి',
    tabOngoing: 'ప్రస్తుతం జరుగుతున్నవి',
    tabApplied: 'దరఖాస్తు చేసినవి',
    tabWaitingList: 'వెయిటింగ్ లిస్ట్',
    tabFinished: 'పూర్తయినవి',
    tabSaved: 'సేవ్ చేసినవి',

    catLoading: 'లోడింగ్ / అన్‌లోడింగ్',
    catCleaning: 'శుభ్రం చేయడం (క్లీనింగ్)',
    catConstruction: 'భవన నిర్మాణం (కన్‌స్ట్రక్షన్)',
    catDelivery: 'డెలివరీ పని',
    catGardening: 'తోట పని (గార్డెనింగ్)',
    catLabour: 'సాధారణ కూలీ',
    catRepair: 'మరమ్మతు (రిపేర్)',
    catShopHelp: 'దుకాణం సహాయం',
    catOther: 'ఇతర పనులు',

    myPreferences: 'నా ప్రాధాన్యతలు',
    jobAlerts: 'పని అలర్ట్‌లు',
    workCategories: 'పని వర్గాలు',
    viewAll: 'అన్నీ చూడండి',
    topWageGigs: 'అధిక వేతనం ఇచ్చే పనులు (₹800+)',
    startingToday: 'ఈ రోజు ప్రారంభమయ్యేవి',
    perShift: 'షిఫ్ట్‌కి',
    fromYou: 'మీ నుండి దూరం',
    slotsOpen: 'ఖాళీలు మిగిలి ఉన్నాయి',
    privacyShielded: 'గోప్యత రక్షించబడింది',
    callOwner: 'యజమానికి కాల్ చేయండి',
    hiringProgress: 'నియామక పురోగతి',
    applicantPipeline: 'దరఖాస్తుదారుల జాబితా',
    reviewApplicants: 'దరఖాస్తులను పరిశీలించండి',
    autoFill: 'ఆటో-సెలెక్ట్',
    compareCandidates: 'అభ్యర్థులను పోల్చండి',
    liveShifts: 'లైవ్ షిఫ్టులు',
    hireAgain: 'మళ్ళీ నియమించండి',
    statusLabel: 'స్థితి:',
    namaste: 'నమస్కారం',

    loginTitle: 'వర్క్ మోజో లాగిన్',
    mobileNumberLabel: 'మొబైల్ సంఖ్య (+91)',
    continueOtp: 'OTP తో కొనసాగించండి',
    verifyOtpTitle: '6-అంకెల OTP ధృవీకరించండి',
    aadhaarVerification: 'ఆధార్ కార్డ్ ధృవీకరణ',
    panVerification: 'పాన్ కార్డ్ ధృవీకరణ',
    livePhotoTitle: 'లైవ్ ఫోటో ఫేస్ క్యాప్చర్',
    kycVerifiedTitle: 'KYC ధృవీకరించబడింది ✓',

    // Payments
    paymentsTitle: 'ఆదాయాలు & చెల్లింపులు',
    totalEarnings: 'మొత్తం సంపాదన',
    inEscrow: 'ఎస్క్రోలో ఉన్న మొత్తం',
    availableBalance: 'అందుబాటులో ఉన్న బ్యాలెన్స్',
    preferredPayoutMethod: 'చెల్లింపు పద్ధతి ఎంపిక',
    onlineInstantPayout: 'ఆన్‌లైన్ చెల్లింపు (యూపీఐ / బ్యాంక్ బదిలీ)',
    offlineCashSettlement: 'ఆఫ్‌లైన్ నగదు చెల్లింపు (నేరుగా నగదు)',
    transactionHistory: 'లావాదేవీల చరిత్ర',
    noTransactions: 'ఇంకా లావాదేవీలు ఏవీ నమోదు కాలేదు',
    directWageRetained: '100% మీ సంపాదన మీదే',
    commissionFreeNotice: 'సున్నా కమీషన్: మీరు సంపాదించిన మొత్తం మీకే చేరుతుంది.',
    payoutUpiNotice: 'షిఫ్ట్ ముగిసిన తర్వాత మీ బ్యాంక్ లేదా యూపీఐకి తక్షణ డిపాజిట్.',
    payoutCashNotice: 'డిజిటల్ రసీదుతో యజమాని నుండి నేరుగా నగదు పొందండి.',
    statusPaid: 'పూర్తయింది',
    statusPending: 'పెండింగ్',
    statusProcessing: 'ప్రాసెసింగ్',
    statusDisputed: 'వివాదం',

    // Customer / Employer
    employerDashboard: 'యజమాని డ్యాష్‌బోర్డ్',
    postNewJobBtn: 'కొత్త పనిని పోస్ట్ చేయండి',
    findWorkersBtn: 'కార్మికులను వెతకండి',
    activePostings: 'యాక్టివ్ పోస్టింగ్‌లు',
    noActivePostings: 'ఇంకా ఏ పనులూ పోస్ట్ చేయలేదు',
    acceptAndHire: 'అంగీకరించి నియమించండి',
    candidateHired: 'వర్కర్ కన్ఫర్మ్ అయ్యారు ✓',
    manageJob: 'పని నిర్వహణ',
    viewApplicants: 'దరఖాస్తుదారులను చూడండి',

    // Post Job Wizard
    stepBasicInfo: 'పని వివరాలు',
    stepLocation: 'పని స్థలం',
    stepWageTiming: 'వేతనం & సమయం',
    stepReview: 'సమీక్షించి పోస్ట్ చేయండి',
    jobTitleLabel: 'పని శీర్షిక',
    jobCategoryLabel: 'వర్గం ఎంచుకోండి',
    jobDescriptionLabel: 'వివరణ & అవసరాలు',
    workplaceLocationLabel: 'ఖచ్చితమైన చిరునామా',
    landmarkLabel: 'సమీప ల్యాండ్‌మార్క్',
    wagePerShiftLabel: 'వర్కర్‌కి వేతనం (₹)',
    shiftTimingLabel: 'ప్రారంభ సమయం',
    workersNeededCountLabel: 'అవసరమైన వర్కర్ల సంఖ్య',
    postJobNowBtn: 'ఇప్పుడే పనిని పోస్ట్ చేయండి',
    postingJobProgress: 'ప్రచురిస్తోంది...',
    jobPostedSuccessMsg: 'పని విజయవంతంగా పోస్ట్ చేయబడింది!',

    // Job Details
    aboutTheWork: 'పని గురించి',
    workplaceLocation: 'పని స్థలం',
    transparentAiMatch: 'పారదర్శక AI మ్యాచ్',
    timingLabel: 'సమయం',
    distanceLabel: 'దూరం',
    requiredLabel: 'అవసరం',
    exactAddressUnlocked: 'నిర్ధారించిన తర్వాత చిరునామా అన్‌లాక్ అవుతుంది',
    cancelSlotBtn: 'నా స్లాట్‌ను రద్దు చేయండి',
    joinWaitingListBtn: 'స్లాట్లు నిండాయి — వెయిటింగ్ లిస్ట్',

    // Profile & Settings
    personalProfile: 'వ్యక్తిగత ప్రొఫైల్',
    workAndSkills: 'పని & నైపుణ్యాలు',
    identityAndKyc: 'గుర్తింపు & KYC',
    switchRoleAction: 'మార్చండి',
    gigsDoneCount: 'పూర్తయిన పనులు',
    postedCount: 'పోస్ట్ చేసినవి',
    experienceCount: 'అనుభవం',
    helpSupport: 'సహాయం & మద్దతు',
    logoutBtn: 'లాగ్ అవుట్',

    // AI & Common
    clearChat: 'చాట్ క్లియర్ చేయండి',
    retryAction: 'మళ్ళీ ప్రయత్నించండి',
    cancelAction: 'రద్దు చేయండి',
    confirmAction: 'నిర్ధారించండి',
    backAction: 'వెనుకకు',
    nextAction: 'తరువాత',
    closeAction: 'మూసివేయండి',

    // Production Readiness
    loginBtn: 'లాగిన్ అవ్వండి',
    signUpBtn: 'సైన్ అప్',
    completeProfile: 'ప్రొఫైల్ పూర్తి చేయండి',
    completeKyc: 'KYC ధృవీకరణ పూర్తి చేయండి',
    otpUnavailable: 'OTP ధృవీకరణ ప్రస్తుతం అందుబాటులో లేదు. దయచేసి కాసేపటి తర్వాత ప్రయత్నించండి.',
    invalidOtp: 'చెల్లని లేదా గడువు ముగిసిన OTP. దయచేసి మళ్లీ ప్రయత్నించండి.',
    cancelJob: 'ఉద్యోగాన్ని రద్దు చేయండి',
    cancelJobConfirm: 'మీరు ఖచ్చితంగా ఈ ఉద్యోగాన్ని రద్దు చేయాలనుకుంటున్నారా? ఇది దరఖాస్తుదారులందరికీ తెలియజేస్తుంది.',
    jobCancelled: 'ఉద్యోగం రద్దు చేయబడింది',
    mapLoading: 'లైవ్ మ్యాప్ లోడ్ అవుతోంది...',
    mapUnavailable: 'లైవ్ మ్యాప్ ప్రస్తుతం అందుబాటులో లేదు',
    uploadProfilePhoto: 'ప్రొఫైల్ ఫోటో అప్‌లోడ్ చేయండి',
    uploadFailed: 'అప్‌లోడ్ విఫలమైంది. 5MB లోపు చిత్రం మాత్రమే అప్‌లోడ్ చేయండి.',
    authRequired: 'లాగిన్ అవసరం',
  },

  hi: {
    appName: 'वर्क मोजो',
    tagline: 'काम खोजें। कामगार पाएं। काम पूरा करें।',
    workerMode: 'कामगार मोड',
    customerMode: 'नियोक्ता मोड',
    available: 'काम के लिए उपलब्ध',
    busy: 'काम में व्यस्त',
    away: 'अनुपलब्ध',
    nearbyJobs: 'आपके निकटतम काम',
    recommendedForYou: 'आपके लिए अनुशंसित',
    applyNow: 'आवेदन करें',
    waitingList: 'प्रतीक्षा सूची में जुड़ें',
    confirmed: 'काम पक्का हुआ ✓',
    ongoing: 'काम प्रगति पर है',
    finished: 'काम पूरा हुआ ✓',
    cancelled: 'रद्द किया गया',
    postJob: 'नया काम पोस्ट करें',
    workersNeeded: 'कामगारों की आवश्यकता',
    matchScore: 'मैच',
    reliable: 'विश्वसनीय',
    sosEmergency: 'SOS आपातकालीन सहायता',
    navigate: 'कार्यस्थल का रास्ता देखें',
    liveLocation: 'लाइव लोकेशन चालू',
    save: 'काम सेव करें',
    saved: 'सेव किया गया',
    searchPlaceholder: 'डिलीवरी, सफाई, लोडिंग खोजें...',
    filterTitle: 'फ़िल्टर',
    clearFilters: 'सभी हटाएं',
    applyFilters: 'फ़िल्टर लागू करें',
    rateExperience: 'आपका अनुभव कैसा रहा?',
    submitRating: 'रेटिंग जमा करें',
    changeLanguage: 'भाषा सेटिंग',
    changeMobile: 'मोबाइल नंबर बदलें',
    deleteAccount: 'खाता हटाएं',
    mojoHelp: 'मोजो AI से पूछें',

    navHome: 'होम',
    navJobs: 'काम',
    navMyJobs: 'मेरे काम',
    navApplicants: 'आवेदक',
    navPayments: 'भुगतान',
    navAlerts: 'अलर्ट्स',
    navProfile: 'प्रोफ़ाइल',

    tabConfirmed: 'पक्के काम',
    tabOngoing: 'जारी काम',
    tabApplied: 'आवेदन किए गए',
    tabWaitingList: 'प्रतीक्षा सूची',
    tabFinished: 'पूर्ण काम',
    tabSaved: 'सेव किए गए',

    catLoading: 'लोडिंग / अनलोडिंग',
    catCleaning: 'सफाई कार्य',
    catConstruction: 'भवन निर्माण (कंस्ट्रक्शन)',
    catDelivery: 'डिलीवरी कार्य',
    catGardening: 'बागवानी',
    catLabour: 'सामान्य मजदूरी',
    catRepair: 'मरम्मत कार्य',
    catShopHelp: 'दुकान सहायक',
    catOther: 'अन्य काम',

    myPreferences: 'मेरी प्राथमिकताएं',
    jobAlerts: 'जॉब अलर्ट्स',
    workCategories: 'काम की श्रेणियां',
    viewAll: 'सभी देखें',
    topWageGigs: 'अधिक वेतन वाले काम (₹800+)',
    startingToday: 'आज शुरू होने वाले',
    perShift: 'प्रति पाली (शिफ्ट)',
    fromYou: 'आपसे दूरी',
    slotsOpen: 'पद उपलब्ध हैं',
    privacyShielded: 'गोपनीयता सुरक्षित',
    callOwner: 'मालिक को कॉल करें',
    hiringProgress: 'नियुक्ति प्रगति',
    applicantPipeline: 'आवेदकों की सूची',
    reviewApplicants: 'आवेदकों की समीक्षा करें',
    autoFill: 'ऑटो-चयन',
    compareCandidates: 'उम्मीदवारों की तुलना करें',
    liveShifts: 'सक्रिय शिफ्ट',
    hireAgain: 'फिर से काम दें',
    statusLabel: 'स्थिति:',
    namaste: 'नमस्ते',

    loginTitle: 'वर्क मोजो में लॉगिन करें',
    mobileNumberLabel: 'मोबाइल नंबर (+91)',
    continueOtp: 'OTP के साथ आगे बढ़ें',
    verifyOtpTitle: '6-अंकों का OTP सत्यापित करें',
    aadhaarVerification: 'आधार कार्ड सत्यापन',
    panVerification: 'पैन कार्ड सत्यापन',
    livePhotoTitle: 'लाइव फोटो चेहरा सत्यापन',
    kycVerifiedTitle: 'KYC सत्यापित ✓',

    // Payments
    paymentsTitle: 'कमाई एवं भुगतान',
    totalEarnings: 'कुल कमाई',
    inEscrow: 'एस्क्रो में सुरक्षित राशि',
    availableBalance: 'उपलब्ध शेष राशि',
    preferredPayoutMethod: 'भुगतान का पसंदीदा तरीका',
    onlineInstantPayout: 'ऑनलाइन भुगतान (यूपीआई / बैंक खाता)',
    offlineCashSettlement: 'ऑफलाइन नकद भुगतान (सीधे नकद)',
    transactionHistory: 'लेन-देन इतिहास',
    noTransactions: 'अभी कोई लेन-देन दर्ज नहीं है',
    directWageRetained: '100% प्रत्यक्ष मजदूरी आपकी',
    commissionFreeNotice: 'शून्य कमीशन: आपकी कमाई का 100% सीधे आपको मिलता है।',
    payoutUpiNotice: 'शिफ्ट समाप्त होते ही सीधे आपके बैंक या यूपीआई में भुगतान।',
    payoutCashNotice: 'डिजिटल रसीद के साथ नियोक्ता से सीधे नकद प्राप्त करें।',
    statusPaid: 'भुगतान हुआ',
    statusPending: 'लंबित',
    statusProcessing: 'प्रक्रियाधीन',
    statusDisputed: 'विवादित',

    // Customer / Employer
    employerDashboard: 'नियोक्ता डैशबोर्ड',
    postNewJobBtn: 'नया काम पोस्ट करें',
    findWorkersBtn: 'कामगार खोजें',
    activePostings: 'सक्रिय पोस्टिंग',
    noActivePostings: 'अभी कोई सक्रिय पोस्टिंग नहीं है',
    acceptAndHire: 'स्वीकार करें और काम दें',
    candidateHired: 'कामगार नियुक्त हुआ ✓',
    manageJob: 'काम प्रबंधन',
    viewApplicants: 'आवेदक देखें',

    // Post Job Wizard
    stepBasicInfo: 'काम का विवरण',
    stepLocation: 'कार्यस्थल',
    stepWageTiming: 'वेतन एवं समय',
    stepReview: 'समीक्षा करें और पोस्ट करें',
    jobTitleLabel: 'काम का शीर्षक',
    jobCategoryLabel: 'श्रेणी चुनें',
    jobDescriptionLabel: 'विवरण एवं आवश्यकताएं',
    workplaceLocationLabel: 'कार्यस्थल का पता',
    landmarkLabel: 'निकटतम लैंडमार्क',
    wagePerShiftLabel: 'प्रति कामगार वेतन (₹)',
    shiftTimingLabel: 'प्रारंभ समय',
    workersNeededCountLabel: 'आवश्यक कामगार संख्या',
    postJobNowBtn: 'अभी काम पोस्ट करें',
    postingJobProgress: 'प्रकाशित हो रहा है...',
    jobPostedSuccessMsg: 'काम सफलतापूर्वक पोस्ट किया गया!',

    // Job Details
    aboutTheWork: 'काम के बारे में',
    workplaceLocation: 'कार्यस्थल का स्थान',
    transparentAiMatch: 'पारदर्शी AI मैच',
    timingLabel: 'समय',
    distanceLabel: 'दूरी',
    requiredLabel: 'आवश्यकता',
    exactAddressUnlocked: 'काम पक्का होने पर सटीक पता दिखेगा',
    cancelSlotBtn: 'मेरा स्लॉट रद्द करें',
    joinWaitingListBtn: 'स्लॉट भर गया — वेटिंग लिस्ट',

    // Profile & Settings
    personalProfile: 'व्यक्तिगत प्रोफ़ाइल',
    workAndSkills: 'काम और कौशल',
    identityAndKyc: 'पहचान और KYC',
    switchRoleAction: 'बदलें',
    gigsDoneCount: 'पूरे किए काम',
    postedCount: 'पोस्ट किए गए',
    experienceCount: 'अनुभव',
    helpSupport: 'सहायता एवं संपर्क',
    logoutBtn: 'लॉग आउट',

    // AI & Common
    clearChat: 'चैट साफ़ करें',
    retryAction: 'पुन: प्रयास करें',
    cancelAction: 'रद्द करें',
    confirmAction: 'पुष्टि करें',
    backAction: 'पीछे',
    nextAction: 'आगे',
    closeAction: 'बंद करें',

    // Production Readiness
    loginBtn: 'लॉग इन करें',
    signUpBtn: 'साइन अप',
    completeProfile: 'प्रोफ़ाइल पूरा करें',
    completeKyc: 'KYC सत्यापन पूरा करें',
    otpUnavailable: 'OTP सत्यापन वर्तमान में अनुपलब्ध है। कृपया बाद में पुनः प्रयास करें।',
    invalidOtp: 'अमान्य या समाप्त OTP कोड। कृपया पुन: प्रयास करें।',
    cancelJob: 'काम रद्द करें',
    cancelJobConfirm: 'क्या आप वाकई इस काम को रद्द करना चाहते हैं? इससे सभी आवेदकों को सूचित किया जाएगा।',
    jobCancelled: 'काम रद्द कर दिया गया',
    mapLoading: 'लाइव मानचित्र लोड हो रहा है...',
    mapUnavailable: 'लाइव मानचित्र वर्तमान में अनुपलब्ध है',
    uploadProfilePhoto: 'प्रोफ़ाइल फ़ोटो अपलोड करें',
    uploadFailed: 'अपलोड विफल रहा। कृपया 5MB से कम आकार की JPEG, PNG या WebP फ़ोटो चुनें।',
    authRequired: 'प्रमाणीकरण आवश्यक है',
  },

  ta: {
    appName: 'ஒர்க் மோஜோ',
    tagline: 'வேலை தேடுங்கள். பணியாளர்களை பெறுங்கள்.',
    workerMode: 'தொழிலாளி பயன்முறை',
    customerMode: 'முதலாளி பயன்முறை',
    available: 'வேலைக்கு தயார்',
    busy: 'வேலையில் உள்ளார்',
    away: 'இல்லை',
    nearbyJobs: 'அருகிலுள்ள வேலைகள்',
    recommendedForYou: 'உங்களுக்கான பரிந்துரைகள்',
    applyNow: 'விண்ணப்பிக்கவும்',
    waitingList: 'காத்திருப்பு பட்டியலில் சேரவும்',
    confirmed: 'வேலை உறுதி செய்யப்பட்டது ✓',
    ongoing: 'வேலை நடைபெறுகிறது',
    finished: 'வேலை முடிந்தது ✓',
    cancelled: 'ரத்து செய்யப்பட்டது',
    postJob: 'புதிய வேலை பதிவு செய்க',
    workersNeeded: 'பணியாளர்கள் தேவை',
    matchScore: 'பொருத்தம்',
    reliable: 'நம்பகமான',
    sosEmergency: 'SOS அவசர உதவி',
    navigate: 'பணி இடத்திற்கு வழிகாட்டு',
    liveLocation: 'நேரலை இருப்பிடம்',
    save: 'சேமிக்க',
    saved: 'சேமிக்கப்பட்டது',
    searchPlaceholder: 'டெலிவரி, சுத்தம், ஏற்றுதல் தேடவும்...',
    filterTitle: 'வடிகட்டிகள்',
    clearFilters: 'அனைத்தையும் நீக்குக',
    applyFilters: 'பயன்படுத்துக',
    rateExperience: 'உங்கள் அனுபவம் எப்படி இருந்தது?',
    submitRating: 'மதிப்பீடு சமர்ப்பிக்கவும்',
    changeLanguage: 'மொழி அமைப்புகள்',
    changeMobile: 'மொபைல் எண்ணை மாற்றுக',
    deleteAccount: 'கணக்கை நீக்குக',
    mojoHelp: 'மோஜோ AI உதவியாளரிடம் கேட்கவும்',

    navHome: 'முகப்பு',
    navJobs: 'வேலைகள்',
    navMyJobs: 'என் வேலைகள்',
    navApplicants: 'விண்ணப்பதாரர்கள்',
    navPayments: 'பணம்',
    navAlerts: 'அறிவிப்புகள்',
    navProfile: 'சுயவிவரம்',

    tabConfirmed: 'உறுதிசெய்யப்பட்டது',
    tabOngoing: 'நடைபெறுகிறது',
    tabApplied: 'விண்ணப்பித்தது',
    tabWaitingList: 'காத்திருப்பு பட்டியல்',
    tabFinished: 'முடிந்தது',
    tabSaved: 'சேமிக்கப்பட்டது',

    catLoading: 'ஏற்றுதல் / இறக்குதல்',
    catCleaning: 'சுத்தம் செய்தல்',
    catConstruction: 'கட்டுமான வேலை',
    catDelivery: 'டெலிவரி வேலை',
    catGardening: 'தோட்ட வேலை',
    catLabour: 'பொது கூலி வேலை',
    catRepair: 'பழுதுபார்த்தல்',
    catShopHelp: 'கடை உதவி',
    catOther: 'மற்ற வேலைகள்',

    myPreferences: 'என் விருப்பங்கள்',
    jobAlerts: 'வேலை அறிவிப்புகள்',
    workCategories: 'வேலை பிரிவுகள்',
    viewAll: 'அனைத்தும் காண்க',
    topWageGigs: 'அதிக ஊதிய வேலைகள் (₹800+)',
    startingToday: 'இன்று தொடங்கும் வேலைகள்',
    perShift: 'ஒரு ஷிப்ட்டிற்கு',
    fromYou: 'உங்களிடமிருந்து',
    slotsOpen: 'இடங்கள் உள்ளன',
    privacyShielded: 'தனியுரிமை பாதுகாக்கப்பட்டது',
    callOwner: 'உரிமையாளரை அழைக்கவும்',
    hiringProgress: 'ஆட்சேர்ப்பு முன்னேற்றம்',
    applicantPipeline: 'விண்ணப்பதாரர் பட்டியல்',
    reviewApplicants: 'விண்ணப்பதாரர்களை காண்க',
    autoFill: 'தானியங்கி தேர்வு',
    compareCandidates: 'ஒப்பீடு செய்க',
    liveShifts: 'நேரலை ஷிப்ட்கள்',
    hireAgain: 'மீண்டும் பணியமர்த்துக',
    statusLabel: 'நிலை:',
    namaste: 'வணக்கம்',

    loginTitle: 'ஒர்க் மோஜோவில் நுழையவும்',
    mobileNumberLabel: 'மொபைல் எண் (+91)',
    continueOtp: 'OTP உடன் தொடரவும்',
    verifyOtpTitle: '6-இலக்க OTP சரிபார்க்கவும்',
    aadhaarVerification: 'ஆதார் அட்டை சரிபார்ப்பு',
    panVerification: 'பான் அட்டை சரிபார்ப்பு',
    livePhotoTitle: 'நேரலை புகைப்பட சரிபார்ப்பு',
    kycVerifiedTitle: 'KYC சரிபார்க்கப்பட்டது ✓',

    // Payments
    paymentsTitle: 'வருமானம் & கட்டணங்கள்',
    totalEarnings: 'மொத்த வருமானம்',
    inEscrow: 'எஸ்க்ரோவில் உள்ள தொகை',
    availableBalance: 'கிடைக்கும் இருப்பு',
    preferredPayoutMethod: 'கட்டண முறை தேர்வு',
    onlineInstantPayout: 'ஆன்லைன் கட்டணம் (யுபிஐ / வங்கி)',
    offlineCashSettlement: 'நேரடி ரொக்கப் பணம் (ரொக்கம்)',
    transactionHistory: 'பரிவர்த்தனை வரலாறு',
    noTransactions: 'இன்னும் பரிவர்த்தனைகள் எதுவும் இல்லை',
    directWageRetained: '100% நேரடி ஊதியம் உங்களுக்கே',
    commissionFreeNotice: 'கமிஷன் இல்லை: நீங்கள் ஈட்டிய முழுத் தொகையும் உங்களுக்கே கிடைக்கும்.',
    payoutUpiNotice: 'வேலை முடிந்ததும் உங்கள் வங்கி அல்லது யுபிஐ கணக்கில் உடனடி வரவு.',
    payoutCashNotice: 'டிஜிட்டல் ரசீதுடன் முதலாளியிடமிருந்து நேரடியாக ரொக்கமாகப் பெறவும்.',
    statusPaid: 'செலுத்தப்பட்டது',
    statusPending: 'நிலுவையில்',
    statusProcessing: 'செயல்பாட்டில்',
    statusDisputed: 'சர்ச்சை',

    // Customer / Employer
    employerDashboard: 'முதலாளி டாஷ்போர்டு',
    postNewJobBtn: 'புதிய வேலை பதிவு செய்க',
    findWorkersBtn: 'தொழிலாளர்களைத் தேடுக',
    activePostings: 'செயலில் உள்ள பதிவுகள்',
    noActivePostings: 'இன்னும் எந்த வேலை பதிவும் இல்லை',
    acceptAndHire: 'ஏற்றுக்கொண்டு பணியமர்த்துக',
    candidateHired: 'தொழிலாளி உறுதியாக்கப்பட்டார் ✓',
    manageJob: 'வேலை மேலாண்மை',
    viewApplicants: 'விண்ணப்பதாரர்களைப் பார்க்க',

    // Post Job Wizard
    stepBasicInfo: 'வேலை விவரங்கள்',
    stepLocation: 'பணி இடம்',
    stepWageTiming: 'ஊதியம் & நேரம்',
    stepReview: 'மதிப்பாய்வு செய்து பதிவு செய்க',
    jobTitleLabel: 'வேலை தலைப்பு',
    jobCategoryLabel: 'பிரிவை தேர்வு செய்யவும்',
    jobDescriptionLabel: 'விளக்கம் & தேவைகள்',
    workplaceLocationLabel: 'சரியான முகவரி',
    landmarkLabel: 'அருகிலுள்ள அடையாளம்',
    wagePerShiftLabel: 'தொழிலாளிக்கான ஊதியம் (₹)',
    shiftTimingLabel: 'தொடங்கும் நேரம்',
    workersNeededCountLabel: 'தேவைப்படும் தொழிலாளர்கள்',
    postJobNowBtn: 'இப்போது பதிவு செய்யவும்',
    postingJobProgress: 'பதிவிடப்படுகிறது...',
    jobPostedSuccessMsg: 'வேலை வெற்றிகரமாக பதிவு செய்யப்பட்டது!',

    // Job Details
    aboutTheWork: 'வேலை பற்றி',
    workplaceLocation: 'பணி இடம்',
    transparentAiMatch: 'வெளிப்படையான AI பொருத்தம்',
    timingLabel: 'நேரம்',
    distanceLabel: 'தூரம்',
    requiredLabel: 'தேவை',
    exactAddressUnlocked: 'உறுதிசெய்த பின்னர் முகவரி திறக்கப்படும்',
    cancelSlotBtn: 'என் இடத்தை ரத்து செய்',
    joinWaitingListBtn: 'இடங்கள் நிரம்பின — காத்திருப்பு பட்டியல்',

    // Profile & Settings
    personalProfile: 'சுயவிவரம்',
    workAndSkills: 'வேலை & திறன்கள்',
    identityAndKyc: 'அடையாளம் & KYC',
    switchRoleAction: 'மாற்றுக',
    gigsDoneCount: 'முடித்த வேலைகள்',
    postedCount: 'பதிவிட்டவை',
    experienceCount: 'அனுபவம்',
    helpSupport: 'உதவி & ஆதரவு',
    logoutBtn: 'வெளியேறு',

    // AI & Common
    clearChat: 'அரட்டையை அழிக்க',
    retryAction: 'மீண்டும் முயற்சிக்கவும்',
    cancelAction: 'ரத்து செய்',
    confirmAction: 'உறுதிப்படுத்து',
    backAction: 'பின்னால்',
    nextAction: 'அடுத்து',
    closeAction: 'மூடுக',

    // Production Readiness
    loginBtn: 'உள்நுழைக',
    signUpBtn: 'பதிவு செய்க',
    completeProfile: 'சுயவிவரத்தை நிறைவு செய்க',
    completeKyc: 'KYC சரிபார்ப்பை முடிக்கவும்',
    otpUnavailable: 'OTP சரிபார்ப்பு தற்போது கிடைக்கவில்லை. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.',
    invalidOtp: 'தவறான அல்லது காலாவதியான OTP குறியீடு. மீண்டும் முயற்சிக்கவும்.',
    cancelJob: 'வேலையை ரத்து செய்',
    cancelJobConfirm: 'இந்த வேலையை நிச்சயமாக ரத்து செய்ய விரும்புகிறீர்களா? இது அனைத்து விண்ணப்பதாரர்களுக்கும் அறிவிக்கும்.',
    jobCancelled: 'வேலை ரத்து செய்யப்பட்டது',
    mapLoading: 'நேரலை வரைபடம் ஏற்றப்படுகிறது...',
    mapUnavailable: 'நேரலை வரைபடம் தற்போது கிடைக்கவில்லை',
    uploadProfilePhoto: 'சுயவிவரப் புகைப்படத்தைப் பதிவேற்றவும்',
    uploadFailed: 'பதிவேற்றம் தோல்வியடைந்தது. 5MB க்கும் குறைவான புகைப்படத்தைத் தேர்ந்தெடுக்கவும்.',
    authRequired: 'உள்நுழைவு தேவை',
  },
};
