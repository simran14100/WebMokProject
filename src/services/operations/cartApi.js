// services/api/cart.js
import { apiConnector } from "../apiConnector";
import { cart } from "../apis";

export const fetchCartDetails = async () => {
  try {
    const response = await apiConnector(
      "GET",
      cart.GET_CART_DETAILS_API
    );

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return {
      success: true,
      cartData: response.data.data,
    };
  } catch (error) {
    console.error("Error fetching cart details:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
    };
  }
};

export const addToCart = async (courseId) => {
  try {
    console.log("Request payload:", { courseId }); // Debug log
    const response = await apiConnector(
      "POST",
      cart.ADD_TO_CART_API,
      { courseId } // Ensure this matches backend expectation
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

export const updateCartItem = async ({ courseId, quantity }) => {
  try {
    const response = await apiConnector(
      "PUT",
      cart.UPDATE_CART_ITEM_API,
      { courseId, quantity }
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

export const removeFromCart = async ({ courseId }) => {
  try {
    const response = await apiConnector(
      "POST",
      cart.REMOVE_FROM_CART_API,
      { courseId }
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

export const clearCart = async () => {
  try {
    const response = await apiConnector(
      "DELETE",
      cart.CLEAR_CART_API
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

export const getCartCount = async () => {
  try {
    const response = await apiConnector("GET", cart.GET_CART_COUNT_API);

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    return {
      success: true,
      count: response.data.count || 0
    };
  } catch (error) {
    console.error("Error getting cart count:", error);
    return {
      success: false,
      message: error.response?.data?.message || error.message,
      count: 0
    };
  }
};