import axios from "axios";
import { showSuccess, showError, showLoading, dismissToast, dismissAllToasts } from "../../utils/toast"
import { setLoading, setToken } from "../../store/slices/authSlice"
import { setUser, updateUser, setLoading as setProfileLoading } from "../../store/slices/profileSlice"
import { apiConnector } from "../apiConnector"
import { auth, profile } from "../apis"
import { store } from "../../store"

const {
  SENDOTP_API,
  SIGNUP_API,
  LOGIN_API,
  RESETPASSTOKEN_API,
  RESETPASSWORD_API,
  REFRESH_TOKEN_API,
  UNIVERSITY_SIGNUP_API,
  UNIVERSITY_LOGIN_API,
  GET_CURRENT_USER_API,
  UPDATE_PROGRAM_API,
  LOGOUT_API
} = auth

// eslint-disable-next-line no-restricted-globals
export function sendOtp(email, navigate) {
  return async (dispatch) => {
    const toastId = showLoading("Loading...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("POST", SENDOTP_API, {
        email,
        checkUserPresent: true,
      })
      console.log("SENDOTP API RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      showSuccess("OTP Sent Successfully")
      // navigate("/verify-email")
    } catch (error) {
      console.log("SENDOTP API ERROR............", error)
      
      // Show specific error message from backend if available
      if (error.response && error.response.data && error.response.data.message) {
        showError(error.response.data.message)
      } else if (error.message) {
        showError(error.message)
      } else {
        showError("Could Not Send OTP")
      }
    }
    dispatch(setLoading(false))
    dismissToast(toastId)
  }
}

// University student signup (UG/PG/PhD)
// eslint-disable-next-line no-restricted-globals
export function universitySignup(userData) {
  return async (dispatch) => {
    let shouldRedirectToLogin = false; // Initialize the variable
    const toastId = showLoading("Creating your account...");
    dispatch(setLoading(true));
    
    try {
      // Get program from userData or URL params
      const searchParams = new URLSearchParams(window.location.search);
      const program = userData.program || searchParams.get('program') || '';
      const redirectTo = searchParams.get('redirect') || '';
      
      // Add program to the user data if it exists
      const signupData = program ? 
        { ...userData, program, ...(redirectTo && { redirectTo }) } : 
        { ...userData, ...(redirectTo && { redirectTo }) };
      
      // Make the signup request with credentials for HTTP-only cookies
      const response = await apiConnector(
        "POST", 
        UNIVERSITY_SIGNUP_API, 
        signupData,
        { 
          withCredentials: true, // Important for cookies
          'X-Skip-Interceptor': 'true' // Skip the interceptor for this request
        }
      );
      
      // If we have a redirect URL in the response, handle it
      if (response.data.redirectTo) {
        // If this is a client-side navigation
        if (userData.navigate) {
          userData.navigate(response.data.redirectTo, { 
            state: { 
              message: response.data.message || 'Please login to continue',
              email: userData.email,
              accountType: userData.accountType
            }
          });
        } else {
          // Fallback to window.location if navigate function is not available
          // eslint-disable-next-line no-restricted-globals
          window.location.href = response.data.redirectTo;
        }
        return response.data;
      }

      // If user is created and logged in successfully, update Redux store
      if (response.data.success && response.data.user) {
        const { user } = response.data;
        
        // Generate avatar if no image is provided
        const userImage = user?.image 
          ? user.image 
          : `https://api.dicebear.com/5.x/initials/svg?seed=${user.firstName} ${user.lastName}`;
        
        const userWithImage = { ...user, image: userImage };
        
        // Update Redux store with user data
        dispatch(setUser(userWithImage));
        showSuccess(response.data.message || "Registration successful!");
        
        // Default redirect URL after login
        let redirectUrl = '/dashboard';
        
        // If there's a redirect URL in the response, use it
        if (response.data.redirectTo) {
          redirectUrl = response.data.redirectTo;
        }
        
        // Navigate to the appropriate page if navigate function is provided
        if (userData.navigate) {
          userData.navigate(redirectUrl);
        }
        
        // Return success with user data
        return { 
          success: true, 
          user: userWithImage,
          data: response.data,
          redirectTo: redirectUrl
        };
      }
      
      // Handle case where user is created but not logged in
      if (response.data.success) {
        showSuccess(response.data.message || "Registration successful! Please login.");
        
        // Build login URL with email parameter
        const loginUrl = new URL('/login', window.location.origin);
        if (userData.email) loginUrl.searchParams.set('email', userData.email);
        if (redirectTo) loginUrl.searchParams.set('redirect', redirectTo);
        
        // Navigate to login with success message if navigate function is provided
        if (userData.navigate) {
          userData.navigate(loginUrl.pathname + loginUrl.search, { 
            state: { 
              message: 'Registration successful! Please login to continue.',
              email: userData.email,
              program: program || undefined
            } 
          });
        } else {
          // Fallback to window.location if navigate function is not available
          // eslint-disable-next-line no-restricted-globals
          window.location.href = loginUrl.toString();
        }
      }

      return response.data;
      
    } catch (error) {
      console.error("UNIVERSITY SIGNUP ERROR:", error);
      
      // Log the full error response for debugging
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      
      // Handle validation errors
      let errorMessage = "Registration failed. Please check your information and try again.";
      
      if (error.response?.data?.errors) {
        // Handle validation errors from the server
        errorMessage = Object.values(error.response.data.errors)
          .map(err => typeof err === 'object' ? err.msg || err.message || JSON.stringify(err) : err)
          .filter(Boolean) // Remove any falsy values
          .join('\n') || errorMessage;
      } else if (error.response?.data?.message) {
        // Use server-provided error message if available
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Check if user is already registered
      if (errorMessage.toLowerCase().includes('already registered') || 
          errorMessage.toLowerCase().includes('user already exists')) {
        console.log("User already registered, redirecting to login...");
        
        // Show error message and redirect
        showError("You are already registered. Please login to continue.");
        shouldRedirectToLogin = true;
      } else {
        // For other errors, show the error message
        showError(errorMessage);
      }
      
      // Handle redirection if needed
      if (shouldRedirectToLogin && userData) {
        // Build login URL with email and program parameters
        const loginUrl = new URL('/university/login', window.location.origin);
        if (userData.email) loginUrl.searchParams.set('email', userData.email);
        if (userData.program) loginUrl.searchParams.set('program', userData.program);
        
        // Add redirect parameter if available
        const searchParams = new URLSearchParams(window.location.search);
        const redirectTo = searchParams.get('redirect');
        if (redirectTo) loginUrl.searchParams.set('redirect', redirectTo);
        
        // Use a small timeout to ensure the error message is shown before redirecting
        setTimeout(() => {
          if (userData.navigate) {
            userData.navigate(loginUrl.pathname + loginUrl.search, { 
              state: { 
                email: userData.email,
                program: userData.program
              }
            });
          } else {
            // Fallback to window.location if navigate function is not available
            // eslint-disable-next-line no-restricted-globals
            window.location.href = loginUrl.toString();
          }
        }, 1000);
      }
      
      // Return error for the component to handle
      return { 
        success: false, 
        message: errorMessage,
        error: errorMessage,
        data: error.response?.data,
        shouldLogin: shouldRedirectToLogin
      };
      
    } finally {
      dispatch(setLoading(false));
      dismissToast(toastId);
    }
  };
}

export function signUp(
  accountType,
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
  otp,
  additionalData = {},
  navigate = () => {}
) {
  return async (dispatch) => {
    const toastId = showLoading("Creating your account...");
    dispatch(setLoading(true));
    
    try {
      // Prepare the signup data
      const signupData = {
        accountType,
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        otp,
        ...additionalData // Include any additional data
      };

      // Make the signup request with credentials for HTTP-only cookies
      const response = await apiConnector(
        "POST", 
        SIGNUP_API, 
        signupData,
        { 
          withCredentials: true, // Important for cookies
          'X-Skip-Interceptor': 'true' // Skip the interceptor for this request
        }
      );

      console.log("SIGNUP API RESPONSE:", response);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Signup failed');
      }

      // If user is created and logged in successfully, update Redux store
      if (response.data.user) {
        const { user } = response.data;
        
        // Generate avatar if no image is provided
        const userImage = user?.image 
          ? user.image 
          : `https://api.dicebear.com/5.x/initials/svg?seed=${user.firstName} ${user.lastName}`;
        
        const userWithImage = { ...user, image: userImage };
        
        // Update Redux store with user data
        dispatch(setUser(userWithImage));
        showSuccess(response.data.message || "Registration successful!");
        
        // Navigate to the appropriate page
        const redirectTo = response.data.redirectTo || "/dashboard/my-profile";
        navigate(redirectTo);
        
        return { 
          success: true, 
          user: userWithImage,
          data: response.data,
          redirectTo
        };
      }
      
      // Handle case where user is created but not logged in
      if (response.data.success) {
        showSuccess(response.data.message || "Registration successful! Please login.");
        
        // Navigate to login with success message
        navigate("/login", { 
          state: { 
            message: 'Registration successful! Please login to continue.',
            email: email
          } 
        });
        
        return { 
          success: true, 
          message: 'Registration successful! Please login.',
          data: response.data
        };
      }
      
      return response.data;
      
    } catch (error) {
      console.error("SIGNUP ERROR:", error);
      
      // Handle validation errors
      let errorMessage = "Registration failed. Please check your information and try again.";
      
      if (error.response?.data?.errors) {
        // Handle validation errors from the server
        errorMessage = Object.values(error.response.data.errors)
          .map(err => typeof err === 'object' ? err.msg || err.message || JSON.stringify(err) : err)
          .filter(Boolean) // Remove any falsy values
          .join('\n') || errorMessage;
      } else if (error.response?.data?.message) {
        // Use server-provided error message if available
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Check if user is already registered
      if (errorMessage.toLowerCase().includes('already registered') || 
          errorMessage.toLowerCase().includes('user already exists')) {
        showError("You are already registered. Please login to continue.");
        
        // Navigate to login with email pre-filled
        setTimeout(() => {
          navigate("/login", { 
            state: { 
              email: email,
              message: 'You are already registered. Please login to continue.'
            } 
          });
        }, 1000);
        
        return { 
          success: false, 
          message: 'User already registered',
          shouldLogin: true
        };
      }
      
      // For other errors, show the error message
      showError(errorMessage);
      
      // Return error for the component to handle
      return { 
        success: false, 
        message: errorMessage,
        error: errorMessage,
        data: error.response?.data
      };
      
    } finally {
      dispatch(setLoading(false));
      dismissToast(toastId);
    }
  };
}

// eslint-disable-next-line no-restricted-globals
export function login(email, password, navigate) {
  return async (dispatch) => {
    const toastId = showLoading("Signing in...");
    dispatch(setLoading(true));
    
    try {
      // Create a minimal axios instance with no extra configuration
      const response = await axios({
        method: 'post',
        url: `${process.env.REACT_APP_BASE_URL || 'http://localhost:4000'}/api/v1/auth/login`,
        data: { email, password },
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        // Ensure we don't send any extra headers
        transformRequest: [(data, headers) => {
          // Safely remove any problematic headers
          if (headers && headers.common) {
            delete headers.common['X-Requested-With'];
            delete headers.common['Access-Control-Allow-Origin'];
            delete headers.common['Access-Control-Allow-Methods'];
            delete headers.common['Access-Control-Allow-Headers'];
          }
          return JSON.stringify(data);
        }]
      });
      
      // If we get here, login was successful
      const { user, token } = response.data;
      
      // Store the token in both Redux store and localStorage as fallback
      dispatch(setToken(token));
      localStorage.setItem('token', token);
      dispatch(setUser(user));
      
      // Show success message
      showSuccess('Login successful!');
      
      // Handle navigation based on user type
      if (user.accountType === 'Student') {
        navigate('/dashboard/my-profile');
      } else if (user.accountType === 'Instructor') {
        navigate('/instructor/dashboard/my-profile');
      } else if (user.accountType === 'Admin' || user.accountType === 'Super Admin') {
        navigate('/dashboard/my-profile');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // Handle CORS specific errors
      if (error.message && error.message.includes('CORS') || 
          (error.response && error.response.status === 0)) {
        console.error("CORS error detected. Please check backend CORS configuration.");
        showError("CORS error: Please ensure the backend is properly configured to accept requests from this origin.");
        return dispatch({ type: 'auth/setError', payload: "CORS configuration error. Please contact support." });
      }
      
      // Handle network errors
      if (error.message === 'Network Error' || !navigator.onLine) {
        showError("Network error. Please check your internet connection and try again.");
        return dispatch({ type: 'auth/setError', payload: "Network error. Please check your connection and try again." });
      }
      
      // Handle server errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Server error:", error.response.data);
        const errorMessage = error.response.data?.message || 
                           error.response.data?.error || 
                           `Server error: ${error.response.status}`;
        showError(errorMessage);
        return dispatch({ type: 'auth/setError', payload: errorMessage });
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        showError("No response from server. The server might be down or there might be a network issue.");
        return dispatch({ type: 'auth/setError', payload: "No response from server. Please try again later." });
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request setup error:', error.message);
        const errorMessage = error.message || "An unexpected error occurred during login";
        showError(errorMessage);
        return dispatch({ type: 'auth/setError', payload: errorMessage });
      }
    } finally {
      dispatch(setLoading(false));
      dismissToast(toastId);
    }
  };
}

export function getPasswordResetToken(email, setEmailSent) {
  return async (dispatch) => {
    const toastId = showLoading('Sending password reset email...');
    dispatch(setLoading(true));
    
    try {
      const response = await apiConnector(
        'POST', 
        RESETPASSTOKEN_API, 
        { email },
        { 
          withCredentials: true,
          'X-Skip-Interceptor': 'true' // Skip the interceptor for this request
        }
      );
      
      console.log('PASSWORD RESET TOKEN RESPONSE:', response);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to send password reset email');
      }
      
      showSuccess('Password reset email sent. Please check your inbox.');
      
      // Update UI state if setEmailSent function is provided
      if (typeof setEmailSent === 'function') {
        setEmailSent(true);
      }
      
      return { success: true, data: response.data };
      
    } catch (error) {
      console.error('PASSWORD RESET TOKEN ERROR:', error);
      
      // Handle different types of errors
      let errorMessage = 'Failed to send password reset email';
      
      if (error.response?.data?.errors) {
        // Handle validation errors
        errorMessage = Object.values(error.response.data.errors)
          .map(err => typeof err === 'object' ? err.msg || err.message || JSON.stringify(err) : err)
          .join('\n') || errorMessage;
      } else if (error.response?.data?.message) {
        // Use server-provided error message if available
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showError(errorMessage);
      
      return { 
        success: false, 
        message: errorMessage,
        error: errorMessage,
        data: error.response?.data
      };
      
    } finally {
      dispatch(setLoading(false));
      dismissToast(toastId);
    }
  };
}

export function resetPassword(password, confirmPassword, token, navigate = () => {}) {
  return async (dispatch) => {
    const toastId = showLoading('Resetting your password...');
    dispatch(setLoading(true));
    
    try {
      const response = await apiConnector(
        'POST',
        RESETPASSWORD_API,
        { password, confirmPassword, token },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.success) {
        showSuccess('Your password has been reset successfully');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
        return { success: true };
      }
    } catch (error) {
      let errorMessage = 'Failed to reset password. Please try again.';
      
      if (error.response?.data?.message) {
        // Use server-provided error message if available
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Handle expired or invalid token
      if (errorMessage.toLowerCase().includes('invalid') || 
          errorMessage.toLowerCase().includes('expired') ||
          errorMessage.toLowerCase().includes('not found')) {
        showError('This password reset link is invalid or has expired. Please request a new one.');
        
        // Redirect to forgot password page
        setTimeout(() => {
          navigate('/forgot-password');
        }, 1500);
        
        return { 
          success: false, 
          message: 'Invalid or expired token',
          shouldRequestNewLink: true
        };
      } else {
        showError(errorMessage);
        return { 
          success: false, 
          message: errorMessage
        };
      }
    } finally {
      dispatch(setLoading(false));
      dismissToast(toastId);
    }
  };
}

// University Login
// eslint-disable-next-line no-restricted-globals
export const universityLogin = (email, password, navigate = null) => {
  return async (dispatch) => {
    const toastId = showLoading("Logging in...");
    dispatch(setLoading(true));
    
    try {
      // Get program from URL params
      const searchParams = new URLSearchParams(window.location.search);
      const program = searchParams.get('program') || '';
      
      // Make login request with program in the body
      // The server will set an HTTP-only cookie with the auth token
      const response = await apiConnector(
        "POST", 
        UNIVERSITY_LOGIN_API, 
        {
          email,
          password,
          ...(program && { program }) // Only include program if it exists
        },
        { 
          withCredentials: true, // Important for cookies
          'X-Skip-Interceptor': 'true', // Skip the interceptor for this request
          timeout: 10000 // 10 second timeout
        }
      ).catch(error => {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timed out. Please try again.');
        } else if (!error.response) {
          // Network error
          throw new Error('Unable to connect to server. Please check your internet connection.');
        } else if (error.response.status === 404) {
          throw new Error('No account found with this email. Please sign up first.');
        } else if (error.response.status === 401) {
          throw new Error('Incorrect email or password. Please try again.');
        }
        throw error; // Re-throw to be caught in the outer catch
      });
      
      if (!response.data.success) {
        // Handle specific error cases
        const errorMessage = response.data.message || 'Login failed';
        if (errorMessage.toLowerCase().includes('user not found') || 
            errorMessage.toLowerCase().includes('not registered')) {
          throw new Error('No university account found with this email. Please sign up first.');
        } else if (errorMessage.toLowerCase().includes('password')) {
          throw new Error('Incorrect password. Please try again.');
        }
        throw new Error(errorMessage);
      }
      
      // Update Redux store with user data (token is in HTTP-only cookie)
      const { user } = response.data;
      
      // Generate avatar if no image is provided
      const userImage = user?.image 
        ? user.image 
        : `https://api.dicebear.com/5.x/initials/svg?seed=${user.firstName} ${user.lastName}`;
      
      // Update Redux store with user data including the generated image
      dispatch(setUser({ ...user, image: userImage }));
      
      showSuccess("Login successful!");
      
      // Handle redirect if navigate function is provided
      if (navigate) {
        // Use the redirect URL from the response or fall back to dashboard
        const redirectTo = response.data.redirectTo || '/dashboard';
        
        navigate(redirectTo);
      }
      
      return { 
        success: true, 
        data: response.data,
        user: { ...user, image: userImage } // Include user with image in the response
      };
      
    } catch (error) {
      console.error("UNIVERSITY LOGIN ERROR:", error);
      
      let errorMessage = "Login failed";
      let shouldRedirectToSignup = false;
      
      if (error.response?.data) {
        errorMessage = error.response.data.message || errorMessage;
        shouldRedirectToSignup = error.response.data.code === 'USER_NOT_FOUND';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showError(errorMessage);
      
      // If user not found and we have a navigate function, redirect to signup
      if (shouldRedirectToSignup && navigate) {
        const searchParams = new URLSearchParams(window.location.search);
        const redirectTo = searchParams.get('redirect') || window.location.pathname + window.location.search;
        
        // Build the signup URL with redirect parameter
        const signupUrl = new URL('/signup', window.location.origin);
        if (redirectTo) signupUrl.searchParams.set('redirect', redirectTo);
        
        navigate(signupUrl.pathname + signupUrl.search);
      }
      
      return { 
        success: false, 
        message: errorMessage,
        shouldRedirectToSignup 
      };
      
    } finally {
      dispatch(setLoading(false));
      dismissToast(toastId);
    }
  };
};

// Get current user data
export const getCurrentUser = () => {
  return async (dispatch, getState) => {
    console.log('getCurrentUser called');
    const toastId = showLoading("Loading your profile...");
    dispatch(setLoading(true));
    
    try {
      console.log('Making API call to get current user...');
      // The token is automatically sent via HTTP-only cookie
      const response = await apiConnector(
        "GET", 
        GET_CURRENT_USER_API, 
        null, 
        { 
          withCredentials: true, // Important for cookies
          'X-Skip-Interceptor': 'true', // Skip the interceptor for this request
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      );
      
      console.log('Current user API response:', response);
      
      if (!response.data.success) {
        const errorMsg = response.data.message || 'Failed to fetch user data';
        console.error('API Error:', errorMsg);
        throw new Error(errorMsg);
      }
      
      const user = response.data.user;
      
      if (!user) {
        const errorMsg = 'No user data received from server';
        console.warn(errorMsg);
        throw new Error(errorMsg);
      }
      
      // Generate avatar if no image is provided
      const userImage = user?.image || `https://api.dicebear.com/5.x/initials/svg?seed=${user.firstName || ''} ${user.lastName || ''}`.trim();
      
      const userWithImage = { 
        ...user, 
        image: userImage,
        // Ensure we have all required user properties with defaults
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        role: (user.role || 'STUDENT').toUpperCase(), // Ensure role is uppercase for consistency
        accountStatus: user.accountStatus || 'ACTIVE',
        // Add accountType if not present
        accountType: user.accountType || (user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase() : 'Student')
      };
      
      console.log('Processed user data:', userWithImage);
      
      // Update Redux store with user data
      dispatch(setUser(userWithImage));
      
      // Also update profile slice if needed
      dispatch(updateUser(userWithImage));
      
      console.log('User data updated in Redux store');
      
      // Show success message if this wasn't a silent check
      const isSilentCheck = getState()?.auth?.isSilentCheck;
      if (!isSilentCheck) {
        showSuccess("Welcome back!");
      }
      
      return { 
        success: true, 
        user: userWithImage,
        data: response.data
      };
      
    } catch (error) {
      console.error("GET CURRENT USER ERROR:", error);
      
      // Extract error message
      let errorMessage = "Failed to load user data";
      let shouldLogout = false;
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Handle different error cases
      const isUnauthorized = error.response?.status === 401 || 
                           error.message?.includes('Unauthorized') ||
                           error.message?.includes('No token provided') ||
                           error.message?.includes('jwt expired');
      
      if (isUnauthorized) {
        // Don't show error toast for unauthorized users (common case)
        if (error.response?.status !== 401) {
          console.log("Authentication required, redirecting to login...");
        }
        shouldLogout = true;
      } else if (error.response?.status === 403) {
        errorMessage = "You don't have permission to access this resource";
        shouldLogout = true;
      } else if (error.response?.status >= 500) {
        errorMessage = "Server error. Please try again later.";
      }
      
      // Show error message if this wasn't a silent check
      const isSilentCheck = getState()?.auth?.isSilentCheck;
      if (!isSilentCheck) {
        showError(errorMessage);
      }
      
      // Logout if needed
      if (shouldLogout) {
        // Use a small timeout to ensure the error is shown before redirecting
        setTimeout(() => {
          dispatch(logout());
        }, 100);
      }
      
      return { 
        success: false, 
        message: errorMessage,
        error: errorMessage,
        shouldLogout,
        status: error.response?.status
      };
      
    } finally {
      dismissToast(toastId);
      dispatch(setLoading(false));
    }
  };
};

// Track if logout is already in progress to prevent duplicate toasts
let isLoggingOut = false;
let logoutToastShown = false;

// eslint-disable-next-line no-restricted-globals
export const updateUserProgram = (programType, token = null) => async (dispatch, getState) => {
  const toastId = showLoading("Updating program...");
  try {
    console.log('Starting program update for:', programType);
    
    // Validate program type
    const validProgramTypes = ['UG', 'PG', 'PhD'];
    if (!validProgramTypes.includes(programType)) {
      const error = new Error(`Invalid program type: ${programType}. Must be one of: ${validProgramTypes.join(', ')}`);
      error.name = 'ValidationError';
      throw error;
    }
    
    // Get current state and token if not provided
    const state = getState ? getState() : store.getState();
    const authToken = token || state.auth?.token;
    
    if (!authToken) {
      // If we're in a component that can redirect, return an error
      if (typeof window === 'undefined') {
        throw new Error('No authentication token found');
      }
      // Otherwise redirect to login
      const currentPath = window.location.pathname + window.location.search;
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      return { success: false, message: 'Please log in to continue' };
    }
    
    // Get the current user data
    const currentUser = state.profile?.user || state.auth?.user;
    if (!currentUser) {
      throw new Error('User data not found. Please log in again.');
    }

    // Make the API request to update program type
    const response = await apiConnector(
      'PUT',
      UPDATE_PROGRAM_API,
      { 
        programType,
        accountType: 'Student' // Ensure account type is set to Student
      },
      {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
        'X-Skip-Interceptor': 'true'
      }
    );
    
    if (!response || !response.data) {
      throw new Error('No valid response received from server');
    }
    
    console.log('Update program response:', {
      success: response.data.success,
      message: response.data.message,
      user: response.data.user ? 'User data received' : 'No user data in response'
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update program');
    }
    
    // Update user data in Redux store
    const updatedUser = {
      ...currentUser, // Preserve existing user data
      ...(response.data.user || {}), // Apply any updates from the server
      programType: programType,
      accountType: 'Student', // Ensure account type is set to Student
      enrollmentStatus: response.data.user?.enrollmentStatus || currentUser.enrollmentStatus || 'Pending'
    };
    
    // Update both auth and profile slices
    dispatch(setUser(updatedUser));
    dispatch(updateUser(updatedUser));
    
    // Show success message
    showSuccess('Program updated successfully');
    
    return {
      success: true,
      user: updatedUser,
      message: response.data.message || 'Program updated successfully'
    };
    
  } catch (error) {
    console.error("UPDATE PROGRAM API ERROR", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    
    let errorMessage = 'Failed to update program';
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorMessage = error.response.data?.message || errorMessage;
      
      // Handle specific HTTP status codes
      if (error.response.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
        // Clear user data and redirect to login
        dispatch(logout());
      } else if (error.response.status === 403) {
        errorMessage = 'You do not have permission to update this program';
      } else if (error.response.status === 404) {
        errorMessage = 'User not found. Please log in again.';
      } else if (error.response.status === 400) {
        errorMessage = error.response.data?.message || 'Invalid request. Please check your input.';
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No response from server. Please check your internet connection.';
    } else if (error.name === 'ValidationError') {
      // Custom validation error from our code
      errorMessage = error.message;
    } else {
      // Something happened in setting up the request that triggered an Error
      errorMessage = error.message || errorMessage;
    }
    
    // Show error message to user
    showError(errorMessage);
    
    return {
      success: false,
      error: errorMessage,
      status: error.response?.status
    };
  } finally {
    dismissToast(toastId);
  }
};

// Logout function
export const logout = (navigate = null) => async (dispatch) => {
  // Prevent multiple simultaneous logout attempts
  if (isLoggingOut) {
    console.log('Logout already in progress');
    return { success: false, message: 'Logout already in progress' };
  }
  
  console.log("Starting logout process...");
  isLoggingOut = true;
  
  const toastId = showLoading("Logging out...");
  let logoutSuccessful = false;
  
  try {
    // Get the current path to redirect back after login if needed
    const currentPath = window.location.pathname + window.location.search;
    const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password']
      .some(path => currentPath.includes(path));
    
    // Only call the server logout endpoint if we have a valid session
    const hasActiveSession = document.cookie.includes('token=') || 
                           localStorage.getItem('token') || 
                           sessionStorage.getItem('token');
    
    if (hasActiveSession) {
      try {
        // Call the server to clear the HTTP-only cookies
        await apiConnector(
          'POST', 
          LOGOUT_API, 
          {},
          { 
            withCredentials: true, // Important for cookies
            'X-Skip-Interceptor': 'true', // Skip the interceptor for this request
            'skipauth': 'true' // Skip auth header for logout
          }
        );
        
        logoutSuccessful = true;
      } catch (error) {
        console.error("LOGOUT ERROR:", error);
        
        // Special handling for network errors or server unavailability
        if (!error.response) {
          showError("Network error during logout. Your local session has been cleared.");
        } else if (error.response?.status !== 401) { // Don't show error for 401 (already logged out)
          const errorMessage = error.response?.data?.message || 'Error during server logout';
          showError(`${errorMessage}. Local session cleared.`);
        }
        
        // Even if server logout fails, we'll continue with client-side cleanup
        logoutSuccessful = true;
      }
    } else {
      // No active session found, just proceed with client-side cleanup
      logoutSuccessful = true;
    }
    
    // Clear Redux state
    dispatch(setToken(null));
    dispatch(setUser(null));
    dispatch(setLoading(false));
    dispatch(setProfileLoading(false));
    
    // Clear any cached data in localStorage and sessionStorage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear all auth-related cookies
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Match all auth-related cookies
      if (cookie.startsWith('token=') || 
          cookie.startsWith('refreshToken=') ||
          cookie.startsWith('session=') ||
          cookie.startsWith('auth_')) {
        const eqPos = cookie.indexOf('=');
        const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
        document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Domain=${window.location.hostname}; SameSite=Lax`;
      }
    }
    
    // Show success message if not already showing
    if (!logoutToastShown) {
      showSuccess("You have been logged out successfully");
      logoutToastShown = true;
    }
    
    // Determine where to navigate after logout
    let redirectPath = '/login';
    
    // If we're not already on an auth page, store the current path for post-login redirect
    if (!isAuthPage && currentPath && !currentPath.includes('logout')) {
      const loginUrl = new URL('/login', window.location.origin);
      loginUrl.searchParams.set('redirect', currentPath);
      redirectPath = loginUrl.pathname + loginUrl.search;
    }
    
    // Use the navigate function if provided, otherwise use window.location
    if (typeof navigate === 'function') {
      navigate(redirectPath, { replace: true });
    } else {
      // eslint-disable-next-line no-restricted-globals
      window.location.href = redirectPath;
    }
    
    return { success: logoutSuccessful };
    
  } catch (error) {
    console.error("UNEXPECTED ERROR DURING LOGOUT:", error);
    showError("An unexpected error occurred during logout");
    return { 
      success: false, 
      message: 'An unexpected error occurred during logout',
      error: error.message 
    };
    
  } finally {
    // Clear any remaining toasts after a short delay
    setTimeout(() => {
      dismissAllToasts();
      dismissToast(toastId);
      
      // Reset logout state
      isLoggingOut = false;
      logoutToastShown = false;
    }, 1500);
  }
};

// Update user's profile picture or avatar
export function updateDisplayPicture(formData) {
  return async (dispatch, getState) => {
    // Validate input
    if (!formData || !(formData instanceof FormData)) {
      showError('Invalid image data provided');
      return { success: false, message: 'Invalid image data' };
    }
    
    const toastId = showLoading("Uploading your profile picture...");
    dispatch(setLoading(true));
    
    try {
      // Get current user data for fallback
      const currentUser = getState()?.auth?.user;
      
      // Call the API to update the display picture
      const response = await apiConnector(
        "PUT",
        profile.UPDATE_DISPLAY_PICTURE_API,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true, // Important for cookies
          'X-Skip-Interceptor': 'true' // Skip the interceptor for this request
        }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update profile picture');
      }
      
      // Get the updated user data from the response
      const updatedUser = response.data.user || response.data.updatedUserDetails || {};
      
      // Merge with current user data to ensure we don't lose any fields
      const mergedUser = {
        ...currentUser,
        ...updatedUser,
        image: updatedUser.image || currentUser?.image
      };
      
      // Update user in Redux with the new image
      dispatch(setUser(mergedUser));
      
      // Show success message
      showSuccess("Profile picture updated successfully");
      
      return { 
        success: true, 
        user: mergedUser,
        message: 'Profile picture updated successfully'
      };
      
    } catch (error) {
      console.error("UPDATE DISPLAY PICTURE ERROR:", error);
      
      // Extract and format error message
      let errorMessage = 'Failed to update profile picture';
      let shouldLogout = false;
      
      if (error.response) {
        // Handle different HTTP status codes
        if (error.response.status === 400) {
          errorMessage = 'Invalid image file. Please try a different image.';
        } else if (error.response.status === 401) {
          errorMessage = 'Your session has expired. Please log in again.';
          shouldLogout = true;
        } else if (error.response.status === 413) {
          errorMessage = 'Image file is too large. Please use an image smaller than 2MB.';
        } else if (error.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = error.response.data?.message || error.message || 'Failed to update profile picture';
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your internet connection.';
      } else {
        errorMessage = error.message || 'Failed to update profile picture';
      }
      
      // Show error to user
      showError(errorMessage);
      
      // Logout if session is invalid
      if (shouldLogout) {
        setTimeout(() => {
          dispatch(logout());
        }, 2000);
      }
      
      return { 
        success: false, 
        message: errorMessage,
        error: error,
        shouldLogout
      };
      
    } finally {
      dispatch(setLoading(false));
      dismissToast(toastId);
    }
  };
}


export const refreshToken = (refreshTokenValue = null) => {
  return async (dispatch) => {
    try {
      const token = refreshTokenValue || localStorage.getItem('refreshToken');
      
      if (!token) {
        console.error('No refresh token available in localStorage');
        throw new Error('No refresh token available');
      }

      console.log('Attempting to refresh token...');
      
      const response = await apiConnector(
        'POST',
        REFRESH_TOKEN_API,
        { refreshToken: token },
        {
          skipAuth: true,
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          withCredentials: true
        }
      );

      console.log('Refresh token response:', response?.data);
      
      const { accessToken, refreshToken: newRefreshToken, user } = response?.data || {};
      
      if (!accessToken) {
        throw new Error('No access token received in response');
      }
      
      // Update Redux state with new token
      dispatch(setToken(accessToken));
      
      // Update user data in Redux if available
      if (user) {
        dispatch(setUser(user));
      }
      
      // Update localStorage
      localStorage.setItem('token', accessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
        console.log('New refresh token stored');
      }
      
      console.log('Token refresh successful');
      
      return {
        success: true,
        accessToken,
        refreshToken: newRefreshToken,
        user
      };
      
    } catch (error) {
      console.error('Refresh token error:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      
      // Clear stored tokens on failure
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      dispatch(setToken(null));
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to refresh token'
      };
    }
  };
};

// export const refreshToken = (token = null) => {
//   return async (dispatch) => {
//     try {
//       dispatch(setLoading(true));
      
//       const refreshTokenValue = token || localStorage.getItem('refreshToken');
      
//       if (!refreshTokenValue) {
//         throw new Error('No refresh token available');
//       }
      
//       const response = await apiConnector(
//         'POST',
//         REFRESH_TOKEN_API,
//         { refreshToken: refreshTokenValue },
//         {
//           skipAuth: true,
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           withCredentials: true
//         }
//       );

//       const { accessToken, refreshToken: newRefreshToken, user } = response?.data || {};
      
//       if (!accessToken) {
//         throw new Error('No access token received');
//       }
      
//       // Update both Redux state and localStorage
//       dispatch(setToken(accessToken));
//       if (user) {
//         dispatch(setUser(user));
//       }
      
//       localStorage.setItem('token', accessToken);
//       if (newRefreshToken) {
//         localStorage.setItem('refreshToken', newRefreshToken);
//       }
      
//       return {
//         success: true,
//         accessToken,
//         refreshToken: newRefreshToken,
//         payload: { 
//           success: true,
//           accessToken,
//           refreshToken: newRefreshToken,
//           user
//         }
//       };
      
//     } catch (error) {
//       const errorMessage = error.response?.data?.message || error.message || 'Failed to refresh token';
      
//       // Clear tokens on error
//       localStorage.removeItem('token');
//       localStorage.removeItem('refreshToken');
//       dispatch(setToken(null));
//       dispatch(setUser(null));
      
//       return {
//         success: false,
//         message: errorMessage,
//         payload: { 
//           success: false, 
//           message: errorMessage
//         }
//       };
//     } finally {
//       dispatch(setLoading(false));
//     }
//   };
// };