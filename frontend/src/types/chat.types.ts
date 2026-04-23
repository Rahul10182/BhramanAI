// types/chat.types.ts
import type { TripContext, ItineraryDay } from '../apis/chatApi';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export interface ChatWindowProps {
    messages: ChatMessage[];
    input: string;
    setInput: React.Dispatch<React.SetStateAction<string>>;
    isLoading: boolean;
    chatStatus: 'idle' | 'chatting' | 'planning' | 'complete';
    tripId: string | null;
    error: string | null;
    itinerary: ItineraryDay[];
    activeDay: number;
    setActiveDay: React.Dispatch<React.SetStateAction<number>>;
    pollMessage: string;
    chatContainerRef: React.RefObject<HTMLDivElement>;
    inputRef: React.RefObject<HTMLTextAreaElement>;
    handleSubmit: (e: React.FormEvent) => void;
    handleKeyDown: (e: React.KeyboardEvent) => void;
    sendMessage: (text: string) => void;
    extractedData: TripContext;
}

export interface ChatSidebarProps {
    onNewChat: () => void;
    extractedData: TripContext;
    chatStatus: 'idle' | 'chatting' | 'planning' | 'complete';
}

export interface ChatMessageProps {
    message: ChatMessage;
    index: number;
}

export interface ChatInputProps {
    input: string;
    setInput: React.Dispatch<React.SetStateAction<string>>;
    isLoading: boolean;
    chatStatus: 'idle' | 'chatting' | 'planning' | 'complete';
    handleSubmit: (e: React.FormEvent) => void;
    handleKeyDown: (e: React.KeyboardEvent) => void;
    inputRef: React.RefObject<HTMLTextAreaElement>;
    disabled?: boolean;
    placeholder?: string;
}