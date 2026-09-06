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
import confetti from 'canvas-confetti';

interface PostJobWizardProps {
  onClose: () => void;
  onJobCreated: (job: Job) => void;
}

export const PostJobWizard: React.FC<PostJobWizardProps> = ({
  onClose,
  onJobCreated,
}) => {
  const { user, createJob, language } = useApp();

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
  const [isPostedSuccess, setIsPostedSuccess] = useState<boolean>(false);
  const [createdJobRecord, setCreatedJobRecord] = useState<Job | null>(null);

  const categories: WorkCategory[] = [
    'Loading/Unloading',
    'Cleaning',
    'Delivery',
    'Construction',
    'Gardening',
    'Labour',
    'Repair',
    'Shop/Store Help',
    'Other',
  ];

  const categoryImages: Record<WorkCategory, string> = {
    'Loading/Unloading': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80',
    'Cleaning': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
    'Delivery': 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=800&auto=format&fit=crop&q=80',
    'Construction': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
    'Gardening': 'https://images.unsplash.com/photo-1558904541-efa8c4a08931?w=800&auto=format&fit=crop&q=80',
    'Labour': 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80',
    'Repair': 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    'Shop/Store Help': 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?w=800&auto=format&fit=crop&q=80',
    'Other': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&auto=format&fit=crop&q=80',
  };

  const handleCategorySelect = (cat: WorkCategory) => {
    setCategory(cat);
    setSelectedImage(categoryImages[cat]);
    if (title.includes('Helper') || title.includes('Loading') || title.includes('Sorting')) {
      setTitle(`${cat} Helper Required`);
    }
  };

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

  const handlePostSubmit = () => {
    const job = createJob({
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
  };

  if (isPostedSuccess && createdJobRecord) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 text-center animate-in fade-in">
        <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-4 border-2 border-emerald-500 shadow-xl animate-bounce-subtle">
          <CheckCircle2 size={46} />
        </div>

        <h2 className="text-2xl font-black text-white">Job Posted Successfully ✓</h2>
        <p className="text-sm text-slate-300 mt-2 max-w-sm">
          "{createdJobRecord.title}" is now active on WORK MOJO. Nearby workers are receiving real-time matching notifications.
        </p>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 my-5 w-full max-w-sm text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400">Workers Needed:</span>
            <span className="font-bold text-white">{createdJobRecord.workersRequired} workers</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Offered Wage:</span>
            <span className="font-bold text-amber-400">₹{createdJobRecord.wage} / shift</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Timing:</span>
            <span className="font-bold text-white">{createdJobRecord.startTime} – {createdJobRecord.endTime}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Selection Mode:</span>
            <span className="font-bold text-emerald-400 capitalize">{createdJobRecord.selectionMode} Selection</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Work Location:</span>
            <span className="font-bold text-slate-200 truncate max-w-[180px]">{createdJobRecord.exactLocation.exactAddress}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 w-full max-w-sm">
          <button
            onClick={() => onJobCreated(createdJobRecord)}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-2xl shadow-lg transition-all text-sm"
          >
            View Job & Live Applicants
          </button>
          <button
            onClick={onClose}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-2xl transition-all text-xs"
          >
            Back to Customer Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
      <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 text-slate-900 animate-in slide-in-from-bottom duration-200">
        {/* Header with Progress Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep(s => Math.max(1, s - 1))}
                  className="p-1 hover:bg-slate-200 rounded-lg text-slate-600"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              <h3 className="font-extrabold text-base text-slate-900">
                Post Job {currentStep <= totalSteps ? `• Step ${currentStep} of ${totalSteps}` : '• Preview'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200"
            >
              <X size={18} />
            </button>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-300"
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
                <h4 className="font-black text-lg text-slate-900">What work do you need done?</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select a category to connect with verified nearby gig workers.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      category === cat
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md scale-102'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="text-xl">
                      {cat === 'Loading/Unloading' ? '📦' : cat === 'Cleaning' ? '🧹' : cat === 'Delivery' ? '🚚' : cat === 'Construction' ? '🏗️' : cat === 'Gardening' ? '🌿' : cat === 'Labour' ? '🔨' : '🏪'}
                    </span>
                    <span className="text-center leading-tight">{cat}</span>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-slate-900 font-semibold text-sm focus:border-amber-500 outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Description (Voice + Text) */}
          {currentStep === 2 && (
            <div className="space-y-3">
              <div>
                <h4 className="font-black text-lg text-slate-900">Describe the job duties</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  You can type or simply tap the microphone to speak in your language.
                </p>
              </div>

              <div className="relative">
                <textarea
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. Unload 50 bags of rice, clean storage area, helper needed..."
                  className="w-full p-3 rounded-2xl border border-slate-300 text-slate-900 text-sm focus:border-amber-500 outline-none pr-12"
                />

                <button
                  type="button"
                  onClick={handleVoiceDescription}
                  className={`absolute right-3 bottom-4 p-2 rounded-xl transition-all ${
                    isListening ? 'bg-rose-600 text-white animate-pulse' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                  title="Voice Input"
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              </div>

              <div className="text-[11px] text-slate-400 italic">
                Tip: Mention if heavy lifting is involved, or if any tools are provided.
              </div>
            </div>
          )}

          {/* STEP 3: Photo Upload */}
          {currentStep === 3 && (
            <div className="space-y-3">
              <div>
                <h4 className="font-black text-lg text-slate-900">Workplace or Item Photo (Optional)</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Helps workers evaluate the nature of work.
                </p>
              </div>

              <div className="w-full h-44 rounded-2xl overflow-hidden border-2 border-dashed border-slate-300 relative group">
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
                    className="bg-white text-slate-900 px-3 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
                  >
                    <Camera size={14} />
                    <span>Take Photo</span>
                  </button>
                  <button
                    onClick={() =>
                      setSelectedImage(
                        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&auto=format&fit=crop&q=80'
                      )
                    }
                    className="bg-white text-slate-900 px-3 py-2 rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
                  >
                    <ImageIcon size={14} />
                    <span>Choose Gallery</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Wage ₹ (Never change customer's chosen wage automatically) */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-black text-lg text-slate-900">What wage will you pay?</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Payment is paid directly to the worker in Cash or UPI upon completion.
                </p>
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-2xl font-black text-amber-600">₹</span>
                <input
                  type="number"
                  value={wage}
                  onChange={e => setWage(Number(e.target.value))}
                  className="w-full text-2xl font-black text-slate-900 bg-transparent outline-none"
                />
                <span className="text-xs font-bold text-slate-500 shrink-0">per worker / shift</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  Suggested Daily Rates
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[600, 750, 800, 1000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setWage(amt)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        wage === amt
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
                <strong>WORK MOJO Notice:</strong> We do not take commission or deduct from worker wages. You agree on payment directly.
              </div>
            </div>
          )}

          {/* STEP 5: Timing & Duration */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-black text-lg text-slate-900">Working Hours & Shift</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  When should the workers report to the site?
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Start Time
                  </label>
                  <select
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-sm bg-white"
                  >
                    <option value="07:00 AM">07:00 AM</option>
                    <option value="08:00 AM">08:00 AM</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="01:00 PM">01:00 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    End Time
                  </label>
                  <select
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-sm bg-white"
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
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Recurring Schedule
                </label>
                <div className="flex gap-2">
                  {(['none', 'daily', 'weekly'] as const).map(opt => (
                    <button
                      key={opt}
                      onClick={() => setRecurring(opt)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                        recurring === opt
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {opt === 'none' ? 'One-Time Job' : opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Actual Work Location (Explicit Customer Choice) */}
          {currentStep === 6 && (
            <div className="space-y-3">
              <div>
                <h4 className="font-black text-lg text-slate-900">Workplace Location</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Customer's current home/office is NOT automatically the workplace. Explicitly pinpoint the actual site.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Public Area (Shown before hire)
                </label>
                <input
                  type="text"
                  value={approximateArea}
                  onChange={e => setApproximateArea(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Exact Street Address (Unlocked ONLY after worker confirmation)
                </label>
                <input
                  type="text"
                  value={exactAddress}
                  onChange={e => setExactAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Landmark
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={e => setLandmark(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm font-semibold"
                />
              </div>
            </div>
          )}

          {/* STEP 7: Workers Needed */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-black text-lg text-slate-900">How many workers do you need?</h4>
                <p className="text-xs text-slate-500 mt-0.5">
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
                        ? 'bg-amber-500 text-slate-950 shadow-md scale-105'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600">
                Total estimated wage outlay: <strong className="text-amber-600 font-extrabold">₹{workersNeeded * wage}</strong> ({workersNeeded} workers × ₹{wage})
              </div>
            </div>
          )}

          {/* STEP 8: Selection Mode */}
          {currentStep === 8 && (
            <div className="space-y-4">
              <div>
                <h4 className="font-black text-lg text-slate-900">Worker Selection Mode</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose how applicants should be confirmed.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setSelectionMode('manual')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectionMode === 'manual'
                      ? 'bg-amber-50 border-amber-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-black text-sm text-slate-900">Manual Selection</div>
                  <p className="text-xs text-slate-500 mt-1">
                    You review each applicant, compare profiles, and click confirm individually.
                  </p>
                </div>

                <div
                  onClick={() => setSelectionMode('auto')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectionMode === 'auto'
                      ? 'bg-amber-50 border-amber-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-1 font-black text-sm text-slate-900">
                    <Sparkles size={14} className="text-amber-600" />
                    <span>Automatic Selection</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    WORK MOJO AI ranks applicants by skills & distance and automatically fills slots.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 9: Job Preview */}
          {currentStep === 9 && (
            <div className="space-y-3">
              <h4 className="font-black text-lg text-slate-900">Review & Publish Job</h4>

              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <img src={selectedImage} alt={title} className="w-full h-32 object-cover" />
                <div className="p-3.5 space-y-2 bg-slate-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                        {category}
                      </span>
                      <h3 className="font-extrabold text-sm text-slate-900 mt-1">{title}</h3>
                    </div>
                    <span className="text-base font-black text-amber-600">₹{wage}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{description}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700 pt-1">
                    <div>🕒 {startTime} – {endTime}</div>
                    <div>👥 {workersNeeded} workers needed</div>
                    <div>📍 {approximateArea}</div>
                    <div>⚡ {selectionMode} selection</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3">
          {currentStep < 9 ? (
            <button
              onClick={() => setCurrentStep(s => Math.min(9, s + 1))}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5 text-sm"
            >
              <span>{currentStep === 8 ? 'Preview Job' : 'Continue'}</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <div className="flex gap-2 w-full">
              <button
                onClick={() => setCurrentStep(1)}
                className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl text-xs"
              >
                Edit
              </button>
              <button
                onClick={handlePostSubmit}
                className="w-2/3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-2xl shadow-md transition-all text-sm flex items-center justify-center gap-1.5"
              >
                <span>Post Job Now</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
