import { apiConnector } from "./apiConnector";
import { ENQUIRY_API } from "./apis";
import { toast } from "react-hot-toast";

// Alias for backward compatibility
export const listEnquiries = (params = {}) => getEnquiries(params);

// Get all enquiries with optional filters
export const getEnquiries = async (params = {}) => {
  try {
    const response = await apiConnector("GET", ENQUIRY_API.GET_ENQUIRIES, null, null, params);
    return response.data;
  } catch (error) {
    console.error("GET ENQUIRIES ERROR............", error);
    toast.error(error.response?.data?.message || "Failed to fetch enquiries");
    throw error;
  }
};

// Get single enquiry by ID
export const getEnquiryById = async (id) => {
  try {
    const response = await apiConnector("GET", ENQUIRY_API.GET_ENQUIRY_BY_ID(id));
    return response.data;
  } catch (error) {
    console.error("GET ENQUIRY ERROR............", error);
    toast.error(error.response?.data?.message || "Failed to fetch enquiry details");
    throw error;
  }
};

// Create a new enquiry
export const createEnquiry = async (enquiryData) => {
  try {
    const response = await apiConnector("POST", ENQUIRY_API.CREATE_ENQUIRY, enquiryData);
    toast.success("Enquiry submitted successfully!");
    return response.data;
  } catch (error) {
    console.error("CREATE ENQUIRY ERROR............", error);
    const errorMessage = error.response?.data?.message || "Failed to submit enquiry. Please try again.";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

// Update an enquiry
export const updateEnquiry = async (id, enquiryData) => {
  try {
    const response = await apiConnector("PUT", ENQUIRY_API.UPDATE_ENQUIRY(id), enquiryData);
    toast.success("Enquiry updated successfully!");
    return response.data;
  } catch (error) {
    console.error("UPDATE ENQUIRY ERROR............", error);
    const errorMessage = error.response?.data?.message || "Failed to update enquiry";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

// Delete an enquiry
export const deleteEnquiry = async (id) => {
  try {
    const response = await apiConnector("DELETE", ENQUIRY_API.DELETE_ENQUIRY(id));
    toast.success("Enquiry deleted successfully!");
    return response.data;
  } catch (error) {
    console.error("DELETE ENQUIRY ERROR............", error);
    const errorMessage = error.response?.data?.message || "Failed to delete enquiry";
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

// Get enquiry statistics
export const getEnquiryStats = async () => {
  try {
    const response = await apiConnector("GET", `${ENQUIRY_API.GET_ENQUIRIES}/stats`);
    return response.data;
  } catch (error) {
    console.error("GET ENQUIRY STATS ERROR............", error);
    throw error;
  }
};
