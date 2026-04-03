import axios, { AxiosRequestConfig, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use Render cloud URL for all platforms
const API_URL = 'https://siit-ehandbook-api.onrender.com/api';

// Create Axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add request interceptor to include token
apiClient.interceptors.request.use(
  async (config: any) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response: any) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired - clear storage and logout
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userRole');
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication Service
 */
export const authService = {
  async login(studentId: string, password: string) {
    const response = await apiClient.post('/auth/login', { studentId, password });
    const { token, user } = response.data.data;

    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('userRole', user.role);

    return response.data;
  },

  async logout() {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('userRole');
  },

  async getMe() {
    const response = await apiClient.get('/auth/me');
    return response.data.data;
  },

  async validateToken(token: string) {
    try {
      const response = await apiClient.post('/auth/validate', { token });
      return response.data.success;
    } catch {
      return false;
    }
  },
};

/**
 * Handbook Service
 */
export const handbookService = {
  async getAllSections() {
    const response = await apiClient.get('/handbook/sections');
    return response.data.data;
  },

  async getSectionsByCategory(categoryId: string) {
    const response = await apiClient.get(`/handbook/sections?category=${categoryId}`);
    return response.data.data;
  },

  async getSectionDetail(sectionId: string) {
    const response = await apiClient.get(`/handbook/sections/${sectionId}`);
    return response.data.data;
  },

  async getCategories() {
    const response = await apiClient.get('/handbook/categories');
    return response.data.data;
  },

  async createSection(data: any) {
    const response = await apiClient.post('/handbook/sections', data);
    return response.data.data;
  },

  async updateSection(sectionId: string, data: any) {
    const response = await apiClient.put(`/handbook/sections/${sectionId}`, data);
    return response.data.data;
  },

  async deleteSection(sectionId: string) {
    const response = await apiClient.delete(`/handbook/sections/${sectionId}`);
    return response.data;
  },
};

/**
 * Announcements Service
 */
export const announcementsService = {
  async getAnnouncements() {
    const response = await apiClient.get('/announcements');
    return response.data.data;
  },

  async getAnnouncementDetail(announcementId: string) {
    const response = await apiClient.get(`/announcements/${announcementId}`);
    return response.data.data;
  },

  async createAnnouncement(data: any) {
    const response = await apiClient.post('/announcements', data);
    return response.data.data;
  },

  async updateAnnouncement(announcementId: string, data: any) {
    const response = await apiClient.put(`/announcements/${announcementId}`, data);
    return response.data.data;
  },

  async deleteAnnouncement(announcementId: string) {
    const response = await apiClient.delete(`/announcements/${announcementId}`);
    return response.data;
  },
};

/**
 * Bookmarks Service
 */
export const bookmarksService = {
  async getBookmarks() {
    const response = await apiClient.get('/bookmarks');
    return response.data.data;
  },

  async addBookmark(sectionId: string) {
    const response = await apiClient.post('/bookmarks', { sectionId });
    return response.data.data;
  },

  async removeBookmark(sectionId: string) {
    const response = await apiClient.delete(`/bookmarks/${sectionId}`);
    return response.data;
  },
};

/**
 * Search Service
 */
export const searchService = {
  async search(query: string) {
    const response = await apiClient.get('/search', { params: { q: query } });
    return response.data.data;
  },
};

/**
 * Profile Service
 */
export const profileService = {
  async getProfile() {
    const response = await apiClient.get('/profile');
    return response.data.data;
  },

  async updateProfile(data: any) {
    const response = await apiClient.put('/profile', data);
    return response.data.data;
  },

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await apiClient.put('/profile/change-password', { currentPassword, newPassword });
    return response.data;
  },
};

/**
 * Notifications Service
 */
export const notificationsService = {
  async getNotifications() {
    const response = await apiClient.get('/notifications');
    return response.data.data;
  },

  async markAsRead(notificationId: string) {
    const response = await apiClient.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  async markAllAsRead() {
    const response = await apiClient.put('/notifications/read-all');
    return response.data;
  },
};

/**
 * User Management Service (Admin only)
 */
export const userManagementService = {
  async getUsers(role?: string) {
    const params = role ? `?role=${role}` : '';
    const response = await apiClient.get(`/auth/users${params}`);
    return response.data.data;
  },

  // Keep backward compat alias
  async getStudents() {
    return this.getUsers();
  },

  async createUser(data: { name: string; studentId?: string; email?: string; password: string; role?: string }) {
    const response = await apiClient.post('/auth/users', data);
    return response.data;
  },

  // Keep backward compat alias
  async createStudent(data: { name: string; studentId: string; password: string }) {
    return this.createUser(data);
  },

  async updateStudent(id: string, data: { name?: string; password?: string }) {
    const response = await apiClient.put(`/auth/users/${id}`, data);
    return response.data;
  },

  async deleteStudent(id: string) {
    const response = await apiClient.delete(`/auth/users/${id}`);
    return response.data;
  },

  async resetPassword(id: string, password: string) {
    const response = await apiClient.post(`/auth/users/${id}/reset-password`, { password });
    return response.data;
  },
};

/**
 * Media Service (Videos, SIIT Hymn)
 */
export const mediaService = {
  async getAll() {
    const response = await apiClient.get('/media');
    return response.data.data;
  },

  async getVideos() {
    const response = await apiClient.get('/media/videos');
    return response.data.data;
  },

  async getHymn() {
    const response = await apiClient.get('/media/hymn');
    return response.data.data;
  },

  async create(data: { title: string; type: string; url: string; description?: string; lyrics?: string; thumbnailUrl?: string; order?: number }) {
    const response = await apiClient.post('/media', data);
    return response.data.data;
  },

  async update(id: string, data: any) {
    const response = await apiClient.put(`/media/${id}`, data);
    return response.data.data;
  },

  async delete(id: string) {
    const response = await apiClient.delete(`/media/${id}`);
    return response.data;
  },

  async uploadFile(fileUri: string, fileName: string, mimeType: string) {
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      name: fileName,
      type: mimeType,
    } as any);

    const token = await AsyncStorage.getItem('authToken');
    const response = await fetch(`${API_URL}/media/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.message || 'Upload failed');
    return data.data;
  },

  getStreamUrl(fileId: string) {
    return `${API_URL}/media/stream/${fileId}`;
  },
};

/**
 * Org Chart Service
 */
export const orgChartService = {
  async getAll() {
    const response = await apiClient.get('/orgchart');
    return response.data.data;
  },

  async create(data: { name: string; position: string; image?: string; parentId?: string; order?: number; level?: number }) {
    const response = await apiClient.post('/orgchart', data);
    return response.data.data;
  },

  async update(id: string, data: { name?: string; position?: string; image?: string; parentId?: string; order?: number; level?: number }) {
    const response = await apiClient.put(`/orgchart/${id}`, data);
    return response.data.data;
  },

  async remove(id: string) {
    const response = await apiClient.delete(`/orgchart/${id}`);
    return response.data;
  },
};

export default apiClient;
