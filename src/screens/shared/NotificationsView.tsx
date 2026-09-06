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
        return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'new_match':
      case 'alert_triggered':
        return <Sparkles size={16} className="text-amber-500" />;
      case 'worker_cancelled':
        return <AlertCircle size={16} className="text-rose-500" />;
      case 'job_finished':
        return <Clock size={16} className="text-purple-500" />;
      default:
        return <Bell size={16} className="text-blue-500" />;
    }
  };

  return (
    <div className="pb-24 max-w-lg mx-auto px-4 pt-3 space-y-4 text-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-xs text-slate-500 font-medium">Real-time alerts & job updates</p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={clearAllNotifications}
            className="text-xs text-slate-400 hover:text-slate-600 font-bold flex items-center gap-1"
          >
            <Trash2 size={13} />
            <span>Clear all</span>
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 text-xs text-slate-500 space-y-2">
            <Bell size={28} className="text-slate-300 mx-auto" />
            <div className="font-extrabold text-sm text-slate-800">No notifications yet</div>
            <p className="text-slate-400">
              When someone hires you or confirms your application, alerts will appear here.
            </p>
          </div>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => handleNotificationClick(n)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                n.read
                  ? 'bg-white border-slate-200/80 hover:bg-slate-50'
                  : 'bg-amber-50/50 border-amber-300 shadow-xs'
              }`}
            >
              <div className="mt-0.5 shrink-0">{getNotifIcon(n.type)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-extrabold text-xs text-slate-900 leading-tight">
                    {n.title}
                  </h3>
                  <span className="text-[10px] text-slate-400 shrink-0">Just now</span>
                </div>

                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>

                {n.actionScreen && (
                  <div className="mt-2 text-[11px] font-bold text-amber-700 flex items-center gap-1">
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
