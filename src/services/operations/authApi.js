import { toast } from "react-hot-toast"
import { setLoading, setToken } from "../../store/slices/authSlice"
import { setUser } from "../../store/slices/profileSlice"
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
} = auth

export function sendOtp(email, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...")
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

      toast.success("OTP Sent Successfully")
      navigate("/verify-email")
    } catch (error) {
      console.log("SENDOTP API ERROR............", error)
      toast.error("Could Not Send OTP")
    }
    dispatch(setLoading(false))
    toast.dismiss(toastId)
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
    const toastId = toast.loading("Loading...")
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
      toast.success("Signup Successful")
      navigate("/login")
    } catch (error) {
      console.log("SIGNUP API ERROR............", error)
      toast.error("Signup Failed")
      navigate("/signup")
    }
    dispatch(setLoading(false))
    toast.dismiss(toastId)
  }
}

export function login(email, password, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...")
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
     
      toast.success("Login Successful")
      
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
      toast.error("Login Failed");
    }
    dispatch(setLoading(false))
    toast.dismiss(toastId)
  };
}

export function getPasswordResetToken(email, setEmailSent) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...")
    dispatch(setLoading(true))
    try {
      const response = await apiConnector("POST", RESETPASSTOKEN_API, {
        email,
      })

      console.log("RESETPASSTOKEN RESPONSE............", response)

      if (!response.data.success) {
        throw new Error(response.data.message)
      }

      toast.success("Reset Email Sent")
      setEmailSent(true)
    } catch (error) {
      console.log("RESETPASSTOKEN ERROR............", error)
      toast.error("Failed To Send Reset Email")
    }
    toast.dismiss(toastId)
    dispatch(setLoading(false))
  }
}

export function resetPassword(password, confirmPassword, token, navigate) {
  return async (dispatch) => {
    const toastId = toast.loading("Loading...")
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

      toast.success("Password Reset Successfully")
      navigate("/login")
    } catch (error) {
      console.log("RESETPASSWORD ERROR............", error)
      toast.error("Failed To Reset Password")
    }
    toast.dismiss(toastId)
    dispatch(setLoading(false))
  }
}

export function logout(navigate) {
  return (dispatch) => {
    dispatch(setToken(null))
    dispatch(setUser(null))
    console.log("Logout - Redux state cleared");
    toast.success("Logged Out")
    navigate("/")
  }
} 

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
      // Update user in Redux
      dispatch(setUser(response.data.updatedUserDetails));
    } catch (error) {
      console.log("UPDATE PROFILE ERROR............", error);
      toast.error("Failed to update profile");
    }
    dispatch(setLoading(false));
    toast.dismiss(toastId);
  };
} 

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
      // Update user in Redux
      dispatch(setUser(response.data));
    } catch (error) {
      console.log("UPDATE DISPLAY PICTURE ERROR............", error);
      toast.error("Failed to update profile picture");
    }
    dispatch(setLoading(false));
    toast.dismiss(toastId);
  };
} 