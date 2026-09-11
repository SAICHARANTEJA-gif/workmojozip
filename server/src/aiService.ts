// WorkMojo Multilingual AI Service (Backend)
// Supports 23 WorkMojo Intents, Multi-turn Conversation State, Google Gemini, OpenAI, & Domain Engine

export type MojoIntent =
  | 'GREETING'
  | 'JOB_POSTING_START'
  | 'JOB_POSTING_HELP'
  | 'JOB_TITLE'
  | 'JOB_CATEGORY'
  | 'JOB_DESCRIPTION'
  | 'JOB_LOCATION'
  | 'JOB_DATE'
  | 'JOB_START_TIME'
  | 'JOB_END_TIME'
  | 'JOB_WAGE'
  | 'WORKER_COUNT'
  | 'WORKER_SELECTION'
  | 'WORKER_SEARCH'
  | 'WORKER_PROFILE'
  | 'APPLICATION_STATUS'
  | 'PAYMENT_HELP'
  | 'JOB_CANCELLATION'
  | 'JOB_EDIT'
  | 'JOB_STATUS'
  | 'AI_MATCHING_HELP'
  | 'LANGUAGE_CHANGE'
  | 'GENERAL_WORKMOJO_HELP'
  | 'UNKNOWN';

export interface JobDraft {
  title?: string;
  category?: string;
  description?: string;
  workersRequired?: number;
  wage?: number;
  startTime?: string;
  endTime?: string;
  location?: string;
  date?: string;
  selectionMode?: 'manual' | 'auto';
}

export interface ConversationState {
  lastIntent?: MojoIntent;
  jobDraft?: JobDraft;
  activeJobId?: string;
  pendingConfirmation?: 'CANCEL_JOB' | string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
  }>;
}

export interface ExtractedEntities {
  workersRequired?: number;
  category?: string;
  wage?: number;
  location?: string;
  startTime?: string;
  endTime?: string;
  date?: string;
  title?: string;
  description?: string;
  targetLanguage?: 'en' | 'te' | 'hi' | 'ta';
  isQuery?: boolean;
  confirmationStatus?: 'confirmed' | 'declined';
}

export interface AiChatAction {
  type: string;
  target?: string;
  label?: string;
  filterCategory?: string;
  minWage?: number;
  jobDraft?: JobDraft;
  jobId?: string;
  language?: 'en' | 'te' | 'hi' | 'ta';
}

export interface AiChatRequest {
  message: string;
  language?: 'en' | 'te' | 'hi' | 'ta';
  role?: 'worker' | 'customer';
  conversationState?: ConversationState;
  context?: {
    activeScreen?: string;
    skills?: string[];
    location?: string;
    conversationState?: ConversationState;
    activeJobId?: string;
  };
}

export interface AiChatResponse {
  success: boolean;
  reply: string;
  language: 'en' | 'te' | 'hi' | 'ta';
  provider: 'gemini' | 'openai' | 'mojo-engine';
  intent?: MojoIntent;
  entities?: ExtractedEntities;
  conversationState?: ConversationState;
  action?: AiChatAction;
}

// ---------------------------------------------------------------------------
// Multilingual Number Word Maps
// ---------------------------------------------------------------------------
const NUMBER_WORDS: Record<string, number> = {
  // English
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
  thirty: 30, forty: 40, fifty: 50,
  // Telugu
  'ఒకటి': 1, 'ఒకరు': 1, 'ఒక': 1,
  'ఇద్దరు': 2, 'రెండు': 2,
  'ముగ్గురు': 3, 'మూడు': 3,
  'నలుగురు': 4, 'నాలుగు': 4,
  'ఐదుగురు': 5, 'ఐదు': 5,
  'ఆరుగురు': 6, 'ఆరు': 6,
  'ఏడుగురు': 7, 'ఏడు': 7,
  'ఎనిమిది': 8,
  'తొమ్మిది': 9,
  'పది': 10,
  'ఇరవై': 20,
  // Hindi
  'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4,
  'पांच': 5, 'पाँच': 5, 'छह': 6, 'सात': 7,
  'आठ': 8, 'नौ': 9, 'दस': 10, 'बीस': 20, 'पचास': 50,
  // Tamil
  'ஒன்று': 1, 'ஒருவர்': 1,
  'இரண்டு': 2, 'இருவர்': 2,
  'மூன்று': 3, 'மூவர்': 3,
  'நான்கு': 4, 'நால்வர்': 4,
  'ஐந்து': 5, 'ஐவர்': 5,
  'ஆறு': 6, 'ஏழு': 7, 'எட்டு': 8, 'ஒன்பது': 9, 'பத்து': 10, 'இருபது': 20,
};

// Category Mapping helper
export function extractCategory(text: string): { category: string; labelEn: string; labelTe: string; labelHi: string; labelTa: string } | null {
  const q = text.toLowerCase();
  if (q.includes('plumb') || q.includes('ప్లంబ') || q.includes('प्लंबर') || q.includes('பிளம்ப')) {
    return { category: 'Plumbing', labelEn: 'Plumber', labelTe: 'ప్లంబర్', labelHi: 'प्लंबर', labelTa: 'பிளம்பர்' };
  }
  if (q.includes('electr') || q.includes('ఎలక్ట్రీ') || q.includes('इलेक्ट्री') || q.includes('மின்சார') || q.includes('எலக்ட்ரீ')) {
    return { category: 'Electrical Work', labelEn: 'Electrician', labelTe: 'ఎలక్ట్రీషియన్', labelHi: 'इलेक्ट्रीशियन', labelTa: 'எலக்ட்ரீஷியன்' };
  }
  if (q.includes('paint') || q.includes('పెయింట') || q.includes('पेंटर') || q.includes('வண்ண') || q.includes('பெயிண்ட')) {
    return { category: 'Painting', labelEn: 'Painter', labelTe: 'పెయింటర్', labelHi: 'पेंटर', labelTa: 'பெயிண்டர்' };
  }
  if (q.includes('carpent') || q.includes('వడ్రంగి') || q.includes('బడాయి') || q.includes('बढ़ई') || q.includes('தச்சர்')) {
    return { category: 'Carpentry', labelEn: 'Carpenter', labelTe: 'కార్పెంటర్', labelHi: 'बढ़ई / कारपेंटर', labelTa: 'தச்சர்' };
  }
  if (q.includes('mason') || q.includes('తాపీ') || q.includes('మిస్త్రీ') || q.includes('मिस्त्री') || q.includes('கொத்தனார்')) {
    return { category: 'Masonry', labelEn: 'Mason', labelTe: 'తాపీ మేస్త్రీ', labelHi: 'मिस्त्री (राजमिस्त्री)', labelTa: 'கொத்தனார்' };
  }
  if (q.includes('clean') || q.includes('housekeep') || q.includes('శుభ్రం') || q.includes('సఫాయి') || q.includes('सफाई') || q.includes('துப்புரவு') || q.includes('சுத்தம்')) {
    return { category: 'Cleaning', labelEn: 'Cleaner', labelTe: 'క్లీనర్', labelHi: 'సఫాయి సహాయకుడు', labelTa: 'துப்புரவாளர்' };
  }
  if (q.includes('cook') || q.includes('chef') || q.includes('వంట') || q.includes('रसोइ') || q.includes('சமையல்')) {
    return { category: 'Cooking', labelEn: 'Cook', labelTe: 'వంట మనిషి', labelHi: 'रसोइया', labelTa: 'சமையல்காரர்' };
  }
  if (q.includes('driv') || q.includes('డ్రైవ') || q.includes('ड्राइव') || q.includes('ஓட்டுநர்')) {
    return { category: 'Driving', labelEn: 'Driver', labelTe: 'డ్రైవర్', labelHi: 'ड्राइवर', labelTa: 'ஓட்டுநர்' };
  }
  if (q.includes('garden') || q.includes('తోట') || q.includes('माली') || q.includes('தோட்டம்')) {
    return { category: 'Gardening', labelEn: 'Gardener', labelTe: 'తోటమాలి', labelHi: 'माली', labelTa: 'தோட்டக்காரர்' };
  }
  if (q.includes('secur') || q.includes('guard') || q.includes('గార్డ్') || q.includes('सुरक्षा') || q.includes('பாதுகாவலர்')) {
    return { category: 'Security', labelEn: 'Security Guard', labelTe: 'సెక్యూరిటీ గార్డ్', labelHi: 'सुरक्षा गार्ड', labelTa: 'பாதுகாவலர்' };
  }
  if (q.includes('construct') || q.includes('building') || q.includes('నిర్మాణ') || q.includes('భవన') || q.includes('निर्माण') || q.includes('கட்டுமான')) {
    return { category: 'Construction', labelEn: 'Construction Worker', labelTe: 'నిర్మాణ వర్కర్', labelHi: 'निर्माण मजदूर', labelTa: 'கட்டுமான தொழிலாளி' };
  }
  if (q.includes('load') || q.includes('unload') || q.includes('shifting') || q.includes('warehouse') || q.includes('గోడౌన్') || q.includes('లోడింగ్') || q.includes('लोडिंग') || q.includes('ஏற்றுதல்') || q.includes('இறக்குதல்')) {
    return { category: 'Loading/Unloading', labelEn: 'Loading Helper', labelTe: 'లోడింగ్ హెల్పర్', labelHi: 'लोडिंग सहायक', labelTa: 'ஏற்றுதல் உதவியாளர்' };
  }
  if (q.includes('repair') || q.includes('రిపేర్') || q.includes('मरम्मत') || q.includes('பழுது')) {
    return { category: 'Repair', labelEn: 'Repair Technician', labelTe: 'రిపేర్ టెక్నీషియన్', labelHi: 'मरम्मत तकनीशियन', labelTa: 'பழுதுபார்ப்பவர்' };
  }
  return null;
}

// Extract positive integer worker count from digits or words across EN/TE/HI/TA
export function extractWorkerCount(text: string): number | null {
  const clean = text.toLowerCase().trim();

  // Pattern 1: Incremental "Actually change that to eight", "Change it to 8", "make it 5", "change count to 10", "update to 12"
  const changeRegex = /(?:change(?:\s+(?:it|that|the\s+count|count))?\s+to|make\s+(?:it|that)|update\s+(?:it|that)?\s*to|set(?:\s+(?:it|that))?\s+to)\s*(\d+|[a-z\u0C00-\u0C7F\u0900-\u097F\u0B80-\u0BFF]+)/i;
  const changeMatch = clean.match(changeRegex);
  if (changeMatch && changeMatch[1]) {
    const rawVal = changeMatch[1].trim();
    const asNum = parseInt(rawVal, 10);
    if (!isNaN(asNum) && asNum > 0) return asNum;
    if (NUMBER_WORDS[rawVal]) return NUMBER_WORDS[rawVal];
  }

  // Pattern 2: Explicit digits with or without unit (e.g. "5 workers", "10 helpers", "8 మంది", "4 मजदूर", "3 தொழிலாளர்கள்")
  const digitRegex = /\b(\d+)\s*(?:workers?|helpers?|electricians?|painters?|plumbers?|masons?|labours?|people|persons?|మంది|మనుషులు|मजदूर|कामगार|कारीगर|தொழிலாளர்கள்|ஆட்கள்)?\b/i;
  const digitMatch = clean.match(digitRegex);
  if (digitMatch && digitMatch[1]) {
    const parsed = parseInt(digitMatch[1], 10);
    // Avoid confusing wage amounts like 800 with worker count
    if (!isNaN(parsed) && parsed > 0 && parsed <= 100) {
      const matchStr = digitMatch[0];
      const isExplicitWorkerUnit = /(?:workers?|helpers?|electricians?|painters?|plumbers?|masons?|labours?|people|persons?|మంది|మనుషులు|मजदूर|कामगार|कारीगर|தொழிலாளர்கள்|ஆட்கள்)/i.test(matchStr);
      if (isExplicitWorkerUnit) {
        return parsed;
      }
      const fullMatchIdx = clean.indexOf(matchStr);
      const surrounding = clean.substring(Math.max(0, fullMatchIdx - 8), Math.min(clean.length, fullMatchIdx + matchStr.length + 12));
      const isCurrencyContext = /₹|\brs\.?\b|\brupees?\b|\bper\s*day\b|\bవేతనం\b|\bజీతం\b|\bमजदूरी\b|\bवेतन\b|\bஊதியம்\b/i.test(surrounding);
      const isTimeContext = /\b(?:am|pm|a\.m\.|p\.m\.|o'?clock|hours?|hrs?|shift|timing|starts?|ends?|గంటలు|గంటల|బజే|घंटे|மணி)\b/i.test(surrounding);
      if (!isCurrencyContext && !isTimeContext) {
        return parsed;
      }
    }
  }

  // Pattern 3: Multilingual number words (e.g. "three electricians", "ముగ్గురు ఎలక్ట్రీషియన్లు", "आठ पेंटर")
  const tokens = clean.split(/[\s,.-]+/);
  for (const token of tokens) {
    if (NUMBER_WORDS[token]) {
      return NUMBER_WORDS[token];
    }
  }

  // Pattern 4: Combined multi-word checks like "ఎనిమిది మంది", "ఐదుగురు", "నలుగురు"
  for (const [phrase, count] of Object.entries(NUMBER_WORDS)) {
    if (clean.includes(phrase)) {
      return count;
    }
  }

  return null;
}

// Extract wage if mentioned (e.g. "₹800", "800 rupees", "wage 900", "pay 1000", "set the wage to 900")
export function extractWage(text: string): number | null {
  const clean = text.toLowerCase();
  const wageRegex = /(?:wage|pay|salary|rate|జీతం|వేతనం|वेतन|मजदूरी|ஊதியம்|₹|rs\.?)\s*(?:is|to|:|=)?\s*(\d{3,5})/i;
  const m = clean.match(wageRegex);
  if (m && m[1]) {
    const val = parseInt(m[1], 10);
    if (!isNaN(val) && val >= 100) return val;
  }
  const standaloneCurrency = /₹\s*(\d{3,5})/;
  const m2 = clean.match(standaloneCurrency);
  if (m2 && m2[1]) {
    const val = parseInt(m2[1], 10);
    if (!isNaN(val) && val >= 100) return val;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Intent Classification & Entity Extraction
// ---------------------------------------------------------------------------
export function classifyIntentAndExtractEntities(
  message: string,
  reqLang: 'en' | 'te' | 'hi' | 'ta' = 'en',
  role: 'worker' | 'customer' = 'customer',
  currentState?: ConversationState
): { intent: MojoIntent; entities: ExtractedEntities; updatedDraft: JobDraft } {
  const q = message.toLowerCase().trim();
  const draft: JobDraft = { ...(currentState?.jobDraft || {}) };
  const entities: ExtractedEntities = {};

  // Extract entities first
  const workerCount = extractWorkerCount(q);
  if (workerCount !== null) {
    entities.workersRequired = workerCount;
    draft.workersRequired = workerCount;
  }

  const categoryInfo = extractCategory(q);
  if (categoryInfo) {
    entities.category = categoryInfo.category;
    draft.category = categoryInfo.category;
    if (!draft.title) {
      draft.title = categoryInfo.labelEn;
    }
  }

  const wage = extractWage(q);
  if (wage !== null) {
    entities.wage = wage;
    draft.wage = wage;
  }

  // Time extraction
  const rangeMatch = q.match(/(?:shift(?:\s+time)?|timing|hours|from)?\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm))\s*(?:to|-)\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm))/i);
  if (rangeMatch && rangeMatch[1] && rangeMatch[2]) {
    entities.startTime = rangeMatch[1].trim();
    draft.startTime = entities.startTime;
    entities.endTime = rangeMatch[2].trim();
    draft.endTime = entities.endTime;
  }

  const startTimeMatch = q.match(/(?:start(?:ing)?\s*(?:time|at)?|reporting\s*time|ఉదయం|सुबह)\s*[:=]?\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
  if (startTimeMatch && startTimeMatch[1]) {
    entities.startTime = startTimeMatch[1].trim();
    draft.startTime = entities.startTime;
  }
  const endTimeMatch = q.match(/(?:end(?:ing)?\s*(?:time|at)?|finish(?:ing)?\s*at|wrap\s*up|సాయంత్రం|शाम)\s*[:=]?\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i);
  if (endTimeMatch && endTimeMatch[1]) {
    entities.endTime = endTimeMatch[1].trim();
    draft.endTime = entities.endTime;
  }

  // Location extraction
  const locMatch = q.match(/\b(?:location|address|work\s*site|లొకేషన్|చిరునామా|స్థలం|स्थान|पता)\b\s*(?:is|to|:)?\s*([a-zA-Z0-9\s,]{3,30})/i);
  if (locMatch && locMatch[1] && !locMatch[1].includes('worker') && !locMatch[1].includes('job') && !locMatch[1].includes('plumbing') && !locMatch[1].includes('category')) {
    const candidateLoc = locMatch[1].trim();
    if (candidateLoc.length >= 3) {
      entities.location = candidateLoc;
      draft.location = candidateLoc;
    }
  } else {
    const inLocMatch = q.match(/\b(?:in|at)\s+([A-Za-z0-9\s]{3,25})$/i) || q.match(/\b(?:in|at)\s+([A-Za-z0-9]{3,20})\b/i);
    if (inLocMatch && inLocMatch[1]) {
      const candidate = inLocMatch[1].trim();
      const lowerCand = candidate.toLowerCase();
      if (!['tomorrow', 'today', 'morning', 'evening', 'night', 'hours', 'hour', 'telugu', 'hindi', 'tamil', 'english', 'workers', 'helpers'].includes(lowerCand)) {
        entities.location = candidate;
        draft.location = candidate;
      }
    }
  }

  // Date extraction
  if (q.includes('tomorrow') || q.includes('రేపు') || q.includes('कल') || q.includes('நாளை')) {
    entities.date = 'Tomorrow';
    draft.date = 'Tomorrow';
  } else if (q.includes('today') || q.includes('ఈరోజు') || q.includes('आज') || q.includes('இன்று')) {
    entities.date = 'Today';
    draft.date = 'Today';
  }

  // -------------------------------------------------------------------------
  // Intent Classification (Order of Priority Matters)
  // -------------------------------------------------------------------------

  // 0. Pending Confirmation Handling for Destructive Actions
  if (currentState?.pendingConfirmation === 'CANCEL_JOB') {
    const isYes = /^(?:yes|yep|yeah|sure|confirm|proceed|ok|okay|హా|అవును|సరే|हाँ|ஆம்|சரி)\b/i.test(q) ||
                  q.includes('confirm') || q.includes('అవును') || q.includes('హా') || q.includes('yes');
    const isNo = /^(?:no|nope|cancel|don'?t|stop|keep(?:\s+it)?|వద్దు|లేదు|నహి|नहीं|இல்லை)\b/i.test(q) ||
                 q.includes("don't") || q.includes('వద్దు') || q.includes('లేదు') || q.includes('keep');

    if (isYes) {
      delete currentState.pendingConfirmation;
      const resetDraft: JobDraft = {};
      return {
        intent: 'JOB_CANCELLATION',
        entities: { confirmationStatus: 'confirmed' },
        updatedDraft: resetDraft,
      };
    } else if (isNo) {
      delete currentState.pendingConfirmation;
      return {
        intent: 'JOB_CANCELLATION',
        entities: { confirmationStatus: 'declined' },
        updatedDraft: draft,
      };
    }
  }

  // 0.1 Draft Queries (inquiring about worker count, location, wage, details)
  const isWorkerCountQuery = /(?:what(?:'s|\s+is)?\s+(?:the\s+)?worker\s+count|how\s+many\s+workers|worker\s+count\s+now|ఎంతమంది\s+వర్కర్లు|వర్కర్ల\s+సంఖ్య\s+ఎంత|कितने\s+मजदूर)/i.test(q);
  if (isWorkerCountQuery) {
    entities.isQuery = true;
    return { intent: 'WORKER_COUNT', entities, updatedDraft: draft };
  }

  const isLocationQuery = /(?:where\s+is\s+(?:the\s+)?(?:location|site|work\s*site|address)|what(?:'s|\s+is)?\s+(?:the\s+)?(?:location|address)|లొకేషన్\s+ఎక్కడ|స్థలం\s+ఎక్కడ|पता\s+कहाँ)/i.test(q);
  if (isLocationQuery) {
    entities.isQuery = true;
    return { intent: 'JOB_LOCATION', entities, updatedDraft: draft };
  }

  const isWageQuery = /(?:what(?:'s|\s+is)?\s+(?:the\s+)?wage|how\s+much\s+(?:is\s+the\s+)?(?:wage|pay)|వేతనం\s+ఎంత|జీతం\s+ఎంత|मजदूरी\s+कितनी)/i.test(q);
  if (isWageQuery) {
    entities.isQuery = true;
    return { intent: 'JOB_WAGE', entities, updatedDraft: draft };
  }

  // 1. Language Change
  if (
    q.includes('change language') || q.includes('switch language') || q.includes('switch to') || q.includes('speak in') ||
    q.includes('talk in') || q.includes('తెలుగులో మాట్లాడు') || q.includes('భాష మార్చు') ||
    q.includes('हिंदी में') || q.includes('भाषा बदलो') || q.includes('தமிழில் பேசுங்கள்') || q.includes('மொழி')
  ) {
    let targetLang: 'en' | 'te' | 'hi' | 'ta' = 'en';
    if (q.includes('telugu') || q.includes('తెలుగు')) targetLang = 'te';
    else if (q.includes('hindi') || q.includes('हिंदी') || q.includes('हिन्दी')) targetLang = 'hi';
    else if (q.includes('tamil') || q.includes('தமிழ்')) targetLang = 'ta';
    else if (q.includes('english') || q.includes('ఇంగ్లీష్') || q.includes('अंग्रेजी')) targetLang = 'en';
    entities.targetLanguage = targetLang;
    return { intent: 'LANGUAGE_CHANGE', entities, updatedDraft: draft };
  }

  // 2. Incremental / Direct Worker Count (e.g. "Actually change that to eight", "Change it to 8", "5 workers", "three electricians", "need 10 helpers")
  const isExplicitChangeCount =
    /(?:change(?:\s+(?:it|that|the\s+count|count))?\s+to|make\s+(?:it|that)|update\s+(?:it|that)?\s*to|set(?:\s+(?:it|that))?\s+to)\s*(\d+|[a-z\u0C00-\u0C7F\u0900-\u097F\u0B80-\u0BFF]+)/i.test(q) ||
    q.includes('మార్చండి') || q.includes('कर दो') || q.includes('மாற்றுங்கள்');

  const isCountPhrase =
    workerCount !== null &&
    (
      isExplicitChangeCount ||
      q.includes('worker') || q.includes('helper') || q.includes('electrician') || q.includes('plumber') ||
      q.includes('painter') || q.includes('carpenter') || q.includes('mason') || q.includes('labour') ||
      q.includes('labor') || q.includes('ప్లంబ') || q.includes('ఎలక్ట్రీషియన్') || q.includes('మంది') ||
      q.includes('మజదూర్') || q.includes('మనుషులు') || q.includes('मजदूर') || q.includes('कामगार') ||
      q.includes('कारीगर') || q.includes('தொழிலாளர்கள்') || q.includes('ஆட்கள்') ||
      (q.split(/\s+/).length <= 4 && !q.includes('wage') && !q.includes('salary') && !q.includes('rupee'))
    );

  if (isExplicitChangeCount || isCountPhrase) {
    return { intent: 'WORKER_COUNT', entities, updatedDraft: draft };
  }

  // 3. Worker Selection Flow (MUST be distinguished from Job Posting!)
  // E.g. "how do i select workers?", "who applied", "pick best applicant", "auto select workers", "compare applicants"
  const isWorkerSelection =
    q.includes('select worker') || q.includes('select applicant') || q.includes('choose worker') ||
    q.includes('how do i select') || q.includes('how to select') || q.includes('who should i pick') ||
    q.includes('who is best') || q.includes('best applicant') || q.includes('best match') ||
    q.includes('auto-select') || q.includes('auto select') || q.includes('auto fill') ||
    q.includes('compare candidate') || q.includes('compare applicant') || q.includes('selection process') ||
    q.includes('confirm applicant') || q.includes('confirm worker') ||
    q.includes('సెలక్షన్ ఎలా') || q.includes('వర్కర్లను ఎలా ఎంచుకోవాలి') || q.includes('ఆటో సెలెక్ట్') ||
    q.includes('అభ్యర్థులను పోల్చడం') || q.includes('कामगारों का चयन') || q.includes('आवेदक कैसे चुनें') ||
    q.includes('ऑटो सेलेक्ट') || q.includes('उम्मीदवारों की तुलना') ||
    q.includes('தொழிலாளர்களை எவ்வாறு தேர்வு') || q.includes('விண்ணப்பதாரர்களை ஒப்பிடுவது');

  if (isWorkerSelection) {
    return { intent: 'WORKER_SELECTION', entities, updatedDraft: draft };
  }

  // 4. Worker Search / Discovery (Searching worker directory)
  // E.g. "find me an electrician", "search plumbers near me", "show available painters", "worker directory"
  const isWorkerSearch =
    (q.includes('find me') || q.includes('search worker') || q.includes('show workers') ||
     q.includes('view workers') || q.includes('worker directory') || q.includes('workers near') ||
     q.includes('skilled worker') || q.includes('available painter') || q.includes('available plumber') ||
     q.includes('available electrician') || q.includes('ప్లంబర్ వెతకండి') || q.includes('వర్కర్ల డైరెక్టరీ') ||
     q.includes('कारीगर खोजें') || q.includes('कामगार सूची') || q.includes('தொழிலாளர் பட்டியல்') ||
     q.includes('தேடுங்கள்')) &&
    !q.includes('post') && !q.includes('create job');

  if (isWorkerSearch) {
    return { intent: 'WORKER_SEARCH', entities, updatedDraft: draft };
  }

  // 5. Job Posting Help (Guidance on how to post)
  if (
    q.includes('how to post a job') || q.includes('how do i post a job') || q.includes('help me post') ||
    q.includes('steps to post') || q.includes('job posting guide') || q.includes('పోస్ట్ చేయడం ఎలా') ||
    q.includes('काम कैसे पोस्ट करें') || q.includes('வேலை எப்படி பதிவிடுவது')
  ) {
    return { intent: 'JOB_POSTING_HELP', entities, updatedDraft: draft };
  }

  // 6. Job Posting Start
  // E.g. "post a job", "hire workers", "i want to post a new job", "i want to hire an electrician for tomorrow", "create job"
  const isJobPostingStart =
    q.includes('post a job') || q.includes('post job') || q.includes('create job') ||
    q.includes('new job') || q.includes('want to post') || q.includes('want to hire') ||
    q.includes('hire an electrician') || q.includes('hire a plumber') || q.includes('hire a painter') ||
    q.includes('hire workers') || q.includes('need to hire') ||
    q.includes('పని పోస్ట్') || q.includes('జాబ్ పోస్ట్') || q.includes('వర్కర్లను నియమించుకోవాలి') ||
    q.includes('काम पोस्ट') || q.includes('जॉब पोस्ट') || q.includes('मजदूर रखना है') ||
    q.includes('வேலை பதிவு') || q.includes('ஆட்கள் வேண்டும்');

  if (isJobPostingStart) {
    return { intent: 'JOB_POSTING_START', entities, updatedDraft: draft };
  }

  // 7. Job Cancellation
  if (
    q.includes('cancel job') || q.includes('cancel posting') || q.includes('delete job') ||
    q.includes('how to cancel') || q.includes('cancel my job') || q.includes('రద్దు') ||
    q.includes('रद्द') || q.includes('ரத்து')
  ) {
    if (currentState) {
      currentState.pendingConfirmation = 'CANCEL_JOB';
    }
    return { intent: 'JOB_CANCELLATION', entities, updatedDraft: draft };
  }

  // 8. Application Status
  if (
    q.includes('who applied') || q.includes('application status') || q.includes('my application') ||
    q.includes('any applicants') || q.includes('view applicants') || q.includes('who applied to my job') ||
    q.includes('show applicants') || q.includes('show my applicants') || q.includes('my applicants') ||
    q.includes('see applicants') || q.includes('check applicants') || q.includes('open applicants') ||
    (q.includes('applicant') && !q.includes('compare')) ||
    q.includes('ఎవరు దరఖాస్తు చేశారు') || q.includes('దరఖాస్తు స్థితి') || q.includes('దరఖాస్తుదారులు') ||
    q.includes('किसने आवेदन किया') || q.includes('आवेदन की स्थिति') || q.includes('आवेदक') ||
    q.includes('விண்ணப்ப நிலை') || q.includes('யார் விண்ணப்பித்தனர்') || q.includes('விண்ணப்பதாரர்கள்')
  ) {
    return { intent: 'APPLICATION_STATUS', entities, updatedDraft: draft };
  }

  // 9. Payment Help
  if (
    q.includes('payment') || q.includes('how to pay') || q.includes('upi') || q.includes('escrow') ||
    q.includes('cash receipt') || q.includes('payout') || q.includes('chelimpu') || q.includes('చెల్లింపు') ||
    q.includes('నగదు') || q.includes('भुगतान') || q.includes('पैसे') || q.includes('कमीशन') ||
    q.includes('கட்டணம்') || q.includes('பணம்')
  ) {
    return { intent: 'PAYMENT_HELP', entities, updatedDraft: draft };
  }

  // 10. AI Matching Help
  if (
    q.includes('ai match') || q.includes('match score') || q.includes('why this match') ||
    q.includes('match percentage') || q.includes('random forest') || q.includes('matching algorithm') ||
    q.includes('మ్యాచ్ స్కోర్') || q.includes('मैच स्कोर') || q.includes('பொருத்த மதிப்பெண்')
  ) {
    return { intent: 'AI_MATCHING_HELP', entities, updatedDraft: draft };
  }

  // 11. Explicit Job Field Declarations
  if (q.includes('category') || q.includes('trade:') || q.includes('trade is') || q.includes('కేటగిరీ') || q.includes('श्रेणी')) {
    return { intent: 'JOB_CATEGORY', entities, updatedDraft: draft };
  }

  if (q.includes('job title') || q.includes('title is') || q.includes('title:') || q.includes('శీర్షిక') || q.includes('शीर्षक')) {
    return { intent: 'JOB_TITLE', entities, updatedDraft: draft };
  }

  if (q.includes('description') || q.includes('work details') || q.includes('పని వివరాలు') || q.includes('काम का विवरण')) {
    return { intent: 'JOB_DESCRIPTION', entities, updatedDraft: draft };
  }

  if (q.includes('location is') || q.includes('location:') || q.includes('location to') || q.includes('change location') || q.includes('work site') || q.includes('address is') || q.includes('site is') || q.includes('లొకేషన్') || q.includes('చిరునామా') || q.includes('कार्यस्थल')) {
    return { intent: 'JOB_LOCATION', entities, updatedDraft: draft };
  }

  if (q.includes('job date') || q.includes('date is') || q.includes('date:') || q.includes('scheduled for') || q.includes('తేదీ') || q.includes('तारीख')) {
    return { intent: 'JOB_DATE', entities, updatedDraft: draft };
  }

  if (q.includes('start time') || q.includes('starts at') || q.includes('reporting time') || q.includes('shift time') || q.includes('ప్రారంభ సమయం') || q.includes('शुरू होने का समय')) {
    return { intent: 'JOB_START_TIME', entities, updatedDraft: draft };
  }

  if (q.includes('end time') || q.includes('finishes at') || q.includes('ends at') || q.includes('wrap up') || q.includes('ముగింపు సమయం') || q.includes('समाप्ति समय')) {
    return { intent: 'JOB_END_TIME', entities, updatedDraft: draft };
  }

  // 11. Job Status & Edit
  if (q.includes('job status') || q.includes('is my job filled') || q.includes('confirmed count') || q.includes('జాబ్ స్థితి') || q.includes('काम की स्थिति') || q.includes('வேலை நிலை')) {
    return { intent: 'JOB_STATUS', entities, updatedDraft: draft };
  }

  if (q.includes('edit job') || q.includes('modify job') || q.includes('change job') || q.includes('సవరించు') || q.includes('बदलाव') || q.includes('மாற்ற')) {
    return { intent: 'JOB_EDIT', entities, updatedDraft: draft };
  }

  // 12. Worker Profile
  if (q.includes('profile') || q.includes('worker rating') || q.includes('experience') || q.includes('kyc') || q.includes('ప్రొఫైల్') || q.includes('प्रोफ़ाइल')) {
    return { intent: 'WORKER_PROFILE', entities, updatedDraft: draft };
  }

  if (
    wage !== null || q.includes('wage') || q.includes('salary') || q.includes('fair daily wage') ||
    q.includes('800') || q.includes('how much to pay') || q.includes('జీతం') || q.includes('వేతనం') ||
    q.includes('दैनिक मजदूरी') || q.includes('वेतन') || q.includes('ஊதியம்')
  ) {
    return { intent: 'JOB_WAGE', entities, updatedDraft: draft };
  }

  if (entities.startTime || q.includes('షిఫ్ట్ సమయం') || q.includes('समय')) {
    return { intent: 'JOB_START_TIME', entities, updatedDraft: draft };
  }
  if (entities.endTime || q.includes('half day')) {
    return { intent: 'JOB_END_TIME', entities, updatedDraft: draft };
  }
  if (entities.location || q.includes('where is the site') || q.includes('पता')) {
    return { intent: 'JOB_LOCATION', entities, updatedDraft: draft };
  }
  if (entities.date || q.includes('when is the job')) {
    return { intent: 'JOB_DATE', entities, updatedDraft: draft };
  }

  // 21. Greeting
  const isGreeting =
    /^(hi|hello|hey|greetings|namaste|vanakkam|good\s*(?:morning|afternoon|evening))\b/i.test(q) ||
    q === 'నమస్కారం' || q === 'హలో' || q === 'नमस्ते' || q === 'नमस्कार' || q === 'வணக்கம்';

  if (isGreeting) {
    return { intent: 'GREETING', entities, updatedDraft: draft };
  }

  // 22. General WorkMojo Help
  if (
    q.includes('what is workmojo') || q.includes('about workmojo') || q.includes('commission') ||
    q.includes('how does this app work') || q.includes('zero commission') || q.includes('safety') ||
    q.includes('sos') || q.includes('వర్క్ మోజో అంటే ఏమిటి') || q.includes('वर्क मोजो क्या है') || q.includes('ஒர்க் மோஜோ என்றால் என்ன')
  ) {
    return { intent: 'GENERAL_WORKMOJO_HELP', entities, updatedDraft: draft };
  }

  return { intent: 'UNKNOWN', entities, updatedDraft: draft };
}

// ---------------------------------------------------------------------------
// Distinct Responses Generator for all 23 Intents
// ---------------------------------------------------------------------------
export function generateIntentResponse(
  intent: MojoIntent,
  entities: ExtractedEntities,
  draft: JobDraft,
  lang: 'en' | 'te' | 'hi' | 'ta',
  role: 'worker' | 'customer'
): { reply: string; action?: AiChatAction } {
  const workersCount = entities.workersRequired || draft.workersRequired || 1;
  const categoryName = entities.category || draft.category || 'General Gig';
  const wageAmt = entities.wage || draft.wage || 800;

  switch (intent) {
    case 'WORKER_COUNT': {
      const isUpdated = draft.category || draft.title;
      if (entities.isQuery) {
        if (lang === 'te') {
          return {
            reply: `ప్రస్తుతం నమోదు చేసిన వర్కర్ల సంఖ్య: ${workersCount} ${categoryName !== 'General Gig' ? `${categoryName} ` : ''}వర్కర్లు.`,
            action: {
              type: 'UPDATE_JOB_DRAFT',
              target: 'post_job',
              jobDraft: draft,
              label: `డ్రాఫ్ట్ చూడండి (${workersCount} వర్కర్లు)`,
            },
          };
        }
        if (lang === 'hi') {
          return {
            reply: `वर्तमान में आवश्यक कामगारों की संख्या: ${workersCount} ${categoryName !== 'General Gig' ? `${categoryName} ` : ''}कामगार।`,
            action: {
              type: 'UPDATE_JOB_DRAFT',
              target: 'post_job',
              jobDraft: draft,
              label: `ड्राफ्ट देखें (${workersCount} कामगार)`,
            },
          };
        }
        if (lang === 'ta') {
          return {
            reply: `தற்போதைய தொழிலாளர்கள் எண்ணிக்கை: ${workersCount} ${categoryName !== 'General Gig' ? `${categoryName} ` : ''}தொழிலாளர்கள்.`,
            action: {
              type: 'UPDATE_JOB_DRAFT',
              target: 'post_job',
              jobDraft: draft,
              label: `வரைவு பார்க்க (${workersCount} தொழிலாளர்கள்)`,
            },
          };
        }
        return {
          reply: `Current worker count is ${workersCount} ${categoryName !== 'General Gig' ? `${categoryName} ` : ''}worker${workersCount > 1 ? 's' : ''}.`,
          action: {
            type: 'UPDATE_JOB_DRAFT',
            target: 'post_job',
            jobDraft: draft,
            label: `Review Job Draft (${workersCount} Workers)`,
          },
        };
      }

      if (lang === 'te') {
        return {
          reply: `ఖచ్చితంగా! మీకు ${workersCount} మంది వర్కర్లు అవసరమని నమోదు చేశాను.${isUpdated ? ` (${categoryName} పని కోసం)` : ''} దయచేసి రోజువారీ వేతనం లేదా పని సమయాన్ని ధృవీకరించండి. లేదా క్రింది బటన్ నొక్కి పోస్టింగ్ పూర్తి చేయండి.`,
          action: {
            type: 'UPDATE_JOB_DRAFT',
            target: 'post_job',
            jobDraft: draft,
            label: `జాబ్ పోస్టింగ్ కొనసాగించండి (${workersCount} వర్కర్లు)`,
          },
        };
      }
      if (lang === 'hi') {
        return {
          reply: `बिल्कुल! मैंने ${workersCount} कामगारों की आवश्यकता दर्ज कर ली है।${isUpdated ? ` (${categoryName} कार्य हेतु)` : ''} कृपया दैनिक मजदूरी या समय निर्धारित करें, अथवा नीचे टैप करके काम पोस्ट करें।`,
          action: {
            type: 'UPDATE_JOB_DRAFT',
            target: 'post_job',
            jobDraft: draft,
            label: `काम पोस्टिंग जारी रखें (${workersCount} कामगार)`,
          },
        };
      }
      if (lang === 'ta') {
        return {
          reply: `நிச்சயமாக! ${workersCount} தொழிலாளர்கள் தேவை எனப் பதிவு செய்யப்பட்டுள்ளது.${isUpdated ? ` (${categoryName} வேலை)` : ''} தினசரி ஊதியம் அல்லது நேரத்தை அமைக்கவும், அல்லது கீழே உள்ள பொத்தானைத் தொடவும்.`,
          action: {
            type: 'UPDATE_JOB_DRAFT',
            target: 'post_job',
            jobDraft: draft,
            label: `வேலை பதிவைத் தொடரவும் (${workersCount} தொழிலாளர்கள்)`,
          },
        };
      }
      return {
        reply: `Got it! I have set your requirement to ${workersCount} ${categoryName !== 'General Gig' ? categoryName : 'worker'}${workersCount > 1 ? 's' : ''}. Total estimated outlay: ₹${workersCount * wageAmt} (${workersCount} × ₹${wageAmt}). Would you like to adjust the wage or open the Job Wizard?`,
        action: {
          type: 'UPDATE_JOB_DRAFT',
          target: 'post_job',
          jobDraft: draft,
          label: `Continue Job Post (${workersCount} Workers)`,
        },
      };
    }

    case 'WORKER_SELECTION': {
      if (lang === 'te') {
        return {
          reply: 'వర్క్ మోజోలో వర్కర్ల సెలక్షన్ చాలా పారదర్శకం: మీ జాబ్ దరఖాస్తుదారుల నైపుణ్యాలు, రేటింగ్స్ మరియు AI మ్యాచ్ స్కోర్‌లను పరిశీలించి మీకు కావలసిన సంఖ్యలో వర్కర్లను కన్ఫర్మ్ చేయవచ్చు. లేదా "ఆటో-సెలెక్ట్" ద్వారా అత్యుత్తమ అభ్యర్థులను క్షణాల్లో భర్తీ చేయవచ్చు. మిగిలిన వారు వెయిటింగ్ లిస్ట్‌లో భద్రంగా ఉంటారు.',
          action: {
            type: 'OPEN_APPLICANTS',
            target: 'applicants',
            label: 'అభ్యర్థులను పరిశీలించండి & ఎంచుకోండి',
          },
        };
      }
      if (lang === 'hi') {
        return {
          reply: 'वर्क मोजो में कामगारों का चयन पारदर्शी और त्वरित है: आप आवेदकों की प्रोफ़ाइल, रेटिंग व AI मैच स्कोर की तुलना करके अपने आवश्यक कामगारों को कन्फर्म कर सकते हैं। आप "ऑटो-सेलेक्ट" से सर्वश्रेष्ठ स्कोर वाले कामगारों को तुरंत नियुक्त कर सकते हैं; अतिरिक्त आवेदक सुरक्षित रूप से वेटिंग लिस्ट में रहेंगे।',
          action: {
            type: 'OPEN_APPLICANTS',
            target: 'applicants',
            label: 'आवेदक देखें और चुनें',
          },
        };
      }
      if (lang === 'ta') {
        return {
          reply: 'ஒர்க் மோஜோவில் தொழிலாளர்களைத் தேர்ந்தெடுப்பது எளிதானது: விண்ணப்பதாரர்களின் சுயவிவரங்கள், மதிப்பீடுகள் மற்றும் AI பொருத்த மதிப்பெண்களை ஒப்பிட்டு உறுதிசெய்யலாம். "தானாக தேர்வு" (Auto-Select) மூலம் சிறந்த தொழிலாளர்களை உடனடியாக அமர்த்தலாம்.',
          action: {
            type: 'OPEN_APPLICANTS',
            target: 'applicants',
            label: 'விண்ணப்பதாரர்களைத் தேர்ந்தெடுக்கவும்',
          },
        };
      }
      return {
        reply: "Worker selection on WorkMojo is transparent and fast! Review incoming applicants, compare their transparent AI Match Scores and ratings, and confirm candidates up to your required worker count. You can also tap 'Auto-Select' to instantly fill open slots with top-ranked workers, while remaining applicants are placed on the automated waiting list.",
        action: {
          type: 'OPEN_APPLICANTS',
          target: 'applicants',
          label: 'Review & Select Applicants',
        },
      };
    }

    case 'WORKER_SEARCH': {
      const cat = entities.category || draft.category || 'All';
      if (lang === 'te') {
        return {
          reply: `మీ పరిసరాల్లో అందుబాటులో ఉన్న నైపుణ్యం కలిగిన ${cat} వర్కర్లను కనుగొన్నాను! వారి రేటింగ్‌లు, అనుభవం మరియు ధృవీకరించబడిన KYC వివరాలను చూడటానికి క్రింది బటన్ నొక్కండి.`,
          action: {
            type: 'OPEN_WORKER_SEARCH',
            target: 'directory',
            filterCategory: cat,
            label: `${cat} వర్కర్లను చూడండి`,
          },
        };
      }
      if (lang === 'hi') {
        return {
          reply: `मुझे आपके निकट सत्यापित और कुशल ${cat} कामगार मिले हैं! उनकी प्रोफ़ाइल, रेटिंग व अनुभव देखने और सीधे संपर्क करने के लिए नीचे टैप करें।`,
          action: {
            type: 'OPEN_WORKER_SEARCH',
            target: 'directory',
            filterCategory: cat,
            label: `${cat} कामगार देखें`,
          },
        };
      }
      if (lang === 'ta') {
        return {
          reply: `உங்கள் பகுதியில் உள்ள திறமையான ${cat} தொழிலாளர்கள் தயார்! சுயவிவரங்கள் மற்றும் மதிப்பீடுகளைக் காண கீழே தட்டவும்.`,
          action: {
            type: 'OPEN_WORKER_SEARCH',
            target: 'directory',
            filterCategory: cat,
            label: `${cat} தொழிலாளர்களைக் காண்க`,
          },
        };
      }
      return {
        reply: `I found verified, skilled ${cat} workers ready near you on WorkMojo! Tap below to explore profiles, transparent ratings, and hire directly with zero commission.`,
        action: {
          type: 'OPEN_WORKER_SEARCH',
          target: 'directory',
          filterCategory: cat,
          label: `View ${cat} Workers`,
        },
      };
    }

    case 'JOB_POSTING_START': {
      if (lang === 'te') {
        return {
          reply: 'కొత్త పనిని పోస్ట్ చేయడానికి 60 సెకన్లలోపు సమయం పడుతుంది: కేటగిరీ, అవసరమైన వర్కర్ల సంఖ్య, రోజువారీ వేతనం మరియు సమయాన్ని నిర్ణయించండి. వర్క్ మోజోలో 100% జీరో కమీషన్!',
          action: {
            type: 'OPEN_POST_JOB',
            target: 'post_job',
            jobDraft: draft,
            label: 'పని పోస్ట్ చేయండి',
          },
        };
      }
      if (lang === 'hi') {
        return {
          reply: 'नया काम पोस्ट करने में 60 सेकंड से भी कम समय लगता है: काम का प्रकार चुनें, कामगारों की संख्या, वेतन व समय तय करें और लोकेशन सेट करें। वर्क मोजो 100% कमीशन-मुक्त है!',
          action: {
            type: 'OPEN_POST_JOB',
            target: 'post_job',
            jobDraft: draft,
            label: 'नया काम पोस्ट करें',
          },
        };
      }
      if (lang === 'ta') {
        return {
          reply: 'புதிய வேலையைப் பதிவு செய்ய 60 வினாடிகளுக்கும் குறைவான நேரமே ஆகும்: வேலை வகை, ஆட்கள் எண்ணிக்கை, ஊதியம் மற்றும் நேரத்தை அமைத்து உடனே பதிவிடுங்கள். பூஜ்ஜிய கமிஷன்!',
          action: {
            type: 'OPEN_POST_JOB',
            target: 'post_job',
            jobDraft: draft,
            label: 'வேலை பதிவு செய்ய',
          },
        };
      }
      return {
        reply: 'Posting a job on WorkMojo takes under 60 seconds with our step-by-step wizard! Set your category, required workers, fair daily wage, and site location with 100% zero platform commission.',
        action: {
          type: 'OPEN_POST_JOB',
          target: 'post_job',
          jobDraft: draft,
          label: 'Open Post Job Wizard',
        },
      };
    }

    case 'JOB_POSTING_HELP': {
      if (lang === 'te') {
        return {
          reply: 'జాబ్ పోస్టింగ్ ప్రక్రియ: 1) కేటగిరీ ఎంచుకోండి, 2) పని వివరణ రాయండి, 3) రోజువారీ న్యాయమైన వేతనం నిర్ణయించండి, 4) సమయం & లొకేషన్ సెట్ చేయండి, 5) అవసరమైన వర్కర్ల సంఖ్యను పేర్కొనండి. 60 సెకన్లలో మీ పోస్టింగ్ లైవ్ అవుతుంది!',
          action: { type: 'OPEN_POST_JOB', target: 'post_job', jobDraft: draft, label: 'ఇప్పుడే ప్రారంభించండి' },
        };
      }
      if (lang === 'hi') {
        return {
          reply: 'काम पोस्ट करने के सरल चरण: 1) काम का प्रकार चुनें, 2) कार्य विवरण लिखें, 3) उचित दैनिक वेतन तय करें, 4) समय व कार्यस्थल सेट करें, 5) आवश्यक कामगारों की संख्या बताएं। आपका काम तुरंत लाइव हो जाएगा!',
          action: { type: 'OPEN_POST_JOB', target: 'post_job', jobDraft: draft, label: 'अभी शुरू करें' },
        };
      }
      if (lang === 'ta') {
        return {
          reply: 'வேலை பதிவிடும் எளிய வழிகள்: 1) வேலை வகை தேர்வு, 2) விவரம், 3) நியாயமான ஊதியம், 4) இடம் & நேரம், 5) தொழிலாளர் எண்ணிக்கை. உடனே வேலை நேரலையாகும்!',
          action: { type: 'OPEN_POST_JOB', target: 'post_job', jobDraft: draft, label: 'இப்போது தொடங்கவும்' },
        };
      }
      return {
        reply: 'Job posting is simple: 1) Select trade category, 2) Add a brief description, 3) Set fair daily wage, 4) Specify hours and site location, 5) Pick number of workers needed. Tap below to launch the wizard.',
        action: { type: 'OPEN_POST_JOB', target: 'post_job', jobDraft: draft, label: 'Launch Job Wizard' },
      };
    }

    case 'APPLICATION_STATUS': {
      if (lang === 'te') {
        return {
          reply: 'మీ జాబ్ పోస్టింగ్‌కు వచ్చిన దరఖాస్తులను అప్లికెంట్స్ స్క్రీన్‌లో లైవ్‌గా చూడవచ్చు. ప్రతి వర్కర్ స్కిల్స్, రేటింగ్స్ మరియు AI మ్యాచ్ స్కోర్‌తో కూడిన వివరాలు కనిపిస్తాయి.',
          action: { type: 'OPEN_APPLICANTS', target: 'applicants', label: 'దరఖాస్తులను చూడండి' },
        };
      }
      if (lang === 'hi') {
        return {
          reply: 'आप अपने काम पर आए सभी आवेदकों को आवेदक स्क्रीन पर लाइव देख सकते हैं। प्रत्येक कामगार की रेटिंग, अनुभव और AI मैच स्कोर उपलब्ध है।',
          action: { type: 'OPEN_APPLICANTS', target: 'applicants', label: 'आवेदक सूची देखें' },
        };
      }
      if (lang === 'ta') {
        return {
          reply: 'உங்கள் வேலைக்கான விண்ணப்பதாரர்களை அப்ளிகண்ட்ஸ் திரையில் நேரடியாகக் காணலாம். தொழிலாளர்களின் மதிப்பீடுகள் மற்றும் பொருத்த மதிப்பெண் கிடைக்கும்.',
          action: { type: 'OPEN_APPLICANTS', target: 'applicants', label: 'விண்ணப்பதாரர்களைக் காண்க' },
        };
      }
      return {
        reply: 'You can track all active applicants on your Applicants screen. Review verified worker profiles, reliability scores, and AI match rankings in real time.',
        action: { type: 'OPEN_APPLICANTS', target: 'applicants', label: 'View Applicants' },
      };
    }

    case 'PAYMENT_HELP': {
      if (lang === 'te') {
        return {
          reply: 'వర్క్ మోజోలో చెల్లింపులు 100% సురక్షితం: షిఫ్ట్ పూర్తి కాగానే తక్షణ UPI, డైరెక్ట్ బ్యాంక్ ట్రాన్స్‌ఫర్ లేదా డిజిటల్ రసీదుతో ఆఫ్‌లైన్ నగదు ద్వారా చెల్లించవచ్చు. కమీషన్ మినహాయింపులు లేవు.',
          action: { type: 'navigate', target: 'payments', label: 'చెల్లింపుల విభాగం' },
        };
      }
      if (lang === 'hi') {
        return {
          reply: 'वर्क मोजो में भुगतान 100% सुरक्षित और पारदर्शी है: काम पूरा होने पर तत्काल यूपीआई, सीधा बैंक ट्रांसफर या डिजिटल रसीद के साथ नकद भुगतान करें। शून्य कमीशन!',
          action: { type: 'navigate', target: 'payments', label: 'भुगतान डैशबोर्ड' },
        };
      }
      if (lang === 'ta') {
        return {
          reply: 'ஒர்க் மோஜோவில் கட்டணம் முற்றிலும் பாதுகாப்பானது: ஷிப்ட் முடிந்ததும் உடனடி யுபிஐ, வங்கி பரிமாற்றம் அல்லது ரொக்கமாக வழங்கலாம். கமிஷன் இல்லை.',
          action: { type: 'navigate', target: 'payments', label: 'கட்டணப் பக்கம்' },
        };
      }
      return {
        reply: 'WorkMojo payments are 100% commission-free and transparent: settle wages via Instant UPI, Direct Bank Transfer, or verified Cash with digital receipts upon shift completion.',
        action: { type: 'navigate', target: 'payments', label: 'Open Payments' },
      };
    }

    case 'JOB_CANCELLATION': {
      if (entities.confirmationStatus === 'confirmed') {
        if (lang === 'te') {
          return {
            reply: 'మీ జాబ్ డ్రాఫ్ట్ విజయవంతంగా రద్దు చేయబడింది.',
            action: { type: 'CANCEL_JOB', jobDraft: {} },
          };
        }
        if (lang === 'hi') {
          return {
            reply: 'आपका जॉब ड्राफ्ट सफलतापूर्वक रद्द कर दिया गया है।',
            action: { type: 'CANCEL_JOB', jobDraft: {} },
          };
        }
        if (lang === 'ta') {
          return {
            reply: 'உங்கள் வேலை வரைவு வெற்றிகரமாக ரத்து செய்யப்பட்டது.',
            action: { type: 'CANCEL_JOB', jobDraft: {} },
          };
        }
        return {
          reply: 'Your job draft has been cancelled. All draft details have been cleared.',
          action: { type: 'CANCEL_JOB', jobDraft: {} },
        };
      }

      if (entities.confirmationStatus === 'declined') {
        if (lang === 'te') {
          return {
            reply: 'సరే, మీ జాబ్ డ్రాఫ్ట్ భద్రంగా ఉంచబడింది.',
            action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft },
          };
        }
        if (lang === 'hi') {
          return {
            reply: 'ठीक है, आपका जॉब ड्राफ्ट सुरक्षित रखा गया है।',
            action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft },
          };
        }
        if (lang === 'ta') {
          return {
            reply: 'சரி, உங்கள் வேலை வரைவு அப்படியே வைக்கப்பட்டுள்ளது.',
            action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft },
          };
        }
        return {
          reply: 'Understood. Your job draft has been kept intact.',
          action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft },
        };
      }

      if (lang === 'te') {
        return {
          reply: 'మీరు నిజంగా ఈ జాబ్ డ్రాఫ్ట్‌ను రద్దు చేయాలనుకుంటున్నారా? అవును లేదా వద్దు అని చెప్పండి.',
          action: { type: 'CANCEL_JOB', target: 'applicants', label: 'జాబ్ రద్దు నిర్ధారించండి' },
        };
      }
      if (lang === 'hi') {
        return {
          reply: 'क्या आप वाकई इस जॉब ड्राफ्ट को रद्द करना चाहते हैं? पुष्टि के लिए हाँ या रद्द के लिए नहीं कहें।',
          action: { type: 'CANCEL_JOB', target: 'applicants', label: 'काम रद्द करें' },
        };
      }
      if (lang === 'ta') {
        return {
          reply: 'இந்த வேலை வரைவை நிச்சயமாக ரத்து செய்ய விரும்புகிறீர்களா? ஆம் அல்லது இல்லை என்று சொல்லுங்கள்.',
          action: { type: 'CANCEL_JOB', target: 'applicants', label: 'வேலை ரத்து' },
        };
      }
      return {
        reply: 'Are you sure you want to cancel the job draft? Say yes to confirm or no to keep it.',
        action: { type: 'CANCEL_JOB', target: 'applicants', label: 'Confirm Cancellation' },
      };
    }

    case 'JOB_WAGE': {
      if (entities.isQuery) {
        if (lang === 'te') {
          return {
            reply: `ప్రస్తుత రోజువారీ వేతనం ₹${wageAmt}.`,
            action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft, label: 'వేతనం వివరాలు' },
          };
        }
        if (lang === 'hi') {
          return {
            reply: `वर्तमान दैनिक मजदूरी ₹${wageAmt} है।`,
            action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft, label: 'वेतन विवरण' },
          };
        }
        if (lang === 'ta') {
          return {
            reply: `தற்போதைய தினசரி ஊதியம் ₹${wageAmt}.`,
            action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft, label: 'ஊதியம் விவரங்கள்' },
          };
        }
        return {
          reply: `The current wage is set to ₹${wageAmt} per day.`,
          action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft, label: 'Review Wage' },
        };
      }

      if (lang === 'te') {
        return {
          reply: `రోజువారీ వేతనం ₹${wageAmt}గా గుర్తించబడింది. వర్క్ మోజోలో సగటు రోజువారీ వేతనాలు నైపుణ్యాన్ని బట్టి ₹700 నుండి ₹1200+ వరకు ఉంటాయి. వర్కర్లు పూర్తి వేతనాన్ని పొందుతారు.`,
          action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft, label: `వేతనం ₹${wageAmt}తో కొనసాగించండి` },
        };
      }
      if (lang === 'hi') {
        return {
          reply: `दैनिक मजदूरी ₹${wageAmt} दर्ज की गई है। वर्क मोजो पर उचित दैनिक मजदूरी आमतौर पर ₹700 से ₹1200+ होती है। कामगारों को बिना किसी कटौती के पूरा वेतन मिलता है।`,
          action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft, label: `वेतन ₹${wageAmt} सेट करें` },
        };
      }
      if (lang === 'ta') {
        return {
          reply: `தினசரி ஊதியம் ₹${wageAmt} எனப் பதிவு செய்யப்பட்டுள்ளது. வழக்கமாக ஊதியம் ₹700 முதல் ₹1200+ வரை இருக்கும். தொழிலாளர்களுக்கு முழு ஊதியம் கிடைக்கும்.`,
          action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft, label: `ஊதியம் ₹${wageAmt} அமைக்க` },
        };
      }
      return {
        reply: `Daily wage noted as ₹${wageAmt}. Fair baseline market wages on WorkMojo range from ₹700 to ₹1200+ depending on trade and hours. Workers retain 100% of this wage.`,
        action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft, label: `Set Wage to ₹${wageAmt}` },
      };
    }

    case 'JOB_START_TIME':
    case 'JOB_END_TIME': {
      const sTime = draft.startTime || '09:00 AM';
      const eTime = draft.endTime || '06:00 PM';
      if (lang === 'te') {
        return {
          reply: `పని వేళలు ${sTime} నుండి ${eTime} వరకు అప్‌డేట్ చేయబడ్డాయి. వర్కర్లు రిపోర్ట్ చేయాల్సిన సమయానికి సిద్ధంగా ఉంటారు.`,
          action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft, label: 'సమయాన్ని సెట్ చేయండి' },
        };
      }
      if (lang === 'hi') {
        return {
          reply: `कार्य समय ${sTime} से ${eTime} तक सेट कर दिया गया है। कामगार समय पर कार्यस्थल पर रिपोर्ट करेंगे।`,
          action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft, label: 'समय सेट करें' },
        };
      }
      if (lang === 'ta') {
        return {
          reply: `வேலை நேரம் ${sTime} முதல் ${eTime} வரை அமைக்கப்பட்டது.`,
          action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft, label: 'நேரம் அமைக்க' },
        };
      }
      return {
        reply: `Working hours recorded: ${sTime} to ${eTime}. Workers will report to the site punctually and verify via QR check-in.`,
        action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft, label: 'Save Working Hours' },
      };
    }

    case 'JOB_LOCATION': {
      const loc = draft.location || 'Your site area';
      if (entities.isQuery) {
        if (lang === 'te') {
          return {
            reply: `పని లొకేషన్: "${loc}".`,
            action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft, label: 'లొకేషన్ వివరాలు' },
          };
        }
        if (lang === 'hi') {
          return {
            reply: `कार्यस्थल की लोकेशन: "${loc}"।`,
            action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft, label: 'लोकेशन विवरण' },
          };
        }
        if (lang === 'ta') {
          return {
            reply: `பணி இடம்: "${loc}".`,
            action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft, label: 'இடம் விவரங்கள்' },
          };
        }
        return {
          reply: `The job location is set to "${loc}".`,
          action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft, label: 'Review Location' },
        };
      }
      if (lang === 'te') {
        return {
          reply: `పని ప్రదేశం: "${loc}". భద్రత కొరకు వర్కర్ కన్ఫర్మ్ అయ్యేంత వరకు ఖచ్చితమైన వీధి చిరునామా గోప్యంగా ఉంచబడుతుంది.`,
          action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft, label: 'లొకేషన్ సేవ్ చేయండి' },
        };
      }
      if (lang === 'hi') {
        return {
          reply: `कार्यस्थल: "${loc}"। सुरक्षा व गोपनीयता हेतु सटीक पता केवल कामगार के चयन और पुष्टि के बाद ही दिखाया जाता है।`,
          action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft, label: 'लोकेशन सेव करें' },
        };
      }
      if (lang === 'ta') {
        return {
          reply: `பணி இடம்: "${loc}". தொழிலாளி உறுதிசெய்யப்பட்ட பின்னரே முழு முகவரி காட்டப்படும்.`,
          action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft, label: 'இடம் சேமிக்க' },
        };
      }
      return {
        reply: `Workplace location set to "${loc}". To protect your privacy, the exact street address is only revealed to confirmed workers upon hire.`,
        action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft, label: 'Save Location' },
      };
    }

    case 'JOB_DATE': {
      const dateVal = draft.date || 'Today';
      if (lang === 'te') {
        return {
          reply: `పని తేదీ "${dateVal}"గా సెట్ చేయబడింది. వర్కర్లు ఈ తేదీకి సిద్ధంగా ఉంటారు.`,
          action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft, label: 'తేదీ నిర్ధారించండి' },
        };
      }
      if (lang === 'hi') {
        return {
          reply: `काम की तिथि "${dateVal}" तय की गई है। कामगार इस दिन के लिए उपलब्ध रहेंगे।`,
          action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft, label: 'तिथि निर्धारित करें' },
        };
      }
      if (lang === 'ta') {
        return {
          reply: `வேலை தேதி "${dateVal}" என அமைக்கப்பட்டது.`,
          action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft, label: 'தேதி உறுதிசெய்ய' },
        };
      }
      return {
        reply: `Job date set for ${dateVal}. Verified workers will be available for this shift.`,
        action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft, label: 'Confirm Date' },
      };
    }

    case 'JOB_TITLE':
    case 'JOB_CATEGORY':
    case 'JOB_DESCRIPTION': {
      if (lang === 'te') {
        return {
          reply: `పని వివరాలు (${draft.title || categoryName}) అప్‌డేట్ చేయబడ్డాయి. ఇప్పుడు వేతనం లేదా వర్కర్ల సంఖ్యను నమోదు చేయవచ్చు.`,
          action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft, label: 'జాబ్ డ్రాఫ్ట్ చూడండి' },
        };
      }
      if (lang === 'hi') {
        return {
          reply: `काम का विवरण (${draft.title || categoryName}) अपडेट कर दिया गया है। अब वेतन अथवा कामगारों की संख्या तय करें।`,
          action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft, label: 'ड्राफ्ट देखें' },
        };
      }
      if (lang === 'ta') {
        return {
          reply: `வேலை விவரங்கள் (${draft.title || categoryName}) புதுப்பிக்கப்பட்டது.`,
          action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft, label: 'வரைவு பார்க்க' },
        };
      }
      return {
        reply: `Job details updated for "${draft.title || categoryName}". You can now specify the wage, working hours, or number of workers required.`,
        action: { type: 'UPDATE_JOB_DRAFT', jobDraft: draft, label: 'Review Job Draft' },
      };
    }

    case 'WORKER_PROFILE': {
      if (lang === 'te') {
        return {
          reply: 'వర్కర్ ప్రొఫైల్స్‌లో వారి ధృవీకరించబడిన ఆధార్/KYC స్థితి, మొత్తం పూర్తి చేసిన పనులు, స్టార్ రేటింగ్ మరియు విశ్వసనీయత స్కోర్ (Reliability Score) స్పష్టంగా కనిపిస్తాయి.',
          action: { type: 'OPEN_WORKER_SEARCH', target: 'directory', label: 'వర్కర్ ప్రొఫైల్స్ చూడండి' },
        };
      }
      if (lang === 'hi') {
        return {
          reply: 'कामगार की प्रोफ़ाइल में उनके सत्यापित केवाईसी, कुल पूर्ण कार्य, स्टार रेटिंग और विश्वसनीयता स्कोर (Reliability Score) पारदर्शी रूप से उपलब्ध होते हैं।',
          action: { type: 'OPEN_WORKER_SEARCH', target: 'directory', label: 'कामगार प्रोफ़ाइल देखें' },
        };
      }
      if (lang === 'ta') {
        return {
          reply: 'தொழிலாளரின் சுயவிவரத்தில் மதிப்பீடு, முடித்த வேலைகள் மற்றும் நம்பகத்தன்மை மதிப்பெண் காணப்படும்.',
          action: { type: 'OPEN_WORKER_SEARCH', target: 'directory', label: 'சுயவிவரம் பார்க்க' },
        };
      }
      return {
        reply: 'Worker profiles on WorkMojo feature verified KYC badges, completed gig counters, transparent star ratings, and punctuality reliability scores.',
        action: { type: 'OPEN_WORKER_SEARCH', target: 'directory', label: 'Browse Verified Profiles' },
      };
    }

    case 'JOB_STATUS': {
      if (lang === 'te') {
        return {
          reply: 'మీ జాబ్ పోస్టింగ్ స్థితిని తెలుసుకోవడానికి అప్లికెంట్స్ స్క్రీన్‌ని ఓపెన్ చేయండి. అక్కడ కన్ఫర్మ్ అయిన వర్కర్లు మరియు ఇంకా మిగిలిన స్లాట్‌ల సంఖ్య కనిపిస్తుంది.',
          action: { type: 'OPEN_APPLICANTS', target: 'applicants', label: 'జాబ్ స్థితి చూడండి' },
        };
      }
      if (lang === 'hi') {
        return {
          reply: 'अपनी जॉब की लाइव स्थिति देखने के लिए आवेदक स्क्रीन खोलें। वहाँ कन्फर्म कामगार और शेष रिक्त स्लॉट स्पष्ट दिखेंगे।',
          action: { type: 'OPEN_APPLICANTS', target: 'applicants', label: 'काम की स्थिति देखें' },
        };
      }
      if (lang === 'ta') {
        return {
          reply: 'உங்கள் வேலையின் நிலையை அறிய விண்ணப்பதாரர் திரையைத் திறக்கவும்.',
          action: { type: 'OPEN_APPLICANTS', target: 'applicants', label: 'நிலை பார்க்க' },
        };
      }
      return {
        reply: 'Check your current job status on the Applicants view to see confirmed worker headcounts, remaining open slots, and live applicant queues.',
        action: { type: 'OPEN_APPLICANTS', target: 'applicants', label: 'Check Job Status' },
      };
    }

    case 'JOB_EDIT': {
      if (lang === 'te') {
        return {
          reply: 'మీరు పని వేతనం, సమయం లేదా వర్కర్ల సంఖ్యను సులభంగా మార్చవచ్చు. కొత్త వివరాలు చెప్పండి లేదా జాబ్ స్క్రీన్‌లో సవరించండి.',
          action: { type: 'OPEN_POST_JOB', target: 'post_job', jobDraft: draft, label: 'జాబ్ వివరాలు సవరించండి' },
        };
      }
      if (lang === 'hi') {
        return {
          reply: 'आप काम का वेतन, समय या कामगारों की संख्या आसानी से बदल सकते हैं। नया विवरण बताएं या सीधे संपादित करें।',
          action: { type: 'OPEN_POST_JOB', target: 'post_job', jobDraft: draft, label: 'काम संपादित करें' },
        };
      }
      if (lang === 'ta') {
        return {
          reply: 'வேலை விவரங்கள், ஊதியம் அல்லது ஆட்கள் எண்ணிக்கையை எளிதாக மாற்றலாம்.',
          action: { type: 'OPEN_POST_JOB', target: 'post_job', jobDraft: draft, label: 'விவரம் மாற்ற' },
        };
      }
      return {
        reply: 'You can modify the wage, shift timings, or required worker count at any time before shift start.',
        action: { type: 'OPEN_POST_JOB', target: 'post_job', jobDraft: draft, label: 'Edit Job Details' },
      };
    }

    case 'AI_MATCHING_HELP': {
      if (lang === 'te') {
        return {
          reply: 'వర్క్ మోజో AI మ్యాచ్ స్కోర్ (0–100%) అనేది వర్కర్ నైపుణ్యాలు, దూరం, లభ్యత, గత రేటింగ్ మరియు విశ్వసనీయత ఆధారంగా లెక్కించబడుతుంది. ఎక్కువ స్కోర్ ఉన్న వర్కర్‌ను ఎంచుకుంటే పని నాణ్యతగా పూర్తవుతుంది.',
          action: { type: 'OPEN_APPLICANTS', target: 'applicants', label: 'మ్యాచ్ స్కోర్లు చూడండి' },
        };
      }
      if (lang === 'hi') {
        return {
          reply: 'वर्क मोजो AI मैच स्कोर (0–100%) कामगार की कुशलता, दूरी, उपलब्धता, रेटिंग और विश्वसनीयता पर आधारित होता है। उच्च स्कोर वाले कामगारों को चुनना बेहतरीन परिणाम सुनिश्चित करता है।',
          action: { type: 'OPEN_APPLICANTS', target: 'applicants', label: 'मैच स्कोर देखें' },
        };
      }
      if (lang === 'ta') {
        return {
          reply: 'AI பொருத்த மதிப்பெண் (0-100%) தொழிலாளரின் திறன், தூரம் மற்றும் மதிப்பீட்டின் அடிப்படையில் கணக்கிடப்படுகிறது.',
          action: { type: 'OPEN_APPLICANTS', target: 'applicants', label: 'பொருத்தம் காண்க' },
        };
      }
      return {
        reply: "WorkMojo's Random Forest AI Matching evaluates applicant skill relevance, travel distance, shift availability, and reliability history to produce an objective 0–100% score for informed hiring.",
        action: { type: 'OPEN_APPLICANTS', target: 'applicants', label: 'View Match Breakdown' },
      };
    }

    case 'LANGUAGE_CHANGE': {
      const target = entities.targetLanguage || 'en';
      if (target === 'te') {
        return {
          reply: 'ఖచ్చితంగా! ఇకపై నేను మీతో తెలుగులో మాట్లాడుతాను. మీకు ఏ సహాయం కావాలి?',
          action: { type: 'CHANGE_LANGUAGE', language: 'te', label: 'తెలుగు భాషలోకి మారింది' },
        };
      }
      if (target === 'hi') {
        return {
          reply: 'बिल्कुल! अब से मैं आपसे हिंदी में बात करूंगा। बताइए, मैं आपकी क्या सहायता कर सकता हूँ?',
          action: { type: 'CHANGE_LANGUAGE', language: 'hi', label: 'हिंदी भाषा चुनी गई' },
        };
      }
      if (target === 'ta') {
        return {
          reply: 'நிச்சயமாக! இனி நான் உங்களுடன் தமிழில் உரையாடுவேன். நான் உங்களுக்கு எவ்வாறு உதவலாம்?',
          action: { type: 'CHANGE_LANGUAGE', language: 'ta', label: 'தமிழ் மொழி மாற்றப்பட்டது' },
        };
      }
      return {
        reply: "Switched to English! How can I assist you with your jobs, workers, or payments on WorkMojo today?",
        action: { type: 'CHANGE_LANGUAGE', language: 'en', label: 'Language set to English' },
      };
    }

    case 'GREETING': {
      if (lang === 'te') {
        return {
          reply: `నమస్కారం! నేను మోజో — వర్క్ మోజో AI అసిస్టెంట్‌ని. ${role === 'customer' ? 'కొత్త పని పోస్ట్ చేయడం, వర్కర్లను ఎంచుకోవడం లేదా వేతనాలు' : 'సమీపంలోని పనులు, ₹800+ వేతనాలు లేదా హాజరు'} గురించి నన్ను అడగండి!`,
        };
      }
      if (lang === 'hi') {
        return {
          reply: `नमस्ते! मैं मोजो हूँ — आपका वर्क मोजो AI सहायक। ${role === 'customer' ? 'काम पोस्ट करने, कामगारों के चयन या मजदूरी' : 'नजदीकी काम, ₹800+ मजदूरी या उपस्थिति'} के बारे में मुझसे पूछें!`,
        };
      }
      if (lang === 'ta') {
        return {
          reply: `வணக்கம்! நான் மோஜோ — ஒர்க் மோஜோ AI உதவியாளர். ${role === 'customer' ? 'வேலை பதிவு செய்தல் அல்லது தொழிலாளர் தேர்வு' : 'வேலைகள் அல்லது கட்டணம்'} பற்றி என்னிடம் கேட்கலாம்!`,
        };
      }
      return {
        reply: `Hello! I'm Mojo, your WorkMojo assistant. As ${role === 'customer' ? 'an Employer, you can ask me to post jobs, select workers, or review applicants' : 'a Worker, you can explore gigs, ₹800+ wages, or attendance QR'}!`,
      };
    }

    case 'GENERAL_WORKMOJO_HELP':
    default: {
      if (lang === 'te') {
        return {
          reply: 'వర్క్ మోజో అనేది 100% జీరో-కమీషన్ గిగ్ ప్లాట్‌ఫారమ్. యజమానులు 60 సెకన్లలో పనులను పోస్ట్ చేయవచ్చు మరియు వర్కర్లు నేరుగా దరఖాస్తు చేసుకోవచ్చు. క్యూఆర్ హాజరు మరియు సురక్షిత చెల్లింపులతో పూర్తి పారదర్శకత లభిస్తుంది.',
          action: { type: 'OPEN_POST_JOB', target: 'post_job', label: 'పని పోస్ట్ చేయండి' },
        };
      }
      if (lang === 'hi') {
        return {
          reply: 'वर्क मोजो भारत का 100% कमीशन-मुक्त कार्य मंच है। नियोक्ता 60 सेकंड में काम पोस्ट कर सकते हैं और कामगार सीधे आवेदन कर सकते हैं। सुरक्षित क्यूआर उपस्थिति व सीधा भुगतान सुनिश्चित है।',
          action: { type: 'OPEN_POST_JOB', target: 'post_job', label: 'काम पोस्ट करें' },
        };
      }
      if (lang === 'ta') {
        return {
          reply: 'ஒர்க் மோஜோ என்பது பூஜ்ஜிய கமிஷன் தளமாகும். முதலாளிகள் 60 வினாடிகளில் வேலைகளைப் பதிவிடலாம், தொழிலாளர்கள் நேரடியாக விண்ணப்பிக்கலாம்.',
          action: { type: 'OPEN_POST_JOB', target: 'post_job', label: 'வேலை பதிவு செய்ய' },
        };
      }
      return {
        reply: 'WorkMojo is a 100% zero-commission daily wage and gig work platform. Employers post listings in under 60 seconds with transparent AI applicant matching, geofenced QR attendance, and instant wage payouts.',
        action: { type: 'OPEN_POST_JOB', target: 'post_job', label: 'Post a New Job' },
      };
    }
  }
}

// ---------------------------------------------------------------------------
// External AI Integration (Gemini & OpenAI) with Injected Context
// ---------------------------------------------------------------------------
function buildGeminiSystemPrompt(
  req: AiChatRequest,
  intent: MojoIntent,
  entities: ExtractedEntities,
  draft: JobDraft
): string {
  const lang = req.language || 'en';
  const role = req.role || 'customer';
  const ctx = req.context || {};

  const languageDirective =
    lang === 'te'
      ? 'CRITICAL LANGUAGE DIRECTIVE: You MUST reply entirely in Telugu (తెలుగు లిపి). Do NOT reply in English or Latin alphabet, except for universal technical acronyms like UPI, QR, OTP, WorkMojo.'
      : lang === 'hi'
      ? 'CRITICAL LANGUAGE DIRECTIVE: You MUST reply entirely in Hindi Devanagari script (हिन्दी देवनागरी लिपि). Do NOT reply in Latin/Roman script (Hinglish), except for terms like UPI, QR, OTP, WorkMojo.'
      : lang === 'ta'
      ? 'CRITICAL LANGUAGE DIRECTIVE: You MUST reply entirely in Tamil (தமிழ் எழுத்துரு). Do NOT reply in English or Latin script, except for universal terms like UPI, QR, OTP, WorkMojo.'
      : 'Reply in clear, professional, warm, and helpful English.';

  return `You are Mojo, the official AI Employment & Platform Assistant for "WorkMojo" — India's premier commission-free daily-wage and gig work platform.

CORE POLICIES:
1. 100% Zero Commission: WorkMojo never takes cuts from worker wages.
2. Fair Daily Wage Baselines: Typical market daily wages range ₹700 to ₹1200+ depending on trade.
3. Dual Role: Customers post jobs and select workers; Workers browse and apply with 1 tap.
4. Tamper-Proof Attendance: Geofenced QR-code scan for check-in/out.
5. Multi-Worker Hiring: Customers can hire any number of workers (e.g. 1, 2, 5, 8, 10, 20+). Overflow applicants are queued on an automated waiting list.

DETECTED USER INTENT: "${intent}"
EXTRACTED ENTITIES: ${JSON.stringify(entities)}
ACTIVE JOB DRAFT CONTEXT: ${JSON.stringify(draft)}
USER ROLE: "${role === 'customer' ? 'Employer/Customer' : 'Worker'}"
${ctx.activeScreen ? `ACTIVE SCREEN: "${ctx.activeScreen}"` : ''}

CRITICAL BEHAVIOR RULES:
- If Intent is "WORKER_SELECTION", DO NOT reply as if the user is posting a new job. Guide them on reviewing applicants, comparing AI match scores, and auto-selecting best candidates.
- If Intent is "WORKER_COUNT", acknowledge the exact number of workers requested (${entities.workersRequired || draft.workersRequired || 'requested count'}).
- If Intent is "WORKER_SEARCH", offer to view skilled workers in the directory.
- Keep responses concise and easy to read (2 to 4 sentences maximum).

LANGUAGE REQUIREMENT:
${languageDirective}`;
}

function sanitizeApiKey(text: string): string {
  return String(text).replace(/key=[^&\s"'`]+/gi, 'key=[REDACTED]');
}

async function callGemini(
  apiKey: string,
  req: AiChatRequest,
  intent: MojoIntent,
  entities: ExtractedEntities,
  draft: JobDraft
): Promise<string | null> {
  const userModel = process.env.GEMINI_MODEL;
  const systemPrompt = buildGeminiSystemPrompt(req, intent, entities, draft);

  const modelsToTry = Array.from(
    new Set([userModel, 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'].filter(Boolean) as string[])
  );

  for (const model of modelsToTry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nUser Question:\n"${req.message}"` }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.7,
            topP: 0.95,
          },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.status === 404) {
        continue;
      }

      if (!response.ok) {
        return null;
      }

      const data: any = await response.json();
      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidateText && candidateText.trim()) {
        return candidateText.trim();
      }
      return null;
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('[Gemini API] Error calling Gemini:', sanitizeApiKey(err?.message || String(err)));
      }
      return null;
    }
  }

  return null;
}

async function callOpenAI(
  apiKey: string,
  req: AiChatRequest,
  intent: MojoIntent,
  entities: ExtractedEntities,
  draft: JobDraft
): Promise<string | null> {
  const lang = req.language || 'en';
  const role = req.role || 'customer';
  const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const systemPrompt = `You are Mojo, the official AI assistant of WorkMojo (India's zero-commission gig platform).
User role: ${role}.
Detected Intent: ${intent}.
Active Draft: ${JSON.stringify(draft)}.
Respond strictly in ${
    lang === 'te' ? 'Telugu (తెలుగు script)' :
    lang === 'hi' ? 'Hindi (हिन्दी script)' :
    lang === 'ta' ? 'Tamil (தமிழ் script)' : 'English'
  }. Keep responses concise, warm, helpful (2-4 sentences max).`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: req.message },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data: any = await response.json();
    const candidateText = data?.choices?.[0]?.message?.content;
    return candidateText ? candidateText.trim() : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Master AI Entry Point
// ---------------------------------------------------------------------------
export async function processAiChat(req: AiChatRequest): Promise<AiChatResponse> {
  const language = req.language || 'en';
  const role = req.role || 'customer';
  const state: ConversationState = req.conversationState || req.context?.conversationState || { jobDraft: {} };

  if (!req.message || !req.message.trim()) {
    const defaultMsg =
      language === 'te' ? 'దయచేసి మీ సందేశాన్ని టైప్ చేయండి.' :
      language === 'hi' ? 'कृपया अपना संदेश दर्ज करें।' :
      language === 'ta' ? 'தயவுசெய்து உங்கள் செய்தியை உள்ளிடவும்.' :
      'Please enter a message.';
    return {
      success: false,
      reply: defaultMsg,
      language,
      provider: 'mojo-engine',
    };
  }

  // Step 1: Real Intent Classification & Entity Extraction
  const { intent, entities, updatedDraft } = classifyIntentAndExtractEntities(
    req.message,
    language,
    role,
    state
  );

  // Update Conversation State
  const nextState: ConversationState = {
    ...state,
    lastIntent: intent,
    jobDraft: updatedDraft,
  };

  // Development-only Debug Logging
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Mojo AI Dev] Detected Intent:', intent);
    console.log('[Mojo AI Dev] Extracted Entities:', entities);
    console.log('[Mojo AI Dev] Updated Draft:', updatedDraft);
  }

  // Step 2: Generate Deterministic Domain Engine Response & Action
  const domainResult = generateIntentResponse(intent, entities, updatedDraft, language, role);

  // Step 3: Optional External LLM Call (Gemini / OpenAI) if configured
  const geminiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GEMINI_API_KEY ||
    process.env.GEMINI_KEY;

  if (geminiKey && geminiKey.trim() !== '') {
    const geminiReply = await callGemini(geminiKey.trim(), req, intent, entities, updatedDraft);
    if (geminiReply) {
      return {
        success: true,
        reply: geminiReply,
        language: entities.targetLanguage || language,
        provider: 'gemini',
        intent,
        entities,
        conversationState: nextState,
        action: domainResult.action,
      };
    }
  }

  const openAiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
  if (openAiKey && openAiKey.trim() !== '') {
    const openAiReply = await callOpenAI(openAiKey.trim(), req, intent, entities, updatedDraft);
    if (openAiReply) {
      return {
        success: true,
        reply: openAiReply,
        language: entities.targetLanguage || language,
        provider: 'openai',
        intent,
        entities,
        conversationState: nextState,
        action: domainResult.action,
      };
    }
  }

  // Step 4: Fallback to Domain Response
  return {
    success: true,
    reply: domainResult.reply,
    language: entities.targetLanguage || language,
    provider: 'mojo-engine',
    intent,
    entities,
    conversationState: nextState,
    action: domainResult.action,
  };
}
