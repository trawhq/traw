import { Tooltip } from 'components/Primitives/Tooltip';
import { TrawIconButton } from 'components/Primitives/TrawButton/TrawButton';
import { useTrawApp } from 'hooks';
import SvgPause from 'icons/pause';
import SvgPlayArrow from 'icons/play-arrow';
import React from 'react';
import { PlayModeType } from 'types';

const PlayController = () => {
  const app = useTrawApp();

  const mode = app.useStore((state) => state.player.mode);

  const { isDone } = app.useStore((state) => state.player);

  const isPlaying = mode === PlayModeType.PLAYING;

  const handlePlay = () => {
    if (isDone) {
      app.playFromFirstBlock();
    } else if (isPlaying) {
      app.pause();
    } else {
      app.resume();
    }
  };

  return (
    <div className="w-5 h-5">
      {isDone ? (
        <Tooltip label="play">
          <TrawIconButton variant="primary" onClick={handlePlay}>
            <SvgPlayArrow className="fill-current w-full-h-full" />
          </TrawIconButton>
        </Tooltip>
      ) : mode === PlayModeType.PLAYING ? (
        <Tooltip label="pause">
          <TrawIconButton variant="secondary" onClick={handlePlay}>
            <SvgPause className="fill-current w-full-h-full" />
          </TrawIconButton>
        </Tooltip>
      ) : (
        <Tooltip label="play">
          <TrawIconButton variant="primary" onClick={handlePlay}>
            <SvgPlayArrow className="fill-current w-full-h-full" />
          </TrawIconButton>
        </Tooltip>
      )}
    </div>
  );
};

export default PlayController;
