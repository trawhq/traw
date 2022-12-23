import React, { useCallback, useEffect } from 'react';
import { Header, Panel, Slide } from './components';
import { TrawContext } from 'hooks';
import './index.css';
import { TrawApp } from 'state';
import { TEST_DOCUMENT_1, TEST_USER_1 } from 'utils/testUtil';

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
      <div id="traw" data-testid="traw" className="flex flex-1 flex-col overflow-hidden bg-traw-sky">
        <div className="h-14 m-2 mb-0">
          <Header
            title={'Test Document'}
            canEdit={true}
            handleChangeTitle={() => null}
            Room={<div />}
            isRecording={isRecording}
            onClickStartRecording={startRecording}
            onClickStopRecording={stopRecording}
          />
        </div>

        <div className="flex flex-1 flex-col sm:flex-row">
          <div className="flex flex-1 ">
            <Slide />
          </div>
          <div className="flex basis-[269px] m-2 sm:ml-0  ">
            <Panel handlePlayClick={handlePlayClick} />
          </div>
        </div>
      </div>
    </TrawContext.Provider>
  );
};

export { Traw };
