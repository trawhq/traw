import React, { useState } from 'react';
import SvgSend from '../../icons/send';
import classNames from 'classnames';
import { SpeakingIndicator } from 'components/Indicator';
import RecordingTimer from 'components/Panel/RecordingTimer';
import SpeechViewer from 'components/Panel/SpeechViewer';

export interface PanelFooterProps {
  isRecording: boolean;
  isTalking: boolean;
  recognizedText: string;
  onCreate: (text: string) => void;
}

export const PanelFooter = ({ isRecording, isTalking, recognizedText, onCreate }: PanelFooterProps) => {
  const [text, setText] = useState<string | undefined>(undefined);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (!text) return;
      onCreate(text);
      setText(undefined);
    }
  };

  const handleClick = () => {
    if (!text) return;
    onCreate(text);
    setText(undefined);
  };

  return (
    <footer className="mt-2 mb-2 ">
      <div
        className={classNames(
          'flex',
          'flex-col',
          'align-items',
          'items-stretch',
          'border',
          'rounded-full',
          'border-traw-divider',
          'px-2',
          'py-1.5',
          'gap-3',
          {
            'rounded-xl': isRecording,
          },
        )}
      >
        {isRecording && (
          <>
            <div className="flex flex-row px-0.5 items-end">
              <RecordingTimer className="flex-1" />
              <SpeakingIndicator size={17} isSpeaking={isTalking} />
            </div>
            <SpeechViewer className="max-h-16 text-xs overflow-y-scroll px-0.5" text={recognizedText} />
          </>
        )}
        <div
          className={classNames('flex', 'items-center', 'rounded-full', 'px-2', 'transition-colors', {
            'bg-traw-sky': isRecording,
          })}
        >
          <input
            className={classNames(
              'w-full',
              'rounded-full',
              'bg-transparent',
              'text-traw-grey-dark',
              'text-xs',
              'px-0.5',
              'py-1.5',
              'focus-visible:outline-0',
              'gap-2',
            )}
            placeholder="Enter messages here."
            value={text}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <button
            className={classNames('w-4 transition-colors duration-150', {
              'text-traw-grey-100': !text,
              'text-traw-purple': text,
            })}
            onClick={handleClick}
          >
            <SvgSend className="fill-current w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default PanelFooter;
