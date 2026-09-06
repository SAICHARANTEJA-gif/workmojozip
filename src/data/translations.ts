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
  },

  te: {
    appName: 'వర్క్ మోజో',
    tagline: 'పనిని కనుగొనండి. కార్మికులను పొందండి.',
    workerMode: 'కార్మికుల మోడ్',
    customerMode: 'కస్టమర్ మోడ్',
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
    postJob: 'కొత్త పనిని నమోదు చేయండి (కార్మికులను పొందండి)',
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
  },

  hi: {
    appName: 'वर्क मोजो',
    tagline: 'काम खोजें। कामगार पाएं। काम पूरा करें।',
    workerMode: 'कामगार मोड',
    customerMode: 'ग्राहक मोड',
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
    postJob: 'नया काम पोस्ट करें (कामगार खोजें)',
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
  },

  ta: {
    appName: 'ஒர்க் மோஜோ',
    tagline: 'வேலை தேடுங்கள். பணியாளர்களை பெறுங்கள்.',
    workerMode: 'பணியாளர் பயன்முறை',
    customerMode: 'வாடிக்கையாளர் பயன்முறை',
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
    postJob: 'புதிய வேலை பதிவு செய்க (பணியாளர்களை பெறுக)',
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
  },
};
