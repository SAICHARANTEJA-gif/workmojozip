import React from 'react';
import { useApp } from '../../store/AppContext';
import { WorkCategory, WorkTimePreference, JobUrgency } from '../../types';
import { getCategoryLabel } from '../../config/categories';
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
  const { filters, setFilters, resetFilters, user, t, language } = useApp();

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
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB]">
              <Filter size={16} />
            </div>
            <h3 className="font-bold text-base text-[#111827]">{t.filterTitle}</h3>
            <span className="text-xs bg-[#EFF6FF] text-[#2563EB] border border-[#DBEAFE] font-bold px-2.5 py-0.5 rounded-full">
              {totalFilteredCount} {t.navJobs}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetFilters}
              className="text-xs text-[#64748B] hover:text-[#111827] flex items-center gap-1 font-semibold p-1"
            >
              <RotateCcw size={12} />
              <span>{t.clearFilters}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-[#64748B] hover:text-[#111827] rounded-full hover:bg-[#F7F9FC] transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Filters Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-sm bg-[#F7F9FC]">
          {/* 1. Distance Radius */}
          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
              Maximum Distance
            </label>
            <div className="flex flex-wrap gap-2">
              {distances.map(d => (
                <button
                  key={d}
                  onClick={() => setFilters(prev => ({ ...prev, maxDistance: d }))}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    filters.maxDistance === d
                      ? 'bg-[#2563EB] text-white shadow-sm'
                      : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-[#EFF6FF]'
                  }`}
                >
                  Within {d} km
                </button>
              ))}
            </div>
          </div>

          {/* 2. Minimum Wage (₹) */}
          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
              Minimum Daily Wage
            </label>
            <div className="flex flex-wrap gap-2">
              {wageTiers.map(w => (
                <button
                  key={w}
                  onClick={() => setFilters(prev => ({ ...prev, minWage: w }))}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                    filters.minWage === w
                      ? 'bg-[#2563EB] text-white shadow-sm'
                      : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-[#EFF6FF]'
                  }`}
                >
                  {w === 0 ? 'Any Wage' : `₹${w}+`}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Work Category */}
          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
              {t.workCategories}
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
                        ? 'bg-[#2563EB] text-white shadow-sm'
                        : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-[#EFF6FF]'
                    }`}
                  >
                    {isSelected && <Check size={12} className="text-white" />}
                    <span>{getCategoryLabel(cat, language)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Time of Day */}
          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
              Time of Day
            </label>
            <div className="flex flex-wrap gap-2">
              {timeSlots.map(t => (
                <button
                  key={t}
                  onClick={() => setFilters(prev => ({ ...prev, timeSlot: t }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filters.timeSlot === t
                      ? 'bg-[#2563EB] text-white shadow-sm'
                      : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-[#EFF6FF]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Urgency */}
          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
              Urgency / Start Date
            </label>
            <div className="flex flex-wrap gap-2">
              {urgencies.map(u => (
                <button
                  key={u}
                  onClick={() => setFilters(prev => ({ ...prev, urgency: u }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    filters.urgency === u
                      ? 'bg-[#2563EB] text-white shadow-sm'
                      : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-[#EFF6FF]'
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>

          {/* 6. Customer Trust & Skill Matching */}
          <div className="p-3 bg-white rounded-2xl border border-[#E2E8F0] space-y-2.5">
            <div className="text-xs font-bold text-[#111827]">Trust & AI Matching</div>

            <label className="flex items-center gap-2 text-xs font-semibold text-[#111827] cursor-pointer">
              <input
                type="checkbox"
                checked={filters.kycOnly}
                onChange={e => setFilters(prev => ({ ...prev, kycOnly: e.target.checked }))}
                className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB]"
              />
              <span>Only KYC Verified Customers</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-[#111827] cursor-pointer">
              <input
                type="checkbox"
                checked={filters.minRating >= 4.5}
                onChange={e =>
                  setFilters(prev => ({ ...prev, minRating: e.target.checked ? 4.5 : 0 }))
                }
                className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB]"
              />
              <span>High Customer Rating (4.5+ ★)</span>
            </label>

            <label className="flex items-center gap-2 text-xs font-semibold text-[#111827] cursor-pointer">
              <input
                type="checkbox"
                checked={filters.skillMatchOnly}
                onChange={e =>
                  setFilters(prev => ({ ...prev, skillMatchOnly: e.target.checked }))
                }
                className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB]"
              />
              <span className="flex items-center gap-1">
                <Sparkles size={12} className="text-[#2563EB]" />
                <span>Only Jobs Matching My Registered Skills</span>
              </span>
            </label>
          </div>
        </div>

        {/* Footer Apply CTA */}
        <div className="p-4 border-t border-[#E2E8F0] bg-white">
          <button
            onClick={onClose}
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-3 rounded-2xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 text-sm"
          >
            <span>{t.applyFilters} ({totalFilteredCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
