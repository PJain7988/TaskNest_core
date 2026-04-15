# TaskNest Pro - Quick Start Guide

## ⚡ 5-Minute Setup

### Prerequisites Check
```bash
node --version  # Should be v18+
npm --version   # Should be v9+
```

### 1. Extract & Install
```bash
unzip TaskNest-Enhanced.zip
cd TaskNest-Enhanced
npm install
```

### 2. Configure Backend
```bash
cd backend
cp .env.example .env
# Edit .env with your settings
cd ..
```

### 3. Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 4. Open Browser
```
http://localhost:5173
```

---

## 📍 Key Files to Modify

### Add New Page
1. Create: `frontend/src/pages/[pagename]/Page.tsx`
2. Add route in `frontend/src/App.tsx`:
```tsx
<Route path="/pagename" element={<Page />} />
```
3. Add sidebar link in `frontend/src/components/layout/Sidebar.tsx`

### Add New API Endpoint
1. Create: `backend/src/routes/[resource].routes.ts`
2. Import in `backend/src/server.ts`:
```ts
app.use('/api/[resource]', require('./routes/[resource].routes').default)
```

### Change Theme Colors
Edit `frontend/tailwind.config.ts`:
```ts
primary: '#YOUR_HEX_COLOR',
```

---

## 🔧 Common Commands

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Check code
npm run type-check   # TypeScript check
```

### Backend
```bash
npm run dev          # Start with auto-reload
npm run build        # Compile TypeScript
npm run start        # Run compiled version
npm run seed         # Populate sample data
```

### Root Level
```bash
npm run dev:frontend    # Start frontend only
npm run dev:backend     # Start backend only
npm run build:frontend  # Build frontend only
npm run build:backend   # Build backend only
```

---

## 📦 Project Structure

```
TaskNest-Enhanced/
├── frontend/              # React + Vite
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API calls
│   │   ├── types/        # TypeScript types
│   │   └── App.tsx       # Router
│   └── vite.config.ts
│
├── backend/               # Express + Node
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── models/       # DB models
│   │   ├── controllers/  # Logic
│   │   └── server.ts     # Entry point
│   └── tsconfig.json
│
└── [config files]
```

---

## 🎨 UI Components

### Pre-built Components
```tsx
// Stats card
<StatCard 
  icon={Users} 
  label="Team Members" 
  value={24} 
  change="+1" 
/>

// Buttons
<button className="btn-primary">Primary</button>
<button className="btn-secondary">Secondary</button>
<button className="btn-ghost">Ghost</button>
<button className="btn-danger">Danger</button>

// Badges
<span className="badge badge-primary">Primary</span>
<span className="badge badge-success">Success</span>
<span className="badge badge-warning">Warning</span>
<span className="badge badge-danger">Danger</span>

// Cards
<div className="card p-6">Card content</div>
<div className="card-interactive">Clickable</div>

// Input
<input className="input-base" type="text" />
<textarea className="input-base"></textarea>
```

---

## 🌐 API Endpoints

### Projects
```
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
```

### Tasks
```
GET    /api/tasks
POST   /api/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id
```

### Users
```
GET    /api/users
GET    /api/users/:id
GET    /api/users/me
PUT    /api/users/:id
```

---

## 🔌 Socket.IO Events

### Emit Events
```typescript
// Join project room
socket.emit('join-room', projectId)

// Update task
socket.emit('task-updated', {
  taskId: '123',
  status: 'done',
  updatedAt: new Date()
})
```

### Listen to Events
```typescript
// Task updated
socket.on('task-updated', (data) => {
  console.log('Task updated:', data)
})

// User joined
socket.on('user-joined', (data) => {
  console.log('User joined:', data)
})
```

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process on port 5000
lsof -i :5000
# Kill it
kill -9 <PID>

# Or change port in .env
PORT=5001
```

### CORS Error
✓ Check `CLIENT_URL` in `backend/.env`
✓ Ensure it matches your frontend URL
✓ Restart backend

### MongoDB Connection Failed
✓ Is MongoDB running? (`mongosh` to check)
✓ Check connection string in `.env`
✓ Verify credentials if using Atlas

### Node Modules Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

## 📚 File Locations

| What | Where |
|------|-------|
| React Components | `frontend/src/components/` |
| Page Components | `frontend/src/pages/` |
| API Calls | `frontend/src/services/api.ts` |
| Types | `frontend/src/types/index.ts` |
| Styles | `frontend/src/index.css` |
| Express Routes | `backend/src/routes/` |
| Environment | `backend/.env` |
| Config | `**/tsconfig.json` |

---

## 🎯 Development Workflow

1. **Start Servers**
   ```bash
   # Terminal 1
   cd backend && npm run dev
   
   # Terminal 2
   cd frontend && npm run dev
   ```

2. **Make Changes**
   - Frontend: Edit files in `frontend/src/`
   - Backend: Edit files in `backend/src/`
   - Hot reload works automatically

3. **Test Changes**
   - Open `http://localhost:5173`
   - Changes reflect instantly

4. **Build for Production**
   ```bash
   npm run build:frontend
   npm run build:backend
   ```

---

## 🚀 Deployment Checklist

- [ ] Remove console.log statements
- [ ] Set NODE_ENV=production
- [ ] Configure database connection
- [ ] Set strong JWT secret
- [ ] Enable HTTPS
- [ ] Set up error monitoring
- [ ] Configure email service
- [ ] Set up S3 bucket (if needed)
- [ ] Test all features
- [ ] Set up CI/CD pipeline

---

## 📖 Documentation Files

- `README.md` - Full documentation
- `SETUP.md` - Detailed setup guide
- `FEATURES.md` - Feature list
- `QUICK_START.md` - This file

---

## 💡 Tips

1. **Use TypeScript** - Define interfaces for type safety
2. **Follow Structure** - Keep files organized
3. **Reuse Components** - DRY principle
4. **Comment Code** - Future you will thank you
5. **Test Regularly** - Don't wait till the end
6. **Use .env Files** - Never hardcode secrets
7. **Check Logs** - Both frontend console & backend logs
8. **Validate Input** - Always validate user input
9. **Handle Errors** - Graceful error handling
10. **Performance** - Use React DevTools Profiler

---

## 🆘 Need Help?

1. Check `README.md` for detailed info
2. See `SETUP.md` for configuration
3. Review `FEATURES.md` for capabilities
4. Check browser console for errors
5. Check server logs for backend errors
6. Try clearing browser cache
7. Ensure both servers are running

---

## 🎉 You're Ready!

Start building amazing features! Happy coding! 🚀

For more info: See `README.md`
