// Voice synthesis & recognition utility for WorkMojo
import { SupportedLanguage } from '../types';
import { SUPPORTED_LANGUAGES, getLanguageConfig } from '../config/languageConfig';

export interface SpeechCallbacks {
  onResult: (text: string) => void;
  onError?: (err: string, code?: string) => void;
  onEnd?: () => void;
  onStart?: () => void;
}

export interface SpeakOptions {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: { code: string; message: string }) => void;
}

export interface VoiceStatus {
  available: boolean;
  voiceName?: string;
  langCode: string;
  bcp47: string;
}

class SpeechService {
  private recognition: any = null;
  private isListening = false;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private voicesLoaded = false;
  private voiceChangeListeners: Array<() => void> = [];
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentlySpeaking = false;

  constructor() {
    this.initRecognition();
    this.initVoices();
  }

  private initRecognition(): void {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          this.recognition = new SpeechRecognition();
          this.recognition.continuous = false;
          this.recognition.interimResults = false;
          this.recognition.maxAlternatives = 1;
        } catch {
          this.recognition = null;
        }
      }
    }
  }

  private initVoices(): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const loadVoices = () => {
      try {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          this.cachedVoices = voices;
          this.voicesLoaded = true;
          this.voiceChangeListeners.forEach(cb => {
            try {
              cb();
            } catch {
              // ignore
            }
          });
        }
      } catch {
        // ignore
      }
    };

    loadVoices();
    if (typeof window.speechSynthesis.onvoiceschanged !== 'undefined') {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }

  public onVoicesChanged(callback: () => void): () => void {
    this.voiceChangeListeners.push(callback);
    return () => {
      this.voiceChangeListeners = this.voiceChangeListeners.filter(cb => cb !== callback);
    };
  }

  public get isSpeechRecognitionSupported(): boolean {
    return !!this.recognition;
  }

  public get isSpeechSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  // Backwards compatibility getter
  public get supported(): boolean {
    return this.isSpeechRecognitionSupported;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (this.cachedVoices.length === 0 && this.isSpeechSynthesisSupported) {
      try {
        this.cachedVoices = window.speechSynthesis.getVoices();
      } catch {
        // ignore
      }
    }
    return this.cachedVoices;
  }

  /**
   * Find matching voice for the given language using locale and preferred voice names
   */
  public findVoiceForLanguage(lang: string = 'en'): SpeechSynthesisVoice | null {
    const config = getLanguageConfig(lang as SupportedLanguage);
    const voices = this.getAvailableVoices();
    if (!voices || voices.length === 0) return null;

    const targetBcp = config.bcp47.toLowerCase();
    const langPrefix = config.code.toLowerCase();

    // 1. Check preferred voice names for this language (e.g. 'Mohan', 'Shruti', 'Google తెలుగు')
    for (const pref of config.preferredVoiceNames) {
      const match = voices.find(v => v.name.toLowerCase().includes(pref.toLowerCase()));
      if (match) return match;
    }

    // 2. Exact BCP-47 match (e.g. 'te-IN', 'hi-IN', 'ta-IN', 'en-IN')
    const exactMatch = voices.find(v => v.lang.toLowerCase() === targetBcp);
    if (exactMatch) return exactMatch;

    // 3. Alternative locales from config
    for (const altLocale of config.voiceLocales) {
      const altMatch = voices.find(
        v => v.lang.toLowerCase() === altLocale.toLowerCase() || v.lang.toLowerCase().replace('_', '-') === altLocale.toLowerCase()
      );
      if (altMatch) return altMatch;
    }

    // 4. Prefix match (e.g. starts with 'te', 'hi', 'ta')
    const prefixMatch = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
    if (prefixMatch) return prefixMatch;

    // 5. Name match containing the language name (e.g. "telugu", "hindi", "tamil")
    const nameMatch = voices.find(v => v.name.toLowerCase().includes(config.name.toLowerCase()));
    if (nameMatch) return nameMatch;

    // For English only, allow general fallback voice
    if (langPrefix === 'en') {
      const genericEn = voices.find(v => v.lang.toLowerCase().startsWith('en'));
      if (genericEn) return genericEn;
      return voices[0] || null;
    }

    return null;
  }

  /**
   * Check if a usable native voice is installed on the user's device/browser
   */
  public hasVoiceForLanguage(lang: string = 'en'): boolean {
    if (!this.isSpeechSynthesisSupported) return false;
    return this.findVoiceForLanguage(lang) !== null;
  }

  public getVoiceInfo(lang: string = 'en'): VoiceStatus {
    const config = getLanguageConfig(lang as SupportedLanguage);
    const voice = this.findVoiceForLanguage(lang);
    return {
      available: !!voice,
      voiceName: voice?.name,
      langCode: config.code,
      bcp47: config.bcp47,
    };
  }

  /**
   * Speak text with language-aware voice selection, safe fallbacks, and callbacks
   */
  public speak(text: string, lang: string = 'en', options?: SpeakOptions): void {
    if (!this.isSpeechSynthesisSupported) {
      options?.onError?.({ code: 'NOT_SUPPORTED', message: 'Speech synthesis is not supported' });
      return;
    }

    try {
      this.stopSpeaking();

      const config = getLanguageConfig(lang as SupportedLanguage);
      const voice = this.findVoiceForLanguage(lang);

      // Guard: If it's a non-English language and no matching voice is installed,
      // speaking with the default English voice results in screeching / garbled letters.
      if (!voice && config.code !== 'en') {
        options?.onError?.({
          code: 'VOICE_NOT_INSTALLED',
          message: config.voiceNotice.notInstalled,
        });
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voice?.lang || config.bcp47;
      if (voice) {
        utterance.voice = voice;
      }

      utterance.rate = 0.95; // Steady, clear delivery
      utterance.pitch = 1.05; // Warm, friendly Mojo tone

      utterance.onstart = () => {
        this.currentlySpeaking = true;
        options?.onStart?.();
      };

      utterance.onend = () => {
        this.currentlySpeaking = false;
        this.currentUtterance = null;
        options?.onEnd?.();
      };

      utterance.onerror = (e: any) => {
        this.currentlySpeaking = false;
        this.currentUtterance = null;
        // Don't report 'canceled' / 'interrupted' as fatal errors
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          options?.onError?.({ code: e.error || 'ERROR', message: e.message || 'Speech synthesis error' });
        }
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err: any) {
      this.currentlySpeaking = false;
      this.currentUtterance = null;
      options?.onError?.({ code: 'EXCEPTION', message: err?.message || 'Could not start speech' });
    }
  }

  public stopSpeaking(): void {
    if (this.isSpeechSynthesisSupported) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
    this.currentlySpeaking = false;
    this.currentUtterance = null;
  }

  public isSpeaking(): boolean {
    if (this.isSpeechSynthesisSupported) {
      return this.currentlySpeaking || window.speechSynthesis.speaking;
    }
    return false;
  }

  /**
   * Speech Recognition (Speech-to-Text) with dynamic language configuration
   */
  public startListening(callbacks: SpeechCallbacks, lang: string = 'en'): void {
    const config = getLanguageConfig(lang as SupportedLanguage);
    const targetBcp = config.bcp47;

    if (!this.recognition) {
      callbacks.onError?.(config.speechErrors.audioCapture, 'audio-capture');
      callbacks.onEnd?.();
      return;
    }

    if (this.isListening) {
      try {
        this.recognition.abort();
      } catch {
        // ignore
      }
      this.isListening = false;
    }

    try {
      this.recognition.lang = targetBcp;

      this.recognition.onstart = () => {
        this.isListening = true;
        callbacks.onStart?.();
      };

      this.recognition.onresult = (event: any) => {
        if (event.results && event.results[0] && event.results[0][0]) {
          const transcript = event.results[0][0].transcript;
          callbacks.onResult(transcript);
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        const errCode = event.error;
        let userMessage = config.speechErrors.general;

        switch (errCode) {
          case 'not-allowed':
          case 'service-not-allowed':
            userMessage = config.speechErrors.notAllowed;
            break;
          case 'no-speech':
            userMessage = config.speechErrors.noSpeech;
            break;
          case 'audio-capture':
            userMessage = config.speechErrors.audioCapture;
            break;
          case 'network':
            userMessage = config.speechErrors.network;
            break;
          case 'aborted':
            return; // Normal user cancel
          default:
            userMessage = config.speechErrors.general;
        }

        callbacks.onError?.(userMessage, errCode);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        callbacks.onEnd?.();
      };

      this.isListening = true;
      this.recognition.start();
    } catch (e: any) {
      this.isListening = false;
      callbacks.onError?.(config.speechErrors.general, 'start-failed');
      callbacks.onEnd?.();
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

  public get listening(): boolean {
    return this.isListening;
  }
}

export const speechService = new SpeechService();
