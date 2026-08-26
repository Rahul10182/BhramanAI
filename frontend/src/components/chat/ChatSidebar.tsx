// components/chat/ChatSidebar.tsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Navigation, MapPin, Calendar, Users, DollarSign,
  MessageCircle, Target, CheckCircle2, Compass
} from 'lucide-react';
import type { ChatSidebarProps } from '../../types/chat.types';

const ChatSidebar: React.FC<ChatSidebarProps> = ({ onNewChat, extractedData, chatStatus }) => {
  const getExtractedFields = () => [
    { label: 'From', value: extractedData.source, icon: Navigation, placeholder: 'Anywhere' },
    { label: 'Destination', value: extractedData.destination || extractedData.destinations?.join(', '), icon: MapPin, placeholder: 'Not set' },
    { label: 'Start Date', value: extractedData.start_date, icon: Calendar, placeholder: 'Pick a date' },
    { label: 'Travelers', value: extractedData.travelerCount, icon: Users, placeholder: '1' },
    {
      label: 'Budget',
      value: extractedData.totalBudget ? `${extractedData.baseCurrency || '₹'}${extractedData.totalBudget.toLocaleString()}` : null,
      icon: DollarSign,
      placeholder: 'Flexible',
    },
  ];

  const statusConfig = {
    idle: { color: '#8BA889', text: 'Ready to plan', icon: MessageCircle },
    chatting: { color: '#8BA889', text: 'Gathering details', icon: MessageCircle },
    planning: { color: '#D6C7B1', text: 'AI Planning', icon: Target },
    complete: { color: '#4A5D4B', text: 'Itinerary ready!', icon: CheckCircle2 },
  };

  const config = statusConfig[chatStatus];

  return (
    <aside className="w-[280px] lg:w-[320px] bg-gradient-to-br from-[#2D2D2D] via-[#3a3a3a] to-[#2D2D2D] flex flex-col z-10 shrink-0 hidden md:flex overflow-y-auto">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <button
          className="w-full py-3 px-4 bg-[#8BA889]/20 hover:bg-[#8BA889]/30 backdrop-blur-sm border border-[#8BA889]/30 rounded-2xl text-white text-sm font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] group"
          onClick={onNewChat}
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          New Conversation
        </button>
      </div>

      {/* Trip Details Section */}
      <div className="flex-1 p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 bg-gradient-to-b from-[#8BA889] to-[#D6C7B1] rounded-full" />
          <span className="text-white/50 text-[11px] font-bold uppercase tracking-wider">Trip Snapshot</span>
        </div>

        <div className="space-y-3">
          {getExtractedFields().map((field, i) => (
            <motion.div
              className="group relative overflow-hidden rounded-xl bg-white/5 border border-white/10 hover:border-[#8BA889]/30 transition-all duration-300"
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#8BA889]/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <div className="flex items-start gap-3 p-3">
                <div className="w-8 h-8 rounded-lg bg-[#8BA889]/15 flex items-center justify-center shrink-0 text-[#8BA889]">
                  <field.icon size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-medium text-white/40 mb-0.5 uppercase tracking-wider">{field.label}</div>
                  <div className={`text-sm font-medium text-white truncate ${!field.value ? 'text-white/30 italic' : ''}`}>
                    {field.value ?? field.placeholder}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Status indicator */}
        {chatStatus !== 'idle' && (
          <motion.div
            className="mt-6 p-3 rounded-xl bg-[#8BA889]/10 border border-[#8BA889]/20"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 text-[#8BA889]">
              <config.icon size={14} className={`${chatStatus === 'planning' ? 'animate-spin' : ''}`} />
              <span className="text-xs font-medium">{config.text}</span>
              {chatStatus === 'planning' && (
                <div className="flex gap-1 ml-auto">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D6C7B1] animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D6C7B1] animate-pulse delay-150" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D6C7B1] animate-pulse delay-300" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="p-5 border-t border-white/10">
        <div className="flex items-center gap-2 text-white/20 text-[10px]">
          <Compass size={12} />
          <span>AI-powered travel planning</span>
        </div>
      </div>
    </aside>
  );
};

export default ChatSidebar;