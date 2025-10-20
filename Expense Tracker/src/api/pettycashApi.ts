import axios from "axios";
const API_BASE_URL = 'localhost:4000/api';

export interface PettycashQueryParams {
  q?: string;
  office?: string;
  vendor?: string;
  page?: number;
  limit?: number;
}
export const getPettyCasheExpenses = async ({ params }: { params?: PettycashQueryParams } = {}) => {
    const res = await axios.get(`http://${API_BASE_URL}/pettycash`, { params });
    return res.data;
}
export const addPettyCashExpense = async (payload: any) => {
    const res = await axios.post(`http://${API_BASE_URL}/pettycash`, payload);
    return res.data;
}
export const updatePettyCashExpense = async (id: string | number, payload: any) => {
    const res = await axios.patch(`http://${API_BASE_URL}/pettycash/${id}`, payload);
    return res.data;
}
export const deletePettyCashExpense = async (id: string | number) => {
    const res = await axios.delete(`http://${API_BASE_URL}/pettycash/${id}`);
    return res.data;
}
    export const getPettyCasheExpenseById = async (id: string | number) => {
    const res = await axios.get(`http://${API_BASE_URL}/pettycash/${id}`);
    return res.data;
}


