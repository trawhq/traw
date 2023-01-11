import { useTrawApp } from 'hooks';
import React, { useMemo } from 'react';
import { styled } from 'stitches.config';
import { breakpoints } from 'utils/breakpoints';

const Subtitle = () => {
  const app = useTrawApp();

  const panelOpen = app.useStore((state) => state.editor.isPanelOpen);

  const { targetBlockId } = app.useStore((state) => state.player);

  const blocks = app.useStore((state) => state.blocks);

  const sortedBlocks = useMemo(() => Object.values(blocks).sort((a, b) => a.time - b.time), [blocks]);

  const block = sortedBlocks.find((block) => block.id === targetBlockId);
  if (!block || !block.text) return null;

  return (
    <StyledContainer bp={breakpoints} panelOpen={panelOpen}>
      <SubtitleContainer bp={breakpoints}>{block.text}</SubtitleContainer>
    </StyledContainer>
  );
};

export default Subtitle;

const StyledContainer = styled('div', {
  display: 'flex',
  flex: '0 0 auto',
  position: 'absolute',
  justifyContent: 'center',
  zIndex: 200,
  left: 0,
  right: 0,
  bottom: 58,
  pointerEvents: 'none',
  userSelect: 'none',
  variants: {
    bp: {
      medium: {
        bottom: 74,
      },
    },
    panelOpen: {
      true: {
        paddingRight: 0,
      },
      false: {
        paddingRight: 0,
      },
    },
  },
  compoundVariants: [
    {
      panelOpen: 'true',
      bp: 'medium',
      css: {
        paddingRight: '285px',
      },
    },
    {
      panelOpen: 'false',
      bp: 'medium',
      css: {
        paddingRight: '0px',
      },
    },
  ],
});

const SubtitleContainer = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'rgba(91, 95, 128, 0.6)',
  maxWidth: '85%',
  lineBreak: 'anywhere',
  color: 'white',
  lineHeight: '23px',
  borderRadius: '8px',

  fontSize: '14px',
  padding: '4px 8px',

  variants: {
    bp: {
      medium: {
        fontSize: '20px',
        padding: '12px 22px',
      },
    },
  },
});
