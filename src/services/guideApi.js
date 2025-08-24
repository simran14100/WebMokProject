import { apiConnector } from "./apiConnector";

const BASE = "/api/v1/guide";

export async function listGuides({ page = 1, limit = 10, search = "" } = {}, token) {
  const qs = new URLSearchParams({ page, limit, search }).toString();
  const res = await apiConnector("GET", `${BASE}?${qs}`, null, { Authorization: `Bearer ${token}` });
  return res?.data || res;
}

export async function createGuide(body, token) {
  const res = await apiConnector("POST", BASE, body, { Authorization: `Bearer ${token}`, "Content-Type": "application/json" });
  return res?.data || res;
}

export async function updateGuide(id, body, token) {
  const res = await apiConnector("PATCH", `${BASE}/${id}`, body, { Authorization: `Bearer ${token}`, "Content-Type": "application/json" });
  return res?.data || res;
}

export async function deleteGuide(id, token) {
  const res = await apiConnector("DELETE", `${BASE}/${id}`, null, { Authorization: `Bearer ${token}` });
  return res?.data || res;
}
