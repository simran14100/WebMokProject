import React, { useEffect, useMemo, useState } from "react";
import { apiConnector } from "../../../../services/apiConnector";

export default function UGPGSettingsUsers() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const params = useMemo(() => ({ params: { page, limit, ...(debouncedSearch ? { search: debouncedSearch } : {}) } }), [page, limit, debouncedSearch]);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiConnector("GET", "/api/v1/admin/ugpg-enrolled-students", null, null, params);
      const data = res?.data?.data;
      const meta = data?.meta;
      setItems(data?.items || []);
      setTotal(meta?.total || 0);
      setTotalPages(meta?.totalPages || 1);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, debouncedSearch]);

  const onPrev = () => setPage((p) => Math.max(1, p - 1));
  const onNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Settings - Users (UG/PG Enrolled)</h2>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <input
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          placeholder="Search by name or email"
          style={{ flex: 1, padding: 8, border: "1px solid #eaeef3", borderRadius: 8 }}
        />
        <select value={limit} onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }} style={{ padding: 8, border: "1px solid #eaeef3", borderRadius: 8 }}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div style={{ background: "#fff", border: "1px solid #eaeef3", borderRadius: 12, overflow: "hidden" }}>
        {error ? (
          <div style={{ padding: 16, color: "#b00020" }}>{error}</div>
        ) : (
          <div style={{ width: "100%", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#f8fafc" }}>
                <tr>
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3" }}>#</th>
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3" }}>Name</th>
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3" }}>Email</th>
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3" }}>Courses</th>
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3" }}>Enrollment</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 16 }}>Loading...</td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 16 }}>No users found.</td>
                  </tr>
                ) : (
                  items.map((u, idx) => {
                    const name = [u.firstName, u.lastName].filter(Boolean).join(" ");
                    const courses = Array.isArray(u.courses) ? u.courses : [];
                    return (
                      <tr key={u._id}>
                        <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{(page - 1) * limit + idx + 1}</td>
                        <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{name || "-"}</td>
                        <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{u.email || "-"}</td>
                        <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{courses.length}</td>
                        <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>Paid</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
        <div style={{ color: "#64748b" }}>Total: {total}</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={onPrev} disabled={page <= 1} style={{ padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 8, background: page <= 1 ? "#f1f5f9" : "#fff" }}>Prev</button>
          <span style={{ color: "#334155" }}>Page {page} / {totalPages}</span>
          <button onClick={onNext} disabled={page >= totalPages} style={{ padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 8, background: page >= totalPages ? "#f1f5f9" : "#fff" }}>Next</button>
        </div>
      </div>
    </div>
  );
}
