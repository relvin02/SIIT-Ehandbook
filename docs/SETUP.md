# 🚀 Setup & Installation Guide

## Prerequisites

- **Node.js**: v16 or higher
- **npm** or **yarn**: Latest version
- **MongoDB**: Local or cloud instance (MongoDB Atlas)
- **React Native CLI**: For development
- **Expo CLI**: For easy setup and testing

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update `.env` with your values:

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/siit-ehandbook
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:3000
```

**MongoDB Connection Options:**

**Local MongoDB:**
```
MONGODB_URI=mongodb://localhost:27017/siit-ehandbook
```

**MongoDB Atlas (Cloud):**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/siit-ehandbook?retryWrites=true&w=majority
```

### 3. Create Database Indexes

```bash
npm run setup:db  # (optional setup script)
```

### 4. Start Development Server

```bash
npm run dev
```

Server will start at `http://localhost:5000`

### 5. Test API Health

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "API is running"
}
```

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure API URL

Update `frontend/src/services/apiClient.ts`:

```typescript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

Or set environment variable:

```bash
export REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Start Development Server

**Using Expo:**

```bash
npm start
```

**For Android:**

```bash
npm run android
```

**For iOS:**

```bash
npm run ios
```

**For Web:**

```bash
npm run web
```

---

## Development Workflow

### Project Structure

```
SIIT_EHandbook/
├── frontend/              # React Native mobile app
│   ├── src/
│   │   ├── App.tsx       # Main app entry
│   │   ├── screens/      # Screen components
│   │   ├── store/        # Redux store
│   │   ├── services/     # API services
│   │   └── types/        # TypeScript types
│   └── package.json
│
├── backend/               # Express API server
│   ├── src/
│   │   ├── index.ts      # Server entry
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API routes
│   │   └── middleware/   # Auth middleware
│   └── package.json
│
├── docs/                  # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── USER_FLOWS.md
│
└── README.md
```

### npm Scripts

**Backend:**
```bash
npm run dev           # Start dev server with hot reload
npm run build         # Build TypeScript to JS
npm start             # Start production server
npm test              # Run tests
npm run lint          # Run ESLint
```

**Frontend:**
```bash
npm start             # Start Expo development
npm run android       # Build for Android
npm run ios           # Build for iOS
npm run web           # Start web version
npm test              # Run tests
npm run lint          # Run ESLint
```

---

## 🔧 Configuration

### Backend Environment Variables

```env
# Server
NODE_ENV=development|production
PORT=5000

# Database
MONGODB_URI=mongodb://...

# JWT
JWT_SECRET=your_secret_key

# CORS
CLIENT_URL=http://localhost:3000

# Logging
LOG_LEVEL=debug|info|warn|error
```

### Frontend Configuration

Edit `frontend/src/services/apiClient.ts`:

```typescript
const API_URL = 'http://localhost:5000/api';  // Development
// const API_URL = 'https://api.siit.edu/api';  // Production
```

---

## Database Setup

### MongoDB Collection Structure

**Users Collection:**
```javascript
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password_hash', 'name', 'role'],
      properties: {
        email: { bsonType: 'string' },
        password_hash: { bsonType: 'string' },
        name: { bsonType: 'string' },
        role: { enum: ['student', 'admin'] }
      }
    }
  }
});

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ studentId: 1 }, { unique: true, sparse: true });
```

**Handbook Categories Collection:**
```javascript
db.categories.createIndex({ order: 1 });
```

**Sections Collection:**
```javascript
db.sections.createIndex({ categoryId: 1 });
db.sections.createIndex({ createdAt: -1 });
db.sections.createIndex({ isActive: 1 });
```

**Bookmarks Collection:**
```javascript
db.bookmarks.createIndex({ userId: 1, sectionId: 1 }, { unique: true });
```

---

## Testing

### Backend Tests

```bash
cd backend
npm test                  # Run all tests
npm test -- --watch      # Watch mode
npm test -- --coverage   # With coverage report
```

### Frontend Tests

```bash
cd frontend
npm test                  # Run all tests
npm test -- --watch      # Watch mode
npm test -- --coverage   # With coverage report
```

---

## Deployment Preparation

### Backend Deployment

1. **Build**:
   ```bash
   npm run build
   ```

2. **Set production environment**:
   ```bash
   NODE_ENV=production
   ```

3. **Deploy to cloud** (Heroku, AWS, Render, etc.):
   ```bash
   git push heroku main
   ```

### Frontend Deployment

**Expo EAS Build** (Recommended):

```bash
npm install -g eas-cli
eas build --platform android  # Build APK
eas build --platform ios      # Build IPA
```

**Alternative - Direct Build**:

```bash
# Android
npx react-native run-android --variant=release

# iOS
npx react-native run-ios --configuration Release
```

---

## Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
Solution: Ensure MongoDB is running
```bash
# macOS with Homebrew
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

**Port Already in Use:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :5000   # Windows
```

### Frontend Issues

**Metro Bundler Error:**
```bash
# Clear cache
npm start -- --reset-cache
```

**Module Not Found:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Demo Accounts

### Login Credentials

**Student Account:**
- Email: `student@siit.edu`
- Password: `password123`

**Admin Account:**
- Email: `admin@siit.edu`
- Password: `password123`

Create these accounts via registration or backend seeding.

---

## Performance Optimization

### Backend

1. **Enable Caching**:
   ```javascript
   // Add Redis for session caching
   ```

2. **Database Optimization**:
   - Create indexes on frequently queried fields
   - Use pagination for large datasets
   - Enable query logging

3. **Compression**:
   ```bash
   npm install compression
   ```

### Frontend

1. **Code Splitting**:
   - Implement lazy loading for screens
   - Use React.lazy() for components

2. **Image Optimization**:
   - Compress images
   - Use WebP format
   - Implement caching

3. **Bundle Size**:
   - Analyze with `expo-bundle-analyzer`
   - Remove unused dependencies

---

## Monitoring & Logging

### Backend Logging

```javascript
// Add to index.ts
import logger from './utils/logger';

app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});
```

### Error Tracking

```bash
npm install @sentry/node
```

---

## Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Enable HTTPS/SSL
- [ ] Set NODE_ENV=production
- [ ] Configure CORS properly
- [ ] Enable rate limiting
- [ ] Use environment variables
- [ ] Sanitize user inputs
- [ ] Update dependencies regularly
- [ ] Enable database authentication
- [ ] Use strong password requirements

---

## Next Steps

1. **Customize Branding**: Update colors and logos
2. **Add Email Notifications**: Configure SMTP
3. **Implement Caching**: Add Redis
4. **Setup CI/CD**: GitHub Actions or GitLab CI
5. **Monitor Performance**: Add APM tools
6. **Scale Infrastructure**: Implement load balancing

For more information, see [ARCHITECTURE.md](./ARCHITECTURE.md) and [API.md](./API.md)
