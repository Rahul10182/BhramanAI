import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UserModel } from '../../database/models/user.model.js';

// Local Register
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'Email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await UserModel.create({ 
      name, 
      email, 
      password: passwordHash,
      provider: 'local'
    });

    req.login(user, (err) => {
      if (err) {
        res.status(500).json({ error: 'Login failed' });
        return;
      }
      res.status(201).json({ id: user._id, name: user.name, email: user.email });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Local Login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    if (user.provider === 'google') {
      res.status(400).json({ error: 'Please sign in with Google' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    req.login(user, (err) => {
      if (err) {
        res.status(500).json({ error: 'Login failed' });
        return;
      }
      res.status(200).json({ id: user._id, fullName: user.name, email: user.email });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get current user
export const getCurrentUser = (req: Request, res: Response): void => {
  if (req.user) {
    res.json({ success: true, user: req.user });
  } else {
    res.status(401).json({ success: false, message: 'Not authenticated' });
  }
};

// Logout
export const logout = (req: Request, res: Response): void => {
  req.logout((err) => {
    if (err) {
      res.status(500).json({ success: false, message: 'Logout failed' });
    } else {
      res.json({ success: true, message: 'Logged out successfully' });
    }
  });
};

// Google Auth Success Redirect
export const googleAuthSuccess = (req: Request, res: Response): void => {
  res.redirect(`${process.env.FRONTEND_URL}/auth/success`);
};

// Google Auth Failure
export const googleAuthFailure = (req: Request, res: Response): void => {
  res.redirect(`${process.env.FRONTEND_URL}/login`);
};