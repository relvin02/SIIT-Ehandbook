import express from 'express';
import { Announcement, User } from '../models';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { io } from '../index';
import { sendExpoNotification } from '../utils/sendExpoNotification';

const router = express.Router();

/**
 * Get all announcements
 */
router.get('/', async (_req: express.Request, res: express.Response): Promise<void> => {
  try {
    const announcements = await Announcement.find({ isActive: true })
      .populate('createdBy', 'name')
      .sort({ isPinned: -1, createdAt: -1 });

    res.json({
      success: true,
      data: announcements.map(a => ({
        id: a._id,
        title: a.title,
        content: a.content,
        createdBy: (a.createdBy as any)?.name || 'Admin',
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
        isPinned: a.isPinned,
        isNew: new Date(a.createdAt).getTime() > Date.now() - 86400000, // 24 hours
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
 * Get announcement detail
 */
router.get('/:id', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const announcement = await Announcement.findById(req.params.id).populate('createdBy', 'name');

    if (!announcement) {
      res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: announcement._id,
        title: announcement.title,
        content: announcement.content,
        createdBy: (announcement.createdBy as any)?.name || 'Admin',
        createdAt: announcement.createdAt,
        isPinned: announcement.isPinned,
      },
    });
    return;
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Create announcement (Admin only)
 */
router.post('/', authenticate, authorize(['admin']), async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const { title, content, isPinned } = req.body;

    if (!title || !content) {
      res.status(400).json({
        success: false,
        message: 'Title and content required',
      });
      return;
    }

    const announcement = new Announcement({
      title,
      content,
      isPinned: isPinned || false,
      createdBy: req.user?.id,
    });

    await announcement.save();
    await announcement.populate('createdBy', 'name');

    // Send push notification to all students with expoPushToken
    try {
      const students = await User.find({ role: 'student', expoPushToken: { $ne: null } }, 'expoPushToken');
      const notificationPromises = students.map((student: any) =>
        sendExpoNotification(
          student.expoPushToken,
          'New Announcement',
          title,
          { type: 'announcement', announcementId: announcement._id }
        )
      );
      await Promise.all(notificationPromises);
    } catch (notifErr) {
      console.error('Error sending push notifications:', notifErr);
    }

    // Broadcast to all connected clients
    io.emit('announcement_created', {
      announcement: {
        id: announcement._id,
        title: announcement.title,
        content: announcement.content,
        createdAt: announcement.createdAt,
        isPinned: announcement.isPinned,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Announcement created',
      data: {
        id: announcement._id,
        title: announcement.title,
        content: announcement.content,
        createdAt: announcement.createdAt,
        isPinned: announcement.isPinned,
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
 * Update announcement (Admin only)
 */
router.put('/:id', authenticate, authorize(['admin']), async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const { title, content, isPinned } = req.body;

    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        isPinned,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!announcement) {
      res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
      return;
    }

    io.emit('announcement_updated', { announcement });

    res.json({
      success: true,
      message: 'Announcement updated',
      data: announcement,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Delete announcement (Admin only)
 */
router.delete('/:id', authenticate, authorize(['admin']), async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!announcement) {
      res.status(404).json({
        success: false,
        message: 'Announcement not found',
      });
      return;
    }

    io.emit('announcement_deleted', { announcementId: req.params.id });

    res.json({
      success: true,
      message: 'Announcement deleted',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
