import React, { useState, useEffect, useRef } from 'react';
import { MojoMascotIcon } from './MojoMascotIcon';
import { useApp } from '../../store/AppContext';
import { speechService } from '../../services/speechService';
import { SupportedLanguage } from '../../types';
import { X, Send, Mic, MicOff, Volume2, Sparkles, ArrowRight, Globe } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'mojo' | 'user';
  text: string;
  actionText?: string;
  onAction?: () => void;
  timestamp: string;
}

const GREETINGS: Record<SupportedLanguage, string> = {
  en: "Hi! I'm Mojo, your friendly Work Mojo assistant! How can I help you find work or workers today?",
  te: "నమస్కారం! నేను మోజో, మీ వర్క్ మోజో అసిస్టెంట్! ఈరోజు మీకు పని లేదా పనివారిని వెతకడంలో ఎలా సహాయపడగలను?",
  hi: "नमस्ते! मैं मोजो हूँ, आपका वर्क मोजो सहायक! आज मैं काम या कामगार खोजने में आपकी क्या मदद करूँ?",
  ta: "வணக்கம்! நான் மோஜோ, உங்கள் ஒர்க் மோஜோ உதவியாளர்! இன்று வேலை அல்லது தொழிலாளர்களைக் கண்டறிய நான் உங்களுக்கு எப்படி உதவ முடியும்?",
};

export const FloatingMojoAssistant: React.FC = () => {
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
    t,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-init',
      sender: 'mojo',
      text: GREETINGS[language] || GREETINGS['en'],
      timestamp: 'Just now',
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Update initial greeting if user changes language and hasn't started deep chat
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].id === 'm-init') {
        return [
          {
            id: 'm-init',
            sender: 'mojo',
            text: GREETINGS[language] || GREETINGS['en'],
            timestamp: 'Just now',
          },
        ];
      }
      return prev;
    });
  }, [language]);

  // Context-aware suggested prompts per language
  const getContextSuggestions = (): Array<{ label: string; query: string }> => {
    if (activeRole === 'worker') {
      if (activeScreen === 'jobs') {
        switch (language) {
          case 'te':
            return [
              { label: '🚚 నా దగ్గర డెలివరీ పనులు', query: 'నా దగ్గర డెలివరీ పనులు చూపించు' },
              { label: '💰 ₹800+ జీతం పనులు', query: '₹800 కంటే ఎక్కువ జీతం పనులు చూపించు' },
              { label: '⏳ వెయిటింగ్ లిస్ట్ అంటే ఏమిటి?', query: 'వెయిటింగ్ లిస్ట్ అంటే ఏమిటి?' },
            ];
          case 'hi':
            return [
              { label: '🚚 मेरे पास डिलीवरी काम', query: 'मेरे पास डिलीवरी काम दिखाएं' },
              { label: '💰 ₹800+ वेतन वाले काम', query: '₹800 से अधिक वेतन वाले काम दिखाएं' },
              { label: '⏳ वेटिंग लिस्ट क्या है?', query: 'वेटिंग लिस्ट का क्या मतलब है?' },
            ];
          case 'ta':
            return [
              { label: '🚚 டெலிவரி வேலைகள்', query: 'என் அருகில் டெலிவரி வேலைகளைக் காட்டு' },
              { label: '💰 ₹800+ ஊதிய வேலைகள்', query: '₹800க்கு மேல் ஊதியம் தரும் வேலைகள்' },
              { label: '⏳ காத்திருப்பு பட்டியல் என்றால் என்ன?', query: 'காத்திருப்பு பட்டியல் என்றால் என்ன?' },
            ];
          default:
            return [
              { label: '🚚 Delivery jobs near me', query: 'Show delivery jobs near me' },
              { label: '💰 Jobs paying ₹800+', query: 'Show jobs above ₹800' },
              { label: '⏳ What is Waiting List?', query: 'What does Waiting List mean?' },
            ];
        }
      }
      if (activeScreen === 'confirmed_job') {
        switch (language) {
          case 'te':
            return [
              { label: '📍 చిరునామా ఎప్పుడు కనిపిస్తుంది?', query: 'ఖచ్చితమైన చిరునామా ఎప్పుడు కనిపిస్తుంది?' },
              { label: '🚨 SOS అత్యవసరం ఎలా పనిచేస్తుంది?', query: 'SOS అత్యవసర సహాయం ఎలా పనిచేస్తుంది?' },
              { label: '⭐ రేటింగ్ ఎలా అప్‌డేట్ అవుతుంది?', query: 'రేటింగ్ ఎలా పనిచేస్తుంది?' },
            ];
          case 'hi':
            return [
              { label: '📍 पता कब दिखेगा?', query: 'सटीक पता कब दिखाई देगा?' },
              { label: '🚨 SOS आपातकाल कैसे काम करता है?', query: 'SOS आपातकालीन सहायता कैसे काम करती है?' },
              { label: '⭐ रेटिंग कैसे अपडेट होती है?', query: 'रेटिंग कैसे काम करती है?' },
            ];
          case 'ta':
            return [
              { label: '📍 முகவரி எப்போது தெரியும்?', query: 'சரியான முகவரி எப்போது தெரியும்?' },
              { label: '🚨 SOS அவசர உதவி எப்படி?', query: 'SOS அவசர உதவி எப்படி செயல்படுகிறது?' },
              { label: '⭐ மதிப்பீடு எப்படி மாறும்?', query: 'மதிப்பீடு எப்படி செயல்படுகிறது?' },
            ];
          default:
            return [
              { label: '📍 When is address shown?', query: 'When is exact location shown?' },
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
            { label: '🎯 మ్యాచ్ స్కోర్ ఎందుకు వచ్చింది?', query: 'నాకు ఈ మ్యాచ్ స్కోర్ ఎందుకు వచ్చింది?' },
            { label: '📝 దరఖాస్తు ఎలా చేయాలి?', query: 'పనికి ఎలా దరఖాస్తు చేయాలి?' },
          ];
        case 'hi':
          return [
            { label: '🔍 नजदीकी काम खोजें', query: 'मेरे आस-पास कौन से काम हैं?' },
            { label: '🎯 यह मैच स्कोर क्यों मिला?', query: 'मुझे यह सिफारिश क्यों मिली?' },
            { label: '📝 आवेदन कैसे करें?', query: 'काम के लिए आवेदन कैसे करें?' },
          ];
        case 'ta':
          return [
            { label: '🔍 அருகிலுள்ள வேலைகளைக் காண்க', query: 'என் அருகில் என்ன வேலைகள் உள்ளன?' },
            { label: '🎯 பொருத்த மதிப்பெண் ஏன்?', query: 'எனக்கு இந்த பரிந்துரை ஏன் கிடைத்தது?' },
            { label: '📝 எப்படி விண்ணப்பிப்பது?', query: 'வேலைக்கு எப்படி விண்ணப்பிப்பது?' },
          ];
        default:
          return [
            { label: '🔍 Find nearby jobs', query: 'What jobs are near me?' },
            { label: '🎯 Why this match score?', query: 'Why did I get this recommendation?' },
            { label: '📝 How do I apply?', query: 'How do I apply for a job?' },
          ];
      }
    } else {
      // Customer
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
            { label: '👥 వెయిటింగ్ లిస్ట్ రీప్లేస్‌మెంట్ ఎలా?', query: 'వెయిటింగ్ లిస్ట్ రీప్లేస్‌మెంట్ ఎలా పనిచేస్తుంది?' },
            { label: '🔄 మంచి వర్కర్‌ని మళ్లీ నియమించడం ఎలా?', query: 'మంచి వర్కర్లను మళ్లీ ఎలా నియమించాలి?' },
          ];
        case 'hi':
          return [
            { label: '📋 नया काम कैसे पोस्ट करें?', query: 'नया काम कैसे पोस्ट करें?' },
            { label: '👥 वेटिंग लिस्ट कैसे काम करती है?', query: 'वेटिंग लिस्ट कैसे काम करती है?' },
            { label: '🔄 पुराने कामगार को दोबारा कैसे रखें?', query: 'अच्छे कामगार को दोबारा कैसे रखें?' },
          ];
        case 'ta':
          return [
            { label: '📋 புதிய வேலை எப்படி பதிவிடுவது?', query: 'புதிய வேலை எப்படி பதிவிடுவது?' },
            { label: '👥 காத்திருப்பு பட்டியல் எப்படி?', query: 'காத்திருப்பு பட்டியல் எவ்வாறு செயல்படுகிறது?' },
            { label: '🔄 பழைய தொழிலாளியை மீண்டும் அமர்த்துவது எப்படி?', query: 'நல்ல தொழிலாளியை மீண்டும் அமர்த்துவது எப்படி?' },
          ];
        default:
          return [
            { label: '📋 How to post a job?', query: 'How do I post a job?' },
            { label: '👥 How waiting list works?', query: 'How does waiting list replacement work?' },
            { label: '🔄 Hire again previous worker', query: 'How do I re-hire good workers?' },
          ];
      }
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: text.trim(),
      timestamp: 'Just now',
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Multi-language AI Response generator
    setTimeout(() => {
      const q = text.toLowerCase();
      let reply = '';
      let actionText: string | undefined;
      let onAction: (() => void) | undefined;

      const isDelivery =
        q.includes('delivery') ||
        q.includes('డెలివరీ') ||
        q.includes('డిలివరీ') ||
        q.includes('डिलीवरी') ||
        q.includes('டெலிவரி');

      const isWage =
        q.includes('800') ||
        q.includes('wage') ||
        q.includes('high pay') ||
        q.includes('salary') ||
        q.includes('జీతం') ||
        q.includes('వేతనం') ||
        q.includes('సంపాదన') ||
        q.includes('వేతనాలు') ||
        q.includes('वेतन') ||
        q.includes('कमाई') ||
        q.includes('सैलरी') ||
        q.includes('रुपये') ||
        q.includes('ஊதியம்') ||
        q.includes('சம்பளம்');

      const isNearby =
        q.includes('near') ||
        q.includes('jobs') ||
        q.includes('work') ||
        q.includes('సమీపం') ||
        q.includes('దగ్గర') ||
        q.includes('పనులు') ||
        q.includes('జాబ్స్') ||
        q.includes('काम') ||
        q.includes('पास') ||
        q.includes('नजदीक') ||
        q.includes('வேலை') ||
        q.includes('அருகில்');

      const isWaitingList =
        q.includes('waiting list') ||
        q.includes('waiting') ||
        q.includes('వెయిటింగ్') ||
        q.includes('లిస్ట్') ||
        q.includes('वेटिंग') ||
        q.includes('लिस्ट') ||
        q.includes('காத்திருப்பு');

      const isCancel =
        q.includes('cancel') ||
        q.includes('replacement') ||
        q.includes('రద్దు') ||
        q.includes('రీప్లేస్‌మెంట్') ||
        q.includes('रद्द') ||
        q.includes('बदलना') ||
        q.includes('ரத்து') ||
        q.includes('மாற்று');

      const isLocation =
        q.includes('location') ||
        q.includes('privacy') ||
        q.includes('address') ||
        q.includes('లొకేషన్') ||
        q.includes('చిరునామా') ||
        q.includes('గోప్యత') ||
        q.includes('पता') ||
        q.includes('स्थान') ||
        q.includes('गोपनीयता') ||
        q.includes('முகவரி') ||
        q.includes('இருப்பிடம்') ||
        q.includes('தனியுரிமை');

      const isMatch =
        q.includes('match') ||
        q.includes('score') ||
        q.includes('recommend') ||
        q.includes('మ్యాచ్') ||
        q.includes('స్కోర్') ||
        q.includes('సిఫార్సు') ||
        q.includes('स्कोर') ||
        q.includes('सिफारिश') ||
        q.includes('பொருத்தம்') ||
        q.includes('மதிப்பெண்');

      const isAuto =
        q.includes('auto') ||
        q.includes('automatic') ||
        q.includes('ఆటో') ||
        q.includes('ఎంపిక') ||
        q.includes('ऑटो') ||
        q.includes('चयन') ||
        q.includes('தானியங்கி');

      const isSos =
        q.includes('sos') ||
        q.includes('emergency') ||
        q.includes('ఆపద') ||
        q.includes('అత్యవసరం') ||
        q.includes('ఆపత్కాల') ||
        q.includes('आपातकाल') ||
        q.includes('खतरा') ||
        q.includes('அவசரம்') ||
        q.includes('ஆபத்து');

      const isPost =
        q.includes('post') ||
        q.includes('hire') ||
        q.includes('పోస్ట్') ||
        q.includes('జాబ్ పోస్ట్') ||
        q.includes('రాయడం') ||
        q.includes('पोस्ट') ||
        q.includes('रखना') ||
        q.includes('பதிவு');

      const isRating =
        q.includes('rating') ||
        q.includes('completion') ||
        q.includes('finish') ||
        q.includes('రేటింగ్') ||
        q.includes('పూర్తి') ||
        q.includes('रेटिंग') ||
        q.includes('समाप्त') ||
        q.includes('மதிப்பீடு');

      if (isDelivery) {
        switch (language) {
          case 'te':
            reply = "చుట్టుపక్కల డెలివరీ పనులను కనుగొన్నాను! మీ జాబ్స్ స్క్రీన్‌లో డెలివరీ పనులను ఫిల్టర్ చేసాను.";
            actionText = "డెలివరీ పనులు చూడండి";
            break;
          case 'hi':
            reply = "मुझे सक्रिय डिलीवरी काम मिल गए हैं! मैंने आपकी जॉब सूची को डिलीवरी के लिए फ़िल्टर कर दिया है।";
            actionText = "डिलीवरी काम देखें";
            break;
          case 'ta':
            reply = "செயலில் உள்ள டெலிவரி வேலைகளைக் கண்டறிந்துள்ளேன்! டெலிவரிக்காக உங்கள் வேலைகள் பட்டியலை வடிகட்டியுள்ளேன்.";
            actionText = "டெலிவரி வேலைகளைப் பார்க்க";
            break;
          default:
            reply = "I found active Delivery gigs! I've filtered your Jobs view for Delivery.";
            actionText = "View Delivery Jobs";
        }
        onAction = () => {
          setFilters(prev => ({ ...prev, selectedCategories: ['Delivery'] }));
          setActiveScreen('jobs');
          setIsOpen(false);
        };
      } else if (isWage) {
        switch (language) {
          case 'te':
            reply = "ఎక్కువ సంపాదన కోసం చూస్తున్నారా? షిఫ్ట్‌కు ₹800 లేదా అంతకంటే ఎక్కువ చెల్లించే పనులను ఫిల్టర్ చేసాను!";
            actionText = "₹800+ పనులు చూడండి";
            break;
          case 'hi':
            reply = "अधिक कमाई वाले काम ढूंढ रहे हैं? मैंने प्रति शिफ्ट ₹800 या उससे अधिक वेतन वाले काम फ़िल्टर कर दिए हैं!";
            actionText = "₹800+ काम देखें";
            break;
          case 'ta':
            reply = "அதிக வருமானம் தேடுகிறீர்களா? ஒரு ஷிப்டுக்கு ₹800 அல்லது அதற்கு மேல் ஊதியம் வழங்கும் வேலைகளை வடிகட்டியுள்ளேன்!";
            actionText = "₹800+ வேலைகளைப் பார்க்க";
            break;
          default:
            reply = "Looking for high earnings? I've filtered jobs paying ₹800 or more per shift!";
            actionText = "View ₹800+ Jobs";
        }
        onAction = () => {
          setFilters(prev => ({ ...prev, minWage: 800 }));
          setActiveScreen('jobs');
          setIsOpen(false);
        };
      } else if (isNearby) {
        switch (language) {
          case 'te':
            reply = `మీకు 5 కి.మీ పరిధిలో షాప్ లోడింగ్, క్లీనింగ్ మరియు నిర్మాణ పనులతో సహా ${jobs.length} స్థానిక పనులు అందుబాటులో ఉన్నాయి.`;
            actionText = "అన్ని పనులు చూడండి";
            break;
          case 'hi':
            reply = `आपके 5 किमी के दायरे में दुकान लोडिंग, सफाई और निर्माण सहित ${jobs.length} स्थानीय काम उपलब्ध हैं।`;
            actionText = "सभी काम देखें";
            break;
          case 'ta':
            reply = `உங்கள் 5 கி.மீ சுற்றளவில் கடை ஏற்றுதல், துப்புரவு, கட்டுமானம் உள்ளிட்ட ${jobs.length} உள்ளூர் வேலை வாய்ப்புகள் உள்ளன.`;
            actionText = "அனைத்து வேலைகளையும் பார்க்க";
            break;
          default:
            reply = `You have ${jobs.length} local gig opportunities within 5 km, including Shop Loading, Cleaning, and Construction.`;
            actionText = "Browse All Jobs";
        }
        onAction = () => {
          setActiveScreen('jobs');
          setIsOpen(false);
        };
      } else if (isWaitingList) {
        switch (language) {
          case 'te':
            reply = "ఒక పనికి కావలసిన స్లాట్లు నిండినప్పుడు, అదనపు దరఖాస్తుదారులు వెయిటింగ్ లిస్ట్‌లో చేరతారు (ఉదా. #1). ఒకవేళ కన్ఫర్మ్ అయిన వర్కర్ రద్దు చేసుకుంటే, వెయిటింగ్ లిస్ట్ #1 లోని అభ్యర్థి స్వయంచాలకంగా కన్ఫర్మ్ అవుతారు! వర్కర్ మరియు కస్టమర్ ఇద్దరికీ తక్షణ నోటిఫికేషన్ వెళుతుంది.";
            break;
          case 'hi':
            reply = "जब काम के सभी स्लॉट भर जाते हैं, तो अतिरिक्त आवेदक वेटिंग लिस्ट में शामिल हो जाते हैं (जैसे #1)। यदि कोई पक्का कामगार रद्द करता है, तो वेटिंग लिस्ट #1 वाला कामगार तुरंत अपने आप कन्फर्म हो जाता है! दोनों को तुरंत सूचना मिलती है।";
            break;
          case 'ta':
            reply = "வேலையின் இடங்கள் நிரம்பியதும், கூடுதல் விண்ணப்பதாரர்கள் காத்திருப்பு பட்டியலில் சேர்வார்கள் (எ.கா. #1). உறுதிப்படுத்தப்பட்ட தொழிலாளி ரத்து செய்தால், காத்திருப்பு பட்டியல் #1 உடனடியாக உறுதியாக்கப்படும்! இருவருக்கும் உடனடி அறிவிப்பு வரும்.";
            break;
          default:
            reply = "When a job is filled, additional applicants join the Waiting List (e.g. #1). If any confirmed worker cancels, Waiting List #1 is instantly and automatically promoted to Confirmed! Both worker and customer get immediate notifications.";
        }
      } else if (isCancel) {
        switch (language) {
          case 'te':
            reply = "వర్క్ మోజో సహకార వ్యవస్థ పనులలో జాప్యాన్ని నివారిస్తుంది: వర్కర్ రద్దు చేసిన వెంటనే, కస్టమర్ మళ్లీ పోస్ట్ చేయాల్సిన అవసరం లేకుండా సిస్టమ్ స్వయంచాలకంగా వెయిటింగ్ లిస్ట్‌లోని తదుపరి వర్కర్‌ను కన్ఫర్మ్ చేస్తుంది!";
            break;
          case 'hi':
            reply = "वर्क मोजो का सहकारी इंजन काम में देरी रोकता है: कामगार के रद्द करते ही, ग्राहक को दोबारा पोस्ट किए बिना सिस्टम वेटिंग लिस्ट से अगले उपलब्ध कामगार को तुरंत कन्फर्म कर देता है!";
            break;
          case 'ta':
            reply = "ஒர்க் மோஜோவின் கூட்டுறவு அமைப்பு தாமதத்தைத் தடுக்கிறது: தொழிலாளி ரத்து செய்தவுடன், வாடிக்கையாளர் மீண்டும் பதிவு செய்ய வேண்டிய அவசியமின்றி காத்திருப்பு பட்டியலில் இருந்து அடுத்த தொழிலாளியை தானாக உறுதிப்படுத்துகிறது!";
            break;
          default:
            reply = "WORK MOJO's cooperative safety engine prevents job delays: as soon as a worker cancels, the system automatically checks the Waiting List and confirms the next available worker without the customer having to re-post!";
        }
      } else if (isLocation) {
        switch (language) {
          case 'te':
            reply = "గోప్యతా కవచం: కన్ఫర్మ్ కావడానికి ముందు సుమారు ప్రాంతం (ఉదా. 'కోరమంగళ 4త్ బ్లాక్, ~2.4 కి.మీ') మాత్రమే కనిపిస్తుంది. వర్కర్ కన్ఫర్మ్ అయిన తర్వాత మాత్రమే ఖచ్చితమైన చిరునామా, ల్యాండ్‌మార్క్, ఫోన్ నంబర్లు మరియు మ్యాప్ నావిగేషన్ అన్‌లాక్ అవుతాయి.";
            break;
          case 'hi':
            reply = "प्राइवेसी शील्ड: कन्फर्म होने से पहले केवल अनुमानित क्षेत्र (जैसे 'कोरामंगला, ~2.4 किमी') दिखता है। सटीक पता, लैंडमार्क, संपर्क नंबर और मैप नेविगेशन केवल कामगार के कन्फर्म होने के बाद ही अनलॉक होते हैं।";
            break;
          case 'ta':
            reply = "தனியுரிமை பாதுகாப்பு: உறுதிப்படுத்துவதற்கு முன் தோராயமான பகுதி மட்டுமே தெரியும். தொழிலாளி உறுதிசெய்யப்பட்ட பின்னரே சரியான முகவரி, அடையாளங்கள், தொடர்பு எண்கள் மற்றும் மேப் வழிசெலுத்தல் திறக்கப்படும்.";
            break;
          default:
            reply = "Privacy Shield: Before confirmation, only the approximate area (e.g. 'Koramangala 4th Block, ~2.4 km') is displayed. Exact street address, landmark, contact numbers, and turn-by-turn navigation unlock only AFTER the worker is confirmed.";
        }
      } else if (isMatch) {
        switch (language) {
          case 'te':
            reply = `మీ ప్రొఫైల్ ${user.reliabilityScore}% విశ్వసనీయత స్కోర్‌ను కలిగి ఉంది! మా AI ఫెయిర్ మ్యాచ్ అల్గోరిథం మీ నైపుణ్యాలు (30%), దూరం (20%), లభ్యత (20%), రేటింగ్ (15%), అనుభవం (10%) మరియు విశ్వసనీయత (5%) ఆధారంగా పనులను సిఫార్సు చేస్తుంది.`;
            break;
          case 'hi':
            reply = `आपकी प्रोफ़ाइल में ${user.reliabilityScore}% विश्वसनीयता स्कोर है! हमारा AI फेयर मैच एल्गोरिदम आपके कौशल (30%), दूरी (20%), उपलब्धता (20%), रेटिंग (15%), अनुभव (10%) और विश्वसनीयता (5%) को बिना किसी भेदभाव के जांचता है।`;
            break;
          case 'ta':
            reply = `உங்கள் சுயவிவரம் ${user.reliabilityScore}% நம்பகத்தன்மை மதிப்பெண்ணைக் கொண்டுள்ளது! எங்கள் AI நியாயமான பொருத்த அல்காரிதம் உங்கள் திறன்கள் (30%), தூரம் (20%), இருப்பு (20%), மதிப்பீடு (15%), அனுபவம் (10%) மற்றும் நம்பகத்தன்மை (5%) ஆகியவற்றை ஆராய்கிறது.`;
            break;
          default:
            reply = `Your profile has a ${user.reliabilityScore}% reliability score! Our AI Fair Match algorithm considers your skills (30%), distance (20%), availability (20%), rating (15%), experience (10%), and reliability (5%) without any bias.`;
        }
      } else if (isAuto) {
        switch (language) {
          case 'te':
            reply = "ఆటోమేటిక్ సెలక్షన్ మోడ్‌లో, వర్క్ మోజో దరఖాస్తుదారులందరినీ మా 6-కారకాల మ్యాచ్ స్కోర్ ద్వారా పరిశీలించి, మీ సమయాన్ని ఆదా చేయడానికి ఉత్తమ వర్కర్లను తక్షణమే కన్ఫర్మ్ చేస్తుంది.";
            if (activeScreen === 'applicants' && jobs.length > 0) {
              actionText = "వర్కర్లను ఆటో-ఫిల్ చేయండి";
            }
            break;
          case 'hi':
            reply = "ऑटोमैटिक सिलेक्शन मोड में, वर्क मोजो पारदर्शी 6-फैक्टर मैच स्कोर का उपयोग करके सभी आवेदकों का मूल्यांकन करता है और आपका समय बचाने के लिए शीर्ष कामगारों को तुरंत कन्फर्म करता है।";
            if (activeScreen === 'applicants' && jobs.length > 0) {
              actionText = "कामगारों को ऑटो-फिल करें";
            }
            break;
          case 'ta':
            reply = "தானியங்கி தேர்வு முறையில், ஒர்க் மோஜோ எங்கள் வெளிப்படையான 6-காரணி பொருத்த மதிப்பெண்ணைப் பயன்படுத்தி அனைத்து விண்ணப்பதாரர்களையும் மதிப்பீடு செய்து, சிறந்த தொழிலாளர்களை உடனடியாக உறுதிப்படுத்துகிறது.";
            if (activeScreen === 'applicants' && jobs.length > 0) {
              actionText = "தொழிலாளர்களை தானாக நிரப்பவும்";
            }
            break;
          default:
            reply = "In Automatic Selection mode, WORK MOJO evaluates all applicants using our transparent 6-factor Match Score and immediately confirms the highest-ranking workers to save you time.";
            if (activeScreen === 'applicants' && jobs.length > 0) {
              actionText = "Auto-Fill Workers Now";
            }
        }
        if (activeScreen === 'applicants' && jobs.length > 0) {
          onAction = () => {
            autoSelectWorkersForJob(jobs[0].id);
            setIsOpen(false);
          };
        }
      } else if (isSos) {
        switch (language) {
          case 'te':
            reply = "కన్ఫర్మ్ అయిన మరియు కొనసాగుతున్న పనుల సమయంలో, ఎరుపు రంగు SOS బటన్ ఎల్లప్పుడూ అందుబాటులో ఉంటుంది. SOS నొక్కిన వెంటనే మీ లైవ్ GPS లొకేషన్ మరియు పని వివరాలు అత్యవసర రక్షణ విభాగానికి చేరతాయి.";
            break;
          case 'hi':
            reply = "कन्फर्म और चल रहे काम के दौरान, लाल SOS बटन हमेशा उपलब्ध रहता है। SOS दबाने पर आपकी लाइव GPS लोकेशन और काम का विवरण तुरंत सुरक्षा टीमों को भेज दिया जाता है।";
            break;
          case 'ta':
            reply = "உறுதிசெய்யப்பட்ட மற்றும் நடப்பு வேலைகளின் போது, சிவப்பு நிற SOS பொத்தான் எப்போதும் கிடைக்கும். SOS அழுத்தியவுடன் உங்கள் நேரலை GPS இருப்பிடம் மற்றும் வேலை விவரங்கள் பாதுகாப்பு பிரிவுக்கு அனுப்பப்படும்.";
            break;
          default:
            reply = "During confirmed and ongoing jobs, the red SOS button is available at all times. Tapping SOS immediately broadcasts your live GPS location and job details to community safety responders.";
        }
      } else if (isPost) {
        switch (language) {
          case 'te':
            reply = "కొత్త పనిని పోస్ట్ చేయడానికి 60 సెకన్లలోపు సమయం పడుతుంది: పని రకం ఎంచుకోండి, వివరణను నమోదు చేయండి (లేదా వాయిస్ కోసం మైక్ నొక్కండి), వేతనం మరియు సమయాన్ని నిర్ణయించి, లొకేషన్ ఎంపిక చేయండి.";
            actionText = "పని పోస్ట్ చేయడం ప్రారంభించండి";
            break;
          case 'hi':
            reply = "काम पोस्ट करने में 60 सेकंड से भी कम समय लगता है: काम का प्रकार चुनें, विवरण दर्ज करें (या आवाज के लिए माइक दबाएं), वेतन व समय चुनें और लोकेशन सेट करें।";
            actionText = "काम पोस्ट करना शुरू करें";
            break;
          case 'ta':
            reply = "வேலையைப் பதிவு செய்ய 60 வினாடிகளுக்கும் குறைவான நேரமே ஆகும்: வேலை வகையைத் தேர்ந்தெடுத்து, விவரங்களை உள்ளிட்டு, ஊதியம், நேரம் மற்றும் இருப்பிடத்தை நிர்ணயிக்கவும்.";
            actionText = "வேலை பதிவு செய்யத் தொடங்குங்கள்";
            break;
          default:
            reply = "Posting a job takes under 60 seconds with our 8-step wizard: select work type, enter description (or tap mic for voice), pick wage, set time, and pinpoint actual workplace location.";
            actionText = "Start Posting Job";
        }
        onAction = () => {
          setActiveScreen('post_job');
          setIsOpen(false);
        };
      } else if (isRating) {
        switch (language) {
          case 'te':
            reply = "నిర్ణీత షిఫ్ట్ సమయం ముగిసినప్పుడు (ఉదా. సాయంత్రం 6:00), వర్క్ మోజో స్వయంచాలకంగా పనిని 'ముగిసింది'గా మార్చి, లైవ్ ట్రాకింగ్ ఆపివేసి, ఇద్దరికీ 5-స్టార్ రేటింగ్ ఇవ్వడానికి అవకాశం కల్పిస్తుంది.";
            break;
          case 'hi':
            reply = "निर्धारित शिफ्ट का समय समाप्त होने पर (उदा. शाम 6:00 बजे), वर्क मोजो काम को अपने आप 'समाप्त' कर देता है, लाइव ट्रैकिंग बंद कर देता है और दोनों पक्षों से 5-स्टार रेटिंग लेता है।";
            break;
          case 'ta':
            reply = "திட்டமிடப்பட்ட ஷிப்ட் நேரம் முடிந்ததும், ஒர்க் மோஜோ தானாகவே வேலையை 'முடிந்தது' என்று மாற்றி, நேரலை கண்காணிப்பை நிறுத்தி, இருவருக்கும் 5-நட்சத்திர மதிப்பீடு வழங்க கேட்கும்.";
            break;
          default:
            reply = "When the scheduled shift time arrives (e.g. 6:00 PM), WORK MOJO automatically transitions the job from Ongoing to Finished, turns off live tracking, and prompts both parties for mutual 5-star ratings.";
        }
      } else {
        switch (language) {
          case 'te':
            reply = `అర్థమైంది! ${activeRole === 'worker' ? 'ఒక వర్కర్‌గా' : 'ఒక కస్టమర్‌గా'}, వర్క్ మోజో మీకు దళారులు లేకుండా నేరుగా కనెక్ట్ అవ్వడానికి సహాయపడుతుంది. మీరు సమీపంలోని పనులు, వేతనాలు, వెయిటింగ్ లిస్ట్ నిబంధనల గురించి నన్ను అడగవచ్చు.`;
            break;
          case 'hi':
            reply = `समझ गया! ${activeRole === 'worker' ? 'एक कामगार' : 'एक ग्राहक'} के रूप में, वर्क मोजो आपको बिना किसी बिचौलिये के सीधे जुड़ने में मदद करता है। आप नजदीकी काम, वेतन, वेटिंग लिस्ट नियमों के बारे में मुझसे पूछ सकते हैं।`;
            break;
          case 'ta':
            reply = `புரிந்தது! ${activeRole === 'worker' ? 'ஒரு தொழிலாளியாக' : 'ஒரு வாடிக்கையாளராக'}, இடைத்தரகர்கள் இல்லாமல் நேரடியாக இணைய ஒர்க் மோஜோ உதவுகிறது. அருகிலுள்ள வேலைகள், ஊதிய விகிதங்கள், காத்திருப்பு பட்டியல் பற்றி நீங்கள் என்னிடம் கேட்கலாம்.`;
            break;
          default:
            reply = `I understand! As ${activeRole === 'worker' ? 'a worker' : 'a customer'}, WORK MOJO helps you connect directly without middlemen. You can ask me about nearby jobs, wage rates, waiting list rules, or tap any suggestion below.`;
        }
      }

      setIsTyping(false);
      const mojoMsg: ChatMessage = {
        id: 'mojo-' + Date.now(),
        sender: 'mojo',
        text: reply,
        actionText,
        onAction,
        timestamp: 'Just now',
      };
      setMessages(prev => [...prev, mojoMsg]);

      if (soundEnabled) {
        speechService.speak(reply, language);
      }
    }, 500);
  };

  const toggleVoiceListening = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      speechService.startListening(
        {
          onResult: transcript => {
            setIsListening(false);
            handleSendMessage(transcript);
          },
          onError: () => {
            setIsListening(false);
          },
          onEnd: () => {
            setIsListening(false);
          },
        },
        language
      );
    }
  };

  const suggestions = getContextSuggestions();

  const languagesList: Array<{ code: SupportedLanguage; label: string }> = [
    { code: 'en', label: 'EN' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ta', label: 'தமிழ்' },
  ];

  const getPlaceholderText = () => {
    if (isListening) {
      switch (language) {
        case 'te': return 'వింటున్నాను...';
        case 'hi': return 'सुन रहा हूँ...';
        case 'ta': return 'கேட்கிறேன்...';
        default: return 'Listening...';
      }
    }
    switch (language) {
      case 'te': return 'మోజోను ఏదైనా అడగండి...';
      case 'hi': return 'मोजो से कुछ भी पूछें...';
      case 'ta': return 'மோஜோவிடம் எதையும் கேளுங்கள்...';
      default: return 'Ask Mojo anything in any language...';
    }
  };

  return (
    <>
      {/* Floating Mascot Button */}
      {!isOpen && (
        <div
          onClick={() => setIsOpen(true)}
          className="fixed bottom-20 right-4 z-40 flex items-center gap-2 cursor-pointer group animate-float select-none"
        >
          {/* Helpful callout pill */}
          <div className="bg-slate-900/90 text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg border border-amber-400/40 hidden sm:flex items-center gap-1.5 backdrop-blur-sm">
            <Sparkles size={12} className="text-amber-400" />
            <span>
              {language === 'te' ? 'మోజో AI ని అడగండి' : language === 'hi' ? 'मोजो AI से पूछें' : language === 'ta' ? 'மோஜோ AI' : 'Ask Mojo AI'}
            </span>
          </div>

          <div className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 shadow-xl border-2 border-white flex items-center justify-center transition-transform transform group-hover:scale-110 active:scale-95">
            <MojoMascotIcon size={46} animated={true} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping"></span>
            </span>
          </div>
        </div>
      )}

      {/* Mojo Assistant Drawer / Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs transition-opacity">
          <div className="w-full sm:max-w-md h-[82vh] sm:h-[620px] bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-amber-500/30">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 p-3.5 sm:p-4 flex flex-col gap-2 text-slate-950 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/95 p-1 shadow-inner flex items-center justify-center">
                    <MojoMascotIcon size={36} animated={false} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-extrabold text-base tracking-tight leading-none">Mojo AI Assistant</h3>
                      <span className="bg-emerald-700 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
                        Multi-Lingual
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-950/90 font-semibold mt-0.5">
                      {language === 'te'
                        ? 'తెలుగు • హిందీ • తమిళ్ • ఇంగ్లీష్'
                        : language === 'hi'
                        ? 'हिंदी • तेलुगु • तमिल • अंग्रेजी'
                        : language === 'ta'
                        ? 'தமிழ் • தெலுங்கு • இந்தி • ஆங்கிலம்'
                        : 'English • తెలుగు • हिन्दी • தமிழ்'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    title={soundEnabled ? 'Mute Mojo Voice' : 'Enable Mojo Voice'}
                    className={`p-2 rounded-full transition-colors ${
                      soundEnabled ? 'text-amber-950 bg-white/40' : 'text-slate-400 bg-black/20'
                    }`}
                  >
                    <Volume2 size={17} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-amber-950 hover:bg-black/10 rounded-full transition-colors"
                  >
                    <X size={19} />
                  </button>
                </div>
              </div>

              {/* In-Chat Quick Language Switcher Pills */}
              <div className="flex items-center justify-between bg-black/15 p-1 rounded-xl">
                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-950/80 px-1">
                  <Globe size={11} />
                  <span>Language:</span>
                </div>
                <div className="flex items-center gap-1">
                  {languagesList.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`text-[10px] font-black px-2 py-0.5 rounded-lg transition-all ${
                        language === lang.code
                          ? 'bg-slate-950 text-amber-300 shadow-xs scale-105'
                          : 'text-amber-950 hover:bg-white/20'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950 text-slate-100">
              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'mojo' && (
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 mt-0.5">
                      <MojoMascotIcon size={24} animated={false} />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed space-y-2 shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-amber-500 text-slate-950 font-bold rounded-tr-xs'
                        : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {msg.actionText && msg.onAction && (
                      <button
                        onClick={msg.onAction}
                        className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98 mt-1"
                      >
                        <span>{msg.actionText}</span>
                        <ArrowRight size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-slate-900/60 p-2.5 rounded-2xl w-fit border border-slate-800 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></div>
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
            <div className="px-3 py-2 bg-slate-900 border-t border-slate-800 overflow-x-auto flex items-center gap-2 no-scrollbar">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s.query)}
                  className="shrink-0 bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-400/50 text-xs font-medium px-3 py-1.5 rounded-full transition-all"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
              <button
                onClick={toggleVoiceListening}
                className={`p-2.5 rounded-xl transition-all ${
                  isListening
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
                }`}
                title="Voice Input (Speech-to-text)"
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder={getPlaceholderText()}
                className="flex-1 bg-slate-800 border border-slate-700 text-white placeholder-slate-400 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-amber-400"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold disabled:opacity-40 transition-colors"
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
