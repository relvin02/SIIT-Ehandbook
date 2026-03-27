# 👥 User Flows & Interaction Patterns

## 1. Student User Flow

### Welcome & Authentication

```
┌─────────────────────────────────┐
│  App Launch                     │
├─────────────────────────────────┤
│  Check stored auth token        │
└──────────────────┬──────────────┘
                   │
       ┌───────────┴────────────┐
       │                        │
       ▼                        ▼
   [Token Valid]            [No Token]
       │                        │
       ▼                        ▼
   Home Screen         Login/Register Screen
       │                        │
       │              ┌─────────┴────────┐
       │              │                  │
       │              ▼                  ▼
       │          [Login]            [Register]
       │              │                  │
       │              └────────┬─────────┘
       │                       ▼
       │                   Auth Server
       │                       │
       └───────────────────────┘
                   ▼
           Main App Navigation
```

### Homepage Interactions

```
┌─────────────────────────────────────┐
│  HOME SCREEN                        │
├─────────────────────────────────────┤
│  - View Latest Announcements        │
│  - Quick Access Buttons             │
│  - New Updates Badge                │
│  - Refresh Content                  │
└─────────────────────────────────────┘
           │
    ┌──────┼──────┬──────┬──────┐
    │      │      │      │      │
    ▼      ▼      ▼      ▼      ▼
Browse  Search  Bookmarks  Profile  More
Handbook
    │
    ▼
Select Category → Browse Sections
                       │
                       ▼
                    View Section
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
    [Bookmark]                   [Share/Back]
```

### Handbook Navigation Flow

```
┌──────────────────────────────────┐
│  HANDBOOK SCREEN                 │
├──────────────────────────────────┤
│  Categories: [Policy] [Rules]    │
│  [Academic] [Dress Code]         │
└──────────────────────────────────┘
         │
         ▼
    Category Selected
         │
         ▼
┌──────────────────────────────────┐
│  SECTIONS IN CATEGORY            │
│  - Section 1                     │
│  - Section 2                     │
│  - Section 3                     │
└──────────────────────────────────┘
         │ (Tap Section)
         ▼
┌──────────────────────────────────┐
│  SECTION DETAIL VIEW             │
│  ┌────────────────────────────┐ │
│  │ Title                      │ │
│  │ Category | Date | Author   │ │
│  └────────────────────────────┘ │
│  - [Bookmark] [Share]          │
│  - Meta information            │
│  - Full content (scrollable)   │
│  - Related sections            │
└──────────────────────────────────┘
```

### Search & Discovery

```
┌──────────────────────────────────┐
│  SEARCH SCREEN                   │
├──────────────────────────────────┤
│  [Search Box] [Clear]            │
│  "Type to search..."             │
└──────────────────────────────────┘
         │ (Type: "Attendance")
         ▼
    Searching... (Debounced)
         │
         ▼
┌──────────────────────────────────┐
│  SEARCH RESULTS                  │
│  ┌────────────────────────────┐ │
│  │ 📖 Attendance Policy       │ │
│  │ 90% match                  │ │
│  │ "Students must attend..."  │ │
│  └────────────────────────────┘ │
│  ┌────────────────────────────┐ │
│  │ 📢 Attendance Required     │ │
│  │ 70% match                  │ │
│  │ "Please ensure attendance" │ │
│  └────────────────────────────┘ │
└──────────────────────────────────┘
         │ (Tap Result)
         ▼
    Navigate to Content
```

### Bookmark Management

```
┌──────────────────────────────────┐
│  Viewing Section                 │
├──────────────────────────────────┤
│  [🔖 Bookmark]      [Share]      │
└──────────────────────────────────┘
         │ (Click Bookmark)
         ▼
    Add to Bookmarks
    (API call)
         │
         ▼
    [✓ Bookmarked]
         │ (Button changes state)
         ▼
┌──────────────────────────────────┐
│  BOOKMARKS SCREEN                │
├──────────────────────────────────┤
│  [✓ Stored Section 1]      [Remove X]
│  [✓ Stored Section 2]      [Remove X]
│  [✓ Stored Section 3]      [Remove X]
└──────────────────────────────────┘
         │ (Tap to view)
         ▼
    Open Bookmarked Section
```

### Profile Management

```
┌──────────────────────────────────┐
│  PROFILE SCREEN                  │
├──────────────────────────────────┤
│  👤 [Avatar]                     │
│  Name: John Doe                  │
│  Role: Student                   │
│  ┌────────────────────────────┐ │
│  │ Information                │ │
│  │ - Email: student@siit.edu  │ │
│  │ - Student ID: SIIT-001     │ │
│  │ - Member Since: Mar 2024   │ │
│  └────────────────────────────┘ │
│  [Edit Profile]                  │
│  [Notification Preferences]      │
│  [Help & Support]                │
│  [🚪 Logout]                     │
└──────────────────────────────────┘
```

---

## 2. Admin User Flow

### Admin Authentication

```
┌──────────────────────────────────┐
│  LOGIN SCREEN                    │
├──────────────────────────────────┤
│  Email: admin@siit.edu           │
│  Password: ••••••••              │
│  [Login]                         │
└──────────────────────────────────┘
         │
         ▼
    Auth Server (Admin role verified)
         │
         ▼
┌──────────────────────────────────┐
│  ADMIN DASHBOARD                 │
│  Tabs: [Dashboard] [Content] [P] │
└──────────────────────────────────┘
```

### Admin Dashboard

```
┌──────────────────────────────────┐
│  ADMIN DASHBOARD                 │
├──────────────────────────────────┤
│  📊 STATISTICS                   │
│  Sections: 24 | Users: 156       │
│  Announcements: 12               │
│  ┌────────────────────────────┐ │
│  │ [+ Create Announcement]    │ │
│  └────────────────────────────┘ │
│  ┌────────────────────────────┐ │
│  │ RECENT ANNOUNCEMENTS       │ │
│  │ 📌 Summer Break - [Delete] │ │
│  │ 📢 New Policy - [Delete]   │ │
│  └────────────────────────────┘ │
└──────────────────────────────────┘
```

### Content Management Flow

```
┌──────────────────────────────────┐
│  MANAGE CONTENT TAB               │
├──────────────────────────────────┤
│  [+ Create New Section]          │
│  ALL SECTIONS (24 total)         │
└──────────────────────────────────┘
         │
  ┌──────┴─────────┐
  │                │
  ▼ (Create)       ▼ (Manage)
  
Create Form    Sections List
┌──────────┐   ┌──────────────┐
│ Title    │   │ Section 1    │
│ Content  │   │ Category ... │
│ Category │   │ Date: ...    │
│ [Submit] │   │ [Delete X]   │
└──────────┘   └──────────────┘
  │
  ▼
Validate
  │
  ▼
Save to DB
  │
  ▼
Real-time
Update
  │
  ▼
Notify Users
```

### Announcement Management

```
┌──────────────────────────────────┐
│  CREATE ANNOUNCEMENT             │
├──────────────────────────────────┤
│  Title: [____________________]   │
│                                  │
│  Content: [____________________]│
│           [____________________]│
│           [____________________]│
│                                  │
│  ☐ Pin this announcement         │
│                                  │
│  [Post Announcement]             │
└──────────────────────────────────┘
         │
         ▼
    Validate Input
         │
    ┌────┴────┐
    │          │
    ▼          ▼
  Valid     Invalid
    │          │
    ▼          ▼
  Save    Show Error
    │       (Auto-dismiss)
    ▼
 Broadcast
 to All
 Users
    │
    ▼
Real-time
Notification
```

---

## 3. Notification Flow

### Announcement Notification

```
Admin Creates Announcement
    │
    ▼
API: POST /announcements
    │
    ▼
Server saves to DB
    │
    ▼
Socket.io broadcast
    │
    ▼
┌────────────────────────────────┐
│ All connected clients receive  │
│ announcement_created event     │
└────────────────────────────────┘
    │
    ▼
Client receives
    │
    ▼
Show Toast notification
    │
    ▼
Update announcements list
    │
    ▼
Mark as NEW (24h)
    │
    ▼
User sees badge/notification
```

---

## 4. Offline Support Flow

### Offline Content Access

```
App Launches
    │
    ├─ Check network
    │
    ├─ Online
    │   └─ Fetch fresh data from API
    │      └─ Cache to local storage
    │
    └─ Offline
        └─ Load from local cache
           (Previously loaded content)
           │
           └─ Show "Offline Mode" badge
              ├─ Allow reading content
              ├─ Prevent creating bookmarks
              └─ Queue sync for when online

Network restored
    │
    └─ Sync queued actions
       └─ Show sync status
```

---

## 5. Error Handling Flow

### Network Error Handling

```
User Action
    │
    ▼
API Request
    │
    ├─ Network Error
    │  └─ Show: "Check your connection"
    │     └─ [Retry] [Cancel]
    │
    ├─ 401 Unauthorized
    │  └─ Clear auth token
    │     └─ Redirect to Login
    │
    ├─ 403 Forbidden
    │  └─ Show: "You don't have permission"
    │
    ├─ 404 Not Found
    │  └─ Show: "Resource not found"
    │
    └─ 500 Server Error
       └─ Show: "Something went wrong"
          └─ [Retry] [Contact Support]
```

---

## 6. Data Sync Flow

### Real-time Content Updates

```
Admin updates handbook section
    │
    ▼
API: PUT /sections/:id
    │
    ▼
Update DB
    │
    ▼
WebSocket broadcast
    │
    ▼
Connected clients
    │
    ├─ If viewing that section
    │  └─ Show: "Content updated"
    │     └─ [Refresh]
    │
    └─ If not viewing
       └─ Mark section as updated
          └─ Show badge when navigating
```

---

## 7. Login/Logout Flow

### Session Management

```
Login Success
    │
    ▼
Save Token (AsyncStorage)
└─ Save Role (AsyncStorage)
    │
    ▼
Set Redux Auth State
    │
    ▼
Route to Main Navigation
    │
    └─ Based on role:
       ├─ Student → Student tabs
       └─ Admin → Admin tabs

Logout
    │
    ▼
Clear Token
└─ Clear Role
    │
    ▼
Clear Redux Auth State
    │
    ▼
Route to Login Screen
```

---

## 8. Search Experience

### Search User Journey

```
User types in search box
    │
    ▼ (Every keystroke)
Debounced search (500ms)
    │
    ├─ Less than 2 chars
    │  └─ Clear results
    │
    └─ 2+ chars
       └─ Show loading spinner
       └─ Query API: /search?q=...
          │
          ├─ Results found
          │  └─ Display results
          │     ├─ Sections (📖)
          │     └─ Announcements (📢)
          │     └─ Sorted by relevance
          │
          └─ No results
             └─ Show "No results found"
                └─ Suggest different keywords

User taps result
    │
    ▼
Navigate to content
    │
    └─ Clear search
```

---

These flows ensure smooth user experience and proper interaction patterns for both students and administrators.
