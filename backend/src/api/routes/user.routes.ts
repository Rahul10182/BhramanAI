import { Router } from 'express';
import { getProfile } from '../controllers/user.controller.js';

const router = Router();

// :userId is a dynamic parameter in the URL
router.get('/:userId', getProfile);

export default router;