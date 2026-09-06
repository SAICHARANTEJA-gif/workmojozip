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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-slate-900 border-2 border-rose-500 rounded-3xl p-6 max-w-sm w-full text-slate-100 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-rose-400 font-black text-sm">
            <AlertOctagon size={20} className="animate-pulse" />
            <span>EMERGENCY SOS DISPATCH</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        {triggered ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-500">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="font-black text-lg text-white">Emergency Request Dispatched!</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your exact GPS coordinates ({job?.exactLocation.lat}, {job?.exactLocation.lng}), workplace address, and emergency broadcast have been alerted to local community coordinators and 112 emergency service simulation.
            </p>
            <button
              onClick={onClose}
              className="mt-2 bg-slate-800 text-white font-bold py-2.5 px-6 rounded-xl text-xs"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-slate-300 leading-relaxed">
              If you feel unsafe or encounter an emergency on this gig, press the broadcast button below.
            </p>

            {job && (
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs space-y-1">
                <div className="font-bold text-white">{job.title}</div>
                <div className="text-slate-400">{job.exactLocation.exactAddress}</div>
                <div className="text-amber-400">Customer: {job.customerName}</div>
              </div>
            )}

            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Optional emergency detail..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-rose-500"
            />

            <button
              onClick={handleDispatch}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-black py-3.5 rounded-2xl text-sm shadow-xl flex items-center justify-center gap-2 transition-all active:scale-98"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl p-5 max-w-sm w-full text-slate-900 shadow-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-extrabold text-sm text-slate-900">
            <Flag size={16} className="text-amber-600" />
            <span>Report Problem</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="py-6 text-center space-y-2">
            <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
            <h4 className="font-extrabold text-sm">Report Submitted ✓</h4>
            <p className="text-xs text-slate-500">Thank you for keeping Work Mojo community safe.</p>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Reason</label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-800"
              >
                <option value="Safety concern">Safety concern</option>
                <option value="Misconduct">Misconduct / Harassment</option>
                <option value="False job information">False job information</option>
                <option value="Wage dispute">Wage dispute</option>
                <option value="Other serious issue">Other serious issue</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Explain what happened..."
                className="w-full p-2.5 rounded-xl border border-slate-300 outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl flex items-center justify-center gap-1 text-[11px]"
              >
                <Camera size={13} />
                <span>Attach Photo</span>
              </button>
              <button
                type="button"
                className="flex-1 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl flex items-center justify-center gap-1 text-[11px]"
              >
                <Mic size={13} />
                <span>Voice Note</span>
              </button>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl shadow-md transition-all active:scale-98"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl p-5 max-w-sm w-full text-slate-900 shadow-2xl space-y-3 text-center">
        {blocked ? (
          <div className="py-6 space-y-2">
            <CheckCircle2 size={36} className="text-emerald-600 mx-auto" />
            <h4 className="font-extrabold text-sm">User Blocked</h4>
            <p className="text-xs text-slate-500">
              They will no longer appear in your searches or candidate lists.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <UserX size={24} />
            </div>

            <h3 className="font-extrabold text-base text-slate-900">Block {targetName}?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Blocked users cannot contact you, view your open gigs, or apply to work with you.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={onClose}
                className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleBlock}
                className="w-1/2 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-md"
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
