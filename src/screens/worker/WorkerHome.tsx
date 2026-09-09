import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { JobCard } from '../../components/common/JobCard';
import { WorkCategory, Job } from '../../types';
import { calculateMatchScore } from '../../services/matchingService';
import { speechService } from '../../services/speechService';
import { WORK_CATEGORIES, getCategoryLabel } from '../../config/categories';
import { UserAvatar } from '../../components/common/UserAvatar';
import {
  Search,
  Mic,
  MicOff,
  Sparkles,
  MapPin,
  TrendingUp,
  Bookmark,
  Bell,
  Sliders,
  ShieldCheck,
  Star,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface WorkerHomeProps {
  onSelectJob: (job: Job) => void;
  onOpenPreferences: () => void;
  onOpenAlerts: () => void;
  onOpenFilters: () => void;
}

export const WorkerHome: React.FC<WorkerHomeProps> = ({
  onSelectJob,
  onOpenPreferences,
  onOpenAlerts,
  onOpenFilters,
}) => {
  const {
    user,
    jobs,
    setFilters,
    setActiveScreen,
    savedJobIds,
    language,
    t,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);

  // Ranked recommendations
  const rankedJobs = [...jobs]
    .map(job => ({ job, match: calculateMatchScore(user, job) }))
    .sort((a, b) => b.match.score - a.match.score);

  const recommendedJobs = rankedJobs.slice(0, 3).map(r => r.job);
  const recIds = new Set(recommendedJobs.map(j => j.id));

  // Nearby jobs (prioritize discovery of jobs not already in Recommended)
  const nearbyCandidates = [...jobs].sort((a, b) => a.approximateDistanceKm - b.approximateDistanceKm);
  const nearbyUnseen = nearbyCandidates.filter(j => !recIds.has(j.id));
  const nearbyJobs = (nearbyUnseen.length >= 2 ? nearbyUnseen : nearbyCandidates).slice(0, 3);
  const nearbyIds = new Set(nearbyJobs.map(j => j.id));

  // High paying jobs (prioritize discovery of distinct gigs)
  const highPayingCandidates = [...jobs].filter(j => j.wage >= 800);
  const highPayingUnseen = highPayingCandidates.filter(j => !recIds.has(j.id) && !nearbyIds.has(j.id));
  const highPayingJobs = (highPayingUnseen.length >= 2 ? highPayingUnseen : highPayingCandidates).slice(0, 3);
  const highIds = new Set(highPayingJobs.map(j => j.id));

  // Today's jobs (prioritize discovery of distinct gigs)
  const todayCandidates = [...jobs].filter(j => j.urgency === 'Today');
  const todayUnseen = todayCandidates.filter(j => !recIds.has(j.id) && !nearbyIds.has(j.id) && !highIds.has(j.id));
  const todayJobs = (todayUnseen.length >= 2 ? todayUnseen : todayCandidates).slice(0, 3);

  const handleCategoryClick = (cat: WorkCategory) => {
    setFilters(prev => ({ ...prev, selectedCategories: [cat] }));
    setActiveScreen('jobs');
  };

  const handleVoiceSearch = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      speechService.startListening(
        {
          onResult: transcript => {
            setIsListening(false);
            setSearchQuery(transcript);
            setFilters(prev => ({ ...prev, searchQuery: transcript }));
            setActiveScreen('jobs');
          },
          onError: () => setIsListening(false),
          onEnd: () => setIsListening(false),
        },
        language
      );
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setFilters(prev => ({ ...prev, searchQuery: searchQuery.trim() }));
      setActiveScreen('jobs');
    }
  };

  return (
    <div className="pb-24 max-w-lg mx-auto px-4 pt-3 space-y-5 min-h-screen bg-white text-[#111827]">
      {/* Worker Profile Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#E2E8F0] shadow-xs relative overflow-hidden space-y-4">
        {/* Subtle decorative top accent line & corner glow */}
        <div className="h-1 w-full bg-gradient-to-r from-[#2563EB] via-[#F5A900] to-[#2563EB] rounded-t-3xl -mt-5 -mx-5 mb-4" />
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#EFF6FF] rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#2563EB]/5 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between gap-3">
          {/* Worker Info Column */}
          <div className="space-y-1.5 flex-1">
            {/* Cooperative Worker ID Tag */}
            <div className="inline-flex items-center gap-1.5 bg-[#EFF6FF] border border-[#DBEAFE] px-2.5 py-0.5 rounded-full">
              <span className="text-xs">🇮🇳</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#2563EB]">
                Cooperative Worker ID
              </span>
            </div>

            {/* Name */}
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#111827] flex items-center gap-2">
              <span>{user.name}</span>
            </h1>

            {/* Categories / Skills */}
            <p className="text-xs font-bold leading-tight text-[#64748B]">
              {user.skills.slice(0, 2).join(' • ') || 'Construction • Loading/Unloading'}
            </p>

            {/* Trust Badges: Rating (Yellow), Reliability (Green), KYC (Green) */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-black">
              {/* Yellow Rating Badge */}
              <span className="inline-flex items-center gap-1 bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] px-2.5 py-1 rounded-xl font-black shadow-2xs">
                <Star size={13} className="fill-[#F5A900] text-[#F5A900]" />
                <span>{user.rating}★ Rating</span>
              </span>

              {/* Reliability Badge */}
              <span className="inline-flex items-center gap-1.5 bg-[#DCFCE7] border border-[#BBF7D0] text-[#16A34A] px-2.5 py-1 rounded-xl font-black shadow-2xs">
                <ShieldCheck size={14} className="text-[#16A34A]" />
                <span>{user.reliabilityScore}% Reliability</span>
              </span>

              {/* KYC Verified Badge */}
              <span className="inline-flex items-center gap-1.5 bg-[#DCFCE7] border border-[#BBF7D0] text-[#16A34A] px-2.5 py-1 rounded-xl font-bold text-[11px] shadow-2xs">
                <CheckCircle2 size={13} className="text-[#16A34A]" />
                <span>KYC Verified</span>
              </span>
            </div>
          </div>

          {/* Profile Photo */}
          <div className="relative shrink-0">
            <UserAvatar
              src={user.profilePhoto}
              name={user.name}
              role="worker"
              size="xl"
              showAvailability={true}
              availability={user.availability}
            />
          </div>
        </div>

        {/* Blue Section Divider */}
        <div className="border-t border-[#DBEAFE] pt-3.5">
          {/* Stat Cards: COMPLETED & DIRECT WAGE */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Card 1: Completed */}
            <div className="rounded-2xl p-3 border border-[#E2E8F0] bg-[#F8FAFC] shadow-2xs flex flex-col justify-center">
              <div className="text-[11px] text-[#64748B] font-bold uppercase tracking-wider">
                COMPLETED
              </div>
              <div className="text-lg sm:text-xl font-black text-[#2563EB] mt-0.5">
                {user.completedJobs} Gigs
              </div>
            </div>

            {/* Card 2: Direct Wage */}
            <div className="rounded-2xl p-3 border border-[#E2E8F0] bg-[#F8FAFC] shadow-2xs flex flex-col justify-center">
              <div className="text-[11px] text-[#64748B] font-bold uppercase tracking-wider">
                DIRECT WAGE
              </div>
              <div className="text-lg sm:text-xl font-black text-[#16A34A] mt-0.5">
                100% Retained
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Pills */}
      <div className="grid grid-cols-3 gap-2 text-xs font-bold">
        <button
          onClick={onOpenPreferences}
          className="p-3 rounded-2xl shadow-2xs flex flex-col items-center gap-1.5 transition-all active:scale-95 border border-[#E2E8F0] bg-white hover:border-[#2563EB] hover:bg-[#EFF6FF]/40 text-[#111827]"
        >
          <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] shadow-2xs">
            <Sliders size={17} />
          </div>
          <span className="truncate">{t.myPreferences}</span>
        </button>

        <button
          onClick={onOpenAlerts}
          className="p-3 rounded-2xl shadow-2xs flex flex-col items-center gap-1.5 transition-all active:scale-95 border border-[#E2E8F0] bg-white hover:border-[#2563EB] hover:bg-[#EFF6FF]/40 text-[#111827]"
        >
          <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] shadow-2xs">
            <Bell size={17} />
          </div>
          <span className="truncate">{t.jobAlerts}</span>
        </button>

        <button
          onClick={() => {
            setFilters(prev => ({ ...prev, selectedCategories: [] }));
            setActiveScreen('my_jobs');
          }}
          className="p-3 rounded-2xl shadow-2xs flex flex-col items-center gap-1.5 transition-all active:scale-95 border border-[#E2E8F0] bg-white hover:border-[#2563EB] hover:bg-[#EFF6FF]/40 text-[#111827]"
        >
          <div className="w-9 h-9 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] shadow-2xs">
            <Bookmark size={17} />
          </div>
          <span className="truncate">{t.tabSaved} ({savedJobIds.length})</span>
        </button>
      </div>

      {/* Search Bar with Integrated Voice Search */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="flex items-center rounded-2xl border border-[#E2E8F0] bg-white shadow-xs p-1.5 focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#EFF6FF] transition-all">
          <div className="p-2 text-[#2563EB]">
            <Search size={18} />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="flex-1 text-sm bg-transparent border-none outline-none font-medium text-[#111827] placeholder-[#94A3B8]"
          />

          <button
            type="button"
            onClick={handleVoiceSearch}
            className={`p-2 rounded-xl transition-all ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-[#FFFBEB] text-[#F5A900] border border-[#FDE68A] hover:bg-[#F5A900] hover:text-[#111827]'
            }`}
            title="Voice Search"
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <button
            type="button"
            onClick={onOpenFilters}
            className="p-2 rounded-xl text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors"
            title="Open Filters"
          >
            <Sliders size={18} />
          </button>
        </div>
      </form>

      {/* Work Categories Horizontal Scroll */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-sm font-black uppercase tracking-wider text-[#111827]">
            {t.workCategories}
          </h2>
          <button
            onClick={() => setActiveScreen('jobs')}
            className="text-xs font-bold text-[#2563EB] hover:underline"
          >
            {t.viewAll} ({jobs.length})
          </button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
          {WORK_CATEGORIES.slice(0, 10).map(cat => {
            const CatIcon = cat.icon;
            const jobCount = jobs.filter(j => j.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className="shrink-0 px-3.5 py-3 rounded-2xl shadow-2xs flex flex-col items-center min-w-[94px] transition-all group active:scale-95 border border-[#E2E8F0] bg-white hover:border-[#F5A900] hover:shadow-xs text-[#111827] cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB] group-hover:scale-110 transition-transform mb-1.5 shadow-2xs">
                  <CatIcon size={22} />
                </div>
                <span className="text-xs font-bold text-center leading-tight text-[#111827] line-clamp-1">
                  {getCategoryLabel(cat.id, language)}
                </span>
                <span className="text-[10px] font-semibold mt-0.5 text-[#64748B]">
                  {jobCount} {t.navJobs}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 1: Recommended For You (AI Match Engine) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles size={16} className="text-[#F5A900]" />
            <h2 className="text-sm font-black uppercase tracking-wider text-[#111827]">
              {t.recommendedForYou}
            </h2>
          </div>
          <span className="text-[11px] font-black text-white bg-[#2563EB] px-2.5 py-0.5 rounded-full shadow-2xs">
            AI Ranked
          </span>
        </div>

        {/* Mojo Recommendation Explanation Banner */}
        <div className="p-3 rounded-2xl flex items-center gap-2 text-xs font-medium shadow-2xs border border-[#DBEAFE] bg-[#EFF6FF] text-[#1E40AF]">
          <span className="text-base shrink-0">🐹</span>
          <span className="flex-1">
            <strong className="text-[#2563EB]">Mojo says:</strong> Ranked using Random Forest AI based on your trade skills, distance, and verified reputation.
          </span>
          <span className="w-2 h-2 rounded-full bg-[#F5A900] shrink-0 shadow-xs" title="WorkMojo Verified" />
        </div>

        <div className="space-y-3">
          {recommendedJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onViewDetails={onSelectJob}
              onApply={onSelectJob}
            />
          ))}
        </div>
      </div>

      {/* Section 2: Nearby Jobs */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MapPin size={16} className="text-[#2563EB]" />
            <h2 className="text-sm font-black uppercase tracking-wider text-[#111827]">
              {t.nearbyJobs}
            </h2>
          </div>
          <button
            onClick={() => setActiveScreen('jobs')}
            className="text-xs font-bold text-[#2563EB] hover:underline"
          >
            {t.viewAll}
          </button>
        </div>

        <div className="space-y-3">
          {nearbyJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onViewDetails={onSelectJob}
              onApply={onSelectJob}
            />
          ))}
        </div>
      </div>

      {/* Section 3: High Paying Jobs */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={16} className="text-[#2563EB]" />
            <h2 className="text-sm font-black uppercase tracking-wider text-[#111827]">
              {t.topWageGigs}
            </h2>
          </div>
        </div>

        <div className="space-y-3">
          {highPayingJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onViewDetails={onSelectJob}
              onApply={onSelectJob}
            />
          ))}
        </div>
      </div>

      {/* Section 4: Today's Gigs */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Calendar size={16} className="text-[#2563EB]" />
            <h2 className="text-sm font-black uppercase tracking-wider text-[#111827]">
              {t.startingToday}
            </h2>
          </div>
        </div>

        <div className="space-y-3">
          {todayJobs.map(job => (
            <JobCard
              key={job.id}
              job={job}
              onViewDetails={onSelectJob}
              onApply={onSelectJob}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
