import React, { useState, useMemo } from 'react';
import { useApp } from '../../store/AppContext';
import { Job, WorkCategory } from '../../types';
import { JobCard } from '../../components/common/JobCard';
import { InteractiveWorkMap } from '../../components/map/InteractiveWorkMap';
import { calculateMatchScore } from '../../services/matchingService';
import { speechService } from '../../services/speechService';
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
  const { jobs, user, filters, setFilters, language } = useApp();
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

  // Sorting
  const sortedJobs = useMemo(() => {
    const list = [...filteredJobs];
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
    <div className="pb-24 max-w-lg mx-auto px-4 pt-3 space-y-4">
      {/* Search Bar & View Toggle */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center bg-white rounded-2xl border border-slate-200 shadow-xs p-1.5 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-200">
          <div className="p-2 text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="Search work, category or area..."
            className="flex-1 text-sm bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 font-medium"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
              className="p-1 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
          <button
            type="button"
            onClick={handleVoiceSearch}
            className={`p-2 rounded-xl transition-all ${
              isListening ? 'bg-rose-600 text-white animate-pulse' : 'text-amber-600 hover:bg-amber-50'
            }`}
            title="Search with Voice"
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        </div>

        {/* List <-> Map Toggle */}
        <div className="flex items-center bg-slate-800 p-1 rounded-2xl border border-slate-700 shrink-0">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-xl transition-all ${
              viewMode === 'list'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="List View"
          >
            <List size={18} />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`p-2 rounded-xl transition-all ${
              viewMode === 'map'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
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
            className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-amber-400 px-3 py-1.5 rounded-xl font-bold text-slate-800 shadow-xs transition-colors shrink-0"
          >
            <Sliders size={13} className="text-amber-600" />
            <span>Filters</span>
            {(filters.selectedCategories.length > 0 ||
              filters.minWage > 0 ||
              filters.maxDistance < 15 ||
              filters.kycOnly ||
              filters.urgency !== 'All') && (
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            )}
          </button>

          {/* Sort Selector */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl text-slate-700 font-semibold shrink-0">
            <ArrowUpDown size={12} className="text-slate-500" />
            <select
              value={filters.sortBy}
              onChange={e => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
              className="bg-transparent border-none outline-none font-bold text-slate-800 cursor-pointer text-xs"
            >
              <option value="Best Match">Sort: Best Match</option>
              <option value="Nearest">Sort: Nearest</option>
              <option value="Highest Wage">Sort: Highest Wage</option>
              <option value="Earliest Start">Sort: Earliest Start</option>
              <option value="Latest Posted">Sort: Latest</option>
            </select>
          </div>
        </div>

        <span className="text-slate-500 font-bold text-[11px] shrink-0">
          {sortedJobs.length} Jobs
        </span>
      </div>

      {/* Active Filter Chips */}
      {filters.selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filters.selectedCategories.map(cat => (
            <span
              key={cat}
              className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1"
            >
              <span>{cat}</span>
              <button
                onClick={() => removeCategoryChip(cat)}
                className="hover:text-rose-700"
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
          <p className="text-xs text-slate-500 text-center">
            Drag to pan map. Tap any wage pin (e.g. ₹800) to preview & apply.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedJobs.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 shadow-xs space-y-3">
              <div className="text-4xl">🔍</div>
              <h3 className="font-extrabold text-base text-slate-800">No jobs match your filters</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
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
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                Clear All Filters
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
