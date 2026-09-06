import React from 'react';
import { useApp } from '../../store/AppContext';
import { Job } from '../../types';
import {
  PlusCircle,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Star,
  Sparkles,
  TrendingUp,
  MapPin,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

interface CustomerHomeProps {
  onPostJob: () => void;
  onOpenJob: (job: Job) => void;
  onOpenApplicants: (jobId?: string) => void;
  onOpenDirectory?: () => void;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({
  onPostJob,
  onOpenJob,
  onOpenApplicants,
  onOpenDirectory,
}) => {
  const { user, jobs, allWorkers, autoSelectWorkersForJob, t } = useApp();

  // Active jobs created by this customer (or all seed jobs for demo presentation)
  const activeJobs = jobs.filter(j => j.status !== 'Finished');
  const finishedJobs = jobs.filter(j => j.status === 'Finished');

  // Total applicant metrics
  const totalApplicantsCount = activeJobs.reduce((acc, j) => acc + j.applicants.length, 0);
  const totalConfirmedCount = activeJobs.reduce((acc, j) => acc + j.workersConfirmed, 0);
  const totalRequiredCount = activeJobs.reduce((acc, j) => acc + j.workersRequired, 0);

  return (
    <div className="pb-24 max-w-lg mx-auto px-4 pt-3 space-y-5">
      {/* Indian Cooperative / Gov-Tech Pro Employer Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 rounded-3xl p-5 text-white shadow-xl border border-amber-500/30 relative overflow-hidden">
        {/* Decorative Gold & Navy Glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/15 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30 inline-flex items-center gap-1">
              <span>🇮🇳</span>
              <span>Cooperative Employer Portal</span>
            </span>
            <h1 className="text-2xl font-black tracking-tight text-white">{user.name}</h1>
            <div className="flex items-center gap-2 text-xs font-bold pt-1">
              <span className="flex items-center gap-0.5 bg-amber-500 text-slate-950 px-2 py-0.5 rounded-lg shadow-xs">
                <Star size={11} className="fill-slate-950 text-slate-950" />
                <span>{user.rating}★ Employer</span>
              </span>
              <span className="text-slate-300 font-semibold">• {user.jobsPosted} Gigs Posted</span>
            </div>
          </div>

          <div className="relative shrink-0">
            <div className="p-0.5 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-400 shadow-md">
              <img
                src={user.profilePhoto}
                alt={user.name}
                className="w-16 h-16 rounded-2xl object-cover"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow-md border-2 border-slate-900">
              <CheckCircle2 size={11} />
            </span>
          </div>
        </div>

        {/* Action Buttons: Post Job & Find Workers Directory */}
        <div className="relative z-10 grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80">
          <button
            onClick={onPostJob}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 px-3 rounded-2xl shadow-lg flex items-center justify-center gap-1.5 transition-all active:scale-98 text-xs tracking-wide"
          >
            <PlusCircle size={16} />
            <span>{t.postJob}</span>
          </button>

          <button
            onClick={onOpenDirectory}
            className="w-full bg-slate-950/80 hover:bg-slate-800 text-amber-300 border border-amber-400/30 font-black py-3 px-3 rounded-2xl shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-98 text-xs tracking-wide"
          >
            <Users size={16} />
            <span>Find Workers</span>
          </button>
        </div>
      </div>

      {/* Hiring Progress Overview (Section 67) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs space-y-1">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {t.hiringProgress}
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {totalConfirmedCount} / {totalRequiredCount}
          </div>
          <div className="text-xs text-emerald-700 font-extrabold flex items-center gap-1 pt-0.5">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>{t.tabConfirmed} Workers</span>
          </div>
        </div>

        <div
          onClick={() => onOpenApplicants()}
          className="bg-white p-4 rounded-3xl border border-slate-200/90 hover:border-amber-400 shadow-xs space-y-1 cursor-pointer transition-all hover:shadow-md"
        >
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            {t.applicantPipeline}
          </div>
          <div className="text-2xl font-black text-amber-600 tracking-tight">
            {totalApplicantsCount}
          </div>
          <div className="text-xs text-slate-700 font-extrabold flex items-center justify-between pt-0.5">
            <span>{t.reviewApplicants}</span>
            <ChevronRight size={13} className="text-amber-600" />
          </div>
        </div>
      </div>

      {/* Active Jobs List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            Active Job Openings ({activeJobs.length})
          </h2>
          <button
            onClick={onPostJob}
            className="text-xs font-bold text-amber-600 hover:underline flex items-center gap-0.5"
          >
            <span>+ New Post</span>
          </button>
        </div>

        {activeJobs.map(job => {
          const isFull = job.workersConfirmed >= job.workersRequired;

          return (
            <div
              key={job.id}
              onClick={() => onOpenJob(job)}
              className="bg-white rounded-3xl p-4 border border-slate-200/90 hover:border-amber-400 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <img
                    src={job.image}
                    alt={job.title}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      {job.category}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-900 mt-0.5 line-clamp-1">
                      {job.title}
                    </h3>
                    <div className="text-xs font-black text-amber-600">₹{job.wage} / shift</div>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
                    isFull
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {isFull ? 'Filled ✓' : 'Hiring'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Confirmed: {job.workersConfirmed} / {job.workersRequired} needed</span>
                  <span className="text-amber-700">{job.applicants.length} awaiting review</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, (job.workersConfirmed / job.workersRequired) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onOpenApplicants(job.id);
                  }}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Users size={14} />
                  <span>Review Applicants ({job.applicants.length})</span>
                </button>

                {!isFull && job.applicants.length > 0 && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      autoSelectWorkersForJob(job.id);
                    }}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition-all"
                    title="Run Fair AI Auto Selection"
                  >
                    <Sparkles size={13} />
                    <span>Auto-Fill</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Top Recommended Available Workers in Community */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles size={16} className="text-amber-600" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              Top Rated Community Workers
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-semibold">Available Now</span>
        </div>

        <div className="space-y-2.5">
          {allWorkers.slice(0, 3).map(worker => (
            <div
              key={worker.id}
              className="bg-white rounded-2xl p-3 border border-slate-200 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <img
                  src={worker.profilePhoto}
                  alt={worker.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-300"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-slate-800">{worker.name}</span>
                    <ShieldCheck size={14} className="text-emerald-600" />
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span className="text-amber-600 font-bold">{worker.rating}★</span>
                    <span>• {worker.completedJobs} jobs</span>
                    <span>• {worker.reliabilityScore}% reliability</span>
                  </div>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                {worker.skills[0] || 'Helper'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
