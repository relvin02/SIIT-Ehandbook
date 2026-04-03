import express from 'express';
import { Gallery } from '../models';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * Get all gallery images (any authenticated user)
 * GET /api/gallery
 */
router.get('/', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const { category } = req.query;
    const filter: any = { isActive: true };
    if (category) filter.category = category;

    const images = await Gallery.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .exec();

    res.json({
      success: true,
      data: images,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Get gallery categories
 * GET /api/gallery/categories
 */
router.get('/categories', authenticate, async (_req: AuthRequest, res: express.Response) => {
  try {
    const categories = await Gallery.distinct('category', { isActive: true });
    res.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Upload a gallery image (admin only)
 * POST /api/gallery
 */
router.post('/', authenticate, authorize(['admin']), async (req: AuthRequest, res: express.Response) => {
  try {
    const { title, description, image, category, order } = req.body;

    if (!title || !image) {
      res.status(400).json({
        success: false,
        message: 'Title and image are required',
      });
      return;
    }

    const galleryItem = new Gallery({
      title,
      description: description || '',
      image,
      category: category || 'General',
      order: order || 0,
      createdBy: req.user?.id,
    });

    await galleryItem.save();

    res.status(201).json({
      success: true,
      data: galleryItem,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Update a gallery image (admin only)
 * PUT /api/gallery/:id
 */
router.put('/:id', authenticate, authorize(['admin']), async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const { title, description, image, category, order, isActive } = req.body;

    const item = await Gallery.findByIdAndUpdate(
      id,
      {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(category !== undefined && { category }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
      },
      { new: true }
    );

    if (!item) {
      res.status(404).json({ success: false, message: 'Image not found' });
      return;
    }

    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Delete a gallery image (admin only)
 * DELETE /api/gallery/:id
 */
router.delete('/:id', authenticate, authorize(['admin']), async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const item = await Gallery.findByIdAndDelete(id);

    if (!item) {
      res.status(404).json({ success: false, message: 'Image not found' });
      return;
    }

    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
