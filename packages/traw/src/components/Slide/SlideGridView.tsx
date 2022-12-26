import React, { useRef } from 'react';
import { TDPage } from '@tldraw/tldraw';
import SlideListItem, { SlideListItemState } from '../SlideListPanel/SlideListItem';

interface SlideGridViewProps {
  close: () => void;
  selectSlide: (slideId: string) => void;
  pages: Record<string, TDPage>;
  currentPageId: string;
}

// const slideSize = {
//   mobile: '100%',
//   tablet: '240px',
// };

const SlideGridView = ({ close, pages, currentPageId, selectSlide }: SlideGridViewProps) => {
  const slideRef = useRef<Record<string, any>>({});

  const viewerCount = 3;
  const selectState = SlideListItemState.DEFAULT;

  const handleClick = (slideId: string) => {
    selectSlide(slideId);
  };

  return (
    <div className="flex bg-white  px-3 py-5 flex-1 rounded-2xl ">
      <div className="flex realtive flex-1 overflow-y-auto">
        <div className={`grid flex-1 p-2 grid-cols-1 sm:grid-cols-fill-240 gap-4 content-start justify-center`}>
          {Object.values(pages).map((page, index) => {
            return (
              <SlideListItem
                key={index}
                page={page}
                index={index + 1}
                viewerCount={viewerCount}
                selectState={page.id === currentPageId ? SlideListItemState.SELECTED : selectState}
                size="grid"
                handleClick={handleClick}
                setRef={(ref) => {
                  slideRef.current[page.id] = ref;
                }}
              />
            );
          })}
        </div>
      </div>
      <button
        className="absolute h-9 left-0 right-0 bottom-11 m-auto w-44 rounded-full bg-traw-purple text-white shadow-3xl text-sm z-[102]"
        onClick={close}
      >
        그리드 뷰 닫기
      </button>
    </div>
  );
};

export default SlideGridView;
