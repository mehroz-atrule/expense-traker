import React from "react";
import { Building2 } from "lucide-react";
import SelectDropdown from "../../components/Forms/SelectionDropDown";

interface CategoryDetailsSectionProps {
  category: string;
  office: string;
  vendor: string;
  payment: string;
  vendorOptions: any[];
  officeOptions: any[];
  categoryOptions: any[];
  paymentOptions: any[];
  isViewMode: boolean;
  isEditing: boolean;
  onCategoryChange: (value: string) => void;
  onOfficeChange: (value: string) => void;
  onVendorChange: (value: string) => void;
  onPaymentChange: (value: string) => void;
}

const CategoryDetailsSection: React.FC<CategoryDetailsSectionProps> = ({
  category,
  office,
  vendor,
  payment,
  vendorOptions,
  officeOptions,
  categoryOptions,
  paymentOptions,
  isViewMode,
  isEditing,
  onCategoryChange,
  onOfficeChange,
  onVendorChange,
  onPaymentChange,
}) => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-3 sm:border-l-4 sm:border-purple-500 sm:pl-4">
        <div className="w-8 h-8 bg-purple-100 rounded-full sm:hidden flex items-center justify-center">
          <Building2 className="w-4 h-4 text-purple-600" />
        </div>
        <div>
          <h3 className="text-base sm:text-sm font-semibold text-gray-900 mb-0 sm:mb-1">Category & Details</h3>
          <p className="text-sm sm:text-xs text-gray-600">Expense categorization and additional information</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SelectDropdown
            label="Category"
            options={categoryOptions}
            value={category ? categoryOptions.find((opt) => opt.value === category) || null : null}
            onChange={(opt) => onCategoryChange(opt?.value || "")}
            isDisabled={isViewMode && !isEditing}
          />

          <SelectDropdown
            label="Office"
            options={officeOptions}
            value={office ? officeOptions.find((opt) => opt.value === office) || null : null}
            onChange={(opt) => onOfficeChange(opt?.value || "")}
            isDisabled={isViewMode && !isEditing}
          />

          <SelectDropdown 
            label="Vendor"
            options={vendorOptions} 
            value={vendor ? vendorOptions.find((opt) => opt.value === vendor) || null : null}
            onChange={(opt) => onVendorChange(opt?.value || "")}
            isDisabled={isViewMode && !isEditing}
          />

          <SelectDropdown
            label="Payment Method"
            options={paymentOptions}
            value={payment ? paymentOptions.find((opt) => opt.value === payment) || null : null}
            onChange={(opt) => onPaymentChange(opt?.value || "")}
            isDisabled={isViewMode && !isEditing}
          />
        </div>
      </div>
    </div>
  );
};

export default CategoryDetailsSection;