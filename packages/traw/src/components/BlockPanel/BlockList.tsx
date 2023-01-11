import BlockItem from 'components/BlockPanel/BlockItem';
import { useTrawApp } from 'hooks';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { PlayModeType, TrawSnapshot } from 'types';
import { useEventListener, useIsomorphicLayoutEffect } from 'usehooks-ts';
import EmptyBlockPanel from './EmptyBlockPanel';
import ScrollToBottomButton from './ScrollToBottomButton';
export interface BlockListProps {
  handlePlayClick: (blockId: string) => void;
  isRecording: boolean;
  EmptyVoiceNote?: React.ReactNode;
}

export default function BlockList({ handlePlayClick, isRecording, EmptyVoiceNote }: BlockListProps) {
  const app = useTrawApp();
  const blocks = app.useStore((state: TrawSnapshot) => state.blocks);

  const mode = app.useStore((state: TrawSnapshot) => state.player.mode);
  const targetBlockId = app.useStore((state: TrawSnapshot) =>
    state.player.mode === PlayModeType.PLAYING ? state.player.targetBlockId : undefined,
  );

  const virtuosoRef = useRef(null);
  const domRef = useRef<HTMLDivElement>(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const [needToScroll, setNeedToScroll] = useState(false);

  const [height, setHeight] = useState(0);

  const sortedBlocks = useMemo(() => {
    return Object.values(blocks)
      .filter((block) => block.isActive)
      .sort((a, b) => a.time - b.time);
  }, [blocks]);

  const handleResize = useCallback(() => {
    const height = domRef.current?.offsetHeight || 0;

    setHeight(height);
  }, []);

  useEventListener('resize', handleResize);

  useIsomorphicLayoutEffect(() => {
    handleResize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domRef.current]);

  const scrollTo = useCallback((index: number) => {
    if (virtuosoRef.current) {
      setTimeout(() => {
        (virtuosoRef.current as any).scrollToIndex({ index, align: 'center', behavior: 'smooth' });
        setNeedToScroll(false);
        setIsScrolled(false);
      }, 100);
    }
  }, []);

  useEffect(() => {
    if (isScrolled) {
      setNeedToScroll(true);
    } else {
      scrollTo(sortedBlocks.length - 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedBlocks.length]);

  const handleAtBottomStateChange = (atBottom: boolean) => {
    if (atBottom) {
      setIsScrolled(false);
    } else {
      setIsScrolled(true);
    }
  };

  /**
   * Scroll to target block when playing
   */
  useEffect(() => {
    if (mode === PlayModeType.PLAYING && targetBlockId) {
      const index = sortedBlocks.findIndex((block) => block.id === targetBlockId);
      if (index !== -1) {
        scrollTo(index);
      }
    }
  }, [sortedBlocks, mode, scrollTo, targetBlockId]);

  if (sortedBlocks.length === 0 && !isRecording) {
    return <EmptyBlockPanel EmptyVoiceNote={EmptyVoiceNote} />;
  }

  const Footer = () => {
    return <div className="h-[15px]"></div>;
  };

  return (
    <div className="mt-2 md:mt-4 flex-2 flex-auto w-full overflow-y-auto min-h-0 pl-0 md:pl-2 relative" ref={domRef}>
      <Virtuoso
        data={sortedBlocks}
        style={{ height: `${height}px`, minHeight: '100%' }}
        totalCount={sortedBlocks.length}
        atBottomStateChange={handleAtBottomStateChange}
        overscan={5}
        ref={virtuosoRef}
        components={{ Footer }}
        itemContent={(index, block) => {
          return (
            <>
              <BlockItem
                key={block.id}
                userId={block.userId}
                date={block.time}
                blockId={block.id}
                blockText={block.text}
                isPlaying={targetBlockId === block.id}
                isVoiceBlock={block.voices.length > 0}
                handlePlayClick={handlePlayClick}
                beforeBlockUserId={sortedBlocks[index - 1]?.userId}
              />
            </>
          );
        }}
      />
      {!!sortedBlocks.length && needToScroll && isScrolled && (
        <ScrollToBottomButton handleClick={() => scrollTo(sortedBlocks.length - 1)} />
      )}
    </div>
  );
}
