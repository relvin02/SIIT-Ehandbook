# 📱 SIIT E-Handbook Mobile App

A comprehensive mobile application for SIIT students to access handbook content, announcements, and student information seamlessly.

## 🎯 Overview

The SIIT E-Handbook is a fully functional mobile app that serves as a digital handbook for students with robust admin features for content management. Built with React Native and TypeScript for cross-platform compatibility (iOS & Android).

## ✨ Key Features

### 📖 For Students
- **Handbook Access**: Browse organized handbook sections by categories
- **Search**: Real-time search across all handbook content
- **Bookmarks**: Save important sections for quick access
- **Announcements**: View latest school announcements
- **Notifications**: Get notified of new updates
- **User Profile**: Manage student information
- **Offline Mode**: Access previously loaded content offline

### ⚙️ For Admins
- **Content Management**: Create, edit, and delete handbook sections
- **Announcement Posting**: Post and manage announcements
- **Category Management**: Organize content into categories
- **Content Updates**: Immediate reflection of changes across the app

## 🏗️ Project Structure

```
SIIT_EHandbook/
├── frontend/                    # React Native mobile app
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── screens/            # App screens/pages
│   │   ├── navigation/         # Navigation configuration
│   │   ├── services/           # API services & utilities
│   │   ├── store/              # State management (Redux)
│   │   ├── styles/             # Global styles
│   │   ├── types/              # TypeScript types
│   │   └── App.tsx             # App entry point
│   ├── app.json                # React Native config
│   ├── package.json            # Dependencies
│   └── tsconfig.json           # TypeScript config
│
├── backend/                     # Backend API (Node.js/Express)
│   ├── src/
│   │   ├── routes/             # API endpoints
│   │   ├── controllers/        # Business logic
│   │   ├── models/             # Database schemas
│   │   ├── middleware/         # Auth & validation
│   │   ├── services/           # Business logic
│   │   └── index.ts            # Server entry
│   ├── package.json
│   └── tsconfig.json
│
├── docs/                        # Documentation
│   ├── ARCHITECTURE.md         # System architecture
│   ├── API.md                  # API documentation
│   ├── USER_FLOWS.md           # User interaction flows
│   └── SETUP.md                # Setup instructions
│
└── .github/
    └── copilot-instructions.md # Copilot configuration
```

## 🚀 Features Breakdown

### 1. **Handbook System**
- Categories: School Policies, Code of Conduct, Academic Rules, etc.
- Rich content with headings, paragraphs, lists
- Scroll-friendly layouts
- Organized hierarchy

### 2. **Search Function**
- Fast keyword search across all content
- Instant results display
- Highlighting of search terms

### 3. **Bookmarks**
- Save/unsave sections
- Quick access tab
- Persistent storage

### 4. **Announcements**
- Post system with title, content, date
- New announcement highlighting
- Chronological ordering

### 5. **Notifications**
- Push notifications for new announcements
- Content update alerts
- Configurable preferences

### 6. **Admin Dashboard**
- Content CRUD operations
- Announcement management
- Category organization

### 7. **User Authentication**
- Student login/registration
- Admin authentication
- Role-based access control

### 8. **Offline Support**
- Cache mechanism
- Previously loaded content available offline
- Automatic sync when online

## 🎨 Design

- **Modern Mobile UI**: Clean, intuitive interface
- **School-Themed Colors**: Professional appearance
- **Card-Based Layout**: Easy-to-scan sections
- **Smooth Animations**: Polished user experience
- **Bottom Navigation**: Standard mobile navigation
- **Dark Mode Support**: Optional dark theme

## 📱 Navigation Structure

```
┌─────────────────────────────┐
│  Home / Handbook / Search   │
│  Bookmarks / Profile        │
├─────────────────────────────┤
│                             │
│   Screen Content (Scrollable)
│                             │
├─────────────────────────────┤
│ Home│Handbook│Search│...    │  ← Bottom Navigation
└─────────────────────────────┘
```

## 🔐 Security

- Secure authentication (JWT tokens)
- Role-based access control (RBAC)
- Admin-only content modification
- Read-only access for students
- Encrypted data transmission

## 🔄 Data Flow

1. **Students**: Login → View Content → Search/Bookmark → Receive Notifications
2. **Admins**: Login → Content Management → Post Announcements → Changes Propagate to All Users
3. **Real-time Updates**: WebSocket connections for live updates

## ⚡ Tech Stack

### Frontend
- **React Native**: Cross-platform mobile framework
- **TypeScript**: Strong typing
- **Redux**: State management
- **React Navigation**: Navigation library
- **Axios**: HTTP client
- **Sqlite**: Local storage/offline

### Backend
- **Node.js**: Runtime
- **Express.js**: Web framework
- **PostgreSQL/MongoDB**: Database
- **JWT**: Authentication
- **Socket.io**: Real-time updates
- **Multer**: File uploads

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v16+)
- npm or yarn
- React Native CLI
- Expo CLI (optional)

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

## 📖 Documentation

- **[Architecture](docs/ARCHITECTURE.md)**: System design and components
- **[API Documentation](docs/API.md)**: Endpoint specifications
- **[User Flows](docs/USER_FLOWS.md)**: Interaction patterns
- **[Setup Guide](docs/SETUP.md)**: Detailed setup instructions

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Handbook
- `GET /api/handbook/sections` - Get all sections
- `GET /api/handbook/sections/{id}` - Get section details
- `POST /api/handbook/sections` - Create section (Admin)
- `PUT /api/handbook/sections/{id}` - Update section (Admin)
- `DELETE /api/handbook/sections/{id}` - Delete section (Admin)

### Announcements
- `GET /api/announcements` - Get announcements
- `POST /api/announcements` - Create announcement (Admin)
- `DELETE /api/announcements/{id}` - Delete announcement (Admin)

### Bookmarks
- `GET /api/bookmarks` - Get user bookmarks
- `POST /api/bookmarks/{sectionId}` - Add bookmark
- `DELETE /api/bookmarks/{sectionId}` - Remove bookmark

### Profile
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile

## 📊 Database Schema

### Users
- id, email, password_hash, role, created_at

### Handbook_Sections
- id, category_id, title, content, created_by, created_at, updated_at

### Categories
- id, name, description, order

### Announcements
- id, title, content, created_by, created_at, is_pinned

### Bookmarks
- id, user_id, section_id, created_at

- **Notifications**
- id, user_id, title, message, is_read, created_at

## 🚦 Getting Started

1. Clone the repository
2. Install dependencies for both frontend and backend
3. Configure environment variables
4. Set up database
5. Run backend server: `npm run dev`
6. Run frontend: `npm start`
7. Access admin panel at `/admin`

## 📝 License

SIIT E-Handbook © 2024

## 👥 Contributors

Created for SIIT Student Community

---

For detailed documentation, navigate to the `/docs` folder.
