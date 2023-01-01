import BlockItem from 'components/BlockPanel/BlockItem';
import { useTrawApp } from 'hooks';
import React, { useMemo } from 'react';
import { PlayModeType, TrawSnapshot } from 'types';
import EmptyBlockPanel from './EmptyBlockPanel';
export interface BlockListProps {
  handlePlayClick: (blockId: string) => void;
  onClickStartRecording: () => void;
  isRecording: boolean;
}

export default function BlockList({ handlePlayClick, onClickStartRecording, isRecording }: BlockListProps) {
  const app = useTrawApp();
  const blocks = app.useStore((state: TrawSnapshot) => state.blocks);
  const document = app.useStore((state: TrawSnapshot) => state.document);
  const targetBlockId = app.useStore((state: TrawSnapshot) =>
    state.player.mode === PlayModeType.PLAYING ? state.player.targetBlockId : undefined,
  );

  const sortedBlocks = useMemo(() => {
    return Object.values(blocks).sort((a, b) => a.time - b.time);
  }, [blocks]);

  if (sortedBlocks.length === 0 && !isRecording) {
    return <EmptyBlockPanel onClickStartRecording={onClickStartRecording} documentId={document.id} />;
  }

  let prevUserId = '';

  return (
    <div className="mt-4 flex-2 flex-auto w-full overflow-y-auto min-h-0 px-2">
      <ul className="flex flex-col gap-1">
        {sortedBlocks.map((block) => {
          const isUserContinue = prevUserId === block.userId;
          prevUserId = block.userId;
          return (
            <BlockItem
              key={block.id}
              hideUserName={isUserContinue}
              userName={'example user'}
              date={block.time}
              blockId={block.id}
              blockText={block.text}
              isPlaying={targetBlockId === block.id}
              isVoiceBlock={block.voices.length > 0}
              handlePlayClick={handlePlayClick}
            />
          );
        })}
      </ul>
    </div>
  );
}
