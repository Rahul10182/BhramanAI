import { Router } from 'express';
import { 
    saveItinerary, 
    getTripItinerary, 
    updateItineraryDay, 
    deleteItineraryDay,
    replaceActivity,
    getAlternativeActivities
} from '../controllers/itinerary.controller.js';

const router = Router();

// ==========================================
// Base Path: /api/v1/itineraries
// ==========================================

// [POST] Add a new day to an existing trip
router.post('/', saveItinerary);

// [GET] Fetch the full itinerary for a specific Trip ID
// Example: GET /api/v1/itineraries/60d5ec49f12...
router.get('/:tripId', getTripItinerary);

// [GET] Get alternative activities for a specific activity slot (Human-in-the-Loop)
// Example: GET /api/v1/itineraries/60d5ec49.../alternatives/2
router.get('/:dayId/alternatives/:activityIndex', getAlternativeActivities);

// [PUT] Update a specific Day's document (using the Day's _id)
// Example: PUT /api/v1/itineraries/60d5ec49f12...
router.put('/:id', updateItineraryDay);

// [PUT] Replace a specific activity within a day (Human-in-the-Loop swap)
// Example: PUT /api/v1/itineraries/60d5ec49.../activities/2
router.put('/:dayId/activities/:activityIndex', replaceActivity);

// [DELETE] Remove a specific Day's document (using the Day's _id)
// Example: DELETE /api/v1/itineraries/60d5ec49f12...
router.delete('/:id', deleteItineraryDay);

export default router;