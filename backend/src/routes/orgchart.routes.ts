import express from 'express';
import { OrgChartMember } from '../models';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * Get all org chart members (public - any authenticated user)
 * GET /api/orgchart
 */
router.get('/', authenticate, async (_req: AuthRequest, res: express.Response) => {
  try {
    const members = await OrgChartMember.find()
      .sort({ level: 1, order: 1 })
      .exec();

    res.json({
      success: true,
      data: members,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Create a new org chart member (admin only)
 * POST /api/orgchart
 */
router.post('/', authenticate, authorize(['admin']), async (req: AuthRequest, res: express.Response) => {
  try {
    const { name, position, image, parentId, order, level } = req.body;

    if (!name || !position) {
      res.status(400).json({
        success: false,
        message: 'Name and position are required',
      });
      return;
    }

    const member = new OrgChartMember({
      name,
      position,
      image: image || null,
      parentId: parentId || null,
      order: order || 0,
      level: level ?? 0,
    });

    await member.save();

    res.status(201).json({
      success: true,
      data: member,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Update an org chart member (admin only)
 * PUT /api/orgchart/:id
 */
router.put('/:id', authenticate, authorize(['admin']), async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;
    const { name, position, image, parentId, order, level } = req.body;

    const member = await OrgChartMember.findByIdAndUpdate(
      id,
      {
        ...(name !== undefined && { name }),
        ...(position !== undefined && { position }),
        ...(image !== undefined && { image }),
        ...(parentId !== undefined && { parentId }),
        ...(order !== undefined && { order }),
        ...(level !== undefined && { level }),
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!member) {
      res.status(404).json({
        success: false,
        message: 'Member not found',
      });
      return;
    }

    res.json({
      success: true,
      data: member,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Delete an org chart member (admin only)
 * DELETE /api/orgchart/:id
 */
router.delete('/:id', authenticate, authorize(['admin']), async (req: AuthRequest, res: express.Response) => {
  try {
    const { id } = req.params;

    // Also remove any children that reference this member
    await OrgChartMember.deleteMany({ parentId: id });

    const member = await OrgChartMember.findByIdAndDelete(id);

    if (!member) {
      res.status(404).json({
        success: false,
        message: 'Member not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Member deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
