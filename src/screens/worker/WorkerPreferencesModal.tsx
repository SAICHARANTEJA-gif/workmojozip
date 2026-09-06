import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { WorkCategory, WorkTimePreference } from '../../types';
import { X, Check, Sliders, Sparkles } from 'lucide-react';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WorkerPreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, updateUserPreferences, addNotification } = useApp();

  const [categories, setCategories] = useState<WorkCategory[]>(user.preferredCategories || []);
  const [distance, setDistance] = useState<number>(user.preferredDistance || 5);
  const [wage, setWage] = useState<number>(user.preferredWage || 700);
  const [time, setTime] = useState<WorkTimePreference>('Morning');
  const [skills, setSkills] = useState<string[]>(user.skills || []);

  if (!isOpen) return null;

  const allCategories: WorkCategory[] = [
    'Loading/Unloading',
    'Cleaning',
    'Delivery',
    'Construction',
    'Gardening',
    'Labour',
    'Repair',
    'Shop/Store Help',
    'Other',
  ];

  const distances = [1, 3, 5, 10, 15];
  const allSkills = [
    'Loading/Unloading',
    'Construction',
    'Cleaning',
    'Delivery',
    'Gardening',
    'Masonry',
    'Painting',
    'Carpentry',
    'Shop Help',
    'Electrician Assistant',
  ];

  const toggleCategory = (cat: WorkCategory) => {
    setCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleSkill = (skill: string) => {
    setSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleSave = () => {
    updateUserPreferences({
      preferredCategories: categories,
      preferredDistance: distance,
      minimumWage: wage,
      preferredTime: time,
      skills,
    });

    addNotification({
      recipientId: user.id,
      title: 'Preferences Updated',
      message: 'Your job match algorithm & alert settings have been recalibrated.',
      type: 'alert_triggered',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 text-slate-900 animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-amber-600" />
            <h3 className="font-extrabold text-base text-slate-900">Work Preferences</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
          {/* 1. Preferred Categories */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Preferred Work Types (Multiple)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {allCategories.map(cat => {
                const isSelected = categories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected && <Check size={12} />}
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Maximum Distance */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Maximum Commute Distance ({distance} km)
            </label>
            <div className="flex gap-2">
              {distances.map(d => (
                <button
                  key={d}
                  onClick={() => setDistance(d)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    distance === d
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d} km
                </button>
              ))}
            </div>
          </div>

          {/* 3. Minimum Desired Wage */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Minimum Daily Wage Preference
              </label>
              <span className="text-sm font-black text-amber-600">₹{wage}</span>
            </div>
            <input
              type="range"
              min="400"
              max="1500"
              step="50"
              value={wage}
              onChange={e => setWage(Number(e.target.value))}
              className="w-full accent-amber-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
              <span>₹400 (Entry)</span>
              <span>₹750 (Average)</span>
              <span>₹1500 (Skilled)</span>
            </div>
          </div>

          {/* 4. Preferred Time of Day */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Preferred Work Time
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Morning', 'Afternoon', 'Evening', 'Flexible'] as const).map(slot => (
                <button
                  key={slot}
                  onClick={() => setTime(slot as WorkTimePreference)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-left ${
                    time === slot
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Registered Skills */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Verified Skills (Improves AI Match by 30%)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {allSkills.map(s => {
                const hasSkill = skills.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleSkill(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
                      hasSkill
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {hasSkill && <Check size={12} />}
                    <span>{s}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <button
            onClick={handleSave}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3 rounded-2xl shadow-md transition-all active:scale-98 text-sm"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
