import { Router } from 'express';
import { saveItinerary, getTripItinerary } from '../controllers/itinerary.controller.js';

const router = Router();

router.post('/', saveItinerary);
router.get('/:tripId', getTripItinerary);

export default router;