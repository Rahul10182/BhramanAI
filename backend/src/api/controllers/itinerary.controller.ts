import { Request, Response } from 'express';
import { ItineraryModel } from '../../database/models/itinerary.model.js';

export const saveItinerary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tripId, dayNumber, date, activities } = req.body;
    
    const itinerary = new ItineraryModel({
      tripId,
      dayNumber,
      date,
      activities
    });

    await itinerary.save();
    res.status(201).json(itinerary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save itinerary' });
  }
};

export const getTripItinerary = async (req: Request, res: Response): Promise<void> => {
  try {
    // Add "as string" here
    const tripId = req.params.tripId as string;
    const itinerary = await ItineraryModel.find({ tripId }).sort({ dayNumber: 1 });
    
    res.status(200).json(itinerary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch itinerary' });
  }
};