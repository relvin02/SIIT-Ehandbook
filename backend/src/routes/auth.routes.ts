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
          department: user.department,
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
        department: user.department,
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
 * Get all users (Admin only) - filter by role query param
 */
router.get('/users', authenticate, authorize(['admin']), async (req: AuthRequest, res: express.Response) => {
  try {
    const roleFilter = req.query.role as string;
    const filter: any = {};
    if (roleFilter) {
      filter.role = roleFilter;
    }

    const users = await User.find(filter)
      .select('-password_hash')
      .sort({ createdAt: -1 });
    res.json({
      success: true,
      data: users.map((u: any) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        studentId: u.studentId,
        role: u.role,
        department: u.department,
        createdAt: u.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Create user account (Admin only) - supports student, faculty, admin
 */
router.post('/users', authenticate, authorize(['admin']), async (req: express.Request, res: express.Response) => {
  try {
    const { name, studentId, email, password, role, department } = req.body;
    const userRole = role || 'student';

    if (!['student', 'faculty', 'admin'].includes(userRole)) {
      res.status(400).json({ success: false, message: 'Invalid role' });
      return;
    }

    if (!name || !password) {
      res.status(400).json({ success: false, message: 'Name and Password are required' });
      return;
    }

    if (userRole === 'student' && !studentId) {
      res.status(400).json({ success: false, message: 'Student ID is required for students' });
      return;
    }

    if ((userRole === 'faculty' || userRole === 'admin') && !email) {
      res.status(400).json({ success: false, message: 'Email is required for faculty/admin accounts' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      return;
    }

    // Check for existing user
    if (studentId) {
      const existingById = await User.findOne({ studentId });
      if (existingById) {
        res.status(409).json({ success: false, message: 'Student ID already exists' });
        return;
      }
    }

    const userEmail = email || `${studentId.toLowerCase()}@siit.edu`;
    const existingByEmail = await User.findOne({ email: userEmail });
    if (existingByEmail) {
      res.status(409).json({ success: false, message: 'Email already exists' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = new User({
      email: userEmail,
      password_hash,
      name,
      studentId: studentId || undefined,
      role: userRole,
      department: userRole === 'student' ? (department || null) : null,
    });
    await user.save();

    res.status(201).json({
      success: true,
      message: `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} account created`,
      data: { id: user._id, name: user.name, email: user.email, studentId: user.studentId, role: user.role, department: user.department, createdAt: user.createdAt },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Bulk import students (Admin only)
 * POST /api/auth/users/bulk
 * Body: { students: [{ name, studentId, department, password? }] }
 */
router.post('/users/bulk', authenticate, authorize(['admin']), async (req: express.Request, res: express.Response) => {
  try {
    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      res.status(400).json({ success: false, message: 'No students provided' });
      return;
    }

    if (students.length > 200) {
      res.status(400).json({ success: false, message: 'Maximum 200 students per import' });
      return;
    }

    const results: { success: any[]; failed: any[] } = { success: [], failed: [] };

    for (const student of students) {
      try {
        const { name, studentId, department, password } = student;
        if (!name || !studentId) {
          results.failed.push({ studentId: studentId || '?', name: name || '?', reason: 'Name and Student ID are required' });
          continue;
        }

        const validDepts = ['BSIT', 'BSOA', 'BSTM', 'BSAIS', 'BSCRIM', 'BSED/BEED'];
        if (department && !validDepts.includes(department)) {
          results.failed.push({ studentId, name, reason: `Invalid department: ${department}` });
          continue;
        }

        // Check duplicates
        const existingById = await User.findOne({ studentId });
        if (existingById) {
          results.failed.push({ studentId, name, reason: 'Student ID already exists' });
          continue;
        }

        const userEmail = `${studentId.toLowerCase()}@siit.edu`;
        const existingByEmail = await User.findOne({ email: userEmail });
        if (existingByEmail) {
          results.failed.push({ studentId, name, reason: 'Email already exists' });
          continue;
        }

        const pw = password || studentId;
        const password_hash = await bcrypt.hash(pw, 10);
        const user = new User({
          email: userEmail,
          password_hash,
          name,
          studentId,
          role: 'student',
          department: department || null,
        });
        await user.save();
        results.success.push({ id: user._id, name: user.name, studentId: user.studentId, department: user.department });
      } catch (err: any) {
        results.failed.push({ studentId: student.studentId || '?', name: student.name || '?', reason: err.message });
      }
    }

    res.status(201).json({
      success: true,
      message: `Imported ${results.success.length} students, ${results.failed.length} failed`,
      data: results,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Bulk import faculty (Admin only)
 * POST /api/auth/users/bulk-faculty
 * Body: { faculty: [{ name, email, password? }] }
 */
router.post('/users/bulk-faculty', authenticate, authorize(['admin']), async (req: express.Request, res: express.Response) => {
  try {
    const { faculty } = req.body;
    if (!Array.isArray(faculty) || faculty.length === 0) {
      res.status(400).json({ success: false, message: 'No faculty provided' });
      return;
    }

    if (faculty.length > 200) {
      res.status(400).json({ success: false, message: 'Maximum 200 faculty per import' });
      return;
    }

    const results: { success: any[]; failed: any[] } = { success: [], failed: [] };

    for (const member of faculty) {
      try {
        const { name, email, password } = member;
        if (!name || !email) {
          results.failed.push({ email: email || '?', name: name || '?', reason: 'Name and Email are required' });
          continue;
        }

        const existingByEmail = await User.findOne({ email: email.toLowerCase() });
        if (existingByEmail) {
          results.failed.push({ email, name, reason: 'Email already exists' });
          continue;
        }

        const pw = password || 'faculty123';
        const password_hash = await bcrypt.hash(pw, 10);
        const user = new User({
          email: email.toLowerCase(),
          password_hash,
          name,
          role: 'faculty',
        });
        await user.save();
        results.success.push({ id: user._id, name: user.name, email: user.email });
      } catch (err: any) {
        results.failed.push({ email: member.email || '?', name: member.name || '?', reason: err.message });
      }
    }

    res.status(201).json({
      success: true,
      message: `Imported ${results.success.length} faculty, ${results.failed.length} failed`,
      data: results,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Update user account (Admin only)
 */
router.put('/users/:id', authenticate, authorize(['admin']), async (req: express.Request, res: express.Response) => {
  try {
    const { name, password, department } = req.body;
    const updateData: any = {};

    if (name) updateData.name = name;
    if (department !== undefined) updateData.department = department || null;
    if (password) {
      if (password.length < 6) {
        res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        return;
      }
      updateData.password_hash = await bcrypt.hash(password, 10);
    }
    updateData.updatedAt = new Date();

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password_hash');

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Account updated',
      data: { id: user._id, name: user.name, studentId: user.studentId, role: user.role, department: user.department },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Delete user account (Admin only)
 */
router.delete('/users/:id', authenticate, authorize(['admin']), async (req: express.Request, res: express.Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({ success: true, message: 'Account deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * Reset user password (Admin only)
 */
router.post('/users/:id/reset-password', authenticate, authorize(['admin']), async (req: express.Request, res: express.Response) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { password_hash, updatedAt: new Date() }
    );

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
