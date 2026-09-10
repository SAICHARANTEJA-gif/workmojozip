import React, { useState } from 'react';
import { Job } from '../../types';
import { useApp } from '../../store/AppContext';
import { calculateMatchScore } from '../../services/matchingService';
import { getCategoryLabel, getCategoryEmoji } from '../../config/categories';
import { UserAvatar } from '../../components/common/UserAvatar';
import {
  X,
  MapPin,
  Clock,
  Users,
  ShieldCheck,
  Star,
  Sparkles,
  Heart,
  CheckCircle2,
  Lock,
  ArrowRight,
  Navigation,
  AlertTriangle,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface JobDetailsProps {
  job: Job;
  onClose: () => void;
  onOpenConfirmed?: (job: Job) => void;
}

export const JobDetailsModal: React.FC<JobDetailsProps> = ({
  job,
  onClose,
  onOpenConfirmed,
}) => {
  const { user, savedJobIds, toggleSaveJob, applyToJob, cancelConfirmedJob, t, language } = useApp();
  const [isApplying, setIsApplying] = useState(false);
  const [justApplied, setJustApplied] = useState(false);

  const isSaved = savedJobIds.includes(job.id);
  const matchResult = calculateMatchScore(user, job);
  const isConfirmed = job.confirmedWorkerIds.includes(user.id);
  const isApplied = job.applicants.includes(user.id);
  const isWaitingList = job.waitingList.includes(user.id);
  const waitingPos = isWaitingList ? job.waitingList.indexOf(user.id) + 1 : null;
  const isFull = job.workersConfirmed >= job.workersRequired || job.status === 'Filled';

  const handleApply = () => {
    setIsApplying(true);
    setTimeout(() => {
      const result = applyToJob(job.id);
      setIsApplying(false);
      setJustApplied(true);
      if (!result.isWaitingList) {
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        } catch {
          // ignore
        }
      }
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 text-slate-900 animate-in slide-in-from-bottom duration-200">
        {/* Top Image Banner */}
        <div className="relative h-48 sm:h-56 w-full bg-slate-900 shrink-0">
          <img
            src={job.image}
            alt={job.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30"></div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-xs transition-colors"
          >
            <X size={18} />
          </button>

          {/* Save Button */}
          <button
            onClick={() => toggleSaveJob(job.id)}
            className="absolute top-3 left-3 w-8 h-8 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center backdrop-blur-xs transition-colors"
          >
            <Heart size={16} className={isSaved ? 'text-rose-500 fill-rose-500' : 'text-white'} />
          </button>

          {/* Badges on Banner */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <span className="bg-[#2563EB] text-white text-xs font-black px-3 py-1 rounded-full shadow-md inline-flex items-center gap-1.5">
              <span>{getCategoryEmoji(job.category)}</span>
              <span>{getCategoryLabel(job.category, language)}</span>
            </span>
            <div className="bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] text-xs font-black px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1 shadow-sm">
              <Sparkles size={12} className="text-[#F5A900] fill-[#F5A900]" />
              <span>{matchResult.score}% {t.matchScore}</span>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Title & Wage */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-[#111827] leading-tight">
                {job.title}
              </h2>
              <div className="text-xs text-[#64748B] mt-0.5 font-medium">
                Posted by {job.customerName}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="inline-block px-2.5 py-1 bg-[#FFFBEB] border border-[#FDE68A] rounded-xl text-2xl font-black text-[#92400E] leading-tight">
                ₹{job.wage}
              </div>
              <div className="text-[10px] text-[#64748B] font-bold mt-0.5 uppercase tracking-wider">{t.perShift}</div>
            </div>
          </div>

          {/* Key Job Timing & Worker Slots Grid */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-[#F7F9FC] rounded-2xl border border-[#E2E8F0] text-xs font-semibold">
            <div className="space-y-0.5">
              <div className="text-[10px] text-[#64748B] uppercase tracking-wide font-bold">{t.timingLabel}</div>
              <div className="text-[#111827] font-black">{job.startTime}</div>
              <div className="text-[11px] text-[#64748B]">{job.duration}</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[10px] text-[#64748B] uppercase tracking-wide font-bold">{t.distanceLabel}</div>
              <div className="text-[#111827] font-black">{job.approximateDistanceKm} km</div>
              <div className="text-[11px] text-[#64748B]">{t.fromYou}</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[10px] text-[#64748B] uppercase tracking-wide font-bold">{t.requiredLabel}</div>
              <div className="text-[#111827] font-black">
                {job.workersConfirmed} / {job.workersRequired} Filled
              </div>
              <div className="text-[11px] text-[#2563EB] font-bold">
                {Math.max(0, job.workersRequired - job.workersConfirmed)} {t.slotsOpen}
              </div>
            </div>
          </div>

          {/* PRIVACY SHIELD: Location Disclosure */}
          <div className="p-3.5 rounded-2xl border transition-all bg-[#F7F9FC] border-[#E2E8F0]">
            <div className="flex items-center gap-2 mb-1.5">
              <MapPin size={16} className="text-[#2563EB]" />
              <div className="font-black text-xs text-[#111827]">{t.workplaceLocation}</div>
              {!isConfirmed && (
                <span className="ml-auto flex items-center gap-1 text-[10px] bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] px-2 py-0.5 rounded-full font-bold">
                  <Lock size={10} />
                  <span>{t.privacyShielded}</span>
                </span>
              )}
            </div>

            {isConfirmed ? (
              <div className="text-xs text-[#111827] space-y-1">
                <p className="font-bold text-[#111827]">{job.exactLocation.exactAddress}</p>
                {job.exactLocation.landmark && (
                  <p className="text-[#64748B]">Landmark: {job.exactLocation.landmark}</p>
                )}
                <div className="text-[#16A34A] font-bold text-[11px] flex items-center gap-1 mt-1">
                  <CheckCircle2 size={12} />
                  <span>{t.exactAddressUnlocked}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#64748B]">
                <p className="font-bold text-[#111827]">{job.approximateArea}</p>
                <p className="text-[11px] text-[#64748B] mt-1 font-medium leading-relaxed">
                  Exact house/shop number & live GPS route unlock immediately once the customer confirms your application.
                </p>
              </div>
            )}
          </div>

          {/* Job Description */}
          <div>
            <h4 className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              {t.aboutTheWork}
            </h4>
            <p className="text-sm text-[#111827] leading-relaxed bg-[#F7F9FC] p-3.5 rounded-2xl border border-[#E2E8F0] font-medium">
              {job.description}
            </p>
          </div>

          {/* AI Fair Match Breakdown (Section 35) */}
          <div className="p-3.5 bg-[#EFF6FF] rounded-2xl border border-[#DBEAFE]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#2563EB]" />
                <span className="font-black text-xs text-[#2563EB]">
                  {t.transparentAiMatch}: {matchResult.score}%
                </span>
              </div>
              <span className="text-[10px] text-[#2563EB] font-bold">SIH Cooperative Metric</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] text-[#111827] mb-2.5">
              <div className="bg-white p-2 rounded-xl border border-[#DBEAFE] shadow-xs">
                <div className="text-[9px] text-[#64748B] font-bold">Skills (30%)</div>
                <div className="font-black text-[#111827]">{matchResult.breakdown.skills}/30</div>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#DBEAFE] shadow-xs">
                <div className="text-[9px] text-[#64748B] font-bold">Distance (20%)</div>
                <div className="font-black text-[#111827]">{matchResult.breakdown.distance}/20</div>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#DBEAFE] shadow-xs">
                <div className="text-[9px] text-[#64748B] font-bold">Availability (20%)</div>
                <div className="font-black text-[#111827]">{matchResult.breakdown.availability}/20</div>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#DBEAFE] shadow-xs">
                <div className="text-[9px] text-[#64748B] font-bold">Rating (15%)</div>
                <div className="font-black text-[#111827]">{matchResult.breakdown.rating}/15</div>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#DBEAFE] shadow-xs">
                <div className="text-[9px] text-[#64748B] font-bold">Experience (10%)</div>
                <div className="font-black text-[#111827]">{matchResult.breakdown.experience}/10</div>
              </div>
              <div className="bg-white p-2 rounded-xl border border-[#DBEAFE] shadow-xs">
                <div className="text-[9px] text-[#64748B] font-bold">Reliability (5%)</div>
                <div className="font-black text-[#111827]">{matchResult.breakdown.reliability}/5</div>
              </div>
            </div>

            <div className="space-y-1 text-[11px] text-[#111827] font-medium">
              {matchResult.reasons.map((r, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-[#2563EB] shrink-0" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Profile & Reputation */}
          <div className="p-3.5 bg-[#F7F9FC] rounded-2xl border border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserAvatar
                src={job.customerPhoto}
                name={job.customerName}
                role="customer"
                size="md"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-sm text-[#111827]">{job.customerName}</span>
                  {job.customerKyc && (
                    <span title="KYC Verified">
                      <ShieldCheck size={15} className="text-[#2563EB]" />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-[#64748B] mt-0.5">
                  <span className="flex items-center gap-0.5 text-[#92400E] font-bold">
                    <Star size={12} className="fill-[#F59E0B] text-[#F59E0B]" />
                    {job.customerRating}
                  </span>
                  <span className="font-medium">• 30+ completed gigs</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action CTA */}
        <div className="p-4 border-t border-[#E2E8F0] bg-white">
          {isConfirmed ? (
            <div className="space-y-2">
              <button
                onClick={() => onOpenConfirmed && onOpenConfirmed(job)}
                className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-3.5 rounded-2xl shadow-xs flex items-center justify-center gap-2 text-sm transition-all active:scale-95 cursor-pointer"
              >
                <Navigation size={16} />
                <span>{t.navigate}</span>
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to cancel this confirmed slot? The waiting list will automatically replace you.')) {
                    cancelConfirmedJob(job.id);
                    onClose();
                  }
                }}
                className="w-full text-xs text-rose-600 font-bold py-1 hover:underline text-center cursor-pointer"
              >
                {t.cancelSlotBtn}
              </button>
            </div>
          ) : isWaitingList ? (
            <div className="bg-[#EFF6FF] border border-[#DBEAFE] p-3.5 rounded-2xl text-center">
              <div className="font-black text-sm text-[#2563EB]">
                #{waitingPos} {t.tabWaitingList}
              </div>
              <p className="text-xs text-[#64748B] mt-1 font-medium">
                If any confirmed worker cancels, you will automatically be promoted to Confirmed!
              </p>
            </div>
          ) : isApplied || justApplied ? (
            <div className="bg-[#F7F9FC] p-3.5 rounded-2xl text-center border border-[#E2E8F0]">
              <div className="font-black text-sm text-[#111827] flex items-center justify-center gap-1.5">
                <CheckCircle2 size={16} className="text-[#16A34A]" />
                <span>Application Submitted</span>
              </div>
              <p className="text-xs text-[#64748B] mt-1 font-medium">
                Status: Waiting for customer review & confirmation.
              </p>
            </div>
          ) : isFull ? (
            <button
              onClick={handleApply}
              disabled={isApplying}
              className="w-full bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] border border-[#DBEAFE] font-bold py-3.5 rounded-2xl shadow-xs flex items-center justify-center gap-2 text-sm transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {isApplying ? (
                <span>Loading...</span>
              ) : (
                <>
                  <Users size={16} />
                  <span>{t.joinWaitingListBtn}</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleApply}
              disabled={isApplying}
              className="w-full bg-[#F5A900] hover:bg-[#E09900] text-[#111827] font-black py-3.5 rounded-2xl shadow-xs flex items-center justify-center gap-2 text-sm transition-all active:scale-95 disabled:opacity-60 border border-[#E09900]/40 cursor-pointer"
            >
              {isApplying ? (
                <span>Loading...</span>
              ) : (
                <>
                  <span>{t.applyNow} (₹{job.wage})</span>
                  <ArrowRight size={16} className="stroke-[2.5]" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
