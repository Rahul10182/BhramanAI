// components/chat/ChatMessage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { User, Compass } from 'lucide-react';
import type { ChatMessageProps } from '../../types/chat.types';

const ChatMessage: React.FC<ChatMessageProps> = ({ message, index }) => {
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    return (
        <motion.div
            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.05 }}
        >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-md ${message.role === 'user' ? 'bg-[#2D2D2D]' : 'bg-gradient-to-br from-[#4A5D4B] to-[#8BA889]'
                }`}>
                {message.role === 'user' ? <User size={14} className="text-white" /> : <Compass size={14} className="text-white" />}
            </div>
            <div className="flex flex-col gap-1 max-w-[80%]">
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${message.role === 'user'
                    ? 'bg-[#4A5D4B] text-white rounded-tr-sm'
                    : 'bg-white border border-[#D6C7B1]/30 text-[#2D2D2D] rounded-tl-sm shadow-sm'
                    }`}>
                    {message.content}
                </div>
                <span className={`text-[10px] text-[#2D2D2D]/30 px-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                    {formatTime(message.timestamp)}
                </span>
            </div>
        </motion.div>
    );
};

export default ChatMessage;