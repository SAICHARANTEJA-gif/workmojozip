import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { WorkCategory, SelectionMode, Job } from '../../types';
import { speechService } from '../../services/speechService';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Mic,
  MicOff,
  Camera,
  Image as ImageIcon,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { WORK_CATEGORIES, getCategoryInfo, getCategoryLabel, getCategoryEmoji } from '../../config/categories';
import confetti from 'canvas-confetti';

interface PostJobWizardProps {
  onClose: () => void;
  onJobCreated: (job: Job) => void;
}

export const PostJobWizard: React.FC<PostJobWizardProps> = ({
  onClose,
  onJobCreated,
}) => {
  const { user, createJob, language, t } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 8;

  // Form State
  const [category, setCategory] = useState<WorkCategory>('Loading/Unloading');
  const [title, setTitle] = useState('Warehouse Loading & Sorting Helper');
  const [description, setDescription] = useState('Need energetic helpers for unloading cartons, sorting dry food boxes, and arranging storeroom racks.');
  const [isListening, setIsListening] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>(
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80'
  );
  const [wage, setWage] = useState<number>(800);
  const [startTime, setStartTime] = useState<string>('09:00 AM');
  const [endTime, setEndTime] = useState<string>('06:00 PM');
  const [duration, setDuration] = useState<string>('9 hours');
  const [approximateArea, setApproximateArea] = useState<string>('Koramangala 4th Block (approx 2.1 km)');
  const [exactAddress, setExactAddress] = useState<string>('Shop #18, 80ft Main Road, Koramangala 4th Block');
  const [landmark, setLandmark] = useState<string>('Opposite Sony World Signal');
  const [workersNeeded, setWorkersNeeded] = useState<number>(3);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('manual');
  const [recurring, setRecurring] = useState<'none' | 'daily' | 'weekly'>('none');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isPostedSuccess, setIsPostedSuccess] = useState<boolean>(false);
  const [createdJobRecord, setCreatedJobRecord] = useState<Job | null>(null);
  const [categorySearchQuery, setCategorySearchQuery] = useState<string>('');

  const handleCategorySelect = (catId: WorkCategory) => {
    const info = getCategoryInfo(catId);
    setCategory(catId);
    setSelectedImage(info.defaultImage);
    setWage(info.defaultWage);
    setTitle(info.defaultTitle);
    setDescription(info.defaultDescription);
  };

  const filteredCategories = categorySearchQuery.trim()
    ? WORK_CATEGORIES.filter(c =>
        getCategoryLabel(c.id, language).toLowerCase().includes(categorySearchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(categorySearchQuery.toLowerCase())
      )
    : WORK_CATEGORIES;

  const handleVoiceDescription = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      speechService.startListening(
        {
          onResult: transcript => {
            setIsListening(false);
            setDescription(prev => (prev ? `${prev} ${transcript}` : transcript));
          },
          onError: () => setIsListening(false),
          onEnd: () => setIsListening(false),
        },
        language
      );
    }
  };

  const handlePostSubmit = async () => {
    if (isSubmitting || isPostedSuccess) return;
    setIsSubmitting(true);
    try {
      const job = await createJob({
        customerId: user.id,
        customerName: user.name,
        customerPhoto: user.profilePhoto,
        customerRating: user.rating,
        customerKyc: user.kycStatus === 'verified',
        businessName: `${user.name}'s Service Request`,
        title,
        category,
        description,
        image: selectedImage,
        wage,
        startTime,
        endTime,
        duration,
        urgency: 'Today',
        approximateArea,
        approximateDistanceKm: 2.1,
        exactLocation: {
          approximateArea,
          exactAddress,
          lat: 12.934,
          lng: 77.625,
          landmark,
        },
        workersRequired: workersNeeded,
        selectionMode,
        status: 'Posted',
        recurring,
      });

      setCreatedJobRecord(job);
      setIsPostedSuccess(true);
      try {
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPostedSuccess && createdJobRecord) {
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 text-[#111827] text-center animate-in fade-in">
        <div className="w-20 h-20 bg-[#F0FDF4] text-[#16A34A] rounded-full flex items-center justify-center mb-4 border-2 border-[#BBF7D0] shadow-xs animate-bounce-subtle">
          <CheckCircle2 size={46} />
        </div>

        <h2 className="text-2xl font-black text-[#111827]">Job Posted Successfully ✓</h2>
        <p className="text-sm text-[#64748B] mt-2 max-w-sm">
          "{createdJobRecord.title}" is now active on WORK MOJO. Nearby workers are receiving real-time matching notifications.
        </p>

        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 my-5 w-full max-w-sm text-left text-xs space-y-2 shadow-xs">
          <div className="flex justify-between">
            <span className="text-[#64748B]">Workers Needed:</span>
            <span className="font-bold text-[#111827]">{createdJobRecord.workersRequired} workers</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#64748B]">Offered Wage:</span>
            <span className="font-bold text-[#2563EB]">₹{createdJobRecord.wage} / shift</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#64748B]">Timing:</span>
            <span className="font-bold text-[#111827]">{createdJobRecord.startTime} – {createdJobRecord.endTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#64748B]">Selection Mode:</span>
            <span className="font-bold text-[#16A34A] capitalize">{createdJobRecord.selectionMode} Selection</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#64748B]">Work Location:</span>
            <span className="font-bold text-[#111827] truncate max-w-[180px]">{createdJobRecord.exactLocation.exactAddress}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 w-full max-w-sm">
          <button
            onClick={() => onJobCreated(createdJobRecord)}
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black py-3.5 rounded-2xl shadow-xs transition-all text-sm"
          >
            View Job & Live Applicants
          </button>
          <button
            onClick={onClose}
            className="w-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#111827] font-bold py-3 rounded-2xl transition-all text-xs"
          >
            Back to Customer Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
      <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-[#E2E8F0] text-[#111827] animate-in slide-in-from-bottom duration-200">
        {/* Header with Progress Bar */}
        <div className="p-4 border-b border-[#E2E8F0] bg-[#F8FAFC]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
                  className="p-1 hover:bg-[#E2E8F0] rounded-lg text-[#64748B]"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              <h3 className="font-extrabold text-base text-[#111827]">
                Post Job {currentStep <= totalSteps ? `• Step ${currentStep} of ${totalSteps}` : '• Preview'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-[#64748B] hover:text-[#111827] rounded-full hover:bg-[#E2E8F0]"
            >
              <X size={18} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#2563EB] h-full rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / (totalSteps + 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Wizard Steps Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-sm">
          {/* STEP 1: What work? */}
          {currentStep === 1 && (
            <div className="space-y-3">
              <div>
                <h4 className="font-black text-lg text-[#111827]">{t.stepBasicInfo}</h4>
                <p className="text-xs text-[#64748B] mt-0.5">
                  {t.jobCategoryLabel} • 35 categories available
                </p>
              </div>

              <div className="pt-1">
                <input
                  type="text"
                  placeholder="Search work categories..."
                  value={categorySearchQuery}
                  onChange={e => setCategorySearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E2E8F0] focus:border-[#2563EB] outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                {filteredCategories.map(cat => {
                  const isSelected = category === cat.id;
                  const emoji = getCategoryEmoji(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#EFF6FF] text-[#2563EB] border-2 border-[#2563EB] shadow-xs scale-102 font-black'
                          : 'bg-white hover:bg-[#F8FAFC] text-[#111827] border-[#E2E8F0]'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-lg leading-none ${isSelected ? 'bg-[#2563EB] text-white' : 'bg-[#EFF6FF] text-[#2563EB]'}`}>
                        <span role="img" aria-label={cat.id}>{emoji}</span>
                      </div>
                      <span className="text-center text-[11px] leading-tight line-clamp-2">
                        {getCategoryLabel(cat.id, language)}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">
                  {t.jobTitleLabel}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] text-[#111827] font-semibold text-sm focus:border-[#2563EB] outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Description (Voice + Text) */}
          {currentStep === 2 && (
            <div className="space-y-3">
              <div>
                <h4 className="font-black text-lg text-[#111827]">Describe the job duties</h4>
                <p className="text-xs text-[#64748B] mt-0.5">
                  You can type or simply tap the microphone to speak in your language.
                </p>
              </div>

              <div className="relative">
                <textarea
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Unload 50 bags of rice, clean storage area, helper needed..."
                  className="w-full p-3 rounded-2xl border border-[#E2E8F0] text-[#111827] text-sm focus:border-[#2563EB] outline-none pr-12"
                />

                <button
                  type="button"
                  onClick={handleVoiceDescription}
                  className={`absolute right-3 bottom-4 p-2 rounded-xl transition-all ${
                    isListening ? 'bg-[#2563EB] text-white animate-pulse' : 'bg-[#EFF6FF] text-[#2563EB] hover:bg-[#DBEAFE]'
                  }`}
                  title="Voice Input"
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              </div>

              <div className="text-[11px] text-[#64748B] italic">
                Tip: Mention if heavy lifting is involved, or if any tools are provided.
              </div>
            </div>
          )}

          {/* STEP 3: Photo Upload */}
          {currentStep === 3 && (
            <div className="space-y-3">
              <div>
                <h4 className="font-black text-lg text-[#111827]">Workplace or Item Photo (Optional)</h4>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Helps workers evaluate the nature of work.
                </p>
              </div>

              <div className="w-full h-44 rounded-2xl overflow-hidden border-2 border-dashed border-[#E2E8F0] relative group">
                <img
                  src={selectedImage}
                  alt="Workplace preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3">
                  <button
                    onClick={() =>
                      setSelectedImage(
                        'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80'
                      )
                    }
                    className="bg-white text-[#111827] px-3 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <Camera size={14} className="text-[#2563EB]" />
                    <span>Take Photo</span>
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage(
                        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80'
                      )
                    }
                    className="bg-white text-[#111827] px-3 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
                  >
                    <ImageIcon size={14} className="text-[#2563EB]" />
                    <span>Choose Gallery</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Wage ₹ */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-black text-lg text-[#111827]">What wage will you pay?</h4>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Payment is paid directly to the worker in Cash or UPI upon completion.
                </p>
              </div>

              <div className="flex items-center gap-2 p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
                <span className="text-2xl font-black text-[#2563EB]">₹</span>
                <input
                  type="number"
                  value={wage}
                  onChange={e => setWage(Number(e.target.value))}
                  className="w-full text-2xl font-black text-[#111827] bg-transparent outline-none"
                />
                <span className="text-xs font-bold text-[#64748B] shrink-0">per worker / shift</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase mb-2">
                  Suggested Daily Rates
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[600, 750, 800, 1000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setWage(amt)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        wage === amt
                          ? 'bg-[#2563EB] text-white shadow-xs'
                          : 'bg-[#F1F5F9] text-[#111827] hover:bg-[#E2E8F0]'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#EFF6FF] rounded-2xl border border-[#DBEAFE] text-xs text-[#1D4ED8]">
                <strong>WORK MOJO Notice:</strong> We do not take commission or deduct from worker wages. You agree on payment directly.
              </div>
            </div>
          )}

          {/* STEP 5: Timing & Duration */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-black text-lg text-[#111827]">Working Hours & Shift</h4>
                <p className="text-xs text-[#64748B] mt-0.5">
                  When should the workers report to the site?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">
                    Start Time
                  </label>
                  <select
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] font-bold text-sm bg-white text-[#111827]"
                  >
                    <option value="07:00 AM">07:00 AM</option>
                    <option value="08:00 AM">08:00 AM</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="01:00 PM">01:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">
                    End Time
                  </label>
                  <select
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E2E8F0] font-bold text-sm bg-white text-[#111827]"
                  >
                    <option value="01:00 PM">01:00 PM (Half Day)</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="05:00 PM">05:00 PM (8 hrs)</option>
                    <option value="06:00 PM">06:00 PM (Full Day)</option>
                    <option value="08:00 PM">08:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">
                  Recurring Schedule
                </label>
                <div className="flex gap-2">
                  {(['none', 'daily', 'weekly'] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => setRecurring(opt)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                        recurring === opt
                          ? 'bg-[#2563EB] text-white shadow-xs'
                          : 'bg-[#F1F5F9] text-[#111827] hover:bg-[#E2E8F0]'
                      }`}
                    >
                      {opt === 'none' ? 'One-Time Job' : opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Actual Work Location */}
          {currentStep === 6 && (
            <div className="space-y-3">
              <div>
                <h4 className="font-black text-lg text-[#111827]">Workplace Location</h4>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Pinpoint the actual job site location.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">
                  Public Area (Shown before hire)
                </label>
                <input
                  type="text"
                  value={approximateArea}
                  onChange={e => setApproximateArea(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#111827]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">
                  Exact Street Address (Unlocked ONLY after worker confirmation)
                </label>
                <input
                  type="text"
                  value={exactAddress}
                  onChange={e => setExactAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#111827]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#64748B] uppercase mb-1">
                  Landmark
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={e => setLandmark(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E2E8F0] text-sm font-semibold text-[#111827]"
                />
              </div>
            </div>
          )}

          {/* STEP 7: Workers Needed */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-black text-lg text-[#111827]">How many workers do you need?</h4>
                <p className="text-xs text-[#64748B] mt-0.5">
                  WORK MOJO supports multi-worker hiring with automated waiting list replacement.
                </p>
              </div>

              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setWorkersNeeded(n)}
                    className={`py-3 rounded-2xl text-base font-black transition-all ${
                      workersNeeded === n
                        ? 'bg-[#2563EB] text-white shadow-xs scale-105'
                        : 'bg-[#F1F5F9] text-[#111827] hover:bg-[#E2E8F0]'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] text-xs text-[#64748B]">
                Total estimated wage outlay: <strong className="text-[#2563EB] font-extrabold">₹{workersNeeded * wage}</strong> ({workersNeeded} workers × ₹{wage})
              </div>
            </div>
          )}

          {/* STEP 8: Selection Mode */}
          {currentStep === 8 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-black text-lg text-[#111827]">Worker Selection Mode</h4>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Choose how applicants should be confirmed.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setSelectionMode('manual')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectionMode === 'manual'
                      ? 'bg-[#EFF6FF] border-2 border-[#2563EB] shadow-xs'
                      : 'bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="font-black text-sm text-[#111827]">Manual Selection</div>
                  <p className="text-xs text-[#64748B] mt-1">
                    You review each applicant, compare profiles, and click confirm individually.
                  </p>
                </div>

                <div
                  onClick={() => setSelectionMode('auto')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectionMode === 'auto'
                      ? 'bg-[#EFF6FF] border-2 border-[#2563EB] shadow-xs'
                      : 'bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <div className="flex items-center gap-1 font-black text-sm text-[#111827]">
                    <Sparkles size={14} className="text-[#2563EB]" />
                    <span>Automatic Selection</span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-1">
                    WORK MOJO AI ranks applicants by skills & distance and automatically fills slots.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 9: Job Preview */}
          {currentStep === 9 && (
            <div className="space-y-3">
              <h4 className="font-black text-lg text-[#111827]">{t.stepReview}</h4>

              <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xs">
                <img src={selectedImage} alt={title} className="w-full h-32 object-cover" />
                <div className="p-3.5 space-y-2 bg-[#F8FAFC]">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                        <span>{getCategoryEmoji(category)}</span>
                        <span>{getCategoryLabel(category, language)}</span>
                      </span>
                      <h3 className="font-extrabold text-sm text-[#111827] mt-1">{title}</h3>
                    </div>
                    <span className="text-base font-black px-2 py-0.5 rounded-lg bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]">
                      ₹{wage}
                    </span>
                  </div>

                  <p className="text-xs text-[#64748B] leading-relaxed">{description}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-[#111827] pt-1">
                    <div>🕒 {startTime} – {endTime}</div>
                    <div>👥 {workersNeeded} {t.workersNeeded}</div>
                    <div>📍 {approximateArea}</div>
                    <div>⚡ {selectionMode} selection</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-[#E2E8F0] bg-white flex items-center justify-between gap-3">
          {currentStep < 9 ? (
            <button
              onClick={() => setCurrentStep(s => Math.min(9, s + 1))}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black py-3 rounded-2xl shadow-xs transition-all active:scale-98 flex items-center justify-center gap-1.5 text-sm cursor-pointer"
            >
              <span>{currentStep === 8 ? t.stepReview : t.nextAction}</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <div className="flex gap-2 w-full">
              <button
                onClick={() => setCurrentStep(1)}
                className="w-1/3 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#111827] font-bold py-3 rounded-2xl text-xs cursor-pointer"
              >
                {t.backAction}
              </button>
              <button
                onClick={handlePostSubmit}
                disabled={isSubmitting}
                className="w-2/3 bg-[#F5A900] hover:bg-[#E09900] disabled:opacity-50 disabled:cursor-not-allowed text-[#111827] border border-[#FDE68A] font-black py-3 rounded-2xl shadow-xs transition-all text-sm flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
              >
                <span>{isSubmitting ? t.postingJobProgress : t.postJobNowBtn}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
