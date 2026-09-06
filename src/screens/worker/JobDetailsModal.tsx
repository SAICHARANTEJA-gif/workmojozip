import React, { useState } from 'react';
import { Job } from '../../types';
import { useApp } from '../../store/AppContext';
import { calculateMatchScore } from '../../services/matchingService';
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
  const { user, savedJobIds, toggleSaveJob, applyToJob, cancelConfirmedJob } = useApp();
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
            <span className="bg-amber-500 text-slate-950 text-xs font-black px-3 py-1 rounded-full shadow-md">
              {job.category}
            </span>
            <div className="bg-slate-900/90 text-amber-400 border border-amber-400/40 text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1">
              <Sparkles size={12} />
              <span>{matchResult.score}% AI Match</span>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Title & Wage */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
                {job.title}
              </h2>
              <div className="text-xs text-slate-500 mt-0.5">
                Posted by {job.customerName}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-2xl font-black text-amber-600 leading-none">
                ₹{job.wage}
              </div>
              <div className="text-[10px] text-slate-500 font-semibold mt-0.5">Per Shift</div>
            </div>
          </div>

          {/* Key Job Timing & Worker Slots Grid */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs font-semibold">
            <div className="space-y-0.5">
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">Timing</div>
              <div className="text-slate-800 font-bold">{job.startTime}</div>
              <div className="text-[11px] text-slate-500">{job.duration}</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">Distance</div>
              <div className="text-slate-800 font-bold">{job.approximateDistanceKm} km</div>
              <div className="text-[11px] text-slate-500">From you</div>
            </div>

            <div className="space-y-0.5">
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">Required</div>
              <div className="text-slate-800 font-bold">
                {job.workersConfirmed} / {job.workersRequired} Filled
              </div>
              <div className="text-[11px] text-amber-600">
                {Math.max(0, job.workersRequired - job.workersConfirmed)} slot(s) open
              </div>
            </div>
          </div>

          {/* PRIVACY SHIELD: Location Disclosure */}
          <div className="p-3.5 rounded-2xl border transition-all bg-slate-50 border-slate-200">
            <div className="flex items-center gap-2 mb-1.5">
              <MapPin size={16} className="text-amber-600" />
              <div className="font-bold text-xs text-slate-800">Workplace Location</div>
              {!isConfirmed && (
                <span className="ml-auto flex items-center gap-1 text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                  <Lock size={10} />
                  <span>Privacy Shielded</span>
                </span>
              )}
            </div>

            {isConfirmed ? (
              <div className="text-xs text-slate-700 space-y-1">
                <p className="font-semibold text-slate-900">{job.exactLocation.exactAddress}</p>
                {job.exactLocation.landmark && (
                  <p className="text-slate-500">Landmark: {job.exactLocation.landmark}</p>
                )}
                <div className="text-emerald-700 font-bold text-[11px] flex items-center gap-1 mt-1">
                  <CheckCircle2 size={12} />
                  <span>Exact address unlocked upon confirmation</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-600">
                <p className="font-semibold text-slate-800">{job.approximateArea}</p>
                <p className="text-[11px] text-slate-500 mt-1 italic">
                  Exact house/shop number & live GPS route unlock immediately once the customer confirms your application.
                </p>
              </div>
            )}
          </div>

          {/* Job Description */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              About the Work
            </h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-white p-3 rounded-2xl border border-slate-100">
              {job.description}
            </p>
          </div>

          {/* AI Fair Match Breakdown (Section 35) */}
          <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-600" />
                <span className="font-extrabold text-xs text-amber-950">
                  Transparent AI Match: {matchResult.score}%
                </span>
              </div>
              <span className="text-[10px] text-amber-800 font-semibold">SIH Cooperative Metric</span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-700 mb-2.5">
              <div className="bg-white/80 p-1.5 rounded-lg border border-amber-200/60">
                <div className="text-[9px] text-slate-500">Skills (30%)</div>
                <div className="font-bold text-slate-800">{matchResult.breakdown.skills}/30</div>
              </div>
              <div className="bg-white/80 p-1.5 rounded-lg border border-amber-200/60">
                <div className="text-[9px] text-slate-500">Distance (20%)</div>
                <div className="font-bold text-slate-800">{matchResult.breakdown.distance}/20</div>
              </div>
              <div className="bg-white/80 p-1.5 rounded-lg border border-amber-200/60">
                <div className="text-[9px] text-slate-500">Availability (20%)</div>
                <div className="font-bold text-slate-800">{matchResult.breakdown.availability}/20</div>
              </div>
              <div className="bg-white/80 p-1.5 rounded-lg border border-amber-200/60">
                <div className="text-[9px] text-slate-500">Rating (15%)</div>
                <div className="font-bold text-slate-800">{matchResult.breakdown.rating}/15</div>
              </div>
              <div className="bg-white/80 p-1.5 rounded-lg border border-amber-200/60">
                <div className="text-[9px] text-slate-500">Experience (10%)</div>
                <div className="font-bold text-slate-800">{matchResult.breakdown.experience}/10</div>
              </div>
              <div className="bg-white/80 p-1.5 rounded-lg border border-amber-200/60">
                <div className="text-[9px] text-slate-500">Reliability (5%)</div>
                <div className="font-bold text-slate-800">{matchResult.breakdown.reliability}/5</div>
              </div>
            </div>

            <div className="space-y-1 text-[11px] text-amber-900">
              {matchResult.reasons.map((r, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <CheckCircle2 size={12} className="text-emerald-600 shrink-0" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Profile & Reputation */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={job.customerPhoto}
                alt={job.customerName}
                className="w-11 h-11 rounded-full object-cover border border-slate-300 shadow-xs"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-slate-900">{job.customerName}</span>
                  {job.customerKyc && (
                    <span title="KYC Verified">
                      <ShieldCheck size={15} className="text-emerald-600" />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                  <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    {job.customerRating}
                  </span>
                  <span>• 30+ completed gigs</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action CTA */}
        <div className="p-4 border-t border-slate-200 bg-white">
          {isConfirmed ? (
            <div className="space-y-2">
              <button
                onClick={() => onOpenConfirmed && onOpenConfirmed(job)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-2xl shadow-md flex items-center justify-center gap-2 text-sm transition-all"
              >
                <Navigation size={16} />
                <span>Open Confirmed Job & Navigation</span>
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to cancel this confirmed slot? The waiting list will automatically replace you.')) {
                    cancelConfirmedJob(job.id);
                    onClose();
                  }
                }}
                className="w-full text-xs text-rose-600 font-bold py-1 hover:underline"
              >
                Cancel My Confirmed Slot
              </button>
            </div>
          ) : isWaitingList ? (
            <div className="bg-amber-50 border border-amber-300 p-3 rounded-2xl text-center">
              <div className="font-extrabold text-sm text-amber-900">
                You are #{waitingPos} on the Waiting List
              </div>
              <p className="text-xs text-amber-800 mt-1">
                If any confirmed worker cancels, you will automatically be promoted to Confirmed!
              </p>
            </div>
          ) : isApplied || justApplied ? (
            <div className="bg-slate-100 p-3 rounded-2xl text-center border border-slate-200">
              <div className="font-extrabold text-sm text-slate-800 flex items-center justify-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>Application Submitted</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Status: Waiting for customer review & confirmation.
              </p>
            </div>
          ) : isFull ? (
            <button
              onClick={handleApply}
              disabled={isApplying}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3 rounded-2xl shadow-md flex items-center justify-center gap-2 text-sm transition-all active:scale-98 disabled:opacity-60"
            >
              {isApplying ? (
                <span>Adding to waiting list...</span>
              ) : (
                <>
                  <Users size={16} />
                  <span>Job Filled — Join Waiting List</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleApply}
              disabled={isApplying}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3.5 rounded-2xl shadow-md flex items-center justify-center gap-2 text-sm transition-all active:scale-98 disabled:opacity-60"
            >
              {isApplying ? (
                <span>Submitting application...</span>
              ) : (
                <>
                  <span>Apply Now (₹{job.wage})</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
