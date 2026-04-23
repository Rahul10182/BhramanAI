// components/trip/ActivitySwapModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, ArrowRightLeft, Clock, MapPin, Tag, CheckCircle2, Sparkles } from 'lucide-react';
import { tripApi } from '../../apis/tripApi';
import type { ActivityDetail } from '../../apis/tripApi';

interface ActivitySwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayId: string;
  activityIndex: number;
  currentActivity: ActivityDetail;
  onSwapComplete: (updatedDay: any) => void;
}

const ActivitySwapModal: React.FC<ActivitySwapModalProps> = ({
  isOpen, onClose, dayId, activityIndex, currentActivity, onSwapComplete
}) => {
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwapping, setIsSwapping] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchAlternatives();
    }
    return () => {
      setAlternatives([]);
      setSelectedId(null);
      setError(null);
    };
  }, [isOpen, dayId, activityIndex]);

  const fetchAlternatives = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await tripApi.getAlternatives(dayId, activityIndex);
      setAlternatives(data.alternatives || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load alternatives');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = async (alt: any) => {
    setIsSwapping(true);
    setSelectedId(alt.id || alt.title);
    try {
      const updatedDay = await tripApi.replaceActivity(dayId, activityIndex, {
        time: alt.time || currentActivity.time,
        title: alt.title || alt.name,
        description: alt.description,
        location: alt.location || '',
        category: alt.category || currentActivity.category,
        estimatedCost: alt.estimatedCost || alt.price || 0,
        aiGenerated: false,
      });
      onSwapComplete(updatedDay);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to swap activity');
    } finally {
      setIsSwapping(false);
      setSelectedId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

        {/* Modal */}
        <motion.div
          className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
          initial={{ scale: 0.9, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 30 }}
        >
          {/* Header */}
          <div className="shrink-0 bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <ArrowRightLeft size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Swap Activity</h3>
                  <p className="text-white/60 text-sm">Choose an alternative for this time slot</p>
                </div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Current activity pill */}
            <div className="mt-4 bg-white/10 rounded-xl px-4 py-3">
              <p className="text-white/50 text-xs font-medium mb-1">CURRENTLY</p>
              <p className="font-semibold">{currentActivity.title}</p>
              <div className="flex items-center gap-3 mt-1 text-white/60 text-xs">
                <span className="flex items-center gap-1"><Clock size={11} /> {currentActivity.time}</span>
                {currentActivity.location && <span className="flex items-center gap-1"><MapPin size={11} /> {currentActivity.location}</span>}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Loader2 size={32} className="text-blue-500 animate-spin" />
                <p className="text-slate-500 text-sm">Finding alternatives...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <p className="text-red-500 text-sm">{error}</p>
                <button onClick={fetchAlternatives} className="px-4 py-2 bg-slate-100 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors">
                  Retry
                </button>
              </div>
            ) : alternatives.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Sparkles size={32} className="text-slate-300" />
                <p className="text-slate-500 text-sm">No alternatives found for this slot.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-4">
                  {alternatives.length} alternatives available
                </p>
                {alternatives.map((alt, i) => {
                  const id = alt.id || alt.title || `alt-${i}`;
                  const isSelected = selectedId === id;
                  return (
                    <motion.div
                      key={id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`group bg-white rounded-2xl border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
                        isSelected ? 'border-blue-500 shadow-lg shadow-blue-500/10' : 'border-slate-100 hover:border-slate-200'
                      }`}
                      onClick={() => !isSwapping && handleSwap(alt)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800">{alt.title || alt.name}</h4>
                          <p className="text-sm text-slate-500 mt-1 line-clamp-2">{alt.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            {alt.duration && (
                              <span className="flex items-center gap-1 text-xs text-slate-400">
                                <Clock size={12} /> {alt.duration}
                              </span>
                            )}
                            {(alt.estimatedCost > 0 || alt.price > 0) && (
                              <span className="flex items-center gap-1 text-xs text-slate-400">
                                <Tag size={12} /> ₹{(alt.estimatedCost || alt.price || 0).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0">
                          {isSelected && isSwapping ? (
                            <Loader2 size={20} className="text-blue-500 animate-spin" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-blue-500 group-hover:text-white flex items-center justify-center transition-all text-slate-400">
                              <CheckCircle2 size={16} />
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ActivitySwapModal;
