import React, { useState } from 'react';
import { Job } from '../../types';
import { useApp } from '../../store/AppContext';
import { InteractiveWorkMap } from '../../components/map/InteractiveWorkMap';
import {
  CheckCircle2,
  Navigation,
  Phone,
  Radio,
  AlertOctagon,
  Flag,
  UserX,
  Clock,
  MapPin,
  ShieldCheck,
  Star,
  ChevronLeft,
  Share2,
  ExternalLink,
  QrCode,
  Lock,
} from 'lucide-react';
import { AttendanceQRModal } from '../../components/attendance/AttendanceQRModal';

interface ConfirmedJobProps {
  job: Job;
  onBack: () => void;
  onOpenSOS: () => void;
  onOpenReport: () => void;
  onOpenBlock: () => void;
}

export const ConfirmedJobView: React.FC<ConfirmedJobProps> = ({
  job,
  onBack,
  onOpenSOS,
  onOpenReport,
  onOpenBlock,
}) => {
  const {
    cancelConfirmedJob,
    user,
    activeLiveTrackingJobId,
    setActiveLiveTrackingJobId,
    simulateCompleteJob,
    attendanceRecords,
    recordAttendanceCheckIn,
  } = useApp();

  const isLive = activeLiveTrackingJobId === job.id;
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const workerAttendance = attendanceRecords.find(
    a => a.jobId === job.id && a.workerId === user.id
  );
  const isCheckedIn = workerAttendance?.status === 'CHECKED_IN' || workerAttendance?.status === 'CHECKED_OUT';

  const toggleLiveTracking = () => {
    setActiveLiveTrackingJobId(isLive ? null : job.id);
  };

  const handleCancelSlot = () => {
    cancelConfirmedJob(job.id);
    setShowCancelConfirm(false);
    onBack();
  };

  return (
    <div className="min-h-screen pb-24 bg-slate-950 text-slate-100">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md px-4 py-3 border-b border-slate-800 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white p-1"
        >
          <ChevronLeft size={18} />
          <span>Back to Jobs</span>
        </button>

        <div className="flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold px-2.5 py-1 rounded-full">
          <CheckCircle2 size={13} className="text-emerald-400" />
          <span>Confirmed Shift</span>
        </div>

        <button
          onClick={onOpenSOS}
          className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse"
        >
          <AlertOctagon size={13} />
          <span>SOS</span>
        </button>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Confirmed Banner with Unlocked Privacy Notice */}
        <div className="bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/50 rounded-3xl p-4 shadow-lg">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-extrabold uppercase tracking-wider mb-1">
            <ShieldCheck size={16} />
            <span>Exact Workplace Details Unlocked</span>
          </div>
          <h2 className="text-lg font-black text-white">{job.title}</h2>
          <p className="text-xs text-slate-300 mt-1">
            Worker slot confirmed. You can now access direct calling, full street address, and live GPS route guidance.
          </p>
        </div>

        {/* Interactive Map with Route & Live GPS */}
        <div className="rounded-3xl overflow-hidden border border-slate-800 shadow-xl">
          <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Navigation size={15} className="text-amber-400" />
              <span className="text-xs font-bold text-white">Route Guidance</span>
            </div>

            {/* Live GPS Toggle */}
            <button
              onClick={toggleLiveTracking}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold transition-all ${
                isLive
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Radio size={12} className={isLive ? 'animate-pulse' : ''} />
              <span>{isLive ? 'Live Tracking ON' : 'Start Live GPS'}</span>
            </button>
          </div>

          <InteractiveWorkMap
            jobs={[job]}
            selectedJobId={job.id}
            onSelectJob={() => {}}
            showRouteToJob={job}
            isLiveTracking={isLive}
          />
        </div>

        {/* Exact Location Card */}
        <div className="bg-slate-900 rounded-3xl p-4 border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <MapPin size={16} />
              <span>Workplace Destination</span>
            </div>
            <span className="text-xs text-slate-400 font-semibold">{job.approximateDistanceKm} km away</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs">
            <div className="font-extrabold text-white text-sm">
              {job.exactLocation.exactAddress}
            </div>
            {job.exactLocation.landmark && (
              <div className="text-slate-400 mt-0.5">Landmark: {job.exactLocation.landmark}</div>
            )}
            <div className="text-amber-400 font-semibold mt-1">Area: {job.approximateArea}</div>

            <button
              onClick={() => {
                const query = encodeURIComponent(`${job.exactLocation.exactAddress}, Bengaluru, Karnataka`);
                window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
              }}
              className="mt-2 w-full bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
            >
              <ExternalLink size={14} />
              <span>Open in Google Maps (Turn-by-Turn GPS)</span>
            </button>
          </div>

          {/* Contact Customer Directly */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
              <img
                src={job.customerPhoto}
                alt={job.customerName}
                className="w-10 h-10 rounded-full object-cover border border-slate-700"
              />
              <div>
                <div className="font-extrabold text-sm text-white">{job.customerName}</div>
                <div className="text-[11px] text-slate-400">Customer • Rating {job.customerRating}★</div>
              </div>
            </div>

            <a
              href="tel:+919840011223"
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Phone size={14} />
              <span>Call Owner</span>
            </a>
          </div>
        </div>

        {/* Attendance Check-In Card (Phases 6 & 7) */}
        <div className="bg-slate-900 rounded-3xl p-4 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <QrCode size={16} />
              <span>Shift Attendance & Check-In</span>
            </div>
            <span
              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                isCheckedIn
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}
            >
              {workerAttendance ? workerAttendance.status : 'PENDING'}
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            {isCheckedIn
              ? 'Attendance verified! Your shift is active and logged with workplace protection.'
              : 'Scan the employer QR code or check in upon arrival at the workplace.'}
          </p>

          {!isCheckedIn ? (
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 text-xs"
            >
              <QrCode size={15} />
              <span>Scan Employer QR & Check In</span>
            </button>
          ) : (
            <div className="bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-2xl flex items-center justify-between text-xs text-emerald-300">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>Checked In at {new Date(workerAttendance?.checkInTime || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">Work in Progress</span>
            </div>
          )}
        </div>

        {/* Shift Details & Wage */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Agreed Wage</div>
            <div className="text-xl font-black text-amber-400 mt-0.5">₹{job.wage}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Direct settlement with owner</div>
          </div>

          <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Shift Hours</div>
            <div className="text-sm font-black text-white mt-1">{job.startTime} – {job.endTime}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{job.duration} shift</div>
          </div>
        </div>

        {/* Safety & Cancellation Actions */}
        <div className="bg-slate-900/60 rounded-3xl p-4 border border-slate-800 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Actions & Safety
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={onOpenReport}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2.5 rounded-xl border border-slate-700 flex flex-col items-center gap-1 transition-colors"
            >
              <Flag size={15} className="text-amber-400" />
              <span className="text-[11px] font-semibold">Report Issue</span>
            </button>

            <button
              onClick={onOpenBlock}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2.5 rounded-xl border border-slate-700 flex flex-col items-center gap-1 transition-colors"
            >
              <UserX size={15} className="text-rose-400" />
              <span className="text-[11px] font-semibold">Block User</span>
            </button>

            <button
              onClick={() => setShowCancelConfirm(true)}
              className="bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 p-2.5 rounded-xl border border-rose-800/60 flex flex-col items-center gap-1 transition-colors"
            >
              <AlertOctagon size={15} className="text-rose-400" />
              <span className="text-[11px] font-semibold">Cancel Slot</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl p-5 max-w-sm w-full border border-rose-500/50 shadow-2xl text-slate-100">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <AlertOctagon size={26} />
            </div>

            <h3 className="text-base font-extrabold text-center text-white">
              Cancel Confirmed Job?
            </h3>
            <p className="text-xs text-slate-300 text-center mt-2 leading-relaxed">
              If you cancel, WORK MOJO will immediately promote candidate #1 from the Waiting List to replace you, keeping the customer's work on schedule.
            </p>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Keep Job
              </button>
              <button
                onClick={handleCancelSlot}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-md"
              >
                Yes, Cancel Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Check-In QR Modal (Phases 6 & 7) */}
      {isQRModalOpen && (
        <AttendanceQRModal
          job={job}
          worker={user}
          isEmployer={false}
          onClose={() => setIsQRModalOpen(false)}
          onVerifyCheckIn={(lat, lng) => {
            recordAttendanceCheckIn(job.id, user.id, lat, lng);
            setIsQRModalOpen(false);
          }}
        />
      )}
    </div>
  );
};
