import { TripModel } from '../models/trip.model.js';

export class TripRepository {
    /**
     * Finds a trip by ID
     */
    public static async findById(tripId: string) {
        return await TripModel.findById(tripId);
    }

    /**
     * Updates the trip status and any other fields (like cost or itinerary)
     */
    public static async updateTrip(tripId: string, updateData: any) {
        return await TripModel.findByIdAndUpdate(
            tripId, 
            { $set: updateData }, 
            { new: true }
        );
    }

    /**
     * Specifically mark a trip as failed
     */
    public static async markAsFailed(tripId: string) {
        return await TripModel.findByIdAndUpdate(tripId, { status: 'failed' });
    }

    /**
     * Specifically mark a trip as completed
     */
    public static async markAsCompleted(tripId: string) {
        return await TripModel.findByIdAndUpdate(tripId, { status: 'completed' });
    }
}