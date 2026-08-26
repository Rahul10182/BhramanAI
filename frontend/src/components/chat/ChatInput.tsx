// components/chat/ChatInput.tsx
import React from 'react';
import { Send, Loader2 } from 'lucide-react';
import type { ChatInputProps } from '../../types/chat.types';

const ChatInput: React.FC<ChatInputProps> = ({
    input,
    setInput,
    isLoading,
    chatStatus,
    handleSubmit,
    handleKeyDown,
    inputRef,
    disabled,
    placeholder
}) => {
    const isDisabled = disabled || isLoading || chatStatus === 'planning' || chatStatus === 'complete';

    const defaultPlaceholder = chatStatus === 'planning'
        ? 'Planning in progress...'
        : chatStatus === 'complete'
            ? 'Start a new chat to plan another trip'
            : 'Describe your travel plans...';

    return (
        <div className="shrink-0 p-4 bg-white/80 backdrop-blur-xl border-t border-[#D6C7B1]/30">
            <div className="max-w-3xl mx-auto">
                <form onSubmit={handleSubmit} className="relative">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder || defaultPlaceholder}
                        disabled={isDisabled}
                        rows={1}
                        className="w-full resize-none rounded-2xl border border-[#D6C7B1]/40 bg-white px-5 py-3.5 pr-14 text-[#2D2D2D] placeholder:text-[#2D2D2D]/35 focus:border-[#8BA889] focus:outline-none focus:ring-2 focus:ring-[#8BA889]/20 text-sm transition-all"
                        style={{ minHeight: '52px', maxHeight: '140px' }}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isDisabled}
                        className="absolute right-2 bottom-1.5 w-10 h-10 rounded-xl bg-gradient-to-r from-[#4A5D4B] to-[#8BA889] text-white flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md"
                    >
                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </form>
                <p className="text-center text-[10px] text-[#2D2D2D]/30 mt-2">
                    Press <kbd className="px-1.5 py-0.5 bg-[#FDFCFB] border border-[#D6C7B1]/30 rounded text-[9px] font-mono">Enter</kbd> to send ·
                    <kbd className="px-1.5 py-0.5 bg-[#FDFCFB] border border-[#D6C7B1]/30 rounded text-[9px] font-mono ml-0.5">Shift + Enter</kbd> for new line
                </p>
            </div>
        </div>
    );
};

export default ChatInput;