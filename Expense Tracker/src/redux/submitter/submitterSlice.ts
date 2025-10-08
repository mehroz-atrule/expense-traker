import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { listExpenses, postExpense, putExpense, deleteExpense } from '../../api/submitterApi';

export interface Expense {
  id?: number;
  title: string;
  vendor: string;
  amount: number;
  category: string;
  officeId: string;
  paymentMethod: string;
  description?: string;
  receiptUrl?: string;
  linkedBudgetId?: string;
  claimReimbursement?: boolean;
  expenseDate?: string;
  status?: string;
  submitterId?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface SubmitterState {
  expenses: Expense[];
  loading: boolean;
  error?: string | null;
}

const initialState: SubmitterState = {
  expenses: [],
  loading: false,
  error: null,
};

// const API_BASE =  'http://localhost:4000'; // Removed as we are using API helpers

export const fetchExpenses = createAsyncThunk('submitter/fetchExpenses', async (params: Record<string, unknown> = {}) => {
  const res = await listExpenses(params);
  return res as Expense[];
});

export const createExpense = createAsyncThunk('submitter/createExpense', async (payload: Expense) => {
  const res = await postExpense(payload);
  return res as Expense;
});

export const updateExpense = createAsyncThunk('submitter/updateExpense', async ({ id, payload }: { id: number | string; payload: Partial<Expense> }) => {
  const res = await putExpense(id, payload);
  return res as Expense;
});

export const removeExpense = createAsyncThunk('submitter/removeExpense', async (id: number | string) => {
  await deleteExpense(id);
  return id;
});

const submitterSlice = createSlice({
  name: 'submitter',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchExpenses.fulfilled, (state, action: PayloadAction<Expense[]>) => { state.loading = false; state.expenses = action.payload; })
      .addCase(fetchExpenses.rejected, (state, action) => { state.loading = false; state.error = action.error.message; })
      .addCase(createExpense.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createExpense.fulfilled, (state, action: PayloadAction<Expense>) => { state.loading = false; state.expenses.unshift(action.payload); })
      .addCase(createExpense.rejected, (state, action) => { state.loading = false; state.error = action.error.message; });
    builder
      .addCase(updateExpense.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(updateExpense.fulfilled, (state, action: PayloadAction<Expense>) => { state.loading = false; state.expenses = state.expenses.map(e => e.id === action.payload.id ? action.payload : e); })
      .addCase(updateExpense.rejected, (state, action) => { state.loading = false; state.error = action.error.message; })
      .addCase(removeExpense.fulfilled, (state, action: PayloadAction<number | string>) => { state.expenses = state.expenses.filter(e => e.id !== action.payload); });
  }
});

export default submitterSlice.reducer;
