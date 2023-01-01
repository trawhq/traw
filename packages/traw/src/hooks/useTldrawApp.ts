import { TldrawApp } from '@tldraw/tldraw';
import React from 'react';
import { useEffect, useState } from 'react';
import { TrawBaseEvent, TrawEventType } from 'state';
import { useTrawApp } from './useTrawApp';

export const useTldrawApp = () => {
  const trawApp = useTrawApp();
  const [tldrawApp, setTldrawApp] = useState<TldrawApp>(trawApp.app);

  useEffect(() => {
    const onChange = (event: TrawBaseEvent) => {
      setTldrawApp(event.tldrawApp);
    };
    trawApp.on(TrawEventType.TldrawAppChange, onChange);
    return () => {
      trawApp.off(TrawEventType.TldrawAppChange, onChange);
    };
  }, [trawApp]);

  return tldrawApp;
};

const useForceUpdate = () => {
  const [, setState] = React.useState(0);
  React.useEffect(() => setState(1), []);
};

export const ContainerContext = React.createContext({} as React.RefObject<HTMLDivElement>);

export function useContainer() {
  const context = React.useContext(ContainerContext);
  useForceUpdate();
  return context;
}
