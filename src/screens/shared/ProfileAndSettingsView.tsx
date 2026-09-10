import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { SupportedLanguage, WorkerPaymentPreference } from '../../types';
import {
  User,
  ShieldCheck,
  Star,
  Phone,
  Globe,
  Sliders,
  HelpCircle,
  UserX,
  Trash2,
  LogOut,
  ChevronRight,
  Briefcase,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  CreditCard,
  Banknote,
  Check,
  Wallet,
  Sun,
  Moon,
  Camera,
  AlertCircle,
} from 'lucide-react';
import { UserAvatar } from '../../components/common/UserAvatar';

export const ProfileAndSettingsView: React.FC = () => {
  const {
    user,
    activeRole,
    toggleRole,
    deleteAccount,
    changePhoneNumber,
    updateUserProfile,
    language,
    setLanguage,
    blockedUsers,
    unblockUser,
    setOnboardingStep,
    updateWorkerPaymentPreference,
    setActiveScreen,
    theme,
    toggleTheme,
    t,
  } = useApp();

  const [activeSubView, setActiveSubView] = useState<
    'menu' | 'change_phone' | 'language' | 'help' | 'blocked' | 'delete_confirm' | 'payment_preference'
  >('menu');

  // Profile photo upload state
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoSuccess, setPhotoSuccess] = useState<string | null>(null);

  // Change phone state
  const [newPhoneInput, setNewPhoneInput] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [phoneSuccess, setPhoneSuccess] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    setPhotoSuccess(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate MIME type: JPEG, PNG, WebP
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setPhotoError('Only JPEG, PNG, or WebP formats are supported.');
      return;
    }

    // Validate size: 5MB maximum
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setPhotoError('Image size exceeds 5MB limit. Please upload a smaller photo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (result) {
        updateUserProfile({ profilePhoto: result });
        setPhotoSuccess('Profile photo updated successfully!');
        setTimeout(() => setPhotoSuccess(null), 3000);
      }
    };
    reader.onerror = () => {
      setPhotoError(t.uploadFailed || 'Failed to read photo file.');
    };
    reader.readAsDataURL(file);
  };

  const languages: Array<{ code: SupportedLanguage; label: string; native: string }> = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  ];

  const handleSendPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPhoneInput.length >= 10) {
      setOtpStep(true);
    }
  };

  const handleVerifyPhoneOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length === 6) {
      changePhoneNumber(`+91 ${newPhoneInput}`);
      setPhoneSuccess(true);
      setTimeout(() => {
        setPhoneSuccess(false);
        setOtpStep(false);
        setActiveSubView('menu');
      }, 1400);
    }
  };

  const faqs = [
    {
      q: 'How does Work Mojo match workers and customers?',
      a: 'We use a 6-factor Fair AI Match formula considering verified skills (30%), commute distance (20%), live availability (20%), rating (15%), experience (10%), and reliability (5%).',
    },
    {
      q: 'When is my workplace location visible?',
      a: 'Privacy Shield protects your privacy. Before confirmation, only the approximate neighborhood is displayed. Exact house/shop number and route navigation unlock only after mutual confirmation.',
    },
    {
      q: 'How does Automatic Waiting-List replacement work?',
      a: 'When all job slots are full, additional applicants receive a waiting list position (e.g. #1). If any confirmed worker cancels their slot, Waiting List #1 is instantly promoted to Confirmed!',
    },
    {
      q: 'How are payments handled?',
      a: 'Work Mojo does not charge fees or process payments. Workers and customers settle wages directly in Cash or UPI upon shift completion.',
    },
  ];

  return (
    <div className="pb-24 max-w-lg mx-auto px-4 pt-3 space-y-4 min-h-screen text-[#111827] bg-[#F8FAFC]">
      {/* Profile Header */}
      <div className="rounded-3xl p-5 border border-[#E2E8F0] bg-white shadow-xs space-y-4 relative overflow-hidden">
        {/* Subtle decorative top accent line */}
        <div className="h-1 w-full bg-gradient-to-r from-[#2563EB] via-[#F5A900] to-[#2563EB] rounded-t-3xl -mt-5 -mx-5 mb-4" />

        <div className="flex items-center gap-4">
          <div className="relative shrink-0 group">
            <UserAvatar
              src={user.profilePhoto}
              name={user.name}
              role={activeRole}
              size="xl"
              showAvailability={true}
              availability={user.availability}
            />
            <label
              htmlFor="profile-photo-upload-input"
              className="absolute -bottom-1 -right-1 p-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-full shadow-md cursor-pointer border-2 border-white transition-transform active:scale-90"
              title={t.uploadProfilePhoto || "Upload Profile Photo"}
            >
              <Camera size={14} />
              <input
                id="profile-photo-upload-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </label>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xl font-black truncate text-[#111827]">
                {user.name}
              </h2>
              <span title="KYC Verified" className="shrink-0">
                <ShieldCheck size={18} className="text-[#2563EB]" />
              </span>
            </div>
            <div className="text-xs font-bold mt-0.5 text-[#64748B]">
              {user.phone}
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs font-black flex-wrap">
              {/* Yellow Rating Badge */}
              <span className="flex items-center gap-1 bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] px-2.5 py-0.5 rounded-full font-bold shadow-2xs">
                <Star size={12} className="fill-[#F5A900] text-[#F5A900]" />
                {user.rating}★ Rating
              </span>
              <span className="px-2.5 py-0.5 rounded-full font-bold border bg-emerald-50 border-emerald-200 text-emerald-700 shadow-2xs">
                {user.reliabilityScore}% {t.reliable}
              </span>
            </div>
          </div>
        </div>

        {photoError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-2.5 rounded-xl flex items-center gap-2 animate-in fade-in">
            <AlertCircle size={15} className="shrink-0" />
            <span>{photoError}</span>
          </div>
        )}
        {photoSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold p-2.5 rounded-xl flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={15} className="shrink-0" />
            <span>{photoSuccess}</span>
          </div>
        )}

        {/* Role Toggle Card */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] text-xs transition-colors">
          <div>
            <div className="font-black text-[#111827]">
              {t.statusLabel || 'Mode'}: <span className="text-[#2563EB]" style={{ textTransform: 'capitalize' }}>{activeRole === 'worker' ? t.workerMode : t.customerMode}</span>
            </div>
            <div className="text-[11px] font-semibold text-[#64748B]">
              {t.switchRoleAction} {activeRole === 'worker' ? t.customerMode : t.workerMode}
            </div>
          </div>

          {/* Yellow CTA Role Switcher Button */}
          <button
            onClick={toggleRole}
            className="bg-[#F5A900] hover:bg-[#E09900] text-[#111827] border border-[#FDE68A] font-black px-3.5 py-1.5 rounded-xl transition-all shadow-xs active:scale-95 text-xs"
          >
            {t.switchRoleAction} {activeRole === 'worker' ? t.customerMode : t.workerMode}
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#64748B]">
              {t.gigsDoneCount}
            </div>
            <div className="text-lg font-black mt-0.5 text-[#2563EB]">
              {user.completedJobs}
            </div>
          </div>
          <div className="p-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#64748B]">
              {t.postedCount}
            </div>
            <div className="text-lg font-black mt-0.5 text-[#111827]">
              {user.jobsPosted}
            </div>
          </div>
          <div className="p-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC]">
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#64748B]">
              {t.experienceCount}
            </div>
            <div className="text-lg font-black text-[#16A34A] mt-0.5">
              {user.experience || '3 yrs'}
            </div>
          </div>
        </div>
      </div>

      {/* SUB-VIEW 1: CHANGE PHONE NUMBER WITH OTP */}
      {activeSubView === 'change_phone' && (
        <div className="rounded-3xl p-5 border border-[#E2E8F0] bg-white shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-[#111827]">
              {t.changeMobile}
            </h3>
            <button
              onClick={() => setActiveSubView('menu')}
              className="text-xs font-bold text-[#64748B] hover:text-[#111827]"
            >
              {t.cancelAction}
            </button>
          </div>

          {phoneSuccess ? (
            <div className="py-6 text-center space-y-2">
              <CheckCircle2 size={36} className="text-[#16A34A] mx-auto" />
              <h4 className="font-black text-sm text-[#111827]">
                Number Updated ✓
              </h4>
              <p className="text-xs text-[#64748B]">
                Your account phone number has been updated.
              </p>
            </div>
          ) : !otpStep ? (
            <form onSubmit={handleSendPhoneOtp} className="space-y-3 text-xs">
              <p className="text-[#64748B]">
                Current Number: <strong className="text-[#111827]">{user.phone}</strong>
              </p>
              <div>
                <label className="block font-bold uppercase mb-1 text-[#111827]">
                  {t.mobileNumberLabel}
                </label>
                <div className="flex items-center border border-[#E2E8F0] bg-[#F7F9FC] rounded-xl p-2.5 transition-colors focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#EFF6FF]">
                  <span className="font-bold mr-2 text-[#64748B]">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={newPhoneInput}
                    onChange={e => setNewPhoneInput(e.target.value)}
                    placeholder="98765 00000"
                    className="w-full outline-none font-bold bg-transparent text-[#111827]"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-3 rounded-xl shadow-xs transition-all active:scale-95"
              >
                {t.continueOtp}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyPhoneOtp} className="space-y-3 text-xs">
              <p className="text-[#64748B]">
                {t.verifyOtpTitle} sent to <strong className="text-[#111827]">+91 {newPhoneInput}</strong>
              </p>
              <input
                type="text"
                value={otpCode}
                onChange={e => setOtpCode(e.target.value)}
                maxLength={6}
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F7F9FC] text-[#111827] font-mono font-bold text-center tracking-widest text-base focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF] outline-none"
                required
              />
              <button
                type="submit"
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-3 rounded-xl shadow-xs transition-all active:scale-95"
              >
                {t.confirmAction}
              </button>
            </form>
          )}
        </div>
      )}

      {/* SUB-VIEW 2: LANGUAGE SELECTION */}
      {activeSubView === 'language' && (
        <div className="rounded-3xl p-5 border border-[#E2E8F0] bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-[#111827]">
              {t.changeLanguage}
            </h3>
            <button
              onClick={() => setActiveSubView('menu')}
              className="text-xs font-bold text-[#64748B] hover:text-[#111827]"
            >
              {t.closeAction}
            </button>
          </div>

          <div className="space-y-2">
            {languages.map(l => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-xs ${
                  language === l.code
                    ? 'bg-[#EFF6FF] border-[#2563EB] font-bold text-[#111827] shadow-xs'
                    : 'bg-[#F7F9FC] border-[#E2E8F0] text-[#64748B] hover:text-[#111827]'
                }`}
              >
                <div>
                  <div className="text-sm font-black text-[#111827]">
                    {l.native}
                  </div>
                  <div className="text-[11px] text-[#64748B]">
                    {l.label}
                  </div>
                </div>
                {language === l.code && <CheckCircle2 size={18} className="text-[#2563EB]" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: HELP CENTER */}
      {activeSubView === 'help' && (
        <div className="rounded-3xl p-5 border border-[#E2E8F0] bg-white shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-[#111827]">
              {t.helpSupport}
            </h3>
            <button
              onClick={() => setActiveSubView('menu')}
              className="text-xs font-bold text-[#64748B] hover:text-[#111827]"
            >
              {t.backAction}
            </button>
          </div>

          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl border border-[#E2E8F0] bg-[#F7F9FC] text-xs space-y-1"
              >
                <div className="font-black text-[#111827]">
                  {f.q}
                </div>
                <div className="leading-relaxed font-medium text-[#64748B]">
                  {f.a}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: BLOCKED USERS */}
      {activeSubView === 'blocked' && (
        <div className="rounded-3xl p-5 border border-[#E2E8F0] bg-white shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-base text-[#111827]">
              Blocked Contacts
            </h3>
            <button
              onClick={() => setActiveSubView('menu')}
              className="text-xs font-bold text-[#64748B] hover:text-[#111827]"
            >
              {t.backAction}
            </button>
          </div>

          {blockedUsers.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#64748B]">
              No users currently blocked.
            </div>
          ) : (
            blockedUsers.map(b => (
              <div
                key={b.id}
                className="flex items-center justify-between p-3 rounded-xl border border-[#E2E8F0] bg-[#F7F9FC] text-xs"
              >
                <span className="font-bold text-[#111827]">
                  User ID: {b.blockedUserId}
                </span>
                <button
                  onClick={() => unblockUser(b.blockedUserId)}
                  className="text-[#2563EB] font-bold hover:underline"
                >
                  Unblock
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* SUB-VIEW 5: DELETE ACCOUNT CONFIRMATION */}
      {activeSubView === 'delete_confirm' && (
        <div className="rounded-3xl p-5 border border-rose-200 bg-white shadow-xs space-y-3 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
            <Trash2 size={24} />
          </div>

          <h3 className="font-black text-base text-[#111827]">
            {t.deleteAccount}?
          </h3>
          <p className="text-xs leading-relaxed text-[#64748B]">
            This will permanently delete your demo profile, completed jobs history, applications, and reset state back to login.
          </p>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setActiveSubView('menu')}
              className="w-1/2 font-bold py-2.5 rounded-xl text-xs border bg-[#F7F9FC] text-[#64748B] border-[#E2E8F0] hover:bg-slate-200"
            >
              {t.cancelAction}
            </button>
            <button
              onClick={deleteAccount}
              className="w-1/2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-xs transition-all"
            >
              {t.deleteAccount}
            </button>
          </div>
        </div>
      )}

      {/* SUB-VIEW 6: PAYMENT METHOD PREFERENCE */}
      {activeSubView === 'payment_preference' && (
        <div className="rounded-3xl p-5 border border-[#E2E8F0] bg-white shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-black text-base text-[#111827]">
                {t.preferredPayoutMethod}
              </h3>
              <p className="text-xs text-[#64748B]">
                Choose how employers settle your completed shift earnings
              </p>
            </div>
            <button
              onClick={() => setActiveSubView('menu')}
              className="text-xs text-white font-bold hover:bg-[#1D4ED8] px-3.5 py-1.5 bg-[#2563EB] rounded-xl shadow-xs transition-all"
            >
              {t.closeAction}
            </button>
          </div>

          <div className="space-y-3">
            {/* Online Option */}
            <button
              type="button"
              onClick={() => updateWorkerPaymentPreference('ONLINE')}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                (user.paymentPreference || 'ONLINE') === 'ONLINE'
                  ? 'border-[#2563EB] bg-[#EFF6FF] ring-2 ring-[#2563EB]/20 shadow-xs'
                  : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1] text-[#111827]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      (user.paymentPreference || 'ONLINE') === 'ONLINE'
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB]'
                    }`}
                  >
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-black text-[#111827]">
                      {t.onlineInstantPayout}
                    </div>
                    <div
                      className={`text-xs font-bold ${
                        (user.paymentPreference || 'ONLINE') === 'ONLINE'
                          ? 'text-[#2563EB]'
                          : 'text-[#64748B]'
                      }`}
                    >
                      {t.payoutUpiNotice}
                    </div>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-[#2563EB] bg-white flex items-center justify-center shrink-0">
                  {(user.paymentPreference || 'ONLINE') === 'ONLINE' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                  )}
                </div>
              </div>
              <p className="text-xs font-medium mt-2.5 leading-relaxed text-[#64748B]">
                Wage authorized in advance by customer and held securely. Settled directly into your verified UPI ID or Bank Account when the shift finishes.
              </p>
            </button>

            {/* Offline Option (Yellow / Gold) */}
            <button
              type="button"
              onClick={() => updateWorkerPaymentPreference('OFFLINE')}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                user.paymentPreference === 'OFFLINE'
                  ? 'border-[#F5A900] bg-[#FFFBEB] ring-2 ring-[#F5A900]/20 shadow-xs'
                  : 'border-[#E2E8F0] bg-white hover:border-[#FDE68A] text-[#111827]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      user.paymentPreference === 'OFFLINE'
                        ? 'bg-[#F5A900] text-[#111827] shadow-xs'
                        : 'bg-[#FFFBEB] border border-[#FDE68A] text-[#F5A900]'
                    }`}
                  >
                    <Banknote size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-black text-[#111827]">
                      {t.offlineCashSettlement}
                    </div>
                    <div
                      className={`text-xs font-bold ${
                        user.paymentPreference === 'OFFLINE'
                          ? 'text-[#92400E]'
                          : 'text-[#64748B]'
                      }`}
                    >
                      {t.payoutCashNotice}
                    </div>
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full border-2 border-[#F5A900] bg-white flex items-center justify-center shrink-0">
                  {user.paymentPreference === 'OFFLINE' && (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#F5A900]" />
                  )}
                </div>
              </div>
              <p className="text-xs font-medium mt-2.5 leading-relaxed text-[#64748B]">
                Receive physical cash directly from the employer on location. Employer confirms the cash handover on their WorkMojo app upon shift completion.
              </p>
            </button>
          </div>
        </div>
      )}

      {/* Main Settings Navigation Menu */}
      {activeSubView === 'menu' && (
        <div className="rounded-3xl border border-[#E2E8F0] bg-white overflow-hidden shadow-xs divide-y divide-[#F1F5F9] text-xs font-bold text-[#111827]">
          {/* Payments & Wages */}
          <button
            onClick={() => setActiveScreen('payments')}
            className="w-full flex items-center justify-between p-4 transition-colors hover:bg-[#F8FAFC] bg-[#EFF6FF]/40"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] flex items-center justify-center shrink-0 shadow-xs">
                <Wallet size={19} />
              </div>
              <div className="text-left">
                <div className="font-black text-sm text-[#111827]">
                  {t.paymentsTitle}
                </div>
                <div className="text-[11px] font-semibold text-[#64748B]">
                  {t.totalEarnings} • {t.preferredPayoutMethod}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
                {t.viewAll}
              </span>
              <ChevronRight size={16} className="text-[#2563EB]" />
            </div>
          </button>

          {/* Color & Brand Identity Row */}
          <div className="w-full flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[#F5A900] flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles size={18} />
              </div>
              <div className="text-left">
                <div className="font-black text-sm text-[#111827]">
                  WorkMojo Design System
                </div>
                <div className="text-[11px] font-semibold text-[#64748B]">
                  White • Blue • Yellow/Gold
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black px-2.5 py-1 rounded-full border bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]">
                {t.confirmed}
              </span>
            </div>
          </div>

          {/* Payment Method Preference */}
          <button
            onClick={() => setActiveSubView('payment_preference')}
            className="w-full flex items-center justify-between p-4 transition-colors hover:bg-[#F8FAFC]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] flex items-center justify-center shrink-0 shadow-xs">
                <CreditCard size={18} />
              </div>
              <span className="font-black text-sm text-[#111827]">
                {t.preferredPayoutMethod}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                  (user.paymentPreference || 'ONLINE') === 'ONLINE'
                    ? 'bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB]'
                    : 'bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E]'
                }`}
              >
                {(user.paymentPreference || 'ONLINE') === 'ONLINE' ? t.onlineInstantPayout : t.offlineCashSettlement}
              </span>
              <ChevronRight size={15} className="text-[#64748B]" />
            </div>
          </button>

          {/* Change Mobile Phone */}
          <button
            onClick={() => setActiveSubView('change_phone')}
            className="w-full flex items-center justify-between p-4 transition-colors hover:bg-[#F8FAFC]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] flex items-center justify-center shrink-0 shadow-xs">
                <Phone size={18} />
              </div>
              <span className="font-black text-sm text-[#111827]">
                {t.changeMobile} (+91)
              </span>
            </div>
            <ChevronRight size={15} className="text-[#64748B]" />
          </button>

          {/* Language Settings */}
          <button
            onClick={() => setActiveSubView('language')}
            className="w-full flex items-center justify-between p-4 transition-colors hover:bg-[#F8FAFC]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] flex items-center justify-center shrink-0 shadow-xs">
                <Globe size={18} />
              </div>
              <span className="font-black text-sm text-[#111827]">
                {t.changeLanguage} ({language.toUpperCase()})
              </span>
            </div>
            <ChevronRight size={15} className="text-[#64748B]" />
          </button>

          {/* Blocked Contacts */}
          <button
            onClick={() => setActiveSubView('blocked')}
            className="w-full flex items-center justify-between p-4 transition-colors hover:bg-[#F8FAFC]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] flex items-center justify-center shrink-0 shadow-xs">
                <UserX size={18} />
              </div>
              <span className="font-black text-sm text-[#111827]">
                Blocked Contacts
              </span>
            </div>
            <ChevronRight size={15} className="text-[#64748B]" />
          </button>

          {/* Help Center */}
          <button
            onClick={() => setActiveSubView('help')}
            className="w-full flex items-center justify-between p-4 transition-colors hover:bg-[#F8FAFC]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] flex items-center justify-center shrink-0 shadow-xs">
                <HelpCircle size={18} />
              </div>
              <span className="font-black text-sm text-[#111827]">
                {t.helpSupport}
              </span>
            </div>
            <ChevronRight size={15} className="text-[#64748B]" />
          </button>

          {/* Delete Account */}
          <button
            onClick={() => setActiveSubView('delete_confirm')}
            className="w-full flex items-center justify-between p-4 transition-colors hover:bg-rose-50 text-rose-600"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
                <Trash2 size={18} />
              </div>
              <span className="font-black text-sm">{t.deleteAccount}</span>
            </div>
            <ChevronRight size={15} />
          </button>

          {/* Log Out */}
          <button
            onClick={() => {
              setOnboardingStep('login');
            }}
            className="w-full flex items-center justify-between p-4 transition-colors hover:bg-[#F8FAFC] text-[#64748B] hover:text-[#111827]"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] text-[#64748B] flex items-center justify-center shrink-0 shadow-xs">
                <LogOut size={18} />
              </div>
              <span className="font-black text-sm">{t.logoutBtn}</span>
            </div>
            <ChevronRight size={15} className="text-[#64748B]" />
          </button>
        </div>
      )}
    </div>
  );
};
