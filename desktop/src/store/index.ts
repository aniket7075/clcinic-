import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import api, { setAuthToken } from '../api/axios';

const loadState = () => {
  try {
    const serializedState = localStorage.getItem('authState');
    if (serializedState === null) {
      return undefined;
    }
    const state = JSON.parse(serializedState);
    
    // Restore axios headers
    if (state.token) {
      setAuthToken(state.token);
    }
    if (state.clinicId) {
      api.defaults.headers.common['x-clinic-id'] = state.clinicId;
    }
    
    return state;
  } catch (err) {
    return undefined;
  }
};

const saveState = (state: any) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('authState', serializedState);
  } catch {
    // ignore write errors
  }
};

const preloadedAuth = loadState();

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  preloadedState: preloadedAuth ? { auth: preloadedAuth } : undefined
});

store.subscribe(() => {
  saveState(store.getState().auth);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
