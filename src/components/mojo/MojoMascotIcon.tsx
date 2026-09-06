import React from 'react';

interface MascotProps {
  className?: string;
  size?: number;
  animated?: boolean;
}

export const MojoMascotIcon: React.FC<MascotProps> = ({ className = '', size = 44, animated = true }) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${animated ? 'animate-bounce-subtle' : ''} ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Hamster Ears */}
        <circle cx="26" cy="28" r="14" fill="#D97706" />
        <circle cx="26" cy="28" r="8" fill="#FDE68A" />
        <circle cx="74" cy="28" r="14" fill="#D97706" />
        <circle cx="74" cy="28" r="8" fill="#FDE68A" />

        {/* Yellow Hardhat Hat */}
        <path
          d="M24 38 C24 16, 76 16, 76 38 Z"
          fill="#F59E0B"
          stroke="#B45309"
          strokeWidth="3"
        />
        <path
          d="M18 38 C18 36, 82 36, 82 38 C82 42, 18 42, 18 38 Z"
          fill="#FBBF24"
          stroke="#B45309"
          strokeWidth="2"
        />
        {/* Hardhat Crest */}
        <path d="M46 22 H54 V36 H46 Z" fill="#FEF3C7" />

        {/* Hamster Head / Body */}
        <ellipse cx="50" cy="58" rx="36" ry="32" fill="#F59E0B" />
        
        {/* Fluffy Cheeks */}
        <ellipse cx="32" cy="62" rx="16" ry="14" fill="#FEF3C7" />
        <ellipse cx="68" cy="62" rx="16" ry="14" fill="#FEF3C7" />
        <ellipse cx="50" cy="66" rx="20" ry="16" fill="#FFFBEB" />

        {/* Big Friendly Eyes */}
        <ellipse cx="38" cy="50" rx="5" ry="6.5" fill="#1E293B" />
        <circle cx="36" cy="48" r="2.2" fill="#FFFFFF" />
        <circle cx="40" cy="53" r="1" fill="#FFFFFF" />

        <ellipse cx="62" cy="50" rx="5" ry="6.5" fill="#1E293B" />
        <circle cx="60" cy="48" r="2.2" fill="#FFFFFF" />
        <circle cx="64" cy="53" r="1" fill="#FFFFFF" />

        {/* Cute Pink Nose */}
        <ellipse cx="50" cy="58" rx="4" ry="2.8" fill="#F43F5E" />

        {/* Hamster Whiskers */}
        <line x1="20" y1="58" x2="10" y2="56" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="20" y1="62" x2="10" y2="64" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="80" y1="58" x2="90" y2="56" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="80" y1="62" x2="90" y2="64" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />

        {/* Cheerful Smile */}
        <path
          d="M45 63 Q50 67 55 63"
          stroke="#1E293B"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Little Wrench Tool held in paw */}
        <g transform="translate(68, 62) rotate(25) scale(0.6)">
          <path
            d="M5 25 L20 10 L25 15 L10 30 Z"
            fill="#64748B"
            stroke="#334155"
            strokeWidth="2"
          />
          <circle cx="22" cy="12" r="7" fill="#64748B" stroke="#334155" strokeWidth="2" />
          <path d="M22 6 L22 14" stroke="#F1F5F9" strokeWidth="2" />
        </g>
        
        {/* Tiny Paws */}
        <ellipse cx="36" cy="78" rx="6" ry="4" fill="#FDE68A" stroke="#D97706" strokeWidth="1" />
        <ellipse cx="64" cy="78" rx="6" ry="4" fill="#FDE68A" stroke="#D97706" strokeWidth="1" />
      </svg>
    </div>
  );
};
