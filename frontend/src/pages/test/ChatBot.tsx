import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Bot, User, Sparkles, MapPin, Calendar, Users, DollarSign,
  Compass, Plane, AlertCircle, Plus, Loader2,
  Navigation, CheckCircle2, Clock, Hotel, Utensils, Camera, Mountain,
  Coffee, Wine, ShoppingBag, Car, TreePalm
} from 'lucide-react';
// ────────────────────────── Types ──────────────────────────

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TripContext {
  source?: string | null;
  destination?: string | null;
  destinations?: string[];
  start_date?: string | null;
  endDate?: string | null;
  travelerCount?: number | null;
  totalBudget?: number | null;
  baseCurrency?: string;
  preferences?: string[];
}

interface ChatResponse {
  status: 'chatting' | 'planning_initiated';
  reply: string;
  extractedData?: TripContext;
  tripId?: string;
}

interface ItineraryActivity {
  time: string;
  title: string;
  description: string;
  location?: string;
  category?: string;
  aiGenerated?: boolean;
}

interface ItineraryDay {
  _id: string;
  tripId: string;
  dayNumber: number;
  date: string;
  activities: ItineraryActivity[];
}

// ────────────────────────── Constants ──────────────────────────

const API_BASE = 'http://localhost:3000/api/v1';
const CHAT_URL = `${API_BASE}/chat`;
const MOCK_USER_ID = '507f1f77bcf86cd799439011';

const QUICK_PROMPTS = [
  { text: "Plan a trip to Goa", icon: Compass },
  { text: "5 days in Paris for 2", icon: Plane },
  { text: "Budget trip to Jaipur", icon: DollarSign },
  { text: "Weekend getaway to Manali", icon: MapPin },
];

const CATEGORY_CONFIG: Record<string, { icon: React.ElementType; color: string }> = {
  flight:     { icon: Plane,       color: '#60a5fa' },
  hotel:      { icon: Hotel,       color: '#a78bfa' },
  food:       { icon: Utensils,    color: '#fb923c' },
  attraction: { icon: Camera,      color: '#f472b6' },
  transport:  { icon: Car,         color: '#38bdf8' },
  leisure:    { icon: TreePalm,    color: '#34d399' },
  shopping:   { icon: ShoppingBag, color: '#fbbf24' },
  other:      { icon: Mountain,    color: '#94a3b8' },
};

const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 60; // 5 min max

// ────────────────────────── Component ──────────────────────────

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedData, setExtractedData] = useState<TripContext>({});
  const [chatStatus, setChatStatus] = useState<'idle' | 'chatting' | 'planning' | 'complete'>('idle');
  const [tripId, setTripId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Itinerary state
  const [itinerary, setItinerary] = useState<ItineraryDay[]>([]);
  const [activeDay, setActiveDay] = useState(1);
  const [pollMessage, setPollMessage] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);

  // Auto-scroll to latest message
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, itinerary, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // ──── Format timestamp ────
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatItineraryDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  // ──── Build the message history payload for the backend ────
  const buildMessagesPayload = (allMessages: ChatMessage[]) => {
    return allMessages.map((msg) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }));
  };

  // ──── Poll for trip completion & fetch itinerary ────
  const startPolling = useCallback((id: string) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollCountRef.current = 0;

    const pollStages = [
      '🔍 Researching flights & routes...',
      '🏨 Finding the best hotels...',
      '🎢 Discovering activities & attractions...',
      '🍱 Locating top restaurants...',
      '🚗 Calculating distances & travel times...',
      '📝 Building your day-by-day itinerary...',
      '✨ Almost there, finalizing your plan...',
    ];

    pollRef.current = setInterval(async () => {
      pollCountRef.current += 1;

      // Update the progress message
      const stageIndex = Math.min(
        Math.floor(pollCountRef.current / 3),
        pollStages.length - 1
      );
      setPollMessage(pollStages[stageIndex]);

      if (pollCountRef.current >= MAX_POLL_ATTEMPTS) {
        clearInterval(pollRef.current!);
        pollRef.current = null;
        setPollMessage('⏳ This is taking longer than usual. The trip may still be generating in the background.');
        return;
      }

      try {
        // Check trip status
        const tripRes = await fetch(`${API_BASE}/trips/${id}`);
        if (!tripRes.ok) return;

        const trip = await tripRes.json();

        if (trip.status === 'completed') {
          clearInterval(pollRef.current!);
          pollRef.current = null;

          // Fetch the full itinerary
          const itinRes = await fetch(`${API_BASE}/itineraries/${id}`);
          if (!itinRes.ok) throw new Error('Failed to fetch itinerary');

          const days: ItineraryDay[] = await itinRes.json();

          if (days.length > 0) {
            setItinerary(days);
            setActiveDay(1);
            setChatStatus('complete');
            setPollMessage('');

            // Add a completion message to chat
            setMessages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                role: 'assistant',
                content: `🎉 Your ${days.length}-day itinerary is ready! Scroll down to explore your personalized trip plan.`,
                timestamp: new Date(),
              },
            ]);
          }
        } else if (trip.status === 'failed') {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          setPollMessage('');
          setError('Trip generation failed. Please try again.');
          setChatStatus('idle');
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, POLL_INTERVAL_MS);
  }, []);

  // ──── Send message to the backend ────
  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setError(null);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: MOCK_USER_ID,
          messages: buildMessagesPayload(updatedMessages),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data: ChatResponse = await response.json();

      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      if (data.extractedData) {
        setExtractedData(data.extractedData);
      }

      if (data.status === 'chatting') {
        setChatStatus('chatting');
      } else if (data.status === 'planning_initiated') {
        setChatStatus('planning');
        if (data.tripId) {
          setTripId(data.tripId);
          // Start polling for completion
          startPolling(data.tripId);
        }
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      setError(err.message || 'Failed to connect to the server.');
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleNewChat = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setMessages([]);
    setInput('');
    setExtractedData({});
    setChatStatus('idle');
    setTripId(null);
    setError(null);
    setItinerary([]);
    setActiveDay(1);
    setPollMessage('');
    inputRef.current?.focus();
  };

  const getExtractedFields = () => [
    { label: 'From', value: extractedData.source, icon: Navigation },
    { label: 'Destination', value: extractedData.destination || extractedData.destinations?.join(', '), icon: MapPin },
    { label: 'Start Date', value: extractedData.start_date, icon: Calendar },
    { label: 'Travelers', value: extractedData.travelerCount, icon: Users },
    {
      label: 'Budget',
      value: extractedData.totalBudget
        ? `${extractedData.baseCurrency || '₹'}${extractedData.totalBudget.toLocaleString()}`
        : null,
      icon: DollarSign,
    },
  ];

  const getCategoryInfo = (category?: string) => {
    return CATEGORY_CONFIG[category || 'other'] || CATEGORY_CONFIG.other;
  };

  // ────────────────────────── Render ──────────────────────────

  return (
    <div className="h-[calc(100vh-80px)] bg-[#0a0f1a] flex font-sans relative overflow-hidden text-[#e8ebe8]">
      <style>{`
        @keyframes messageIn {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div className="absolute top-[-50%] left-[-30%] w-[80%] h-[80%] bg-[radial-gradient(circle,rgba(139,168,137,0.06)_0%,transparent_70%)] pointer-events-none animate-pulse" style={{ animationDuration: '20s' }} />
      <div className="absolute bottom-[-30%] right-[-20%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(107,144,104,0.04)_0%,transparent_70%)] pointer-events-none animate-pulse" style={{ animationDuration: '25s', animationDirection: 'reverse' }} />

      {/* ══════ Sidebar ══════ */}
      <aside className="w-[320px] bg-[#111827] border-r border-[#8BA889]/15 flex flex-col z-10 shrink-0 hidden md:flex">
        <div className="p-6 border-b border-[#8BA889]/15">
          <button className="w-full p-3 bg-gradient-to-br from-[#8BA889] to-[#4A5D4B] text-white border-none rounded-xl text-sm font-semibold cursor-pointer flex items-center justify-center gap-2 transition-all duration-300 shadow-[0_4px_15px_rgba(139,168,137,0.3)] hover:-translate-y-0.5 hover:shadow-[0_6px_25px_rgba(139,168,137,0.3)]" onClick={handleNewChat} id="new-chat-button">
            <Plus size={18} />
            New Conversation
          </button>
        </div>

        <div className="flex-1 p-5 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#8BA889]/20 [&::-webkit-scrollbar-thumb]:rounded-full">
          <div className="text-[11px] font-bold text-[#e8ebe8]/50 uppercase tracking-[1.5px] mb-4">Trip Details (Live)</div>
          <div className="flex flex-col gap-2.5">
            {getExtractedFields().map((field, i) => (
              <div className="flex items-center gap-3 py-3 px-3.5 bg-[#1a2332] rounded-xl border border-[#8BA889]/15 transition-all duration-300 hover:border-[#8BA889] hover:bg-[#8BA889]/5" key={i}>
                <div className="w-9 h-9 bg-[#8BA889]/10 rounded-lg flex items-center justify-center shrink-0 text-[#8BA889]">
                  <field.icon size={18} />
                </div>
                <div>
                  <div className="text-[11px] text-[#e8ebe8]/50 mb-0.5">{field.label}</div>
                  <div className={`text-[13px] font-semibold text-[#e8ebe8] ${!field.value ? 'text-[#e8ebe8]/50 font-normal italic' : ''}`}>
                    {field.value ?? 'Not yet shared'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {chatStatus !== 'idle' && (
            <div
              className={`inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full text-xs font-semibold mt-4 ${
                chatStatus === 'chatting' ? 'bg-[#8BA889]/10 text-[#8BA889] border border-[#8BA889]/20' :
                chatStatus === 'complete' ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' : 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                chatStatus === 'chatting' ? 'bg-[#8BA889]' :
                chatStatus === 'complete' ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
              {chatStatus === 'chatting' && 'Gathering details...'}
              {chatStatus === 'complete' && 'Itinerary ready!'}
              {chatStatus === 'planning' && 'AI Planning in progress...'}
            </div>
          )}
        </div>
      </aside>

      {/* ══════ Main Chat ══════ */}
      <main className="flex-1 flex flex-col z-10 min-w-0 bg-[#0a0f1a]">
        <div className="py-4 px-7 bg-[#111827]/70 backdrop-blur-xl border-b border-[#8BA889]/15 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#8BA889] to-[#4A5D4B] rounded-xl flex items-center justify-center text-white">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#e8ebe8] m-0">BhramanAI Assistant</h3>
              <p className="text-xs text-[#8BA889] m-0 flex items-center gap-1 mt-0.5">
                <span className="w-[7px] h-[7px] bg-emerald-400 rounded-full animate-pulse" />
                Online — Ready to plan your trip
              </p>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              className="flex items-center gap-2.5 py-3 px-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-[13px] mx-7 mt-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto p-4 md:p-7 flex flex-col gap-5 scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#8BA889]/20 [&::-webkit-scrollbar-thumb]:rounded-full" id="chat-messages">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 px-5 flex-1">
              <motion.div
                className="w-20 h-20 bg-gradient-to-br from-[#8BA889] to-[#4A5D4B] rounded-2xl flex items-center justify-center mb-6 shadow-[0_8px_40px_rgba(139,168,137,0.3)] animate-pulse"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Sparkles size={40} className="text-white" />
              </motion.div>
              <motion.h2
                className="font-serif text-2xl font-bold text-[#e8ebe8] m-0 mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                Where to next?
              </motion.h2>
              <motion.p
                className="text-sm text-[#e8ebe8]/50 max-w-[400px] leading-relaxed m-0 mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                Tell me about your dream trip — destination, dates, budget, and travel style.
                I'll handle the rest!
              </motion.p>
              <motion.div
                className="flex flex-wrap gap-2.5 justify-center max-w-[500px]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    className="py-2.5 px-4.5 bg-[#111827] border border-[#8BA889]/15 rounded-xl text-[#e8ebe8] text-[13px] cursor-pointer transition-all duration-300 flex items-center gap-1.5 hover:bg-[#8BA889]/10 hover:border-[#8BA889] hover:-translate-y-0.5 hover:shadow-lg"
                    onClick={() => sendMessage(prompt.text)}
                    id={`quick-prompt-${i}`}
                  >
                    <prompt.icon size={14} className="text-[#8BA889]" />
                    {prompt.text}
                  </button>
                ))}
              </motion.div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div className={`flex gap-3 max-w-[90%] md:max-w-[75%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`} style={{ animation: 'messageIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }} key={msg.id}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${msg.role === 'user' ? 'bg-gradient-to-br from-indigo-500 to-indigo-600' : 'bg-gradient-to-br from-[#8BA889] to-[#4A5D4B]'}`}>
                    {msg.role === 'user' ? <User size={18} className="text-white" /> : <Bot size={18} className="text-white" />}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className={`py-3.5 px-4.5 rounded-2xl text-sm leading-relaxed break-words ${msg.role === 'user' ? 'bg-gradient-to-br from-[#8BA889] to-[#6b9068] text-white rounded-br-sm' : 'bg-[#1a2332] text-[#e8ebe8] border border-[#8BA889]/15 rounded-bl-sm'}`}>{msg.content}</div>
                    <span className={`text-[11px] text-[#e8ebe8]/50 px-1 ${msg.role === 'user' ? 'text-right' : ''}`}>{formatTime(msg.timestamp)}</span>
                  </div>
                </div>
              ))}

              {/* Planning In-Progress Card */}
              {chatStatus === 'planning' && tripId && (
                <div className="flex gap-3 max-w-[90%] md:max-w-[75%] self-start" style={{ animation: 'messageIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-gradient-to-br from-[#8BA889] to-[#4A5D4B]">
                    <Bot size={18} className="text-white" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="bg-gradient-to-br from-[#8BA889]/10 to-[#4A5D4B]/10 border border-[#8BA889]/30 rounded-2xl p-6 mt-2">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-11 h-11 bg-gradient-to-br from-[#8BA889] to-[#4A5D4B] rounded-xl flex items-center justify-center">
                          <Plane size={22} className="text-white" />
                        </div>
                        <div>
                          <p className="text-base font-bold text-[#e8ebe8] m-0">Trip Planning Initiated!</p>
                          <p className="text-xs text-[#8BA889] m-0">
                            Our AI is building your perfect itinerary
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-[#e8ebe8]/50 bg-[#111827] py-2 px-3.5 rounded-lg font-mono tracking-wide">Trip ID: {tripId}</div>
                      <div className="flex items-center gap-2.5 mt-3">
                        <div className="w-[18px] h-[18px] border-2 border-[#8BA889]/15 border-t-[#8BA889] rounded-full animate-spin" />
                        <span className="text-[13px] text-[#8BA889] font-medium">{pollMessage || 'Starting AI planner...'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ══════ Itinerary Display ══════ */}
              {chatStatus === 'complete' && itinerary.length > 0 && (
                <motion.div
                  className="w-full max-w-full mt-2"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                  {/* Itinerary Header */}
                  <div className="flex items-center gap-3.5 py-5 px-6 bg-gradient-to-br from-emerald-400/10 to-[#8BA889]/10 border border-emerald-400/25 rounded-2xl mb-4">
                    <div className="w-[52px] h-[52px] bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shrink-0 shadow-[0_4px_20px_rgba(52,211,153,0.3)]">
                      <CheckCircle2 size={28} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-[#e8ebe8] m-0 mb-1">
                        Your {itinerary.length}-Day Itinerary
                      </h3>
                      <p className="text-[13px] text-[#e8ebe8]/50 m-0">
                        {extractedData.destination || extractedData.destinations?.join(', ') || 'Your Trip'} •{' '}
                        {extractedData.travelerCount || 1} traveler{(extractedData.travelerCount || 1) > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Day Tabs */}
                  <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
                    {itinerary.map((day) => (
                      <button
                        key={day.dayNumber}
                        className={`flex flex-col items-center gap-0.5 py-2.5 px-4.5 rounded-xl cursor-pointer transition-all duration-300 whitespace-nowrap shrink-0 border ${activeDay === day.dayNumber ? 'bg-gradient-to-br from-[#8BA889] to-[#4A5D4B] border-[#8BA889] shadow-[0_4px_15px_rgba(139,168,137,0.3)]' : 'bg-[#111827] border-[#8BA889]/15 hover:border-[#8BA889] hover:bg-[#8BA889]/5'}`}
                        onClick={() => setActiveDay(day.dayNumber)}
                      >
                        <span className={`text-[13px] font-bold ${activeDay === day.dayNumber ? 'text-white' : 'text-[#e8ebe8]'}`}>Day {day.dayNumber}</span>
                        <span className={`text-[10px] ${activeDay === day.dayNumber ? 'text-white/75' : 'text-[#e8ebe8]/50'}`}>{formatItineraryDate(day.date)}</span>
                      </button>
                    ))}
                  </div>

                  {/* Active Day Activities */}
                  {itinerary
                    .filter((day) => day.dayNumber === activeDay)
                    .map((day) => (
                      <div className="py-1" key={day._id}>
                        <div className="flex flex-col gap-0">
                          {day.activities.map((activity, idx) => {
                            const catInfo = getCategoryInfo(activity.category);
                            const IconComponent = catInfo.icon;

                            return (
                              <motion.div
                                className="flex gap-4 min-h-[90px]"
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.08 }}
                              >
                                <div className="flex flex-col items-center w-8 shrink-0">
                                  <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 z-10 shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
                                    style={{ background: catInfo.color }}
                                  >
                                    <IconComponent size={14} color="#fff" />
                                  </div>
                                  {idx < day.activities.length - 1 && (
                                    <div className="w-[2px] flex-1 bg-[#8BA889]/15 my-1" />
                                  )}
                                </div>

                                <div className="flex-1 bg-[#111827] border border-[#8BA889]/15 rounded-xl py-3.5 px-4.5 mb-3 transition-all duration-300 hover:border-[#8BA889]/30 hover:bg-[#1a2332] hover:translate-x-1">
                                  <div className="flex items-center justify-between mb-2">
                                    <span
                                      className="text-[11px] font-bold uppercase tracking-wide py-1 px-2.5 rounded-md"
                                      style={{
                                        background: `${catInfo.color}18`,
                                        color: catInfo.color,
                                      }}
                                    >
                                      {activity.category || 'other'}
                                    </span>
                                    <span className="text-xs text-[#e8ebe8]/50 flex items-center gap-1">
                                      <Clock size={12} />
                                      {activity.time}
                                    </span>
                                  </div>
                                  <h4 className="text-[15px] font-bold text-[#e8ebe8] m-0 mb-1.5">{activity.title}</h4>
                                  <p className="text-[13px] text-[#e8ebe8]/50 leading-relaxed m-0 mb-2">{activity.description}</p>
                                  {activity.location && (
                                    <div className="text-xs text-[#8BA889] flex items-center gap-1">
                                      <MapPin size={12} />
                                      {activity.location}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                </motion.div>
              )}
            </>
          )}

          {isLoading && (
            <div className="flex items-center gap-3 py-2">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-gradient-to-br from-[#8BA889] to-[#4A5D4B]">
                <Bot size={18} className="text-white" />
              </div>
              <div className="flex gap-1.5 py-3.5 px-4.5 bg-[#1a2332] border border-[#8BA889]/15 rounded-2xl rounded-bl-sm">
                <div className="w-2 h-2 bg-[#8BA889] rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-[#8BA889] rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-[#8BA889] rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="py-5 px-4 md:px-7 pb-6 bg-[#111827]/70 backdrop-blur-xl border-t border-[#8BA889]/15">
          <form className="flex items-end gap-3 max-w-[900px] mx-auto" onSubmit={handleSubmit}>
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                className="w-full py-3.5 pl-5 pr-[52px] bg-[#111827] border border-[#8BA889]/15 rounded-2xl text-[#e8ebe8] text-sm font-sans outline-none resize-none min-h-[48px] max-h-[120px] leading-relaxed transition-all duration-300 box-border placeholder:text-[#e8ebe8]/50 focus:border-[#8BA889] focus:ring-1 focus:ring-[#8BA889]/30"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  chatStatus === 'planning'
                    ? 'Your trip is being planned...'
                    : chatStatus === 'complete'
                    ? 'Itinerary ready! Start a new conversation to plan another trip.'
                    : 'Tell me about your dream trip...'
                }
                disabled={isLoading || chatStatus === 'planning' || chatStatus === 'complete'}
                rows={1}
                id="chat-input"
              />
            </div>
            <button
              type="submit"
              className="w-12 h-12 bg-gradient-to-br from-[#8BA889] to-[#4A5D4B] border-none rounded-xl text-white cursor-pointer flex items-center justify-center transition-all duration-300 shrink-0 shadow-[0_4px_15px_rgba(139,168,137,0.3)] hover:not(:disabled):-translate-y-0.5 hover:not(:disabled):scale-105 hover:not(:disabled):shadow-[0_6px_25px_rgba(139,168,137,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!input.trim() || isLoading || chatStatus === 'planning' || chatStatus === 'complete'}
              id="send-button"
            >
              {isLoading ? <Loader2 className="animate-spin text-white w-5 h-5" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
          <div className="text-[11px] text-[#e8ebe8]/50 text-center mt-2">
            Press <kbd className="py-0.5 px-1.5 bg-[#111827] border border-[#8BA889]/15 rounded font-sans text-[10px] text-[#e8ebe8]">Enter</kbd> to send · <kbd className="py-0.5 px-1.5 bg-[#111827] border border-[#8BA889]/15 rounded font-sans text-[10px] text-[#e8ebe8]">Shift + Enter</kbd> for new line
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatBot;
