export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'manager' | 'user'
  status: 'active' | 'inactive'
  joinedAt: string
  createdAt?: string
}

export interface Project {
  id: string
  name: string
  description: string
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold'
  priority: 'low' | 'medium' | 'high' | 'critical'
  owner: User
  members: User[]
  progress: number
  startDate: string
  dueDate: string
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'review' | 'done'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignee: User
  project: Project
  dueDate: string
  attachments: Attachment[]
  comments: Comment[]
  createdAt: string
  updatedAt: string
}

export interface Attachment {
  id: string
  name: string
  url: string
  type: string
  size: number
  uploadedAt: string
}

export interface Comment {
  id: string
  author: User
  content: string
  createdAt: string
  updatedAt: string
}

export interface Message {
  id: string
  author: User
  content: string
  attachments?: Attachment[]
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  type: 'task' | 'project' | 'message' | 'mention'
  title: string
  message: string
  relatedId: string
  read: boolean
  createdAt: string
}

export interface ActivityLog {
  id: string
  user: User
  action: string
  type: string
  relatedId: string
  timestamp: string
}
