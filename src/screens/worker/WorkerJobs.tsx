import React, { useState, useMemo } from 'react';
import { useApp } from '../../store/AppContext';
import { Job, WorkCategory } from '../../types';
import { JobCard } from '../../components/common/JobCard';
import { InteractiveWorkMap } from '../../components/map/InteractiveWorkMap';
import { calculateMatchScore } from '../../services/matchingService';
import { speechService } from '../../services/speechService';
import { getCategoryLabel } from '../../config/categories';
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
} from 'lucide-react';

interface WorkerJobsProps {
  onSelectJob: (job: Job) => void;
  onOpenFilters: () => void;
}

export const WorkerJobs: React.FC<WorkerJobsProps> = ({
  onSelectJob,
  onOpenFilters,
}) => {
  const { jobs, user, filters, setFilters, language, theme, t } = useApp();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [isListening, setIsListening] = useState(false);

  // Dynamic Filtering
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // 1. Search Query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchTitle = job.title.toLowerCase().includes(q);
        const matchCat = job.category.toLowerCase().includes(q);
        const matchDesc = job.description.toLowerCase().includes(q);
        const matchArea = job.approximateArea.toLowerCase().includes(q);
        if (!matchTitle && !matchCat && !matchDesc && !matchArea) return false;
      }

      // 2. Categories
      if (
        filters.selectedCategories.length > 0 &&
        !filters.selectedCategories.includes(job.category)
      ) {
        return false;
      }

      // 3. Max Distance
      if (job.approximateDistanceKm > filters.maxDistance) {
        return false;
      }

      // 4. Min Wage
      if (job.wage < filters.minWage) {
        return false;
      }

      // 5. Urgency
      if (filters.urgency !== 'All' && job.urgency !== filters.urgency) {
        return false;
      }

      // 6. Customer Trust: KYC
      if (filters.kycOnly && !job.customerKyc) {
        return false;
      }

      // 7. Customer Rating
      if (filters.minRating > 0 && job.customerRating < filters.minRating) {
        return false;
      }

      // 8. Skill Match
      if (filters.skillMatchOnly) {
        const hasSkill = user.skills.some(
          s => s.toLowerCase() === job.category.toLowerCase()
        );
        if (!hasSkill) return false;
      }

      return true;
    });
  }, [jobs, filters, user.skills]);

  // Sorting with uniqueness guarantee
  const sortedJobs = useMemo(() => {
    const seenIds = new Set<string>();
    const uniqueList: Job[] = [];
    for (const job of filteredJobs) {
      if (!seenIds.has(job.id)) {
        seenIds.add(job.id);
        uniqueList.push(job);
      }
    }

    const list = [...uniqueList];
    switch (filters.sortBy) {
      case 'Nearest':
        return list.sort((a, b) => a.approximateDistanceKm - b.approximateDistanceKm);
      case 'Highest Wage':
        return list.sort((a, b) => b.wage - a.wage);
      case 'Earliest Start':
        return list.sort((a, b) => a.startTime.localeCompare(b.startTime));
      case 'Latest Posted':
        return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'Best Match':
      default:
        return list.sort((a, b) => {
          const scoreA = calculateMatchScore(user, a).score;
          const scoreB = calculateMatchScore(user, b).score;
          return scoreB - scoreA;
        });
    }
  }, [filteredJobs, filters.sortBy, user]);

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
    <div className="pb-24 max-w-lg mx-auto px-4 pt-3 space-y-4 text-[#111827]">
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
      </div>

      {/* Sorting & Filter Trigger Bar */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={onOpenFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold shadow-xs transition-colors shrink-0 border border-[#E2E8F0] bg-white hover:border-[#2563EB] text-[#111827]"
          >
            <Sliders size={13} className="text-[#2563EB]" />
            <span>{t.filterTitle}</span>
            {(filters.selectedCategories.length > 0 ||
              filters.minWage > 0 ||
              filters.maxDistance < 15 ||
              filters.kycOnly ||
              filters.urgency !== 'All') && (
              <span className="w-2 h-2 rounded-full bg-[#2563EB]"></span>
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
              <option value="Best Match">Sort: Best Match</option>
              <option value="Nearest">Sort: Nearest</option>
              <option value="Highest Wage">Sort: Highest Wage</option>
              <option value="Earliest Start">Sort: Earliest Start</option>
              <option value="Latest Posted">Sort: Latest</option>
            </select>
          </div>
        </div>

        <span className="font-bold text-[11px] shrink-0 text-[#64748B]">
          {sortedJobs.length} {t.navJobs}
        </span>
      </div>

      {/* Active Filter Chips */}
      {filters.selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filters.selectedCategories.map(cat => (
            <span
              key={cat}
              className="text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 border bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE]"
            >
              <span>{getCategoryLabel(cat, language)}</span>
              <button
                onClick={() => removeCategoryChip(cat)}
                className="hover:text-rose-600"
              >
                <X size={12} />
              </button>
            </span>
          ))}
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
            <div className="rounded-3xl p-8 text-center border border-[#E2E8F0] bg-white shadow-xs space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB]">
                <Search size={24} />
              </div>
              <h3 className="font-extrabold text-base text-[#111827]">
                No jobs match your filters
              </h3>
              <p className="text-xs max-w-xs mx-auto text-[#64748B]">
                Try expanding your distance radius, adjusting minimum wage, or clearing category filters.
              </p>
              <button
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    selectedCategories: [],
                    minWage: 0,
                    maxDistance: 15,
                    searchQuery: '',
                    kycOnly: false,
                    skillMatchOnly: false,
                    urgency: 'All',
                  }));
                }}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-extrabold px-4 py-2 rounded-xl transition-all shadow-xs"
              >
                {t.clearFilters}
              </button>
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
