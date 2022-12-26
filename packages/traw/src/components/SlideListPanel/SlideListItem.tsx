import { TDPage } from '@tldraw/tldraw';
import classNames from 'classnames';
import React from 'react';
import SvgViewer from '../../icons/viewer';
import SlideThumbnail from './SlideThumbnail';

export enum SlideListItemState {
  DEFAULT = 'DEFAULT',
  TARGETED = 'TARGETED',
  SELECTED = 'SELECTED',
}

interface SlideListItemProps {
  page: TDPage;
  index: number;
  viewerCount: number;
  selectState: SlideListItemState;
  size: 'list';
  setRef?: (ref: HTMLLIElement) => void;
  handleClick: (slideId: string) => void;
}

const slideSizes = {
  list: 'w-[105px] sm:w-[105px]',
};

const SlideListItem = ({ page, index, viewerCount, selectState, size, setRef, handleClick }: SlideListItemProps) => {
  const handleSelectSlide = () => {
    handleClick(page.id);
  };

  return (
    <li
      ref={(el: HTMLLIElement) => {
        setRef && setRef(el);
      }}
      key={page.id}
      onClick={handleSelectSlide}
      className={classNames(`flex aspect-video  relative cursor-pointer rounded-xl ${slideSizes[size]}`)}
    >
      <div
        className={classNames(
          'absolute top-0 bottom-0 left-0 right-0 w-full h-full z-[101] flex flex-col justify-between outline outline-1 outline-offset-[-1px] rounded-xl',
          {
            'outline-transparent ': selectState === SlideListItemState.DEFAULT,
            'outline-traw-purple ': selectState === SlideListItemState.SELECTED,
            'outline-traw-grey ': selectState === SlideListItemState.TARGETED,
          },
        )}
      >
        <div
          className={classNames(
            'flex items-center justify-center ml-auto w-10 rounded-bl-xl rounded-tr-xl text-right text-[10px] py-0.5 gap-1',
            {
              'bg-traw-purple text-white': selectState === SlideListItemState.SELECTED,
              'bg-traw-grey-50 text-traw-grey-100 ':
                selectState === SlideListItemState.DEFAULT || selectState === SlideListItemState.TARGETED,
            },
          )}
        >
          <SvgViewer className="fill-current h-3 w-4" />
          {viewerCount}
        </div>
        <div className="ml-auto text-[10px] text-traw-grey-100 pr-2 pb-1">{index}</div>
      </div>
      <SlideThumbnail page={page} />
    </li>
  );
};

export default SlideListItem;
