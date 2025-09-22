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
    <div style={{ padding: 16, backgroundColor: "#F9FAFB", width:"80%", marginLeft:"120px", marginTop:"14rem" }}>

    {/* Header */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0A2F5A" }}>Manage Academic Session</h2>
      <button 
        onClick={() => setOpen(true)}
        style={{
          background: "#1D4ED8", // logo primary
          color: "#fff",
          border: 0,
          borderRadius: 8,
          padding: "10px 16px",
          fontWeight: 600,
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          transition: "all 0.2s ease-in-out"
        }}
        onMouseOver={e => e.currentTarget.style.background = "#1E40AF"} // darker on hover
        onMouseOut={e => e.currentTarget.style.background = "#1D4ED8"}
      >
        + ADD NEW
      </button>
    </div>
  
    {/* Filters */}
    <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "#6B7280" }}>Show</span>
        <select 
          value={limit} 
          onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}
          style={{
            padding: 8,
            border: "1px solid #D1D5DB",
            borderRadius: 6,
            color: "#111827",
            outline: "none",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            transition: "0.2s"
          }}
          onFocus={e => e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.3)"}
          onBlur={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)"}
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
        <span style={{ color: "#6B7280" }}>entries</span>
      </div>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
        <label style={{ color: "#6B7280" }}>Search:</label>
        <input 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          style={{
            padding: 8,
            border: "1px solid #D1D5DB",
            borderRadius: 8,
            color: "#111827",
            outline: "none",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            transition: "0.2s"
          }}
          onFocus={e => e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.3)"}
          onBlur={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)"}
        />
      </div>
    </div>
  
    {/* Table */}
    <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
        <thead>
          <tr style={{ background: "#E0F2FE", color: "#0A2F5A" }}>
            <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #E5E7EB", width: 100 }}>Action</th>
            <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #E5E7EB" }}>Session</th>
            <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #E5E7EB", width: 180 }}>Start Date</th>
            <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #E5E7EB", width: 180 }}>End Date</th>
            <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #E5E7EB", width: 140 }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} style={{ padding: 16, textAlign: "center", color: "#6B7280" }}>Loading...</td>
            </tr>
          ) : paged.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: 16, textAlign: "center", color: "#6B7280" }}>No data found</td>
            </tr>
          ) : (
            paged.map((row, idx) => (
              <tr key={row._id || idx} style={{ borderTop: "1px solid #E5E7EB", transition: "background 0.2s", cursor: "pointer" }}
                  onMouseOver={e => e.currentTarget.style.background = "#F3F4F6"}
                  onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: 12 }}>
                  <div style={{ width: 28, height: 28, background: "#1D4ED8", borderRadius: 6, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }} />
                </td>
                <td style={{ padding: 12, color: "#111827" }}>{row.name}</td>
                <td style={{ padding: 12, color: "#111827" }}>{formatDate(row.startDate)}</td>
                <td style={{ padding: 12, color: "#111827" }}>{formatDate(row.endDate)}</td>
                <td style={{ padding: 12, color: row.status === "Active" ? "#10B981" : "#EF4444" }}>{row.status}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  
    {/* Pagination */}
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, color: "#6B7280" }}>
      <div>Showing {(paged.length && (page - 1) * limit + 1) || 0}-{(page - 1) * limit + paged.length} of {filtered.length} entries</div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "6px 10px", border: "1px solid #D1D5DB", borderRadius: 8, background: page === 1 ? "#F3F4F6" : "#fff", color: "#111827" }}>Prev</button>
        <div style={{ padding: "6px 10px", border: "1px solid #D1D5DB", borderRadius: 8, color: "#111827" }}>Page {page} / {totalPages}</div>
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: "6px 10px", border: "1px solid #D1D5DB", borderRadius: 8, background: page === totalPages ? "#F3F4F6" : "#fff", color: "#111827" }}>Next</button>
      </div>
    </div>
  
    {/* Modal */}
    {open && (
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "10vh", zIndex: 50 }}>
        <div style={{ width: "min(900px, 95vw)", background: "#fff", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
          <div style={{ background: "#1D4ED8", padding: 16, borderTopLeftRadius: 12, borderTopRightRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff" }}>
            <div style={{ fontWeight: 700, fontSize: 18 }}>Add New UG/PG Session</div>
            <button onClick={() => setOpen(false)} style={{ background: "transparent", border: 0, fontSize: 18, color: "#fff" }}>×</button>
          </div>
          <div style={{ padding: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              {["name","startDate","endDate","registrationSeries","enrollmentSeries"].map((field, idx) => (
                <div key={idx}>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6, color: "#0A2F5A" }}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <input
                    name={field}
                    value={form[field]}
                    onChange={onChange}
                    placeholder={field === "name" ? "2025-2026" : field === "registrationSeries" ? "1000" : field === "enrollmentSeries" ? "WM10190" : ""}
                    type={field.includes("Date") ? "date" : "text"}
                    style={{
                      width: "100%",
                      padding: 10,
                      border: "1px solid #D1D5DB",
                      borderRadius: 8,
                      color: "#111827",
                      outline: "none",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                      transition: "all 0.2s"
                    }}
                    onFocus={e => e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.3)"}
                    onBlur={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)"}
                  />
                </div>
              ))}
              <div>
                <label style={{ display: "block", fontSize: 14, marginBottom: 6, color: "#0A2F5A" }}>Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={onChange}
                  style={{
                    width: "100%",
                    padding: 10,
                    border: "1px solid #D1D5DB",
                    borderRadius: 8,
                    color: "#111827",
                    outline: "none",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    transition: "all 0.2s"
                  }}
                  onFocus={e => e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.3)"}
                  onBlur={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)"}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
  
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
              <button onClick={() => setOpen(false)} style={{ background: "#EF4444", color: "#fff", border: 0, borderRadius: 8, padding: "8px 16px", fontWeight: 600, boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}>Close</button>
              <button onClick={submit} disabled={!validForm()} style={{ background: "#1D4ED8", color: "#fff", opacity: !validForm() ? 0.6 : 1, cursor: !validForm() ? "not-allowed" : "pointer", border: 0, borderRadius: 8, padding: "8px 16px", fontWeight: 600, boxShadow: "0 2px 6px rgba(0,0,0,0.15)", transition: "0.2s" }}>Submit</button>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
  

//      <div style={{ padding: 12, backgroundColor: "#f0f4f8", width:"80%", marginLeft:"120px", marginTop:"14rem" }}>
 
//   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
//     <h2 style={{ fontSize: 18, fontWeight: 700, color: "#0A2F5A" }}>Manage Academic Session</h2>
//     <button 
//       onClick={() => setOpen(true)}
//       style={{
//         background: "#3B82F6",
//         color: "#fff",
//         border: 0,
//         borderRadius: 8,
//         padding: "8px 12px",
//         fontWeight: 600,
//         cursor: "pointer",
//         boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
//         transition: "all 0.2s ease-in-out"
//       }}
//       onMouseOver={e => e.currentTarget.style.background = "#2563EB"}
//       onMouseOut={e => e.currentTarget.style.background = "#3B82F6"}
//     >
//       + ADD NEW
//     </button>
//   </div>

 
//   <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
//     <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
//       <span style={{ color: "#475569" }}>Show</span>
//       <select 
//         value={limit} 
//         onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}
//         style={{
//           padding: 6,
//           border: "1px solid #94a3b8",
//           borderRadius: 6,
//           color: "#0A2F5A",
//           outline: "none",
//           boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
//           transition: "0.2s"
//         }}
//         onFocus={e => e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.3)"}
//         onBlur={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)"}
//       >
//         <option value={10}>10</option>
//         <option value={20}>20</option>
//         <option value={50}>50</option>
//       </select>
//       <span style={{ color: "#475569" }}>entries</span>
//     </div>
//     <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
//       <label style={{ color: "#475569" }}>Search:</label>
//       <input 
//         value={search} 
//         onChange={(e) => setSearch(e.target.value)} 
//         style={{
//           padding: 8,
//           border: "1px solid #94a3b8",
//           borderRadius: 8,
//           color: "#0A2F5A",
//           outline: "none",
//           boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
//           transition: "0.2s"
//         }}
//         onFocus={e => e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.3)"}
//         onBlur={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)"}
//       />
//     </div>
//   </div>


//   <div style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: 12, overflow: "hidden", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
//     <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
//       <thead>
//         <tr style={{ background: "#e0f2fe", color: "#0A2F5A" }}>
//           <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #cbd5e1", width: 100 }}>Action</th>
//           <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #cbd5e1" }}>Session</th>
//           <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #cbd5e1", width: 180 }}>Start Date</th>
//           <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #cbd5e1", width: 180 }}>End Date</th>
//           <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #cbd5e1", width: 140 }}>Status</th>
//         </tr>
//       </thead>
//       <tbody>
//         {loading ? (
//           <tr>
//             <td colSpan={5} style={{ padding: 16, textAlign: "center", color: "#64748b" }}>Loading...</td>
//           </tr>
//         ) : paged.length === 0 ? (
//           <tr>
//             <td colSpan={5} style={{ padding: 16, textAlign: "center", color: "#64748b" }}>No data found</td>
//           </tr>
//         ) : (
//           paged.map((row, idx) => (
//             <tr key={row._id || idx} style={{ borderTop: "1px solid #e2e8f0", transition: "background 0.2s", cursor: "pointer" }}
//                 onMouseOver={e => e.currentTarget.style.background = "#f0f9ff"}
//                 onMouseOut={e => e.currentTarget.style.background = "transparent"}>
//               <td style={{ padding: 12 }}>
//                 <div style={{ width: 28, height: 28, background: "#3B82F6", borderRadius: 6, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }} />
//               </td>
//               <td style={{ padding: 12, color: "#0A2F5A" }}>{row.name}</td>
//               <td style={{ padding: 12, color: "#0A2F5A" }}>{formatDate(row.startDate)}</td>
//               <td style={{ padding: 12, color: "#0A2F5A" }}>{formatDate(row.endDate)}</td>
//               <td style={{ padding: 12, color: row.status === "Active" ? "#10B981" : "#EF4444" }}>{row.status}</td>
//             </tr>
//           ))
//         )}
//       </tbody>
//     </table>
//   </div>

 
//   <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, color: "#475569" }}>
//     <div>Showing {(paged.length && (page - 1) * limit + 1) || 0}-{(page - 1) * limit + paged.length} of {filtered.length} entries</div>
//     <div style={{ display: "flex", gap: 8 }}>
//       <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "6px 10px", border: "1px solid #94a3b8", borderRadius: 8, background: page === 1 ? "#f1f5f9" : "#fff", color: "#0A2F5A" }}>Prev</button>
//       <div style={{ padding: "6px 10px", border: "1px solid #94a3b8", borderRadius: 8, color: "#0A2F5A" }}>Page {page} / {totalPages}</div>
//       <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: "6px 10px", border: "1px solid #94a3b8", borderRadius: 8, background: page === totalPages ? "#f1f5f9" : "#fff", color: "#0A2F5A" }}>Next</button>
//     </div>
//   </div>

 
//   {open && (
//     <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "10vh", zIndex: 50 }}>
//       <div style={{ width: "min(900px, 95vw)", background: "#fff", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
//         <div style={{ background: "#3B82F6", padding: 16, borderTopLeftRadius: 12, borderTopRightRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center", color: "#fff" }}>
//           <div style={{ fontWeight: 700, fontSize: 18 }}>Add New UG/PG Session</div>
//           <button onClick={() => setOpen(false)} style={{ background: "transparent", border: 0, fontSize: 18, color: "#fff" }}>×</button>
//         </div>
//         <div style={{ padding: 20 }}>
//           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
//             {["name","startDate","endDate","registrationSeries","enrollmentSeries"].map((field, idx) => (
//               <div key={idx}>
//                 <label style={{ display: "block", fontSize: 14, marginBottom: 6, color: "#0A2F5A" }}>
//                   {field.charAt(0).toUpperCase() + field.slice(1)}
//                 </label>
//                 <input
//                   name={field}
//                   value={form[field]}
//                   onChange={onChange}
//                   placeholder={field === "name" ? "2025-2026" : field === "registrationSeries" ? "1000" : field === "enrollmentSeries" ? "WM10190" : ""}
//                   type={field.includes("Date") ? "date" : "text"}
//                   style={{
//                     width: "100%",
//                     padding: 10,
//                     border: "1px solid #94a3b8",
//                     borderRadius: 8,
//                     color: "#0A2F5A",
//                     outline: "none",
//                     boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
//                     transition: "all 0.2s"
//                   }}
//                   onFocus={e => e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.3)"}
//                   onBlur={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)"}
//                 />
//               </div>
//             ))}
//             <div>
//               <label style={{ display: "block", fontSize: 14, marginBottom: 6, color: "#0A2F5A" }}>Status</label>
//               <select
//                 name="status"
//                 value={form.status}
//                 onChange={onChange}
//                 style={{
//                   width: "100%",
//                   padding: 10,
//                   border: "1px solid #94a3b8",
//                   borderRadius: 8,
//                   color: "#0A2F5A",
//                   outline: "none",
//                   boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
//                   transition: "all 0.2s"
//                 }}
//                 onFocus={e => e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.3)"}
//                 onBlur={e => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)"}
//               >
//                 <option value="Active">Active</option>
//                 <option value="Inactive">Inactive</option>
//               </select>
//             </div>
//           </div>

//           <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
//             <button onClick={() => setOpen(false)} style={{ background: "#EF4444", color: "#fff", border: 0, borderRadius: 8, padding: "8px 16px", fontWeight: 600, boxShadow: "0 2px 6px rgba(0,0,0,0.15)" }}>Close</button>
//             <button onClick={submit} disabled={!validForm()} style={{ background: "#2563EB", color: "#fff", opacity: !validForm() ? 0.6 : 1, cursor: !validForm() ? "not-allowed" : "pointer", border: 0, borderRadius: 8, padding: "8px 16px", fontWeight: 600, boxShadow: "0 2px 6px rgba(0,0,0,0.15)", transition: "0.2s" }}>Submit</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )}
// </div> 





   
  );
}
