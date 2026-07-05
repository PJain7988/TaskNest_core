import express, { Express, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import 'express-async-errors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import connectDB from './config/db'
import authRoutes from './routes/auth.routes'

// Load environment variables
dotenv.config()

// Connect to Database
connectDB()

const app: Express = express()
const httpServer = createServer(app)
const baseOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://task-nest-core-frontend.vercel.app'
]
const envOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()) : []
const clientUrl = process.env.CLIENT_URL ? [process.env.CLIENT_URL.trim()] : []
const allowedOrigins = Array.from(new Set([...baseOrigins, ...envOrigins, ...clientUrl]))

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
})

// Middleware
app.use(helmet() as any)
app.use(compression() as any)
app.use(morgan('dev') as any)
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}) as any)

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
})
app.use('/api/', limiter as any)

// Routes
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  })
})

import { protect } from './middleware/auth'

// API v1 routes
const API_PREFIX = process.env.API_PREFIX || '/api/v1'
app.use(`${API_PREFIX}/auth`, authRoutes)
app.use(`${API_PREFIX}/projects`, protect, require('./routes/projects.routes').default)
app.use(`${API_PREFIX}/tasks`, protect, require('./routes/tasks.routes').default)
app.use(`${API_PREFIX}/users`, protect, require('./routes/users.routes').default)
app.use(`${API_PREFIX}/ai`, protect, require('./routes/ai.routes').default)

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.path} not found`,
  })
})

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
})

// Socket.IO events
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id)

  socket.on('join-room', (roomId: string) => {
    socket.join(roomId)
    io.to(roomId).emit('user-joined', {
      userId: socket.id,
      timestamp: new Date(),
    })
  })

  socket.on('task-updated', (data) => {
    io.emit('task-updated', data)
  })

  socket.on('send-message', (data) => {
    io.to(data.roomId).emit('receive-message', data)
  })

  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('typing', data)
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// Start server
const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📡 Socket.IO server ready`)
})

export { app, io }
