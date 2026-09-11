/**
 * WorkMojo AudioCapture Engine
 * Captures microphone input via Web Audio API and resamples to 16kHz 16-bit linear PCM mono.
 */

export class AudioCapture {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private sourceNode: MediaStreamAudioSourceNode | null = null;
  private processorNode: ScriptProcessorNode | null = null;
  private isCapturing: boolean = false;

  /**
   * Starts capturing microphone audio and streams 16kHz PCM Base64 chunks via callback.
   */
  public async start(onAudioChunk: (pcm16kBase64: string) => void): Promise<void> {
    if (this.isCapturing) return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Microphone access is not supported by your browser.');
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const inputSampleRate = this.audioContext.sampleRate;
      const targetSampleRate = 16000;
      const bufferSize = 2048;

      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.processorNode = this.audioContext.createScriptProcessor(bufferSize, 1, 1);

      this.processorNode.onaudioprocess = e => {
        if (!this.isCapturing) return;

        const inputChannelData = e.inputBuffer.getChannelData(0);
        const resampledData = this.resampleTo16k(inputChannelData, inputSampleRate, targetSampleRate);
        const pcm16 = this.floatTo16BitPCM(resampledData);

        if (pcm16.length > 0) {
          const base64 = this.arrayBufferToBase64(pcm16.buffer);
          onAudioChunk(base64);
        }
      };

      this.sourceNode.connect(this.processorNode);
      this.processorNode.connect(this.audioContext.destination);

      this.isCapturing = true;
    } catch (err: any) {
      this.stop();
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error('Microphone permission was denied. Please allow microphone access to use voice.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        throw new Error('No microphone was found on this device.');
      }
      throw new Error(err.message || 'Failed to start microphone capture.');
    }
  }

  /**
   * Resamples float32 audio data to 16,000 Hz using linear interpolation
   */
  private resampleTo16k(input: Float32Array, inputRate: number, outputRate: number): Float32Array {
    if (inputRate === outputRate) {
      return input;
    }

    const ratio = inputRate / outputRate;
    const outputLength = Math.round(input.length / ratio);
    const output = new Float32Array(outputLength);

    for (let i = 0; i < outputLength; i++) {
      const srcIndex = i * ratio;
      const indexFloor = Math.floor(srcIndex);
      const indexCeil = Math.min(input.length - 1, indexFloor + 1);
      const fraction = srcIndex - indexFloor;

      output[i] = input[indexFloor] * (1 - fraction) + input[indexCeil] * fraction;
    }

    return output;
  }

  /**
   * Converts Float32Array [-1.0, 1.0] to 16-bit signed Linear PCM Int16Array
   */
  private floatTo16BitPCM(input: Float32Array): Int16Array {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return output;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer | ArrayBufferLike): string {
    let binary = '';
    const bytes = new Uint8Array(buffer as ArrayBuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  /**
   * Stops recording, releases microphone hardware, and closes AudioContext.
   */
  public stop(): void {
    this.isCapturing = false;

    if (this.processorNode) {
      try {
        this.processorNode.disconnect();
      } catch {}
      this.processorNode.onaudioprocess = null;
      this.processorNode = null;
    }

    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch {}
      this.sourceNode = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {}
      });
      this.mediaStream = null;
    }

    if (this.audioContext) {
      try {
        if (this.audioContext.state !== 'closed') {
          this.audioContext.close();
        }
      } catch {}
      this.audioContext = null;
    }
  }

  public get capturing(): boolean {
    return this.isCapturing;
  }
}
