import React from 'react';
import type { PettyCashRecord } from '../../types/pettycash';
import Modal from '../Modal';

// Helper functions
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return 'N/A';
  }
};

const formatCurrency = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-PK');
};

const getOfficeName = (office: any): string => {
  if (typeof office === 'string') return office;
  if (office && typeof office === 'object') {
    return office.name || office._id || 'N/A';
  }
  return 'N/A';
};

interface ViewModalProps {
  open: boolean;
  selectedItem: PettyCashRecord | null;
  onClose: () => void;
  onImageClick: (imageUrl: string) => void;
}

const ViewModal: React.FC<ViewModalProps> = ({
  open,
  selectedItem,
  onClose,
  onImageClick
}) => {
  if (!selectedItem) return null;

  return (
    <Modal
      open={open}
      title="Pettycash Details"
      onClose={onClose}
      widthClassName="max-w-3xl"
      footer={
        <button
          onClick={onClose}
          className="px-4 py-2 rounded border bg-white hover:bg-gray-50 transition-colors"
        >
          Close
        </button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Office</p>
            <p className="p-2 bg-gray-50 rounded border text-gray-900">
              {getOfficeName(selectedItem.office)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Transaction Type</p>
            <p className="p-2 bg-gray-50 rounded border text-gray-900">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                selectedItem.transactionType === 'income' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {selectedItem.transactionType || 'expense'}
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Amount</p>
            <p className="p-2 bg-gray-50 rounded border text-gray-900 font-semibold">
              Rs. {Number(selectedItem.amount || 0).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Remaining Balance</p>
            <p className="p-2 bg-gray-50 rounded border text-gray-900 font-semibold">
              Rs. {formatCurrency(selectedItem.balanceAfter || 0)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Debit</p>
            <p className="p-2 bg-gray-50 rounded border text-gray-900">
              {selectedItem.debit ? `Rs. ${formatCurrency(selectedItem.debit)}` : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Credit</p>
            <p className="p-2 bg-gray-50 rounded border text-gray-900">
              {selectedItem.credit ? `Rs. ${formatCurrency(selectedItem.credit)}` : 'N/A'}
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
            <p className="text-sm font-medium text-gray-600 mb-1">Reference</p>
            <p className="p-2 bg-gray-50 rounded border text-gray-900">
              {selectedItem.reference || 'N/A'}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Month</p>
            <p className="p-2 bg-gray-50 rounded border text-gray-900">
              {selectedItem.month || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Transaction No</p>
            <p className="p-2 bg-gray-50 rounded border text-gray-900">
              {selectedItem.transactionNo || 'N/A'}
            </p>
          </div>
        </div>

        {selectedItem.chequeImage && (
          <div>
            <p className="text-sm font-medium text-gray-600 mb-2">Cheque Image</p>
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:border-gray-400 transition-colors"
              onClick={() => onImageClick(selectedItem.chequeImage!)}
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

        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">Record ID</p>
          <p className="p-2 bg-gray-50 rounded border text-gray-900 text-xs font-mono">
            {selectedItem._id}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default ViewModal;