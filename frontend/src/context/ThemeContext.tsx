import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import api from '@/services/api'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  accentColor: string
  setAccentColor: (color: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const [theme, setThemeState] = useState<Theme>((localStorage.getItem('theme') as Theme) || 'system')
  const [accentColor, setAccentColorState] = useState(localStorage.getItem('accentColor') || '#4F46E5')

  useEffect(() => {
    if (user?.appearanceSettings) {
      setThemeState(user.appearanceSettings.theme)
      setAccentColorState(user.appearanceSettings.accentColor)
    }
  }, [user])

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}`
      : '79 70 229'
  }

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(theme)
    }

    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    const rgb = hexToRgb(accentColor)
    document.documentElement.style.setProperty('--primary', rgb)
    document.documentElement.style.setProperty('--accent', hexToRgb('#F59E0B')) // Default accent
    localStorage.setItem('accentColor', accentColor)
  }, [accentColor])

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme)
    if (user) {
      try {
        await api.put('/users/settings', { 
          appearanceSettings: { theme: newTheme, accentColor } 
        })
      } catch (error) {
        console.error('Failed to save theme preference', error)
      }
    }
  }

  const setAccentColor = async (newColor: string) => {
    setAccentColorState(newColor)
    if (user) {
      try {
        await api.put('/users/settings', { 
          appearanceSettings: { theme, accentColor: newColor } 
        })
      } catch (error) {
        console.error('Failed to save accent color preference', error)
      }
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
