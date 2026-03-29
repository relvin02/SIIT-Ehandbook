import express from 'express';
import { User } from '../models';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * Update user location (for students)
 * POST /api/location/update
 */
router.post('/update', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
      return;
    }

    // Validate coordinates
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      res.status(400).json({
        success: false,
        message: 'Invalid latitude or longitude values',
      });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.user?.id,
      {
        location: {
          latitude,
          longitude,
          lastUpdate: new Date(),
        },
      },
      { new: true }
    ).select('-password_hash');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: {
        id: user._id,
        name: user.name,
        location: user.location,
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
 * Get all student locations (admin only)
 * GET /api/location/all
 */
router.get('/all', authenticate, authorize(['admin']), async (_req: AuthRequest, res: express.Response) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('_id name email studentId location')
      .exec();

    const studentsWithLocation = students.map((student: any) => ({
      id: student._id,
      name: student.name,
      email: student.email,
      studentId: student.studentId,
      location: student.location,
      isOnline: student.location?.lastUpdate ? isRecentlyActive(student.location.lastUpdate) : false,
    }));

    res.json({
      success: true,
      data: studentsWithLocation,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Get a specific student location (admin only)
 * GET /api/location/:studentId
 */
router.get('/:studentId', authenticate, authorize(['admin']), async (req: AuthRequest, res: express.Response) => {
  try {
    const { studentId } = req.params;

    const student = await User.findById(studentId)
      .select('-password_hash')
      .exec();

    if (!student || student.role !== 'student') {
      res.status(404).json({
        success: false,
        message: 'Student not found',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: student._id,
        name: student.name,
        email: student.email,
        studentId: student.studentId,
        location: student.location,
        isOnline: student.location?.lastUpdate ? isRecentlyActive(student.location.lastUpdate) : false,
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
 * Helper function to check if location was recently updated (within 5 minutes)
 */
function isRecentlyActive(lastUpdate: Date): boolean {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return new Date(lastUpdate) > fiveMinutesAgo;
}

export default router;
