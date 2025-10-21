import axios from 'axios';
import type { CreateOfficePayload, UpdateOfficePayload, CreateUserPayload, UpdateUserPayload } from '../types/admin';
import { API_BASE_URL } from '../services/apiClient';


// Offices
export const listOffices = () => axios.get(`${API_BASE_URL}/office`).then(r => r.data);
// moved to shared types
export const createOffice = (payload: CreateOfficePayload) => axios.post(`${API_BASE_URL}/office`, payload).then(r => r.data);
export const updateOffice = (id: string, payload: UpdateOfficePayload) => axios.patch(`${API_BASE_URL}/office/${id}`, payload).then(r => r.data);
export const deleteOfficeApi = (id: string) => axios.delete(`${API_BASE_URL}/office/${id}`).then(r => r.data);

// Users
export const listUsers = () => axios.get(`${API_BASE_URL}/users`).then(r => r.data);
// moved to shared types
export const createUser = (payload: CreateUserPayload) => axios.post(`${API_BASE_URL}/users`, payload).then(r => r.data);
export const updateUser = (id: string, payload: UpdateUserPayload) => axios.patch(`${API_BASE_URL}/users/${id}`, payload).then(r => r.data);
export const deleteUserApi = (id: string) => axios.delete(`${API_BASE_URL}/users/${id}`).then(r => r.data);
