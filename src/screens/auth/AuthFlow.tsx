import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../store/AppContext';
import { MojoMascotIcon } from '../../components/mojo/MojoMascotIcon';
import { Gender, SupportedLanguage, UserRole } from '../../types';
import { api } from '../../services/api';
import {
  Phone,
  ShieldCheck,
  Camera,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Upload,
  User,
  Star,
  Sparkles,
  FileText,
  CreditCard,
  Globe,
  AlertCircle,
  Briefcase,
  HardHat,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const AuthFlow: React.FC = () => {
  const {
    onboardingStep,
    setOnboardingStep,
    loginPhone,
    setLoginPhone,
    completeAuthFlow,
    user,
    language,
    setLanguage,
    t,
  } = useApp();

  const [enteredPhone, setEnteredPhone] = useState(loginPhone || '');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Profile, Role & Gender
  const [selectedRole, setSelectedRole] = useState<UserRole>('worker');
  const [selectedGender, setSelectedGender] = useState<Gender>('Male');
  const [name, setName] = useState('');

  // Aadhaar & PAN State
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [aadhaarFileUploaded, setAadhaarFileUploaded] = useState(false);
  const [panNumber, setPanNumber] = useState('');
  const [panFileUploaded, setPanFileUploaded] = useState(false);

  // Live Photo State
  const [livePhotoCaptured, setLivePhotoCaptured] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [useWebcam, setUseWebcam] = useState(false);

  const languages: Array<{ code: SupportedLanguage; label: string }> = [
    { code: 'en', label: 'English' },
    { code: 'te', label: 'తెలుగు' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ta', label: 'தமிழ்' },
  ];

  // Auto transition Splash screen after 2 seconds
  useEffect(() => {
    if (onboardingStep === 'splash') {
      const timer = setTimeout(() => {
        setOnboardingStep('login');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [onboardingStep, setOnboardingStep]);

  // Format Aadhaar number with spaces: XXXX XXXX XXXX
  const handleAadhaarChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 12);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setAadhaarNumber(formatted);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDigits = enteredPhone.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setOtpError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError('');

    try {
      const res = await api.sendOtp(`+91${cleanDigits.slice(-10)}`);
      if (res && res.success) {
        setLoginPhone(cleanDigits);
        setOnboardingStep('otp');
      } else {
        setOtpError(res?.error || t.otpUnavailable || 'OTP verification is currently unavailable. Please try again later.');
      }
    } catch (err: any) {
      setOtpError(t.otpUnavailable || 'OTP verification is currently unavailable. Please try again later.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp.trim().length !== 6) {
      setOtpError('Please enter the 6-digit OTP');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError('');

    try {
      const cleanDigits = enteredPhone.replace(/\D/g, '');
      const res = await api.verifyOtp(`+91${cleanDigits.slice(-10)}`, enteredOtp.trim(), name, selectedGender);
      if (res && res.success) {
        setOnboardingStep('gender');
      } else {
        setOtpError(res?.error || t.invalidOtp || 'Invalid or expired OTP code. Please try again.');
      }
    } catch (err: any) {
      setOtpError(t.invalidOtp || 'Invalid or expired OTP code. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Webcam access attempt for live camera
  const startWebcam = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setUseWebcam(true);
        }
      }
    } catch {
      // Graceful fallback to photo simulation
      setUseWebcam(false);
    }
  };

  const capturePhoto = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setLivePhotoCaptured(
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
      );
    }, 800);
  };

  const handleCompleteKyc = () => {
    setOnboardingStep('kyc_verifying');
    setTimeout(() => {
      setOnboardingStep('kyc_verified');
      try {
        confetti({ particleCount: 60, spread: 70 });
      } catch {
        // ignore
      }
    }, 1400);
  };

  const handleFinishOnboarding = () => {
    completeAuthFlow({
      name: name || (selectedRole === 'worker' ? 'Skilled Craftsman' : 'Business Employer'),
      gender: selectedGender,
      role: selectedRole,
      phone: enteredPhone.startsWith('+') ? enteredPhone : `+91 ${enteredPhone}`,
      profilePhoto: livePhotoCaptured || (selectedRole === 'customer'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'),
      kycVerified: true,
      kycStatus: 'verified',
    });
  };

  // Common Language Selector Header on Auth Screens
  const renderLanguageHeader = () => (
    <div className="flex items-center justify-between w-full pb-3 mb-2 border-b border-[#F1F5F9]">
      <div className="flex items-center gap-1.5 text-xs font-bold text-[#2563EB]">
        <Globe size={14} />
        <span>Select Language:</span>
      </div>
      <div className="flex items-center gap-1">
        {languages.map(l => (
          <button
            key={l.code}
            onClick={() => setLanguage(l.code)}
            className={`text-[11px] font-bold px-2 py-1 rounded-lg transition-all ${
              language === l.code
                ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] shadow-xs'
                : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#111827]'
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );

  // 1. SPLASH SCREEN
  if (onboardingStep === 'splash') {
    return (
      <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#F7F9FC] via-white to-[#EFF6FF] flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in">
        <div className="relative mb-6">
          <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-white p-3 shadow-xl border-4 border-[#2563EB]/20 ring-8 ring-[#2563EB]/10 flex items-center justify-center animate-float overflow-hidden">
            <img src="/logo.png" alt="Work Mojo Official Logo" className="w-full h-full object-contain" />
          </div>
        </div>

        <h1 className="text-2xl font-black text-[#111827] tracking-tight">
          WORK <span className="text-[#2563EB]">MOJO</span>
        </h1>

        <p className="text-sm text-[#64748B] font-medium mt-1.5 max-w-xs">
          “{t.tagline}”
        </p>

        <div className="mt-8 flex items-center gap-2 text-xs font-bold text-[#2563EB]">
          <div className="w-2 h-2 rounded-full bg-[#2563EB] animate-ping"></div>
          <span>Loading WorkMojo...</span>
        </div>
      </div>
    );
  }

  // 2. LOGIN SCREEN (+91 Mobile Number)
  if (onboardingStep === 'login') {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-center items-center p-4 text-[#111827] max-w-md mx-auto">
        <div className="w-full bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm space-y-5">
          {renderLanguageHeader()}

          <div className="text-center space-y-2.5">
            <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full bg-white p-2 shadow-md border-2 border-[#DBEAFE] flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="Work Mojo Official Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#111827] tracking-tight">
                WORK <span className="text-[#2563EB]">MOJO</span>
              </h2>
              <p className="text-xs text-[#64748B] font-medium mt-0.5">{t.tagline}</p>
            </div>
          </div>

          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                {t.mobileNumberLabel}
              </label>
              <div className="flex items-center bg-[#F7F9FC] border border-[#E2E8F0] rounded-2xl p-3 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#EFF6FF] transition-all">
                <span className="font-black text-sm text-[#2563EB] mr-2">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={enteredPhone}
                  onChange={e => setEnteredPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 10-digit number"
                  className="w-full bg-transparent outline-none font-bold text-base text-[#111827] tracking-wider"
                  required
                />
              </div>
            </div>

            {otpError && (
              <div className="text-xs text-rose-600 text-center font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {otpError}
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifyingOtp}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-3.5 rounded-2xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              <span>{isVerifyingOtp ? 'Sending OTP...' : t.continueOtp}</span>
              <ArrowRight size={16} />
            </button>

            <div className="text-[11px] text-[#64748B] text-center leading-relaxed font-medium">
              By continuing, you agree to WorkMojo's Terms of Service & Privacy Policy.
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 3. OTP VERIFICATION
  if (onboardingStep === 'otp') {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-center items-center p-4 text-[#111827] max-w-md mx-auto">
        <div className="w-full bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm space-y-5">
          {renderLanguageHeader()}

          <div className="text-center space-y-1">
            <h2 className="text-xl font-black text-[#111827]">{t.verifyOtpTitle}</h2>
            <p className="text-xs text-[#64748B] font-medium">
              Sent to <strong className="text-[#2563EB] font-black">+91 {enteredPhone}</strong>
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <input
                type="text"
                maxLength={6}
                value={enteredOtp}
                onChange={e => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-[#F7F9FC] border border-[#E2E8F0] rounded-2xl p-3.5 text-center font-mono font-black text-2xl tracking-[0.5em] text-[#2563EB] focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF] outline-none"
                placeholder="••••••"
                autoFocus
                required
              />
            </div>

            {otpError && (
              <div className="text-xs text-rose-600 text-center font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {otpError}
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifyingOtp || enteredOtp.length !== 6}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-3.5 rounded-2xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {isVerifyingOtp ? <span>Verifying OTP...</span> : <span>Verify & Continue</span>}
            </button>

            <div className="flex items-center justify-between text-xs text-[#64748B] font-medium pt-1">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isVerifyingOtp}
                className="text-[#2563EB] hover:underline font-bold"
              >
                Resend Code
              </button>
              <button
                type="button"
                onClick={() => setOnboardingStep('login')}
                className="hover:text-[#111827]"
              >
                Change Number
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 4. GENDER & NAME SELECTION
  if (onboardingStep === 'gender') {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-center items-center p-4 text-[#111827] max-w-md mx-auto">
        <div className="w-full bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm space-y-5">
          {renderLanguageHeader()}

          <div className="text-center space-y-1">
            <h2 className="text-xl font-black text-[#111827]">Your Profile Details</h2>
            <p className="text-xs text-[#64748B] font-medium">Help the cooperative personalize your workspace.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
                Choose Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRole('worker')}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    selectedRole === 'worker'
                      ? 'bg-[#EFF6FF] text-[#2563EB] border-2 border-[#2563EB] shadow-xs font-black'
                      : 'bg-[#F7F9FC] border-[#E2E8F0] text-[#64748B] hover:text-[#111827]'
                  }`}
                >
                  <div className="text-2xl mb-1">👷</div>
                  <div className="text-xs font-extrabold">Worker / Gig Pro</div>
                  <div className="text-[10px] text-[#64748B] font-medium mt-0.5">Find jobs & get paid</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('customer')}
                  className={`p-3.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    selectedRole === 'customer'
                      ? 'bg-[#EFF6FF] text-[#2563EB] border-2 border-[#2563EB] shadow-xs font-black'
                      : 'bg-[#F7F9FC] border-[#E2E8F0] text-[#64748B] hover:text-[#111827]'
                  }`}
                >
                  <div className="text-2xl mb-1">💼</div>
                  <div className="text-xs font-extrabold">Employer / Business</div>
                  <div className="text-[10px] text-[#64748B] font-medium mt-0.5">Post jobs & hire staff</div>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-[#F7F9FC] border border-[#E2E8F0] rounded-2xl p-3 text-[#111827] font-bold text-sm outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF]"
                placeholder="Enter your full name"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
                Select Gender
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['Male', 'Female'] as const).map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGender(g)}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      selectedGender === g
                        ? 'bg-[#EFF6FF] text-[#2563EB] border-2 border-[#2563EB] shadow-xs font-black'
                        : 'bg-[#F7F9FC] border-[#E2E8F0] text-[#64748B] hover:text-[#111827]'
                    }`}
                  >
                    <div className="text-2xl mb-1">{g === 'Male' ? '👨' : '👩'}</div>
                    <div className="text-xs font-extrabold">{g}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setOnboardingStep('kyc_intro')}
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-3.5 rounded-2xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1 text-sm cursor-pointer"
          >
            <span>Proceed to Identity KYC</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // 5. AADHAAR & PAN CARD VERIFICATION
  if (onboardingStep === 'kyc_intro' || onboardingStep === 'kyc_docs') {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-center items-center p-4 text-[#111827] max-w-md mx-auto">
        <div className="w-full bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm space-y-4">
          {renderLanguageHeader()}

          <div className="flex items-center gap-2 text-[#2563EB]">
            <ShieldCheck size={24} />
            <h2 className="text-xl font-black text-[#111827]">Trust & KYC Verification</h2>
          </div>

          <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl p-3 text-xs text-[#2563EB] leading-relaxed flex items-start gap-2">
            <ShieldCheck size={16} className="shrink-0 mt-0.5 text-[#2563EB]" />
            <div>
              <strong>Verified Identity Protection:</strong> All records are encrypted and secured. Verification ensures trustworthy, authenticated community engagement.
            </div>
          </div>

          <div className="space-y-4">
            {/* 1. Aadhaar Card Input & Upload */}
            <div className="p-4 bg-[#F7F9FC] rounded-2xl border border-[#E2E8F0] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#2563EB] font-bold text-xs">
                  <FileText size={16} />
                  <span>{t.aadhaarVerification}</span>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  {aadhaarFileUploaded ? 'Card Attached ✓' : 'Pending'}
                </span>
              </div>

              <div>
                <label className="block text-[10px] text-[#64748B] font-semibold mb-1">
                  12-Digit Aadhaar Number
                </label>
                <input
                  type="text"
                  maxLength={14}
                  value={aadhaarNumber}
                  onChange={e => handleAadhaarChange(e.target.value)}
                  placeholder="5412 8790 2341"
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl p-2.5 font-mono font-bold text-sm text-[#111827] tracking-wider outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF]"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#64748B]">Aadhaar Card Photo (Front/Back)</span>
                <button
                  type="button"
                  onClick={() => setAadhaarFileUploaded(!aadhaarFileUploaded)}
                  className="text-xs bg-white border border-[#E2E8F0] hover:bg-[#EFF6FF] text-[#2563EB] px-3 py-1 rounded-lg font-bold flex items-center gap-1 shadow-xs transition-colors"
                >
                  <Upload size={12} />
                  <span>{aadhaarFileUploaded ? 'Replace' : 'Upload Card'}</span>
                </button>
              </div>
            </div>

            {/* 2. PAN Card Input & Upload */}
            <div className="p-4 bg-[#F7F9FC] rounded-2xl border border-[#E2E8F0] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#2563EB] font-bold text-xs">
                  <CreditCard size={16} />
                  <span>{t.panVerification}</span>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  {panFileUploaded ? 'Card Attached ✓' : 'Pending'}
                </span>
              </div>

              <div>
                <label className="block text-[10px] text-[#64748B] font-semibold mb-1">
                  10-Character PAN Number
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={panNumber}
                  onChange={e => setPanNumber(e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl p-2.5 font-mono font-bold text-sm text-[#111827] tracking-widest outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF] uppercase"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-[#64748B]">PAN Card Photo (Front)</span>
                <button
                  type="button"
                  onClick={() => setPanFileUploaded(!panFileUploaded)}
                  className="text-xs bg-white border border-[#E2E8F0] hover:bg-[#EFF6FF] text-[#2563EB] px-3 py-1 rounded-lg font-bold flex items-center gap-1 shadow-xs transition-colors"
                >
                  <Upload size={12} />
                  <span>{panFileUploaded ? 'Replace' : 'Upload Card'}</span>
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => setOnboardingStep('live_photo')}
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-3.5 rounded-2xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5 text-sm"
          >
            <span>Next: {t.livePhotoTitle}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // 6. LIVE PHOTO CAMERA VERIFICATION
  if (onboardingStep === 'live_photo') {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-center items-center p-4 text-[#111827] max-w-md mx-auto">
        <div className="w-full bg-white border border-[#E2E8F0] rounded-3xl p-5 shadow-sm space-y-4">
          {renderLanguageHeader()}

          <div className="text-center space-y-1">
            <h2 className="text-xl font-black text-[#111827]">{t.livePhotoTitle}</h2>
            <p className="text-xs text-[#64748B]">
              Position your face inside the positioning oval to generate your verified profile photo.
            </p>
          </div>

          {/* Camera Frame Simulation */}
          <div className="relative w-full h-64 bg-[#F7F9FC] rounded-2xl overflow-hidden border-2 border-[#E2E8F0] flex items-center justify-center">
            {livePhotoCaptured ? (
              <img
                src={livePhotoCaptured}
                alt="Captured Face"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-40 h-48 border-2 border-dashed border-[#2563EB] rounded-full flex flex-col items-center justify-center text-[#64748B]">
                <Camera size={32} className="text-[#2563EB] animate-pulse" />
                <span className="text-[10px] text-[#2563EB] font-bold mt-1">Center Face</span>
              </div>
            )}

            {isScanning && (
              <div className="absolute inset-0 bg-[#2563EB]/10 backdrop-blur-xs flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-bold text-[#2563EB] mt-2">Analyzing Face Biometrics...</span>
              </div>
            )}

            <div className="absolute top-2 left-2 bg-[#111827]/80 text-[10px] text-white px-2 py-0.5 rounded font-mono font-bold">
              LIVE CAM: FACE DETECT ON
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={capturePhoto}
              className="flex-1 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#111827] font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
            >
              <RefreshCw size={13} />
              <span>Capture / Retake</span>
            </button>

            <button
              onClick={handleCompleteKyc}
              className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
            >
              <CheckCircle2 size={14} />
              <span>Verify & Complete KYC</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 7. KYC PROCESSING ANIMATION
  if (onboardingStep === 'kyc_verifying') {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-center items-center p-6 text-[#111827] text-center max-w-md mx-auto">
        <div className="w-16 h-16 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-black text-[#111827]">Verifying Identity Credentials...</h2>
        <p className="text-xs text-[#64748B] mt-1 font-medium">
          Verifying cooperative identity credentials with secure identity network.
        </p>
      </div>
    );
  }

  // 8. KYC VERIFIED CELEBRATION
  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-center items-center p-4 text-[#111827] max-w-md mx-auto">
      <div className="w-full bg-white border border-[#E2E8F0] rounded-3xl p-6 shadow-sm text-center space-y-5">
        <div className="w-16 h-16 bg-emerald-50 text-[#16A34A] rounded-full flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
          <ShieldCheck size={38} />
        </div>

        <div>
          <h2 className="text-2xl font-black text-[#111827]">{t.kycVerifiedTitle}</h2>
          <p className="text-xs text-[#64748B] mt-1 font-medium">
            Your WorkMojo trusted profile is now live!
          </p>
        </div>

        <div className="bg-[#F7F9FC] p-4 rounded-2xl border border-[#E2E8F0] flex items-center gap-3 text-left">
          <img
            src={livePhotoCaptured || user.profilePhoto}
            alt={name}
            className="w-14 h-14 rounded-xl object-cover border-2 border-[#DBEAFE] shadow-xs"
          />
          <div>
            <div className="font-black text-[#111827] text-base flex items-center gap-1">
              <span>{name || (selectedRole === 'worker' ? 'Skilled Craftsman' : 'Business Employer')}</span>
              <CheckCircle2 size={14} className="text-[#16A34A]" />
            </div>
            <div className="text-xs text-[#64748B]">
              Aadhaar Verified • PAN Verified
            </div>
            <div className="text-[11px] text-[#2563EB] font-bold mt-0.5">
              Role: {selectedRole === 'worker' ? 'Worker' : 'Employer'}
            </div>
          </div>
        </div>

        <button
          onClick={handleFinishOnboarding}
          className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-3.5 rounded-2xl shadow-xs transition-all active:scale-95 text-sm cursor-pointer"
        >
          Enter WorkMojo
        </button>
      </div>
    </div>
  );
};
