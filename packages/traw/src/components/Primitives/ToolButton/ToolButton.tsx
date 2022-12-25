import { Tooltip } from 'components/Primitives/Tooltip';
import { useTldrawApp } from 'hooks/useTldrawApp';
import * as React from 'react';
import { breakpoints } from 'utils/breakpoints';
import { styled } from 'stitches.config';

export interface ToolButtonProps {
  onClick?: () => void;
  onSelect?: () => void;
  onDoubleClick?: () => void;
  disabled?: boolean;
  isActive?: boolean;
  isToolLocked?: boolean;
  variant?: 'icon' | 'text' | 'circle' | 'primary';
  children: React.ReactNode;
  id?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
}

export const ToolButton = React.forwardRef<HTMLButtonElement, ToolButtonProps>(
  (
    {
      onSelect,
      onClick,
      onDoubleClick,
      variant,
      children,
      isToolLocked = false,
      disabled = false,
      isActive = false,
      onKeyDown,
      id,
      ...rest
    },
    ref,
  ) => {
    return (
      <StyledToolButton
        ref={ref}
        isActive={isActive}
        variant={variant}
        onClick={onClick}
        disabled={disabled}
        onPointerDown={onSelect}
        onDoubleClick={onDoubleClick}
        onKeyDown={onKeyDown}
        bp={breakpoints}
        id={id}
        {...rest}
      >
        <StyledToolButtonInner>{children}</StyledToolButtonInner>
        {isToolLocked && <ToolLockIndicator />}
      </StyledToolButton>
    );
  },
);
ToolButton.displayName = 'ToolButton';

/* ------------------ With Tooltip ------------------ */

interface ToolButtonWithTooltipProps extends ToolButtonProps {
  label: string;
  isLocked?: boolean;
  kbd?: string;
}

export function ToolButtonWithTooltip({ label, kbd, isLocked, ...rest }: ToolButtonWithTooltipProps) {
  const app = useTldrawApp();

  const handleDoubleClick = React.useCallback(() => {
    app.toggleToolLock();
  }, [app]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === ' ' && app.isForcePanning) {
        e.preventDefault();
      }
    },
    [app],
  );

  return (
    <Tooltip label={label[0].toUpperCase() + label.slice(1)} kbd={kbd}>
      <ToolButton
        {...rest}
        variant="primary"
        isToolLocked={isLocked && rest.isActive}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
      />
    </Tooltip>
  );
}

export const StyledToolButtonInner = styled('div', {
  position: 'relative',
  height: '100%',
  width: '100%',
  backgroundColor: '$panel',
  borderRadius: '9999px',
  margin: '0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: '$ui',
  color: 'inherit',
  userSelect: 'none',
  boxSizing: 'border-box',
  border: '1px solid transparent',
  '-webkit-tap-highlight-color': 'transparent',
  'tap-highlight-color': 'transparent',
});

export const StyledToolButton = styled('button', {
  position: 'relative',
  color: '$text',
  fontSize: '$0',
  background: 'none',
  margin: '0',
  padding: '$2',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  outline: 'none',
  cursor: 'pointer',
  pointerEvents: 'all',
  height: '27px',
  width: '27px',
  border: '1px solid $panel',
  '-webkit-tap-highlight-color': 'transparent',
  'tap-highlight-color': 'transparent',

  [`&:disabled ${StyledToolButtonInner}`]: {
    opacity: 0.618,
  },

  variants: {
    variant: {
      primary: {
        marginTop: '0',
      },
      icon: {
        [`& ${StyledToolButtonInner}`]: {
          display: 'grid',
          '& > *': {
            gridRow: 1,
            gridColumn: 1,
          },
        },
      },
      text: {
        width: 'auto',
        [`& ${StyledToolButtonInner}`]: {
          fontSize: '$1',
          padding: '0 $3',
          gap: '$3',
        },
      },
      circle: {
        padding: 0,
        height: 32,
        width: 32,
        border: 'none',
        [`& ${StyledToolButtonInner}`]: {
          border: '1px solid $panelContrast',
          borderRadius: '100%',
          boxShadow: '$panel',
        },
        [`& ${StyledToolButtonInner} > svg`]: {
          width: 14,
          height: 14,
        },
      },
    },
    isActive: {
      true: {},
      false: {},
    },
    bp: {
      mobile: {
        padding: 0,
      },
      small: {},
    },
  },
  compoundVariants: [
    {
      variant: 'primary',
      bp: 'mobile',
      css: {
        height: 27,
        width: 27,
        [`& ${StyledToolButtonInner} > svg`]: {
          width: 13,
          height: 13,
          color: '#5B5F80',
        },
      },
    },
    {
      variant: 'primary',
      bp: 'small',
      css: {
        height: '27px',
        width: '27px',
        [`& ${StyledToolButtonInner} > svg`]: {
          width: 13,
          height: 13,
          color: '#5B5F80',
        },
      },
    },
    {
      isActive: true,
      css: {
        [`${StyledToolButtonInner}`]: {
          backgroundColor: '$selected',
        },
      },
    },
    {
      isActive: false,
      bp: 'small',
      css: {
        [`&:hover:not(:disabled) ${StyledToolButtonInner}`]: {
          backgroundColor: '$hover',
        },
        [`&:focus:not(:disabled) ${StyledToolButtonInner}`]: {
          backgroundColor: '$hover',
        },
      },
    },
  ],
});

const ToolLockIndicator = styled('div', {
  position: 'absolute',
  width: 10,
  height: 10,
  backgroundColor: '$selected',
  borderRadius: '100%',
  bottom: -2,
  border: '2px solid $panel',
  zIndex: 100,
});