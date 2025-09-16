import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';

// List courses with filters
export const listCourses = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_URL}/ugpg/courses`, {
      params: {
        ...filters,
        status: 'active'
      },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    return {
      success: true,
      data: response.data.data || response.data.courses || [],
      pagination: response.data.pagination || {
        total: response.data.total || 0,
        current: response.data.page || 1,
        pageSize: response.data.limit || 10,
      },
    };
  } catch (error) {
    console.error('Error in listCourses:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch courses',
      data: []
    };
  }
};

// Get course by ID
export const getCourseById = async (courseId) => {
  try {
    const response = await axios.get(`${API_URL}/ugpg/courses/${courseId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    return {
      success: true,
      data: response.data.data || response.data
    };
  } catch (error) {
    console.error('Error in getCourseById:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch course details',
      data: null
    };
  }
};
