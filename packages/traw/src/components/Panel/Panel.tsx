import React from 'react';
import PanelFooter from './PanelFooter';
import PanelHeader from './PanelHeader';
import BlockList from 'components/Panel/BlockList';
import { useTrawApp } from 'hooks';
import { PlayModeType } from 'types';

export interface PanelProps {
  handlePlayClick: (blockId?: string) => void;
}

export const Panel = ({ handlePlayClick }: PanelProps) => {
  const app = useTrawApp();

  const { isRecording, isTalking, recognizedText } = app.useStore((state) => state.recording);
  const { mode } = app.useStore((state) => state.player);

  return (
    <div className="absolute  right-2 w-[269px] h-full">
      <div className="flex flex-col w-full sm:w-[269px] h-full items-center bg-white rounded-2xl shadow-[0_10px_60px_rgba(189,188,249,0.5)]">
        <div className="absolute left-0 right-0 top-0 bottom-0 p-2 flex flex-col ">
          <PanelHeader handlePlayClick={handlePlayClick} isPlaying={mode === PlayModeType.PLAYING} />
          <BlockList handlePlayClick={handlePlayClick} />
          <PanelFooter
            isRecording={isRecording}
            isTalking={isTalking}
            recognizedText={recognizedText}
            onCreate={console.log}
          />
        </div>
      </div>
    </div>
  );
};

export default Panel;
