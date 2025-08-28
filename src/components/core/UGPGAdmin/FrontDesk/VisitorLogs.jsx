import React, { useEffect, useMemo, useState } from "react";

export default function VisitorLogs() {
  const ED_TEAL = "#14b8a6";
  const BORDER = "#e5e7eb";
  const TEXT = "#334155";
  const API_URL = "http://localhost:4000/api/v1/ugpg-visitor-log"; // UG/PG Visitor Logs (separate from PhD)

  // Demo data (replace later with API)
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // Table controls
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(() => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);
    
    return {
      visitPurpose: "",
      department: "",
      name: "",
      fatherName: "",
      phone: "",
      email: "",
      idNumber: "",
      address: "",
      visitFrom: "",
      date: dateStr, // Set default to today's date
      timeIn: timeStr, // Set default to current time
      timeOut: "",
      totalVisitors: 1,
      remarks: "",
    };
  });

  // Load data (client-side pagination/search retained)
  const fetchRows = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}?limit=1000`);
      const json = await res.json();
      if (json?.success) {
        // Normalize id field for frontend
        const items = (json.data || []).map((it) => ({ id: it._id || it.id, ...it }));
        setRows(items);
      }
    } catch (e) {
      // fail silently for now
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  // Filter + paginate
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [
        r.visitPurpose,
        r.department,
        r.name,
        r.fatherName,
        r.phone,
        r.email,
        r.idNumber,
        r.address,
        r.visitFrom,
        r.date,
        r.timeIn,
        r.timeOut,
        String(r.totalVisitors),
        r.remarks,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages));
  }, [totalPages]);

  const paginated = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page, limit]);

  // Handlers
  const openAdd = () => {
    // Prefill date and time in as per UI mock
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    const today = `${yyyy}-${mm}-${dd}`; // HTML date input format
    const timeNow = `${hh}:${min}`; // HTML time input format
    setEditId(null);
    setForm({
      visitPurpose: "",
      department: "",
      name: "",
      fatherName: "",
      phone: "",
      email: "",
      idNumber: "",
      address: "",
      visitFrom: "",
      date: today,
      timeIn: timeNow,
      timeOut: "",
      totalVisitors: 1,
      remarks: "",
    });
    setModalOpen(true);
  };
  const openEdit = (row) => {
    setEditId(row.id);
    setForm({
      visitPurpose: row.visitPurpose || "",
      department: row.department || "",
      name: row.name || "",
      fatherName: row.fatherName || "",
      phone: row.phone || "",
      email: row.email || "",
      idNumber: row.idNumber || "",
      address: row.address || "",
      visitFrom: row.visitFrom || "",
      date: row.date || "",
      timeIn: row.timeIn || "",
      timeOut: row.timeOut || "",
      totalVisitors: row.totalVisitors || 1,
      remarks: row.remarks || "",
    });
    setModalOpen(true);
  };
  const saveRow = async () => {
    // Validate required fields
    if (!form.visitPurpose || !form.department || !form.name.trim() || !form.phone.trim()) {
      alert('Please fill in all required fields: Visit Purpose, Department, Name, and Phone');
      return;
    }
    
    try {
      const method = editId ? "PUT" : "POST";
      const url = editId ? `${API_URL}/${editId}` : `${API_URL}`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      
      const json = await res.json();
      
      if (!res.ok) {
        // Handle HTTP errors (4xx, 5xx)
        const errorMessage = json?.message || 'An error occurred while saving the visitor log';
        throw new Error(errorMessage);
      }
      
      if (json?.success) {
        await fetchRows();
        setModalOpen(false);
      } else {
        // Handle API-level errors (success: false)
        throw new Error(json?.message || 'Failed to save visitor log');
      }
    } catch (e) {
      console.error('Error saving visitor log:', e);
      alert(`Error: ${e.message}`);
    }
  };
  const removeRow = async (row) => {
    if (!window.confirm("Delete this visitor entry?")) return;
    try {
      await fetch(`${API_URL}/${row.id}`, { method: "DELETE" });
      await fetchRows();
    } catch (e) {
      // no-op
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", position: 'relative', zIndex: 1 , marginTop:"11rem"}}>
      <div
        style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: 16 }}
        onContextMenu={(e) => {
          e.preventDefault();
          openAdd();
        }}
        title="Right-click anywhere on this card to add a new visitor"
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: TEXT, marginLeft: "120px" }}>Manage Visitors</h3>
          <button onClick={openAdd} style={{ background: ED_TEAL, color: "#fff", border: `1px solid ${ED_TEAL}`, padding: "8px 12px", borderRadius: 8, marginRight: "120px" }}>+ Add New</button>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "12px 120px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: TEXT }}>Show</span>
            <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 10px" }}>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span style={{ color: TEXT }}>entries</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ color: TEXT }}>Search:</label>
            <input value={search} onChange={(e) => { setPage(1); setSearch(e.target.value); }} placeholder="Search..." style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 10px", width: 240 }} />
          </div>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden", width: "80%", marginLeft: "120px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 2.5fr 2.5fr 2.5fr 2fr 3fr 2fr 2fr 2fr 2fr 2fr 3fr", background: ED_TEAL, color: "#fff", padding: "12px 16px", fontWeight: 500 }}>
            <div>Action</div>
            <div>Visit Purpose</div>
            <div>Department</div>
            <div>Name</div>
            <div>Phone</div>
            <div>Address</div>
            <div>Visit From</div>
            <div>Date</div>
            <div>Time In</div>
            <div>Time Out</div>
            <div>Total Visitors</div>
            <div>Remarks</div>
          </div>
          <div>
            {loading && <div style={{ padding: 12, color: TEXT }}>Loading...</div>}
            {!loading && paginated.map((row) => (
              <div key={row.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 2.5fr 2.5fr 2.5fr 2fr 3fr 2fr 2fr 2fr 2fr 2fr 3fr", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => openEdit(row)} style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${ED_TEAL}`, background: "#fff", color: ED_TEAL }}>Edit</button>
                  <button onClick={() => removeRow(row)} style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid #ef4444`, background: "#fff", color: "#ef4444" }}>Delete</button>
                </div>
                <div style={{ color: TEXT }}>{row.visitPurpose}</div>
                <div style={{ color: TEXT }}>{row.department}</div>
                <div style={{ color: TEXT }}>{row.name}</div>
                <div style={{ color: TEXT }}>{row.phone}</div>
                <div style={{ color: TEXT }}>{row.address}</div>
                <div style={{ color: TEXT }}>{row.visitFrom}</div>
                <div style={{ color: TEXT }}>{row.date}</div>
                <div style={{ color: TEXT }}>{row.timeIn}</div>
                <div style={{ color: TEXT }}>{row.timeOut}</div>
                <div style={{ color: TEXT }}>{row.totalVisitors}</div>
                <div style={{ color: TEXT }}>{row.remarks}</div>
              </div>
            ))}
            {!loading && paginated.length === 0 && (
              <div style={{ padding: 12, color: TEXT }}>No records found.</div>
            )}
          </div>
        </div>

        {/* Footer: showing entries + pagination */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "12px 120px" }}>
          <div style={{ color: TEXT }}>
            Showing {filtered.length === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, filtered.length)} of {filtered.length} entries
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${BORDER}`, background: page === 1 ? "#f5f5f5" : "#fff" }}>Previous</button>
            <div style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${ED_TEAL}`, color: "#fff", background: ED_TEAL }}>{page}</div>
            <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${BORDER}`, background: page === totalPages ? "#f5f5f5" : "#fff" }}>Next</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50  , }}>
          <div style={{ background: "#fff", borderRadius: 12, width: 860, maxWidth: "96vw", border: `1px solid ${BORDER}` }} onContextMenu={(e) => e.preventDefault()}>
            <div style={{ background: "#fce7f3", padding: 12, borderTopLeftRadius: 12, borderTopRightRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: TEXT }}>{editId ? "Edit Visitor" : "Add New Visitor"}</h4>
              <button onClick={() => setModalOpen(false)} style={{ padding: 6, borderRadius: 6, border: `1px solid ${BORDER}`, background: "#fff" }}>✕</button>
            </div>
            <div style={{ padding: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>Visit Purpose</label>
                  <select value={form.visitPurpose} onChange={(e) => setForm((v) => ({ ...v, visitPurpose: e.target.value }))} style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }}>
                    <option value="">-- Select Purpose --</option>
                    <option value="Admission Enquiry">Admission Enquiry</option>
                    <option value="Coordinator">Coordinator</option>
                    <option value="Personal Test">Personal Test</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>Department</label>
                  <select 
                    value={form.department} 
                    onChange={(e) => setForm((v) => ({ ...v, department: e.target.value }))} 
                    style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }}
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Applied Science">Applied Science</option>
                    <option value="Arts">Arts</option>
                    <option value="Certificate Course">Certificate Course</option>
                    <option value="Commerce and Management">Commerce and Management</option>
                    <option value="Computer Applications">Computer Applications</option>
                    <option value="Education">Education</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Law">Law</option>
                    <option value="Nursing">Nursing</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Physical Education">Physical Education</option>
                    <option value="Science">Science</option>
                    <option value="Social Sciences">Social Sciences</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>Visitor Name</label>
                  <input value={form.name} onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))} placeholder="Enter Visitor Name" style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }} />
                </div>
                <div>
                  <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>Father Name</label>
                  <input value={form.fatherName} onChange={(e) => setForm((v) => ({ ...v, fatherName: e.target.value }))} placeholder="Father Name" style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }} />
                </div>
                <div>
                  <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>Visitor Email</label>
                  <input value={form.email} onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))} placeholder="Email" style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }} />
                </div>
                <div>
                  <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>Visitor Phone</label>
                  <input value={form.phone} onChange={(e) => setForm((v) => ({ ...v, phone: e.target.value }))} placeholder="Phone" style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }} />
                </div>
                <div>
                  <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>Visitor Address</label>
                  <input value={form.address} onChange={(e) => setForm((v) => ({ ...v, address: e.target.value }))} placeholder="Address" style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }} />
                </div>
                <div>
                  <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>Visit From</label>
                  <input value={form.visitFrom} onChange={(e) => setForm((v) => ({ ...v, visitFrom: e.target.value }))} placeholder="Car / Bike / Walk-in" style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }} />
                </div>
                <div>
                  <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>ID Number</label>
                  <input value={form.idNumber} onChange={(e) => setForm((v) => ({ ...v, idNumber: e.target.value }))} placeholder="ID Number" style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }} />
                </div>
                <div>
                  <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>Visit Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((v) => ({ ...v, date: e.target.value }))}
                    style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>Visit Time In</label>
                  <input
                    type="time"
                    value={form.timeIn}
                    onChange={(e) => setForm((v) => ({ ...v, timeIn: e.target.value }))}
                    style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>Total Number of Visitors</label>
                  <input type="number" min={1} value={form.totalVisitors} onChange={(e) => setForm((v) => ({ ...v, totalVisitors: Number(e.target.value || 1) }))} placeholder="Enter Total Number of V" style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }} />
                </div>
                <div style={{ gridColumn: "1 / span 3" }}>
                  <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>Remarks</label>
                  <textarea rows={3} value={form.remarks} onChange={(e) => setForm((v) => ({ ...v, remarks: e.target.value }))} placeholder="Enter Remarks" style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
                <button onClick={() => setModalOpen(false)} style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${BORDER}` }}>Close</button>
                <button onClick={saveRow} style={{ padding: "8px 12px", borderRadius: 8, background: ED_TEAL, color: "#fff", border: `1px solid ${ED_TEAL}` }}>Submit</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
