import { jwtDecode } from "jwt-decode";
import { store } from "../store";

// Check if token is expired or will expire soon
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = decoded.exp - currentTime;
    return timeUntilExpiry < 300; // 5 minutes in seconds
  } catch (error) {
    return true;
  }
};

export const isTokenExpiringSoon = (token) => {
  if (!token) return true;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = decoded.exp - currentTime;
    return timeUntilExpiry < 1800; // 30 minutes in seconds
  } catch (error) {
    return true;
  }
};

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (token) => {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
};

export const refreshTokenIfNeeded = async () => {
  try {
    // Get tokens from both Redux state and localStorage for redundancy
    const state = store.getState();
    const token = state.auth?.token || localStorage.getItem('token');
    const refreshTokenValue = localStorage.getItem('refreshToken');
    
    // 🔍 ADD DEBUG LOGS HERE:
    console.log('🔐 Token check - current token exists:', !!token);
    console.log('🔐 Token check - refresh token exists:', !!refreshTokenValue);
    console.log('🔐 Token expiring soon:', isTokenExpiringSoon(token));
    console.log('🔐 Token expired:', isTokenExpired(token));
    console.log('🔐 Current token:', token ? 'Present' : 'Missing');
    console.log('🔐 Refresh token:', refreshTokenValue ? 'Present' : 'Missing');
    
    if (!token || !refreshTokenValue) {
      console.log("No token or refresh token available");
      return false;
    }
    
    if (isTokenExpiringSoon(token) || isTokenExpired(token)) {
      // 🔍 ADD MORE DEBUG LOGS:
      console.log('🔐 Token needs refresh - expiring soon:', isTokenExpiringSoon(token));
      console.log('🔐 Token needs refresh - expired:', isTokenExpired(token));
      
      if (isRefreshing) {
        console.log('🔐 Already refreshing, waiting...');
        return new Promise((resolve) => {
          refreshSubscribers.push((success) => {
            resolve(success);
          });
        });
      }
      
      isRefreshing = true;
      console.log('🔐 Starting token refresh process...');
      
      try {
        console.log("Token expiring soon or expired, refreshing...");
        
        // Use dynamic import to avoid circular dependencies
        const { refreshToken: refreshTokenAction } = await import("../services/operations/authApi");
        const result = await store.dispatch(refreshTokenAction(refreshTokenValue));
        
        if (result?.payload?.success) {
          console.log("✅ Token refreshed successfully");
          onRefreshed(true);
          return true;
        } else {
          console.log("❌ Token refresh failed in action");
          throw new Error(result?.payload?.message || 'Failed to refresh token');
        }
      } catch (error) {
        console.error("❌ Failed to refresh token:", error);
        onRefreshed(false);
        
        // Clear tokens and logout on failure
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        const { logout } = await import("../services/operations/authApi");
        store.dispatch(logout());
        
        return false;
      } finally {
        isRefreshing = false;
        console.log('🔐 Refresh process completed');
      }
    }
    
    console.log('🔐 Token still valid, no refresh needed');
    return true;
  } catch (error) {
    console.error("❌ Error in refreshTokenIfNeeded:", error);
    return false;
  }
};

export const getTokenExpirationTime = (token) => {
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

export const getTimeUntilExpiry = (token) => {
  if (!token) return 0;
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = decoded.exp - currentTime;
    return Math.max(0, Math.floor(timeUntilExpiry / 60));
  } catch (error) {
    return 0;
  }
};
// REMOVE THE DUPLICATE refreshToken FUNCTION BELOW THIS LINE