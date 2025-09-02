import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user')) || null,
  loading: false,
  error: null,
  programType: localStorage.getItem('programType') || '',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    setProgramType: (state, action) => {
      state.programType = action.payload;
      localStorage.setItem('programType', action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.programType = '';
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('programType');
    },
  },
});

export const {
  setToken,
  setUser,
  setProgramType,
  setLoading,
  setError,
  logout,
} = authSlice.actions;

export default authSlice.reducer;
