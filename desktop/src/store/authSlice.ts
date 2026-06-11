import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  clinicName: string;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  clinicName: 'Clinic Pro',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.clinicName = 'Clinic Pro';
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setClinicName: (state, action: PayloadAction<string>) => {
      state.clinicName = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading, setClinicName } = authSlice.actions;

export default authSlice.reducer;
