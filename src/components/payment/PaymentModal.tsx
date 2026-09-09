import React, { useState } from 'react';
import { PaymentRecord, DigitalReceiptData } from '../../types';
import {
  ShieldCheck,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Share2,
  ExternalLink,
  Lock,
  ArrowRight,
  CreditCard,
  Banknote,
} from 'lucide-react';

interface PaymentModalProps {
  payment: PaymentRecord;
  onClose: () => void;
  onAuthorizePayment: (paymentId: string) => void;
  onReleasePayment: (paymentId: string, utrNumber?: string) => void;
  onDisputePayment: (paymentId: string, reason: string) => void;
  onViewReceipt: (receipt: DigitalReceiptData) => void;
  onSettleOffline?: (paymentId: string, notes?: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  payment,
  onClose,
  onAuthorizePayment,
  onReleasePayment,
  onDisputePayment,
  onViewReceipt,
  onSettleOffline,
}) => {
  const workerPref = payment.paymentPreference || (payment.method === 'Cash' || payment.method === 'OFFLINE' ? 'OFFLINE' : 'ONLINE');
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'Cash' | 'Direct Transfer'>(
    workerPref === 'OFFLINE' || payment.method === 'OFFLINE' ? 'Cash' : 'UPI'
  );
  const [cashNotes, setCashNotes] = useState(payment.offlineNotes || 'Handed over full cash on site.');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUpiQr, setShowUpiQr] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [showDisputeForm, setShowDisputeForm] = useState(false);

  // Generate valid UPI Deep Link (UPI Intent format: upi://pay?pa=...&pn=...&am=...&cu=INR)
  const upiIntentUrl = `upi://pay?pa=workmojo.worker@oksbi&pn=${encodeURIComponent(
    payment.workerName
  )}&am=${payment.amount}&cu=INR&tn=${encodeURIComponent('WORKMOJO Wage Shift')}`;

  const handleSimulateUpiPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const utr = `UPI-${Date.now().toString().slice(-10)}`;
      onReleasePayment(payment.id, utr);
    }, 1200);
  };

  const handleSettleOfflinePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (onSettleOffline) {
        onSettleOffline(payment.id, cashNotes);
      } else {
        onReleasePayment(payment.id, `CASH-HANDOVER-${Date.now().toString().slice(-8)}`);
      }
    }, 700);
  };

  const handleOpenReceipt = () => {
    const receiptData: DigitalReceiptData = {
      receiptNumber: `WM-REC-${Date.now().toString().slice(-8)}`,
      jobTitle: payment.jobTitle,
      employerName: payment.employerName,
      workerName: payment.workerName,
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      hoursWorked: 'Completed Shift',
      wageAmount: payment.amount,
      platformFee: 0.0,
      totalAmount: payment.amount,
      paymentMethod: selectedMethod,
      transactionId: payment.transactionRef || `WM-TXN-${Date.now().toString().slice(-8)}`,
      utrNumber: payment.utrNumber || `UPI-DEMO-${Date.now().toString().slice(-8)}`,
      status: 'PAID (Verified)',
    };
    onViewReceipt(receiptData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 max-w-sm w-full text-[#111827] shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
          <div className="flex items-center gap-1.5 text-[#2563EB] font-black text-sm">
            <Lock size={15} />
            <span>Protected Payment Flow</span>
          </div>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#111827] text-xs font-bold px-2.5 py-1 bg-[#F1F5F9] rounded-lg transition-colors"
          >
            Close
          </button>
        </div>

        {/* Demo Mode Badge */}
        <div className="bg-[#EFF6FF] border border-[#DBEAFE] rounded-xl p-2.5 text-xs text-[#2563EB] flex items-center gap-2">
          <span className="bg-[#2563EB] text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-xs">
            DEMO PAYMENT
          </span>
          <span className="text-[11px] font-medium leading-tight text-[#2563EB]">
            Cooperative direct settlement model. Safe simulated transaction.
          </span>
        </div>

        {/* Worker Preferred Payment Method Indicator */}
        <div className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
          workerPref === 'OFFLINE'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-[#EFF6FF] border-[#DBEAFE] text-[#2563EB]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${
              workerPref === 'OFFLINE' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-[#2563EB] text-white shadow-xs'
            }`}>
              {workerPref === 'OFFLINE' ? <Banknote size={16} /> : <CreditCard size={16} />}
            </div>
            <div>
              <div className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">
                Worker Preference
              </div>
              <div className="font-black text-[#111827] text-xs">
                {workerPref === 'OFFLINE' ? 'Offline Payment (Cash)' : 'Online Payment (UPI/Bank)'}
              </div>
            </div>
          </div>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
            workerPref === 'OFFLINE' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-white text-[#2563EB] border border-[#DBEAFE]'
          }`}>
            {workerPref}
          </span>
        </div>

        {/* Payment Summary */}
        <div className="bg-[#F7F9FC] p-4 rounded-2xl border border-[#E2E8F0] space-y-2">
          <div className="text-xs text-[#64748B]">Job: <strong className="text-[#111827]">{payment.jobTitle}</strong></div>
          <div className="text-xs text-[#64748B]">Worker: <strong className="text-[#111827]">{payment.workerName}</strong></div>

          <div className="pt-2 border-t border-[#E2E8F0] space-y-1 text-xs">
            <div className="flex justify-between text-[#64748B]">
              <span>Agreed Worker Wage:</span>
              <span className="font-bold text-[#111827]">₹{payment.amount}</span>
            </div>
            <div className="flex justify-between text-[#16A34A] font-bold">
              <span>Platform Fee (Cooperative):</span>
              <span>₹0.00 (Zero Fee)</span>
            </div>
            <div className="flex justify-between text-sm font-black text-[#2563EB] pt-1.5 border-t border-[#E2E8F0]">
              <span>Total Payable:</span>
              <span className="text-base">₹{payment.amount}</span>
            </div>
          </div>
        </div>

        {/* Payment Status State Machine Indicator */}
        <div className="flex items-center justify-between text-[11px] font-bold p-2.5 rounded-xl bg-[#F7F9FC] border border-[#E2E8F0]">
          <span className="text-[#64748B]">Payment Status:</span>
          <span
            className={`px-2.5 py-0.5 rounded-full font-bold border ${
              payment.status === 'PAID'
                ? 'bg-emerald-50 text-[#16A34A] border-emerald-200'
                : payment.status === 'AUTHORIZED'
                ? 'bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]'
                : payment.status === 'DISPUTED'
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : 'bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]'
            }`}
          >
            {payment.status === 'PENDING'
              ? selectedMethod === 'Cash' || workerPref === 'OFFLINE'
                ? 'OFFLINE PENDING'
                : 'PENDING'
              : payment.status}
          </span>
        </div>

        {/* Payment Method Selector */}
        {payment.status !== 'PAID' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-[#111827]">
                Settlement Method:
              </label>
              {workerPref === 'OFFLINE' && (
                <span className="text-[10px] text-emerald-700 font-bold">Worker prefers Cash</span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['UPI', 'Cash', 'Direct Transfer'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMethod(m)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all shadow-xs ${
                    selectedMethod === m
                      ? m === 'Cash'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-[#2563EB] text-white border-[#2563EB]'
                      : 'bg-[#F7F9FC] border-[#E2E8F0] text-[#64748B] hover:text-[#111827]'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions based on payment state */}
        {payment.status === 'PAID' ? (
          <div className="space-y-2">
            <div className="text-xs text-[#16A34A] text-center font-bold flex items-center justify-center gap-1">
              <CheckCircle2 size={16} />
              <span>
                {selectedMethod === 'Cash' || payment.method === 'OFFLINE'
                  ? 'Cash Payment Settled & Completed ✓'
                  : 'Shift Wage Settled Successfully ✓'}
              </span>
            </div>
            <button
              onClick={handleOpenReceipt}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-3 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-xs transition-all active:scale-95"
            >
              <FileText size={15} />
              <span>View & Download Digital Receipt</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            {/* Cash Settlement Form */}
            {selectedMethod === 'Cash' ? (
              <div className="space-y-2">
                <div className="p-3 bg-[#F7F9FC] rounded-2xl border border-[#E2E8F0] space-y-1.5">
                  <div className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                    <Banknote size={15} className="text-emerald-600" />
                    <span>In-Person Cash Handover</span>
                  </div>
                  <p className="text-[11px] text-[#64748B] leading-relaxed">
                    Hand over ₹{payment.amount} directly to {payment.workerName}. Then click below to record the payment as completed.
                  </p>
                  <input
                    type="text"
                    value={cashNotes}
                    onChange={e => setCashNotes(e.target.value)}
                    placeholder="Cash handover notes (optional)"
                    className="w-full bg-white border border-[#E2E8F0] rounded-xl p-2 text-[#111827] text-xs outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF]"
                  />
                </div>

                <button
                  onClick={handleSettleOfflinePayment}
                  disabled={isProcessing}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>Recording Cash Settlement...</span>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Mark Cash Payment Completed (₹{payment.amount})</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Online / UPI Flow */
              <>
                {/* UPI QR Code Toggle */}
                {selectedMethod === 'UPI' && (
                  <button
                    onClick={() => setShowUpiQr(!showUpiQr)}
                    className="w-full bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-[#DBEAFE] transition-colors"
                  >
                    <QrCode size={14} />
                    <span>{showUpiQr ? 'Hide UPI QR Code' : 'Show UPI QR Code'}</span>
                  </button>
                )}

                {/* Simulated UPI QR Display */}
                {showUpiQr && selectedMethod === 'UPI' && (
                  <div className="bg-[#F7F9FC] border border-[#E2E8F0] p-3.5 rounded-2xl text-center space-y-1.5">
                    <div className="w-32 h-32 mx-auto bg-white border border-[#E2E8F0] p-2 rounded-xl flex items-center justify-center shadow-xs">
                      <svg viewBox="0 0 40 40" className="w-full h-full text-[#111827]">
                        <rect x="2" y="2" width="10" height="10" fill="currentColor" />
                        <rect x="28" y="2" width="10" height="10" fill="currentColor" />
                        <rect x="2" y="28" width="10" height="10" fill="currentColor" />
                        <rect x="16" y="8" width="8" height="8" fill="currentColor" />
                        <rect x="16" y="20" width="8" height="8" fill="currentColor" />
                        <rect x="28" y="20" width="8" height="8" fill="currentColor" />
                      </svg>
                    </div>
                    <div className="text-[10px] font-mono font-bold text-[#2563EB] truncate">
                      upi://pay?pa=workmojo@oksbi&am={payment.amount}
                    </div>
                  </div>
                )}

                {/* Pay / Release Button */}
                <button
                  onClick={handleSimulateUpiPayment}
                  disabled={isProcessing}
                  className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-3.5 rounded-2xl shadow-xs transition-all active:scale-95 flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>Processing Payment...</span>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Release Online Payment (₹{payment.amount})</span>
                    </>
                  )}
                </button>
              </>
            )}

            {/* Dispute Trigger */}
            {!showDisputeForm ? (
              <button
                onClick={() => setShowDisputeForm(true)}
                className="w-full text-[11px] text-rose-600 hover:underline text-center pt-1 font-bold"
              >
                Dispute Payment (Work not completed / disagreement)
              </button>
            ) : (
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 space-y-2">
                <label className="text-[11px] font-bold text-rose-700 block">
                  Select Reason for Dispute:
                </label>
                <select
                  value={disputeReason}
                  onChange={e => setDisputeReason(e.target.value)}
                  className="w-full bg-white border border-rose-300 rounded-xl p-2 text-[#111827] text-xs outline-none focus:border-rose-500"
                >
                  <option value="Work not completed">Work not completed</option>
                  <option value="Incorrect amount">Incorrect amount</option>
                  <option value="Attendance disagreement">Attendance disagreement</option>
                  <option value="Worker absent">Worker absent</option>
                  <option value="Other">Other dispute</option>
                </select>
                <button
                  onClick={() => {
                    onDisputePayment(payment.id, disputeReason || 'Work not completed');
                    setShowDisputeForm(false);
                  }}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded-xl text-xs transition-all shadow-xs"
                >
                  Flag as DISPUTED
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
