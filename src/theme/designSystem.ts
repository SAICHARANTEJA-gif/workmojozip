/**
 * WorkMojo Central Design System Tokens & Style Presets
 * Palette: Pure White + Vibrant Blue System
 */

export const colors = {
  // Backgrounds & Surfaces
  bgPrimary: '#FFFFFF',
  bgSecondary: '#F7F9FC',
  bgSubtle: '#F1F5F9',
  card: '#FFFFFF',
  cardHover: '#F8FAFC',

  // Primary Brand Blues
  primaryBlue: '#2563EB',
  darkBlue: '#1D4ED8',
  lightBlue: '#EFF6FF',
  lightBlueBorder: '#DBEAFE',
  blueGlow: 'rgba(37, 99, 235, 0.12)',

  // WorkMojo Yellow / Gold Brand Accent (10%)
  workmojoYellow: '#F5A900',
  brightYellow: '#FFB800',
  yellowBg: '#FFFBEB',
  yellowBorder: '#FDE68A',
  yellowText: '#92400E',
  yellowGlow: 'rgba(245, 169, 0, 0.15)',

  // Typography
  textPrimary: '#111827',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',

  // Outlines & Borders
  border: '#E2E8F0',
  borderHover: '#CBD5E1',

  // Semantic Status Colors
  success: '#16A34A',
  successBg: '#DCFCE7',
  successBorder: '#BBF7D0',

  // Warning
  warning: '#F59E0B',
  warningBg: '#FEF3C7',
  warningBorder: '#FDE68A',

  // Error / Alert
  error: '#DC2626',
  errorBg: '#FEE2E2',
  errorBorder: '#FECACA',
} as const;

export const styles = {
  // Mobile app container
  appFrame: 'w-full max-w-md min-h-screen bg-white text-[#111827] border-x border-[#E2E8F0] shadow-xl flex flex-col relative',

  // Standard White Card
  card: 'bg-white rounded-3xl border border-[#E2E8F0] shadow-xs hover:shadow-md transition-all',
  cardInteractive: 'bg-white rounded-3xl border border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-md transition-all cursor-pointer',

  // Distinctive Blue Icon Badge
  iconBadge: 'w-10 h-10 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] shrink-0 shadow-2xs',
  iconBadgeSmall: 'w-8 h-8 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] shrink-0',
  iconBadgeLarge: 'w-12 h-12 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] shrink-0',

  // WorkMojo Yellow Icon Badge
  iconBadgeYellow: 'w-10 h-10 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[#F5A900] shrink-0 shadow-2xs',
  iconBadgeYellowSmall: 'w-8 h-8 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[#F5A900] shrink-0',

  // Buttons
  btnPrimary: 'bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white font-bold py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm',
  btnYellow: 'bg-[#F5A900] hover:bg-[#E09900] active:scale-[0.98] text-[#111827] font-black py-3 px-4 rounded-xl shadow-xs border border-[#FDE68A] transition-all flex items-center justify-center gap-2 text-sm',
  btnSecondary: 'bg-white hover:bg-[#EFF6FF] border-2 border-[#2563EB] text-[#2563EB] font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.98]',
  btnTertiary: 'bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] font-bold py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs',
  btnGhost: 'text-[#64748B] hover:text-[#111827] hover:bg-slate-100 font-semibold p-2 rounded-xl transition-all',

  // Pills and Badges
  pillBlue: 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] text-xs font-bold px-2.5 py-0.8 rounded-full flex items-center gap-1',
  pillYellow: 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] text-xs font-bold px-2.5 py-0.8 rounded-full flex items-center gap-1',
  pillSuccess: 'bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0] text-xs font-bold px-2.5 py-0.8 rounded-full flex items-center gap-1',
  pillWarning: 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] text-xs font-bold px-2.5 py-0.8 rounded-full flex items-center gap-1',

  // Form Inputs
  input: 'w-full bg-white border border-[#E2E8F0] focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF] rounded-xl px-3.5 py-2.5 text-sm text-[#111827] placeholder-[#94A3B8] font-medium outline-none transition-all',
} as const;

