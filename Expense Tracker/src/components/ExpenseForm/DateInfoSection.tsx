import React from "react";
import { Calendar } from "lucide-react";
import EnhancedInput from "../../components/Forms/EnhancedInput";

interface DateInfoSectionProps {
  billDate: string;
  dueDate: string;
  paymentDate: string;
  isViewMode: boolean;
  isEditing: boolean;
  onBillDateChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
  onPaymentDateChange: (value: string) => void;
}

const DateInfoSection: React.FC<DateInfoSectionProps> = ({
  billDate,
  dueDate,
  paymentDate,
  isViewMode,
  isEditing,
  onBillDateChange,
  onDueDateChange,
  onPaymentDateChange,
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3 sm:border-l-4 sm:border-indigo-500 sm:pl-4">
        <div className="w-8 h-8 bg-indigo-100 rounded-full sm:hidden flex items-center justify-center">
          <Calendar className="w-4 h-4 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-base sm:text-sm font-semibold text-gray-900 mb-0 sm:mb-1">Date Information</h3>
          <p className="text-sm sm:text-xs text-gray-600">Bill date, due date, and payment date</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <EnhancedInput
          label="Bill Date"
          type="date"
          value={billDate}
          onChange={onBillDateChange}
          disabled={isViewMode && !isEditing}
          readOnly={isViewMode && !isEditing}
        />

        <EnhancedInput
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={onDueDateChange}
          disabled={isViewMode && !isEditing}
          readOnly={isViewMode && !isEditing}
        />

        <div className="sm:col-span-2 sm:max-w-sm">
          <EnhancedInput
            label="Payment Date (Optional)"
            type="date"
            value={paymentDate}
            onChange={onPaymentDateChange}
            disabled={isViewMode && !isEditing}
            readOnly={isViewMode && !isEditing}
          />
        </div>
      </div>
    </div>
  );
};

export default DateInfoSection;