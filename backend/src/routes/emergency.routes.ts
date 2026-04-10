import express from 'express';
import { EmergencyAlert, User } from '../models';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { io } from '../index';
import { sendExpoNotification } from '../utils/sendExpoNotification';

const router = express.Router();

/**
 * Get active emergency alerts (all authenticated users)
 */
router.get('/', authenticate, async (_req: express.Request, res: express.Response): Promise<void> => {
  try {
    const alerts = await EmergencyAlert.find({
      isActive: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } },
      ],
    })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: alerts.map(a => ({
        id: a._id,
        title: a.title,
        message: a.message,
        severity: a.severity,
        isActive: a.isActive,
        expiresAt: a.expiresAt,
        createdBy: (a.createdBy as any)?.name || 'Admin',
        createdAt: a.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Get all emergency alerts including inactive (Admin only)
 */
router.get('/all', authenticate, authorize(['admin']), async (_req: express.Request, res: express.Response): Promise<void> => {
  try {
    const alerts = await EmergencyAlert.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: alerts.map(a => ({
        id: a._id,
        title: a.title,
        message: a.message,
        severity: a.severity,
        isActive: a.isActive,
        expiresAt: a.expiresAt,
        createdBy: (a.createdBy as any)?.name || 'Admin',
        createdAt: a.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Create emergency alert (Admin only) — sends push to ALL users
 */
router.post('/', authenticate, authorize(['admin']), async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const { title, message, severity, expiresAt } = req.body;

    if (!title || !message) {
      res.status(400).json({ success: false, message: 'Title and message are required' });
      return;
    }

    const alert = new EmergencyAlert({
      title,
      message,
      severity: severity || 'critical',
      expiresAt: expiresAt || null,
      createdBy: req.user?.id,
    });

    await alert.save();
    await alert.populate('createdBy', 'name');

    // Send push notification to ALL users with expoPushToken
    try {
      const users = await User.find({ expoPushToken: { $ne: null } }, 'expoPushToken');
      const severityEmoji = severity === 'critical' ? '🚨' : severity === 'warning' ? '⚠️' : 'ℹ️';
      const notificationPromises = users.map((user: any) =>
        sendExpoNotification(
          user.expoPushToken,
          `${severityEmoji} EMERGENCY: ${title}`,
          message,
          { type: 'emergency_alert', alertId: alert._id }
        )
      );
      await Promise.all(notificationPromises);
    } catch (notifErr) {
      console.error('Error sending emergency push notifications:', notifErr);
    }

    // Broadcast via Socket.IO to all connected clients
    io.emit('emergency_alert', {
      alert: {
        id: alert._id,
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        createdAt: alert.createdAt,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Emergency alert sent to all users',
      data: {
        id: alert._id,
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        isActive: alert.isActive,
        expiresAt: alert.expiresAt,
        createdBy: (alert.createdBy as any)?.name || 'Admin',
        createdAt: alert.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Deactivate / dismiss an emergency alert (Admin only)
 */
router.put('/:id/deactivate', authenticate, authorize(['admin']), async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const alert = await EmergencyAlert.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!alert) {
      res.status(404).json({ success: false, message: 'Alert not found' });
      return;
    }

    io.emit('emergency_alert_dismissed', { alertId: alert._id });

    res.json({ success: true, message: 'Alert deactivated' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Delete emergency alert (Admin only)
 */
router.delete('/:id', authenticate, authorize(['admin']), async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const alert = await EmergencyAlert.findByIdAndDelete(req.params.id);

    if (!alert) {
      res.status(404).json({ success: false, message: 'Alert not found' });
      return;
    }

    io.emit('emergency_alert_deleted', { alertId: req.params.id });

    res.json({ success: true, message: 'Alert deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
