export interface Vendor {
    _id: string;
    vendorName: string;
    location: string;
    customerId: string;
    preferredBankName: string;
    vendorAccountTitle: string;
    vendorIban: string;
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

export interface CreateVendorPayload {
    vendorName: string;
    location: string;
    customerId: string;
    preferredBankName: string;
    vendorAccountTitle: string;
    vendorIban: string;
}

export interface UpdateVendorPayload {
    vendorName?: string;
    location?: string;
    customerId?: string;
    preferredBankName?: string;
    vendorAccountTitle?: string;
    vendorIban?: string;
}

export interface VendorFilters {
    search: string;
    location: string;
    bankName: string;
}

export interface VendorPagination {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    q?: string;
}