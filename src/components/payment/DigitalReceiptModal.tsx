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
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 max-w-sm w-full text-[#111827] shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[#F1F5F9] pb-3">
          <div className="flex items-center gap-1.5 text-[#16A34A] font-black text-sm">
            <CheckCircle2 size={16} />
            <span>Digital Payment Receipt</span>
          </div>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#111827] transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Receipt Container */}
        <div className="bg-[#F7F9FC] border border-[#E2E8F0] text-[#111827] rounded-2xl p-5 shadow-xs space-y-3 font-sans">
          <div className="text-center border-b border-[#E2E8F0] pb-3">
            <div className="w-14 h-14 mx-auto rounded-full overflow-hidden border-2 border-[#DBEAFE] bg-white p-1 mb-1.5 shadow-xs flex items-center justify-center">
              <img src="/logo.png" alt="Work Mojo" className="w-full h-full object-contain" />
            </div>
            <h3 className="font-black text-base tracking-tight text-[#111827]">
              WORK <span className="text-[#2563EB]">MOJO</span>
            </h3>
            <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">
              Cooperative Gig Services Platform
            </p>
            <div className="text-[10px] font-mono text-[#64748B] mt-0.5">
              Receipt: {receipt.receiptNumber}
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Date:</span>
              <span className="font-bold text-[#111827]">{receipt.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Job:</span>
              <span className="font-bold text-[#111827] truncate max-w-[170px]">
                {receipt.jobTitle}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Worker:</span>
              <span className="font-bold text-[#111827]">{receipt.workerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Employer:</span>
              <span className="font-bold text-[#111827]">{receipt.employerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Payment Method:</span>
              <span className="font-bold text-[#111827]">{receipt.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Transaction ID:</span>
              <span className="font-mono text-[10px] text-[#111827]">{receipt.transactionId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">UTR / Ref:</span>
              <span className="font-mono text-[10px] text-[#111827]">{receipt.utrNumber}</span>
            </div>
          </div>

          {/* Amount Breakdown */}
          <div className="pt-2 border-t border-dashed border-[#CBD5E1] space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Agreed Shift Wage:</span>
              <span className="font-bold text-[#111827]">₹{receipt.wageAmount}.00</span>
            </div>
            <div className="flex justify-between text-[#16A34A] font-bold">
              <span>Platform Commission:</span>
              <span>₹0.00 (Cooperative)</span>
            </div>
            <div className="flex justify-between text-sm font-black text-[#2563EB] pt-1.5 border-t border-[#E2E8F0]">
              <span>Total Settled:</span>
              <span>₹{receipt.totalAmount}.00</span>
            </div>
          </div>

          <div className="text-center pt-2">
            <span className="text-[10px] bg-emerald-50 text-[#16A34A] font-extrabold px-3 py-0.5 rounded-full border border-emerald-200">
              Status: {receipt.status}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#111827] border border-[#E2E8F0] font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Download size={14} />
            <span>Download PDF</span>
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center transition-all active:scale-95 shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
