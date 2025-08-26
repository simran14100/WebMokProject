import { apiConnector } from "./apiConnector";

const BASE = "/api/v1/ugpg-paper";

export const listUGPGPapers = (params) => apiConnector("GET", `${BASE}`, null, null, params);
export const createUGPGPaper = (payload) => apiConnector("POST", `${BASE}`, payload);
export const getUGPGPaper = (id) => apiConnector("GET", `${BASE}/${id}`);
export const updateUGPGPaper = (id, payload) => apiConnector("PATCH", `${BASE}/${id}`, payload);
export const deleteUGPGPaper = (id) => apiConnector("DELETE", `${BASE}/${id}`);
