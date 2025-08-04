// Global logout manager to prevent duplicate logout calls
class LogoutManager {
  constructor() {
    this.isLoggingOut = false;
    this.logoutToastShown = false;
    this.logoutPromise = null;
  }

  async logout(dispatch, navigate) {
    // If already logging out, return the existing promise
    if (this.isLoggingOut && this.logoutPromise) {
      console.log("Logout already in progress, returning existing promise...");
      return this.logoutPromise;
    }

    // Create a new logout promise
    this.logoutPromise = this.performLogout(dispatch, navigate);
    return this.logoutPromise;
  }

  async performLogout(dispatch, navigate) {
    if (this.isLoggingOut) {
      console.log("Logout already in progress, skipping...");
      return;
    }

    console.log("Starting logout process...");
    this.isLoggingOut = true;

    try {
      // Clear all existing toasts first
      const toastModule = await import('./toast');
      toastModule.dismissAllToasts();

      // Clear all auth-related state
      const authSlice = await import('../store/slices/authSlice');
      const profileSlice = await import('../store/slices/profileSlice');
      
      dispatch(authSlice.setToken(null));
      dispatch(profileSlice.setUser(null));
      dispatch(authSlice.setLoading(false));
      dispatch(profileSlice.setLoading(false));

      // Clear localStorage if needed
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      console.log("Logout - Redux state cleared");

      // Only show toast if not already shown
      if (!this.logoutToastShown) {
        console.log("Showing logout success toast...");
        toastModule.showSuccess("Logged Out Successfully");
        this.logoutToastShown = true;
      } else {
        console.log("Logout toast already shown, skipping...");
      }

      // Navigate to home page
      navigate("/");

    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // Reset the flags after a delay
      setTimeout(() => {
        this.isLoggingOut = false;
        this.logoutToastShown = false;
        this.logoutPromise = null;
        console.log("Logout flags reset");
      }, 2000);
    }
  }

  // Reset the manager (useful for testing or manual reset)
  reset() {
    this.isLoggingOut = false;
    this.logoutToastShown = false;
    this.logoutPromise = null;
    console.log("Logout manager reset");
  }
}

// Create a singleton instance
const logoutManager = new LogoutManager();

export default logoutManager; 