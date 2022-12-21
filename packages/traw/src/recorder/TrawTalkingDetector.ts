import { AudioDetection, connectAudioDetection } from 'webad-ts';

export type onTalkingHandler = (isTalking: boolean) => void;

export interface TrawTalkingDetectorProps {
  audioContext: AudioContext;
  mediaStream: MediaStream;
  onTalking?: onTalkingHandler;
}

export class TrawTalkingDetector {
  private audioContext: AudioContext;

  private mediaStream: MediaStream;

  private audioDetection: AudioDetection;

  private _isTalking = false;

  public onTalking?: onTalkingHandler;

  constructor({ audioContext, mediaStream, onTalking }: TrawTalkingDetectorProps) {
    this.audioContext = audioContext;
    this.mediaStream = mediaStream;
    this.onTalking = onTalking;

    this.audioDetection = connectAudioDetection(this.audioContext, this.mediaStream);
    this.audioDetection.addEventListener('speechstart', this.onSpeechStart);
    this.audioDetection.addEventListener('speechstop', this.onSpeechEnd);
    this.audioDetection.addEventListener('speechabort', this.onSpeechEnd);

    this.audioDetection.start();
  }

  get isTalking(): boolean {
    return this._isTalking;
  }

  onSpeechStart = () => {
    this._isTalking = true;
    this.onTalking?.(true);
  };

  onSpeechEnd = () => {
    this._isTalking = false;
    this.onTalking?.(false);
  };
}
