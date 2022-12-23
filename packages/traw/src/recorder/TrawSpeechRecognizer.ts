import { UnsupportedBrowserException } from 'errors/UnsupportedBrowserException';

export type SpeechRecognitionResult = {
  instance: number;
  index: number;
  text: string;
};

export type onRecognizedHandler = (action: 'add' | 'update', result: SpeechRecognitionResult) => void;

const SpeechRecognition = self.SpeechRecognition || self.webkitSpeechRecognition;

export interface TrawSpeechRecognizerOptions {
  lang?: string;
  onRecognized?: onRecognizedHandler;
}

export class TrawSpeechRecognizer {
  private readonly _lang: string;

  /**
   * Speech recognizer
   */
  private _speechRecognition?: SpeechRecognition;

  private _instance: number;
  private _lastIndex: number;
  private _currentSentence: string;

  public onRecognized?: onRecognizedHandler;

  constructor({ lang = 'en-US', onRecognized }: TrawSpeechRecognizerOptions) {
    if (!TrawSpeechRecognizer.isSupported()) {
      throw new UnsupportedBrowserException('SpeechRecognition is not supported');
    }
    this._lang = lang;
    this._instance = 0;
    this._lastIndex = -1;
    this._currentSentence = '';

    this._speechRecognition = this.initSpeechRecognition();

    this.onRecognized = onRecognized;
  }

  public static isSupported() {
    return 'SpeechRecognition' in self || 'webkitSpeechRecognition' in self;
  }

  /**
   * Starts speech recognition
   */
  public startRecognition = () => {
    if (!this._speechRecognition) {
      this._speechRecognition = this.initSpeechRecognition();
    }
    this._speechRecognition.start();
  };

  /**
   * Stops speech recognition
   */
  public stopRecognition() {
    if (this._speechRecognition) {
      this._speechRecognition.removeEventListener('result', this.onResult);
      this._speechRecognition.removeEventListener('end', this.onEnd);
      this._speechRecognition.removeEventListener('error', this.onError);
      this._speechRecognition.stop();
      this._speechRecognition = undefined;
      this._instance += 1;
      this._lastIndex = -1;
    }
  }

  private onResult = (e: SpeechRecognitionEvent) => {
    const currentIndex = e.resultIndex;
    const text = e.results[currentIndex][0].transcript;

    if (this._lastIndex < currentIndex) {
      this._lastIndex = currentIndex;
      this.onRecognized?.('add', {
        instance: this._instance,
        index: currentIndex,
        text,
      });
    } else {
      this.onRecognized?.('update', {
        instance: this._instance,
        index: this._lastIndex,
        text,
      });
    }
  };

  private onError = (e: SpeechRecognitionErrorEvent) => {
    console.error('[TrawSpeechRecognizer] onError', e);
    if (e.error !== 'aborted') {
      this.restartRecognition();
    }
  };

  private onEnd = () => {
    this.startRecognition();
  };

  private initSpeechRecognition = (): SpeechRecognition => {
    const speechRecognition = new SpeechRecognition();
    speechRecognition.lang = this._lang;
    speechRecognition.continuous = true;
    speechRecognition.interimResults = true;
    speechRecognition.maxAlternatives = 1;

    speechRecognition.addEventListener('result', this.onResult);
    speechRecognition.addEventListener('end', this.onEnd);
    speechRecognition.addEventListener('error', this.onError);

    return speechRecognition;
  };

  private restartRecognition() {
    this.stopRecognition();
    this.startRecognition();
  }
}
