import React, { createContext, useContext, useState, useEffect } from 'react'
import axiosInstance from '@/services/api'

interface User {
  id: string
  name: string
  email: string
  role: string
  bio?: string
  avatar?: string
  phone?: string
  location?: string
  notificationSettings?: {
    email: boolean
    push: boolean
    inApp: boolean
  }
  appearanceSettings?: {
    theme: 'light' | 'dark' | 'system'
    accentColor: string
  }
  language?: string
  twoFactorEnabled?: boolean
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (token: string, userData: User) => void
  logout: () => void
  checkAuth: () => Promise<void>
  updateUser: (userData: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    window.location.href = '/login'
  }

  const checkAuth = async () => {
    const savedToken = localStorage.getItem('token')
    if (!savedToken) {
      setLoading(false)
      return
    }

    try {
      const response = await axiosInstance.get('/auth/me')
      if (response.data.success) {
        setUser(response.data.data)
      } else {
        logout()
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const updateUser = (userData: User) => {
    setUser(userData)
  }

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, checkAuth, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
