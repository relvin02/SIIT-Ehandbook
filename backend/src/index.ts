import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import mongoose from 'mongoose';
import { Server as SocketIOServer } from 'socket.io';

// Import routes
import authRoutes from './routes/auth.routes';
import handbookRoutes from './routes/handbook.routes';
import announcementRoutes from './routes/announcements.routes';
import bookmarkRoutes from './routes/bookmarks.routes';
import searchRoutes from './routes/search.routes';
import profileRoutes from './routes/profile.routes';
import notificationRoutes from './routes/notifications.routes';
import mediaRoutes from './routes/media.routes';
import locationRoutes from './routes/location.routes';
import orgchartRoutes from './routes/orgchart.routes';
import galleryRoutes from './routes/gallery.routes';
import emergencyRoutes from './routes/emergency.routes';
import calendarRoutes from './routes/calendar.routes';
import feedbackRoutes from './routes/feedback.routes';
import departmentInfoRoutes from './routes/department-info.routes';

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
export const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'API is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/handbook', handbookRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/orgchart', orgchartRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/department-info', departmentInfoRoutes);

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// WebSocket events
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 5000;

// Connect to MongoDB first, then start server
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/siit-ehandbook';
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
