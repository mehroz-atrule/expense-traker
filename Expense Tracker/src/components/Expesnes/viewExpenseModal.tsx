import React from 'react';
import { Eye, FileText } from 'lucide-react';
import Modal from '../../components/Modal';

interface ViewExpenseModalProps {
  open: boolean;
  onClose: () => void;
  expense: any;
  getOfficeName: (officeId: string) => string;
  onImageClick: (imageUrl: string | null, title: string) => void;
  activeTab: string;
}

const ViewExpenseModal: React.FC<ViewExpenseModalProps> = ({
  open,
  onClose,
  expense,
  getOfficeName,
  onImageClick,
  activeTab
}) => {
  if (!expense) return null;

  const [pdfStates, setPdfStates] = React.useState<{ [key: string]: boolean }>({});

  React.useEffect(() => {
    const checkPdf = async (url: string | undefined | null, type: string) => {
      if (!url) {
        setPdfStates(prev => ({ ...prev, [type]: false }));
        return;
      }

      try {
        if (url.startsWith('blob:')) {
          const res = await fetch(url);
          const ct = res.headers.get('content-type');
          setPdfStates(prev => ({ ...prev, [type]: !!(ct && (ct.includes('pdf') || ct.includes('application/pdf'))) }));
        } else {
          setPdfStates(prev => ({ ...prev, [type]: url.toLowerCase().endsWith('.pdf') }));
        }
      } catch (err) {
        // treat as not-pdf on error
        setPdfStates(prev => ({ ...prev, [type]: false }));
      }
    };

    checkPdf(expense.image, 'image');
    checkPdf(expense.chequeImage, 'cheque');
    checkPdf(expense.paymentSlip, 'paymentSlip');
  }, [expense.image, expense.chequeImage, expense.paymentSlip]);

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
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return `px-3 py-1 rounded-full text-xs font-medium ${status && STATUS_CLASSES[status] ? STATUS_CLASSES[status] : 'bg-gray-100 text-gray-800'
      }`;
  };

  return (
    <Modal
      open={open}
      title="Expense Details"
      onClose={onClose}
      widthClassName="max-w-4xl"
      footer={
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm rounded border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
        >
          Close
        </button>
      }
    >
      <div className="space-y-6">
        {/* Images Section */}
        {(expense.image || expense.chequeImage || expense.paymentSlip) && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Documents & Receipts</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Expense Receipt */}
              {expense.image && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600">Expense Receipt test</label>
                  {pdfStates['image'] ? (
                    <div
                      onClick={() => onImageClick(expense.image, 'Expense Receipt')}
                      className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden flex flex-col items-center justify-center p-4 group border-2 border-dashed"
                    >
                      <div className="flex flex-col items-center justify-center text-center">
                        <FileText className="w-4 h-4 text-red-500" />
                        <span className="text-sm font-medium text-gray-700 block truncate max-w-full">PDF Document</span>
                        <span className="text-xs text-gray-500 mt-1">Click to view</span>
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center transition-all duration-200 rounded-lg">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                          <div className="bg-white bg-opacity-80 rounded-full p-2">
                            <Eye className="w-4 h-4 text-gray-700" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => onImageClick(expense.image, 'Expense Receipt')}
                      className="relative w-full h-32 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                    >
                      <img
                        src={expense.image}
                        alt="Expense Receipt"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <div className="opacity-0 hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 rounded-full p-2">
                          <Eye className="w-4 h-4 text-gray-700" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Cheque Image */}
              {expense.chequeImage && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600">Issued Cheque</label>
                  {pdfStates['cheque'] ? (
                    <div
                      onClick={() => onImageClick(expense.chequeImage, 'Issued Cheque')}
                      className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden flex flex-col items-center justify-center p-4 group border-2 border-dashed"
                    >
                      <div className="flex flex-col items-center justify-center text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-red-500 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
                        <span className="text-sm font-medium text-gray-700 block truncate max-w-full">PDF Document</span>
                        <span className="text-xs text-gray-500 mt-1">Click to view</span>
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center transition-all duration-200 rounded-lg">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                          <div className="bg-white bg-opacity-80 rounded-full p-2">
                            <Eye className="w-4 h-4 text-gray-700" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => onImageClick(expense.chequeImage, 'Issued Cheque')}
                      className="relative w-full h-32 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all duration-200"
                    >
                      <img
                        src={expense.chequeImage}
                        alt="Issued Cheque"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <div className="opacity-0 hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 rounded-full p-2">
                          <Eye className="w-4 h-4 text-gray-700" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Slip */}
              {expense.paymentSlip && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-600">Payment Receipt</label>
                  {pdfStates['paymentSlip'] ? (
                    <div
                      onClick={() => onImageClick(expense.paymentSlip, 'Payment Receipt')}
                      className="relative w-full h-32 bg-gray-100 rounded-lg overflow-hidden flex flex-col items-center justify-center p-4 group border-2 border-dashed"
                    >
                      <div className="flex flex-col items-center justify-center text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-red-500 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
                        <span className="text-sm font-medium text-gray-700 block truncate max-w-full">PDF Document</span>
                        <span className="text-xs text-gray-500 mt-1">Click to view</span>
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 flex items-center justify-center transition-all duration-200 rounded-lg">
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100">
                          <div className="bg-white bg-opacity-80 rounded-full p-2">
                            <Eye className="w-4 h-4 text-gray-700" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => onImageClick(expense.paymentSlip, 'Payment Receipt')}
                      className="relative w-full h-32 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all duration-200"
                    >
                      <img
                        src={expense.paymentSlip}
                        alt="Payment Receipt"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <div className="opacity-0 hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 rounded-full p-2">
                          <Eye className="w-4 h-4 text-gray-700" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Expense Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                {activeTab === 'vendor' ? 'Title' : 'Description'}
              </label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">
                {expense.title || expense.description}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">Description</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{expense.description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">Category</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">{expense.category}</p>
            </div>

            {activeTab === 'pettycash' && (
              <div>
                <label className="block text-sm font-medium text-gray-600">Transaction Type</label>
                <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded capitalize">
                  {expense.transactionType}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Office</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">
                {getOfficeName(expense.office)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">Amount</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded font-bold">
                {activeTab === 'pettycash' && expense.transactionType === 'income' ? '+' : ''}
                Rs. {Number(expense.amount).toFixed(2)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">Status</label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">
                <span className={getStatusColor(expense.status || '')}>
                  {(expense.status || 'New').replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">
                {expense.dueDate ? 'Due Date' : 'Date'}
              </label>
              <p className="text-sm text-gray-900 p-2 bg-gray-50 rounded">
                {formatDate(expense.dueDate || expense.date)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewExpenseModal;