import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import SelectDropdown from '../../components/Forms/SelectionDropDown';
import EnhancedInput from '../../components/Forms/EnhancedInput';

interface DynamicFiltersProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  activeTab: string;
  vendorFilters: any;
  pettyCashFilters: any;
  onVendorFilterChange: (filters: any) => void;
  onPettyCashFilterChange: (filters: any) => void;
  onResetVendorFilters: () => void;
  onResetPettyCashFilters: () => void;
  offices: any[];
}

const DynamicFilters: React.FC<DynamicFiltersProps> = ({
  showFilters,
  setShowFilters,
  activeTab,
  vendorFilters,
  pettyCashFilters,
  onVendorFilterChange,
  onPettyCashFilterChange,
  onResetVendorFilters,
  onResetPettyCashFilters,
  offices
}) => {
  const officeOptions = offices.map(office => ({
    value: office._id,
    label: office.name
  }));

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "WaitingForApproval", label: "Waiting For Approval" },
    { value: "Approved", label: "Approved" },
    { value: "ReviewedByFinance", label: "Reviewed By Finance" },
    { value: "ReadyForPayment", label: "Ready For Payment" },
    { value: "Paid", label: "Paid" },
    { value: "Rejected", label: "Rejected" }
  ];

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    { value: "Internet Bill", label: "Internet Bill" },
    { value: "Cloud Computing", label: "Cloud Computing" },
    { value: "Dues and Subscriptions", label: "Dues and Subscriptions" },
    { value: "Financial Services / Consultancy", label: "Financial Services / Consultancy" },
    { value: "Electricity Bill", label: "Electricity Bill" },
    { value: "Telephone Bill", label: "Telephone Bill" },
    { value: "Office Rent", label: "Office Rent" },
    { value: "Solar Plates Bill", label: "Solar Plates Bill" },
    { value: "Office Maintenance", label: "Office Maintenance" },
    { value: "FBR", label: "FBR" },
    { value: "Pettycash", label: "Pettycash" },
    { value: "Computer Hardware", label: "Computer Hardware" },
    { value: "Salaries", label: "Salaries" },
    { value: "Salaries WHT", label: "Salaries WHT" },
    { value: "EOBI Employer's Share", label: "EOBI Employer's Share" },
    { value: "Others", label: "Others" },
    { value: "Misc.", label: "Misc." }
  ];

  const transactionTypeOptions = [
    { value: "all", label: "All Types" },
    { value: "income", label: "Income" },
    { value: "expense", label: "Expense" }
  ];

  const renderVendorFilters = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {/* Office */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-600">Office</label>
        <SelectDropdown
          options={officeOptions}
          value={vendorFilters.office ? officeOptions.find((o) => o.value === vendorFilters.office) || null : null}
          onChange={(opt) => onVendorFilterChange({ ...vendorFilters, office: opt?.value || '' })}
          isClearable
          placeholder="Select Office"
        />
      </div>

      {/* Status */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-600">Status</label>
        <SelectDropdown
          options={statusOptions}
          value={vendorFilters.status ? statusOptions.find((o) => o.value === vendorFilters.status) || null : null}
          onChange={(opt) => onVendorFilterChange({ ...vendorFilters, status: opt?.value || '' })}
          isClearable
          placeholder="Select Status"
        />
      </div>

      {/* Category */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-600">Category</label>
        <SelectDropdown
          options={categoryOptions}
          value={vendorFilters.category ? categoryOptions.find((o) => o.value === vendorFilters.category) || null : null}
          onChange={(opt) => onVendorFilterChange({ ...vendorFilters, category: opt?.value || '' })}
          isClearable
          placeholder="Select Category"
        />
      </div>

      {/* Date From */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-600">Date From</label>
        <EnhancedInput
        label=''
          type="date"
          value={vendorFilters.dateFrom}
          onChange={(v) => onVendorFilterChange({ ...vendorFilters, dateFrom: v })}
        />
      </div>

      {/* Date To */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-600">Date To</label>
        <EnhancedInput
        label=''
          type="date"
          value={vendorFilters.dateTo}
          onChange={(v) => onVendorFilterChange({ ...vendorFilters, dateTo: v })}
        />
      </div>
    </div>
  );

  const renderPettyCashFilters = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {/* Office */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-600">Office</label>
        <SelectDropdown
          options={officeOptions}
          value={pettyCashFilters.office ? officeOptions.find((o) => o.value === pettyCashFilters.office) || null : null}
          onChange={(opt) => onPettyCashFilterChange({ ...pettyCashFilters, office: opt?.value || '' })}
          isClearable
          placeholder="Select Office"
        />
      </div>

      {/* Month */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-600">Month</label>
        <EnhancedInput
        label=''
          type="month"
          value={pettyCashFilters.month}
          onChange={(v) => onPettyCashFilterChange({ ...pettyCashFilters, month: v })}
        />
      </div>

      {/* Transaction Type */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-600">Transaction Type</label>
        <SelectDropdown
          options={transactionTypeOptions}
          value={pettyCashFilters.transactionType ? transactionTypeOptions.find((o) => o.value === pettyCashFilters.transactionType) || null : null}
          onChange={(opt) => onPettyCashFilterChange({ ...pettyCashFilters, transactionType: opt?.value || '' })}
          isClearable
          placeholder="Select Type"
        />
      </div>

      {/* Date From */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-600">Date From</label>
        <EnhancedInput
        label=''
          type="date"
          value={pettyCashFilters.dateFrom}
          onChange={(v) => onPettyCashFilterChange({ ...pettyCashFilters, dateFrom: v })}
        />
      </div>

      {/* Date To */}
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-600">Date To</label>
        <EnhancedInput
        label=''
          type="date"
          value={pettyCashFilters.dateTo}
          onChange={(v) => onPettyCashFilterChange({ ...pettyCashFilters, dateTo: v })}
        />
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border mb-6">
      <div 
        className="flex justify-between items-center p-4 cursor-pointer select-none" 
        onClick={() => setShowFilters(!showFilters)}
      >
        <h2 className="font-semibold text-gray-700">Filters</h2>
        <div className="flex items-center text-sm text-blue-600 font-medium">
          {showFilters ? 'Hide Filters' : 'Show Filters'} 
          {showFilters ? <ChevronUp size={18} className="ml-1" /> : <ChevronDown size={18} className="ml-1" />}
        </div>
      </div>
      
      {showFilters && (
        <div className="p-4 border-t space-y-3">
          {activeTab === 'vendor' ? renderVendorFilters() : renderPettyCashFilters()}

          <div className="flex justify-end gap-3 mt-4">
            <button 
              onClick={activeTab === 'vendor' ? onResetVendorFilters : onResetPettyCashFilters}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicFilters;