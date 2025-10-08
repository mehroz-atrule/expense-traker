
import { DollarSign, Calendar, User } from 'lucide-react'

interface Expense {
  id: string | number;
  title: string;
  date: string | Date;
  amount: number;
  status: string;
  category?: string;
  submitter?: string;
}

const ExpenseCard = ({exp}: {exp: Expense}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'under review': return 'bg-blue-100 text-blue-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'new': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 md:p-4 mb-3 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0 flex-1">
          <div className="p-2 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex-shrink-0">
            <DollarSign className="w-4 h-4 md:w-5 md:h-5 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">
              {exp.title}
            </h3>
            <div className="flex items-center space-x-2 text-xs md:text-sm text-gray-500 mt-1">
              <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
              <span>{new Date(exp.date).toLocaleDateString()}</span>
              {exp.category && (
                <>
                  <span className="hidden md:inline">•</span>
                  <span className="hidden md:inline truncate">{exp.category}</span>
                </>
              )}
              {exp.submitter && (
                <>
                  <span className="hidden md:inline">•</span>
                  <div className="hidden md:flex items-center space-x-1">
                    <User className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="truncate">{exp.submitter}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right flex-shrink-0">
          <div className="font-bold text-gray-900 text-sm md:text-lg">
            ${typeof exp.amount === 'number' ? exp.amount.toLocaleString() : exp.amount}
          </div>
          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(exp.status)}`}>
            {exp.status}
          </span>
        </div>
      </div>
    </div>
  )
}

export default  ExpenseCard         