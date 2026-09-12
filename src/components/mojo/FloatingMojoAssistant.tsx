import React, { useState, useEffect, useRef } from 'react';
import { MojoMascotIcon } from './MojoMascotIcon';
import { useApp } from '../../store/AppContext';
import { speechService } from '../../services/speechService';
import { SupportedLanguage } from '../../types';
import { getLanguageConfig } from '../../config/languageConfig';
import { LanguageSelector } from '../common/LanguageSelector';
import {
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  Globe,
  Square,
  AlertCircle,
  Play,
  Trash2,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { api } from '../../services/api';
import { GeminiLiveClient, VoiceState } from '../../services/voice/geminiLiveClient';

interface ChatMessage {
  id: string;
  sender: 'mojo' | 'user';
  text: string;
  actionText?: string;
  onAction?: () => void;
  timestamp: string;
  lang?: SupportedLanguage;
  isError?: boolean;
  retryQuery?: string;
}

export interface FloatingMojoAssistantProps {
  onOpenDirectoryWithCategory?: (category: string) => void;
  onOpenPostJob?: (draft?: any) => void;
  onOpenApplicants?: (jobOrJobId?: string) => void;
}

export const FloatingMojoAssistant: React.FC<FloatingMojoAssistantProps> = ({
  onOpenDirectoryWithCategory,
  onOpenPostJob,
  onOpenApplicants,
}) => {
  const {
    activeRole,
    activeScreen,
    setActiveScreen,
    setFilters,
    jobs,
    user,
    autoSelectWorkersForJob,
    language,
    setLanguage,
    createJob,
    refreshJobs,
  } = useApp();

  const langConfig = getLanguageConfig(language);

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [voiceAvailable, setVoiceAvailable] = useState<boolean>(true);
  const [voiceName, setVoiceName] = useState<string | undefined>(undefined);
  const [isLangSelectorOpen, setIsLangSelectorOpen] = useState<boolean>(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('IDLE');
  const [liveVolume, setLiveVolume] = useState<number>(0);
  const [freqBars, setFreqBars] = useState<number[]>([4, 4, 4, 4, 4]);
  const liveClientRef = useRef<GeminiLiveClient | null>(null);

  const [conversationState, setConversationState] = useState<{
    lastIntent?: string;
    jobDraft?: {
      title?: string;
      category?: string;
      description?: string;
      workersRequired?: number;
      wage?: number;
      startTime?: string;
      endTime?: string;
      location?: string;
      date?: string;
    };
    activeJobId?: string;
  }>({
    jobDraft: {},
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const cfg = getLanguageConfig(language);
    const greeting = activeRole === 'worker' ? cfg.greeting.worker : cfg.greeting.customer;
    return [
      {
        id: 'm-init',
        sender: 'mojo',
        text: greeting,
        timestamp: 'Just now',
        lang: language,
      },
    ];
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check voice availability on mount & on language or voice list changes
  useEffect(() => {
    const updateVoiceInfo = () => {
      const info = speechService.getVoiceInfo(language);
      setVoiceAvailable(info.available);
      setVoiceName(info.voiceName);
    };

    updateVoiceInfo();
    const unsubscribe = speechService.onVoicesChanged(updateVoiceInfo);
    return () => {
      unsubscribe();
    };
  }, [language]);

  // Real-time audio frequency visualizer loop
  useEffect(() => {
    let animId: number;
    const updateFreqs = () => {
      if (
        liveClientRef.current &&
        (voiceState === 'USER_SPEAKING' ||
          voiceState === 'MOJO_SPEAKING' ||
          (voiceState as string) === 'SPEAKING' ||
          voiceState === 'LISTENING')
      ) {
        const data = liveClientRef.current.getFrequencyData();
        if (data && data.length > 0) {
          const step = Math.max(1, Math.floor(data.length / 5));
          const bars = [
            Math.max(4, Math.min(24, Math.round((data[0] / 255) * 24))),
            Math.max(4, Math.min(24, Math.round((data[step] / 255) * 24))),
            Math.max(4, Math.min(24, Math.round((data[step * 2] / 255) * 24))),
            Math.max(4, Math.min(24, Math.round((data[step * 3] / 255) * 24))),
            Math.max(4, Math.min(24, Math.round((data[step * 4] / 255) * 24))),
          ];
          setFreqBars(bars);
        } else {
          setFreqBars([4, 4, 4, 4, 4]);
        }
      }
      animId = requestAnimationFrame(updateFreqs);
    };

    if (voiceState !== 'IDLE') {
      animId = requestAnimationFrame(updateFreqs);
    }
    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [voiceState]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // Update initial greeting if user changes language and hasn't started a deep conversation
  useEffect(() => {
    const cfg = getLanguageConfig(language);
    const greeting = activeRole === 'worker' ? cfg.greeting.worker : cfg.greeting.customer;
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'm-init') {
        return [
          {
            id: 'm-init',
            sender: 'mojo',
            text: greeting,
            timestamp: 'Just now',
            lang: language,
          },
        ];
      }
      return prev;
    });

    // Cancel active speech when language switches
    if (speechService.isSpeaking()) {
      speechService.stopSpeaking();
      setSpeakingMessageId(null);
    }

    // Sync live voice language dynamically without reconnecting
    if (liveClientRef.current && voiceState !== 'IDLE') {
      liveClientRef.current.updateLanguage(language);
    }
  }, [language, activeRole, voiceState]);

  // Disconnect live voice if modal closes
  useEffect(() => {
    if (!isOpen && liveClientRef.current) {
      liveClientRef.current.disconnect();
      setVoiceState('IDLE');
      setLiveVolume(0);
    }
  }, [isOpen]);

  // Clean up speech, live client, and timers on unmount
  useEffect(() => {
    return () => {
      liveClientRef.current?.disconnect();
      speechService.stopSpeaking();
      speechService.stopListening();
      if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    };
  }, []);

  const triggerVoiceNotice = (errMsg: string) => {
    setSpeechError(errMsg);
    if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current);
    errorTimeoutRef.current = setTimeout(() => {
      setSpeechError(null);
    }, 4500);
  };

  // Speak a specific message
  const handleSpeakMessage = (msgId: string, text: string, msgLang?: SupportedLanguage) => {
    const targetLang = msgLang || language;
    const hasVoice = speechService.hasVoiceForLanguage(targetLang);

    if (!hasVoice && targetLang !== 'en') {
      const cfg = getLanguageConfig(targetLang);
      triggerVoiceNotice(cfg.voiceNotice.notInstalled);
      return;
    }

    if (speakingMessageId === msgId) {
      speechService.stopSpeaking();
      setSpeakingMessageId(null);
      return;
    }

    speechService.stopSpeaking();
    setSpeakingMessageId(msgId);

    speechService.speak(text, targetLang, {
      onStart: () => {
        setSpeakingMessageId(msgId);
      },
      onEnd: () => {
        setSpeakingMessageId(null);
      },
      onError: err => {
        setSpeakingMessageId(null);
        if (err.code === 'VOICE_NOT_INSTALLED') {
          const cfg = getLanguageConfig(targetLang);
          triggerVoiceNotice(cfg.voiceNotice.notInstalled);
        }
      },
    });
  };

  const handleStopSpeaking = () => {
    speechService.stopSpeaking();
    setSpeakingMessageId(null);
  };

  // Context-aware suggested prompts per language and role
  const getContextSuggestions = (): Array<{ label: string; query: string }> => {
    if (activeRole === 'worker') {
      if (activeScreen === 'jobs') {
        switch (language) {
          case 'te':
            return [
              { label: '🚚 నా దగ్గర డెలివరీ పనులు', query: 'నా దగ్గర డెలివరీ పనులు చూపించు' },
              { label: '💰 ₹800+ జీతం పనులు', query: '₹800 కంటే ఎక్కువ జీతం పనులు చూపించు' },
              { label: '💳 చెల్లింపు పద్ధతులు ఎలా?', query: 'వర్కర్లకు చెల్లింపులు ఎలా జరుగుతాయి?' },
              { label: '⏳ వెయిటింగ్ లిస్ట్ అంటే ఏమిటి?', query: 'వెయిటింగ్ లిస్ట్ అంటే ఏమిటి?' },
            ];
          case 'hi':
            return [
              { label: '🚚 मेरे पास डिलीवरी काम', query: 'मेरे पास डिलीवरी काम दिखाएं' },
              { label: '💰 ₹800+ वेतन वाले काम', query: '₹800 से अधिक वेतन वाले काम दिखाएं' },
              { label: '💳 भुगतान के तरीके क्या हैं?', query: 'कामगारों को भुगतान कैसे मिलता है?' },
              { label: '⏳ वेटिंग लिस्ट क्या है?', query: 'वेटिंग लिस्ट का क्या मतलब है?' },
            ];
          case 'ta':
            return [
              { label: '🚚 டெலிவரி வேலைகள்', query: 'என் அருகில் டெலிவரி வேலைகளைக் காட்டு' },
              { label: '💰 ₹800+ ஊதிய வேலைகள்', query: '₹800க்கு மேல் ஊதியம் தரும் வேலைகள்' },
              { label: '💳 பணப் பரிவர்த்தனை எப்படி?', query: 'தொழிலாளர்களுக்கு பணம் எவ்வாறு வழங்கப்படுகிறது?' },
              { label: '⏳ காத்திருப்பு பட்டியல் என்றால் என்ன?', query: 'காத்திருப்பு பட்டியல் என்றால் என்ன?' },
            ];
          default:
            return [
              { label: '🚚 Delivery jobs near me', query: 'Show delivery jobs near me' },
              { label: '💰 Jobs paying ₹800+', query: 'Show jobs above ₹800' },
              { label: '💳 How payments work?', query: 'How do worker payments work?' },
              { label: '⏳ What is Waiting List?', query: 'What does Waiting List mean?' },
            ];
        }
      }
      if (activeScreen === 'confirmed_job') {
        switch (language) {
          case 'te':
            return [
              { label: '📍 చిరునామా ఎప్పుడు కనిపిస్తుంది?', query: 'ఖచ్చితమైన చిరునామా ఎప్పుడు కనిపిస్తుంది?' },
              { label: '📲 క్యూఆర్ కోడ్ హాజరు ఎలా?', query: 'క్యూఆర్ కోడ్ హాజరు ఎలా నమోదు చేయాలి?' },
              { label: '🚨 SOS అత్యవసరం ఎలా పనిచేస్తుంది?', query: 'SOS అత్యవసర సహాయం ఎలా పనిచేస్తుంది?' },
              { label: '⭐ రేటింగ్ ఎలా అప్‌డేట్ అవుతుంది?', query: 'రేటింగ్ ఎలా పనిచేస్తుంది?' },
            ];
          case 'hi':
            return [
              { label: '📍 पता कब दिखेगा?', query: 'सटीक पता कब दिखाई देगा?' },
              { label: '📲 क्यूआर उपस्थिति कैसे दर्ज करें?', query: 'क्यूआर कोड उपस्थिति कैसे दर्ज करें?' },
              { label: '🚨 SOS आपातकाल कैसे काम करता है?', query: 'SOS आपातकालीन सहायता कैसे काम करती है?' },
              { label: '⭐ रेटिंग कैसे अपडेट होती है?', query: 'रेटिंग कैसे काम करती है?' },
            ];
          case 'ta':
            return [
              { label: '📍 முகவரி எப்போது தெரியும்?', query: 'சரியான முகவரி எப்போது தெரியும்?' },
              { label: '📲 கியூஆர் வருகை எப்படி?', query: 'கியூஆர் குறியீடு வருகை எவ்வாறு பதிவு செய்வது?' },
              { label: '🚨 SOS அவசர உதவி எப்படி?', query: 'SOS அவசர உதவி எப்படி செயல்படுகிறது?' },
              { label: '⭐ மதிப்பீடு எப்படி மாறும்?', query: 'மதிப்பீடு எப்படி செயல்படுகிறது?' },
            ];
          default:
            return [
              { label: '📍 When is address shown?', query: 'When is exact location shown?' },
              { label: '📲 How does QR attendance work?', query: 'How do I scan QR for attendance?' },
              { label: '🚨 How does SOS work?', query: 'How does SOS emergency help work?' },
              { label: '⭐ How is my rating updated?', query: 'How does rating work?' },
            ];
        }
      }
      // General worker suggestions
      switch (language) {
        case 'te':
          return [
            { label: '🔍 సమీపంలో పనులు వెతకండి', query: 'నా సమీపంలో ఏ పనులు ఉన్నాయి?' },
            { label: '💳 చెల్లింపుల పేజీ తెరవండి', query: 'నా చెల్లింపులు మరియు సంపాదన చూపించు' },
            { label: '🎯 మ్యాచ్ స్కోర్ ఎందుకు వచ్చింది?', query: 'నాకు ఈ మ్యాచ్ స్కోర్ ఎందుకు వచ్చింది?' },
            { label: '📝 దరఖాస్తు ఎలా చేయాలి?', query: 'పనికి ఎలా దరఖాస్తు చేయాలి?' },
          ];
        case 'hi':
          return [
            { label: '🔍 नजदीकी काम खोजें', query: 'मेरे आस-पास कौन से काम हैं?' },
            { label: '💳 भुगतान विवरण खोलें', query: 'मेरा भुगतान और कुल कमाई दिखाएं' },
            { label: '🎯 यह मैच स्कोर क्यों मिला?', query: 'मुझे यह सिफारिश क्यों मिली?' },
            { label: '📝 आवेदन कैसे करें?', query: 'काम के लिए आवेदन कैसे करें?' },
          ];
        case 'ta':
          return [
            { label: '🔍 அருகிலுள்ள வேலைகளைக் காண்க', query: 'என் அருகில் என்ன வேலைகள் உள்ளன?' },
            { label: '💳 கட்டணப் பக்கத்தைத் திறக்கவும்', query: 'என் கட்டணங்கள் மற்றும் வருமானத்தைக் காட்டு' },
            { label: '🎯 பொருத்த மதிப்பெண் ஏன்?', query: 'எனக்கு இந்த பரிந்துரை ஏன் கிடைத்தது?' },
            { label: '📝 எப்படி விண்ணப்பிப்பது?', query: 'வேலைக்கு எப்படி விண்ணப்பிப்பது?' },
          ];
        default:
          return [
            { label: '🔍 Find nearby jobs', query: 'What jobs are near me?' },
            { label: '💳 View My Payments', query: 'Show my earnings and payment methods' },
            { label: '🎯 Why this match score?', query: 'Why did I get this recommendation?' },
            { label: '📝 How do I apply?', query: 'How do I apply for a job?' },
          ];
      }
    } else {
      // Customer / Employer Suggestions
      if (activeScreen === 'post_job') {
        switch (language) {
          case 'te':
            return [
              { label: '💡 న్యాయమైన రోజువారీ వేతనం ఎంత?', query: 'హెల్పర్లకు న్యాయమైన రోజువారీ వేతనం ఎంత?' },
              { label: '⚡ ఆటో ఎంపిక ఎలా పనిచేస్తుంది?', query: 'ఆటోమేటిక్ సెలక్షన్ ఎలా పనిచేస్తుంది?' },
              { label: '🔒 లొకేషన్ గోప్యత వివరాలు', query: 'నా చిరునామా ఎప్పుడు షేర్ అవుతుంది?' },
            ];
          case 'hi':
            return [
              { label: '💡 उचित दैनिक वेतन सलाह', query: 'सहायकों के लिए उचित दैनिक वेतन क्या है?' },
              { label: '⚡ ऑटो-सिलेक्शन कैसे काम करता है?', query: 'स्वचालित चयन कैसे काम करता है?' },
              { label: '🔒 लोकेशन गोपनीयता जानकारी', query: 'मेरा कार्यस्थल पता कब साझा किया जाता है?' },
            ];
          case 'ta':
            return [
              { label: '💡 நியாயமான ஊதிய வழிகாட்டுதல்', query: 'உதவியாளர்களுக்கு நியாயமான தினசரி ஊதியம் என்ன?' },
              { label: '⚡ தானியங்கி தேர்வு எப்படி?', query: 'தானியங்கி தேர்வு எவ்வாறு செயல்படுகிறது?' },
              { label: '🔒 இருப்பிட தனியுரிமை விவரம்', query: 'எனது முகவரி எப்போது பகிரப்படும்?' },
            ];
          default:
            return [
              { label: '💡 Fair wage guidance', query: 'What is a fair daily wage for helpers?' },
              { label: '⚡ Manual vs Auto selection?', query: 'How does automatic selection work?' },
              { label: '🔒 Location privacy info', query: 'When is my workplace location shared?' },
            ];
        }
      }
      if (activeScreen === 'applicants') {
        switch (language) {
          case 'te':
            return [
              { label: '🏆 అత్యుత్తమ అభ్యర్థి ఎవరు?', query: 'అత్యుత్తమ అభ్యర్థి ఎవరు?' },
              { label: '🔄 వర్కర్ రద్దు చేస్తే ఏమవుతుంది?', query: 'వర్కర్ రద్దు చేసుకుంటే ఏమవుతుంది?' },
              { label: '⚡ ఇప్పుడే ఆటో-సెలెక్ట్ చేయండి', query: 'ఉత్తమ వర్కర్లను ఆటో సెలెక్ట్ చేయండి' },
            ];
          case 'hi':
            return [
              { label: '🏆 सबसे अच्छा मैच कौन है?', query: 'सबसे अच्छा आवेदक कौन है?' },
              { label: '🔄 अगर कामगार रद्द करे तो क्या होगा?', query: 'कामगार रद्द करने पर क्या होता है?' },
              { label: '⚡ अभी ऑटो-सेलेक्ट करें', query: 'सर्वश्रेष्ठ कामगारों को ऑटो सेलेक्ट करें' },
            ];
          case 'ta':
            return [
              { label: '🏆 சிறந்த பொருத்தம் யார்?', query: 'சிறந்த விண்ணப்பதாரர் யார்?' },
              { label: '🔄 தொழிலாளி ரத்து செய்தால் என்னவாகும்?', query: 'தொழிலாளி ரத்து செய்தால் என்ன நடக்கும்?' },
              { label: '⚡ இப்போது தானாகத் தேர்ந்தெடுங்கள்', query: 'சிறந்த தொழிலாளர்களை தானாக தேர்வு செய்க' },
            ];
          default:
            return [
              { label: '🏆 Who is best match?', query: 'Who is the best applicant match?' },
              { label: '🔄 What if a worker cancels?', query: 'What happens if a confirmed worker cancels?' },
              { label: '⚡ Auto-select now', query: 'Auto select best workers' },
            ];
        }
      }
      // General customer suggestions
      switch (language) {
        case 'te':
          return [
            { label: '📋 కొత్త పని ఎలా పోస్ట్ చేయాలి?', query: 'కొత్త పని ఎలా పోస్ట్ చేయాలి?' },
            { label: '💳 వర్కర్లకు చెల్లింపు ఎలా చేయాలి?', query: 'వర్కర్లకు వేతనం ఎలా చెల్లించాలి?' },
            { label: '👥 వెయిటింగ్ లిస్ట్ రీప్లేస్‌మెంట్ ఎలా?', query: 'వెయిటింగ్ లిస్ట్ రీప్లేస్‌మెంట్ ఎలా పనిచేస్తుంది?' },
            { label: '🔄 మంచి వర్కర్‌ని మళ్లీ నియమించడం ఎలా?', query: 'మంచి వర్కర్లను మళ్లీ ఎలా నియమించాలి?' },
          ];
        case 'hi':
          return [
            { label: '📋 नया काम कैसे पोस्ट करें?', query: 'नया काम कैसे पोस्ट करें?' },
            { label: '💳 कामगारों को भुगतान कैसे करें?', query: 'कामगारों को वेतन का भुगतान कैसे करें?' },
            { label: '👥 वेटिंग लिस्ट कैसे काम करती है?', query: 'वेटिंग लिस्ट कैसे काम करती है?' },
            { label: '🔄 पुराने कामगार को दोबारा कैसे रखें?', query: 'अच्छे कामगार को दोबारा कैसे रखें?' },
          ];
        case 'ta':
          return [
            { label: '📋 புதிய வேலை எப்படி பதிவிடுவது?', query: 'புதிய வேலை எப்படி பதிவிடுவது?' },
            { label: '💳 தொழிலாளர்களுக்கு எப்படி பணம் வழங்குவது?', query: 'தொழிலாளர்களுக்கு கூலி எவ்வாறு செலுத்துவது?' },
            { label: '👥 காத்திருப்பு பட்டியல் எப்படி?', query: 'காத்திருப்பு பட்டியல் எவ்வாறு செயல்படுகிறது?' },
            { label: '🔄 பழைய தொழிலாளியை மீண்டும் அமர்த்துவது எப்படி?', query: 'நல்ல தொழிலாளியை மீண்டும் அமர்த்துவது எப்படி?' },
          ];
        default:
          return [
            { label: '📋 How to post a job?', query: 'How do I post a job?' },
            { label: '💳 How to pay workers?', query: 'How do employer payments work?' },
            { label: '👥 How waiting list works?', query: 'How does waiting list replacement work?' },
            { label: '🔄 Hire again previous worker', query: 'How do I re-hire good workers?' },
          ];
      }
    }
  };

  const resolveAction = (action?: any, currentDraft?: any): { actionText?: string; onAction?: () => void } => {
    if (!action) return {};
    let actionText: string | undefined = action.label;
    let onAction: (() => void) | undefined;

    if (action.type === 'CHANGE_LANGUAGE') {
      if (action.language) {
        setLanguage(action.language);
      }
      actionText = actionText || (
        language === 'te' ? 'భాషను మార్చండి' :
        language === 'hi' ? 'भाषा बदलें' :
        language === 'ta' ? 'மொழியை மாற்றுங்கள்' :
        'Change Language'
      );
      onAction = () => {
        setIsLangSelectorOpen(true);
      };
    } else if (action.type === 'PUBLISH_JOB') {
      const draftToPublish = action.jobDraft || currentDraft || conversationState.jobDraft || {};
      actionText = actionText || (
        language === 'te' ? 'పని పబ్లిష్ చేయండి' :
        language === 'hi' ? 'काम पब्लिश करें' :
        language === 'ta' ? 'வேலை வெளியிடுங்கள்' :
        'Publish Job Now'
      );
      onAction = async () => {
        try {
          const defaultCategory = (draftToPublish.category as any) || 'Loading/Unloading';
          const defaultWorkers = Number(draftToPublish.workersRequired) || 1;
          const defaultWage = Number(draftToPublish.wage) || 800;
          const defaultTitle = draftToPublish.title || `${defaultCategory} Work`;
          const defaultArea = draftToPublish.location || 'Koramangala, Bangalore';

          const published = await createJob({
            customerId: user.id,
            customerName: user.name,
            customerPhoto: user.profilePhoto,
            customerRating: user.rating,
            customerKyc: user.kycStatus === 'verified',
            businessName: `${user.name}'s Service Request`,
            title: defaultTitle,
            category: defaultCategory,
            description: draftToPublish.description || `Mojo voice-created request for ${defaultWorkers} ${defaultCategory} worker(s).`,
            image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
            wage: defaultWage,
            startTime: draftToPublish.startTime || '09:00 AM',
            endTime: draftToPublish.endTime || '06:00 PM',
            duration: '8 hours',
            urgency: 'Today',
            approximateArea: defaultArea,
            approximateDistanceKm: 2.1,
            exactLocation: {
              approximateArea: defaultArea,
              exactAddress: draftToPublish.location || 'Bengaluru Central',
              lat: 12.934,
              lng: 77.625,
            },
            workersRequired: defaultWorkers,
            selectionMode: draftToPublish.selectionMode || 'manual',
            status: 'Open',
            recurring: 'none',
          });

          // Reset draft on success
          setConversationState(prev => ({ ...prev, jobDraft: {} }));
          try {
            refreshJobs?.();
          } catch {}

          const successMsg: ChatMessage = {
            id: 'mojo-' + Date.now(),
            sender: 'mojo',
            text: language === 'te'
              ? `✓ "${published.title}" పని విజయవంతంగా పబ్లిష్ చేయబడింది! సమీప వర్కర్లకు మ్యాచ్ నోటిఫికేషన్లు వెళ్లాయి.`
              : language === 'hi'
              ? `✓ "${published.title}" काम सफलतापूर्वक पब्लिश हो गया है! कामगारों को नोटिफिकेशन भेजे जा रहे हैं।`
              : language === 'ta'
              ? `✓ "${published.title}" வேலை வெற்றிகரமாக வெளியிடப்பட்டது! தொழிலாளர்களுக்கு அறிவிப்புகள் அனுப்பப்பட்டுள்ளன.`
              : `✓ Job "${published.title}" published successfully! Verified nearby workers are being notified.`,
            actionText: language === 'te' ? 'అభ్యర్థులను చూడండి' : language === 'hi' ? 'आवेदक देखें' : 'View Applicants',
            onAction: () => {
              if (onOpenApplicants) onOpenApplicants(published.id);
              else setActiveScreen('applicants');
              setIsOpen(false);
            },
            timestamp: 'Just now',
            lang: language,
          };
          setMessages(prev => [...prev, successMsg]);
        } catch (pubErr: any) {
          console.error('[Mojo Assistant] Voice publish failed:', pubErr);
          const failMsg: ChatMessage = {
            id: 'mojo-' + Date.now(),
            sender: 'mojo',
            text: language === 'te'
              ? `పని పబ్లిష్ చేయడం విఫలమైంది: ${pubErr?.message || 'దయచేసి మళ్ళీ ప్రయత్నించండి'}. మీ డ్రాఫ్ట్ భద్రంగా ఉంది.`
              : language === 'hi'
              ? `काम पब्लिश करने में विफल: ${pubErr?.message || 'कृपया पुन: प्रयास करें'}। आपका ड्राफ्ट सुरक्षित है।`
              : language === 'ta'
              ? `வேலை வெளியீடு தோல்வியடைந்தது: ${pubErr?.message || 'மீண்டும் முயற்சிக்கவும்'}. வரைவு பாதுகாக்கப்பட்டுள்ளது.`
              : `Failed to publish job: ${pubErr?.message || 'Please try again'}. Your draft has been preserved.`,
            actionText: 'Retry Publish',
            onAction,
            timestamp: 'Just now',
            lang: language,
            isError: true,
          };
          setMessages(prev => [...prev, failMsg]);
        }
      };
    } else if (action.type === 'OPEN_POST_JOB' || action.type === 'UPDATE_JOB_DRAFT') {
      const draftToUse = action.jobDraft || currentDraft || conversationState.jobDraft;
      actionText = actionText || (action.type === 'OPEN_POST_JOB' ? 'Post Job Now' : 'Continue Job Post');
      onAction = () => {
        if (onOpenPostJob) {
          onOpenPostJob(draftToUse);
        } else {
          setActiveScreen('post_job');
        }
        setIsOpen(false);
      };
    } else if (action.type === 'OPEN_WORKER_SEARCH') {
      const cat = action.filterCategory || 'All';
      actionText = actionText || `View ${cat} Workers`;
      onAction = () => {
        if (onOpenDirectoryWithCategory) {
          onOpenDirectoryWithCategory(cat);
        } else {
          setActiveScreen('directory');
        }
        setIsOpen(false);
      };
    } else if (action.type === 'OPEN_APPLICANTS' || action.type === 'CANCEL_JOB') {
      const targetJobId = action.jobId || jobs[0]?.id;
      actionText = actionText || (action.type === 'CANCEL_JOB' ? 'Job Options' : 'Review Applicants');
      onAction = () => {
        if (onOpenApplicants) {
          onOpenApplicants(targetJobId);
        } else {
          setActiveScreen('applicants');
        }
        setIsOpen(false);
      };
    } else if (action.type === 'AUTO_SELECT_WORKERS') {
      const targetJobId = action.jobId || jobs[0]?.id;
      actionText = actionText || 'Auto-Select Best Workers';
      onAction = () => {
        if (targetJobId) {
          autoSelectWorkersForJob(targetJobId);
        }
        if (onOpenApplicants) {
          onOpenApplicants(targetJobId);
        } else {
          setActiveScreen('applicants');
        }
        setIsOpen(false);
      };
    } else if (action.type === 'view_workers') {
      const cat = (action as any).category || action.filterCategory || 'All';
      actionText = actionText || 'View Skilled Workers';
      onAction = () => {
        if (onOpenDirectoryWithCategory) {
          onOpenDirectoryWithCategory(cat);
        } else {
          setActiveScreen('directory');
        }
        setIsOpen(false);
      };
    } else if (action.type === 'filter_category' && action.filterCategory) {
      const cat = action.filterCategory;
      actionText = actionText || `View ${cat} Gigs`;
      onAction = () => {
        setFilters(prev => ({ ...prev, selectedCategories: [cat as any] }));
        setActiveScreen('jobs');
        setIsOpen(false);
      };
    } else if (action.type === 'filter_min_wage') {
      const minWage = action.minWage || 800;
      actionText = actionText || `View ₹${minWage}+ Gigs`;
      onAction = () => {
        setFilters(prev => ({ ...prev, minWage }));
        setActiveScreen('jobs');
        setIsOpen(false);
      };
    } else if (action.type === 'navigate' && action.target) {
      const targetScreen = action.target;
      actionText = actionText || `Open ${targetScreen}`;
      onAction = () => {
        if (targetScreen === 'directory' && onOpenDirectoryWithCategory) {
          onOpenDirectoryWithCategory('All');
        } else {
          setActiveScreen(targetScreen);
        }
        setIsOpen(false);
      };
    }

    return { actionText, onAction };
  };

  const handleClearChat = () => {
    if (liveClientRef.current && voiceState !== 'IDLE') {
      liveClientRef.current.disconnect();
      setVoiceState('IDLE');
    }
    setConversationState({ jobDraft: {} });
    const cfg = getLanguageConfig(language);
    const greeting = activeRole === 'worker' ? cfg.greeting.worker : cfg.greeting.customer;
    setMessages([
      {
        id: 'm-init-' + Date.now(),
        sender: 'mojo',
        text: greeting,
        timestamp: 'Just now',
        lang: language,
      },
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text,
      timestamp: 'Just now',
      lang: language,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // If Live Voice WebSocket is active, route through persistent live session!
    if (liveClientRef.current && voiceState !== 'IDLE') {
      liveClientRef.current.sendTextMessage(text);
      return;
    }

    setIsTyping(true);

    try {
      const res = await api.chatWithMojo(
        text,
        language,
        activeRole,
        {
          activeScreen,
          skills: user.skills,
        },
        conversationState
      );

      setIsTyping(false);

      if (res && res.success && res.reply) {
        if (res.conversationState) {
          setConversationState(res.conversationState);
        }

        if (res.action?.type === 'CHANGE_LANGUAGE') {
          if (res.action?.language) {
            setLanguage(res.action.language);
          }
        }

        const { actionText, onAction } = resolveAction(res.action, res.conversationState?.jobDraft);
        if (res.action?.type === 'PUBLISH_JOB' && onAction) {
          onAction();
        }

        const newMsgId = 'mojo-' + Date.now();
        const mojoMsg: ChatMessage = {
          id: newMsgId,
          sender: 'mojo',
          text: res.reply,
          actionText,
          onAction,
          timestamp: 'Just now',
          lang: res.language || language,
        };
        setMessages(prev => [...prev, mojoMsg]);

        if (soundEnabled) {
          handleSpeakMessage(newMsgId, res.reply, res.language || language);
        }
      } else {
        // Friendly localized error message with cold start awareness
        const isTimeout = res?.error === 'timeout';
        const errorReply = isTimeout
          ? (language === 'te'
              ? 'మోజో సర్వర్ ప్రారంభమవుతోంది (Render ఉచిత సర్వర్ మొదట ప్రారంభం కావడానికి కొద్ది సమయం పడుతుంది). దయచేసి మళ్ళీ ప్రయత్నించండి.'
              : language === 'hi'
              ? 'मोजो सर्वर शुरू हो रहा है (Render फ्री टियर शुरू होने में कुछ सेकंड लगते हैं)। कृपया पुन: प्रयास करें।'
              : language === 'ta'
              ? 'மோஜோ சேவையகம் தொடங்குகிறது (Render தொடங்குவதற்கு சில வினாடிகள் ஆகும்). தயவுசெய்து மீண்டும் முயற்சிக்கவும்.'
              : 'Mojo server is starting up (Render free tier cold start). Please tap Retry in a moment.')
          : (language === 'te'
              ? 'మోజో ప్రస్తుతం అందుబాటులో లేదు. దయచేసి మళ్ళీ ప్రయత్నించండి.'
              : language === 'hi'
              ? 'मोजो अस्थायी रूप से अनुपलब्ध है। कृपया पुन: प्रयास करें।'
              : language === 'ta'
              ? 'மோஜோ தற்காலிகமாக கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்.'
              : 'Mojo is temporarily unavailable. Please try again.');

        const retryLabel =
          language === 'te' ? '🔄 మళ్ళీ ప్రయత్నించండి' :
          language === 'hi' ? '🔄 पुन: प्रयास करें' :
          language === 'ta' ? '🔄 மீண்டும் முயற்சிக்கவும்' :
          '🔄 Retry';

        const errorMsg: ChatMessage = {
          id: 'err-' + Date.now(),
          sender: 'mojo',
          text: errorReply,
          actionText: retryLabel,
          onAction: () => handleSendMessage(text),
          timestamp: 'Just now',
          lang: language,
          isError: true,
          retryQuery: text,
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch (err) {
      setIsTyping(false);
      const errorReply =
        language === 'te'
          ? 'మోజో ప్రస్తుతం అందుబాటులో లేదు. దయచేసి మళ్ళీ ప్రయత్నించండి.'
          : language === 'hi'
          ? 'मोजो अस्थायी रूप से अनुपलब्ध है। कृपया पुन: प्रयास करें।'
          : language === 'ta'
          ? 'மோஜோ தற்காலிகமாக கிடைக்கவில்லை. மீண்டும் முயற்சிக்கவும்.'
          : 'Mojo is temporarily unavailable. Please try again.';

      const retryLabel =
        language === 'te' ? '🔄 మళ్ళీ ప్రయత్నించండి' :
        language === 'hi' ? '🔄 पुन: प्रयास करें' :
        language === 'ta' ? '🔄 மீண்டும் முயற்சிக்கவும்' :
        '🔄 Retry';

      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        sender: 'mojo',
        text: errorReply,
        actionText: retryLabel,
        onAction: () => handleSendMessage(text),
        timestamp: 'Just now',
        lang: language,
        isError: true,
        retryQuery: text,
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const toggleLiveVoice = async () => {
    // If speaking via browser TTS, stop it
    if (speechService.isSpeaking()) {
      speechService.stopSpeaking();
      setSpeakingMessageId(null);
    }
    // If legacy speech listening is active, stop it
    speechService.stopListening();
    setIsListening(false);

    if (voiceState !== 'IDLE') {
      liveClientRef.current?.disconnect();
      setVoiceState('IDLE');
      setLiveVolume(0);
      return;
    }

    setSpeechError(null);
    try {
      if (!liveClientRef.current) {
        liveClientRef.current = new GeminiLiveClient({
          onStateChange: state => {
            setVoiceState(state);
            if (state === 'IDLE') {
              setLiveVolume(0);
            }
          },
          onVolumeChange: volume => {
            setLiveVolume(volume);
          },
          onTranscript: (sender, text) => {
            if (!text || !text.trim()) return;
            const newMsgId = `voice-${sender}-${Date.now()}`;
            setMessages(prev => [
              ...prev,
              {
                id: newMsgId,
                sender,
                text,
                timestamp: 'Just now',
                lang: language,
              },
            ]);
          },
          onIntentAction: payload => {
            if (payload.conversationState) {
              setConversationState(payload.conversationState);
            }
            if (payload.action) {
              const { actionText, onAction } = resolveAction(
                payload.action,
                payload.conversationState?.jobDraft
              );
              if (payload.action?.type === 'PUBLISH_JOB' && onAction) {
                onAction();
              }
              if (actionText && onAction) {
                setMessages(prev => {
                  const lastIdx = prev.map(m => m.sender).lastIndexOf('mojo');
                  if (lastIdx !== -1) {
                    const updated = [...prev];
                    updated[lastIdx] = {
                      ...updated[lastIdx],
                      actionText,
                      onAction,
                    };
                    return updated;
                  }
                  return prev;
                });
              }
            }
          },
          onError: errMsg => {
            triggerVoiceNotice(errMsg);
            setVoiceState('IDLE');
            setLiveVolume(0);
          },
        });
      }

      await liveClientRef.current.connect(language, activeRole, conversationState);
    } catch (err: any) {
      console.error('[MOJO VOICE] Toggle failed:', err);
      triggerVoiceNotice(err.message || 'Could not start voice session');
      setVoiceState('IDLE');
      setLiveVolume(0);
    }
  };

  const suggestions = getContextSuggestions();


  return (
    <>
      {/* Floating Mascot Button */}
      {!isOpen && (
        <div
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 z-40 flex items-center gap-2 cursor-pointer group animate-float select-none"
        >
          <div className="bg-white text-[#2563EB] text-xs font-bold px-3 py-1.5 rounded-full shadow-md border border-[#DBEAFE] hidden sm:flex items-center gap-1.5 backdrop-blur-sm">
            <Sparkles size={12} className="text-[#2563EB]" />
            <span>
              {language === 'te'
                ? 'మోజో AI ని అడగండి'
                : language === 'hi'
                ? 'मोजो AI से पूछें'
                : language === 'ta'
                ? 'மோஜோ AI'
                : 'Ask Mojo AI'}
            </span>
          </div>

          <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#2563EB] to-[#3B82F6] shadow-xl border-2 border-white flex items-center justify-center transition-transform transform group-hover:scale-110 active:scale-95">
            <MojoMascotIcon size={46} animated={true} />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#F5A900] rounded-full border-2 border-white flex items-center justify-center shadow-xs">
              <Sparkles size={11} className="text-[#111827]" />
            </span>
          </div>
        </div>
      )}

      {/* Mojo Assistant Modal / Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs transition-opacity">
          <div className="w-full sm:max-w-md h-[84vh] sm:h-[640px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-[#E2E8F0]">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] p-3.5 sm:p-4 flex flex-col gap-2 text-white shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white p-1 shadow-sm flex items-center justify-center">
                    <MojoMascotIcon size={36} animated={false} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-black text-base tracking-tight leading-none text-white">Mojo AI Assistant</h3>
                      <Sparkles size={14} className="text-[#FFB800] animate-pulse" />
                      <span className="bg-white/20 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                        {langConfig.nativeName}
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-100 font-medium mt-0.5">
                      {language === 'te'
                        ? 'తెలుగు • హిందీ • తమిళ్ • English'
                        : language === 'hi'
                        ? 'हिन्दी • తెలుగు • தமிழ் • English'
                        : language === 'ta'
                        ? 'தமிழ் • తెలుగు • हिन्दी • English'
                        : 'English • తెలుగు • हिन्दी • தமிழ்'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Stop Speech Button if speaking */}
                  {speakingMessageId && (
                    <button
                      onClick={handleStopSpeaking}
                      title="Stop Speaking"
                      className="p-2 rounded-full bg-rose-600 text-white animate-pulse shadow-sm transition-all"
                    >
                      <Square size={14} fill="currentColor" />
                    </button>
                  )}

                  {/* Language Selector */}
                  <LanguageSelector
                    variant="mojo"
                    iconSize={16}
                    isOpen={isLangSelectorOpen}
                    onOpenChange={setIsLangSelectorOpen}
                  />

                  {/* Sound Toggle */}
                  <button
                    onClick={() => {
                      if (soundEnabled) {
                        speechService.stopSpeaking();
                        setSpeakingMessageId(null);
                      }
                      setSoundEnabled(!soundEnabled);
                    }}
                    title={soundEnabled ? 'Mute Mojo Voice' : 'Enable Mojo Voice'}
                    className={`p-2 rounded-full transition-colors ${
                      soundEnabled ? 'text-white bg-white/20' : 'text-blue-200 bg-black/20'
                    }`}
                  >
                    {soundEnabled ? <Volume2 size={17} /> : <VolumeX size={17} />}
                  </button>

                  {/* Clear Chat */}
                  <button
                    onClick={handleClearChat}
                    title="Clear Conversation"
                    className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>

                  {/* Close Assistant */}
                  <button
                    onClick={() => {
                      speechService.stopSpeaking();
                      speechService.stopListening();
                      setIsOpen(false);
                    }}
                    className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X size={19} />
                  </button>
                </div>
              </div>
            </div>

            {/* Notification / Error Banner (if mic blocked, voice unavailable, etc.) */}
            {speechError && (
              <div className="bg-[#EFF6FF] border-b border-[#DBEAFE] px-3.5 py-2 flex items-center justify-between text-[11px] text-[#2563EB]">
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} className="text-[#2563EB] shrink-0" />
                  <span>{speechError}</span>
                </div>
                <button
                  onClick={() => setSpeechError(null)}
                  className="text-[#2563EB] hover:text-[#1D4ED8] ml-2 p-0.5"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F7F9FC] text-[#111827]">
              {messages.map(msg => {
                const isThisSpeaking = speakingMessageId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'mojo' && (
                      <div className="w-8 h-8 rounded-full bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <MojoMascotIcon size={24} animated={false} />
                      </div>
                    )}

                    <div
                      className={`max-w-[84%] rounded-2xl p-3.5 text-xs leading-relaxed space-y-2 shadow-xs ${
                        msg.sender === 'user'
                          ? 'bg-white border-2 border-[#2563EB] text-[#111827] font-bold rounded-tr-xs shadow-2xs'
                          : msg.isError
                          ? 'bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] rounded-tl-xs'
                          : 'bg-[#EFF6FF] border border-[#DBEAFE] text-[#111827] rounded-tl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-line">{msg.text}</p>

                      {/* Action Button inside Mojo Message */}
                      {msg.actionText && msg.onAction && (
                        <button
                          onClick={msg.onAction}
                          className={`w-full font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 mt-1 ${
                            msg.isError
                              ? 'bg-rose-600 hover:bg-rose-700 text-white'
                              : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
                          }`}
                        >
                          {msg.isError ? <RotateCcw size={13} /> : null}
                          <span>{msg.actionText}</span>
                          {!msg.isError ? <ArrowRight size={13} /> : null}
                        </button>
                      )}

                      {/* Mojo Message Audio Controls */}
                      {msg.sender === 'mojo' && (
                        <div className="flex items-center justify-between pt-1 border-t border-[#F1F5F9] text-[10px] text-[#64748B]">
                          <div className="flex items-center gap-1.5">
                            {isThisSpeaking ? (
                              <button
                                onClick={handleStopSpeaking}
                                className="flex items-center gap-1 text-[#2563EB] font-bold hover:text-[#1D4ED8] py-0.5 px-1.5 rounded-md bg-[#EFF6FF]"
                                title="Stop speaking"
                              >
                                <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-ping"></span>
                                <Square size={10} fill="currentColor" />
                                <span>Stop</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSpeakMessage(msg.id, msg.text, msg.lang)}
                                className="flex items-center gap-1 hover:text-[#2563EB] font-medium py-0.5 px-1.5 rounded-md hover:bg-[#EFF6FF] transition-colors"
                                title="Listen to Mojo"
                              >
                                <Play size={10} fill="currentColor" />
                                <span>Speak</span>
                              </button>
                            )}
                          </div>

                          <span className="text-[9px] text-[#94A3B8] uppercase tracking-wider font-semibold">
                            {msg.lang || language}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-[#2563EB] font-bold bg-white p-2.5 rounded-2xl w-fit border border-[#DBEAFE] shadow-xs animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-[#2563EB] animate-ping"></div>
                  <span>
                    {language === 'te'
                      ? 'మోజో ఆలోచిస్తోంది...'
                      : language === 'hi'
                      ? 'मोजो सोच रहा है...'
                      : language === 'ta'
                      ? 'மோஜோ சிந்திக்கிறார்...'
                      : 'Mojo is thinking...'}
                  </span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Contextual Suggestion Chips */}
            <div className="px-3 py-2.5 bg-white border-t border-[#E2E8F0] overflow-x-auto flex items-center gap-2 no-scrollbar">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s.query)}
                  className="shrink-0 bg-[#F7F9FC] hover:bg-[#EFF6FF] text-[#111827] hover:text-[#2563EB] border border-[#E2E8F0] hover:border-[#DBEAFE] text-xs font-bold px-3 py-1.5 rounded-full transition-all shadow-xs active:scale-95"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Real-time Gemini Live Voice Bar */}
            {voiceState !== 'IDLE' && (
              <div
                className={`px-3.5 py-2.5 border-t flex items-center justify-between text-xs transition-colors ${
                  voiceState === 'USER_SPEAKING'
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : voiceState === 'LISTENING'
                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                    : voiceState === 'THINKING'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : voiceState === 'SPEAKING'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : voiceState === 'INTERRUPTED'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}
              >
                <div className="flex items-center gap-2 font-medium overflow-hidden">
                  {voiceState === 'CONNECTING' && (
                    <>
                      <Loader2 size={14} className="animate-spin text-blue-600 shrink-0" />
                      <span className="truncate">
                        {language === 'te'
                          ? 'జెమిని లైవ్ వాయిస్‌కి కనెక్ట్ అవుతోంది...'
                          : language === 'hi'
                          ? 'जेमिनी लाइव वॉयस से जुड़ रहे हैं...'
                          : language === 'ta'
                          ? 'ஜெமினி லைவ் வாய்ஸ் உடன் இணைகிறது...'
                          : 'Connecting to Gemini Live Voice...'}
                      </span>
                    </>
                  )}

                  {voiceState === 'USER_SPEAKING' && (
                    <>
                      <span className="relative flex h-2.5 w-2.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                      </span>
                      <span className="font-bold text-rose-900 truncate">
                        {language === 'te'
                          ? 'వింటున్నాము... మాట్లాడండి'
                          : language === 'hi'
                          ? 'सुन रहे हैं... बोलिए'
                          : language === 'ta'
                          ? 'கேட்கிறது... பேசுங்கள்'
                          : 'Listening... (You are speaking)'}
                      </span>
                      {/* Live Audio 5-Band Equalizer */}
                      <div className="flex items-center gap-0.5 ml-1 shrink-0 h-6">
                        {freqBars.map((height, i) => (
                          <span
                            key={i}
                            className="w-1 bg-rose-600 rounded-full transition-all duration-75"
                            style={{ height: `${height}px` }}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  {voiceState === 'LISTENING' && (
                    <>
                      <span className="relative flex h-2.5 w-2.5 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                      </span>
                      <span className="font-bold text-blue-900 truncate">
                        {language === 'te'
                          ? 'మోజో వింటోంది... మాట్లాడండి'
                          : language === 'hi'
                          ? 'मोजो सुन रहा है... बोलिए'
                          : language === 'ta'
                          ? 'மோஜோ கேட்கிறது... பேசுங்கள்'
                          : 'Mojo is listening... Speak anytime'}
                      </span>
                      {/* Ambient Equalizer */}
                      <div className="flex items-center gap-0.5 ml-1 shrink-0 h-6">
                        {freqBars.map((height, i) => (
                          <span
                            key={i}
                            className="w-1 bg-blue-500 rounded-full transition-all duration-75"
                            style={{ height: `${Math.max(4, Math.round(height * 0.6))}px` }}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-blue-600 font-normal hidden sm:inline shrink-0">
                        (Hands-free)
                      </span>
                    </>
                  )}

                  {voiceState === 'THINKING' && (
                    <>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-bounce"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                      <span className="font-bold text-amber-900 truncate">
                        {language === 'te'
                          ? 'మోజో ఆలోచిస్తోంది...'
                          : language === 'hi'
                          ? 'मोजो सोच रहा है...'
                          : language === 'ta'
                          ? 'மோஜோ சிந்திக்கிறார்...'
                          : 'Mojo is thinking...'}
                      </span>
                    </>
                  )}

                  {(voiceState === 'MOJO_SPEAKING' || (voiceState as string) === 'SPEAKING') && (
                    <>
                      <Volume2 size={14} className="text-emerald-600 animate-pulse shrink-0" />
                      <span className="font-bold text-emerald-900 truncate">
                        {language === 'te'
                          ? 'మోజో మాట్లాడుతోంది...'
                          : language === 'hi'
                          ? 'मोजो बोल रहा है...'
                          : language === 'ta'
                          ? 'மோஜோ பேசுகிறார்...'
                          : 'Mojo is speaking...'}
                      </span>
                      {/* Real-time Voice Waveform Equalizer */}
                      <div className="flex items-center gap-0.5 ml-1 shrink-0 h-6">
                        {freqBars.map((height, i) => (
                          <span
                            key={i}
                            className="w-1 bg-emerald-600 rounded-full transition-all duration-75"
                            style={{ height: `${height}px` }}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] text-emerald-700 font-normal hidden sm:inline shrink-0">
                        (Speak to barge in)
                      </span>
                    </>
                  )}

                  {voiceState === 'INTERRUPTED' && (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0"></span>
                      <span className="font-bold text-amber-900 truncate">Interrupted — listening...</span>
                    </>
                  )}

                  {voiceState === 'RECONNECTING' && (
                    <>
                      <Loader2 size={14} className="animate-spin text-amber-600 shrink-0" />
                      <span className="font-bold text-amber-900 truncate">
                        {language === 'te'
                          ? 'మళ్లీ కనెక్ట్ అవుతోంది...'
                          : language === 'hi'
                          ? 'पुनः कनेक्ट हो रहा है...'
                          : language === 'ta'
                          ? 'மீண்டும் இணைகிறது...'
                          : 'Reconnecting to voice...'}
                      </span>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {(voiceState === 'MOJO_SPEAKING' || (voiceState as string) === 'SPEAKING') && (
                    <button
                      onClick={() => liveClientRef.current?.interrupt()}
                      className="text-[11px] font-bold text-emerald-800 hover:text-emerald-900 px-2 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 transition-colors shadow-2xs"
                      title="Interrupt Mojo speech"
                    >
                      Interrupt
                    </button>
                  )}
                  <button
                    onClick={() => {
                      liveClientRef.current?.disconnect();
                      setVoiceState('IDLE');
                      setLiveVolume(0);
                    }}
                    className="text-[11px] font-bold text-slate-600 hover:text-slate-900 px-2 py-0.5 rounded-md bg-slate-200/70 hover:bg-slate-200 transition-colors"
                  >
                    End Voice
                  </button>
                </div>
              </div>
            )}

            {/* Input Bar */}
            <div className="p-3 bg-white border-t border-[#E2E8F0] flex items-center gap-2">
              <button
                onClick={toggleLiveVoice}
                aria-label={
                  voiceState === 'IDLE'
                    ? `Start Live Voice (${langConfig.nativeName})`
                    : `Stop Live Voice (${voiceState})`
                }
                className={`p-2.5 rounded-xl transition-all shadow-xs relative ${
                  voiceState === 'USER_SPEAKING'
                    ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-300'
                    : voiceState === 'LISTENING'
                    ? 'bg-blue-600 text-white ring-2 ring-blue-300 animate-pulse'
                    : voiceState === 'MOJO_SPEAKING' || (voiceState as string) === 'SPEAKING'
                    ? 'bg-emerald-600 text-white animate-bounce'
                    : voiceState === 'CONNECTING' || voiceState === 'THINKING' || voiceState === 'RECONNECTING'
                    ? 'bg-amber-500 text-white'
                    : 'bg-[#FFFBEB] border border-[#FDE68A] text-[#F5A900] hover:bg-[#F5A900] hover:text-[#111827] active:scale-95'
                }`}
                title={`Gemini Live Voice (${langConfig.nativeName}) - State: ${voiceState}`}
              >
                {voiceState === 'CONNECTING' || voiceState === 'RECONNECTING' ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : voiceState !== 'IDLE' ? (
                  <MicOff size={18} />
                ) : (
                  <Mic size={18} />
                )}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder={
                  voiceState === 'USER_SPEAKING'
                    ? (language === 'te' ? 'వింటున్నాము... మాట్లాడండి' :
                       language === 'hi' ? 'सुन रहे हैं... बोलिए' :
                       language === 'ta' ? 'கேட்கிறது... பேசுங்கள்' :
                       'Listening... you are speaking')
                    : voiceState === 'LISTENING'
                    ? (language === 'te' ? 'వినబడుతోంది... మాట్లాడండి' :
                       language === 'hi' ? 'सुन रहा हूँ... बोलिए' :
                       language === 'ta' ? 'கேட்கிறது... பேசுங்கள்' :
                       'Mojo is listening... speak anytime')
                    : voiceState === 'THINKING'
                    ? (language === 'te' ? 'మోజో ఆలోచిస్తోంది...' :
                       language === 'hi' ? 'मोजो सोच रहा है...' :
                       language === 'ta' ? 'మోజో சிந்திக்கிறார்...' :
                       'Mojo is thinking...')
                    : voiceState === 'MOJO_SPEAKING' || (voiceState as string) === 'SPEAKING'
                    ? (language === 'te' ? 'మోజో మాట్లాడుతోంది...' :
                       language === 'hi' ? 'मोजो बोल रहा है...' :
                       language === 'ta' ? 'மோஜோ பேசுகிறார்...' :
                       'Mojo is speaking...')
                    : langConfig.placeholder.idle
                }
                className="flex-1 bg-[#F7F9FC] border border-[#E2E8F0] text-[#111827] placeholder-[#94A3B8] rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF]"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold disabled:opacity-40 transition-colors active:scale-95 shadow-xs"
              >
                <Send size={17} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
