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

  constructor(callbacks: VoiceEventCallbacks = {}) {
    this.callbacks = callbacks;
    this.capture = new AudioCapture();
    this.playback = new AudioPlayback(isPlaying => {
      if (isPlaying && this.state !== 'SPEAKING') {
        this.setState('SPEAKING');
      } else if (!isPlaying && this.state === 'SPEAKING') {
        this.setState('LISTENING');
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

    // Strip trailing slash if present
    const cleanBase = wsBase.endsWith('/') ? wsBase.slice(0, -1) : wsBase;
    return `${cleanBase}/voice/live`;
  }

  /**
   * Starts a real-time voice session: requests mic permission, connects WebSocket, starts streaming.
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
      // 1. Initialize microphone capture first so permission is confirmed
      await this.capture.start(pcm16kBase64 => {
        this.sendAudioChunk(pcm16kBase64);
      });

      // 2. Open WebSocket connection to WorkMojo backend
      const wsUrl = this.getWebSocketUrl();
      this.ws = new WebSocket(wsUrl);

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
          this.handleServerMessage(msg);
        } catch (err) {
          console.warn('[MOJO VOICE] Error parsing server message:', err);
        }
      };

      this.ws.onerror = () => {
        console.warn('[MOJO VOICE] WebSocket connection error');
        this.handleError('Voice connection error. You can continue using text chat.');
      };

      this.ws.onclose = () => {
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

  private handleServerMessage(msg: any): void {
    switch (msg.type) {
      case 'session_ready':
        this.reconnectAttempts = 0;
        this.setState('LISTENING');
        break;

      case 'audio_chunk':
        if (msg.pcm24k) {
          this.playback.queuePcm24k(msg.pcm24k);
        }
        break;

      case 'interrupted':
        console.log('[MOJO VOICE] Barge-in triggered by server: flushing audio playback');
        this.playback.flush();
        this.setState('INTERRUPTED');
        setTimeout(() => {
          if (this.state === 'INTERRUPTED') {
            this.setState('LISTENING');
          }
        }, 100);
        break;

      case 'transcript':
        if (msg.text) {
          this.callbacks.onTranscript?.(msg.sender, msg.text);
        }
        break;

      case 'intent_action':
        if (msg.intent) {
          this.callbacks.onIntentAction?.(msg);
        }
        break;

      case 'turn_complete':
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

  public disconnect(): void {
    this.capture.stop();
    this.playback.stop();

    if (this.ws) {
      try {
        if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
          this.ws.send(JSON.stringify({ type: 'close' }));
          this.ws.close(1000, 'Client disconnect');
        }
      } catch {}
      this.ws = null;
    }

    this.setState('IDLE');
  }
}
