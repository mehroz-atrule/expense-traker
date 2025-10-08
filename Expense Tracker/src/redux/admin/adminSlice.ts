import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import * as api from '../../api/adminApi';

export interface Office { _id: string; name: string }
export interface User { _id: string; username: string; email?: string; role?: string; officeId?: string }

interface AdminState {
  offices: Office[];
  users: User[];
  loading: boolean;
  error?: string | null;
}

const initialState: AdminState = { offices: [], users: [], loading: false, error: null };

export const fetchOffices = createAsyncThunk('admin/fetchOffices', async () => {
  const res = await api.listOffices();
  console.log('Fetched offices:', res);
  return res as Office[];
});

export const addOffice = createAsyncThunk('admin/addOffice', async (payload: { name: string }, { rejectWithValue }) => {
  try {
    const res = await api.createOffice(payload as api.CreateOfficePayload);
    return res as Office;
  } catch (err: any) {
    return rejectWithValue(err?.response?.data ?? err);
  }
});

export const updateOffice = createAsyncThunk('admin/updateOffice', async ({ id, payload }: { id: string; payload: { name: string } }, { rejectWithValue }) => {
  try {
    const res = await api.updateOffice(id, payload as api.UpdateOfficePayload);
    return res as Office;
  } catch (err: any) {
    return rejectWithValue(err?.response?.data ?? err);
  }
});

export const removeOffice = createAsyncThunk('admin/removeOffice', async (id: string, { rejectWithValue }) => {
  try {
    await api.deleteOfficeApi(id);
    return id;
  } catch (err: any) {
    return rejectWithValue(err?.response?.data ?? err);
  }
});

export const fetchUsers = createAsyncThunk('admin/fetchUsers', async (_, { rejectWithValue }) => {
  try {
    const res = await api.listUsers();
    return res.users as User[];
  } catch (err: any) {
    return rejectWithValue(err?.response?.data ?? err);
  }
});

export const addUser = createAsyncThunk('admin/addUser', async (payload: { username: string; email: string; password?: string; role?: string; officeId?: string }, { rejectWithValue }) => {
  try {
    const res = await api.createUser(payload as api.CreateUserPayload);
    return res as User;
  } catch (err: any) {
    return rejectWithValue(err?.response?.data ?? err);
  }
});

export const updateUser = createAsyncThunk('admin/updateUser', async ({ id, payload }: { id: string; payload: { username?: string; email?: string; role?: string; officeId?: string } }, { rejectWithValue }) => {
  try {
    const res = await api.updateUser(id, payload as api.UpdateUserPayload);
    return res as User;
  } catch (err: any) {
    return rejectWithValue(err?.response?.data ?? err);
  }
});

export const removeUser = createAsyncThunk('admin/removeUser', async (id: string, { rejectWithValue }) => {
  try {
    await api.deleteUserApi(id);
    return id;
  } catch (err: any) {
    return rejectWithValue(err?.response?.data ?? err);
  }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOffices.pending, (s) => { s.loading = true; s.error = null })
      .addCase(fetchOffices.fulfilled, (s, a: PayloadAction<Office[]>) => { s.loading = false; s.offices = a.payload })
      .addCase(fetchOffices.rejected, (s, a) => { s.loading = false; s.error = a.error.message })

      .addCase(addOffice.pending, (s) => { s.loading = true; s.error = null })
      .addCase(addOffice.fulfilled, (s, a: PayloadAction<Office>) => { s.loading = false; s.offices.unshift(a.payload) })
      .addCase(addOffice.rejected, (s, a) => { s.loading = false; s.error = a.error.message })

      .addCase(updateOffice.pending, (s) => { s.loading = true; s.error = null })
      .addCase(updateOffice.fulfilled, (s, a: any) => {
        s.loading = false;                            
        const payload = a.payload || {};
        const arg = a.meta?.arg || {};        
        const updatedId = payload._id || arg.id;
        const patch = Object.keys(payload).length ? payload : { _id: updatedId, ...arg.payload };
        s.offices = s.offices.map((o: any) => (o._id === updatedId ? { ...o, ...patch } : o));
      })
      .addCase(updateOffice.rejected, (s, a) => { s.loading = false; s.error = a.error.message })

      .addCase(removeOffice.fulfilled, (s, a: PayloadAction<string>) => { s.offices = s.offices.filter(o => o._id !== a.payload) })

      .addCase(fetchUsers.pending, (s) => { s.loading = true; s.error = null })
      .addCase(fetchUsers.fulfilled, (s, a: PayloadAction<User[]>) => { s.loading = false; s.users = a.payload })
      .addCase(fetchUsers.rejected, (s, a) => { s.loading = false; s.error = a.error.message })

      .addCase(addUser.pending, (s) => { s.loading = true; s.error = null })
      .addCase(addUser.fulfilled, (s, a: any) => {
        s.loading = false;
        const payload = (a.payload ?? {}) as any;
        const arg = (a.meta?.arg ?? {}) as any;
        const merged = {
          ...arg,
          ...payload,
        } as any;
        s.users.unshift(merged);
      })
      .addCase(addUser.rejected, (s, a) => { s.loading = false; s.error = a.error.message })

      .addCase(updateUser.pending, (s) => { s.loading = true; s.error = null })
      .addCase(updateUser.fulfilled, (s, a: any) => {
        s.loading = false;
        const payload = a.payload || {};
        const arg = a.meta?.arg || {};
        const updatedId = payload._id || arg.id;
        const patch = Object.keys(payload).length ? payload : { _id: updatedId, ...arg.payload };
        s.users = s.users.map((u: any) => (u._id === updatedId ? { ...u, ...patch } : u));
      })
      .addCase(updateUser.rejected, (s, a) => { s.loading = false; s.error = a.error.message })

      .addCase(removeUser.fulfilled, (s, a: PayloadAction<string>) => { s.users = s.users.filter(u => u._id !== a.payload) });
  }
});

export default adminSlice.reducer;
