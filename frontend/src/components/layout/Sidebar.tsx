import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Users,
  MessageCircle,
  Settings,
  LogOut,
  ChevronRight,
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  toggleSidebar: () => void
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: FolderOpen, label: 'Projects', path: '/projects' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: Users, label: 'Team', path: '/team' },
  { icon: MessageCircle, label: 'Messages', path: '/chat' },
]

const secondaryItems = [
  { icon: Settings, label: 'Settings', path: '/settings' },
  { icon: LogOut, label: 'Logout', path: '/logout' },
]

import { useAuth } from '@/context/AuthContext'
import { useTranslation } from '@/hooks/useTranslation'

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const { user, logout } = useAuth()
  const { t } = useTranslation()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-30"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-primary to-primary-900 text-white shadow-lg transition-transform duration-300 z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:relative lg:h-[calc(100vh-64px)]`}
      >
        <div className="p-6 h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex-center">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">TaskNest</h1>
              <p className="text-xs text-white/70">Pro</p>
            </div>
          </div>

          {/* Main menu */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={toggleSidebar}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-smooth ${
                    active
                      ? 'bg-white/20 text-white shadow-primary'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{t(item.label.toLowerCase())}</span>
                  {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              )
            })}
          </nav>

          {/* Secondary menu */}
          <div className="space-y-2 border-t border-white/10 pt-4">
            {secondaryItems.map((item) => {
              const Icon = item.icon

              if (item.label === 'Logout') {
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      logout()
                      toggleSidebar()
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-smooth"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{t(item.label.toLowerCase())}</span>
                  </button>
                )
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-smooth"
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{t(item.label.toLowerCase())}</span>
                </Link>
              )
            })}
          </div>

          {/* Profile card */}
          <div className="mt-4 p-4 bg-white/10 rounded-lg">
            <p className="text-xs text-white/70">{t('loggedAs')}</p>
            <p className="font-semibold text-sm">{user?.name || 'Guest'}</p>
          </div>
        </div>
      </aside>
    </>
  )
}
