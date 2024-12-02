'use client';

import { USER_COLORS, Username } from '../constants/userColors';

const ANIMAL_AVATARS = {
  Tejesh: "🎨",
  Manu: "🏏",
  Prakhar: "🍿",
};

type AvatarProps = {
  username: string;
  size?: 'sm' | 'md' | 'lg';
  isActive?: boolean;
};

export default function Avatar({ username, size = 'md', isActive = false }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-xl',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl',
  };

  const userColor = USER_COLORS[username as Username];

  return (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-full
        flex items-center justify-center
        ${isActive ? 
          `${userColor.active} shadow-lg ring-4 ring-white/50` : 
          'bg-gradient-to-br from-gray-100 to-gray-200'
        }
        transition-all duration-300
        hover:shadow-xl
        cursor-pointer
        transform hover:scale-110
        select-none
      `}
    >
      <span className="select-none text-white">
        {ANIMAL_AVATARS[username as keyof typeof ANIMAL_AVATARS] || '👤'}
      </span>
    </div>
  );
} 