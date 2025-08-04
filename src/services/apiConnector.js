import axios from "axios";
import { store } from "../store";
import { logout as logoutAction } from "../store/slices/authSlice";
import { clearUser } from "../store/slices/profileSlice";
import { refreshToken } from "./operations/authApi";
import { showError } from "../utils/toast";

export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL || "http://localhost:4000",
});

// Track if we're currently refreshing the token
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

// Add response interceptor to handle 401 errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
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
        window.location.href = "/login";
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
        
        // Redirect to login page
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

export const apiConnector = (method, url, bodyData, headers, params) => {
  return axiosInstance({
    method: `${method}`,
    url: `${url}`,
    data: bodyData ? bodyData : null,
    headers: headers ? headers : null,
    params: params ? params : null,
  });
};