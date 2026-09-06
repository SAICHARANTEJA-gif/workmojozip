import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  Briefcase,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Activity,
  X,
} from 'lucide-react';

interface AdminDashboardModalProps {
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'disputes' | 'users'>('metrics');

  const [disputes, setDisputes] = useState([
    {
      id: 'disp-1',
      jobTitle: 'Construction Helper & Masonry Assist',
      reportedBy: 'CityBuild Contractors',
      workerName: 'Ravi Teja',
      reason: 'Attendance disagreement',
      status: 'pending',
      amount: 950,
    },
    {
      id: 'disp-2',
      jobTitle: 'Catering Assistant & Food Prep',
      reportedBy: 'Annapurna Grand',
      workerName: 'Priya Sharma',
      reason: 'Early departure before shift end',
      status: 'pending',
      amount: 700,
    },
  ]);

  const handleResolveDispute = (id: string, action: 'release' | 'refund') => {
    setDisputes(prev =>
      prev.map(d => (d.id === id ? { ...d, status: action === 'release' ? 'resolved_paid' : 'resolved_refunded' } : d))
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full text-slate-100 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
            <ShieldAlert size={18} />
            <span>WORK MOJO — Platform Admin Portal</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'metrics'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            System Metrics
          </button>
          <button
            onClick={() => setActiveTab('disputes')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'disputes'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Disputes ({disputes.filter(d => d.status === 'pending').length})
          </button>
        </div>

        {/* METRICS VIEW */}
        {activeTab === 'metrics' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400 font-semibold">Total Gig Workers</div>
                <div className="text-2xl font-black text-white">124</div>
                <div className="text-[10px] text-emerald-400 font-bold">100% KYC Verified</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400 font-semibold">Active Employers</div>
                <div className="text-2xl font-black text-white">48</div>
                <div className="text-[10px] text-indigo-300 font-bold">Cooperative Network</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400 font-semibold">Gigs Completed</div>
                <div className="text-2xl font-black text-emerald-400">382</div>
                <div className="text-[10px] text-slate-400 font-bold">98.4% Reliability</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <div className="text-[11px] text-slate-400 font-semibold">Protected Wages</div>
                <div className="text-2xl font-black text-amber-400">₹2.84 L</div>
                <div className="text-[10px] text-emerald-400 font-bold">₹0 Platform Cut</div>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-emerald-400" />
                <span className="text-xs font-bold text-white">Backend Health</span>
              </div>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-bold">
                API Port 5000 Active
              </span>
            </div>
          </div>
        )}

        {/* DISPUTES VIEW */}
        {activeTab === 'disputes' && (
          <div className="space-y-3">
            {disputes.map(disp => (
              <div
                key={disp.id}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-white">{disp.jobTitle}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Employer: <strong className="text-slate-200">{disp.reportedBy}</strong> • Worker:{' '}
                      <strong className="text-amber-300">{disp.workerName}</strong>
                    </p>
                  </div>
                  <span className="text-xs font-black text-amber-400">₹{disp.amount}</span>
                </div>

                <div className="text-xs text-rose-300 bg-rose-500/10 p-2 rounded-xl border border-rose-500/30">
                  Reason: {disp.reason}
                </div>

                {disp.status === 'pending' ? (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleResolveDispute(disp.id, 'release')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 size={13} />
                      <span>Release to Worker</span>
                    </button>
                    <button
                      onClick={() => handleResolveDispute(disp.id, 'refund')}
                      className="flex-1 bg-rose-700 hover:bg-rose-600 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1"
                    >
                      <XCircle size={13} />
                      <span>Refund Employer</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-xs font-bold text-emerald-400 pt-1">
                    Status: {disp.status === 'resolved_paid' ? 'Paid to Worker ✓' : 'Refunded ✓'}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
