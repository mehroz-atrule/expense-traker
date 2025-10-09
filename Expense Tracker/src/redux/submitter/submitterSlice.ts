import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { listExpenses, postExpense, updateExpense, deleteExpense } from '../../api/submitterApi';
import type { Expense } from '../../types/expense';

// moved to shared types

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

export const fetchExpenses = createAsyncThunk(
  'submitter/fetchExpenses',
  async (params: Record<string, unknown> = {}) => {
    const res = await listExpenses(params);
    return res.data as Expense[];
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
    // 🧹 Add a clear action to reset expenses (optional but helpful)
    clearExpenses: (state) => {
      state.expenses = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // ✅ 1️⃣ Replace (not append) when fetching
      .addCase(fetchExpenses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action: PayloadAction<Expense[]>) => {
        state.loading = false;
        state.expenses = action.payload; // 👈 Replace the list (no duplicates)
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // ✅ 2️⃣ Avoid adding duplicate items
      .addCase(createExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createExpense.fulfilled, (state, action: PayloadAction<Expense>) => {
        state.loading = false;
        const exists = state.expenses.some(e => e._id === action.payload._id);
        if (!exists) state.expenses.unshift(action.payload); // 👈 Add only if not exists
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      // ✅ 3️⃣ Fix update & delete to use `_id` instead of `id`
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
      });
  },
});

export const { clearExpenses } = submitterSlice.actions; // 👈 Export the clear action
export default submitterSlice.reducer;
