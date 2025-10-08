import axios from 'axios';

const API_BASE = 'http://localhost:4000/api';

// Offices
export const listOffices = () => axios.get(`${API_BASE}/office`).then(r => r.data);
export interface CreateOfficePayload { id?: string; name: string }
export interface UpdateOfficePayload { name: string }
export const createOffice = (payload: CreateOfficePayload) => axios.post(`${API_BASE}/office`, payload).then(r => r.data);
export const updateOffice = (id: string, payload: UpdateOfficePayload) => axios.patch(`${API_BASE}/office/${id}`, payload).then(r => r.data);
export const deleteOfficeApi = (id: string) => axios.delete(`${API_BASE}/office/${id}`).then(r => r.data);

// Users
export const listUsers = () => axios.get(`${API_BASE}/users`).then(r => r.data);
export interface CreateUserPayload { id?: string; username?: string; name?: string; email: string; password?: string; role?: string; officeId?: string }
export interface UpdateUserPayload { username?: string; name?: string; email?: string; role?: string; officeId?: string }
export const createUser = (payload: CreateUserPayload) => axios.post(`${API_BASE}/users`, payload).then(r => r.data);
export const updateUser = (id: string, payload: UpdateUserPayload) => axios.patch(`${API_BASE}/users/${id}`, payload).then(r => r.data);
export const deleteUserApi = (id: string) => axios.delete(`${API_BASE}/users/${id}`).then(r => r.data);
