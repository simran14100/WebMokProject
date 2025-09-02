import axios from "axios";
import { store } from "../store";
import { logout as logoutAction } from "../store/slices/authSlice";
import { clearUser } from "../store/slices/profileSlice";
import { refreshToken } from "./operations/authApi";
import { showError } from "../utils/toast";

export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL || "http://localhost:4000",
  withCredentials: true, // Required for cookies, authorization headers with HTTPS
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  crossDomain: true,
  timeout: 30000, // 30 seconds
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

// Track if we're currently processing auth refresh
let isRefreshing = false;
let failedQueue = [];

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

// Request interceptor - can be used for adding headers if needed
axiosInstance.interceptors.request.use(
  (config) => {
    // Skip adding auth header for auth-related requests
    if ((config.url && config.url.includes('/auth/')) || config.headers['skipAuth']) {
      return config;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Skip interceptor if the request has the skip header
    if (originalRequest?.headers?.['X-Skip-Interceptor'] === 'true') {
      return Promise.reject(error);
    }
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, add to queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
        .then(() => {
          return axiosInstance(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        // Try to refresh the token
        await refreshToken();
        
        // Retry the original request
        const response = await axiosInstance(originalRequest);
        processQueue(null, response);
        return response;
      } catch (refreshError) {
        // If refresh fails, clear auth and redirect to login
        processQueue(refreshError, null);
        store.dispatch(logoutAction());
        store.dispatch(clearUser());
        
        // Redirect to login if we're not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/university/login';
        }
        
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Handle other errors
    if (error.response?.status === 403) {
      showError("You don't have permission to perform this action");
    } else if (error.response?.status >= 500) {
      showError("Server error. Please try again later.");
    } else if (!window.navigator.onLine) {
      showError("You are offline. Please check your internet connection.");
    } else if (error.message === 'Network Error') {
      showError("Network error. Please check your connection and try again.");
    } else if (error.response?.status === 401) {
      // Handle 401 Unauthorized (session expired)
      store.dispatch(logoutAction());
      store.dispatch(clearUser());
      showError("Session expired. Please login again.");
      window.location.href = "/university/login";
    } else if (error.response?.data?.message) {
      showError(error.response.data.message);
    } else if (error.message) {
      showError(error.message);
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