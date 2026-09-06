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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl text-slate-900 text-center animate-in zoom-in-95">
        {submitted ? (
          <div className="py-6 space-y-3">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <h3 className="font-extrabold text-lg text-slate-900">Thank You!</h3>
            <p className="text-xs text-slate-500">
              Your rating has been submitted and added to the community trust reputation score.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full">
                Shift Finished ✓
              </span>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <img
              src={targetPhoto}
              alt={targetName}
              className="w-16 h-16 rounded-full object-cover mx-auto border-2 border-amber-400 shadow-sm"
            />

            <div>
              <h3 className="font-black text-lg text-slate-900">How was your experience?</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Rating {targetName} for <span className="font-semibold text-slate-800">"{job.title}"</span>
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
                        ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div className="text-xs font-bold text-amber-700">
              {stars === 5 ? '⭐⭐⭐⭐⭐ Outstanding!' : stars >= 4 ? '⭐⭐⭐⭐ Very Good' : '⭐⭐⭐ Satisfactory'}
            </div>

            <textarea
              rows={2}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Leave an optional review for the community..."
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none focus:border-amber-500"
            />

            <div className="flex gap-2 pt-1">
              <button
                onClick={onClose}
                className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleSubmit}
                className="w-2/3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-98"
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
