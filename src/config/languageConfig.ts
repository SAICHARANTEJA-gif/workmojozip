import { SupportedLanguage } from '../types';

export interface LanguageDefinition {
  code: SupportedLanguage;
  bcp47: string;
  name: string;
  nativeName: string;
  voiceLocales: string[];
  preferredVoiceNames: string[];
  greeting: {
    worker: string;
    customer: string;
  };
  placeholder: {
    idle: string;
    listening: string;
  };
  voiceNotice: {
    notInstalled: string;
    playing: string;
  };
  speechErrors: {
    notAllowed: string;
    noSpeech: string;
    audioCapture: string;
    network: string;
    general: string;
  };
}

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageDefinition> = {
  en: {
    code: 'en',
    bcp47: 'en-IN',
    name: 'English',
    nativeName: 'English',
    voiceLocales: ['en-IN', 'en-GB', 'en-US', 'en'],
    preferredVoiceNames: ['Ravi', 'Heera', 'Neerja', 'Prabhat', 'Google UK English Female', 'Google US English'],
    greeting: {
      worker: "Hi! I'm Mojo, your friendly WorkMojo assistant! Looking for nearby work, wage details, or payment help?",
      customer: "Hi! I'm Mojo, your WorkMojo assistant! Need help posting a job, finding verified workers, or tracking attendance?",
    },
    placeholder: {
      idle: "Ask Mojo anything in English...",
      listening: "Listening in Indian English... Speak now",
    },
    voiceNotice: {
      notInstalled: "English voice is ready on your device.",
      playing: "Mojo is speaking...",
    },
    speechErrors: {
      notAllowed: "Microphone permission was denied. Please allow microphone access in your browser.",
      noSpeech: "No speech was detected. Tap the mic button and try speaking again.",
      audioCapture: "No microphone was detected on this device.",
      network: "Network connection error during speech recognition.",
      general: "Speech recognition encountered an issue. Please try typing your message.",
    },
  },
  te: {
    code: 'te',
    bcp47: 'te-IN',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    voiceLocales: ['te-IN', 'te_IN', 'te'],
    preferredVoiceNames: ['Mohan', 'Shruti', 'Google తెలుగు', 'Telugu', 'te-in'],
    greeting: {
      worker: "నమస్కారం! నేను మోజో, మీ వర్క్ మోజో అసిస్టెంట్! సమీప పనులు, వేతనాలు లేదా చెల్లింపుల సమాచారం కావాలా?",
      customer: "నమస్కారం! నేను మోజో! కొత్త పనిని పోస్ట్ చేయడానికి లేదా ధృవీకరించబడిన వర్కర్లను కనుగొనడానికి సహాయం కావాలా?",
    },
    placeholder: {
      idle: "మోజోను తెలుగులో ఏదైనా అడగండి...",
      listening: "తెలుగులో వింటున్నాను... ఇప్పుడు మాట్లాడండి",
    },
    voiceNotice: {
      notInstalled: "మీ బ్రౌజర్ లేదా డివైస్‌లో తెలుగు వాయిస్ ప్యాక్ లేదు. సమాధానం టెక్స్ట్‌గా క్రింద ఇవ్వబడింది.",
      playing: "మోజో తెలుగులో మాట్లాడుతోంది...",
    },
    speechErrors: {
      notAllowed: "మైక్రోఫోన్ అనుమతి నిరాకరించబడింది. దయచేసి బ్రౌజర్ సెట్టింగ్స్‌లో మైక్ అనుమతించండి.",
      noSpeech: "మాట వినబడలేదు. దయచేసి మైక్ నొక్కి మళ్ళీ స్పష్టంగా మాట్లాడండి.",
      audioCapture: "ఈ పరికరంలో మైక్రోఫోన్ కనుగొనబడలేదు.",
      network: "వాయిస్ రికగ్నిషన్ సమయంలో నెట్‌వర్క్ సమస్య ఏర్పడింది.",
      general: "వాయిస్ ఇన్‌పుట్‌లో సమస్య ఏర్పడింది. దయచేసి టైప్ చేయండి.",
    },
  },
  hi: {
    code: 'hi',
    bcp47: 'hi-IN',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    voiceLocales: ['hi-IN', 'hi_IN', 'hi'],
    preferredVoiceNames: ['Kalpana', 'Hemant', 'Swara', 'Madhur', 'Google हिन्दी', 'Hindi', 'hi-in'],
    greeting: {
      worker: "नमस्ते! मैं मोजो हूँ, आपका वर्क मोजो सहायक! नजदीकी काम, मजदूरी या भुगतान में क्या मदद करूँ?",
      customer: "नमस्ते! मैं मोजो हूँ! नया काम पोस्ट करने, कामगार खोजने या उपस्थिति जांचने में क्या सहायता करूँ?",
    },
    placeholder: {
      idle: "मोजो से हिन्दी में कुछ भी पूछें...",
      listening: "हिन्दी में सुन रहा हूँ... अब बोलें",
    },
    voiceNotice: {
      notInstalled: "आपके ब्राउज़र या डिवाइस में हिन्दी वॉयस पैक उपलब्ध नहीं है। उत्तर नीचे टेक्स्ट में है।",
      playing: "मोजो हिन्दी में बोल रहा है...",
    },
    speechErrors: {
      notAllowed: "माइक्रोफ़ोन अनुमति अस्वीकृत। कृपया ब्राउज़र सेटिंग्स में माइक की अनुमति दें।",
      noSpeech: "कोई आवाज़ नहीं सुनाई दी। कृपया माइक दबाकर दोबारा बोलें।",
      audioCapture: "इस डिवाइस पर कोई माइक्रोफ़ोन नहीं मिला।",
      network: "वॉयस रिकॉग्निशन के दौरान नेटवर्क त्रुटि।",
      general: "वॉयस इनपुट में समस्या आई। कृपया टेक्स्ट टाइप करें।",
    },
  },
  ta: {
    code: 'ta',
    bcp47: 'ta-IN',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    voiceLocales: ['ta-IN', 'ta_IN', 'ta'],
    preferredVoiceNames: ['Valluvar', 'Pallavi', 'Google தமிழ்', 'Tamil', 'ta-in'],
    greeting: {
      worker: "வணக்கம்! நான் மோஜோ, உங்கள் ஒர்க் மோஜோ உதவியாளர்! அருகிலுள்ள வேலைகள், கூலி அல்லது பணம் பெறுவதில் உதவி தேவையா?",
      customer: "வணக்கம்! நான் மோஜோ! வேலை பதிவு செய்ய அல்லது தொழிலாளர்களைத் தேர்ந்தெடுக்க உதவி தேவையா?",
    },
    placeholder: {
      idle: "மோஜோவிடம் தமிழில் எதையும் கேளுங்கள்...",
      listening: "தமிழில் கேட்கிறேன்... இப்போது பேசுங்கள்",
    },
    voiceNotice: {
      notInstalled: "உங்கள் உலாவியில் தமிழ் குரல் தொகுப்பு நிறுவப்படவில்லை. பதில் கீழே உரையாகக் காட்டப்பட்டுள்ளது.",
      playing: "மோஜோ தமிழில் பேசுகிறார்...",
    },
    speechErrors: {
      notAllowed: "மைக்ரோஃபோன் அனுமதி மறுக்கப்பட்டது. உலாவியில் மைக்கை அனுமதிக்கவும்.",
      noSpeech: "குரல் கேட்கவில்லை. மைக்கை அழுத்தி மீண்டும் பேசவும்.",
      audioCapture: "இந்த சாதனத்தில் மைக்ரோஃபோன் கிடைக்கவில்லை.",
      network: "குரல் அங்கீகாரத்தின் போது பிணையப் பிழை.",
      general: "குரல் உள்ளீட்டில் சிக்கல் ஏற்பட்டது. தட்டச்சு செய்யவும்.",
    },
  },
};

export const EXTENSION_SLOTS = [
  { code: 'kn', bcp47: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', bcp47: 'ml-IN', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'mr', bcp47: 'mr-IN', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'bn', bcp47: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা' },
];

export const getLanguageConfig = (lang: SupportedLanguage): LanguageDefinition => {
  return SUPPORTED_LANGUAGES[lang] || SUPPORTED_LANGUAGES.en;
};

