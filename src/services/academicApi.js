import { apiConnector } from './apiConnector';

// Base path for academic API
const ACADEMIC_API = {
  GET_SCHOOLS: '/api/v1/academic/schools',
  GET_SUBJECTS_BY_SCHOOL: (schoolId) => `/api/v1/academic/subjects/${schoolId}`,
  GET_ACADEMIC_SESSIONS: '/api/v1/academic/sessions'
};

// Get all schools
export const getSchools = async () => {
  try {
    const response = await apiConnector('GET', ACADEMIC_API.GET_SCHOOLS);
    return response.data;
  } catch (error) {
    console.error('Error fetching schools:', error);
    throw error;
  }
};

// Get subjects by school ID
export const getSubjectsBySchool = async (schoolId) => {
  try {
    const response = await apiConnector('GET', ACADEMIC_API.GET_SUBJECTS_BY_SCHOOL(schoolId));
    return response.data;
  } catch (error) {
    console.error(`Error fetching subjects for school ${schoolId}:`, error);
    throw error;
  }
};

// Get all academic sessions
export const getAcademicSessions = async () => {
  try {
    const response = await apiConnector('GET', ACADEMIC_API.GET_ACADEMIC_SESSIONS);
    return response.data;
  } catch (error) {
    console.error('Error fetching academic sessions:', error);
    throw error;
  }
};
