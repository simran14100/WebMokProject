import React, { useEffect, useState } from "react";
import { apiConnector } from "../../../services/apiConnector";

// Simple, self-contained RAC Members UI with in-memory state
// Fields: Member Name, Designation, Department
// Modal follows the styling patterns used across the app (Tailwind)

const initialForm = { name: "", designation: "", department: "" };

export default function RacMembers() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [editingId, setEditingId] = useState(null);

  // Fetch members from backend
  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      setServerError("");
      try {
        const res = await apiConnector("GET", "/api/v1/rac-members");
        const data = res?.data?.data || [];
        setMembers(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Failed to load RAC members", e);
        setServerError("Failed to load RAC members");
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const openModal = () => {
    setForm(initialForm);
    setErrors({});
    setEditingId(null);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name?.trim()) newErrors.name = "Member Name is required";
    if (!form.designation?.trim()) newErrors.designation = "Designation is required";
    if (!form.department?.trim()) newErrors.department = "Department is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload = {
        name: form.name.trim(),
        designation: form.designation.trim(),
        department: form.department.trim(),
      };
      if (editingId) {
        const res = await apiConnector("PUT", `/api/v1/rac-members/${editingId}`, payload);
        const updated = res?.data?.data;
        if (updated) {
          setMembers((prev) => prev.map((m) => (m._id === editingId ? updated : m)));
          closeModal();
        }
      } else {
        const res = await apiConnector("POST", "/api/v1/rac-members", payload);
        const created = res?.data?.data;
        if (created) {
          setMembers((prev) => [created, ...prev]);
          closeModal();
        }
      }
    } catch (e) {
      console.error("Failed to create RAC member", e);
      setServerError("Failed to create member");
    }
  };

  const onEdit = (member) => {
    setErrors({});
    setEditingId(member._id || member.id);
    setForm({
      name: member.name || "",
      designation: member.designation || "",
      department: member.department || "",
    });
    setIsOpen(true);
  };

  const onDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this member?");
    if (!ok) return;
    try {
      await apiConnector("DELETE", `/api/v1/rac-members/${id}`);
      setMembers((prev) => prev.filter((m) => (m._id || m.id) !== id));
    } catch (e) {
      console.error("Failed to delete RAC member", e);
      setServerError("Failed to delete member");
    }
  };

  const onPrint = () => {
    // Create a simple printable table
    const htmlRows = members
      .map(
        (m, idx) =>
          `<tr><td style="padding:8px;border:1px solid #ddd;">${idx + 1}</td><td style="padding:8px;border:1px solid #ddd;">${m.name || ""}</td><td style="padding:8px;border:1px solid #ddd;">${m.designation || ""}</td><td style="padding:8px;border:1px solid #ddd;">${m.department || ""}</td></tr>`
      )
      .join("");
    const printHtml = `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>RAC Members</title></head><body>
      <h2 style="font-family:Arial;margin-bottom:12px;">RAC Members</h2>
      <table style="width:100%;border-collapse:collapse;font-family:Arial;font-size:14px;">
        <thead><tr>
          <th style="padding:8px;border:1px solid #ddd;text-align:left;">#</th>
          <th style="padding:8px;border:1px solid #ddd;text-align:left;">Member Name</th>
          <th style="padding:8px;border:1px solid #ddd;text-align:left;">Designation</th>
          <th style="padding:8px;border:1px solid #ddd;text-align:left;">Department</th>
        </tr></thead>
        <tbody>${htmlRows}</tbody>
      </table>
    </body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(printHtml);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  return (
    <div style={{ padding: "24px" , marginTop:"10rem" }}>
  {/* Header */}
  <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <h1 style={{ fontSize: "20px", fontWeight: 600, color: "#1f2937" }}>RAC Members</h1>
    <div style={{ display: "flex", gap: "8px" }}>
      <button
        onClick={onPrint}
        style={{
          borderRadius: "8px",
          backgroundColor: "#1f2937",
          padding: "8px 16px",
          color: "white",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          border: "none",
          cursor: "pointer"
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#111827")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#1f2937")}
      >
        Print
      </button>
      <button
        onClick={openModal}
        style={{
          borderRadius: "8px",
          backgroundColor: "#07A698",
          padding: "8px 16px",
          color: "white",
          boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
          border: "none",
          cursor: "pointer"
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#059a8c")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#07A698")}
      >
        + Add New Member
      </button>
    </div>
  </div>

  {/* Table */}
  <div style={{ overflow: "hidden", borderRadius: "12px", border: "1px solid #e5e7eb", backgroundColor: "white", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
    {serverError && (
      <div style={{ borderBottom: "1px solid #fecaca", backgroundColor: "#fef2f2", padding: "8px 16px", fontSize: "14px", color: "#b91c1c" }}>
        {serverError}
      </div>
    )}
    <div style={{ overflowX: "auto" }}>
      <table style={{ minWidth: "100%", borderCollapse: "collapse" }}>
        <thead style={{ backgroundColor: "#f9fafb" }}>
          <tr>
            {["#", "Member Name", "Designation", "Department", "Actions"].map((header) => (
              <th
                key={header}
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontSize: "12px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "#4b5563",
                  borderBottom: "1px solid #e5e7eb"
                }}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} style={{ padding: "16px", textAlign: "center", fontSize: "14px", color: "#6b7280" }}>
                Loading...
              </td>
            </tr>
          ) : members.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: "16px", textAlign: "center", fontSize: "14px", color: "#6b7280" }}>
                No RAC members added yet.
              </td>
            </tr>
          ) : (
            members.map((m, idx) => (
              <tr
                key={m._id || m.id}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "white")}
              >
                <td style={{ padding: "12px 16px", fontSize: "14px", color: "#374151" }}>{idx + 1}</td>
                <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: 500, color: "#111827" }}>{m.name}</td>
                <td style={{ padding: "12px 16px", fontSize: "14px", color: "#374151" }}>{m.designation}</td>
                <td style={{ padding: "12px 16px", fontSize: "14px", color: "#374151" }}>{m.department}</td>
                <td style={{ padding: "12px 16px", fontSize: "14px", color: "#374151" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => onEdit(m)}
                      style={{ borderRadius: "6px", border: "1px solid #e5e7eb", padding: "6px 10px", background: "white", cursor: "pointer" }}
                      onMouseOver={(e) => (e.target.style.backgroundColor = "#f3f4f6")}
                      onMouseOut={(e) => (e.target.style.backgroundColor = "white")}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(m._id || m.id)}
                      style={{ borderRadius: "6px", background: "#dc2626", color: "white", padding: "6px 10px", border: "none", cursor: "pointer" }}
                      onMouseOver={(e) => (e.target.style.backgroundColor = "#b91c1c")}
                      onMouseOut={(e) => (e.target.style.backgroundColor = "#dc2626")}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>

  {/* Modal */}
  {isOpen && (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 30000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.4)",
        padding: "16px"
      }}
    >
      <div style={{ width: "100%", maxWidth: "600px", borderRadius: "16px", backgroundColor: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e5e7eb", padding: "16px 24px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "#1f2937" }}>{editingId ? "Edit RAC Member" : "Add New RAC Member"}</h2>
          <button
            onClick={closeModal}
            style={{ borderRadius: "50%", padding: "8px", color: "#6b7280", border: "none", background: "transparent", cursor: "pointer" }}
            onMouseOver={(e) => (e.target.style.backgroundColor = "#f3f4f6")}
            onMouseOut={(e) => (e.target.style.backgroundColor = "transparent")}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <form onSubmit={onSubmit} style={{ padding: "20px 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Member Name */}
            <div>
              <label style={{ marginBottom: "4px", display: "block", fontSize: "14px", fontWeight: 500, color: "#374151" }}>Member Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Enter member name"
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  border: errors.name ? "1px solid #f87171" : "1px solid #d1d5db",
                  padding: "8px 12px",
                  fontSize: "14px",
                  outline: "none"
                }}
              />
              {errors.name && <p style={{ marginTop: "4px", fontSize: "12px", color: "#dc2626" }}>{errors.name}</p>}
            </div>

            {/* Designation */}
            <div>
              <label style={{ marginBottom: "4px", display: "block", fontSize: "14px", fontWeight: 500, color: "#374151" }}>Designation</label>
              <input
                type="text"
                name="designation"
                value={form.designation}
                onChange={onChange}
                placeholder="e.g., Professor, Associate Professor, etc."
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  border: errors.designation ? "1px solid #f87171" : "1px solid #d1d5db",
                  padding: "8px 12px",
                  fontSize: "14px",
                  outline: "none"
                }}
              />
              {errors.designation && <p style={{ marginTop: "4px", fontSize: "12px", color: "#dc2626" }}>{errors.designation}</p>}
            </div>

            {/* Department */}
            <div>
              <label style={{ marginBottom: "4px", display: "block", fontSize: "14px", fontWeight: 500, color: "#374151" }}>Department</label>
              <input
                type="text"
                name="department"
                value={form.department}
                onChange={onChange}
                placeholder="e.g., CSE, ECE, ME, etc."
                style={{
                  width: "100%",
                  borderRadius: "8px",
                  border: errors.department ? "1px solid #f87171" : "1px solid #d1d5db",
                  padding: "8px 12px",
                  fontSize: "14px",
                  outline: "none"
                }}
              />
              {errors.department && <p style={{ marginTop: "4px", fontSize: "12px", color: "#dc2626" }}>{errors.department}</p>}
            </div>
          </div>

          {/* Footer */}
          <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #e5e7eb", paddingTop: "16px" }}>
            <button
              type="button"
              onClick={closeModal}
              style={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: 500,
                color: "#374151",
                backgroundColor: "white",
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                borderRadius: "8px",
                backgroundColor: "#07A698",
                padding: "8px 16px",
                fontSize: "14px",
                fontWeight: 600,
                color: "white",
                border: "none",
                cursor: "pointer"
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#059a8c")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#07A698")}
            >
              {editingId ? "Update Member" : "Save Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )}
</div>

  );
}
