import { Router } from 'express';
import { handleChat } from '../controllers/chat.controller.js';

const router = Router();

// POST /api/v1/chat/:chatId
router.post('/:chatId', handleChat);

export default router;