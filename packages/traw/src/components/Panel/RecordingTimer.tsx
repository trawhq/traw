import React, { useEffect, useState } from 'react';
import SvgRecording from 'icons/recording';
import { useTrawApp } from 'hooks';
import classNames from 'classnames';

export interface RecordingTimerProps {
  className?: string;
}

export default function RecordingTimer({ className }: RecordingTimerProps) {
  const trawApp = useTrawApp();
  const startedAt = trawApp.useStore((state) => state.recording.startedAt);
  const [duration, setDuration] = useState<string>('00:00:00');

  useEffect(() => {
    const timerId = setInterval(() => {
      const now = Date.now();
      const diff = (now - startedAt) / 1000;
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = Math.floor(diff % 60);
      setDuration(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
    }, 1000);

    return () => {
      clearInterval(timerId);
    };
  }, [startedAt]);

  return (
    <div className={classNames('flex', 'items-center', 'gap-1', className)}>
      <SvgRecording className="text-red-500" width="10" height="10" /> <span className="text-xs">{duration}</span>
    </div>
  );
}
