import { Renderer } from '@tldraw/core';
import { shapeUtils, TDPage } from '@tldraw/tldraw';
import React from 'react';
import { SLIDE_HEIGHT, SLIDE_WIDTH } from '../../constants';
import { useTrawApp } from '../../hooks/useTrawApp';

interface SlideThumbnailProps {
  page: TDPage;
}

const SLideThumbnail = ({ page }: SlideThumbnailProps) => {
  const slideDomRef = React.useRef<HTMLDivElement>(null);

  const app = useTrawApp();
  const state = app.useSlidesStore();

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
          camera: {
            point: [SLIDE_WIDTH / 2, SLIDE_HEIGHT / 2],
            zoom: 133 / SLIDE_WIDTH,
          },
        }}
        assets={document.assets}
      />
    </div>
  );
};

export default SLideThumbnail;
