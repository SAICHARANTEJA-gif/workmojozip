import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../store/AppContext';
import { MojoMascotIcon } from '../../components/mojo/MojoMascotIcon';
import { Gender, SupportedLanguage } from '../../types';
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

  const [enteredPhone, setEnteredPhone] = useState(loginPhone || '9876543210');
  const [enteredOtp, setEnteredOtp] = useState('123456');
  const [otpError, setOtpError] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Profile & Gender
  const [selectedGender, setSelectedGender] = useState<Gender>('Male');
  const [name, setName] = useState('Arun Kumar');

  // Aadhaar & PAN State
  const [aadhaarNumber, setAadhaarNumber] = useState('5412 8790 2341');
  const [aadhaarFileUploaded, setAadhaarFileUploaded] = useState(true);
  const [panNumber, setPanNumber] = useState('ABCDE1234F');
  const [panFileUploaded, setPanFileUploaded] = useState(true);

  // Live Photo State
  const [livePhotoCaptured, setLivePhotoCaptured] = useState<string | null>(
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
  );
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

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredPhone.length >= 10) {
      setLoginPhone(enteredPhone);
      setOnboardingStep('otp');
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifyingOtp(true);
    setOtpError('');

    setTimeout(() => {
      setIsVerifyingOtp(false);
      if (enteredOtp === '123456' || enteredOtp.length === 6) {
        setOnboardingStep('gender');
      } else {
        setOtpError('Invalid OTP code. For demo, use 123456.');
      }
    }, 500);
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
      name,
      gender: selectedGender,
      phone: `+91 ${enteredPhone}`,
      profilePhoto: livePhotoCaptured || user.profilePhoto,
    });
  };

  // Common Language Selector Header on Auth Screens
  const renderLanguageHeader = () => (
    <div className="flex items-center justify-between w-full pb-3 mb-2 border-b border-slate-800">
      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
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
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-400 hover:text-white'
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
      <div className="fixed inset-0 z-50 bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950 flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in">
        <div className="relative mb-6">
          <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-white p-3 shadow-2xl border-4 border-amber-400/80 ring-8 ring-amber-500/10 flex items-center justify-center animate-float overflow-hidden">
            <img src="/logo.png" alt="Work Mojo Official Logo" className="w-full h-full object-contain" />
          </div>
          <span className="absolute -bottom-1 right-2 bg-amber-400 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-lg border-2 border-slate-900">
            SIH 2026
          </span>
        </div>

        <p className="text-sm text-amber-200/90 font-medium mt-1 max-w-xs">
          “{t.tagline}”
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Cooperative Gig Services Platform (Problem Statement SIH26089)
        </p>

        <div className="mt-8 flex items-center gap-1.5 text-xs text-amber-400">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></div>
          <span>Loading Work Mojo...</span>
        </div>
      </div>
    );
  }

  // 2. LOGIN SCREEN (+91 Mobile Number)
  if (onboardingStep === 'login') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-slate-100 max-w-md mx-auto">
        <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
          {renderLanguageHeader()}

          <div className="text-center space-y-2.5">
            <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full bg-white p-2 shadow-xl border-2 border-amber-400/50 flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="Work Mojo Official Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                WORK <span className="text-amber-400">MOJO</span>
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">{t.tagline}</p>
            </div>
          </div>

          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                {t.mobileNumberLabel}
              </label>
              <div className="flex items-center bg-slate-800 border border-slate-700 rounded-2xl p-3 focus-within:border-amber-400 transition-all">
                <span className="font-extrabold text-sm text-amber-400 mr-2">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={enteredPhone}
                  onChange={e => setEnteredPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="98765 43210"
                  className="w-full bg-transparent outline-none font-bold text-base text-white tracking-wider"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-2xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 text-sm"
            >
              <span>{t.continueOtp}</span>
              <ArrowRight size={16} />
            </button>

            <div className="text-[11px] text-slate-500 text-center leading-relaxed">
              By continuing, you agree to Work Mojo's Terms of Cooperative Gig Community & Privacy Shield.
            </div>
          </form>
        </div>
      </div>
    );
  }

  // 3. OTP VERIFICATION
  if (onboardingStep === 'otp') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-slate-100 max-w-md mx-auto">
        <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
          {renderLanguageHeader()}

          <div className="text-center space-y-1">
            <h2 className="text-xl font-black text-white">{t.verifyOtpTitle}</h2>
            <p className="text-xs text-slate-400">
              Sent to <strong className="text-amber-400">+91 {enteredPhone}</strong>
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <input
                type="text"
                maxLength={6}
                value={enteredOtp}
                onChange={e => setEnteredOtp(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-3.5 text-center font-mono font-black text-2xl tracking-[0.5em] text-amber-400 focus:border-amber-400 outline-none"
                placeholder="123456"
                required
              />
              <div className="text-center text-[11px] text-amber-300/80 mt-1">
                Demo default OTP: <span className="font-bold underline">123456</span>
              </div>
            </div>

            {otpError && (
              <div className="text-xs text-rose-400 text-center font-semibold">
                {otpError}
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifyingOtp}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-2xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {isVerifyingOtp ? <span>Verifying credentials...</span> : <span>Verify & Continue</span>}
            </button>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <button
                type="button"
                onClick={() => setEnteredOtp('123456')}
                className="text-amber-400 hover:underline font-bold"
              >
                Auto-fill Demo OTP
              </button>
              <button
                type="button"
                onClick={() => setOnboardingStep('login')}
                className="hover:text-slate-200"
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
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-slate-100 max-w-md mx-auto">
        <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
          {renderLanguageHeader()}

          <div className="text-center space-y-1">
            <h2 className="text-xl font-black text-white">Your Profile Details</h2>
            <p className="text-xs text-slate-400">Help the cooperative personalize your workspace.</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-3 text-white font-bold text-sm outline-none focus:border-amber-400"
                placeholder="e.g. Arun Kumar"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Select Gender (Card Selection)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['Male', 'Female'] as const).map(g => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setSelectedGender(g)}
                    className={`p-4 rounded-2xl border text-center transition-all ${
                      selectedGender === g
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-black scale-102'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <div className="text-3xl mb-1">{g === 'Male' ? '👨' : '👩'}</div>
                    <div className="text-sm font-extrabold">{g}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setOnboardingStep('kyc_intro')}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-2xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-1 text-sm"
          >
            <span>Proceed to Aadhaar & PAN KYC</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // 5. AADHAAR & PAN CARD VERIFICATION
  if (onboardingStep === 'kyc_intro' || onboardingStep === 'kyc_docs') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-slate-100 max-w-md mx-auto">
        <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          {renderLanguageHeader()}

          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck size={24} />
            <h2 className="text-xl font-black text-white">Trust & KYC Verification</h2>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 text-xs text-amber-300 leading-relaxed flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-amber-400" />
            <div>
              <strong>SIH 2026 DEMO MOCK:</strong> Only demo simulated identity numbers are used. Never provide real government Aadhaar or PAN credentials.
            </div>
          </div>

          <div className="space-y-4">
            {/* 1. Aadhaar Card Input & Upload */}
            <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <FileText size={16} />
                  <span>{t.aadhaarVerification}</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {aadhaarFileUploaded ? 'Card Attached ✓' : 'Pending'}
                </span>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                  12-Digit Aadhaar Number
                </label>
                <input
                  type="text"
                  maxLength={14}
                  value={aadhaarNumber}
                  onChange={e => handleAadhaarChange(e.target.value)}
                  placeholder="5412 8790 2341"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 font-mono font-bold text-sm text-amber-300 tracking-wider outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">Aadhaar Card Photo (Front/Back)</span>
                <button
                  type="button"
                  onClick={() => setAadhaarFileUploaded(!aadhaarFileUploaded)}
                  className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1 rounded-lg font-semibold flex items-center gap-1"
                >
                  <Upload size={12} />
                  <span>{aadhaarFileUploaded ? 'Replace' : 'Upload Card'}</span>
                </button>
              </div>
            </div>

            {/* 2. PAN Card Input & Upload */}
            <div className="p-4 bg-slate-800 rounded-2xl border border-slate-700 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <CreditCard size={16} />
                  <span>{t.panVerification}</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {panFileUploaded ? 'Card Attached ✓' : 'Pending'}
                </span>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                  10-Character PAN Number
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={panNumber}
                  onChange={e => setPanNumber(e.target.value.toUpperCase())}
                  placeholder="ABCDE1234F"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 font-mono font-bold text-sm text-amber-300 tracking-widest outline-none focus:border-amber-400 uppercase"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">PAN Card Photo (Front)</span>
                <button
                  type="button"
                  onClick={() => setPanFileUploaded(!panFileUploaded)}
                  className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1 rounded-lg font-semibold flex items-center gap-1"
                >
                  <Upload size={12} />
                  <span>{panFileUploaded ? 'Replace' : 'Upload Card'}</span>
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={() => setOnboardingStep('live_photo')}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-2xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-1.5 text-sm"
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
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-slate-100 max-w-md mx-auto">
        <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
          {renderLanguageHeader()}

          <div className="text-center space-y-1">
            <h2 className="text-xl font-black text-white">{t.livePhotoTitle}</h2>
            <p className="text-xs text-slate-400">
              Position your face inside the positioning oval to generate your verified profile photo.
            </p>
          </div>

          {/* Camera Frame Simulation */}
          <div className="relative w-full h-64 bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-700 flex items-center justify-center">
            {livePhotoCaptured ? (
              <img
                src={livePhotoCaptured}
                alt="Captured Face"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-40 h-48 border-2 border-dashed border-amber-400 rounded-full flex flex-col items-center justify-center text-slate-500">
                <Camera size={32} className="text-amber-400 animate-pulse" />
                <span className="text-[10px] text-amber-300 font-bold mt-1">Center Face</span>
              </div>
            )}

            {isScanning && (
              <div className="absolute inset-0 bg-amber-500/20 backdrop-blur-xs flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-bold text-amber-300 mt-2">Analyzing Face Biometrics...</span>
              </div>
            )}

            <div className="absolute top-2 left-2 bg-black/60 text-[10px] text-white px-2 py-0.5 rounded font-mono">
              LIVE CAM: FACE DETECT ON
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={capturePhoto}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={13} />
              <span>Capture / Retake</span>
            </button>

            <button
              onClick={handleCompleteKyc}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md"
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
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-slate-100 text-center max-w-md mx-auto">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-black text-white">Verifying Aadhaar, PAN & Face Hash...</h2>
        <p className="text-xs text-slate-400 mt-1">
          Simulating cooperative identity verification for Smart India Hackathon.
        </p>
      </div>
    );
  }

  // 8. KYC VERIFIED CELEBRATION
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-slate-100 max-w-md mx-auto">
      <div className="w-full bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 shadow-2xl text-center space-y-5">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500">
          <ShieldCheck size={38} />
        </div>

        <div>
          <h2 className="text-2xl font-black text-white">{t.kycVerifiedTitle}</h2>
          <p className="text-xs text-slate-400 mt-1">
            Your Work Mojo trusted profile is now live!
          </p>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3 text-left">
          <img
            src={livePhotoCaptured || user.profilePhoto}
            alt={name}
            className="w-14 h-14 rounded-xl object-cover border border-emerald-500"
          />
          <div>
            <div className="font-extrabold text-white text-base flex items-center gap-1">
              <span>{name}</span>
              <CheckCircle2 size={14} className="text-emerald-400" />
            </div>
            <div className="text-xs text-slate-400">
              Aadhaar: {aadhaarNumber.slice(0, 4)} XXXX {aadhaarNumber.slice(-4)} • PAN: {panNumber.slice(0, 3)}***
            </div>
            <div className="text-[11px] text-emerald-400 font-bold mt-0.5">
              Dual-Role Enabled: Worker + Customer
            </div>
          </div>
        </div>

        <button
          onClick={handleFinishOnboarding}
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-2xl shadow-lg transition-all active:scale-98 text-sm"
        >
          Enter WORK MOJO Dashboard
        </button>
      </div>
    </div>
  );
};
