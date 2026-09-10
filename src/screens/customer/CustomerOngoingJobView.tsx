import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Job, User, PaymentRecord } from '../../types';
import { PaymentModal } from '../../components/payment/PaymentModal';
import { DigitalReceiptModal } from '../../components/payment/DigitalReceiptModal';
import { UserAvatar } from '../../components/common/UserAvatar';
import { getCategoryLabel, getCategoryEmoji } from '../../config/categories';
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
  CreditCard,
  Banknote,
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
    payments,
    authorizeJobPayment,
    releaseJobPayment,
    disputeJobPayment,
    settleOfflinePayment,
    activeReceipt,
    setActiveReceipt,
    t,
    language,
  } = useApp();

  const [toast, setToast] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);

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
    <div className="pb-24 max-w-lg mx-auto px-4 pt-3 space-y-4 text-[#111827]">
      <div>
        <h1 className="text-xl font-black text-[#111827] tracking-tight">
          Job Shifts & Re-Hiring
        </h1>
        <p className="text-xs text-[#64748B] font-medium">
          Monitor confirmed workers, live shifts, and easily re-hire top performers
        </p>
      </div>

      {toast && (
        <div className="bg-[#F0FDF4] border border-[#BBF7D0] text-[#16A34A] text-xs font-bold p-3 rounded-2xl flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 size={16} className="text-[#16A34A]" />
          <span>{toast}</span>
        </div>
      )}

      {/* Active / Ongoing Jobs */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
          Live & Active Shifts ({activeJobs.length})
        </h2>

        {activeJobs.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 text-center border border-[#E2E8F0] text-xs text-[#64748B] shadow-xs">
            No shifts actively running.
          </div>
        ) : (
          activeJobs.map(job => (
            <div
              key={job.id}
              className="bg-white rounded-3xl p-4 border border-[#E2E8F0] shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    <span>{getCategoryEmoji(job.category)}</span>
                    <span>{getCategoryLabel(job.category, language)}</span>
                  </span>
                  <h3 className="font-extrabold text-base text-[#111827] mt-1">{job.title}</h3>
                  <div className="text-xs text-[#64748B] flex items-center gap-1.5 mt-0.5">
                    <Clock size={12} className="text-[#2563EB]" />
                    <span>{job.startTime} – {job.endTime} ({job.duration})</span>
                  </div>
                </div>

                <span className="bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0] text-xs font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse"></span>
                  <span>{t.ongoing}</span>
                </span>
              </div>

              {/* Confirmed Workers on this Shift */}
              <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-[#E2E8F0] space-y-2">
                <div className="text-[11px] font-bold text-[#64748B] uppercase">
                  {t.tabConfirmed} ({job.confirmedWorkerIds.length} / {job.workersRequired})
                </div>

                {job.confirmedWorkerIds.map(wId => {
                  const worker = allWorkers.find(w => w.id === wId);
                  if (!worker) return null;

                  const workerPref =
                    worker.paymentPreference ||
                    (worker.preferredPaymentMethod === 'Cash' || worker.preferredPaymentMethod === 'OFFLINE'
                      ? 'OFFLINE'
                      : 'ONLINE');
                  const existingPayment = payments.find(p => p.jobId === job.id && p.workerId === worker.id);

                  return (
                    <div
                      key={wId}
                      className="bg-white p-3 rounded-2xl border border-[#E2E8F0] text-xs space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar
                            src={worker.profilePhoto}
                            name={worker.name}
                            role="worker"
                            size="sm"
                          />
                          <div>
                            <div className="font-extrabold text-[#111827]">{worker.name}</div>
                            <div className="text-[10px] text-[#64748B]">
                              {worker.rating}★ • {worker.reliabilityScore}% {t.reliable}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <a
                            href="tel:+919876543210"
                            className="p-2 bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] rounded-xl transition-colors"
                            title="Direct Call"
                          >
                            <Phone size={13} />
                          </a>

                          <button
                            onClick={() => {
                              const pay = existingPayment || authorizeJobPayment(job.id, job.wage);
                              setSelectedPayment(pay);
                            }}
                            className={`px-3 py-1.5 rounded-xl font-extrabold text-[11px] flex items-center gap-1.5 shadow-xs transition-all active:scale-95 ${
                              existingPayment?.status === 'PAID'
                                ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]'
                                : workerPref === 'OFFLINE'
                                ? 'bg-[#16A34A] hover:bg-[#15803D] text-white'
                                : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white'
                            }`}
                          >
                            {workerPref === 'OFFLINE' ? <Banknote size={13} /> : <CreditCard size={13} />}
                            <span>
                              {existingPayment?.status === 'PAID'
                                ? 'Receipt'
                                : workerPref === 'OFFLINE'
                                ? 'Settle Cash'
                                : 'Pay Online'}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Payment Preference & Status Tags */}
                      <div className="flex items-center justify-between pt-1 border-t border-[#E2E8F0] text-[11px]">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] flex items-center gap-1 ${
                            workerPref === 'OFFLINE'
                              ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]'
                              : 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]'
                          }`}>
                            {workerPref === 'OFFLINE' ? <Banknote size={11} /> : <CreditCard size={11} />}
                            <span>{workerPref === 'OFFLINE' ? 'Prefers Offline Cash' : 'Prefers Online UPI'}</span>
                          </span>

                          <span className="text-[#CBD5E1]">•</span>
                          <span className="text-[#111827] font-semibold">₹{job.wage}</span>
                        </div>

                        {existingPayment ? (
                          <span className={`font-black text-[10px] px-2 py-0.5 rounded-full ${
                            existingPayment.status === 'PAID'
                              ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]'
                              : 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]'
                          }`}>
                            {existingPayment.status === 'PAID'
                              ? '✓ Paid'
                              : existingPayment.method === 'OFFLINE'
                              ? '⏳ Cash Pending'
                              : '🔒 Protected Held'}
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#64748B] font-medium">Pending Settlement</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Demo Fast-Forward Shift End Trigger */}
              <div className="flex items-center justify-between pt-1">
                <div className="text-[11px] text-[#64748B]">
                  Agreed wage: <strong className="text-[#111827] font-bold">₹{job.wage}</strong>
                </div>

                <button
                  onClick={() => handleFinishJob(job.id)}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-xs"
                  title="Simulates shift end"
                >
                  <FastForward size={13} />
                  <span>Simulate Shift End</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Finished Jobs & Re-Hire Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
            Completed Gigs & 1-Tap Re-Hire
          </h2>
          <span className="text-[11px] text-[#2563EB] font-bold">Cooperative Community</span>
        </div>

        {finishedJobs.length === 0 ? (
          <div className="bg-white rounded-3xl p-6 text-center border border-[#E2E8F0] text-xs text-[#64748B] shadow-xs">
            Finished jobs will appear here with instant worker re-hiring options.
          </div>
        ) : (
          finishedJobs.map(job => (
            <div
              key={job.id}
              className="bg-white rounded-3xl p-4 border border-[#E2E8F0] shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-[#111827]">{job.title}</h3>
                  <div className="text-xs text-[#64748B]">Completed • ₹{job.wage} paid directly</div>
                </div>
                <span className="bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] text-xs font-black px-2.5 py-1 rounded-full">
                  {t.finished}
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
                      className="flex items-center justify-between bg-[#F8FAFC] p-2.5 rounded-2xl border border-[#E2E8F0] text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <UserAvatar
                          src={worker.profilePhoto}
                          name={worker.name}
                          role="worker"
                          size="sm"
                        />
                        <div>
                          <div className="font-extrabold text-[#111827]">{worker.name}</div>
                          <div className="text-[11px] text-[#F59E0B] font-bold">
                            ★ {worker.rating} • {worker.reliabilityScore}% {t.reliable}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRehire(worker.id, job.category)}
                        className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95"
                      >
                        <Repeat size={13} />
                        <span>{t.hireAgain}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Payment Settlement Modal */}
      {selectedPayment && (
        <PaymentModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onAuthorizePayment={() => {}}
          onReleasePayment={(id, utr) => {
            releaseJobPayment(id, utr);
            setSelectedPayment(prev => prev ? { ...prev, status: 'PAID', utrNumber: utr } : null);
          }}
          onSettleOffline={(id, notes) => {
            settleOfflinePayment(id, notes);
            setSelectedPayment(prev => prev ? { ...prev, status: 'PAID', offlineNotes: notes } : null);
          }}
          onDisputePayment={(id, reason) => {
            disputeJobPayment(id, reason);
            setSelectedPayment(prev => prev ? { ...prev, status: 'DISPUTED' } : null);
          }}
          onViewReceipt={receipt => setActiveReceipt(receipt)}
        />
      )}

      {/* Digital Receipt Modal */}
      {activeReceipt && (
        <DigitalReceiptModal
          receipt={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}
    </div>
  );
};
