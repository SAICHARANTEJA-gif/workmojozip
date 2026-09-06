import React from 'react';
import { useApp } from '../../store/AppContext';
import { MojoMascotIcon } from '../mojo/MojoMascotIcon';
import {
  Bell,
  Briefcase,
  UserCheck,
  Radio,
  Sparkles,
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
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 pt-[max(0.625rem,env(safe-area-inset-top))] pb-2.5 shadow-md">
      <div className="flex items-center justify-between gap-2 max-w-lg mx-auto">
        {/* Brand & Mascot */}
        <div
          onClick={() => setActiveScreen('home')}
          className="flex items-center gap-2 cursor-pointer select-none group shrink-0"
        >
          <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow-sm border border-amber-400/40 overflow-hidden flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
            <img src="/logo.png" alt="Work Mojo Logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white leading-none whitespace-nowrap">
                {t.appName.split(' ')[0]} <span className="text-amber-400">{t.appName.split(' ')[1] || 'MOJO'}</span>
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate max-w-[100px] sm:max-w-[130px] leading-tight mt-0.5">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Right Action Tools: Language, Role Switcher, Notifications */}
        <div className="flex items-center gap-1.5">
          {/* Language Selector Dropdown */}
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${
                  language === lang.code
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* DUAL ROLE SWITCHER */}
          <button
            onClick={toggleRole}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all shadow-sm active:scale-95 ${
              activeRole === 'worker'
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-indigo-600 text-white hover:bg-indigo-500'
            }`}
            title="Switch between Worker and Customer mode"
          >
            {activeRole === 'worker' ? (
              <>
                <Briefcase size={12} />
                <span className="text-[11px]">{t.workerMode.split(' ')[0]}</span>
              </>
            ) : (
              <>
                <UserCheck size={12} />
                <span className="text-[11px]">{t.customerMode.split(' ')[0]}</span>
              </>
            )}
          </button>

          {/* Notifications Bell */}
          <button
            onClick={() => setActiveScreen('notifications')}
            className="relative p-1.5 text-slate-300 hover:text-amber-400 hover:bg-slate-800 rounded-full transition-colors"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Sub-bar for Worker Availability Toggle */}
      {activeRole === 'worker' && (
        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs max-w-lg mx-auto">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <Radio size={13} className="text-amber-400 animate-pulse" />
            <span>{t.statusLabel}</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
            {(['Available', 'Busy', 'Away'] as const).map(st => (
              <button
                key={st}
                onClick={() => setUserAvailability(st)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                  user.availability === st
                    ? st === 'Available'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : st === 'Busy'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
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
