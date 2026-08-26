import { google } from 'googleapis';
import { UserModel } from '../database/models/user.model.js';
import { ItineraryModel } from '../database/models/itinerary.model.js';

export class GoogleCalendarService {
  public static async createTripEvents(userId: string, tripId: string) {
    const user = await UserModel.findById(userId).select('+googleAccessToken +googleRefreshToken');
    
    if (!user || !user.googleAccessToken) {
      throw new Error('User not found or not connected to Google Calendar');
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback'
    );

    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken || null
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Get the itinerary days
    const itineraryDays = await ItineraryModel.find({ tripId }).sort({ dayNumber: 1 });
    if (!itineraryDays || itineraryDays.length === 0) {
      throw new Error('Itinerary not found for this trip');
    }

    const createdEventIds: string[] = [];

    for (const day of itineraryDays) {
      // Create a description listing all activities
      const descriptionLines = day.activities.map(act => 
        `🕒 ${act.time} - ${act.title}\n📍 ${act.location || 'N/A'}\n📝 ${act.description}\n`
      );

      const event = {
        summary: `Day ${day.dayNumber} — BhramanAI Trip`,
        description: descriptionLines.join('\n'),
        start: {
          date: day.date.toISOString().split('T')[0], // all-day event
        },
        end: {
          date: new Date(day.date.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
      };

      try {
        const response = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: event as any,
        });

        if (response.data?.id) {
          createdEventIds.push(response.data.id);
        }
      } catch (error: any) {
        console.error(`❌ Failed to create calendar event for day ${day.dayNumber}:`, error.message);
      }
    }

    return createdEventIds;
  }
}
