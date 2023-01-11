import BlockList from 'components/BlockPanel/BlockList';
import { useTrawApp } from 'hooks';
import React, { ReactNode, useEffect, useState } from 'react';
import { styled } from 'stitches.config';
import EmptyDocumentPopup from './EmptyDocumentPopup';
import PanelFooter from './PanelFooter';
import PanelHeader from './PanelHeader';

export interface BlockPanelDesktopProps {
  handlePlayClick: (blockId?: string) => void;
  handleCreateTextBlock: (text: string) => void;
  handleLanguageClick?: () => void;
  components?: {
    EmptyVoiceNote?: ReactNode;
    EmptyDocumentPopup?: ReactNode;
  };
}

export const BlockPanelDesktop = ({
  handlePlayClick,
  handleCreateTextBlock,
  handleLanguageClick,
  components,
}: BlockPanelDesktopProps) => {
  const [closeEmptyPopupForever, setCloseEmptyPopupForever] = useState(false);

  const app = useTrawApp();
  const panelOpen = app.useStore((state) => state.editor.isPanelOpen);
  const totalTime = app.useStore((state) => state.player.totalTime);

  const blocks = app.useStore((state) => state.blocks);
  const isEmptyBlock = Object.keys(blocks).length === 0;
  const { isRecording, isTalking, recognizedText, speechRecognitionLanguage } = app.useStore(
    (state) => state.recording,
  );

  const showEmptyDocumentPopup = isEmptyBlock && components?.EmptyDocumentPopup && !closeEmptyPopupForever;

  useEffect(() => {
    if (isRecording) {
      setCloseEmptyPopupForever(true);
    }
  }, [showEmptyDocumentPopup, isRecording]);

  useEffect(() => {
    if (panelOpen) {
      app.setPadding({ right: 300 });
    } else {
      app.setPadding({ right: 0 });
    }
  }, [app, panelOpen]);

  const closeEmptyDocumentPopup = () => {
    setCloseEmptyPopupForever(true);
  };

  return (
    <StyledPanelContainer size={!panelOpen ? 'small' : showEmptyDocumentPopup ? 'medium' : 'large'}>
      <div className="flex flex-col w-full h-full p-2 bg-white rounded-xl">
        {showEmptyDocumentPopup ? (
          <EmptyDocumentPopup
            popupContents={components?.EmptyDocumentPopup}
            closeEmptyDocumentPopup={closeEmptyDocumentPopup}
          />
        ) : (
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
        )}
      </div>
    </StyledPanelContainer>
  );
};

export default BlockPanelDesktop;

const StyledPanelContainer = styled('div', {
  position: 'absolute',
  top: 71,
  right: 16,
  marginLeft: 16,
  minHeight: 0,
  width: 269,
  height: 'calc(100% - 91px)',
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
    size: {
      large: { maxHeight: '100%' },
      medium: { maxHeight: 330 },
      small: { maxHeight: 50 },
    },
  },
});
