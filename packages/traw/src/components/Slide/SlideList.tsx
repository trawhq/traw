import { useTldrawApp } from 'hooks/useTldrawApp';
import React, { useEffect, useRef } from 'react';
import { useTrawApp } from '../../hooks/useTrawApp';
import SvgAdd from '../../icons/add';
import SvgGridView from '../../icons/grid-view';
import SlideListItem, { SlideListItemState } from './SlideListItem';

export interface SlideListProps {
  canAddSlide: boolean;
  handleAddSlide: () => void;
  handleGridView: () => void;
}
const SlideList = ({ canAddSlide, handleAddSlide, handleGridView }: SlideListProps) => {
  const slideRef = useRef<Record<string, HTMLElement>>({});
  const app = useTrawApp();
  const tldrawApp = useTldrawApp();
  const state = tldrawApp.useStore();
  const { document, appState } = state;
  const { currentPageId } = appState;
  const pages = document.pages;

  const viewerCount = 3;
  const selectState = SlideListItemState.DEFAULT;

  const handleSlideClick = (slideId: string) => {
    app.selectSlide(slideId);
  };

  useEffect(() => {
    const currentSlide = slideRef.current[currentPageId];
    if (currentSlide) {
      currentSlide.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });
    }
  }, [currentPageId]);

  return (
    <div className="flex flex-row gap-3 overflow-hidden justify-between flex-1">
      <div className="overflow-x-auto flex flex-1">
        <div className="flex flex-row gap-3">
          {Object.values(pages).map((page, index) => (
            <SlideListItem
              key={page.id}
              index={index + 1}
              page={page}
              viewerCount={viewerCount}
              selectState={page.id === currentPageId ? SlideListItemState.SELECTED : selectState}
              size="list"
              handleClick={handleSlideClick}
              setRef={(ref) => {
                slideRef.current[page.id] = ref;
              }}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-col justify-between basis-[25px] sm:basis-[35px] py-1 sm:py-0">
        <button
          className="flex items-center justify-center border border-traw-purple w-6 h-6 sm:w-8 sm:h-8 rounded-md text-traw-purple
           disabled:border-black/[.12] disabled:text-black/[.26] hover:bg-traw-purple hover:text-white"
          disabled={!canAddSlide}
          onClick={handleAddSlide}
        >
          <SvgAdd className="fill-current w-2 h-2" />
        </button>
        <button
          className="flex items-center justify-center border border-traw-purple w-6 h-6 sm:w-8 sm:h-8 rounded-md text-traw-purple hover:bg-traw-purple hover:text-white"
          onClick={handleGridView}
        >
          <SvgGridView className="fill-current w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default SlideList;
