import { PlusIcon } from '@radix-ui/react-icons';
import SlideListItem, { SlideListItemState } from 'components/SlideListPanel/SlideListItem';
import { useTrawApp } from 'hooks';
import { useTldrawApp } from 'hooks/useTldrawApp';
import { DoubleArrowLeftIcon } from 'icons/DoubleArrowLeft';
import * as React from 'react';
import { styled } from 'stitches.config';
import { TrawRoomUser } from 'types';
import { breakpoints } from 'utils/breakpoints';

export const SlideListPanelDesktop = React.memo(function SlideListPanelDesktop() {
  const slideRef = React.useRef<Record<string, HTMLElement>>({});
  const [panelOpen, setPanelOpen] = React.useState(false);

  const app = useTrawApp();
  const tldrawApp = useTldrawApp();
  const state = tldrawApp.useStore();
  const { document, appState } = state;
  const { currentPageId } = appState;
  const pages = document.pages;

  const trawState = app.useStore();
  const others = trawState.room?.others || null;

  const currentPageIndex = Object.keys(pages).indexOf(currentPageId) + 1;

  const handleSlideClick = (slideId: string) => {
    app.selectSlide(slideId);
  };

  const handleAddSlide = () => {
    app.createSlide();
  };

  // hide panel after 5 seconds
  React.useEffect(() => {
    if (!panelOpen) return;
    const close = () => {
      setPanelOpen(false);
    };

    const timer = setTimeout(close, 10000);

    return () => {
      clearTimeout(timer);
    };
  }, [panelOpen]);

  const togglePanel = () => setPanelOpen(!panelOpen);
  return (
    <>
      <StyledSlideListPanelContainer bp={breakpoints} open={panelOpen}>
        <StyledCenterWrap>
          <StyledPanel>
            <StyledPanelHeader>
              <button onClick={togglePanel}>
                {panelOpen ? (
                  <DoubleArrowLeftIcon className="text-traw-grey-100 transition-transform" />
                ) : (
                  <DoubleArrowLeftIcon flipHorizontal className="text-traw-grey-100 transition-transform" />
                )}
              </button>
              <span className="text-traw-grey-dark ml-2 select-none">Pages</span>
              {panelOpen ? (
                <button onClick={handleAddSlide} className="text-traw-grey ml-auto">
                  <PlusIcon />
                </button>
              ) : (
                <span className="text-traw-purple ml-auto">{currentPageIndex}p</span>
              )}
            </StyledPanelHeader>
            {panelOpen && (
              <StyledSlideList>
                {Object.values(pages).map((page, index) => {
                  const selectState =
                    page.id === currentPageId ? SlideListItemState.SELECTED : SlideListItemState.DEFAULT;
                  const othersInThisPage = others
                    ? Object.values(others).filter((other: TrawRoomUser) => other.page === page.id)
                    : [];
                  return (
                    <SlideListItem
                      key={page.id}
                      index={index + 1}
                      page={page}
                      viewerCount={othersInThisPage.length + (selectState === SlideListItemState.SELECTED ? 1 : 0)}
                      selectState={selectState}
                      type="list"
                      handleClick={handleSlideClick}
                      setRef={(ref) => {
                        slideRef.current[page.id] = ref;
                      }}
                    />
                  );
                })}
              </StyledSlideList>
            )}
          </StyledPanel>
        </StyledCenterWrap>
      </StyledSlideListPanelContainer>
    </>
  );
});

const StyledSlideListPanelContainer = styled('div', {
  position: 'absolute',
  top: 71,
  left: 16,
  minHeight: 0,
  width: 125,
  gap: '$4',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 200,
  overflow: 'hidden',
  pointerEvents: 'none',
  borderRadius: 15,
  transition: 'all 0.15s  cubic-bezier(0.4, 0, 0.2, 1)',
  fontSize: 13,
  height: 'calc(100% - 91px)',

  '& > div > *': {
    pointerEvents: 'all',
  },
  variants: {
    bp: {
      mobile: {},
      small: {},
      medium: {},
      large: {},
    },
    open: {
      true: {
        maxHeight: '100%',
      },
      false: {
        maxHeight: 50,
      },
    },
  },
});

const StyledCenterWrap = styled('div', {
  display: 'flex',
  width: '100%',
  height: '100%',
  alignItems: 'center',
  justifyContent: 'flex-start',
  flexDirection: 'column',
  gap: '$5',
});

const StyledPanel = styled('div', {
  display: 'flex',
  width: '100%',
  flexDirection: 'column',
  gap: '15px',
  overflowY: 'hidden',
  backgroundColor: '#fff',
  borderRadius: 15,
  padding: '15px 10px',
  boxShadow: '0px 10px 30px rgba(189, 188, 249, 0.3)',
});

const StyledPanelHeader = styled('div', {
  display: 'flex',
  width: '100%',
});

const StyledSlideList = styled('ul', {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  maxHeight: 'calc(100%)',
  overflowY: 'scroll',
});
