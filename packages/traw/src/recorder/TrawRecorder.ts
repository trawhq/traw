import { onFileCreatedHandler, TrawVoiceRecorder } from 'recorder/TrawVoiceRecorder';
import { onRecognizedHandler, TrawSpeechRecognizer } from 'recorder/TrawSpeechRecognizer';
import { onTalkingHandler, TrawTalkingDetector } from 'recorder/TrawTalkingDetector';
import { MediaStreamManager } from 'recorder/MediaStreamManager';
import { BlockVoiceIdMapper } from 'recorder/BlockVoiceIdMapper';

export interface TrawRecorderOptions {
  audioDeviceId?: string;
  /**
   * @default 44100
   */
  audioBitsPerSecond?: number;

  lang?: string;

  audioContext?: AudioContext;

  onFileCreated?: onFileCreatedHandler;
  onRecognized?: onRecognizedHandler;
  onTalking?: onTalkingHandler;
}

export class TrawRecorder {
  private _audioContext: AudioContext;

  private _mediaStreamManager: MediaStreamManager;

  private _trawVoiceRecorder: TrawVoiceRecorder;

  private _trawTalkingDetector: TrawTalkingDetector;

  private _trawSpeechRecognizer: TrawSpeechRecognizer;

  private _blockVoiceIdMapper: BlockVoiceIdMapper;

  constructor({
    audioDeviceId,
    audioBitsPerSecond,
    lang,
    audioContext,
    onFileCreated,
    onRecognized,
    onTalking,
  }: TrawRecorderOptions) {
    this._audioContext = audioContext ?? new AudioContext();
    this._mediaStreamManager = new MediaStreamManager({ audioDeviceId, onChangeMediaStream: this.onChangeMediaStream });
    this._trawVoiceRecorder = new TrawVoiceRecorder({
      audioBitsPerSecond,
      onFileCreated,
    });
    this._trawTalkingDetector = new TrawTalkingDetector({
      audioContext: this._audioContext,
      onTalking,
      onSilence: this.onSilence,
    });
    this._trawSpeechRecognizer = new TrawSpeechRecognizer({
      lang,
      onRecognized,
    });
    this._blockVoiceIdMapper = new BlockVoiceIdMapper();
  }

  public static isSupported(): boolean {
    return TrawVoiceRecorder.isSupported() && TrawSpeechRecognizer.isSupported() && MediaStreamManager.isSupported();
  }

  public get isMuted(): boolean {
    return this._mediaStreamManager.isMuted;
  }

  public startRecording = async (): Promise<void> => {
    await this._mediaStreamManager.startMediaStream();
    this._trawSpeechRecognizer.startRecognition();
    this._trawVoiceRecorder.startVoiceRecorder();
  };

  public stopRecording = (): void => {
    this._trawVoiceRecorder.stopVoiceRecorder();
    this._trawSpeechRecognizer.stopRecognition();
    this._mediaStreamManager.stopMediaStream();
  };

  public mute = (): void => {
    this._mediaStreamManager.muteMediaStream();
    this._trawSpeechRecognizer.stopRecognition();
  };

  public unmute = (): void => {
    this._mediaStreamManager.unmuteMediaStream();
    this._trawSpeechRecognizer.startRecognition();
  };

  private onChangeMediaStream = (mediaStream?: MediaStream) => {
    this._trawVoiceRecorder.updateMediaStream(mediaStream);
    this._trawTalkingDetector.updateMediaStream(mediaStream);
  };

  private onSilence = () => {
    this._trawVoiceRecorder.splitVoiceChunk();
  };
}
