import axios from "axios";
import { store } from "../store";
import { logout as logoutAction } from "../store/slices/authSlice";
import { clearUser } from "../store/slices/profileSlice";
import { refreshToken } from "./operations/authApi";
import { showError } from "../utils/toast";
import { isUserLoggingOut } from "../utils/sessionFlags";


export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL || "http://localhost:4000",
  withCredentials: true, // This is important for sending cookies with requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Enable CORS credentials
  crossDomain: true,
  // Increase timeout
  timeout: 30000, // 30 seconds
});

// Track if we're currently refreshing the token
let isRefreshing = false;
let failedQueue = [];
// const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:4000";
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Add request interceptor to include Authorization header
axiosInstance.interceptors.request.use(
  (config) => {
    // Skip for auth routes
    if (config.url.includes('/auth/')) {
      return config;
    }
    
    // First try to get token from Redux store
    let token = store.getState()?.auth?.token;
    
    // If not in Redux, try to get from localStorage
    if (!token) {
      const persistedAuth = localStorage.getItem('persist:auth');
      if (persistedAuth) {
        try {
          const parsedAuth = JSON.parse(persistedAuth);
          token = JSON.parse(parsedAuth.token || 'null');
          console.log('Retrieved token from localStorage:', token);
        } catch (error) {
          console.error('Error parsing persisted auth:', error);
        }
      }
    }
    
    // Set Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Setting Authorization header with token');
      
      // Debug: Log token payload
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('JWT Token payload:', payload);
        }
      } catch (e) {
        console.error('Error decoding JWT token:', e);
      }
    } else {
      console.warn('No token found for API request');
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Skip interceptor if the request has the skip header
    if (error.config?.headers?.['X-Skip-Interceptor'] === 'true') {
      return Promise.reject(error);
    }
    
    // If user initiated a logout, don't run 401 logic or show toasts
    try {
      if (typeof isUserLoggingOut === 'function' && isUserLoggingOut()) {
        return Promise.reject(error);
      }
    } catch (e) {
      // noop
    }
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If we're already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`;
          return axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const currentToken = store.getState().auth.token;
      
      if (!currentToken) {
        // No token to refresh, logout immediately
        console.log("No token found. Logging out user...");
        store.dispatch(logoutAction());
        store.dispatch(clearUser());
        showError("Session expired. Please login again.");
        // Redirect to university login instead of regular login
        window.location.href = "/university/login";
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh the token
        const result = await store.dispatch(refreshToken(currentToken));
        const newToken = result.payload?.token || result.token;
        
        if (newToken) {
          // Update the original request with new token
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          processQueue(null, newToken);
          isRefreshing = false;
          
          // Retry the original request
          return axiosInstance(originalRequest);
        } else {
          throw new Error("Failed to get new token");
        }
      } catch (refreshError) {
        console.log("Token refresh failed. Logging out user...", refreshError);
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Clear the token from Redux store
        store.dispatch(logoutAction());
        store.dispatch(clearUser());
        
        // Show notification to user
        showError("Session expired. Please login again.");
        
        // Redirect to university login page
        window.location.href = "/university/login";
      }
    }
    
    return Promise.reject(error);
  }
);
// utils/apiConnector.js
// export const apiConnector = async (method, url, bodyData = null, customHeaders = {}) => {
//   const options = {
//     method: method.toUpperCase(),
//     credentials: 'include', // Crucial for cookies
//     headers: {
//       'Content-Type': 'application/json',
//       ...customHeaders,
//     },
//     body: bodyData ? JSON.stringify(bodyData) : undefined,
//   };

//   try {
//     const response = await fetch(`${BASE_URL}${url}`, options);
    
//     if (!response.ok) {
//       const errorData = await response.json();
//       throw new Error(errorData.message || "Request failed");
//     }

//     return await response.json();
//   } catch (error) {
//     console.error("API call error:", error);
//     throw error;
//   }
// };
export const apiConnector = (method, url, bodyData = null, headers = {}, params = null) => {
  console.log('API Request:', { method, url, bodyData, headers, params });
  
  // Get token from Redux store or localStorage
  const getToken = () => {
    try {
      // First try to get from Redux store
      const state = store.getState();
      if (state?.auth?.token) {
        return state.auth.token;
      }
      
      // Then try to get from localStorage
      const persistedAuth = localStorage.getItem('persist:auth');
      if (persistedAuth) {
        const parsedAuth = JSON.parse(persistedAuth);
        if (parsedAuth.token) {
          return JSON.parse(parsedAuth.token);
        }
      }
    } catch (error) {
      console.error('Error getting token:', error);
    }
    return null;
  };

  const token = getToken();
  
  // Prepare request config
  const config = {
    method: method.toLowerCase(),
    url: url,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...headers
    },
    withCredentials: true
  };
  
  // Add request data if present
  if (bodyData) {
    config.data = bodyData;
  }
  
  // Add query parameters if present
  if (params) {
    config.params = params;
  }
  
  console.log('Sending API request with config:', {
    ...config,
    headers: { ...config.headers, Authorization: config.headers.Authorization ? 'Bearer [TOKEN]' : 'None' }
  });
  
  return axiosInstance(config);
};