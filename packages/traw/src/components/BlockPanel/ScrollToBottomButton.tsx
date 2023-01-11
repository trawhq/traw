import React from 'react';
import { styled } from 'stitches.config';
import { ArrowDownIcon } from '@radix-ui/react-icons';
import { TrawButton } from 'components/Primitives/TrawButton/TrawButton';

const ScrollToBottomButton = ({ handleClick }: { handleClick: any }) => {
  return (
    <StyledButton onClick={handleClick} className="animate-bounce" variant="primary">
      Scroll to bottom
      <ArrowDownIcon />
    </StyledButton>
  );
};

export default ScrollToBottomButton;

const StyledButton = styled(TrawButton, {
  position: 'absolute',
  bottom: 0,
  width: '80%',
  left: '10%',
  zIndex: 1001,
  boxShadow: '0px 10px 30px rgba(189, 188, 249, 0.3)',
  transition: 'all 0.15s  cubic-bezier(0.4, 0, 0.2, 1)',
  gap: '3px',
});
