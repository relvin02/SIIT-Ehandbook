// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role?: 'student' | 'admin' | 'faculty';
  studentId?: string;
  department?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Handbook types
export interface HandbookCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  order: number;
}

export interface HandbookSection {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  categoryName?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isBookmarked?: boolean;
}

export interface RichContent {
  headings: string[];
  paragraphs: string[];
  lists: string[][];
  images?: string[];
}

// Announcement types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  isNew?: boolean;
}

// Bookmark types
export interface Bookmark {
  id: string;
  userId: string;
  sectionId: string;
  section?: HandbookSection;
  createdAt: Date;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: 'announcement' | 'update';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  data?: Record<string, any>;
}

// Search types
export interface SearchResult {
  type: 'section' | 'announcement';
  id: string;
  title: string;
  content: string;
  highlightedContent: string;
  relevance: number;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm extends LoginForm {
  name: string;
  studentId: string;
}

export interface CreateSectionForm {
  title: string;
  content: string;
  categoryId: string;
}

export interface CreateAnnouncementForm {
  title: string;
  content: string;
  isPinned: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
