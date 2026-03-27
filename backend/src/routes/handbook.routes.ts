import express from 'express';
import { Section, Category } from '../models';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * Get all categories
 */
router.get('/categories', async (_req: express.Request, res: express.Response): Promise<void> => {
  try {
    const categories = await Category.find().sort({ order: 1 });
    res.json({
      success: true,
      data: categories.map(c => ({
        id: c._id,
        name: c.name,
        description: c.description,
        icon: c.icon,
        order: c.order,
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
 * Get all sections or filter by category
 */
router.get('/sections', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    let query: any = { isActive: true };
    
    if (req.query.category) {
      query.categoryId = req.query.category;
    }

    const sections = await Section.find(query)
      .populate('categoryId', 'name')
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: sections.map(s => ({
        id: s._id,
        title: s.title,
        content: s.content,
        categoryId: s.categoryId._id,
        categoryName: (s.categoryId as any).name,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
        createdBy: s.createdBy,
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
 * Get section detail
 */
router.get('/sections/:id', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    const section = await Section.findById(req.params.id).populate('categoryId');

    if (!section) {
      res.status(404).json({
        success: false,
        message: 'Section not found',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: section._id,
        title: section.title,
        content: section.content,
        categoryId: section.categoryId._id,
        categoryName: (section.categoryId as any).name,
        createdAt: section.createdAt,
        updatedAt: section.updatedAt,
        createdBy: section.createdBy,
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
 * Create section (Admin only)
 */
router.post('/sections', authenticate, authorize(['admin']), async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const { title, content, categoryId } = req.body;

    if (!title || !content || !categoryId) {
      res.status(400).json({
        success: false,
        message: 'Title, content, and category are required',
      });
      return;
    }

    const section = new Section({
      title,
      content,
      categoryId,
      createdBy: req.user?.id,
    });

    await section.save();
    await section.populate('categoryId');

    res.status(201).json({
      success: true,
      message: 'Section created',
      data: {
        id: section._id,
        title: section.title,
        content: section.content,
        categoryId: section.categoryId._id,
        categoryName: (section.categoryId as any).name,
        createdAt: section.createdAt,
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
 * Update section (Admin only)
 */
router.put('/sections/:id', authenticate, authorize(['admin']), async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const { title, content, categoryId } = req.body;

    let section = await Section.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        categoryId,
        updatedAt: new Date(),
        lastModifiedBy: req.user?.id,
      },
      { new: true }
    ).populate('categoryId');

    if (!section) {
      res.status(404).json({
        success: false,
        message: 'Section not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Section updated',
      data: {
        id: section._id,
        title: section.title,
        content: section.content,
        categoryId: section.categoryId._id,
        categoryName: (section.categoryId as any).name,
        updatedAt: section.updatedAt,
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
 * Delete section (Admin only)
 */
router.delete('/sections/:id', authenticate, authorize(['admin']), async (req: AuthRequest, res: express.Response): Promise<void> => {
  try {
    const section = await Section.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!section) {
      res.status(404).json({
        success: false,
        message: 'Section not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Section deleted',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
