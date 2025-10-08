import React from 'react'
import DashboardCard from '../../components/Dashboard/DashboardCard'
import QucikViewDashboard from '../../components/Dashboard/QucikViewDashboard'
import PendingCard from '../../components/Dashboard/PendingCard'
import ExpenseCard from '../../components/Dashboard/ExpenseCard'

const SubmitterDashboard: React.FC = () => {
  const recentExpenses = [
    { id: 1, title: '2x water bottle', date: '2024-12-08', amount: 500, status: 'New' },
    { id: 2, title: 'Taxi to office', date: '2024-12-07', amount: 1200, status: 'Approved' },
    { id: 3, title: 'Lunch with client', date: '2024-12-06', amount: 800, status: 'InReview' },
    { id: 4, title: '2x water bottle', date: '2024-12-08', amount: 500, status: 'New' },
    { id: 5, title: 'Taxi to office', date: '2024-12-07', amount: 1200, status: 'Approved' },
    { id: 6, title: 'Lunch with client', date: '2024-12-06', amount: 800, status: 'InReview' },
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
          {/* <div className="px-6 py-4 "> */}
            <h2 className="text-ms font-medium text-gray-800 my-4">Recent Expenses</h2>
          </div>
          
            {recentExpenses.map((exp) => (
              <ExpenseCard key={exp.id} exp={exp} />
            ))}
        </div>
      {/* </div> */}
    </div>
  )
}

export default SubmitterDashboard