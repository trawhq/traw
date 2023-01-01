import Lottie from 'lottie-react';
import React from 'react';
import HansCollaborationAnimation from 'static/json/hands-collaboration.json';

interface EmptyBlockPanelProps {
  EmptyVoiceNote?: React.ReactNode;
}

const EmptyBlockPanel = ({ EmptyVoiceNote }: EmptyBlockPanelProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 select-none">
      <div className="text-traw-purple text-[15px] text-center font-['EliceDigitalBaeum']">
        From video recording to editing and sharing.
        <br />
        Draw and explain anywhere.
      </div>
      <div>
        <Lottie animationData={HansCollaborationAnimation} />
      </div>

      {EmptyVoiceNote}
    </div>
  );
};

export default EmptyBlockPanel;
