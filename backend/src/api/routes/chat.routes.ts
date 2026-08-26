import { Router } from 'express';
import { handleChat } from '../controllers/chat.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// POST /api/v1/chat/:chatId
router.post('/:chatId', authMiddleware, handleChat);

export default router;