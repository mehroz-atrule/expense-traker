import React, { useEffect } from "react";
import { DollarSign } from "lucide-react";
import EnhancedInput from "../../components/Forms/EnhancedInput";

interface FinancialDetailsSectionProps {
  amount: string;
  WHT: number;
  advanceTax: number;
  amountAfterTax: number;
  isViewMode: boolean;
  isEditing: boolean;
  showTaxFields: boolean;
  enableTaxEditing: boolean;
  onAmountChange: (value: string) => void;
  onWHTChange: (value: string) => void;
  onAdvanceTaxChange: (value: string) => void;
  onAmountAfterTaxChange: (value: string) => void;
}

const FinancialDetailsSection: React.FC<FinancialDetailsSectionProps> = ({
  amount,
  WHT,
  advanceTax,
  amountAfterTax,
  isViewMode,
  isEditing,
  showTaxFields,
  enableTaxEditing,
  onAmountChange,
  onWHTChange,
  onAdvanceTaxChange,
  onAmountAfterTaxChange,
}) => {
  // 🔹 Auto-calculate "Amount After Tax" when amount, WHT, or advanceTax changes
  useEffect(() => {
    const amt = parseFloat(amount) || 0;
    const advAmt = parseFloat(advanceTax?.toString()) || 0;

    if (showTaxFields) {
      const total = amt -  advAmt;
      onAmountAfterTaxChange(total.toFixed(2));
    } else {
      onAmountAfterTaxChange(amount);
    }
  }, [amount, WHT, advanceTax, showTaxFields]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3 sm:border-l-4 sm:border-orange-500 sm:pl-4">
        <div className="w-8 h-8 bg-orange-100 rounded-full sm:hidden flex items-center justify-center">
          <DollarSign className="w-4 h-4 text-orange-600" />
        </div>
        <div>
          <h3 className="text-base sm:text-sm font-semibold text-gray-900 mb-0 sm:mb-1">
            Financial Details
          </h3>
          <p className="text-sm sm:text-xs text-gray-600">
            Amount, taxes, and calculations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Main Amount field */}
        <div className="sm:col-span-2 sm:max-w-sm">
          <EnhancedInput
            label="Amount"
            type="number"
            value={amount}
            onChange={onAmountChange}
            placeholder="Enter total amount"
            disabled={isViewMode && !isEditing}
            readOnly={isViewMode && !isEditing}
          />
        </div>

        {/* Show WHT + Advance Tax fields only for finance */}
        {showTaxFields && (
          <>
            <EnhancedInput
              label="WHT (Amount)"
              type="number"
              value={WHT === 0 || WHT == null ? "" : WHT.toString()}
              onChange={onWHTChange}
              placeholder="Enter WHT amount"
              disabled={!enableTaxEditing}
              readOnly={!enableTaxEditing}
            />

            <EnhancedInput
              label="Advance Tax (Amount)"
              type="number"
              value={
                advanceTax === 0 || advanceTax == null
                  ? ""
                  : advanceTax.toString()
              }
              onChange={onAdvanceTaxChange}
              placeholder="Enter Advance Tax amount"
              disabled={!enableTaxEditing}
              readOnly={!enableTaxEditing}
            />
          </>
        )}

        {/* Amount After Tax */}
        {showTaxFields && (
          <div className="sm:col-span-2 sm:max-w-sm">
            <EnhancedInput
              label="Amount After Tax"
              type="number"
              value={amountAfterTax?.toString() || ""}
              placeholder="Auto-calculated (Amount - WHT - Advance Tax)"
              disabled
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">
              Auto calculated: Amount - (WHT + Advance Tax)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinancialDetailsSection;
