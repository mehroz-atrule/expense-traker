import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import * as api from '../../api/adminApi';

export interface Office { id: string; name: string }
export interface User { id: string; name: string; email?: string; role?: string; officeId?: string }

interface AdminState {
  offices: Office[];
  users: User[];
  loading: boolean;
  error?: string | null;
}

const initialState: AdminState = { offices: [], users: [], loading: false, error: null };

export const fetchOffices = createAsyncThunk('admin/fetchOffices', async () => {
  const res = await api.listOffices();
  return res as Office[];
});

export const addOffice = createAsyncThunk('admin/addOffice', async (payload: { name: string }) => {
  const res = await api.createOffice(payload as api.CreateOfficePayload);
  return res as Office;
});

export const updateOffice = createAsyncThunk('admin/updateOffice', async ({ id, payload }: { id: string; payload: { name: string } }) => {
  const res = await api.updateOffice(id, payload as api.UpdateOfficePayload);
  return res as Office;
});

export const removeOffice = createAsyncThunk('admin/removeOffice', async (id: string) => {
  await api.deleteOfficeApi(id);
  return id;
});

export const fetchUsers = createAsyncThunk('admin/fetchUsers', async () => {
  const res = await api.listUsers();
  return res as User[];
});

export const addUser = createAsyncThunk('admin/addUser', async (payload: { name: string; email: string; password?: string; role?: string; officeId?: string }) => {
  const res = await api.createUser(payload as api.CreateUserPayload);
  return res as User;
});

export const updateUser = createAsyncThunk('admin/updateUser', async ({ id, payload }: { id: string; payload: { name?: string; email?: string; role?: string; officeId?: string } }) => {
  const res = await api.updateUser(id, payload as api.UpdateUserPayload);
  return res as User;
});

export const removeUser = createAsyncThunk('admin/removeUser', async (id: string) => {
  await api.deleteUserApi(id);
  return id;
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
      .addCase(updateOffice.fulfilled, (s, a: PayloadAction<Office>) => {
        s.loading = false;
        s.offices = s.offices.map(o => o.id === a.payload.id ? a.payload : o);
      })
      .addCase(updateOffice.rejected, (s, a) => { s.loading = false; s.error = a.error.message })

      .addCase(removeOffice.fulfilled, (s, a: PayloadAction<string>) => { s.offices = s.offices.filter(o => o.id !== a.payload) })

      .addCase(fetchUsers.pending, (s) => { s.loading = true; s.error = null })
      .addCase(fetchUsers.fulfilled, (s, a: PayloadAction<User[]>) => { s.loading = false; s.users = a.payload })
      .addCase(fetchUsers.rejected, (s, a) => { s.loading = false; s.error = a.error.message })

      .addCase(addUser.pending, (s) => { s.loading = true; s.error = null })
      .addCase(addUser.fulfilled, (s, a: PayloadAction<User>) => { s.loading = false; s.users.unshift(a.payload) })
      .addCase(addUser.rejected, (s, a) => { s.loading = false; s.error = a.error.message })

      .addCase(updateUser.pending, (s) => { s.loading = true; s.error = null })
      .addCase(updateUser.fulfilled, (s, a: PayloadAction<User>) => {
        s.loading = false;
        s.users = s.users.map(u => u.id === a.payload.id ? a.payload : u);
      })
      .addCase(updateUser.rejected, (s, a) => { s.loading = false; s.error = a.error.message })

      .addCase(removeUser.fulfilled, (s, a: PayloadAction<string>) => { s.users = s.users.filter(u => u.id !== a.payload) });
  }
});

export default adminSlice.reducer;
