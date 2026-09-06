import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import {
  FastForward,
  UserX,
  RotateCcw,
  Sliders,
  ChevronDown,
  ChevronUp,
  MapPin,
  Bell,
  Sparkles,
  CheckCircle2,
  Users,
  ShieldCheck,
  ShieldAlert,
  Server,
} from 'lucide-react';
import { AdminDashboardModal } from '../admin/AdminDashboardModal';

export const DemoControlPanel: React.FC = () => {
  const {
    resetDemoData,
    advanceDemoTime,
    triggerCancellationDemo,
    activeRole,
    toggleRole,
    addNotification,
    user,
    jobs,
    autoSelectWorkersForJob,
    setActiveLiveTrackingJobId,
    setOnboardingStep,
    systemMode,
    toggleSystemMode,
  } = useApp();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAdvanceTime = () => {
    advanceDemoTime(60);
    showToast('⏰ Time advanced! Shift ended -> Job Finished & Rating triggered.');
  };

  const handleWorkerCancel = () => {
    triggerCancellationDemo();
    showToast('⚡ Worker cancelled! Automatic Waiting List replacement promoted #1 candidate.');
  };

  const handleAutoSelect = () => {
    const jobWithApplicants = jobs.find(j => j.applicants.length > 0 && j.workersConfirmed < j.workersRequired) || jobs[0];
    if (jobWithApplicants) {
      autoSelectWorkersForJob(jobWithApplicants.id);
      showToast(`🤖 AI Auto-Selected top candidates for "${jobWithApplicants.title}"!`);
    } else {
      showToast('No job with unconfirmed applicants found.');
    }
  };

  const handleSimulateGPS = () => {
    const confirmed = jobs.find(j => j.confirmedWorkerIds.includes(user.id) || j.workersConfirmed > 0) || jobs[0];
    setActiveLiveTrackingJobId(confirmed.id);
    showToast('📍 Simulated GPS Movement: Worker moving toward workplace with active ETA!');
  };

  const handleTestAlert = () => {
    addNotification({
      recipientId: user.id,
      title: '🚨 SIH Demo Alert',
      message: 'New high-priority community repair gig just posted 1.2 km away paying ₹950!',
      type: 'alert_triggered',
      actionScreen: 'jobs',
    });
    showToast('🔔 Mock notification dispatched to inbox.');
  };

  const handleReset = () => {
    if (window.confirm('Reset all demo data back to clean initial state for fresh presentation?')) {
      resetDemoData();
      showToast('🔄 Demo data reset to pristine state!');
    }
  };

  return (
    <>
      {/* Discreet Trigger at top right or bottom */}
      <div className="fixed top-14 sm:top-2.5 right-2 sm:right-4 z-40">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 bg-slate-900/95 hover:bg-slate-800 text-amber-400 border border-amber-500/50 text-[10px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-1 rounded-full shadow-xl backdrop-blur-md transition-all active:scale-95"
          title="SIH 2026 Judge Demonstration Controls"
        >
          <Sliders size={12} className="text-amber-400" />
          <span>Demo Deck</span>
          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {/* Expanded Control Drawer */}
      {isExpanded && (
        <div className="fixed top-22 sm:top-12 right-2 sm:right-4 z-50 w-72 sm:w-80 bg-slate-900/98 backdrop-blur-md rounded-2xl border border-amber-500/40 shadow-2xl p-3.5 text-slate-100 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" />
              <span className="font-bold text-xs text-amber-300">SIH 2026 Demonstration Deck</span>
            </div>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono">
              Role: {activeRole.toUpperCase()}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* System Architecture Mode Toggle (Phase 21) */}
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Server size={14} className={systemMode === 'production' ? 'text-emerald-400' : 'text-amber-400'} />
                <div>
                  <div className="font-bold text-[11px] text-white">System Architecture</div>
                  <div className="text-[9px] text-slate-400">
                    {systemMode === 'production' ? 'Live Node.js/Express API (Port 5000)' : 'SIH Demo Offline Sandbox'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  toggleSystemMode();
                  showToast(
                    systemMode === 'demo'
                      ? '🌐 Switched to LIVE API Mode (Express backend connected)'
                      : '⚡ Switched to SIH Demo Mode (Safe offline in-memory)'
                  );
                }}
                className={`text-[10px] font-black px-2 py-1 rounded-lg border transition-all ${
                  systemMode === 'production'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                {systemMode === 'production' ? 'LIVE API' : 'DEMO MODE'}
              </button>
            </div>

            {/* Platform Admin Portal Launcher (Phase 20) */}
            <button
              onClick={() => {
                setShowAdminDashboard(true);
                setIsExpanded(false);
              }}
              className="w-full flex items-center justify-between bg-indigo-950/70 hover:bg-indigo-900 text-slate-200 hover:text-white p-2 rounded-xl border border-indigo-700/80 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <ShieldAlert size={15} className="text-indigo-400" />
                <div>
                  <div className="font-semibold text-white">Open Admin Dashboard</div>
                  <div className="text-[10px] text-indigo-300">Metrics, users, dispute resolution</div>
                </div>
              </div>
              <span className="text-[10px] bg-indigo-800 text-white font-bold px-1.5 py-0.5 rounded">
                Admin
              </span>
            </button>

            {/* 1. Fast Forward Time (Auto Completion) */}
            <button
              onClick={handleAdvanceTime}
              className="w-full flex items-center justify-between bg-slate-800 hover:bg-amber-600/20 text-slate-200 hover:text-amber-300 p-2 rounded-xl border border-slate-700/80 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <FastForward size={15} className="text-amber-400" />
                <div>
                  <div className="font-semibold">Simulate End of Shift</div>
                  <div className="text-[10px] text-slate-400">Triggers Ongoing → Finished & Ratings</div>
                </div>
              </div>
              <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-amber-300">Sec 44</span>
            </button>

            {/* 2. Worker Cancellation & Auto Waiting List Replacement */}
            <button
              onClick={handleWorkerCancel}
              className="w-full flex items-center justify-between bg-slate-800 hover:bg-rose-600/20 text-slate-200 hover:text-rose-300 p-2 rounded-xl border border-slate-700/80 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <UserX size={15} className="text-rose-400" />
                <div>
                  <div className="font-semibold">Simulate Worker Cancel</div>
                  <div className="text-[10px] text-slate-400">Promotes Waiting List #1 to Confirmed</div>
                </div>
              </div>
              <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-rose-300">Sec 38</span>
            </button>

            {/* 3. Automatic Worker Selection */}
            <button
              onClick={handleAutoSelect}
              className="w-full flex items-center justify-between bg-slate-800 hover:bg-emerald-600/20 text-slate-200 hover:text-emerald-300 p-2 rounded-xl border border-slate-700/80 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Users size={15} className="text-emerald-400" />
                <div>
                  <div className="font-semibold">Run AI Auto-Selection</div>
                  <div className="text-[10px] text-slate-400">Fills slots with highest match scores</div>
                </div>
              </div>
              <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-emerald-300">Sec 34</span>
            </button>

            {/* 4. Live GPS Movement Simulation */}
            <button
              onClick={handleSimulateGPS}
              className="w-full flex items-center justify-between bg-slate-800 hover:bg-sky-600/20 text-slate-200 hover:text-sky-300 p-2 rounded-xl border border-slate-700/80 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <MapPin size={15} className="text-sky-400" />
                <div>
                  <div className="font-semibold">Simulate GPS Live Movement</div>
                  <div className="text-[10px] text-slate-400">Animates worker route toward workplace</div>
                </div>
              </div>
              <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-sky-300">Sec 42</span>
            </button>

            {/* 5. Switch Role Shortcut */}
            <button
              onClick={toggleRole}
              className="w-full flex items-center justify-between bg-slate-800 hover:bg-purple-600/20 text-slate-200 hover:text-purple-300 p-2 rounded-xl border border-slate-700/80 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <RotateCcw size={15} className="text-purple-400" />
                <div>
                  <div className="font-semibold">Toggle Worker ↔ Customer</div>
                  <div className="text-[10px] text-slate-400">Instant dual-role switch</div>
                </div>
              </div>
              <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-purple-300">Sec 9</span>
            </button>

            {/* 5B. Experience Login & Aadhaar/PAN/Live Photo Flow */}
            <button
              onClick={() => {
                setOnboardingStep('login');
                setIsExpanded(false);
                showToast('🚀 Opened Login, Aadhaar & PAN Card Verification Flow!');
              }}
              className="w-full flex items-center justify-between bg-slate-800 hover:bg-amber-600/20 text-slate-200 hover:text-amber-300 p-2 rounded-xl border border-slate-700/80 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-400" />
                <div>
                  <div className="font-semibold">Login & KYC Flow (Aadhaar/PAN)</div>
                  <div className="text-[10px] text-slate-400">Mobile + Aadhaar + PAN + Face Capture</div>
                </div>
              </div>
              <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-emerald-300">Sec 7-8</span>
            </button>

            {/* 6. Push Test Alert */}
            <button
              onClick={handleTestAlert}
              className="w-full flex items-center justify-between bg-slate-800 hover:bg-amber-600/20 text-slate-200 hover:text-amber-300 p-2 rounded-xl border border-slate-700/80 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Bell size={15} className="text-amber-400" />
                <div>
                  <div className="font-semibold">Send Push Notification</div>
                  <div className="text-[10px] text-slate-400">Fires in-app job alert</div>
                </div>
              </div>
              <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-amber-300">Sec 27</span>
            </button>

            {/* 7. Reset Demo Data */}
            <button
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-xl transition-all shadow-md mt-2"
            >
              <RotateCcw size={14} />
              <span>Reset Demo Data (Pristine)</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Toast */}
      {toastMsg && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-amber-300 border border-amber-500/50 px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in slide-in-from-bottom">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Admin Dashboard Modal (Phase 20) */}
      {showAdminDashboard && (
        <AdminDashboardModal onClose={() => setShowAdminDashboard(false)} />
      )}
    </>
  );
};
