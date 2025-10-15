import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { listExpenses, postExpense, updateExpense, deleteExpense } from '../../api/submitterApi';
import type { Expense } from '../../types/expense';

interface SubmitterState {
  expenses: Expense[];
  total: number; // ✅ Add total
  page: number;  // ✅ Add page
  limit: number; // ✅ Add limit
  loading: boolean;
  error?: string | null;
}

const initialState: SubmitterState = {
  expenses: [],
  total: 0,      // ✅ Initialize total
  page: 1,       // ✅ Initialize page
  limit: 10,     // ✅ Initialize limit
  loading: false,
  error: null,
};

// ✅ Update the API response type to include pagination data
interface ExpensesResponse {
  data: Expense[];
  total: number;
  page: number;
  limit: number;
}

export const fetchExpenses = createAsyncThunk(
  'submitter/fetchExpenses',
  async (params: Record<string, unknown> = {}) => {
    const res = await listExpenses(params);
    return res as ExpensesResponse; // ✅ Return full response
  }
);

export const createExpense = createAsyncThunk(
  'submitter/createExpense',
  async (payload: Expense) => {
    const res = await postExpense(payload);
    return res as Expense;
  }
);

export const UpdateExpense = createAsyncThunk(
  'submitter/updateExpense',
  async ({ id, payload }: { id: string; payload: Partial<Expense> }) => {
    const res = await updateExpense(id, payload);
    return res as Expense;
  }
);

export const removeExpense = createAsyncThunk(
  'submitter/removeExpense',
  async (id: string) => {
    await deleteExpense(id);
    return id;
  }
);

const submitterSlice = createSlice({
  name: 'submitter',
  initialState,
  reducers: {
    clearExpenses: (state) => {
      state.expenses = [];
      state.total = 0; // ✅ Clear total too
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action: PayloadAction<ExpensesResponse>) => {
        state.loading = false;
        state.expenses = action.payload.data; // ✅ Set expenses from data
        state.total = action.payload.total;   // ✅ Set total
        state.page = action.payload.page;     // ✅ Set page
        state.limit = action.payload.limit;   // ✅ Set limit
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(createExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action: PayloadAction<Expense>) => {
        state.loading = false;
        const exists = state.expenses.some(e => e._id === action.payload._id);
        if (!exists) {
          state.expenses.unshift(action.payload);
          state.total += 1; // ✅ Update total when new expense is added
        }
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(UpdateExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(UpdateExpense.fulfilled, (state, action: PayloadAction<Expense>) => {
        state.loading = false;
        state.expenses = state.expenses.map(e =>
          e._id === action.payload._id ? action.payload : e
        );
      })
      .addCase(UpdateExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(removeExpense.fulfilled, (state, action: PayloadAction<string>) => {
        state.expenses = state.expenses.filter(e => e._id !== action.payload);
        state.total = Math.max(0, state.total - 1); // ✅ Update total when expense is deleted
      });
  },
});

export const { clearExpenses } = submitterSlice.actions;
export default submitterSlice.reducer;