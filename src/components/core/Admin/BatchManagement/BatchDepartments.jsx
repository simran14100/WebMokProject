import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import DashboardLayout from "../../../common/DashboardLayout";
import { listBatchDepartments, createBatchDepartment, updateBatchDepartment, deleteBatchDepartment } from "../../../../services/operations/adminApi";
import { showError, showSuccess } from "../../../../utils/toast";

export default function BatchDepartments() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [shortcode, setShortcode] = useState("");
  const [loading, setLoading] = useState(false);
  const token = useSelector((s) => s.auth.token);
  const user = useSelector((s) => s.profile.user);

  const isAdmin = user?.accountType === "Admin";

  const reload = () => {
    listBatchDepartments({ onlyActive: false })
      .then(setItems)
      .catch(() => {});
  };

  useEffect(() => {
    reload();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!name.trim()) {
      showError("Please enter department name");
      return;
    }
    setLoading(true);
    try {
      await createBatchDepartment({ name: name.trim(), shortcode: shortcode.trim() }, token);
      setName("");
      setShortcode("");
      reload();
    } catch (e) {
      // handled in service
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ width: '100%', minHeight: '100vh', background: '#f8fafc', padding: '2rem 1rem', maxWidth: 1280, marginLeft: "200px" }}>
        <div style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Batch Departments</h2>
        </div>
        {!isAdmin ? (
          <div>Unauthorized</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'start' }}>
            <form onSubmit={handleAdd} style={{ background: '#fff', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: 8 }}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 6 }}>Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Skilling" style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 6 }}>Shortcode (optional)</label>
                <input value={shortcode} onChange={(e) => setShortcode(e.target.value)} placeholder="e.g. SKL" style={{ width: '100%', padding: 8, border: '1px solid #e2e8f0', borderRadius: 6 }} />
              </div>
              <button type="submit" disabled={loading} style={{ padding: '8px 12px', background: '#07A698', color: '#fff', border: 0, borderRadius: 6, cursor: 'pointer' }}>
                {loading ? 'Saving...' : 'Add Department'}
              </button>
            </form>
            <div style={{ background: '#fff', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: 8 }}>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>All Departments</div>
              <div style={{ display: 'grid', gap: 6 }}>
                {items.length === 0 ? (
                  <div style={{ color: '#718096' }}>No departments found</div>
                ) : items.map((d) => (
                  <DeptRow key={d._id} d={d} token={token} onChanged={reload} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}


function DeptRow({ d, token, onChanged }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(d.name || "");
  const [shortcode, setShortcode] = useState(d.shortcode || "");
  const [status, setStatus] = useState(d.status || "Active");
  const [busy, setBusy] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      showError("Name is required");
      return;
    }
    setBusy(true);
    try {
      await updateBatchDepartment(d._id, { name: name.trim(), shortcode: shortcode.trim(), status }, token);
      setIsEditing(false);
      onChanged && onChanged();
    } catch (_) {
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this department?")) return;
    setBusy(true);
    try {
      await deleteBatchDepartment(d._id, token);
      onChanged && onChanged();
    } catch (_) {
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #edf2f7', padding: '8px 10px', borderRadius: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {isEditing ? (
          <>
            <input value={name} onChange={(e) => setName(e.target.value)} style={{ padding: 6, border: '1px solid #e2e8f0', borderRadius: 6 }} />
            <input value={shortcode} onChange={(e) => setShortcode(e.target.value)} placeholder="Shortcode" style={{ padding: 6, border: '1px solid #e2e8f0', borderRadius: 6, width: 100 }} />
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: 6, border: '1px solid #e2e8f0', borderRadius: 6 }}>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </>
        ) : (
          <div>
            <div style={{ fontWeight: 500 }}>{d.name}</div>
            <div style={{ fontSize: 12, color: '#718096' }}>{d.shortcode || '-'}</div>
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {!isEditing && (
          <span style={{ fontSize: 12, color: d.status === 'Active' ? '#047857' : '#b91c1c' }}>{d.status}</span>
        )}
        {isEditing ? (
          <>
            <button disabled={busy} onClick={handleSave} style={{ padding: '6px 10px', background: '#07A698', color: '#fff', border: 0, borderRadius: 6, cursor: 'pointer' }}>Save</button>
            <button disabled={busy} onClick={() => setIsEditing(false)} style={{ padding: '6px 10px', background: '#e5e7eb', color: '#111827', border: 0, borderRadius: 6, cursor: 'pointer' }}>Cancel</button>
          </>
        ) : (
          <>
            <button disabled={busy} onClick={() => setIsEditing(true)} style={{ padding: '6px 10px', background: '#eef2ff', color: '#1e40af', border: 0, borderRadius: 6, cursor: 'pointer' }}>Edit</button>
            <button disabled={busy} onClick={handleDelete} style={{ padding: '6px 10px', background: '#fee2e2', color: '#b91c1c', border: 0, borderRadius: 6, cursor: 'pointer' }}>Delete</button>
          </>
        )}
      </div>
    </div>
  );
}

