/**
 * WorkMojo GeminiLiveClient
 * Full-duplex WebSocket client managing real-time voice sessions with Google Gemini Live API.
 */

import { AudioCapture } from './audioCapture';
import { AudioPlayback } from './audioPlayback';
import { SupportedLanguage } from '../../types';
import { api } from '../api';

export type VoiceState =
  | 'IDLE'
  | 'CONNECTING'
  | 'LISTENING'
  | 'USER_SPEAKING'
  | 'THINKING'
  | 'SPEAKING'
  | 'INTERRUPTED'
  | 'ERROR';

export interface VoiceEventCallbacks {
  onStateChange?: (state: VoiceState) => void;
  onTranscript?: (sender: 'user' | 'mojo', text: string) => void;
  onIntentAction?: (payload: {
    intent: string;
    entities: Record<string, any>;
    action?: any;
    conversationState?: any;
  }) => void;
  onVolumeChange?: (volume: number, rms: number) => void;
  onError?: (errorMessage: string) => void;
}

export class GeminiLiveClient {
  private ws: WebSocket | null = null;
  private capture: AudioCapture;
  private playback: AudioPlayback;
  private state: VoiceState = 'IDLE';
  private callbacks: VoiceEventCallbacks;
  private language: SupportedLanguage = 'en';
  private role: 'customer' | 'worker' = 'customer';
  private conversationState: any = {};
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 2;

  // VAD & Turn Detection Parameters
  private lastSpeechTime: number = 0;
  private consecutiveBargeInFrames: number = 0;
  private readonly SPEECH_RMS_THRESHOLD = 0.018;
  private readonly BARGE_IN_RMS_THRESHOLD = 0.055;
  private readonly TRAILING_SILENCE_MS = 1300;

  constructor(callbacks: VoiceEventCallbacks = {}) {
    this.callbacks = callbacks;
    this.capture = new AudioCapture();
    this.playback = new AudioPlayback(isPlaying => {
      if (isPlaying) {
        if (this.state !== 'SPEAKING') {
          this.setState('SPEAKING');
        }
      } else {
        // Mojo finished speaking: deterministically transition back to continuous LISTENING!
        if (this.state === 'SPEAKING' || this.state === 'THINKING') {
          this.setState('LISTENING');
        }
      }
    });
  }

  private setState(newState: VoiceState): void {
    if (this.state === newState) return;
    this.state = newState;
    this.callbacks.onStateChange?.(newState);
  }

  public getState(): VoiceState {
    return this.state;
  }

  private getWebSocketUrl(): string {
    const apiBase = api.getBaseUrl();
    let wsBase: string;

    if (apiBase.startsWith('http://')) {
      wsBase = apiBase.replace('http://', 'ws://');
    } else if (apiBase.startsWith('https://')) {
      wsBase = apiBase.replace('https://', 'wss://');
    } else {
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      wsBase = `${proto}//${window.location.host}/api/v1`;
    }

    const cleanBase = wsBase.endsWith('/') ? wsBase.slice(0, -1) : wsBase;
    return `${cleanBase}/voice/live`;
  }

  /**
   * Starts a real-time continuous voice session: requests mic permission,
   * connects WebSocket, and enters continuous listening loop.
   */
  public async connect(
    language: SupportedLanguage = 'en',
    role: 'customer' | 'worker' = 'customer',
    conversationState: any = {}
  ): Promise<void> {
    if (this.state !== 'IDLE' && this.state !== 'ERROR') {
      return;
    }

    this.language = language;
    this.role = role;
    this.conversationState = conversationState;
    this.setState('CONNECTING');

    try {
      // 1. Initialize microphone capture first
      await this.capture.start(
        (pcm16kBase64, rms) => {
          this.handleAudioFrame(pcm16kBase64, rms);
        },
        (rms, normalizedVolume) => {
          this.callbacks.onVolumeChange?.(normalizedVolume, rms);
        }
      );

      // 2. Open WebSocket connection to WorkMojo backend
      const wsUrl = this.getWebSocketUrl();
      console.log('[MOJO VOICE] Connecting to WebSocket URL:', wsUrl);
      this.ws = new WebSocket(wsUrl);

      const connectTimeout = setTimeout(() => {
        if (this.state === 'CONNECTING') {
          console.warn('[MOJO VOICE] Connection timed out waiting for backend session_ready');
          this.handleError('Voice connection timed out. Please check your network or try again.');
        }
      }, 10000);

      this.ws.onopen = () => {
        console.log('[MOJO VOICE] Connected to backend voice WebSocket');
        this.ws?.send(
          JSON.stringify({
            type: 'init',
            language: this.language,
            role: this.role,
            conversationState: this.conversationState,
          })
        );
      };

      this.ws.onmessage = event => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'session_ready') {
            clearTimeout(connectTimeout);
          }
          this.handleServerMessage(msg);
        } catch (err) {
          console.warn('[MOJO VOICE] Error parsing server message:', err);
        }
      };

      this.ws.onerror = () => {
        clearTimeout(connectTimeout);
        console.warn('[MOJO VOICE] WebSocket connection error');
        this.handleError('Voice connection error. You can continue using text chat.');
      };

      this.ws.onclose = () => {
        clearTimeout(connectTimeout);
        console.log('[MOJO VOICE] Voice WebSocket closed');
        if (this.state !== 'IDLE' && this.state !== 'ERROR') {
          this.setState('IDLE');
        }
        this.capture.stop();
        this.playback.stop();
      };
    } catch (err: any) {
      console.error('[MOJO VOICE] Failed to initialize voice session:', err);
      this.handleError(err.message || 'Voice service unavailable.');
    }
  }

  /**
   * Processes each captured 16kHz PCM audio frame with acoustic echo suppression and VAD
   */
  private handleAudioFrame(pcm16kBase64: string, rms: number): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const now = Date.now();

    // 1. Acoustic Echo Suppression & Barge-in during Mojo SPEAKING
    if (this.state === 'SPEAKING') {
      if (rms >= this.BARGE_IN_RMS_THRESHOLD) {
        this.consecutiveBargeInFrames++;
        if (this.consecutiveBargeInFrames >= 2) {
          // Real human voice detected over speaker output -> Barge in!
          console.log('[MOJO VOICE] User barge-in detected by client VAD');
          this.playback.flush();
          this.ws.send(JSON.stringify({ type: 'interrupt' }));
          this.setState('USER_SPEAKING');
          this.lastSpeechTime = now;
          this.consecutiveBargeInFrames = 0;
          this.sendAudioChunk(pcm16kBase64);
        }
      } else {
        this.consecutiveBargeInFrames = 0;
        // Suppress audio chunk to prevent Gemini Live from hearing its own echo
      }
      return;
    }

    this.consecutiveBargeInFrames = 0;

    // 2. State handling for LISTENING, USER_SPEAKING, THINKING
    if (this.state === 'LISTENING') {
      if (rms >= this.SPEECH_RMS_THRESHOLD) {
        this.setState('USER_SPEAKING');
        this.lastSpeechTime = now;
      }
      this.sendAudioChunk(pcm16kBase64);
      return;
    }

    if (this.state === 'USER_SPEAKING') {
      if (rms >= this.SPEECH_RMS_THRESHOLD) {
        this.lastSpeechTime = now;
      } else {
        // Check trailing silence window
        if (now - this.lastSpeechTime > this.TRAILING_SILENCE_MS) {
          this.setState('THINKING');
        }
      }
      this.sendAudioChunk(pcm16kBase64);
      return;
    }

    if (this.state === 'THINKING') {
      if (rms >= this.SPEECH_RMS_THRESHOLD) {
        // User resumed speaking before model replied
        this.setState('USER_SPEAKING');
        this.lastSpeechTime = now;
      }
      this.sendAudioChunk(pcm16kBase64);
      return;
    }

    // Default: stream audio
    this.sendAudioChunk(pcm16kBase64);
  }

  private handleServerMessage(msg: any): void {
    switch (msg.type) {
      case 'session_ready':
        this.reconnectAttempts = 0;
        this.setState('LISTENING');
        break;

      case 'audio_chunk':
        if (this.state === 'INTERRUPTED') {
          return;
        }
        if (msg.pcm24k) {
          this.playback.queuePcm24k(msg.pcm24k);
          if (this.state !== 'SPEAKING') {
            this.setState('SPEAKING');
          }
        }
        break;

      case 'interrupted':
        console.log('[MOJO VOICE] Barge-in acknowledged by server: flushing audio playback');
        this.playback.flush();
        this.setState('INTERRUPTED');
        setTimeout(() => {
          if (this.state === 'INTERRUPTED') {
            this.setState('LISTENING');
          }
        }, 80);
        break;

      case 'transcript':
        if (msg.text) {
          this.callbacks.onTranscript?.(msg.sender, msg.text);
        }
        break;

      case 'intent_action':
        if (msg.intent) {
          if (msg.conversationState) {
            this.conversationState = msg.conversationState;
          }
          this.callbacks.onIntentAction?.(msg);
        }
        break;

      case 'turn_complete':
        // If playback has completed, deterministically return to continuous LISTENING.
        // If still playing, AudioPlayback's onended will transition to LISTENING when finished.
        if (!this.playback.playing) {
          this.setState('LISTENING');
        }
        break;

      case 'error':
        this.handleError(msg.message || 'Voice service error.');
        break;

      default:
        break;
    }
  }

  private sendAudioChunk(pcm16kBase64: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      this.ws.send(
        JSON.stringify({
          type: 'audio',
          pcm16k: pcm16kBase64,
        })
      );
    } catch (err) {
      console.warn('[MOJO VOICE] Error sending audio chunk:', err);
    }
  }

  public sendTextMessage(text: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    try {
      this.ws.send(
        JSON.stringify({
          type: 'text',
          text,
        })
      );
    } catch (err) {
      console.warn('[MOJO VOICE] Error sending text to live session:', err);
    }
  }

  public updateLanguage(language: SupportedLanguage): void {
    this.language = language;
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(
          JSON.stringify({
            type: 'change_language',
            language,
          })
        );
      } catch (err) {
        console.warn('[MOJO VOICE] Error sending language update:', err);
      }
    }
  }

  public updateDraft(draft: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(
          JSON.stringify({
            type: 'update_draft',
            draft,
          })
        );
      } catch (err) {
        console.warn('[MOJO VOICE] Error sending draft update:', err);
      }
    }
  }

  public interrupt(): void {
    this.playback.flush();
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'interrupt' }));
    }
    this.setState('LISTENING');
  }

  private handleError(errorMessage: string): void {
    this.setState('ERROR');
    this.callbacks.onError?.(errorMessage);
    this.disconnect();
  }

  /**
   * Explicitly closes voice session (only on user click, modal close, or fatal error)
   */
  public disconnect(): void {
    this.capture.stop();
    this.playback.stop();

    if (this.ws) {
      try {
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'close' }));
        }
        if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
          this.ws.close(1000, 'Client disconnect');
        }
      } catch {}
      this.ws = null;
    }

    this.setState('IDLE');
  }
}

