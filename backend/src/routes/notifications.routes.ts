import express from 'express';
import { Notification, User } from '../models';
/**
 * Register or update Expo push token for the logged-in user
 * POST /api/notifications/register
 * Body: { expoPushToken: string }
 */
router.post('/register', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const { expoPushToken } = req.body;
    if (!expoPushToken) {
      return res.status(400).json({ success: false, message: 'expoPushToken is required' });
    }
    // Update user's push token
    await User.findByIdAndUpdate(req.user?.id, { expoPushToken });
    return res.json({ success: true, message: 'Push token registered' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * Get user notifications
 */
router.get('/', authenticate, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const notifications = await Notification.find({
      userId: req.user?.id,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: notifications.map(n => ({
        id: n._id,
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.isRead,
        createdAt: n.createdAt,
        data: n.data,
      })),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Mark notification as read
 */
router.put('/:id/read', authenticate, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Mark all notifications as read
 */
router.put('/read-all', authenticate, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    await Notification.updateMany(
      { userId: req.user?.id, isRead: false },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
