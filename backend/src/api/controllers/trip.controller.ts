import { Request, Response } from 'express';
import { TripModel } from '../../database/models/trip.model.js';

export const createTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    // We now require the frontend to send the userId in the body
    const { userId, destination, startDate, endDate, budget, travelers, travelStyle } = req.body;
    
    const trip = new TripModel({
      userId, 
      destination,
      startDate,
      endDate,
      budget,
      travelers,
      travelStyle
    });

    await trip.save();
    res.status(201).json(trip);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create trip' });
  }
};

export const getUserTrips = async (req: Request, res: Response): Promise<void> => {
  try {
    // Add "as string" here
    const userId = req.params.userId as string;
    const trips = await TripModel.find({ userId }).sort({ createdAt: -1 });
    
    res.status(200).json(trips);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
};