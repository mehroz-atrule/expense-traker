import React, { useState, useEffect } from "react";
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
  currentStatusKey: string;
  paymentMethod: string;
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
  currentStatusKey,
  paymentMethod,
}) => {
  // 🔹 Error states
  const [dueError, setDueError] = useState("");
  const [paymentError, setPaymentError] = useState("");

  // 🔹 Show payment date for these statuses
  const showPaymentDate =
    currentStatusKey === "ReadyForPayment" ||
    currentStatusKey === "Approved" ||
    currentStatusKey === "" ||
    currentStatusKey === "WaitingForApproval" ||
    currentStatusKey === "Paid";

  // 🔹 Payment editable for these conditions
  const isPaymentEditable =
    (currentStatusKey === "ReadyForPayment" ||
      currentStatusKey === "" ||
      currentStatusKey === "WaitingForApproval" ||
      currentStatusKey === "Approved") &&
    (paymentMethod === "BankTransfer" ||
      paymentMethod === "Cash" ||
      paymentMethod === "Cheque");

  // ✅ Validation checks
  useEffect(() => {
    // --- Due Date Validation ---
    if (billDate && dueDate) {
      if (new Date(dueDate) < new Date(billDate)) {
        setDueError("Due date cannot be earlier than Bill date");
      } else {
        setDueError("");
      }
    }

    // --- Payment Date Validation ---
    if (billDate && paymentDate) {
      if (new Date(paymentDate) < new Date(billDate)) {
        setPaymentError("Payment date cannot be earlier than Bill date");
      } else {
        setPaymentError("");
      }
    }
  }, [billDate, dueDate, paymentDate]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Section header */}
      <div className="flex items-center gap-3 sm:border-l-4 sm:border-indigo-500 sm:pl-4">
        <div className="w-8 h-8 bg-indigo-100 rounded-full sm:hidden flex items-center justify-center">
          <Calendar className="w-4 h-4 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-base sm:text-sm font-semibold text-gray-900 mb-0 sm:mb-1">
            Date Information
          </h3>
          <p className="text-sm sm:text-xs text-gray-600">
            Bill date, due date, and payment date
          </p>
        </div>
      </div>

      {/* Inputs grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* 🔸 Bill Date */}
        <EnhancedInput
          label="Bill Date"
          type="date"
          value={billDate}
          onChange={onBillDateChange}
          disabled={isViewMode && !isEditing}
          readOnly={isViewMode && !isEditing}
        />

        {/* 🔸 Due Date */}
        <EnhancedInput
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={onDueDateChange}
          min={billDate || undefined} // ✅ Prevent selecting before Bill Date
          error={dueError} // ✅ Show red error if invalid
          disabled={isViewMode && !isEditing}
          readOnly={isViewMode && !isEditing}
        />

        {/* 🔸 Payment Date */}
        {showPaymentDate && (
          <div className="sm:col-span-2 sm:max-w-sm">
            <EnhancedInput
              label="Payment Date"
              type="date"
              value={paymentDate}
              onChange={onPaymentDateChange}
              min={billDate || undefined}
              error={paymentError}
              disabled={!isPaymentEditable}
              readOnly={!isPaymentEditable}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DateInfoSection;
