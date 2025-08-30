import { showSuccess, showError, showLoading, dismissToast, dismissAllToasts } from "../../utils/toast"
import axios from "axios";
import { setLoading, setToken } from "../../store/slices/authSlice"
import { setUser, setLoading as setProfileLoading } from "../../store/slices/profileSlice"
import { apiConnector } from "../apiConnector"
import { auth, profile } from "../apis"
import { debugLocalStorage } from "../../utils/localStorage"
import store from "../../store"

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
  UPDATE_PROGRAM_API
} = auth

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
export function universitySignup(userData) {
  return async (dispatch) => {
    const toastId = showLoading("Processing your request...");
    dispatch(setLoading(true));
    try {
      const response = await apiConnector("POST", UNIVERSITY_SIGNUP_API, userData);
      
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
          window.location.href = response.data.redirectTo;
        }
        return response.data;
      }

      // If no redirect but successful, show success message
      if (response.data.success) {
        showSuccess(response.data.message || "Registration successful!");
        
        // Navigate to login with success message if navigate function is provided
        if (userData.navigate) {
          userData.navigate('/login', { 
            state: { 
              message: 'Registration successful! Please login to continue.',
              email: userData.email,
              accountType: userData.accountType
            } 
          });
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
      
      // Check if user is already registered
      const errorMessage = error.response?.data?.message || error.message || "Registration failed. Please try again.";
      
      console.log("Error message:", errorMessage);
      
      if (errorMessage.toLowerCase().includes('already registered') || 
          errorMessage.toLowerCase().includes('user already exists')) {
        console.log("User already registered, redirecting to login...");
        
        // Show error message and redirect
        showError("You are already registered. Please login to continue.");
        
        // Use a small timeout to ensure the error message is shown before redirecting
        setTimeout(() => {
          if (userData.email) {
            const loginUrl = `/university/login?email=${encodeURIComponent(userData.email)}`;
            console.log("Redirecting to:", loginUrl);
            window.location.href = loginUrl;
          } else {
            window.location.href = '/university/login';
          }
        }, 1000);
        
        return { success: false, message: 'User already registered' };
      }
      
      // For other errors, show the error message
      showError(errorMessage);
      throw error;
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
  navigate
) {
  return async (dispatch) => {
    const toastId = showLoading("Loading...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("POST", SIGNUP_API, {
        accountType,
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        otp,
      })

      console.log("SIGNUP API RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }
      showSuccess("Signup Successful")
      navigate("/login")
    } catch (error) {
      console.log("SIGNUP API ERROR............", error)
      
      // Show specific error message from backend if available
      if (error.response && error.response.data && error.response.data.message) {
        showError(error.response.data.message)
      } else if (error.message) {
        showError(error.message)
      } else {
        showError("Signup Failed")
      }
      navigate("/signup")
    }
    dispatch(setLoading(false))
    dismissToast(toastId)
  }
}

export function login(email, password, navigate = () => {}) {
  return async (dispatch) => {
    const toastId = showLoading("Loading...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("POST", LOGIN_API, {
        email,
        password,
      });
      console.log("LOGIN API RESPONSE............", response);
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
     
      showSuccess("Login Successful")
      
      dispatch(setToken(response.data.token))
      console.log("SETTING USER PROPERTY............", response.data.user);
      const userImage = response?.data?.user?.image
        ? response.data.user.image
        : `https://api.dicebear.com/5.x/initials/svg?seed=${response.data.user.firstName} ${response.data.user.lastName}`
      const userWithImage = { ...response.data.user, image: userImage }
      dispatch(setUser(userWithImage))
      
      console.log("Login successful - Redux state updated");
      console.log("Token:", response.data.token);
      console.log("User:", userWithImage);
      navigate("/dashboard/my-profile")
    } catch (error) {
      console.log("LOGIN API ERROR............", error);
      
      // Show specific error message from backend if available
      if (error.response && error.response.data && error.response.data.message) {
        showError(error.response.data.message)
      } else if (error.message) {
        showError(error.message)
      } else {
        showError("Login Failed");
      }
    }
    dispatch(setLoading(false))
    dismissToast(toastId)
  };
}

export function getPasswordResetToken(email, setEmailSent) {
  return async (dispatch) => {
    const toastId = showLoading("Loading...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("POST", RESETPASSTOKEN_API, {
        email,
      })

      console.log("RESETPASSTOKEN RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      showSuccess("Reset Email Sent")
      setEmailSent(true)
    } catch (error) {
      console.log("RESETPASSTOKEN ERROR............", error)
      showError("Failed To Send Reset Email")
    }
    dismissToast(toastId)
    dispatch(setLoading(false))
  }
}

export function resetPassword(password, confirmPassword, token, navigate = () => {}) {
  return async (dispatch) => {
    const toastId = showLoading("Loading...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("POST", RESETPASSWORD_API, {
        password,
        confirmPassword,
        token,
      })

      console.log("RESETPASSWORD RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      showSuccess("Password Reset Successfully")
      navigate("/login")
    } catch (error) {
      console.log("RESETPASSWORD ERROR............", error)
      showError("Failed To Reset Password")
    }
    dismissToast(toastId)
    dispatch(setLoading(false))
  }
}

// University Login
export const universityLogin = (email, password) => {
  return async (dispatch) => {
    const toastId = showLoading("Logging in...");
    dispatch(setLoading(true));
    
    try {
      const response = await apiConnector("POST", UNIVERSITY_LOGIN_API, {
        email,
        password,
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      
      // Set token in Redux store
      dispatch(setToken(response.data.token));
      
      // Set user data in Redux store
      dispatch(setUser(response.data.user));
      
      showSuccess("Login successful!");
      return { success: true, data: response.data };
    } catch (error) {
      console.error("LOGIN ERROR............", error);
      
      let errorMessage = "Login failed";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      dispatch(setLoading(false));
      dismissToast(toastId);
    }
  };
};

// Get current user data
export const getCurrentUser = () => {
  return async (dispatch) => {
    const toastId = showLoading("Loading user data...");
    dispatch(setProfileLoading(true));
    
    try {
      const response = await apiConnector("GET", GET_CURRENT_USER_API, null, {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      
      // Update user data in Redux store
      dispatch(setUser(response.data.user));
      return { success: true, user: response.data.user };
    } catch (error) {
      console.error("GET CURRENT USER ERROR............", error);
      
      // If token is invalid, log out the user
      if (error.response?.status === 401) {
        dispatch(logout());
      }
      
      return { success: false, message: error.response?.data?.message || 'Failed to fetch user data' };
    } finally {
      dispatch(setProfileLoading(false));
      dismissToast(toastId);
    }
  };
};

// Track if logout is already in progress to prevent duplicate toasts
let isLoggingOut = false;
let logoutToastShown = false;

export const updateUserProgram = (programType) => async (dispatch, getState) => {
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
    
    // Get current state
    const state = getState ? getState() : store.getState();
    const token = state.auth?.token;
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }
    
    // Log current auth state for debugging
    console.log('Current auth state:', {
      hasToken: !!token,
      user: state.auth?.user ? 'User data exists' : 'No user data'
    });
    
    // Make the API request with explicit headers and skip the interceptor for this request
    const response = await axios({
      method: 'PUT',
      url: `${process.env.REACT_APP_BASE_URL || 'http://localhost:4001'}${UPDATE_PROGRAM_API}`,
      data: { programType },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Skip-Interceptor': 'true' // Custom header to skip interceptor
      },
      validateStatus: function (status) {
        return status >= 200 && status < 500; // Don't throw for 4xx errors
      }
    });
    
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
      ...(response.data.user || {}),
      programType: programType,
      accountType: 'Student' // Always use 'Student' as account type
    };
    
    console.log('Dispatching updated user:', updatedUser);
    dispatch(setUser(updatedUser));
    
    // Update localStorage if needed
    try {
      const persistedAuth = localStorage.getItem('persist:auth');
      if (persistedAuth) {
        const authState = JSON.parse(persistedAuth);
        if (authState.user) {
          const user = JSON.parse(authState.user);
          const updatedUserState = {
            ...user,
            programType: programType,
            accountType: 'Student'
          };
          localStorage.setItem('persist:auth', JSON.stringify({
            ...authState,
            user: JSON.stringify(updatedUserState)
          }));
        }
      }
    } catch (e) {
      console.error('Error updating localStorage:', e);
    }
    
    showSuccess("Program updated successfully");
    return response.data;
    
  } catch (error) {
    console.error("UPDATE PROGRAM API ERROR", {
      name: error.name,
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    
    let errorMessage = 'Failed to update program';
    
    if (error.response?.status === 401) {
      // Handle 401 without redirecting
      errorMessage = 'Session expired. Please refresh the page and try again.';
      // Don't redirect, just reject with the error
      return Promise.reject(new Error(errorMessage));
    } else if (error.name === 'ValidationError') {
      errorMessage = error.message;
    } else if (error.response) {
      // Server responded with an error status
      errorMessage = error.response.data?.message || 
                   error.response.statusText || 
                   `Server error: ${error.response.status}`;
      
      // Handle specific status codes
      if (error.response.status === 401) {
        errorMessage = 'Session expired. Please log in again.';
        // Optionally dispatch logout action
        // dispatch(logout());
      } else if (error.response.status === 403) {
        errorMessage = 'You do not have permission to perform this action';
      } else if (error.response.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      }
    } else if (error.request) {
      errorMessage = 'No response from server. Please check your internet connection.';
    } else {
      errorMessage = error.message || errorMessage;
    }
    
    showError(errorMessage);
    throw error;
  } finally {
    dismissToast(toastId);
  }
};

export function logout(navigate = () => {}) {
  return (dispatch) => {
    // Prevent duplicate logout calls
    if (isLoggingOut) {
      console.log("Logout already in progress, skipping...");
      return;
    }
    
    console.log("Starting logout process...");
    isLoggingOut = true;
    
    // Clear all existing toasts first
    dismissAllToasts();
    
    // Clear all auth-related state
    dispatch(setToken(null))
    dispatch(setUser(null))
    dispatch(setLoading(false))
    dispatch(setProfileLoading(false))
    
    // Clear localStorage if needed
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    
    console.log("Logout - Redux state cleared");
    
    // Only show toast if not already shown
    if (!logoutToastShown) {
      console.log("Showing logout success toast...");
      showSuccess("Logged Out Successfully")
      logoutToastShown = true;
    } else {
      console.log("Logout toast already shown, skipping...");
    }
    
    // Navigate to home page
    navigate("/")
    
    // Reset the flags after a short delay
    setTimeout(() => {
      isLoggingOut = false;
      logoutToastShown = false;
      console.log("Logout flags reset");
    }, 2000);
  }
} 

export function updateProfile(profileData, token) {
  return async (dispatch) => {
    const toastId = showLoading("Updating profile...");
    dispatch(setLoading(true));
    try {
      const response = await apiConnector(
        "PUT",
        profile.UPDATE_PROFILE_API,
        profileData,
        { Authorization: `Bearer ${token}` }
      );
      console.log("UPDATE PROFILE RESPONSE............", response);
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      showSuccess("Profile updated successfully");
      // Update user in Redux
      dispatch(setUser(response.data.updatedUserDetails));
    } catch (error) {
      console.log("UPDATE PROFILE ERROR............", error);
      showError("Failed to update profile");
    }
    dispatch(setLoading(false));
    dismissToast(toastId);
  };
} 

export function updateDisplayPicture(token, formData) {
  return async (dispatch) => {
    const toastId = showLoading("Uploading image...");
    dispatch(setLoading(true));
    try {
      const response = await apiConnector(
        "PUT",
        profile.UPDATE_DISPLAY_PICTURE_API,
        formData,
        { Authorization: `Bearer ${token}` }
      );
      console.log("UPDATE DISPLAY PICTURE RESPONSE............", response);
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      showSuccess("Profile picture updated successfully");
      // Update user in Redux
      dispatch(setUser(response.data));
    } catch (error) {
      console.log("UPDATE DISPLAY PICTURE ERROR............", error);
      showError("Failed to update profile picture");
      }
    dispatch(setLoading(false));
    dismissToast(toastId);
  };
} 

// Updated refreshToken function (example)
// export const refreshToken = async () => {
//   try {
//     const refreshToken = localStorage.getItem('refreshToken');
//     if (!refreshToken) throw new Error("No refresh token available");
    
//     const response = await apiConnector(
//       "POST", 
//       REFRESH_TOKEN_API,
//       { refreshToken }
//     );

//     if (!response.data?.accessToken) {
//       throw new Error("Invalid token response structure");
//     }

//     // Store the new tokens
//     localStorage.setItem('token', response.data.accessToken);
//     if (response.data.refreshToken) {
//       localStorage.setItem('refreshToken', response.data.refreshToken);
//     }

//     return response;
//   } catch (error) {
//     console.error("Refresh token failed:", error);
//     // Clear invalid tokens
//     localStorage.removeItem('token');
//     localStorage.removeItem('refreshToken');
//     throw error;
//   }
// };

export function refreshToken(token) {
  return async (dispatch) => {
    try {
      const response = await apiConnector("POST", REFRESH_TOKEN_API, null, {
        Authorization: `Bearer ${token}`,
      });
      
      console.log("REFRESH TOKEN API RESPONSE............", response);
      
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      
      // Update token in Redux store
      dispatch(setToken(response.data.token));
      
      // Update user in profile slice if needed
      if (response.data.user) {
        dispatch(setUser(response.data.user));
      }
      
      console.log("Token refreshed successfully");
      return response.data;
    } catch (error) {
      console.log("REFRESH TOKEN API ERROR............", error);
      throw error;
    }
  };
} 