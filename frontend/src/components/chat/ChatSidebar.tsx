// components/chat/ChatSidebar.tsx
import React from 'react';
import { motion } from 'framer-motion';
import {
  Bot, Plus, Navigation, MapPin, Calendar, Users, DollarSign,
  MessageCircle, Target, CheckCircle2, Globe
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
    idle: { color: 'slate', text: 'Ready to plan', icon: MessageCircle },
    chatting: { color: 'blue', text: 'Gathering details', icon: MessageCircle },
    planning: { color: 'amber', text: 'AI Planning', icon: Target },
    complete: { color: 'emerald', text: 'Itinerary ready!', icon: CheckCircle2 },
  };

  const config = statusConfig[chatStatus];

  return (
    <aside className="w-[280px] lg:w-[320px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col z-10 shrink-0 hidden md:flex overflow-y-auto">
      {/* Header with brand */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg tracking-tight">BhramanAI</h2>
            <p className="text-white/40 text-xs">Your travel companion</p>
          </div>
        </div>

        <button
          className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-2xl text-white text-sm font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] group"
          onClick={onNewChat}
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          New Conversation
        </button>
      </div>

      {/* Trip Details Section */}
      <div className="flex-1 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 bg-gradient-to-b from-blue-400 to-violet-500 rounded-full" />
          <span className="text-white/50 text-[11px] font-bold uppercase tracking-wider">Trip Snapshot</span>
        </div>

        <div className="space-y-3">
          {getExtractedFields().map((field, i) => (
            <motion.div
              className="group relative overflow-hidden rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300"
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <div className="flex items-start gap-3 p-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-blue-400">
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
            className="mt-6 p-3 rounded-xl bg-gradient-to-r from-white/5 to-white/5 border border-white/10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={`flex items-center gap-2 text-${config.color}-400`}>
              <config.icon size={14} className={`${chatStatus === 'planning' ? 'animate-spin' : ''}`} />
              <span className="text-xs font-medium">{config.text}</span>
              {chatStatus === 'planning' && (
                <div className="flex gap-1 ml-auto">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse delay-150" />
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse delay-300" />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Footer decoration */}
      <div className="p-6 border-t border-white/10">
        <div className="flex items-center gap-2 text-white/20 text-[10px]">
          <Globe size={12} />
          <span>AI-powered travel planning</span>
        </div>
      </div>
    </aside>
  );
};

export default ChatSidebar;