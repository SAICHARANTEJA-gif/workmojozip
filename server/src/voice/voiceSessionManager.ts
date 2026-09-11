import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { GeminiLiveService } from './geminiLiveService';
import {
  classifyIntentAndExtractEntities,
  generateIntentResponse,
  ConversationState,
  JobDraft,
} from '../aiService';

export type SupportedLanguage = 'en' | 'te' | 'hi' | 'ta';

interface ClientSession {
  clientWs: WebSocket;
  geminiService: GeminiLiveService | null;
  language: SupportedLanguage;
  role: 'customer' | 'worker';
  conversationState: ConversationState;
  accumulatedTurnText: string;
  isAlive: boolean;
}

export function setupVoiceWebSocketServer(server: http.Server): WebSocketServer {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const url = request.url || '';
    if (url.startsWith('/api/v1/voice/live')) {
      wss.handleUpgrade(request, socket, head, ws => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (ws: WebSocket) => {
    console.log('[MOJO VOICE] Client connected to Voice WebSocket endpoint');

    const session: ClientSession = {
      clientWs: ws,
      geminiService: null,
      language: 'en',
      role: 'customer',
      conversationState: { jobDraft: {} },
      accumulatedTurnText: '',
      isAlive: true,
    };

    ws.on('pong', () => {
      session.isAlive = true;
    });

    ws.on('message', async (data: WebSocket.RawData, isBinary: boolean) => {
      try {
        if (isBinary) {
          // Direct binary 16kHz PCM audio chunk from microphone
          if (session.geminiService && session.geminiService.ready) {
            session.geminiService.sendAudioChunk(data as Buffer);
          }
          return;
        }

        const msgStr = data.toString('utf-8');
        const msg = JSON.parse(msgStr);

        switch (msg.type) {
          case 'init': {
            const apiKey =
              process.env.GEMINI_API_KEY ||
              process.env.GOOGLE_API_KEY ||
              process.env.GOOGLE_GEMINI_API_KEY ||
              process.env.GEMINI_KEY;

            session.language = (msg.language as SupportedLanguage) || 'en';
            session.role = msg.role || 'customer';
            if (msg.conversationState) {
              session.conversationState = msg.conversationState;
            }

            if (!apiKey || apiKey.trim() === '') {
              console.warn('[MOJO VOICE] GEMINI_API_KEY is not configured on server.');
              sendToClient(ws, {
                type: 'session_ready',
                language: session.language,
                role: session.role,
                fallback: true,
              });
              sendToClient(ws, {
                type: 'error',
                code: 'VOICE_KEY_NOT_CONFIGURED',
                message: 'Gemini Live voice key not configured on server. Routing voice commands to Mojo AI assistant.',
              });
              break;
            }

            // Clean up any existing Gemini session for this client
            if (session.geminiService) {
              session.geminiService.cleanup();
              session.geminiService = null;
            }

            const liveModel = process.env.GEMINI_LIVE_MODEL || 'models/gemini-2.0-flash-exp';
            const liveVoice = process.env.GEMINI_LIVE_VOICE || 'Aoede';

            const gemini = new GeminiLiveService({
              apiKey: apiKey.trim(),
              model: liveModel,
              voiceName: liveVoice,
              language: session.language,
              role: session.role,
            });

            session.geminiService = gemini;

            gemini.on('ready', () => {
              sendToClient(ws, {
                type: 'session_ready',
                language: session.language,
                role: session.role,
              });
            });

            gemini.on('audio', (pcm24kBase64: string) => {
              sendToClient(ws, {
                type: 'audio_chunk',
                pcm24k: pcm24kBase64,
              });
            });

            gemini.on('transcript', (sender: 'user' | 'mojo', text: string) => {
              session.accumulatedTurnText += ' ' + text;
              sendToClient(ws, {
                type: 'transcript',
                sender,
                text,
              });
            });

            gemini.on('interrupted', () => {
              console.log('[MOJO VOICE] Dispatching interrupted signal to client');
              session.accumulatedTurnText = '';
              sendToClient(ws, {
                type: 'interrupted',
              });
            });

            gemini.on('turn_complete', () => {
              // When turn is completed, route the accumulated text into WorkMojo's 23-intent classifier
              const fullSpeech = session.accumulatedTurnText.trim();
              session.accumulatedTurnText = '';

              if (fullSpeech) {
                routeSpeechToIntent(session, fullSpeech, ws);
              }

              sendToClient(ws, {
                type: 'turn_complete',
              });
            });

            gemini.on('error', (err: Error) => {
              sendToClient(ws, {
                type: 'error',
                code: 'GEMINI_ERROR',
                message: 'A voice communication error occurred with Gemini Live.',
              });
            });

            gemini.on('close', (code: number, reason: string) => {
              sendToClient(ws, {
                type: 'session_closed',
                code,
                reason,
              });
            });

            try {
              await gemini.connect();
            } catch (connErr: any) {
              console.warn('[MOJO VOICE] Could not connect to Gemini Live WebSocket:', connErr?.message || connErr);
              sendToClient(ws, {
                type: 'error',
                code: 'CONNECTION_FAILED',
                message: 'Could not connect to Gemini Live service. Switching to text chat.',
              });
            }
            break;
          }

          case 'audio': {
            // Base64-encoded audio chunk from client
            if (session.geminiService && session.geminiService.ready && msg.pcm16k) {
              const buffer = Buffer.from(msg.pcm16k, 'base64');
              session.geminiService.sendAudioChunk(buffer);
            }
            break;
          }

          case 'text': {
            if (session.geminiService && session.geminiService.ready && msg.text) {
              session.geminiService.sendTextMessage(msg.text);
            }
            if (msg.text) {
              routeSpeechToIntent(session, msg.text, ws);
            }
            break;
          }

          case 'interrupt': {
            // Client detected local speech or tapped interrupt
            console.log('[MOJO VOICE] Client sent explicit interrupt signal');
            sendToClient(ws, { type: 'interrupted' });
            break;
          }

          case 'close': {
            if (session.geminiService) {
              session.geminiService.cleanup();
              session.geminiService = null;
            }
            break;
          }

          default:
            console.log('[MOJO VOICE] Unhandled message type:', msg.type);
        }
      } catch (err: any) {
        console.error('[MOJO VOICE] Error processing WebSocket message:', err?.message || err);
      }
    });

    ws.on('close', () => {
      console.log('[MOJO VOICE] Client disconnected from Voice WebSocket');
      if (session.geminiService) {
        session.geminiService.cleanup();
        session.geminiService = null;
      }
    });

    ws.on('error', (err: Error) => {
      console.error('[MOJO VOICE] Client socket error:', err.message);
      if (session.geminiService) {
        session.geminiService.cleanup();
        session.geminiService = null;
      }
    });
  });

  // Heartbeat ping/pong every 30s to keep alive and detect dead connections
  const interval = setInterval(() => {
    wss.clients.forEach(ws => {
      const extWs = ws as WebSocket & { isAlive?: boolean };
      if (extWs.isAlive === false) {
        return ws.terminate();
      }
      extWs.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  return wss;
}

function sendToClient(ws: WebSocket, payload: Record<string, any>) {
  if (ws.readyState === WebSocket.OPEN) {
    try {
      ws.send(JSON.stringify(payload));
    } catch (err: any) {
      console.warn('[MOJO VOICE] Error sending message to client:', err?.message || err);
    }
  }
}

function routeSpeechToIntent(session: ClientSession, fullSpeech: string, ws: WebSocket) {
  if (!fullSpeech || !fullSpeech.trim()) return;

  const classification = classifyIntentAndExtractEntities(
    fullSpeech.trim(),
    session.language,
    session.role,
    session.conversationState
  );
  const updatedDraft: JobDraft = classification.updatedDraft;

  session.conversationState.jobDraft = updatedDraft;
  session.conversationState.lastIntent = classification.intent;

  const domainResult = generateIntentResponse(
    classification.intent,
    classification.entities,
    updatedDraft,
    session.language,
    session.role
  );

  sendToClient(ws, {
    type: 'intent_action',
    intent: classification.intent,
    entities: classification.entities,
    action: domainResult.action,
    conversationState: session.conversationState,
  });

  sendToClient(ws, {
    type: 'transcript',
    sender: 'mojo',
    text: domainResult.reply,
  });
}
