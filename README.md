# TaskNest Pro 🚀

A professional project management and team collaboration platform built with MERN stack (MongoDB, Express, React, Node.js) + Vite.

## ✨ Features

### Dashboard
- **Real-time Analytics** - Task completion metrics, project progress tracking
- **Interactive Charts** - Bar, Line, and Pie charts using Recharts
- **Quick Stats** - Active projects, completed tasks, team members, pending items
- **Recent Activity** - Latest task updates and project changes

### Projects
- **Grid & List Views** - Switch between different layouts
- **Progress Tracking** - Visual progress bars for each project
- **Status Management** - Plan, In Progress, Completed, On Hold
- **Team Assignment** - Manage team members per project
- **Due Date Tracking** - Never miss deadlines

### Tasks
- **Kanban Board** - Drag and drop tasks between columns
- **Priority Levels** - Low, Medium, High, Critical
- **Status Workflow** - Todo → In Progress → Review → Done
- **Task Details** - Titles, descriptions, assignments, due dates
- **Real-time Updates** - WebSocket integration with Socket.IO

### Team Management
- **Member Profiles** - Name, role, contact information
- **Status Indicators** - Active, Away, Offline status
- **Direct Messaging** - In-app team communication
- **Team Stats** - Member count, departments, activity

### Chat & Collaboration
- **Real-time Messaging** - Instant team communication
- **Message History** - Full conversation logs
- **File Attachments** - Share documents and files
- **Conversation Groups** - Team channels and direct messages

### User Profile
- **Profile Management** - Edit personal information
- **Activity Feed** - Track user actions and milestones
- **Achievement Stats** - Tasks completed, projects led, team size
- **Member Since** - Account tenure tracking

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first CSS
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Zustand** - Client state management
- **Recharts** - Data visualization
- **Radix UI** - Accessible components
- **Framer Motion** - Animations
- **Socket.IO Client** - Real-time updates
- **Lucide React** - Icons
- **Zod** - Schema validation

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Node.js** - Runtime
- **MongoDB** - Database
- **Socket.IO** - Real-time communication
- **JWT** - Authentication
- **Multer** - File uploads
- **AWS S3** - Cloud storage
- **Helmet** - Security
- **Morgan** - Logging
- **Zod** - Validation

## 📁 Project Structure

```
TaskNest-Enhanced/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Layout.tsx
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── Sidebar.tsx
│   │   │   └── ui/
│   │   │       └── StatCard.tsx
│   │   ├── pages/
│   │   │   ├── dashboard/
│   │   │   ├── projects/
│   │   │   ├── tasks/
│   │   │   ├── team/
│   │   │   ├── chat/
│   │   │   └── profile/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── store/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── index.html
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   │   ├── projects.routes.ts
│   │   │   ├── tasks.routes.ts
│   │   │   └── users.routes.ts
│   │   ├── middleware/
│   │   ├── services/
│   │   ├── utils/
│   │   └── server.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.example
├── .gitignore
├── README.md
└── package.json (root)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB (local or Atlas)

### Installation

#### 1. Clone the repository
```bash
git clone <repository-url>
cd TaskNest-Enhanced
```

#### 2. Install Dependencies

**Frontend:**
```bash
cd frontend
npm install
```

**Backend:**
```bash
cd backend
npm install
```

#### 3. Environment Setup

**Backend (.env):**
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

**Frontend (.env):**
```bash
cd frontend
cp .env.example .env
# Edit .env if needed
```

#### 4. Run Development Servers

**Start Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Start Frontend (new terminal):**
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

## 📝 Available Scripts

### Frontend
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run format       # Format code with Prettier
```

### Backend
```bash
npm run dev          # Start dev server with nodemon
npm run build        # Compile TypeScript
npm run start        # Run production build
npm run seed         # Seed database
npm run lint         # Run ESLint
npm run test         # Run tests
npm run type-check   # TypeScript type checking
```

## 🎨 Customization

### Theme Colors
Edit `frontend/tailwind.config.ts` to customize colors:
```ts
colors: {
  primary: '#4F46E5',      // Main brand color
  secondary: '#1E293B',    // Secondary color
  accent: '#F59E0B',       // Accent color
  success: '#10B981',      // Success color
  warning: '#F59E0B',      // Warning color
  danger: '#EF4444',       // Error color
}
```

### CSS Variables
Global CSS variables in `frontend/src/index.css`:
```css
--radius: 0.5rem;
--border: 213 31% 91%;
--primary: 263 70% 50%;
--background: 210 40% 98%;
--foreground: 213 13% 23%;
```

## 🔐 Security Features

- **Helmet.js** - Sets HTTP headers for security
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Prevents brute force attacks
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Zod schema validation
- **Password Hashing** - bcryptjs for secure passwords
- **Environment Variables** - Sensitive data protection

## 📊 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Projects
```
GET    /projects              - Get all projects
GET    /projects/:id          - Get project by ID
POST   /projects              - Create new project
PUT    /projects/:id          - Update project
DELETE /projects/:id          - Delete project
```

#### Tasks
```
GET    /tasks                 - Get all tasks
GET    /tasks/:id             - Get task by ID
POST   /tasks                 - Create new task
PUT    /tasks/:id             - Update task
DELETE /tasks/:id             - Delete task
```

#### Users
```
GET    /users                 - Get all users
GET    /users/:id             - Get user by ID
GET    /users/me              - Get current user
PUT    /users/:id             - Update user
```

## 🔄 Real-time Features

### Socket.IO Events
```javascript
// Join a project/task room
socket.emit('join-room', roomId)

// Task updates
socket.on('task-updated', (data) => {})
socket.emit('task-updated', taskData)

// User presence
socket.on('user-joined', (data) => {})
socket.on('user-left', (data) => {})
```

## 🎯 Key Features in Detail

### Dashboard
- Real-time task completion metrics
- Project health status
- Team performance analytics
- Recent activity feed

### Kanban Board
- Drag and drop functionality
- Real-time task movement
- Priority-based coloring
- Quick task creation

### Team Collaboration
- In-app messaging
- User presence indicators
- Activity tracking
- File sharing

## 🚢 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the dist folder
```

### Backend (Heroku/Railway)
```bash
npm run build
npm start
```

## 📈 Performance Optimizations

- Code splitting with Vite
- Lazy loading components
- Optimized re-renders with React Query
- Image optimization
- CSS minification
- Server-side caching
- Database indexing

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in .env
PORT=5001
```

### MongoDB Connection Error
- Ensure MongoDB is running
- Check connection string in .env
- Verify database credentials

### CORS Error
- Check CLIENT_URL in backend .env
- Verify frontend URL matches

### Socket.IO Connection Failed
- Check Socket.IO CORS settings
- Ensure both servers are running
- Check browser console for errors

## 📚 Learning Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Socket.IO Documentation](https://socket.io/docs/)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 💬 Support

For support, email support@tasknest.com or create an issue in the repository.

## 🙏 Acknowledgments

- Thanks to all contributors
- Inspired by modern project management tools
- Built with ❤️ for teams

---

**Made with ❤️ by TaskNest Team**

Last Updated: April 2024
