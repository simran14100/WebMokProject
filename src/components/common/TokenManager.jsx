import React, { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { refreshTokenIfNeeded, getTimeUntilExpiry, isTokenExpired } from '../../utils/tokenUtils';
import { toast } from 'react-hot-toast';
import { logout, setToken, setUser } from '../../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

// Time in milliseconds between token checks
const TOKEN_CHECK_INTERVAL = 4 * 60 * 1000; // 4 minutes

const TokenManager = () => {
  const dispatch = useDispatch();
  const { token, loading } = useSelector((state) => state.auth);
  const intervalRef = useRef(null);
  const warningShownRef = useRef(false);
  const isCheckingRef = useRef(false);

  const navigate = useNavigate();

  const checkToken = useCallback(async () => {
    if (isCheckingRef.current || loading) {
      console.log(' Check skipped - isChecking:', isCheckingRef.current, 'loading:', loading);
      return;
    }

    isCheckingRef.current = true;

    try {
      // Always get the latest token from localStorage to handle page refreshes
      const currentToken = localStorage.getItem('token');
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      
      console.log(' TokenManager Debug:');
      console.log('  - Redux token:', !!token);
      console.log('  - localStorage token:', !!currentToken);
      console.log('  - User in localStorage:', !!currentUser);
      console.log('  - Loading state:', loading);
      
      // If no token, ensure we're logged out
      if (!currentToken) {
        console.log(' No token found');
        dispatch(logout());
        warningShownRef.current = false;
        return;
      }
      
      // If token exists but user is not in Redux state, restore it
      if (currentToken && !token) {
        console.log(' Restoring token from localStorage to Redux');
        dispatch(setToken(currentToken));
        if (currentUser) {
          dispatch(setUser(currentUser));
        }
      }
  
      const timeUntilExpiry = getTimeUntilExpiry(currentToken);
      console.log(' Time until expiry:', timeUntilExpiry, 'minutes');
      
      // Show warning when token expires in 15 minutes
      if (timeUntilExpiry <= 15 && timeUntilExpiry > 0 && !warningShownRef.current) {
        console.log(' Showing expiry warning');
        toast(`Your session will expire in ${Math.ceil(timeUntilExpiry)} minutes. Please save your work.`, {
          icon: ' ',
          duration: 5000,
          position: 'top-right'
        });
        warningShownRef.current = true;
      }
      
      // Try to refresh token if needed
      console.log(' Attempting token refresh if needed...');
      const refreshed = await refreshTokenIfNeeded();
      
      if (refreshed) {
        console.log(' Token refreshed successfully from TokenManager');
        warningShownRef.current = false;
      } else {
        console.log(' No refresh needed or refresh failed');
      }
      
      // If token is expired, log out the user
      if (timeUntilExpiry <= 0) {
        console.log(' Token expired, logging out...');
        dispatch(logout());
      }
      
    } catch (error) {
      console.error(' Error in token check:', error);
    } finally {
      isCheckingRef.current = false;
      console.log(' Token check completed');
    }
  }, [token, loading, dispatch]);

  return null;
};

export default TokenManager;