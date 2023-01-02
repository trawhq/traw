import { useTrawApp } from 'hooks';
import React, { ReactNode } from 'react';
import { styled } from 'stitches.config';
import { PlayModeType } from 'types';
const Wrapper = styled('div', {
  variants: {
    playMode: {
      isPlay: {
        '& .tl-layer': {
          transition: 'all 0.5s ease-out',
        },
      },
      isNotPlay: {
        '& .tl-layer': {
          transition: 'none',
        },
      },
    },
  },
});

const AnimationFactory = ({ children }: { children: ReactNode }) => {
  const trawApp = useTrawApp();
  const { mode } = trawApp.useStore().player;
  const isPlay = mode === PlayModeType.PLAYING;

  return <Wrapper playMode={isPlay ? 'isPlay' : 'isNotPlay'}>{children}</Wrapper>;
};

export default AnimationFactory;
