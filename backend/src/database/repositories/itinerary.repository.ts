import { ItineraryModel, IItinerary } from '../models/itinerary.model.js';
import mongoose from 'mongoose';

export class ItineraryRepository {
    /**
     * Bulk inserts an array of itinerary days into the database.
     */
    public static async createBulk(itineraryDays: Partial<IItinerary>[]) {
        try {
            return await ItineraryModel.insertMany(itineraryDays);
        } catch (error: any) {
            throw new Error(`Failed to save itineraries to DB: ${error.message}`);
        }
    }
}