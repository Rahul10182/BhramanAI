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

    // Find and update the trip, returning the newly updated document
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