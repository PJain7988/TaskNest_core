import { useState, useEffect } from 'react'
import { User, Bell, Shield, Palette, Globe, Mail, Check, Smartphone } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import api from '@/services/api'
import { useToast } from '@/hooks/use-toast'

export default function Settings() {
  const { user, updateUser: updateAuthUser } = useAuth()
  const { theme, setTheme, accentColor, setAccentColor } = useTheme()
  const [activeTab, setActiveTab] = useState('profile')
  const { toast } = useToast()

  // Form states
  const [profileData, setProfileData] = useState({ name: '', email: '', bio: '' })
  const [notifSettings, setNotifSettings] = useState({ email: true, push: true, inApp: true })
  const [language, setLanguage] = useState('en')
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [totpToken, setTotpToken] = useState('')

  useEffect(() => {
    if (user) {
      setProfileData({ 
        name: user.name || '', 
        email: user.email || '', 
        bio: user.bio || '' 
      })
      if (user.notificationSettings) setNotifSettings(user.notificationSettings)
      if (user.language) setLanguage(user.language)
    }
  }, [user])

  const handleProfileSave = async () => {
    try {
      const { data } = await api.put(`/users/${user?.id}`, profileData)
      if (data.success) {
        updateAuthUser(data.data)
        toast({ title: 'Success', description: 'Profile updated successfully' })
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.response?.data?.message || 'Failed to update profile', variant: 'destructive' })
    }
  }

  const handleNotifToggle = async (type: keyof typeof notifSettings) => {
    const newSettings = { ...notifSettings, [type]: !notifSettings[type] }
    setNotifSettings(newSettings)
    try {
      await api.put('/users/settings', { notificationSettings: newSettings })
      toast({ title: 'Notification Updated', description: `${type.charAt(0).toUpperCase() + type.slice(1)} notifications updated.` })
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update notifications', variant: 'destructive' })
    }
  }

  const [passwordData, setPasswordData] = useState({ current: '', new: '' })

  const handlePasswordUpdate = async () => {
    if (!passwordData.current || !passwordData.new) {
      toast({ title: 'Error', description: 'Please fill all password fields', variant: 'destructive' })
      return
    }
    try {
      await api.put('/users/password', passwordData)
      toast({ title: 'Success', description: 'Password updated successfully' })
      setPasswordData({ current: '', new: '' })
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.message || 'Failed to update password', variant: 'destructive' })
    }
  }

  const handleLanguageChange = async (lang: string) => {
    setLanguage(lang)
    try {
      await api.put('/users/settings', { language: lang })
      const langNames: Record<string, string> = { en: 'English', es: 'Spanish', fr: 'French', de: 'German' }
      toast({ title: 'Language Changed', description: `Language set to ${langNames[lang] || lang}.` })
      if (user) updateAuthUser({ ...user, language: lang })
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to update language', variant: 'destructive' })
    }
  }

  const handleSetup2FA = async () => {
    try {
       // Since the api service might not have setup2FA defined locally in all versions, 
       // I'll ensure it's called correctly.
      const { data } = await api.post('/users/2fa/setup')
      setQrCode(data.qrCode)
      setIs2FAModalOpen(true)
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to initialize 2FA', variant: 'destructive' })
    }
  }

  const handleVerify2FA = async () => {
    try {
      await api.post('/users/2fa/verify', { token: totpToken })
      setIs2FAModalOpen(false)
      toast({ title: 'Success', description: '2FA has been enabled!' })
      if (user) updateAuthUser({ ...user, twoFactorEnabled: true })
    } catch (err) {
      toast({ title: 'Invalid Token', description: 'The code you entered is incorrect.', variant: 'destructive' })
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'language', label: 'Language', icon: Globe },
  ]

  const accentColors = [
    { name: 'Indigo', value: '#4F46E5' },
    { name: 'Emerald', value: '#10B981' },
    { name: 'Rose', value: '#F43F5E' },
    { name: 'Amber', value: '#F59E0B' },
    { name: 'Sky', value: '#0EA5E9' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account settings and preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Tabs */}
        <div className="w-full md:w-64 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-smooth ${
                  activeTab === tab.id
                    ? 'bg-primary text-white shadow-primary'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-secondary-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 card p-8">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white">Profile Information</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Update your personal details</p>
              </div>

              <div className="flex items-center gap-6 pb-6 border-b border-gray-100 dark:border-secondary-700">
                <div className="w-20 h-20 rounded-full bg-gradient-primary flex-center text-white text-3xl font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <button className="btn-primary text-sm">Change Photo</button>
                  <p className="text-xs text-gray-500 mt-2 font-medium uppercase tracking-wider">JPG, GIF or PNG. Max size of 800K</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-secondary-700 dark:text-gray-300">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="input-base pl-10"
                      placeholder="Your name"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-secondary-700 dark:text-gray-300">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="input-base pl-10"
                      placeholder="Your email"
                      disabled
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-secondary-700 dark:text-gray-300">Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  className="input-base min-h-[100px] resize-none"
                  placeholder="Tell us a little bit about yourself..."
                ></textarea>
              </div>

              <div className="flex justify-end pt-4">
                <button onClick={handleProfileSave} className="btn-primary px-8">Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white">Notification Preferences</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Decide how you'd like to be notified</p>
              </div>

              <div className="space-y-4">
                {(Object.keys(notifSettings) as Array<keyof typeof notifSettings>).map((type) => (
                  <div key={type} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-secondary-700">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex-center">
                        {type === 'email' ? <Mail className="w-5 h-5 text-primary" /> : <Bell className="w-5 h-5 text-primary" />}
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 dark:text-white capitalize">{type} Notifications</p>
                        <p className="text-xs text-gray-500">Receive alerts via {type}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleNotifToggle(type)}
                      className={`w-12 h-6 rounded-full transition-smooth relative ${notifSettings[type] ? 'bg-primary' : 'bg-gray-300 dark:bg-secondary-700'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-smooth ${notifSettings[type] ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
               <div>
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white">Security Settings</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage your account protection</p>
              </div>

              <div className="p-6 rounded-2xl bg-gray-50 dark:bg-secondary-800/50 border border-gray-100 dark:border-secondary-700 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary flex-center shadow-primary">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-secondary-900 dark:text-white">Two-Factor Authentication (2FA)</h4>
                    <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <button 
                  onClick={handleSetup2FA}
                  className={`btn-primary ${user?.twoFactorEnabled ? 'bg-success hover:bg-success/90' : ''}`}
                >
                  {user?.twoFactorEnabled ? 'Enabled' : 'Setup 2FA'}
                </button>
              </div>

              <div className="pt-6 border-t border-gray-100 dark:border-secondary-700 space-y-4">
                <h4 className="font-semibold text-secondary-900 dark:text-white">Change Password</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Current Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="input-base" 
                      value={passwordData.current}
                      onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">New Password</label>
                    <input 
                      type="password" 
                      placeholder="••••••••" 
                      className="input-base" 
                      value={passwordData.new}
                      onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button onClick={handlePasswordUpdate} className="btn-primary">Update Password</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white">Appearance Settings</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Personalize your Workspace</p>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold text-secondary-700 dark:text-gray-300">Interface Theme</label>
                <div className="grid grid-cols-3 gap-4">
                  {(['light', 'dark', 'system'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={`p-4 rounded-xl border-2 transition-smooth flex flex-col items-center gap-2 ${
                        theme === t ? 'border-primary bg-primary/5' : 'border-gray-100 dark:border-secondary-700 hover:border-gray-200'
                      }`}
                    >
                      <div className={`w-full h-12 rounded-lg ${t === 'dark' ? 'bg-secondary-900' : t === 'light' ? 'bg-gray-100' : 'bg-gradient-to-r from-gray-100 to-secondary-900'}`} />
                      <span className="capitalize text-sm font-medium">{t}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold text-secondary-700 dark:text-gray-300">Accent Color</label>
                <div className="flex gap-4">
                  {accentColors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setAccentColor(color.value)}
                      className="group relative"
                    >
                      <div 
                        className="w-10 h-10 rounded-full cursor-pointer transition-smooth border-2 ring-primary ring-offset-2 hover:scale-110"
                        style={{ 
                          backgroundColor: color.value,
                          borderColor: accentColor === color.value ? 'white' : 'transparent',
                          boxShadow: accentColor === color.value ? '0 0 0 2px var(--primary)' : 'none'
                        }}
                      />
                      {accentColor === color.value && <Check className="w-5 h-5 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'language' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-secondary-900 dark:text-white">Language & Region</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Choose your preferred language</p>
              </div>

              <div className="space-y-2">
                {[
                  { code: 'en', label: 'English (US)', flag: '🇺🇸' },
                  { code: 'es', label: 'Español', flag: '🇪🇸' },
                  { code: 'fr', label: 'Français', flag: '🇫🇷' },
                  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-smooth ${
                      language === lang.code ? 'bg-primary/5 border-2 border-primary' : 'hover:bg-gray-50 dark:hover:bg-secondary-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="font-medium text-secondary-900 dark:text-white">{lang.label}</span>
                    </div>
                    {language === lang.code && <Check className="w-5 h-5 text-primary" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {is2FAModalOpen && (
        <div className="fixed inset-0 z-50 flex-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-secondary-800 rounded-3xl p-8 max-w-md w-full animate-scale-in">
            <h3 className="text-2xl font-bold mb-2">Enable Two-Factor Auth</h3>
            <p className="text-gray-500 mb-6 text-sm">Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
            
            <div className="flex-center mb-6 bg-white p-4 rounded-2xl">
              <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500">Validation Code</label>
                <input 
                  type="text" 
                  value={totpToken}
                  onChange={(e) => setTotpToken(e.target.value)}
                  placeholder="000 000" 
                  className="input-base text-center tracking-widest text-lg font-bold" 
                  maxLength={6}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setIs2FAModalOpen(false)} className="flex-1 btn-ghost">Cancel</button>
                <button onClick={handleVerify2FA} className="flex-1 btn-primary">Verify & Enable</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
