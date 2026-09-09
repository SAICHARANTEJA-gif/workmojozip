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
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 max-w-lg w-full text-[#111827] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB]">
              <ShieldAlert size={18} />
            </div>
            <div>
              <span className="font-bold text-sm text-[#111827]">WORK MOJO</span>
              <span className="text-xs text-[#64748B] block">Platform Admin Portal</span>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-[#64748B] hover:text-[#111827] hover:bg-[#F7F9FC] rounded-xl transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-[#F7F9FC] p-1 rounded-xl border border-[#E2E8F0]">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'metrics'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#111827]'
            }`}
          >
            System Metrics
          </button>
          <button
            onClick={() => setActiveTab('disputes')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'disputes'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#111827]'
            }`}
          >
            Disputes ({disputes.filter(d => d.status === 'pending').length})
          </button>
        </div>

        {/* METRICS VIEW */}
        {activeTab === 'metrics' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F7F9FC] p-4 rounded-2xl border border-[#E2E8F0] space-y-1">
                <div className="text-[11px] text-[#64748B] font-semibold">Total Gig Workers</div>
                <div className="text-2xl font-black text-[#111827]">124</div>
                <div className="text-[10px] text-emerald-600 font-bold">100% KYC Verified</div>
              </div>

              <div className="bg-[#F7F9FC] p-4 rounded-2xl border border-[#E2E8F0] space-y-1">
                <div className="text-[11px] text-[#64748B] font-semibold">Active Employers</div>
                <div className="text-2xl font-black text-[#111827]">48</div>
                <div className="text-[10px] text-[#2563EB] font-bold">Cooperative Network</div>
              </div>

              <div className="bg-[#F7F9FC] p-4 rounded-2xl border border-[#E2E8F0] space-y-1">
                <div className="text-[11px] text-[#64748B] font-semibold">Gigs Completed</div>
                <div className="text-2xl font-black text-emerald-600">382</div>
                <div className="text-[10px] text-[#64748B] font-bold">98.4% Reliability</div>
              </div>

              <div className="bg-[#F7F9FC] p-4 rounded-2xl border border-[#E2E8F0] space-y-1">
                <div className="text-[11px] text-[#64748B] font-semibold">Protected Wages</div>
                <div className="text-2xl font-black text-[#2563EB]">₹2.84 L</div>
                <div className="text-[10px] text-emerald-600 font-bold">₹0 Platform Cut</div>
              </div>
            </div>

            <div className="bg-[#F7F9FC] p-3.5 rounded-2xl border border-[#E2E8F0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-emerald-600" />
                <span className="text-xs font-bold text-[#111827]">Backend Health</span>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-md font-bold border border-emerald-200">
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
                className="bg-[#F7F9FC] p-4 rounded-2xl border border-[#E2E8F0] space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-[#111827]">{disp.jobTitle}</h4>
                    <p className="text-xs text-[#64748B] mt-0.5">
                      Employer: <strong className="text-[#111827]">{disp.reportedBy}</strong> • Worker:{' '}
                      <strong className="text-[#2563EB]">{disp.workerName}</strong>
                    </p>
                  </div>
                  <span className="text-xs font-black text-[#2563EB]">₹{disp.amount}</span>
                </div>

                <div className="text-xs text-rose-700 bg-rose-50 p-2 rounded-xl border border-rose-200">
                  Reason: {disp.reason}
                </div>

                {disp.status === 'pending' ? (
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleResolveDispute(disp.id, 'release')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <CheckCircle2 size={13} />
                      <span>Release to Worker</span>
                    </button>
                    <button
                      onClick={() => handleResolveDispute(disp.id, 'refund')}
                      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <XCircle size={13} />
                      <span>Refund Employer</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-xs font-bold text-emerald-600 pt-1">
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
