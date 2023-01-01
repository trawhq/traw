import { PauseIcon, PlayIcon } from '@radix-ui/react-icons';
import { styled } from '@stitches/react';
import { useTrawApp } from 'hooks';
import React, { useCallback, useMemo } from 'react';
import { PlayModeType, TRBlock } from 'types';

const Player = () => {
  const app = useTrawApp();
  const mode = app.useStore((state) => state.player.mode);
  const { targetBlockId, end, start, totalTime } = app.useStore((state) => state.player);
  const blocks = app.useStore((state) => state.blocks);

  const isPlaying = mode === PlayModeType.PLAYING;
  const initialProgress = (Date.now() - start) / (end - start);
  const duration = end - start;

  const sortedBlocks = useMemo(() => Object.values(blocks).sort((a, b) => a.time - b.time), [blocks]);

  const getBlockDuration = useCallback(
    (block: TRBlock): number => {
      const voice = app.getPlayableVoice(block);
      if (voice) {
        return block.voiceEnd - block.voiceStart;
      } else return 500;
    },
    [app],
  );
  const currentBaseTime = useMemo(() => {
    let currentBaseTime = 0;
    if (targetBlockId) {
      const targetBlockIndex = sortedBlocks.findIndex((block) => block.id === targetBlockId);
      if (targetBlockIndex >= 0) {
        currentBaseTime = sortedBlocks
          .slice(0, targetBlockIndex)
          .map((block) => getBlockDuration(block))
          .reduce((a, b) => a + b, 0);
      }
    }
    return currentBaseTime;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetBlockId, sortedBlocks, getBlockDuration, isPlaying]);

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const progress = x / width;
    let currentTime = 0;
    let targetBlock = '';
    sortedBlocks.forEach((block) => {
      const blockDuration = getBlockDuration(block);
      if (currentTime + blockDuration > progress * totalTime && !targetBlock) {
        targetBlock = block.id;
        return;
      }
      currentTime += blockDuration;
    });
    if (targetBlock) app.playBlock(targetBlock);
  };

  const handlePlay = () => {
    if (isPlaying) {
      app.pause();
    } else {
      app.resume();
    }
  };

  return (
    <div className="w-full pb-[27px] flex flex-row px-8 gap-2.5">
      <button className="hover:bg-traw-grey-50 self-center rounded-full p-1.5" onClick={handlePlay}>
        {mode === PlayModeType.PLAYING ? <PauseIcon /> : <PlayIcon />}
      </button>
      <div
        className="relative cursor-pointer flex-1 overflow-hidden bg-white rounded-full h-[9px] translate-z-0 self-center"
        onClick={handleClick}
      >
        <div
          className="bg-traw-purple"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${(currentBaseTime / totalTime) * 100}%`,
            height: '9px',
            borderTopLeftRadius: '10px',
            borderBottomLeftRadius: '10px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: `${(currentBaseTime / totalTime) * 100}%`,
            height: '100%',
            width: `${((end - start) / totalTime) * 100}%`,
          }}
        >
          {!!duration && <BlockProgress isAnimating={isPlaying} initial={initialProgress} duration={duration} />}
        </div>
      </div>
    </div>
  );
};

export type BlockProgressProps = {
  isAnimating: boolean;
  initial: number;
  duration?: number;
};

const BlockProgress = ({ isAnimating, initial, duration = 0 }: BlockProgressProps) => {
  const playSpeed = 1;
  let animate = {};
  if (isAnimating) {
    animate = {
      animationName: 'slideProgress',
      animationDuration: `${(duration / 1000 / playSpeed) * (1 - initial)}s`,
      animationFillMode: 'forwards',
      animationTimingFunction: 'linear',
    };
  }

  return (
    <TalkIndicator
      key={Math.random()}
      className="bg-traw-purple"
      style={{
        ...animate,
        width: `calc(${Math.min(100, initial * 100)}%)`,
      }}
    />
  );
};

const TalkIndicator = styled('div', {
  position: 'absolute',
  left: 0,
  top: 0,
  width: '0%',
  height: '9px',
  borderTopRightRadius: '10px',
  borderBottomRightRadius: '10px',
});

export default Player;
