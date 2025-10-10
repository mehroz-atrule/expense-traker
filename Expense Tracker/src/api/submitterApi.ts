import axios from 'axios';
import type { Expense } from '../types';

export interface ExpenseQueryParams {
  q?: string;
  office?: string;
  vendor?: string;
  page?: number;
  limit?: number;
}

const API_BASE =  'http://localhost:4000/api';

export const listExpenses = (params?: ExpenseQueryParams) => axios.get<Expense[]>(`${API_BASE}/expense`, { params }).then(r => r.data);
export const postExpense = (payload: Expense) => axios.post<Expense>(`${API_BASE}/expense`, payload).then(r => r.data);
export const updateExpense = (id: number | string, payload: Partial<Expense>) => axios.patch<Expense>(`${API_BASE}/expense/${id}`, payload).then(r => r.data);
export const deleteExpense = (id: number | string) => axios.delete(`${API_BASE}/expense/${id}`).then(r => r.data);
export const getCategories = () => axios.get(`${API_BASE}/categories`).then(r => r.data);
export const getVendors = (q?: string) => axios.get(`${API_BASE}/vendor`, { params: { q } }).then(r => r.data);
export const getOffices = () => axios.get(`${API_BASE}/office`).then(r => r.data);
export const getBudgets = () => axios.get(`${API_BASE}/budgets`).then(r => r.data);
