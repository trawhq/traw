import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

export interface SpeechViewerProps {
  className?: string;
  text: string;
}

export default function SpeechViewer({ className, text }: SpeechViewerProps) {
  const [count, setCount] = useState(0);
  const bottomRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const timerId = setInterval(() => {
      setCount((c) => {
        return c + 1;
      });
    }, 1000);
    return () => {
      clearInterval(timerId);
    };
  }, []);

  useEffect(() => {
    // Scroll to bottom
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [text]);

  return (
    <p className={className}>
      {text}
      {'.'.repeat((count % 3) + 1)}
      <span className="invisible" ref={bottomRef} />
    </p>
  );
}
