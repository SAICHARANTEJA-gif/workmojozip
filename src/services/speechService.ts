// Voice synthesis & recognition utility for Work Mojo

interface SpeechCallbacks {
  onResult: (text: string) => void;
  onError?: (err: string) => void;
  onEnd?: () => void;
}

const LANG_CODE_MAP: Record<string, string> = {
  en: 'en-IN',
  te: 'te-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
};

class SpeechService {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-IN';
      }
    }
  }

  public get supported(): boolean {
    return !!this.recognition;
  }

  public startListening(callbacks: SpeechCallbacks, lang: string = 'en'): void {
    const targetLang = LANG_CODE_MAP[lang] || lang || 'en-IN';

    if (this.recognition) {
      try {
        this.recognition.lang = targetLang;
        this.recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          callbacks.onResult(transcript);
        };
        this.recognition.onerror = (event: any) => {
          if (callbacks.onError) callbacks.onError(event.error);
        };
        this.recognition.onend = () => {
          this.isListening = false;
          if (callbacks.onEnd) callbacks.onEnd();
        };
        this.isListening = true;
        this.recognition.start();
      } catch {
        this.simulateFallbackVoice(callbacks, lang);
      }
    } else {
      this.simulateFallbackVoice(callbacks, lang);
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.isListening = false;
    }
  }

  public speak(text: string, lang: string = 'en'): void {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const targetLang = LANG_CODE_MAP[lang] || lang || 'en-IN';
        utterance.lang = targetLang;
        utterance.rate = 1.0;
        utterance.pitch = 1.1; // Friendly Mojo hamster pitch

        // Select voice matching language if available
        const voices = window.speechSynthesis.getVoices();
        const langPrefix = targetLang.split('-')[0];
        const matchedVoice = voices.find(
          v => v.lang.toLowerCase() === targetLang.toLowerCase() || v.lang.toLowerCase().startsWith(langPrefix)
        );
        if (matchedVoice) {
          utterance.voice = matchedVoice;
        }

        window.speechSynthesis.speak(utterance);
      } catch {
        // gracefully ignore
      }
    }
  }

  private simulateFallbackVoice(callbacks: SpeechCallbacks, lang: string = 'en'): void {
    // Simulated voice search examples for demonstration across supported languages
    const demoPhrasesByLang: Record<string, string[]> = {
      te: [
        'నా దగ్గర డెలివరీ పనులు',
        'ఈరోజు నిర్మాణ పనులు',
        '₹700 కంటే ఎక్కువ క్లీనింగ్ పనులు',
        'షాప్ హెల్పర్ కావాలి',
        'లోడింగ్ అసిస్టెంట్ సమీపంలో',
      ],
      hi: [
        'मेरे पास डिलीवरी का काम',
        'आज निर्माण कार्य',
        '₹700 से अधिक सफाई का काम',
        'दुकान सहायक काम',
        'नजदीकी लोडिंग काम',
      ],
      ta: [
        'என் அருகில் டெலிவரி வேலைகள்',
        'இன்று கட்டுமான வேலை',
        '₹700க்கு மேல் துப்புரவு வேலை',
        'கடை உதவியாளர் வேலை',
        'அருகில் ஏற்றுதல் வேலை',
      ],
      en: [
        'Show delivery jobs near me',
        'Construction work today',
        'Cleaning jobs above ₹700',
        'Shop helper in Koramangala',
        'Loading assistant nearby',
      ],
    };

    const phrases = demoPhrasesByLang[lang] || demoPhrasesByLang['en'];
    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    setTimeout(() => {
      callbacks.onResult(phrase);
      if (callbacks.onEnd) callbacks.onEnd();
    }, 1200);
  }
}

export const speechService = new SpeechService();
