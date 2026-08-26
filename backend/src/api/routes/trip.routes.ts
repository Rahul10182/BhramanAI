import { Router } from 'express';
import { planTrip, getUserTrips, getTripById, updateTrip, deleteTrip, confirmTrip, streamTripProgress } from '../controllers/trip.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Trigger the AI to plan a new trip
router.post('/plan', authMiddleware, planTrip);

// Fetch all trips for a user dashboard
router.get('/user/:userId', authMiddleware, getUserTrips);

// Individual Trip Operations (Get, Update, Delete)
router.get('/stream/:tripId', streamTripProgress);
router.get('/:tripId', authMiddleware, getTripById);
router.post('/:tripId/confirm', authMiddleware, confirmTrip);
router.put('/:tripId', authMiddleware, updateTrip);
router.delete('/:tripId', authMiddleware, deleteTrip);

export default router;