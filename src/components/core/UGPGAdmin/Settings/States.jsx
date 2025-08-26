import React, { useEffect, useMemo, useState } from "react";

export default function UGPGSettingsStates() {
  const [items] = useState([]); // keep empty per requirement
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return items;
    return items.filter((it) =>
      it.name?.toLowerCase?.().includes(debouncedSearch) ||
      String(it.code || "").toLowerCase().includes(debouncedSearch)
    );
  }, [items, debouncedSearch]);

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
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Manage States</h2>
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
              <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3" }}>Name</th>
              <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3", width: 160 }}>State Code</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: 16, textAlign: "center", color: "#64748b" }}>No data found</td>
              </tr>
            ) : (
              paged.map((row, idx) => (
                <tr key={row._id || idx} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: 12 }}>
                    <div style={{ width: 28, height: 28, background: "#6d28d9", borderRadius: 6 }} />
                  </td>
                  <td style={{ padding: 12 }}>{row.name}</td>
                  <td style={{ padding: 12 }}>{row.code}</td>
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
          <div style={{ width: "min(800px, 95vw)", background: "#fff", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
            <div style={{ background: "#f8caff", padding: 16, borderTopLeftRadius: 12, borderTopRightRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>Add New State</div>
              <button onClick={() => setOpen(false)} style={{ background: "transparent", border: 0, fontSize: 18, color: "#7f1d1d" }}>×</button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Name</label>
                  <input placeholder="State name" style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>State Code</label>
                  <input placeholder="Optional code" style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
                <button onClick={() => setOpen(false)} style={{ background: "#ef4444", color: "#fff", border: 0, borderRadius: 8, padding: "8px 16px", fontWeight: 600 }}>Close</button>
                <button disabled style={{ background: "#2563eb", color: "#fff", opacity: 0.5, cursor: "not-allowed", border: 0, borderRadius: 8, padding: "8px 16px", fontWeight: 600 }}>Submit</button>
              </div>
              <div style={{ color: "#64748b", marginTop: 8, fontSize: 12 }}>Note: Submission disabled. No custom data will be created.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
