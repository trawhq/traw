import '@fontsource/caveat-brush';
import '@fontsource/crimson-pro';
import '@fontsource/recursive';
import '@fontsource/source-code-pro';
import '@fontsource/source-sans-pro';
import { Editor } from 'components/Editor';
import { SlideListPanel } from 'components/SlideListPanel';
import { ToolsPanel } from 'components/ToolsPanel';
import { TopPanel } from 'components/TopPanel';
import { TrawContext } from 'hooks';
import React, { ReactNode, useCallback } from 'react';
import { TrawApp } from 'state';
import { styled } from 'stitches.config';
import { TrawDocument } from 'types';
import { TEST_DOCUMENT_1, TEST_USER_1 } from 'utils/testUtil';
import { BlockPanel } from './components';
import './index.css';

import { CursorComponent } from '@tldraw/core';
import { breakpoints } from 'utils/breakpoints';

export interface TrawProps {
  app?: TrawApp;
  document?: TrawDocument;
  components?: {
    TopMenu?: ReactNode;
    EmptyVoiceNote?: ReactNode;
    EmptyDocumentPopup?: ReactNode;
    /**
     * The component to render for multiplayer cursors.
     */
    Cursor?: CursorComponent;
  };
  functions?: {
    handleChangeDocumentTitle?: (newValue: string) => void;
    handleNavigateHome?: () => void;
    handleLanguageClick?: () => void;
  };
}

const Traw = ({ app, document, components, functions }: TrawProps) => {
  // Create a new app when the component mounts.
  const [trawApp] = React.useState(
    app ??
      new TrawApp({
        user: TEST_USER_1,
        document: document || TEST_DOCUMENT_1,
      }),
  );

  const isPlayerMode = trawApp.useStore((state) => state.playerOptions?.isPlayerMode);
  const readOnly = isPlayerMode || (document && !document.canEdit) ? true : false;

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

  const { speechRecognitionLanguage } = trawApp.useStore((state) => state.recording);
  const handleLanguageClickDefault = useCallback(() => {
    if (speechRecognitionLanguage === 'en-US') {
      trawApp.setSpeechRecognitionLanguage('ko-KR');
    } else {
      trawApp.setSpeechRecognitionLanguage('en-US');
    }
  }, [speechRecognitionLanguage, trawApp]);

  // Use the `key` to ensure that new selector hooks are made when the id changes
  return (
    <TrawContext.Provider value={trawApp}>
      <div id="traw" data-testid="traw" className="flex flex-1 flex-col overflow-hidden ">
        <Editor components={components} readOnly={readOnly} />
        <StyledUI bp={breakpoints}>
          {!isPlayerMode && (
            <TopPanel
              Room={components?.TopMenu}
              handleChangeTitle={functions?.handleChangeDocumentTitle}
              handleNavigateHome={functions?.handleNavigateHome}
            />
          )}
          {!isPlayerMode && (
            <BlockPanel
              handlePlayClick={handlePlayClick}
              handleLanguageClick={functions?.handleLanguageClick ?? handleLanguageClickDefault}
              components={{
                EmptyVoiceNote: components?.EmptyVoiceNote,
                EmptyDocumentPopup: components?.EmptyDocumentPopup,
              }}
            />
          )}

          {!isPlayerMode && <SlideListPanel />}
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
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  pointerEvents: 'none',
  '& > *': {
    pointerEvents: 'all',
  },

  padding: 0,
  variants: {
    bp: {
      medium: {
        padding: 8,
      },
    },
  },
});
