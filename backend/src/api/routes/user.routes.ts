import { Router } from 'express';
import { getProfile, getMyProfile, updateProfile } from '../controllers/user.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Protected routes (require login)
router.get('/me', authMiddleware, getMyProfile);
router.put('/me', authMiddleware, updateProfile);

// Public route - get any user's profile
router.get('/:userId', getProfile);

export default router;