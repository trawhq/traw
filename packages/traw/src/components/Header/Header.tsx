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
            className="bg-red-500 hover:bg-red-600 text-white rounded-full h-8 px-3 flex items-center justify-center gap-2"
            onClick={onClickStopRecording}
          >
            <svg
              className="text-red-500 hover:text-red-600"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="12" fill="white" />
              <rect x="7" y="7" width="10" height="10" fill="currentColor" />
            </svg>
            Stop
          </button>
        ) : (
          <button
            className="bg-traw-purple hover:bg-indigo-600 text-white font-bold h-8 px-3 rounded-full flex items-center justify-center gap-2 transition-colors duration-150"
            onClick={onClickStartRecording}
          >
            <svg
              className="text-red-500 hover:text-red-700"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="12" fill="white" />
              <circle cx="12" cy="12" r="7" fill="currentColor" />
            </svg>
            Record
          </button>
        )}
      </div>
    </div>
  );
};

export default Header;
