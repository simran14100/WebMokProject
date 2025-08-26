import { apiConnector } from "./apiConnector";

const BASE = "/api/v1/ugpg-exam-session";

export const listExamSessions = () => apiConnector("GET", `${BASE}`);

export const createExamSession = (payload) => apiConnector("POST", `${BASE}`, payload);

export const updateExamSession = (id, payload) => apiConnector("PATCH", `${BASE}/${id}`, payload);

export const deleteExamSession = (id) => apiConnector("DELETE", `${BASE}/${id}`);
