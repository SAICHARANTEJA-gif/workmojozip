import React from 'react';
import { useApp } from '../../store/AppContext';
import { WorkCategory, WorkTimePreference, JobUrgency } from '../../types';
import { X, Check, RotateCcw, Filter, Sparkles } from 'lucide-react';

interface FilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  totalFilteredCount: number;
}

export const WorkerFiltersSheet: React.FC<FilterSheetProps> = ({
  isOpen,
  onClose,
  totalFilteredCount,
}) => {
  const { filters, setFilters, resetFilters, user } = useApp();

  if (!isOpen) return null;

  const categories: WorkCategory[] = [
    'Labour',
    'Cleaning',
    'Delivery',
    'Gardening',
    'Construction',
    'Loading/Unloading',
    'Repair',
    'Shop/Store Help',
    'Other',
  ];

  const distances = [1, 3, 5, 10, 15];
  const wageTiers = [0, 500, 700, 800, 1000];
  const timeSlots: Array<WorkTimePreference | 'All'> = [
    'All',
    'Morning',
    'Afternoon',
    'Evening',
    'Night',
  ];
  const durations: Array<'All' | 'Short' | 'Half Day' | 'Full Day'> = [
    'All',
    'Short',
    'Half Day',
    'Full Day',
  ];
  const urgencies: Array<'All' | JobUrgency> = ['All', 'Today', 'Tomorrow', 'Scheduled'];

  const toggleCategory = (cat: WorkCategory) => {
    setFilters(prev => {
      const exists = prev.selectedCategories.includes(cat);
      return {
        ...prev,
        selectedCategories: exists
          ? prev.selectedCategories.filter(c => c !== cat)
          : [...prev.selectedCategories, cat],
      };
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border-t border-slate-200 animate-in slide-in-from-bottom duration-200 text-slate-900">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-amber-600" />
            <h3 className="font-extrabold text-base text-slate-900">Filter Jobs</h3>
            <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
              {totalFilteredCount} matches
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetFilters}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold p-1"
            >
              <RotateCcw size={12} />
              <span>Clear</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Filters Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-sm">
          {/* 1. Distance Radius */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Maximum Distance
            </label>
            <div className="flex flex-wrap gap-2">
              {distances.map(d => (
                <button
                  key={d}
                  onClick={() => setFilters(prev => ({ ...prev, maxDistance: d }))}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    filters.maxDistance === d
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Within {d} km
                </button>
              ))}
            </div>
          </div>

          {/* 2. Minimum Wage (₹) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Minimum Daily Wage
            </label>
            <div className="flex flex-wrap gap-2">
              {wageTiers.map(w => (
                <button
                  key={w}
                  onClick={() => setFilters(prev => ({ ...prev, minWage: w }))}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    filters.minWage === w
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {w === 0 ? 'Any Wage' : `₹${w}+`}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Work Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Work Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => {
                const isSelected = filters.selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected && <Check size={12} className="text-amber-400" />}
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Time of Day */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Time of Day
            </label>
            <div className="flex flex-wrap gap-2">
              {timeSlots.map(t => (
                <button
                  key={t}
                  onClick={() => setFilters(prev => ({ ...prev, timeSlot: t }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filters.timeSlot === t
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Urgency */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Urgency / Start Date
            </label>
            <div className="flex flex-wrap gap-2">
              {urgencies.map(u => (
                <button
                  key={u}
                  onClick={() => setFilters(prev => ({ ...prev, urgency: u }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filters.urgency === u
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Customer Trust & Skill Matching */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="text-xs font-bold text-slate-800">Trust & AI Matching</div>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.kycOnly}
                onChange={e => setFilters(prev => ({ ...prev, kycOnly: e.target.checked }))}
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
              />
              <span>Only KYC Verified Customers</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.minRating >= 4.5}
                onChange={e =>
                  setFilters(prev => ({ ...prev, minRating: e.target.checked ? 4.5 : 0 }))
                }
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
              />
              <span>High Customer Rating (4.5+ ★)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.skillMatchOnly}
                onChange={e =>
                  setFilters(prev => ({ ...prev, skillMatchOnly: e.target.checked }))
                }
                className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
              />
              <span className="flex items-center gap-1">
                <Sparkles size={12} className="text-amber-600" />
                <span>Only Jobs Matching My Registered Skills</span>
              </span>
            </label>
          </div>
        </div>

        {/* Footer Apply CTA */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <button
            onClick={onClose}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3 rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 text-sm"
          >
            <span>Show {totalFilteredCount} Jobs</span>
          </button>
        </div>
      </div>
    </div>
  );
};
