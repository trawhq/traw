import BlockList from 'components/BlockPanel/BlockList';
import { useTrawApp } from 'hooks';
import React, { ReactNode } from 'react';
import { styled } from 'stitches.config';
import PanelFooter from './PanelFooter';
import PanelHeader from './PanelHeader';

export interface BlockPanelProps {
  handlePlayClick: (blockId?: string) => void;
  components?: {
    EmptyVoiceNote?: ReactNode;
  };
}

export const BlockPanel = ({ handlePlayClick, components }: BlockPanelProps) => {
  const app = useTrawApp();
  const panelOpen = app.useStore((state) => state.editor.isPanelOpen);
  const totalTime = app.useStore((state) => state.player.totalTime);

  const { isRecording, isTalking, recognizedText } = app.useStore((state) => state.recording);

  return (
    <StyledPanelContainer open={panelOpen}>
      <div className="flex flex-col w-full h-full p-2 bg-white rounded-xl">
        <>
          <PanelHeader
            isRecording={isRecording}
            isTalking={isTalking}
            panelOpen={panelOpen}
            totalTime={totalTime}
            togglePanel={app.togglePanel}
          />
          {panelOpen && (
            <BlockList
              handlePlayClick={handlePlayClick}
              isRecording={isRecording}
              EmptyVoiceNote={components?.EmptyVoiceNote}
            />
          )}
          {panelOpen && (
            <PanelFooter
              isRecording={isRecording}
              isTalking={isTalking}
              recognizedText={recognizedText}
              onCreate={console.log}
            />
          )}
        </>
      </div>
    </StyledPanelContainer>
  );
};

export default BlockPanel;

const StyledPanelContainer = styled('div', {
  position: 'absolute',
  top: 71,
  right: 16,
  marginLeft: 16,
  minHeight: 0,
  width: 269,
  height: 'calc(100vh - 91px)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 200,
  overflow: 'hidden',
  borderRadius: 15,
  transition: 'all 0.15s  cubic-bezier(0.4, 0, 0.2, 1)',
  fontSize: 13,
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
    open: {
      true: {
        maxHeight: '100%',
      },
      false: {
        maxHeight: 50,
      },
    },
  },
});
