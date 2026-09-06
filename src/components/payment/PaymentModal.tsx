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
} from 'lucide-react';

interface PaymentModalProps {
  payment: PaymentRecord;
  onClose: () => void;
  onAuthorizePayment: (paymentId: string) => void;
  onReleasePayment: (paymentId: string, utrNumber?: string) => void;
  onDisputePayment: (paymentId: string, reason: string) => void;
  onViewReceipt: (receipt: DigitalReceiptData) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  payment,
  onClose,
  onAuthorizePayment,
  onReleasePayment,
  onDisputePayment,
  onViewReceipt,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'Cash' | 'Direct Transfer'>('UPI');
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-slate-100 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-sm">
            <Lock size={15} />
            <span>Protected Payment Flow</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 bg-slate-800 rounded-lg"
          >
            Close
          </button>
        </div>

        {/* Demo Mode Badge (Compliance with requirement) */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 text-xs text-amber-300 flex items-center gap-2">
          <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded">
            DEMO PAYMENT
          </span>
          <span className="text-[11px] leading-tight">
            Cooperative direct settlement model. Safe simulated transaction.
          </span>
        </div>

        {/* Payment Summary */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
          <div className="text-xs text-slate-400">Job: <strong className="text-white">{payment.jobTitle}</strong></div>
          <div className="text-xs text-slate-400">Worker: <strong className="text-white">{payment.workerName}</strong></div>

          <div className="pt-2 border-t border-slate-800 space-y-1 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>Agreed Worker Wage:</span>
              <span className="font-bold text-white">₹{payment.amount}</span>
            </div>
            <div className="flex justify-between text-emerald-400">
              <span>Platform Fee (Cooperative):</span>
              <span className="font-bold">₹0.00 (Zero Fee)</span>
            </div>
            <div className="flex justify-between text-sm font-black text-amber-400 pt-1 border-t border-slate-800/80">
              <span>Total Payable:</span>
              <span>₹{payment.amount}</span>
            </div>
          </div>
        </div>

        {/* Payment Status State Machine Indicator */}
        <div className="flex items-center justify-between text-[11px] font-bold p-2.5 rounded-xl bg-slate-800">
          <span className="text-slate-400">Payment Status:</span>
          <span
            className={`px-2 py-0.5 rounded-md ${
              payment.status === 'PAID'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : payment.status === 'AUTHORIZED'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : payment.status === 'DISPUTED'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'bg-slate-700 text-slate-300'
            }`}
          >
            {payment.status}
          </span>
        </div>

        {/* Payment Method Selector */}
        {payment.status !== 'PAID' && (
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">
              Select Settlement Method:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['UPI', 'Cash', 'Direct Transfer'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMethod(m)}
                  className={`p-2 rounded-xl border text-xs font-bold transition-all ${
                    selectedMethod === m
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                      : 'bg-slate-800 border-slate-700 text-slate-300'
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
            <div className="text-xs text-emerald-400 text-center font-bold flex items-center justify-center gap-1">
              <CheckCircle2 size={16} />
              <span>Shift Wage Settled Successfully ✓</span>
            </div>
            <button
              onClick={handleOpenReceipt}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-2xl flex items-center justify-center gap-2 text-xs shadow-md transition-all active:scale-98"
            >
              <FileText size={15} />
              <span>View & Download Digital Receipt</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2 pt-1">
            {/* UPI QR Code Toggle */}
            {selectedMethod === 'UPI' && (
              <button
                onClick={() => setShowUpiQr(!showUpiQr)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700"
              >
                <QrCode size={14} />
                <span>{showUpiQr ? 'Hide UPI QR Code' : 'Show UPI QR Code'}</span>
              </button>
            )}

            {/* Simulated UPI QR Display */}
            {showUpiQr && selectedMethod === 'UPI' && (
              <div className="bg-white p-3 rounded-2xl text-slate-950 text-center space-y-1">
                <div className="w-32 h-32 mx-auto bg-slate-950 p-2 rounded-xl flex items-center justify-center">
                  {/* Programmatic SVG QR */}
                  <svg viewBox="0 0 40 40" className="w-full h-full text-white">
                    <rect x="2" y="2" width="10" height="10" fill="currentColor" />
                    <rect x="28" y="2" width="10" height="10" fill="currentColor" />
                    <rect x="2" y="28" width="10" height="10" fill="currentColor" />
                    <rect x="16" y="8" width="8" height="8" fill="currentColor" />
                    <rect x="16" y="20" width="8" height="8" fill="currentColor" />
                    <rect x="28" y="20" width="8" height="8" fill="currentColor" />
                  </svg>
                </div>
                <div className="text-[10px] font-mono font-bold text-slate-800 truncate">
                  upi://pay?pa=workmojo@oksbi&am={payment.amount}
                </div>
              </div>
            )}

            {/* Pay / Release Button */}
            <button
              onClick={handleSimulateUpiPayment}
              disabled={isProcessing}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3.5 rounded-2xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 text-xs disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Processing Payment...</span>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Release Payment (₹{payment.amount})</span>
                </>
              )}
            </button>

            {/* Dispute Trigger */}
            {!showDisputeForm ? (
              <button
                onClick={() => setShowDisputeForm(true)}
                className="w-full text-[11px] text-rose-400 hover:underline text-center pt-1"
              >
                Dispute Payment (Work not completed / disagreement)
              </button>
            ) : (
              <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/30 space-y-2">
                <label className="text-[11px] font-bold text-rose-300 block">
                  Select Reason for Dispute:
                </label>
                <select
                  value={disputeReason}
                  onChange={e => setDisputeReason(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs outline-none"
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
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded-xl text-xs"
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
