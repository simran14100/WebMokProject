import { apiConnector } from "./apiConnector";

const BASE = "/api/v1/ugpg-exam";

export const listExamSessions = async (params = {}) => {
  try {
    console.log('listExamSessions called with params:', params);
    
    const { 
      page = 1, 
      limit = 10, 
      status, 
      populate = 'session,school,subject',
      ...otherParams 
    } = params;
    
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...(status && { status }),
      ...(populate && { populate }),
      ...otherParams
    });
    
    console.log('Making API request to:', `${BASE}?${queryParams}`);
    const response = await apiConnector("GET", `${BASE}?${queryParams}`);
    
    console.log('API response:', {
      status: response?.status,
      data: response?.data,
      hasData: !!response?.data,
      dataIsArray: Array.isArray(response?.data),
      dataKeys: response?.data ? Object.keys(response.data) : 'no data'
    });
    
    if (!response || !response.data) {
      throw new Error('Invalid response from server');
    }
    
    return {
      success: true,
      data: response.data.data || response.data,
      pagination: response.data.pagination || {
        total: response.data.total || 0,
        current: response.data.page || 1,
        pageSize: response.data.limit || limit
      }
    };
  } catch (error) {
    console.error('Error in listExamSessions:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });
    
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to fetch exam sessions',
      error: error.response?.data || error
    };
  }
};

export const createExamSession = (payload) => apiConnector("POST", `${BASE}`, payload);

export const updateExamSession = (id, payload) => apiConnector("PATCH", `${BASE}/${id}`, payload);

export const deleteExamSession = (id) => apiConnector("DELETE", `${BASE}/${id}`);
