import React from 'react';
import { DigitalReceiptData } from '../../types';
import { ShieldCheck, Download, Share2, CheckCircle2, X } from 'lucide-react';

interface DigitalReceiptModalProps {
  receipt: DigitalReceiptData;
  onClose: () => void;
}

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({
  receipt,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-slate-100 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-sm">
            <CheckCircle2 size={16} />
            <span>Digital Payment Receipt</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Receipt Container */}
        <div className="bg-white text-slate-900 rounded-2xl p-5 shadow-inner space-y-3 font-sans">
          <div className="text-center border-b border-slate-200 pb-3">
            <div className="w-14 h-14 mx-auto rounded-full overflow-hidden border-2 border-amber-500/80 bg-white p-1 mb-1.5 shadow-xs flex items-center justify-center">
              <img src="/logo.png" alt="Work Mojo" className="w-full h-full object-contain" />
            </div>
            <h3 className="font-black text-base tracking-tight text-slate-900">
              WORK MOJO
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              Cooperative Gig Services Platform
            </p>
            <div className="text-[10px] font-mono text-slate-400 mt-0.5">
              Receipt: {receipt.receiptNumber}
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Date:</span>
              <span className="font-bold">{receipt.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Job:</span>
              <span className="font-bold text-slate-800 truncate max-w-[170px]">
                {receipt.jobTitle}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Worker:</span>
              <span className="font-bold">{receipt.workerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Employer:</span>
              <span className="font-bold">{receipt.employerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Method:</span>
              <span className="font-bold">{receipt.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Transaction ID:</span>
              <span className="font-mono text-[10px]">{receipt.transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">UTR / Ref:</span>
              <span className="font-mono text-[10px]">{receipt.utrNumber}</span>
            </div>
          </div>

          {/* Amount Breakdown */}
          <div className="pt-2 border-t border-dashed border-slate-300 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Agreed Shift Wage:</span>
              <span className="font-bold">₹{receipt.wageAmount}.00</span>
            </div>
            <div className="flex justify-between text-emerald-700 font-semibold">
              <span>Platform Commission:</span>
              <span>₹0.00 (Cooperative)</span>
            </div>
            <div className="flex justify-between text-sm font-black text-slate-950 pt-1.5 border-t border-slate-300">
              <span>Total Settled:</span>
              <span>₹{receipt.totalAmount}.00</span>
            </div>
          </div>

          <div className="text-center pt-2">
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-3 py-0.5 rounded-full border border-emerald-300">
              Status: {receipt.status}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download size={14} />
            <span>Download PDF</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl text-xs flex items-center justify-center transition-all active:scale-98"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
