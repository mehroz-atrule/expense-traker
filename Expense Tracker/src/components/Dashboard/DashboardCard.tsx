import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface DashboardCardProps {
  color: string
  title: string
  amount: number
  icon?: React.ReactNode
  change?: number
  trend?: 'up' | 'down'
  prefix?: string
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  color, 
  title, 
  amount, 
  icon,
  change,
  trend,
  prefix = '$'
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        {icon ? (
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
            {icon}
          </div>
        ) : (
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color}`}></div>
        )}
        {change && trend && (
          <div className={`flex items-center text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">
          {prefix === '$' ? `$${amount.toLocaleString()}` : amount.toLocaleString()}
        </p>
      </div>
    </div>
  )
}

export default DashboardCard
