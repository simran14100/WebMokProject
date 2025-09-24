import React, { useEffect, useMemo, useState } from "react";

export default function PhoneLogs() {
  const ED_TEAL = "#14b8a6";
  const BORDER = "#e5e7eb";
  const TEXT = "#334155";
  const API_URL = "http://localhost:4000/api/v1/ugpg-visitor-log";
  const DEPT_API_URL = "http://localhost:4000/api/v1/visit-departments";

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [visitDepartments, setVisitDepartments] = useState([]);

  // Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    purpose: "",
    department: "",
    date: "",
    timeIn: "",
    remarks: "",
  });

  // Load data
  const fetchRows = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}?limit=1000`);
      const json = await res.json();
      if (json?.success) {
        const items = (json.data || [])
          .filter(item => item.phone) // Only include entries with phone numbers
          .map((it) => ({
            id: it._id || it.id,
            name: it.name || 'N/A',
            phone: it.phone,
            purpose: it.visitPurpose || 'N/A',
            department: it.department || 'N/A',
            date: it.date || 'N/A',
            timeIn: it.timeIn || 'N/A',
            remarks: it.remarks || 'N/A'
          }));
        setRows(items);
      }
    } catch (e) {
      console.error('Error fetching phone logs:', e);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({
      name: row.name || "",
      phone: row.phone || "",
      purpose: row.purpose || "",
      department: row.department || "",
      date: row.date || "",
      timeIn: row.timeIn || "",
      remarks: row.remarks || "",
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm({ name: "", phone: "", purpose: "", department: "", date: "", timeIn: "", remarks: "" });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      setSaving(true);
      // Validate phone: must be exactly 10 digits
      const phoneDigits = String(form.phone || '').replace(/\D/g, '');
      if (!/^\d{10}$/.test(phoneDigits)) {
        alert('Please enter a valid 10-digit phone number.');
        setSaving(false);
        return;
      }
      // Map UI form fields to backend expected payload keys
      const payload = {
        name: form.name,
        phone: phoneDigits,
        visitPurpose: form.purpose,
        department: form.department,
        date: form.date,
        timeIn: form.timeIn,
        remarks: form.remarks,
      };
      const res = await fetch(`${API_URL}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error('Failed to update phone log', json);
        alert(json?.message || 'Failed to update.');
        return;
      }
      // Refresh list
      await fetchRows();
      closeModal();
    } catch (e) {
      console.error('Error updating phone log:', e);
      alert('An error occurred while updating.');
    } finally {
      setSaving(false);
    }
  };

  const deleteRow = async (id) => {
    if (!id) return;
    const yes = window.confirm('Are you sure you want to delete this phone log?');
    if (!yes) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error('Failed to delete phone log', json);
        alert(json?.message || 'Failed to delete.');
        return;
      }
      // Optimistic update
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      console.error('Error deleting phone log:', e);
      alert('An error occurred while deleting.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // Load visit departments for dropdown
    (async () => {
      try {
        const res = await fetch(`${DEPT_API_URL}`);
        const json = await res.json();
        if (json?.success && Array.isArray(json.data)) {
          setVisitDepartments(json.data);
        } else if (Array.isArray(json)) {
          setVisitDepartments(json);
        } else {
          setVisitDepartments([]);
        }
      } catch (_e) {
        setVisitDepartments([]);
      }
    })();
  }, []);

  // Filter + paginate
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [
        r.name,
        r.phone,
        r.purpose,
        r.department,
        r.date,
        r.remarks
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

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" , marginTop:"12rem" }}>
      <div style={{ 
        background: "#fff", 
        border: `1px solid ${BORDER}`, 
        borderRadius: 12, 
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)", 
        padding: 16 
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: TEXT, marginLeft: "120px" }}>Phone Logs</h3>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "12px 120px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: TEXT }}>Show</span>
            <select 
              value={limit} 
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} 
              style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: "6px 10px" }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span style={{ color: TEXT }}>entries</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ color: TEXT }}>Search:</label>
            <input 
              value={search} 
              onChange={(e) => { setPage(1); setSearch(e.target.value); }} 
              placeholder="Search..." 
              style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 10px", width: 240 }} 
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ 
          background: "#fff", 
          border: `1px solid ${BORDER}`, 
          borderRadius: 12, 
          overflow: "hidden", 
          width: "80%", 
          marginLeft: "120px" 
        }}>
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "2fr 1.5fr 2fr 2fr 1.5fr 1.5fr 2fr 1.5fr", 
            background: ED_TEAL, 
            color: "#fff", 
            padding: "12px 16px", 
            fontWeight: 500 
          }}>
            <div>Name</div>
            <div>Phone</div>
            <div>Purpose</div>
            <div>Department</div>
            <div>Date</div>
            <div>Time</div>
            <div>Remarks</div>
            <div>Actions</div>
          </div>
          <div>
            {loading && <div style={{ padding: 12, color: TEXT, textAlign: 'center' }}>Loading phone logs...</div>}
            {!loading && paginated.length === 0 && (
              <div style={{ padding: 12, color: TEXT, textAlign: 'center' }}>No phone logs found.</div>
            )}
            {!loading && paginated.map((row) => (
              <div 
                key={row.id} 
                style={{ 
                  display: "grid", 
                  gridTemplateColumns: "2fr 1.5fr 2fr 2fr 1.5fr 1.5fr 2fr 1.5fr",
                  alignItems: "center", 
                  padding: "12px 16px", 
                  borderBottom: `1px solid ${BORDER}`,
                  ':hover': {
                    backgroundColor: '#f9fafb'
                  }
                }}
              >
                <div style={{ color: TEXT, fontWeight: 500 }}>{row.name}</div>
                <div style={{ color: TEXT }}>{row.phone}</div>
                <div style={{ color: TEXT }}>{row.purpose}</div>
                <div style={{ color: TEXT }}>{row.department}</div>
                <div style={{ color: TEXT }}>{row.date}</div>
                <div style={{ color: TEXT }}>{row.timeIn}</div>
                <div style={{ color: TEXT, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.remarks}>
                  {row.remarks}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => openEdit(row)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: `1px solid ${BORDER}`,
                      background: '#ffffff',
                      color: TEXT,
                      cursor: 'pointer'
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteRow(row.id)}
                    style={{
                      padding: '6px 10px',
                      borderRadius: 6,
                      border: `1px solid #fecaca`,
                      background: '#fee2e2',
                      color: '#b91c1c',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "12px 120px" }}>
          <div style={{ color: TEXT }}>
            Showing {filtered.length === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, filtered.length)} of {filtered.length} entries
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button 
              disabled={page === 1} 
              onClick={() => setPage((p) => Math.max(1, p - 1))} 
              style={{ 
                padding: "6px 10px", 
                borderRadius: 6, 
                border: `1px solid ${BORDER}`, 
                background: page === 1 ? "#f5f5f5" : "#fff",
                cursor: page === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>
            <div style={{ 
              padding: "6px 10px", 
              borderRadius: 6, 
              border: `1px solid ${ED_TEAL}`, 
              color: "#fff", 
              background: ED_TEAL 
            }}>
              {page}
            </div>
            <button 
              disabled={page === totalPages} 
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
              style={{ 
                padding: "6px 10px", 
                borderRadius: 6, 
                border: `1px solid ${BORDER}`, 
                background: page === totalPages ? "#f5f5f5" : "#fff",
                cursor: page === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {/* Edit Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
        }}>
          <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${BORDER}`, width: 520, maxWidth: '92vw', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <h4 style={{ margin: 0, color: TEXT }}>Edit Phone Log</h4>
              <button onClick={closeModal} style={{ border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer', color: TEXT }}>×</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: TEXT }}>Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ width: '100%', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px 10px' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: TEXT }}>Phone</label>
                <input 
                  value={form.phone}
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit phone"
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setForm({ ...form, phone: digits });
                  }} 
                  style={{ width: '100%', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px 10px' }} 
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: TEXT }}>Purpose</label>
                <input value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} style={{ width: '100%', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px 10px' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: TEXT }}>Department</label>
                <select 
                  value={form.department} 
                  onChange={(e) => setForm({ ...form, department: e.target.value })} 
                  style={{ width: '100%', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px 10px' }}
                >
                  <option value="">-- Select Department --</option>
                  {visitDepartments
                    .filter((d) => (d.status ? d.status === 'Active' : true))
                    .map((d) => (
                      <option key={d._id || d.id || d.name} value={d.name}>{d.name}</option>
                    ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, color: TEXT }}>Date</label>
                <input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={{ width: '100%', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px 10px' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: TEXT }}>Time</label>
                <input value={form.timeIn} onChange={(e) => setForm({ ...form, timeIn: e.target.value })} style={{ width: '100%', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px 10px' }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 12, color: TEXT }}>Remarks</label>
                <textarea rows={3} value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} style={{ width: '100%', border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px 10px', resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <button onClick={closeModal} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${BORDER}`, background: '#fff', color: TEXT, cursor: 'pointer' }}>Cancel</button>
              <button disabled={saving} onClick={saveEdit} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${ED_TEAL}`, background: ED_TEAL, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer' }}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
