import React, { useState } from 'react';
import { UserRole, AvailabilityStatus } from '../../types';
import { HardHat, Briefcase, User, CheckCircle2 } from 'lucide-react';

interface UserAvatarProps {
  src?: string | null;
  name: string;
  role: UserRole;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showAvailability?: boolean;
  availability?: AvailabilityStatus;
  className?: string;
}

const SIZE_CONFIG = {
  sm: { container: 'w-8 h-8 rounded-xl', icon: 16, dot: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5' },
  md: { container: 'w-11 h-11 rounded-2xl', icon: 20, dot: 'w-3 h-3 -bottom-0.5 -right-0.5' },
  lg: { container: 'w-14 h-14 rounded-2xl', icon: 26, dot: 'w-3.5 h-3.5 -bottom-1 -right-1' },
  xl: { container: 'w-16 h-16 rounded-2xl', icon: 30, dot: 'w-4 h-4 -bottom-1 -right-1' },
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  role,
  size = 'md',
  showAvailability = false,
  availability = 'Available',
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);
  const cfg = SIZE_CONFIG[size];

  const hasValidPhoto = src && src.trim() !== '' && !imgError;

  const renderDefaultAvatar = () => {
    if (role === 'worker') {
      return (
        <div className="w-full h-full bg-gradient-to-tr from-[#2563EB] to-[#60A5FA] flex flex-col items-center justify-center text-white relative">
          <HardHat size={cfg.icon} className="stroke-[2.2] text-[#FFB800] fill-[#FFFBEB]" />
        </div>
      );
    }
    return (
      <div className="w-full h-full bg-gradient-to-tr from-[#1E293B] to-[#475569] flex flex-col items-center justify-center text-white relative">
        <User size={cfg.icon} className="stroke-[2.2] text-white" />
        <Briefcase size={cfg.icon * 0.45} className="absolute bottom-1 right-1 text-[#F5A900] fill-[#FFFBEB]" />
      </div>
    );
  };

  const getStatusColor = () => {
    switch (availability) {
      case 'Available':
        return 'bg-[#16A34A]';
      case 'Busy':
        return 'bg-[#F5A900]';
      case 'Away':
      default:
        return 'bg-[#94A3B8]';
    }
  };

  return (
    <div className={`relative inline-block shrink-0 ${cfg.container} ${className}`}>
      <div
        className={`w-full h-full overflow-hidden border-2 border-white shadow-xs ${cfg.container} bg-[#F1F5F9]`}
      >
        {hasValidPhoto ? (
          <img
            src={src}
            alt={name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          renderDefaultAvatar()
        )}
      </div>

      {showAvailability && (
        <span
          className={`absolute rounded-full border-2 border-white shadow-2xs ${cfg.dot} ${getStatusColor()}`}
          title={`Status: ${availability}`}
        />
      )}
    </div>
  );
};

