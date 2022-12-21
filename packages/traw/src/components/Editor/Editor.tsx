import { Tldraw, TldrawApp } from '@tldraw/tldraw';
import React, { useCallback, useEffect } from 'react';
import { useTrawApp } from 'hooks';

export const Editor = () => {
  const TrawApp = useTrawApp();
  const slideDomRef = React.useRef<HTMLDivElement>(null);

  const handleResize = useCallback(() => {
    if (!slideDomRef.current) return;
    const width = slideDomRef.current.clientWidth;
    const height = slideDomRef.current.clientHeight;
    TrawApp.updateViewportSize(width, height);
  }, [TrawApp]);

  useEffect(() => {
    handleResize();
    addEventListener('resize', handleResize);
    return () => {
      removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  const handleMount = useCallback(
    (tldraw: TldrawApp) => {
      TrawApp.registerApp(tldraw);
      handleResize();
    },
    [TrawApp, handleResize],
  );

  return (
    <div id="traw-editor" className="flex-1 relative" ref={slideDomRef}>
      <Tldraw onMount={handleMount} showMultiplayerMenu={false} darkMode={false} showMenu={false} showPages={false} />
    </div>
  );
};
