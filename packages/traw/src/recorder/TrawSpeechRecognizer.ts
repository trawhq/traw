import { UnsupportedBrowserException } from 'errors/UnsupportedBrowserException';

export type SpeechRecognitionResult = {
  instance: number;
  index: number;
  text: string;
};

export type onRecognitionHandler = (result: SpeechRecognitionResult) => void;

const SpeechRecognition = self.SpeechRecognition || self.webkitSpeechRecognition;

export interface TrawSpeechRecognizerOption {
  lang?: string;
  onNew?: onRecognitionHandler;
  onUpdate?: onRecognitionHandler;
}

export class TrawSpeechRecognizer {
  private lang: string;

  /**
   * Speech recognizer
   */
  private speechRecognition?: SpeechRecognition;

  private instance: number;
  private lastIndex: number;
  private currentSentence: string;

  public onNew?: onRecognitionHandler;
  public onUpdate?: onRecognitionHandler;

  constructor({ lang = 'en-US', onNew, onUpdate }: TrawSpeechRecognizerOption) {
    if (!TrawSpeechRecognizer.isSupported()) {
      throw new UnsupportedBrowserException('SpeechRecognition is not supported');
    }
    this.lang = lang;
    this.instance = 0;
    this.lastIndex = 0;
    this.currentSentence = '';

    this.speechRecognition = this.initSpeechRecognition();

    this.onNew = onNew;
    this.onUpdate = onUpdate;
  }

  public static isSupported() {
    return 'SpeechRecognition' in self || 'webkitSpeechRecognition' in self;
  }

  private onResult = (event: SpeechRecognitionEvent) => {
    const currentIndex = event.resultIndex;
    const text = event.results[currentIndex][0].transcript;

    if (this.lastIndex < currentIndex) {
      this.lastIndex = currentIndex;
      this.onNew?.({
        instance: this.instance,
        index: currentIndex,
        text,
      });
    } else {
      this.onUpdate?.({
        instance: this.instance,
        index: this.lastIndex,
        text,
      });
    }
  };

  private onError = () => {
    if (this.speechRecognition) {
      this.restartRecognition();
    }
  };

  private onEnd = () => {
    this.instance += 1;
    this.lastIndex = -1;
    this.restartRecognition();
  };

  private initSpeechRecognition = (): SpeechRecognition => {
    const speechRecognition = new SpeechRecognition();
    speechRecognition.lang = this.lang;
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

  public startRecognition = () => {
    if (this.speechRecognition) {
      this.speechRecognition.start();
    } else {
      this.speechRecognition = this.initSpeechRecognition();
      this.speechRecognition.start();
    }
  };

  public stopRecognition() {
    if (this.speechRecognition) {
      this.speechRecognition.stop();
      this.speechRecognition.removeEventListener('result', this.onResult);
      this.speechRecognition.removeEventListener('end', this.onEnd);
      this.speechRecognition.removeEventListener('error', this.onError);
      this.speechRecognition = undefined;
    }
  }
}
