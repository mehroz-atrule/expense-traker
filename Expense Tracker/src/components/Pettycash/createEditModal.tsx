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
  }, [officeOptions.length, selectedOffice]); // ✅ Fixed dependencies

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
  }, [editMode, selectedItem]); // ✅ Removed selectedOffice from dependencies

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
  }, [open, editMode, selectedOffice]); // ✅ Reset when modal opens for new record

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
          // ✅ Fixed month format to match your API (MM-YYYY instead of YYYY-MM)
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
      widthClassName="max-w-3xl"
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
          required
        />

        <EnhancedInput
          label="Title"
          value={form.title}
          onChange={(v) => setForm((prev) => ({ ...prev, title: v }))}
          placeholder="Enter transaction title"
        />

        <EnhancedInput
          label="Description"
          value={form.description}
          onChange={(v) => setForm((prev) => ({ ...prev, description: v }))}
          placeholder="Enter transaction description"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        <EnhancedInput
          label="Cheque Number"
          value={form.chequeNumber}
          onChange={(v) => setForm((prev) => ({ ...prev, chequeNumber: v }))}
          placeholder="Enter cheque number"
        />

        <EnhancedInput
          label="Bank Name"
          value={form.bankName}
          onChange={(v) => setForm((prev) => ({ ...prev, bankName: v }))}
          placeholder="Enter bank name"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EnhancedInput
            label="Month"
            value={form.month}
            placeholder="MM-YYYY"
            onChange={(v) => setForm((prev) => ({ ...prev, month: v }))}
            disabled={!editMode}
          />
        </div>

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
      </div>
    </Modal>
  );
};

export default CreateEditModal;