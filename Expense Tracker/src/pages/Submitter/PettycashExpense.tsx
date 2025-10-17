import React, { useState } from 'react';
import { Eye, Edit, Trash2 } from 'lucide-react';
import SelectDropdown from '../../components/Forms/SelectionDropDown';
import ImageModal from '../../components/ImageViewModal';
import ImageUploadSection from '../../components/ExpenseForm/ImageUploadSection';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import EnhancedInput from '../../components/Forms/EnhancedInput';

const officeOptions = [
  { value: 'lahore', label: 'Lahore' },
  { value: 'multan', label: 'Multan' },
];

const pettyCashOptions = [
  { value: 'pc-1', label: 'PC-001' },
  { value: 'pc-2', label: 'PC-002' },
];

const PettycashExpense: React.FC = () => {
  const [form, setForm] = useState({
    office: 'lahore',
    amount: '',
    dateOfPayment: '',
    transactionNo: '',
    chequeNumber: '',
    bankName: '',
    chequeImage: null as string | null,
    openingBalance: '',
    closingBalance: '',
    month: '',
    pettyCashId: '',
  });

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString() : 'N/A';

  const getStatusBadge = () => {
    // simple badge for pettycash (adjust as needed)
    return <span className="inline-block text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Recorded</span>;
  };

  // petty cash list state (mocked initial data)
  const [pettyList, setPettyList] = useState<any[]>([
    {
      id: 'pc-1',
      office: 'lahore',
      amount: 5000,
      dateOfPayment: '2025-10-01',
      transactionNo: 'TRX1001',
      chequeNumber: 'CHQ123',
      bankName: 'ABC Bank',
      chequeImage: null,
      openingBalance: 10000,
      closingBalance: 5000,
      month: '2025-10',
      createdAt: new Date().toISOString(),
    }
  ]);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // helper to update form values handled inline where needed

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between h-auto sm:h-16 gap-3 sm:gap-0 py-3">
            <div className="flex items-center space-x-3">
              <h1 className="text-lg font-semibold text-gray-900">Pettycash Expense</h1>
              <p className="text-sm text-gray-500">Manage pettycash transactions</p>
            </div>
            <div className="w-full sm:w-auto">
              <button onClick={() => { setEditMode(false); setSelectedItem(null); setForm({ office: 'lahore', amount: '', dateOfPayment: '', transactionNo: '', chequeNumber: '', bankName: '', chequeImage: null, openingBalance: '', closingBalance: '', month: '', pettyCashId: '' }); setCreateModalOpen(true); }} className="w-full sm:inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700">
                Add Pettycash
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6">
        <div className="bg-white rounded-xl shadow-sm border p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Pettycash Transactions</h2>
            <div className="text-sm text-gray-500">Showing {pettyList.length} records</div>
          </div>

          
            {/* Listing - mobile cards + desktop table (matches MyExpenses layout) */}
            <div className="bg-white rounded-xl shadow-sm border">
              {/* Mobile view */}
              <div className="block md:hidden">
                {pettyList.map((p) => (
                  <div key={p.id} className="p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800">{p.transactionNo || p.id}</h3>
                        <p className="text-sm text-gray-500">{p.month}</p>
                        <p className="text-sm text-gray-500">{p.bankName || ''}</p>
                      </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-lg font-bold text-gray-900">Rs. {Number(p.amount).toFixed(2)}</span>
                      {getStatusBadge()}
                    </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <p>{p.office}</p>
                        <p>Payment: {formatDate(p.dateOfPayment)}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedItem(p); setViewModalOpen(true); }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedItem(p); setForm({ office: p.office, amount: String(p.amount), dateOfPayment: p.dateOfPayment, transactionNo: p.transactionNo, chequeNumber: p.chequeNumber || '', bankName: p.bankName || '', chequeImage: p.chequeImage || null, openingBalance: String(p.openingBalance || ''), closingBalance: String(p.closingBalance || ''), month: p.month || '', pettyCashId: p.id || '' }); setEditMode(true); setCreateModalOpen(true); }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setPendingDeleteId(p.id); setConfirmDeleteOpen(true); setSelectedItem(p); }}
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bank</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Office</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {pettyList.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{p.transactionNo || p.id}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              <span className="inline-block bg-gray-100 px-2 py-1 rounded-full">{p.month}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.bankName || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{p.office}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">Rs. {Number(p.amount).toFixed(2)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(p.dateOfPayment)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => { setSelectedItem(p); setViewModalOpen(true); }} className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors" title="View Details"><Eye size={16} /></button>
                            <button onClick={() => { setSelectedItem(p); setForm({ office: p.office, amount: String(p.amount), dateOfPayment: p.dateOfPayment, transactionNo: p.transactionNo, chequeNumber: p.chequeNumber || '', bankName: p.bankName || '', chequeImage: p.chequeImage || null, openingBalance: String(p.openingBalance || ''), closingBalance: String(p.closingBalance || ''), month: p.month || '', pettyCashId: p.id || '' }); setEditMode(true); setCreateModalOpen(true); }} className="text-green-600 hover:text-green-900 p-1 hover:bg-green-50 rounded transition-colors" title="Edit"><Edit size={16} /></button>
                            <button onClick={() => { setPendingDeleteId(p.id); setConfirmDeleteOpen(true); setSelectedItem(p); }} className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors" title="Delete"><Trash2 size={16} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
        </div>
      </div>

      {/* Create modal */}
      <Modal
        open={createModalOpen}
  title={editMode ? 'Edit Pettycash' : 'Add Pettycash'}
  onClose={() => { setCreateModalOpen(false); setEditMode(false); setSelectedItem(null); }}
        widthClassName="max-w-3xl"
        footer={
          <>
            <button onClick={() => { setCreateModalOpen(false); setEditMode(false); setSelectedItem(null); }} className="px-4 py-2 rounded border bg-white">Cancel</button>
            <button onClick={() => {
              if (editMode && selectedItem) {
                const updated = {
                  ...selectedItem,
                  office: form.office,
                  amount: Number(form.amount || 0),
                  dateOfPayment: form.dateOfPayment,
                  transactionNo: form.transactionNo,
                  chequeNumber: form.chequeNumber,
                  bankName: form.bankName,
                  chequeImage: form.chequeImage,
                  openingBalance: Number(form.openingBalance || 0),
                  closingBalance: Number(form.closingBalance || 0),
                  month: form.month,
                };
                setPettyList(prev => prev.map(item => item.id === selectedItem.id ? updated : item));
              } else {
                const newItem = {
                  id: `pc-${Date.now()}`,
                  office: form.office,
                  amount: Number(form.amount || 0),
                  dateOfPayment: form.dateOfPayment,
                  transactionNo: form.transactionNo,
                  chequeNumber: form.chequeNumber,
                  bankName: form.bankName,
                  chequeImage: form.chequeImage,
                  openingBalance: Number(form.openingBalance || 0),
                  closingBalance: Number(form.closingBalance || 0),
                  month: form.month,
                  createdAt: new Date().toISOString(),
                };
                setPettyList(prev => [newItem, ...prev]);
              }
              // reset
              setCreateModalOpen(false);
              setEditMode(false);
              setSelectedItem(null);
              setForm({ office: 'lahore', amount: '', dateOfPayment: '', transactionNo: '', chequeNumber: '', bankName: '', chequeImage: null, openingBalance: '', closingBalance: '', month: '', pettyCashId: '' });
            }} className="px-4 py-2 rounded bg-blue-600 text-white">Save</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <SelectDropdown label="Office" options={officeOptions} value={officeOptions.find(o => o.value === form.office) || null} onChange={(opt:any) => setForm(prev => ({ ...prev, office: opt?.value }))} />
          </div>

          <div>
            <EnhancedInput label="Amount" type="number" value={form.amount} onChange={(v) => setForm(prev => ({ ...prev, amount: v }))} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <EnhancedInput label="Date of Payment" type="date" value={form.dateOfPayment} onChange={(v) => setForm(prev => ({ ...prev, dateOfPayment: v }))} />
            </div>

            <div>
              <EnhancedInput label="Transaction No" value={form.transactionNo} onChange={(v) => setForm(prev => ({ ...prev, transactionNo: v }))} />
            </div>
          </div>

          <div>
            <EnhancedInput label="Cheque Number" value={form.chequeNumber} onChange={(v) => setForm(prev => ({ ...prev, chequeNumber: v }))} />
          </div>

          <div>
            <EnhancedInput label="Bank Name" value={form.bankName} onChange={(v) => setForm(prev => ({ ...prev, bankName: v }))} />
          </div>

          <div>
            <ImageUploadSection
              preview={null}
              chequePreview={form.chequeImage}
              paymentSlipPreview={null}
              isViewMode={false}
              isEditing={editMode}
              isCashPayment={false}
              isBankTransfer={false}
              currentStatusKey={"InReviewByFinance"}
              shouldShowPaymentSlip={false}
              showExpenseReceipt={false} /* hide Expense Receipt for pettycash */
              onImageClick={(url) => { if (url) { setCurrentImage(url); setImageModalOpen(true); } }}
              onFileChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const url = URL.createObjectURL(file);
                setForm(prev => ({ ...prev, chequeImage: url }));
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <EnhancedInput label="Opening Balance" type="number" value={form.openingBalance} onChange={(v) => setForm(prev => ({ ...prev, openingBalance: v }))} />
            </div>
            <div>
              <EnhancedInput label="Closing Balance" type="number" value={form.closingBalance} onChange={(v) => setForm(prev => ({ ...prev, closingBalance: v }))} />
            </div>
          </div>

          <div>
            <EnhancedInput label="Month" value={form.month} placeholder="YYYY-MM" onChange={(v) => setForm(prev => ({ ...prev, month: v }))} />
          </div>

          <div>
            <SelectDropdown label="PettyCash ID" options={pettyCashOptions} value={pettyCashOptions.find(o => o.value === form.pettyCashId) || null} onChange={(opt:any) => setForm(prev => ({ ...prev, pettyCashId: opt?.value }))} />
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal
        open={viewModalOpen}
        title="Pettycash Details"
        onClose={() => { setViewModalOpen(false); setSelectedItem(null); }}
        widthClassName="max-w-3xl"
        footer={
            <button onClick={() => { setViewModalOpen(false); setSelectedItem(null); }} className="px-4 py-2 rounded border bg-white">Close</button>
        }
      >
        {selectedItem && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Office</p>
              <p className="p-2 bg-gray-50 rounded">{selectedItem.office}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Amount</p>
              <p className="p-2 bg-gray-50 rounded">Rs. {Number(selectedItem.amount).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Date of Payment</p>
              <p className="p-2 bg-gray-50 rounded">{new Date(selectedItem.dateOfPayment).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Transaction No</p>
              <p className="p-2 bg-gray-50 rounded">{selectedItem.transactionNo}</p>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="Delete Pettycash Entry"
        message="Are you sure you want to delete this pettycash entry? This action cannot be undone."
        onConfirm={() => {
          if (pendingDeleteId) {
            setPettyList(prev => prev.filter(item => item.id !== pendingDeleteId));
          }
          setConfirmDeleteOpen(false);
          setPendingDeleteId(null);
          setSelectedItem(null);
        }}
        onCancel={() => { setConfirmDeleteOpen(false); setPendingDeleteId(null); setSelectedItem(null); }}
      />

      <ImageModal isOpen={imageModalOpen} onClose={() => setImageModalOpen(false)} imageUrl={currentImage || ''} title="Cheque Image" />
    </div>
  );
};

export default PettycashExpense;
