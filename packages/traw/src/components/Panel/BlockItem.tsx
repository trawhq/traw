import React, { useCallback, useMemo } from 'react';
import { UserAvatar } from '../Avatar/Avatar';
import moment from 'moment';
import classNames from 'classnames';

export interface BlockItemProps {
  userName: string;
  blockId: string;
  date: string | number;
  blockText: string;
  isVoiceBlock: boolean;
  handlePlayClick: (blockId: string) => void;
}

export const BlockItem = ({ userName, blockId, date, isVoiceBlock, blockText, handlePlayClick }: BlockItemProps) => {
  const dateStr = useMemo(() => {
    if (typeof date === 'string') {
      return date;
    } else {
      return moment(date).format('hh:mm A');
    }
  }, [date]);

  const onClick = useCallback(() => {
    handlePlayClick(blockId);
  }, [blockId, handlePlayClick]);

  return (
    <li className="bg-white w-full">
      <div className="flex flex-1 flex-row items-center w-full grow gap-1">
        <div className="flex relative">
          <UserAvatar avatarUrl={undefined} userName={userName} size={15} />
        </div>
        <div className="font-bold text-[13px] text-traw-grey-dark">{userName}</div>
        <div className="text-traw-grey-100 text-[10px]">{dateStr}</div>
      </div>
      <span
        className={classNames('mt-2', 'text-xs', 'rounded-md', 'py-1', 'px-0.5', 'transition-colors', {
          'cursor-pointer': isVoiceBlock,
          'hover:bg-traw-grey-50': isVoiceBlock,
        })}
        onClick={onClick}
      >
        {blockText || '[Empty]'}
      </span>
    </li>
  );
};

export default BlockItem;
