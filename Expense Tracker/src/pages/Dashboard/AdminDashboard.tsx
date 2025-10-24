import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Users,
  Building2,
  CreditCard,
  ArrowUpRight,
  Calendar,
  Plus,
  Settings,
  FileText,
  CheckCircle,
  RefreshCw,
  Clock,
  XCircle,
  DollarSignIcon,
  Store,
  Banknote
} from 'lucide-react'
import type { RootState } from '../../app/store'
import { getDashboardStats } from '../../redux/admin/adminSlice'
import Popup from '../../components/Dashboard/Popup'

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { dashboardStats, loading } = useSelector((state: RootState) => state.admin)

  // State for popup
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [popupContent, setPopupContent] = useState<{
    title: string;
    content: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
  }>({
    title: '',
    content: null,
    size: 'md'
  })

  useEffect(() => {
    dispatch(getDashboardStats() as any)
  }, [dispatch])

  // Function to open popup
  const openPopup = (title: string, content: React.ReactNode, size?: 'sm' | 'md' | 'lg' | 'xl') => {
    setPopupContent({ title, content, size })
    setIsPopupOpen(true)
  }

  // Function to close popup
  const closePopup = () => {
    setIsPopupOpen(false)
  }

  // Create Expense Popup
  const showCreateExpensePopup = () => {
    const content = (
      <div className="p-6 space-y-6">
        <div className="text-center">
         
          <h3 className="text-lg font-medium text-gray-900 mb-2">Create New Expense</h3>
          <p className="text-sm text-gray-500 mb-6">
            Choose how you want to create a new expense entry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => {
              closePopup()
              navigate('/dashboard/vendor/create-expense')
            }}
            className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
          >
            <Store className="h-8 w-8 text-blue-600 mb-3" />
            <span className="font-medium text-gray-900">Vendor Expense</span>
            <span className="text-sm text-gray-500 text-center mt-2">
              Create expense through vendor payment
            </span>
          </button>

          <button
            onClick={() => {
              closePopup()
              navigate('/dashboard/pettycash/create-expense')
            }}
            className="flex flex-col items-center p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all duration-200"
          >
            <Building2 className="h-8 w-8 text-green-600 mb-3" />
            <span className="font-medium text-gray-900">Office Expense</span>
            <span className="text-sm text-gray-500 text-center mt-2">
              Create petty cash expense entry
            </span>
          </button>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            onClick={closePopup}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )

    openPopup('Create New Expense', content, 'md')
  }

  // Status configuration for consistent styling
  const statusConfig = {
    WaitingForApproval: { color: 'bg-yellow-500', icon: Clock, label: 'Waiting For Approval' },
    Approved: { color: 'bg-green-500', icon: CheckCircle, label: 'Approved' },
    ReviewedByFinance: { color: 'bg-blue-500', icon: FileText, label: 'Reviewed By Finance' },
    ReadyForPayment: { color: 'bg-purple-500', icon: CreditCard, label: 'Ready For Payment' },
    Paid: { color: 'bg-green-600', icon: Banknote, label: 'Paid' },
    Rejected: { color: 'bg-red-500', icon: XCircle, label: 'Rejected' }
  }

  const quickActions = [
    {
      label: 'Create Expense',
      action: showCreateExpensePopup,
      icon: Plus,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      label: 'Manage Users',
      action: () => navigate('/dashboard/settings/users'),
      icon: Users,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      label: 'Manage Offices',
      action: () => navigate('/dashboard/settings/offices'),
      icon: Settings,
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      label: 'Vendor Management',
      action: () => navigate('/dashboard/vendor/manage'),
      icon: Building2,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
  ]

  // Reusable Stat Card Component
  const StatCard = ({ title, value, icon: Icon, iconColor, bgColor, onClick }: any) => (
    <div
      className={`bg-white rounded-xl p-6 transition-shadow duration-200 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between ">
        <div className="flex items-center max-sm:items-start space-x-4">
          <div className={`p-3 rounded-lg ${bgColor}`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">
              Rs {value?.toLocaleString() || '0'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  // Status Pill Component for horizontal display
  const StatusPill = ({ status, count }: { status: string; count: number }) => {
    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return null

    const Icon = config.icon

    return (
      <div className="flex items-center justify-between w-full space-x-2 bg-white rounded-lg px-4 py-3 shadow-sm cursor hover:shadow-md" onClick={() => navigate("/dashboard/expenses?tab=vendor&page=1&status=" + status)}>

        <div className='flex items-center gap-2'>
          <div className={`p-2 rounded-lg ${config.color}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700">{config.label}</span>
        </div>
        <span className="text-lg font-bold text-right text-gray-900 ml-2">{count}</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              Overview of your expenses and status
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Financial Overview - Top Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vendor Expenses Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 max-sm:p-0 cursor-pointer hover:shadow-md" onClick={() => navigate("/dashboard/expenses?tab=vendor&page=1")}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 max-sm:hidden">Vendor Expenses</h2>
            <StatCard
              title="Total Vendor Expenses"
              value={dashboardStats?.totalExpense}
              icon={Store}
              iconColor="text-blue-600"
              bgColor="bg-blue-50"
            />
          </div>

          {/* Office Expenses Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 max-sm:p-0 cursor-pointer hover:shadow-md" onClick={() => navigate("/dashboard/expenses?tab=pettycash&page=1")}>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 max-sm:hidden">Office Expenses</h2>
            <StatCard
              title="Total PettyCash Expense"
              value={dashboardStats?.totalPettyCashExpense}
              icon={Building2}
              iconColor="text-green-600"
              bgColor="bg-green-50"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Vendor Expenses by Office */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Vendor Expenses by Office</h2>
            <div className="space-y-4">
              {dashboardStats?.officeWiseExpenses?.map((office: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:shadow-md" onClick={() => navigate(`/dashboard/expenses?tab=vendor&page=1&office=${office.office?._id}`)}>
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-700">{office.office?.name || 'Unknown Office'}</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    Rs {office.total?.toLocaleString() || '0'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Petty Cash by Office */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Petty Cash Expenses by Office</h2>
            <div className="space-y-4">
              {dashboardStats?.officeWisePettyCash?.map((pettyCash: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:shadow-md" onClick={() => navigate(`/dashboard/expenses?tab=pettycash&page=1&office=${pettyCash.office?._id}&month=${new Date().getMonth() + 1}-${new Date().getFullYear()}`)}>
                  <div className="flex items-center space-x-3">
                    <Building2 className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-700">{pettyCash.office?.name || 'Unknown Office'}</span>
                  </div>
                  <span className="font-bold text-gray-900">
                    Rs {pettyCash.totalExpense?.toLocaleString() || '0'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Status Overview */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Counts By Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-3">
            {dashboardStats?.countsByStatus &&
              Object.entries(dashboardStats.countsByStatus).map(([status, count]) => (
                <StatusPill
                  key={status}
                  status={status}
                  count={count as number}
                />
              ))}
          </div>
        </div>

        {/* Office Breakdown */}


        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={action.action}
                className={`flex items-center justify-between p-4 text-white rounded-lg transition-all duration-200 ${action.color} hover:shadow-md`}
              >
                <div className="flex items-center space-x-3">
                  <action.icon className="w-5 h-5" />
                  <span className="font-medium">{action.label}</span>
                </div>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Reusable Popup */}
        <Popup
          isOpen={isPopupOpen}
          onClose={closePopup}
          title={popupContent.title}
          size={popupContent.size}
        >
          {popupContent.content}
        </Popup>

      </div>
    </div>
  )
}

export default AdminDashboard