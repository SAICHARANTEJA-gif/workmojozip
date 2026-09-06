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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 text-slate-900 animate-in slide-in-from-bottom duration-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-amber-600" />
            <h3 className="font-extrabold text-base text-slate-900">Custom Job Alerts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4 text-sm overflow-y-auto">
          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs text-amber-950 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-600 shrink-0" />
            <span>
              Get instant notifications whenever high-paying gigs match your exact criteria.
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Alert Category
            </label>
            <select
              value={selectedCat}
              onChange={e => setSelectedCat(e.target.value as WorkCategory)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold text-slate-800 bg-white"
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Minimum Wage: ₹{minPay}+
            </label>
            <input
              type="range"
              min="500"
              max="1200"
              step="50"
              value={minPay}
              onChange={e => setMinPay(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Within Distance: {alertDistance} km
            </label>
            <div className="flex gap-2">
              {[2, 5, 8, 12].map(d => (
                <button
                  key={d}
                  onClick={() => setAlertDistance(d)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold ${
                    alertDistance === d ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {d} km
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-slate-800 pt-2 cursor-pointer">
            <input
              type="checkbox"
              checked={instantAlerts}
              onChange={e => setInstantAlerts(e.target.checked)}
              className="w-4 h-4 text-amber-500 rounded"
            />
            <span>Enable in-app sound & push alerts</span>
          </label>
        </div>

        <div className="p-4 border-t border-slate-200 bg-white">
          <button
            onClick={handleSimulateAlert}
            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold py-3 rounded-2xl shadow-md transition-all active:scale-98 text-sm flex items-center justify-center gap-1.5"
          >
            <Bell size={15} />
            <span>Save & Test Job Alert</span>
          </button>
        </div>
      </div>
    </div>
  );
};
