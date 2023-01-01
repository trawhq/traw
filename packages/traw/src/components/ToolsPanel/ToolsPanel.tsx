import { styled } from 'stitches.config';

import { TDSnapshot } from '@tldraw/tldraw';
import { useTldrawApp } from 'hooks/useTldrawApp';
import * as React from 'react';
import { breakpoints } from 'utils/breakpoints';
import { PrimaryTools } from './PrimaryTools';
import { StatusBar } from './StatusBar';
import { StyleMenu } from './StyleMenu';
import { useTrawApp } from 'hooks';

const isDebugModeSelector = (s: TDSnapshot) => s.settings.isDebugMode;
const dockPositionState = (s: TDSnapshot) => s.settings.dockPosition;

interface ToolsPanelProps {
  onBlur?: React.FocusEventHandler;
}

export const ToolsPanel = React.memo(function ToolsPanel({ onBlur }: ToolsPanelProps) {
  const app = useTldrawApp();
  const trawApp = useTrawApp();
  const panelOpen = trawApp.useStore((state) => state.editor.isPanelOpen);
  const side = app.useStore(dockPositionState);
  const isDebugMode = app.useStore(isDebugModeSelector);

  return (
    <>
      <StyledToolsPanelContainer panelOpen={panelOpen} side={side} onBlur={onBlur} bp={breakpoints} debug={isDebugMode}>
        <StyledCenterWrap id="TD-Tools">
          <StyledPrimaryTools orientation={side === 'bottom' || side === 'top' ? 'horizontal' : 'vertical'}>
            <PrimaryTools />
            <StyleMenu />
          </StyledPrimaryTools>
        </StyledCenterWrap>
      </StyledToolsPanelContainer>
      {isDebugMode && (
        <StyledStatusWrap>
          <StatusBar />
        </StyledStatusWrap>
      )}
    </>
  );
});

const StyledToolsPanelContainer = styled('div', {
  position: 'absolute',
  width: '100%',
  minWidth: 0,
  maxWidth: '100%',
  height: 64,
  gap: '$4',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 200,
  overflow: 'hidden',
  pointerEvents: 'none',
  '& > div > *': {
    pointerEvents: 'all',
  },
  variants: {
    debug: {
      true: {},
      false: {},
    },
    bp: {
      mobile: {},
      small: {},
      medium: {},
      large: {},
    },
    side: {
      top: {
        width: '100%',
        height: 64,
        left: 0,
        right: 0,
        top: 45,
      },
      right: { width: 64, height: '100%', top: 0, right: 0 },
      bottom: {
        width: '100%',
        left: 0,
        right: 0,
        bottom: 4,
      },
      left: { width: 64, height: '100%', left: 0 },
    },
    panelOpen: {
      true: {
        paddingRight: '285px',
      },
      false: {
        paddingRight: '0px',
      },
    },
  },
  compoundVariants: [
    {
      side: 'top',
      bp: 'large',
      css: {
        top: 0,
      },
    },
    {
      side: 'bottom',
      debug: true,
      css: {
        bottom: 44,
      },
    },
  ],
});

const StyledCenterWrap = styled('div', {
  display: 'flex',
  width: 'fit-content',
  height: 'fit-content',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  gap: '$4',
});

const StyledStatusWrap = styled('div', {
  position: 'absolute',
  bottom: '0px',
  left: '0px',
  right: '0px',
  height: '40px',
  width: '100%',
  maxWidth: '100%',
});

const StyledPrimaryTools = styled('div', {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  height: 'fit-content',
  gap: '$3',
  variants: {
    orientation: {
      horizontal: {
        flexDirection: 'row',
      },
      vertical: {
        flexDirection: 'column',
      },
    },
  },
});
