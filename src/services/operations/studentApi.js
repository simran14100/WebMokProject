import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';

// List students with filters
export const listStudents = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_URL}/university/registered-students`, {
      params: {
        ...filters,
        status: 'approved',
      },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    return {
      success: true,
      data: response.data.data || response.data.students || [],
      pagination: response.data.pagination || {
        total: response.data.total || 0,
        current: response.data.page || 1,
        pageSize: response.data.limit || 10,
      },
    };
  } catch (error) {
    console.error('Error in listStudents:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch students',
      data: []
    };
  }
};

// Get student by ID
export const getStudentById = async (studentId) => {
  try {
    const response = await axios.get(`${API_URL}/university/registered-students/${studentId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    return {
      success: true,
      data: response.data.data || response.data
    };
  } catch (error) {
    console.error('Error in getStudentById:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch student details',
      data: null
    };
  }
};
