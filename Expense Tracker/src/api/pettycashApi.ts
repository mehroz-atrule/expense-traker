import axios from "axios";
import { API_BASE_URL } from "../services/apiClient";

export interface PettycashQueryParams {
  q?: string;
  office?: string;
  vendor?: string;
  page?: number;
  limit?: number;
}
export const getPettyCasheExpenses = async (params?: PettycashQueryParams) => {
  console.log("API Call with params:", params);
  const res = await axios.get(`${API_BASE_URL}/pettycash`, { params });
  return res.data;
};

export const addPettyCashExpense = async (payload: any) => {
    const res = await axios.post(`${API_BASE_URL}/pettycash`, payload);
    return res.data;
} 
export const updatePettyCashExpense = async (id: string | number, payload: any) => {
    const res = await axios.patch(`${API_BASE_URL}/pettycash/${id}`, payload);
    return res.data;
}
export const deletePettyCashExpense = async (id: string | number) => {
    const res = await axios.delete(`${API_BASE_URL}/pettycash/${id}`);
    return res.data;
}
    export const getPettyCasheExpenseById = async (id: string | number) => {
    const res = await axios.get(`${API_BASE_URL}/pettycash/${id}`);
    return res.data;
}


