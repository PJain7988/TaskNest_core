import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { useNavigate } from 'react-router-dom'
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import { 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Plus,
  ArrowDownRight,
  Target
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const { data } = await api.getDashboardStats()
      return data.data
    }
  })

  if (isLoading) return <div className="flex-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" /></div>

  const stats = dashboardData?.stats || []
  const chartData = dashboardData?.chartData || []
  const recentTasks = dashboardData?.recentTasks || []

  const colors = {
    primary: '#4F46E5',
    success: '#10B981',
    accent: '#F43F5E',
    warning: '#F59E0B',
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Welcome Header */}
      <div className="flex-between">
        <div>
          <h1 className="text-4xl font-bold text-secondary-900 dark:text-white tracking-tight">
            Welcome back, <span className="text-primary">{user?.name}</span> 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Here's what's happening with your projects today.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/notifications')}
            className="btn-secondary flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Activity Log
          </button>
          <button 
            onClick={() => navigate('/projects', { state: { openModal: true } })}
            className="btn-primary flex items-center gap-2 shadow-primary"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>


      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat: any, index: number) => {
          const Icon = [TrendingUp, CheckCircle2, Users, Clock][index] || TrendingUp
          return (
            <div key={stat.label} className="card p-6 group hover:translate-y-[-4px] transition-all duration-300">
              <div className="flex-between mb-4">
                <div className={`p-3 rounded-2xl bg-primary/10 text-primary dark:bg-primary/20`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`flex items-center text-xs font-bold ${stat.change?.startsWith('+') ? 'text-success' : 'text-danger'} bg-success/10 px-2 py-1 rounded-lg`}>
                   {stat.change || '+0%'}
                   {stat.change?.startsWith('+') ? <ArrowUpRight className="w-3 h-3 ml-1" /> : <ArrowDownRight className="w-3 h-3 ml-1" />}
                </span>
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-3xl font-black text-secondary-900 dark:text-white mt-1">{stat.value}</h3>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 card p-8">
          <div className="flex-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-secondary-900 dark:text-white">Project Velocity</h3>
              <p className="text-sm text-gray-500 font-medium">Task completion rate over time</p>
            </div>
            <select className="bg-gray-50 dark:bg-secondary-800 border-none rounded-xl text-sm font-bold px-4 py-2 focus:ring-2 ring-primary">
              <option>Last 6 Months</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={colors.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#111827', 
                    borderRadius: '16px', 
                    border: 'none', 
                    color: '#fff',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' 
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="completed" 
                  stroke={colors.primary} 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorCompleted)" 
                />
                 <Area 
                  type="monotone" 
                  dataKey="pending" 
                  stroke={colors.accent} 
                  strokeWidth={4}
                  fillOpacity={0} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="card p-8">
          <div className="flex-between mb-8">
            <h3 className="text-xl font-bold text-secondary-900 dark:text-white">Recent Activity</h3>
            <button className="text-sm font-bold text-primary hover:underline">View All</button>
          </div>
          
          <div className="space-y-6">
            {recentTasks.length > 0 ? recentTasks.map((task: any) => (
              <div key={task._id} className="flex gap-4 group cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-secondary-700 flex-center shrink-0 group-hover:bg-primary/10 transition-colors">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-secondary-900 dark:text-white truncate group-hover:text-primary transition-colors">
                    {task.title}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">{task.project?.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400">
                      {new Date(task.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="text-[10px] font-bold text-success uppercase">{task.status}</span>
                  </div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-sm">No recent activity</p>
              </div>
            )}
          </div>

          <button 
            onClick={() => navigate('/tasks', { state: { openModal: true } })}
            className="w-full mt-8 py-4 bg-secondary-900 dark:bg-white text-white dark:text-secondary-900 rounded-2xl font-bold flex-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus className="w-5 h-5" />
            Create Task
          </button>
        </div>
      </div>
    </div>
  )
}
