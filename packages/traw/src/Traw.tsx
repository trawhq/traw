import { Editor } from 'components/Editor';
import { HeaderPanel } from 'components/HeaderPanel';
import { SlideListPanel } from 'components/SlideListPanel';
import { ToolsPanel } from 'components/ToolsPanel';
import { TopPanel } from 'components/TopPanel';
import { TrawContext } from 'hooks';
import React, { useCallback, useEffect } from 'react';
import { TrawApp } from 'state';
import { styled } from 'stitches.config';
import { TEST_DOCUMENT_1, TEST_USER_1 } from 'utils/testUtil';
import { BlockPanel } from './components';
import './index.css';

export interface TrawProps {
  app?: TrawApp;
}

const Traw = ({ app }: TrawProps) => {
  // Create a new app when the component mounts.
  const [trawApp] = React.useState(
    app ??
      new TrawApp({
        user: TEST_USER_1,
        document: TEST_DOCUMENT_1,
      }),
  );

  React.useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.document?.fonts) return;

    function refreshBoundingBoxes() {
      trawApp.app.refreshBoundingBoxes();
    }
    window.document.fonts.addEventListener('loadingdone', refreshBoundingBoxes);
    return () => {
      window.document.fonts.removeEventListener('loadingdone', refreshBoundingBoxes);
    };
  }, [trawApp]);

  const [isRecording, setIsRecording] = React.useState(false);
  const startRecording = () => setIsRecording(true);
  const stopRecording = () => setIsRecording(false);

  useEffect(() => {
    if (isRecording) {
      trawApp.startRecording();
    } else {
      trawApp.stopRecording();
    }
  }, [trawApp, isRecording]);

  const handlePlayClick = useCallback(
    (blockId?: string) => {
      if (blockId) {
        trawApp.playBlock(blockId);
      } else {
        // TODO - play the whole document
      }
    },
    [trawApp],
  );

  // Use the `key` to ensure that new selector hooks are made when the id changes
  return (
    <TrawContext.Provider value={trawApp}>
      <div id="traw" data-testid="traw" className="flex flex-1 flex-col overflow-hidden ">
        <Editor />
        <StyledUI>
          <HeaderPanel />
          <TopPanel Room={<div />} />
          <BlockPanel
            handlePlayClick={handlePlayClick}
            onClickStartRecording={startRecording}
            onClickStopRecording={stopRecording}
          />

          <SlideListPanel />
          <ToolsPanel />
        </StyledUI>
      </div>
    </TrawContext.Provider>
  );
};

export { Traw };

const StyledUI = styled('div', {
  position: 'absolute',
  overflow: 'hidden',
  top: 0,
  left: 0,
  height: '100%',
  width: '100%',
  padding: '8px 8px 0 8px',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  pointerEvents: 'none',
  zIndex: 2,
  '& > *': {
    pointerEvents: 'all',
  },
});
