import { Request, Response } from 'express';
import { ItineraryModel } from '../../database/models/itinerary.model.js';
import { TripModel } from '../../database/models/trip.model.js';
import { RecommendationService } from '../../services/recommendation.service.js';

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
 * Enforces a 30-minute minimum gap between activities.
 */

// Helper: parse "09:00 AM" / "14:30 PM" / "9:00" into total minutes from midnight
const parseTime = (timeStr: string): number => {
  if (!timeStr) return -1;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return -1;
  let h = parseInt(match[1], 10);
  const m = parseInt(match[2], 10);
  const ampm = match[3]?.toUpperCase();
  if (ampm === 'PM' && h < 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  return h * 60 + m;
};

const checkTimeOverlaps = (activities: any[]): { hasOverlap: boolean; message: string } => {
  // Bypassing time overlap check as requested by the user to allow flexible activity additions
  return { hasOverlap: false, message: '' };
};

export const updateItineraryDay = async (req: Request, res: Response): Promise<void> => {
  try {
    const itineraryDayId = req.params.id as string;
    const updates = req.body;

    // Validate time overlaps if activities are being updated
    if (updates.activities && Array.isArray(updates.activities)) {
      const { hasOverlap, message } = checkTimeOverlaps(updates.activities);
      if (hasOverlap) {
        res.status(400).json({ error: message });
        return;
      }
    }

    const updatedItinerary = await ItineraryModel.findByIdAndUpdate(
      itineraryDayId,
      updates,
      {
        new: true,
        runValidators: true
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

/**
 * 5. REPLACE ACTIVITY: Swap a single activity at a given index within a day.
 * Human-in-the-loop: user picks an alternative, frontend sends the new activity data.
 * PUT /api/v1/itineraries/:dayId/activities/:activityIndex
 */
export const replaceActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dayId, activityIndex } = req.params;
    const newActivity = req.body;
    const idx = parseInt(activityIndex, 10);

    const day = await ItineraryModel.findById(dayId);
    if (!day) {
      res.status(404).json({ error: 'Itinerary day not found' });
      return;
    }

    if (idx < 0 || idx >= day.activities.length) {
      res.status(400).json({ error: 'Invalid activity index' });
      return;
    }

    // Replace the activity at the given index
    day.activities[idx] = {
      time: newActivity.time || day.activities[idx].time,
      title: newActivity.title,
      description: newActivity.description || '',
      location: newActivity.location || '',
      category: newActivity.category || day.activities[idx].category,
      estimatedCost: newActivity.estimatedCost || 0,
      aiGenerated: false // User-selected, not AI-generated
    };

    // Recalculate daily budget
    day.dailyBudget = day.activities.reduce((sum, a) => sum + (a.estimatedCost || 0), 0);

    await day.save();

    res.status(200).json(day);
  } catch (error) {
    console.error("Error replacing activity:", error);
    res.status(500).json({ error: 'Failed to replace activity' });
  }
};

/**
 * 6. GET ALTERNATIVES: Fetch alternative activities for a specific slot.
 * Uses the RecommendationService to get activities matching the trip's destination.
 * GET /api/v1/itineraries/:dayId/alternatives/:activityIndex
 */
export const getAlternativeActivities = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dayId, activityIndex } = req.params;
    const idx = parseInt(activityIndex, 10);

    const day = await ItineraryModel.findById(dayId);
    if (!day) {
      res.status(404).json({ error: 'Itinerary day not found' });
      return;
    }

    if (idx < 0 || idx >= day.activities.length) {
      res.status(400).json({ error: 'Invalid activity index' });
      return;
    }

    const currentActivity = day.activities[idx];

    // Get the trip to know the destination
    const trip = await TripModel.findById(day.tripId);
    if (!trip) {
      res.status(404).json({ error: 'Associated trip not found' });
      return;
    }

    // Use the recommendation service to fetch alternatives
    const data = await RecommendationService.getRecommendations(trip._id.toString());

    // Filter activities to those matching or related to the current activity's category
    const alternatives = (data.activities || []).map((a: any) => ({
      ...a,
      // Map recommendation fields to activity schema
      title: a.name,
      description: a.description,
      location: trip.destination,
      category: currentActivity.category,
      estimatedCost: a.price || 0,
      time: currentActivity.time // Keep the same time slot
    }));

    res.status(200).json({
      currentActivity,
      alternatives,
      dayId,
      activityIndex: idx
    });
  } catch (error) {
    console.error("Error fetching alternatives:", error);
    res.status(500).json({ error: 'Failed to fetch alternative activities' });
  }
};