# SIIT E-Handbook Mobile Application
### Siargao Island Institute of Technology
### Comprehensive App Overview & Features

---

## 1. PROJECT OVERVIEW

The **SIIT E-Handbook** is a full-featured mobile application designed for the **Siargao Island Institute of Technology (SIIT)**. It replaces the traditional paper-based student handbook with a modern, interactive, and real-time digital platform accessible to students, faculty, and administrators.

| Detail | Description |
|--------|-------------|
| **Platform** | Android (Mobile) |
| **Technology** | React Native with Expo |
| **Backend** | Node.js / Express.js REST API |
| **Database** | MongoDB (Cloud) |
| **Hosting** | Render (Backend), EAS Build (App) |
| **Real-Time** | Socket.IO (WebSockets) |
| **Notifications** | Firebase Cloud Messaging (FCM) |

---

## 2. USER ROLES & ACCESS

The app supports **three user roles**, each with different access levels:

### 👨‍🎓 Student
- View the digital handbook (browse by category, search)
- Bookmark important sections for quick access
- Receive push notifications for announcements & emergencies
- Use the AI Chat Assistant for handbook Q&A
- View school calendar, org chart, photo gallery, SIIT hymn
- Submit feedback (with option for anonymity)
- Location tracking (for campus safety monitoring)
- Assigned to a **department** (BSIT, BSOA, BSTM, BSAIS, BSCRIM, BSED/BEED)
- View department-specific org chart, vision, mission, goals, objectives & policies

### 👨‍🏫 Faculty / Staff
- All student features **except** AI Chat Assistant and location tracking
- View announcements and emergency alerts
- Browse and bookmark handbook content

### 👨‍💼 Administrator
- **Dashboard** with statistics (total sections, students, announcements)
- Create, edit, and delete **announcements** (with push notification broadcast)
- Manage **handbook content** (add/edit/delete sections by category)
- Manage **user accounts** (create, edit, delete students/faculty) with **department assignment**
- Monitor **student locations** on real-time satellite map
- Issue **emergency alerts** (broadcast to all users instantly)
- Manage **school calendar** events
- Upload & manage **media** (videos, SIIT hymn)
- Manage **organizational chart**
- Manage **photo gallery**
- View & manage **student feedback** with analytics

---

## 3. APP FEATURES

### 3.1 📖 Digital Handbook
- Complete institutional handbook organized by **categories**
- Full-text **search** with bilingual support (English & Tagalog)
- **Bookmark** sections for quick reference
- Clean, readable content display

### 3.2 📢 Announcements System
- Admin creates announcements from the dashboard
- **Push notifications** sent instantly to all students
- **Real-time updates** via Socket.IO (no need to refresh)
- **Pin** important announcements to the top
- Edit and soft-delete announcements

### 3.3 🤖 AI Chat Assistant (Students Only)
- Students can ask questions about the handbook
- Intelligent search through handbook content
- Quick-reply suggestions for common topics
- Natural conversational interface

### 3.4 📍 Student Location Tracking
- Real-time GPS tracking of students on campus
- Admin views all student locations on a **satellite/hybrid map**
- **Custom map pins** with student avatar photos
- **Clustering** — nearby students grouped with count badge
- Tap cluster to see list of students at that location
- Active (blue) vs Inactive (orange) status indicators
- Background location updates every 2 minutes
- List view with coordinates and last update time

### 3.5 🚨 Emergency Alert System
- Admin broadcasts emergency alerts to **all users** instantly
- Three severity levels: **Critical**, **Warning**, **Info**
- Real-time delivery via push notification + Socket.IO
- Alert banners appear on the Home Screen
- Auto-expiration support
- Deactivate alerts when resolved

### 3.6 📅 School Calendar
- Event categories: Enrollment, Exams, Holidays, Graduation, Semester Break, Events
- Admin can add, edit, and delete events
- View events by month
- All-day event support

### 3.7 💬 Feedback System
- Students submit feedback with a **1-5 star rating**
- Categories: Academics, Facilities, Services, Faculty, Administration, Other
- **Anonymous submission** option for honest feedback
- Admin dashboard with:
  - Status tracking: Pending → Reviewed → Resolved
  - Average rating analytics
  - Filter by category and status

### 3.8 🏛️ Organizational Chart (Two-Tab System)
The org chart is split into **two separate views** via a tab switcher:

**🏫 School Tab** — General school-wide org chart:
  - **Level 1:** Chairman / President
  - **Level 2:** Board of Trustees
  - **Level 3:** Officers / Directors
  - **Level 4:** Department Heads
  - **Level 5:** Instructors

**🏢 Department Tab** — Per-department org chart:
  - **Level 1:** President
  - **Level 2:** VP Academics
  - **Level 3:** Dean
  - **Level 4:** Instructors
  - Admin selects which department to view/manage
  - Students automatically see only their own department

- Photos and position titles for each member
- Admin can add, edit, and delete members per level

### 3.9 📋 Department Information
Each department has its own info section (visible on the Department tab):
- **Vision** — Department's vision statement
- **Mission** — Department's mission statement
- **Goals** — Department goals
- **Objectives** — Department objectives
- **Policies** — Department-specific policies (e.g., "Laboratory Policies" for BSIT)
- Admin can customize the policies section label per department
- Admin edits content via a modal; students view it read-only

**Supported Departments:**
| Code | Department |
|------|------------|
| BSIT | Bachelor of Science in Information Technology |
| BSOA | Bachelor of Science in Office Administration |
| BSTM | Bachelor of Science in Tourism Management |
| BSAIS | Bachelor of Science in Accounting Information System |
| BSCRIM | Bachelor of Science in Criminology |
| BSED/BEED | Bachelor of Secondary/Elementary Education |

### 3.10 🖼️ Photo Gallery
- Category-based photo collections
- Fullscreen slideshow viewer with swipe navigation
- Slide counter
- Admin upload and management

### 3.11 🎵 SIIT Hymn
- Audio playback of the institutional hymn
- Play/pause controls with progress bar

### 3.12 🎬 Media / Videos ("Through the Years")
- Video content showcasing school history and events
- Autoplay preview on Home Screen carousel
- Admin upload with GridFS storage
- Streaming with seek support

### 3.13 👤 User Profile Management
- Edit name, phone number, and avatar photo
- Change password
- Dark/Light mode toggle
- Logout with confirmation

### 3.14 🌙 Dark Mode
- Full dark/light theme support across all screens
- Toggle in Profile settings
- Theme preference saved and persisted

### 3.15 🔔 Push Notifications
- Firebase Cloud Messaging (FCM) integration
- Notification for new announcements
- Notification for emergency alerts
- Custom Android notification channel
- Sound and vibration

### 3.16 ⚡ Real-Time Updates
- **Socket.IO** WebSocket connection
- Announcements appear/update/disappear instantly across all devices
- Emergency alerts broadcast in real-time
- No manual refresh required

---

## 4. APP NAVIGATION FLOW

```
┌─────────────────────────────────────────────┐
│                 LOGIN SCREEN                │
│         (Student ID/Email + Password)        │
└──────────────────┬──────────────────────────┘
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼
  ┌─────────┐ ┌─────────┐ ┌─────────┐
  │ STUDENT │ │ FACULTY │ │  ADMIN  │
  └────┬────┘ └────┬────┘ └────┬────┘
       │           │           │
       ▼           ▼           ▼
```

### Student Navigation (6 Tabs)
```
📱 Bottom Navigation Bar
├── 🏠 Home ────────── Announcements, Videos, Quick Actions, Emergency Alerts
├── 📖 Handbook ────── Browse sections by category
├── 🔍 Search ──────── Search handbook content
├── 🔖 Bookmarks ───── Saved sections
├── 👤 Profile ──────── Settings, Dark Mode, Logout
└── 💬 Assistant ────── AI Chat for handbook Q&A

📄 Additional Screens (via navigation)
├── Section Detail ──── Full handbook section content
├── SIIT Hymn ──────── Audio player
├── Org Chart ──────── School administration hierarchy
├── Gallery ─────────── Photo collections
├── School Calendar ─── Events and academic dates
└── Feedback ────────── Submit rating and comments
```

### Faculty Navigation (5 Tabs)
```
📱 Bottom Navigation Bar
├── 🏠 Home ────────── Announcements, Videos, Quick Actions
├── 📖 Handbook ────── Browse sections
├── 🔍 Search ─────── Search content
├── 🔖 Bookmarks ──── Saved sections
└── 👤 Profile ─────── Settings, Logout

📄 Additional Screens
├── Section Detail, SIIT Hymn, Org Chart, Gallery
├── School Calendar
└── Feedback (Submit)
```

### Admin Navigation (5 Tabs)
```
📱 Bottom Navigation Bar
├── 📊 Dashboard ────── Stats, Manage Announcements
├── ✏️ Content ──────── Edit/Create Handbook Sections
├── 👥 Students ─────── Manage User Accounts
├── 🗺️ Locations ────── Real-Time Student Map
└── 👤 Profile ──────── Settings, Logout

📄 Additional Screens
├── SIIT Hymn
├── Manage Media ────── Upload videos
├── Org Chart ──────── Manage hierarchy (School + Department tabs)
├── Gallery ─────────── Manage photos
├── Emergency Alerts ── Create/manage alerts
├── School Calendar ─── Manage events
└── Feedback Mgmt ──── View/respond to student feedback
```

---

## 5. SYSTEM ARCHITECTURE

```
┌──────────────────────────────────────────────────────┐
│                   MOBILE APP (Frontend)               │
│              React Native + Expo SDK 54               │
│                                                      │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│  │ Screens │ │  Redux   │ │ Services │ │ Socket  │ │
│  │  (20+)  │ │  Store   │ │  (API)   │ │   IO    │ │
│  └────┬────┘ └────┬─────┘ └────┬─────┘ └────┬────┘ │
└───────┼───────────┼────────────┼────────────┼───────┘
        │           │            │            │
        ▼           ▼            ▼            ▼
┌──────────────────────────────────────────────────────┐
│              BACKEND SERVER (API)                      │
│         Node.js + Express.js + Socket.IO              │
│              Hosted on Render                         │
│                                                      │
│  ┌──────────┐ ┌───────────┐ ┌──────────────────────┐│
│  │  40+ API │ │   Auth    │ │   Push Notifications ││
│  │ Endpoints│ │Middleware │ │  (Firebase / Expo)   ││
│  └────┬─────┘ └───────────┘ └──────────────────────┘│
└───────┼──────────────────────────────────────────────┘
        │
        ▼
┌──────────────────────────────────────────────────────┐
│                   DATABASE                            │
│              MongoDB (Cloud Atlas)                     │
│                                                      │
│  Collections: Users, Sections, Categories,            │
│  Announcements, Bookmarks, Notifications,             │
│  Media, OrgChart, Gallery, EmergencyAlerts,           │
│  CalendarEvents, Feedback, DepartmentInfo             │
│  (13 Collections Total)                               │
└──────────────────────────────────────────────────────┘
```

---

## 6. SECURITY FEATURES

| Feature | Implementation |
|---------|----------------|
| **Authentication** | JWT (JSON Web Token) with 7-day expiry |
| **Password Security** | Bcrypt hashing (never stored as plain text) |
| **Role-Based Access** | Middleware enforces student/faculty/admin permissions |
| **API Protection** | All sensitive endpoints require authentication |
| **Token Validation** | Auto-logout on token expiry |

---

## 7. TECHNICAL STATISTICS

| Metric | Count |
|--------|-------|
| **Total Screens** | 20+ |
| **API Endpoints** | 45+ |
| **Database Collections** | 13 |
| **User Roles** | 3 (Student, Faculty, Admin) |
| **Departments** | 6 (BSIT, BSOA, BSTM, BSAIS, BSCRIM, BSED/BEED) |
| **Real-Time Events** | 6 (Socket.IO) |
| **Push Notification Types** | 2 (Announcements, Emergency) |
| **Frontend Services** | 15+ |
| **Redux State Slices** | 5 |

---

## 8. KEY BENEFITS

1. **Paperless** — No more printing and distributing physical handbooks
2. **Always Updated** — Admin can edit content anytime, students see changes immediately
3. **Instant Communication** — Push notifications and real-time alerts reach all users
4. **Student Safety** — Real-time location monitoring for campus safety
5. **Accessible** — Students can search and bookmark handbook content anytime
6. **Feedback Loop** — Students can provide anonymous feedback directly to admin
7. **Emergency Ready** — Instant broadcast of emergency alerts to all users
8. **Modern & Professional** — Clean UI with dark mode support
9. **Department-Organized** — Each program has its own org chart, vision, mission, goals, objectives & policies
10. **Scalable** — Easy to add new departments or modify existing organizational structures

---

## 9. FUTURE POSSIBILITIES

- iOS version deployment
- Attendance tracking integration
- Grade/enrollment verification
- Multi-language full translation
- Offline handbook access
- QR code-based features
- Integration with school LMS

---

**Developed for Siargao Island Institute of Technology**
**Platform: Android | Version: 1.0.0**
