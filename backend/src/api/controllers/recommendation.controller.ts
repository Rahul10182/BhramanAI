import { Request, Response } from 'express';
import { RecommendationService } from '../../services/recommendation.service.js';

/**
 * GET /api/v1/recommendations/:tripId
 * Fetches hotel and activity recommendations for a trip's destination.
 */
export const getRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const tripId = req.params.tripId as string;

    const data = await RecommendationService.getRecommendations(tripId);

    res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error: any) {
    console.error('[RecommendationController] Error:', error.message);

    if (error.message === 'Trip not found') {
      res.status(404).json({ success: false, error: 'Trip not found' });
      return;
    }

    res.status(500).json({ success: false, error: 'Failed to fetch recommendations' });
  }
};
