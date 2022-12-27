import SvgHeadset from 'icons/Headset';
import React from 'react';
import Lottie from 'lottie-react';
import HansCollaborationAnimation from 'static/json/hands-collaboration.json';
import { CopyIcon } from '@radix-ui/react-icons';
interface EmptyBlockPanelProps {
  onClickStartRecording: () => void;
  documentId: string;
}

const EmptyBlockPanel = ({ onClickStartRecording, documentId }: EmptyBlockPanelProps) => {
  const clickCopyLink = () => {
    // TODO. Implement copy link
    console.log('copy link', documentId);
  };
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3">
      <div className="text-traw-purple text-[15px] text-center font-['EliceDigitalBaeum']">
        From video recording to editing and sharing.
        <br />
        Draw and explain anywhere.
      </div>
      <div>
        <Lottie animationData={HansCollaborationAnimation} />
      </div>
      <button
        className="flex gap-1 items-center text-traw-purple font-[13px] border border-traw-purple rounded-full px-3 py-1 hover:bg-traw-purple hover:text-white transition-colors"
        onClick={onClickStartRecording}
      >
        <SvgHeadset className="fill-current w-5 h-4" />
        Start traw recording
      </button>
      <button className="text-traw-purple font-[13px] flex items-center gap-3" onClick={clickCopyLink}>
        Invitation link <CopyIcon />
      </button>
    </div>
  );
};

export default EmptyBlockPanel;
