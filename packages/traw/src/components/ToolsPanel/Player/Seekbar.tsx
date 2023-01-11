import { styled } from '@stitches/react';
import { useTrawApp } from 'hooks';
import React from 'react';
import { TRBlock } from 'types';

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

interface SeekbarProps {
  blocks: TRBlock[];
  currentBaseTime: number;
  isPlaying: boolean;
  getBlockDuration: (block: TRBlock) => number;
}

const Seekbar = ({ blocks, currentBaseTime, isPlaying, getBlockDuration }: SeekbarProps) => {
  const app = useTrawApp();

  const { end, start, totalTime } = app.useStore((state) => state.player);

  const initialProgress = (Date.now() - start) / (end - start);
  const duration = end - start;

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const progress = x / width;
    let currentTime = 0;
    let targetBlock = '';
    blocks.forEach((block) => {
      const blockDuration = getBlockDuration(block);
      if (currentTime + blockDuration > progress * totalTime && !targetBlock) {
        targetBlock = block.id;
        return;
      }
      currentTime += blockDuration;
    });
    if (targetBlock) app.playBlock(targetBlock);
  };

  return (
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
  );
};

export default Seekbar;
