import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { PettyCashRecord, PettyCashFormData } from '../../types/pettycash'; // ✅ PettyCashFormData import karo
import {
  addPettyCashExpense,
  deletePettyCashExpense,
  getPettyCasheExpenseById,
  getPettyCasheExpenses,
  updatePettyCashExpense,
} from '../../api/pettycashApi';

// ✅ Define API response structure
interface PettyCashResponse {
  data: PettyCashRecord[];
  total: number;
  page: number;
  limit: number;
  summary: any;
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
  summary?: any;
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
  summary: null,
};

// ✅ Thunks
export const fetchPettyCash = createAsyncThunk<PettyCashResponse, Record<string, unknown>>(
  'pettycash/fetchPettyCash',
  async (params = {}) => {
    if (params.month && params.office) {
      const res = await getPettyCasheExpenses(params);
      return res as PettyCashResponse;
    }

    return {
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      summary: {}
    };
  }
);

// ✅ Create expense - FormData aur regular object dono support karo
export const createPettyCashExpense = createAsyncThunk(
  'pettycash/createPettyCashExpense',
  async (payload: FormData | Omit<PettyCashFormData, 'chequeImage'> & { chequeImage?: File }) => {
    const res = await addPettyCashExpense(payload);
    return res as PettyCashRecord;
  }
);

// ✅ Update expense - FormData aur regular object dono support karo
export const updatePettyCashExpenseById = createAsyncThunk(
  'pettycash/updatePettyCashExpense',
  async ({ id, payload }: { id: string | number; payload: FormData | Partial<PettyCashRecord> }) => {
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

export const getPettyCashExpense = createAsyncThunk(
  'pettycash/getPettyCasheExpenseById',
  async (id: string | number) => {
    const res = await getPettyCasheExpenseById(id);
    return res as PettyCashRecord;
  }
);

// ✅ Slice (same as before, no changes needed here)
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
        state.summary = action.payload.summary;
      })
      .addCase(fetchPettyCash.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch petty cash records';
      })
      .addCase(createPettyCashExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPettyCashExpense.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createPettyCashExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create petty cash expense';
      })
      .addCase(updatePettyCashExpenseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePettyCashExpenseById.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updatePettyCashExpenseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update petty cash expense';
      })
      .addCase(deletePettyCashExpenseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePettyCashExpenseById.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deletePettyCashExpenseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete petty cash expense';
      })
      .addCase(getPettyCashExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPettyCashExpense.fulfilled, (state, action: PayloadAction<PettyCashRecord>) => {
        state.loading = false;
        state.selectedExpense = action.payload;
      })
      .addCase(getPettyCashExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch petty cash expense';
      });
  },
});

export const { clearSelectedExpense, clearPettyCashRecords } = pettycashSlice.actions;
export default pettycashSlice.reducer;