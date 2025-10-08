import React from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Building2, 
  CreditCard,
  ArrowUpRight,
  Calendar,
  Clock,
  Plus,
  Bell,
  Settings
} from 'lucide-react'

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()

  // Mock data - replace with real data from your API
  const stats = {
    totalExpenses: { value: 125000, change: 0, trend: 'up' },
    pendingApprovals: { value: 23, change: 0, trend: 'down' },
    activeVendors: { value: 156, change: 0, trend: 'up' },
    officeExpense: { value: 45000, change: 0, trend: 'up' }
  }

  const recentExpenses = [
    { 
      id: 1, 
      title: 'Office Equipment Purchase', 
      category: 'Equipment',
      submitter: 'John Smith',
      date: '2024-12-08', 
      amount: 2500, 
      status: 'Pending' 
    },
    { 
      id: 2, 
      title: 'Travel Reimbursement', 
      category: 'Travel',
      submitter: 'Sarah Johnson',
      date: '2024-12-07', 
      amount: 1200, 
      status: 'Approved' 
    },
    { 
      id: 3, 
      title: 'Software License Renewal', 
      category: 'Software',
      submitter: 'Mike Davis',
      date: '2024-12-06', 
      amount: 800, 
      status: 'Under Review' 
    },
  ]

  const quickActions = [
    { label: 'Create Expense', action: () => navigate('/admin/createexpense'), icon: Plus, color: 'bg-blue-500' },
    { label: 'Manage Users', action: () => navigate('/admin/users'), icon: Users, color: 'bg-green-500' },
    { label: 'Manage Offices', action: () => navigate('/admin/offices'), icon: Settings, color: 'bg-orange-500' },
    { label: 'Vendor Management', action: () => navigate('/admin/vendors'), icon: Building2, color: 'bg-purple-500' },
  ]

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'under review': return 'bg-blue-100 text-blue-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const StatCard = ({ title, value, change, trend, icon: Icon, prefix = '$', showChange = true }: any) => (
    <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 md:p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <Icon className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
        </div>
        {showChange && change !== 0 && (
          <div className={`flex items-center text-xs font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-xs md:text-sm font-medium text-gray-600">{title}</h3>
        <p className="text-lg md:text-xl font-bold text-gray-900">
          {prefix === '$' ? `$${value.toLocaleString()}` : value.toLocaleString()}
        </p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 px-3 py-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
        
        {/* Mobile Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600 md:block hidden">Welcome back!</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full bg-white shadow-sm">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Stats Grid - Mobile App Style */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <StatCard
            title="Total Expenses"
            value={stats.totalExpenses.value}
            change={stats.totalExpenses.change}
            trend={stats.totalExpenses.trend}
            icon={DollarSign}
            showChange={false}
          />
          <StatCard
            title="Pending"
            value={stats.pendingApprovals.value}
            change={stats.pendingApprovals.change}
            trend={stats.pendingApprovals.trend}
            icon={Clock}
            prefix=""
          />
          <StatCard
            title="Vendors"
            value={stats.activeVendors.value}
            change={stats.activeVendors.change}
            trend={stats.activeVendors.trend}
            icon={Building2}
            prefix=""
          />
          <StatCard
            title="Office Expense"
            value={stats.officeExpense.value}
            change={stats.officeExpense.change}
            trend={stats.officeExpense.trend}
            icon={CreditCard}
          />
        </div>

        {/* Quick Actions - Mobile Optimized */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={action.action}
                className="flex items-center p-3 md:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <div className={`p-2 md:p-3 rounded-lg ${action.color} mr-3`}>
                  <action.icon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <span className="font-medium text-gray-700 text-sm md:text-base">{action.label}</span>
                <ArrowUpRight className="w-4 h-4 text-gray-400 ml-auto" />
              </button>
            ))}
          </div>
        </div>

        {/* Recent Expenses - Mobile Optimized */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2>
            <button 
              onClick={() => navigate('/admin/expenses')}
              className="text-blue-600 font-medium text-sm"
            >
              View all
            </button>
          </div>
          
          <div className="space-y-3">
            {recentExpenses.map((expense) => (
              <button 
                key={expense.id} 
                className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 text-left"
                onClick={() => navigate(`/admin/expenses/${expense.id}`)}
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="p-2 bg-white rounded-lg shadow-sm flex-shrink-0">
                    <DollarSign className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">{expense.title}</h3>
                    <div className="text-xs md:text-sm text-gray-500 mt-1">
                      <div className="flex flex-col md:flex-row md:items-center md:space-x-2">
                        <span>{expense.category}</span>
                        <span className="hidden md:inline">•</span>
                        <span className="md:inline">by {expense.submitter}</span>
                        <span className="hidden md:inline">•</span>
                        <span className="text-xs">{new Date(expense.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <div className="font-bold text-gray-900 text-sm md:text-base">
                    ${expense.amount.toLocaleString()}
                  </div>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(expense.status)}`}>
                    {expense.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Summary - Mobile Optimized */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Today's Summary</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Approved</span>
                <span className="font-semibold text-green-600">15</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Pending</span>
                <span className="font-semibold text-yellow-600">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Action Needed</span>
                <span className="font-semibold text-red-600">3</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Active Users</span>
                <span className="font-semibold text-blue-600">142</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">System Health</span>
                <span className="font-semibold text-green-600">Good</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Last Sync</span>
                <span className="font-semibold text-green-600">Now</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard