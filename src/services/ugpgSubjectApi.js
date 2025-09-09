import { apiConnector } from "./apiConnector";

const BASE = "/api/v1/ugpg/subjects";

export const listUGPGSubjects = (params) => apiConnector("GET", `${BASE}`, null, null, params);
export const createUGPGSubject = (payload) => apiConnector("POST", `${BASE}`, payload);
export const getUGPGSubject = (id) => apiConnector("GET", `${BASE}/${id}`);
export const updateUGPGSubject = (id, payload) => apiConnector("PATCH", `${BASE}/${id}`, payload);
export const deleteUGPGSubject = (id) => apiConnector("DELETE", `${BASE}/${id}`);
