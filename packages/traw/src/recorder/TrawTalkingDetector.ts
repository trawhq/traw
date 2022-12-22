import { AudioDetection, connectAudioDetection } from 'webad-ts';

export type onTalkingHandler = (isTalking: boolean) => void;

export type onSilenceHandler = () => void;

export interface TrawTalkingDetectorOptions {
  audioContext: AudioContext;
  mediaStream?: MediaStream;

  /**
   * Triggered when the user starts & stops talking
   */
  onTalking?: onTalkingHandler;

  /**
   * Trigger onSilence callback when the silence duration is longer than this value in milliseconds
   *
   * @default 1500
   */
  silenceTimeout?: number;
  onSilence?: onSilenceHandler;
}

export class TrawTalkingDetector {
  private _audioContext: AudioContext;

  private _mediaStream?: MediaStream;

  private _audioDetection?: AudioDetection;

  private _silenceTimeoutMilliseconds: number;

  private _isTalking = false;

  // Timeout return value
  private _silenceTimeoutId?: number;

  public onTalking?: onTalkingHandler;

  public onSilence?: onSilenceHandler;

  constructor({ audioContext, mediaStream, onTalking, silenceTimeout = 1800, onSilence }: TrawTalkingDetectorOptions) {
    this._audioContext = audioContext;
    this._mediaStream = mediaStream;
    this.onTalking = onTalking;

    this._silenceTimeoutMilliseconds = silenceTimeout;
    this.onSilence = onSilence;

    this.initAudioDetection();
  }

  public get isTalking(): boolean {
    return this._isTalking;
  }

  public updateMediaStream(mediaStream: MediaStream | undefined) {
    if (this._mediaStream !== mediaStream) {
      this._mediaStream = mediaStream;
      this.initAudioDetection();
    }
  }

  /**
   * Callback for speech start event
   */
  public onSpeechStart = () => {
    this._isTalking = true;
    this.onTalking?.(true);

    if (this._silenceTimeoutId) {
      clearTimeout(this._silenceTimeoutId);
    }
  };

  /**
   * Callback for speech end event
   */
  public onSpeechEnd = () => {
    this._isTalking = false;
    this.onTalking?.(false);

    this._silenceTimeoutId = self.setTimeout(() => {
      this.onSilence?.();
    }, this._silenceTimeoutMilliseconds);
  };

  private initAudioDetection = () => {
    // Stop previous audio detection
    if (this._audioDetection) {
      this._audioDetection.removeEventListener('speechstart', this.onSpeechStart);
      this._audioDetection.removeEventListener('speechstop', this.onSpeechEnd);
      this._audioDetection.removeEventListener('speechabort', this.onSpeechEnd);
      this._audioDetection.stop();
      this._audioDetection = undefined;
    }

    if (this._mediaStream) {
      // Create a new audio detection
      this._audioDetection = connectAudioDetection(this._audioContext, this._mediaStream);
      this._audioDetection.addEventListener('speechstart', this.onSpeechStart);
      this._audioDetection.addEventListener('speechstop', this.onSpeechEnd);
      this._audioDetection.addEventListener('speechabort', this.onSpeechEnd);
      this._audioDetection.start();
    }
  };
}
