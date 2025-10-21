import axios from 'axios';
import type { Expense } from '../types';
import { API_BASE_URL } from '../services/apiClient';

export interface ExpenseQueryParams {
  q?: string;
  office?: string;
  vendor?: string;
  page?: number;
  limit?: number;
}


export const listExpenses = (params?: ExpenseQueryParams) => axios.get<Expense[]>(`${API_BASE_URL}/expense`, { params }).then(r => r.data);
export const getExpenseById = (id: number | string) => axios.get<Expense>(`${API_BASE_URL}/expense/${id}`).then(r => r.data);
export const postExpense = (payload: Expense) => axios.post<Expense>(`${API_BASE_URL}/expense`, payload).then(r => r.data);
export const updateExpense = (id: number | string, payload: Partial<Expense>) => axios.patch<Expense>(`${API_BASE_URL}/expense/${id}`, payload).then(r => r.data);
export const deleteExpense = (id: number | string) => axios.delete(`${API_BASE_URL}/expense/${id}`).then(r => r.data);
export const getCategories = () => axios.get(`${API_BASE_URL}/categories`).then(r => r.data);
export const getVendors = (q?: string) => axios.get(`${API_BASE_URL}/vendor`, { params: { q } }).then(r => r.data);
export const getOffices = () => axios.get(`${API_BASE_URL}/office`).then(r => r.data);
export const getBudgets = () => axios.get(`${API_BASE_URL}/budgets`).then(r => r.data);
