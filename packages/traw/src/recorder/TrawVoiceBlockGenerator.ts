import { SpeechRecognitionResult } from 'recorder/index';
import { nanoid } from 'nanoid';

export type onCreatingBlockUpdatedHandler = (text: string) => void;
export type onBlockCreatedHandler = (payload: {
  blockId: string;
  time: number;
  text: string;
  voiceStart: number;
  voiceEnd: number;
}) => void;
export type onVoiceCreatedHandler = (payload: {
  blockId: string;
  voiceId: string;
  ext: string;
  file: File;
}) => Promise<void>;

export interface TrawVoiceBlockGeneratorOptions {
  /**
   * pull voiceStart time by the given value in milliseconds
   * @default 500
   */
  voiceStartAdjustment?: number;

  /**
   * When the voice duration is less than the given value in milliseconds without recognized text, the voice is discarded
   * @default 3500
   */
  emptyBlockThreshold?: number;

  /**
   * Called when a creating block is edited (text is changed)
   */
  onCreatingBlockUpdated?: onCreatingBlockUpdatedHandler;

  /**
   * Called when a block is created
   */
  onBlockCreated?: onBlockCreatedHandler;

  /**
   * Called when a voice file is created
   */
  onVoiceCreated?: onVoiceCreatedHandler;
}

export class TrawVoiceBlockGenerator {
  /**
   * BlockIds queue. Shift when a "BlockVoice" is created.
   * @private
   */
  private _blockIdsQueue: string[];

  /**
   * Timestamp of the current block started regardless of the talking state
   * @private
   */
  private _blockStartedAt: number;

  /**
   * Timestamp of the meaningful block started when the user is talking
   * @private
   */
  private _speakingStartedAt: number;

  /**
   * Text of the block being created. Reset to empty after creating a block.
   * @private
   */
  private _recognitions: SpeechRecognitionResult[];

  /**
   * pull voiceStart time by the given value in milliseconds
   * @private
   */
  private _voiceStartAdjustment: number;

  /**
   * When the voice duration is less than the given value in milliseconds without recognized text, the voice is discarded
   * @private
   */
  private _emptyBlockThreshold: number;

  /*
   * Public callbacks
   */
  public onCreatingBlockUpdated?: onCreatingBlockUpdatedHandler;
  public onBlockCreated?: onBlockCreatedHandler;
  public onBlockVoiceCreated?: onVoiceCreatedHandler;

  constructor({
    voiceStartAdjustment = 500,
    emptyBlockThreshold = 3500,
    onCreatingBlockUpdated,
    onBlockCreated,
    onVoiceCreated,
  }: TrawVoiceBlockGeneratorOptions) {
    this._voiceStartAdjustment = voiceStartAdjustment;
    this._emptyBlockThreshold = emptyBlockThreshold;
    this._blockIdsQueue = [];
    this._blockStartedAt = 0;
    this._speakingStartedAt = 0;
    this._recognitions = [];

    this.onCreatingBlockUpdated = onCreatingBlockUpdated;
    this.onBlockCreated = onBlockCreated;
    this.onBlockVoiceCreated = onVoiceCreated;
  }

  public readonly onRecognized = (action: 'add' | 'update', result: SpeechRecognitionResult) => {
    if (action === 'add') {
      this._recognitions.push(result);
    } else if (action === 'update') {
      const existing = this._recognitions.find((r) => r.instance === result.instance && r.index === result.index);
      if (existing) {
        existing.text = result.text;
      }
      // Ignore non-existing update results
      // It could happen when the result has arrived after block created.
    }

    const text = this._recognitions
      .map((r) => r.text.trim())
      .join(' ')
      .trim();

    this.onCreatingBlockUpdated?.(text);
  };

  public readonly markBlockStartedAt = () => {
    this._blockStartedAt = Date.now();
  };

  public readonly onStartTalking = () => {
    if (this._speakingStartedAt === 0) {
      this._speakingStartedAt = Date.now();
    }
  };

  /**
   * Create a block
   * @returns {boolean} true if a block is created, false if not
   */
  public readonly createBlock = (): boolean => {
    const now = Date.now();
    const blockId = nanoid();
    const time = this._speakingStartedAt;
    const text = this._recognitions
      .map((r) => r.text.trim())
      .join(' ')
      .trim();

    const voiceStart = Math.max(this._speakingStartedAt - this._blockStartedAt - this._voiceStartAdjustment, 0);
    const voiceEnd = now - this._blockStartedAt;
    const duration = voiceEnd - voiceStart;

    if (duration < this._emptyBlockThreshold && text.length === 0) {
      // Discard empty & short block
      this._speakingStartedAt = 0;
      return false;
    }

    this.onBlockCreated?.({
      blockId,
      time,
      text,
      voiceStart,
      voiceEnd,
    });

    // Update state
    this._blockIdsQueue.push(blockId);
    this._blockStartedAt = Date.now();
    this._speakingStartedAt = 0;
    this._recognitions = [];

    this.onCreatingBlockUpdated?.('');
    return true;
  };

  /**
   * Attach a voice file to the last block
   * @param file
   * @param ext
   */
  public readonly createBlockVoice = (file: File, ext: string) => {
    const blockId = this._blockIdsQueue.shift();
    if (!blockId) {
      console.error('[TrawVoiceBlockGenerator] There is no blockId in the queue');
      return;
    }

    this.onBlockVoiceCreated?.({
      blockId,
      voiceId: nanoid(),
      ext,
      file: file,
    });
  };
}
