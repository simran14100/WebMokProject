import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Session state (not persisted, will be refetched on page reload)
  user: null,
  loading: false,
  signupData: null,
  isAuthenticated: false,
  // Add any other auth-related state here
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    ...initialState,
    token: null, // Add token to the initial state
  },
  reducers: {
    // Set the auth token
    setToken: (state, action) => {
      state.token = action.payload;
    },
    // Set the current user data from the server
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    // Store signup data if needed between steps
    setSignupData: (state, action) => {
      state.signupData = action.payload;
    },
    // Clear all auth state on logout
    logout: (state) => {
      state.user = null;
      state.signupData = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    // Reset auth state
    resetAuth: () => initialState,
  },
});

export const { setToken, setUser, setLoading, setSignupData, logout, resetAuth } = authSlice.actions;
export default authSlice.reducer;