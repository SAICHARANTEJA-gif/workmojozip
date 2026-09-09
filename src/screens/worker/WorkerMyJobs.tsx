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

  const tabs: Array<{ id: TabType; label: string; count: number; icon: any; accentColor: string }> = [
    { id: 'confirmed', label: t.tabConfirmed, count: confirmedJobs.length, icon: CheckCircle2, accentColor: 'text-[#16A34A]' },
    { id: 'ongoing', label: t.tabOngoing, count: ongoingJobs.length, icon: PlayCircle, accentColor: 'text-[#2563EB]' },
    { id: 'applied', label: t.tabApplied, count: appliedJobs.length, icon: Briefcase, accentColor: 'text-[#F5A900]' },
    { id: 'waiting_list', label: t.tabWaitingList, count: waitingListJobs.length, icon: ListFilter, accentColor: 'text-[#F5A900]' },
    { id: 'finished', label: t.tabFinished, count: finishedJobs.length, icon: Award, accentColor: 'text-[#16A34A]' },
    { id: 'saved', label: t.tabSaved, count: savedJobs.length, icon: Bookmark, accentColor: 'text-[#2563EB]' },
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
    <div className="pb-24 max-w-lg mx-auto px-4 pt-3 space-y-4 text-[#111827]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#111827] tracking-tight">{t.navMyJobs}</h1>
          <p className="text-xs text-[#64748B] font-medium">Track your applications & shifts live</p>
        </div>
        <span className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] border border-[#DBEAFE] px-2.5 py-1 rounded-full flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A]"></span>
          <span>{user.completedJobs} {t.finished}</span>
        </span>
      </div>

      {/* Tabs Header Horizontal Scroll */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar border-b border-[#E2E8F0]">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] shadow-2xs'
                  : 'bg-white text-[#64748B] hover:bg-[#F8FAFC] border border-[#E2E8F0]'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-[#2563EB]' : tab.accentColor} />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-[#2563EB] text-white font-bold' : 'bg-[#F1F5F9] text-[#64748B]'
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
          <div className="bg-white rounded-3xl p-8 text-center border border-[#E2E8F0] shadow-xs space-y-2.5">
            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] flex items-center justify-center mx-auto">
              <Briefcase size={22} />
            </div>
            <h3 className="font-extrabold text-sm text-[#111827]">
              {tabs.find(t => t.id === activeTab)?.label} (0)
            </h3>
            <p className="text-xs text-[#64748B] max-w-xs mx-auto">
              {t.recommendedForYou}
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
                  <div className="mt-1.5 bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] text-xs font-bold px-3.5 py-2 rounded-xl flex items-center justify-between">
                    <span>{t.exactAddressUnlocked}</span>
                    <button
                      onClick={() => onOpenConfirmedJob(job)}
                      className="text-[#1D4ED8] flex items-center gap-0.5 font-bold hover:underline"
                    >
                      <span>{t.navigate}</span>
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
