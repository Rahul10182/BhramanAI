import { Router } from 'express';
import { getRecommendations } from '../controllers/recommendation.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Public: fetch recommendations (for trip detail page swap flow — no auth required)
router.get('/public/:tripId', getRecommendations);

// Protected: fetch recommendations for a trip
router.get('/:tripId', authMiddleware, getRecommendations);

export default router;
