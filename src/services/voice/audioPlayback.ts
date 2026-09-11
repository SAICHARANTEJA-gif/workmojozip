/**
 * WorkMojo AudioPlayback Engine
 * Streams 24kHz 16-bit linear PCM audio with sub-50ms instant interruption / barge-in flush.
 */

export class AudioPlayback {
  private audioContext: AudioContext | null = null;
  private nextPlayTime: number = 0;
  private activeSources: AudioBufferSourceNode[] = [];
  private isPlaying: boolean = false;
  private onPlaybackStateChange?: (isPlaying: boolean) => void;

  constructor(onPlaybackStateChange?: (isPlaying: boolean) => void) {
    this.onPlaybackStateChange = onPlaybackStateChange;
  }

  private initAudioContext(): AudioContext {
    if (!this.audioContext || this.audioContext.state === 'closed') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass({ sampleRate: 24000 });
      this.nextPlayTime = 0;
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
    return this.audioContext;
  }

  /**
   * Queues a base64-encoded 24kHz 16-bit PCM chunk and schedules it sequentially
   */
  public queuePcm24k(base64Pcm: string): void {
    if (!base64Pcm) return;

    try {
      const ctx = this.initAudioContext();
      const pcmBytes = this.base64ToArrayBuffer(base64Pcm);
      const int16Array = new Int16Array(pcmBytes);

      if (int16Array.length === 0) return;

      // Convert 16-bit signed integer PCM to Float32 [-1.0, 1.0]
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      // Create Web Audio buffer at 24kHz mono
      const audioBuffer = ctx.createBuffer(1, float32Array.length, 24000);
      audioBuffer.copyToChannel(float32Array, 0);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      // Schedule seamless gapless playback
      const currentTime = ctx.currentTime;
      const startTime = Math.max(currentTime, this.nextPlayTime);
      source.start(startTime);
      this.nextPlayTime = startTime + audioBuffer.duration;

      this.activeSources.push(source);
      if (!this.isPlaying) {
        this.isPlaying = true;
        this.onPlaybackStateChange?.(true);
      }

      source.onended = () => {
        const idx = this.activeSources.indexOf(source);
        if (idx !== -1) {
          this.activeSources.splice(idx, 1);
        }

        if (this.activeSources.length === 0 && ctx.currentTime >= this.nextPlayTime - 0.05) {
          this.isPlaying = false;
          this.onPlaybackStateChange?.(false);
        }
      };
    } catch (err) {
      console.warn('[MOJO VOICE] Error scheduling audio playback:', err);
    }
  }

  /**
   * Critical Barge-in handler:
   * Immediately stops all currently playing audio sources and empties the playback queue.
   */
  public flush(): void {
    for (const source of this.activeSources) {
      try {
        source.stop(0);
        source.disconnect();
      } catch {}
    }
    this.activeSources = [];
    this.nextPlayTime = 0;

    if (this.isPlaying) {
      this.isPlaying = false;
      this.onPlaybackStateChange?.(false);
    }
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = window.atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  public stop(): void {
    this.flush();
    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }
  }

  public get playing(): boolean {
    return this.isPlaying;
  }
}

