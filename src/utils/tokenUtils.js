import { jwtDecode } from "jwt-decode";
import { store } from "../store";
import { refreshToken } from "../services/operations/authApi";

// Check if token is expired or will expire soon (within 5 minutes)
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = decoded.exp - currentTime;
    
    // Consider token expired if it expires within 5 minutes
    return timeUntilExpiry < 300; // 5 minutes in seconds
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

// Check if token will expire soon (within 30 minutes)
export const isTokenExpiringSoon = (token) => {
  if (!token) return true;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = decoded.exp - currentTime;
    
    // Consider token expiring soon if it expires within 30 minutes
    return timeUntilExpiry < 1800; // 30 minutes in seconds
  } catch (error) {
    console.error("Error decoding token:", error);
    return true;
  }
};

// Proactively refresh token if it's expiring soon
export const refreshTokenIfNeeded = async () => {
  const state = store.getState();
  const token = state.auth.token;
  
  if (!token) return false;
  
  if (isTokenExpiringSoon(token)) {
    try {
      console.log("Token expiring soon, refreshing...");
      await store.dispatch(refreshToken(token));
      console.log("Token refreshed successfully");
      return true;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      return false;
    }
  }
  
  return true;
};

// Get token expiration time
export const getTokenExpirationTime = (token) => {
  if (!token) return null;
  
  try {
    const decoded = jwtDecode(token);
    return new Date(decoded.exp * 1000);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

// Get time until token expires (in minutes)
export const getTimeUntilExpiry = (token) => {
  if (!token) return 0;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = decoded.exp - currentTime;
    return Math.max(0, Math.floor(timeUntilExpiry / 60)); // Convert to minutes
  } catch (error) {
    console.error("Error decoding token:", error);
    return 0;
  }
}; 