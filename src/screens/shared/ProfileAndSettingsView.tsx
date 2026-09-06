import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { SupportedLanguage } from '../../types';
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
} from 'lucide-react';

export const ProfileAndSettingsView: React.FC = () => {
  const {
    user,
    activeRole,
    toggleRole,
    deleteAccount,
    changePhoneNumber,
    language,
    setLanguage,
    blockedUsers,
    unblockUser,
    setOnboardingStep,
  } = useApp();

  const [activeSubView, setActiveSubView] = useState<
    'menu' | 'change_phone' | 'language' | 'help' | 'blocked' | 'delete_confirm'
  >('menu');

  // Change phone state
  const [newPhoneInput, setNewPhoneInput] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('123456');
  const [phoneSuccess, setPhoneSuccess] = useState(false);

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
    if (otpCode === '123456' || otpCode.length === 6) {
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
    <div className="pb-24 max-w-lg mx-auto px-4 pt-3 space-y-4 text-slate-900">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={user.profilePhoto}
              alt={user.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
            />
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border border-white">
              <CheckCircle2 size={13} />
            </span>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-black text-slate-900">{user.name}</h2>
              <span title="KYC Verified">
                <ShieldCheck size={16} className="text-emerald-600" />
              </span>
            </div>
            <div className="text-xs text-slate-500 font-medium">{user.phone}</div>
            <div className="flex items-center gap-2 mt-1.5 text-xs font-bold">
              <span className="flex items-center gap-0.5 bg-amber-50 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                <Star size={11} className="fill-amber-400 text-amber-400" />
                {user.rating}★ Rating
              </span>
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                {user.reliabilityScore}% Reliability
              </span>
            </div>
          </div>
        </div>

        {/* Role Toggle Card */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
          <div>
            <div className="font-extrabold text-slate-800">
              Active Mode: <span className="text-amber-600 capitalize">{activeRole}</span>
            </div>
            <div className="text-slate-500 text-[11px]">
              Switch role instantly without re-logging in
            </div>
          </div>

          <button
            onClick={toggleRole}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3.5 py-1.5 rounded-xl transition-all shadow-xs"
          >
            Switch to {activeRole === 'worker' ? 'Customer' : 'Worker'}
          </button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Gigs Done</div>
            <div className="text-base font-black text-slate-900 mt-0.5">{user.completedJobs}</div>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Posted</div>
            <div className="text-base font-black text-slate-900 mt-0.5">{user.jobsPosted}</div>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="text-[10px] text-slate-400 uppercase font-bold">Experience</div>
            <div className="text-base font-black text-slate-900 mt-0.5">{user.experience || '3 yrs'}</div>
          </div>
        </div>
      </div>

      {/* SUB-VIEW 1: CHANGE PHONE NUMBER WITH OTP (Section 61) */}
      {activeSubView === 'change_phone' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900">Change Mobile Number</h3>
            <button onClick={() => setActiveSubView('menu')} className="text-xs text-slate-500 font-bold">
              Cancel
            </button>
          </div>

          {phoneSuccess ? (
            <div className="py-6 text-center space-y-2">
              <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
              <h4 className="font-extrabold text-sm">Number Updated ✓</h4>
              <p className="text-xs text-slate-500">Your account phone number has been updated.</p>
            </div>
          ) : !otpStep ? (
            <form onSubmit={handleSendPhoneOtp} className="space-y-3 text-xs">
              <p className="text-slate-600">
                Current Number: <strong className="text-slate-900">{user.phone}</strong>
              </p>
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">Enter New Number</label>
                <div className="flex items-center border border-slate-300 rounded-xl p-2.5 bg-white">
                  <span className="font-bold text-slate-600 mr-2">+91</span>
                  <input
                    type="tel"
                    value={newPhoneInput}
                    onChange={e => setNewPhoneInput(e.target.value)}
                    placeholder="98765 00000"
                    className="w-full outline-none font-bold text-slate-900"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl shadow-xs transition-all"
              >
                Send Verification OTP
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyPhoneOtp} className="space-y-3 text-xs">
              <p className="text-slate-600">
                Enter 6-digit OTP sent to <strong className="text-slate-900">+91 {newPhoneInput}</strong>
              </p>
              <input
                type="text"
                value={otpCode}
                onChange={e => setOtpCode(e.target.value)}
                maxLength={6}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono font-bold text-center tracking-widest text-base"
                required
              />
              <div className="text-[11px] text-amber-700 font-semibold text-center">
                Demo OTP: 123456
              </div>
              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl shadow-xs transition-all"
              >
                Verify & Update Number
              </button>
            </form>
          )}
        </div>
      )}

      {/* SUB-VIEW 2: LANGUAGE SELECTION (Section 60) */}
      {activeSubView === 'language' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900">Language Settings</h3>
            <button onClick={() => setActiveSubView('menu')} className="text-xs text-slate-500 font-bold">
              Done
            </button>
          </div>

          <div className="space-y-2">
            {languages.map(l => (
              <button
                key={l.code}
                onClick={() => setLanguage(l.code)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all text-xs ${
                  language === l.code
                    ? 'bg-amber-50 border-amber-500 font-bold text-slate-900 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="text-sm font-bold">{l.native}</div>
                  <div className="text-slate-400 text-[11px]">{l.label}</div>
                </div>
                {language === l.code && <CheckCircle2 size={16} className="text-amber-600" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: HELP CENTER (Section 64) */}
      {activeSubView === 'help' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900">Help Center & FAQ</h3>
            <button onClick={() => setActiveSubView('menu')} className="text-xs text-slate-500 font-bold">
              Back
            </button>
          </div>

          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-1">
                <div className="font-extrabold text-slate-900">{f.q}</div>
                <div className="text-slate-600 leading-relaxed">{f.a}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: BLOCKED USERS (Section 54) */}
      {activeSubView === 'blocked' && (
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900">Blocked Contacts</h3>
            <button onClick={() => setActiveSubView('menu')} className="text-xs text-slate-500 font-bold">
              Back
            </button>
          </div>

          {blockedUsers.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              No users currently blocked.
            </div>
          ) : (
            blockedUsers.map(b => (
              <div
                key={b.id}
                className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs"
              >
                <span className="font-bold text-slate-800">User ID: {b.blockedUserId}</span>
                <button
                  onClick={() => unblockUser(b.blockedUserId)}
                  className="text-amber-700 font-bold hover:underline"
                >
                  Unblock
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* SUB-VIEW 5: DELETE ACCOUNT CONFIRMATION (Section 62) */}
      {activeSubView === 'delete_confirm' && (
        <div className="bg-rose-50 rounded-3xl p-5 border border-rose-300 shadow-xs space-y-3 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <Trash2 size={24} />
          </div>

          <h3 className="font-extrabold text-base text-slate-900">Delete WORK MOJO Account?</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            This will permanently delete your demo profile, completed jobs history, applications, and reset state back to login.
          </p>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setActiveSubView('menu')}
              className="w-1/2 bg-white text-slate-700 font-bold py-2.5 rounded-xl text-xs border border-slate-300"
            >
              Cancel
            </button>
            <button
              onClick={deleteAccount}
              className="w-1/2 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-sm"
            >
              Yes, Delete
            </button>
          </div>
        </div>
      )}

      {/* Main Settings Navigation Menu */}
      {activeSubView === 'menu' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100 text-xs font-bold text-slate-700">
          <button
            onClick={() => setActiveSubView('change_phone')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-slate-500" />
              <span>Change Mobile Number (+91)</span>
            </div>
            <ChevronRight size={15} className="text-slate-400" />
          </button>

          <button
            onClick={() => setActiveSubView('language')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Globe size={16} className="text-slate-500" />
              <span>Language ({language.toUpperCase()})</span>
            </div>
            <ChevronRight size={15} className="text-slate-400" />
          </button>

          <button
            onClick={() => setActiveSubView('blocked')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <UserX size={16} className="text-slate-500" />
              <span>Blocked Users</span>
            </div>
            <ChevronRight size={15} className="text-slate-400" />
          </button>

          <button
            onClick={() => setActiveSubView('help')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <HelpCircle size={16} className="text-slate-500" />
              <span>Help Center & FAQ</span>
            </div>
            <ChevronRight size={15} className="text-slate-400" />
          </button>

          <button
            onClick={() => setActiveSubView('delete_confirm')}
            className="w-full flex items-center justify-between p-4 hover:bg-rose-50 text-rose-600 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Trash2 size={16} />
              <span>Delete Account (Sec 62)</span>
            </div>
            <ChevronRight size={15} />
          </button>

          <button
            onClick={() => {
              setOnboardingStep('login');
            }}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 text-slate-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <LogOut size={16} className="text-slate-500" />
              <span>Log Out</span>
            </div>
            <ChevronRight size={15} className="text-slate-400" />
          </button>
        </div>
      )}
    </div>
  );
};
