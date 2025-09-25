import React, { useEffect, useMemo, useState } from "react";
import { apiConnector } from "../../../../services/apiConnector";

export default function CourseTypes() {
  const [items, setItems] = useState([]); // courses from backend
  const [schools, setSchools] = useState([]); // schools for dropdown
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [sessions, setSessions] = useState([]); // sessions for dropdown
  const [categories, setCategories] = useState([]); // course categories from backend
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [form, setForm] = useState({
    school: "",
    session: "",
    category: "", // choose from API-driven categories
    courseName: "",
    courseType: "Yearly",
    durationYear: "",
    semester: "",
    totalCredit: "",
    totalPapers: "",
    seats: "",
    // New fields
    courseDescription: "",
    whatYouWillLearn: "",
    status: "Active",
  });

  // Fetch schools
  const fetchSchools = async () => { 
    try {
      const res = await apiConnector("GET", "/api/v1/ugpg/schools");
      const list = res?.data?.data || [];
      setSchools(Array.isArray(list) ? list : []);
    } catch (_e) {
      // keep silent here; table still usable
    }
  };

  // Fetch active course categories
  const fetchCategories = async () => {
    try {
      const res = await apiConnector("GET", "/api/v1/ugpg/course-categories/active");
      const list = res?.data?.data || [];
      setCategories(Array.isArray(list) ? list : []);
    } catch (_e) {
      setCategories([]);
    }
  };
  
  // Fetch sessions for the selected school
  const fetchSessionsForSchool = async (schoolId) => {
    try {
      const res = await apiConnector("GET", `/api/v1/ugpg/sessions`);
      const list = res?.data?.data || [];
      setSessions(Array.isArray(list) ? list : []);
    } catch (_e) {
      setSessions([]);
    }
  };

  // Fetch all courses
  const fetchCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiConnector("GET", "/api/v1/ugpg/courses");
      const list = res?.data?.data || [];
      setItems(Array.isArray(list) ? list : []);
      setPage(1);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  // Handle school change
  const handleSchoolChange = (e) => {
    const schoolId = e.target.value;
    setForm(prev => ({ ...prev, school: schoolId, session: "" }));
    
    // Fetch sessions for the selected school
    if (schoolId) {
      fetchSessionsForSchool(schoolId);
    } else {
      setSessions([]);
    }
  };

  // Handle form field changes
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Fetch data on mount
  useEffect(() => {
    const initialize = async () => {
      await fetchSchools();
      await Promise.all([fetchCourses(), fetchCategories()]);
    };
    initialize();
  }, []);

  // Handle search debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return items;
    return items.filter((it) =>
      [it?.school?.name, it.category, it.courseName, it.courseType, it.status]
        .filter(Boolean)
        .some((v) => v.toString().toLowerCase().includes(debouncedSearch))
    );
  }, [items, debouncedSearch]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const paged = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page, limit]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const onPrev = () => setPage((p) => Math.max(1, p - 1));
  const onNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const handleDelete = async () => {
    if (!selectedCourse?._id) return;
    
    setSubmitting(true);
    try {
      await apiConnector("DELETE", `/api/v1/ugpg/courses/${selectedCourse._id}`);
      await fetchCourses();
      setShowDeleteConfirm(false);
      setSelectedCourse(null);
    } catch (error) {
      setSubmitError(error?.response?.data?.message || "Failed to delete course");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", fontFamily: "sans-serif" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: "12rem" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0A2F5A" }}>Manage Courses</h2>
          <button 
            onClick={async () => { 
              setOpen(true); 
              setIsEditMode(false);
              setSelectedCourse(null);
              setForm({ school: "", session: "", category: "Certificate", courseName: "", courseType: "Yearly", durationYear: "", semester: "", totalCredit: "", totalPapers: "", seats: "", courseDescription: "", whatYouWillLearn: "", status: "Active" });
              await fetchSessionsForSchool(""); // Fetch all sessions for new entry
            }} 
            style={{ background: "#1E40AF", color: "#fff", border: 0, borderRadius: 8, padding: "8px 14px", fontWeight: 600, cursor: "pointer", transition: "0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "#1D4ED8"}
            onMouseLeave={e => e.currentTarget.style.background = "#1E40AF"}
          >
            + ADD NEW
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#0A2F5A" }}>Show</span>
            <select value={limit} onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }} style={{ padding: 6, border: "1px solid #cbd5e1", borderRadius: 6, background: "#f8fafc" }}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span style={{ color: "#0A2F5A" }}>entries</span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: "#0A2F5A" }}>Search:</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" style={{ padding: 8, border: "1px solid #cbd5e1", borderRadius: 8, outline: "none", transition: "0.2s", width: 200 }} />
          </div>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", border: "1px solid #eaeef3", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
          {error ? (
            <div style={{ padding: 16, color: "#b00020" }}>{error}</div>
          ) : (
          <div style={{ width: "100%", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr style={{ background: "#0A2F5A", color: "#fff" }}>
                  <th style={{ textAlign: "left", padding: 12, width: 100 }}>Action</th>
                  <th style={{ textAlign: "left", padding: 12 }}>School</th>
                  <th style={{ textAlign: "left", padding: 12 }}>Session</th>
                  <th style={{ textAlign: "left", padding: 12 }}>Category</th>
                  <th style={{ textAlign: "left", padding: 12 }}>Course Name</th>
                  <th style={{ textAlign: "left", padding: 12, width: 120 }}>Type</th>
                  <th style={{ textAlign: "left", padding: 12, width: 80 }}>Year</th>
                  <th style={{ textAlign: "left", padding: 12, width: 110 }}>Semester</th>
                  <th style={{ textAlign: "left", padding: 12, width: 100 }}>Seats</th>
                  <th style={{ textAlign: "left", padding: 12, width: 110 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} style={{ padding: 16 }}>Loading...</td>
                  </tr>
                ) : paged.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ padding: 16, textAlign: "center", color: "#64748b" }}>No data found</td>
                  </tr>
                ) : (
                  paged.map((row, idx) => (
                    <tr key={row._id || idx} style={{ borderTop: "1px solid #e2e8f0", transition: "0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
                        onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                      <td style={{ padding: 12, display: "flex", gap: 8 }}>
                        <button 
                          onClick={async () => {
                            setSelectedCourse(row);
                            setIsEditMode(true);
                            setForm({
                              school: row.school?._id || "",
                              session: row.session?._id || "",
                              category: row.category || "Certificate",
                              courseName: row.courseName || "",
                              courseType: row.courseType || "Yearly",
                              durationYear: row.durationYear || "",
                              semester: row.semester || "",
                              totalCredit: row.totalCredit || "",
                              totalPapers: row.totalPapers || "",
                              seats: row.seats || "",
                              courseDescription: row.courseDescription || "",
                              whatYouWillLearn: Array.isArray(row.whatYouWillLearn)
                                ? row.whatYouWillLearn.filter(Boolean).join(", ")
                                : (row.whatYouWillLearn || ""),
                              status: row.status || "Active",
                            });
                            setOpen(true);
                            await fetchSessionsForSchool(row.school?._id || ""); // Fetch sessions for the selected school
                          }}
                          style={{ background: "#2563eb", color: "white", border: "none", borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontWeight: 500 }}
                          onMouseEnter={e => e.currentTarget.style.background = "#1D4ED8"}
                          onMouseLeave={e => e.currentTarget.style.background = "#2563eb"}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => { setSelectedCourse(row); setShowDeleteConfirm(true); }}
                          style={{ background: "#ef4444", color: "white", border: "none", borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontWeight: 500 }}
                          onMouseEnter={e => e.currentTarget.style.background = "#dc2626"}
                          onMouseLeave={e => e.currentTarget.style.background = "#ef4444"}
                        >
                          Delete
                        </button>
                      </td>
                      <td style={{ padding: 12 }}>{row?.school?.name || "-"}</td>
                      <td style={{ padding: 12 }}>{row?.session?.name || "-"}</td>
                      <td style={{ padding: 12 }}>{row.category}</td>
                      <td style={{ padding: 12 }}>{row.courseName}</td>
                      <td style={{ padding: 12 }}>{row.courseType}</td>
                      <td style={{ padding: 12 }}>{row.durationYear}</td>
                      <td style={{ padding: 12 }}>{row.semester}</td>
                      <td style={{ padding: 12 }}>{row.seats}</td>
                      <td style={{ padding: 12, color: row.status === "Active" ? "#16a34a" : "#ef4444", fontWeight: 600 }}>{row.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* Pagination */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
          <div style={{ color: "#0A2F5A" }}>Showing {Math.min((page - 1) * limit + 1, total)} to {Math.min(page * limit, total)} of {total} entries</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={onPrev} disabled={page <= 1} style={{ padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: 8, background: page <= 1 ? "#f1f5f9" : "#fff", cursor: page <= 1 ? "not-allowed" : "pointer" }}>Previous</button>
            <span style={{ color: "#0A2F5A" }}>{page}</span>
            <button onClick={onNext} disabled={page >= totalPages} style={{ padding: "6px 10px", border: "1px solid #cbd5e1", borderRadius: 8, background: page >= totalPages ? "#f1f5f9" : "#fff", cursor: page >= totalPages ? "not-allowed" : "pointer" }}>Next</button>
          </div>
        </div>

      </div>

      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "10vh", zIndex: 50, marginLeft: "100px" }}>
          <div style={{ width: "min(980px, 95vw)", maxHeight: "85vh", background: "#fff", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.2)", display: "flex", flexDirection: "column" }}>
            {/* Modal Header */}
            <div style={{ background: "#f8caff", padding: 16, borderTopLeftRadius: 12, borderTopRightRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{isEditMode ? 'Edit' : 'Add New'} Course</div>
              <button 
                onClick={() => {
                  setOpen(false);
                  setIsEditMode(false);
                  setSelectedCourse(null);
                  setForm({
                    school: "",
                    session: "",
                    category: "Certificate",
                    courseName: "",
                    courseType: "Yearly",
                    durationYear: "",
                    semester: "",
                    totalCredit: "",
                    totalPapers: "",
                    seats: "",
                    status: "Active",
                  });
                  setSessions([]);
                }} 
                style={{ background: "transparent", border: 0, fontSize: 18, color: "#7f1d1d" }}
              >
                ×
              </button>
            </div>
            {/* Modal Body */}
            <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>
              {submitError ? <div style={{ color: "#b00020", marginBottom: 12 }}>{submitError}</div> : null}
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>School</label>
                  <select 
                    name="school" 
                    value={form.school} 
                    onChange={handleSchoolChange} 
                    style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }}
                  >
                    <option value="">Select school</option>
                    {schools.map((s) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Session</label>
                  <select 
                    name="session" 
                    value={form.session} 
                    onChange={onChange} 
                    style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }}
                    disabled={!form.school}
                  >
                    <option value="">Select session</option>
                    {sessions.map((s) => (
                      <option key={s._id} value={s._id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Category</label>
                  <select name="category" value={form.category} onChange={onChange} style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }}>
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c._id || c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Course Name</label>
                  <input name="courseName" value={form.courseName} onChange={onChange} placeholder="Enter course name" style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Course Type</label>
                  <select name="courseType" value={form.courseType} onChange={onChange} style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }}>
                    <option value="Yearly">Yearly</option>
                    <option value="Semester">Semester</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Duration year</label>
                  <input name="durationYear" value={form.durationYear} onChange={onChange} placeholder="3" style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Semester</label>
                  <input name="semester" value={form.semester} onChange={onChange} placeholder="6" style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Total Credit</label>
                  <input name="totalCredit" value={form.totalCredit} onChange={onChange} placeholder="0" style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Total Papers</label>
                  <input name="totalPapers" value={form.totalPapers} onChange={onChange} placeholder="0" style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Available Seats</label>
                  <input name="seats" value={form.seats} onChange={onChange} placeholder="100" style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} />
                </div>
                {/* New: Course Description */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Course Description</label>
                  <textarea
                    name="courseDescription"
                    value={form.courseDescription}
                    onChange={onChange}
                    placeholder="Brief overview of the course..."
                    rows={4}
                    style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8, resize: "vertical" }}
                  />
                </div>
                {/* New: What You'll Learn */}
                <div style={{ gridColumn: "1 / -1" }}>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>What You'll Learn</label>
                  <textarea
                    name="whatYouWillLearn"
                    value={form.whatYouWillLearn}
                    onChange={onChange}
                    placeholder="List key learnings, comma-separated (e.g., Basics of X, Hands-on Y, Project Z)"
                    rows={3}
                    style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8, resize: "vertical" }}
                  />
                  <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>Tip: You can paste JSON array too, we'll parse it.</div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Status</label>
                  <select name="status" value={form.status} onChange={onChange} style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              {/* Form Actions */}
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
                <button 
                  onClick={() => {
                    setOpen(false);
                    setIsEditMode(false);
                    setSelectedCourse(null);
                    setForm({
                      school: "",
                      session: "",
                      category: "Certificate",
                      courseName: "",
                      courseType: "Yearly",
                      durationYear: "",
                      semester: "",
                      totalCredit: "",
                      totalPapers: "",
                      seats: "",
                      courseDescription: "",
                      whatYouWillLearn: "",
                      status: "Active",
                    });
                    setSessions([]);
                  }} 
                  style={{ background: "#ef4444", color: "#fff", border: 0, borderRadius: 8, padding: "8px 16px", fontWeight: 600 }}
                >
                  Close
                </button>
                <button
                  disabled={submitting || !form.school || !form.session || !form.category || !form.courseName}
                  onClick={async () => {
                    setSubmitError("");
                    if (!form.school || !form.session || !form.category || !form.courseName.trim()) {
                      setSubmitError("School, Session, Category and Course Name are required");
                      return;
                    }
                    setSubmitting(true);
                    try {
                      const payload = {
                        school: form.school,
                        session: form.session,
                        category: form.category,
                        courseName: form.courseName.trim(),
                        courseType: form.courseType,
                        durationYear: form.durationYear,
                        semester: form.semester,
                        totalCredit: form.totalCredit,
                        totalPapers: form.totalPapers,
                        seats: form.seats,
                        courseDescription: form.courseDescription,
                        whatYouWillLearn: form.whatYouWillLearn,
                        status: form.status,
                      };
                      
                      if (isEditMode && selectedCourse?._id) {
                        await apiConnector("PATCH", `/api/v1/ugpg/courses/${selectedCourse._id}`, payload);
                      } else {
                        await apiConnector("POST", "/api/v1/ugpg/courses", payload);
                      }
                      
                      await fetchCourses();
                      setOpen(false);
                      setIsEditMode(false);
                      setSelectedCourse(null);
                      setForm({
                        school: "",
                        session: "",
                        category: "Certificate",
                        courseName: "",
                        courseType: "Yearly",
                        durationYear: "",
                        semester: "",
                        totalCredit: "",
                        totalPapers: "",
                        seats: "",
                        courseDescription: "",
                        whatYouWillLearn: "",
                        status: "Active",
                      });
                      setSessions([]);
                    } catch (e) {
                      setSubmitError(e?.response?.data?.message || e.message || "Failed to create course");
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  style={{ background: submitting ? "#93c5fd" : "#2563eb", color: "#fff", border: 0, borderRadius: 8, padding: "8px 16px", fontWeight: 600 }}
                >
                  {isEditMode ? "Update" : "Submit"}
                </button>
              </div>
              <div style={{ color: "#64748b", marginTop: 8, fontSize: 12 }}>Note: Submission is disabled; no custom data will be created.</div>
            </div>
          </div>
        </div>
      )}

      
      {showDeleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, marginLeft: "100px" }}>
          <div style={{ background: "#fff", borderRadius: 8, padding: 20, maxWidth: 400, width: "90%" }}>
            <h3 style={{ marginTop: 0 }}>Confirm Delete</h3>
            <p>Are you sure you want to delete this course? This action cannot be undone.</p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={submitting}
                style={{ padding: "8px 16px", background: "#e2e8f0", border: "none", borderRadius: 4, cursor: "pointer" }}
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                disabled={submitting}
                style={{ padding: "8px 16px", background: "#ef4444", color: "white", border: "none", borderRadius: 4, cursor: "pointer" }}
              >
                {submitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
