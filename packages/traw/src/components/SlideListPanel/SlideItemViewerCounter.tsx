import React from 'react';
import classNames from 'classnames';

import { SlideListItemState } from './SlideListItem';
import SvgViewer from 'icons/viewer';

interface SlideItemViewerCounterProps {
  viewerCount: number;
  selectState: SlideListItemState;
}

export const SlideItemViewerCounter = ({ viewerCount, selectState }: SlideItemViewerCounterProps) => {
  return (
    <div
      className={classNames(
        'flex items-center justify-center ml-auto w-10 rounded-bl-xl rounded-tr-xl text-right text-[10px] py-0.5 gap-1 select-none',
        {
          'bg-traw-purple text-white': selectState === SlideListItemState.SELECTED,
          'bg-traw-grey-50 text-traw-grey-100 ':
            selectState === SlideListItemState.DEFAULT || selectState === SlideListItemState.TARGETED,
        },
      )}
    >
      <SvgViewer className="fill-current h-3 w-4 " />
      {viewerCount}
    </div>
  );
};

export default SlideItemViewerCounter;
