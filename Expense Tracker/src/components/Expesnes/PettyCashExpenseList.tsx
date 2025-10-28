import React from 'react';
import { Eye, Trash2, ImageIcon, MoreHorizontal } from 'lucide-react';
import Pagination from '../../components/Pagination';
import UpdateIcon from '../UpdateIcon';

// Helpers
const formatTableDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return '';
  }
};

const formatCurrency = (amount: number | string): string => { 
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0'; 
  return num.toLocaleString('en-PK');
};

const getFileNameFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const fileName = pathname.split('/').pop() || 'file';
    return fileName.length > 20 ? fileName.substring(0, 17) + '...' : fileName;
  } catch {
    return 'file';
  }
};

const getMonthFromDate = (dateString: string): string => {
  if (!dateString) return 'N/A';

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';

    const year = date.getFullYear();
    const monthName = date.toLocaleString('default', { month: 'long' }); // e.g. "October"

    return `${monthName} ${year}`; // ✅ "October 2025"
  } catch {
    return 'N/A';
  }
};

interface PettyCashExpensesListProps {
  records: any[];
  loading: boolean;
  viewMode: 'table' | 'grid';
  onView: (record: any) => void;
  onEdit: (record: any) => void;
  onDelete: (record: any) => void;
  onImageClick: (imageUrl: string | null, title: string) => void;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  searchTerm: string;
  summary: any;
  officeName: string;
  openingBalance: number;
  closingBalance: number;
  totalExpense: number;
  totalIncome: number;
}

const PettyCashExpensesList: React.FC<PettyCashExpensesListProps> = ({
  records,
  loading,
  onView,
  onEdit,
  onDelete,
  onImageClick,
  totalPages,
  currentPage,
  onPageChange,
  searchTerm,
  officeName,
  openingBalance,
  closingBalance,
  totalExpense,
  totalIncome
}) => {

  const transformedRecords = records.map(record => ({
    _id: record._id,
    dateOfPayment: record.date || record.createdAt,
    title: record.title,
    description: record.description || record.notes || '',
    reference: record.reference || '-',
    debit: record.transactionType === 'expense' ? record.amount : 0,
    credit: record.transactionType === 'income' ? record.amount : 0,
    balanceAfter: record.balanceAfter || 0,
    bankName: record.bankName || record.paymentMethod || '-',
    chequeImage: record.chequeImage || record.receiptImage || record.supportingDocuments?.[0] || null,
    status: record.status,
    transactionType: record.transactionType,
    office: record.office
  }));

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading petty cash records...</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-xl shadow-sm border">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No petty cash records found</h3>
        <p className="text-gray-500 mb-4">
          {searchTerm ? 'Try adjusting your search terms or filters' : 'Get started by adding your first petty cash record'}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Expense Sheet Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {/* Header Section with Opening Balance */}
        <div className="border-b border-gray-300 p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2 max-sm:text-lg">
              Expense Sheet (ATRULE Technologies {officeName})
            </h1>
            <h2 className="text-xl font-semibold text-gray-700 mb-4 max-sm:text-lg">
              {records.length > 0
                ? getMonthFromDate(records[0].date || records[0].createdAt)
                : 'Current Month'
              }
            </h2>
            <div className='flex flex-wrap gap-2 justify-center items-center'>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
                <p className="text-sm font-semibold text-blue-800 max-sm:text-sm">
                  Opening Balance: Rs. {formatCurrency(openingBalance)}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
                <p className="text-sm font-semibold text-blue-800 max-sm:text-sm">
                  Total Expense: Rs. {formatCurrency(totalExpense)}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 inline-block">
                <p className="text-sm font-semibold text-blue-800 max-sm:text-sm">
                  Total Income: Rs. {formatCurrency(totalIncome)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-300">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-300">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-300">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-300">
                  Reference
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-300">
                  Amount Spent (Debit)
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-300">
                  Amount Received (Credit)
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-300">
                  Remaining Balance
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-300">
                  Bank Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-300">
                  Receipt / Cheque
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {transformedRecords.map((record, index) => (
                <tr
                  key={record._id}
                  className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                >
                  <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                    {formatTableDate(record.dateOfPayment)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                    <div>
                      <div className="font-medium">{record.title || 'No Title'}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {record.description || 'No description'}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                    {record.reference || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                    {record.debit ? `Rs. ${formatCurrency(record.debit)}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                    {record.credit ? `Rs. ${formatCurrency(record.credit)}` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                    Rs. {formatCurrency(record.balanceAfter || 0)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                    {record.bankName || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                    {record.chequeImage ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onImageClick(record.chequeImage, record.title || 'Receipt Image')}
                          className="flex items-center gap-2 p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full"
                        >
                          <ImageIcon size={16} className="text-blue-600 flex-shrink-0" />
                          <span className="text-xs text-gray-700 truncate flex-1 text-left">
                            {getFileNameFromUrl(record.chequeImage)}
                          </span>
                          <MoreHorizontal size={14} className="text-gray-400 flex-shrink-0" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">No image</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-1">
                      <button
                        onClick={() => onView(records[index])} // Use original record for view
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => onEdit(records[index])} // Use original record for edit
                        className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Update"
                      >
      <UpdateIcon size={16} color="green" />
                      </button>
                      <button
                        onClick={() => onDelete(records[index])} // Use original record for delete
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
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

        {/* Footer with Closing Balance */}
        <div className="bg-gray-100 border-t border-gray-300 p-4">
          <div className="flex w-full flex-wrap justify-between items-center gap-4 text-sm text-gray-600">
            <div>
              Showing {records.length} of {records.length} records
              {loading && <span className="ml-2 text-blue-500">Loading...</span>}
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <span className="font-semibold text-green-800">
                  Closing Balance: Rs. {formatCurrency(closingBalance)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

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

export default PettyCashExpensesList;