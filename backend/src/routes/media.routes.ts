import { Router, Response } from 'express';
import { Media } from '../models';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/media - Get all media (public)
router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const media = await Media.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json({
      success: true,
      data: media.map(m => ({
        id: m._id,
        title: m.title,
        type: m.type,
        url: m.url,
        description: m.description,
        lyrics: m.lyrics,
        thumbnailUrl: m.thumbnailUrl,
        order: m.order,
        createdAt: m.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/media/videos - Get only videos
router.get('/videos', async (_req: AuthRequest, res: Response) => {
  try {
    const videos = await Media.find({ type: 'video', isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json({
      success: true,
      data: videos.map(v => ({
        id: v._id,
        title: v.title,
        type: v.type,
        url: v.url,
        description: v.description,
        thumbnailUrl: v.thumbnailUrl,
        order: v.order,
        createdAt: v.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/media/hymn - Get SIIT Hymn
router.get('/hymn', async (_req: AuthRequest, res: Response) => {
  try {
    const hymn = await Media.findOne({ type: 'audio', isActive: true });
    if (!hymn) {
      res.json({ success: true, data: null });
      return;
    }
    res.json({
      success: true,
      data: {
        id: hymn._id,
        title: hymn.title,
        type: hymn.type,
        url: hymn.url,
        description: hymn.description,
        lyrics: hymn.lyrics,
        createdAt: hymn.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/media - Create media (admin only)
router.post('/', authenticate, authorize(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { title, type, url, description, lyrics, thumbnailUrl, order } = req.body;
    const media = new Media({
      title,
      type,
      url,
      description,
      lyrics,
      thumbnailUrl,
      order: order || 0,
      createdBy: req.user?.id,
    });
    await media.save();
    res.status(201).json({
      success: true,
      data: {
        id: media._id,
        title: media.title,
        type: media.type,
        url: media.url,
        description: media.description,
        lyrics: media.lyrics,
        thumbnailUrl: media.thumbnailUrl,
        order: media.order,
        createdAt: media.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/media/:id - Update media (admin only)
router.put('/:id', authenticate, authorize(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const media = await Media.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!media) {
      res.status(404).json({ success: false, message: 'Media not found' });
      return;
    }
    res.json({
      success: true,
      data: {
        id: media._id,
        title: media.title,
        type: media.type,
        url: media.url,
        description: media.description,
        lyrics: media.lyrics,
        thumbnailUrl: media.thumbnailUrl,
        order: media.order,
        createdAt: media.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/media/:id - Delete media (admin only)
router.delete('/:id', authenticate, authorize(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const media = await Media.findByIdAndDelete(req.params.id);
    if (!media) {
      res.status(404).json({ success: false, message: 'Media not found' });
      return;
    }
    res.json({ success: true, message: 'Media deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
