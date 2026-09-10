import React, { useState, useMemo } from 'react';
import { useApp } from '../../store/AppContext';
import { Job, User } from '../../types';
import { calculateMatchScore, rankApplicants } from '../../services/matchingService';
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
  CreditCard,
  Banknote,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AttendanceQRModal } from '../../components/attendance/AttendanceQRModal';
import { UserAvatar } from '../../components/common/UserAvatar';
import { getCategoryEmoji } from '../../config/categories';

interface CustomerApplicantsProps {
  initialJobId?: string | null;
  onSelectWorker?: (worker: User) => void;
}

export const CustomerApplicantsView: React.FC<CustomerApplicantsProps> = ({
  initialJobId,
  onSelectWorker,
}) => {
  const {
    jobs,
    allWorkers,
    confirmWorkerForJob,
    autoSelectWorkersForJob,
    inviteWorkerToJob,
    attendanceRecords,
    recordAttendanceCheckIn,
    t,
    language,
  } = useApp();

  // Selected job filter
  const [selectedJobId, setSelectedJobId] = useState<string>(
    initialJobId || jobs[0]?.id || ''
  );
  const [viewMode, setViewMode] = useState<'cards' | 'compare'>('cards');
  const [invitedWorkerIds, setInvitedWorkerIds] = useState<string[]>([]);

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

  // Top ML-ranked eligible candidates from Supabase / allWorkers
  const recommendedCandidates = useMemo(() => {
    const unconfirmed = allWorkers.filter(
      w => !currentJob.confirmedWorkerIds.includes(w.id) && !currentJob.applicants.includes(w.id)
    );
    return rankApplicants(unconfirmed, currentJob).slice(0, 4);
  }, [allWorkers, currentJob]);

  const handleInviteWorker = (workerId: string) => {
    inviteWorkerToJob(workerId, currentJob.id);
    setInvitedWorkerIds(prev => (prev.includes(workerId) ? prev : [...prev, workerId]));
  };

  const slotsRemaining = Math.max(0, currentJob.workersRequired - currentJob.workersConfirmed);

  return (
    <div className="pb-24 max-w-lg mx-auto px-4 pt-3 space-y-4 text-[#111827]">
      {/* Job Selector Pill */}
      <div>
        <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
          Select Job Posting
        </label>
        <select
          value={selectedJobId}
          onChange={e => setSelectedJobId(e.target.value)}
          className="w-full bg-white p-2.5 rounded-2xl border border-[#E2E8F0] font-extrabold text-sm text-[#111827] shadow-xs outline-none focus:border-[#2563EB]"
        >
          {jobs.map(job => (
            <option key={job.id} value={job.id}>
              {job.title} ({job.workersConfirmed}/{job.workersRequired} Filled • {job.applicants.length} Applicants)
            </option>
          ))}
        </select>
      </div>

      {/* Header Summary & Slot Status */}
      <div className="bg-white rounded-3xl p-4 border border-[#E2E8F0] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-[#111827] leading-tight">
              {currentJob.title}
            </h2>
            <div className="text-xs text-[#64748B] mt-0.5">
              ₹{currentJob.wage} • {currentJob.startTime} • {currentJob.approximateArea}
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-black text-[#2563EB] bg-[#EFF6FF] border border-[#DBEAFE] px-2.5 py-1 rounded-full">
              {currentJob.workersConfirmed} / {currentJob.workersRequired} Confirmed
            </span>
          </div>
        </div>

        {/* Action Controls: Compare view toggle & Auto-Select */}
        <div className="flex items-center gap-2 pt-1 border-t border-[#E2E8F0]">
          <div className="flex bg-[#F1F5F9] p-0.5 rounded-xl border border-[#E2E8F0]">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'cards'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#111827]'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('compare')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                viewMode === 'compare'
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#111827]'
              }`}
            >
              <Table size={12} />
              <span>{t.compareCandidates}</span>
            </button>
          </div>

          {slotsRemaining > 0 && applicantScoredList.length > 0 && (
            <button
              onClick={handleAutoSelect}
              className="ml-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-black px-3.5 py-1.5 rounded-xl shadow-xs flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Sparkles size={13} />
              <span>{t.autoFill} ({slotsRemaining})</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW MODE 1: COMPARISON MATRIX TABLE */}
      {viewMode === 'compare' ? (
        <div className="bg-white rounded-3xl border border-[#E2E8F0] overflow-hidden shadow-xs">
          <div className="p-3 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Table size={15} className="text-[#2563EB]" />
              <h3 className="font-extrabold text-xs text-[#111827] uppercase tracking-wider">
                {t.compareCandidates}
              </h3>
            </div>
            <span className="text-[10px] text-[#64748B] font-semibold">
              {t.transparentAiMatch}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F1F5F9] text-[#64748B] text-[10px] uppercase font-bold border-b border-[#E2E8F0]">
                <tr>
                  <th className="p-2.5">Worker</th>
                  <th className="p-2.5">Rating</th>
                  <th className="p-2.5">Jobs</th>
                  <th className="p-2.5">Distance</th>
                  <th className="p-2.5">{t.reliable}</th>
                  <th className="p-2.5">{t.matchScore}</th>
                  <th className="p-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] font-medium text-[#111827]">
                {applicantScoredList.map(({ worker, match }) => (
                  <tr key={worker.id} className="hover:bg-[#EFF6FF]/50 transition-colors">
                    <td
                      className="p-2.5 flex items-center gap-2 cursor-pointer"
                      onClick={() => onSelectWorker?.(worker)}
                      title="View Worker Profile"
                    >
                      <UserAvatar
                        src={worker.profilePhoto}
                        name={worker.name}
                        role="worker"
                        size="sm"
                      />
                      <div>
                        <div className="font-bold text-[#111827] line-clamp-1 hover:text-[#2563EB] flex items-center gap-1">
                          <span>{worker.name}</span>
                          <span className="text-[11px]">
                            {getCategoryEmoji(worker.preferredCategories?.[0] || worker.skills?.[0])}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#64748B]">{worker.skills[0]}</div>
                      </div>
                    </td>
                    <td className="p-2.5 font-bold text-[#2563EB]">
                      ★ {worker.rating}
                    </td>
                    <td className="p-2.5">{worker.completedJobs}</td>
                    <td className="p-2.5">{currentJob.approximateDistanceKm} km</td>
                    <td className="p-2.5">
                      <span className="bg-[#F0FDF4] text-[#16A34A] font-bold px-1.5 py-0.5 rounded text-[10px]">
                        {worker.reliabilityScore}%
                      </span>
                    </td>
                    <td className="p-2.5">
                      <span className="bg-[#EFF6FF] text-[#2563EB] font-black px-1.5 py-0.5 rounded text-[10px]">
                        {match.score}%
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => handleConfirmWorker(worker.id)}
                        disabled={slotsRemaining <= 0}
                        className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black px-2.5 py-1 rounded-lg text-[11px] disabled:opacity-40 transition-all active:scale-95 shadow-xs cursor-pointer"
                      >
                        {t.acceptAndHire}
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
              <div className="text-xs font-bold text-[#16A34A] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={14} className="text-[#16A34A]" />
                <span>{t.tabConfirmed} ({confirmedWorkers.length})</span>
              </div>

              {confirmedWorkers.map(worker => {
                const att = attendanceRecords.find(a => a.jobId === currentJob.id && a.workerId === worker.id);
                const isCheckedIn = att?.status === 'CHECKED_IN' || att?.status === 'CHECKED_OUT';

                return (
                  <div
                    key={worker.id}
                    className="bg-[#F0FDF4] border border-[#BBF7D0] rounded-3xl p-3.5 space-y-3 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => onSelectWorker?.(worker)}
                        title="View Worker Profile"
                      >
                        <UserAvatar
                          src={worker.profilePhoto}
                          name={worker.name}
                          role="worker"
                          size="md"
                        />
                        <div>
                          <div className="flex items-center gap-1 font-extrabold text-sm text-[#111827] hover:text-[#2563EB] transition-colors">
                            <span>{worker.name}</span>
                            <span className="text-xs">
                              {getCategoryEmoji(worker.preferredCategories?.[0] || worker.skills?.[0])}
                            </span>
                            <ShieldCheck size={14} className="text-[#16A34A]" />
                          </div>
                          <div className="text-xs text-[#64748B] flex items-center gap-1.5 flex-wrap">
                            <span className="text-[#F59E0B] font-bold">{worker.rating}★</span>
                            <span>• {worker.reliabilityScore}% {t.reliable}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
                              {(worker.paymentPreference || 'ONLINE') === 'OFFLINE' ? <Banknote size={10} /> : <CreditCard size={10} />}
                              <span>{(worker.paymentPreference || 'ONLINE') === 'OFFLINE' ? 'Cash' : 'Online'}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="bg-[#16A34A] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                          <CheckCircle2 size={11} />
                          <span>{t.confirmed}</span>
                        </span>
                        <span className="text-[10px] text-[#64748B] font-semibold">
                          Attendance: <strong className={isCheckedIn ? 'text-[#16A34A]' : 'text-[#2563EB]'}>{att ? att.status : 'PENDING'}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Direct Owner & Worker Connection Action Bar */}
                    <div className="flex gap-2 pt-1 border-t border-[#BBF7D0]">
                      <button
                        onClick={() => setSelectedQRWorker(worker)}
                        className="bg-white hover:bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        <QrCode size={13} className="text-[#2563EB]" />
                        <span>Check-In QR</span>
                      </button>

                      <button
                        onClick={() => onSelectWorker?.(worker)}
                        className="bg-white hover:bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      >
                        <span>Profile</span>
                      </button>

                      <a
                        href={`tel:${worker.phone || '+919876543210'}`}
                        className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95"
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
            <div className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center justify-between">
              <span>{t.reviewApplicants} ({applicantScoredList.length})</span>
              <span className="text-[11px] text-[#2563EB] font-semibold">
                {t.transparentAiMatch}
              </span>
            </div>

            {applicantScoredList.length === 0 ? (
              <div className="bg-white rounded-3xl p-6 text-center border border-[#E2E8F0] text-[#64748B] text-xs">
                No new unconfirmed applicants for this job right now.
              </div>
            ) : (
              applicantScoredList.map(({ worker, match }) => (
                <div
                  key={worker.id}
                  className="bg-white rounded-3xl p-4 border border-[#E2E8F0] shadow-xs hover:border-[#2563EB] space-y-3 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => onSelectWorker?.(worker)}
                      title="View Worker Profile"
                    >
                      <UserAvatar
                        src={worker.profilePhoto}
                        name={worker.name}
                        role="worker"
                        size="md"
                      />
                      <div>
                        <div className="flex items-center gap-1.5 font-black text-sm text-[#111827] hover:text-[#2563EB] transition-colors">
                          <span>{worker.name}</span>
                          <span className="text-xs">
                            {getCategoryEmoji(worker.preferredCategories?.[0] || worker.skills?.[0])}
                          </span>
                          <ShieldCheck size={15} className="text-[#16A34A]" />
                        </div>
                        <div className="text-xs font-bold text-[#64748B] mt-0.5">
                          {worker.skills.slice(0, 2).join(', ')} • {worker.experience}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#64748B] mt-1 flex-wrap">
                          <span className="flex items-center gap-0.5 text-[#F59E0B] font-bold">
                            <Star size={11} className="fill-[#F59E0B] text-[#F59E0B]" />
                            {worker.rating}★
                          </span>
                          <span>• {worker.completedJobs} jobs done</span>
                          <span className="text-[#16A34A] font-bold">
                            • {worker.reliabilityScore}% {t.reliable}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
                            {(worker.paymentPreference || 'ONLINE') === 'OFFLINE' ? <Banknote size={10} /> : <CreditCard size={10} />}
                            <span>{(worker.paymentPreference || 'ONLINE') === 'OFFLINE' ? 'Prefers Cash' : 'Prefers Online'}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1">
                        <Sparkles size={12} className="text-[#2563EB]" />
                        <span>{match.score}% {t.matchScore}</span>
                      </div>
                      {typeof match.mlProbability === 'number' && (
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border ${
                          match.isMatch
                            ? 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
                            : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]'
                        }`}>
                          RF ML: {Math.round(match.mlProbability * 100)}% Match
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Transparent Match Reasons */}
                  <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0] flex flex-wrap gap-1.5 text-[11px] text-[#111827]">
                    {match.reasons.map((r, i) => (
                      <span key={i} className="flex items-center gap-1">
                        <CheckCircle2 size={11} className="text-[#16A34A]" />
                        <span>{r}</span>
                        {i < match.reasons.length - 1 && <span className="text-[#CBD5E1]">•</span>}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-[#64748B] font-semibold">
                      {currentJob.approximateDistanceKm} km {t.fromYou}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectWorker?.(worker)}
                        className="bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] font-bold px-3 py-2 rounded-xl text-xs transition-all active:scale-95 border border-[#DBEAFE] cursor-pointer"
                      >
                        Profile
                      </button>

                      <button
                        onClick={() => handleConfirmWorker(worker.id)}
                        disabled={slotsRemaining <= 0}
                        className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
                      >
                        <UserCheck size={14} />
                        <span>{t.acceptAndHire}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Machine Learning: Recommended Workers for this Job */}
          {recommendedCandidates.length > 0 && (
            <div className="space-y-2 pt-3 border-t border-[#E2E8F0]">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#F5A900]" />
                  <span>ML Recommended Workers ({recommendedCandidates.length})</span>
                </div>
                <span className="text-[10px] font-bold text-[#16A34A] bg-[#F0FDF4] border border-[#BBF7D0] px-2 py-0.5 rounded-full">
                  Random Forest (100 Trees)
                </span>
              </div>

              {recommendedCandidates.map(({ worker, match }) => {
                const isInvited = invitedWorkerIds.includes(worker.id);
                return (
                  <div
                    key={worker.id}
                    className="bg-white rounded-3xl p-4 border border-[#E2E8F0] shadow-xs hover:border-[#2563EB] space-y-3 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div
                        className="flex items-center gap-3 cursor-pointer"
                        onClick={() => onSelectWorker?.(worker)}
                        title="View Worker Profile"
                      >
                        <UserAvatar
                          src={worker.profilePhoto}
                          name={worker.name}
                          role="worker"
                          size="md"
                        />
                        <div>
                          <div className="flex items-center gap-1.5 font-black text-sm text-[#111827] hover:text-[#2563EB] transition-colors">
                            <span>{worker.name}</span>
                            <span className="text-xs">
                              {getCategoryEmoji(worker.preferredCategories?.[0] || worker.skills?.[0])}
                            </span>
                            <ShieldCheck size={15} className="text-[#16A34A]" />
                          </div>
                          <div className="text-xs font-bold text-[#64748B] mt-0.5">
                            {worker.skills.slice(0, 2).join(', ')} • {worker.experience}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[#64748B] mt-1 flex-wrap">
                            <span className="flex items-center gap-0.5 text-[#F59E0B] font-bold">
                              <Star size={11} className="fill-[#F59E0B] text-[#F59E0B]" />
                              {worker.rating}★
                            </span>
                            <span>• {worker.completedJobs} jobs done</span>
                            <span className="text-[#16A34A] font-bold">
                              • {worker.reliabilityScore}% {t.reliable}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] px-2.5 py-1 rounded-xl text-xs font-black flex items-center gap-1">
                          <Sparkles size={12} className="text-[#F5A900]" />
                          <span>{match.score}% {t.matchScore}</span>
                        </div>
                        {typeof match.mlProbability === 'number' && (
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md border bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]">
                            RF Prob: {(match.mlProbability * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#F8FAFC] p-2.5 rounded-xl border border-[#E2E8F0] flex flex-wrap gap-1.5 text-[11px] text-[#111827]">
                      {match.reasons.map((r, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <CheckCircle2 size={11} className="text-[#16A34A]" />
                          <span>{r}</span>
                          {i < match.reasons.length - 1 && <span className="text-[#CBD5E1]">•</span>}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-[#64748B] font-semibold">
                        {worker.locationArea || 'Near You'}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectWorker?.(worker)}
                          className="bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] font-bold px-3 py-2 rounded-xl text-xs transition-all active:scale-95 border border-[#DBEAFE] cursor-pointer"
                        >
                          Profile
                        </button>

                        <button
                          onClick={() => handleInviteWorker(worker.id)}
                          disabled={isInvited}
                          className={`font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer ${
                            isInvited
                              ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]'
                              : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
                          }`}
                        >
                          {isInvited ? (
                            <>
                              <CheckCircle2 size={13} />
                              <span>Invited</span>
                            </>
                          ) : (
                            <>
                              <Users size={13} />
                              <span>Invite to Job</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Waiting List Candidates */}
          {waitingListWorkers.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                <Clock size={14} className="text-[#2563EB]" />
                <span>{t.tabWaitingList} ({waitingListWorkers.length})</span>
              </div>

              {waitingListWorkers.map((worker, idx) => (
                <div
                  key={worker.id}
                  onClick={() => onSelectWorker?.(worker)}
                  className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl p-3 flex items-center justify-between text-xs cursor-pointer hover:border-[#2563EB] transition-all"
                  title="Click to view worker profile"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-[#2563EB] text-white font-black flex items-center justify-center text-xs">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-extrabold text-[#111827] flex items-center gap-1">
                        <span>{worker.name}</span>
                        <span className="text-[11px]">
                          {getCategoryEmoji(worker.preferredCategories?.[0] || worker.skills?.[0])}
                        </span>
                      </div>
                      <div className="text-[#64748B] text-[11px]">{worker.rating}★ • {worker.reliabilityScore}% reliability</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#2563EB] font-semibold">
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
