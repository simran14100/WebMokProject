import { apiConnector } from "../apiConnector";
import { profile } from "../apis";
import { showError, showLoading, showSuccess, dismissToast } from "../../utils/toast";

// GET /api/v1/profile/assignments
export async function getStudentAssignments(token) {
  try {
    const res = await apiConnector(
      "GET",
      profile.STUDENT_ASSIGNMENTS_API,
      null,
      { Authorization: `Bearer ${token}` }
    );
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed to load assignments");
    return res.data.data || [];
  } catch (err) {
    showError(err?.response?.data?.message || err.message || "Failed to load assignments");
    throw err;
  }
}

// GET /api/v1/profile/assignments/:taskId
export async function getAssignmentDetail(taskId, token) {
  try {
    const url = `${profile.STUDENT_ASSIGNMENT_DETAIL_API}/${taskId}`;
    const res = await apiConnector("GET", url, null, { Authorization: `Bearer ${token}` });
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed to load assignment");
    return res.data.data;
  } catch (err) {
    showError(err?.response?.data?.message || err.message || "Failed to load assignment");
    throw err;
  }
}

// POST /api/v1/profile/assignments/:taskId/submit (multipart)
export async function submitAssignment({ taskId, token, submissionText, links = [], files = [] }) {
  const toastId = showLoading("Submitting assignment...");
  try {
    const form = new FormData();
    if (submissionText) form.append("submissionText", submissionText);
    if (Array.isArray(links)) {
      links.forEach((l) => form.append("links[]", l));
    }
    if (Array.isArray(files)) {
      files.forEach((f) => form.append("files", f));
    }
    const url = `${profile.STUDENT_ASSIGNMENT_SUBMIT_API}/${taskId}/submit`;
    const res = await apiConnector("POST", url, form, {
      Authorization: `Bearer ${token}`,
      // Let browser set correct multipart boundary
    });
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed to submit assignment");
    showSuccess("Assignment submitted successfully");
    return res.data.data;
  } catch (err) {
    showError(err?.response?.data?.message || err.message || "Failed to submit assignment");
    throw err;
  } finally {
    dismissToast(toastId);
  }
}
