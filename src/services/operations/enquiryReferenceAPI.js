import { apiConnector } from '../apiConnector';
import { ENQUIRY_REFERENCE_API } from '../apis';

export const getEnquiryReferences = async (params = {}) => {
  try {
    const response = await apiConnector('GET', ENQUIRY_REFERENCE_API, null, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching enquiry references:', error);
    throw error;
  }
};

export const getEnquiryReferenceById = async (id) => {
  try {
    const response = await apiConnector('GET', `${ENQUIRY_REFERENCE_API}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching enquiry reference:', error);
    throw error;
  }
};

export const createEnquiryReference = async (data) => {
  try {
    const response = await apiConnector('POST', ENQUIRY_REFERENCE_API, data);
    return response.data;
  } catch (error) {
    console.error('Error creating enquiry reference:', error);
    throw error;
  }
};

export const updateEnquiryReference = async (id, data) => {
  try {
    const response = await apiConnector('PUT', `${ENQUIRY_REFERENCE_API}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating enquiry reference:', error);
    throw error;
  }
};

export const deleteEnquiryReference = async (id) => {
  try {
    const response = await apiConnector('DELETE', `${ENQUIRY_REFERENCE_API}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting enquiry reference:', error);
    throw error;
  }
};
