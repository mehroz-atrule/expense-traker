import React, { useEffect, useState } from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
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

  const getStatusBadge = () => (
    <span className="inline-block text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
      Recorded
    </span>
  );

  // Redux
  const dispatch = useDispatch<AppDispatch>();
  const { pettyCashRecords, loading, error } = useSelector(
    (state: RootState) => state.pettycash
  );
  const pettyList = Array.isArray(pettyCashRecords) ? pettyCashRecords : [];

  console.log('Pettycash Records:', pettyList);

  // Local UI states
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [localPettyList, setLocalPettyList] = useState<any[]>([]);

  // Fetch data
  useEffect(() => {
    const params: Record<string, any> = { query: searchTerm, page, limit };
    dispatch(fetchPettyCash(params));
  }, [dispatch, searchTerm, page, limit]);

  useEffect(() => {
    setLocalPettyList(pettyList);
  }, [pettyList]);

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
            <div className="w-full sm:w-auto">
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
                className="w-full sm:inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
              >
                Add Pettycash
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Pettycash Transactions</h2>
            <div className="text-sm text-gray-500">Showing {localPettyList.length} records</div>
          </div>

          {/* Mobile view */}
          <div className="block md:hidden">
            {localPettyList.map((p) => (
              <div
                key={p._id}
                className="p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {p.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {getMonthFromDate(p.dateOfPayment)}
                    </p>
                    <p className="text-sm text-gray-500">{p.bankName || ''}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      Rs. {Number(p.amountSpent || p.amountRecieve || 0).toFixed(2)}
                    </span>
                    {getStatusBadge()}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <p>{getOfficeName(p.office)}</p>
                    <p>Payment: {formatDate(p.dateOfPayment)}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(p);
                        setViewModalOpen(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedItem(p);
                        setForm({
                          office: getOfficeName(p.office),
                          amount: String(p.amountSpent || p.amountRecieve || 0),
                          dateOfPayment: p.dateOfPayment,
                          transactionNo: p.transactionNo || '',
                          chequeNumber: p.chequeNumber || '',
                          bankName: p.bankName || '',
                          chequeImage: p.chequeImage || null,
                          month: getMonthFromDate(p.dateOfPayment),
                        });
                        setEditMode(true);
                        setCreateModalOpen(true);
                      }}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingDeleteId(p._id);
                        setConfirmDeleteOpen(true);
                        setSelectedItem(p);
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
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bank
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
                    Payment Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {localPettyList.map((p) => (
                  <tr key={p._id || p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {p.transactionNo || p._id}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="inline-block bg-gray-100 px-2 py-1 rounded-full">
                            {getMonthFromDate(p.dateOfPayment)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {p.bankName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getOfficeName(p.office)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      Rs. {Number(p.amountSpent || p.amountRecieve || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(p.dateOfPayment)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedItem(p);
                            setViewModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedItem(p);
                            setForm({
                              office: getOfficeName(p.office),
                              amount: String(p.amountSpent || p.amountRecieve || 0),
                              dateOfPayment: p.dateOfPayment,
                              transactionNo: p.transactionNo || '',
                              chequeNumber: p.chequeNumber || '',
                              bankName: p.bankName || '',
                              chequeImage: p.chequeImage || null,
                              month: getMonthFromDate(p.dateOfPayment),
                            });
                            setEditMode(true);
                            setCreateModalOpen(true);
                          }}
                          className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setPendingDeleteId(p._id);
                            setConfirmDeleteOpen(true);
                            setSelectedItem(p);
                          }}
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
                if (editMode && selectedItem) {
                  const updated = {
                    ...selectedItem,
                    office: form.office,
                    amountSpent: Number(form.amount || 0),
                    dateOfPayment: form.dateOfPayment,
                    transactionNo: form.transactionNo,
                    chequeNumber: form.chequeNumber,
                    bankName: form.bankName,
                    chequeImage: form.chequeImage,
                    month: form.month,
                  };
                  setLocalPettyList((prev) =>
                    prev.map((item) =>
                      item._id === selectedItem._id ? updated : item
                    )
                  );
                } else {
                  const newItem = {
                    _id: `pc-${Date.now()}`,
                    office: form.office,
                    amountSpent: Number(form.amount || 0),
                    dateOfPayment: form.dateOfPayment,
                    transactionNo: form.transactionNo,
                    chequeNumber: form.chequeNumber,
                    bankName: form.bankName,
                    chequeImage: form.chequeImage,
                    month: form.month,
                    createdAt: new Date().toISOString(),
                  };
                  setLocalPettyList((prev) => [newItem, ...prev]);
                }

                // reset
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
              Save
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
            currentStatusKey={'InReviewByFinance'}
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
                <p className="text-sm font-medium text-gray-600 mb-1">Status</p>
                <div className="p-2">
                  {getStatusBadge()}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Record ID</p>
                <p className="p-2 bg-gray-50 rounded border text-gray-900 text-xs font-mono">
                  {selectedItem._id}
                </p>
              </div>
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
            setLocalPettyList(prev => prev.filter(item => item._id !== pendingDeleteId));
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