import { apiConnector } from "./apiConnector";

const UGPG_SCHOOL_API = "/api/v1/ugpg/schools";

export const listUGPGSchools = async (params = {}) => {
  try {
    const response = await apiConnector("GET", UGPG_SCHOOL_API, null, { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching UG/PG schools:", error);
    throw error;
  }
};

export const createUGPGSchool = async (data) => {
  try {
    const response = await apiConnector("POST", UGPG_SCHOOL_API, data);
    return response.data;
  } catch (error) {
    console.error("Error creating UG/PG school:", error);
    throw error;
  }
};

export const updateUGPGSchool = async (id, data) => {
  try {
    const response = await apiConnector("PATCH", `${UGPG_SCHOOL_API}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating UG/PG school ${id}:`, error);
    throw error;
  }
};

export const deleteUGPGSchool = async (id) => {
  try {
    const response = await apiConnector("DELETE", `${UGPG_SCHOOL_API}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting UG/PG school ${id}:`, error);
    throw error;
  }
};
