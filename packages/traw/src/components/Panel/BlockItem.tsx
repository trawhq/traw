import React, { useMemo } from 'react';
import SvgPlayArrow from '../../icons/play-arrow';
import SvgVolume from '../../icons/volume';
import SvgVolumeOff from '../../icons/volume-off';
import { UserAvatar } from '../Avatar/Avatar';
import moment from 'moment';

export interface BlockItemProps {
  userName: string;
  date: string | number;
  blockText: string;
  isVoiceBlock: boolean;
  handlePlayClick: () => void;
}

export const BlockItem = ({ userName, date, blockText, isVoiceBlock, handlePlayClick }: BlockItemProps) => {
  const dateStr = useMemo(() => {
    if (typeof date === 'string') {
      return date;
    } else {
      return moment(date).format('hh:mm A');
    }
  }, [date]);

  return (
    <li className="rounded-[10px] bg-white p-2 w-full border border-traw-grey-10 mb-2.5">
      <div className="flex flex-1 flex-row items-center w-full grow">
        <div className="flex relative">
          <UserAvatar avatarUrl={undefined} userName={userName} />
          <div className="absolute flex items-center justify-center bottom-0 -right-[3px] w-[11px] h-[11px] rounded-full bg-white color-traw-grey">
            {isVoiceBlock ? (
              <SvgVolume className="fill-current w-2 h-2" />
            ) : (
              <SvgVolumeOff className="fill-current w-2 h-2" />
            )}
          </div>
        </div>
        <div className="font-bold text-[13px] text-traw-grey-dark ml-2">{userName}</div>
        <div className="text-traw-grey-100 text-[10px] ml-1">{dateStr}</div>
        <div className="flex grow gap-1 justify-end">
          <button className="rounded-full hover:bg-black/[.04] p-1 text-traw-grey-100" onClick={handlePlayClick}>
            <SvgPlayArrow className="fill-current w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="mt-2 text-[13px] text-traw-gry py-1">{blockText}</div>
    </li>
  );
};

export default BlockItem;
