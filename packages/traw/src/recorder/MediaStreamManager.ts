import { UnsupportedBrowserException } from 'errors/UnsupportedBrowserException';

export type onChangeMediaStreamHandler = (mediaStream: MediaStream | undefined) => void;

export interface MediaStreamManagerOptions {
  audioDeviceId?: string;

  onChangeMediaStream?: onChangeMediaStreamHandler;
}

export class MediaStreamManager {
  private _audioDeviceId?: string;

  private _mediaStream?: MediaStream;

  private _isMuted: boolean;

  public onChangeMediaStream?: onChangeMediaStreamHandler;

  constructor({ audioDeviceId, onChangeMediaStream }: MediaStreamManagerOptions) {
    if (!MediaStreamManager.isSupported()) {
      throw new UnsupportedBrowserException('MediaStreamManager is not supported in this browser');
    }

    this._isMuted = false;
    this._audioDeviceId = audioDeviceId;
    this.onChangeMediaStream = onChangeMediaStream;
  }

  public static isSupported() {
    return !!navigator.mediaDevices?.getUserMedia;
  }

  public get isMuted(): boolean {
    return this._isMuted;
  }

  public startMediaStream = async (): Promise<MediaStream> => {
    if (this._mediaStream) {
      return this._mediaStream;
    } else {
      const constraints = this.getUserMediaConstraints();
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      this._mediaStream = mediaStream;
      this.onChangeMediaStream?.(mediaStream);
      return this._mediaStream;
    }
  };

  public stopMediaStream = () => {
    this._mediaStream?.getTracks().forEach((track) => {
      track.stop();
    });
    this._mediaStream = undefined;
    this.onChangeMediaStream?.(undefined);
  };

  public muteMediaStream = () => {
    this._isMuted = true;
    this._mediaStream?.getAudioTracks().forEach((track) => (track.enabled = false));
  };

  public unmuteMediaStream = () => {
    this._isMuted = false;
    this._mediaStream?.getAudioTracks().forEach((track) => (track.enabled = true));
  };

  private getUserMediaConstraints = (): MediaStreamConstraints => {
    return this._audioDeviceId ? { audio: { deviceId: this._audioDeviceId } } : { audio: true };
  };
}
