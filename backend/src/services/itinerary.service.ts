import mongoose from 'mongoose';
import { ItineraryRepository } from '../database/repositories/itinerary.repository.js';
import { TripModel } from '../database/models/trip.model.js';

export class ItineraryService {
    public static async saveGeneratedItinerary(tripId: string, startDateStr: string, aiDays: any[]) {
        console.log(`\n💾 [Service: Itinerary] Formatting and saving ${aiDays.length} days to database...`);
        
        const baseDate = new Date(startDateStr);
        
        // 1. Map the LLM output to the Mongoose Schema
        const itinerariesToSave = aiDays.map((dayData: any) => {
            const dayDate = new Date(baseDate);
            dayDate.setDate(dayDate.getDate() + (dayData.dayNumber - 1));

            const activities = dayData.activities.map((act: any) => ({
                time: act.time,
                title: act.title,
                description: act.description,
                location: act.location || "Location not specified",
                category: act.category || "other",
                estimatedCost: act.estimatedCost || act.estimated_cost || 0,
                aiGenerated: true
            }));

            const dailyBudget = activities.reduce((sum: number, a: any) => sum + (a.estimatedCost || 0), 0);

            return {
                tripId: new mongoose.Types.ObjectId(tripId),
                dayNumber: dayData.dayNumber,
                date: dayDate,
                activities,
                weather: dayData.weather || null,
                dailyBudget
            };
        });

        // 2. Save to DB via Repository
        const savedItineraries = await ItineraryRepository.createBulk(itinerariesToSave);
        
        // 3. Update the Trip status to 'completed'
        try {
            await TripModel.findByIdAndUpdate(tripId, { status: 'completed' });
        } catch (tripUpdateError) {
            console.warn(`⚠️ [Service: Itinerary] Could not update trip status (Trip might not exist in test DB).`);
        }

        console.log(`✅ [Service: Itinerary] Successfully saved to MongoDB.`);
        return savedItineraries;
    }
}