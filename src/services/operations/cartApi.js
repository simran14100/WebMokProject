// services/api/cart.js
import { apiConnector } from "../apiConnector";
import { cart } from "../apis";

export const fetchCartDetails = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      cart.GET_CART_DETAILS_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return {
      success: true,
      cartData: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const addToCart = async (courseId, token) => {
  try {
    console.log("Request payload:", { courseId }); // Debug log
    const response = await apiConnector(
      "POST",
      cart.ADD_TO_CART_API,
      { courseId }, // Ensure this matches backend expectation
      {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    );
    if (response.data.success) {
      // Trigger update event for navbar
      window.dispatchEvent(new Event("cartUpdated"));
    }
    console.log("Full response:", response); // Debug log
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const updateCartItem = async ({ courseId, quantity }, token) => {
  try {
    const response = await apiConnector(
      "PUT",
      cart.UPDATE_CART_ITEM_API,
      { courseId, quantity },
      {
        Authorization: `Bearer ${token}`,
      }
    );
    if (response.data.success) {
      // Trigger update event for navbar
      window.dispatchEvent(new Event("cartUpdated"));
    }
    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const removeFromCart = async ({ courseId }, token) => {
  try {
    const response = await apiConnector(
      "POST",
      cart.REMOVE_FROM_CART_API,
      { courseId },
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (response.data.success) {
      // Trigger update event for navbar
      window.dispatchEvent(new Event("cartUpdated"));
    }

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const clearCart = async (token) => {
  try {
    const response = await apiConnector(
      "DELETE",
      cart.CLEAR_CART_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

    if (response.data.success) {
      // Trigger update event for navbar
      window.dispatchEvent(new Event("cartUpdated"));
    }

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

export const getCartCount = async (token) => {
  try {
    const response = await apiConnector(
      "GET",
      cart.GET_CART_COUNT_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      }
    );

   

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return {
      success: true,
      count: response.data.count
    };
  } catch (error) {
    console.error("Error getting cart count:", error);
    return {
      success: false,
      message: error.message,
      count: 0
    };
  }
};