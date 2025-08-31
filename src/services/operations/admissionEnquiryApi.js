import { apiConnector } from '../apiConnector';
import { admissionEnquiryEndpoints } from '../apis';
import { showError, showSuccess } from '../../utils/toast';

const {
  GET_ALL_ENQUIRIES_API,
  GET_ENQUIRY_BY_ID_API,
  UPDATE_ENQUIRY_STATUS_API,
  DELETE_ENQUIRY_API,
} = admissionEnquiryEndpoints;

/**
 * Get all admission enquiries with optional filtering and pagination
 * @param {Object} params - Query parameters for filtering and pagination
 * @param {string} token - Authentication token
 * @param {Object} headers - Additional headers to include in the request
 * @returns {Promise<Object>} Response data containing enquiries and pagination info
 */
export const getAllAdmissionEnquiries = async (params, token, headers = {}) => {
  try {
    const response = await apiConnector(
      'GET',
      GET_ALL_ENQUIRIES_API,
      null,
      {
        Authorization: `Bearer ${token}`,
        ...headers, // Include any additional headers
      },
      params // Query parameters
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

// Get admission enquiry by ID
export const getAdmissionEnquiryById = async (enquiryId, token) => {
  try {
    const response = await apiConnector(
      'GET',
      `${GET_ENQUIRY_BY_ID_API}/${enquiryId}`,
      null,
      {
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
      'PUT',
      `${UPDATE_ENQUIRY_STATUS_API}/${enquiryId}/status`,
      statusData,
      {
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
      `${DELETE_ENQUIRY_API}/${enquiryId}`,
      null,
      {
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
