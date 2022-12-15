import { Renderer } from '@tldraw/core';
import { shapeUtils, TDPage } from '@tldraw/tldraw';
import React, { useMemo } from 'react';
import { convertCameraTRtoTD } from 'state';
import { useTrawApp } from '../../hooks/useTrawApp';

interface SlideThumbnailProps {
  page: TDPage;
}

const SLideThumbnail = ({ page }: SlideThumbnailProps) => {
  const slideDomRef = React.useRef<HTMLDivElement>(null);

  const app = useTrawApp();
  const state = app.useSlidesStore();
  const camera = app.getCamera(page.id);
  const tlCamera = useMemo(() => {
    return convertCameraTRtoTD(camera, { width: 133, height: 75 });
  }, [camera]);

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

export default SLideThumbnail;
