import React, { useMemo } from 'react';
import { useTrawApp } from 'hooks';
import { TrawSnapshot } from 'types';
import BlockItem from 'components/Panel/BlockItem';

export interface BlockListProps {
  handlePlayClick: () => void;
}

export default function BlockList({ handlePlayClick }: BlockListProps) {
  const app = useTrawApp();
  const blocks = app.useStore((state: TrawSnapshot) => state.blocks);

  const sortedBlocks = useMemo(() => {
    return Object.values(blocks).sort((a, b) => a.time - b.time);
  }, [blocks]);

  return (
    <div className="mt-4 flex-2 flex-auto w-full overflow-y-auto min-h-0 px-2">
      <ul className="flex flex-col gap-4">
        {sortedBlocks.map((block) => (
          <BlockItem
            key={block.id}
            userName={'example user'}
            date={block.time}
            blockText={block.text}
            isVoiceBlock={block.voices.length > 0}
            handlePlayClick={handlePlayClick}
          />
        ))}
      </ul>
    </div>
  );
}
