import { apiConnector } from "./apiConnector";

const BASE = "/api/v1/session";

export const listSessions = () => apiConnector("GET", `${BASE}`);

export const createSession = (payload) => apiConnector("POST", `${BASE}`, payload);

export const updateSession = (id, payload) => apiConnector("PATCH", `${BASE}/${id}`, payload);

export const deleteSession = (id) => apiConnector("DELETE", `${BASE}/${id}`);
