import { UnsupportedBrowserException } from 'errors/UnsupportedBrowserException';

export type VoiceRecorderMimeType = 'audio/webm' | 'audio/mp4';

export type onFileCreatedHandler = (file: File, ext: string) => void;

export interface TrawVoiceRecorderOptions {
  audioBitsPerSecond?: number;
  mediaStream?: MediaStream;
  onFileCreated?: onFileCreatedHandler;
}

export class TrawVoiceRecorder {
  public readonly audioBitsPerSecond: number;

  public readonly mimeType: VoiceRecorderMimeType;

  private _mediaStream?: MediaStream;

  private _mediaRecorder?: MediaRecorder;

  /**
   * Callback function when a voice file is created
   */
  public onFileCreated?: (file: File, ext: string) => void;

  constructor({ mediaStream, audioBitsPerSecond = 44100, onFileCreated }: TrawVoiceRecorderOptions) {
    this.audioBitsPerSecond = audioBitsPerSecond;

    const mimeType = TrawVoiceRecorder.getSupportedMimeType();
    if (!mimeType || !TrawVoiceRecorder.isSupported()) {
      throw new UnsupportedBrowserException(
        `MediaRecorder does not support any of the following MIME types: 'audio/webm', 'audio/mp4'`,
      );
    }
    this.mimeType = mimeType;

    this._mediaStream = mediaStream;

    this.initMediaRecorder();

    this.onFileCreated = onFileCreated;
  }

  public static isSupported = (): boolean => {
    return !!TrawVoiceRecorder.getSupportedMimeType();
  };

  /**
   * When the media stream is changed, reinitialize the media recorder
   * @param mediaStream
   */
  public updateMediaStream = (mediaStream: MediaStream | undefined): void => {
    if (this._mediaStream !== mediaStream) {
      this._mediaStream = mediaStream;
      this.initMediaRecorder();
    }
  };

  /**
   * Check if it's ready to start recording
   */
  public get isReady(): boolean {
    return this._mediaRecorder?.state === 'inactive';
  }

  /**
   * Check if it's recording
   */
  public get isRecording(): boolean {
    return this._mediaRecorder?.state === 'recording';
  }

  /**
   * Start voice recorder
   */
  public startVoiceRecorder = () => {
    if (!this.isRecording) {
      this._mediaRecorder?.start();
    }
  };

  /**
   * Stop voice recorder
   */
  public stopVoiceRecorder = () => {
    if (this.isRecording) {
      this._mediaRecorder?.stop();
    }
  };

  /**
   * Split voice chunk
   *
   * onFileCreated will be called when the chunk is ready
   */
  public splitVoiceChunk = () => {
    if (this.isRecording) {
      this._mediaRecorder?.stop();
      this._mediaRecorder?.start();
    }
  };

  private static getSupportedMimeType = (): VoiceRecorderMimeType | undefined => {
    if (MediaRecorder.isTypeSupported('audio/webm')) {
      return 'audio/webm';
    } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
      return 'audio/mp4';
    }
    return undefined;
  };

  private onDataAvailable = (e: BlobEvent) => {
    e.data.arrayBuffer().then((arrayBuffer) => {
      const blob = new Blob([arrayBuffer], { type: this.mimeType });
      const ext = this.mimeType.split('/')[1];
      const fileObj = new File([blob], `voice.${ext}`, { type: this.mimeType });
      this.onFileCreated?.(fileObj, ext);
    });
  };

  /**
   * Initialize media recorder
   * @private
   */
  private initMediaRecorder = () => {
    // Stop previous mediaRecorder
    if (this._mediaRecorder) {
      if (this._mediaRecorder.state !== 'inactive') {
        this._mediaRecorder.stop();
      }
      this._mediaRecorder.ondataavailable = null;
      this._mediaRecorder = undefined;
    }

    if (this._mediaStream) {
      // Init new mediaRecorder
      const mediaRecorder = new MediaRecorder(this._mediaStream, {
        audioBitsPerSecond: this.audioBitsPerSecond,
        mimeType: this.mimeType,
      });
      mediaRecorder.ondataavailable = this.onDataAvailable;
      this._mediaRecorder = mediaRecorder;
    }
  };
}
