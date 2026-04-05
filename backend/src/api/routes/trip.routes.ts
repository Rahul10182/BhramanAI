import { Router } from 'express';
import { planTrip, getUserTrips, getTripById, updateTrip, deleteTrip } from '../controllers/trip.controller.js';

const router = Router();

// Trigger the AI to plan a new trip
router.post('/plan', planTrip);


// Fetch all trips for a user dashboard
router.get('/user/:userId', getUserTrips);

// Individual Trip Operations (Get, Update, Delete)
router.get('/:tripId', getTripById);
router.put('/:tripId', updateTrip);
router.delete('/:tripId', deleteTrip);

export default router;