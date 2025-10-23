import axios from "axios";
import { API_BASE_URL } from "../services/apiClient";
import type { PettyCashFormData, PettyCashRecord } from "../types/pettycash";

export interface PettycashQueryParams {
  q?: string;
  office?: string;
  vendor?: string;
  page?: number;
  limit?: number;
}

export const getPettyCasheExpenses = async (params?: PettycashQueryParams) => {
  const res = await axios.get(`${API_BASE_URL}/pettycash`, { params });
  return res.data;
};

// ✅ Properly type the payload
export const addPettyCashExpense = async (payload: FormData | Omit<PettyCashFormData, 'chequeImage'> & { chequeImage?: File }) => {
  let finalPayload;
  
  if (payload instanceof FormData) {
    // FormData ko direct use karo
    finalPayload = payload;
  } else {
    // Regular object ko JSON mein convert karo
    const { chequeImage, ...rest } = payload;
    finalPayload = rest;
    
    // Agar chequeImage hai toh FormData banayo
    if (chequeImage) {
      const formData = new FormData();
      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
      formData.append("chequeImage", chequeImage);
      finalPayload = formData;
    }
  }
  
  const res = await axios.post(`${API_BASE_URL}/pettycash`, finalPayload);
  return res.data;
};

// ✅ Properly type the payload
export const updatePettyCashExpense = async (id: string | number, payload: FormData | Partial<PettyCashRecord>) => {
  let finalPayload;
  
  if (payload instanceof FormData) {
    finalPayload = payload;
  } else {
    finalPayload = payload;
  }
  
  const res = await axios.patch(`${API_BASE_URL}/pettycash/${id}`, finalPayload);
  return res.data;
};

export const deletePettyCashExpense = async (id: string | number) => {
  const res = await axios.delete(`${API_BASE_URL}/pettycash/${id}`);
  return res.data;
};

export const getPettyCasheExpenseById = async (id: string | number) => {
  const res = await axios.get(`${API_BASE_URL}/pettycash/${id}`);
  return res.data;
};