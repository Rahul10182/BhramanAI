import { Request, Response } from 'express';
import { UserModel, IUser } from '../../database/models/user.model.js';

// Get any user's public profile by ID
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.userId as string;
    const user = await UserModel.findById(userId).select('-password');
    
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }
    
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get the currently logged-in user's full profile
export const getMyProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionUser = req.user as IUser;
    if (!sessionUser) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const user = await UserModel.findById(sessionUser._id).select('-password');
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Update the currently logged-in user's profile
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const sessionUser = req.user as IUser;
    if (!sessionUser) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    // Only allow these fields to be updated
    const allowedFields = ['name', 'phone', 'location', 'bio', 'travelStyle', 'languages', 'avatar'];
    const updates: Record<string, any> = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ success: false, error: 'No valid fields to update' });
      return;
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      sessionUser._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};