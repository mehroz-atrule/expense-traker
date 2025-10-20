import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import * as api from '../../api/vendorApi';
import type { Vendor, CreateVendorPayload, UpdateVendorPayload } from '../../types/vendor';

interface VendorState {
    vendors: Vendor[];
    dropdownVendors: Vendor[];
    loading: boolean;
    error?: string | null;
    currentVendor?: Vendor | null;
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    filters: {
        search: string;
        location: string;
        bankName: string;
    };
}

const initialState: VendorState = {
    vendors: [],
    dropdownVendors: [],
    loading: false,
    error: null,
    currentVendor: null,
    pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    },
    filters: {
        search: '',
        location: '',
        bankName: '',
    },
};

export const fetchVendors = createAsyncThunk(
    'vendor/fetchVendors',
    async (params: { page?: number; limit?: number; search?: string; location?: string; bankName?: string; q?: string } = {}) => {
        const response = await api.listVendors(params);
        return response;
    }
);

export const fetchVendorDropdown = createAsyncThunk(
    'vendor/fetchVendorDropdown',
    async () => {
        const response = await api.listVendors({ limit: 1000 });
        return response.data;
    }   
);

export const fetchVendor = createAsyncThunk(
    'vendor/fetchVendor',
    async (id: string) => {
        const response = await api.getVendor(id);
        return response;
    }
);

export const createVendor = createAsyncThunk(
    'vendor/createVendor',
    async (payload: CreateVendorPayload) => {
        const response = await api.createVendor(payload);
        return response;
    }
);

export const updateVendor = createAsyncThunk(
    'vendor/updateVendor',
    async ({ id, payload }: { id: string; payload: UpdateVendorPayload }) => {
        const response = await api.updateVendor(id, payload);
        return response;
    }
);

export const removeVendor = createAsyncThunk(
    'vendor/removeVendor',
    async (id: string) => {
        await api.deleteVendor(id);
        return id;
    }
);

const vendorSlice = createSlice({
    name: 'vendor',
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<Partial<VendorState['filters']>>) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        clearFilters: (state) => {
            state.filters = initialState.filters;
        },
        setPagination: (state, action: PayloadAction<Partial<VendorState['pagination']>>) => {
            state.pagination = { ...state.pagination, ...action.payload };
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch vendors
            .addCase(fetchVendors.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVendors.fulfilled, (state, action) => {
                state.loading = false;
                // Backend returns wrapped object with data, total, page, limit
                state.vendors = action.payload.data;
                state.pagination = {
                    page: action.payload.page,
                    limit: action.payload.limit,
                    total: action.payload.total,
                    totalPages: Math.ceil(action.payload.total / action.payload.limit),
                };
            })
            .addCase(fetchVendors.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch vendors';
            })

            // Fetch single vendor
            .addCase(fetchVendor.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVendor.fulfilled, (state, action) => {
                state.loading = false;
                state.currentVendor = action.payload;
            })
            .addCase(fetchVendor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch vendor';
            })

            // Create vendor
            .addCase(createVendor.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createVendor.fulfilled, (state, action) => {
                state.loading = false;
                state.vendors.unshift(action.payload);
                state.pagination.total += 1;
            })
            .addCase(createVendor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to create vendor';
            })

            // Update vendor
            .addCase(updateVendor.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateVendor.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.vendors.findIndex(v => v._id === action.payload._id);
                if (index !== -1) {
                    state.vendors[index] = action.payload;
                }
                if (state.currentVendor?._id === action.payload._id) {
                    state.currentVendor = action.payload;
                }
            })
            .addCase(updateVendor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to update vendor';
            })

            // Remove vendor
            .addCase(removeVendor.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeVendor.fulfilled, (state, action) => {
                state.loading = false;
                state.vendors = state.vendors.filter(v => v._id !== action.payload);
                state.pagination.total = Math.max(0, state.pagination.total - 1);
                if (state.currentVendor?._id === action.payload) {
                    state.currentVendor = null;
                }
            })
            .addCase(removeVendor.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to remove vendor';
            })
        // Fetch vendor dropdown    
            .addCase(fetchVendorDropdown.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchVendorDropdown.fulfilled, (state, action) => {
                state.loading = false;
                state.dropdownVendors = action.payload;
            })
            .addCase(fetchVendorDropdown.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch vendor dropdown';
            });
    },
});

export const { setFilters, clearFilters, setPagination, clearError   } = vendorSlice.actions;
export default vendorSlice.reducer;