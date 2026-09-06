import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Job, User } from '../../types';
import {
  Clock,
  CheckCircle2,
  Phone,
  ShieldCheck,
  Star,
  Users,
  Repeat,
  Sparkles,
  AlertTriangle,
  Play,
  FastForward,
} from 'lucide-react';

interface CustomerOngoingProps {
  onOpenRating: (job: Job) => void;
}

export const CustomerOngoingJobView: React.FC<CustomerOngoingProps> = ({
  onOpenRating,
}) => {
  const {
    jobs,
    allWorkers,
    simulateCompleteJob,
    rehireWorker,
    user,
  } = useApp();

  const [toast, setToast] = useState<string | null>(null);

  const activeJobs = jobs.filter(j => j.status === 'Ongoing' || j.workersConfirmed > 0);
  const finishedJobs = jobs.filter(j => j.status === 'Finished');

  const handleFinishJob = (jobId: string) => {
    simulateCompleteJob(jobId);
    const target = jobs.find(j => j.id === jobId);
    if (target) onOpenRating(target);
  };

  const handleRehire = (workerId: string, category: any) => {
    rehireWorker(workerId, category);
    setToast('🎉 Re-hire job created! Worker has been auto-notified.');
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="pb-24 max-w-lg mx-auto px-4 pt-3 space-y-4 text-slate-900">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Job Shifts & Re-Hiring
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Monitor confirmed workers, live shifts, and easily re-hire top performers
        </p>
      </div>

      {toast && (
        <div className="bg-emerald-50 border border-emerald-400 text-emerald-900 text-xs font-bold p-3 rounded-2xl flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{toast}</span>
        </div>
      )}

      {/* Active / Ongoing Jobs */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Live & Active Shifts ({activeJobs.length})
        </h2>

        {activeJobs.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 text-center border border-slate-200 text-xs text-slate-500">
            No shifts actively running.
          </div>
        ) : (
          activeJobs.map(job => (
            <div
              key={job.id}
              className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                    {job.category}
                  </span>
                  <h3 className="font-extrabold text-base text-slate-900 mt-1">{job.title}</h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Clock size={12} />
                    <span>{job.startTime} – {job.endTime} ({job.duration})</span>
                  </div>
                </div>

                <span className="bg-emerald-100 text-emerald-800 text-xs font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>Shift Active</span>
                </span>
              </div>

              {/* Confirmed Workers on this Shift */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-2">
                <div className="text-[11px] font-bold text-slate-600 uppercase">
                  Confirmed Workers ({job.confirmedWorkerIds.length} / {job.workersRequired})
                </div>

                {job.confirmedWorkerIds.map(wId => {
                  const worker = allWorkers.find(w => w.id === wId);
                  if (!worker) return null;

                  return (
                    <div
                      key={wId}
                      className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={worker.profilePhoto}
                          alt={worker.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-extrabold text-slate-900">{worker.name}</div>
                          <div className="text-[10px] text-slate-500">
                            {worker.rating}★ • {worker.reliabilityScore}% reliability
                          </div>
                        </div>
                      </div>

                      <a
                        href="tel:+919876543210"
                        className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg"
                        title="Direct Call"
                      >
                        <Phone size={13} />
                      </a>
                    </div>
                  );
                })}
              </div>

              {/* Demo Fast-Forward Shift End Trigger */}
              <div className="flex items-center justify-between pt-1">
                <div className="text-[11px] text-slate-500">
                  Agreed wage: <strong className="text-slate-900 font-bold">₹{job.wage}</strong>
                </div>

                <button
                  onClick={() => handleFinishJob(job.id)}
                  className="bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
                  title="Simulates 6:00 PM shift end for judging presentation"
                >
                  <FastForward size={13} />
                  <span>Simulate Shift End (Sec 44)</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Finished Jobs & Re-Hire Section (Section 69) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Completed Gigs & 1-Tap Re-Hire (Sec 69)
          </h2>
          <span className="text-[11px] text-purple-700 font-bold">Cooperative Community</span>
        </div>

        {finishedJobs.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 text-center border border-slate-200 text-xs text-slate-500">
            Finished jobs will appear here with instant worker re-hiring options.
          </div>
        ) : (
          finishedJobs.map(job => (
            <div
              key={job.id}
              className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">{job.title}</h3>
                  <div className="text-xs text-slate-500">Completed • ₹{job.wage} paid directly</div>
                </div>
                <span className="bg-purple-100 text-purple-900 text-xs font-black px-2.5 py-1 rounded-full">
                  Finished ✓
                </span>
              </div>

              {/* Workers to Re-Hire */}
              <div className="space-y-2">
                {job.confirmedWorkerIds.map(wId => {
                  const worker = allWorkers.find(w => w.id === wId);
                  if (!worker) return null;

                  return (
                    <div
                      key={wId}
                      className="flex items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={worker.profilePhoto}
                          alt={worker.name}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-extrabold text-slate-900">{worker.name}</div>
                          <div className="text-[11px] text-amber-600 font-bold">
                            ★ {worker.rating} • {worker.reliabilityScore}% reliability
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRehire(worker.id, job.category)}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95"
                      >
                        <Repeat size={13} />
                        <span>Hire Again</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
