import React from 'react';

export interface SpeakingIndicatorProps {
  color?: string;
  size?: number;
  strokeWidth?: number;

  isSpeaking: boolean;

  transitionInTiming?: number;
  transitionOutTiming?: number;
}

export const SpeakingIndicator = ({
  color = 'traw-purple',
  size = 20,
  strokeWidth = 2,

  isSpeaking,

  transitionInTiming = 200,
  transitionOutTiming = 1800,
}: SpeakingIndicatorProps) => {
  const r = size / 2;
  const circumference = 2 * Math.PI * r;

  const cx = r + strokeWidth / 2;
  const cy = r + strokeWidth / 2;

  const containerSize = size + strokeWidth;

  const strokeDasharray = circumference;
  const strokeDashoffset = isSpeaking ? 0 : circumference;

  const transitionTiming = isSpeaking ? transitionInTiming : transitionOutTiming;

  return (
    <svg className="h-5 w-5 bg-transparent -rotate-90" viewBox={`0 0 ${containerSize} ${containerSize}`} fill="none">
      <circle className="text-gray-300" cx={cx} cy={cy} r={r} strokeWidth={strokeWidth} stroke="currentColor" />
      <circle
        className={`text-${color}`}
        cx={cx}
        cy={cy}
        r={r}
        strokeWidth={strokeWidth}
        stroke="currentColor"
        style={{
          strokeDasharray,
          strokeDashoffset,
          strokeLinecap: 'round',
          transition: `stroke-dashoffset ${transitionTiming}ms cubic-bezier(0.4, 0, 0.2, 1) 0ms`,
        }}
      />
    </svg>
  );
};

export default SpeakingIndicator;
