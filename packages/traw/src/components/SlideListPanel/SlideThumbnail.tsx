import { Renderer } from '@tldraw/core';
import { shapeUtils, TDPage } from '@tldraw/tldraw';
import { DEFAULT_CAMERA } from '../../constants';
import { useTldrawApp } from 'hooks/useTldrawApp';
import React, { useMemo } from 'react';
import { convertCameraTRtoTD } from 'state';
import { useTrawApp } from '../../hooks/useTrawApp';
import { TRViewport } from 'types';

interface SlideThumbnailProps {
  page: TDPage;
  viewport: TRViewport;
}

const SlideThumbnail = ({ page, viewport }: SlideThumbnailProps) => {
  const slideDomRef = React.useRef<HTMLDivElement>(null);

  const app = useTrawApp();
  const tldrawApp = useTldrawApp();
  const state = tldrawApp.useStore();
  const camera = app.useStore((state) => {
    if (!state.camera[state.user.id]) return null;
    if (!state.camera[state.user.id].cameras) return null;
    return state.camera[state.user.id].cameras[page.id];
  });
  const tlCamera = useMemo(() => {
    if (camera) return convertCameraTRtoTD(camera, viewport);
    else return convertCameraTRtoTD(DEFAULT_CAMERA, viewport);
  }, [camera, viewport]);

  const { settings, document } = state;

  const meta = React.useMemo(() => {
    return { isDarkMode: settings.isDarkMode };
  }, [settings.isDarkMode]);

  return (
    <div className="w-full aspect-video rounded-xl relative overflow-hidden" ref={slideDomRef}>
      <Renderer
        shapeUtils={shapeUtils}
        page={page}
        hideBounds={true}
        meta={meta}
        pageState={{
          id: page.id,
          selectedIds: [],
          camera: tlCamera,
        }}
        assets={document.assets}
      />
    </div>
  );
};

export default SlideThumbnail;
