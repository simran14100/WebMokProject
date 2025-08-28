import React, { useEffect, useMemo, useState } from "react";

export default function PhoneLogs() {
  const ED_TEAL = "#14b8a6";
  const BORDER = "#e5e7eb";
  const TEXT = "#334155";
  const API_URL = "http://localhost:4000/api/v1/ugpg-visitor-log";

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

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

  useEffect(() => {
    fetchRows();
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
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
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
            gridTemplateColumns: "2fr 1.5fr 2fr 2fr 1.5fr 1.5fr 2fr", 
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
                  gridTemplateColumns: "2fr 1.5fr 2fr 2fr 1.5fr 1.5fr 2fr",
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
    </div>
  );
}
