import { Router } from 'express';
import { createTrip, getUserTrips } from '../controllers/trip.controller.js';

const router = Router();

router.post('/', createTrip);
router.get('/user/:userId', getUserTrips);

export default router;