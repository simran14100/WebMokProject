import { apiConnector } from '../apiConnector';
import { admissionEnquiryEndpoints } from '../apis';
import { toast } from '../../utils/toast';

const {
  GET_ALL_ENQUIRIES_API,
  GET_ENQUIRY_BY_ID_API,
  UPDATE_ENQUIRY_STATUS_API,
  DELETE_ENQUIRY_API,
} = admissionEnquiryEndpoints;

// Get all admission enquiries
export const getAllAdmissionEnquiries = async (params, token) => {
  try {
    const response = await apiConnector(
      'GET',
      GET_ALL_ENQUIRIES_API,
      null,
      {
        Authorization: `Bearer ${token}`,
      },
      params
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch admission enquiries');
    }

    return response.data;
  } catch (error) {
    console.error('GET ALL ADMISSION ENQUIRIES ERROR............', error);
    throw error;
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

    toast.showSuccess('Enquiry status updated successfully');
    return response.data;
  } catch (error) {
    console.error('UPDATE ENQUIRY STATUS ERROR............', error);
    toast.showError(error.message || 'Failed to update enquiry status');
    throw error;
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

    toast.showSuccess('Enquiry deleted successfully');
    return response.data;
  } catch (error) {
    console.error('DELETE ENQUIRY ERROR............', error);
    toast.showError(error.message || 'Failed to delete enquiry');
    throw error;
  }
};
