import { Router, Response, Request } from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import { Media } from '../models';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();

// Multer config - memory storage, 25MB limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

// Helper to get GridFS bucket
const getBucket = () => {
  const db = mongoose.connection.db;
  if (!db) throw new Error('Database not connected');
  return new mongoose.mongo.GridFSBucket(db, { bucketName: 'mediaFiles' });
};

// POST /api/media/upload - Upload a file (admin only)
router.post('/upload', authenticate, authorize(['admin']), upload.single('file'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'No file provided' });
      return;
    }

    const bucket = getBucket();
    const uploadStream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
    });

    uploadStream.end(req.file.buffer);

    uploadStream.on('finish', () => {
      const fileId = uploadStream.id.toString();
      res.json({
        success: true,
        data: {
          fileId,
          filename: req.file!.originalname,
          contentType: req.file!.mimetype,
          size: req.file!.size,
        },
      });
    });

    uploadStream.on('error', (err: any) => {
      res.status(500).json({ success: false, message: err.message });
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/media/stream/:fileId - Stream a file (supports range requests for seeking)
router.get('/stream/:fileId', async (req: Request, res: Response) => {
  try {
    const bucket = getBucket();
    const fileId = new mongoose.Types.ObjectId(req.params.fileId);

    const files = await bucket.find({ _id: fileId }).toArray();
    if (files.length === 0) {
      res.status(404).json({ success: false, message: 'File not found' });
      return;
    }

    const file = files[0];
    const fileSize = file.length;
    const contentType = file.contentType || 'application/octet-stream';

    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      res.status(206);
      res.set({
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize.toString(),
        'Content-Type': contentType,
      });

      const downloadStream = bucket.openDownloadStream(fileId, { start, end: end + 1 });
      downloadStream.pipe(res);
    } else {
      res.set({
        'Content-Length': fileSize.toString(),
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
      });

      const downloadStream = bucket.openDownloadStream(fileId);
      downloadStream.pipe(res);
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

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
