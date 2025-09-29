import axios from "axios";
import { store } from "../store";
import { logout as logoutAction } from "../store/slices/authSlice";
import { clearUser } from "../store/slices/profileSlice";
import { refreshToken } from "./operations/authApi";
import { showError } from "../utils/toast";
import { refreshTokenIfNeeded } from "../utils/tokenUtils";

if (!process.env.REACT_APP_BASE_URL) {
  console.error('REACT_APP_BASE_URL is not set in environment variables');
}

// Create a clean axios instance with minimal configuration
const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: process.env.REACT_APP_BASE_URL,
    withCredentials: true,
    timeout: 30000, // 30 seconds
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    },
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      console.log('[API Request Interceptor] Processing request:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
        skipAuth: config.skipAuth,
        isAuthRequest: config.url.includes('/auth/')
      });

      // Skip adding auth header for auth-related requests or if skipAuth is true
      if (config.url.includes('/auth/') || config.skipAuth) {
        delete config.headers.Authorization;
        // Ensure CORS headers are set for all requests
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        console.log('[API Request Interceptor] Skipping auth for request');
        return config;
      }

      // Get token from Redux store or localStorage
      const state = store?.getState();
      const token = state?.auth?.token || localStorage.getItem('token');
      
      console.log('[API Request Interceptor] Token state:', {
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        tokenPrefix: token ? token.substring(0, 10) + '...' : 'none',
        fromRedux: !!state?.auth?.token,
        fromLocalStorage: !!localStorage.getItem('token')
      });
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('[API Request Interceptor] Added Authorization header');
      } else {
        console.warn('[API Request Interceptor] No token found for authenticated request');
      }
      
      // Ensure CORS headers are set for all requests
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      
      console.log('[API Request Interceptor] Final request config:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
        params: config.params
      });
      
      return config;
    },
    (error) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );
  
  // Response interceptor to handle token refresh with request queuing
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      // If error is not 401, reject immediately
      if (error.response?.status !== 401) {
        return Promise.reject(error);
      }
      
      // Skip refresh token logic for auth endpoints, retries, or if explicitly skipped
      if (originalRequest.url.includes('/auth/') || originalRequest._retry || originalRequest._skipAuth) {
        console.log('Skipping refresh for:', {
          url: originalRequest.url,
          isRetry: originalRequest._retry,
          skipAuth: originalRequest._skipAuth
        });
        return Promise.reject(error);
      }

      // If we're already refreshing, add the request to the queue
      if (isRefreshing) {
        console.log('Already refreshing token, adding request to queue');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return instance(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
      }
      
      // Mark request as retried to prevent infinite loops
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        console.log('Token expired or invalid, attempting to refresh...');
        
        // Get the current refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          console.log('No refresh token available');
          throw new Error('No refresh token available');
        }
        
        // Call the refresh token endpoint
        const refreshSuccess = await refreshTokenIfNeeded();
        
        if (!refreshSuccess) {
          console.log('Token refresh failed, logging out...');
          const error = new Error('Failed to refresh token');
          error.code = 'REFRESH_FAILED';
          throw error;
        }
        
        // Get the new token from the store or localStorage
        const state = store.getState();
        const newToken = state.auth?.token || localStorage.getItem('token');
        
        if (!newToken) {
          throw new Error('No token available after refresh');
        }
        
        console.log('Token refresh successful, processing queue...');
        
        // Process all queued requests with the new token
        processQueue(null, newToken);
        
        // Update the auth header for the original request
        originalRequest.headers = {
          ...originalRequest.headers,
          'Authorization': `Bearer ${newToken}`,
          'X-Requested-With': 'XMLHttpRequest'
        };
        
        // Ensure we don't skip auth for the retry
        if (originalRequest._skipAuth) {
          delete originalRequest._skipAuth;
        }
        
        console.log('Retrying original request with new token...');
        return instance(originalRequest);
        
      } catch (error) {
        console.error('Error in response interceptor:', {
          message: error.message,
          code: error.code,
          response: error.response?.data
        });
        
        // Process all queued requests with the error
        processQueue(error);
        
        // Clear auth state and redirect to login
        store.dispatch(logoutAction());
        
        // Only redirect if we're not already on the login page
        if (!window.location.pathname.includes('/login')) {
          console.log('Redirecting to login...');
          window.location.href = '/login';
        }
        
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }
  );

  return instance;
};

export const axiosInstance = createAxiosInstance();

// Track if we're currently processing auth refresh
let isRefreshing = false;
let failedQueue = [];

/**
 * Process all queued requests with the new token or error
 * @param {Error|null} error - Error if refresh failed, null if successful
 * @param {string|null} token - New access token if refresh was successful
 */
const processQueue = (error = null, token = null) => {
  console.log(`Processing ${failedQueue.length} queued requests`, { error: error?.message, hasToken: !!token });
  
  // Process all queued requests
  failedQueue.forEach(({ resolve, reject, config }) => {
    if (error) {
      // If we have an error, reject all queued requests
      console.log(`Rejecting queued request to ${config.url} due to refresh error`);
      reject(error);
    } else {
      // Update the token in the config and resolve
      console.log(`Retrying queued request to ${config.url}`);
      config.headers.Authorization = `Bearer ${token}`;
      resolve(axiosInstance(config));
    }
  });
  
  // Clear the queue
  failedQueue = [];
};

// Request interceptor - can be used for adding headers if needed
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('[Axios Interceptor] Processing request:', {
      url: config.url,
      method: config.method,
      headers: config.headers
    });

    // Skip adding auth header for auth-related requests
    if (config.url.includes('/auth/') || config.skipAuth) {
      console.log('[Axios Interceptor] Skipping auth for request');
      delete config.headers.Authorization;
      return config;
    }

    const state = store.getState();
    const token = state?.auth?.token || localStorage.getItem('token');
    
    console.log('[Axios Interceptor] Token state:', {
      hasToken: !!token,
      fromRedux: !!state?.auth?.token,
      fromLocalStorage: !!localStorage.getItem('token')
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('[Axios Interceptor] Added Authorization header');
    } else {
      console.warn('[Axios Interceptor] No token found for authenticated request');
    }
    
    return config;
  },
  (error) => {
    console.error('[Axios Interceptor] Request error:', error);
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

export const apiConnector = async (method, url, bodyData = null, headers = {}, params = null, skipAuth = false) => {
  // For DELETE requests, we don't want to include a body
  const isDelete = method.toUpperCase() === 'DELETE';
  const isFormData = bodyData instanceof FormData;
  
  // Enhanced logging for FormData
  let formDataInfo = {};
  if (isFormData) {
    const formDataEntries = {};
    for (let [key, value] of bodyData.entries()) {
      if (value instanceof File || value instanceof Blob) {
        formDataEntries[key] = {
          type: 'file',
          name: value.name,
          size: value.size,
          type: value.type,
          lastModified: value.lastModified
        };
      } else {
        formDataEntries[key] = value;
      }
    }
    formDataInfo = { formDataEntries };
  }
  
  console.log('[apiConnector] Making request:', {
    method,
    url,
    ...(isDelete ? { bodyData: '[omitted for DELETE]' } : {}),
    ...(isFormData ? { formDataInfo } : { bodyData }),
    headers,
    params,
    isFormData,
    hasToken: !skipAuth && (!!store.getState()?.auth?.token || !!localStorage.getItem('token'))
  });

  try {
    // Get the auth token if not skipped
    const token = skipAuth ? null : (store.getState()?.auth?.token || localStorage.getItem('token'));
    
    // Create base config
    const requestConfig = {
      method: method,
      url: url,
      headers: {
        ...(token && !skipAuth ? { 'Authorization': `Bearer ${token}` } : {}),
        'X-Requested-With': 'XMLHttpRequest',
        // Don't set Content-Type for FormData - let the browser set it with the correct boundary
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...headers // Let headers from the function call override
      },
      params: params,
      withCredentials: true,
      // Add timeout and other axios config
      timeout: 60000, // 60 seconds
      maxContentLength: 100 * 1024 * 1024, // 100MB
      maxBodyLength: 100 * 1024 * 1024, // 100MB
      validateStatus: function (status) {
        return status >= 200 && status < 500; // Resolve only if the status code is less than 500
      },
    };

    // Handle request data
    if (!isDelete && bodyData !== null) {
      if (isFormData) {
        // For FormData, let Axios handle the content type with the boundary
        requestConfig.data = bodyData;
        // Remove Content-Type header to let the browser set it with the correct boundary
        delete requestConfig.headers['Content-Type'];
        
        // Log FormData content for debugging
        console.log('[apiConnector] FormData content:');
        for (let [key, value] of bodyData.entries()) {
          if (value instanceof File || value instanceof Blob) {
            console.log(`  ${key}: [File] ${value.name} (${value.size} bytes, ${value.type})`);
          } else {
            console.log(`  ${key}:`, value);
          }
        }
      } else {
        // For JSON data, stringify it
        requestConfig.data = bodyData;
      }
    }

    const response = await axiosInstance(requestConfig);
    
    console.log('[apiConnector] Request successful:', {
      url,
      status: response.status,
      data: response.data
    });
    
    return response;
  } catch (error) {
    console.error('[apiConnector] Request failed:', {
      url,
      method,
      error: {
        message: error.message,
        response: {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data
        },
        request: error.request
      }
    });
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.log('[apiConnector] Detected 401 Unauthorized, attempting token refresh...');
      try {
        const newToken = await refreshToken();
        if (newToken) {
          console.log('[apiConnector] Token refreshed, retrying original request');
          // Update the authorization header with the new token
          const retryConfig = error.config;
          retryConfig.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(retryConfig);
        }
      } catch (refreshError) {
        console.error('[apiConnector] Token refresh failed:', refreshError);
        // If refresh fails, clear auth state and redirect to login
        store.dispatch(logoutAction());
        window.location.href = '/login';
      }
    }
    
    throw error;
  }
};
