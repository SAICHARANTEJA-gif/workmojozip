import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { JobCard } from '../../components/common/JobCard';
import { Job } from '../../types';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  PlayCircle,
  Award,
  ListFilter,
  Bookmark,
  ChevronRight,
} from 'lucide-react';

interface WorkerMyJobsProps {
  onSelectJob: (job: Job) => void;
  onOpenConfirmedJob: (job: Job) => void;
}

type TabType =
  | 'applied'
  | 'waiting'
  | 'confirmed'
  | 'ongoing'
  | 'finished'
  | 'waiting_list'
  | 'saved';

export const WorkerMyJobs: React.FC<WorkerMyJobsProps> = ({
  onSelectJob,
  onOpenConfirmedJob,
}) => {
  const { jobs, user, savedJobIds, t } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('confirmed');

  // Filter jobs dynamically per tab
  const confirmedJobs = jobs.filter(
    j => j.confirmedWorkerIds.includes(user.id) && j.status !== 'Finished'
  );
  const ongoingJobs = jobs.filter(
    j => (j.status === 'Ongoing' || (j.confirmedWorkerIds.includes(user.id) && j.status !== 'Finished'))
  );
  const appliedJobs = jobs.filter(
    j => j.applicants.includes(user.id) && !j.confirmedWorkerIds.includes(user.id)
  );
  const waitingJobs = jobs.filter(
    j => j.applicants.includes(user.id) && !j.confirmedWorkerIds.includes(user.id)
  );
  const waitingListJobs = jobs.filter(j => j.waitingList.includes(user.id));
  const finishedJobs = jobs.filter(j => j.status === 'Finished');
  const savedJobs = jobs.filter(j => savedJobIds.includes(j.id));

  const tabs: Array<{ id: TabType; label: string; count: number; icon: any }> = [
    { id: 'confirmed', label: t.tabConfirmed, count: confirmedJobs.length, icon: CheckCircle2 },
    { id: 'ongoing', label: t.tabOngoing, count: ongoingJobs.length, icon: PlayCircle },
    { id: 'applied', label: t.tabApplied, count: appliedJobs.length, icon: Briefcase },
    { id: 'waiting_list', label: t.tabWaitingList, count: waitingListJobs.length, icon: ListFilter },
    { id: 'finished', label: t.tabFinished, count: finishedJobs.length, icon: Award },
    { id: 'saved', label: t.tabSaved, count: savedJobs.length, icon: Bookmark },
  ];

  const getJobsForActiveTab = (): Job[] => {
    switch (activeTab) {
      case 'confirmed':
        return confirmedJobs;
      case 'ongoing':
        return ongoingJobs;
      case 'applied':
        return appliedJobs;
      case 'waiting_list':
        return waitingListJobs;
      case 'finished':
        return finishedJobs;
      case 'saved':
        return savedJobs;
      default:
        return [];
    }
  };

  const displayedJobs = getJobsForActiveTab();

  return (
    <div className="pb-24 max-w-lg mx-auto px-4 pt-3 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">{t.navMyJobs}</h1>
          <p className="text-xs text-slate-500 font-medium">Track your applications & shifts live</p>
        </div>
        <span className="text-xs font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full">
          {user.completedJobs} Verified Completed
        </span>
      </div>

      {/* Tabs Header Horizontal Scroll */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 shadow-xs scale-102'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-slate-950 text-amber-300 font-black' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Specific Content */}
      <div className="space-y-3">
        {displayedJobs.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xs space-y-2.5">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl">
              📦
            </div>
            <h3 className="font-extrabold text-sm text-slate-800">
              No jobs in {tabs.find(t => t.id === activeTab)?.label}
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Explore open positions nearby and apply to get hired directly.
            </p>
          </div>
        ) : (
          displayedJobs.map(job => {
            const isConfirmed = job.confirmedWorkerIds.includes(user.id);

            return (
              <div key={job.id} className="relative">
                <JobCard
                  job={job}
                  onViewDetails={() => {
                    if (isConfirmed) {
                      onOpenConfirmedJob(job);
                    } else {
                      onSelectJob(job);
                    }
                  }}
                  onApply={onSelectJob}
                />

                {isConfirmed && (
                  <div className="mt-1 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center justify-between">
                    <span>Workplace details unlocked</span>
                    <button
                      onClick={() => onOpenConfirmedJob(job)}
                      className="text-emerald-900 underline flex items-center gap-0.5"
                    >
                      <span>Navigate</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
