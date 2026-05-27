import { useState, useEffect, useRef } from 'react'
import { Camera, Mail, Phone, MapPin, Edit2, Save, FileText, Briefcase, Users, Calendar } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { useToast } from '@/hooks/use-toast'
import { useQuery } from '@tanstack/react-query'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = useState<string>('')
  const [savingPhoto, setSavingPhoto] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
    location: '',
    bio: '',
  })

  // Dynamic state queries using React Query
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.getProjects()
      return data.data
    }
  })

  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data } = await api.getTasks()
      return data.data
    }
  })

  const { data: teamMembers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.getUsers()
      return data.data
    }
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'Member',
        phone: user.phone || '',
        location: user.location || '',
        bio: user.bio || '',
      })
      if (user.avatar) setAvatarUrl(user.avatar)
    }
  }, [user])

  const handleSave = async () => {
    try {
      const { data } = await api.updateUser(user!.id, formData)
      if (data.success) {
        updateUser(data.data)
        setIsEditing(false)
        toast({ title: 'Success', description: 'Profile updated successfully' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update profile', variant: 'destructive' })
    }
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please choose an image under 2MB', variant: 'destructive' })
      return
    }

    try {
      setSavingPhoto(true)
      const uploadData = new FormData()
      uploadData.append('avatar', file)

      const { data } = await api.updateUser(user!.id, uploadData)
      if (data.success) {
        setAvatarUrl(data.data.avatar)
        updateUser(data.data)
        toast({ title: 'Photo Updated', description: 'Profile photo saved successfully.' })
      }
    } catch (error: any) {
      console.error(error)
      toast({ 
        title: 'Save Failed', 
        description: error.response?.data?.message || 'Could not save photo. Try again.', 
        variant: 'destructive' 
      })
    } finally {
      setSavingPhoto(false)
    }
    // Reset so same file can be selected again
    e.target.value = ''
  }

  const userInitials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'JD'

  // Dynamic Statistics Calculations
  const completedTasks = tasks ? tasks.filter((t: any) => t.status === 'done') : []
  const completedCount = completedTasks.length

  // Calculate completed this month (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const completedThisMonth = completedTasks.filter((t: any) => new Date(t.updatedAt) >= thirtyDaysAgo).length

  // Projects led by current user
  const projectsLed = projects ? projects.filter((p: any) => p.owner?._id === user?.id || p.owner === user?.id) : []
  const projectsLedCount = projectsLed.length
  const activeProjectsCount = projectsLed.filter((p: any) => p.status === 'in-progress').length

  // Team members
  const teamMembersCount = teamMembers ? teamMembers.length : 0

  // Join Date calculation
  const joinDate = user?.createdAt ? new Date(user.createdAt) : new Date('2026-01-01')
  const memberSinceFormatted = joinDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  const diffTime = Math.abs(new Date().getTime() - joinDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const memberDuration = diffDays >= 365 
    ? `${Math.floor(diffDays / 365)}+ year${Math.floor(diffDays / 365) > 1 ? 's' : ''}`
    : `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) !== 1 ? 's' : ''}`

  // Dynamic Activities
  const recentActivities = tasks 
    ? [...tasks].sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 4)
    : []

  return (
    <div className="max-w-4xl space-y-6">
      {/* Profile Header */}
      <div className="card p-8 bg-white/60 dark:bg-secondary-800/60 backdrop-blur-lg border border-gray-100 dark:border-secondary-700/50">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-primary flex-center text-white text-5xl font-bold overflow-hidden shadow-lg shadow-primary/20">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  userInitials
                )}
              </div>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={savingPhoto}
                className="absolute bottom-0 right-0 p-3 bg-primary text-white rounded-full hover:bg-primary-700 transition-smooth shadow-lg hover:scale-110 active:scale-95 disabled:opacity-70"
              >
                {savingPhoto ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            {!isEditing ? (
              <>
                <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">{user?.name}</h1>
                <p className="text-lg text-primary mt-1 capitalize font-medium">{user?.role}</p>
                <p className="text-gray-600 dark:text-gray-400 mt-2 italic">
                  {user?.bio || '"No biography provided yet. Set a custom bio using Edit Profile below."'}
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-semibold text-secondary-900 dark:text-white">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-semibold text-secondary-900 dark:text-white">{user?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="text-sm font-semibold text-secondary-900 dark:text-white">{user?.location || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-6 btn-primary flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-secondary-900 dark:text-white mb-1">Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-secondary-900 dark:text-white mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="input-base"
                        disabled
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-secondary-900 dark:text-white mb-1">Phone</label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="input-base"
                        placeholder="e.g. +1 (555) 0199"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-secondary-900 dark:text-white mb-1">Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="input-base"
                        placeholder="e.g. San Francisco, CA"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-secondary-900 dark:text-white mb-1">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="input-base"
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button onClick={handleSave} className="btn-primary flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setFormData({
                        name: user?.name || '',
                        email: user?.email || '',
                        role: user?.role || '',
                        phone: user?.phone || '',
                        location: user?.location || '',
                        bio: user?.bio || '',
                      })
                    }}
                    className="btn-ghost"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6 bg-white/60 dark:bg-secondary-800/60 backdrop-blur-lg border border-gray-100 dark:border-secondary-700/50 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Tasks Completed</p>
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <p className="text-3xl font-extrabold text-primary mt-1">{completedCount}</p>
          </div>
          <p className="text-[11px] text-success font-black mt-2">
            +{completedThisMonth} completed this month
          </p>
        </div>
        
        <div className="card p-6 bg-white/60 dark:bg-secondary-800/60 backdrop-blur-lg border border-gray-100 dark:border-secondary-700/50 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Projects Led</p>
              <Briefcase className="w-4 h-4 text-accent" />
            </div>
            <p className="text-3xl font-extrabold text-accent mt-1">{projectsLedCount}</p>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold mt-2">
            {activeProjectsCount} active projects
          </p>
        </div>

        <div className="card p-6 bg-white/60 dark:bg-secondary-800/60 backdrop-blur-lg border border-gray-100 dark:border-secondary-700/50 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Team Members</p>
              <Users className="w-4 h-4 text-success" />
            </div>
            <p className="text-3xl font-extrabold text-success mt-1">{teamMembersCount}</p>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 font-bold mt-2">
            Total workspace reports
          </p>
        </div>

        <div className="card p-6 bg-white/60 dark:bg-secondary-800/60 backdrop-blur-lg border border-gray-100 dark:border-secondary-700/50 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Member Since</p>
              <Calendar className="w-4 h-4 text-warning" />
            </div>
            <p className="text-xl font-black text-secondary-900 dark:text-white mt-2 truncate">{memberSinceFormatted}</p>
          </div>
          <p className="text-[11px] text-warning font-black mt-2">
            Joined {memberDuration} ago
          </p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6 bg-white/60 dark:bg-secondary-800/60 backdrop-blur-lg border border-gray-100 dark:border-secondary-700/50 shadow-md">
        <h3 className="text-lg font-bold text-secondary-900 dark:text-white mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivities.length > 0 ? (
            recentActivities.map((act: any) => (
              <div key={act._id} className="flex gap-4 pb-4 border-b border-gray-100 dark:border-secondary-700/50 last:border-0 last:pb-0">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${
                  act.status === 'done' ? 'bg-success' : 'bg-primary'
                }`} />
                <div>
                  <p className="text-sm font-semibold text-secondary-900 dark:text-white">
                    {act.status === 'done' ? 'Completed' : 'Updated'} task "{act.title}"
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                    {new Date(act.updatedAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-400">
              <p className="text-sm font-medium">No recent activities found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
