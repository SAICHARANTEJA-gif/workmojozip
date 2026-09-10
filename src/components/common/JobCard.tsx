import React from 'react';
import { Job } from '../../types';
import { useApp } from '../../store/AppContext';
import { calculateMatchScore } from '../../services/matchingService';
import { getCategoryLabel, getCategoryEmoji } from '../../config/categories';
import { UserAvatar } from './UserAvatar';
import {
  Clock,
  MapPin,
  Users,
  ShieldCheck,
  Star,
  Heart,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface JobCardProps {
  job: Job;
  onViewDetails?: (job: Job) => void;
  onApply?: (job: Job) => void;
  compact?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  onViewDetails,
  onApply,
  compact = false,
}) => {
  const { user, savedJobIds, toggleSaveJob, activeRole, t, theme, language } = useApp();
  const isSaved = savedJobIds.includes(job.id);
  const matchResult = calculateMatchScore(user, job);
  const isConfirmed = job.confirmedWorkerIds.includes(user.id);
  const isApplied = job.applicants.includes(user.id);
  const isWaitingList = job.waitingList.includes(user.id);
  const waitingPos = isWaitingList ? job.waitingList.indexOf(user.id) + 1 : null;
  const isFull = job.workersConfirmed >= job.workersRequired || job.status === 'Filled';

  return (
    <div
      className="rounded-3xl p-4 transition-all relative group overflow-hidden bg-white border border-[#E2E8F0] hover:border-[#2563EB]/60 hover:shadow-md text-[#111827] shadow-xs"
    >
      {/* Top Bar: Category Pill, Match Score, Save Button */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE] inline-flex items-center gap-1.5">
            <span className="text-xs">{getCategoryEmoji(job.category)}</span>
            <span>{getCategoryLabel(job.category, language)}</span>
          </span>
          {activeRole === 'worker' && (
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 border bg-[#FFFBEB] text-[#92400E] border-[#FDE68A] shadow-2xs">
              <Sparkles size={11} className="text-[#F5A900]" />
              <span>{matchResult.score}% {t.matchScore}</span>
            </span>
          )}
          {job.recurring && job.recurring !== 'none' && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EFF6FF] text-[#1D4ED8] border border-[#DBEAFE]">
              Recurring ({job.recurring})
            </span>
          )}
        </div>

        <button
          onClick={e => {
            e.stopPropagation();
            toggleSaveJob(job.id);
          }}
          className={`p-2 rounded-full transition-all ${
            isSaved
              ? 'text-rose-500 bg-rose-50 hover:bg-rose-100'
              : 'text-[#64748B] hover:text-rose-500 hover:bg-[#EFF6FF]'
          }`}
          title={isSaved ? 'Unsave Job' : t.save}
        >
          <Heart size={18} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Main Content Layout: Image + Title + Wage */}
      <div className="flex gap-3.5 items-start">
        <img
          src={job.image}
          alt={job.title}
          className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-[#E2E8F0] shadow-inner"
        />

        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-base tracking-tight leading-snug line-clamp-1 transition-colors text-[#111827] group-hover:text-[#2563EB]">
            {job.title}
          </h3>

          {/* Yellow Wage Highlight */}
          <div className="inline-flex items-baseline gap-1 mt-1 px-2 py-0.5 rounded-lg bg-[#FFFBEB] border border-[#FDE68A]">
            <span className="text-base font-black text-[#111827]">
              ₹{job.wage}
            </span>
            <span className="text-[10px] font-bold text-[#92400E]">
              / {t.perShift}
            </span>
          </div>

          <p className="text-xs line-clamp-2 mt-1 leading-relaxed text-[#64748B]">
            {job.description}
          </p>
        </div>
      </div>

      {/* Job Meta Chips: Time, Distance, Workers Required with distinctive blue icons */}
      <div className="grid grid-cols-3 gap-2 my-3 p-2.5 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] text-[11px] font-semibold text-[#111827] transition-colors">
        <div className="flex items-center gap-1.5">
          <Clock size={13} className="shrink-0 text-[#2563EB]" />
          <span className="truncate">{job.startTime} ({job.duration})</span>
        </div>

        <div className="flex items-center gap-1.5">
          <MapPin size={13} className="shrink-0 text-[#2563EB]" />
          <span className="truncate">{job.approximateDistanceKm} km</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Users size={13} className="shrink-0 text-[#2563EB]" />
          <span className="truncate">
            {job.workersConfirmed}/{job.workersRequired} Filled
          </span>
        </div>
      </div>

      {/* Approximate Location (Privacy Shielding reminder) */}
      <div className="text-[11px] flex items-center gap-1 mb-3 text-[#64748B]">
        <span className="font-semibold text-[#111827]">Area:</span>
        <span className="truncate">{job.approximateArea}</span>
      </div>

      {/* Customer Trust Card */}
      <div className="flex items-center justify-between pt-2.5 border-t border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <UserAvatar
            src={job.customerPhoto}
            name={job.customerName}
            role="customer"
            size="sm"
          />
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold line-clamp-1 text-[#111827]">
                {job.customerName}
              </span>
              {job.customerKyc && (
                <span title="KYC Verified Customer">
                  <ShieldCheck size={13} className="text-[#16A34A] shrink-0" />
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[#64748B]">
              <Star size={10} className="fill-[#F59E0B] text-[#F59E0B]" />
              <span className="font-bold text-[#111827]">{job.customerRating}</span>
              <span>• Customer</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div>
          {isConfirmed ? (
            <button
              onClick={() => onViewDetails && onViewDetails(job)}
              className="bg-[#16A34A] hover:bg-[#15803D] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1 shadow-xs transition-all"
            >
              <CheckCircle2 size={13} />
              <span>{t.confirmed}</span>
            </button>
          ) : isWaitingList ? (
            <button
              onClick={() => onViewDetails && onViewDetails(job)}
              className="bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1"
            >
              <span>#{waitingPos} {t.waitingList.split(' ')[0]}</span>
            </button>
          ) : isApplied ? (
            <button
              onClick={() => onViewDetails && onViewDetails(job)}
              className="bg-[#F1F5F9] text-[#64748B] text-xs font-bold px-3 py-2 rounded-xl border border-[#E2E8F0]"
            >
              <span>{t.tabApplied}</span>
            </button>
          ) : isFull ? (
            <button
              onClick={() => (onApply ? onApply(job) : onViewDetails && onViewDetails(job))}
              className="bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] border border-[#DBEAFE] text-xs font-bold px-3 py-2 rounded-xl transition-all"
            >
              <span>{t.waitingList}</span>
            </button>
          ) : (
            <button
              onClick={() => (onApply ? onApply(job) : onViewDetails && onViewDetails(job))}
              className="bg-[#F5A900] hover:bg-[#E09900] text-[#111827] font-black text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-all border border-[#E09900]/40 active:scale-95 cursor-pointer"
            >
              <span>{t.applyNow}</span>
              <ArrowRight size={13} className="stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
