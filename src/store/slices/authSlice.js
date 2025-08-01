import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: null,
  loading: false,
  signupData: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: initialState,
  reducers: {
    setToken(state, value) {
      state.token = value.payload;
    },
    setLoading(state, value) {
      state.loading = value.payload;
    },
    setSignupData(state, value) {
      state.signupData = value.payload;
    },
    logout: (state) => {
      state.token = null;
      state.signupData = null;
      // Clear any other auth-related state
      state.loading = false;
    },
  },
});

export const { setToken, setLoading, setSignupData, logout } = authSlice.actions;
export default authSlice.reducer; 