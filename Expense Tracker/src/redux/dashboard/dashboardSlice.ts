import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getDashboardStats } from "../../api/dashboardApi";
import type { DashboardStats } from "../../types/dashboard";

interface DashboardState {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: null,
  loading: false,
  error: null,
};

// ✅ Thunk: Fetch Dashboard Stats
export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getDashboardStats();
      return res as DashboardStats;
    } catch (error) {
      return rejectWithValue("Failed to fetch dashboard stats");
    }
  }
);

// ✅ Slice
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardStats: (state) => {
      state.stats = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 📊 Fetch stats pending
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // ✅ Fetch stats fulfilled
      .addCase(
        fetchDashboardStats.fulfilled,
        (state, action: PayloadAction<DashboardStats>) => {
          state.loading = false;
          state.stats = action.payload;
        }
      )
      // ❌ Fetch stats rejected
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || action.error.message || "Unknown error";
      });
  },
});

// ✅ Export actions & reducer
export const { clearDashboardStats } = dashboardSlice.actions;
export default dashboardSlice.reducer;
