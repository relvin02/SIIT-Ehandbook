# 📋 API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints

### Register (Student)

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "student@siit.edu",
  "password": "password123",
  "name": "John Doe",
  "studentId": "SIIT-001"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "user_id",
      "email": "student@siit.edu",
      "name": "John Doe",
      "role": "student"
    }
  }
}
```

---

### Login

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "student@siit.edu",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "user_id",
      "email": "student@siit.edu",
      "name": "John Doe",
      "role": "student",
      "studentId": "SIIT-001"
    }
  }
}
```

---

### Validate Token

**Endpoint:** `POST /auth/validate`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Token is valid"
}
```

---

## 📖 Handbook Endpoints

### Get Categories

**Endpoint:** `GET /handbook/categories`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "category_id",
      "name": "School Policies",
      "description": "General school policies",
      "order": 1
    }
  ]
}
```

---

### Get All Sections

**Endpoint:** `GET /handbook/sections`

**Query Parameters:**
- `category` (optional): Filter by category ID

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "section_id",
      "title": "Attendance Policy",
      "content": "Students must attend...",
      "categoryId": "category_id",
      "categoryName": "School Policies",
      "createdAt": "2024-03-26T10:30:00Z",
      "updatedAt": "2024-03-26T10:30:00Z",
      "createdBy": "admin_id"
    }
  ]
}
```

---

### Get Section Detail

**Endpoint:** `GET /handbook/sections/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "section_id",
    "title": "Attendance Policy",
    "content": "Students must attend...",
    "categoryId": "category_id",
    "categoryName": "School Policies",
    "createdAt": "2024-03-26T10:30:00Z",
    "updatedAt": "2024-03-26T10:30:00Z",
    "createdBy": "admin_id"
  }
}
```

---

### Create Section (Admin Only)

**Endpoint:** `POST /handbook/sections`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "title": "New Policy",
  "content": "Policy details here...",
  "categoryId": "category_id"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Section created",
  "data": {
    "id": "section_id",
    "title": "New Policy",
    "content": "Policy details here...",
    "categoryId": "category_id",
    "categoryName": "School Policies",
    "createdAt": "2024-03-26T10:30:00Z"
  }
}
```

---

### Update Section (Admin Only)

**Endpoint:** `PUT /handbook/sections/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "title": "Updated Policy",
  "content": "Updated details...",
  "categoryId": "category_id"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Section updated",
  "data": { ... }
}
```

---

### Delete Section (Admin Only)

**Endpoint:** `DELETE /handbook/sections/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Section deleted"
}
```

---

## 📢 Announcements Endpoints

### Get All Announcements

**Endpoint:** `GET /announcements`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "announcement_id",
      "title": "Summer Break",
      "content": "School will be closed...",
      "createdBy": "Admin",
      "createdAt": "2024-03-26T10:30:00Z",
      "updatedAt": "2024-03-26T10:30:00Z",
      "isPinned": true,
      "isNew": true
    }
  ]
}
```

---

### Create Announcement (Admin Only)

**Endpoint:** `POST /announcements`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "title": "Important Notice",
  "content": "Please read carefully...",
  "isPinned": false
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Announcement created",
  "data": {
    "id": "announcement_id",
    "title": "Important Notice",
    "content": "Please read carefully...",
    "createdAt": "2024-03-26T10:30:00Z",
    "isPinned": false
  }
}
```

---

### Delete Announcement (Admin Only)

**Endpoint:** `DELETE /announcements/:id`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Announcement deleted"
}
```

---

## ⭐ Bookmarks Endpoints

### Get User Bookmarks

**Endpoint:** `GET /bookmarks`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "bookmark_id",
      "sectionId": "section_id",
      "section": {
        "id": "section_id",
        "title": "Attendance Policy",
        "categoryName": "School Policies",
        "createdAt": "2024-03-26T10:30:00Z"
      },
      "createdAt": "2024-03-26T11:00:00Z"
    }
  ]
}
```

---

### Add Bookmark

**Endpoint:** `POST /bookmarks`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "sectionId": "section_id"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Bookmark added",
  "data": {
    "id": "bookmark_id",
    "sectionId": "section_id",
    "createdAt": "2024-03-26T11:00:00Z"
  }
}
```

---

### Remove Bookmark

**Endpoint:** `DELETE /bookmarks/:sectionId`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Bookmark removed"
}
```

---

## 🔍 Search Endpoints

### Search Content

**Endpoint:** `GET /search?q=<query>`

**Query Parameters:**
- `q` (required): Search query (minimum 2 characters)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "type": "section",
      "id": "section_id",
      "title": "Attendance Policy",
      "content": "Students must attend...",
      "highlightedContent": "Students must attend classes...",
      "relevance": 0.9
    },
    {
      "type": "announcement",
      "id": "announcement_id",
      "title": "Attendance Required",
      "content": "Please ensure attendance...",
      "highlightedContent": "Please ensure attendance records...",
      "relevance": 0.7
    }
  ]
}
```

---

## 👤 Profile Endpoints

### Get User Profile

**Endpoint:** `GET /profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "student@siit.edu",
    "name": "John Doe",
    "studentId": "SIIT-001",
    "role": "student",
    "createdAt": "2024-03-26T10:30:00Z"
  }
}
```

---

### Update Profile

**Endpoint:** `PUT /profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Smith",
  "phoneNumber": "+1234567890"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Profile updated",
  "data": {
    "id": "user_id",
    "email": "student@siit.edu",
    "name": "John Smith",
    "phoneNumber": "+1234567890"
  }
}
```

---

## 🔔 Notifications Endpoints

### Get User Notifications

**Endpoint:** `GET /notifications`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "notification_id",
      "type": "announcement",
      "title": "New Announcement",
      "message": "Summer break starts soon",
      "isRead": false,
      "createdAt": "2024-03-26T10:30:00Z"
    }
  ]
}
```

---

### Mark Notification as Read

**Endpoint:** `PUT /notifications/:id/read`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

### Mark All as Read

**Endpoint:** `PUT /notifications/read-all`

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "All fields required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

## Rate Limiting (Optional)

Future implementation:
- 100 requests per minute per IP
- 10 requests per second per user

---

## Pagination (Optional)

Future parameter support:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
