import { createSlice } from '@reduxjs/toolkit';

// Helper function to safely get initial state from localStorage
const getInitialState = () => ({
  token: localStorage.getItem('token') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  user: JSON.parse(localStorage.getItem('user') || null),
  programType: localStorage.getItem('programType') || '',
  loading: false,
  signupData: null,
  isAuthenticated: !!localStorage.getItem('token'),
});

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    // Set the auth token
    setToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
      if (action.payload) {
        localStorage.setItem('token', action.payload);
      } else {
        localStorage.removeItem('token');
      }
    },
    setRefreshToken: (state, action) => {
      state.refreshToken = action.payload;
      if (action.payload) {
        localStorage.setItem('refreshToken', action.payload);
      } else {
        localStorage.removeItem('refreshToken');
      }
    },
    // Set the current user data from the server
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      if (action.payload) {
        localStorage.setItem('user', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('user');
      }
    },
    // Set program type
    setProgramType: (state, action) => {
      state.programType = action.payload;
      if (action.payload) {
        localStorage.setItem('programType', action.payload);
      } else {
        localStorage.removeItem('programType');
      }
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
      state.token = null;
      state.user = null;
      state.programType = '';
      state.signupData = null;
      state.isAuthenticated = false;
      state.loading = false;
      
      // Clear all auth-related items from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('programType');
      localStorage.removeItem('refreshToken');
    },
    // Reset auth state
    resetAuth: (state) => {
      const newState = getInitialState();
      Object.keys(newState).forEach(key => {
        state[key] = newState[key];
      });
    },
  },
});

export const { 
  setToken, 
  setUser, 
  setProgramType,
  setLoading, 
  setSignupData, 
  logout, 
  resetAuth ,
  setRefreshToken
} = authSlice.actions;

export default authSlice.reducer;