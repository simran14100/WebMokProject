import axios from 'axios';

export { axios };

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';
const BASE_URL = `${API_URL}/results`;

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.timeout = 10000; // 10 seconds

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

// Get results for a specific student (for admin/teacher use)
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

// Get results for the currently logged-in student
export const getMyResults = async (filters = {}) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    // Create a clean filters object with only valid values
    const cleanFilters = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        cleanFilters[key] = value;
      }
    });
    
    // Use the correct endpoint path
    const response = await axios.get(`${API_URL}/results/my-results`, {
      params: cleanFilters,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.data) {
      throw new Error('No data received from server');
    }

    // Ensure we always return an array
    const resultData = Array.isArray(response.data.data) 
      ? response.data.data 
      : response.data.data ? [response.data.data] : [];
    
    return {
      success: true,
      data: resultData,
      message: response.data.message || 'Results fetched successfully'
    };
  } catch (error) {
    console.error('Error in getMyResults:', error);
    
    let errorMessage = 'Failed to fetch your results';
    if (error.response) {
      if (error.response.status === 401) {
        errorMessage = 'Session expired. Please login again.';
      } else if (error.response.status === 403) {
        errorMessage = 'You do not have permission to view these results';
      } else if (error.response.status === 404) {
        errorMessage = 'No results found';
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.request) {
      errorMessage = 'No response from server. Please check your connection.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      message: errorMessage,
      data: []
    };
  }
};

/**
 * Fetches results for a specific student
 * @param {string} studentId - ID of the student to fetch results for
 * @param {Object} filters - Optional filters for the results
 * @returns {Promise<Object>} - Result data or error information
 */
export const fetchStudentResults = async (studentId, filters = {}) => {
  try {
    // Ensure studentId is a string and not an object
    const studentIdStr = studentId && typeof studentId === 'object' 
      ? studentId._id || studentId.id || JSON.stringify(studentId)
      : String(studentId || '');
    
    if (!studentIdStr) {
      throw new Error('Valid student ID is required');
    }

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    // Create a clean filters object with only valid values
    const cleanFilters = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        cleanFilters[key] = value;
      }
    });

    console.log('Fetching results for student:', studentIdStr);
    console.log('Using filters:', cleanFilters);

    const response = await axios.get(`${BASE_URL}/student/${encodeURIComponent(studentIdStr)}`, {
      params: cleanFilters,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      withCredentials: true,
      timeout: 10000 // 10 second timeout
    });

    if (!response.data) {
      throw new Error('No data received from server');
    }

    // Ensure we always return an array
    const resultData = Array.isArray(response.data.data) 
      ? response.data.data 
      : response.data.data ? [response.data.data] : [];

    return {
      success: true,
      data: resultData,
      message: response.data.message || 'Student results fetched successfully'
    };

  } catch (error) {
    console.error('Error in fetchStudentResults:', error);
    
    let errorMessage = 'Failed to fetch student results';
    if (error.response) {
      if (error.response.status === 401) {
        errorMessage = 'Session expired. Please login again.';
      } else if (error.response.status === 403) {
        errorMessage = 'You do not have permission to view these results';
      } else if (error.response.status === 404) {
        errorMessage = 'No results found for this student';
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.request) {
      errorMessage = 'No response from server. Please check your connection.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      message: errorMessage,
      data: []
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
    const response = await axios.get(marksheetPath, {
      responseType: 'blob',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error downloading marksheet:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Downloads a result PDF
 * @param {string} resultId - ID of the result to download
 * @returns {Promise<Blob>} - The PDF blob data
 */
/**
 * Downloads a result PDF with proper authentication
 * @param {string} resultId - ID of the result to download
 * @returns {Promise<Blob>} - The PDF blob data
 */
export const downloadResultPdf = async (resultId) => {
  try {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    // Clean the result ID
    const cleanResultId = resultId.replace(/^\/+|\/+$/g, '');
    
    // Construct the download URL
    const downloadUrl = `${API_URL}/results/${cleanResultId}/download`;
    
    console.log('Downloading result PDF from:', downloadUrl);
    
    // Make the request with authentication
    const response = await axios({
      method: 'GET',
      url: downloadUrl,
      responseType: 'blob',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/pdf',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      withCredentials: true,
      timeout: 30000 // 30 seconds timeout
    });

    // Check if we got a valid response
    if (!response.data) {
      throw new Error('Received empty response from server');
    }
    
    // Check if the response is a PDF
    const contentType = response.headers['content-type'];
    if (!contentType || !contentType.includes('application/pdf')) {
      // If not a PDF, try to read the error message
      const errorText = await response.data.text();
      let errorMessage = 'Invalid response format from server';
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    return response.data;
  } catch (error) {
    console.error('Error downloading result PDF:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    
    let errorMessage = 'Failed to download result';
    if (error.response) {
      if (error.response.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
      } else if (error.response.status === 403) {
        errorMessage = 'You do not have permission to download this result.';
      } else if (error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
    } else if (error.request) {
      errorMessage = 'No response received from server. Please check your connection.';
    }
    
    const errorWithMessage = new Error(errorMessage);
    errorWithMessage.originalError = error;
    throw errorWithMessage;
  }
};
