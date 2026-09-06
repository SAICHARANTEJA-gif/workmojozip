import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Job, User } from '../../types';
import { calculateMatchScore } from '../../services/matchingService';
import {
  Users,
  ShieldCheck,
  Star,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
  Award,
  Layers,
  Table,
  QrCode,
  Phone,
  MessageSquare,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AttendanceQRModal } from '../../components/attendance/AttendanceQRModal';

interface CustomerApplicantsProps {
  initialJobId?: string | null;
  onSelectWorker?: (worker: User) => void;
}

export const CustomerApplicantsView: React.FC<CustomerApplicantsProps> = ({
  initialJobId,
}) => {
  const {
    jobs,
    allWorkers,
    confirmWorkerForJob,
    autoSelectWorkersForJob,
    attendanceRecords,
    recordAttendanceCheckIn,
  } = useApp();

  // Selected job filter
  const [selectedJobId, setSelectedJobId] = useState<string>(
    initialJobId || jobs[0]?.id || ''
  );
  const [viewMode, setViewMode] = useState<'cards' | 'compare'>('cards');

  // Modal States
  const [selectedQRWorker, setSelectedQRWorker] = useState<User | null>(null);

  const currentJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  if (!currentJob) {
    return (
      <div className="p-8 text-center text-slate-500">
        No active job openings found.
      </div>
    );
  }

  // Get applicants and confirmed workers for current job
  const applicantWorkers = allWorkers.filter(w =>
    currentJob.applicants.includes(w.id)
  );
  const confirmedWorkers = allWorkers.filter(w =>
    currentJob.confirmedWorkerIds.includes(w.id)
  );
  const waitingListWorkers = allWorkers.filter(w =>
    currentJob.waitingList.includes(w.id)
  );

  // Match scores computed dynamically
  const applicantScoredList = applicantWorkers
    .map(worker => ({
      worker,
      match: calculateMatchScore(worker, currentJob),
    }))
    .sort((a, b) => b.match.score - a.match.score);

  const handleConfirmWorker = (workerId: string) => {
    confirmWorkerForJob(currentJob.id, workerId);
    try {
      confetti({ particleCount: 40, spread: 50 });
    } catch {
      // ignore
    }
  };

  const handleAutoSelect = () => {
    autoSelectWorkersForJob(currentJob.id);
    try {
      confetti({ particleCount: 60, spread: 70 });
    } catch {
      // ignore
    }
  };

  const slotsRemaining = Math.max(0, currentJob.workersRequired - currentJob.workersConfirmed);

  return (
    <div className="pb-24 max-w-lg mx-auto px-4 pt-3 space-y-4">
      {/* Job Selector Pill */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          Select Job Posting
        </label>
        <select
          value={selectedJobId}
          onChange={e => setSelectedJobId(e.target.value)}
          className="w-full bg-white p-2.5 rounded-2xl border border-slate-200 font-extrabold text-sm text-slate-900 shadow-xs outline-none"
        >
          {jobs.map(job => (
            <option key={job.id} value={job.id}>
              {job.title} ({job.workersConfirmed}/{job.workersRequired} Filled • {job.applicants.length} Applicants)
            </option>
          ))}
        </select>
      </div>

      {/* Header Summary & Slot Status */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-900 leading-tight">
              {currentJob.title}
            </h2>
            <div className="text-xs text-slate-500 mt-0.5">
              ₹{currentJob.wage} • {currentJob.startTime} • {currentJob.approximateArea}
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-black text-amber-600 bg-amber-50 border border-amber-300 px-2.5 py-1 rounded-full">
              {currentJob.workersConfirmed} / {currentJob.workersRequired} Confirmed
            </span>
          </div>
        </div>

        {/* Action Controls: Compare view toggle & Auto-Select */}
        <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
          <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('compare')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                viewMode === 'compare'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Table size={12} />
              <span>Compare (Sec 68)</span>
            </button>
          </div>

          {slotsRemaining > 0 && applicantScoredList.length > 0 && (
            <button
              onClick={handleAutoSelect}
              className="ml-auto bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1 transition-all active:scale-95"
            >
              <Sparkles size={13} />
              <span>Auto-Fill Best {slotsRemaining}</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: COMPARISON MATRIX TABLE (Section 68) */}
      {viewMode === 'compare' ? (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Table size={15} className="text-amber-600" />
              <h3 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider">
                Candidate Comparison Matrix
              </h3>
            </div>
            <span className="text-[10px] text-slate-500 font-semibold">
              Transparent Fair Match
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 text-[10px] uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2.5">Worker</th>
                  <th className="p-2.5">Rating</th>
                  <th className="p-2.5">Jobs</th>
                  <th className="p-2.5">Distance</th>
                  <th className="p-2.5">Reliability</th>
                  <th className="p-2.5">AI Match</th>
                  <th className="p-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {applicantScoredList.map(({ worker, match }) => (
                  <tr key={worker.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="p-2.5 flex items-center gap-2">
                      <img
                        src={worker.profilePhoto}
                        alt={worker.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-bold text-slate-900 line-clamp-1">{worker.name}</div>
                        <div className="text-[10px] text-slate-400">{worker.skills[0]}</div>
                      </div>
                    </td>
                    <td className="p-2.5 font-bold text-amber-600">
                      ★ {worker.rating}
                    </td>
                    <td className="p-2.5">{worker.completedJobs}</td>
                    <td className="p-2.5">{currentJob.approximateDistanceKm} km</td>
                    <td className="p-2.5">
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
                        {worker.reliabilityScore}%
                      </span>
                    </td>
                    <td className="p-2.5">
                      <span className="bg-amber-100 text-amber-900 font-black px-1.5 py-0.5 rounded text-[10px]">
                        {match.score}%
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => handleConfirmWorker(worker.id)}
                        disabled={slotsRemaining <= 0}
                        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-2.5 py-1 rounded-lg text-[11px] disabled:opacity-40 transition-all active:scale-95 shadow-xs"
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: CARDS */
        <div className="space-y-3">
          {/* Confirmed Workers Banner */}
          {confirmedWorkers.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Confirmed Workers ({confirmedWorkers.length})</span>
              </div>

              {confirmedWorkers.map(worker => {
                const att = attendanceRecords.find(a => a.jobId === currentJob.id && a.workerId === worker.id);
                const isCheckedIn = att?.status === 'CHECKED_IN' || att?.status === 'CHECKED_OUT';

                return (
                  <div
                    key={worker.id}
                    className="bg-emerald-50/60 border border-emerald-300 rounded-3xl p-3.5 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={worker.profilePhoto}
                          alt={worker.name}
                          className="w-11 h-11 rounded-xl object-cover border border-emerald-300"
                        />
                        <div>
                          <div className="flex items-center gap-1 font-extrabold text-sm text-slate-900">
                            <span>{worker.name}</span>
                            <ShieldCheck size={14} className="text-emerald-600" />
                          </div>
                          <div className="text-xs text-slate-500 flex items-center gap-1.5">
                            <span className="text-amber-600 font-bold">{worker.rating}★</span>
                            <span>• {worker.reliabilityScore}% Reliability</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="bg-emerald-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                          <CheckCircle2 size={11} />
                          <span>Confirmed</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-semibold">
                          Attendance: <strong className={isCheckedIn ? 'text-emerald-700' : 'text-amber-700'}>{att ? att.status : 'PENDING'}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Direct Owner & Worker Connection Action Bar */}
                    <div className="flex gap-2 pt-1 border-t border-emerald-200/80">
                      <button
                        onClick={() => setSelectedQRWorker(worker)}
                        className="bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <QrCode size={13} className="text-amber-600" />
                        <span>Check-In QR</span>
                      </button>

                      <a
                        href={`tel:${worker.phone || '+919876543210'}`}
                        className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
                      >
                        <Phone size={13} />
                        <span>Call Worker Directly</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pending Applicants */}
          <div className="space-y-2 pt-1">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Awaiting Review ({applicantScoredList.length})</span>
              <span className="text-[11px] text-amber-700 font-semibold">
                Ranked by AI Match
              </span>
            </div>

            {applicantScoredList.length === 0 ? (
              <div className="bg-white rounded-3xl p-6 text-center border border-slate-200 text-slate-500 text-xs">
                No new unconfirmed applicants for this job right now.
              </div>
            ) : (
              applicantScoredList.map(({ worker, match }) => (
                <div
                  key={worker.id}
                  className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs hover:border-amber-400 space-y-3 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <img
                        src={worker.profilePhoto}
                        alt={worker.name}
                        className="w-13 h-13 rounded-2xl object-cover border border-slate-200 shadow-xs"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 font-black text-sm text-slate-900">
                          <span>{worker.name}</span>
                          <ShieldCheck size={15} className="text-emerald-600" />
                        </div>
                        <div className="text-xs font-bold text-slate-600 mt-0.5">
                          {worker.skills.slice(0, 2).join(', ')} • {worker.experience}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                          <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                            <Star size={11} className="fill-amber-400 text-amber-400" />
                            {worker.rating}★
                          </span>
                          <span>• {worker.completedJobs} jobs done</span>
                          <span className="text-emerald-700 font-bold">
                            • {worker.reliabilityScore}% reliable
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-amber-100 text-amber-950 border border-amber-300 px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1 shrink-0">
                      <Sparkles size={12} className="text-amber-600" />
                      <span>{match.score}% Match</span>
                    </div>
                  </div>

                  {/* Transparent Match Reasons */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex flex-wrap gap-1.5 text-[11px] text-slate-700">
                    {match.reasons.map((r, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <CheckCircle2 size={11} className="text-emerald-600" />
                        <span>{r}</span>
                        {i < match.reasons.length - 1 && <span className="text-slate-300">•</span>}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-slate-500 font-semibold">
                      {currentJob.approximateDistanceKm} km from workplace
                    </span>

                    <button
                      onClick={() => handleConfirmWorker(worker.id)}
                      disabled={slotsRemaining <= 0}
                      className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-40"
                    >
                      <UserCheck size={14} />
                      <span>Confirm Worker</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Waiting List Candidates */}
          {waitingListWorkers.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={14} className="text-amber-600" />
                <span>Automatic Waiting List ({waitingListWorkers.length})</span>
              </div>

              {waitingListWorkers.map((worker, idx) => (
                <div
                  key={worker.id}
                  className="bg-amber-50/50 border border-amber-200 rounded-2xl p-3 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-extrabold text-slate-900">{worker.name}</div>
                      <div className="text-slate-500 text-[11px]">{worker.rating}★ • {worker.reliabilityScore}% reliability</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-amber-800 font-semibold">
                    Auto-replaces if someone cancels
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QR Attendance Modal for Customer */}
      {selectedQRWorker && (
        <AttendanceQRModal
          job={currentJob}
          worker={selectedQRWorker}
          isEmployer={true}
          onClose={() => setSelectedQRWorker(null)}
          onVerifyCheckIn={(lat, lng) => {
            recordAttendanceCheckIn(currentJob.id, selectedQRWorker.id, lat, lng);
            setSelectedQRWorker(null);
          }}
        />
      )}
    </div>
  );
};
