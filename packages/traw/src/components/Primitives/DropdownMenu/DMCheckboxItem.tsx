import { CheckboxItem } from '@radix-ui/react-dropdown-menu';
import * as React from 'react';
import { preventEvent } from 'utils/preventEvent';
import { RowButtonProps, RowButton } from '../RowButton';

interface DMCheckboxItemProps {
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (isChecked: boolean | 'indeterminate') => void;
  children: React.ReactNode;
  variant?: RowButtonProps['variant'];
  kbd?: string;
  id?: string;
}

export function DMCheckboxItem({
  checked,
  disabled = false,
  variant,
  onCheckedChange,
  kbd,
  id,
  children,
}: DMCheckboxItemProps) {
  return (
    <CheckboxItem
      dir="ltr"
      onSelect={preventEvent}
      onCheckedChange={onCheckedChange}
      checked={checked}
      disabled={disabled}
      asChild
      id={id}
    >
      <RowButton kbd={kbd} variant={variant} hasIndicator>
        {children}
      </RowButton>
    </CheckboxItem>
  );
}
