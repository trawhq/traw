import { Tldraw } from '@tldraw/tldraw';
import React, { useCallback, useEffect } from 'react';
import { useTrawApp } from '../../hooks/useTrawApp';

import { SLIDE_HEIGHT, SLIDE_WIDTH } from '../../constants';

export const Editor = () => {
  const TrawApp = useTrawApp();
  const slideDomRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      if (!slideDomRef.current) return;
      const width = slideDomRef.current.clientWidth;
      const height = slideDomRef.current.clientHeight;
      TrawApp.updateViewportSize(width, height);
    };
    handleResize();
    addEventListener('resize', handleResize);
    return () => {
      removeEventListener('resize', handleResize);
    };
  }, [TrawApp]);

  const handleMount = useCallback(
    (tldraw: any) => {
      TrawApp.registerApp(tldraw);
    },
    [TrawApp],
  );

  return (
    <div id="traw-editor" className="flex-1 relative" ref={slideDomRef}>
      <Tldraw onMount={handleMount} showMultiplayerMenu={false} darkMode={false} showMenu={false} showPages={false} />
    </div>
  );
};
