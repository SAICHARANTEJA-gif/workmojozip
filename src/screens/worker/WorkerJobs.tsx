import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../store/AppContext';
import { Job, WorkCategory } from '../../types';
import { JobCard } from '../../components/common/JobCard';
import { InteractiveWorkMap } from '../../components/map/InteractiveWorkMap';
import { speechService } from '../../services/speechService';
import { getCategoryLabel, getCategoryEmoji } from '../../config/categories';
import { runJobMatchingPipeline } from '../../services/jobMatchingPipeline';
import {
  Search,
  Mic,
  MicOff,
  Sliders,
  List,
  Map as MapIcon,
  Sparkles,
  ArrowUpDown,
  X,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface WorkerJobsProps {
  onSelectJob: (job: Job) => void;
  onOpenFilters: () => void;
}

export const WorkerJobs: React.FC<WorkerJobsProps> = ({
  onSelectJob,
  onOpenFilters,
}) => {
  const { jobs, user, filters, setFilters, resetFilters, language, t, refreshJobs, isSyncingJobs } = useApp();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [isListening, setIsListening] = useState(false);

  // Sync latest jobs from server/Supabase whenever WorkerJobs screen is opened
  useEffect(() => {
    refreshJobs();
  }, [refreshJobs]);

  // 4-Stage Pipeline Execution (Hard Filters -> Eligible Jobs -> AI Compatibility -> Final Ranking)
  // Strict Guarantee: The Random Forest model is evaluated via inference only and NEVER retrained on filter changes.
  const pipelineResult = useMemo(() => {
    return runJobMatchingPipeline(jobs, filters, user);
  }, [jobs, filters, user]);

  const { counts, activeFilterTags, rankedJobs } = pipelineResult;
  const sortedJobs = useMemo(() => rankedJobs.map(r => r.job), [rankedJobs]);

  const hasActiveFilters =
    filters.selectedCategories.length > 0 ||
    filters.minWage > 0 ||
    filters.maxDistance < 15 ||
    filters.timeSlot !== 'All' ||
    filters.urgency !== 'All' ||
    filters.kycOnly ||
    filters.minRating > 0 ||
    filters.skillMatchOnly ||
    Boolean(filters.searchQuery.trim());

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
            setFilters(prev => ({ ...prev, searchQuery: transcript }));
          },
          onError: () => setIsListening(false),
          onEnd: () => setIsListening(false),
        },
        language
      );
    }
  };

  const removeCategoryChip = (cat: WorkCategory) => {
    setFilters(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.filter(c => c !== cat),
    }));
  };

  return (
    <div className="pb-24 max-w-lg mx-auto px-4 pt-3 space-y-3.5 text-[#111827]">
      {/* Search Bar & View Toggle */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center rounded-2xl border border-[#E2E8F0] bg-white p-1.5 shadow-xs transition-all focus-within:border-[#2563EB] focus-within:ring-2 focus-within:ring-[#2563EB]/15">
          <div className="p-2 text-[#2563EB]">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            placeholder={t.searchPlaceholder}
            className="flex-1 text-sm bg-transparent border-none outline-none font-medium text-[#111827] placeholder-[#64748B]"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
              className="p-1 text-[#64748B] hover:text-[#111827]"
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={handleVoiceSearch}
            className={`p-2 rounded-xl transition-all ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse'
                : 'bg-[#FFFBEB] text-[#F5A900] border border-[#FDE68A] hover:bg-[#F5A900] hover:text-[#111827]'
            }`}
            title="Search with Voice"
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        </div>

        {/* List <-> Map Toggle */}
        <div className="flex items-center p-1 rounded-2xl border border-[#E2E8F0] bg-white shadow-xs shrink-0">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-xl transition-all ${
              viewMode === 'list'
                ? 'bg-[#2563EB] text-white font-bold shadow-xs'
                : 'text-[#64748B] hover:text-[#2563EB]'
            }`}
            title="List View"
          >
            <List size={18} />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`p-2 rounded-xl transition-all ${
              viewMode === 'map'
                ? 'bg-[#2563EB] text-white font-bold shadow-xs'
                : 'text-[#64748B] hover:text-[#2563EB]'
            }`}
            title="Map View"
          >
            <MapIcon size={18} />
          </button>
        </div>

        {/* Sync / Refresh Jobs Button */}
        <button
          onClick={() => refreshJobs()}
          disabled={isSyncingJobs}
          className={`p-2.5 rounded-2xl border border-[#E2E8F0] bg-white text-[#64748B] hover:text-[#2563EB] hover:border-[#2563EB] shadow-xs transition-all flex items-center justify-center shrink-0 ${
            isSyncingJobs ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'
          }`}
          title={isSyncingJobs ? 'Syncing latest jobs...' : 'Refresh jobs from server'}
        >
          <RefreshCw size={18} className={isSyncingJobs ? 'animate-spin text-[#2563EB]' : ''} />
        </button>
      </div>

      {/* Mandatory Pipeline Architecture Banner */}
      <div className="rounded-2xl p-3 bg-gradient-to-r from-blue-50 via-slate-50 to-indigo-50 border border-blue-100 shadow-2xs space-y-2">
        <div className="flex items-start gap-2 text-xs">
          <Sparkles size={15} className="text-[#2563EB] shrink-0 mt-0.5" />
          <p className="font-semibold text-slate-800 leading-snug">
            Filters narrow the eligible jobs. AI matching ranks suitable options among the eligible results.
          </p>
        </div>

        {/* Dynamic Multi-Stage Progression Indicator */}
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 flex-wrap pt-0.5">
          <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 shadow-2xs">
            All: <strong className="text-slate-900">{counts.totalJobs}</strong>
          </span>
          <span className="text-slate-400">→</span>
          <span
            className={`px-2 py-0.5 rounded-md border shadow-2xs transition-colors ${
              counts.eligibleJobs < counts.totalJobs
                ? 'bg-blue-100/90 text-blue-900 border-blue-300 font-bold'
                : 'bg-white border-slate-200 text-slate-700'
            }`}
            title="Jobs surviving the 8 hard eligibility constraints"
          >
            Eligible: <strong className="text-blue-950">{counts.eligibleJobs}</strong>
          </span>
          <span className="text-slate-400">→</span>
          <span
            className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-950 border border-amber-200 shadow-2xs font-bold flex items-center gap-1"
            title="Surviving eligible jobs ranked by Random Forest AI compatibility score"
          >
            <Sparkles size={10} className="text-amber-600" />
            <span>AI Ranked: {counts.rankedJobs}</span>
          </span>
        </div>
      </div>

      {/* Sorting & Filter Trigger Bar */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={onOpenFilters}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold shadow-xs transition-colors shrink-0 border ${
              hasActiveFilters
                ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]'
                : 'border-[#E2E8F0] bg-white hover:border-[#2563EB] text-[#111827]'
            }`}
          >
            <Sliders size={13} className={hasActiveFilters ? 'text-[#2563EB]' : 'text-[#64748B]'} />
            <span>{t.filterTitle}</span>
            {hasActiveFilters && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-[#2563EB] text-white">
                {activeFilterTags.length}
              </span>
            )}
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-semibold shrink-0 border border-[#E2E8F0] bg-white text-[#111827]">
            <ArrowUpDown size={12} className="text-[#2563EB]" />
            <select
              value={filters.sortBy}
              onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="bg-transparent border-none outline-none font-bold cursor-pointer text-xs text-[#111827] [&>option]:bg-white [&>option]:text-[#111827]"
            >
              <option value="Best Match">Sort: Best Match (AI)</option>
              <option value="Nearest">Sort: Nearest</option>
              <option value="Highest Wage">Sort: Highest Wage</option>
              <option value="Earliest Start">Sort: Earliest Start</option>
              <option value="Latest Posted">Sort: Latest</option>
            </select>
          </div>
        </div>

        <span className="font-bold text-[11px] shrink-0 text-[#64748B]">
          {sortedJobs.length} {sortedJobs.length === 1 ? 'Job' : t.navJobs}
        </span>
      </div>

      {/* Active Filter Chips with Quick Dismiss */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {filters.selectedCategories.map(cat => (
            <span
              key={cat}
              className="text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]"
            >
              <span>{getCategoryEmoji(cat)}</span>
              <span>{getCategoryLabel(cat, language)}</span>
              <button
                onClick={() => removeCategoryChip(cat)}
                className="hover:text-rose-600 ml-0.5 cursor-pointer"
                title={`Remove ${cat}`}
              >
                <X size={12} />
              </button>
            </span>
          ))}

          {filters.maxDistance < 15 && (
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]">
              <span>≤ {filters.maxDistance} km</span>
              <button
                onClick={() => setFilters(prev => ({ ...prev, maxDistance: 15 }))}
                className="hover:text-rose-600 ml-0.5 cursor-pointer"
                title="Reset distance limit"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.minWage > 0 && (
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]">
              <span>≥ ₹{filters.minWage}</span>
              <button
                onClick={() => setFilters(prev => ({ ...prev, minWage: 0 }))}
                className="hover:text-rose-600 ml-0.5 cursor-pointer"
                title="Reset wage filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.timeSlot !== 'All' && (
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]">
              <span>Time: {filters.timeSlot}</span>
              <button
                onClick={() => setFilters(prev => ({ ...prev, timeSlot: 'All' }))}
                className="hover:text-rose-600 ml-0.5 cursor-pointer"
                title="Reset time slot"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.urgency !== 'All' && (
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]">
              <span>Urgency: {filters.urgency}</span>
              <button
                onClick={() => setFilters(prev => ({ ...prev, urgency: 'All' }))}
                className="hover:text-rose-600 ml-0.5 cursor-pointer"
                title="Reset urgency"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.kycOnly && (
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]">
              <span>KYC Customers</span>
              <button
                onClick={() => setFilters(prev => ({ ...prev, kycOnly: false }))}
                className="hover:text-rose-600 ml-0.5 cursor-pointer"
                title="Remove KYC requirement"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.minRating > 0 && (
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]">
              <span>{filters.minRating}+ ★ Rating</span>
              <button
                onClick={() => setFilters(prev => ({ ...prev, minRating: 0 }))}
                className="hover:text-rose-600 ml-0.5 cursor-pointer"
                title="Remove rating requirement"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.skillMatchOnly && (
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]">
              <Sparkles size={11} className="text-[#F5A900]" />
              <span>My Skills Only</span>
              <button
                onClick={() => setFilters(prev => ({ ...prev, skillMatchOnly: false }))}
                className="hover:text-rose-600 ml-0.5 cursor-pointer"
                title="Disable skill filter"
              >
                <X size={12} />
              </button>
            </span>
          )}

          <button
            onClick={resetFilters}
            className="text-[11px] font-bold text-[#64748B] hover:text-[#111827] flex items-center gap-1 px-2 py-0.5 rounded-lg hover:bg-slate-100 transition-colors ml-auto cursor-pointer"
            title="Clear all active filters"
          >
            <RotateCcw size={11} />
            <span>{t.clearFilters}</span>
          </button>
        </div>
      )}

      {/* Content: List View or Map View */}
      {viewMode === 'map' ? (
        <div className="space-y-3">
          <InteractiveWorkMap
            jobs={sortedJobs}
            onSelectJob={job => onSelectJob(job)}
          />
          <p className="text-xs text-center text-[#64748B]">
            Drag to pan map. Tap any wage pin (e.g. ₹800) to preview & apply.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedJobs.length === 0 ? (
            <div className="rounded-3xl p-8 text-center border border-[#E2E8F0] bg-white shadow-xs space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB]">
                <Search size={24} />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#111827]">
                  No jobs match your hard filters
                </h3>
                <p className="text-xs max-w-xs mx-auto text-[#64748B] mt-1 leading-relaxed">
                  Filters narrow the eligible jobs before AI matching ranks them. Current constraints eliminated all {counts.totalJobs} available listings.
                </p>
              </div>

              {/* Active filters breakdown in empty state */}
              {activeFilterTags.length > 0 && (
                <div className="p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] text-left max-w-sm mx-auto space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Active Restrictive Filters ({activeFilterTags.length}):
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {activeFilterTags.map(tag => (
                      <span
                        key={tag}
                        className="text-[11px] font-semibold px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded-md shadow-2xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Special tip if skillMatchOnly is active but user has 0 skills */}
              {filters.skillMatchOnly && (!user.skills || user.skills.length === 0) && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs max-w-sm mx-auto text-left">
                  <AlertCircle size={15} className="text-amber-600 shrink-0" />
                  <span>
                    Your profile has 0 registered trade skills. Update your skills in your profile or disable "My Skills Only" to view all gigs.
                  </span>
                </div>
              )}

              <div>
                <button
                  onClick={resetFilters}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-extrabold px-5 py-2.5 rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>{t.clearFilters}</span>
                </button>
              </div>
            </div>
          ) : (
            sortedJobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onViewDetails={onSelectJob}
                onApply={onSelectJob}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
