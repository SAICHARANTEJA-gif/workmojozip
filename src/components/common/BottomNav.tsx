import React from 'react';
import { useApp } from '../../store/AppContext';
import {
  Home,
  Search,
  Briefcase,
  Bell,
  User,
  Users,
  Wallet,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;
  badge?: number;
}

export const BottomNav: React.FC = () => {
  const { activeRole, activeScreen, setActiveScreen, notifications, payments, t, theme } = useApp();
  const unreadCount = notifications.filter(n => !n.read).length;
  const pendingCount = payments.filter(p => p.status === 'PENDING').length;

  const workerNavItems: NavItem[] = [
    { id: 'home', label: t.navHome, icon: Home },
    { id: 'jobs', label: t.navJobs, icon: Search },
    { id: 'my_jobs', label: t.navMyJobs, icon: Briefcase },
    { id: 'payments', label: t.navPayments, icon: Wallet, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'profile', label: t.navProfile, icon: User },
  ];

  const customerNavItems: NavItem[] = [
    { id: 'home', label: t.navHome, icon: Home },
    { id: 'my_jobs', label: t.navMyJobs, icon: Briefcase },
    { id: 'applicants', label: t.navApplicants, icon: Users },
    { id: 'payments', label: t.navPayments, icon: Wallet, badge: pendingCount > 0 ? pendingCount : undefined },
    { id: 'profile', label: t.navProfile, icon: User },
  ];

  const items = activeRole === 'worker' ? workerNavItems : customerNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 backdrop-blur-md pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] px-3 select-none bg-white/98 border-t border-[#E2E8F0] shadow-lg">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveScreen(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
                isActive
                  ? 'text-[#2563EB] font-black scale-105'
                  : 'text-[#64748B] hover:text-[#111827] font-semibold'
              }`}
            >
              <div className="relative">
                <Icon size={21} strokeWidth={isActive ? 2.5 : 1.8} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-semibold">{item.label}</span>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full mt-0.5 bg-[#F5A900] shadow-xs"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
