import { Request, Response } from 'express';
import { ItineraryModel } from '../../database/models/itinerary.model.js';

/**
 * 1. CREATE: Manually add a new day to an itinerary.
 * (Note: The LangGraph AI does this automatically via the Service, 
 * but this is useful if a user wants to manually add "Day 6" to their trip).
 */
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
    console.error("Error saving itinerary:", error);
    res.status(500).json({ error: 'Failed to save itinerary day' });
  }
};

/**
 * 2. READ: Fetch the complete, chronological itinerary for a specific trip.
 */
export const getTripItinerary = async (req: Request, res: Response): Promise<void> => {
  try {
    const tripId = req.params.tripId as string;
    
    // Fetch all days belonging to this trip and sort them sequentially by dayNumber
    const itinerary = await ItineraryModel.find({ tripId }).sort({ dayNumber: 1 });
    
    res.status(200).json(itinerary);
  } catch (error) {
    console.error("Error fetching trip itinerary:", error);
    res.status(500).json({ error: 'Failed to fetch itinerary' });
  }
};

/**
 * 3. UPDATE: Edit a specific day's activities, date, or details.
 * Useful for dragging-and-dropping activities on the frontend.
 */
export const updateItineraryDay = async (req: Request, res: Response): Promise<void> => {
  try {
    // This ID is the Mongoose _id for the specific DAY, not the overall trip
    const itineraryDayId = req.params.id as string;
    const updates = req.body;

    const updatedItinerary = await ItineraryModel.findByIdAndUpdate(
      itineraryDayId, 
      updates, 
      { 
        new: true,           // Return the newly updated document
        runValidators: true  // Ensure Mongoose schema rules are enforced
      }
    );

    if (!updatedItinerary) {
      res.status(404).json({ error: 'Itinerary day not found' });
      return;
    }

    res.status(200).json(updatedItinerary);
  } catch (error) {
    console.error("Error updating itinerary:", error);
    res.status(500).json({ error: 'Failed to update itinerary day' });
  }
};

/**
 * 4. DELETE: Remove a specific day from the itinerary entirely.
 */
export const deleteItineraryDay = async (req: Request, res: Response): Promise<void> => {
  try {
    const itineraryDayId = req.params.id as string;

    const deletedItinerary = await ItineraryModel.findByIdAndDelete(itineraryDayId);

    if (!deletedItinerary) {
      res.status(404).json({ error: 'Itinerary day not found' });
      return;
    }

    res.status(200).json({ message: 'Itinerary day successfully deleted' });
  } catch (error) {
    console.error("Error deleting itinerary:", error);
    res.status(500).json({ error: 'Failed to delete itinerary day' });
  }
};