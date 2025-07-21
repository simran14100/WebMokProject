// Utility functions for localStorage debugging
export const debugLocalStorage = () => {
  console.log("=== localStorage Debug ===");
  console.log("Token:", localStorage.getItem("token"));
  console.log("User:", localStorage.getItem("user"));
  
  try {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    if (token) {
      console.log("Parsed Token:", JSON.parse(token));
    }
    
    if (user) {
      console.log("Parsed User:", JSON.parse(user));
    }
  } catch (error) {
    console.error("Error parsing localStorage data:", error);
  }
  console.log("=========================");
};

export const clearLocalStorage = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  console.log("localStorage cleared");
};

export const setLocalStorageData = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    console.log(`localStorage set: ${key}`, value);
  } catch (error) {
    console.error(`Error setting localStorage ${key}:`, error);
  }
};

export const getLocalStorageData = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error getting localStorage ${key}:`, error);
    return null;
  }
}; 