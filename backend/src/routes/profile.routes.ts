import express from 'express';
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

export default router;
