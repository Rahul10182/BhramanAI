import { Router } from 'express';
import { handleChat } from '../controllers/chat.controller.js';

const router = Router();

// POST /api/v1/chat
router.post('/', handleChat);

export default router;