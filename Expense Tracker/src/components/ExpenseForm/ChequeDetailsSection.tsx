import React from "react";
import EnhancedInput from "../../components/Forms/EnhancedInput";
import SelectDropdown from "../../components/Forms/SelectionDropDown";
import { CreditCard } from "lucide-react";

interface ChequeDetailsSectionProps {
  chequeNumber: string;
  bankName: string;
  isViewMode: boolean;
  isEditing: boolean;
  onChequeNumberChange: (value: string) => void;
  onBankNameChange: (value: string) => void;
}

const ChequeDetailsSection: React.FC<ChequeDetailsSectionProps> = ({
  chequeNumber,
  bankName,
  isViewMode,
  isEditing,
  onChequeNumberChange,
  onBankNameChange,
}) => {
  const bankOptions = [
    { value: "Atrule HBL PKR", label: "Atrule HBL PKR" },
    { value: "Suleman Altaf HBL PKR", label: "Suleman Altaf HBL PKR" },
    { value: "Lahore Pettycash", label: "Lahore Pettycash" },
    { value: "Multan Pettycash", label: "Multan Pettycash" },
  ];

  // Enable editing when in view mode but status requires cheque details
  const shouldEnableChequeFields = !isViewMode || isEditing;

  return (
    <div className="bg-white rounded-2xl sm:rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-3 sm:border-l-4 sm:border-yellow-500 sm:pl-4">
          <div className="w-8 h-8 bg-yellow-100 rounded-full sm:hidden flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-yellow-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-sm font-semibold text-gray-900 mb-0 sm:mb-1">Cheque Details</h3>
            <p className="text-sm sm:text-xs text-gray-600">Cheque number and bank information</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <EnhancedInput
            label="Cheque Number"
            value={chequeNumber}
            onChange={onChequeNumberChange}
            placeholder="Enter cheque number"
            disabled={!shouldEnableChequeFields}
            readOnly={!shouldEnableChequeFields}
          />

          <SelectDropdown
            label="Bank Name"
            options={bankOptions}
            value={bankName ? bankOptions.find((opt) => opt.value === bankName) || null : null}
            onChange={(opt) => onBankNameChange(opt?.value || "")}
            isDisabled={!shouldEnableChequeFields}
          />
        </div>
      </div>
    </div>
  );
};

export default ChequeDetailsSection;