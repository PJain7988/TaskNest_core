import { useState, useEffect, useRef } from 'react'
import { Camera, Mail, Phone, MapPin, Edit2, Save } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { useToast } from '@/hooks/use-toast'

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

  return (
    <div className="max-w-4xl space-y-6">
      {/* Profile Header */}
      <div className="card p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-primary flex-center text-white text-5xl font-bold overflow-hidden">
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
                <p className="text-lg text-primary mt-1 capitalize">{user?.role}</p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{user?.bio || 'No bio provided'}</p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Email</p>
                      <p className="text-sm font-medium text-secondary-900 dark:text-white">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Phone</p>
                      <p className="text-sm font-medium text-secondary-900 dark:text-white">{user?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">Location</p>
                      <p className="text-sm font-medium text-secondary-900 dark:text-white">{user?.location || 'Not provided'}</p>
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
                      <label className="block text-sm font-medium text-secondary-900 dark:text-white mb-1">Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="input-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-900 dark:text-white mb-1">Email</label>
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
                      <label className="block text-sm font-medium text-secondary-900 dark:text-white mb-1">Phone</label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="input-base"
                        placeholder="e.g. +1 (555) 0199"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-secondary-900 dark:text-white mb-1">Location</label>
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
                    <label className="block text-sm font-medium text-secondary-900 dark:text-white mb-1">Bio</label>
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

      {/* Activity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Tasks Completed</p>
          <p className="text-3xl font-bold text-primary mt-2">127</p>
          <p className="text-xs text-success mt-1">+12 this month</p>
        </div>
        <div className="card p-6">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Projects Led</p>
          <p className="text-3xl font-bold text-accent mt-2">8</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">3 active</p>
        </div>
        <div className="card p-6">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Team Members</p>
          <p className="text-3xl font-bold text-success mt-2">24</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Direct reports</p>
        </div>
        <div className="card p-6">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Member Since</p>
          <p className="text-xl font-bold text-secondary-900 dark:text-white mt-2">Jan 2023</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">1+ year</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-4 pb-4 border-b border-gray-200 dark:border-secondary-700 last:border-0 last:pb-0">
              <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-secondary-900 dark:text-white">
                  Completed task "API Integration"
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">2 hours ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
