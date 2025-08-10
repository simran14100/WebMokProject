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