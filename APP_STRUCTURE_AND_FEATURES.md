# SIIT E-Handbook Mobile Application
## Application Structure & Features Overview

---

## 1. Application Overview

The **SIIT E-Handbook** is a mobile application designed for **Siargao Island Institute of Technology (SIIT)** to digitize and streamline access to the student handbook, school announcements, institutional content, and administrative management. The app serves three types of users: **Students**, **Faculty/Staff**, and **Administrators**.

**Platform:** Android (Mobile Application)  
**Technology Stack:**
- **Frontend:** React Native (Expo) with TypeScript
- **Backend:** Node.js with Express.js
- **Database:** MongoDB
- **Hosting:** Render (Cloud Server)
- **Map Integration:** Google Maps
- **Push Notifications:** Expo Push Notifications

---

## 2. User Roles & Access

| Role | Description |
|------|-------------|
| **Student** | Access handbook, announcements, chatbot, bookmarks, gallery, org chart, and SIIT hymn. Location tracking enabled. |
| **Faculty/Staff** | Access handbook, announcements, bookmarks, gallery, org chart, and SIIT hymn. No location tracking. |
| **Administrator** | Full control: manage content, users, announcements, media, organizational chart, photo gallery, and monitor student locations. |

---

## 3. Application Features

### 3.1 Authentication & Security
- Secure login with email and password
- User registration with student ID verification
- JWT (JSON Web Token) based authentication
- Role-based access control (Student, Faculty, Admin)
- Password change and reset functionality

### 3.2 Digital Handbook
- Complete SIIT student handbook in digital format
- Organized by categories (Academic Policies, Student Conduct, Dress Code, Tuition & Fees, etc.)
- Section browsing with content preview
- Full section detail view
- Bookmark sections for quick access later

### 3.3 Smart Search
- Real-time search across all handbook content
- Supports **Tagalog and English** queries (e.g., "magbayad" finds Tuition & Fees)
- Relevance scoring for accurate results
- Search result highlighting
- 500ms debounce for performance

### 3.4 AI Chat Assistant
- Conversational chatbot that answers questions about the handbook
- Searches actual handbook content for accurate answers
- Quick-reply suggestions for common topics:
  - Admission requirements
  - Tuition fees
  - Scholarship information
  - Student conduct policies
  - Grading system
- Supports Tagalog queries and keywords

### 3.5 Announcements
- View latest school announcements
- Featured announcement carousel on Home screen
- Pinned announcements for important notices
- Pull-to-refresh for latest updates
- **Admin:** Create, pin/unpin, and delete announcements

### 3.6 Student Location Tracking
- **Students:** Real-time GPS location tracking (with permission)
- **Admin:** View all active students on an interactive satellite map
- Live location updates every 1-2 minutes
- Works in foreground and background
- Shows student name, ID, photo, and last update time on map markers
- Map view and List view toggle
- Active/Inactive status indicators
- Total students and active count display

### 3.7 Organizational Chart
- Visual display of SIIT organizational hierarchy
- Four levels: Chairman → Board of Trustees → Officers → Department Heads
- Color-coded level badges
- Member photos and positions
- **Admin:** Add, edit, and delete org chart members with photo upload

### 3.8 Photo Gallery
- Grid-style photo gallery for school events and activities
- Category-based filtering (e.g., Events, Campus, Activities)
- Fullscreen swipeable slideshow viewer
- Image title and description
- Slide counter and dot indicators
- **Admin:** Upload, edit, and delete photos with category assignment

### 3.9 SIIT Hymn
- Audio playback of the SIIT institutional hymn
- Play/pause controls with progress tracking
- SIIT branding and logo display
- **Admin:** Manage hymn audio file

### 3.10 Media & Video Management
- Video content library on the Home screen
- Autoplay video previews
- **Admin:** Upload and manage video content

### 3.11 User Profile
- View and edit personal information (name, email, student ID)
- Profile picture upload
- Change password
- Notification preferences
- Location tracking toggle (Students)
- Logout functionality

### 3.12 Bookmarks
- Save frequently accessed handbook sections
- Quick access from dedicated Bookmarks tab
- Add/remove bookmarks from any section
- Empty state with helpful message

### 3.13 Push Notifications
- Real-time push notifications for new announcements
- Notification preferences management
- Expo Push Notification integration

---

## 4. Admin Dashboard Features

The Administrator has a dedicated dashboard with the following capabilities:

| Feature | Description |
|---------|-------------|
| **Statistics Overview** | Total sections, announcements, and student counts |
| **Announcement Management** | Create, pin, and delete announcements |
| **Content Management** | Create, edit, and delete handbook sections with categories |
| **User Management** | Add, edit, delete users; assign roles; reset passwords; filter by role |
| **Student Locations** | Monitor real-time student locations on satellite map |
| **Media Management** | Upload and manage videos and SIIT hymn |
| **Organizational Chart** | Manage org chart members, positions, and photos |
| **Photo Gallery** | Upload and manage gallery photos with categories |

---

## 5. Application Structure

### 5.1 Screen Navigation

```
┌─────────────────────────────────────────────────────────────┐
│                    SIIT E-HANDBOOK APP                       │
│                                                             │
│                    ┌──────────────┐                         │
│                    │  Login Screen │                        │
│                    └──────┬───────┘                         │
│              ┌────────────┼────────────┐                    │
│              ▼            ▼            ▼                    │
│         ┌────────┐  ┌──────────┐  ┌────────┐              │
│         │Student │  │ Faculty  │  │ Admin  │              │
│         └───┬────┘  └────┬─────┘  └───┬────┘              │
│             │            │            │                     │
│    ┌────────┴────┐  ┌────┴────┐  ┌────┴──────────┐        │
│    │ 6 Tab Nav   │  │ 5 Tab   │  │ 5 Tab Nav     │        │
│    │             │  │ Nav     │  │               │        │
│    │• Home       │  │• Home   │  │• Dashboard    │        │
│    │• Handbook   │  │• Handbook│  │• Content Mgmt │        │
│    │• Search     │  │• Search │  │• User Mgmt    │        │
│    │• Bookmarks  │  │• Bookmarks│ │• Locations    │        │
│    │• Chat (AI)  │  │• Profile│  │• Profile      │        │
│    │• Profile    │  │         │  │               │        │
│    └─────────────┘  └─────────┘  └───────────────┘        │
│                                                             │
│    ┌─ Shared Modal Screens ─────────────────────────┐      │
│    │ • Section Detail    • Org Chart                │      │
│    │ • SIIT Hymn         • Photo Gallery            │      │
│    │ • Manage Media (Admin only)                    │      │
│    └────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│              MOBILE APP (React Native / Expo)            │
│                                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐ │
│  │ Screens │ │ Services│ │  Store  │ │   Assets    │ │
│  │ (16)    │ │ (API)   │ │ (Redux) │ │ (Images)    │ │
│  └────┬────┘ └────┬────┘ └────┬────┘ └─────────────┘ │
│       └───────────┼───────────┘                        │
│                   │ HTTPS / REST API                    │
└───────────────────┼─────────────────────────────────────┘
                    ▼
┌───────────────────────────────────────────────────────────┐
│              BACKEND SERVER (Node.js / Express)           │
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Auth Routes  │  │ Handbook     │  │ Announcement │   │
│  │ (JWT)        │  │ Routes       │  │ Routes       │   │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤   │
│  │ User Routes  │  │ Search       │  │ Bookmark     │   │
│  │              │  │ Routes       │  │ Routes       │   │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤   │
│  │ Location     │  │ OrgChart     │  │ Gallery      │   │
│  │ Routes       │  │ Routes       │  │ Routes       │   │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤   │
│  │ Media Routes │  │ Notification │  │ Profile      │   │
│  │              │  │ Routes       │  │ Routes       │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                          │                               │
└──────────────────────────┼───────────────────────────────┘
                           ▼
              ┌──────────────────────────┐
              │     MongoDB Database     │
              │                          │
              │  Collections:            │
              │  • Users                 │
              │  • Categories            │
              │  • Sections              │
              │  • Announcements         │
              │  • Bookmarks             │
              │  • Notifications         │
              │  • Media                 │
              │  • OrgChartMembers       │
              │  • Gallery               │
              └──────────────────────────┘
```

---

## 6. Feature Access Matrix

| Feature | Student | Faculty | Admin |
|---------|:-------:|:-------:|:-----:|
| View Home & Announcements | ✅ | ✅ | ✅ (Dashboard) |
| Browse Handbook | ✅ | ✅ | ✅ (Edit) |
| Search Handbook | ✅ | ✅ | — |
| Bookmark Sections | ✅ | ✅ | — |
| AI Chat Assistant | ✅ | — | — |
| View Org Chart | ✅ | ✅ | ✅ (Manage) |
| View Photo Gallery | ✅ | ✅ | ✅ (Manage) |
| Play SIIT Hymn | ✅ | ✅ | ✅ (Manage) |
| Edit Profile | ✅ | ✅ | ✅ |
| Location Tracking | ✅ (Active) | — | ✅ (Monitor) |
| Manage Announcements | — | — | ✅ |
| Manage Content | — | — | ✅ |
| Manage Users | — | — | ✅ |
| Manage Media | — | — | ✅ |

---

## 7. Key Technical Highlights

- **Cross-Platform:** Built with React Native, deployable on Android (iOS-ready)
- **Real-Time Updates:** Location tracking updates every 1-2 minutes with background support
- **Bilingual Support:** Search and chatbot support both English and Tagalog
- **Secure:** JWT authentication with role-based middleware protection
- **Cloud-Hosted:** Backend server and database hosted on cloud infrastructure
- **Push Notifications:** Real-time notification delivery for announcements
- **Satellite Map:** Google Maps satellite view for accurate location monitoring

---

## 8. Summary

The SIIT E-Handbook mobile application transforms the traditional printed student handbook into a comprehensive digital platform. It provides students with instant access to school policies, AI-powered assistance, and institutional content, while giving administrators powerful tools for content management, user oversight, and real-time student location monitoring — all in one unified mobile application.

**Total Screens:** 16  
**API Endpoints:** 30+  
**Database Collections:** 9  
**User Roles:** 3 (Student, Faculty, Admin)

---

*Developed for Siargao Island Institute of Technology (SIIT)*  
*SIIT E-Handbook Mobile Application © 2026*
