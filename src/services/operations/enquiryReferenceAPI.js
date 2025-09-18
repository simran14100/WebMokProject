import axios from 'axios';
import { ENQUIRY_REFERENCE_API } from '../apis';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getEnquiryReferences = async (params = {}) => {
  try {
    const response = await api.get(ENQUIRY_REFERENCE_API, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching enquiry references:', error);
    throw error;
  }
};

export const getEnquiryReferenceById = async (id) => {
  try {
    const response = await api.get(`${ENQUIRY_REFERENCE_API}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching enquiry reference:', error);
    throw error;
  }
};

export const createEnquiryReference = async (data) => {
  try {
    const response = await api.post(ENQUIRY_REFERENCE_API, data);
    return response.data;
  } catch (error) {
    console.error('Error creating enquiry reference:', error);
    throw error;
  }
};

export const updateEnquiryReference = async (id, data) => {
  try {
    const response = await api.put(`${ENQUIRY_REFERENCE_API}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating enquiry reference:', error);
    throw error;
  }
};

export const deleteEnquiryReference = async (id) => {
  try {
    const response = await api.delete(`${ENQUIRY_REFERENCE_API}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting enquiry reference:', error);
    throw error;
  }
};
