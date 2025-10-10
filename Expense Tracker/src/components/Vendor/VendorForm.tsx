import React, { useState } from 'react';
import EnhancedInput from '../Forms/EnhancedInput';
import type { CreateVendorPayload } from '../../types/vendor';
import { validateVendor } from '../../utils/vendorValidation';

interface VendorFormProps {
  formData: CreateVendorPayload;
  onChange: (data: CreateVendorPayload) => void;
  isLoading?: boolean;
  showValidation?: boolean;
}

const VendorForm: React.FC<VendorFormProps> = ({ 
  formData, 
  onChange, 
  isLoading = false,
  showValidation = false
}) => {
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  const validationErrors = validateVendor(formData);

const handleFieldChange = (field: keyof CreateVendorPayload, value: string) => {
  onChange({
    ...formData,
    [field]: field === "WHT" ? Number(value) || 0 : value, // Convert WHT to number safely
  });
};

  const handleFieldBlur = (field: keyof CreateVendorPayload) => {
    setTouchedFields(prev => new Set(prev).add(field));
  };

  const shouldShowError = (field: keyof CreateVendorPayload) => {
    return (showValidation || touchedFields.has(field)) && validationErrors[field];
  };

  return (
    <div className="space-y-6">
      {/* Show validation summary only when explicitly requested (on save attempt) */}
      {showValidation && Object.keys(validationErrors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-start gap-2">
            <div className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-red-800 mb-1">Please correct the following:</h4>
              <div className="text-sm text-red-700 space-y-0.5">
                {Object.entries(validationErrors).map(([field, error]) => (
                  <div key={field}>• {error}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EnhancedInput
          label="Vendor Name"
          value={formData.vendorName}
          onChange={(val) => handleFieldChange('vendorName', val)}
          onBlur={() => handleFieldBlur('vendorName')}
          placeholder="Enter vendor name"
          required
          disabled={isLoading}
          error={shouldShowError('vendorName') ? validationErrors.vendorName : undefined}
        />
        
        <EnhancedInput
          label="Location"
          value={formData.location}
          onChange={(val) => handleFieldChange('location', val)}
          onBlur={() => handleFieldBlur('location')}
          placeholder="Enter location (e.g., Karachi, PK)"
          required
          disabled={isLoading}
          error={shouldShowError('location') ? validationErrors.location : undefined}
        />
        
        <EnhancedInput
          label="Customer ID"
          value={formData.customerId}
          onChange={(val) => handleFieldChange('customerId', val)}
          onBlur={() => handleFieldBlur('customerId')}
          placeholder="Enter customer ID (e.g., CUST-00123)"
          required
          disabled={isLoading}
          error={shouldShowError('customerId') ? validationErrors.customerId : undefined}
        />
        
        <EnhancedInput
          label="WHT %"
          value={(formData as any).WHT as any}
          type='number'
          onChange={(val) => handleFieldChange('WHT' as any, val)}
          onBlur={() => handleFieldBlur('WHT' as any)}
          placeholder="Enter withholding tax percentage (e.g., 17)"
          required
          disabled={isLoading}
          error={shouldShowError('preferredBankName') ? validationErrors.preferredBankName : undefined}
        />
        
        <EnhancedInput
          label="Preferred Bank Name"
          value={formData.preferredBankName}
          onChange={(val) => handleFieldChange('preferredBankName', val)}
          onBlur={() => handleFieldBlur('preferredBankName')}
          placeholder="Enter bank name (e.g., Habib Bank)"
          required
          disabled={isLoading}
          error={shouldShowError('preferredBankName') ? validationErrors.preferredBankName : undefined}
        />
        
        <EnhancedInput
          label="Vendor Account Title"
          value={formData.vendorAccountTitle}
          onChange={(val) => handleFieldChange('vendorAccountTitle', val)}
          onBlur={() => handleFieldBlur('vendorAccountTitle')}
          placeholder="Enter account title"
          required
          disabled={isLoading}
          error={shouldShowError('vendorAccountTitle') ? validationErrors.vendorAccountTitle : undefined}
        />
        
        <EnhancedInput
          label="Vendor IBAN"
          value={formData.vendorIban}
          onChange={(val) => handleFieldChange('vendorIban', val)}
          onBlur={() => handleFieldBlur('vendorIban')}
          placeholder="Enter IBAN (e.g., PK36SCBL0000001123456702)"
          required
          disabled={isLoading}
          error={shouldShowError('vendorIban') ? validationErrors.vendorIban : undefined}
          pattern="^[A-Z]{2}\d{2}[A-Z\d]{1,30}$"
        />
      </div>

      {/* Helper text */}
      
    </div>
  );
};

export default VendorForm;