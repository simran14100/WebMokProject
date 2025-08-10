import { showSuccess, showError, showLoading, dismissToast, dismissAllToasts } from "../../utils/toast"
import { setLoading, setToken } from "../../store/slices/authSlice"
import { setUser, setLoading as setProfileLoading } from "../../store/slices/profileSlice"
import { apiConnector } from "../apiConnector"
import { auth } from "../apis"
import { profile } from "../apis"
import { debugLocalStorage } from "../../utils/localStorage"

const {
  SENDOTP_API,
  SIGNUP_API,
  LOGIN_API,
  RESETPASSTOKEN_API,
  RESETPASSWORD_API,
  REFRESH_TOKEN_API,
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

export function signUp(
  accountType,
  firstName,
  lastName,
  email,
  password,
  confirmPassword,
  otp,
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

export function login(email, password, navigate) {
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

export function resetPassword(password, confirmPassword, token, navigate) {
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

// Track if logout is already in progress to prevent duplicate toasts
let isLoggingOut = false;
let logoutToastShown = false;

export function logout(navigate) {
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