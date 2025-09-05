import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { refreshTokenIfNeeded, getTimeUntilExpiry, getTokenExpirationTime } from '../../utils/tokenUtils';
import { toast } from 'react-hot-toast';

const TokenManager = () => {
  const { token } = useSelector((state) => state.auth);
  const intervalRef = useRef(null);
  const warningShownRef = useRef(false);

  useEffect(() => {
    if (!token) {
      // Clear interval if no token
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      warningShownRef.current = false;
      return;
    }

    // Debug: Log token expiration info
    const expirationTime = getTokenExpirationTime(token);
    const timeUntilExpiry = getTimeUntilExpiry(token);
    console.log('🔐 Token Manager:', {
      expiresAt: expirationTime?.toLocaleString(),
      timeUntilExpiry: `${timeUntilExpiry} minutes`,
      isExpiringSoon: timeUntilExpiry <= 30
    });

    // Check token every 5 minutes
    // const checkToken = async () => {
    //   try {
    //     const timeUntilExpiry = getTimeUntilExpiry(token);
        
    //     // Show warning when token expires in 15 minutes
    //     if (timeUntilExpiry <= 15 && timeUntilExpiry > 0 && !warningShownRef.current) {
    //       toast.warning(`Your session will expire in ${timeUntilExpiry} minutes. Please save your work.`);
    //       warningShownRef.current = true;
    //     }
        
    //     // Refresh token if needed
    //     const refreshed = await refreshTokenIfNeeded();
    //     if (refreshed) {
    //       console.log('🔄 Token refreshed successfully');
    //     }
    //   } catch (error) {
    //     console.error('❌ Error in token check:', error);
    //   }
    // };

    // Initial check
    // checkToken();

    // Set up interval for periodic checks
    // intervalRef.current = setInterval(checkToken, 5 * 60 * 1000); // 5 minutes

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [token]);

  // Reset warning flag when token changes
  useEffect(() => {
    warningShownRef.current = false;
  }, [token]);

  // This component doesn't render anything
  return null;
};

export default TokenManager;