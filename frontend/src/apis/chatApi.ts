const API_BASE = 'http://localhost:3000/api/v1';

export interface TripContext {
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

export interface ChatResponse {
  status: 'chatting' | 'planning_initiated';
  reply: string;
  extractedData?: TripContext;
  tripId?: string;
}

export interface ItineraryActivity {
  time: string;
  title: string;
  description: string;
  location?: string;
  category?: string;
  aiGenerated?: boolean;
}

export interface ItineraryDay {
  _id: string;
  tripId: string;
  dayNumber: number;
  date: string;
  activities: ItineraryActivity[];
}

export const chatApi = {
  sendMessage: async (chatId: string, userId: string, messages: { role: string; content: string }[]): Promise<ChatResponse> => {
    const response = await fetch(`${API_BASE}/chat/${chatId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, messages }),
    });
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    return response.json();
  },

  getTripStatus: async (tripId: string) => {
    const response = await fetch(`${API_BASE}/trips/${tripId}`);
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    return response.json();
  },

  getItinerary: async (tripId: string): Promise<ItineraryDay[]> => {
    const response = await fetch(`${API_BASE}/itineraries/${tripId}`);
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    return response.json();
  }
};
