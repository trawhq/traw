import BlockList from 'components/BlockPanel/BlockList';
import { useTrawApp } from 'hooks';
import useDeviceDetect from 'hooks/useDeviceDetect';
import React, { ReactNode, useEffect } from 'react';
import { styled } from 'stitches.config';
import PanelFooter from './PanelFooter';
import PanelHeader from './PanelHeader';

export interface BlockPanelMobileProps {
  handlePlayClick: (blockId?: string) => void;
  handleCreateTextBlock: (text: string) => void;
  handleLanguageClick?: () => void;
  components?: {
    EmptyVoiceNote?: ReactNode;
    EmptyDocumentPopup?: ReactNode;
  };
}

export const BlockPanelMobile = ({
  handlePlayClick,
  handleCreateTextBlock,
  handleLanguageClick,
  components,
}: BlockPanelMobileProps) => {
  const app = useTrawApp();
  const panelOpen = app.useStore((state) => state.editor.isPanelOpen);
  const totalTime = app.useStore((state) => state.player.totalTime);

  const { isRecording, isTalking, recognizedText, speechRecognitionLanguage } = app.useStore(
    (state) => state.recording,
  );

  const { isBrowser } = useDeviceDetect();

  // Close panel on first render
  useEffect(() => {
    if (!isBrowser) {
      app.togglePanel();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBrowser]);

  return (
    <StyledPanelContainer size={!panelOpen ? 'small' : 'large'}>
      <div className="flex flex-col w-full h-full py-2 px-3 bg-white rounded-xl shadow-4xl ">
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
              speechRecognitionLanguage={speechRecognitionLanguage}
              recognizedText={recognizedText}
              onCreate={handleCreateTextBlock}
              onClickSpeechRecognitionLanguage={handleLanguageClick}
            />
          )}
        </>
      </div>
    </StyledPanelContainer>
  );
};

export default BlockPanelMobile;

const StyledPanelContainer = styled('div', {
  position: 'absolute',
  top: 71,
  right: 10,
  minHeight: 0,
  width: 'auto',
  display: 'flex',
  justifyContent: 'center',
  height: 'calc(100% - 71px)',
  alignItems: 'center',
  zIndex: 201,
  overflow: 'hidden',
  borderRadius: 15,
  transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
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
    size: {
      large: {
        maxHeight: '100%',
        width: '100%',
        left: 0,
        right: 0,
        paddingLeft: 10,
        paddingRight: 10,
        paddingBottom: 10,
      },
      small: {
        maxHeight: 50,
        right: 10,
        left: 'initial',
        paddingLeft: 0,
        paddingRight: 0,
        paddingBottom: 0,
      },
    },
  },
});
