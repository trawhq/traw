import { UnsupportedBrowserException } from 'errors/UnsupportedBrowserException';

export type VoiceRecorderMimeType = 'audio/webm' | 'audio/mp4';

export interface TrawVoiceRecorderOption {
  mediaStream?: MediaStream;
  audioBitsPerSecond?: number;
  mimeType?: VoiceRecorderMimeType;
  onFileCreated?: (file: File, ext: string) => void;
}

export class TrawVoiceRecorder {
  private mediaStream: MediaStream;

  private audioBitsPerSecond: number;

  private mimeType: VoiceRecorderMimeType;

  private mediaRecorder: MediaRecorder;

  /**
   * Callback function when a voice file is created
   */
  public onFileCreated?: (file: File, ext: string) => void;

  constructor({ mediaStream, audioBitsPerSecond, mimeType, onFileCreated }: TrawVoiceRecorderOption) {
    this.mediaStream = mediaStream ?? new MediaStream();
    this.audioBitsPerSecond = audioBitsPerSecond ?? 44100;

    if (!TrawVoiceRecorder.isSupported()) {
      throw new UnsupportedBrowserException(
        `MediaRecorder does not support any of the following MIME types: 'audio/webm', 'audio/mp4'`,
      );
    }

    this.mimeType = mimeType ?? TrawVoiceRecorder.getSupportedMimeType();
    this.mediaRecorder = this.setupMediaRecorder();
    this.onFileCreated = onFileCreated;
  }

  public static isSupported = (): boolean => {
    return !!TrawVoiceRecorder.getSupportedMimeType();
  };

  private static getSupportedMimeType = (): VoiceRecorderMimeType | undefined => {
    if (MediaRecorder.isTypeSupported('audio/webm')) {
      return 'audio/webm';
    } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
      return 'audio/mp4';
    }
    return undefined;
  };

  private setupMediaRecorder = (): MediaRecorder => {
    const mediaRecorder = new MediaRecorder(this.mediaStream, {
      audioBitsPerSecond: this.audioBitsPerSecond,
      mimeType: this.mimeType,
    });

    mediaRecorder.ondataavailable = (e: BlobEvent) => {
      e.data.arrayBuffer().then((arrayBuffer) => {
        const blob = new Blob([arrayBuffer], { type: this.mimeType });
        const ext = this.mimeType.split('/')[1];
        const fileObj = new File([blob], `voice.${ext}`, { type: this.mimeType });
        this.onFileCreated?.(fileObj, ext);
      });
    };

    return mediaRecorder;
  };

  public get isRecording(): boolean {
    return this.mediaRecorder.state === 'recording';
  }

  /**
   * Start voice recorder
   */
  public startVoiceRecorder = () => {
    if (!this.isRecording) {
      this.mediaRecorder.start();
    }
  };

  /**
   * Stop voice recorder
   */
  public stopVoiceRecorder = () => {
    if (this.isRecording) {
      this.mediaRecorder.stop();
    }
  };

  /**
   * Split voice chunk
   *
   * onFileCreated will be called when the chunk is ready
   */
  public splitVoiceChunk = () => {
    if (this.isRecording) {
      this.mediaRecorder.stop();
      this.mediaRecorder.start();
    }
  };
}
