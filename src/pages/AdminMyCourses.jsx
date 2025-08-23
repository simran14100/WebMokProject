import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/common/DashboardLayout";
import { fetchInstructorCourses, fetchAdminCourses, deleteCourse } from "../services/operations/courseDetailsAPI";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { showError, showSuccess } from "../utils/toast";
import { ACCOUNT_TYPE } from "../utils/constants";

const ED_TEAL = "#07A698";
const ED_TEAL_DARK = "#059a8c";
const BORDER = "#e8ecf0";
const TEXT_DARK = "#2d3748";

// Helper: sum duration from nested subsections if explicit duration not present
const computeDuration = (course) => {
  if (!course) return "-";
  // Prefer explicit duration
  if (course.totalDuration) return course.totalDuration;
  const sections = course.courseContent || course.courseSection || course.sections || [];
  let totalSeconds = 0;
  sections.forEach((sec) => {
    const subs = sec?.subSection || sec?.subsections || sec?.lectures || [];
    subs.forEach((s) => {
      const t = s?.timeDuration || s?.duration || 0;
      // Support formats like "05:30" -> convert to seconds
      if (typeof t === "string") {
        const parts = t.split(":").map(Number);
        if (parts.length === 3) {
          totalSeconds += (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
        } else if (parts.length === 2) {
          totalSeconds += (parts[0] || 0) * 60 + (parts[1] || 0);
        } else {
          const n = Number(t);
          if (!Number.isNaN(n)) totalSeconds += n;
        }
      } else if (typeof t === "number") {
        totalSeconds += t;
      }
    });
  });
  if (!totalSeconds) return "-";
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${s}s`;
  return `${s}s`;
};

export default function AdminMyCourses() {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const isAdmin = user?.accountType === ACCOUNT_TYPE.ADMIN || user?.accountType === ACCOUNT_TYPE.SUPER_ADMIN;

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setLoading(true);
      setErrorMsg("");
      try {
        let list = [];
        const role = user?.accountType;
        console.log("[AdminMyCourses] user role:", role);
        if (isAdmin) {
          console.log("[AdminMyCourses] calling fetchAdminCourses");
          list = await fetchAdminCourses(token);
        } else if (role === ACCOUNT_TYPE.INSTRUCTOR) {
          console.log("[AdminMyCourses] calling fetchInstructorCourses");
          list = await fetchInstructorCourses(token);
        } else {
          console.warn("[AdminMyCourses] unsupported role for this page:", role);
        }
        console.log("[AdminMyCourses] fetched courses count:", Array.isArray(list) ? list.length : "n/a");
        setCourses(Array.isArray(list) ? list : []);
      } catch (e) {
        const msg = e?.message || "Failed to load courses";
        setErrorMsg(msg);
        showError(msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, user?._id, isAdmin, user?.accountType]);

  const handleDelete = async (courseId) => {
    if (!token) return;
    if (!window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) return;
    try {
      await deleteCourse({ courseId }, token);
      showSuccess("Course deleted");
      setCourses((prev) => prev.filter((c) => c._id !== courseId));
    } catch (e) {
      // deleteCourse already toasts
    }
  };

  const rows = useMemo(() => courses || [], [courses]);

  return (
   
    

    
   
        <DashboardLayout>
          <div
            style={{
              width: "calc(100% - 250px)",
              marginLeft: "250px",
              minHeight: "100vh",
              backgroundColor: "#f8fafc",
              padding: "6rem 1.5rem 2rem 1.5rem",
            }}
          >
            {/* Header */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: TEXT_DARK }}>
                My Courses
              </h2>
              <div style={{ fontSize: "0.875rem", color: "#718096" }}>
                Course / My Courses
              </div>
            </div>
    
            {/* Table container */}
            <div
              style={{
                backgroundColor: "#fff",
                borderRadius: "0.75rem",
                border: `1px solid ${BORDER}`,
                boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                overflow: "hidden",
              }}
            >
              <div style={{ overflowX: "auto" }}>
                <table style={{ minWidth: "100%", fontSize: "0.875rem", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: ED_TEAL, color: "#fff" }}>
                      <th style={{ textAlign: "left", fontWeight: 500, padding: "0.75rem 1rem" }}>Course</th>
                      <th style={{ textAlign: "left", fontWeight: 500, padding: "0.75rem 1rem" }}>Duration</th>
                      <th style={{ textAlign: "left", fontWeight: 500, padding: "0.75rem 1rem" }}>Price</th>
                      <th style={{ textAlign: "left", fontWeight: 500, padding: "0.75rem 1rem" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} style={{ padding: "1.5rem", textAlign: "center" }}>
                          Loading...
                        </td>
                      </tr>
                    ) : errorMsg ? (
                      <tr>
                        <td
                          colSpan={4}
                          style={{ padding: "1.5rem", textAlign: "center", color: "red" }}
                        >
                          {errorMsg}
                        </td>
                      </tr>
                    ) : rows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          style={{ padding: "1.5rem", textAlign: "center", color: "#718096" }}
                        >
                          No courses found.
                        </td>
                      </tr>
                    ) : (
                      rows.map((c) => {
                        const thumb =
                          c?.thumbnail || "/assets/img/default-course-thumbnail.jpg";
                        const title = c?.courseName || c?.name || "Untitled";
                        const duration = computeDuration(c);
                        const price =
                          typeof c?.price === "number" ? `₹${c.price}` : c?.price || "-";
                        const editPath =
                          user?.accountType === ACCOUNT_TYPE.INSTRUCTOR
                            ? `/instructor/edit-course/${c._id}`
                            : `/admin/course/edit/${c._id}`;
    
                        return (
                          <tr
                            key={c._id}
                            style={{
                              borderBottom: "1px solid #eef2f6",
                              cursor: "pointer",
                            }}
                            onMouseOver={(e) =>
                              (e.currentTarget.style.backgroundColor = "#f9fefb")
                            }
                            onMouseOut={(e) =>
                              (e.currentTarget.style.backgroundColor = "transparent")
                            }
                          >
                            {/* Course Info */}
                            <td style={{ padding: "0.75rem 1rem" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                <img
                                  src={thumb}
                                  alt={title}
                                  style={{
                                    width: "3.5rem",
                                    height: "2.5rem",
                                    objectFit: "cover",
                                    borderRadius: "0.375rem",
                                  }}
                                />
                                <div style={{ fontWeight: 600, color: TEXT_DARK }}>{title}</div>
                              </div>
                            </td>
    
                            {/* Duration */}
                            <td style={{ padding: "0.75rem 1rem", color: TEXT_DARK }}>{duration}</td>
    
                            {/* Price */}
                            <td style={{ padding: "0.75rem 1rem", color: TEXT_DARK }}>{price}</td>
    
                            {/* Actions */}
                            <td style={{ padding: "0.75rem 1rem" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                {/* Edit Button */}
                                <button
                                  title="Edit"
                                  onClick={() => navigate(editPath)}
                                  style={{
                                    padding: "0.5rem",
                                    borderRadius: "0.5rem",
                                    border: "1px solid #e0e5eb",
                                    background: "transparent",
                                    cursor: "pointer",
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = ED_TEAL;
                                    e.currentTarget.style.color = "#fff";
                                    e.currentTarget.style.border = `1px solid ${ED_TEAL}`;
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                    e.currentTarget.style.color = "inherit";
                                    e.currentTarget.style.border = "1px solid #e0e5eb";
                                  }}
                                >
                                  <FiEdit2 size={16} />
                                </button>
    
                                {/* Delete Button */}
                                <button
                                  title="Delete"
                                  onClick={() => handleDelete(c._id)}
                                  style={{
                                    padding: "0.5rem",
                                    borderRadius: "0.5rem",
                                    border: "1px solid #e0e5eb",
                                    background: "transparent",
                                    color: "red",
                                    cursor: "pointer",
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = "#fee2e2";
                                    e.currentTarget.style.border = "1px solid #fca5a5";
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                    e.currentTarget.style.border = "1px solid #e0e5eb";
                                  }}
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </DashboardLayout>
    

    
  );
}
