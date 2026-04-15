import { useState } from 'react'
import { Bell, CheckCircle, MessageSquare, Clock, Filter } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Notification {
  id: string
  title: string
  message: string
  time: string
  type: 'project' | 'task' | 'message' | 'system'
  read: boolean
}

const initialNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Project Assignment',
    message: 'You have been added to the "Website Redesign" project by Sarah.',
    time: '2 mins ago',
    type: 'project',
    read: false,
  },
  {
    id: '2',
    title: 'Task Completed',
    message: 'Alex marked "Homepage Design" as completed.',
    time: '1 hour ago',
    type: 'task',
    read: false,
  },
  {
    id: '3',
    title: 'New Message',
    message: 'David replied to your comment on the "API Integration" task.',
    time: '3 hours ago',
    type: 'message',
    read: true,
  },
  {
    id: '4',
    title: 'System Update',
    message: 'TaskNest was updated to version 2.4.0. Check out the new features!',
    time: 'Yesterday',
    type: 'system',
    read: true,
  },
]

export default function Notifications() {
  const [notifications, setNotifications] = useState(initialNotifications)
  const { toast } = useToast()

  const handleMarkAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
    toast({ title: 'Success', description: 'All notifications marked as read' })
  }

  const handleToggleRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: !n.read } : n))
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div className="flex-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">Notifications</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Stay updated with your latest project activity</p>
        </div>
        <button 
          onClick={handleMarkAllRead}
          className="flex items-center gap-2 text-primary font-semibold hover:bg-primary/10 px-4 py-2 rounded-lg transition-smooth"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Mark all as read</span>
        </button>
      </div>

      <div className="card divide-y divide-gray-100 dark:divide-secondary-700 overflow-hidden">
        {notifications.map((notif) => {
          const Icon = 
            notif.type === 'project' ? Bell :
            notif.type === 'task' ? CheckCircle :
            notif.type === 'message' ? MessageSquare : Clock

          return (
            <div 
              key={notif.id} 
              onClick={() => handleToggleRead(notif.id)}
              className={`p-6 flex gap-4 transition-smooth cursor-pointer hover:bg-gray-50 dark:hover:bg-secondary-800 ${!notif.read ? 'bg-primary/5 dark:bg-primary/5' : ''}`}
            >
              <div className={`w-10 h-10 rounded-full flex-center shrink-0 ${
                notif.type === 'project' ? 'bg-blue-100 text-blue-600' :
                notif.type === 'task' ? 'bg-green-100 text-green-600' :
                notif.type === 'message' ? 'bg-purple-100 text-purple-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex-between">
                  <h4 className="font-bold text-secondary-900 dark:text-white">{notif.title}</h4>
                  <span className="text-xs text-gray-500 font-medium">{notif.time}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {notif.message}
                </p>
              </div>

              {!notif.read && (
                <div className="w-2.5 h-2.5 bg-primary rounded-full mt-2 shrink-0 shadow-primary" />
              )}
            </div>
          )
        })}
      </div>

      <div className="text-center pb-8">
        <button className="text-gray-500 font-semibold hover:text-primary transition-colors">
          View older notifications
        </button>
      </div>
    </div>
  )
}
