// frontend/src/apis/tripApi.ts

const API_BASE = 'http://localhost:3000/api/v1';

export interface TripDetail {
  _id: string;
  userId: string;
  chatId?: string;
  source?: string;
  destination: string;
  start_date: string;
  endDate: string;
  budget: number;
  travelers: number;
  travelStyle: string;
  status: 'planning' | 'booked' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface ActivityDetail {
  time: string;
  title: string;
  description: string;
  location: string;
  category: string;
  estimatedCost: number;
  aiGenerated: boolean;
}

export interface WeatherDetail {
  condition: string;
  tempHigh: number;
  tempLow: number;
  icon: string;
}

export interface ItineraryDayDetail {
  _id: string;
  tripId: string;
  dayNumber: number;
  date: string;
  activities: ActivityDetail[];
  weather?: WeatherDetail;
  dailyBudget: number;
}

export interface AlternativesResponse {
  currentActivity: ActivityDetail;
  alternatives: (ActivityDetail & { name?: string; price?: number; duration?: string })[];
  dayId: string;
  activityIndex: number;
}

export const tripApi = {
  getTripById: async (tripId: string): Promise<TripDetail> => {
    const response = await fetch(`${API_BASE}/trips/${tripId}`);
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return response.json();
  },

  getUserTrips: async (userId: string): Promise<TripDetail[]> => {
    const response = await fetch(`${API_BASE}/trips/user/${userId}`);
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return response.json();
  },

  getItinerary: async (tripId: string): Promise<ItineraryDayDetail[]> => {
    const response = await fetch(`${API_BASE}/itineraries/${tripId}`);
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return response.json();
  },

  replaceActivity: async (
    dayId: string,
    activityIndex: number,
    activity: Partial<ActivityDetail>
  ): Promise<ItineraryDayDetail> => {
    const response = await fetch(`${API_BASE}/itineraries/${dayId}/activities/${activityIndex}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity),
    });
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return response.json();
  },

  getAlternatives: async (
    dayId: string,
    activityIndex: number
  ): Promise<AlternativesResponse> => {
    const response = await fetch(`${API_BASE}/itineraries/${dayId}/alternatives/${activityIndex}`);
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return response.json();
  },

  updateItineraryDay: async (
    dayId: string,
    updates: Partial<ItineraryDayDetail>
  ): Promise<ItineraryDayDetail> => {
    const response = await fetch(`${API_BASE}/itineraries/${dayId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return response.json();
  },

  deleteActivity: async (
    dayId: string,
    activityIndex: number,
    currentActivities: ActivityDetail[]
  ): Promise<ItineraryDayDetail> => {
    const updated = currentActivities.filter((_, i) => i !== activityIndex);
    const response = await fetch(`${API_BASE}/itineraries/${dayId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        activities: updated,
        dailyBudget: updated.reduce((sum, a) => sum + (a.estimatedCost || 0), 0),
      }),
    });
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return response.json();
  },
};
