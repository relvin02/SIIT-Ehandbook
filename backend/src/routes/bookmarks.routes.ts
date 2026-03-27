import express from 'express';
import { Bookmark, Section } from '../models';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * Get user's bookmarks
 */
router.get('/', authenticate, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user?.id })
      .populate({
        path: 'sectionId',
        select: 'title content categoryId createdAt',
        populate: {
          path: 'categoryId',
          select: 'name',
        },
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: bookmarks.map(b => ({
        id: b._id,
        sectionId: b.sectionId._id,
        section: {
          id: b.sectionId._id,
          title: (b.sectionId as any).title,
          content: (b.sectionId as any).content,
          categoryName: ((b.sectionId as any).categoryId as any)?.name,
          createdAt: (b.sectionId as any).createdAt,
        },
        createdAt: b.createdAt,
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
 * Add bookmark
 */
router.post('/', authenticate, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const { sectionId } = req.body;

    if (!sectionId) {
      res.status(400).json({
        success: false,
        message: 'Section ID required',
      });
      return;
    }

    // Check if section exists
    const section = await Section.findById(sectionId);
    if (!section) {
      res.status(404).json({
        success: false,
        message: 'Section not found',
      });
      return;
    }

    // Check if bookmark already exists
    const existingBookmark = await Bookmark.findOne({
      userId: req.user?.id,
      sectionId,
    });

    if (existingBookmark) {
      res.status(409).json({
        success: false,
        message: 'Bookmark already exists',
      });
      return;
    }

    const bookmark = new Bookmark({
      userId: req.user?.id,
      sectionId,
    });

    await bookmark.save();

    res.status(201).json({
      success: true,
      message: 'Bookmark added',
      data: {
        id: bookmark._id,
        sectionId: bookmark.sectionId,
        createdAt: bookmark.createdAt,
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
 * Remove bookmark
 */
router.delete('/:sectionId', authenticate, async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const bookmark = await Bookmark.findOneAndDelete({
      userId: req.user?.id,
      sectionId: req.params.sectionId,
    });

    if (!bookmark) {
      res.status(404).json({
        success: false,
        message: 'Bookmark not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Bookmark removed',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
