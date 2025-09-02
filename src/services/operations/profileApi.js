import { showSuccess, showError, showLoading, dismissToast } from "../../utils/toast";
import { setLoading, setUser } from "../../store/slices/profileSlice";
import { apiConnector } from "../apiConnector";
import { profile } from "../apis";

// Fetch the latest user profile
export function fetchUserProfile(token) {
  return async (dispatch) => {
    dispatch(setLoading(true));
    try {
      const response = await apiConnector(
        "GET",
        "/api/v1/profile/getUserDetails",
        null,
        { Authorization: `Bearer ${token}` }
      );
      console.log("FETCH USER PROFILE RESPONSE............", response);
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      dispatch(setUser(response.data.data));
    } catch (error) {
      console.log("FETCH USER PROFILE ERROR............", error);
      showError("Failed to fetch profile");
    }
    dispatch(setLoading(false));
  };
}

// Update profile info
export function updateProfile(profileData) {
  return async (dispatch, getState) => {
    const toastId = showLoading("Updating your profile...");
    dispatch(setLoading(true));
    
    try {
      // Validate profile data
      if (!profileData || typeof profileData !== 'object') {
        throw new Error('Invalid profile data provided');
      }
      
      // Get current user data for fallback
      const currentUser = getState()?.auth?.user;
      
      // Call the API to update the profile
      const response = await apiConnector(
        "PUT",
        profile.UPDATE_PROFILE_API,
        profileData,
        { 
          withCredentials: true, // Important for cookies
          'Content-Type': 'application/json',
          'X-Skip-Interceptor': 'true' // Skip the interceptor for this request
        }
      );
      
      console.log("UPDATE PROFILE RESPONSE............", response);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update profile');
      }
      
      // Get the updated user data from the response
      const updatedUser = response.data.data || response.data.user;
      if (!updatedUser) {
        throw new Error('No user data received after update');
      }
      
      // Ensure we have all required user properties with defaults
      const userWithDefaults = {
        ...updatedUser,
        firstName: updatedUser.firstName || currentUser?.firstName || '',
        lastName: updatedUser.lastName || currentUser?.lastName || '',
        email: updatedUser.email || currentUser?.email || '',
        role: updatedUser.role || currentUser?.role || 'STUDENT',
        accountStatus: updatedUser.accountStatus || currentUser?.accountStatus || 'ACTIVE',
        image: updatedUser.image || currentUser?.image || 
          `https://api.dicebear.com/5.x/initials/svg?seed=${updatedUser.firstName || 'U'} ${updatedUser.lastName || 'S'}`.trim()
      };
      
      // Update user in Redux with the updated user data
      dispatch(setUser(userWithDefaults));
      
      // Show success message
      showSuccess("Profile updated successfully");
      
      return { 
        success: true, 
        user: userWithDefaults,
        message: 'Profile updated successfully'
      };
      
    } catch (error) {
      console.error("UPDATE PROFILE ERROR:", error);
      
      // Extract and format error message
      let errorMessage = 'Failed to update profile';
      let shouldLogout = false;
      
      if (error.response) {
        // Handle different HTTP status codes
        if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Invalid profile data';
        } else if (error.response.status === 401) {
          errorMessage = 'Your session has expired. Please log in again.';
          shouldLogout = true;
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to update this profile';
        } else if (error.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = error.response.data?.message || error.message || 'Failed to update profile';
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your internet connection.';
      } else {
        errorMessage = error.message || 'Failed to update profile';
      }
      
      // Show error to user
      showError(errorMessage);
      
      // Logout if session is invalid
      if (shouldLogout) {
        setTimeout(() => {
          // Import store dynamically to avoid circular dependency
          const { store } = require('../../store');
          store.dispatch({ type: 'auth/logout' });
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

// Update profile picture
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

      console.log("UPDATE DISPLAY PICTURE RESPONSE............", response);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update profile picture');
      }

      // Get the updated user data from the response
      const updatedUser = response.data.data || response.data.user || {};
      
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
          // Import store dynamically to avoid circular dependency
          const { store } = require('../../store');
          store.dispatch({ type: 'auth/logout' });
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

// Delete profile
export function deleteProfile(token, navigate) {
  return async (dispatch) => {
    const toastId = showLoading("Deleting account...");
    dispatch(setLoading(true));
    try {
      const response = await apiConnector(
        "DELETE",
        profile.DELETE_PROFILE_API,
        null,
        { Authorization: `Bearer ${token}` }
      );
      console.log("DELETE PROFILE RESPONSE............", response);
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      showSuccess("Account deleted successfully");
      // Optionally clear user state here
      navigate("/");
    } catch (error) {
      console.log("DELETE PROFILE ERROR............", error);
      showError("Failed to delete account");
    }
    dispatch(setLoading(false));
    dismissToast(toastId);
  };
}

// Change password
export function changePassword(token, data) {
  return async (dispatch) => {
    const toastId = showLoading("Updating password...");
    dispatch(setLoading(true));
    try {
      const response = await apiConnector(
        "POST",
        "/api/v1/auth/changepassword",
        data,
        { Authorization: `Bearer ${token}` }
      );
      console.log("CHANGE PASSWORD RESPONSE............", response);
      if (!response.data.success) {
        throw new Error(response.data.message);
      }
      showSuccess("Password updated successfully");
    } catch (error) {
      console.log("CHANGE PASSWORD ERROR............", error);
      showError("Failed to update password");
    }
    dispatch(setLoading(false));
    dismissToast(toastId);
  };
}