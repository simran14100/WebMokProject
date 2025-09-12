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

export const refreshTokenIfNeeded = async (forceRefresh = false) => {
  try {
    // Get tokens from both Redux state and localStorage for redundancy
    const state = store.getState();
    const token = state.auth?.token || localStorage.getItem('token');
    const refreshTokenValue = localStorage.getItem('refreshToken');
    
    console.log('🔐 Token check:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      hasRefreshToken: !!refreshTokenValue,
      refreshTokenLength: refreshTokenValue?.length || 0,
      isExpiringSoon: isTokenExpiringSoon(token),
      isExpired: isTokenExpired(token),
      forceRefresh: forceRefresh
    });
    
    // If we don't have a refresh token, we can't refresh
    if (!refreshTokenValue) {
      console.error('❌ No refresh token available in localStorage');
      // Clear any invalid tokens
      if (token) {
        localStorage.removeItem('token');
      }
      return false;
    }
    
    // If we don't have a token, it's expired, expiring soon, or we're forcing a refresh
    if (forceRefresh || !token || isTokenExpiringSoon(token) || isTokenExpired(token)) {
      console.log('🔄 Token needs refresh:', {
        hasToken: !!token,
        isExpiringSoon: isTokenExpiringSoon(token),
        isExpired: isTokenExpired(token),
        forceRefresh: forceRefresh
      });
      
      // If we're already refreshing, wait for the result
      if (isRefreshing) {
        console.log('⏳ Already refreshing, adding to queue...');
        return new Promise((resolve) => {
          refreshSubscribers.push((success) => {
            console.log('✅ Resolving queued refresh request');
            resolve(success);
          });
        });
      }
      
      isRefreshing = true;
      console.log('🔄 Starting token refresh...');
      
      try {
        // Use dynamic import to avoid circular dependencies
        const { refreshToken: refreshTokenAction } = await import("../services/operations/authApi");
        
        // Dispatch the refresh token action
        console.log('🔄 Dispatching refreshToken action...');
        const action = await store.dispatch(refreshTokenAction(refreshTokenValue));
        const result = action.payload || action; // Handle both thunk and direct action results
        
        console.log('🔑 Refresh result:', {
          success: result?.success,
          hasAccessToken: !!result?.accessToken,
          hasUser: !!result?.user,
          error: result?.error,
          code: result?.code
        });
        
        if (result?.success) {
          console.log('✅ Token refresh successful');
          onRefreshed(true);
          return true;
        } else {
          const errorMessage = result?.message || 'Failed to refresh token';
          console.error('❌ Token refresh failed:', errorMessage);
          
          // Clear invalid tokens
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          
          // Reset auth state
          store.dispatch({ type: 'auth/setToken', payload: null });
          store.dispatch({ type: 'auth/setUser', payload: null });
          
          // Notify subscribers of failure
          onRefreshed(false);
          
          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error("❌ Failed to refresh token:", {
          message: error.message,
          code: error.code,
          stack: error.stack
        });
        
        // Notify all subscribers of the failure
        onRefreshed(false);
        
        try {
          // Clear tokens
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          
          // Clear Redux state
          store.dispatch({ type: 'auth/setToken', payload: null });
          store.dispatch({ type: 'auth/setUser', payload: null });
          
          // Only attempt logout if we're not already on the login page
          if (!window.location.pathname.includes('/login')) {
            const { logout } = await import("../services/operations/authApi");
            store.dispatch(logout());
          }
        } catch (cleanupError) {
          console.error("❌ Error during cleanup after token refresh failure:", cleanupError);
        }
        
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