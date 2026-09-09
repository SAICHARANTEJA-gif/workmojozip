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
  CreditCard,
  Banknote,
} from 'lucide-react';
import { AttendanceQRModal } from '../../components/attendance/AttendanceQRModal';
import { UserAvatar } from '../../components/common/UserAvatar';

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
    payments,
    updateWorkerPaymentPreference,
    t,
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
    <div className="min-h-screen pb-24 bg-[#F7F9FC] text-[#111827]">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-[#E2E8F0] flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#111827] p-1 cursor-pointer"
        >
          <ChevronLeft size={18} />
          <span>{t.backAction}</span>
        </button>

        <div className="flex items-center gap-1.5 bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] text-xs font-bold px-2.5 py-1 rounded-full">
          <CheckCircle2 size={13} className="text-[#2563EB]" />
          <span>{t.confirmed}</span>
        </div>

        <button
          onClick={onOpenSOS}
          className="bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1 animate-pulse cursor-pointer"
        >
          <AlertOctagon size={13} />
          <span>{t.sosEmergency.split(' ')[0]}</span>
        </button>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Confirmed Banner with Unlocked Privacy Notice */}
        <div className="bg-white border border-[#DBEAFE] rounded-3xl p-4 shadow-xs">
          <div className="flex items-center gap-2 text-[#2563EB] text-xs font-extrabold uppercase tracking-wider mb-1">
            <ShieldCheck size={16} />
            <span>Exact Workplace Details Unlocked</span>
          </div>
          <h2 className="text-lg font-black text-[#111827]">{job.title}</h2>
          <p className="text-xs text-[#64748B] mt-1">
            Worker slot confirmed. You can now access direct calling, full street address, and live GPS route guidance.
          </p>
        </div>

        {/* Interactive Map with Route & Live GPS */}
        <div className="rounded-3xl overflow-hidden border border-[#E2E8F0] bg-white shadow-xs">
          <div className="bg-white px-4 py-2.5 flex items-center justify-between border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <Navigation size={15} className="text-[#2563EB]" />
              <span className="text-xs font-bold text-[#111827]">Route Guidance</span>
            </div>

            {/* Live GPS Toggle */}
            <button
              onClick={toggleLiveTracking}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
                isLive
                  ? 'bg-[#16A34A] text-white shadow-xs'
                  : 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] hover:bg-[#DBEAFE]'
              }`}
            >
              <Radio size={12} className={isLive ? 'animate-pulse' : ''} />
              <span>{isLive ? t.liveLocation : t.navigate}</span>
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
        <div className="bg-white rounded-3xl p-4 border border-[#E2E8F0] space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#2563EB] font-bold text-xs">
              <MapPin size={16} />
              <span>Workplace Destination</span>
            </div>
            <span className="text-xs text-[#64748B] font-semibold">{job.approximateDistanceKm} km away</span>
          </div>

          <div className="bg-[#F8FAFC] p-3 rounded-2xl border border-[#E2E8F0] text-xs">
            <div className="font-extrabold text-[#111827] text-sm">
              {job.exactLocation.exactAddress}
            </div>
            {job.exactLocation.landmark && (
              <div className="text-[#64748B] mt-0.5">Landmark: {job.exactLocation.landmark}</div>
            )}
            <div className="text-[#2563EB] font-bold mt-1">Area: {job.approximateArea}</div>

            <button
              onClick={() => {
                const query = encodeURIComponent(`${job.exactLocation.exactAddress}, Bengaluru, Karnataka`);
                window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
              }}
              className="mt-2 w-full bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-[#DBEAFE] transition-colors"
            >
              <ExternalLink size={14} />
              <span>Open in Google Maps (Turn-by-Turn GPS)</span>
            </button>
          </div>

          {/* Contact Customer Directly */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5">
              <UserAvatar
                src={job.customerPhoto}
                name={job.customerName}
                role="customer"
                size="sm"
              />
              <div>
                <div className="font-extrabold text-sm text-[#111827]">{job.customerName}</div>
                <div className="text-[11px] text-[#64748B]">Customer • Rating {job.customerRating}★</div>
              </div>
            </div>

            <a
              href="tel:+919840011223"
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
            >
              <Phone size={14} />
              <span>{t.callOwner}</span>
            </a>
          </div>
        </div>

        {/* Attendance Check-In Card */}
        <div className="bg-white rounded-3xl p-4 border border-[#E2E8F0] space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#2563EB] font-bold text-xs">
              <QrCode size={16} />
              <span>Shift Attendance & Check-In</span>
            </div>
            <span
              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                isCheckedIn
                  ? 'bg-[#F0FDF4] text-[#16A34A] border-[#BBF7D0]'
                  : 'bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]'
              }`}
            >
              {workerAttendance ? workerAttendance.status : 'PENDING'}
            </span>
          </div>

          <p className="text-xs text-[#64748B] leading-relaxed">
            {isCheckedIn
              ? 'Attendance verified! Your shift is active and logged with workplace protection.'
              : 'Scan the employer QR code or check in upon arrival at the workplace.'}
          </p>

          {!isCheckedIn ? (
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black py-3 rounded-2xl shadow-xs transition-all active:scale-98 flex items-center justify-center gap-2 text-xs"
            >
              <QrCode size={15} />
              <span>Scan Employer QR & Check In</span>
            </button>
          ) : (
            <div className="bg-[#F0FDF4] border border-[#BBF7D0] p-2.5 rounded-2xl flex items-center justify-between text-xs text-[#16A34A]">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 size={15} className="text-[#16A34A]" />
                <span>Checked In at {new Date(workerAttendance?.checkInTime || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <span className="text-[10px] text-[#16A34A] font-mono">Work in Progress</span>
            </div>
          )}
        </div>

        {/* Shift Details & Wage */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-[#E2E8F0] shadow-xs">
            <div className="text-[10px] text-[#64748B] uppercase tracking-wide">Agreed Wage</div>
            <div className="text-xl font-black text-[#2563EB] mt-0.5">₹{job.wage}</div>
            <div className="text-[10px] text-[#64748B] mt-0.5">Direct settlement with owner</div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-[#E2E8F0] shadow-xs">
            <div className="text-[10px] text-[#64748B] uppercase tracking-wide">Shift Hours</div>
            <div className="text-sm font-black text-[#111827] mt-1">{job.startTime} – {job.endTime}</div>
            <div className="text-[10px] text-[#64748B] mt-0.5">{job.duration} shift</div>
          </div>
        </div>

        {/* Payment Preference & Settlement Status Card */}
        {(() => {
          const workerPref =
            user.paymentPreference ||
            (user.preferredPaymentMethod === 'Cash' || user.preferredPaymentMethod === 'OFFLINE'
              ? 'OFFLINE'
              : 'ONLINE');
          const payment = payments.find(p => p.jobId === job.id && p.workerId === user.id);

          return (
            <div className="bg-white rounded-3xl p-4 border border-[#E2E8F0] space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-2 rounded-xl ${
                      workerPref === 'OFFLINE' ? 'bg-[#16A34A] text-white' : 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]'
                    }`}
                  >
                    {workerPref === 'OFFLINE' ? <Banknote size={16} /> : <CreditCard size={16} />}
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                      Your Payout Preference
                    </div>
                    <div className="text-sm font-black text-[#111827]">
                      {workerPref === 'OFFLINE' ? 'Offline Payment (Cash)' : 'Online Payment (UPI/Bank)'}
                    </div>
                  </div>
                </div>

                {/* Quick Switch Button */}
                <div className="flex bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() => updateWorkerPaymentPreference('ONLINE')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                      workerPref === 'ONLINE'
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#111827]'
                    }`}
                  >
                    Online
                  </button>
                  <button
                    type="button"
                    onClick={() => updateWorkerPaymentPreference('OFFLINE')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all ${
                      workerPref === 'OFFLINE'
                        ? 'bg-[#16A34A] text-white shadow-xs'
                        : 'text-[#64748B] hover:text-[#111827]'
                    }`}
                  >
                    Cash
                  </button>
                </div>
              </div>

              {/* Settlement Status Banner */}
              <div
                className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                  payment?.status === 'PAID'
                    ? 'bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A]'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]'
                }`}
              >
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#64748B]">Settlement Status</div>
                  <div className="font-extrabold text-[#111827] mt-0.5">
                    {payment?.status === 'PAID'
                      ? workerPref === 'OFFLINE'
                        ? `✓ Cash Received: ₹${job.wage} Settled on Site`
                        : `✓ Wage Released: ₹${job.wage} via UPI`
                      : workerPref === 'OFFLINE'
                      ? `⏳ Cash Pending: ₹${job.wage} due upon handover`
                      : `🔒 Protected: ₹${job.wage} held for release`}
                  </div>
                </div>

                <span
                  className={`text-[10px] font-black px-2.5 py-1 rounded-full ${
                    payment?.status === 'PAID'
                      ? 'bg-[#F0FDF4] text-[#16A34A] border border-[#BBF7D0]'
                      : 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE]'
                  }`}
                >
                  {payment?.status === 'PAID' ? 'SETTLED' : 'PENDING'}
                </span>
              </div>
            </div>
          );
        })()}

        {/* Safety & Cancellation Actions */}
        <div className="bg-white rounded-3xl p-4 border border-[#E2E8F0] space-y-3 shadow-xs">
          <div className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
            Actions & Safety
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              onClick={onOpenReport}
              className="bg-[#F8FAFC] hover:bg-[#EFF6FF] text-[#111827] p-2.5 rounded-xl border border-[#E2E8F0] flex flex-col items-center gap-1 transition-colors"
            >
              <Flag size={15} className="text-[#2563EB]" />
              <span className="text-[11px] font-semibold">Report Issue</span>
            </button>

            <button
              onClick={onOpenBlock}
              className="bg-[#F8FAFC] hover:bg-rose-50 text-[#111827] p-2.5 rounded-xl border border-[#E2E8F0] flex flex-col items-center gap-1 transition-colors"
            >
              <UserX size={15} className="text-[#DC2626]" />
              <span className="text-[11px] font-semibold">Block User</span>
            </button>

            <button
              onClick={() => setShowCancelConfirm(true)}
              className="bg-rose-50 hover:bg-rose-100 text-[#DC2626] p-2.5 rounded-xl border border-rose-200 flex flex-col items-center gap-1 transition-colors"
            >
              <AlertOctagon size={15} className="text-[#DC2626]" />
              <span className="text-[11px] font-semibold">Cancel Slot</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cancellation Confirmation Dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full border border-rose-200 shadow-2xl text-[#111827]">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-[#DC2626] flex items-center justify-center mx-auto mb-3 border border-rose-200">
              <AlertOctagon size={26} />
            </div>

            <h3 className="text-base font-extrabold text-center text-[#111827]">
              Cancel Confirmed Job?
            </h3>
            <p className="text-xs text-[#64748B] text-center mt-2 leading-relaxed">
              If you cancel, WORK MOJO will immediately promote candidate #1 from the Waiting List to replace you, keeping the customer's work on schedule.
            </p>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#111827] font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Keep Job
              </button>
              <button
                onClick={handleCancelSlot}
                className="flex-1 bg-[#DC2626] hover:bg-[#B91C1C] text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-xs"
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
