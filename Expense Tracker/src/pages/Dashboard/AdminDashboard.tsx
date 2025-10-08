import React from 'react'
import { /* useNavigate */ } from 'react-router-dom'
import DashboardCard from '../../components/Dashboard/DashboardCard'
import QucikViewDashboard from '../../components/Dashboard/QucikViewDashboard'
import PendingCard from '../../components/Dashboard/PendingCard'
import ExpenseCard from '../../components/Dashboard/ExpenseCard'

const AdminDashboard: React.FC = () => {
  // navigate not used in admin dashboard layout

  const recentExpenses = [
    { id: 1, title: 'Budget adjustment', date: '2024-12-08', amount: 2000, status: 'Approved' },
    { id: 2, title: 'Office supplies', date: '2024-12-07', amount: 800, status: 'New' },
  ];

  return (
    <div className="min-h-screen  pt-4 max-sm:pt-2  ">
      <div className="mx-10 max-sm:mx-0 ">
        <div className="grid grid-cols-5 max-sm:grid-cols-3 gap-4 mb-6">
          <DashboardCard color="from-blue-500 to-blue-600" title="Total Expense" amount={5000}/>
          <DashboardCard color="from-green-500 to-green-600" title="Vendor Expense" amount={5000}/>
          <DashboardCard color="from-purple-500 to-purple-600" title="Office Expense" amount={5000}/>
          <DashboardCard color="from-orange-500 to-orange-600" title="Opening Balance" amount={5000}/>
          <DashboardCard color="from-red-500 to-red-600" title="Roaming Budget" amount={5000}/>
        </div>

        <QucikViewDashboard />
        <PendingCard />

        <div className=" overflow-hidden">
          <h2 className="text-ms font-medium text-gray-800 my-4">Recent Expenses</h2>
        </div>

        {recentExpenses.map((exp) => (
          <ExpenseCard key={exp.id} exp={exp} />
        ))}
      </div>
    </div>
  )
}

export default AdminDashboard