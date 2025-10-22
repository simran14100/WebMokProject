import axios from 'axios';
import { apiConnector } from './apiConnector';

const BASE = "/api/v1/departments";

export const listDepartments = () => axios.get(`${process.env.REACT_APP_BASE_URL}${BASE}`);

export const createDepartment = (payload) => apiConnector("POST", `${BASE}`, payload);

export const updateDepartment = (id, payload) => apiConnector("PATCH", `${BASE}/${id}`, payload);

export const deleteDepartment = (id) => apiConnector("DELETE", `${BASE}/${id}`);
