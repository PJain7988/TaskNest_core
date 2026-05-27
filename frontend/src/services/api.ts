import axios, { AxiosInstance } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'

const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const api = {
  // Auth
  login: (data: any) => axiosInstance.post('/auth/login', data),
  register: (data: any) => axiosInstance.post('/auth/register', data),
  getMe: () => axiosInstance.get('/auth/me'),

  // Projects
  getProjects: () => axiosInstance.get('/projects'),
  getProject: (id: string) => axiosInstance.get(`/projects/${id}`),
  createProject: (data: any) => axiosInstance.post('/projects', data),
  updateProject: (id: string, data: any) => axiosInstance.put(`/projects/${id}`, data),
  deleteProject: (id: string) => axiosInstance.delete(`/projects/${id}`),
  getDashboardStats: () => axiosInstance.get('/projects/stats'),

  // Tasks
  getTasks: () => axiosInstance.get('/tasks'),
  createTask: (data: any) => axiosInstance.post('/tasks', data),
  updateTask: (id: string, data: any) => axiosInstance.put(`/tasks/${id}`, data),
  deleteTask: (id: string) => axiosInstance.delete(`/tasks/${id}`),

  // Users
  getUsers: () => axiosInstance.get('/users'),
  updateUser: (id: string, data: any) => 
    axiosInstance.put(`/users/${id}`, data, data instanceof FormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : undefined),
  deleteUser: (id: string) => axiosInstance.delete(`/users/${id}`),
  updateSettings: (data: any) => axiosInstance.put('/users/settings', data),
  setup2FA: () => axiosInstance.post('/users/2fa/setup'),
  verify2FA: (token: string) => axiosInstance.post('/users/2fa/verify', { token }),

  // AI Copilot
  summarizeProject: (projectId: string) => axiosInstance.get(`/ai/summarize/${projectId}`),
  generateTasks: (data: any) => axiosInstance.post('/ai/generate-tasks', data),
  chatCopilot: (data: any) => axiosInstance.post('/ai/chat', data),
}

export default axiosInstance
