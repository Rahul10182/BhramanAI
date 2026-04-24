import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, Sparkles, Compass, ArrowRight, AlertCircle,
  Sun, Loader2, CheckCircle2, TrendingUp
} from 'lucide-react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import ItineraryCard from './ItineraryCard';
import type { ChatWindowProps } from '../../types/chat.types';
import { QUICK_PROMPTS } from './constants';

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages, input, setInput, isLoading, chatStatus, error, itinerary, activeDay,
  setActiveDay, pollMessage, chatContainerRef, inputRef, handleSubmit, 
  handleKeyDown, sendMessage, extractedData, tripId
}) => {
  const navigate = useNavigate();
  
  const formatItineraryDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <main className="flex-1 flex flex-col relative bg-gradient-to-br from-slate-50 via-white to-slate-50">
      
      {/* Header */}
      <div className="shrink-0 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-20">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                BhramanAI Planner
              </h1>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online · Ready to assist
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div 
            className="absolute top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 rounded-full text-white text-sm shadow-lg shadow-red-500/30"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
          >
            <AlertCircle size={16} />
            <span className="font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 scroll-smooth">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <motion.div 
              className="flex flex-col items-center justify-center py-16 px-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div 
                className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mb-8 shadow-xl shadow-blue-500/30"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <Compass size={44} className="text-white" />
              </motion.div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
                Where to next?
              </h2>
              <p className="text-slate-500 max-w-md mb-10">
                Tell me about your dream destination, preferred dates, and travel style. Let's build the perfect itinerary together.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {QUICK_PROMPTS.map((prompt, i) => (
                  <motion.button
                    key={i}
                    className="group relative overflow-hidden py-3 px-4 bg-white rounded-xl border border-slate-200 text-slate-700 text-sm font-medium cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                    whileHover={{ x: 4 }}
                    onClick={() => sendMessage(prompt.text)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${prompt.gradient} flex items-center justify-center text-white`}>
                        <prompt.icon size={14} />
                      </div>
                      <span className="flex-1 text-left">{prompt.text}</span>
                      <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <ChatMessage key={msg.id} message={msg} index={idx} />
              ))}

              {/* Planning Animation */}
              {chatStatus === 'planning' && tripId && (
                <motion.div
                  className="flex gap-3"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-md">
                    <Bot size={14} className="text-white" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-5 shadow-sm max-w-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                        <TrendingUp size={20} className="text-amber-500" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">Crafting your journey</p>
                        <p className="text-xs text-slate-400">AI is working its magic</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5">
                      <Loader2 size={16} className="text-blue-500 animate-spin" />
                      <span className="text-xs font-medium text-slate-600">{pollMessage || 'Analyzing preferences...'}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Itinerary Display */}
              {chatStatus === 'complete' && itinerary.length > 0 && (
                <motion.div
                  className="mt-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* Itinerary Header */}
                  <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-5 text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                        <CheckCircle2 size={24} className="text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">Your {itinerary.length}-Day Adventure</h3>
                        <p className="text-white/60 text-sm">
                          {extractedData.destination || 'Your Trip'} • {extractedData.travelerCount || 1} traveler(s)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Day Picker */}
                  <div className="flex gap-2 overflow-x-auto px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    {itinerary.map((day) => (
                      <button
                         type="button"
                        key={day.dayNumber}
                        onClick={() => setActiveDay(day.dayNumber)}
                        className={`flex flex-col items-center min-w-[70px] px-3 py-2 rounded-xl transition-all duration-200 ${
                          activeDay === day.dayNumber
                            ? 'bg-slate-800 text-white shadow-md'
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        <span className="text-xs font-bold">Day {day.dayNumber}</span>
                        <span className="text-[10px] opacity-70">{formatItineraryDate(day.date)}</span>
                      </button>
                    ))}
                  </div>

                  {/* Activities List */}
                  <div className="p-6 space-y-5">
                    {itinerary
                      .filter((day) => day.dayNumber === activeDay)
                      .map((day) => (
                        <div key={day._id} className="space-y-4">
                          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                            <Sun size={14} />
                            <span>{formatItineraryDate(day.date)}</span>
                          </div>
                          {day.activities.map((activity, idx) => (
                            <ItineraryCard key={idx} activity={activity} index={idx} />
                          ))}
                        </div>
                      ))}
                  </div>

                  {/* View Full Trip CTA */}
                  {tripId && (
                    <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                      <button
                        onClick={() => navigate(`/trip/${tripId}`)}
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-violet-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                      >
                        View Your Trip →
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </>
          )}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-md">
                <Bot size={14} className="text-white" />
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-5 py-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-150" />
                  <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce delay-300" />
                </div>
              </div>
            </div>
          )}
          <div ref={chatContainerRef} />
        </div>
      </div>

      {/* Input Area */}
      <ChatInput
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        chatStatus={chatStatus}
        handleSubmit={handleSubmit}
        handleKeyDown={handleKeyDown}
        inputRef={inputRef}
      />
    </main>
  );
};

export default ChatWindow;
