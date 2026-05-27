import { useState, useEffect } from 'react'
import { Plus, Trash2, Tag, Edit3, X, Calendar } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'
import { useToast } from '@/hooks/use-toast'
import { useLocation, useSearchParams } from 'react-router-dom'
import { useTranslation } from '@/hooks/useTranslation'

const taskColumns = [
  { id: 'todo', label: 'To Do', color: 'border-gray-300' },
  { id: 'in-progress', label: 'In Progress', color: 'border-primary' },
  { id: 'review', label: 'In Review', color: 'border-warning' },
  { id: 'done', label: 'Done', color: 'border-success' },
]

export default function Tasks() {
  const { t } = useTranslation()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get('search')?.toLowerCase() || ''
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editTask, setEditTask] = useState<any>(null)
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', project: '', status: 'todo', dueDate: '' })

  useEffect(() => {
    if (location.state?.openModal) {
      setIsModalOpen(true)
    }
  }, [location.state])

  const { data: rawTasksRaw, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const { data } = await api.getTasks()
      return data.data
    }
  })

  const rawTasks = rawTasksRaw?.filter((t: any) => 
    t.title?.toLowerCase().includes(searchQuery) || 
    (t.description || '').toLowerCase().includes(searchQuery)
  )

  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data } = await api.getProjects()
      return data.data
    }
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setIsModalOpen(false)
      setNewTask({ title: '', description: '', priority: 'medium', project: '', status: 'todo', dueDate: '' })
      toast({ title: 'Task Created', description: 'New task added to board.' })
    }
  })

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setEditTask(null)
      toast({ title: 'Task Updated', description: 'Task has been updated.' })
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast({ title: 'Task Deleted', description: 'Task removed from board.' })
    }
  })

  // Group tasks by status
  const tasks = taskColumns.reduce((acc, col) => {
    acc[col.id] = rawTasks?.filter((t: any) => t.status === col.id) || []
    return acc
  }, {} as Record<string, any[]>)

  const handleDragStart = (e: React.DragEvent, taskId: string, fromColumn: string) => {
    e.dataTransfer.setData('taskId', taskId)
    e.dataTransfer.setData('fromColumn', fromColumn)
  }

  const handleDrop = (e: React.DragEvent, toColumn: string) => {
    const taskId = e.dataTransfer.getData('taskId')
    const fromColumn = e.dataTransfer.getData('fromColumn')

    if (fromColumn !== toColumn) {
      updateMutation.mutate({ id: taskId, data: { status: toColumn } })
    }
  }

  if (tasksLoading) return <div className="flex-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" /></div>

  const priorityColors = {
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900 dark:text-white">{t('tasks')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage and track your team tasks</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2 shadow-primary"
        >
          <Plus className="w-5 h-5" />
          {t('newTask')}
        </button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {taskColumns.map((column) => (
          <div
            key={column.id}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, column.id)}
            className="bg-gray-50/50 dark:bg-secondary-800/50 rounded-2xl p-4 min-h-[700px] border border-gray-100 dark:border-secondary-700/50"
          >
            {/* Column Header */}
            <div className={`flex items-center justify-between mb-6 pb-2 border-b-2 ${column.color}`}>
              <h2 className="font-bold text-secondary-900 dark:text-white">{t(column.id)}</h2>
              <span className="bg-white dark:bg-secondary-700 text-xs font-bold px-2 py-1 rounded-md shadow-sm">
                {tasks[column.id]?.length || 0}
              </span>
            </div>

            {/* Tasks List */}
            <div className="space-y-4">
              {tasks[column.id]?.map((task: any) => (
                <div
                  key={task._id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task._id, column.id)}
                  className="bg-white dark:bg-secondary-700 rounded-xl p-4 cursor-move hover:shadow-xl transition-all duration-300 group border border-transparent hover:border-primary/20"
                >
                   <div className="flex-between mb-3">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                      {t(task.priority)}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
                      <button
                        onClick={() => setEditTask({ ...task, project: task.project?._id || task.project || '', dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '' })}
                        className="p-1.5 hover:bg-primary/10 text-gray-400 hover:text-primary rounded-md"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteMutation.mutate(task._id)} className="p-1.5 hover:bg-danger/10 text-gray-400 hover:text-danger rounded-md">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-bold text-secondary-900 dark:text-white text-sm mb-2 leading-snug">{task.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4">{task.description}</p>

                  <div className="flex-between items-center pt-3 border-t border-gray-50 dark:border-secondary-600/50">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-primary bg-primary/5 px-2 py-1 rounded">
                      <Tag className="w-3 h-3" />
                      {task.project?.name || 'No Project'}
                    </div>
                    <div className="w-6 h-6 rounded-lg bg-gradient-primary flex-center text-white text-[10px] font-bold">
                      {task.creator?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                </div>
              ))}

              <button 
                onClick={() => {
                  setNewTask({ ...newTask, status: column.id })
                  setIsModalOpen(true)
                }}
                className="w-full py-3 border-2 border-dashed border-gray-200 dark:border-secondary-700 rounded-xl text-gray-400 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                {t('createTask').replace('Create ', 'Add ').replace('Crear ', 'Agregar ').replace('Créer ', 'Ajouter ').replace('Aufgabe erstellen', 'Aufgabe hinzufügen')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-secondary-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-scale-in">
            <h2 className="text-2xl font-bold mb-1">Create New Task</h2>
            <p className="text-gray-500 text-sm mb-6">Assign tasks to your project workspace</p>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500">Task Title</label>
                <input 
                  type="text" 
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g. Design Landing Page" 
                  className="input-base" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500">Description</label>
                <textarea 
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Details about the task..." 
                  className="input-base min-h-[80px] resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">Project</label>
                  <select 
                    value={newTask.project}
                    onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
                    className="input-base capitalize"
                  >
                    <option value="">-- No Project --</option>
                    {projects && projects.length > 0 ? (
                      projects.map((p: any) => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))
                    ) : (
                      <option disabled>No projects found</option>
                    )}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">Priority</label>
                  <select 
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="input-base"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">Due Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="date" value={newTask.dueDate} onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })} className="input-base pl-10" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">Initial Status</label>
                  <select value={newTask.status} onChange={(e) => setNewTask({ ...newTask, status: e.target.value })} className="input-base">
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">In Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-6">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 btn-ghost py-3 font-bold">Cancel</button>
                <button
                  onClick={() => createMutation.mutate(newTask)}
                  disabled={!newTask.title || createMutation.isPending}
                  className="flex-1 btn-primary py-3 font-bold shadow-primary disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editTask && (
        <div className="fixed inset-0 z-50 flex-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-secondary-800 rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-scale-in">
            <div className="flex-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Edit Task</h2>
                <p className="text-gray-500 text-sm">Update task details</p>
              </div>
              <button onClick={() => setEditTask(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-secondary-700 rounded-xl text-gray-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500">Task Title</label>
                <input type="text" value={editTask.title} onChange={(e) => setEditTask({ ...editTask, title: e.target.value })} className="input-base" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-500">Description</label>
                <textarea value={editTask.description || ''} onChange={(e) => setEditTask({ ...editTask, description: e.target.value })} className="input-base min-h-[80px] resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">Project</label>
                  <select value={editTask.project} onChange={(e) => setEditTask({ ...editTask, project: e.target.value })} className="input-base">
                    <option value="">-- No Project --</option>
                    {projects?.map((p: any) => (<option key={p._id} value={p._id}>{p.name}</option>))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">Priority</label>
                  <select value={editTask.priority} onChange={(e) => setEditTask({ ...editTask, priority: e.target.value })} className="input-base">
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🟠 High</option>
                    <option value="critical">🔴 Critical</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">Status</label>
                  <select value={editTask.status} onChange={(e) => setEditTask({ ...editTask, status: e.target.value })} className="input-base">
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">In Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase text-gray-500">Due Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="date" value={editTask.dueDate || ''} onChange={(e) => setEditTask({ ...editTask, dueDate: e.target.value })} className="input-base pl-10" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setEditTask(null)} className="flex-1 btn-ghost py-3 font-bold">Cancel</button>
                <button
                  onClick={() => editMutation.mutate({ id: editTask._id, data: editTask })}
                  disabled={!editTask.title || editMutation.isPending}
                  className="flex-1 btn-primary py-3 font-bold shadow-primary disabled:opacity-50"
                >
                  {editMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
