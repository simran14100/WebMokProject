import React, { useEffect, useMemo, useState } from "react";
import { apiConnector } from "../../../../services/apiConnector";

export default function UGPGSettingsLanguages() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", code: "", description: "", direction: "LTR", isDefault: false });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    if (!q) return items;
    return items.filter((d) =>
      [d?.name, d?.code, d?.description, d?.direction, d?.status].some((v) => (v || "").toString().toLowerCase().includes(q))
    );
  }, [items, debouncedSearch]);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const paged = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page, limit]);

  const fetchLanguages = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiConnector("GET", "/api/v1/language");
      const list = res?.data?.data || [];
      setItems(Array.isArray(list) ? list : []);
      setPage(1);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load languages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLanguages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const onPrev = () => setPage((p) => Math.max(1, p - 1));
  const onNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: "12rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Manage Languages</h2>
        <button onClick={() => { setForm({ name: "", code: "", description: "", direction: "LTR", isDefault: false }); setSubmitError(""); setOpen(true); }} style={{ background: "#6d28d9", color: "#fff", border: 0, borderRadius: 8, padding: "8px 12px", fontWeight: 600 }}>+ ADD NEW</button>
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
          <span>Search:</span>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" style={{ padding: 8, border: "1px solid #e2e8f0", borderRadius: 8 }} />
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #eaeef3", borderRadius: 12, overflow: "hidden" }}>
        {error ? (
          <div style={{ padding: 16, color: "#b00020" }}>{error}</div>
        ) : (
          <div style={{ width: "100%", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#f8fafc" }}>
                <tr>
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3" }}>Action</th>
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3" }}>Name</th>
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3" }}>Code</th>
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3" }}>Description</th>
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3" }}>Direction</th>
                  <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 16 }}>Loading...</td>
                  </tr>
                ) : paged.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 16 }}>No entries.</td>
                  </tr>
                ) : (
                  paged.map((row) => (
                    <tr key={row._id}>
                      <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>
                        <div style={{ width: 28, height: 28, background: "#6d28d9", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <div style={{ width: 14, height: 2, background: "#fff", boxShadow: "0 4px 0 0 #fff, 0 -4px 0 0 #fff" }} />
                        </div>
                      </td>
                      <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{row?.name || "-"}</td>
                      <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{row?.code || "-"}</td>
                      <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{row?.description || ""}</td>
                      <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{row?.direction || "LTR"}</td>
                      <td style={{ padding: 12, borderBottom: "1px solid #f1f5f9" }}>{row?.status || "Active"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
        <div>Showing {Math.min((page - 1) * limit + 1, total)} to {Math.min(page * limit, total)} of {total} entries</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={onPrev} disabled={page <= 1} style={{ padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 8, background: page <= 1 ? "#f1f5f9" : "#fff" }}>Previous</button>
          <span style={{ color: "#334155" }}>{page}</span>
          <button onClick={onNext} disabled={page >= totalPages} style={{ padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 8, background: page >= totalPages ? "#f1f5f9" : "#fff" }}>Next</button>
        </div>
      </div>

      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "10vh", zIndex: 50 }}>
          <div style={{ width: "min(800px, 95vw)", background: "#fff", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
            <div style={{ background: "#f8caff", padding: 16, borderTopLeftRadius: 12, borderTopRightRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>Add New Language</div>
              <button onClick={() => setOpen(false)} style={{ background: "transparent", border: 0, fontSize: 18, color: "#7f1d1d" }}>×</button>
            </div>
            <div style={{ padding: 20 }}>
              {submitError ? <div style={{ color: "#b00020", marginBottom: 12 }}>{submitError}</div> : null}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Language Name:</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="Enter language name"
                    style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Language Code:</label>
                  <input
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                    placeholder="e.g., en, hi"
                    style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Description:</label>
                  <input
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Description"
                    style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Direction:</label>
                  <select value={form.direction} onChange={(e) => setForm((f) => ({ ...f, direction: e.target.value }))} style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }}>
                    <option value="LTR">LTR</option>
                    <option value="RTL">RTL</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Default:</label>
                  <select value={form.isDefault ? "Default" : "Not Default"} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.value === "Default" }))} style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }}>
                    <option value="Not Default">Not Default</option>
                    <option value="Default">Default</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 24 }}>
                <button onClick={() => setOpen(false)} style={{ background: "#ef4444", color: "#fff", border: 0, borderRadius: 8, padding: "8px 16px", fontWeight: 600 }}>Close</button>
                <button
                  disabled={submitting}
                  onClick={async () => {
                    setSubmitError("");
                    if (!form.name.trim() || !form.code.trim()) {
                      setSubmitError("Name and Code are required");
                      return;
                    }
                    setSubmitting(true);
                    try {
                      await apiConnector("POST", "/api/v1/language", {
                        name: form.name.trim(),
                        code: form.code.trim(),
                        description: form.description.trim(),
                        direction: form.direction,
                        isDefault: !!form.isDefault,
                      });
                      await fetchLanguages();
                      setOpen(false);
                    } catch (e) {
                      setSubmitError(e?.response?.data?.message || e.message || "Failed to create language");
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  style={{ background: "#2563eb", color: "#fff", border: 0, borderRadius: 8, padding: "8px 16px", fontWeight: 600 }}
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
