# 🏗️ SIIT E-Handbook System Architecture

## Overview

The SIIT E-Handbook is a full-stack mobile application designed with a client-server architecture, enabling seamless handbook management for educational institutions.

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      MOBILE APP (React Native)               │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐  │
│  │  Home    │ Handbook │ Search   │ Bookmarks│ Profile  │  │
│  └──────────┴──────────┴──────────┴──────────┴──────────┘  │
│                           │ HTTP/REST                        │
│                           │ JWT Auth                         │
└─────────────────────────────────────────────────────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway & Server                      │
│ (Express.js with routing, middleware, validation, auth)     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Authentication & JWT Token              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
          │            │              │              │
          ▼            ▼              ▼              ▼
    ┌─────────┐  ┌──────────┐  ┌───────────┐  ┌──────────┐
    │ Handbook │ │Announce- │ │ Bookmarks │ │ Profile  │
    │  Routes  │ │  ments   │ │  Routes   │ │  Routes  │
    └─────────┘  └──────────┘  └───────────┘  └──────────┘
          │            │              │              │
          └────────────┴──────────────┴──────────────┘
                       ▼
            ┌──────────────────────────┐
            │   MongoDB Database       │
            │  ┌─────────────────────┐ │
            │  │ Users / Sections    │ │
            │  │ Announcements       │ │
            │  │ Bookmarks           │ │
            │  │ Notifications       │ │
            │  │ Categories          │ │
            │  └─────────────────────┘ │
            └──────────────────────────┘
```

## Frontend Architecture

### Technology Stack
- **Framework**: React Native
- **Language**: TypeScript
- **UI**: React Native Components with Material Icons
- **State Management**: Redux (Redux Toolkit)
- **Navigation**: React Navigation (Bottom Tabs + Stack)
- **HTTP Client**: Axios with interceptors
- **Local Storage**: AsyncStorage
- **Offline Cache**: SQLite

### Directory Structure
```
frontend/
├── src/
│   ├── App.tsx                 # Main app entry point
│   ├── components/             # Reusable UI components
│   │   ├── Navigation.tsx
│   │   ├── Header.tsx
│   │   └── LoadingSpinner.tsx
│   ├── screens/                # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── HandbookScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   ├── BookmarksScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── SectionDetailScreen.tsx
│   │   ├── AdminDashboardScreen.tsx
│   │   ├── EditSectionScreen.tsx
│   │   └── AnnouncementsScreen.tsx
│   ├── store/                  # Redux store
│   │   ├── index.ts           # Store configuration
│   │   └── slices/            # Redux slices
│   ├── services/               # API services
│   │   └── apiClient.ts       # Axios instance with interceptors
│   ├── types/                  # TypeScript interfaces
│   │   └── index.ts
│   └── styles/                 # Global styles
│       └── colors.ts
└── app.json                   # Expo configuration
```

### State Management (Redux)

**Slices**:
1. **auth**: User authentication state
2. **handbook**: Handbook sections and categories
3. **announcements**: Announcements list
4. **bookmarks**: User bookmarks
5. **search**: Search results
6. **notifications**: User notifications

### Navigation Flow

```
┌─────────────────────────────────────────┐
│    LOGIN / REGISTER                     │
└──────────────────┬──────────────────────┘
                   │ Auth Success
         ┌─────────┴─────────┐
         │                   │
         ▼                   ▼
    ┌────────────┐      ┌────────────────┐
    │  STUDENT   │      │  ADMIN         │
    │  TABS      │      │  TABS          │
    ├────────────┤      ├────────────────┤
    │ Home       │      │ Dashboard      │
    │ Handbook   │      │ Edit Sections  │
    │ Search     │      │ Profile        │
    │ Bookmarks  │      └────────────────┘
    │ Profile    │
    └────────────┘
```

## Backend Architecture

### Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB
- **ODM**: Mongoose
- **Authentication**: JWT (JsonWebToken)
- **Password Hashing**: bcryptjs
- **Real-time**: Socket.io
- **Validation**: Input validation middleware

### API Structure

```
Express Server (Port 5000)
    │
    ├── /api/auth
    │   ├── POST /register
    │   ├── POST /login
    │   ├── POST /validate
    │   └── POST /logout
    │
    ├── /api/handbook
    │   ├── GET /categories
    │   ├── GET /sections
    │   ├── GET /sections/:id
    │   ├── POST /sections (Admin)
    │   ├── PUT /sections/:id (Admin)
    │   └── DELETE /sections/:id (Admin)
    │
    ├── /api/announcements
    │   ├── GET /
    │   ├── GET /:id
    │   ├── POST / (Admin)
    │   ├── PUT /:id (Admin)
    │   └── DELETE /:id (Admin)
    │
    ├── /api/bookmarks
    │   ├── GET /
    │   ├── POST /
    │   └── DELETE /:sectionId
    │
    ├── /api/search
    │   └── GET / (with query parameter)
    │
    ├── /api/profile
    │   ├── GET /
    │   └── PUT /
    │
    └── /api/notifications
        ├── GET /
        ├── PUT /:id/read
        └── PUT /read-all
```

### Middleware Stack

1. **CORS**: Cross-origin resource sharing
2. **Body Parser**: JSON and URL-encoded request parsing
3. **JWT Authentication**: Token verification and user identification
4. **Authorization**: Role-based access control (RBAC)
5. **Error Handler**: Centralized error handling

### Data Models

#### User Schema
```typescript
{
  email: string (unique)
  password_hash: string
  name: string
  studentId?: string (unique)
  role: 'student' | 'admin'
  avatar?: string
  phoneNumber?: string
  createdAt: Date
  updatedAt: Date
}
```

#### Section Schema
```typescript
{
  title: string
  content: string (supports HTML/rich text)
  categoryId: ObjectId (ref: Category)
  createdBy: ObjectId (ref: User)
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}
```

#### Announcement Schema
```typescript
{
  title: string
  content: string
  createdBy: ObjectId (ref: User)
  isPinned: boolean
  createdAt: Date
  updatedAt: Date
  isActive: boolean
}
```

#### Bookmark Schema
```typescript
{
  userId: ObjectId (ref: User)
  sectionId: ObjectId (ref: Section)
  createdAt: Date
}
```

#### Notification Schema
```typescript
{
  userId: ObjectId (ref: User)
  type: 'announcement' | 'update'
  title: string
  message: string
  isRead: boolean
  createdAt: Date
}
```

## Authentication & Authorization

### Authentication Flow

1. **Registration**: 
   - User provides email, password, name, studentId
   - Password hashed with bcrypt
   - User created with 'student' role

2. **Login**:
   - User provides email and password
   - Password verified against hash
   - JWT token generated with 7-day expiration
   - Token sent to client

3. **Token Usage**:
   - Client includes token in Authorization header
   - Server verifies token middleware
   - User info attached to request object

4. **Logout**:
   - Client removes token from storage
   - No server-side session invalidation needed

### Authorization (RBAC)

- **Student Role**: Read-only access to handbook, can bookmark, can view announcements
- **Admin Role**: Full CRUD on sections, announcements management, user profile edit

## Real-time Updates

### WebSocket Events (Socket.io)

```typescript
// Server emits to all clients
io.emit('announcement_created', announcementData)
io.emit('content_updated', contentData)

// Client subscribes to events
socket.on('announcement_created', handleNewAnnouncement)
socket.on('content_updated', handleContentUpdate)
```

## Caching & Offline Support

### Frontend Caching Strategy

1. **AsyncStorage**: Simple key-value storage for auth tokens, user prefs
2. **Redux Store**: In-memory cache for current session
3. **SQLite**: Local database for offline content access

### Offline Support

- Content pre-cached on demand
- Sync queue for offline actions
- Automatic sync when connection restored

## Security Measures

1. **Input Validation**: All user inputs validated before processing
2. **Password Hashing**: bcryptjs with salt rounds
3. **JWT Tokens**: Secure token-based authentication
4. **CORS**: Origin validation for cross-origin requests
5. **HTTPS**: SSL/TLS in production
6. **Rate Limiting**: (Optional) API rate limiting
7. **SQL Injection Prevention**: Mongoose with typed queries

## Performance Optimization

1. **Database Indexing**: Indexes on frequently queried fields
2. **Pagination**: Results paginated (optional, future)
3. **Caching**: Redis for session caching (optional)
4. **Code Splitting**: React Native code splitting
5. **Lazy Loading**: Screen and component lazy loading
6. **Image Optimization**: Compressed images and CDN (future)

## Error Handling

### Frontend
- Global error boundary
- User-friendly error messages
- Automatic token refresh on 401
- Graceful offline handling

### Backend
- Centralized error middleware
- Structured error responses
- Request validation error messages
- Database error handling

## Logging & Monitoring

- Console logging in development
- Winston logger (optional) in production
- API request/response logging
- Error tracking with Sentry (optional)

## Scalability Considerations

1. **Horizontal Scaling**: Stateless API design
2. **Database**: MongoDB sharding for large datasets
3. **CDN**: Content delivery for static assets
4. **Load Balancing**: Nginx/HAProxy for API
5. **Caching Layer**: Redis for session and data caching

## Deployment

### Frontend
- Expo EAS Build for iOS/Android builds
- App Store and Google Play distribution

### Backend
- Docker containerization
- Kubernetes orchestration (optional)
- CI/CD with GitHub Actions
- Environment-based configuration

---

This architecture ensures scalability, reliability, and maintainability while providing a smooth user experience for both students and administrators.
