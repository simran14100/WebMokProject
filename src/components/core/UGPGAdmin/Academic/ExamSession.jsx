import React, { useEffect, useMemo, useState } from "react";
import { listExamSessions, createExamSession } from "../../../../services/examSessionApi";
import { showError, showSuccess } from "../../../../utils/toast";

export default function ExamSession() {
  const TEAL = "#0d9488"; // ED Teal accent
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    batchName: "",
    month: "",
    year: "",
    lateFeeDate: "",
    lateFee: "",
    resultDate: "",
    status: "Active",
  });

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const filtered = useMemo(() => {
    if (!debouncedSearch) return items;
    return items.filter((d) =>
      [
        d?.batchName,
        d?.month,
        d?.year,
        d?.lateFeeDate,
        d?.lateFee,
        d?.resultDate,
        d?.status,
      ]
        .map((v) => (v || "").toString().toLowerCase())
        .some((s) => s.includes(debouncedSearch))
    );
  }, [items, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil((filtered.length || 1) / limit));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const paged = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page, limit]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Fetch data on mount
  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await listExamSessions();
        const list = res?.data?.data || [];
        setItems(Array.isArray(list) ? list : []);
        setPage(1);
      } catch (e) {
        const msg = e?.response?.data?.message || e.message || "Failed to load exam sessions";
        setError(msg);
        showError(msg);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const validForm = () => {
    const { batchName, month, year, status } = form;
    return batchName.trim() && month && year && status;
  };

  const submit = () => {
    if (!validForm()) return;
    setLoading(true);
    createExamSession(form)
      .then((res) => {
        const created = res?.data?.data;
        if (created) {
          showSuccess("Exam session created");
          setItems((prev) => [created, ...prev]);
          setOpen(false);
          setForm({ batchName: "", month: "", year: "", lateFeeDate: "", lateFee: "", resultDate: "", status: "Active" });
          setPage(1);
        } else {
          showError("Failed to create exam session");
        }
      })
      .catch((e) => {
        showError(e?.response?.data?.message || e.message || "Failed to create exam session");
      })
      .finally(() => setLoading(false));
  };

  const months = [
    "January","February","March","April","May","June","July","August","September","October","November","December"
  ];

  const fmt = (d) => {
    if (!d) return "";
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return d;
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: "12rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Manage Exam Session</h2>
        <button onClick={() => setOpen(true)} style={{ background: TEAL, color: "#fff", border: 0, borderRadius: 8, padding: "8px 12px", fontWeight: 600 }}>+ ADD NEW</button>
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
              <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3" }}>Batch Name</th>
              <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3", width: 120 }}>Month</th>
              <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3", width: 100 }}>Year</th>
              <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3", width: 160 }}>Late Fee Date</th>
              <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3", width: 120 }}>Late Fee</th>
              <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3", width: 160 }}>Result Date</th>
              <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3", width: 120 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: 16, textAlign: "center", color: "#64748b" }}>Loading...</td>
              </tr>
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 16, textAlign: "center", color: "#64748b" }}>No data found</td>
              </tr>
            ) : (
              paged.map((row, idx) => (
                <tr key={idx} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: 12 }}>
                    <div style={{ width: 28, height: 28, background: TEAL, borderRadius: 6 }} />
                  </td>
                  <td style={{ padding: 12 }}>{row.batchName}</td>
                  <td style={{ padding: 12 }}>{row.month}</td>
                  <td style={{ padding: 12 }}>{row.year}</td>
                  <td style={{ padding: 12 }}>{fmt(row.lateFeeDate)}</td>
                  <td style={{ padding: 12 }}>{row.lateFee}</td>
                  <td style={{ padding: 12 }}>{fmt(row.resultDate)}</td>
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
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 8, background: page === 1 ? "#f1f5f9" : "#fff" }}>Previous</button>
          <div style={{ padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 8 }}>Page {page} / {totalPages}</div>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 8, background: page === totalPages ? "#f1f5f9" : "#fff" }}>Next</button>
        </div>
      </div>

      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "10vh", zIndex: 50 }}>
          <div style={{ width: "min(950px, 95vw)", background: "#fff", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
            <div style={{ background: "#fbcfe8", padding: 16, borderTopLeftRadius: 12, borderTopRightRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#111827" }}>Add Exam Session</div>
              <button onClick={() => setOpen(false)} style={{ background: "transparent", border: 0, fontSize: 18, color: "#7f1d1d" }}>×</button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Batch Name</label>
                  <input name="batchName" value={form.batchName} onChange={onChange} placeholder="Enter Batch Name" style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8, outlineColor: TEAL }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Month</label>
                  <select name="month" value={form.month} onChange={onChange} style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }}>
                    <option value="">Select month</option>
                    {months.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Exam Year</label>
                  <input name="year" value={form.year} onChange={onChange} placeholder="2025" style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Late Fee Date</label>
                  <input type="date" name="lateFeeDate" value={form.lateFeeDate} onChange={onChange} placeholder="dd/mm/yyyy" style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Late Fee Amount</label>
                  <input name="lateFee" value={form.lateFee} onChange={onChange} placeholder="600" style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6 }}>Result Date</label>
                  <input type="date" name="resultDate" value={form.resultDate} onChange={onChange} placeholder="dd/mm/yyyy" style={{ width: "100%", padding: 10, border: "1px solid #cbd5e1", borderRadius: 8 }} />
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
                <button onClick={submit} disabled={!validForm() || loading} style={{ background: "#2563eb", color: "#fff", opacity: (!validForm() || loading) ? 0.6 : 1, cursor: (!validForm() || loading) ? "not-allowed" : "pointer", border: 0, borderRadius: 8, padding: "8px 16px", fontWeight: 600 }}>{loading ? "Submitting..." : "Submit"}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
