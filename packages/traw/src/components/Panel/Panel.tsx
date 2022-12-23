import React from 'react';
import BlockItem from './BlockItem';
import PanelFooter from './PanelFooter';
import PanelHeader from './PanelHeader';
import BlockList from 'components/Panel/BlockList';

export interface PanelProps {
  handlePlayClick: () => void;
}

export const Panel = ({ handlePlayClick }: PanelProps) => {
  return (
    <div className="relative w-full ">
      <div className="flex flex-col w-full sm:w-[269px] h-full items-center bg-white rounded-2xl shadow-[0_10px_60px_rgba(189,188,249,0.5)]">
        <div className="absolute left-0 right-0 top-0 bottom-0 p-2 flex flex-col ">
          <PanelHeader handlePlayClick={handlePlayClick} isPlaying={true} />
          <BlockList handlePlayClick={handlePlayClick} />
          <PanelFooter onCreate={console.log} />
        </div>
      </div>
    </div>
  );
};

export default Panel;
