import { useTrawApp } from 'hooks';
import useDeviceDetect from 'hooks/useDeviceDetect';
import { nanoid } from 'nanoid';
import React, { ReactNode } from 'react';
import { TRBlock, TRBlockType } from 'types';
import BlockPanelDesktop from './BlockPanel.Desktop';
import BlockPanelMobile from './BlockPanel.Mobile';

export interface BlockPanelProps {
  handlePlayClick: (blockId?: string) => void;
  handleLanguageClick?: () => void;
  components?: {
    EmptyVoiceNote?: ReactNode;
    EmptyDocumentPopup?: ReactNode;
  };
}

export const BlockPanel = ({ handlePlayClick, handleLanguageClick, components }: BlockPanelProps) => {
  const { isBrowser } = useDeviceDetect();

  const app = useTrawApp();

  const { speechRecognitionLanguage } = app.useStore((state) => state.recording);

  const handleCreateTextBlock = (text: string) => {
    const block: TRBlock = {
      id: nanoid(),
      type: TRBlockType.TALK,
      time: Date.now(),
      userId: app.editorId,
      lang: speechRecognitionLanguage,

      text,
      isActive: true,
      voices: [],
      voiceStart: 0,
      voiceEnd: 0,
    };
    app.createBlock(block);
  };

  return isBrowser ? (
    <BlockPanelDesktop
      handlePlayClick={handlePlayClick}
      handleCreateTextBlock={handleCreateTextBlock}
      handleLanguageClick={handleLanguageClick}
      components={components}
    />
  ) : (
    <BlockPanelMobile
      handlePlayClick={handlePlayClick}
      handleCreateTextBlock={handleCreateTextBlock}
      handleLanguageClick={handleLanguageClick}
      components={components}
    />
  );
};

export default BlockPanel;
