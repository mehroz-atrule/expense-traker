import React, { useEffect, useState } from 'react';
import { Eye, Edit, Trash2, Download, Printer } from 'lucide-react';
import SelectDropdown from '../../components/Forms/SelectionDropDown';
import ImageModal from '../../components/ImageViewModal';
import ImageUploadSection from '../../components/ExpenseForm/ImageUploadSection';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import EnhancedInput from '../../components/Forms/EnhancedInput';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPettyCash } from '../../redux/pettycash/pettycashSlice';
import type { AppDispatch, RootState } from '../../app/store';
import type { PettyCashRecord } from '../../types/pettycash';
import Pagination from '../../components/Pagination';

// Office options
const officeOptions = [
  { value: 'lahore', label: 'Lahore' },
  { value: 'multan', label: 'Multan' },
];

// ✅ Helper: safely handle month value from dateOfPayment
const getMonthFromDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Months are 0-indexed
    return `${year}-${month.toString().padStart(2, '0')}`;
  } catch (error) {
    return 'N/A';
  }
};

// ✅ Helper: safely get office name (handle both object and string)
const getOfficeName = (office: any): string => {
  if (typeof office === 'string') return office;
  if (office && typeof office === 'object') {
    return office.name || office._id || 'N/A';
  }
  return 'N/A';
};

// ✅ Helper: Format date to DD-MM-YYYY
const formatTableDate = (dateString: string): string => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}-${month}-${year}`;
  } catch (error) {
    return '';
  }
};

// ✅ Helper: Format currency with commas
const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-PK');
};

const PettycashExpense: React.FC = () => {
  const [form, setForm] = useState({
    office: 'lahore',
    amount: '',
    dateOfPayment: '',
    transactionNo: '',
    chequeNumber: '',
    bankName: '',
    chequeImage: null as string | null,
    month: '',
  });

  const formatDate = (d?: string) => (d ? new Date(d).toLocaleDateString() : 'N/A');

  // Redux
  const dispatch = useDispatch<AppDispatch>();
  const { pettyCashRecords, total, page, limit, loading, error } = useSelector(
    (state: RootState) => state.pettycash
  );
  
  // Extract data from state
  const pettyList = Array.isArray(pettyCashRecords) ? pettyCashRecords : [];
  const totalRecords = total || 0;
  const currentPage = page || 1;
  const currentLimit = limit || 10;

  console.log('Pettycash Records:', pettyList);
  console.log('Pagination Info:', { total: totalRecords, page: currentPage, limit: currentLimit });

  // Local UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [localPage, setLocalPage] = useState(1);
  const [localLimit] = useState(10);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Calculate total pages
  const totalPages = Math.ceil(totalRecords / currentLimit);

  // Fetch data
  useEffect(() => {
    const params: Record<string, any> = { query: searchTerm, page: localPage, limit: localLimit };
    dispatch(fetchPettyCash(params));
  }, [dispatch, searchTerm, localPage, localLimit]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setLocalPage(newPage);
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setLocalPage(1); // Reset to first page on new search
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between h-auto sm:h-16 gap-3 sm:gap-0 py-3">
            <div className="flex items-center space-x-3">
              <h1 className="text-lg font-semibold text-gray-900">Pettycash Expense</h1>
              <p className="text-sm text-gray-500">Manage pettycash transactions</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download size={16} />
                Export
              </button>
              <button className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Printer size={16} />
                Print
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  setSelectedItem(null);
                  setForm({
                    office: 'lahore',
                    amount: '',
                    dateOfPayment: '',
                    transactionNo: '',
                    chequeNumber: '',
                    bankName: '',
                    chequeImage: null,
                    month: '',
                  });
                  setCreateModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
              >
                Add Pettycash
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 w-full">
              <EnhancedInput
                label="Search Transactions"
                placeholder="Search by title, description, bank name..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <div className="text-sm text-gray-500">
              {loading ? 'Searching...' : `${totalRecords} records found`}
            </div>
          </div>
        </div>
      </div>

      {/* Expense Sheet Table */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 pb-6">
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {/* Header Section */}
          <div className="border-b border-gray-300 p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Expense Sheet (ATRULE Technological {getOfficeName(pettyList[0]?.office)} Office)
              </h1>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                {getMonthFromDate(pettyList[0]?.dateOfPayment) || 'Current Month'}
              </h2>
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
                    Amount Spent
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-300">
                    Amount Received
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-300">
                    Amount Remaining
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-300">
                    Details
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-r border-gray-300">
                    Classification Bill
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      Loading transactions...
                    </td>
                  </tr>
                ) : pettyList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  pettyList.map((record, index) => (
                    <tr 
                      key={record._id} 
                      className={`border-b border-gray-200 hover:bg-gray-50 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                        {formatTableDate(record.dateOfPayment)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                        {record.amountSpent ? `Rs. ${formatCurrency(record.amountSpent)}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                        {record.amountRecieve ? `Rs. ${formatCurrency(record.amountRecieve)}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r border-gray-200">
                        Rs. {formatCurrency(record.remainingAmount)}
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
                        {record.bankName || record.transactionNo || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              setSelectedItem(record);
                              setViewModalOpen(true);
                            }}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedItem(record);
                              setForm({
                                office: getOfficeName(record.office),
                                amount: String(record.amountSpent || record.amountRecieve || 0),
                                dateOfPayment: record.dateOfPayment,
                                transactionNo: record.transactionNo || '',
                                chequeNumber: record.chequeNumber || '',
                                bankName: record.bankName || '',
                                chequeImage: record.chequeImage || null,
                                month: getMonthFromDate(record.dateOfPayment),
                              });
                              setEditMode(true);
                              setCreateModalOpen(true);
                            }}
                            className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setPendingDeleteId(record._id);
                              setConfirmDeleteOpen(true);
                              setSelectedItem(record);
                            }}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="bg-gray-100 border-t border-gray-300 p-4">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div>
                Showing {pettyList.length} of {totalRecords} records
                {loading && <span className="ml-2 text-blue-500">Loading...</span>}
              </div>
              <div>
                Closing Balance: Rs. {
                  formatCurrency(
                    pettyList.length > 0 
                      ? pettyList[pettyList.length - 1].remainingAmount 
                      : 0
                  )
                }
              </div>
            </div>
          </div>
        </div>

        {/* Pagination Component */}
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* ✅ Create/Edit Modal */}
      <Modal
        open={createModalOpen}
        title={editMode ? 'Edit Pettycash' : 'Add Pettycash'}
        onClose={() => {
          setCreateModalOpen(false);
          setEditMode(false);
          setSelectedItem(null);
        }}
        widthClassName="max-w-3xl"
        footer={
          <>
            <button
              onClick={() => {
                setCreateModalOpen(false);
                setEditMode(false);
                setSelectedItem(null);
              }}
              className="px-4 py-2 rounded border bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Here you would dispatch create/update actions
                // For now, just close the modal
                setCreateModalOpen(false);
                setEditMode(false);
                setSelectedItem(null);
                setForm({
                  office: 'lahore',
                  amount: '',
                  dateOfPayment: '',
                  transactionNo: '',
                  chequeNumber: '',
                  bankName: '',
                  chequeImage: null,
                  month: '',
                });
              }}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              {editMode ? 'Update' : 'Save'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <SelectDropdown
            label="Office"
            options={officeOptions}
            value={officeOptions.find((o) => o.value === form.office) || null}
            onChange={(opt: any) =>
              setForm((prev) => ({ ...prev, office: opt?.value }))
            }
          />

          <EnhancedInput
            label="Amount"
            type="number"
            value={form.amount}
            onChange={(v) => setForm((prev) => ({ ...prev, amount: v }))}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <EnhancedInput
              label="Date of Payment"
              type="date"
              value={form.dateOfPayment}
              onChange={(v) => setForm((prev) => ({ ...prev, dateOfPayment: v }))}
            />
            <EnhancedInput
              label="Transaction No"
              value={form.transactionNo}
              onChange={(v) => setForm((prev) => ({ ...prev, transactionNo: v }))}
            />
          </div>

          <EnhancedInput
            label="Cheque Number"
            value={form.chequeNumber}
            onChange={(v) => setForm((prev) => ({ ...prev, chequeNumber: v }))}
          />

          <EnhancedInput
            label="Bank Name"
            value={form.bankName}
            onChange={(v) => setForm((prev) => ({ ...prev, bankName: v }))}
          />

          <ImageUploadSection
            preview={null}
            chequePreview={form.chequeImage}
            paymentSlipPreview={null}
            isViewMode={false}
            isEditing={editMode}
            isCashPayment={false}
            isBankTransfer={false}
            currentStatusKey={'ReviewedByFinance'}
            shouldShowPaymentSlip={false}
            showExpenseReceipt={false}
            onImageClick={(url) => {
              if (url) {
                setCurrentImage(url);
                setImageModalOpen(true);
              }
            }}
            onFileChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const url = URL.createObjectURL(file);
              setForm((prev) => ({ ...prev, chequeImage: url }));
            }}
          />

          <EnhancedInput
            label="Month"
            value={form.month}
            placeholder="YYYY-MM"
            onChange={(v) => setForm((prev) => ({ ...prev, month: v }))}
          />
        </div>
      </Modal>

      {/* ✅ View Modal */}
      <Modal
        open={viewModalOpen}
        title="Pettycash Details"
        onClose={() => {
          setViewModalOpen(false);
          setSelectedItem(null);
        }}
        widthClassName="max-w-3xl"
        footer={
          <button
            onClick={() => {
              setViewModalOpen(false);
              setSelectedItem(null);
            }}
            className="px-4 py-2 rounded border bg-white hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        }
      >
        {selectedItem && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Office</p>
                <p className="p-2 bg-gray-50 rounded border text-gray-900">
                  {getOfficeName(selectedItem.office)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Amount</p>
                <p className="p-2 bg-gray-50 rounded border text-gray-900 font-semibold">
                  Rs. {Number(selectedItem.amountSpent || selectedItem.amountRecieve || 0).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Date of Payment</p>
                <p className="p-2 bg-gray-50 rounded border text-gray-900">
                  {formatDate(selectedItem.dateOfPayment)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Transaction No</p>
                <p className="p-2 bg-gray-50 rounded border text-gray-900">
                  {selectedItem.transactionNo || 'N/A'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Cheque Number</p>
                <p className="p-2 bg-gray-50 rounded border text-gray-900">
                  {selectedItem.chequeNumber || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Bank Name</p>
                <p className="p-2 bg-gray-50 rounded border text-gray-900">
                  {selectedItem.bankName || 'N/A'}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Month</p>
              <p className="p-2 bg-gray-50 rounded border text-gray-900">
                {getMonthFromDate(selectedItem.dateOfPayment)}
              </p>
            </div>

            {selectedItem.chequeImage && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Cheque Image</p>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={() => {
                    setCurrentImage(selectedItem.chequeImage);
                    setImageModalOpen(true);
                  }}
                >
                  <div className="flex items-center justify-center">
                    <img 
                      src={selectedItem.chequeImage} 
                      alt="Cheque" 
                      className="max-h-32 object-contain rounded"
                    />
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Click to view full image
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Opening Balance</p>
                <p className="p-2 bg-gray-50 rounded border text-gray-900">
                  Rs. {formatCurrency(selectedItem.openingBalance || 0)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Closing Balance</p>
                <p className="p-2 bg-gray-50 rounded border text-gray-900">
                  Rs. {formatCurrency(selectedItem.closingBalance || 0)}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Record ID</p>
              <p className="p-2 bg-gray-50 rounded border text-gray-900 text-xs font-mono">
                {selectedItem._id}
              </p>
            </div>
          </div>
        )}
      </Modal>

      {/* ✅ Image Modal */}
      <ImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        imageUrl={currentImage || ''}
        title="Cheque Image"
      />

      {/* ✅ Confirm Delete Dialog */}
      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete Pettycash Record"
        message="Are you sure you want to delete this pettycash record? This action cannot be undone."
        onConfirm={() => {
          if (pendingDeleteId) {
            // Here you would dispatch delete action
            // dispatch(deletePettyCashExpenseById(pendingDeleteId));
          }
          setConfirmDeleteOpen(false);
          setPendingDeleteId(null);
          setSelectedItem(null);
        }}
        onCancel={() => {
          setConfirmDeleteOpen(false);
          setPendingDeleteId(null);
          setSelectedItem(null);
        }}
      />
    </div>
  );
};

export default PettycashExpense;