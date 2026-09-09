import React, { useState } from 'react';
import { User, Job } from '../../types';
import {
  ShieldCheck,
  Star,
  MapPin,
  Briefcase,
  CheckCircle2,
  Search,
  Filter,
  UserPlus,
  Send,
  X,
  Sliders,
  Phone,
} from 'lucide-react';

interface WorkerDirectoryProps {
  workers: User[];
  postedJobs: Job[];
  onInviteWorker: (workerId: string, jobId: string) => void;
  onBack: () => void;
}

export const WorkerDirectory: React.FC<WorkerDirectoryProps> = ({
  workers,
  postedJobs,
  onInviteWorker,
  onBack,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [minRating, setMinRating] = useState<number>(0);
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('All');

  // Invite Modal State
  const [invitingWorker, setInvitingWorker] = useState<User | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string>(
    postedJobs.length > 0 ? postedJobs[0].id : ''
  );
  const [inviteSuccessMsg, setInviteSuccessMsg] = useState<string | null>(null);

  const categories = [
    'All',
    'Loading/Unloading',
    'Cleaning',
    'Construction',
    'Delivery',
    'Gardening',
    'Labour',
    'Repair',
  ];

  // Filtering
  const filteredWorkers = workers.filter(w => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = w.name.toLowerCase().includes(q);
      const matchSkills = w.skills.some(s => s.toLowerCase().includes(q));
      if (!matchName && !matchSkills) return false;
    }
    if (selectedCategory !== 'All') {
      const matchCat = w.preferredCategories?.includes(selectedCategory as any);
      const matchSkill = w.skills.some(s => s.toLowerCase() === selectedCategory.toLowerCase());
      if (!matchCat && !matchSkill) return false;
    }
    if (minRating > 0 && w.rating < minRating) return false;
    if (availabilityFilter !== 'All' && w.availability !== availabilityFilter) return false;
    return true;
  });

  const handleSendInvite = () => {
    if (!invitingWorker || !selectedJobId) return;
    onInviteWorker(invitingWorker.id, selectedJobId);
    setInviteSuccessMsg(`Invitation sent to ${invitingWorker.name}!`);
    setTimeout(() => {
      setInviteSuccessMsg(null);
      setInvitingWorker(null);
    }, 1500);
  };

  return (
    <div className="pb-24 max-w-lg mx-auto px-4 pt-3 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-[#111827] tracking-tight">
            Find Workers (Directory)
          </h1>
          <p className="text-xs text-[#64748B] font-medium">
            Search verified local talent and invite directly to jobs
          </p>
        </div>
        <button
          onClick={onBack}
          className="text-xs font-bold bg-[#EFF6FF] border border-[#DBEAFE] text-[#2563EB] px-3 py-1.5 rounded-xl hover:bg-[#DBEAFE] transition-colors"
        >
          Back
        </button>
      </div>

      {/* Search Input */}
      <div className="flex items-center bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-1.5 focus-within:border-[#2563EB] transition-colors">
        <div className="p-2 text-[#2563EB]">
          <Search size={18} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by worker name, masonry, cleaning, loading..."
          className="flex-1 text-sm bg-transparent border-none outline-none text-[#111827] placeholder-[#64748B] font-medium"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="p-2 text-[#64748B] hover:text-[#111827]">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Category Pills Filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-xl text-xs font-bold shrink-0 transition-all ${
              selectedCategory === cat
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:bg-[#F7F9FC]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Secondary Filter Bar */}
      <div className="flex items-center justify-between text-xs text-[#64748B] bg-[#F7F9FC] p-2.5 rounded-2xl border border-[#E2E8F0]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[#111827]">Rating:</span>
          <select
            value={minRating}
            onChange={e => setMinRating(Number(e.target.value))}
            className="bg-white border border-[#E2E8F0] rounded-lg px-2 py-0.5 font-bold outline-none text-[#111827]"
          >
            <option value={0}>Any Rating</option>
            <option value={4.5}>4.5★ & Above</option>
            <option value={4.8}>4.8★ & Above</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <span className="font-semibold text-[#111827]">Status:</span>
          <select
            value={availabilityFilter}
            onChange={e => setAvailabilityFilter(e.target.value)}
            className="bg-white border border-[#E2E8F0] rounded-lg px-2 py-0.5 font-bold outline-none text-[#111827]"
          >
            <option value="All">All</option>
            <option value="Available">Available</option>
            <option value="Busy">Busy</option>
          </select>
        </div>

        <span className="font-bold text-[#2563EB]">
          {filteredWorkers.length} found
        </span>
      </div>

      {/* Workers Grid */}
      <div className="space-y-3">
        {filteredWorkers.map(w => (
          <div
            key={w.id}
            className="bg-white rounded-3xl p-4 border border-[#E2E8F0] shadow-sm hover:shadow-md transition-all space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={w.profilePhoto}
                    alt={w.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-[#E2E8F0] shadow-inner"
                  />
                  {w.kycStatus === 'verified' && (
                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-sm border-2 border-white">
                      <CheckCircle2 size={12} />
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-[#111827] text-base leading-tight">
                      {w.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[#64748B] mt-1">
                    <span className="flex items-center gap-0.5 bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                      <Star size={11} className="fill-amber-400 text-amber-400" />
                      {w.rating}★
                    </span>
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                      {w.reliabilityScore}% Reliable
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Pill */}
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                  w.availability === 'Available'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-[#F7F9FC] text-[#64748B] border-[#E2E8F0]'
                }`}
              >
                {w.availability}
              </span>
            </div>

            {/* Skills & Experience */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {w.skills.map((skill, i) => (
                <span
                  key={i}
                  className="bg-[#F7F9FC] text-[#111827] border border-[#E2E8F0] text-[11px] font-medium px-2 py-0.5 rounded-lg"
                >
                  {skill}
                </span>
              ))}
              <span className="bg-[#EFF6FF] text-[#2563EB] text-[11px] font-semibold px-2 py-0.5 rounded-lg border border-[#DBEAFE]">
                {w.experience || '3+ years exp'}
              </span>
            </div>

            {/* Location & Wage & Invite Button */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
              <div className="text-xs">
                <span className="text-[#64748B] font-medium">Expected: </span>
                <span className="font-bold text-[#2563EB]">
                  ₹{w.preferredWage || 700} / shift
                </span>
              </div>

              <button
                onClick={() => setInvitingWorker(w)}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm flex items-center gap-1.5 transition-all active:scale-95"
              >
                <UserPlus size={14} />
                <span>Invite to Job</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Invite Modal */}
      {invitingWorker && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 max-w-sm w-full text-[#111827] shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center text-[#2563EB]">
                  <UserPlus size={16} />
                </div>
                <span className="font-bold text-sm text-[#111827]">Direct Job Invitation</span>
              </div>
              <button
                onClick={() => setInvitingWorker(null)}
                className="p-1.5 text-[#64748B] hover:text-[#111827] hover:bg-[#F7F9FC] rounded-xl transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-[#F7F9FC] p-3 rounded-2xl border border-[#E2E8F0]">
              <img
                src={invitingWorker.profilePhoto}
                alt={invitingWorker.name}
                className="w-12 h-12 rounded-xl object-cover border border-[#E2E8F0]"
              />
              <div>
                <h4 className="font-bold text-sm text-[#111827]">{invitingWorker.name}</h4>
                <p className="text-xs text-[#64748B]">
                  {invitingWorker.rating}★ Rating • {invitingWorker.reliabilityScore}% Reliability
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#111827]">
                Select Your Open Job to Invite:
              </label>
              {postedJobs.length === 0 ? (
                <div className="text-xs text-rose-700 bg-rose-50 p-3 rounded-xl border border-rose-200">
                  You don't have any active open jobs. Please post a job first.
                </div>
              ) : (
                <select
                  value={selectedJobId}
                  onChange={e => setSelectedJobId(e.target.value)}
                  className="w-full bg-[#F7F9FC] border border-[#E2E8F0] rounded-xl p-2.5 text-[#111827] text-xs font-bold outline-none focus:border-[#2563EB]"
                >
                  {postedJobs.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.title} (₹{job.wage})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {inviteSuccessMsg && (
              <div className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200 text-center font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 size={14} />
                <span>{inviteSuccessMsg}</span>
              </div>
            )}

            <button
              onClick={handleSendInvite}
              disabled={postedJobs.length === 0}
              className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-1.5 text-xs transition-all active:scale-98 disabled:opacity-40"
            >
              <Send size={14} />
              <span>Send Direct Invitation</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
