import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Building2,
  CreditCard,
  ArrowUpRight,
  Calendar,
  Plus,
  Settings,
  FileText,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Clock,
  XCircle
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
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <Plus className="h-6 w-6 text-blue-600" />
          </div>
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
            <Building2 className="h-8 w-8 text-blue-600 mb-3" />
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
            <CreditCard className="h-8 w-8 text-green-600 mb-3" />
            <span className="font-medium text-gray-900">Petty Cash</span>
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

  // Example usage - Office Details Popup
  const showOfficeDetails = (office: any) => {
    const content = (
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Office Name</label>
            <p className="text-lg font-semibold">{office.office?.name || 'Unknown Office'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Total Expense</label>
            <p className="text-lg font-semibold text-green-600">
              Rs {office.total?.toLocaleString()}
            </p>
          </div>
        </div>
        {/* Add more office details here */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={closePopup}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              closePopup()
              navigate('/admin/offices')
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Manage Office
          </button>
        </div>
      </div>
    )
    
    openPopup(`Office Details - ${office.office?.name || 'Unknown Office'}`, content, 'lg')
  }

  const quickActions = [
    { 
      label: 'Create Expense', 
      action: showCreateExpensePopup, // Yahan direct navigate ki jagah popup function use karein
      icon: Plus, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'Manage Users', 
      action: () => navigate('/admin/users'), 
      icon: Users, 
      color: 'bg-green-500' 
    },
    { 
      label: 'Manage Offices', 
      action: () => navigate('/admin/offices'), 
      icon: Settings, 
      color: 'bg-orange-500' 
    },
    { 
      label: 'Vendor Management', 
      action: () => navigate('/admin/vendor/manage'), 
      icon: Building2, 
      color: 'bg-purple-500' 
    },
  ]

  const StatCard = ({ title, value, change, trend, icon: Icon, prefix = 'Rs ', showChange = true }: any) => (
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
          {prefix === 'Rs ' ? `Rs ${value?.toLocaleString() || '0'}` : value?.toLocaleString() || '0'}
        </p>
      </div>
    </div>
  )

  const OfficeCard = ({ officeName, expense, icon: Icon, iconColor, bgColor, onClick }: any) => (
    <div 
      className="bg-white rounded-xl shadow-sm p-4 md:p-6 cursor-pointer hover:shadow-md transition-shadow duration-200"
      onClick={onClick}
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className={`p-2 md:p-3 rounded-lg bg-gradient-to-br ${bgColor}`}>
          <Icon className={`w-4 h-4 md:w-5 md:h-5 ${iconColor}`} />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          {officeName}
        </h3>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Expense</span>
          <span className="font-bold text-gray-900">Rs {expense?.toLocaleString() || '0'}</span>
        </div>
      </div>
    </div>
  )

  const StatusCard = ({ title, value, color, icon: Icon }: any) => (
    <div className="bg-white rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700">{title}</span>
        </div>
        <span className="text-lg font-bold text-gray-900">{value || 0}</span>
      </div>
    </div>
  )

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
    <div className="min-h-screen bg-gray-50 px-3 py-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">

        {/* Mobile Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600 md:block hidden">
              {dashboardStats?.month ? `Month: ${dashboardStats.month}` : 'Welcome back!'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Total Expense and Office Expenses in one row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-6">
          {/* Total Expense Card */}
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 md:p-3 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-xs md:text-sm font-medium text-gray-600">Total Expenses</h3>
              <p className="text-lg md:text-xl font-bold text-gray-900">
                Rs {dashboardStats?.totalExpense?.toLocaleString() || '0'}
              </p>
            </div>
          </div>

          {/* Office Expenses - First 2 offices */}
          {dashboardStats?.officeWiseExpenses?.slice(0, 2).map((officeExpense: any, index: number) => (
            <OfficeCard
              key={index}
              officeName={officeExpense.office?.name || 'Unknown Office'}
              expense={officeExpense.total}
              icon={Building2}
              iconColor="text-green-600"
              bgColor="from-green-50 to-emerald-50"
              onClick={() => showOfficeDetails(officeExpense)}
            />
          ))}
        </div>

        {/* Remaining Office Expenses */}
        {dashboardStats?.officeWiseExpenses && dashboardStats.officeWiseExpenses.length > 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {dashboardStats.officeWiseExpenses.slice(2).map((officeExpense: any, index: number) => (
              <OfficeCard
                key={index + 2}
                officeName={officeExpense.office?.name || 'Unknown Office'}
                expense={officeExpense.total}
                icon={Building2}
                iconColor="text-green-600"
                bgColor="from-green-50 to-emerald-50"
                onClick={() => showOfficeDetails(officeExpense)}
              />
            ))}
          </div>
        )}

        {/* Counts By Status */}
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Counts By Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {dashboardStats?.countsByStatus && Object.entries(dashboardStats.countsByStatus).map(([status, count]) => (
              <StatusCard
                key={status}
                title={status.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                value={count as number}
                color={
                  status === 'Approved' || status === 'Paid' ? 'bg-green-500' :
                    status === 'WaitingForApproval' ? 'bg-yellow-500' :
                      status === 'ReviewedByFinance' ? 'bg-blue-500' :
                        status === 'ReadyForPayment' ? 'bg-purple-500' :
                          status === 'Rejected' ? 'bg-red-500' : 'bg-gray-500'
                }
                icon={
                  status === 'Approved' || status === 'Paid' ? CheckCircle :
                    status === 'WaitingForApproval' ? Clock :
                      status === 'ReviewedByFinance' ? FileText :
                        status === 'ReadyForPayment' ? CreditCard :
                          status === 'Rejected' ? XCircle : AlertCircle
                }
              />
            ))}
          </div>
        </div>

        {/* Petty Cash Expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Total Petty Cash Expense */}
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 md:p-3 rounded-lg bg-gradient-to-br from-purple-50 to-violet-50">
                <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Total Petty Cash Expense</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount</span>
                <span className="font-bold text-gray-900">
                  Rs {dashboardStats?.totalPettyCashExpense?.toLocaleString() || '0'}
                </span>
              </div>
            </div>
          </div>

          {/* Office Wise Petty Cash - First 2 */}
          {dashboardStats?.officeWisePettyCash?.slice(0, 2).map((pettyCash: any, index: number) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-4 md:p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 md:p-3 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50">
                  <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {pettyCash.office?.name || 'Unknown Office'} - Petty Cash
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Expense</span>
                  <span className="font-bold text-gray-900">Rs {pettyCash.totalExpense?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Month</span>
                  <span>{pettyCash.month}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Remaining Petty Cash Expenses */}
        {dashboardStats?.officeWisePettyCash && dashboardStats.officeWisePettyCash.length > 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {dashboardStats.officeWisePettyCash.slice(2).map((pettyCash: any, index: number) => (
              <div key={index + 2} className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 md:p-3 rounded-lg bg-gradient-to-br from-orange-50 to-amber-50">
                    <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {pettyCash.office?.name || 'Unknown Office'} - Petty Cash
                  </h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Expense</span>
                    <span className="font-bold text-gray-900">Rs {pettyCash.totalExpense?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Month</span>
                    <span>{pettyCash.month}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
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