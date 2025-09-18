import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
const BASE = "/api/v1/sessions";

// List sessions with filters and pagination
export const listSessions = async (filters = {}) => {
  try {
    console.log('Fetching sessions from:', `${API_URL}${BASE}`);
    const response = await axios.get(`${API_URL}${BASE}`, {
      params: {
        ...filters,
        status: 'active'
      },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Sessions API Response:', response.data);
    
    // The server returns { success: true, data: [...] }
    return {
      success: true,
      data: response.data.data || [],
      pagination: response.data.pagination || {
        total: response.data.total || (response.data.data ? response.data.data.length : 0),
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

export const createSession = async (payload) => {
  const response = await axios.post(`${API_URL}${BASE}`, payload, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

export const updateSession = async (id, payload) => {
  const response = await axios.patch(`${API_URL}${BASE}/${id}`, payload, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

export const deleteSession = async (id) => {
  const response = await axios.delete(`${API_URL}${BASE}/${id}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data;
};

// Get session by ID
export const getSessionById = async (sessionId) => {
  try {
    const response = await axios.get(`${API_URL}${BASE}/${sessionId}`, {
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
