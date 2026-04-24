import { Request, Response } from 'express';
import { TripModel } from '../../database/models/trip.model.js';
import { ItineraryModel } from '../../database/models/itinerary.model.js'; 
import { TripService } from '../../services/trip.service.js';

export const planTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, destination, source, start_date, endDate, budget, travelers, travelStyle, baseCurrency } = req.body;
    
    // 1. Create the Trip in "planning" status
    const trip = new TripModel({
      userId, 
      destination,
      start_date,
      endDate,
      budget,
      travelers,
      travelStyle,
      status: 'planning' // Explicitly setting status
    });

    await trip.save();

    // 2. Fire and Forget the AI Generation
    // Notice we do NOT use 'await' here. This allows the function to keep running in the background.
    TripService.generateAITrip(trip._id.toString(), {
      destination, source, start_date, endDate, budget, travelers, travelStyle, baseCurrency
    });

    // 3. Immediately return the ID to the client
    res.status(202).json({ 
        message: "AI is planning your trip. This may take up to 60 seconds.",
        tripId: trip._id,
        status: "planning"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to initiate trip planning' });
  }
};

export const getTripById = async (req: Request, res: Response): Promise<void> => {
    try {
      const tripId = req.params.tripId as string;
      const trip = await TripModel.findById(tripId);
      
      if (!trip) {
          res.status(404).json({ error: 'Trip not found' });
          return;
      }

      res.status(200).json(trip);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch trip status' });
    }
};

export const getUserTrips = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId as string;
    const trips = await TripModel.find({ userId }).sort({ createdAt: -1 });
    
    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
};

export const updateTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    const tripId = req.params.tripId as string;
    const updates = req.body;

    const updatedTrip = await TripModel.findByIdAndUpdate(tripId, updates, { 
        new: true, 
        runValidators: true 
    });

    if (!updatedTrip) {
      res.status(404).json({ error: 'Trip not found' });
      return;
    }

    res.status(200).json(updatedTrip);
  } catch (error) {
    console.error("Error updating trip:", error);
    res.status(500).json({ error: 'Failed to update trip' });
  }
};

/**
 * Regenerate: Update trip details + delete old itinerary + re-run AI pipeline
 */
export const regenerateTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    const tripId = req.params.tripId as string;
    const updates = req.body;

    // 1. Find the existing trip
    const existingTrip = await TripModel.findById(tripId);
    if (!existingTrip) {
      res.status(404).json({ error: 'Trip not found' });
      return;
    }

    // 2. Apply updates to trip
    Object.assign(existingTrip, updates, { status: 'planning' });
    await existingTrip.save();

    // 3. Delete old itinerary
    await ItineraryModel.deleteMany({ tripId });
    console.log(`🗑️ [Regenerate] Deleted old itinerary for trip ${tripId}`);

    // 4. Fire & forget AI regeneration
    const tripData = {
      source: existingTrip.source || 'Unknown',
      destination: existingTrip.destination,
      start_date: existingTrip.start_date.toISOString(),
      endDate: existingTrip.endDate.toISOString(),
      budget: existingTrip.budget,
      travelers: existingTrip.travelers,
      travelStyle: existingTrip.travelStyle,
    };
    TripService.generateAITrip(tripId, tripData);

    // 5. Return immediately — frontend polls for completion
    res.status(202).json({
      message: 'Trip updated and itinerary regeneration started',
      trip: existingTrip,
    });
  } catch (error) {
    console.error("Error regenerating trip:", error);
    res.status(500).json({ error: 'Failed to regenerate trip' });
  }
};

export const deleteTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    const tripId = req.params.tripId as string;

    // 1. Delete the main trip document
    const deletedTrip = await TripModel.findByIdAndDelete(tripId);

    if (!deletedTrip) {
      res.status(404).json({ error: 'Trip not found' });
      return;
    }

    // 2. CASCADING DELETE: Remove all itinerary days associated with this trip
    await ItineraryModel.deleteMany({ tripId: tripId });

    res.status(200).json({ message: 'Trip and associated itinerary successfully deleted' });
  } catch (error) {
    console.error("Error deleting trip:", error);
    res.status(500).json({ error: 'Failed to delete trip' });
  }
};