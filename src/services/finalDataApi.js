import { toast } from 'react-hot-toast';
import { store } from '../store';
import { logout, setToken } from '../store/slices/authSlice';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const FINAL_DATA_API = `${API_BASE_URL}/api/v1/final-data`;

// Helper function to get auth token
const getAuthToken = () => {
  const state = store.getState();
  return state?.auth?.token || localStorage.getItem('token');
};

// Helper function to refresh token
const refreshAuthToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    // No refresh token available, user needs to log in again
    store.dispatch(logout());
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
    throw new Error('No refresh token available. Please log in again.');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      // If refresh token is invalid, log the user out
      if (response.status === 401) {
        store.dispatch(logout());
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    const { accessToken } = data;

    // Update the token in the store and localStorage
    store.dispatch(setToken(accessToken));
    return accessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    // Only redirect if it's an authentication error
    if (error.message.includes('401') || error.message.includes('Failed to refresh token')) {
      store.dispatch(logout());
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    throw error;
  }
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong');
    error.response = data;
    error.status = response.status;
    throw error;
  }
  
  return data;
};

// Helper function to make API requests with token refresh
const apiRequest = async (url, options = {}) => {
  let token = getAuthToken();
  
  // Set up default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add auth header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include' // Important for sending cookies
    });

    // If unauthorized, try to refresh token and retry
    if (response.status === 401) {
      const newToken = await refreshAuthToken();
      
      // Update the token in headers
      headers['Authorization'] = `Bearer ${newToken}`;
      
      // Retry with new token
      const retryResponse = await fetch(url, {
        ...options,
        headers,
        credentials: 'include'
      });
      
      return handleResponse(retryResponse);
    }

    return handleResponse(response);
  } catch (error) {
    if (error.message.includes('401')) {
      store.dispatch(logout());
      throw new Error('Session expired. Please log in again.');
    }
    console.error('API request failed:', error);
    throw error;
  }
};


export const finalDataApi = {
  // Create new final data entry
  createFinalData: async (data) => {
    try {
      return await apiRequest(FINAL_DATA_API, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error("Error creating final data:", error);
      toast.error(error.response?.message || error.message || 'Failed to save data');
      throw error;
    }
  },

  // Get all final data with optional filters
  getFinalData: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `${FINAL_DATA_API}?${queryString}` : FINAL_DATA_API;
      return await apiRequest(url);
    } catch (error) {
      console.error("Error fetching final data:", error);
      toast.error(error.response?.message || error.message || 'Failed to fetch data');
      throw error;
    }
  },

  // Get single entry by ID
  getFinalDataById: async (id) => {
    try {
      return await apiRequest(`${FINAL_DATA_API}/${id}`);
    } catch (error) {
      console.error(`Error fetching final data ${id}:`, error);
      toast.error(error.response?.message || error.message || 'Failed to fetch data');
      throw error;
    }
  },

  // Update final data
  updateFinalData: async (id, data) => {
    try {
      return await apiRequest(`${FINAL_DATA_API}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error(`Error updating final data ${id}:`, error);
      toast.error(error.response?.message || error.message || 'Failed to update data');
      throw error;
    }
  },

  // Delete final data
  deleteFinalData: async (id) => {
    try {
      return await apiRequest(`${FINAL_DATA_API}/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error(`Error deleting final data ${id}:`, error);
      toast.error(error.response?.message || error.message || 'Failed to delete data');
      throw error;
    }
  }
};