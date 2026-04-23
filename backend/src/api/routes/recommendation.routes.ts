import { Router } from 'express';
import { getRecommendations } from '../controllers/recommendation.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Protected: fetch recommendations for a trip
router.get('/:tripId', authMiddleware, getRecommendations);

export default router;
