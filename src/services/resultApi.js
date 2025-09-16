import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';
const BASE_URL = `${API_URL}/results`;

// Create a new result
export const createResult = async (resultData) => {
  try {
    const response = await axios.post(BASE_URL, resultData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Result created successfully'
    };
  } catch (error) {
    console.error('Error in createResult:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to create result',
      data: null
    };
  }
};

// Update an existing result
export const updateResult = async (id, resultData) => {
  try {
    const response = await axios.put(`${BASE_URL}/${id}`, resultData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Result updated successfully'
    };
  } catch (error) {
    console.error('Error in updateResult:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update result',
      data: null
    };
  }
};

// Upload results via Excel/CSV
export const uploadResults = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${BASE_URL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Results uploaded successfully',
      stats: response.data.stats || {}
    };
  } catch (error) {
    console.error('Error in uploadResults:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to upload results',
      data: null
    };
  }
};

// Get results with filters
export const getResults = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, value);
      }
    });
    
    const response = await axios.get(`${BASE_URL}?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    return {
      success: true,
      data: response.data.data || response.data,
      pagination: response.data.pagination || {
        total: response.data.total || 0,
        current: response.data.page || 1,
        pageSize: response.data.limit || 10,
      },
      message: response.data.message
    };
  } catch (error) {
    console.error('Error in getResults:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch results',
      data: [],
      pagination: {
        total: 0,
        current: 1,
        pageSize: 10
      }
    };
  }
};

// Get results for a specific student
export const getStudentResults = async (studentId, filters = {}) => {
  try {
    if (!studentId) {
      throw new Error('Student ID is required');
    }
    
    const params = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, value);
      }
    });
    
    const response = await axios.get(`${BASE_URL}/student/${studentId}?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });
    
    return {
      success: true,
      data: response.data.data || response.data,
      pagination: response.data.pagination || {
        total: response.data.total || 0,
        current: response.data.page || 1,
        pageSize: response.data.limit || 10,
      },
      message: response.data.message
    };
  } catch (error) {
    console.error('Error in getStudentResults:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch student results',
      data: [],
      pagination: {
        total: 0,
        current: 1,
        pageSize: 10
      }
    };
  }
};

// Delete a result
export const deleteResult = async (resultId) => {
  try {
    const response = await axios.delete(`${BASE_URL}/${resultId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    return {
      success: true,
      data: response.data.data || response.data,
      message: 'Result deleted successfully'
    };
  } catch (error) {
    console.error('Error in deleteResult:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to delete result',
      data: null
    };
  }
};

// Download marksheet
export const downloadMarksheet = async (marksheetPath) => {
  try {
    const response = await axios.get(`${API_URL}/download/${marksheetPath}`, {
      responseType: 'blob',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    // Create a download link and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `marksheet_${new Date().getTime()}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return true;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
