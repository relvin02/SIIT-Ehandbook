import express from 'express';
import { Section, Announcement } from '../models';

const router = express.Router();

/**
 * Search across handbook sections and announcements
 */
router.get('/', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const query = req.query.q as string;

    if (!query || query.length < 2) {
      res.json({
        success: true,
        data: [],
      });
      return;
    }

    const searchRegex = new RegExp(query, 'i');

    const [sections, announcements] = await Promise.all([
      Section.find({
        isActive: true,
        $or: [
          { title: searchRegex },
          { content: searchRegex },
        ],
      })
        .populate('categoryId')
        .limit(10),
      Announcement.find({
        isActive: true,
        $or: [
          { title: searchRegex },
          { content: searchRegex },
        ],
      })
        .limit(10),
    ]);

    // Combine and format results with relevance scoring
    const results = [
      ...sections.map(s => ({
        type: 'section',
        id: s._id,
        title: s.title,
        content: s.content,
        highlightedContent: s.content.substring(0, 150) + '...',
        relevance: 0.9, // Higher relevance for sections
      })),
      ...announcements.map(a => ({
        type: 'announcement',
        id: a._id,
        title: a.title,
        content: a.content,
        highlightedContent: a.content.substring(0, 150) + '...',
        relevance: 0.7,
      })),
    ].sort((a, b) => b.relevance - a.relevance);

    res.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
