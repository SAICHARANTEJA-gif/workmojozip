import React from 'react';
import { useApp } from '../../store/AppContext';
import { MojoMascotIcon } from '../mojo/MojoMascotIcon';
import {
  Bell,
  HardHat,
  Briefcase,
  Radio,
  Sparkles,
  Sun,
  Moon,
} from 'lucide-react';
import { SupportedLanguage } from '../../types';

export const Header: React.FC = () => {
  const {
    user,
    activeRole,
    toggleRole,
    setUserAvailability,
    notifications,
    setActiveScreen,
    language,
    setLanguage,
    t,
    theme,
    toggleTheme,
  } = useApp();

  const unreadCount = notifications.filter(n => !n.read).length;

  const languages: Array<{ code: SupportedLanguage; label: string }> = [
    { code: 'en', label: 'EN' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ta', label: 'தமிழ்' },
  ];

  const getAvailabilityLabel = (st: 'Available' | 'Busy' | 'Away') => {
    if (st === 'Available') return t.available.split(' ')[0] || 'Available';
    if (st === 'Busy') return t.busy.split(' ')[0] || 'Busy';
    return t.away || 'Away';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 pt-[max(0.625rem,env(safe-area-inset-top))] pb-2.5 shadow-2xs">
      <div className="flex items-center justify-between gap-2 max-w-lg mx-auto">
        {/* Brand & Mascot */}
        <div
          onClick={() => setActiveScreen('home')}
          className="flex items-center gap-2 cursor-pointer select-none group shrink-0"
        >
          <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow-xs border-2 border-[#2563EB]/20 overflow-hidden flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
            <img src="/logo.png" alt="Work Mojo Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-[#111827] leading-none whitespace-nowrap">
                {t.appName.split(' ')[0]} <span className="text-[#2563EB]">{t.appName.split(' ')[1] || 'MOJO'}</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#F5A900] ml-0.5 align-top animate-pulse" />
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-[#64748B] font-semibold truncate max-w-[100px] sm:max-w-[130px] leading-tight mt-0.5">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Right Action Tools: Language, Role Switcher, Notifications */}
        <div className="flex items-center gap-1.5">
          {/* Language Selector Dropdown */}
          <div className="flex items-center bg-[#EFF6FF] rounded-xl p-0.5 border border-[#DBEAFE]">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-lg transition-colors cursor-pointer ${
                  language === lang.code
                    ? 'bg-[#2563EB] text-white font-black shadow-2xs'
                    : 'text-[#64748B] hover:text-[#111827]'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* DUAL ROLE SWITCHER - Yellow WorkMojo Highlight CTA Button */}
          <button
            onClick={toggleRole}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all shadow-xs active:scale-95 bg-[#F5A900] hover:bg-[#E09900] text-[#111827] border border-[#FDE68A] cursor-pointer"
            title="Switch between Worker and Customer mode"
          >
            {activeRole === 'worker' ? (
              <>
                <HardHat size={14} className="text-[#111827]" />
                <span className="text-[11px] font-black">{t.workerMode.split(' ')[0]}</span>
              </>
            ) : (
              <>
                <Briefcase size={14} className="text-[#111827]" />
                <span className="text-[11px] font-black">{t.customerMode.split(' ')[0]}</span>
              </>
            )}
          </button>

          {/* Notifications Bell */}
          <button
            onClick={() => setActiveScreen('notifications')}
            className="relative p-2 text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#DBEAFE] rounded-xl transition-colors shadow-2xs"
            title="Notifications"
          >
            <Bell size={17} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center animate-pulse shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Sub-bar for Worker Availability Toggle */}
      {activeRole === 'worker' && (
        <div className="mt-2 pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs max-w-lg mx-auto">
          <div className="flex items-center gap-1.5 text-[#64748B] font-semibold">
            <Radio size={13} className="text-[#2563EB] animate-pulse" />
            <span>{t.statusLabel}</span>
          </div>

          <div className="flex items-center gap-1 p-0.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC]">
            {(['Available', 'Busy', 'Away'] as const).map(st => (
              <button
                key={st}
                onClick={() => setUserAvailability(st)}
                className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition-all ${
                  user.availability === st
                    ? st === 'Available'
                      ? 'bg-[#16A34A] text-white font-black shadow-xs'
                      : 'bg-white text-[#111827] font-black shadow-xs border border-[#E2E8F0]'
                    : 'text-[#64748B] hover:text-[#111827]'
                }`}
              >
                {getAvailabilityLabel(st)}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
