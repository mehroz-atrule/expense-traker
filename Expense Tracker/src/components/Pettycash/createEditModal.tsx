import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import type { PettyCashRecord } from '../../types/pettycash';
import type { Office } from '../../types';
import type { AppDispatch } from '../../app/store';
import { createPettyCashExpense, updatePettyCashExpenseById } from '../../redux/pettycash/pettycashSlice';
import SelectDropdown from '../Forms/SelectionDropDown';
import EnhancedInput from '../Forms/EnhancedInput';
import ImageUploadSection from '../ExpenseForm/ImageUploadSection';
import Modal from '../Modal';

// Helper
const getCurrentMonth = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${month.toString().padStart(2, '0')}-${year}`;
};

const getCurrentDate = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Bank Options
const bankOptions = [
  { value: "Atrule HBL PKR", label: "Atrule HBL PKR" },
  { value: "Suleman Altaf HBL PKR", label: "Suleman Altaf HBL PKR" },
  { value: "Lahore Pettycash", label: "Lahore Pettycash" },
  { value: "Multan Pettycash", label: "Multan Pettycash" },
];

interface FormState {
  office: string;
  amount: string;
  dateOfPayment: string;
  transactionNo: string;
  chequeNumber: string;
  bankName: string;
  chequeImage: string | null;
  month: string;
  title: string;
  description: string;
}

interface CreateEditModalProps {
  open: boolean;
  editMode: boolean;
  selectedItem: PettyCashRecord | null;
  offices: Office[];
  selectedOffice: string;
  onClose: () => void;
}

// ✅ Reusable Section Component
const FormSection: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, children, className = '' }) => (
  <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
    </div>
    <div className="p-4">
      {children}
    </div>
  </div>
);

// ✅ Reusable Grid Container
const FormGrid: React.FC<{
  children: React.ReactNode;
  cols?: number;
}> = ({ children, cols = 2 }) => (
  <div className={`grid grid-cols-1 ${cols === 2 ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-4`}>
    {children}
  </div>
);

const CreateEditModal: React.FC<CreateEditModalProps> = ({
  open,
  editMode,
  selectedItem,
  offices,
  selectedOffice,
  onClose
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const [loading, setLoading] = useState(false);
  
  const officeOptions = useMemo(() => 
    offices.map((office: Office) => ({
      value: office._id!,
      label: office.name,
    })),
    [offices] 
  );

  const [form, setForm] = useState<FormState>({
    office: selectedOffice,
    amount: '',
    dateOfPayment: getCurrentDate(),
    transactionNo: '',
    chequeNumber: '',
    bankName: '',
    chequeImage: null,
    month: getCurrentMonth(),
    title: '',
    description: '',
  });

  // Set default office only once when modal opens and offices are available
  useEffect(() => {
    if (officeOptions.length > 0 && selectedOffice && !form.office) {
      setForm(prev => ({ ...prev, office: selectedOffice }));
    }
  }, [officeOptions.length, selectedOffice]);

  // Setup form for editing - only when editMode or selectedItem changes
  useEffect(() => {
    if (editMode && selectedItem) {
      let officeId = '';
      if (typeof selectedItem.office === 'string') {
        officeId = selectedItem.office;
      } else if (selectedItem.office && typeof selectedItem.office === 'object') {
        officeId = selectedItem.office._id || '';
      }

      setForm({
        office: officeId,
        amount: String(selectedItem.amount || 0),
        dateOfPayment: selectedItem.dateOfPayment,
        transactionNo: selectedItem.transactionNo || '',
        chequeNumber: selectedItem.chequeNumber || '',
        bankName: selectedItem.bankName || '',
        chequeImage: selectedItem.chequeImage || null,
        month: selectedItem.month || getCurrentMonth(),
        title: selectedItem.title || '',
        description: selectedItem.description || '',
      });
    }
  }, [editMode, selectedItem]);

  // Reset form when modal opens for new record
  useEffect(() => {
    if (open && !editMode) {
      setForm({
        office: selectedOffice,
        amount: '',
        dateOfPayment: getCurrentDate(),
        transactionNo: '',
        chequeNumber: '',
        bankName: '',
        chequeImage: null,
        month: getCurrentMonth(),
        title: '',
        description: '',
      });
    }
  }, [open, editMode, selectedOffice]);

  const handleSave = async () => {
    if (!form.amount || !form.dateOfPayment || !form.office) {
      alert('Please fill in required fields: Office, Amount and Date of Payment');
      return;
    }

    setLoading(true);

    const pettyCashData: any = {
      office: form.office,
      amount: form.amount,
      dateOfPayment: form.dateOfPayment,
      bankName: form.bankName,
      chequeImage: form.chequeImage,
      title: form.title || `Pettycash - ${form.dateOfPayment}`,
      description: form.description || `Pettycash transaction for office`,
      month: form.month,
      transactionType: 'income', 
    };

    if (form.transactionNo) {
      pettyCashData.transactionNo = form.transactionNo;
    }
    if (form.chequeNumber) {
      pettyCashData.chequeNumber = form.chequeNumber;
    }

    try {
      if (editMode && selectedItem) {
        await dispatch(updatePettyCashExpenseById({
          id: selectedItem._id!,
          payload: pettyCashData
        })).unwrap();
      } else {
        await dispatch(createPettyCashExpense(pettyCashData)).unwrap();
      }
      
      onClose();
      resetForm();
    } catch (error) {
      console.error('Failed to save pettycash:', error);
      alert(`Failed to ${editMode ? 'update' : 'create'} pettycash record`);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      office: selectedOffice,
      amount: '',
      dateOfPayment: getCurrentDate(),
      transactionNo: '',
      chequeNumber: '',
      bankName: '',
      chequeImage: null,
      month: getCurrentMonth(),
      title: '',
      description: '',
    });
  };

  const handleClose = () => {
    onClose();
    if (!editMode) {
      resetForm();
    }
  };

  // Handle date change to update month automatically
  const handleDateChange = (date: string) => {
    if (date) {
      try {
        const dateObj = new Date(date);
        if (!isNaN(dateObj.getTime())) {
          const year = dateObj.getFullYear();
          const month = dateObj.getMonth() + 1;
          const monthString = `${month.toString().padStart(2, '0')}-${year}`;
          setForm(prev => ({ 
            ...prev, 
            dateOfPayment: date,
            month: monthString 
          }));
          return;
        }
      } catch (error) {
        console.error('Invalid date:', error);
      }
    }
    setForm(prev => ({ ...prev, dateOfPayment: date }));
  };

  return (
    <Modal
      open={open}
      title={editMode ? 'Edit Pettycash' : 'Add Pettycash'}
      onClose={handleClose}
      widthClassName="max-w-4xl" // ✅ Increased width for better section layout
      footer={
        <>
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded border bg-white hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {loading ? 'Saving...' : editMode ? 'Update' : 'Save'}
          </button>
        </>
      }
    >
      <div className="space-4"> {/* Reduced space between sections */}
        
        {/* ✅ Section 1: Basic Information */}
        <FormSection title="Basic Information" className="mb-4">
          <FormGrid>
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
              required
            />
          </FormGrid>

          <div className="mt-4">
            <EnhancedInput
              label="Title"
              value={form.title}
              onChange={(v) => setForm((prev) => ({ ...prev, title: v }))}
              placeholder="Enter transaction title"
            />
          </div>

          <div className="mt-4">
            <EnhancedInput
              label="Description"
              value={form.description}
              onChange={(v) => setForm((prev) => ({ ...prev, description: v }))}
              placeholder="Enter transaction description"
            />
          </div>
        </FormSection>

        {/* ✅ Section 2: Transaction Details */}
        <FormSection title="Transaction Details" className="mb-4">
          <FormGrid>
            <EnhancedInput
              label="Date of Payment"
              type="date"
              value={form.dateOfPayment}
              onChange={handleDateChange}
              required
            />
            
            <EnhancedInput
              label="Transaction No"
              value={form.transactionNo}
              onChange={(v) => setForm((prev) => ({ ...prev, transactionNo: v }))}
              placeholder="Enter transaction number"
            />
          </FormGrid>

          <div className="mt-4">
            <FormGrid cols={1}>
              <EnhancedInput
                label="Month"
                value={form.month}
                placeholder="MM-YYYY"
                onChange={(v) => setForm((prev) => ({ ...prev, month: v }))}
                disabled={!editMode}
              />
            </FormGrid>
          </div>
        </FormSection>

        {/* ✅ Section 3: Bank & Cheque Information */}
        <FormSection title="Bank & Cheque Information" className="mb-4">
          <FormGrid>
            <SelectDropdown
              label="Bank Name"
              options={bankOptions}
              value={bankOptions.find((bank) => bank.value === form.bankName) || null}
              onChange={(opt: any) =>
                setForm((prev) => ({ ...prev, bankName: opt?.value || '' }))
              }
              placeholder="Select bank name"
            />
            
            <EnhancedInput
              label="Cheque Number"
              value={form.chequeNumber}
              onChange={(v) => setForm((prev) => ({ ...prev, chequeNumber: v }))}
              placeholder="Enter cheque number"
            />
          </FormGrid>
        </FormSection>

        {/* ✅ Section 4: Document Upload */}
        <FormSection title="Document Upload">
          <div className="space-y-4">
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
              onImageClick={() => {}}
              onFileChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const url = URL.createObjectURL(file);
                setForm((prev) => ({ ...prev, chequeImage: url }));
              }}
            />
            
            {form.chequeImage && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700">
                  ✅ Cheque image uploaded successfully
                </p>
              </div>
            )}
          </div>
        </FormSection>

      </div>
    </Modal>
  );
};

export default CreateEditModal;