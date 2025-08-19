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
      // Fetch the latest profile after update
      await dispatch(fetchUserProfile(token));
    } catch (error) {
      console.log("UPDATE PROFILE ERROR............", error);
      showError("Failed to update profile");
    }
    dispatch(setLoading(false));
    dismissToast(toastId);
  };
}

// Update profile picture
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
      dispatch(setUser(response.data.data));
    } catch (error) {
      console.log("UPDATE DISPLAY PICTURE ERROR............", error);
      showError("Failed to update profile picture");
    }
    dispatch(setLoading(false));
    dismissToast(toastId);
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