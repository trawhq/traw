import React, { ReactNode } from 'react';

import { styled } from 'stitches.config';
import { breakpoints } from 'utils/breakpoints';

export interface TopPanelProps {
  Room: ReactNode;
}

export const TopPanel = React.memo(function TopPanel({ Room }: TopPanelProps) {
  return (
    <>
      <StyledTopPanelContainer bp={breakpoints}>{Room}</StyledTopPanelContainer>
    </>
  );
});

const StyledTopPanelContainer = styled('div', {
  position: 'absolute',
  top: 10,
  right: 16,
  marginLeft: 16,
  minHeight: 0,
  width: 'auto',
  height: 50,
  gap: '3px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 200,
  overflow: 'hidden',
  borderRadius: 15,
  transition: 'all 0.15s  cubic-bezier(0.4, 0, 0.2, 1)',
  fontSize: 13,
  backgroundColor: '#FFF',
  paddingLeft: 10,
  paddingRight: 10,
  boxShadow: '0px 10px 30px rgba(189, 188, 249, 0.3)',

  '& > div > *': {
    pointerEvents: 'all',
  },
  variants: {
    bp: {
      mobile: {},
      small: {},
      medium: {},
      large: {},
    },
  },
});
