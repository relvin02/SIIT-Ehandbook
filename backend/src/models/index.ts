import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password_hash: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true,
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'faculty'],
    default: 'student',
  },
  department: {
    type: String,
    enum: ['BSIT', 'BSOA', 'BSTM', 'BSAIS', 'BSCRIM', 'BSED/BEED', null],
    default: null,
  },
  avatar: String,
  phoneNumber: String,
  expoPushToken: {
    type: String,
    default: null,
  },
  location: {
    latitude: {
      type: Number,
      default: null,
    },
    longitude: {
      type: Number,
      default: null,
    },
    lastUpdate: {
      type: Date,
      default: null,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Handbook Category Schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: String,
  icon: String,
  order: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Handbook Section Schema
const sectionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

// Announcement Schema
const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

// Bookmark Schema
const bookmarkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create unique index for userId and sectionId
bookmarkSchema.index({ userId: 1, sectionId: 1 }, { unique: true });

// Notification Schema
const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['announcement', 'update'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: String,
  isRead: {
    type: Boolean,
    default: false,
  },
  data: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Export models
export const User = mongoose.model('User', userSchema);
export const Category = mongoose.model('Category', categorySchema);
export const Section = mongoose.model('Section', sectionSchema);
export const Announcement = mongoose.model('Announcement', announcementSchema);
export const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
export const Notification = mongoose.model('Notification', notificationSchema);

// Media Schema (for Through the Years videos, SIIT Hymn audio, etc.)
const mediaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['video', 'audio'],
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  description: String,
  lyrics: String,
  thumbnailUrl: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const Media = mongoose.model('Media', mediaSchema);

// OrgChart Member Schema
const orgChartMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    required: true,
  },
  image: {
    type: String, // base64 or URL
    default: null,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OrgChartMember',
    default: null,
  },
  order: {
    type: Number,
    default: 0,
  },
  level: {
    type: Number,
    default: 0, // 0 = top (chairman), 1 = board members, 2 = officers, etc.
  },
  department: {
    type: String,
    default: null, // null = general (shared across all), set = department-specific
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const OrgChartMember = mongoose.model('OrgChartMember', orgChartMemberSchema);

// Gallery Schema (admin uploads images, students view as slideshow)
const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  image: {
    type: String, // base64
    required: true,
  },
  category: {
    type: String,
    default: 'General',
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Gallery = mongoose.model('Gallery', gallerySchema);

// Emergency Alert Model
const emergencyAlertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ['critical', 'warning', 'info'],
    default: 'critical',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const EmergencyAlert = mongoose.model('EmergencyAlert', emergencyAlertSchema);

// Calendar Event Model
const calendarEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  eventType: {
    type: String,
    enum: ['enrollment', 'exam', 'holiday', 'graduation', 'sembreak', 'event', 'other'],
    default: 'event',
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    default: null,
  },
  isAllDay: {
    type: Boolean,
    default: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);

// Feedback Model
const feedbackSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['academics', 'facilities', 'services', 'faculty', 'administration', 'other'],
    default: 'other',
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Feedback = mongoose.model('Feedback', feedbackSchema);
