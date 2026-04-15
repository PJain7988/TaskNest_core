# TaskNest Pro - Setup Guide

## 📋 Quick Start

### Step 1: Extract and Navigate
```bash
unzip TaskNest-Enhanced.zip
cd TaskNest-Enhanced
```

### Step 2: Install Dependencies

**Using npm workspaces (recommended):**
```bash
npm install
```

**Or manually:**
```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
cd ..
```

### Step 3: Configure Environment

**Backend Configuration:**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/tasknest
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
```

**Frontend Configuration:**
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=TaskNest Pro
```

### Step 4: Start Development Servers

**Option 1: Parallel (requires 2 terminals)**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
# Server running at http://localhost:5000
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
# App running at http://localhost:5173
```

**Option 2: Using workspace scripts**
```bash
npm run dev:frontend   # Terminal 1
npm run dev:backend    # Terminal 2
```

### Step 5: Access the Application

Open your browser and navigate to:
```
http://localhost:5173
```

## 🗄️ Database Setup

### Local MongoDB

**Install MongoDB Community:**
- [Download MongoDB](https://www.mongodb.com/try/download/community)
- Follow installation guide for your OS

**Start MongoDB:**
```bash
# macOS with Homebrew
brew services start mongodb-community

# Windows
net start MongoDB

# Linux
sudo systemctl start mongod
```

**Verify Connection:**
```bash
mongosh
```

### MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Update `backend/.env`:
```
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/tasknest
```

## 🔑 API Testing

Use Postman or similar tools:

### Projects
```
GET  http://localhost:5000/api/projects
POST http://localhost:5000/api/projects
GET  http://localhost:5000/api/projects/:id
PUT  http://localhost:5000/api/projects/:id
DELETE http://localhost:5000/api/projects/:id
```

### Tasks
```
GET  http://localhost:5000/api/tasks
POST http://localhost:5000/api/tasks
GET  http://localhost:5000/api/tasks/:id
PUT  http://localhost:5000/api/tasks/:id
DELETE http://localhost:5000/api/tasks/:id
```

### Users
```
GET  http://localhost:5000/api/users
GET  http://localhost:5000/api/users/:id
GET  http://localhost:5000/api/users/me
PUT  http://localhost:5000/api/users/:id
```

## 🔧 Configuration Examples

### Email Setup (SMTP)

Update `backend/.env`:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
```

[Get Gmail App Password](https://myaccount.google.com/apppasswords)

### AWS S3 Setup (File Uploads)

Update `backend/.env`:
```
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

## 📦 Build for Production

### Frontend Build
```bash
cd frontend
npm run build
# Output: dist/
```

### Backend Build
```bash
cd backend
npm run build
npm start
# Output: dist/
```

## 🚀 Deployment Options

### Frontend - Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel
```

### Frontend - Netlify
```bash
# Deploy using Netlify CLI
npm run build
netlify deploy --prod --dir=dist
```

### Backend - Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway up
```

### Backend - Heroku
```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main
```

## 🐛 Common Issues

### "Cannot find module" errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port already in use
```bash
# Find process using port
lsof -i :5000
lsof -i :5173

# Kill process (on Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### CORS errors
- Check `CLIENT_URL` in `backend/.env`
- Ensure frontend URL is correct
- Verify CORS middleware in `backend/src/server.ts`

### MongoDB connection fails
- Verify MongoDB is running
- Check connection string
- Ensure database credentials are correct
- Test with mongosh

### Socket.IO not connecting
- Check WebSocket support in browser
- Verify CORS settings in Socket.IO configuration
- Check browser console for errors
- Ensure both servers are running

## 📚 Project Structure Overview

```
frontend/
├── src/
│   ├── components/       # Reusable React components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── hooks/           # Custom React hooks
│   ├── store/           # State management (Zustand)
│   ├── types/           # TypeScript types
│   ├── utils/           # Utility functions
│   ├── App.tsx          # Main app component
│   └── main.tsx         # React DOM render
├── vite.config.ts       # Vite configuration
├── tailwind.config.ts   # Tailwind CSS configuration
└── package.json

backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/      # Route controllers
│   ├── models/          # Database models (MongoDB)
│   ├── routes/          # API route handlers
│   ├── middleware/      # Express middleware
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── server.ts        # Express server setup
├── dist/                # Compiled output
└── package.json
```

## 🎨 Customization Tips

### Change Primary Color
Edit `frontend/tailwind.config.ts`:
```ts
primary: {
  DEFAULT: '#YOUR_COLOR',
  50: '#...',
  // ... other shades
}
```

### Add New Page
1. Create folder: `frontend/src/pages/new-page/`
2. Add component: `NewPage.tsx`
3. Import in `frontend/src/App.tsx`
4. Add route to router

### Add New API Endpoint
1. Create route: `backend/src/routes/new-route.routes.ts`
2. Import in `backend/src/server.ts`
3. Add to app routing

## 📖 Documentation Links

- [React 18 Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Express.js](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [Socket.IO Docs](https://socket.io/docs/)
- [Vite Guide](https://vitejs.dev/guide/)

## 💡 Tips & Best Practices

1. **Use TypeScript** - Define interfaces for all data
2. **Component Organization** - Keep components small and focused
3. **State Management** - Use Zustand for client state, React Query for server state
4. **API Calls** - Centralize in services/api.ts
5. **Error Handling** - Always handle errors gracefully
6. **Validation** - Use Zod for schema validation
7. **Testing** - Write tests for critical features
8. **Performance** - Use React.memo for expensive components
9. **Security** - Never expose secrets, use .env files
10. **Logging** - Use Winston on backend, console on frontend

## 🆘 Getting Help

- Check the README.md for detailed documentation
- Review source code comments
- Check browser DevTools console for errors
- Check server logs for backend errors
- Create an issue if stuck

---

**Happy coding! 🎉**
