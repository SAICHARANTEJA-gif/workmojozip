import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { WorkCategory } from '../../types';
import { X, Bell, Check, Sparkles, CheckCircle2 } from 'lucide-react';

interface JobAlertsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JobAlertsModal: React.FC<JobAlertsProps> = ({ isOpen, onClose }) => {
  const { user, addNotification, jobs } = useApp();
  const [selectedCat, setSelectedCat] = useState<WorkCategory>('Delivery');
  const [minPay, setMinPay] = useState<number>(700);
  const [alertDistance, setAlertDistance] = useState<number>(5);
  const [instantAlerts, setInstantAlerts] = useState<boolean>(true);

  if (!isOpen) return null;

  const handleSimulateAlert = () => {
    const matchCount = jobs.filter(j => j.category === selectedCat || j.wage >= minPay).length;

    addNotification({
      recipientId: user.id,
      title: `⚡ Job Alert Triggered (${selectedCat})`,
      message: `${matchCount || 3} new ${selectedCat} jobs matching your ₹${minPay}+ preferences are available nearby!`,
      type: 'alert_triggered',
      actionScreen: 'jobs',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-[#E2E8F0] text-[#111827] animate-in slide-in-from-bottom duration-200">
        <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB]">
              <Bell size={16} />
            </div>
            <h3 className="font-black text-base text-[#111827]">Custom Job Alerts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#64748B] hover:text-[#111827] rounded-full hover:bg-[#F1F5F9] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4 text-sm overflow-y-auto">
          <div className="bg-[#EFF6FF] p-3.5 rounded-2xl border border-[#DBEAFE] text-xs text-[#2563EB] flex items-center gap-2 font-medium">
            <Sparkles size={16} className="text-[#2563EB] shrink-0" />
            <span>
              Get instant notifications whenever high-paying gigs match your exact criteria.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
              Alert Category
            </label>
            <select
              value={selectedCat}
              onChange={e => setSelectedCat(e.target.value as WorkCategory)}
              className="w-full p-2.5 rounded-xl border border-[#E2E8F0] font-bold text-[#111827] bg-[#F7F9FC] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF]"
            >
              <option value="Delivery">Delivery</option>
              <option value="Loading/Unloading">Loading/Unloading</option>
              <option value="Construction">Construction</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Gardening">Gardening</option>
              <option value="Shop/Store Help">Shop/Store Help</option>
              <option value="Labour">Labour</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
              Minimum Wage: <span className="text-[#2563EB]">₹{minPay}+</span>
            </label>
            <input
              type="range"
              min="500"
              max="1200"
              step="50"
              value={minPay}
              onChange={e => setMinPay(Number(e.target.value))}
              className="w-full accent-[#2563EB] h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-2">
              Within Distance: <span className="text-[#2563EB]">{alertDistance} km</span>
            </label>
            <div className="flex gap-2">
              {[2, 5, 8, 12].map(d => (
                <button
                  key={d}
                  onClick={() => setAlertDistance(d)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                    alertDistance === d
                      ? 'bg-[#2563EB] text-white shadow-xs'
                      : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                  }`}
                >
                  {d} km
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-[#111827] pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={instantAlerts}
              onChange={e => setInstantAlerts(e.target.checked)}
              className="w-4 h-4 text-[#2563EB] accent-[#2563EB] rounded"
            />
            <span>Enable in-app sound & push alerts</span>
          </label>
        </div>

        <div className="p-4 border-t border-[#E2E8F0] bg-white">
          <button
            onClick={handleSimulateAlert}
            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-3.5 rounded-2xl shadow-xs transition-all active:scale-95 text-sm flex items-center justify-center gap-1.5"
          >
            <Bell size={15} />
            <span>Save & Test Job Alert</span>
          </button>
        </div>
      </div>
    </div>
  );
};
