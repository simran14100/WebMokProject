// import React, { useEffect, useRef } from 'react';
// import { useSelector } from 'react-redux';
// import { refreshTokenIfNeeded, getTimeUntilExpiry, getTokenExpirationTime } from '../../utils/tokenUtils';
// import { toast } from 'react-hot-toast';

// const TokenManager = () => {
//   const { token } = useSelector((state) => state.auth);
//   const intervalRef = useRef(null);
//   const warningShownRef = useRef(false);

//   useEffect(() => {
//     if (!token) {
//       // Clear interval if no token
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }
//       warningShownRef.current = false;
//       return;
//     }

//     // Debug: Log token expiration info
//     const expirationTime = getTokenExpirationTime(token);
//     const timeUntilExpiry = getTimeUntilExpiry(token);
//     console.log('🔐 Token Manager:', {
//       expiresAt: expirationTime?.toLocaleString(),
//       timeUntilExpiry: `${timeUntilExpiry} minutes`,
//       isExpiringSoon: timeUntilExpiry <= 30
//     });

//     // Check token every 5 minutes
//     const checkToken = async () => {
//       try {
//         const timeUntilExpiry = getTimeUntilExpiry(token);
        
//         // Show warning when token expires in 15 minutes
//         if (timeUntilExpiry <= 15 && timeUntilExpiry > 0 && !warningShownRef.current) {
//           toast.warning(`Your session will expire in ${timeUntilExpiry} minutes. Please save your work.`);
//           warningShownRef.current = true;
//         }
        
//         // Refresh token if needed
//         const refreshed = await refreshTokenIfNeeded();
//         if (refreshed) {
//           console.log('🔄 Token refreshed successfully');
//         }
//       } catch (error) {
//         console.error('❌ Error in token check:', error);
//       }
//     };

//     // Initial check
//     checkToken();

//     // Set up interval for periodic checks
//     intervalRef.current = setInterval(checkToken, 5 * 60 * 1000); // 5 minutes

//     return () => {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }
//     };
//   }, [token]);

//   // Reset warning flag when token changes
//   useEffect(() => {
//     warningShownRef.current = false;
//   }, [token]);

//   // This component doesn't render anything
//   return null;
// };

// export default TokenManager;


import React, { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../services/operations/authApi';
import { getTimeUntilExpiry } from '../../utils/tokenUtils';
import { toast } from 'react-hot-toast';

// Time in milliseconds between token checks
const TOKEN_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

const TokenManager = () => {
  const dispatch = useDispatch();
  const { token, loading } = useSelector((state) => state.auth);
  const intervalRef = useRef(null);
  const warningShownRef = useRef(false);
  const isCheckingRef = useRef(false);

  const checkToken = useCallback(async () => {
    // Prevent multiple simultaneous checks
    if (isCheckingRef.current || loading) return;
    
    isCheckingRef.current = true;
    
    try {
      // Get token from Redux state or localStorage
      const currentToken = token || localStorage.getItem('token');
      
      if (!currentToken) {
        warningShownRef.current = false;
        return;
      }

      const timeUntilExpiry = getTimeUntilExpiry(currentToken);
      
      // Show warning when token expires in 15 minutes
      if (timeUntilExpiry <= 15 && timeUntilExpiry > 0 && !warningShownRef.current) {
        toast.warning(`Your session will expire in ${timeUntilExpiry} minutes. Please save your work.`);
        warningShownRef.current = true;
      }
      
      // If token is expired or about to expire soon, try to refresh it
      if (timeUntilExpiry <= 30) {
        try {
          const response = await fetch(`${process.env.REACT_APP_BASE_URL}/api/v1/auth/refresh-token`, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({ refreshToken: localStorage.getItem('refreshToken') })
          });

          if (!response.ok) throw new Error('Failed to refresh token');
          
          const data = await response.json();
          
          if (data.success && data.accessToken) {
            // Update the token in the store and localStorage
            dispatch({ type: 'auth/setToken', payload: data.accessToken });
            warningShownRef.current = false; // Reset warning after successful refresh
          }
        } catch (error) {
          console.error('❌ Token refresh failed:', error);
          dispatch(logout());
        }
      }
    } catch (error) {
      console.error('❌ Error in token check:', error);
    } finally {
      isCheckingRef.current = false;
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