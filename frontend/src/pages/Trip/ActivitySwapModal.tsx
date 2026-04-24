import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ActivityDetail } from '../../apis/tripApi';

interface ActivitySwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayId: string;
  dayNumber?: number;
  activityIndex: number;
  currentActivity: ActivityDetail;
  onSwapComplete: (updatedDay: any) => void;
}

const ActivitySwapModal: React.FC<ActivitySwapModalProps> = ({
  isOpen,
  onClose,
  dayId,
  dayNumber,
  activityIndex,
  currentActivity,
  onSwapComplete,
}) => {
  const navigate = useNavigate();

  const handleViewRecommendations = () => {
    onClose();
    // Navigate to recommendations page with swap mode enabled
    navigate(`/recommendations/${dayId.split('-')[0]}`, {
      state: {
        swapMode: {
          isActive: true,
          dayId: dayId,
          dayNumber: dayNumber,
          activityIndex: activityIndex,
          originalActivity: currentActivity,
        },
      },
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Sparkles size={16} className="text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">Swap Activity</h2>
                </div>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X size={18} className="text-slate-500" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-sm text-blue-700">
                    <span className="font-semibold">Current Activity:</span> {currentActivity.title}
                  </p>
                  {currentActivity.time && (
                    <p className="text-xs text-blue-600 mt-1">at {currentActivity.time}</p>
                  )}
                </div>

                <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">
                      The new activity will be automatically scheduled at the best available time slot with a 30-minute buffer from other activities.
                    </p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-6">
                  Browse recommendations to find a new hotel or activity to replace this one.
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-slate-600 font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleViewRecommendations}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles size={16} />
                    Browse Recommendations
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ActivitySwapModal;