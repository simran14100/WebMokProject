import { apiConnector } from "./apiConnector";

const UGPG_COURSE_API = "/api/v1/ugpg/courses";

export const listUGPGCourses = async (params = {}) => {
  try {
    const response = await apiConnector("GET", UGPG_COURSE_API, null, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching UG/PG courses:", error);
    throw error;
  }
};

export const getUGPGCourseById = async (id) => {
  try {
    const response = await apiConnector("GET", `${UGPG_COURSE_API}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching UG/PG course ${id}:`, error);
    throw error;
  }
};

export const createUGPGCourse = async (data) => {
  try {
    const response = await apiConnector("POST", UGPG_COURSE_API, data);
    return response.data;
  } catch (error) {
    console.error("Error creating UG/PG course:", error);
    throw error;
  }
};

export const updateUGPGCourse = async (id, data) => {
  try {
    const response = await apiConnector("PATCH", `${UGPG_COURSE_API}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating UG/PG course ${id}:`, error);
    throw error;
  }
};

export const deleteUGPGCourse = async (id) => {
  try {
    const response = await apiConnector("DELETE", `${UGPG_COURSE_API}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting UG/PG course ${id}:`, error);
    throw error;
  }
};
