// import { jwtDecode } from "jwt-decode";
// import { store } from "../store";
// import { refreshToken } from "../services/operations/authApi";

// // Check if token is expired or will expire soon (within 5 minutes)
// export const isTokenExpired = (token) => {
//   if (!token) return true;
  
//   try {
//     const decoded = jwtDecode(token);
//     const currentTime = Date.now() / 1000;
//     const timeUntilExpiry = decoded.exp - currentTime;
    
//     // Consider token expired if it expires within 5 minutes
//     return timeUntilExpiry < 300; // 5 minutes in seconds
//   } catch (error) {
//     console.error("Error decoding token:", error);
//     return true;
//   }
// };

// // Check if token will expire soon (within 30 minutes)
// export const isTokenExpiringSoon = (token) => {
//   if (!token) return true;
  
//   try {
//     const decoded = jwtDecode(token);
//     const currentTime = Date.now() / 1000;
//     const timeUntilExpiry = decoded.exp - currentTime;
    
//     // Consider token expiring soon if it expires within 30 minutes
//     return timeUntilExpiry < 1800; // 30 minutes in seconds
//   } catch (error) {
//     console.error("Error decoding token:", error);
//     return true;
//   }
// };

// // Track if we're currently refreshing the token
// let isRefreshing = false;
// let refreshPromise = null;

// // Proactively refresh token if it's expiring soon
// export const refreshTokenIfNeeded = async () => {
//   // If we're already refreshing, return the existing promise
//   if (isRefreshing && refreshPromise) {
//     return refreshPromise;
//   }
  
//   isRefreshing = true;
  
//   refreshPromise = (async () => {
//     try {
//       const state = store.getState();
//       const token = state.auth?.token || localStorage.getItem('token');
//       const refreshToken = localStorage.getItem('refreshToken');
      
//       // If we don't have a token or refresh token, we can't refresh
//       if (!token || !refreshToken) {
//         console.log("No token or refresh token available");
//         return false;
//       }
      
//       const tokenExpired = isTokenExpired(token);
//       const tokenExpiringSoon = isTokenExpiringSoon(token);
      
//       // Only refresh if token is expiring soon or already expired
//       if (tokenExpiringSoon || tokenExpired) {
//         console.log("Token expiring soon or expired, refreshing...");
        
//         try {
//           // Import dynamically to avoid circular dependencies
//           const { refreshToken: refreshTokenAction } = await import("../services/operations/authApi");
//           const result = await store.dispatch(refreshTokenAction(refreshToken));
          
//           if (!result?.payload?.success) {
//             throw new Error(result?.payload?.message || 'Failed to refresh token');
//           }
          
//           console.log("Token refreshed successfully");
//           return true;
//         } catch (error) {
//           console.error("Failed to refresh token:", error);
          
//           // If refresh fails, clear the tokens and force re-authentication
//           if (error.message.includes('No refresh token') || 
//               error.response?.status === 401 || 
//               error.message === 'Failed to refresh token' ||
//               error.message.includes('jwt expired') ||
//               error.message.includes('invalid token')) {
//             console.log("Invalid or expired refresh token, logging out...");
//             const { logout } = await import("../services/operations/authApi");
//             store.dispatch(logout());
//           }
//           throw error; // Re-throw to be caught by the caller
//         }
//       }
      
//       // Token is still valid, no refresh needed
//       return true;
//     } catch (error) {
//       console.error("Error in refreshTokenIfNeeded:", error);
//       throw error; // Re-throw to be caught by the caller
//     } finally {
//       isRefreshing = false;
//       refreshPromise = null;
//     }
//   })();
  
//   return refreshPromise;
// };

// // Get token expiration time
// export const getTokenExpirationTime = (token) => {
//   if (!token) return null;
  
//   try {
//     const decoded = jwtDecode(token);
//     return new Date(decoded.exp * 1000);
//   } catch (error) {
//     console.error("Error decoding token:", error);
//     return null;
//   }
// };

// // Get time until token expires (in minutes)
// export const getTimeUntilExpiry = (token) => {
//   if (!token) return 0;
  
//   try {
//     const decoded = jwtDecode(token);
//     const currentTime = Date.now() / 1000;
//     const timeUntilExpiry = decoded.exp - currentTime;
//     return Math.max(0, Math.floor(timeUntilExpiry / 60)); // Convert to minutes
//   } catch (error) {
//     console.error("Error decoding token:", error);
//     return 0;
//   }
// }; 


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
    
    if (!token || !refreshTokenValue) {
      console.log("No token or refresh token available");
      return false;
    }
    
    if (isTokenExpiringSoon(token) || isTokenExpired(token)) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((success) => {
            resolve(success);
          });
        });
      }
      
      isRefreshing = true;
      
      try {
        console.log("Token expiring soon or expired, refreshing...");
        
        // Use dynamic import to avoid circular dependencies
        const { refreshToken: refreshTokenAction } = await import("../services/operations/authApi");
        const result = await store.dispatch(refreshTokenAction(refreshTokenValue));
        
        if (result?.payload?.success) {
          console.log("Token refreshed successfully");
          onRefreshed(true);
          return true;
        } else {
          throw new Error(result?.payload?.message || 'Failed to refresh token');
        }
      } catch (error) {
        console.error("Failed to refresh token:", error);
        onRefreshed(false);
        
        // Clear tokens and logout on failure
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        
        const { logout } = await import("../services/operations/authApi");
        store.dispatch(logout());
        
        return false;
      } finally {
        isRefreshing = false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error in refreshTokenIfNeeded:", error);
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