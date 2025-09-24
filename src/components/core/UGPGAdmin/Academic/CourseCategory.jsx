import React, { useEffect, useMemo, useState } from "react";
import { apiConnector } from "../../../../services/apiConnector";

export default function CourseCategory() {
  const [items, setItems] = useState([]); // course categories from backend
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "Active",
  });

  // Fetch all course categories
  const fetchCourseCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiConnector("GET", "/api/v1/ugpg/course-categories");
      const list = res?.data?.data || [];
      setItems(Array.isArray(list) ? list : []);
      setPage(1);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load course categories");
    } finally {
      setLoading(false);
    }
  };

  // Handle form field changes
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Fetch data on mount
  useEffect(() => {
    fetchCourseCategories();
  }, []);

  // Handle search debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return items;
    return items.filter((it) =>
      [it.name, it.description, it.status]
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
    if (!selectedCategory?._id) return;
    
    setSubmitting(true);
    try {
      await apiConnector("DELETE", `/api/v1/ugpg/course-categories/${selectedCategory._id}`);
      await fetchCourseCategories();
      setShowDeleteConfirm(false);
      setSelectedCategory(null);
    } catch (error) {
      setSubmitError(error?.response?.data?.message || "Failed to delete course category");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", fontFamily: "sans-serif" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: "12rem" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0A2F5A" }}>Manage Course Categories</h2>
          <button 
            onClick={() => { 
              setOpen(true); 
              setIsEditMode(false);
              setSelectedCategory(null);
              setForm({ name: "", description: "", status: "Active" });
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
                  <th style={{ textAlign: "left", padding: 12 }}>Category Name</th>
                  <th style={{ textAlign: "left", padding: 12 }}>Description</th>
                  <th style={{ textAlign: "left", padding: 12, width: 110 }}>Status</th>
                  <th style={{ textAlign: "left", padding: 12, width: 150 }}>Created Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 16 }}>Loading...</td>
                  </tr>
                ) : paged.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 16, textAlign: "center", color: "#64748b" }}>No data found</td>
                  </tr>
                ) : (
                  paged.map((row, idx) => (
                    <tr key={row._id || idx} style={{ borderTop: "1px solid #e2e8f0", transition: "0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
                        onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                      <td style={{ padding: 12, display: "flex", gap: 8 }}>
                        <button 
                          onClick={() => {
                            setSelectedCategory(row);
                            setIsEditMode(true);
                            setForm({ 
                              name: row.name || "", 
                              description: row.description || "", 
                              status: row.status || "Active" 
                            });
                            setOpen(true);
                          }}
                          style={{ background: "#2563eb", color: "white", border: "none", borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontWeight: 500 }}
                          onMouseEnter={e => e.currentTarget.style.background = "#1D4ED8"}
                          onMouseLeave={e => e.currentTarget.style.background = "#2563eb"}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => { setSelectedCategory(row); setShowDeleteConfirm(true); }}
                          style={{ background: "#ef4444", color: "white", border: "none", borderRadius: 4, padding: "4px 10px", cursor: "pointer", fontWeight: 500 }}
                          onMouseEnter={e => e.currentTarget.style.background = "#dc2626"}
                          onMouseLeave={e => e.currentTarget.style.background = "#ef4444"}
                        >
                          Delete
                        </button>
                      </td>
                      <td style={{ padding: 12, fontWeight: 600 }}>{row.name}</td>
                      <td style={{ padding: 12 }}>{row.description || "-"}</td>
                      <td style={{ padding: 12, color: row.status === "Active" ? "#16a34a" : "#ef4444", fontWeight: 600 }}>{row.status}</td>
                      <td style={{ padding: 12 }}>{new Date(row.createdAt).toLocaleDateString()}</td>
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
          <div style={{ width: "min(600px, 95vw)", background: "#fff", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
            {/* Modal Header */}
            <div style={{ background: "#f8caff", padding: 16, borderTopLeftRadius: 12, borderTopRightRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{isEditMode ? 'Edit' : 'Add New'} Course Category</div>
              <button 
                onClick={() => {
                  setOpen(false);
                  setIsEditMode(false);
                  setSelectedCategory(null);
                  setForm({ name: "", description: "", status: "Active" });
                }} 
                style={{ background: "transparent", border: 0, fontSize: 18, color: "#7f1d1d" }}
              >
                ×
              </button>
            </div>
            {/* Modal Body */}
            <div style={{ padding: 20 }}>
              {submitError ? <div style={{ color: "#b00020", marginBottom: 12 }}>{submitError}</div> : null}
              
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6, fontWeight: 600 }}>Category Name *</label>
                  <input 
                    name="name" 
                    value={form.name} 
                    onChange={onChange} 
                    placeholder="Enter category name" 
                    style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} 
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6, fontWeight: 600 }}>Description</label>
                  <textarea 
                    name="description" 
                    value={form.description} 
                    onChange={onChange} 
                    placeholder="Enter category description (optional)" 
                    rows={3}
                    style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8, resize: "vertical" }} 
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6, fontWeight: 600 }}>Status</label>
                  <select 
                    name="status" 
                    value={form.status} 
                    onChange={onChange} 
                    style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }}
                  >
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
                    setSelectedCategory(null);
                    setForm({ name: "", description: "", status: "Active" });
                  }} 
                  style={{ background: "#ef4444", color: "#fff", border: 0, borderRadius: 8, padding: "8px 16px", fontWeight: 600 }}
                >
                  Close
                </button>
                <button
                  disabled={submitting || !form.name.trim()}
                  onClick={async () => {
                    setSubmitError("");
                    if (!form.name.trim()) {
                      setSubmitError("Category name is required");
                      return;
                    }
                    setSubmitting(true);
                    try {
                      const payload = {
                        name: form.name.trim(),
                        description: form.description.trim(),
                        status: form.status,
                      };
                      
                      if (isEditMode && selectedCategory?._id) {
                        await apiConnector("PUT", `/api/v1/ugpg/course-categories/${selectedCategory._id}`, payload);
                      } else {
                        await apiConnector("POST", "/api/v1/ugpg/course-categories", payload);
                      }
                      
                      await fetchCourseCategories();
                      setOpen(false);
                      setIsEditMode(false);
                      setSelectedCategory(null);
                      setForm({ name: "", description: "", status: "Active" });
                    } catch (e) {
                      setSubmitError(e?.response?.data?.message || e.message || "Failed to save course category");
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  style={{ background: submitting ? "#93c5fd" : "#2563eb", color: "#fff", border: 0, borderRadius: 8, padding: "8px 16px", fontWeight: 600 }}
                >
                  {submitting ? "Saving..." : (isEditMode ? "Update" : "Submit")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, marginLeft: "100px" }}>
          <div style={{ background: "#fff", borderRadius: 8, padding: 20, maxWidth: 400, width: "90%" }}>
            <h3 style={{ marginTop: 0 }}>Confirm Delete</h3>
            <p>Are you sure you want to delete this course category? This action cannot be undone.</p>
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
