import React from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import Pagination from '../../components/Pagination';

interface VendorExpensesListProps {
  expenses: any[];
  loading: boolean;
  viewMode: 'table' | 'grid';
  onView: (expense: any) => void;
  onEdit: (expense: any) => void;
  onDelete: (expense: any) => void;
  onImageClick: (imageUrl: string | null, title: string) => void;
  getOfficeName: (officeId: string) => string;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  searchTerm: string;
}

const VendorExpensesList: React.FC<VendorExpensesListProps> = ({
  expenses,
  loading,
  viewMode,
  onView,
  onEdit,
  onDelete,
  getOfficeName,
  totalPages,
  currentPage,
  onPageChange,
  searchTerm
}) => {
  const formatDate = (d?: string | Date) => {
    try {
      return d ? new Date(d).toLocaleDateString() : '';
    } catch {
      return '';
    }
  };

  const getStatusColor = (status?: string) => {
    const STATUS_CLASSES: Record<string, string> = {
      New: 'bg-blue-100 text-blue-800',
      WaitingForApproval: 'bg-yellow-100 text-yellow-800',
      Approved: 'bg-green-100 text-green-800',
      ReviewedByFinance: 'bg-purple-100 text-purple-800',
      Readyforpayment: 'bg-indigo-100 text-indigo-800',
      Preparing: 'bg-orange-100 text-orange-800',
      Paid: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
    };
    return `px-3 py-1 rounded-full text-xs font-medium ${status && STATUS_CLASSES[status] ? STATUS_CLASSES[status] : 'bg-gray-100 text-gray-800'
      }`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading expenses...</p>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-xl shadow-sm border">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
        <p className="text-gray-500 mb-4">
          {searchTerm ? 'Try adjusting your search terms or filters' : 'Get started by adding your first expense'}
        </p>
      </div>
    );
  }

  return (
    <>
      {viewMode === 'grid' ? (
        <div className="space-y-4">
          {expenses.map((exp) => (
            <div
              key={exp._id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300"
              onClick={() => onView(exp)}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-800 truncate text-lg">{exp.title}</h3>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{exp.category}</span>
                      {exp.office && (
                        <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full">
                          {getOfficeName(exp.office)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="font-medium">Due:</span>
                      {formatDate(exp.dueDate || exp.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-2 min-w-[120px]">
                  <span className="text-lg font-bold text-gray-900">Rs. {Number(exp.amount).toFixed(2)}</span>
                  <span className={getStatusColor(exp.status || '')}>
                    {(exp.status || 'New').replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border">
          {/* Mobile view */}
          <div className="block md:hidden">
            {expenses.map((exp) => (
              <div key={exp._id} className="p-4 border-b border-gray-200 last:border-b-0">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{exp.title}</h3>
                    <p className="text-sm text-gray-500">{exp.category}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      Rs. {Number(exp.amount).toFixed(2)}
                    </span>
                    <span className={getStatusColor(exp.status || '')}>
                      {(exp.status || 'New').replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <p>{getOfficeName(exp.office)}</p>
                    <p>Due: {formatDate(exp.dueDate)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(exp);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(exp);
                      }}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(exp);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expense Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Office
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{exp.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="inline-block bg-gray-100 px-2 py-1 rounded-full">
                            {exp.category}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getOfficeName(exp.office)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      Rs. {Number(exp.amountAfterTax ?? exp.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusColor(exp.status || '')}>
                        {(exp.status || 'New').replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(exp.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => onView(exp)}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => onEdit(exp)}
                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(exp)}
                          className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </>
  );
};

export default VendorExpensesList;