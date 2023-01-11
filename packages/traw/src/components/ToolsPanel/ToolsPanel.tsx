import { styled } from 'stitches.config';

import { TDSnapshot } from '@tldraw/tldraw';
import { useTldrawApp } from 'hooks/useTldrawApp';
import * as React from 'react';
import { breakpoints } from 'utils/breakpoints';
import { PrimaryTools } from './PrimaryTools';
import { StatusBar } from './StatusBar';
import { StyleMenu } from './StyleMenu';
import { useTrawApp } from 'hooks';
import { PlayModeType } from 'types';
import Player from './Player/Player';
import { ActionButton } from './ActionButton';
import useDeviceDetect from 'hooks/useDeviceDetect';
import Subtitle from './Player/Subtitle';

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
  const isEdit = trawApp.useStore((state) => state.player.mode) === PlayModeType.EDIT;
  const { isBrowser } = useDeviceDetect();

  return (
    <>
      <StyledToolsPanelContainer panelOpen={panelOpen} side={side} onBlur={onBlur} bp={breakpoints} debug={isDebugMode}>
        {isEdit ? (
          <StyledAlignWrap id="TD-Tools" bp={breakpoints}>
            <StyledPrimaryTools
              orientation={side === 'bottom' || side === 'top' ? 'horizontal' : 'vertical'}
              bp={breakpoints}
            >
              {isBrowser && <ActionButton />}
              <PrimaryTools />
              {isBrowser && <StyleMenu />}
            </StyledPrimaryTools>
          </StyledAlignWrap>
        ) : (
          <Player />
        )}
      </StyledToolsPanelContainer>

      {!isEdit && <Subtitle />}
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
  height: 'auto',
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
      medium: {
        height: 64,
      },
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
        bottom: 0,
      },
      left: { width: 64, height: '100%', left: 0 },
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
    {
      side: 'top',
      bp: 'large',
      css: {
        top: 0,
      },
    },
    {
      side: 'bottom',
      bp: 'medium',
      debug: true,
      css: {
        bottom: 44,
      },
    },
    {
      side: 'bottom',
      bp: 'large',
      css: {
        bottom: 4,
      },
    },
  ],
});

const StyledAlignWrap = styled('div', {
  display: 'flex',
  flex: 1,
  height: 'fit-content',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  gap: '$4',
  variants: {
    bp: {
      medium: {
        flex: 0,
      },
    },
  },
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
  justifyContent: 'center',
  height: 'fit-content',
  gap: 0,

  flex: 1,
  width: '100%',

  variants: {
    bp: {
      medium: {
        gap: '$3',
        width: 'auto',
      },
    },
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
