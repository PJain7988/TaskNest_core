import { useState } from 'react'
import { Plus, Mail, Shield, Trash2, MessageSquare } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '@/hooks/useTranslation'

export default function Team() {
  const { t } = useTranslation()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.getUsers()
      return data.data
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast({ title: 'Member Removed', description: 'Team member has been removed successfully.' })
    }
  })

  if (isLoading) return <div className="flex-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" /></div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">{t('team')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your team and collaborate</p>
        </div>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="btn-primary flex items-center gap-2 shadow-primary"
        >
          <Plus className="w-5 h-5" />
          {t('todo') === 'Zu tun' ? 'Mitglied einladen' : t('todo') === 'À Faire' ? 'Inviter un membre' : t('todo') === 'Por Hacer' ? 'Invitar Miembro' : 'Invite Member'}
        </button>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users?.map((member: any) => (
          <div key={member.id || member._id} className="card p-6 group hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex-center text-white text-xl font-bold shadow-lg">
                    {member.avatar ? <img src={member.avatar} className="w-full h-full rounded-2xl object-cover" /> : member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-secondary-800 bg-success" />
                </div>
                <div>
                  <h3 className="font-bold text-secondary-900 dark:text-white">{member.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{member.role}</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
                <button 
                  onClick={() => {
                    if (confirm('Are you sure you want to remove this member?')) {
                      deleteMutation.mutate(member.id || member._id)
                    }
                  }}
                  className="p-2 hover:bg-danger/10 text-gray-400 hover:text-danger rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-3 py-4 border-y border-gray-100 dark:border-secondary-700/50">
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="w-4 h-4 text-primary" />
                <span>{member.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                <Shield className="w-4 h-4 text-primary" />
                <span className="capitalize">{member.role} Access</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button 
                onClick={() => navigate('/chat', { state: { recipient: member } })}
                className="flex-1 btn-secondary text-sm flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                {t('todo') === 'Zu tun' ? 'Nachricht' : t('todo') === 'À Faire' ? 'Message' : t('todo') === 'Por Hacer' ? 'Mensaje' : 'Message'}
              </button>
              <button 
                onClick={() => navigate('/tasks')}
                className="flex-1 btn-ghost text-sm flex items-center justify-center gap-2 border border-gray-200 dark:border-secondary-700"
              >
                <Plus className="w-4 h-4" />
                {t('todo') === 'Zu tun' ? 'Zuweisen' : t('todo') === 'À Faire' ? 'Assigner' : t('todo') === 'Por Hacer' ? 'Asignar' : 'Assign'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Invite Modal Mock */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-secondary-800 rounded-3xl p-8 max-w-md w-full animate-scale-in">
            <h3 className="text-2xl font-bold mb-2">Invite Member</h3>
            <p className="text-gray-500 mb-6 text-sm">Send an invitation to join your workspace</p>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500">Email Address</label>
                <input type="email" placeholder="colleague@example.com" className="input-base" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500">Role</label>
                <select className="input-base">
                  <option>User</option>
                  <option>Manager</option>
                  <option>Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setIsInviteModalOpen(false)} className="flex-1 btn-ghost">Cancel</button>
                <button 
                  onClick={() => {
                    setIsInviteModalOpen(false)
                    toast({ title: 'Invite Sent', description: 'Invitation has been sent to candidate email.' })
                  }} 
                  className="flex-1 btn-primary"
                >
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
