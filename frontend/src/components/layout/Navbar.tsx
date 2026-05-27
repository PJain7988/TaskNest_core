import { useState, useMemo } from 'react'
import { Menu, Bell, Search, Settings, LogOut, User } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from '@/hooks/useTranslation'

interface NavbarProps {
  toggleSidebar: () => void
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const userInitials = useMemo(() => {
    if (!user?.name) return '?'
    return user.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }, [user?.name])

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const path = window.location.pathname.startsWith('/tasks') ? '/tasks' : '/projects'
      navigate(`${path}?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <nav className="sticky top-0 z-40 bg-white dark:bg-secondary-800 border-b border-gray-200 dark:border-secondary-700 shadow-soft">
      <div className="px-6 py-3 flex-between">
        {/* Left side */}
        <div className="flex-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded-lg transition-smooth"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search bar */}
          <div className="hidden md:flex items-center gap-2 bg-gray-100 dark:bg-secondary-700 rounded-lg px-4 py-2 w-64 border border-transparent focus-within:border-primary transition-smooth">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex-center gap-4">
          {/* Notifications */}
          <Link 
            to="/notifications"
            className="relative p-2 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded-lg transition-smooth"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full animate-pulse"></span>
          </Link>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded-lg transition-smooth"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex-center text-white text-sm font-semibold">
                {userInitials}
              </div>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-secondary-800 rounded-lg shadow-lg border border-gray-200 dark:border-secondary-700 py-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-secondary-700 transition-smooth"
                >
                  <User className="w-4 h-4" />
                  <span>{t('profile')}</span>
                </Link>
                <Link
                  to="/settings"
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-secondary-700 transition-smooth text-left"
                >
                  <Settings className="w-4 h-4" />
                  <span>{t('settings')}</span>
                </Link>
                <hr className="my-1 dark:border-secondary-700" />
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-secondary-700 transition-smooth text-danger text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('logout')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
