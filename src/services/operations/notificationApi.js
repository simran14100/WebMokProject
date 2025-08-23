import { apiConnector } from "../apiConnector";
import { admin, profile } from "../apis";
import { showError, showLoading, showSuccess, dismissToast } from "../../utils/toast";

// Admin: create notification { title, message }
export async function createNotification(token, { title, message }) {
  const toastId = showLoading("Posting notification...");
  try {
    const res = await apiConnector(
      "POST",
      admin.CREATE_NOTIFICATION_API,
      { title, message },
      { Authorization: `Bearer ${token}` }
    );
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed to post notification");
    showSuccess("Notification posted");
    return res.data.data;
  } catch (err) {
    showError(err?.response?.data?.message || err.message || "Failed to post notification");
    throw err;
  } finally {
    dismissToast(toastId);
  }
}

// Admin: list notifications (desc by createdAt expected from backend)
export async function listAdminNotifications(token) {
  try {
    const res = await apiConnector("GET", admin.LIST_NOTIFICATIONS_API, null, { Authorization: `Bearer ${token}` });
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed to fetch notifications");
    return res.data.data || [];
  } catch (err) {
    showError(err?.response?.data?.message || err.message || "Failed to fetch notifications");
    throw err;
  }
}

// Admin: delete notification by id
export async function deleteNotification(token, id) {
  const toastId = showLoading("Deleting notification...");
  try {
    const url = `${admin.DELETE_NOTIFICATION_API}/${id}`;
    const res = await apiConnector("DELETE", url, null, { Authorization: `Bearer ${token}` });
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed to delete notification");
    showSuccess("Notification deleted");
    return true;
  } catch (err) {
    showError(err?.response?.data?.message || err.message || "Failed to delete notification");
    throw err;
  } finally {
    dismissToast(toastId);
  }
}

// Student: list notifications (latest first)
export async function listStudentNotifications(token) {
  try {
    const res = await apiConnector("GET", profile.STUDENT_NOTIFICATIONS_API, null, { Authorization: `Bearer ${token}` });
    if (!res?.data?.success) throw new Error(res?.data?.message || "Failed to fetch notifications");
    return res.data.data || [];
  } catch (err) {
    showError(err?.response?.data?.message || err.message || "Failed to fetch notifications");
    throw err;
  }
}
