import express from 'express';
import { DepartmentInfo } from '../models';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * Get department info by department name
 * GET /api/department-info/:department
 */
router.get('/:department', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const { department } = req.params;
    let info = await DepartmentInfo.findOne({ department });

    if (!info) {
      // Return empty defaults
      info = new DepartmentInfo({ department });
    }

    res.json({ success: true, data: info });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Create or update department info (admin only)
 * PUT /api/department-info/:department
 */
router.put('/:department', authenticate, authorize(['admin']), async (req: AuthRequest, res: express.Response) => {
  try {
    const { department } = req.params;
    const { vision, mission, goals, objectives, policies, policiesLabel } = req.body;

    const updateData: any = { updatedBy: req.user?.id, updatedAt: new Date() };
    if (vision !== undefined) updateData.vision = vision;
    if (mission !== undefined) updateData.mission = mission;
    if (goals !== undefined) updateData.goals = goals;
    if (objectives !== undefined) updateData.objectives = objectives;
    if (policies !== undefined) updateData.policies = policies;
    if (policiesLabel !== undefined) updateData.policiesLabel = policiesLabel;

    const info = await DepartmentInfo.findOneAndUpdate(
      { department },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: info });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
