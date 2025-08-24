import { apiConnector } from "./apiConnector";

const BASE = "/api/v1/department";

export const listDepartments = () => apiConnector("GET", `${BASE}`);

export const createDepartment = (payload) => apiConnector("POST", `${BASE}`, payload);

export const updateDepartment = (id, payload) => apiConnector("PATCH", `${BASE}/${id}`, payload);

export const deleteDepartment = (id) => apiConnector("DELETE", `${BASE}/${id}`);
