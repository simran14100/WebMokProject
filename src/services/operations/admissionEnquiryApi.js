import { apiConnector } from '../apiConnector';
import { admissionEnquiry } from '../apis';
import { showError, showSuccess } from '../../utils/toast';

const {
  GET_ALL_ENQUIRIES,
  GET_ENQUIRY_BY_ID,
  UPDATE_ENQUIRY_STATUS,
  DELETE_ENQUIRY,
  CREATE_ENQUIRY
} = admissionEnquiry;

/**
 * Get all admission enquiries with optional filtering and pagination
 * @param {Object} params - Query parameters for filtering and pagination
 * @param {string} token - Authentication token
 * @param {Object} headers - Additional headers to include in the request
 * @returns {Promise<Object>} Response data containing enquiries and pagination info
 */
export const getAllAdmissionEnquiries = async (params = {}, token, headers = {}) => {
  try {
    const response = await apiConnector(
      'GET',
      GET_ALL_ENQUIRIES,
      null, // No request body for GET
      {
        ...headers,
        ...(token && { Authorization: `Bearer ${token}` })
      },
      params // Pass query parameters as an object
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || 'Failed to fetch admission enquiries');
    }

    return response.data;
  } catch (error) {
    console.error('GET ALL ADMISSION ENQUIRIES ERROR............', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch admission enquiries';
    showError(errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * Create a new admission enquiry
 * @param {Object} enquiryData - The enquiry data to submit
 * @returns {Promise<Object>} Response data containing the created enquiry
 */
export const createAdmissionEnquiry = async (enquiryData) => {
  try {
    const response = await apiConnector(
      'POST',
      CREATE_ENQUIRY,
      enquiryData
    );

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || 'Failed to submit admission enquiry');
    }

    showSuccess('Admission enquiry submitted successfully');
    return response.data;
  } catch (error) {
    console.error('CREATE ADMISSION ENQUIRY ERROR............', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to submit admission enquiry';
    showError(errorMessage);
    throw new Error(errorMessage);
  }
};

// Get admission enquiry by ID
export const getAdmissionEnquiryById = async (enquiryId, token) => {
  try {
    const response = await apiConnector(
      'GET',
      GET_ENQUIRY_BY_ID(enquiryId),
      null,
      {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch enquiry details');
    }

    return response.data;
  } catch (error) {
    console.error('GET ADMISSION ENQUIRY ERROR............', error);
    throw error;
  }
};

// Update enquiry status
export const updateEnquiryStatus = async (enquiryId, statusData, token) => {
  try {
    const response = await apiConnector(
      'PATCH',
      UPDATE_ENQUIRY_STATUS(enquiryId),
      statusData,
      {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update enquiry status');
    }

    showSuccess('Enquiry status updated successfully');
    return response.data;
  } catch (error) {
    console.error('UPDATE ENQUIRY STATUS ERROR............', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to update enquiry status';
    showError(errorMessage);
    throw new Error(errorMessage);
  }
};

// Delete enquiry
export const deleteAdmissionEnquiry = async (enquiryId, token) => {
  try {
    const response = await apiConnector(
      'DELETE',
      DELETE_ENQUIRY(enquiryId),
      null,
      {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to delete enquiry');
    }

    showSuccess('Enquiry deleted successfully');
    return response.data;
  } catch (error) {
    console.error('DELETE ENQUIRY ERROR............', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to delete enquiry';
    showError(errorMessage);
    throw new Error(errorMessage);
  }
};
