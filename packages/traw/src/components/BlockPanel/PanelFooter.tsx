import classNames from 'classnames';
import RecordingTimer from 'components/BlockPanel/RecordingTimer';
import SpeechViewer from 'components/BlockPanel/SpeechViewer';
import { SpeakingIndicator } from 'components/Indicator';
import React, { useState } from 'react';
import SvgSend from '../../icons/send';
import { getCountryFlagByLocale } from 'utils/countryFlag';

export interface PanelFooterProps {
  isRecording: boolean;
  isTalking: boolean;
  recognizedText: string;
  speechRecognitionLanguage: string;
  onCreate: (text: string) => void;
  onClickSpeechRecognitionLanguage?: () => void;
}

export const PanelFooter = ({
  isRecording,
  isTalking,
  recognizedText,
  speechRecognitionLanguage,
  onCreate,
  onClickSpeechRecognitionLanguage,
}: PanelFooterProps) => {
  const [text, setText] = useState<string | undefined>(undefined);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter') return;
    if (e.shiftKey) return;
    e.preventDefault();
    if (!text) return;
    onCreate(text);
    setText('');
  };

  const handleClick = () => {
    if (!text) return;
    onCreate(text);
    setText('');
  };

  const countryFlag = getCountryFlagByLocale(speechRecognitionLanguage);

  return (
    <footer className="mt-2 mb-2 select-none">
      <div
        className={classNames(
          'flex',
          'flex-col',
          'align-items',
          'items-stretch',
          'border',
          'border-traw-divider',
          'px-2',
          'py-1.5',
          'gap-3',
          {
            'rounded-xl': isRecording,
            'rounded-full': !isRecording,
          },
        )}
      >
        {isRecording && (
          <>
            <div className="flex flex-row px-0.5 items-center">
              <RecordingTimer className="flex-1" />
              <button
                className="w-7 h-7 mx-1 rounded-full text-base hover:bg-gray-100"
                onClick={onClickSpeechRecognitionLanguage}
              >
                {countryFlag}
              </button>
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
          <textarea
            className={classNames(
              'w-full',
              'resize-none',
              'bg-transparent',
              'text-traw-grey-dark',
              'text-xs',
              'px-0.5',
              'py-1.5',
              'focus-visible:outline-0',
              'gap-2',
            )}
            rows={1}
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
