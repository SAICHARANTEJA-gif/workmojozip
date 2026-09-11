import WebSocket from 'ws';
import { EventEmitter } from 'events';

export interface GeminiLiveConfig {
  apiKey: string;
  model?: string;
  voiceName?: string;
  systemPrompt?: string;
  language?: 'en' | 'te' | 'hi' | 'ta';
  role?: 'customer' | 'worker';
}

export class GeminiLiveService extends EventEmitter {
  private ws: WebSocket | null = null;
  private isReady: boolean = false;
  private isClosed: boolean = false;
  private config: GeminiLiveConfig;

  constructor(config: GeminiLiveConfig) {
    super();
    this.config = config;
  }

  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const apiKey = this.config.apiKey.trim();
        if (!apiKey) {
          throw new Error('GEMINI_API_KEY is missing or empty.');
        }

        const model =
          process.env.GEMINI_LIVE_MODEL ||
          this.config.model ||
          'models/gemini-2.5-flash-native-audio-latest';
        const host = 'generativelanguage.googleapis.com';
        const url = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`;

        this.ws = new WebSocket(url);

        const connectTimeout = setTimeout(() => {
          if (!this.isReady) {
            this.cleanup();
            reject(new Error('Gemini Live API connection timed out.'));
          }
        }, 15000);

        this.ws.on('open', () => {
          console.log('[MOJO VOICE] Connected to Gemini Live API WebSocket');
          this.sendSetupMessage(model);
        });

        this.ws.on('message', (data: WebSocket.RawData) => {
          try {
            const rawStr = data.toString('utf-8');
            const msg = JSON.parse(rawStr);
            this.handleServerMessage(msg, resolve, connectTimeout);
          } catch (err: any) {
            console.warn('[MOJO VOICE] Error parsing Gemini Live message:', err?.message || err);
          }
        });

        this.ws.on('error', (err: Error) => {
          clearTimeout(connectTimeout);
          console.error('[MOJO VOICE] Gemini Live WebSocket error:', err.message);
          this.emit('error', err);
          if (!this.isReady) {
            reject(err);
          }
        });

        this.ws.on('close', (code: number, reason: Buffer) => {
          clearTimeout(connectTimeout);
          this.isReady = false;
          this.isClosed = true;
          const reasonStr = reason.toString('utf-8');
          console.log(`[MOJO VOICE] Gemini Live session closed (code: ${code}, reason: ${reasonStr || 'none'})`);
          this.emit('close', code, reasonStr);
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  private sendSetupMessage(model: string) {
    const defaultVoice = 'Aoede';
    const voiceName = this.config.voiceName || defaultVoice;

    const languageContext =
      this.config.language === 'te'
        ? 'Preferred language: Telugu (తెలుగు). Speak naturally in Telugu.'
        : this.config.language === 'hi'
        ? 'Preferred language: Hindi (हिन्दी). Speak naturally in Hindi.'
        : this.config.language === 'ta'
        ? 'Preferred language: Tamil (தமிழ்). Speak naturally in Tamil.'
        : 'Preferred language: Indian English. Speak naturally in English.';

    const basePrompt = `You are Mojo, the official real-time voice assistant for WorkMojo — India's zero-commission, fair-wage hyper-local blue-collar work platform.
Role of user: ${this.config.role === 'customer' ? 'Customer/Employer looking to post jobs or select workers' : 'Worker looking for nearby jobs, wage info, or attendance'}.
${languageContext}

CRITICAL RULES FOR VOICE:
1. Always respond in the exact language spoken by the user (English, Telugu, Hindi, or Tamil).
2. Keep responses brief, conversational, and direct (1 to 2 sentences maximum).
3. Do not recite markdown syntax, asterisks, bullet points, emojis, or code blocks.
4. If the user wants to post a job or hire workers, actively collect: trade/category, number of workers, date/time, wage, and location.
5. Worker count is flexible and can be any positive integer (e.g. 1, 5, 8, 12, 20).
6. Be warm, professional, respectful, and ready to assist.`;

    const systemPrompt = this.config.systemPrompt ? `${basePrompt}\n${this.config.systemPrompt}` : basePrompt;

    const setupMsg = {
      setup: {
        model,
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName,
              },
            },
          },
        },
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
      },
    };

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(setupMsg));
    }
  }

  private handleServerMessage(
    msg: any,
    resolveReady?: (value: void | PromiseLike<void>) => void,
    connectTimeout?: NodeJS.Timeout
  ) {
    // 1. Initial Setup Ack
    if (msg.setupComplete) {
      this.isReady = true;
      if (connectTimeout) clearTimeout(connectTimeout);
      console.log('[MOJO VOICE] Gemini Live setup completed and ready for audio streaming.');
      this.emit('ready');
      if (resolveReady) resolveReady();
      return;
    }

    const serverContent = msg.serverContent;
    if (!serverContent) return;

    // 2. Interruption / Barge-in Detection
    if (serverContent.interrupted) {
      console.log('[MOJO VOICE] User interruption (barge-in) detected by Gemini Live');
      this.emit('interrupted');
      return;
    }

    // 3. Audio & Text Chunks from Model Turn
    if (serverContent.modelTurn && Array.isArray(serverContent.modelTurn.parts)) {
      for (const part of serverContent.modelTurn.parts) {
        // Native PCM audio output (24kHz Mono 16-bit PCM in Base64)
        if (part.inlineData && part.inlineData.data) {
          this.emit('audio', part.inlineData.data);
        }

        // Text representation of model's spoken words
        if (part.text && part.text.trim()) {
          this.emit('transcript', 'mojo', part.text.trim());
        }
      }
    }

    // 4. Turn Completion
    if (serverContent.turnComplete) {
      this.emit('turn_complete');
    }
  }

  /**
   * Streams a 16kHz PCM audio chunk to Gemini Live API
   * @param pcm16kBuffer 16-bit signed linear PCM buffer at 16,000 Hz mono
   */
  public sendAudioChunk(pcm16kBuffer: Buffer | ArrayBuffer) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.isReady) {
      return;
    }

    const base64Audio =
      pcm16kBuffer instanceof Buffer
        ? pcm16kBuffer.toString('base64')
        : Buffer.from(pcm16kBuffer as ArrayBuffer).toString('base64');

    const realtimePayload = {
      realtimeInput: {
        mediaChunks: [
          {
            mimeType: 'audio/pcm;rate=16000',
            data: base64Audio,
          },
        ],
      },
    };

    try {
      this.ws.send(JSON.stringify(realtimePayload));
    } catch (err: any) {
      console.warn('[MOJO VOICE] Error sending audio chunk to Gemini:', err?.message || err);
    }
  }

  /**
   * Sends text prompt to the active session
   */
  public sendTextMessage(text: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN || !this.isReady) {
      return;
    }

    const payload = {
      clientContent: {
        turns: [
          {
            role: 'user',
            parts: [{ text }],
          },
        ],
        turnComplete: true,
      },
    };

    try {
      this.ws.send(JSON.stringify(payload));
    } catch (err: any) {
      console.warn('[MOJO VOICE] Error sending text message to Gemini:', err?.message || err);
    }
  }

  public cleanup() {
    this.isClosed = true;
    this.isReady = false;
    if (this.ws) {
      try {
        if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
          this.ws.close(1000, 'Session closed by client');
        }
      } catch {}
      this.ws = null;
    }
  }

  public get ready(): boolean {
    return this.isReady;
  }
}
