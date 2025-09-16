import { apiConnector } from "./apiConnector";
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';
const BASE = "/api/v1/session";

// List sessions with filters and pagination
export const listSessions = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_URL}/session`, {
      params: {
        ...filters,
        status: 'active'
      },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      success: true,
      data: response.data.data || response.data.sessions || [],
      pagination: response.data.pagination || {
        total: response.data.total || 0,
        current: response.data.page || 1,
        pageSize: response.data.limit || 10,
      },
    };
  } catch (error) {
    console.error('Error in listSessions:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch sessions',
      data: []
    };
  }
};

export const createSession = (payload) => apiConnector("POST", `${BASE}`, payload);

export const updateSession = (id, payload) => apiConnector("PATCH", `${BASE}/${id}`, payload);

export const deleteSession = (id) => apiConnector("DELETE", `${BASE}/${id}`);

// Get session by ID
export const getSessionById = async (sessionId) => {
  try {
    const response = await axios.get(`${API_URL}/session/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    return {
      success: true,
      data: response.data.data || response.data
    };
  } catch (error) {
    console.error('Error in getSessionById:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch session details',
      data: null
    };
  }
};
