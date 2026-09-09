import React from 'react';
import { useApp } from '../../store/AppContext';
import { NotificationItem, Job } from '../../types';
import {
  Bell,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Trash2,
  ChevronRight,
} from 'lucide-react';

interface NotificationsProps {
  onOpenJob: (job: Job) => void;
  onOpenConfirmedJob: (job: Job) => void;
  onOpenApplicants: (jobId?: string) => void;
  onOpenRating: (job: Job) => void;
}

export const NotificationsView: React.FC<NotificationsProps> = ({
  onOpenJob,
  onOpenConfirmedJob,
  onOpenApplicants,
  onOpenRating,
}) => {
  const {
    notifications,
    markNotificationAsRead,
    clearAllNotifications,
    jobs,
    setActiveScreen,
  } = useApp();

  const handleNotificationClick = (n: NotificationItem) => {
    markNotificationAsRead(n.id);
    const targetJob = jobs.find(j => j.id === n.targetJobId);

    if (n.actionScreen === 'confirmed_job' && targetJob) {
      onOpenConfirmedJob(targetJob);
    } else if (n.actionScreen === 'rating' && targetJob) {
      onOpenRating(targetJob);
    } else if (n.actionScreen === 'applicants') {
      onOpenApplicants(targetJob?.id);
    } else if (targetJob) {
      onOpenJob(targetJob);
    }
  };

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'job_confirmed':
      case 'application_accepted':
      case 'waiting_list_promoted':
        return <CheckCircle2 size={18} className="text-[#16A34A]" />;
      case 'new_match':
      case 'alert_triggered':
        return <Sparkles size={18} className="text-[#2563EB]" />;
      case 'worker_cancelled':
        return <AlertCircle size={18} className="text-[#DC2626]" />;
      case 'job_finished':
        return <Clock size={18} className="text-[#2563EB]" />;
      default:
        return <Bell size={18} className="text-[#2563EB]" />;
    }
  };

  return (
    <div className="pb-24 max-w-lg mx-auto px-4 pt-3 space-y-4 text-[#111827]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#111827] tracking-tight">Notifications</h1>
          <p className="text-xs text-[#64748B] font-medium">Real-time alerts & job updates</p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={clearAllNotifications}
            className="text-xs text-[#64748B] hover:text-[#2563EB] font-bold flex items-center gap-1 transition-colors"
          >
            <Trash2 size={13} />
            <span>Clear all</span>
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-[#E2E8F0] shadow-sm text-xs text-[#64748B] space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] mx-auto shadow-xs">
              <Bell size={26} />
            </div>
            <div className="font-black text-base text-[#111827]">No notifications yet</div>
            <p className="text-[#64748B] max-w-xs mx-auto leading-relaxed">
              When someone hires you or confirms your application, alerts will appear here.
            </p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 shadow-sm ${
                n.read
                  ? 'bg-white border-[#E2E8F0] hover:bg-[#F7F9FC]'
                  : 'bg-[#EFF6FF]/60 border-[#2563EB] shadow-md'
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center shrink-0 shadow-xs">
                {getNotifIcon(n.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {!n.read && <span className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0" />}
                    <h3 className="font-black text-xs text-[#111827] leading-tight">
                      {n.title}
                    </h3>
                  </div>
                  <span className="text-[10px] font-semibold text-[#64748B] shrink-0">Just now</span>
                </div>

                <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed font-medium">{n.message}</p>

                {n.actionScreen && (
                  <div className="mt-2.5 text-[11px] font-bold text-[#2563EB] flex items-center gap-1 hover:underline">
                    <span>Tap to view details</span>
                    <ChevronRight size={12} />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
