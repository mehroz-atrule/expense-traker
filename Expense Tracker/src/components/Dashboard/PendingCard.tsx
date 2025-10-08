
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'

const PendingCard = () => {
  const pendingItems = [
    { id: 'expenses', type: 'Expenses', count: 12, icon: Clock, color: 'bg-yellow-500', bgColor: 'bg-yellow-50' },
    { id: 'reviews', type: 'Reviews', count: 5, icon: AlertTriangle, color: 'bg-orange-500', bgColor: 'bg-orange-50' },
    { id: 'approvals', type: 'Approvals', count: 8, icon: CheckCircle, color: 'bg-green-500', bgColor: 'bg-green-50' },
    { id: 'rejections', type: 'Rejections', count: 2, icon: XCircle, color: 'bg-red-500', bgColor: 'bg-red-50' },
  ]

  return (
    <div className="mb-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Pending Items</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pendingItems.map((item) => (
          <div key={item.id} className={`${item.bgColor} rounded-xl p-6 border border-opacity-20 hover:shadow-md transition-all duration-200`}>
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${item.color}`}>
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">{item.count}</span>
            </div>
            <h3 className="font-medium text-gray-700">{item.type}</h3>
            <p className="text-sm text-gray-500 mt-1">Awaiting action</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PendingCard