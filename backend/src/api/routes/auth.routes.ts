import { Router } from 'express';
import passport from 'passport';
import { 
  register, 
  login, 
  getCurrentUser, 
  logout,
  googleAuthSuccess,
  googleAuthFailure
} from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

// Local auth routes
router.post('/register', register);
router.post('/login', login);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/api/auth/google/failure',
    failureMessage: true
  }),
  googleAuthSuccess
);

router.get('/google/failure', googleAuthFailure);

// Auth status routes
router.get('/me', authMiddleware, getCurrentUser);
router.post('/logout', authMiddleware, logout);

export default router;