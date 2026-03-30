import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UserModel } from '../../database/models/user.model.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'Email already exists' });
      return;
    }

    // Hash the password and save the user
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new UserModel({ name, email, passwordHash });
    await user.save();

    // Just return the user ID and details (No tokens!)
    res.status(201).json({ id: user._id, name, email });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    // Find the user
    const user = await UserModel.findOne({ email });
    if (!user) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    // Check the password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    // Login successful, return the user info
    res.status(200).json({ id: user._id, name: user.name, email: user.email });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};