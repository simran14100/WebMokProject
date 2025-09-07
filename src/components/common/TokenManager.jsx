import React, { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { refreshTokenIfNeeded, getTimeUntilExpiry } from '../../utils/tokenUtils';
import { toast } from 'react-hot-toast';
import { logout } from '../../store/slices/authSlice';

// Time in milliseconds between token checks
const TOKEN_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

const TokenManager = () => {
  const dispatch = useDispatch();
  const { token, loading } = useSelector((state) => state.auth);
  const intervalRef = useRef(null);
  const warningShownRef = useRef(false);
  const isCheckingRef = useRef(false);

  const checkToken = useCallback(async () => {
    if (isCheckingRef.current || loading) return;
    
    isCheckingRef.current = true;
    
    try {
      const currentToken = token || localStorage.getItem('token');
      
      console.log('🔄 TokenManager check - token exists:', !!currentToken);
      console.log('🔄 TokenManager check - loading state:', loading);
      
      if (!currentToken) {
        console.log('🔄 No token found, resetting warning');
        warningShownRef.current = false;
        return;
      }
  
      const timeUntilExpiry = getTimeUntilExpiry(currentToken);
      console.log('🔄 Time until expiry:', timeUntilExpiry, 'minutes');
      
      // Show warning when token expires in 15 minutes
      if (timeUntilExpiry <= 15 && timeUntilExpiry > 0 && !warningShownRef.current) {
        console.log('🔄 Showing expiry warning');
        toast(`Your session will expire in ${Math.ceil(timeUntilExpiry)} minutes. Please save your work.`, {
          icon: '⚠️',
          duration: 5000,
          position: 'top-right'
        });
        warningShownRef.current = true;
      }
      
      // Try to refresh token if needed
      console.log('🔄 Attempting token refresh if needed...');
      const refreshed = await refreshTokenIfNeeded();
      
      if (refreshed) {
        console.log('✅ Token refreshed successfully from TokenManager');
        warningShownRef.current = false;
      } else {
        console.log('🔄 No refresh needed or refresh failed');
      }
      
      // If token is expired, log out the user
      if (timeUntilExpiry <= 0) {
        console.log('❌ Token expired, logging out...');
        dispatch(logout());
      }
      
    } catch (error) {
      console.error('❌ Error in token check:', error);
    } finally {
      isCheckingRef.current = false;
      console.log('🔄 Token check completed');
    }
  }, [token, loading, dispatch]);

  useEffect(() => {
    // Initial check
    checkToken();
    
    // Set up interval for periodic checks
    intervalRef.current = setInterval(checkToken, TOKEN_CHECK_INTERVAL);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkToken]);

  // Reset warning when token changes
  useEffect(() => {
    warningShownRef.current = false;
  }, [token]);

  return null;
};

export default TokenManager;