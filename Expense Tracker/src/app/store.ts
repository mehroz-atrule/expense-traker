import { configureStore } from '@reduxjs/toolkit';
import submitterReducer from '../redux/submitter/submitterSlice';
import adminReducer from '../redux/admin/adminSlice';
import vendorReducer from '../redux/vendor/vendorSlice';

export const store = configureStore({
	reducer: {
		submitter: submitterReducer,
		admin: adminReducer,
		vendor: vendorReducer,
	},
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;