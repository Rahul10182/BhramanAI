import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatSidebar from '../../components/chat/ChatSidebar';
import ChatWindow from '../../components/chat/ChatWindow';
import { chatApi, type TripContext, type ItineraryDay } from '../../apis/chatApi';
import type { ChatMessage } from '../../types/chat.types';

const MOCK_USER_ID = '507f1f77bcf86cd799439011';
const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 60; // 5 min max

const ChatBot: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();

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

  const chatContainerRef = useRef<HTMLDivElement>(null!);
  const inputRef = useRef<HTMLTextAreaElement>(null!);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);

  // Auto-scroll to latest message
  const scrollToBottom = useCallback(() => {
    chatContainerRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, itinerary, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!chatId) {
      navigate(`/chat/${crypto.randomUUID()}`, { replace: true });
    } else {
      // Clear state when navigating to a new chat
      setMessages([]);
      setInput('');
      setExtractedData({});
      setChatStatus('idle');
      setTripId(null);
      setError(null);
      setItinerary([]);
      setActiveDay(1);
      setPollMessage('');
      if (pollRef.current) clearInterval(pollRef.current);
    }
  }, [chatId, navigate]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

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
        const trip = await chatApi.getTripStatus(id);

        if (trip.status === 'completed') {
          clearInterval(pollRef.current!);
          pollRef.current = null;

          // Fetch the full itinerary
          const days = await chatApi.getItinerary(id);

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
    if (!text.trim() || isLoading || !chatId) return;

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
      const data = await chatApi.sendMessage(
        chatId,
        MOCK_USER_ID,
        buildMessagesPayload(updatedMessages)
      );

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
      setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 0);
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
    navigate(`/chat/${crypto.randomUUID()}`);
  };

  return (
    <div className="fixed inset-0 h-[100dvh] w-full z-50 bg-slate-50 flex font-sans overflow-hidden text-slate-800">
      <ChatSidebar
        onNewChat={handleNewChat}
        extractedData={extractedData}
        chatStatus={chatStatus}
      />
      <ChatWindow
        messages={messages}
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        chatStatus={chatStatus}
        tripId={tripId}
        error={error}
        itinerary={itinerary}
        activeDay={activeDay}
        setActiveDay={setActiveDay}
        pollMessage={pollMessage}
        chatContainerRef={chatContainerRef}
        inputRef={inputRef}
        handleSubmit={handleSubmit}
        handleKeyDown={handleKeyDown}
        sendMessage={sendMessage}
        extractedData={extractedData}
      />
    </div>
  );
};

export default ChatBot;
