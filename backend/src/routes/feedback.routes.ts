import express from 'express';
import { Feedback } from '../models';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * Get all feedback (Admin only)
 */
router.get('/', authenticate, authorize(['admin']), async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { status, category } = req.query;
    let filter: any = {};
    if (status) filter.status = status;
    if (category) filter.category = category;

    const feedbacks = await Feedback.find(filter)
      .populate('submittedBy', 'name studentId')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: feedbacks.map(f => ({
        id: f._id,
        category: f.category,
        rating: f.rating,
        message: f.message,
        isAnonymous: f.isAnonymous,
        submittedBy: f.isAnonymous ? 'Anonymous' : (f.submittedBy as any)?.name || 'Unknown',
        studentId: f.isAnonymous ? null : (f.submittedBy as any)?.studentId || null,
        status: f.status,
        createdAt: f.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Get feedback stats (Admin only)
 */
router.get('/stats', authenticate, authorize(['admin']), async (_req: express.Request, res: express.Response): Promise<void> => {
  try {
    const total = await Feedback.countDocuments();
    const pending = await Feedback.countDocuments({ status: 'pending' });
    const reviewed = await Feedback.countDocuments({ status: 'reviewed' });
    const resolved = await Feedback.countDocuments({ status: 'resolved' });

    const avgRating = await Feedback.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' } } },
    ]);

    const byCategory = await Feedback.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        total,
        pending,
        reviewed,
        resolved,
        averageRating: avgRating[0]?.avg?.toFixed(1) || '0.0',
        byCategory,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Submit feedback (all authenticated users)
 */
router.post('/', authenticate, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const { category, rating, message, isAnonymous } = req.body;

    if (!rating || !message) {
      res.status(400).json({ success: false, message: 'Rating and message are required' });
      return;
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
      return;
    }

    const feedback = new Feedback({
      category: category || 'other',
      rating,
      message,
      isAnonymous: isAnonymous || false,
      submittedBy: req.user?.id,
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully. Thank you!',
      data: {
        id: feedback._id,
        category: feedback.category,
        rating: feedback.rating,
        message: feedback.message,
        createdAt: feedback.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Update feedback status (Admin only)
 */
router.put('/:id/status', authenticate, authorize(['admin']), async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const { status } = req.body;
    if (!['pending', 'reviewed', 'resolved'].includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    const feedback = await Feedback.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!feedback) {
      res.status(404).json({ success: false, message: 'Feedback not found' });
      return;
    }

    res.json({ success: true, message: `Feedback marked as ${status}` });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Delete feedback (Admin only)
 */
router.delete('/:id', authenticate, authorize(['admin']), async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    if (!feedback) {
      res.status(404).json({ success: false, message: 'Feedback not found' });
      return;
    }
    res.json({ success: true, message: 'Feedback deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
