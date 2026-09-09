import React from 'react';
import {
  Briefcase,
  CreditCard,
  MapPin,
  Bell,
  HardHat,
  User,
  Sparkles,
  Star,
  CheckCircle2,
  ShieldCheck,
  Search,
  Mic,
  Truck,
  Package,
  Wrench,
  Car,
  Shield,
  Building2,
  Lock,
  Phone,
  ArrowRight,
  Sliders,
  AlertTriangle,
} from 'lucide-react';

export type WorkMojoIconName =
  | 'jobs'
  | 'payments'
  | 'location'
  | 'notifications'
  | 'worker'
  | 'employer'
  | 'ai'
  | 'rating'
  | 'verified'
  | 'search'
  | 'voice'
  | 'delivery'
  | 'loading'
  | 'cleaning'
  | 'driving'
  | 'security'
  | 'construction'
  | 'repair'
  | 'shield'
  | 'lock'
  | 'phone'
  | 'preferences';

export type IconVariant = 'blue' | 'yellow' | 'green' | 'amber' | 'purple' | 'rose' | 'slate';
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface WorkMojoIconProps {
  name: WorkMojoIconName;
  variant?: IconVariant;
  size?: IconSize;
  badge?: boolean;
  className?: string;
}

const SIZE_MAP: Record<IconSize, { container: string; icon: number }> = {
  xs: { container: 'w-6 h-6 rounded-lg', icon: 13 },
  sm: { container: 'w-8 h-8 rounded-xl', icon: 16 },
  md: { container: 'w-10 h-10 rounded-xl', icon: 19 },
  lg: { container: 'w-12 h-12 rounded-2xl', icon: 24 },
  xl: { container: 'w-14 h-14 rounded-2xl', icon: 28 },
};

const VARIANT_MAP: Record<IconVariant, { bg: string; border: string; text: string }> = {
  blue: { bg: 'bg-[#EFF6FF]', border: 'border-[#DBEAFE]', text: 'text-[#2563EB]' },
  yellow: { bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]', text: 'text-[#F5A900]' },
  green: { bg: 'bg-[#F0FDF4]', border: 'border-[#BBF7D0]', text: 'text-[#16A34A]' },
  amber: { bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]', text: 'text-[#D97706]' },
  purple: { bg: 'bg-[#FAF5FF]', border: 'border-[#E9D5FF]', text: 'text-[#9333EA]' },
  rose: { bg: 'bg-[#FFF1F2]', border: 'border-[#FECDD3]', text: 'text-[#E11D48]' },
  slate: { bg: 'bg-[#F8FAFC]', border: 'border-[#E2E8F0]', text: 'text-[#475569]' },
};

const DEFAULT_VARIANTS: Record<WorkMojoIconName, IconVariant> = {
  jobs: 'blue',
  payments: 'green',
  location: 'blue',
  notifications: 'yellow',
  worker: 'yellow',
  employer: 'blue',
  ai: 'yellow',
  rating: 'yellow',
  verified: 'green',
  search: 'blue',
  voice: 'yellow',
  delivery: 'blue',
  loading: 'amber',
  cleaning: 'green',
  driving: 'purple',
  security: 'slate',
  construction: 'amber',
  repair: 'rose',
  shield: 'blue',
  lock: 'slate',
  phone: 'green',
  preferences: 'blue',
};

export const WorkMojoIcon: React.FC<WorkMojoIconProps> = ({
  name,
  variant,
  size = 'md',
  badge = true,
  className = '',
}) => {
  const chosenVariant = variant || DEFAULT_VARIANTS[name] || 'blue';
  const sizeConfig = SIZE_MAP[size];
  const variantConfig = VARIANT_MAP[chosenVariant];
  const iconSize = sizeConfig.icon;

  const renderGlyph = () => {
    switch (name) {
      case 'jobs':
        return <Briefcase size={iconSize} />;
      case 'payments':
        return <CreditCard size={iconSize} />;
      case 'location':
        return <MapPin size={iconSize} />;
      case 'notifications':
        return <Bell size={iconSize} />;
      case 'worker':
        return <HardHat size={iconSize} className="stroke-[2.5]" />;
      case 'employer':
        return (
          <div className="relative flex items-center justify-center">
            <User size={iconSize} className="stroke-[2.5]" />
            <Briefcase size={iconSize * 0.55} className="absolute -bottom-1 -right-1 text-[#2563EB] fill-[#EFF6FF]" />
          </div>
        );
      case 'ai':
        return <Sparkles size={iconSize} className="fill-current" />;
      case 'rating':
        return <Star size={iconSize} className="fill-current" />;
      case 'verified':
        return <CheckCircle2 size={iconSize} className="stroke-[2.5]" />;
      case 'search':
        return <Search size={iconSize} />;
      case 'voice':
        return <Mic size={iconSize} />;
      case 'delivery':
        return <Truck size={iconSize} />;
      case 'loading':
        return <Package size={iconSize} />;
      case 'cleaning':
        return <Sparkles size={iconSize} />;
      case 'driving':
        return <Car size={iconSize} />;
      case 'security':
        return <Shield size={iconSize} />;
      case 'construction':
        return <Building2 size={iconSize} />;
      case 'repair':
        return <Wrench size={iconSize} />;
      case 'shield':
        return <ShieldCheck size={iconSize} />;
      case 'lock':
        return <Lock size={iconSize} />;
      case 'phone':
        return <Phone size={iconSize} />;
      case 'preferences':
        return <Sliders size={iconSize} />;
      default:
        return <Sparkles size={iconSize} />;
    }
  };

  if (!badge) {
    return <span className={`${variantConfig.text} ${className}`}>{renderGlyph()}</span>;
  }

  return (
    <div
      className={`inline-flex items-center justify-center border shadow-2xs shrink-0 transition-transform ${sizeConfig.container} ${variantConfig.bg} ${variantConfig.border} ${variantConfig.text} ${className}`}
    >
      {renderGlyph()}
    </div>
  );
};

