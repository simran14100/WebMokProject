import { apiConnector } from "./apiConnector";

const TIMETABLE_API = {
  // Create a new timetable entry
  createTimetable: async (data) => {
    const response = await apiConnector("POST", "/api/v1/timetable", data);
    return response.data;
  },

  // Get all timetable entries with pagination
  getTimetables: async (params = {}) => {
    // Convert pagination parameters to query string
    const queryParams = new URLSearchParams();
    
    // Add pagination parameters if they exist
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    // Add any filter parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value && !['page', 'limit', 'sortBy', 'sortOrder'].includes(key)) {
        queryParams.append(key, value);
      }
    });
    
    const url = `/api/v1/timetable${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiConnector("GET", url);
    
    // Handle response based on structure
    if (response.data && typeof response.data === 'object') {
      // If the response already has pagination data
      if (response.data.pagination) {
        return response.data;
      }
      
      // If response is an array, wrap it in the expected format
      if (Array.isArray(response.data)) {
        return {
          data: response.data,
          pagination: {
            total: response.data.length,
            currentPage: 1,
            itemsPerPage: response.data.length || 10
          }
        };
      }
    }
    
    // Fallback for unexpected response format
    return {
      data: [],
      pagination: {
        total: 0,
        currentPage: 1,
        itemsPerPage: 10
      }
    };
  },

  // Get single timetable entry
  getTimetable: async (id) => {
    const response = await apiConnector("GET", `/api/v1/timetable/${id}`);
    return response.data;
  },

  // Update timetable entry
  updateTimetable: async (id, data) => {
    const response = await apiConnector("PUT", `/api/v1/timetable/${id}`, data);
    return response.data;
  },

  // Delete timetable entry
  deleteTimetable: async (id) => {
    const response = await apiConnector("DELETE", `/api/v1/timetable/${id}`);
    return response.data;
  },

  // Get dropdown data with error handling for each endpoint
  getDropdownData: async () => {
    try {
      console.log('Fetching dropdown data...');
      
      // Helper function to safely fetch data
      const safeFetch = async (endpoint, isTeacher = false) => {
        try {
          // For teachers, request raw array response
          const url = isTeacher ? `${endpoint}?raw=true` : endpoint;
          const response = await apiConnector("GET", url);
          
          // Handle different response structures
          if (Array.isArray(response.data)) {
            return response.data; // Raw array response
          } else if (response.data && Array.isArray(response.data.data)) {
            return response.data.data; // Standard API response
          } else if (response.data && response.data.data && Array.isArray(response.data.data.docs)) {
            return response.data.data.docs; // Paginated response
          }
          return [];
        } catch (error) {
          console.error(`Error fetching ${endpoint}:`, error);
          return [];
        }
      };
      
      // Fetch all data in parallel
      const [
        sessions, 
        schools, 
        subjects, 
        teachers, 
        courses
      ] = await Promise.all([
        safeFetch("/api/v1/ugpg/sessions"),
        safeFetch("/api/v1/ugpg/schools"),
        safeFetch("/api/v1/ugpg/subjects"),
        safeFetch("/api/v1/teachers", true), // Request raw array for teachers
        safeFetch("/api/v1/ugpg/courses")
      ]);

      console.log('Dropdown data loaded:', {
        sessions: sessions.length,
        schools: schools.length,
        subjects: subjects.length,
        teachers: teachers.length,
        courses: courses.length
      });

      return {
        sessions,
        schools,
        subjects,
        teachers,
        courses
      };
      
    } catch (error) {
      console.error('Error fetching dropdown data:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      
      // Return empty data structure to prevent UI errors
      return {
        sessions: [],
        schools: [],
        subjects: [],
        teachers: [],
        courses: []
      };
    }
  },

  // Helper function to safely fetch data from an endpoint
  safeFetch: async (endpoint) => {
    try {
      const response = await apiConnector("GET", endpoint);
      return response?.data?.data || [];
    } catch (error) {
      console.warn(`Failed to fetch from ${endpoint}:`, error.message);
      return []; // Return empty array instead of failing the whole request
    }
  },

  // Get dropdown data with error handling for each endpoint
  getDropdownDataOriginal: async () => {
    // Helper function to safely fetch data from an endpoint
    const safeFetch = async (endpoint) => {
      try {
        const response = await apiConnector("GET", endpoint);
        return response?.data?.data || [];
      } catch (error) {
        console.warn(`Failed to fetch from ${endpoint}:`, error.message);
        return []; // Return empty array instead of failing the whole request
      }
    };

    try {
      // Fetch all data in parallel
      const [
        sessions,
        schools,
        subjects,
        teachers,
        courses
      ] = await Promise.all([
        safeFetch("/api/v1/ugpg/sessions"),
        safeFetch("/api/v1/ugpg/schools"),
        safeFetch("/api/v1/ugpg/subjects"),
        safeFetch("/api/v1/ugpg/teachers"), // This will now fail gracefully
        safeFetch("/api/v1/ugpg/courses")
      ]);

      console.log('Fetched data:', {
        sessions: sessions.length,
        schools: schools.length,
        subjects: subjects.length,
        teachers: teachers.length,
        courses: courses.length
      });

      return {
        sessions,
        schools,
        subjects,
        teachers,
        courses
      };
    } catch (error) {
      console.error('Unexpected error in getDropdownData:', error);
      // Return empty arrays for all fields in case of unexpected errors
      return {
        sessions: [],
        schools: [],
        subjects: [],
        teachers: [],
        courses: []
      };
    }
  }
};

export default TIMETABLE_API;
