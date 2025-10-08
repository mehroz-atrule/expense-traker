import React from 'react'
import QuickCreateButton from './QuickCreateButton'
import { 
  FileChartColumnIncreasing, 
  HandCoins, 
  Zap, 
  Users, 
  Building2, 
  Store,
  ArrowUpRight
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

const QucikViewDashboard: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const isAdminPath = location.pathname.startsWith('/admin')
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 my-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="flex gap-2 items-center text-xl font-semibold text-gray-900">
          <Zap className="w-5 h-5 text-blue-600" />
          <span>Quick Actions</span>
        </h2>
        <ArrowUpRight className="w-5 h-5 text-gray-400" />
      </div>
      
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <QuickCreateButton 
          label="Create Expense" 
          icon={<Zap className="w-5 h-5" />}
          onClick={() => navigate('createexpense')} 
          className="bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 border-blue-200"
        />
        <QuickCreateButton 
          icon={<FileChartColumnIncreasing className="w-5 h-5" />} 
          label="Generate Report" 
          onClick={() => navigate('/reports')}
          className="bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-700 border-green-200"
        />
        <QuickCreateButton 
          icon={<HandCoins className="w-5 h-5" />} 
          label="Request Advance" 
          onClick={() => navigate('/advance')}
          className="bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 text-purple-700 border-purple-200"
        />
        
        {isAdminPath && (
          <>
            <QuickCreateButton 
              icon={<Users className="w-5 h-5" />}
              label="Manage Users" 
              onClick={() => navigate('/admin/users')}
              className="bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 text-orange-700 border-orange-200"
            />
            <QuickCreateButton 
              icon={<Building2 className="w-5 h-5" />}
              label="Manage Offices" 
              onClick={() => navigate('/admin/offices')}
              className="bg-gradient-to-r from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 text-teal-700 border-teal-200"
            />
            <QuickCreateButton 
              icon={<Store className="w-5 h-5" />}
              label="Manage Vendors" 
              onClick={() => navigate('/admin/vendors')}
              className="bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 text-indigo-700 border-indigo-200"
            />
          </>
        )}
      </div>
    </div>
  )
}

export default QucikViewDashboard