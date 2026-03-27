import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = express.Router();

/**
 * Login - supports Student ID or Email
 */
router.post('/login', async (req: express.Request, res: express.Response) => {
  try {
    const { studentId, email, password } = req.body;

    const identifier = studentId || email;
    if (!identifier || !password) {
      res.status(400).json({
        success: false,
        message: 'Student ID and password are required',
      });
      return;
    }

    // Find by studentId first, then email
    const user = await User.findOne({
      $or: [{ studentId: identifier }, { email: identifier }],
    });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid Student ID or Password',
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid Student ID or Password',
      });
      return;
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          studentId: user.studentId,
        },
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
 * Get current user profile from token
 */
router.get('/me', authenticate, async (req: AuthRequest, res: express.Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password_hash');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        studentId: user.studentId,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Validate Token
 */
router.post('/validate', authenticate, (_req: AuthRequest, res: express.Response) => {
  res.json({ success: true, message: 'Token is valid' });
});

/**
 * Logout
 */
router.post('/logout', authenticate, (_req: AuthRequest, res: express.Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// ============================================
// ADMIN: Student Account Management
// ============================================

/**
 * Get all students (Admin only)
 */
router.get('/users', authenticate, authorize(['admin']), async (_req: AuthRequest, res: express.Response) => {
  try {
    const users = await User.find({ role: 'student' })
      .select('-password_hash')
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      data: users.map((u: any) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        studentId: u.studentId,
        createdAt: u.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Create student account (Admin only)
 */
router.post('/users', authenticate, authorize(['admin']), async (req: express.Request, res: express.Response) => {
  try {
    const { name, studentId, password } = req.body;

    if (!name || !studentId || !password) {
      res.status(400).json({ success: false, message: 'Full Name, Student ID, and Password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      return;
    }

    const existing = await User.findOne({ studentId });
    if (existing) {
      res.status(409).json({ success: false, message: 'Student ID already exists' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = new User({
      email: `${studentId.toLowerCase()}@siit.edu`,
      password_hash,
      name,
      studentId,
      role: 'student',
    });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Student account created',
      data: { id: user._id, name: user.name, studentId: user.studentId, createdAt: user.createdAt },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Update student account (Admin only)
 */
router.put('/users/:id', authenticate, authorize(['admin']), async (req: express.Request, res: express.Response) => {
  try {
    const { name, password } = req.body;
    const updateData: any = {};

    if (name) updateData.name = name;
    if (password) {
      if (password.length < 6) {
        res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        return;
      }
      updateData.password_hash = await bcrypt.hash(password, 10);
    }
    updateData.updatedAt = new Date();

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'student' },
      updateData,
      { new: true }
    ).select('-password_hash');

    if (!user) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Student account updated',
      data: { id: user._id, name: user.name, studentId: user.studentId },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Delete student account (Admin only)
 */
router.delete('/users/:id', authenticate, authorize(['admin']), async (req: express.Request, res: express.Response) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id, role: 'student' });
    if (!user) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }
    res.json({ success: true, message: 'Student account deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Reset student password (Admin only)
 */
router.post('/users/:id/reset-password', authenticate, authorize(['admin']), async (req: express.Request, res: express.Response) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'student' },
      { password_hash, updatedAt: new Date() }
    );

    if (!user) {
      res.status(404).json({ success: false, message: 'Student not found' });
      return;
    }

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
