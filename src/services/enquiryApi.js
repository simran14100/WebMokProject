import { apiConnector } from "./apiConnector";

const BASE_URL = "/api/v1/enquiry";

export const listEnquiries = (params) =>
  apiConnector("GET", `${BASE_URL}/`, null, null, params);

export const createEnquiry = (data) =>
  apiConnector("POST", `${BASE_URL}/`, data);

export const updateEnquiry = (id, data) =>
  apiConnector("PUT", `${BASE_URL}/${id}`, data);

export const deleteEnquiry = (id) =>
  apiConnector("DELETE", `${BASE_URL}/${id}`);

export const submitPublicEnquiry = (data) =>
  apiConnector("POST", `${BASE_URL}/public`, data);