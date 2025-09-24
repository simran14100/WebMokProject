import React, { useEffect, useState, useCallback } from "react";
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const API_URL = "http://localhost:4000/api/v1/visit-departments";

export default function VisitDepartments() {
  const ED_TEAL = "#14b8a6";
  const BORDER = "#e5e7eb";
  const TEXT = "#334155";
  const { token } = useSelector((state) => state.auth);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", description: "", status: "Active" });

  const fetchDepartments = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const data = await res.json().catch(() => ([]));
      if (!res.ok) throw new Error(data?.message || 'Failed to load visit departments');
      const list = Array.isArray(data) ? data : (data.data || []);
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      toast.error(e.message || 'Failed to load visit departments');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  const filtered = items.filter(d => (
    (d.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.description || '').toLowerCase().includes(search.toLowerCase())
  ));

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: "", description: "", status: "Active" });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row._id);
    setForm({ name: row.name || "", description: row.description || "", status: row.status || "Active" });
    setModalOpen(true);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error('Department name is required');
      return;
    }
    setIsSubmitting(true);
    try {
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      const method = editingId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim(),
          status: form.status,
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || data?.message || 'Failed to save department');
      }
      toast.success(editingId ? 'Department updated' : 'Department created');
      setModalOpen(false);
      setEditingId(null);
      setForm({ name: "", description: "", status: "Active" });
      await fetchDepartments();
    } catch (e) {
      toast.error(e.message || 'Failed to save department');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDelete = async (row) => {
    if (!window.confirm('Delete this department?')) return;
    try {
      const res = await fetch(`${API_URL}/${row._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || 'Failed to delete department');
      toast.success('Department deleted');
      await fetchDepartments();
    } catch (e) {
      toast.error(e.message || 'Failed to delete department');
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif', marginTop: '11rem' }}>
      <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: TEXT, marginLeft: '120px' }}>Manage Visit Departments</h3>
          <button onClick={openAdd} style={{ background: ED_TEAL, color: '#fff', border: `1px solid ${ED_TEAL}`, padding: '8px 16px', borderRadius: 8, marginRight: '120px' }}>+ Add New Department</button>
        </div>

        <div style={{ margin: '20px 120px', maxWidth: 420 }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search departments..." style={{ width: '100%', padding: '10px 12px', border: `1px solid ${BORDER}`, borderRadius: 8 }} />
        </div>

        <div style={{ margin: '0 120px' }}>
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: ED_TEAL, color: '#fff', textAlign: 'left' }}>
                  <th style={{ padding: '12px 16px' }}>Name</th>
                  <th style={{ padding: '12px 16px' }}>Description</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ padding: 16 }}>Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: 16, textAlign: 'center', color: TEXT }}>No departments found</td></tr>
                ) : filtered.map((row) => (
                  <tr key={row._id}>
                    <td style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}` }}>{row.name}</td>
                    <td style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}` }}>{row.description || '-'}</td>
                    <td style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}`, color: row.status === 'Active' ? '#16a34a' : '#ef4444', fontWeight: 600 }}>{row.status}</td>
                    <td style={{ padding: '12px 16px', borderBottom: `1px solid ${BORDER}`, textAlign: 'center' }}>
                      <button onClick={() => openEdit(row)} style={{ background: 'transparent', border: `1px solid ${ED_TEAL}`, color: ED_TEAL, padding: '4px 12px', borderRadius: 4, marginRight: 8, cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => onDelete(row)} style={{ background: '#f44336', border: '1px solid #f44336', color: '#fff', padding: '4px 12px', borderRadius: 4, cursor: 'pointer' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 24, width: '100%', maxWidth: 520, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
            <h3 style={{ marginTop: 0, color: TEXT }}>{editingId ? 'Edit Visit Department' : 'Add New Visit Department'}</h3>
            <form onSubmit={onSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 6, color: TEXT, fontWeight: 600 }}>Department Name *</label>
                <input name="name" value={form.name} onChange={onChange} placeholder="Enter department name" style={{ width: '100%', padding: '10px 12px', border: `1px solid ${BORDER}`, borderRadius: 8 }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 6, color: TEXT, fontWeight: 600 }}>Description</label>
                <textarea name="description" value={form.description} onChange={onChange} rows={3} placeholder="Enter description (optional)" style={{ width: '100%', padding: '10px 12px', border: `1px solid ${BORDER}`, borderRadius: 8 }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', marginBottom: 6, color: TEXT, fontWeight: 600 }}>Status</label>
                <select name="status" value={form.status} onChange={onChange} style={{ width: '100%', padding: '10px 12px', border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 16 }}>
                <button type="button" onClick={() => { setModalOpen(false); setEditingId(null); setForm({ name: '', description: '', status: 'Active' }); }} style={{ background: '#fff', border: `1px solid ${BORDER}`, color: TEXT, padding: '8px 16px', borderRadius: 8 }}>Cancel</button>
                <button type="submit" disabled={isSubmitting} style={{ background: ED_TEAL, border: `1px solid ${ED_TEAL}`, color: '#fff', padding: '8px 16px', borderRadius: 8 }}>{isSubmitting ? 'Saving...' : (editingId ? 'Update' : 'Add')} Department</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
