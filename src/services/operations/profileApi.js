import { toast } from "react-hot-toast";
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
      toast.error("Failed to fetch profile");
    }
    dispatch(setLoading(false));
  };
}

// Update profile info
export function updateProfile(profileData, token) {
  return async (dispatch) => {
    const toastId = toast.loading("Updating profile...");
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
      toast.success("Profile updated successfully");
      // Fetch the latest profile after update
      await dispatch(fetchUserProfile(token));
    } catch (error) {
      console.log("UPDATE PROFILE ERROR............", error);
      toast.error("Failed to update profile");
    }
    dispatch(setLoading(false));
    toast.dismiss(toastId);
  };
}

// Update profile picture
export function updateDisplayPicture(token, formData) {
  return async (dispatch) => {
    const toastId = toast.loading("Uploading image...");
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
      toast.success("Profile picture updated successfully");
      dispatch(setUser(response.data.data));
    } catch (error) {
      console.log("UPDATE DISPLAY PICTURE ERROR............", error);
      toast.error("Failed to update profile picture");
    }
    dispatch(setLoading(false));
    toast.dismiss(toastId);
  };
}

// Delete profile
export function deleteProfile(token, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Deleting account...");
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
      toast.success("Account deleted successfully");
      // Optionally clear user state here
      navigate("/");
    } catch (error) {
      console.log("DELETE PROFILE ERROR............", error);
      toast.error("Failed to delete account");
    }
    dispatch(setLoading(false));
    toast.dismiss(toastId);
  };
}

// Change password
export function changePassword(token, data) {
  return async (dispatch) => {
    const toastId = toast.loading("Updating password...");
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
      toast.success("Password updated successfully");
    } catch (error) {
      console.log("CHANGE PASSWORD ERROR............", error);
      toast.error("Failed to update password");
    }
    dispatch(setLoading(false));
    toast.dismiss(toastId);
  };
} 