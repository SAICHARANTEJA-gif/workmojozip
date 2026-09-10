import React from 'react';
import { useApp } from '../../store/AppContext';
import { Job } from '../../types';
import { getCategoryLabel, getCategoryEmoji } from '../../config/categories';
import { UserAvatar } from '../../components/common/UserAvatar';
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
  const { user, jobs, allWorkers, autoSelectWorkersForJob, t, language } = useApp();

  // Active jobs created by this customer (or all seed jobs for demo presentation)
  const activeJobs = jobs.filter(j => j.status !== 'Finished');
  const finishedJobs = jobs.filter(j => j.status === 'Finished');

  // Total applicant metrics
  const totalApplicantsCount = activeJobs.reduce((acc, j) => acc + j.applicants.length, 0);
  const totalConfirmedCount = activeJobs.reduce((acc, j) => acc + j.workersConfirmed, 0);
  const totalRequiredCount = activeJobs.reduce((acc, j) => acc + j.workersRequired, 0);

  return (
    <div className="pb-24 max-w-lg mx-auto px-4 pt-3 space-y-5 text-[#111827]">
      {/* Cooperative / Employer Banner */}
      <div className="bg-white rounded-3xl p-5 text-[#111827] shadow-xs border border-[#E2E8F0] relative overflow-hidden">
        {/* Subtle decorative top accent line & corner glow */}
        <div className="h-1 w-full bg-gradient-to-r from-[#2563EB] via-[#F5A900] to-[#2563EB] rounded-t-3xl -mt-5 -mx-5 mb-4" />
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#EFF6FF] rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#2563EB] bg-[#EFF6FF] px-2.5 py-0.5 rounded-full border border-[#DBEAFE] inline-flex items-center gap-1">
              <span>🇮🇳</span>
              <span>Cooperative Employer Portal</span>
            </span>
            <h1 className="text-2xl font-black tracking-tight text-[#111827]">{user.name}</h1>
            <div className="flex items-center gap-2 text-xs font-bold pt-1">
              <span className="flex items-center gap-1 bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] px-2 py-0.5 rounded-lg shadow-2xs">
                <Star size={11} className="fill-[#F5A900] text-[#F5A900]" />
                <span className="font-black text-[#111827]">{user.rating}★ Employer</span>
              </span>
              <span className="text-[#64748B] font-semibold">• {user.jobsPosted} Gigs Posted</span>
            </div>
          </div>

          <div className="relative shrink-0">
            <UserAvatar
              src={user.profilePhoto}
              name={user.name}
              role="customer"
              size="xl"
            />
            <span className="absolute -bottom-1 -right-1 bg-[#16A34A] text-white rounded-full p-1 shadow-xs border-2 border-white">
              <CheckCircle2 size={11} />
            </span>
          </div>
        </div>

        {/* Action Buttons: Post Job (Yellow CTA) & Find Workers (White+Blue Secondary) */}
        <div className="relative z-10 grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#E2E8F0]">
          <button
            onClick={onPostJob}
            className="w-full bg-[#F5A900] hover:bg-[#E09900] text-[#111827] border border-[#FDE68A] font-black py-3 px-3 rounded-2xl shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 text-xs tracking-wide cursor-pointer"
          >
            <PlusCircle size={16} />
            <span>{t.postJob}</span>
          </button>

          <button
            onClick={onOpenDirectory}
            className="w-full bg-white hover:bg-[#EFF6FF] text-[#2563EB] border-2 border-[#2563EB] font-black py-3 px-3 rounded-2xl shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 text-xs tracking-wide cursor-pointer"
          >
            <Users size={16} />
            <span>{t.findWorkersBtn}</span>
          </button>
        </div>
      </div>

      {/* Hiring Progress Overview */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-3xl border border-[#E2E8F0] shadow-xs space-y-1">
          <div className="text-[10px] font-black text-[#64748B] uppercase tracking-wider">
            {t.hiringProgress}
          </div>
          <div className="text-2xl font-black text-[#111827] tracking-tight">
            {totalConfirmedCount} / {totalRequiredCount}
          </div>
          <div className="text-xs text-[#16A34A] font-extrabold flex items-center gap-1 pt-0.5">
            <CheckCircle2 size={13} className="text-[#16A34A]" />
            <span>{t.tabConfirmed} Workers</span>
          </div>
        </div>

        <div
          onClick={() => onOpenApplicants()}
          className="bg-white p-4 rounded-3xl border border-[#E2E8F0] hover:border-[#2563EB] shadow-xs space-y-1 cursor-pointer transition-all hover:shadow-md"
        >
          <div className="text-[10px] font-black text-[#64748B] uppercase tracking-wider">
            {t.applicantPipeline}
          </div>
          <div className="text-2xl font-black text-[#2563EB] tracking-tight">
            {totalApplicantsCount}
          </div>
          <div className="text-xs text-[#111827] font-extrabold flex items-center justify-between pt-0.5">
            <span>{t.reviewApplicants}</span>
            <ChevronRight size={13} className="text-[#2563EB]" />
          </div>
        </div>
      </div>

      {/* Active Jobs List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-[#111827] uppercase tracking-wider">
            {t.activePostings} ({activeJobs.length})
          </h2>
          <button
            onClick={onPostJob}
            className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>+ {t.postJob}</span>
          </button>
        </div>

        {activeJobs.map(job => {
          const isFull = job.workersConfirmed >= job.workersRequired;

          return (
            <div
              key={job.id}
              onClick={() => onOpenJob(job)}
              className="bg-white rounded-3xl p-4 border border-[#E2E8F0] hover:border-[#2563EB] shadow-xs hover:shadow-md transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <img
                    src={job.image}
                    alt={job.title}
                    className="w-14 h-14 rounded-2xl object-cover border border-[#E2E8F0] shrink-0"
                  />
                  <div>
                    <span className="text-[10px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                      <span>{getCategoryEmoji(job.category)}</span>
                      <span>{getCategoryLabel(job.category, language)}</span>
                    </span>
                    <h3 className="font-extrabold text-sm text-[#111827] mt-0.5 line-clamp-1">
                      {job.title}
                    </h3>
                    <div className="text-xs font-black text-[#2563EB]">₹{job.wage} / {t.perShift}</div>
                  </div>
                </div>

                <span
                  className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full ${
                    isFull
                      ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]'
                      : 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]'
                  }`}
                >
                  {isFull ? 'Filled ✓' : 'Hiring'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-[#64748B]">
                  <span>{t.tabConfirmed}: {job.workersConfirmed} / {job.workersRequired} {t.workersNeeded}</span>
                  <span className="text-[#2563EB]">{job.applicants.length} awaiting review</span>
                </div>
                <div className="w-full bg-[#F1F5F9] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#2563EB] h-full rounded-full transition-all duration-500"
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
                  className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <Users size={14} />
                  <span>{t.reviewApplicants} ({job.applicants.length})</span>
                </button>

                {!isFull && job.applicants.length > 0 && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      autoSelectWorkersForJob(job.id);
                    }}
                    className="bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] border border-[#DBEAFE] font-extrabold px-3 py-2 rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer"
                    title="Run Fair AI Auto Selection"
                  >
                    <Sparkles size={13} />
                    <span>{t.autoFill}</span>
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
            <Sparkles size={16} className="text-[#2563EB]" />
            <h2 className="text-sm font-extrabold text-[#111827] uppercase tracking-wider">
              Top Rated Community Workers
            </h2>
          </div>
          <span className="text-xs text-[#64748B] font-semibold">{t.available}</span>
        </div>

        <div className="space-y-2.5">
          {allWorkers.slice(0, 3).map(worker => (
            <div
              key={worker.id}
              className="bg-white rounded-2xl p-3 border border-[#E2E8F0] shadow-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <UserAvatar
                  src={worker.profilePhoto}
                  name={worker.name}
                  role="worker"
                  size="md"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-[#111827]">{worker.name}</span>
                    <ShieldCheck size={14} className="text-[#16A34A]" />
                  </div>
                  <div className="text-xs text-[#64748B] flex items-center gap-2">
                    <span className="text-[#F59E0B] font-bold">{worker.rating}★</span>
                    <span>• {worker.completedJobs} jobs</span>
                    <span>• {worker.reliabilityScore}% {t.reliable}</span>
                  </div>
                </div>
              </div>

              <span className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] border border-[#DBEAFE] px-2.5 py-1 rounded-full">
                {worker.skills[0] || 'Helper'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
