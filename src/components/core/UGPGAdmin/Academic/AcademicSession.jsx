import React, { useEffect, useMemo, useState } from "react";
import { apiConnector } from "../../../../services/apiConnector";
import { showError, showSuccess, showLoading, dismissToast } from "../../../../utils/toast";

export default function AcademicSession() {
  const [sessions, setSessions] = useState([]); // keep empty per requirement
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: "",
    registrationSeries: "",
    enrollmentSeries: "",
    status: "Active",
  });

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return sessions;
    return sessions.filter((s) =>
      s.name?.toLowerCase?.().includes(debouncedSearch) ||
      String(s.registrationSeries || "").toLowerCase().includes(debouncedSearch) ||
      String(s.enrollmentSeries || "").toLowerCase().includes(debouncedSearch) ||
      String(s.startDate || "").toLowerCase().includes(debouncedSearch) ||
      String(s.endDate || "").toLowerCase().includes(debouncedSearch) ||
      String(s.status || "").toLowerCase().includes(debouncedSearch)
    );
  }, [sessions, debouncedSearch]);

  const formatDate = (d) => {
    if (!d) return "";
    try {
      const date = new Date(d);
      return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return d;
    }
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await apiConnector("GET", "/api/v1/ugpg/sessions");
      if (res?.data?.success) {
        setSessions(res.data.data || []);
      } else {
        showError(res?.data?.message || "Failed to load sessions");
      }
    } catch (e) {
      showError(e?.response?.data?.message || e.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const validForm = () => {
    const { name, startDate, endDate, registrationSeries, enrollmentSeries } = form;
    if (!name?.trim() || !startDate || !endDate || !registrationSeries?.trim() || !enrollmentSeries?.trim()) return false;
    if (new Date(startDate) > new Date(endDate)) return false;
    return true;
  };

  const submit = async () => {
    if (!validForm()) {
      showError("Please fill all fields correctly");
      return;
    }
    let toastId;
    try {
      toastId = showLoading("Creating session...");
      const res = await apiConnector("POST", "/api/v1/ugpg/sessions", { ...form });
      if (res?.data?.success) {
        showSuccess("Session created");
        setOpen(false);
        setForm({ name: "", startDate: "", endDate: "", registrationSeries: "", enrollmentSeries: "", status: "Active" });
        fetchSessions();
      } else {
        showError(res?.data?.message || "Failed to create session");
      }
    } catch (e) {
      showError(e?.response?.data?.message || e.message || "Failed to create session");
    } finally {
      if (toastId) dismissToast(toastId);
    }
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit) || 1);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const paged = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page, limit]);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: "12rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Manage Academic Session</h2>
        <button onClick={() => setOpen(true)} style={{ background: "#6d28d9", color: "#fff", border: 0, borderRadius: 8, padding: "8px 12px", fontWeight: 600 }}>+ ADD NEW</button>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>Show</span>
          <select value={limit} onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }} style={{ padding: 6, border: "1px solid #e2e8f0", borderRadius: 6 }}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>entries</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <label>Search:</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: 8, border: "1px solid #e2e8f0", borderRadius: 8 }} />
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #eaeef3", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr style={{ background: "#f8fafc", color: "#475569" }}>
              <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3", width: 100 }}>Action</th>
              <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3" }}>Session</th>
              <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3", width: 180 }}>Start Date</th>
              <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3", width: 180 }}>End Date</th>
              <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3", width: 140 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: 16, textAlign: "center", color: "#64748b" }}>Loading...</td>
              </tr>
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 16, textAlign: "center", color: "#64748b" }}>No data found</td>
              </tr>
            ) : (
              paged.map((row, idx) => (
                <tr key={row._id || idx} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: 12 }}>
                    <div style={{ width: 28, height: 28, background: "#6d28d9", borderRadius: 6 }} />
                  </td>
                  <td style={{ padding: 12 }}>{row.name}</td>
                  <td style={{ padding: 12 }}>{formatDate(row.startDate)}</td>
                  <td style={{ padding: 12 }}>{formatDate(row.endDate)}</td>
                  <td style={{ padding: 12 }}>{row.status}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
        <div style={{ color: "#64748b" }}>Showing {(paged.length && (page - 1) * limit + 1) || 0}-{(page - 1) * limit + paged.length} of {filtered.length} entries</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 8, background: page === 1 ? "#f1f5f9" : "#fff" }}>Prev</button>
          <div style={{ padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 8 }}>Page {page} / {totalPages}</div>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 8, background: page === totalPages ? "#f1f5f9" : "#fff" }}>Next</button>
        </div>
      </div>

      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "10vh", zIndex: 50 }}>
          <div style={{ width: "min(900px, 95vw)", background: "#fff", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
            <div style={{ background: "#f8caff", padding: 16, borderTopLeftRadius: 12, borderTopRightRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>Add New UG/PG Session</div>
              <button onClick={() => setOpen(false)} style={{ background: "transparent", border: 0, fontSize: 18, color: "#7f1d1d" }}>×</button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Session</label>
                  <input name="name" value={form.name} onChange={onChange} placeholder="2025-2026" style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Start Date</label>
                  <input type="date" name="startDate" value={form.startDate} onChange={onChange} style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>End Date</label>
                  <input type="date" name="endDate" value={form.endDate} onChange={onChange} style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Registration Series</label>
                  <input name="registrationSeries" value={form.registrationSeries} onChange={onChange} placeholder="1000" style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Enrollment Series</label>
                  <input name="enrollmentSeries" value={form.enrollmentSeries} onChange={onChange} placeholder="WM10190" style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Status</label>
                  <select name="status" value={form.status} onChange={onChange} style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
                <button onClick={() => setOpen(false)} style={{ background: "#ef4444", color: "#fff", border: 0, borderRadius: 8, padding: "8px 16px", fontWeight: 600 }}>Close</button>
                <button onClick={submit} disabled={!validForm()} style={{ background: "#2563eb", color: "#fff", opacity: !validForm() ? 0.6 : 1, cursor: !validForm() ? "not-allowed" : "pointer", border: 0, borderRadius: 8, padding: "8px 16px", fontWeight: 600 }}>Submit</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
