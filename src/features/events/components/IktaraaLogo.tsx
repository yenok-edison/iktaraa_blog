import React from 'react';

interface IktaraaLogoProps {
  className?: string;
  variant?: 'light' | 'dark' | 'auto';
  height?: string;
  onClick?: () => void;
}

export const IktaraaLogo: React.FC<IktaraaLogoProps> = ({
  className = '',
  variant = 'auto',
  height = 'h-10 sm:h-11 md:h-12',
  onClick,
}) => {
  const invertClass = variant === 'light' ? 'brightness-0 invert opacity-95' : '';

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      title="Iktaraa — String The World of Music"
    >
      <img
        src="/iktaraa.svg"
        alt="Iktaraa"
        className={`${height} w-auto max-w-[240px] sm:max-w-[280px] object-contain transition-transform hover:scale-102 ${invertClass}`}
        onError={(e) => {
          (e.currentTarget as HTMLElement).style.display = 'none';
        }}
      />
    </div>
  );
};
