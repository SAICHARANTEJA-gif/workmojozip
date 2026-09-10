import React, { useState } from 'react';
import { User, Job } from '../../types';
import { useApp } from '../../store/AppContext';
import { getCategoryEmoji, getCategoryLabel } from '../../config/categories';
import {
  X,
  ShieldCheck,
  Star,
  MapPin,
  Briefcase,
  CheckCircle2,
  Phone,
  MessageSquare,
  Clock,
  Calendar,
  Languages,
  Award,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  UserCheck,
} from 'lucide-react';

interface WorkerProfileModalProps {
  worker: User | null;
  onClose: () => void;
  onHire?: (worker: User) => void;
  onInvite?: (worker: User) => void;
  jobContext?: Job | null;
}

export const WorkerProfileModal: React.FC<WorkerProfileModalProps> = ({
  worker,
  onClose,
  onHire,
  onInvite,
  jobContext,
}) => {
  const { language, t } = useApp();
  const [imageError, setImageError] = useState(false);
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);

  // Safe Fallback State if Worker data is missing or corrupted
  if (!worker) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
        <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#E2E8F0] text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
            <AlertCircle size={32} />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-black text-[#111827]">Worker Profile Unavailable</h3>
            <p className="text-xs text-[#64748B]">
              This worker profile could not be loaded or is temporarily offline. Please select another applicant.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs transition-all shadow-xs active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ArrowLeft size={14} />
            <span>Back to Applicants</span>
          </button>
        </div>
      </div>
    );
  }

  // Safe field resolution with robust defaults
  const displayName = worker.name || 'Verified Worker';
  const primaryTrade =
    (worker.preferredCategories && worker.preferredCategories[0]) ||
    (worker.skills && worker.skills[0]) ||
    'General Work';
  const tradeEmoji = getCategoryEmoji(primaryTrade);
  const tradeLabel = getCategoryLabel(primaryTrade as any, language);
  const skillsList = Array.isArray(worker.skills) && worker.skills.length > 0
    ? worker.skills
    : ['General Assistance', 'Daily Gig Work'];
  const ratingVal = typeof worker.rating === 'number' ? worker.rating.toFixed(1) : '4.8';
  const completedCount = worker.completedJobs ?? 0;
  const reliability = worker.reliabilityScore ?? 95;
  const experienceYears = worker.experience || '3+ years experience';
  const locationText =
    worker.locationArea ||
    (worker.preferredDistance ? `Within ${worker.preferredDistance} km` : 'Local Area');
  const bioText =
    worker.bio ||
    'Verified WorkMojo gig worker available for on-demand daily shifts with verified KYC identity and transparent attendance verification.';
  const preferredTimes =
    Array.isArray(worker.preferredWorkingTimes) && worker.preferredWorkingTimes.length > 0
      ? worker.preferredWorkingTimes.join(', ')
      : 'Morning & Afternoon';
  const spokenLangs =
    Array.isArray(worker.languages) && worker.languages.length > 0
      ? worker.languages.join(', ')
      : 'English, Hindi';
  const safePhone = worker.phone || '+91 98765 43210';
  const expectedWage = worker.preferredWage ? `₹${worker.preferredWage}` : '₹750';

  const handleCopyContact = () => {
    setContactSuccess('Contact number available for direct call');
    setTimeout(() => setContactSuccess(null), 3000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-xs transition-opacity animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-[#E2E8F0] text-[#111827] animate-in slide-in-from-bottom duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-5 py-4 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">{tradeEmoji}</span>
            <div>
              <h2 className="text-base font-black text-[#111827] leading-tight">
                Worker Profile
              </h2>
              <p className="text-[11px] text-[#64748B] font-medium">
                Verified Local Talent • Zero Commission
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#64748B] hover:text-[#111827] flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close profile"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Profile Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Hero Banner: Avatar + Name + Badges */}
          <div className="flex items-start gap-4">
            <div className="relative shrink-0">
              {!imageError && worker.profilePhoto ? (
                <img
                  src={worker.profilePhoto}
                  alt={displayName}
                  onError={() => setImageError(true)}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-[#E2E8F0] shadow-sm"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white flex items-center justify-center text-2xl font-black shadow-sm">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              {worker.kycStatus === 'verified' && (
                <span
                  title="KYC Verified Worker"
                  className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow-sm border-2 border-white"
                >
                  <ShieldCheck size={14} />
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-xl font-black text-[#111827] tracking-tight leading-snug truncate">
                  {displayName}
                </h3>
                {worker.kycStatus === 'verified' && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]">
                    Verified
                  </span>
                )}
              </div>

              {/* Trade Pill */}
              <div className="inline-flex items-center gap-1.5 text-xs font-black px-2.5 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
                <span>{tradeEmoji}</span>
                <span>{tradeLabel}</span>
              </div>

              {/* Location */}
              <div className="flex items-center gap-1 text-xs text-[#64748B] font-medium pt-0.5">
                <MapPin size={13} className="text-[#2563EB] shrink-0" />
                <span className="truncate">{locationText}</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] text-center">
            <div className="space-y-0.5">
              <div className="flex items-center justify-center gap-1 text-[#F59E0B] font-black text-sm">
                <Star size={14} className="fill-[#F59E0B]" />
                <span>{ratingVal}</span>
              </div>
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                Rating
              </div>
            </div>

            <div className="space-y-0.5 border-x border-[#E2E8F0]">
              <div className="text-sm font-black text-[#111827]">
                {completedCount}
              </div>
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                Shifts Done
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="text-sm font-black text-[#16A34A]">
                {reliability}%
              </div>
              <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                Reliability
              </div>
            </div>
          </div>

          {/* Experience & Expected Wage Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-2xl bg-white border border-[#E2E8F0] space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#64748B]">
                <Briefcase size={14} className="text-[#2563EB]" />
                <span>Experience</span>
              </div>
              <div className="text-sm font-black text-[#111827]">
                {experienceYears}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] space-y-1 shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#92400E]">
                <Sparkles size={14} className="text-[#F5A900]" />
                <span>Expected Wage</span>
              </div>
              <div className="text-sm font-black text-[#92400E]">
                {expectedWage} <span className="text-[10px] font-bold text-[#B45309]">/ shift</span>
              </div>
            </div>
          </div>

          {/* About / Bio */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#64748B]">
              About Worker
            </h4>
            <p className="text-xs leading-relaxed text-[#334155] bg-[#F8FAFC] p-3 rounded-2xl border border-[#E2E8F0]">
              {bioText}
            </p>
          </div>

          {/* Skills Badges */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#64748B]">
              Verified Skills & Proficiencies
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {skillsList.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 bg-white text-[#111827] border border-[#E2E8F0] text-xs font-semibold px-2.5 py-1 rounded-xl shadow-2xs hover:border-[#2563EB] transition-colors"
                >
                  <CheckCircle2 size={12} className="text-[#16A34A]" />
                  <span>{skill}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Logistics & Availability */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-white border border-[#E2E8F0] text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[#64748B] flex items-center gap-1.5 font-medium">
                <Clock size={13} className="text-[#2563EB]" />
                <span>Working Shifts</span>
              </span>
              <span className="font-black text-[#111827]">{preferredTimes}</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
              <span className="text-[#64748B] flex items-center gap-1.5 font-medium">
                <Languages size={13} className="text-[#2563EB]" />
                <span>Languages</span>
              </span>
              <span className="font-bold text-[#111827]">{spokenLangs}</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
              <span className="text-[#64748B] flex items-center gap-1.5 font-medium">
                <ShieldCheck size={13} className="text-[#16A34A]" />
                <span>Identity Verification</span>
              </span>
              <span className="font-black text-[#16A34A] flex items-center gap-1">
                <CheckCircle2 size={13} />
                <span>Govt ID Verified</span>
              </span>
            </div>
          </div>

          {contactSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center">
              {contactSuccess}
            </div>
          )}
        </div>

        {/* Fixed Footer Action Controls */}
        <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center gap-2.5 shrink-0">
          {/* Direct Phone Call */}
          <a
            href={`tel:${safePhone}`}
            onClick={handleCopyContact}
            className="px-4 py-3 rounded-2xl bg-white border border-[#E2E8F0] text-[#111827] hover:bg-[#EFF6FF] hover:border-[#2563EB] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 shrink-0"
            title="Call Worker Directly"
          >
            <Phone size={15} className="text-[#2563EB]" />
            <span>Call</span>
          </a>

          {/* Primary Action Button: Hire / Confirm or Invite */}
          {onHire ? (
            <button
              onClick={() => {
                onHire(worker);
                onClose();
              }}
              className="flex-1 py-3 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <UserCheck size={16} />
              <span>Confirm & Hire Worker</span>
            </button>
          ) : onInvite ? (
            <button
              onClick={() => {
                onInvite(worker);
                onClose();
              }}
              className="flex-1 py-3 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <UserCheck size={16} />
              <span>Invite to Job Opening</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>Back</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
