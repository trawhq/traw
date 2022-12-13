import { Tldraw } from '@tldraw/tldraw';
import React from 'react';
import { useTrawApp } from '../../hooks/useTrawApp';

export const Editor = () => {
  const TrawApp = useTrawApp();

  const handleMount = (tldraw: any) => {
    TrawApp.registerApp(tldraw);
  };

  return (
    <div id="traw-editor" className="flex-1 relative">
      <Tldraw onMount={handleMount} showMultiplayerMenu={false} darkMode={false} showMenu={false} showPages={false} />
    </div>
  );
};
