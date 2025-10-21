import React, { useState, useEffect } from 'react';
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
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // 🧠 Re-validate when formData changes
  useEffect(() => {
    const errors = validateVendor(formData);
    setValidationErrors(errors);
  }, [formData]);

  const handleFieldChange = (field: keyof CreateVendorPayload, value: string) => {
    const updatedForm = { ...formData, [field]: value };
    onChange(updatedForm);

    // 🩵 Remove error if user fixes the field
    const newErrors = { ...validationErrors };
    const newValidation = validateVendor(updatedForm);
    if (!newValidation[field]) delete newErrors[field];
    setValidationErrors(newErrors);
  };

  const handleFieldBlur = (field: keyof CreateVendorPayload) => {
    setTouchedFields(prev => new Set(prev).add(field));
  };

  const shouldShowError = (field: keyof CreateVendorPayload) => {
    return (showValidation || touchedFields.has(field)) && validationErrors[field];
  };

  return (
    <div className="space-y-6">
     

      {/* 🧱 Input Fields */}
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
    </div>
  );
};

export default VendorForm;
