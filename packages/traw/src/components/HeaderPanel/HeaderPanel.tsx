import { useTrawApp } from 'hooks';
import SvgLogoSmall from 'icons/Logo';
import React, { useCallback, memo } from 'react';
import { styled } from 'stitches.config';
import { breakpoints } from 'utils/breakpoints';
import Title from './Title';

interface HeaderPanelProps {
  handleChangeTitle?: (newValue: string) => void;
  handleNavigateHome?: () => void;
}

export const HeaderPanel = memo(function HeaderPanel({ handleChangeTitle, handleNavigateHome }: HeaderPanelProps) {
  const app = useTrawApp();
  const state = app.useStore();
  const { document } = state;

  const handleTitle = useCallback(
    (newValue: string) => {
      handleChangeTitle?.(newValue);
    },
    [handleChangeTitle],
  );

  const handleClickLogo = () => {
    handleNavigateHome ? handleNavigateHome() : window.open('https://app.traw.io', '_blank');
  };

  return (
    <>
      <StyledHeaderPanelContainer bp={breakpoints}>
        <button onClick={handleClickLogo}>
          <SvgLogoSmall className="w-6 h-6" />
        </button>
        <div className="flex items-center">
          <Title title={document.name} canEdit={document.canEdit} handleChangeTitle={handleTitle} />
        </div>
      </StyledHeaderPanelContainer>
    </>
  );
});

const StyledHeaderPanelContainer = styled('div', {
  position: 'absolute',
  top: 10,
  left: 16,
  marginRight: 16,
  minHeight: 0,
  width: 'auto',
  height: 50,
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
  backgroundColor: '#FFF',
  paddingLeft: 10,
  paddingRight: 10,
  boxShadow: '0px 10px 30px rgba(189, 188, 249, 0.3)',

  '& > div > *': {
    pointerEvents: 'all',
  },
  '& > button': {
    pointerEvents: 'all',
  },
  variants: {
    bp: {
      mobile: {},
      small: {},
      medium: {},
      large: {},
    },
  },
});
