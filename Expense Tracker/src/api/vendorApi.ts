import apiClient from '../services/apiClient';
import type { Vendor, CreateVendorPayload, UpdateVendorPayload } from '../types/vendor';

interface VendorListResponse {
    data: Vendor[];
    total: number;
    page: number;
    limit: number;
}

export const listVendors = async (params?: Record<string, unknown>): Promise<VendorListResponse> => {
    const response = await apiClient.get<VendorListResponse>('/vendor', { params });
    return response.data;
};

export const getVendor = async (id: string): Promise<Vendor> => {
    const response = await apiClient.get<Vendor>(`/vendor/${id}`);
    return response.data;
};

export const createVendor = async (payload: CreateVendorPayload): Promise<Vendor> => {
    const response = await apiClient.post<Vendor>('/vendor', payload);
    return response.data;
};

export const updateVendor = async (id: string, payload: UpdateVendorPayload): Promise<Vendor> => {
    const response = await apiClient.patch<Vendor>(`/vendor/${id}`, payload);
    return response.data;
};

export const deleteVendor = async (id: string): Promise<void> => {
    await apiClient.delete(`/vendor/${id}`);
};

export const searchVendors = async (query: string): Promise<Vendor[]> => {
    const response = await apiClient.get<Vendor[]>('/vendor/search', { params: { q: query } });
    return response.data;
};