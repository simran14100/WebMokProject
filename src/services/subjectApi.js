import { apiConnector } from "./apiConnector";

const BASE = "/api/v1/subject";

export const listSubjects = (params) => apiConnector("GET", `${BASE}`, null, null, params);

export const createSubject = (payload) => apiConnector("POST", `${BASE}`, payload);

export const updateSubject = (id, payload) => apiConnector("PATCH", `${BASE}/${id}`, payload);

export const deleteSubject = (id) => apiConnector("DELETE", `${BASE}/${id}`);
