import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import DashboardLayout from "../../../common/DashboardLayout";
import { getBatchById, updateBatch, deleteBatch, getAllInstructors, getRegisteredUsers, getEnrolledStudents, listBatchStudents, addStudentToBatch, removeStudentFromBatch } from "../../../../services/operations/adminApi";
import { showError, showSuccess, showLoading, dismissToast } from "../../../../utils/toast";

// Style constants (kept consistent with Batch pages)
const ED_TEAL = "#07A698";
const ED_TEAL_DARK = "#059a8c";
const TEXT_DARK = "#2d3748";
const TEXT_LIGHT = "#718096";
const BG_LIGHT = "#f8fafc";
const BORDER_COLOR = "#e2e8f0";

const TABS = [
  { key: "info", label: "Info" },
  { key: "trainer", label: "Trainer" },
  { key: "student", label: "Student" },
  { key: "courses", label: "Courses" },
  { key: "live", label: "Live Classes" },
  { key: "attendance", label: "Attendance" },
  { key: "exam", label: "Exam" },
  { key: "feedback", label: "Feedback" },
  { key: "driver", label: "Driver Marking" },
];

export default function EditPage() {
  const { batchId } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.profile.user);
  const token = useSelector((state) => state.auth.token);
  const isAdmin = user?.accountType === "Admin";

  const [activeTab, setActiveTab] = useState("info");
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");

  // Instructors modal state
  const [showInstructorModal, setShowInstructorModal] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [instructorsLoading, setInstructorsLoading] = useState(false);
  const [instructorsError, setInstructorsError] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [pageIndex, setPageIndex] = useState(0); // zero-based page index for client-side pagination

  // Assigned instructors (local list for UI; backend wiring can be added later)
  const [assignedInstructors, setAssignedInstructors] = useState([]);

  // Student tab (UI-only for now)
  const [students, setStudents] = useState([]); // expected shape: {_id,id,name,email,phone}
  const [studentRowsPerPage, setStudentRowsPerPage] = useState(5);
  const [studentPageIndex, setStudentPageIndex] = useState(0);
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());

  // Add Student modal state
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [allStudents, setAllStudents] = useState([]); // pool to pick from
  const [studentModalLoading, setStudentModalLoading] = useState(false);
  const [studentModalError, setStudentModalError] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [pickRowsPerPage, setPickRowsPerPage] = useState(5);
  const [pickPageIndex, setPickPageIndex] = useState(0);

  const toggleSelectAllStudents = () => {
    if (students.length === 0) return;
    const pageSlice = students.slice(
      studentPageIndex * studentRowsPerPage,
      studentPageIndex * studentRowsPerPage + studentRowsPerPage
    );
    const pageIds = pageSlice.map((s) => s._id || s.id);
    const allSelected = pageIds.every((id) => selectedStudentIds.has(id));
    const next = new Set(selectedStudentIds);
    if (allSelected) {
      pageIds.forEach((id) => next.delete(id));
    } else {
      pageIds.forEach((id) => id && next.add(id));
    }
    setSelectedStudentIds(next);
  };

  const toggleSelectStudent = (id) => {
    if (!id) return;
    const next = new Set(selectedStudentIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedStudentIds(next);
  };

  const onDownloadAllStudents = () => {
    showSuccess("Download coming soon");
  };

  const onAddStudent = async () => {
    // Open modal and fetch candidates
    setShowStudentModal(true);
    setStudentModalLoading(true);
    setStudentModalError("");
    try {
      // Fetch registered users (admin-level) and enrolled students (paid)
      const [registered, enrolled] = await Promise.all([
        getRegisteredUsers(token).catch(() => []),
        getEnrolledStudents(token).catch(() => []),
      ]);

      // Normalize arrays defensively
      const regArr = Array.isArray(registered?.users || registered?.data || registered) ? (registered.users || registered.data || registered) : [];
      const enrArr = Array.isArray(enrolled?.students || enrolled?.data || enrolled) ? (enrolled.students || enrolled.data || enrolled) : [];

      // Merge and filter possible students
      const merged = [...regArr, ...enrArr];
      const map = new Map();
      for (const u of merged) {
        const id = u._id || u.id || u.userId || u.email; // fallback to email for uniqueness
        if (!id) continue;
        // Only include Students if accountType is provided, otherwise include and let UI display
        if (u.accountType && String(u.accountType).toLowerCase() !== "student") continue;
        if (!map.has(id)) map.set(id, u);
      }
      const list = Array.from(map.values());
      setAllStudents(list);
      setPickPageIndex(0);
    } catch (e) {
      setStudentModalError(e?.message || "Failed to load students");
      showError(e?.message || "Failed to load students");
    } finally {
      setStudentModalLoading(false);
    }
  };

  const onRemoveAllStudents = () => {
    if (students.length === 0) return;
    const ok = window.confirm("Remove all students from this batch?");
    if (!ok) return;
    // UI-only reset for now
    setStudents([]);
    setSelectedStudentIds(new Set());
    showSuccess("All students removed (UI only)");
  };

  const removeStudent = async (id) => {
    if (!id || !batchId) return;
    try {
      await removeStudentFromBatch(batchId, id, token);
      setStudents((prev) => prev.filter((s) => (s._id || s.id || s.userId) !== id));
      setSelectedStudentIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      showSuccess("Student removed from batch");
    } catch (e) {
      showError(e?.message || "Failed to remove student");
    }
  };

  useEffect(() => {
    if (!batchId || !token || !isAdmin) return;
    let mounted = true;
    setLoading(true);
    setError("");
    getBatchById(batchId, token)
      .then((data) => {
        if (mounted) {
          setBatch(data);
          setName(data?.name || "");
          setDepartment(data?.department || "");
          // initialize assigned instructors if backend sends it
          if (Array.isArray(data?.trainers)) {
            setAssignedInstructors(data.trainers);
          }
          // Fetch assigned students for this batch
          listBatchStudents(batchId, token)
            .then((list) => {
              if (!mounted) return;
              const arr = Array.isArray(list) ? list : [];
              setStudents(arr);
              setSelectedStudentIds(new Set());
            })
            .catch((e) => {
              if (!mounted) return;
              showError(e?.message || "Failed to load batch students");
            });
        }
      })
      .catch((e) => {
        if (mounted) {
          setError(e?.message || "Failed to fetch batch details");
          showError(e?.message || "Failed to fetch batch details");
        }
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [batchId, token, isAdmin]);

  const openInstructorModal = async () => {
    setShowInstructorModal(true);
    // Fetch only once per open
    setInstructorsLoading(true);
    setInstructorsError("");
    try {
      const data = await getAllInstructors();
      setInstructors(Array.isArray(data) ? data : []);
      setPageIndex(0);
    } catch (e) {
      setInstructorsError(e?.message || "Failed to load instructors");
      showError(e?.message || "Failed to load instructors");
    } finally {
      setInstructorsLoading(false);
    }
  };

  const closeInstructorModal = () => {
    setShowInstructorModal(false);
  };

  // Add/remove handlers for assigned instructors (UI only for now)
  const addInstructorToBatch = (ins) => {
    const id = ins._id || ins.id || ins.userId;
    if (!id) return;
    setAssignedInstructors((prev) => {
      const exists = prev.some((p) => (p._id || p.id || p.userId) === id);
      if (exists) return prev;
      return [...prev, ins];
    });
    showSuccess("Instructor added to list");
  };

  const removeInstructorFromBatch = (id) => {
    setAssignedInstructors((prev) => prev.filter((p) => (p._id || p.id || p.userId) !== id));
  };

  const clearAllInstructors = () => {
    if (assignedInstructors.length === 0) return;
    const ok = window.confirm("Remove all assigned instructors?");
    if (!ok) return;
    setAssignedInstructors([]);
  };

  // Handlers
  const onEditToggle = () => {
    if (!batch) return;
    setIsEditing((prev) => !prev);
  };

  const onSave = async () => {
    // Build a payload with only changed, non-empty fields
    const payload = {};
    const trimmedName = name.trim();
    const trimmedDept = department.trim();

    if (trimmedName && trimmedName !== (batch?.name || "")) {
      payload.name = trimmedName;
    }
    if (trimmedDept && trimmedDept !== (batch?.department || "")) {
      payload.department = trimmedDept;
    }

    if (Object.keys(payload).length === 0) {
      showError("Nothing to update");
      return;
    }
    // Validate department client-side to avoid 400s
    if (payload.department) {
      const allowed = ["skilling", "training", "personality"]; // backend expects lowercase
      const normalized = payload.department.toLowerCase();
      if (!allowed.includes(normalized)) {
        showError(`Department must be one of: ${allowed.join(", ")}`);
        return;
      }
      payload.department = normalized;
    }
    console.log("Submitting batch update payload:", payload);
    const toastId = showLoading("Saving changes...");
    try {
      const updated = await updateBatch(batchId, payload, token);
      setBatch(updated);
      setIsEditing(false);
      showSuccess("Batch updated successfully");
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Failed to update batch";
      showError(msg);
    } finally {
      dismissToast(toastId);
    }
  };

  const onDelete = async () => {
    if (!batch) return;
    const confirmDelete = window.confirm(`Delete batch "${batch?.name}"? This action cannot be undone.`);
    if (!confirmDelete) return;
    const toastId = showLoading("Deleting batch...");
    try {
      await deleteBatch(batchId, token);
      showSuccess("Batch deleted successfully");
      navigate("/admin/batches");
    } catch (e) {
      showError(e?.message || "Failed to delete batch");
    } finally {
      dismissToast(toastId);
    }
  };

  return (
    <DashboardLayout>
      <div
        style={{
          width: "calc(100% - 250px)",
          marginLeft: "250px",
          minHeight: "100vh",
          backgroundColor: BG_LIGHT,
          padding: "2rem",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 600,
              color: TEXT_DARK,
              margin: 0,
              marginBottom: "0.5rem",
            }}
          >
            Student Details
          </h2>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              fontSize: "0.875rem",
              color: TEXT_LIGHT,
            }}
          >
            <span>Batch</span>
            <span style={{ color: BORDER_COLOR }}>/</span>
            <span style={{ color: ED_TEAL, fontWeight: 500 }}>Batch Details</span>
          </div>
        </div>

        {/* Card */}
        <div
          style={{
            backgroundColor: "white",
            border: `1px solid ${BORDER_COLOR}`,
            borderRadius: "0.5rem",
            padding: "1rem",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: "flex",
              gap: "1.25rem",
              padding: "0.5rem 0.25rem",
              borderBottom: `1px solid ${BORDER_COLOR}`,
              marginBottom: "1rem",
              overflowX: "auto",
            }}
          >
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "0.5rem 0.25rem",
                  cursor: "pointer",
                  color: activeTab === t.key ? TEXT_DARK : TEXT_LIGHT,
                  fontWeight: activeTab === t.key ? 600 : 500,
                  position: "relative",
                  whiteSpace: "nowrap",
                }}
              >
                {t.label}
                {activeTab === t.key && (
                  <span
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      bottom: -8,
                      height: 3,
                      backgroundColor: "#3b82f6", // blue underline as in screenshot
                      borderRadius: 999,
                    }}
                  />
                )}
              </button>
            ))}
          </div>
          {/* Add Student Modal */}
          {showStudentModal && (
            <div
              role="dialog"
              aria-modal="true"
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 50,
              }}
              onClick={() => setShowStudentModal(false)}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "min(920px, 92vw)",
                  background: "#fff",
                  borderRadius: 12,
                  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
                  border: `1px solid ${BORDER_COLOR}`,
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: "1rem 1.25rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>
                  <h3 style={{ margin: 0, fontSize: "1rem", color: TEXT_DARK, fontWeight: 600 }}>Add Students</h3>
                </div>
                <div style={{ padding: "1rem 1.25rem" }}>
                  <h2 style={{ textAlign: "center", marginTop: 0, marginBottom: 16, fontSize: "1.5rem", fontWeight: 700, color: TEXT_DARK }}>
                    All Students
                  </h2>

                  {/* Search */}
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                    <input
                      value={studentSearch}
                      onChange={(e) => { setStudentSearch(e.target.value); setPickPageIndex(0); }}
                      placeholder="Search Student"
                      style={{ width: "min(520px, 90%)", padding: "0.6rem 0.8rem", border: `1px solid ${BORDER_COLOR}`, borderRadius: 8 }}
                    />
                  </div>

                  {studentModalLoading ? (
                    <div style={{ color: TEXT_LIGHT, padding: "2rem", textAlign: "center" }}>Loading students...</div>
                  ) : studentModalError ? (
                    <div style={{ color: "#ef4444", padding: "1rem", textAlign: "center" }}>{studentModalError}</div>
                  ) : (
                    <>
                      <div
                        style={{
                          border: `1px solid ${BORDER_COLOR}`,
                          borderRadius: 8,
                          overflow: "hidden",
                        }}
                      >
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead style={{ backgroundColor: "#f9fafb", textAlign: "left" }}>
                            <tr>
                              <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>ID</th>
                              <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Full name</th>
                              <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Email</th>
                              <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Mobile</th>
                              <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(() => {
                              const q = studentSearch.trim().toLowerCase();
                              let data = Array.isArray(allStudents) ? allStudents : [];
                              if (q) {
                                data = data.filter((u) => {
                                  const name = u.name || [u.firstName, u.lastName].filter(Boolean).join(" ") || "";
                                  const email = u.email || "";
                                  const phone = u.phone || u.mobile || u.contactNumber || "";
                                  return (
                                    String(name).toLowerCase().includes(q) ||
                                    String(email).toLowerCase().includes(q) ||
                                    String(phone).toLowerCase().includes(q)
                                  );
                                });
                              }
                              const total = data.length;
                              const page = data.slice(pickPageIndex * pickRowsPerPage, pickPageIndex * pickRowsPerPage + pickRowsPerPage);
                              return page.length === 0 ? (
                                <tr>
                                  <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: TEXT_LIGHT }}>No students</td>
                                </tr>
                              ) : (
                                page.map((u) => {
                                  const id = u._id || u.id || u.userId || "—";
                                  const name = u.name || [u.firstName, u.lastName].filter(Boolean).join(" ") || "—";
                                  const email = u.email || "—";
                                  const phone = u.phone || u.mobile || u.contactNumber || "—";
                                  const already = students.some((s) => (s._id || s.id || s.userId) === (u._id || u.id || u.userId));
                                  return (
                                    <tr key={`${id}-${email}`} style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                                      <td style={{ padding: "0.75rem" }}>{String(id).slice(-6)}</td>
                                      <td style={{ padding: "0.75rem" }}>{name}</td>
                                      <td style={{ padding: "0.75rem" }}>{email}</td>
                                      <td style={{ padding: "0.75rem" }}>{phone}</td>
                                      <td style={{ padding: "0.75rem" }}>
                                        <button
                                          disabled={already}
                                          onClick={async () => {
                                            if (already) return;
                                            try {
                                              const sid = u._id || u.id || u.userId;
                                              if (!sid) throw new Error("Invalid student id");
                                              await addStudentToBatch(batchId, sid, token);
                                              setStudents((prev) => {
                                                const exists = prev.some((p) => (p._id || p.id || p.userId) === sid);
                                                if (exists) return prev;
                                                return [...prev, u];
                                              });
                                              showSuccess("Student assigned to batch");
                                            } catch (err) {
                                              showError(err?.response?.data?.message || err?.message || "Failed to add student");
                                            }
                                          }}
                                          style={{
                                            backgroundColor: already ? "#9ca3af" : "#22c55e",
                                            color: "#fff",
                                            border: "none",
                                            padding: "0.25rem 0.75rem",
                                            borderRadius: 6,
                                            cursor: already ? "not-allowed" : "pointer",
                                            fontWeight: 600,
                                          }}
                                        >
                                          {already ? "Added" : "Add"}
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })
                              );
                            })()}
                          </tbody>
                        </table>

                        {/* Pagination footer */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.75rem", borderTop: `1px solid ${BORDER_COLOR}` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ color: TEXT_LIGHT }}>Rows per page:</span>
                            <select value={pickRowsPerPage} onChange={(e) => { setPickRowsPerPage(Number(e.target.value)); setPickPageIndex(0); }} style={{ padding: "0.25rem 0.5rem", borderRadius: 6, border: `1px solid ${BORDER_COLOR}` }}>
                              <option value={5}>5</option>
                              <option value={10}>10</option>
                              <option value={20}>20</option>
                            </select>
                          </div>
                          <div style={{ color: TEXT_LIGHT }}>
                            {(() => {
                              const q = studentSearch.trim().toLowerCase();
                              let data = Array.isArray(allStudents) ? allStudents : [];
                              if (q) {
                                data = data.filter((u) => {
                                  const name = u.name || [u.firstName, u.lastName].filter(Boolean).join(" ") || "";
                                  const email = u.email || "";
                                  const phone = u.phone || u.mobile || u.contactNumber || "";
                                  return (
                                    String(name).toLowerCase().includes(q) ||
                                    String(email).toLowerCase().includes(q) ||
                                    String(phone).toLowerCase().includes(q)
                                  );
                                });
                              }
                              const total = data.length;
                              const start = total ? pickPageIndex * pickRowsPerPage + 1 : 0;
                              const end = Math.min((pickPageIndex + 1) * pickRowsPerPage, total);
                              return (
                                <>
                                  {start}-{end} of {total}
                                </>
                              );
                            })()}
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => setPickPageIndex((p) => Math.max(0, p - 1))} style={{ padding: "0.25rem 0.5rem", borderRadius: 6, border: `1px solid ${BORDER_COLOR}`, background: "#fff", cursor: "pointer" }}>&lt;</button>
                            <button onClick={() => setPickPageIndex((p) => (p + 1) * pickRowsPerPage < ((studentSearch?allStudents.filter((u)=>{const name=u.name||[u.firstName,u.lastName].filter(Boolean).join(" ")||"";const email=u.email||"";const phone=u.phone||u.mobile||u.contactNumber||"";return name.toLowerCase().includes(studentSearch.toLowerCase())||email.toLowerCase().includes(studentSearch.toLowerCase())||String(phone).toLowerCase().includes(studentSearch.toLowerCase());}):allStudents).length) ? p + 1 : p)} style={{ padding: "0.25rem 0.5rem", borderRadius: 6, border: `1px solid ${BORDER_COLOR}`, background: "#fff", cursor: "pointer" }}>&gt;</button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div style={{ padding: "0.75rem 1.25rem", display: "flex", justifyContent: "flex-end", borderTop: `1px solid ${BORDER_COLOR}` }}>
                  <button onClick={() => setShowStudentModal(false)} style={{ backgroundColor: "#7c3aed", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: 8, cursor: "pointer" }}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Student section */}
          {activeTab === "student" && (
            <div style={{ minHeight: 300 }}>
              {/* Header row with title and actions */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: TEXT_DARK, margin: 0, width: "100%", textAlign: "center" }}>
                  Assign To Student
                </h2>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <button
                  onClick={onDownloadAllStudents}
                  style={{
                    backgroundColor: "#0ea5e9", // sky blue
                    color: "#fff",
                    padding: "0.5rem 1rem",
                    borderRadius: 6,
                    border: "none",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Download All Student File
                </button>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    onClick={onAddStudent}
                    style={{
                      backgroundColor: "#7c3aed", // purple
                      color: "#fff",
                      padding: "0.5rem 1rem",
                      borderRadius: 6,
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Add Student
                  </button>
                  <button
                    onClick={onRemoveAllStudents}
                    style={{
                      backgroundColor: "#ef4444", // red
                      color: "#fff",
                      padding: "0.5rem 1rem",
                      borderRadius: 6,
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Remove All Student
                  </button>
                </div>
              </div>

              {/* Table */}
              <div
                style={{
                  border: `1px solid ${BORDER_COLOR}`,
                  borderRadius: 8,
                  overflow: "hidden",
                }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead style={{ backgroundColor: "#f9fafb", textAlign: "left" }}>
                    <tr>
                      <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>
                        <input type="checkbox" onChange={toggleSelectAllStudents} />
                      </th>
                      <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>ID</th>
                      <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Full name</th>
                      <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Email</th>
                      <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Mobile</th>
                      <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Assessment</th>
                      <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "2rem", color: TEXT_LIGHT }}>
                          No rows
                        </td>
                      </tr>
                    ) : (
                      students
                        .slice(studentPageIndex * studentRowsPerPage, studentPageIndex * studentRowsPerPage + studentRowsPerPage)
                        .map((stu) => {
                          const id = stu._id || stu.id || "—";
                          const name = stu.name || [stu.firstName, stu.lastName].filter(Boolean).join(" ") || "—";
                          const email = stu.email || "—";
                          const phone = stu.phone || stu.mobile || stu.contactNumber || "—";
                          const checked = selectedStudentIds.has(stu._id || stu.id);
                          return (
                            <tr key={id} style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                              <td style={{ padding: "0.75rem" }}>
                                <input type="checkbox" checked={checked} onChange={() => toggleSelectStudent(stu._id || stu.id)} />
                              </td>
                              <td style={{ padding: "0.75rem" }}>{String(id).slice(-6)}</td>
                              <td style={{ padding: "0.75rem" }}>{name}</td>
                              <td style={{ padding: "0.75rem" }}>{email}</td>
                              <td style={{ padding: "0.75rem" }}>{phone}</td>
                              <td style={{ padding: "0.75rem" }}>/0</td>
                              <td style={{ padding: "0.75rem" }}>
                                <button
                                  onClick={() => removeStudent(stu._id || stu.id || stu.userId)}
                                  style={{
                                    backgroundColor: "#ef4444",
                                    color: "#fff",
                                    border: "none",
                                    padding: "0.25rem 0.75rem",
                                    borderRadius: 6,
                                    cursor: "pointer",
                                    fontWeight: 600,
                                  }}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>

                {/* Pagination footer */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.75rem", borderTop: `1px solid ${BORDER_COLOR}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: TEXT_LIGHT }}>Rows per page:</span>
                    <select value={studentRowsPerPage} onChange={(e) => { setStudentRowsPerPage(Number(e.target.value)); setStudentPageIndex(0); }} style={{ padding: "0.25rem 0.5rem", borderRadius: 6, border: `1px solid ${BORDER_COLOR}` }}>
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                    </select>
                  </div>
                  <div style={{ color: TEXT_LIGHT }}>
                    {students.length > 0 && (
                      <>
                        {studentPageIndex * studentRowsPerPage + 1}-{Math.min((studentPageIndex + 1) * studentRowsPerPage, students.length)} of {students.length}
                      </>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => setStudentPageIndex((p) => Math.max(0, p - 1))} style={{ padding: "0.25rem 0.5rem", borderRadius: 6, border: `1px solid ${BORDER_COLOR}`, background: "#fff", cursor: "pointer" }}>&lt;</button>
                    <button onClick={() => setStudentPageIndex((p) => (p + 1) * studentRowsPerPage < students.length ? p + 1 : p)} style={{ padding: "0.25rem 0.5rem", borderRadius: 6, border: `1px solid ${BORDER_COLOR}`, background: "#fff", cursor: "pointer" }}>&gt;</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Basic Info section */}
          {activeTab === "info" && (
            <div style={{ minHeight: 80 }}>
              {loading ? (
                <div style={{ color: TEXT_LIGHT }}>Loading batch details...</div>
              ) : error ? (
                <div style={{ color: "#ef4444" }}>{error}</div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
                  <div>
                    <div style={{ fontWeight: 600, color: TEXT_DARK, marginBottom: 6 }}>Batch Name</div>
                    {isEditing ? (
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter batch name"
                        style={{
                          width: "100%",
                          padding: "0.5rem 0.75rem",
                          border: `1px solid ${BORDER_COLOR}`,
                          borderRadius: 8,
                          color: TEXT_DARK,
                        }}
                      />
                    ) : (
                      <div style={{ color: TEXT_DARK }}>{batch?.name || "—"}</div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: TEXT_DARK, marginBottom: 6 }}>Department Name</div>
                    {isEditing ? (
                      <input
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="Enter department name"
                        style={{
                          width: "100%",
                          padding: "0.5rem 0.75rem",
                          border: `1px solid ${BORDER_COLOR}`,
                          borderRadius: 8,
                          color: TEXT_DARK,
                        }}
                      />
                    ) : (
                      <div style={{ color: TEXT_DARK }}>{batch?.department || "—"}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab !== "info" && activeTab !== "trainer" && activeTab !== "student" && (
            <div style={{ color: TEXT_LIGHT }}>
              Placeholder for "{TABS.find((t) => t.key === activeTab)?.label}" content.
            </div>
          )}


          {/* Trainer section */}
{activeTab === "trainer" && (
  <div style={{ minHeight: 300 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: TEXT_DARK }}>
        Assign to Trainer
      </h2>
      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          onClick={openInstructorModal}
          style={{
            backgroundColor: "#7c3aed", // purple
            color: "#fff",
            padding: "0.5rem 1rem",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
          }}
        >
          Add Instructor
        </button>
        <button
          onClick={clearAllInstructors}
          style={{
            backgroundColor: "#ef4444", // red
            color: "#fff",
            padding: "0.5rem 1rem",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
          }}
        >
          Remove All Trainer
        </button>
      </div>
    </div>

    {/* Table */}
    <div
      style={{
        border: `1px solid ${BORDER_COLOR}`,
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ backgroundColor: "#f9fafb", textAlign: "left" }}>
          <tr>
            <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>ID</th>
            <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Name</th>
            <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Email</th>
            <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Mobile No.</th>
            <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assignedInstructors.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: TEXT_LIGHT }}>
                No rows
              </td>
            </tr>
          ) : (
            assignedInstructors.map((ins) => {
              const id = ins._id || ins.id || ins.userId || "—";
              const name = ins.name || [ins.firstName, ins.lastName].filter(Boolean).join(" ") || "—";
              const email = ins.email || ins.mail || ins.contactEmail || "—";
              const phone = ins.phone || ins.mobile || ins.contactNumber || ins.number || "—";
              return (
                <tr key={id} style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                  <td style={{ padding: "0.75rem" }}>{String(id).slice(-6)}</td>
                  <td style={{ padding: "0.75rem" }}>{name}</td>
                  <td style={{ padding: "0.75rem" }}>{email}</td>
                  <td style={{ padding: "0.75rem" }}>{phone}</td>
                  <td style={{ padding: "0.75rem" }}>
                    <button
                      onClick={() => removeInstructorFromBatch(ins._id || ins.id || ins.userId)}
                      style={{
                        backgroundColor: "#ef4444",
                        color: "#fff",
                        border: "none",
                        padding: "0.25rem 0.75rem",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  </div>
)}

          {/* Add Instructor Modal */}
          {showInstructorModal && (
            <div
              role="dialog"
              aria-modal="true"
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 50,
              }}
              onClick={closeInstructorModal}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  width: "min(920px, 92vw)",
                  background: "#fff",
                  borderRadius: 12,
                  boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
                  border: `1px solid ${BORDER_COLOR}`,
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: "1rem 1.25rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>
                  <h3 style={{ margin: 0, fontSize: "1rem", color: TEXT_DARK, fontWeight: 600 }}>Add Trainer</h3>
                </div>
                <div style={{ padding: "1rem 1.25rem" }}>
                  <h2 style={{ textAlign: "center", marginTop: 0, marginBottom: 16, fontSize: "1.5rem", fontWeight: 700, color: TEXT_DARK }}>
                    All Trainers
                  </h2>

                  {instructorsLoading ? (
                    <div style={{ color: TEXT_LIGHT, padding: "2rem", textAlign: "center" }}>Loading instructors...</div>
                  ) : instructorsError ? (
                    <div style={{ color: "#ef4444", padding: "1rem", textAlign: "center" }}>{instructorsError}</div>
                  ) : (
                    <>
                      <div
                        style={{
                          border: `1px solid ${BORDER_COLOR}`,
                          borderRadius: 8,
                          overflow: "hidden",
                        }}
                      >
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead style={{ backgroundColor: "#f9fafb", textAlign: "left" }}>
                            <tr>
                              <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>ID</th>
                              <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Name</th>
                              <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Email</th>
                              <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Number</th>
                              <th style={{ padding: "0.75rem", borderBottom: `1px solid ${BORDER_COLOR}` }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {instructors.length === 0 ? (
                              <tr>
                                <td colSpan={5} style={{ textAlign: "center", padding: "2rem", color: TEXT_LIGHT }}>No trainers</td>
                              </tr>
                            ) : (
                              instructors
                                .slice(pageIndex * rowsPerPage, pageIndex * rowsPerPage + rowsPerPage)
                                .map((ins, idx) => {
                                  const id = ins.id || ins._id || ins.userId || "—";
                                  const name = ins.name || [ins.firstName, ins.lastName].filter(Boolean).join(" ") || "—";
                                  const email = ins.email || ins.mail || ins.contactEmail || "—";
                                  const phone = ins.phone || ins.mobile || ins.contactNumber || ins.number || "—";
                                  return (
                                    <tr key={id} style={{ borderBottom: `1px solid ${BORDER_COLOR}` }}>
                                      <td style={{ padding: "0.75rem" }}>{String(id).slice(-6)}</td>
                                      <td style={{ padding: "0.75rem" }}>{name}</td>
                                      <td style={{ padding: "0.75rem" }}>{email}</td>
                                      <td style={{ padding: "0.75rem" }}>{phone}</td>
                                      <td style={{ padding: "0.75rem" }}>
                                        <button
                                          onClick={() => addInstructorToBatch(ins)}
                                          style={{
                                            backgroundColor: "#22c55e",
                                            color: "#fff",
                                            border: "none",
                                            padding: "0.25rem 0.75rem",
                                            borderRadius: 6,
                                            cursor: "pointer",
                                            fontWeight: 600,
                                          }}
                                        >
                                          Add
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })
                            )}
                          </tbody>
                        </table>
                        {/* Pagination footer */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.75rem", borderTop: `1px solid ${BORDER_COLOR}` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ color: TEXT_LIGHT }}>Rows per page:</span>
                            <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPageIndex(0); }} style={{ padding: "0.25rem 0.5rem", borderRadius: 6, border: `1px solid ${BORDER_COLOR}` }}>
                              <option value={5}>5</option>
                              <option value={10}>10</option>
                              <option value={20}>20</option>
                            </select>
                          </div>
                          <div style={{ color: TEXT_LIGHT }}>
                            {instructors.length > 0 && (
                              <>
                                {pageIndex * rowsPerPage + 1}-{Math.min((pageIndex + 1) * rowsPerPage, instructors.length)} of {instructors.length}
                              </>
                            )}
                          </div>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => setPageIndex((p) => Math.max(0, p - 1))} style={{ padding: "0.25rem 0.5rem", borderRadius: 6, border: `1px solid ${BORDER_COLOR}`, background: "#fff", cursor: "pointer" }}>&lt;</button>
                            <button onClick={() => setPageIndex((p) => (p + 1) * rowsPerPage < instructors.length ? p + 1 : p)} style={{ padding: "0.25rem 0.5rem", borderRadius: 6, border: `1px solid ${BORDER_COLOR}`, background: "#fff", cursor: "pointer" }}>&gt;</button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div style={{ padding: "0.75rem 1.25rem", display: "flex", justifyContent: "flex-end", borderTop: `1px solid ${BORDER_COLOR}` }}>
                  <button onClick={closeInstructorModal} style={{ backgroundColor: "#7c3aed", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: 8, cursor: "pointer" }}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.75rem",
              marginTop: "2rem",
            }}
          >
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  style={{
                    backgroundColor: "#6b7280",
                    color: "white",
                    padding: "0.5rem 1rem",
                    borderRadius: 8,
                    border: "none",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={onSave}
                  style={{
                    backgroundColor: ED_TEAL,
                    color: "white",
                    padding: "0.5rem 1rem",
                    borderRadius: 8,
                    border: "none",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Save
                </button>
              </>
            ) : (
              <button
                onClick={onEditToggle}
                style={{
                  backgroundColor: ED_TEAL,
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: 8,
                  border: "none",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Edit
              </button>
            )}
            <button
              onClick={onDelete}
              style={{
                backgroundColor: "#ef4444",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: 8,
                border: "none",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

