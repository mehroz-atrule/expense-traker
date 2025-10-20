import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PettyCashRecord } from '../../types/pettycash';
import {
  addPettyCashExpense,
  deletePettyCashExpense,
  getPettyCasheExpenseById,
  getPettyCasheExpenses,
  updatePettyCashExpense,
} from '../../api/pettycashApi';

// ✅ Define API response structure (same as submitter)
interface PettyCashResponse {
  data: PettyCashRecord[];
  total: number;
  page: number;
  limit: number;
}

// ✅ Define slice state structure
interface PettyCashState {
  pettyCashRecords: PettyCashRecord[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error?: string | null;
  selectedExpense?: PettyCashRecord | null;
}

// ✅ Initial state
const initialState: PettyCashState = {
  pettyCashRecords: [],
  total: 0,
  page: 1,
  limit: 10,
  loading: false,
  error: null,
  selectedExpense: null,
};

// ✅ Thunks
export const fetchPettyCash = createAsyncThunk(
  'pettycash/fetchPettyCash',
  async (params: Record<string, unknown> = {}) => {
    const res = await getPettyCasheExpenses(params);
    return res as PettyCashResponse;
  }
);

export const createPettyCashExpense = createAsyncThunk(
  'pettycash/createPettyCashExpense',
  async (payload: PettyCashRecord) => {
    const res = await addPettyCashExpense(payload);
    return res as PettyCashRecord;
  }
);

export const updatePettyCashExpenseById = createAsyncThunk(
  'pettycash/updatePettyCashExpense',
  async ({ id, payload }: { id: string | number; payload: Partial<PettyCashRecord> }) => {
    const res = await updatePettyCashExpense(id, payload);
    return res as PettyCashRecord;
  }
);

export const deletePettyCashExpenseById = createAsyncThunk(
  'pettycash/deletePettyCashExpense',
  async (id: string | number) => {
    await deletePettyCashExpense(id);
    return id;
  }
);

export const getPettyCasheExpense = createAsyncThunk(
  'pettycash/getPettyCasheExpenseById',
  async (id: string | number) => {
    const res = await getPettyCasheExpenseById(id);
    return res as PettyCashRecord;
  }
);

// ✅ Slice
const pettycashSlice = createSlice({
  name: 'pettycash',
  initialState,
  reducers: {
    clearSelectedExpense: (state) => {
      state.selectedExpense = null;
      state.error = null;
    },
    clearPettyCashRecords: (state) => {
      state.pettyCashRecords = [];
      state.total = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🟡 Fetch
      .addCase(fetchPettyCash.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPettyCash.fulfilled, (state, action: PayloadAction<PettyCashResponse>) => {
        state.loading = false;
        state.pettyCashRecords = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
      })
      .addCase(fetchPettyCash.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch petty cash records';
      })

      // 🟢 Create
      .addCase(createPettyCashExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPettyCashExpense.fulfilled, (state, action: PayloadAction<PettyCashRecord>) => {
        state.loading = false;
    
      })
      .addCase(createPettyCashExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create petty cash expense';
      })

      // 🟠 Update
      .addCase(updatePettyCashExpenseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePettyCashExpenseById.fulfilled, (state, action: PayloadAction<PettyCashRecord>) => {
        state.loading = false;
        state.pettyCashRecords = state.pettyCashRecords.map((r) =>
          r._id === action.payload._id ? action.payload : r
        );
      })
      .addCase(updatePettyCashExpenseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update petty cash expense';
      })

      // 🔴 Delete
      .addCase(deletePettyCashExpenseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePettyCashExpenseById.fulfilled, (state, action: PayloadAction<string | number>) => {
        state.loading = false;
        state.pettyCashRecords = state.pettyCashRecords.filter((r) => r._id !== action.payload);
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deletePettyCashExpenseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete petty cash expense';
      })

      // 🔵 Get Single
      .addCase(getPettyCasheExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPettyCasheExpense.fulfilled, (state, action: PayloadAction<PettyCashRecord>) => {
        state.loading = false;
        state.selectedExpense = action.payload;
      })
      .addCase(getPettyCasheExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch petty cash expense';
      });
  },
});

export const { clearSelectedExpense, clearPettyCashRecords } = pettycashSlice.actions;
export default pettycashSlice.reducer;
