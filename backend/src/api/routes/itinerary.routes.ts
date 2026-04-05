import { Router } from 'express';
import { 
    saveItinerary, 
    getTripItinerary, 
    updateItineraryDay, 
    deleteItineraryDay 
} from '../controllers/itinerary.controller.js';

const router = Router();

// ==========================================
// Base Path: /api/v1/itineraries (or similar depending on app.ts)
// ==========================================

// [POST] Add a new day to an existing trip
router.post('/', saveItinerary);

// [GET] Fetch the full 5-day array for a specific Trip ID
// Example: GET /api/v1/itineraries/60d5ec49f12...
router.get('/:tripId', getTripItinerary);

// [PUT] Update a specific Day's document (using the Day's _id)
// Example: PUT /api/v1/itineraries/60d5ec49f12...
router.put('/:id', updateItineraryDay);

// [DELETE] Remove a specific Day's document (using the Day's _id)
// Example: DELETE /api/v1/itineraries/60d5ec49f12...
router.delete('/:id', deleteItineraryDay);

export default router;