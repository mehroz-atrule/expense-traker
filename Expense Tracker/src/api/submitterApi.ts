import axios from 'axios';
import type { Expense } from '../redux/submitter/submitterSlice';

const API_BASE =  'http://localhost:4000';

export const listExpenses = (params?: Record<string, unknown>) => axios.get<Expense[]>(`${API_BASE}/expenses`, { params }).then(r => r.data);
export const postExpense = (payload: Expense) => axios.post<Expense>(`${API_BASE}/expenses`, payload).then(r => r.data);
export const putExpense = (id: number | string, payload: Partial<Expense>) => axios.put<Expense>(`${API_BASE}/expenses/${id}`, payload).then(r => r.data);
export const deleteExpense = (id: number | string) => axios.delete(`${API_BASE}/expenses/${id}`).then(r => r.data);
export const getCategories = () => axios.get(`${API_BASE}/categories`).then(r => r.data);
export const getVendors = (q?: string) => axios.get(`${API_BASE}/vendors`, { params: { q } }).then(r => r.data);
export const getOffices = () => axios.get(`${API_BASE}/offices`).then(r => r.data);
export const getBudgets = () => axios.get(`${API_BASE}/budgets`).then(r => r.data);
