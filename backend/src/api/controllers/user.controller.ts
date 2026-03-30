import { Request, Response } from 'express';
import { UserModel } from '../../database/models/user.model.js';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    // Add "as string" here
    const userId = req.params.userId as string;
    const user = await UserModel.findById(userId).select('-passwordHash');
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};