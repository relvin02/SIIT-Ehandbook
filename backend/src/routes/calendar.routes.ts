import express from 'express';
import { CalendarEvent } from '../models';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * Get all calendar events (all authenticated users)
 */
router.get('/', authenticate, async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { month, year } = req.query;
    let filter: any = {};

    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 0, 23, 59, 59);
      filter.startDate = { $lte: end };
      filter.$or = [
        { endDate: { $gte: start } },
        { endDate: null, startDate: { $gte: start, $lte: end } },
      ];
    }

    const events = await CalendarEvent.find(filter)
      .populate('createdBy', 'name')
      .sort({ startDate: 1 });

    res.json({
      success: true,
      data: events.map(e => ({
        id: e._id,
        title: e.title,
        description: e.description,
        eventType: e.eventType,
        startDate: e.startDate,
        endDate: e.endDate,
        isAllDay: e.isAllDay,
        createdBy: (e.createdBy as any)?.name || 'Admin',
        createdAt: e.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Create calendar event (Admin only)
 */
router.post('/', authenticate, authorize(['admin']), async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const { title, description, eventType, startDate, endDate, isAllDay } = req.body;

    if (!title || !startDate) {
      res.status(400).json({ success: false, message: 'Title and start date are required' });
      return;
    }

    const event = new CalendarEvent({
      title,
      description: description || '',
      eventType: eventType || 'event',
      startDate,
      endDate: endDate || null,
      isAllDay: isAllDay !== undefined ? isAllDay : true,
      createdBy: req.user?.id,
    });

    await event.save();

    res.status(201).json({
      success: true,
      message: 'Event created',
      data: {
        id: event._id,
        title: event.title,
        description: event.description,
        eventType: event.eventType,
        startDate: event.startDate,
        endDate: event.endDate,
        isAllDay: event.isAllDay,
        createdAt: event.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Update calendar event (Admin only)
 */
router.put('/:id', authenticate, authorize(['admin']), async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const event = await CalendarEvent.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        id: event._id,
        title: event.title,
        description: event.description,
        eventType: event.eventType,
        startDate: event.startDate,
        endDate: event.endDate,
        isAllDay: event.isAllDay,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Delete calendar event (Admin only)
 */
router.delete('/:id', authenticate, authorize(['admin']), async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const event = await CalendarEvent.findByIdAndDelete(req.params.id);
    if (!event) {
      res.status(404).json({ success: false, message: 'Event not found' });
      return;
    }
    res.json({ success: true, message: 'Event deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
