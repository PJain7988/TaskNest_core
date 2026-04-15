import { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  icon: LucideIcon
  label: string
  value: number | string
  change: string
  color: 'primary' | 'success' | 'warning' | 'accent'
}

const colorClasses = {
  primary: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400',
  success: 'bg-success-light/20 dark:bg-success/20 text-success-dark',
  warning: 'bg-warning-light/20 dark:bg-warning/20 text-warning-dark',
  accent: 'bg-accent-light/20 dark:bg-accent/20 text-accent-dark',
}

export default function StatCard({ icon: Icon, label, value, change, color }: StatCardProps) {
  const isPositive = change.startsWith('+')

  return (
    <div className="card p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-secondary-900 dark:text-white mt-2">{value}</p>
          <p className={`text-sm mt-3 flex items-center gap-1 ${isPositive ? 'text-success-dark' : 'text-danger'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {change} from last month
          </p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}
