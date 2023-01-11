import { useTrawApp } from 'hooks';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { styled } from 'stitches.config';
import { PlayModeType, TRBlock } from 'types';
import { getFormattedTime } from 'utils/getFormattedTime';
import PlayController from './PlayController';
import Seekbar from './Seekbar';

const Player = () => {
  const app = useTrawApp();
  const mode = app.useStore((state) => state.player.mode);
  const { targetBlockId, totalTime } = app.useStore((state) => state.player);

  const isPlaying = mode === PlayModeType.PLAYING;

  const [currentTime, setCurrentTime] = useState(0);

  const timerRef = useRef<any>();

  const blocks = app.useStore((state) => state.blocks);

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

  useEffect(() => {
    if (mode === PlayModeType.PLAYING && targetBlockId) {
      timerRef.current = setInterval(() => {
        setCurrentTime((currentTime) => currentTime + 100);
      }, 100);
    } else {
      setCurrentTime(0);
    }
    return () => {
      clearInterval(timerRef.current);
    };
  }, [mode, targetBlockId]);

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

  return (
    <div className="w-full pb-[27px] flex flex-row px-8 ">
      <PlayController />

      <Spacer />

      <div className="text-traw-grey-dark text-sm">
        {getFormattedTime(currentBaseTime + currentTime)} / {getFormattedTime(totalTime)}
      </div>

      <Spacer />

      <Seekbar
        blocks={sortedBlocks}
        isPlaying={isPlaying}
        currentBaseTime={currentBaseTime}
        getBlockDuration={getBlockDuration}
      />
    </div>
  );
};

export default Player;

const Spacer = styled('div', {
  flex: '0 0 10px',
});
