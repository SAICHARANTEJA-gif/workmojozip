import React, { useState } from 'react';
import { useApp } from '../../store/AppContext';
import { Job } from '../../types';
import { Star, X, CheckCircle2, Award, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RatingModalProps {
  job: Job;
  onClose: () => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({ job, onClose }) => {
  const { user, activeRole, submitRating, allWorkers } = useApp();

  const [stars, setStars] = useState<number>(5);
  const [comment, setComment] = useState<string>('Punctual, hardworking, and very cooperative!');
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Determine who is being rated
  const isWorkerRatingCustomer = activeRole === 'worker';
  const targetName = isWorkerRatingCustomer ? job.customerName : 'Workers';
  const targetPhoto = isWorkerRatingCustomer
    ? job.customerPhoto
    : allWorkers.find(w => job.confirmedWorkerIds.includes(w.id))?.profilePhoto || user.profilePhoto;

  const handleSubmit = () => {
    const targetUserId = isWorkerRatingCustomer
      ? job.customerId
      : job.confirmedWorkerIds[0] || user.id;

    submitRating(job.id, targetUserId, stars, comment);
    setSubmitted(true);
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } catch {
      // ignore
    }
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#E2E8F0] shadow-2xl text-[#111827] text-center animate-in zoom-in-95">
        {submitted ? (
          <div className="py-6 space-y-3">
            <div className="w-16 h-16 bg-emerald-50 text-[#16A34A] rounded-full flex items-center justify-center mx-auto border border-emerald-200 shadow-xs">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="font-black text-lg text-[#111827]">Thank You!</h3>
            <p className="text-xs text-[#64748B]">
              Your rating has been submitted and added to the community trust reputation score.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2563EB] bg-[#EFF6FF] border border-[#DBEAFE] px-2.5 py-0.5 rounded-full">
                Shift Finished ✓
              </span>
              <button
                onClick={onClose}
                className="text-[#64748B] hover:text-[#111827] p-1 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <img
              src={targetPhoto}
              alt={targetName}
              className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-[#DBEAFE] shadow-sm"
            />

            <div>
              <h3 className="font-black text-lg text-[#111827]">How was your experience?</h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Rating {targetName} for <span className="font-bold text-[#111827]">"{job.title}"</span>
              </p>
            </div>

            {/* 5 Stars Selector */}
            <div className="flex items-center justify-center gap-2 py-1">
              {[1, 2, 3, 4, 5].map(st => (
                <button
                  key={st}
                  onClick={() => setStars(st)}
                  className="p-1 transition-transform hover:scale-120 active:scale-95"
                >
                  <Star
                    size={32}
                    className={`${
                      st <= stars
                        ? 'fill-[#2563EB] text-[#2563EB] drop-shadow-xs'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="text-xs font-black text-[#2563EB]">
              {stars === 5 ? '⭐⭐⭐⭐⭐ Outstanding!' : stars >= 4 ? '⭐⭐⭐⭐ Very Good' : '⭐⭐⭐ Satisfactory'}
            </div>

            <textarea
              rows={2}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Leave an optional review for the community..."
              className="w-full p-2.5 rounded-xl border border-[#E2E8F0] bg-[#F7F9FC] text-xs text-[#111827] outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#EFF6FF]"
            />

            <div className="flex gap-2 pt-1">
              <button
                onClick={onClose}
                className="w-1/3 bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleSubmit}
                className="w-2/3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold py-2.5 rounded-xl text-xs shadow-xs transition-all active:scale-95"
              >
                Submit Rating
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
