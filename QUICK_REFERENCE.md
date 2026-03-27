# 🚀 Quick Reference Guide

## Getting Started (Copy & Paste)

### Backend Start
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend Start
```bash
cd frontend
npm install
npm start
```

---

## Directory Quick Reference

```
frontend/
  ├── src/App.tsx              # Main app
  ├── src/screens/             # 10 screens
  ├── src/store/               # Redux
  ├── src/services/            # API calls
  └── src/types/               # TypeScript

backend/
  ├── src/index.ts             # Server
  ├── src/models/              # Database
  ├── src/routes/              # Endpoints
  └── src/middleware/          # Auth
```

---

## Important Files

| File | Purpose |
|------|---------|
| `frontend/src/App.tsx` | Main navigation |
| `backend/src/index.ts` | Server entry |
| `backend/src/models/index.ts` | Database schemas |
| `docs/ARCHITECTURE.md` | System design |
| `docs/API.md` | Endpoint reference |
| `docs/SETUP.md` | Installation |

---

## Demo Credentials

```
Student Login:
Email: student@siit.edu
Password: password123

Admin Login:
Email: admin@siit.edu
Password: password123
```

---

## API Base URL

**Development:**
```
http://localhost:5000/api
```

**Production:**
```
https://your-domain.com/api
```

---

## Key Endpoints

```
Auth:
POST   /api/auth/register
POST   /api/auth/login

Handbook:
GET    /api/handbook/categories
GET    /api/handbook/sections
GET    /api/handbook/sections/:id
POST   /api/handbook/sections          (Admin)
PUT    /api/handbook/sections/:id      (Admin)
DELETE /api/handbook/sections/:id      (Admin)

Announcements:
GET    /api/announcements
POST   /api/announcements              (Admin)
DELETE /api/announcements/:id          (Admin)

Bookmarks:
GET    /api/bookmarks
POST   /api/bookmarks
DELETE /api/bookmarks/:sectionId

Search:
GET    /api/search?q=query

Profile:
GET    /api/profile
PUT    /api/profile
```

---

## Common Tasks

### Add a New Screen

1. Create file: `frontend/src/screens/NewScreen.tsx`
2. Implement React component
3. Add to navigation in `App.tsx`

### Add API Endpoint

1. Create route: `backend/src/routes/new.routes.ts`
2. Add routes logic
3. Import in `backend/src/index.ts`

### Database Queries

```typescript
// Find user
const user = await User.findOne({ email: 'test@siit.edu' });

// Create section
const section = new Section({ title, content, categoryId });
await section.save();

// Delete with soft delete
await Section.findByIdAndUpdate(id, { isActive: false });
```

---

## Redux Usage

```typescript
// Dispatch action
dispatch(handbookActions.setSections(data));

// Get state
const { sections } = useSelector((state: RootState) => state.handbook);
```

---

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/siit-ehandbook
JWT_SECRET=your_secret_key
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

---

## Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# Build
cd backend && npm run build
cd frontend && npm run build
```

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Dependencies Issue
```bash
rm -rf node_modules package-lock.json
npm install
```

### MongoDB Connection Error
Ensure MongoDB is running:
```bash
brew services start mongodb-community  # macOS
sudo service mongod start              # Linux
```

---

## Performance Tips

1. **Search**: Uses 500ms debounce
2. **API Calls**: JWT interceptors handle tokens
3. **State**: Redux prevents unnecessary re-renders
4. **Database**: Indexes on frequently queried fields

---

## Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Update dependencies regularly
- [ ] Use strong passwords

---

## Deployment Checklist

### Backend
- [ ] Set production env variables
- [ ] Build: `npm run build`
- [ ] Test production build
- [ ] Deploy to server

### Frontend
- [ ] Build APK/IPA: `eas build`
- [ ] Test on device
- [ ] Upload to App Store/Google Play

---

## Useful Commands

```bash
# Frontend
npm start              # Dev server
npm run android        # Build for Android
npm run ios           # Build for iOS
npm test              # Run tests
npm run lint          # Lint code

# Backend
npm run dev           # Dev server
npm run build         # Compile TypeScript
npm start             # Run compiled JS
npm test              # Run tests
npm run lint          # Lint code
```

---

## Code Structure

### Frontend Component Template
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  navigation: any;
};

const MyScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text>Hello</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MyScreen;
```

### Backend Route Template
```typescript
import express from 'express';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticate, async (req, res) => {
  try {
    // Your logic here
    res.json({ success: true, data: [] });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
```

---

## Resources

- [React Native Docs](https://reactnative.dev)
- [Express.js Docs](https://expressjs.com)
- [MongoDB Docs](https://docs.mongodb.com)
- [Redux Docs](https://redux.js.org)
- [TypeScript Docs](https://www.typescriptlang.org)

---

## Support

For detailed documentation, see:
- 📖 `docs/ARCHITECTURE.md` - System design
- 📋 `docs/API.md` - API reference
- 🚀 `docs/SETUP.md` - Installation guide
- 👥 `docs/USER_FLOWS.md` - User interactions

---

## License

SIIT E-Handbook © 2024 - All Rights Reserved

---

**Happy Coding! 🎉**
