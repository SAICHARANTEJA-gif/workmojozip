import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Job } from '../../types';
import {
  AlertOctagon,
  X,
  MapPin,
  PhoneCall,
  CheckCircle2,
  Flag,
  UserX,
  Camera,
  Mic,
  ShieldAlert,
} from 'lucide-react';

// SOS Emergency Modal
export const SOSModal: React.FC<{ job?: Job | null; onClose: () => void }> = ({
  job,
  onClose,
}) => {
  const { user, triggerSOS } = useApp();
  const [triggered, setTriggered] = useState(false);
  const [note, setNote] = useState('');

  const handleDispatch = () => {
    triggerSOS(job?.id || 'demo', note);
    setTriggered(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white border-2 border-rose-500 rounded-3xl p-6 max-w-sm w-full text-[#111827] shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-600 font-black text-sm">
            <AlertOctagon size={20} className="animate-pulse" />
            <span>EMERGENCY SOS DISPATCH</span>
          </div>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#111827] p-1 transition-colors">
            <X size={18} />
          </button>
        </div>

        {triggered ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto border border-rose-200">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="font-black text-lg text-[#111827]">Emergency Request Dispatched!</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Your exact GPS coordinates ({job?.exactLocation.lat}, {job?.exactLocation.lng}), workplace address, and emergency broadcast have been alerted to local community coordinators and 112 emergency service simulation.
            </p>
            <button
              onClick={onClose}
              className="mt-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#111827] font-bold py-2.5 px-6 rounded-xl text-xs transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-[#64748B] leading-relaxed">
              If you feel unsafe or encounter an emergency on this gig, press the broadcast button below.
            </p>

            {job && (
              <div className="bg-[#F7F9FC] p-3 rounded-2xl border border-[#E2E8F0] text-xs space-y-1">
                <div className="font-bold text-[#111827]">{job.title}</div>
                <div className="text-[#64748B]">{job.exactLocation.exactAddress}</div>
                <div className="text-[#2563EB] font-bold">Customer: {job.customerName}</div>
              </div>
            )}

            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Optional emergency detail..."
              className="w-full bg-[#F7F9FC] border border-[#E2E8F0] rounded-xl p-2.5 text-xs text-[#111827] outline-none focus:border-rose-500"
            />

            <button
              onClick={handleDispatch}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 rounded-2xl text-sm shadow-xs flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <PhoneCall size={18} className="animate-pulse" />
              <span>Broadcast SOS Emergency Now</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// Report Problem Modal
export const ReportModal: React.FC<{
  reportedUserId?: string;
  jobId?: string;
  onClose: () => void;
}> = ({ reportedUserId = 'cust-kumar', jobId, onClose }) => {
  const { submitReport } = useApp();
  const [reason, setReason] = useState('Safety concern');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    submitReport(reportedUserId, reason, description, jobId);
    setSubmitted(true);
    setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl p-5 max-w-sm w-full text-[#111827] shadow-2xl border border-[#E2E8F0] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-black text-sm text-[#111827]">
            <Flag size={16} className="text-[#2563EB]" />
            <span>Report Problem</span>
          </div>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#111827] transition-colors">
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 size={36} className="text-[#16A34A] mx-auto" />
            <h4 className="font-black text-sm text-[#111827]">Report Submitted ✓</h4>
            <p className="text-xs text-[#64748B]">Thank you for keeping Work Mojo community safe.</p>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-[#64748B] uppercase mb-1">Reason</label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F7F9FC] font-bold text-[#111827] outline-none focus:border-[#2563EB]"
              >
                <option value="Safety concern">Safety concern</option>
                <option value="Misconduct">Misconduct / Harassment</option>
                <option value="False job information">False job information</option>
                <option value="Wage dispute">Wage dispute</option>
                <option value="Other serious issue">Other serious issue</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-[#64748B] uppercase mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Explain what happened..."
                className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F7F9FC] text-[#111827] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF]"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#111827] font-bold rounded-xl flex items-center justify-center gap-1 text-[11px] transition-colors"
              >
                <Camera size={13} className="text-[#2563EB]" />
                <span>Attach Photo</span>
              </button>
              <button
                type="button"
                className="flex-1 py-2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#111827] font-bold rounded-xl flex items-center justify-center gap-1 text-[11px] transition-colors"
              >
                <Mic size={13} className="text-[#2563EB]" />
                <span>Voice Note</span>
              </button>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-2.5 rounded-xl shadow-xs transition-all active:scale-95"
            >
              Submit Report
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Block User Modal
export const BlockModal: React.FC<{
  targetUserId?: string;
  targetName?: string;
  onClose: () => void;
}> = ({ targetUserId = 'cust-kumar', targetName = 'this user', onClose }) => {
  const { blockUser } = useApp();
  const [blocked, setBlocked] = useState(false);

  const handleBlock = () => {
    blockUser(targetUserId);
    setBlocked(true);
    setTimeout(onClose, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl p-5 max-w-sm w-full text-[#111827] shadow-2xl border border-[#E2E8F0] space-y-3 text-center">
        {blocked ? (
          <div className="py-6 space-y-2">
            <CheckCircle2 size={36} className="text-[#16A34A] mx-auto" />
            <h4 className="font-black text-sm text-[#111827]">User Blocked</h4>
            <p className="text-xs text-[#64748B]">
              They will no longer appear in your searches or candidate lists.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <UserX size={24} />
            </div>

            <h3 className="font-black text-base text-[#111827]">Block {targetName}?</h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Blocked users cannot contact you, view your open gigs, or apply to work with you.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={onClose}
                className="w-1/2 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBlock}
                className="w-1/2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-xs transition-all active:scale-95"
              >
                Yes, Block
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
