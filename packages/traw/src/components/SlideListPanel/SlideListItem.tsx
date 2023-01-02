import { TDPage } from '@tldraw/tldraw';
import classNames from 'classnames';
import React from 'react';
import SlideItemViewerCounter from './SlideItemViewerCounter';
import SlideThumbnail from './SlideThumbnail';

export enum SlideListItemState {
  DEFAULT = 'DEFAULT',
  TARGETED = 'TARGETED',
  SELECTED = 'SELECTED',
}

interface SlideListItemProps {
  page: TDPage;
  index: number;
  type: 'list' | 'preview';
  viewerCount?: number;
  selectState?: SlideListItemState;
  setRef?: (ref: HTMLLIElement) => void;
  handleClick?: (slideId: string) => void;
  classnames?: string;
}

const slidesViewport = {
  list: {
    width: 105,
    height: 59,
  },
  preview: {
    width: 375,
    height: 210,
  },
};

const slideSizes = {
  list: `w-[${slidesViewport.list.width}px] `,
  preview: `w-[${slidesViewport.preview.width}px] `,
};

export const SlideListItem = ({
  page,
  index,
  viewerCount = 0,
  selectState = SlideListItemState.DEFAULT,
  type,
  setRef,
  handleClick,
  classnames,
}: SlideListItemProps) => {
  const handleSelectSlide = () => {
    handleClick && handleClick(page.id);
  };

  return (
    <li
      ref={(el: HTMLLIElement) => {
        setRef && setRef(el);
      }}
      key={page.id}
      onClick={handleSelectSlide}
      className={classNames(`flex aspect-video  relative cursor-pointer rounded-xl ${slideSizes[type]} ${classnames}}`)}
    >
      <div
        className={classNames(
          'absolute top-0 bottom-0 left-0 right-0 w-full h-full z-[101] flex flex-col justify-between outline outline-1 outline-offset-[-1px] rounded-xl',
          {
            'outline-transparent ': selectState === SlideListItemState.DEFAULT,
            'outline-traw-purple ': selectState === SlideListItemState.SELECTED,
            'outline-traw-grey ': selectState === SlideListItemState.TARGETED,
            'outline-traw-sky': type === 'preview',
          },
        )}
      >
        {type === 'list' && viewerCount > 0 && (
          <SlideItemViewerCounter viewerCount={viewerCount} selectState={selectState} />
        )}
        {type === 'list' && <div className="ml-auto text-[10px] text-traw-grey-100 pr-2 pb-1 select-none">{index}</div>}
      </div>
      <SlideThumbnail page={page} viewport={slidesViewport[type]} />
    </li>
  );
};

export default SlideListItem;
