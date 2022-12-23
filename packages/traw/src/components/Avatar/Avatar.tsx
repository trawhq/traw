import React from 'react';

export interface UserAvatarProps {
  avatarUrl?: string | undefined;
  userName: string;
  size?: number;
}
const RE_KOREAN = /[ㄱ-ㅎ|ㅏ-ㅣㅣ가-힣]/;

export const UserAvatar = ({ avatarUrl, userName, size = 24 }: UserAvatarProps) => {
  const isKorean = RE_KOREAN.test(userName.substring(0, 2));
  const shortName = userName.substring(0, isKorean ? 1 : 2).toUpperCase();

  if (!avatarUrl) {
    return (
      <div
        className="flex rounded-full bg-traw-grey-100 text-white items-center justify-center"
        style={{ width: `${size}px`, height: `${size}px`, fontSize: `${size * 0.6}px`, lineHeight: `${size}px` }}
      >
        {shortName}
      </div>
    );
  }
  return (
    <img
      className="flex rounded-full items-center justify-center"
      src={avatarUrl}
      alt={userName}
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
};

export default UserAvatar;
