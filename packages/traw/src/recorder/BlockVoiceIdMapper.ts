import { nanoid } from 'nanoid';

export class BlockVoiceIdMapper {
  private blockVoiceIdMap: Map<string, string> = new Map();

  public getVoiceId(blockId: string): string {
    const voiceId = this.blockVoiceIdMap.get(blockId);
    if (voiceId) {
      return voiceId;
    } else {
      const newVoiceId = nanoid();
      this.blockVoiceIdMap.set(blockId, newVoiceId);
      return newVoiceId;
    }
  }
}
