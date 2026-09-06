import React from 'react';
import { Job } from '../../types';
import { useApp } from '../../store/AppContext';
import { calculateMatchScore } from '../../services/matchingService';
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
  const { user, savedJobIds, toggleSaveJob, activeRole, t } = useApp();
  const isSaved = savedJobIds.includes(job.id);
  const matchResult = calculateMatchScore(user, job);
  const isConfirmed = job.confirmedWorkerIds.includes(user.id);
  const isApplied = job.applicants.includes(user.id);
  const isWaitingList = job.waitingList.includes(user.id);
  const waitingPos = isWaitingList ? job.waitingList.indexOf(user.id) + 1 : null;
  const isFull = job.workersConfirmed >= job.workersRequired || job.status === 'Filled';

  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/90 hover:shadow-md hover:border-amber-400/80 transition-all text-slate-900 relative group overflow-hidden">
      {/* Top Bar: Category Pill, Match Score, Save Button */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="bg-slate-100 text-slate-800 text-[11px] font-bold px-2.5 py-0.8 rounded-full border border-slate-200">
            {job.category}
          </span>
          {activeRole === 'worker' && (
            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles size={11} className="text-amber-600" />
              <span>{matchResult.score}% {t.matchScore}</span>
            </span>
          )}
          {job.recurring && job.recurring !== 'none' && (
            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
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
              : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100'
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
          className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-slate-200 shadow-inner"
        />

        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-base text-slate-900 tracking-tight leading-snug line-clamp-1 group-hover:text-amber-700 transition-colors">
            {job.title}
          </h3>

          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-black text-amber-600">₹{job.wage}</span>
            <span className="text-xs font-semibold text-slate-500">/ {t.perShift}</span>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
            {job.description}
          </p>
        </div>
      </div>

      {/* Job Meta Chips: Time, Distance, Workers Required */}
      <div className="grid grid-cols-3 gap-2 my-3 p-2.5 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] font-semibold text-slate-700">
        <div className="flex items-center gap-1">
          <Clock size={13} className="text-slate-500 shrink-0" />
          <span className="truncate">{job.startTime} ({job.duration})</span>
        </div>

        <div className="flex items-center gap-1">
          <MapPin size={13} className="text-slate-500 shrink-0" />
          <span className="truncate">{job.approximateDistanceKm} km</span>
        </div>

        <div className="flex items-center gap-1">
          <Users size={13} className="text-slate-500 shrink-0" />
          <span className="truncate">
            {job.workersConfirmed}/{job.workersRequired} Filled
          </span>
        </div>
      </div>

      {/* Approximate Location (Privacy Shielding reminder) */}
      <div className="text-[11px] text-slate-500 flex items-center gap-1 mb-3">
        <span className="font-semibold text-slate-700">Area:</span>
        <span className="truncate">{job.approximateArea}</span>
      </div>

      {/* Customer Trust Card */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <img
            src={job.customerPhoto}
            alt={job.customerName}
            className="w-7 h-7 rounded-full object-cover border border-slate-200"
          />
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold text-slate-800 line-clamp-1">
                {job.customerName}
              </span>
              {job.customerKyc && (
                <span title="KYC Verified Customer">
                  <ShieldCheck size={13} className="text-emerald-600 shrink-0" />
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <Star size={10} className="fill-amber-400 text-amber-400" />
              <span className="font-bold text-slate-700">{job.customerRating}</span>
              <span>• Customer</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div>
          {isConfirmed ? (
            <button
              onClick={() => onViewDetails && onViewDetails(job)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-1.8 rounded-xl flex items-center gap-1 shadow-sm transition-all"
            >
              <CheckCircle2 size={13} />
              <span>{t.confirmed}</span>
            </button>
          ) : isWaitingList ? (
            <button
              onClick={() => onViewDetails && onViewDetails(job)}
              className="bg-amber-100 text-amber-900 border border-amber-400 text-xs font-bold px-3 py-1.8 rounded-xl flex items-center gap-1"
            >
              <span>#{waitingPos} {t.waitingList.split(' ')[0]}</span>
            </button>
          ) : isApplied ? (
            <button
              onClick={() => onViewDetails && onViewDetails(job)}
              className="bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.8 rounded-xl"
            >
              <span>{t.tabApplied}</span>
            </button>
          ) : isFull ? (
            <button
              onClick={() => (onApply ? onApply(job) : onViewDetails && onViewDetails(job))}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3 py-1.8 rounded-xl shadow-sm transition-all"
            >
              <span>{t.waitingList}</span>
            </button>
          ) : (
            <button
              onClick={() => (onApply ? onApply(job) : onViewDetails && onViewDetails(job))}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-3.5 py-1.8 rounded-xl shadow-sm flex items-center gap-1 transition-all active:scale-95"
            >
              <span>{t.applyNow}</span>
              <ArrowRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
