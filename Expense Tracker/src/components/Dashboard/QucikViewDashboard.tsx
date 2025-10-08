import React from 'react'
import QuickCreateButton from './QuickCreateButton'
import { FileChartColumnIncreasing, HandCoins, Zap,  } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

const QucikViewDashboard: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const isAdminPath = location.pathname.startsWith('/admin')
  return (
    <div className="col-span-2 bg-white rounded-2xl shadow-sm p-6 my-4 ">
      <h2 className=" flex gap-2 items-center text-xl font-medium text-gray-800 mb-6 max-sm:text-sm "><Zap  size={16}/><span>Quick Actions</span></h2>
      <div className="grid gap-3 grid-cols-3 sm:grid-cols-5 md:grid-cols-5 lg:grid-cols-5">
        <QuickCreateButton label="Expense" onClick={() =>  navigate('createexpense')} />
        <QuickCreateButton icon={<FileChartColumnIncreasing />} label="Report" onClick={() => { /* navigate or open modal */ }} />
        <QuickCreateButton icon={<HandCoins />} label="Advance" onClick={() => { /* navigate or open modal */ }} />
        {isAdminPath && (
          <>
            <QuickCreateButton label="Manage Users" onClick={() => navigate('/admin/users')} />
            <QuickCreateButton label="Manage Offices" onClick={() => navigate('/admin/offices')} />
          </>
        )}
      </div>
    </div>
  )
}

export default QucikViewDashboard