import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import {
  PaymentRecord,
  PaymentStatus,
  WorkerPaymentPreference,
  WorkerBankDetails,
  WorkerUpiDetails,
  DigitalReceiptData,
} from '../../types';
import {
  Wallet,
  CreditCard,
  Banknote,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  QrCode,
  Edit3,
  X,
  FileText,
  Filter,
  Check,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { PaymentModal } from '../../components/payment/PaymentModal';

export const PaymentsView: React.FC = () => {
  const {
    user,
    activeRole,
    payments,
    updateWorkerPaymentPreference,
    updateBankDetails,
    updateUpiDetails,
    updatePaymentStatus,
    settleOfflinePayment,
    releaseJobPayment,
    disputeJobPayment,
    activeReceipt,
    setActiveReceipt,
    t,
  } = useApp();

  // Role toggle for inspecting both views (always in sync with activeRole)
  const [viewRole, setViewRole] = useState<'worker' | 'customer'>(
    activeRole === 'worker' ? 'worker' : 'customer'
  );

  // Synchronize viewRole whenever activeRole changes
  useEffect(() => {
    setViewRole(activeRole === 'worker' ? 'worker' : 'customer');
  }, [activeRole]);

  // Initial preference resolution
  const initialPref: WorkerPaymentPreference | null =
    user.paymentPreference ||
    (user.preferredPaymentMethod === 'Cash' || user.preferredPaymentMethod === 'OFFLINE'
      ? 'OFFLINE'
      : user.preferredPaymentMethod === 'ONLINE' || user.preferredPaymentMethod === 'UPI'
      ? 'ONLINE'
      : null);

  // Worker Payment Preference UI State
  const [selectedPref, setSelectedPref] = useState<WorkerPaymentPreference | null>(initialPref);
  const [savedPref, setSavedPref] = useState<WorkerPaymentPreference | null>(initialPref);
  const [isLoadingPref, setIsLoadingPref] = useState(false);
  const [isSavingPref, setIsSavingPref] = useState(false);
  const [prefSaveResult, setPrefSaveResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load worker's existing preference from backend on mount
  useEffect(() => {
    let isMounted = true;
    const fetchPreference = async () => {
      if (!user.id) return;
      setIsLoadingPref(true);
      try {
        const res = await fetch(`/api/v1/workers/${encodeURIComponent(user.id)}/payment-preference`);
        if (res.ok) {
          const data = await res.json();
          if (data && (data.paymentPreference || data.preferredPaymentMethod)) {
            const remotePref = (data.paymentPreference || data.preferredPaymentMethod).toUpperCase() as WorkerPaymentPreference;
            if (isMounted) {
              setSelectedPref(remotePref);
              setSavedPref(remotePref);
            }
          }
        }
      } catch (err) {
        console.warn('Could not fetch backend payment preference, falling back to local state', err);
      } finally {
        if (isMounted) setIsLoadingPref(false);
      }
    };

    fetchPreference();
    return () => {
      isMounted = false;
    };
  }, [user.id]);

  // Filter state for history
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'PROCESSING' | 'DISPUTED'>('ALL');

  // Modals state
  const [isEditBankOpen, setIsEditBankOpen] = useState(false);
  const [isEditUpiOpen, setIsEditUpiOpen] = useState(false);
  const [selectedPaymentForModal, setSelectedPaymentForModal] = useState<PaymentRecord | null>(null);

  // Offline settlement confirmation modal state
  const [settlingPayment, setSettlingPayment] = useState<PaymentRecord | null>(null);
  const [cashNotesInput, setCashNotesInput] = useState('');
  const [isSettlingProcessing, setIsSettlingProcessing] = useState(false);

  // Bank Form State
  const [bankForm, setBankForm] = useState<WorkerBankDetails>({
    accountHolderName: user.bankDetails?.accountHolderName || user.name,
    bankName: user.bankDetails?.bankName || 'State Bank of India',
    accountNumberMasked: user.bankDetails?.accountNumberMasked || '•••• •••• 4892',
    ifscCode: user.bankDetails?.ifscCode || 'SBIN0004521',
  });
  const [rawAccountNumber, setRawAccountNumber] = useState('');

  // UPI Form State
  const [upiForm, setUpiForm] = useState<WorkerUpiDetails>({
    upiIdMasked: user.upiDetails?.upiIdMasked || `${user.name.toLowerCase().replace(/\s+/g, '')}@oksbi`,
    isPrimary: true,
  });
  const [rawUpiId, setRawUpiId] = useState('');

  // Save feedback state
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMessage(msg);
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  // Helper filter
  const isWorkerTarget = (p: PaymentRecord) =>
    p.workerId === user.id ||
    (user.id === 'worker-me' && (p.workerId === 'w1' || p.workerId === 'worker-me')) ||
    (user.id === 'w1' && (p.workerId === 'worker-me' || p.workerId === 'w1'));

  // Payments for current view
  const workerPayments = payments.filter(isWorkerTarget);
  const employerPayments = payments; // In demo/customer mode, show all worker payments managed by customer

  const currentList = viewRole === 'worker' ? workerPayments : employerPayments;

  const filteredPayments = currentList.filter(p => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'PAID') return p.status === 'PAID' || p.status === 'COMPLETED';
    if (statusFilter === 'PENDING') return p.status === 'PENDING' || p.status === 'AUTHORIZED';
    return p.status === statusFilter;
  });

  // Calculate Worker Stats
  const workerTotalEarned = workerPayments
    .filter(p => p.status === 'PAID' || p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

  const workerPendingAmount = workerPayments
    .filter(p => p.status === 'PENDING' || p.status === 'AUTHORIZED' || p.status === 'PROCESSING')
    .reduce((sum, p) => sum + p.amount, 0);

  const workerCompletedCount = workerPayments.filter(
    p => p.status === 'PAID' || p.status === 'COMPLETED'
  ).length;

  // Calculate Employer Stats
  const employerTotalPaid = employerPayments
    .filter(p => p.status === 'PAID' || p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0);

  const employerPendingAmount = employerPayments
    .filter(p => p.status === 'PENDING' || p.status === 'AUTHORIZED' || p.status === 'PROCESSING')
    .reduce((sum, p) => sum + p.amount, 0);

  const employerFundedCount = employerPayments.length;

  // Current worker payment preference
  const currentPref: WorkerPaymentPreference =
    user.paymentPreference ||
    (user.preferredPaymentMethod === 'Cash' || user.preferredPaymentMethod === 'OFFLINE'
      ? 'OFFLINE'
      : 'ONLINE');

  const handleSavePreference = async () => {
    if (!selectedPref) {
      setPrefSaveResult({
        type: 'error',
        message: 'Please select either Online Payment or Offline / Cash before saving.',
      });
      return;
    }

    setIsSavingPref(true);
    setPrefSaveResult(null);

    try {
      const ok = await updateWorkerPaymentPreference(selectedPref);
      if (ok) {
        setSavedPref(selectedPref);
        setPrefSaveResult({
          type: 'success',
          message: 'Payment preference updated successfully.',
        });
        showFeedback('Payment preference updated successfully.');
        setTimeout(() => setPrefSaveResult(null), 4000);
      } else {
        throw new Error('Backend failed to update payment preference');
      }
    } catch (err) {
      console.error('Save preference error:', err);
      setPrefSaveResult({
        type: 'error',
        message: 'Failed to update payment preference. Please try again.',
      });
      setTimeout(() => setPrefSaveResult(null), 5000);
    } finally {
      setIsSavingPref(false);
    }
  };

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    const masked = rawAccountNumber
      ? `•••• •••• ${rawAccountNumber.replace(/\s+/g, '').slice(-4)}`
      : bankForm.accountNumberMasked;

    const updated: WorkerBankDetails = {
      accountHolderName: bankForm.accountHolderName.trim() || user.name,
      bankName: bankForm.bankName.trim() || 'State Bank of India',
      accountNumberMasked: masked,
      ifscCode: bankForm.ifscCode.trim().toUpperCase(),
    };

    updateBankDetails(updated);
    setIsEditBankOpen(false);
    setRawAccountNumber('');
    showFeedback('Bank account details saved securely.');
  };

  const handleSaveUpi = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUpi = rawUpiId.trim() || upiForm.upiIdMasked;
    const parts = cleanUpi.split('@');
    const masked = parts.length === 2 && !cleanUpi.includes('••••')
      ? `${parts[0].slice(0, 3)}••••@${parts[1]}`
      : cleanUpi;

    const updated: WorkerUpiDetails = {
      upiIdMasked: masked,
      isPrimary: true,
    };

    updateUpiDetails(updated);
    setIsEditUpiOpen(false);
    setRawUpiId('');
    showFeedback('UPI ID saved securely.');
  };

  const handleConfirmOfflineSettlement = () => {
    if (!settlingPayment) return;
    setIsSettlingProcessing(true);
    setTimeout(() => {
      settleOfflinePayment(settlingPayment.id, cashNotesInput || 'Hand-to-hand physical cash payment confirmed.');
      setIsSettlingProcessing(false);
      setSettlingPayment(null);
      setCashNotesInput('');
      showFeedback(`Cash payment of ₹${settlingPayment.amount} confirmed as PAID.`);
    }, 600);
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'PAID':
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-950 border-2 border-emerald-500 shadow-xs">
            <CheckCircle2 size={13} className="text-emerald-700 stroke-[2.5]" />
            {status}
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] shadow-2xs">
            <RefreshCw size={13} className="animate-spin text-[#2563EB] stroke-[2.5]" />
            PROCESSING
          </span>
        );
      case 'PENDING':
      case 'AUTHORIZED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] shadow-2xs">
            <Clock size={13} className="text-[#F5A900] stroke-[2.5]" />
            {status === 'AUTHORIZED' ? 'HELD (ESCROW)' : 'PENDING'}
          </span>
        );
      case 'DISPUTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
            <AlertTriangle size={13} className="text-rose-600 stroke-[2.5]" />
            DISPUTED
          </span>
        );
      case 'FAILED':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0] shadow-2xs">
            {status}
          </span>
        );
    }
  };

  const getMethodBadge = (method: string, pref?: WorkerPaymentPreference) => {
    const isOffline = method === 'OFFLINE' || method === 'Cash' || pref === 'OFFLINE';
    if (isOffline) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] shadow-2xs">
          <Banknote size={13} className="text-[#F5A900]" />
          Cash / Offline
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] shadow-2xs">
        <CreditCard size={13} className="text-[#2563EB]" />
        Online UPI
      </span>
    );
  };

  return (
    <div className="pb-28 max-w-lg mx-auto px-4 pt-3 space-y-4 text-[#111827]">
      {/* Toast Feedback */}
      {feedbackMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-[#111827] text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg border border-[#E2E8F0] flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={15} className="text-[#16A34A]" />
          <span>{feedbackMessage}</span>
        </div>
      )}

      {/* Screen Header & Perspective Switcher */}
      <div className="bg-white rounded-3xl p-4.5 border border-[#E2E8F0] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] shadow-xs">
            <Wallet size={22} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base font-black text-[#111827]">{t.paymentsTitle}</h1>
            <p className="text-xs text-[#64748B] font-bold">
              {viewRole === 'worker' ? 'Earnings, Payouts & Preferences' : 'Worker Disbursements & Settlements'}
            </p>
          </div>
        </div>

        {/* Quick Role Switcher */}
        <div className="flex bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0] text-xs font-black">
          <button
            onClick={() => setViewRole('worker')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              viewRole === 'worker'
                ? 'bg-[#2563EB] text-white shadow-xs font-black'
                : 'text-[#64748B] hover:text-[#111827] font-bold'
            }`}
          >
            Worker
          </button>
          <button
            onClick={() => setViewRole('customer')}
            className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
              viewRole === 'customer'
                ? 'bg-[#2563EB] text-white shadow-xs font-black'
                : 'text-[#64748B] hover:text-[#111827] font-bold'
            }`}
          >
            Employer
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* WORKER PERSPECTIVE */}
      {/* ========================================================================= */}
      {viewRole === 'worker' && (
        <>
          {/* 1. Worker Payment Dashboard KPI Cards */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3.5 shadow-xs flex flex-col justify-between text-[#111827] relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#16A34A]">{t.totalEarnings}</span>
                <div className="w-6 h-6 rounded-lg bg-[#F0FDF4] text-[#16A34A] flex items-center justify-center">
                  <ArrowDownLeft size={14} className="stroke-[2.5]" />
                </div>
              </div>
              <div className="mt-2.5">
                <div className="text-xl font-black tracking-tight text-[#111827] leading-none">₹{workerTotalEarned}</div>
                <div className="text-[11px] text-[#16A34A] font-bold mt-1.5 flex items-center gap-1">
                  <CheckCircle2 size={11} className="text-[#16A34A]" />
                  <span>{workerCompletedCount} jobs settled</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3.5 shadow-xs flex flex-col justify-between text-[#111827] relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#2563EB]">{t.inEscrow}</span>
                <div className="w-6 h-6 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                  <Clock size={14} className="stroke-[2.5]" />
                </div>
              </div>
              <div className="mt-2.5">
                <div className="text-xl font-black tracking-tight text-[#2563EB] leading-none">₹{workerPendingAmount}</div>
                <div className="text-[11px] text-[#64748B] font-bold mt-1.5">Awaiting settlement</div>
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-3.5 shadow-xs flex flex-col justify-between text-[#111827] relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#2563EB]">{t.preferredPayoutMethod}</span>
                <div className="w-6 h-6 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center">
                  <ShieldCheck size={14} className="stroke-[2.5]" />
                </div>
              </div>
              <div className="mt-2.5">
                <div className="text-base font-black tracking-tight truncate leading-tight text-[#111827]">
                  {savedPref === 'ONLINE' ? 'Online UPI' : savedPref === 'OFFLINE' ? 'Cash / Hand' : 'Not Set'}
                </div>
                <div className="text-[11px] text-[#64748B] font-bold mt-1.5 truncate">
                  {savedPref === 'ONLINE' ? 'Direct Bank/UPI' : savedPref === 'OFFLINE' ? 'Physical Cash' : 'Select Below'}
                </div>
              </div>
            </div>
          </div>

          {/* 2. WORKER PAYMENT METHOD SELECTION */}
          <section
            aria-label="Payment Method Selection"
            className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-xs space-y-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-black text-[#111827] tracking-tight">{t.preferredPayoutMethod}</h2>
                  {savedPref ? (
                    <span
                      className={`text-[11px] font-black px-3 py-0.5 rounded-full border ${
                        savedPref === 'ONLINE'
                          ? 'bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]'
                          : 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
                      }`}
                    >
                      Active: {savedPref === 'ONLINE' ? t.onlineInstantPayout : t.offlineCashSettlement}
                    </span>
                  ) : (
                    <span className="text-[11px] font-black px-3 py-0.5 rounded-full bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]">
                      Select Preference
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#64748B] font-semibold mt-1 leading-normal">
                  {t.commissionFreeNotice}
                </p>
              </div>

              {isLoadingPref && (
                <div className="text-xs font-bold text-[#64748B] flex items-center gap-1.5 shrink-0 pt-1">
                  <RefreshCw size={13} className="animate-spin text-[#2563EB]" />
                  <span>Loading...</span>
                </div>
              )}
            </div>

            {/* Prompt if worker has no payment preference yet */}
            {!savedPref && !selectedPref && (
              <div className="p-3.5 bg-[#EFF6FF] border border-[#DBEAFE] rounded-2xl flex items-center gap-2.5 text-xs text-[#1D4ED8] font-bold">
                <AlertTriangle size={18} className="text-[#2563EB] shrink-0" />
                <span>You have not set a payment preference yet. Please select an option below and click <strong>Save Preference</strong>.</span>
              </div>
            )}

            {/* Two Selectable Options */}
            <div className="space-y-3">
              {/* Option 1: ONLINE PAYMENT */}
              <div
                role="radio"
                aria-checked={selectedPref === 'ONLINE'}
                tabIndex={0}
                onClick={() => {
                  setSelectedPref('ONLINE');
                  setPrefSaveResult(null);
                }}
                onKeyDown={e => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    setSelectedPref('ONLINE');
                    setPrefSaveResult(null);
                  }
                }}
                className={`cursor-pointer rounded-2xl p-4 border-2 transition-all select-none ${
                  selectedPref === 'ONLINE'
                    ? 'border-[#2563EB] bg-[#EFF6FF]/60 shadow-xs ring-2 ring-[#2563EB]/20'
                    : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E1] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-xl transition-colors ${
                        selectedPref === 'ONLINE'
                          ? 'bg-[#2563EB] text-white shadow-xs'
                          : 'bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]'
                      }`}
                    >
                      <CreditCard size={24} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-[#111827]">{t.onlineInstantPayout}</span>
                        {selectedPref === 'ONLINE' && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#2563EB] text-white shadow-xs">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className={`text-xs font-black mt-0.5 ${selectedPref === 'ONLINE' ? 'text-[#1D4ED8]' : 'text-[#64748B]'}`}>
                        UPI / Bank Transfer
                      </div>
                      <p className={`text-xs font-semibold mt-0.5 leading-snug ${selectedPref === 'ONLINE' ? 'text-[#2563EB]' : 'text-[#64748B]'}`}>
                        {t.payoutUpiNotice}
                      </p>
                    </div>
                  </div>

                  {/* Radio Button Circle Indicator */}
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      selectedPref === 'ONLINE'
                        ? 'border-[#2563EB] bg-white ring-2 ring-[#2563EB]/30 shadow-xs'
                        : 'border-[#CBD5E1] bg-[#F8FAFC]'
                    }`}
                  >
                    {selectedPref === 'ONLINE' && (
                      <div className="w-3.5 h-3.5 rounded-full bg-[#2563EB] shadow-xs" />
                    )}
                  </div>
                </div>
              </div>

              {/* Option 2: OFFLINE PAYMENT */}
              <div
                role="radio"
                aria-checked={selectedPref === 'OFFLINE'}
                tabIndex={0}
                onClick={() => {
                  setSelectedPref('OFFLINE');
                  setPrefSaveResult(null);
                }}
                onKeyDown={e => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    setSelectedPref('OFFLINE');
                    setPrefSaveResult(null);
                  }
                }}
                className={`cursor-pointer rounded-2xl p-4 border-2 transition-all select-none ${
                  selectedPref === 'OFFLINE'
                    ? 'border-[#F5A900] bg-[#FFFBEB] shadow-xs ring-2 ring-[#F5A900]/20'
                    : 'border-[#E2E8F0] bg-white hover:border-[#FDE68A] hover:bg-[#FFFBEB]/30'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-xl transition-colors ${
                        selectedPref === 'OFFLINE'
                          ? 'bg-[#F5A900] text-[#111827] shadow-xs'
                          : 'bg-[#FFFBEB] text-[#F5A900] border border-[#FDE68A]'
                      }`}
                    >
                      <Banknote size={24} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-[#111827]">{t.offlineCashSettlement}</span>
                        {selectedPref === 'OFFLINE' && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-[#F5A900] text-[#111827] shadow-xs">
                            Selected
                          </span>
                        )}
                      </div>
                      <div className={`text-xs font-black mt-0.5 ${selectedPref === 'OFFLINE' ? 'text-[#92400E]' : 'text-[#64748B]'}`}>
                        Cash payment from employer
                      </div>
                      <p className={`text-xs font-semibold mt-0.5 leading-snug ${selectedPref === 'OFFLINE' ? 'text-[#B45309]' : 'text-[#64748B]'}`}>
                        {t.payoutCashNotice}
                      </p>
                    </div>
                  </div>

                  {/* Radio Button Circle Indicator */}
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      selectedPref === 'OFFLINE'
                        ? 'border-[#F5A900] bg-white ring-2 ring-[#F5A900]/30 shadow-xs'
                        : 'border-[#CBD5E1] bg-[#F8FAFC]'
                    }`}
                  >
                    {selectedPref === 'OFFLINE' && (
                      <div className="w-3.5 h-3.5 rounded-full bg-[#F5A900] shadow-xs" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Save Preference Button */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleSavePreference}
                disabled={isSavingPref || !selectedPref}
                className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm transition-all shadow-xs flex items-center justify-center gap-2 ${
                  isSavingPref || !selectedPref
                    ? 'bg-[#F1F5F9] text-[#94A3B8] border border-[#E2E8F0] cursor-not-allowed'
                    : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white active:scale-98 cursor-pointer'
                }`}
              >
                {isSavingPref ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>Saving Preference...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} strokeWidth={3} className="text-white" />
                    <span>Save Preference</span>
                  </>
                )}
              </button>

              {/* Success / Error Feedback Message */}
              {prefSaveResult && (
                <div
                  className={`p-3.5 rounded-2xl text-xs font-black flex items-center gap-2.5 transition-all animate-fade-in ${
                    prefSaveResult.type === 'success'
                      ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {prefSaveResult.type === 'success' ? (
                    <CheckCircle2 size={18} className="text-[#16A34A] shrink-0" />
                  ) : (
                    <AlertTriangle size={18} className="text-rose-600 shrink-0" />
                  )}
                  <span>{prefSaveResult.message}</span>
                </div>
              )}
            </div>
          </section>

          {/* 3. Worker Payment Details (UPI & Bank Accounts) */}
          {/* 3. Worker Payment Details (UPI & Bank Accounts) */}
          <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-[#111827]">Your Payment Details</h2>
                <p className="text-xs text-[#64748B] font-medium">Safely masked accounts for direct wage settlement</p>
              </div>
              <ShieldCheck size={20} className="text-[#16A34A]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* UPI Card */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-black text-[#111827]">
                      <QrCode size={16} className="text-[#2563EB]" />
                      <span>UPI ID (Primary)</span>
                    </div>
                    <button
                      onClick={() => {
                        setRawUpiId('');
                        setIsEditUpiOpen(true);
                      }}
                      className="text-xs font-black text-[#2563EB] bg-[#EFF6FF] border border-[#DBEAFE] hover:bg-[#DBEAFE] px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Edit3 size={12} />
                      Edit
                    </button>
                  </div>
                  <p className="text-xs font-mono font-black text-[#111827] mt-2.5 bg-white px-3 py-2 rounded-xl border border-[#E2E8F0]">
                    {user.upiDetails?.upiIdMasked || 'arun.kumar@oksbi'}
                  </p>
                </div>
                <p className="text-[11px] text-[#64748B] font-medium mt-2.5">Zero platform fees deducted</p>
              </div>

              {/* Bank Account Card */}
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-black text-[#111827]">
                      <Building2 size={16} className="text-[#2563EB]" />
                      <span>Bank Account</span>
                    </div>
                    <button
                      onClick={() => {
                        setRawAccountNumber('');
                        setIsEditBankOpen(true);
                      }}
                      className="text-xs font-black text-[#2563EB] bg-[#EFF6FF] border border-[#DBEAFE] hover:bg-[#DBEAFE] px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <Edit3 size={12} />
                      Edit
                    </button>
                  </div>
                  <div className="mt-2.5 bg-white px-3 py-2 rounded-xl border border-[#E2E8F0] space-y-1">
                    <p className="text-xs font-black text-[#111827] truncate">
                      {user.bankDetails?.bankName || 'State Bank of India'}
                    </p>
                    <p className="text-[11px] font-mono font-bold text-[#111827]">
                      Acc: {user.bankDetails?.accountNumberMasked || '•••• •••• 4892'}
                    </p>
                    <p className="text-[11px] font-mono font-bold text-[#64748B]">
                      IFSC: {user.bankDetails?.ifscCode || 'SBIN0004521'}
                    </p>
                  </div>
                </div>
                <p className="text-[11px] text-[#64748B] font-medium mt-2.5">Verified bank credentials</p>
              </div>
            </div>
          </div>

          {/* 4. Worker Payment History & Transactions */}
          <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-[#111827]">{t.transactionHistory}</h2>
                <p className="text-xs text-[#64748B] font-medium">Recent payouts and earnings records</p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl text-xs font-bold border border-[#E2E8F0]">
                {(['ALL', 'PAID', 'PENDING', 'PROCESSING'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                      statusFilter === tab
                        ? 'bg-[#2563EB] text-white font-black shadow-xs'
                        : 'text-[#64748B] hover:text-[#111827] font-bold'
                    }`}
                  >
                    {tab === 'PAID' ? 'Settled' : tab}
                  </button>
                ))}
              </div>
            </div>

            {filteredPayments.length === 0 ? (
              <div className="text-center py-10 text-[#64748B] font-bold text-xs">
                {t.noTransactions}
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                {filteredPayments.map(pay => (
                  <div
                    key={pay.id}
                    className="p-4 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#2563EB]/50 shadow-xs transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-black text-[#111827] truncate">{pay.jobTitle}</h3>
                        <p className="text-xs text-[#64748B] font-bold">Employer: {pay.employerName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-base font-black text-[#2563EB]">₹{pay.amount}</div>
                        <div className="text-xs text-[#64748B] font-medium">
                          {new Date(pay.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] text-xs">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {getMethodBadge(pay.method, pay.paymentPreference)}
                        {getStatusBadge(pay.status)}
                      </div>

                      <button
                        onClick={() => setSelectedPaymentForModal(pay)}
                        className="text-xs font-black text-[#2563EB] bg-[#EFF6FF] border border-[#DBEAFE] hover:bg-[#DBEAFE] px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <FileText size={13} />
                        Receipt
                      </button>
                    </div>

                    {pay.transactionRef && (
                      <p className="text-[11px] text-[#64748B] font-mono font-medium">
                        Ref: {pay.transactionRef} {pay.utrNumber ? `• UTR: ${pay.utrNumber}` : ''}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* EMPLOYER PERSPECTIVE */}
      {/* ========================================================================= */}
      {viewRole === 'customer' && (
        <>
          {/* 1. Employer Dashboard KPI Cards */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#16A34A]">Total Paid</span>
                <ArrowUpRight size={16} className="text-[#16A34A]" />
              </div>
              <div className="mt-2.5">
                <div className="text-xl font-black tracking-tight leading-none text-[#111827]">₹{employerTotalPaid}</div>
                <div className="text-[11px] text-[#16A34A] font-bold mt-1.5">Disbursed to workers</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#2563EB]">Pending</span>
                <Clock size={16} className="text-[#2563EB]" />
              </div>
              <div className="mt-2.5">
                <div className="text-xl font-black tracking-tight leading-none text-[#2563EB]">₹{employerPendingAmount}</div>
                <div className="text-[11px] text-[#64748B] font-bold mt-1.5">Due on shift close</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#2563EB]">Workers</span>
                <ShieldCheck size={16} className="text-[#2563EB]" />
              </div>
              <div className="mt-2.5">
                <div className="text-xl font-black tracking-tight leading-none text-[#111827]">
                  {employerFundedCount}
                </div>
                <div className="text-[11px] text-[#64748B] font-bold mt-1.5">Shifts handled</div>
              </div>
            </div>
          </div>

          {/* 2. Employer Worker Payments Management */}
          <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-[#111827]">Worker Shift Payments</h2>
                <p className="text-xs text-[#64748B] font-medium">Settle offline cash or release protected UPI payouts</p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1 bg-[#F1F5F9] p-1 rounded-xl text-xs font-bold border border-[#E2E8F0]">
                {(['ALL', 'PAID', 'PENDING'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      statusFilter === tab
                        ? 'bg-[#2563EB] text-white font-black shadow-xs'
                        : 'text-[#64748B] hover:text-[#111827] font-bold'
                    }`}
                  >
                    {tab === 'PAID' ? 'Settled' : tab}
                  </button>
                ))}
              </div>
            </div>

            {filteredPayments.length === 0 ? (
              <div className="text-center py-10 text-[#64748B] font-bold text-xs">
                No worker payments found for this filter.
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                {filteredPayments.map(pay => {
                  const isOfflinePending =
                    (pay.method === 'OFFLINE' || pay.paymentPreference === 'OFFLINE') &&
                    pay.status === 'PENDING';
                  const isOnlinePending =
                    (pay.method === 'ONLINE' || pay.method === 'UPI') &&
                    (pay.status === 'PENDING' || pay.status === 'AUTHORIZED');

                  return (
                    <div
                      key={pay.id}
                      className="p-4 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#2563EB]/50 shadow-xs transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="text-sm font-black text-[#111827] truncate">{pay.jobTitle}</h3>
                          <p className="text-xs text-[#64748B] font-bold">Worker: {pay.workerName}</p>
                          <p className="text-xs text-[#64748B] font-medium">
                            Date: {new Date(pay.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-lg font-black text-[#111827]">₹{pay.amount}</div>
                          <div className="mt-1">{getStatusBadge(pay.status)}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] flex-wrap gap-2">
                        <div className="flex items-center gap-1.5">
                          {getMethodBadge(pay.method, pay.paymentPreference)}
                          {pay.offlineSettledAt && (
                            <span className="text-xs text-[#64748B] font-semibold">
                              Paid at {new Date(pay.offlineSettledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>

                        {/* Explicit Employer Actions */}
                        <div className="flex items-center gap-2">
                          {isOfflinePending && (
                            <button
                              onClick={() => {
                                setSettlingPayment(pay);
                                setCashNotesInput('Handed over cash directly to worker on shift completion.');
                              }}
                              className="px-3.5 py-2 rounded-xl bg-[#16A34A] text-white hover:bg-[#15803D] text-xs font-black transition-all shadow-xs flex items-center gap-1.5"
                            >
                              <Banknote size={14} />
                              Mark Cash as Paid
                            </button>
                          )}

                          {isOnlinePending && (
                            <button
                              onClick={() => setSelectedPaymentForModal(pay)}
                              className="px-3.5 py-2 rounded-xl bg-[#2563EB] text-white hover:bg-[#1D4ED8] text-xs font-black transition-all shadow-xs flex items-center gap-1.5"
                            >
                              <CreditCard size={14} />
                              Release UPI Pay
                            </button>
                          )}

                          {(pay.status === 'PAID' || pay.status === 'COMPLETED') && (
                            <button
                              onClick={() => setSelectedPaymentForModal(pay)}
                              className="text-xs font-black text-[#2563EB] bg-[#EFF6FF] border border-[#DBEAFE] hover:bg-[#DBEAFE] flex items-center gap-1 py-1.5 px-3 rounded-lg transition-colors"
                            >
                              <FileText size={13} />
                              View Receipt
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: Explicit Offline Cash Settlement Confirmation Modal */}
      {/* ========================================================================= */}
      {settlingPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-slate-900 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-600">
                <Banknote size={22} />
                <h3 className="font-extrabold text-base text-slate-900">Confirm Cash Handover</h3>
              </div>
              <button
                onClick={() => setSettlingPayment(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200 text-xs space-y-1.5">
              <p className="font-semibold text-emerald-800">
                Are you sure you want to mark this offline cash payment as PAID?
              </p>
              <div className="pt-1 text-slate-700 space-y-0.5">
                <p><span className="font-bold">Worker:</span> {settlingPayment.workerName}</p>
                <p><span className="font-bold">Job:</span> {settlingPayment.jobTitle}</p>
                <p><span className="font-bold">Cash Amount:</span> ₹{settlingPayment.amount}</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Handover Notes / Memo (Optional)</label>
              <input
                type="text"
                value={cashNotesInput}
                onChange={e => setCashNotesInput(e.target.value)}
                placeholder="e.g. Handed over physical cash on shift completion."
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
              <span>Status will transition to PAID and worker will receive instant notification.</span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSettlingPayment(null)}
                disabled={isSettlingProcessing}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmOfflineSettlement}
                disabled={isSettlingProcessing}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-colors shadow-xs flex items-center gap-1.5"
              >
                {isSettlingProcessing ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    Confirm Cash Paid (₹{settlingPayment.amount})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: Safe Bank Details Edit Modal */}
      {/* ========================================================================= */}
      {isEditBankOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-slate-900 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-indigo-600">
                <Building2 size={20} />
                <h3 className="font-extrabold text-base text-slate-900">Update Bank Account</h3>
              </div>
              <button
                onClick={() => setIsEditBankOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBank} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Account Holder Name</label>
                <input
                  type="text"
                  required
                  value={bankForm.accountHolderName}
                  onChange={e => setBankForm(prev => ({ ...prev, accountHolderName: e.target.value }))}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Bank Name</label>
                <input
                  type="text"
                  required
                  value={bankForm.bankName}
                  onChange={e => setBankForm(prev => ({ ...prev, bankName: e.target.value }))}
                  placeholder="e.g. State Bank of India"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Account Number</label>
                <input
                  type="text"
                  value={rawAccountNumber}
                  onChange={e => setRawAccountNumber(e.target.value)}
                  placeholder={`Current: ${bankForm.accountNumberMasked}`}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
                />
                <p className="text-[10px] text-slate-400">Leave blank to keep existing masked account.</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">IFSC Code</label>
                <input
                  type="text"
                  required
                  value={bankForm.ifscCode}
                  onChange={e => setBankForm(prev => ({ ...prev, ifscCode: e.target.value.toUpperCase() }))}
                  placeholder="e.g. SBIN0004521"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono uppercase"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditBankOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-xs"
                >
                  Save Bank Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Safe UPI Details Edit Modal */}
      {/* ========================================================================= */}
      {isEditUpiOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-slate-900 shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-indigo-600">
                <QrCode size={20} />
                <h3 className="font-extrabold text-base text-slate-900">Update Primary UPI ID</h3>
              </div>
              <button
                onClick={() => setIsEditUpiOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveUpi} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">UPI ID / VPA</label>
                <input
                  type="text"
                  value={rawUpiId}
                  onChange={e => setRawUpiId(e.target.value)}
                  placeholder={`Current: ${upiForm.upiIdMasked}`}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-mono"
                />
                <p className="text-[10px] text-slate-400">e.g. yourname@oksbi or 9876543210@paytm</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditUpiOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-xs"
                >
                  Save UPI ID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: Payment Modal / Receipt Viewer */}
      {/* ========================================================================= */}
      {selectedPaymentForModal && (
        <PaymentModal
          payment={selectedPaymentForModal}
          onClose={() => setSelectedPaymentForModal(null)}
          onAuthorizePayment={() => {}}
          onReleasePayment={(pId, utr) => {
            releaseJobPayment(pId, utr);
            setSelectedPaymentForModal(null);
            showFeedback('Online payment released successfully!');
          }}
          onDisputePayment={(pId, reason) => {
            disputeJobPayment(pId, reason);
            setSelectedPaymentForModal(null);
            showFeedback('Payment flagged as disputed.');
          }}
          onViewReceipt={receipt => {
            setActiveReceipt(receipt);
            setSelectedPaymentForModal(null);
          }}
          onSettleOffline={(pId, notes) => {
            settleOfflinePayment(pId, notes);
            setSelectedPaymentForModal(null);
            showFeedback('Cash payment marked as settled.');
          }}
        />
      )}

      {/* Digital Receipt standalone display if activeReceipt is set */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-slate-900 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-emerald-600">
                <FileText size={20} />
                <h3 className="font-extrabold text-base text-slate-900">Digital Payment Receipt</h3>
              </div>
              <button
                onClick={() => setActiveReceipt(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between font-mono text-[10px] text-slate-500 border-b border-slate-200 pb-1">
                <span>Receipt #{activeReceipt.receiptNumber}</span>
                <span>{activeReceipt.date}</span>
              </div>
              <div className="pt-1 space-y-1">
                <p><span className="font-bold">Job:</span> {activeReceipt.jobTitle}</p>
                <p><span className="font-bold">Employer:</span> {activeReceipt.employerName}</p>
                <p><span className="font-bold">Worker:</span> {activeReceipt.workerName}</p>
                <p><span className="font-bold">Method:</span> {activeReceipt.paymentMethod}</p>
                <p><span className="font-bold">Status:</span> {activeReceipt.status}</p>
                {activeReceipt.utrNumber && <p className="font-mono text-[11px]"><span className="font-bold">UTR:</span> {activeReceipt.utrNumber}</p>}
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-black text-slate-900">
                <span>Total Amount</span>
                <span>₹{activeReceipt.totalAmount}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveReceipt(null)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

