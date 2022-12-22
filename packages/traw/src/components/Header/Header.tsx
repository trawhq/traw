import React, { ReactNode } from 'react';
import Logo from '../../icons/Logo';
import Title from './Title';

export interface HeaderProps {
  // Title
  title: string;
  canEdit: boolean;
  handleChangeTitle: (name: string) => void;

  isRecording?: boolean;
  onClickStartRecording?: () => void;
  onClickStopRecording?: () => void;

  // Room
  Room: ReactNode;
}

export const Header = ({
  title,
  canEdit,
  handleChangeTitle,
  Room,
  isRecording,
  onClickStartRecording,
  onClickStopRecording,
}: HeaderProps) => {
  return (
    <div className="flex flex-row h-14 pl-3 bg-white items-center rounded-2xl shadow-[0_10px_60px_rgba(189,188,249,0.5)]">
      <button className="flex h-9 w-9 rounded-full bg-white items-center justify-center text-xl hover:bg-traw-sky">
        <Logo />
      </button>
      <div className="ml-2">
        <Title title={title} canEdit={canEdit} handleChangeTitle={handleChangeTitle} />
      </div>
      <div className="flex flex-grow justify-end gap-1 px-4">
        {Room}
        {isRecording ? (
          <button
            className="bg-red-500 text-white rounded-full h-8 w-8 flex items-center justify-center"
            onClick={onClickStopRecording}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
                fill="white"
              />
              <path d="M9 16V8H15V16H9ZM11 10H13V14H11V10Z" fill="white" />
            </svg>
          </button>
        ) : (
          <button className="bg-red-500 text-white font-bold py-2 px-4 rounded-full" onClick={onClickStartRecording}>
            {/* Record Icon */}
            Record
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
