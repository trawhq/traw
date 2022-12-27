import { SpeakingIndicator } from 'components/Indicator';
import { DoubleArrowLeftIcon } from 'icons/DoubleArrowLeft';
import React from 'react';
import RecordingTimer from './RecordingTimer';

export interface PanelHeaderProps {
  isRecording?: boolean;
  isTalking: boolean;
  panelOpen: boolean;
  togglePanel?: () => void;
}

export const PanelHeader = ({ isRecording, isTalking, panelOpen, togglePanel }: PanelHeaderProps) => {
  return (
    <header className="flex mt-2 w-full gap-2 pl-2 items-center">
      {!isRecording && (
        <>
          <div className="text-traw-grey-dark text-[13px] font-bold">Voice note</div>
          {/* Todo. total record time */}
          <div className="text-traw-grey-100 font-[12px]">00:00:00</div>
          <button onClick={togglePanel} className=" ml-auto">
            {panelOpen ? (
              <DoubleArrowLeftIcon flipHorizontal className="text-traw-grey-100 transition-transform" />
            ) : (
              <DoubleArrowLeftIcon className="text-traw-grey-100 transition-transform" />
            )}
          </button>
        </>
      )}
      {isRecording && (
        <>
          {panelOpen ? (
            <>
              <div className="text-traw-grey-dark text-[13px] font-bold">Voice note</div>
              <button onClick={togglePanel} className=" ml-auto">
                <DoubleArrowLeftIcon flipHorizontal className="text-traw-grey-100 " />
              </button>
            </>
          ) : (
            <>
              <div className="flex flex-1  items-end cursor-pointer" onClick={togglePanel}>
                <RecordingTimer className="flex-1" />
                <SpeakingIndicator size={17} isSpeaking={isTalking} />
              </div>
            </>
          )}
        </>
      )}
    </header>
  );
};

export default PanelHeader;
