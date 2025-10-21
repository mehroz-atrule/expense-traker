import type { CreateVendorPayload } from '../types/vendor';

export interface VendorValidationErrors {
    vendorName?: string;
    location?: string;
    customerId?: string;
    preferredBankName?: string;
    vendorAccountTitle?: string;
    vendorIban?: string;
}

export const validateVendor = (data: CreateVendorPayload): VendorValidationErrors => {
    const errors: VendorValidationErrors = {};

    // Vendor Name validation - REQUIRED
    if (!data.vendorName.trim()) {
        errors.vendorName = 'Vendor name is required';
    } else if (data.vendorName.trim().length < 2) {
        errors.vendorName = 'Vendor name must be at least 2 characters';
    }

    // Location validation - REQUIRED
    if (!data.location.trim()) {
        errors.location = 'Location is required';
    } else if (data.location.trim().length < 2) {
        errors.location = 'Location must be at least 2 characters';
    }

    // Customer ID validation - REQUIRED
    if (!data.customerId.trim()) {
        errors.customerId = 'Customer ID is required';
    } else if (data.customerId.trim().length < 3) {
        errors.customerId = 'Customer ID must be at least 3 characters';
    }

    // Preferred Bank Name validation - OPTIONAL
    // Sirf validate karo agar value provided hai
    if (data.preferredBankName && data.preferredBankName.trim()) {
        if (data.preferredBankName.trim().length < 2) {
            errors.preferredBankName = 'Bank name must be at least 2 characters';
        }
    }
    // Agar empty hai ya nahi hai, toh koi error nahi

    // Vendor Account Title validation - OPTIONAL
    // Sirf validate karo agar value provided hai
    if (data.vendorAccountTitle && data.vendorAccountTitle.trim()) {
        if (data.vendorAccountTitle.trim().length < 3) {
            errors.vendorAccountTitle = 'Account title must be at least 3 characters';
        }
    }
    // Agar empty hai ya nahi hai, toh koi error nahi

    // IBAN validation - OPTIONAL
    // Sirf validate karo agar value provided hai
    if (data.vendorIban && data.vendorIban.trim()) {
        const iban = data.vendorIban.trim().toUpperCase();
        const ibanPattern = /^[A-Z]{2}\d{2}[A-Z\d]{1,30}$/;

        if (iban.length < 15) {
            errors.vendorIban = 'IBAN is too short (minimum 15 characters)';
        } else if (iban.length > 34) {
            errors.vendorIban = 'IBAN is too long (maximum 34 characters)';
        } else if (!ibanPattern.test(iban)) {
            if (!/^[A-Z]{2}/.test(iban)) {
                errors.vendorIban = 'IBAN must start with 2 letters (country code)';
            } else if (!/^[A-Z]{2}\d{2}/.test(iban)) {
                errors.vendorIban = 'IBAN must have 2 digits after country code';
            } else {
                errors.vendorIban = 'Invalid IBAN format (e.g., PK36SCBL0000001123456702)';
            }
        }
    }
    // Agar IBAN empty hai ya nahi hai, toh koi error nahi

    return errors;
};

export const isValidVendor = (data: CreateVendorPayload): boolean => {
    const errors = validateVendor(data);
    return Object.keys(errors).length === 0;
};

export const formatIban = (value: string): string => {
    // Remove all non-alphanumeric characters and convert to uppercase
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();

    // Add spaces every 4 characters for better readability
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
};

export const cleanIban = (value: string): string => {
    // Remove spaces for storage/validation
    return value.replace(/\s/g, '').toUpperCase();
};