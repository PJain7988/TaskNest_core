import { useState, useEffect } from 'react'
import { Plus, GitBranch, Users, Calendar, Trash2, Edit3, ExternalLink, Link, Tag, FolderOpen, Layers } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { useToast } from '@/hooks/use-toast'
import { useLocation, useSearchParams } from 'react-router-dom'
import { useTranslation } from '@/hooks/useTranslation'

export default function Projects() {
  const { t } = useTranslation()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search')?.toLowerCase() || ''
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isModalOpen, setIsModalOpen] = useState(location.state?.openModal || false)
  const [newProject, setNewProject] = useState({ 
    name: '', 
    description: '', 
    dueDate: '', 
    status: 'planning',
    priority: 'medium',
    tags: '',
    repoLink: '',
    category: 'development',
  })
  const [editProject, setEditProject] = useState<any>(null)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()


  useEffect(() => {
    if (location.state?.openModal) {
      setIsModalOpen(true)
    }
  }, [location.state])

  const { data: allProjects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.getProjects()
      return data.data
    }
  })

  const projects = allProjects?.filter((p: any) => 
    p.name.toLowerCase().includes(searchQuery) || 
    p.description.toLowerCase().includes(searchQuery)
  )

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setIsModalOpen(false)
      setNewProject({ name: '', description: '', dueDate: '', status: 'planning', priority: 'medium', tags: '', repoLink: '', category: 'development' })
      toast({ title: 'Success', description: 'Project created successfully' })
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setEditProject(null)
      toast({ title: 'Updated', description: 'Project updated successfully.' })
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update project.', variant: 'destructive' })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setSelectedProject(null)
      toast({ title: 'Deleted', description: 'Project has been removed.' })
    }
  })


  if (isLoading) return <div className="flex-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" /></div>

  const statusColors = {
    planning: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    'in-progress': 'bg-primary/10 text-primary dark:bg-primary/20',
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    'on-hold': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    'review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    'cancelled': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">{t('projects')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and track all your projects</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2 shadow-primary"
        >
          <Plus className="w-5 h-5" />
          {t('newProject')}
        </button>
      </div>

      {/* Controls */}
      <div className="flex-between">
        <div className="flex gap-2">
          {['grid', 'list'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as any)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-smooth ${
                viewMode === mode
                  ? 'bg-secondary-900 text-white dark:bg-white dark:text-secondary-900'
                  : 'bg-gray-100 dark:bg-secondary-800 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="capitalize">{mode === 'grid' ? t('gridView') : t('listView')}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Projects Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project: any) => (
            <div key={project._id} className="card p-6 group hover:shadow-2xl transition-all duration-500 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-smooth flex gap-1">
                <button 
                  onClick={() => setEditProject({ ...project, dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : '' })}
                  className="p-2 bg-white/80 dark:bg-secondary-800/80 backdrop-blur-md rounded-lg shadow-sm hover:text-primary"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => { if (confirm('Delete this project?')) deleteMutation.mutate(project._id) }}
                  className="p-2 bg-white/80 dark:bg-secondary-800/80 backdrop-blur-md rounded-lg shadow-sm hover:text-danger"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex-center text-white shadow-lg rotate-3 group-hover:rotate-0 transition-all duration-300">
                  <GitBranch className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-secondary-900 dark:text-white leading-tight">{project.name}</h3>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md mt-1 inline-block ${statusColors[project.status as keyof typeof statusColors]}`}>
                    {t(project.status)}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 h-10 mb-6">{project.description}</p>

              <div className="space-y-4">
                <div className="w-full bg-gray-100 dark:bg-secondary-700/50 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <div className="flex-between text-xs font-bold text-gray-500">
                  <span>{t('progress')}</span>
                  <span className="text-primary">{project.progress}%</span>
                </div>
              </div>

              <div className="flex-between mt-8 pt-4 border-t border-gray-100 dark:border-secondary-700/50">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No date'}</span>
                </div>
                <button 
                  onClick={() => setSelectedProject(project)}
                  className="flex items-center gap-1.5 text-xs font-bold text-primary group-hover:gap-2 transition-all"
                >
                  {t('details')} <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-secondary-800 border-b border-gray-100 dark:border-secondary-700">
              <tr>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">{t('projects')}</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">{t('todo') === 'Zu tun' ? 'Status' : t('todo') === 'À Faire' ? 'Statut' : t('todo') === 'Por Hacer' ? 'Estado' : 'Status'}</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500">{t('dueDate')}</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">{t('progress')}</th>
              </tr>
            </thead>
            <tbody>
              {projects?.map((project: any) => (
                <tr key={project._id} className="border-b border-gray-50 dark:border-secondary-700/50 hover:bg-gray-50/50 dark:hover:bg-secondary-700/10 transition-smooth">
                  <td className="p-4">
                    <p className="font-bold text-secondary-900 dark:text-white">{project.name}</p>
                    <p className="text-xs text-gray-500 truncate max-w-xs">{project.description}</p>
                  </td>
                  <td className="p-4">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md ${statusColors[project.status as keyof typeof statusColors]}`}>
                      {t(project.status)}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-gray-500">{new Date(project.dueDate).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3 justify-end">
                      <div className="w-24 bg-gray-100 dark:bg-secondary-700 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-primary h-full" style={{ width: `${project.progress}%` }} />
                      </div>
                      <span className="text-xs font-bold w-8">{project.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-secondary-800 rounded-3xl shadow-2xl animate-scale-in w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-8 pb-4 border-b border-gray-100 dark:border-secondary-700">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-gradient-primary flex-center text-white shadow-primary">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Create New Project</h2>
                  <p className="text-gray-500 text-sm">Set up a professional workspace for your team</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-secondary-700 dark:text-gray-300">Project Name *</label>
                    <div className="relative">
                      <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        placeholder="e.g. E-commerce Platform Redesign" 
                        className="input-base pl-10" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-secondary-700 dark:text-gray-300">Description</label>
                    <textarea 
                       value={newProject.description}
                       onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      placeholder="What is this project about? Describe goals, scope, and key deliverables..." 
                      className="input-base min-h-[100px] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Status & Priority */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Status & Priority</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-secondary-700 dark:text-gray-300">Status</label>
                    <select 
                      value={newProject.status}
                      onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                      className="input-base"
                    >
                      <option value="planning">📋 Planning</option>
                      <option value="in-progress">🚀 In Progress</option>
                      <option value="review">🔍 In Review</option>
                      <option value="on-hold">⏸️ On Hold</option>
                      <option value="completed">✅ Completed</option>
                      <option value="cancelled">❌ Cancelled</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-secondary-700 dark:text-gray-300">Priority</label>
                    <select 
                      value={newProject.priority}
                      onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
                      className="input-base"
                    >
                      <option value="low">🟢 Low</option>
                      <option value="medium">🟡 Medium</option>
                      <option value="high">🟠 High</option>
                      <option value="critical">🔴 Critical</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-secondary-700 dark:text-gray-300">Category</label>
                    <select 
                      value={newProject.category}
                      onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                      className="input-base"
                    >
                      <option value="development">💻 Development</option>
                      <option value="design">🎨 Design</option>
                      <option value="marketing">📣 Marketing</option>
                      <option value="research">🔬 Research</option>
                      <option value="operations">⚙️ Operations</option>
                      <option value="other">📦 Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Timeline & Tags */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Timeline & Tags</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-secondary-700 dark:text-gray-300">Due Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="date" 
                        value={newProject.dueDate}
                        onChange={(e) => setNewProject({ ...newProject, dueDate: e.target.value })}
                        className="input-base pl-10" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-secondary-700 dark:text-gray-300">Tags <span className="text-gray-400 font-normal">(comma separated)</span></label>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="text" 
                        value={newProject.tags}
                        onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })}
                        placeholder="ui, backend, mvp..."
                        className="input-base pl-10" 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Resources & Links */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Resources & Links</h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-sm font-bold text-secondary-700 dark:text-gray-300">Repository / External Link</label>
                    <div className="relative">
                      <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input 
                        type="url" 
                        value={newProject.repoLink}
                        onChange={(e) => setNewProject({ ...newProject, repoLink: e.target.value })}
                        placeholder="https://github.com/org/repo or any URL..."
                        className="input-base pl-10" 
                      />
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl border-2 border-dashed border-gray-200 dark:border-secondary-700 hover:border-primary/50 transition-smooth cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex-center group-hover:bg-primary/20 transition-smooth">
                        <FolderOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-secondary-900 dark:text-white">Attach Files</p>
                        <p className="text-xs text-gray-500">Drop ZIP, PDF, Figma, or any project files here</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 btn-ghost py-3 font-bold">Discard</button>
                <button 
                  onClick={() => createMutation.mutate(newProject)}
                  disabled={!newProject.name || createMutation.isPending}
                  className="flex-1 btn-primary py-3 font-bold shadow-primary disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createMutation.isPending ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
                  ) : (
                    <><Plus className="w-4 h-4" /> Create Project</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editProject && (
        <div className="fixed inset-0 z-50 flex-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-secondary-800 rounded-3xl shadow-2xl animate-scale-in w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-8 pb-4 border-b border-gray-100 dark:border-secondary-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex-center">
                    <Edit3 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-secondary-900 dark:text-white">Edit Project</h2>
                    <p className="text-gray-500 text-xs">Update project details</p>
                  </div>
                </div>
                <button onClick={() => setEditProject(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded-xl transition-smooth text-gray-400">
                  ✕
                </button>
              </div>
            </div>
            <div className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500">Project Name</label>
                <input
                  type="text"
                  value={editProject.name}
                  onChange={(e) => setEditProject({ ...editProject, name: e.target.value })}
                  className="input-base"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500">Description</label>
                <textarea
                  value={editProject.description}
                  onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
                  className="input-base min-h-[80px] resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">Status</label>
                  <select value={editProject.status} onChange={(e) => setEditProject({ ...editProject, status: e.target.value })} className="input-base">
                    <option value="planning">📋 Planning</option>
                    <option value="in-progress">🚀 In Progress</option>
                    <option value="review">🔍 In Review</option>
                    <option value="on-hold">⏸️ On Hold</option>
                    <option value="completed">✅ Completed</option>
                    <option value="cancelled">❌ Cancelled</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">Due Date</label>
                  <input
                    type="date"
                    value={editProject.dueDate}
                    onChange={(e) => setEditProject({ ...editProject, dueDate: e.target.value })}
                    className="input-base"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500">Progress ({editProject.progress || 0}%)</label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={editProject.progress || 0}
                  onChange={(e) => setEditProject({ ...editProject, progress: Number(e.target.value) })}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>0%</span><span>50%</span><span>100%</span>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setEditProject(null)} className="flex-1 btn-ghost py-3 font-bold">Cancel</button>
                <button
                  onClick={() => updateMutation.mutate({ id: editProject._id, data: editProject })}
                  disabled={!editProject.name || updateMutation.isPending}
                  className="flex-1 btn-primary py-3 font-bold shadow-primary disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Project Details Slide-over */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedProject(null)} />
          <div className="w-full max-w-md bg-white dark:bg-secondary-800 h-full overflow-y-auto shadow-2xl animate-slide-in-right">
            {/* Header */}
            <div className="p-8 border-b border-gray-100 dark:border-secondary-700">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex-center text-white shadow-lg">
                  <GitBranch className="w-7 h-7" />
                </div>
                <button onClick={() => setSelectedProject(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded-xl text-gray-400 transition-smooth">✕</button>
              </div>
              <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">{selectedProject.name}</h2>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md mt-2 inline-block ${statusColors[selectedProject.status as keyof typeof statusColors] || ''}`}>
                {selectedProject.status}
              </span>
            </div>

            {/* Details */}
            <div className="p-8 space-y-8">
              {/* Description */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Description</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {selectedProject.description || 'No description provided.'}
                </p>
              </div>

              {/* Progress */}
              <div>
                <div className="flex-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Progress</h3>
                  <span className="text-primary font-bold">{selectedProject.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-secondary-700 rounded-full h-3">
                  <div className="bg-gradient-primary h-3 rounded-full transition-all duration-1000" style={{ width: `${selectedProject.progress || 0}%` }} />
                </div>
              </div>

              {/* Meta Info */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400">Details</h3>
                <div className="space-y-3 p-4 bg-gray-50 dark:bg-secondary-700/30 rounded-2xl">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-gray-500">Due Date:</span>
                    <span className="font-semibold text-secondary-900 dark:text-white ml-auto">
                      {selectedProject.dueDate ? new Date(selectedProject.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Not set'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Users className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-gray-500">Members:</span>
                    <span className="font-semibold text-secondary-900 dark:text-white ml-auto">
                      {selectedProject.members?.length || 0} member{selectedProject.members?.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <GitBranch className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-gray-500">Created:</span>
                    <span className="font-semibold text-secondary-900 dark:text-white ml-auto">
                      {new Date(selectedProject.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-secondary-700">
                <button
                  onClick={() => {
                    setEditProject({ ...selectedProject, dueDate: selectedProject.dueDate ? new Date(selectedProject.dueDate).toISOString().split('T')[0] : '' })
                    setSelectedProject(null)
                  }}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Project
                </button>
                <button
                  onClick={() => { if (confirm('Delete this project?')) deleteMutation.mutate(selectedProject._id) }}
                  className="w-full py-3 rounded-xl border-2 border-red-200 text-red-500 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/10 font-bold transition-smooth flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
