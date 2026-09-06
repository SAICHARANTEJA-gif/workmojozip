import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { JobCard } from '../../components/common/JobCard';
import { WorkCategory, Job } from '../../types';
import { calculateMatchScore } from '../../services/matchingService';
import { speechService } from '../../services/speechService';
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

  const getCategoryLabel = (cat: WorkCategory): string => {
    switch (cat) {
      case 'Loading/Unloading': return t.catLoading;
      case 'Cleaning': return t.catCleaning;
      case 'Construction': return t.catConstruction;
      case 'Delivery': return t.catDelivery;
      case 'Gardening': return t.catGardening;
      case 'Labour': return t.catLabour;
      case 'Repair': return t.catRepair;
      case 'Shop/Store Help': return t.catShopHelp;
      default: return t.catOther;
    }
  };

  const categories: Array<{ name: WorkCategory; label: string; icon: string; count: number }> = [
    { name: 'Loading/Unloading', label: t.catLoading, icon: '📦', count: jobs.filter(j => j.category === 'Loading/Unloading').length },
    { name: 'Cleaning', label: t.catCleaning, icon: '🧹', count: jobs.filter(j => j.category === 'Cleaning').length },
    { name: 'Construction', label: t.catConstruction, icon: '🏗️', count: jobs.filter(j => j.category === 'Construction').length },
    { name: 'Delivery', label: t.catDelivery, icon: '🚚', count: jobs.filter(j => j.category === 'Delivery').length },
    { name: 'Gardening', label: t.catGardening, icon: '🌿', count: jobs.filter(j => j.category === 'Gardening').length },
    { name: 'Labour', label: t.catLabour, icon: '🔨', count: jobs.filter(j => j.category === 'Labour').length },
    { name: 'Repair', label: t.catRepair, icon: '🔧', count: jobs.filter(j => j.category === 'Repair').length },
    { name: 'Shop/Store Help', label: t.catShopHelp, icon: '🏪', count: jobs.filter(j => j.category === 'Shop/Store Help').length },
  ];

  // Ranked recommendations
  const rankedJobs = [...jobs]
    .map(job => ({ job, match: calculateMatchScore(user, job) }))
    .sort((a, b) => b.match.score - a.match.score);

  const recommendedJobs = rankedJobs.slice(0, 3).map(r => r.job);
  const nearbyJobs = [...jobs].sort((a, b) => a.approximateDistanceKm - b.approximateDistanceKm).slice(0, 3);
  const highPayingJobs = [...jobs].filter(j => j.wage >= 800).slice(0, 3);
  const todayJobs = [...jobs].filter(j => j.urgency === 'Today').slice(0, 3);

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
    <div className="pb-24 max-w-lg mx-auto px-4 pt-3 space-y-5">
      {/* Indian Cooperative / Gov-Tech Pro Hero Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 rounded-3xl p-5 text-white shadow-xl border border-amber-500/30 relative overflow-hidden">
        {/* Subtle decorative saffron/gold radial glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo-500/15 rounded-full blur-xl pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30 flex items-center gap-1">
                <span>🇮🇳</span>
                <span>Cooperative Worker ID</span>
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>{user.name}</span>
            </h1>
            <p className="text-xs text-slate-300 font-medium leading-tight">
              {user.skills.slice(0, 2).join(' • ') || 'Verified Community Services'}
            </p>

            {/* Gov-Tech Trust Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-extrabold">
              <span className="flex items-center gap-1 bg-amber-500 text-slate-950 px-2.5 py-1 rounded-xl shadow-xs">
                <Star size={12} className="fill-slate-950 text-slate-950" />
                <span>{user.rating}★ Rating</span>
              </span>
              <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-xl backdrop-blur-xs">
                <ShieldCheck size={12} className="text-emerald-400" />
                <span>{user.reliabilityScore}% Reliability</span>
              </span>
              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <CheckCircle2 size={11} className="text-emerald-400" />
                <span>KYC Verified</span>
              </span>
            </div>
          </div>

          <div className="relative shrink-0">
            <div className="p-0.5 rounded-2xl bg-gradient-to-tr from-amber-400 to-indigo-400 shadow-md">
              <img
                src={user.profilePhoto}
                alt={user.name}
                className="w-16 h-16 rounded-2xl object-cover"
              />
            </div>
            <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow-md border-2 border-slate-900" title="Aadhaar & Live Photo Verified">
              <CheckCircle2 size={11} />
            </span>
          </div>
        </div>

        {/* Live Daily Metric Bar */}
        <div className="relative z-10 grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-800/80 text-center">
          <div className="bg-slate-950/60 rounded-xl p-2 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Completed</div>
            <div className="text-base font-black text-amber-400 mt-0.5">{user.completedJobs} Gigs</div>
          </div>
          <div className="bg-slate-950/60 rounded-xl p-2 border border-slate-800">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Direct Wage</div>
            <div className="text-base font-black text-emerald-400 mt-0.5">100% Retained</div>
          </div>
        </div>
      </div>

      {/* Quick Action Pills: Modernized High-Contrast Gov-Tech Theme */}
      <div className="grid grid-cols-3 gap-2 text-xs font-bold">
        <button
          onClick={onOpenPreferences}
          className="bg-white hover:bg-amber-50/50 border border-slate-200/90 hover:border-amber-400 p-3 rounded-2xl shadow-xs flex flex-col items-center gap-1.5 transition-all active:scale-95 text-slate-800"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Sliders size={17} />
          </div>
          <span className="truncate">{t.myPreferences}</span>
        </button>

        <button
          onClick={onOpenAlerts}
          className="bg-white hover:bg-amber-50/50 border border-slate-200/90 hover:border-amber-400 p-3 rounded-2xl shadow-xs flex flex-col items-center gap-1.5 transition-all active:scale-95 text-slate-800"
        >
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Bell size={17} />
          </div>
          <span className="truncate">{t.jobAlerts}</span>
        </button>

        <button
          onClick={() => {
            setFilters(prev => ({ ...prev, selectedCategories: [] }));
            setActiveScreen('my_jobs');
          }}
          className="bg-white hover:bg-amber-50/50 border border-slate-200/90 hover:border-amber-400 p-3 rounded-2xl shadow-xs flex flex-col items-center gap-1.5 transition-all active:scale-95 text-slate-800"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Bookmark size={17} />
          </div>
          <span className="truncate">{t.tabSaved} ({savedJobIds.length})</span>
        </button>
      </div>

      {/* Search Bar with Integrated Voice Search */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <div className="flex items-center bg-white rounded-2xl border border-slate-200/90 shadow-sm p-1.5 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-200 transition-all">
          <div className="p-2 text-slate-400">
            <Search size={18} />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="flex-1 text-sm bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 font-medium"
          />

          <button
            type="button"
            onClick={handleVoiceSearch}
            className={`p-2 rounded-xl transition-all ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse'
                : 'text-amber-600 hover:bg-amber-50'
            }`}
            title="Voice Search"
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          <button
            type="button"
            onClick={onOpenFilters}
            className="p-2 text-slate-600 hover:text-amber-600 hover:bg-slate-50 rounded-xl"
            title="Open Filters"
          >
            <Sliders size={18} />
          </button>
        </div>
      </form>

      {/* Work Categories Horizontal Scroll */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            {t.workCategories}
          </h2>
          <button
            onClick={() => setActiveScreen('jobs')}
            className="text-xs font-bold text-amber-600 hover:underline"
          >
            {t.viewAll} ({jobs.length})
          </button>
        </div>

        <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name)}
              className="shrink-0 bg-white hover:bg-amber-50 border border-slate-200/80 hover:border-amber-400 px-3.5 py-2.5 rounded-2xl shadow-xs flex flex-col items-center min-w-[86px] transition-all group active:scale-95"
            >
              <span className="text-2xl mb-1 group-hover:scale-110 transition-transform">
                {cat.icon}
              </span>
              <span className="text-xs font-extrabold text-slate-800 text-center leading-tight">
                {cat.label}
              </span>
              <span className="text-[10px] font-semibold text-slate-400 mt-0.5">
                {cat.count} jobs
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Section 1: Recommended For You (AI Match Engine) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles size={16} className="text-amber-600" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              {t.recommendedForYou}
            </h2>
          </div>
          <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
            AI Ranked
          </span>
        </div>

        {/* Mojo Recommendation Explanation Banner */}
        <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-2xl flex items-center gap-2 text-xs text-amber-950 font-medium">
          <span className="text-base">🐹</span>
          <span>
            <strong>Mojo says:</strong> Ranked based on your skills, distance preferences, and verified reputation.
          </span>
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
            <MapPin size={16} className="text-emerald-600" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              {t.nearbyJobs}
            </h2>
          </div>
          <button
            onClick={() => setActiveScreen('jobs')}
            className="text-xs font-bold text-slate-500 hover:text-slate-800"
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
            <TrendingUp size={16} className="text-amber-600" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
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
            <Calendar size={16} className="text-indigo-600" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
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
