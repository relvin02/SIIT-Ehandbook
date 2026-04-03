import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * Get user profile
 */
router.get('/', authenticate, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).select('-password_hash');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        studentId: user.studentId,
        role: user.role,
        avatar: user.avatar,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Update user profile
 */
router.put('/', authenticate, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const { name, phoneNumber, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user?.id,
      {
        name,
        phoneNumber,
        avatar,
        updatedAt: new Date(),
      },
      { new: true }
    ).select('-password_hash');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Profile updated',
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        studentId: user.studentId,
        role: user.role,
        avatar: user.avatar,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Change own password
 * PUT /api/profile/change-password
 */
router.put('/change-password', authenticate, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Current password and new password are required' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
      return;
    }

    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      res.status(400).json({ success: false, message: 'Current password is incorrect' });
      return;
    }

    user.password_hash = await bcrypt.hash(newPassword, 10);
    user.updatedAt = new Date();
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
