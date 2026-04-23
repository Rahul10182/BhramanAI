// components/chat/ItineraryCard.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin } from 'lucide-react';
import { CATEGORY_CONFIG } from './constants';

interface ItineraryCardProps {
    activity: any;
    index: number;
}

const ItineraryCard: React.FC<ItineraryCardProps> = ({ activity, index }) => {
    const catInfo = CATEGORY_CONFIG[activity.category || 'other'] || CATEGORY_CONFIG.other;
    const IconComponent = catInfo.icon;

    return (
        <motion.div
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ x: 4 }}
        >
            {index > 0 && (
                <div className="absolute left-[19px] top-0 -mt-4 w-[2px] h-12 bg-gradient-to-b from-transparent via-slate-200 to-transparent" />
            )}

            <div className="flex gap-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${catInfo.gradient} flex items-center justify-center shrink-0 shadow-lg`}>
                    <IconComponent size={18} className="text-white" />
                </div>

                <div className="flex-1 bg-white rounded-2xl p-4 shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${catInfo.gradient} text-white`}>
                            {catInfo.label}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
                            <Clock size={12} />
                            {activity.time}
                        </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-800 mb-1">{activity.title}</h4>
                    <p className="text-[13px] text-slate-500 leading-relaxed mb-2">{activity.description}</p>
                    {activity.location && (
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                            <MapPin size={12} />
                            <span>{activity.location}</span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ItineraryCard;