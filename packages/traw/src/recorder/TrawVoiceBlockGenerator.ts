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

  /*
   * Text of the block being created. Reset to empty after creating a block.
   * @private
   */
  private _recognitions: SpeechRecognitionResult[];

  /*
   * Public callbacks
   */
  public onCreatingBlockUpdated?: onCreatingBlockUpdatedHandler;
  public onBlockCreated?: onBlockCreatedHandler;
  public onBlockVoiceCreated?: onVoiceCreatedHandler;

  constructor({ onCreatingBlockUpdated, onBlockCreated, onVoiceCreated }: TrawVoiceBlockGeneratorOptions) {
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

  public readonly onStartTalking = () => {
    if (this._speakingStartedAt === 0) {
      this._speakingStartedAt = Date.now();
    }
  };

  public readonly createBlock = () => {
    const blockId = nanoid();
    const time = this._speakingStartedAt;
    const text = this._recognitions
      .map((r) => r.text.trim())
      .join(' ')
      .trim();
    const voiceStart = Math.max(this._speakingStartedAt - this._blockStartedAt, 0);
    const voiceEnd = Date.now() - this._blockStartedAt;

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
  };

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
