import { apiConnector } from "./apiConnector";

const TEACHER_API = "/api/v1/teachers";

export const teacherApi = {
  // Create a new teacher
  createTeacher: async (teacherData) => {
    return apiConnector("POST", TEACHER_API, teacherData);
  },

  // Get all teachers with pagination and search
  getTeachers: async (params = {}) => {
    return apiConnector("GET", TEACHER_API, null, {}, params);
  },

  // Get single teacher by ID
  getTeacher: async (id) => {
    return apiConnector("GET", `${TEACHER_API}/${id}`);
  },

  // Update teacher
  updateTeacher: async (id, teacherData) => {
    return apiConnector("PUT", `${TEACHER_API}/${id}`, teacherData);
  },

  // Delete teacher (soft delete)
  deleteTeacher: async (id) => {
    return apiConnector("DELETE", `${TEACHER_API}/${id}`);
  },

  // Get all schools for dropdown
  getSchools: async () => {
    return apiConnector("GET", "/api/v1/ugpg/schools?limit=100");
  },

  // Get subjects by school
  getSubjectsBySchool: async (schoolId) => {
    return apiConnector("GET", `/api/v1/ugpg/subjects?school=${schoolId}&limit=100`);
  }
};

export default teacherApi;
