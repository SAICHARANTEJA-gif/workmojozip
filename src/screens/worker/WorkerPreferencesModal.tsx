import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { WorkCategory, WorkTimePreference, WorkerPaymentPreference } from '../../types';
import { X, Check, Sliders, Sparkles, CreditCard, Banknote } from 'lucide-react';

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
  const [paymentPreference, setPaymentPreference] = useState<WorkerPaymentPreference>(
    user.paymentPreference || (user.preferredPaymentMethod === 'Cash' || user.preferredPaymentMethod === 'OFFLINE' ? 'OFFLINE' : 'ONLINE')
  );

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
      paymentPreference,
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[88vh] flex flex-col overflow-hidden shadow-2xl border border-[#E2E8F0] text-[#111827] animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB]">
              <Sliders size={16} />
            </div>
            <h3 className="font-black text-base text-[#111827]">Work Preferences</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#64748B] hover:text-[#111827] rounded-full hover:bg-[#F1F5F9] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
          {/* 1. Preferred Categories */}
          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
              Preferred Work Types (Multiple)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {allCategories.map(cat => {
                const isSelected = categories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'bg-[#F1F5F9] text-[#111827] hover:bg-[#E2E8F0]'
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
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
              Maximum Commute Distance ({distance} km)
            </label>
            <div className="flex gap-2">
              {distances.map(d => (
                <button
                  key={d}
                  onClick={() => setDistance(d)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    distance === d
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
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
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Minimum Daily Wage Preference
              </label>
              <span className="text-sm font-black text-[#2563EB]">₹{wage}</span>
            </div>
            <input
              type="range"
              min="400"
              max="1500"
              step="50"
              value={wage}
              onChange={e => setWage(Number(e.target.value))}
              className="w-full accent-[#2563EB] h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#64748B] font-semibold mt-1">
              <span>₹400 (Entry)</span>
              <span>₹750 (Average)</span>
              <span>₹1500 (Skilled)</span>
            </div>
          </div>

          {/* 4. Preferred Time of Day */}
          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
              Preferred Work Time
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Morning', 'Afternoon', 'Evening', 'Flexible'] as const).map(slot => (
                <button
                  key={slot}
                  onClick={() => setTime(slot as WorkTimePreference)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all text-left border ${
                    time === slot
                      ? 'bg-[#EFF6FF] border-[#2563EB] text-[#2563EB] shadow-xs'
                      : 'bg-[#F1F5F9] border-transparent text-[#64748B] hover:bg-[#E2E8F0]'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Registered Skills */}
          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
              Verified Skills (Improves AI Match by 30%)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {allSkills.map(s => {
                const hasSkill = skills.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleSkill(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                      hasSkill
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'bg-[#F1F5F9] text-[#111827] hover:bg-[#E2E8F0]'
                    }`}
                  >
                    {hasSkill && <Check size={12} />}
                    <span>{s}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Preferred Payment Method (Online vs Offline/Cash) */}
          <div className="pt-1">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                Preferred Payment Method
              </label>
              <span className="text-[10px] font-bold text-[#2563EB] bg-[#EFF6FF] px-2 py-0.5 rounded-full border border-[#DBEAFE]">
                Cooperative Direct Payout
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Option 1: Online Payment */}
              <button
                type="button"
                onClick={() => setPaymentPreference('ONLINE')}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                  paymentPreference === 'ONLINE'
                    ? 'border-[#2563EB] bg-[#EFF6FF] ring-2 ring-[#2563EB]/20 shadow-xs'
                    : 'border-[#E2E8F0] bg-white hover:border-slate-300 text-[#111827]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${paymentPreference === 'ONLINE' ? 'bg-[#2563EB] text-white shadow-xs' : 'bg-[#EFF6FF] text-[#2563EB]'}`}>
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-black text-[#111827]">Online Payment</div>
                      <div className={`text-[11px] font-bold ${paymentPreference === 'ONLINE' ? 'text-[#2563EB]' : 'text-[#64748B]'}`}>
                        UPI & Bank Transfer
                      </div>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    paymentPreference === 'ONLINE' ? 'border-[#2563EB] bg-white' : 'border-[#E2E8F0] bg-white'
                  }`}>
                    {paymentPreference === 'ONLINE' && <div className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />}
                  </div>
                </div>
                <p className="text-xs text-[#64748B] font-medium mt-2 leading-relaxed">
                  Protected wage held safely. Transferred directly to your UPI/bank upon shift completion.
                </p>
              </button>

              {/* Option 2: Offline Payment */}
              <button
                type="button"
                onClick={() => setPaymentPreference('OFFLINE')}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                  paymentPreference === 'OFFLINE'
                    ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-200 shadow-xs'
                    : 'border-[#E2E8F0] bg-white hover:border-slate-300 text-[#111827]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${paymentPreference === 'OFFLINE' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-emerald-50 text-emerald-600'}`}>
                      <Banknote size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-black text-[#111827]">Offline Payment</div>
                      <div className={`text-[11px] font-bold ${paymentPreference === 'OFFLINE' ? 'text-emerald-700' : 'text-[#64748B]'}`}>
                        Cash in Hand
                      </div>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    paymentPreference === 'OFFLINE' ? 'border-emerald-600 bg-white' : 'border-[#E2E8F0] bg-white'
                  }`}>
                    {paymentPreference === 'OFFLINE' && <div className="w-2.5 h-2.5 rounded-full bg-emerald-600" />}
                  </div>
                </div>
                <p className="text-xs text-[#64748B] font-medium mt-2 leading-relaxed">
                  Hand-to-hand cash payment by employer. Employer records cash settlement upon shift finish.
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E2E8F0] bg-white">
          <button
            onClick={handleSave}
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-3.5 rounded-2xl shadow-xs transition-all active:scale-95 text-sm"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
