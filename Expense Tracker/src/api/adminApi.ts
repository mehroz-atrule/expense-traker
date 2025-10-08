import axios from 'axios';

const API_BASE = 'http://localhost:4000';

// Offices
export const listOffices = () => axios.get(`${API_BASE}/offices`).then(r => r.data);
export interface CreateOfficePayload { id?: string; name: string }
export interface UpdateOfficePayload { name: string }
export const createOffice = (payload: CreateOfficePayload) => axios.post(`${API_BASE}/offices`, payload).then(r => r.data);
export const updateOffice = (id: string, payload: UpdateOfficePayload) => axios.put(`${API_BASE}/offices/${id}`, payload).then(r => r.data);
export const deleteOfficeApi = (id: string) => axios.delete(`${API_BASE}/offices/${id}`).then(r => r.data);

// Users
export const listUsers = () => axios.get(`${API_BASE}/users`).then(r => r.data);
export interface CreateUserPayload { id?: string; name: string; email: string; password?: string; role?: string; officeId?: string }
export interface UpdateUserPayload { name?: string; email?: string; role?: string; officeId?: string }
export const createUser = (payload: CreateUserPayload) => axios.post(`${API_BASE}/users`, payload).then(r => r.data);
export const updateUser = (id: string, payload: UpdateUserPayload) => axios.put(`${API_BASE}/users/${id}`, payload).then(r => r.data);
export const deleteUserApi = (id: string) => axios.delete(`${API_BASE}/users/${id}`).then(r => r.data);
