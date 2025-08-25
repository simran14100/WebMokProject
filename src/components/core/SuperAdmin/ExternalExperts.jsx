import React, { useEffect, useMemo, useState } from "react";
import { apiConnector } from "../../../services/apiConnector";

const emptyForm = {
  subject: "",
  name: "",
  contactNumber: "",
  email: "",
  designation: "",
  institute: "",
  address: "",
};

export default function ExternalExperts() {
  const [experts, setExperts] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Derived data
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return experts;
    return experts.filter((e) =>
      [e.name, e.subject, e.designation, e.email, e.institute]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [experts, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setServerError("");
      try {
        const [expRes, subRes] = await Promise.all([
          apiConnector("GET", "/api/v1/external-experts"),
          apiConnector("GET", "/api/v1/subject"),
        ]);
        setExperts(Array.isArray(expRes?.data?.data) ? expRes.data.data : []);
        const subs = Array.isArray(subRes?.data?.data?.subjects)
          ? subRes.data.data.subjects
          : Array.isArray(subRes?.data?.data)
          ? subRes.data.data
          : [];
        setSubjects(subs);
      } catch (e) {
        console.error("Failed to load experts/subjects", e);
        setServerError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const openModal = () => {
    setForm(emptyForm);
    setErrors({});
    setEditingId(null);
    setIsOpen(true);
  };
  const closeModal = () => setIsOpen(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const validate = () => {
    const n = {};
    if (!form.subject) n.subject = "Subject is required";
    if (!form.name.trim()) n.name = "Name is required";
    if (!form.email.trim()) n.email = "Email is required";
    setErrors(n);
    return Object.keys(n).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const payload = {
        subject: form.subject,
        name: form.name.trim(),
        email: form.email.trim(),
        contactNumber: form.contactNumber.trim(),
        designation: form.designation.trim(),
        institute: form.institute.trim(),
        address: form.address.trim(),
      };
      if (editingId) {
        const res = await apiConnector("PUT", `/api/v1/external-experts/${editingId}`, payload);
        const updated = res?.data?.data;
        if (updated) setExperts((prev) => prev.map((x) => (x._id === editingId ? updated : x)));
      } else {
        const res = await apiConnector("POST", "/api/v1/external-experts", payload);
        const created = res?.data?.data;
        if (created) setExperts((prev) => [created, ...prev]);
      }
      closeModal();
    } catch (e) {
      console.error("Save expert failed", e);
      setServerError("Failed to save expert");
    }
  };

  const onEdit = (row) => {
    setEditingId(row._id || row.id);
    setErrors({});
    setForm({
      subject: row.subject || "",
      name: row.name || "",
      contactNumber: row.contactNumber || "",
      email: row.email || "",
      designation: row.designation || "",
      institute: row.institute || "",
      address: row.address || "",
    });
    setIsOpen(true);
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete this expert?")) return;
    try {
      await apiConnector("DELETE", `/api/v1/external-experts/${id}`);
      setExperts((prev) => prev.filter((x) => (x._id || x.id) !== id));
    } catch (e) {
      console.error("Delete expert failed", e);
      setServerError("Failed to delete expert");
    }
  };

  const onCopy = async () => {
    try {
      const rows = experts.map((e) => [e.name, e.subject, e.designation, e.email, e.contactNumber, e.institute].join("\t")).join("\n");
      await navigator.clipboard.writeText(rows);
      alert("Copied table to clipboard");
    } catch {}
  };

  const onCSV = () => {
    const header = ["Name", "Subject", "Designation", "Email", "Contact", "Institute"].join(",");
    const body = experts
      .map((e) => [e.name, e.subject, e.designation, e.email, e.contactNumber, e.institute].map((v) => `"${(v || "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([header + "\n" + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "external_experts.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const onPrint = () => {
    const htmlRows = experts
      .map(
        (e, idx) =>
          `<tr><td style="padding:8px;border:1px solid #ddd;">${idx + 1}</td><td style="padding:8px;border:1px solid #ddd;">${e.name || ""}</td><td style="padding:8px;border:1px solid #ddd;">${e.subject || ""}</td><td style="padding:8px;border:1px solid #ddd;">${e.designation || ""}</td><td style="padding:8px;border:1px solid #ddd;">${e.email || ""}</td></tr>`
      )
      .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8" /><title>External Experts</title></head><body>
      <h2 style="font-family:Arial;margin-bottom:12px;">External Expert Management</h2>
      <table style="width:100%;border-collapse:collapse;font-family:Arial;font-size:14px;">
      <thead><tr>
      <th style="padding:8px;border:1px solid #ddd;text-align:left;">#</th>
      <th style="padding:8px;border:1px solid #ddd;text-align:left;">Name</th>
      <th style="padding:8px;border:1px solid #ddd;text-align:left;">Subject</th>
      <th style="padding:8px;border:1px solid #ddd;text-align:left;">Designation</th>
      <th style="padding:8px;border:1px solid #ddd;text-align:left;">Email</th>
      </tr></thead>
      <tbody>${htmlRows}</tbody>
      </table>
    </body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.print();
    w.close();
  };

  // Reset to page 1 on new search
  useEffect(() => setPage(1), [search]);

  return (
    <div style={{ padding: "24px", marginTop: "10rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, color: "#1f2937" }}>External Expert Management</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={onCopy} style={{ borderRadius: 8, background: "#6b7280", color: "white", padding: "8px 12px", border: "none", cursor: "pointer" }}>Copy</button>
          <button onClick={onCSV} style={{ borderRadius: 8, background: "#6b7280", color: "white", padding: "8px 12px", border: "none", cursor: "pointer" }}>CSV</button>
          <button onClick={onPrint} style={{ borderRadius: 8, background: "#6b7280", color: "white", padding: "8px 12px", border: "none", cursor: "pointer" }}>Print</button>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 16 }}>
            <span style={{ color: "#6b7280", fontSize: 14 }}>Search:</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} style={{ border: "1px solid #d1d5db", borderRadius: 6, padding: "6px 10px" }} />
          </div>
          <button
            onClick={openModal}
            style={{ borderRadius: 8, background: "#2563eb", color: "white", padding: "8px 14px", border: "none", cursor: "pointer", marginLeft: 16 }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
          >
            Add New Expert
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflow: "hidden", borderRadius: 12, border: "1px solid #e5e7eb", background: "white" }}>
        {serverError && (
          <div style={{ borderBottom: "1px solid #fecaca", backgroundColor: "#fef2f2", padding: "8px 16px", fontSize: 14, color: "#b91c1c" }}>{serverError}</div>
        )}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#111827", color: "white" }}>
              <tr>
                {[
                  "",
                  "Action",
                  "Name",
                  "Subject",
                  "Designation",
                  "Email",
                ].map((h) => (
                  <th key={h} style={{ padding: "12px 16px", fontSize: 12, letterSpacing: ".05em", textTransform: "uppercase", textAlign: "left", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: 16, textAlign: "center", color: "#6b7280" }}>Loading...</td>
                </tr>
              ) : pageItems.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 16, textAlign: "center", color: "#6b7280" }}>No experts found.</td>
                </tr>
              ) : (
                pageItems.map((e, idx) => (
                  <tr key={e._id || e.id}>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
                      <input type="checkbox" />
                    </td>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => onEdit(e)} title="Edit" style={{ borderRadius: 20, width: 32, height: 32, border: "1px solid #e5e7eb", cursor: "pointer" }}>✎</button>
                        <button onClick={() => onDelete(e._id || e.id)} title="Delete" style={{ borderRadius: 20, width: 32, height: 32, border: "1px solid #e5e7eb", cursor: "pointer" }}>🗑️</button>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>{e.name}</td>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>{e.subject}</td>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>{e.designation}</td>
                    <td style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6" }}>{e.email}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Footer pagination */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "#f9fafb" }}>
          <span style={{ color: "#6b7280", fontSize: 14 }}>Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} entries</span>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #e5e7eb", background: "white", cursor: page <= 1 ? "not-allowed" : "pointer" }}>Previous</button>
            <span style={{ padding: "6px 10px", borderRadius: 6, background: "#2563eb", color: "white" }}>{page}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #e5e7eb", background: "white", cursor: page >= totalPages ? "not-allowed" : "pointer" }}>Next</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 30000, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.4)", padding: 16 }}>
          <div style={{ width: "100%", maxWidth: 900, borderRadius: 12, background: "white" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #eee" }}>
              <h3 style={{ fontSize: 18, fontWeight: 700 }}>Add New Expert</h3>
              <button onClick={closeModal} style={{ background: "transparent", border: "none", fontSize: 20, cursor: "pointer" }}>×</button>
            </div>
            <form onSubmit={onSubmit} style={{ padding: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Subject:</label>
                  <select name="subject" value={form.subject} onChange={onChange} style={{ width: "100%", border: errors.subject ? "1px solid #f87171" : "1px solid #d1d5db", borderRadius: 8, padding: "8px 10px" }}>
                    <option value="">Select Subject</option>
                    {subjects.map((s) => (
                      <option value={s.name || s.subject || s._id} key={s._id || s.name}>
                        {s.name || s.subject}
                      </option>
                    ))}
                  </select>
                  {errors.subject && <p style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>{errors.subject}</p>}
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Expert Name:</label>
                  <input name="name" value={form.name} onChange={onChange} style={{ width: "100%", border: errors.name ? "1px solid #f87171" : "1px solid #d1d5db", borderRadius: 8, padding: "8px 10px" }} />
                  {errors.name && <p style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>{errors.name}</p>}
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Contact Number:</label>
                  <input name="contactNumber" value={form.contactNumber} onChange={onChange} style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "8px 10px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>E-mail:</label>
                  <input type="email" name="email" value={form.email} onChange={onChange} style={{ width: "100%", border: errors.email ? "1px solid #f87171" : "1px solid #d1d5db", borderRadius: 8, padding: "8px 10px" }} />
                  {errors.email && <p style={{ color: "#dc2626", fontSize: 12, marginTop: 4 }}>{errors.email}</p>}
                </div>

                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Designation:</label>
                  <input name="designation" value={form.designation} onChange={onChange} style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "8px 10px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Institute/University:</label>
                  <input name="institute" value={form.institute} onChange={onChange} style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "8px 10px" }} />
                </div>

                <div style={{ gridColumn: "1 / span 2" }}>
                  <label style={{ display: "block", fontWeight: 500, marginBottom: 6 }}>Address:</label>
                  <input name="address" value={form.address} onChange={onChange} style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "8px 10px" }} />
                </div>
              </div>

              <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 12, borderTop: "1px solid #eee", paddingTop: 12 }}>
                <button type="button" onClick={closeModal} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 14px", background: "white", cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ border: "none", borderRadius: 8, padding: "8px 14px", background: "#2563eb", color: "white", cursor: "pointer" }}>{editingId ? "Update" : "Submit"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
