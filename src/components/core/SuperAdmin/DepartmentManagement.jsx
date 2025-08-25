import React, { useEffect, useMemo, useState } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi';
import { ED_TEAL, ED_TEAL_DARK } from '../../../utils/theme';
import { listDepartments, createDepartment as apiCreateDepartment, updateDepartment as apiUpdateDepartment, deleteDepartment as apiDeleteDepartment } from '../../../services/departmentApi';
import { showSuccess, showError, showLoading, dismissToast } from '../../../utils/toast';

export default function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const editingItem = useMemo(() => departments.find(d => d.id === editingId) || null, [departments, editingId]);

  const [form, setForm] = useState({ name: '', status: 'Active' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Load departments on mount
  useEffect(() => {
    const load = async () => {
      let tId;
      try {
        tId = showLoading('Loading departments...');
        const res = await listDepartments();
        const items = (res?.data?.data || []).map((d) => ({
          id: d._id,
          name: d.name,
          status: d.status || 'Active',
        }));
        setDepartments(items);
      } catch (e) {
        showError(e?.response?.data?.message || 'Failed to load departments');
      } finally {
        if (tId) dismissToast(tId);
      }
    };
    load();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: '', status: 'Active' });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({ name: row.name, status: row.status });
    setErrors({});
    setModalOpen(true);
  };

  const onDelete = async (id) => {
    if (!id) return;
    const confirm = window.confirm('Delete this department?');
    if (!confirm) return;
    let tId;
    try {
      tId = showLoading('Deleting...');
      await apiDeleteDepartment(id);
      showSuccess('Department deleted');
      setDepartments(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      showError(err?.response?.data?.message || 'Failed to delete');
    } finally {
      if (tId) dismissToast(tId);
    }
  };

  const validate = () => {
    const e = {};
    if (!form.name?.trim()) e.name = 'Department name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validate()) return;
    setLoading(true);
    let tId;
    try {
      tId = showLoading(editingId ? 'Saving changes...' : 'Creating department...');
      if (editingId) {
        await apiUpdateDepartment(editingId, { name: form.name, status: form.status });
        showSuccess('Department updated');
      } else {
        await apiCreateDepartment({ name: form.name, status: form.status });
        showSuccess('Department created');
      }
      // Refresh list
      const res = await listDepartments();
      const items = (res?.data?.data || []).map((d) => ({ id: d._id, name: d.name, status: d.status || 'Active' }));
      setDepartments(items);
      setModalOpen(false);
    } catch (err) {
      showError(err?.response?.data?.message || 'Operation failed');
    } finally {
      if (tId) dismissToast(tId);
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingLeft: '8px', paddingRight: '8px', marginTop: '14rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#191A1F' , marginLeft:"130px" }}>Department Management</h1>
        <button
          onClick={openAdd}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '14px', fontWeight: 500, padding: '8px 12px', borderRadius: '6px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', backgroundColor: ED_TEAL , marginRight:"120px" }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ED_TEAL_DARK)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ED_TEAL)}
        >
          <FiPlus /> Add Department
        </button>
      </div>

      {/* Table Card */}
      <div style={{ backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' , width:"80%" , marginLeft:"130px"   }}>
        {/* Table Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 6fr 2fr', backgroundColor: '#07A698', color: 'white', fontSize: '14px', fontWeight: 500, padding: '12px 16px' }}>
          <div>Action</div>
          <div>Department</div>
          <div>Status</div>
        </div>

        {/* Rows */}
        <div>
          {departments.map((d) => (
            <div key={d.id} style={{ display: 'grid', gridTemplateColumns: '2fr 6fr 2fr', alignItems: 'center', padding: '12px 16px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${ED_TEAL}`, fontSize: '13px', color: ED_TEAL, backgroundColor: 'white', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ED_TEAL; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = ED_TEAL; }}
                  onClick={() => openEdit(d)}
                  title="Edit"
                >
                  <FiEdit2 />
                </button>
                <button
                  style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${ED_TEAL}`, fontSize: '13px', color: ED_TEAL, backgroundColor: 'white', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ED_TEAL; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = ED_TEAL; }}
                  onClick={() => onDelete(d.id)}
                  title="Delete"
                >
                  <FiTrash2 />
                </button>
              </div>
              <div style={{ color: '#334155' }}>{d.name}</div>
              <div style={{ color: '#334155' }}>{d.status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)' }} onClick={() => setModalOpen(false)} />
          <div style={{ position: 'relative', backgroundColor: 'white', width: '95%', maxWidth: '640px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{editingId ? 'Edit Department' : 'Add Department'}</h3>
              <button aria-label="Close" style={{ padding: '8px', borderRadius: '6px' }} onClick={() => setModalOpen(false)}>
                <FiX />
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Department Name</label>
                  <input
                    type="text"
                    style={{ marginTop: '8px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 12px', outline: 'none' }}
                    placeholder="Digital Business"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  {errors.name && <p style={{ fontSize: '12px', color: 'red', marginTop: '4px' }}>{errors.name}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Status</label>
                  <select
                    style={{ marginTop: '8px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 12px', outline: 'none', backgroundColor: 'white' }}
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
                  <button
                    type="button"
                    style={{ padding: '8px 16px', borderRadius: '6px', border: `1px solid ${ED_TEAL}`, color: ED_TEAL, backgroundColor: 'white' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ED_TEAL; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = ED_TEAL; }}
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{ padding: '8px 16px', borderRadius: '6px', color: 'white', fontWeight: 500, backgroundColor: loading ? '#93c5fd' : ED_TEAL, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.9 : 1 }}
                    onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = ED_TEAL_DARK; }}
                    onMouseLeave={(e) => { if (!loading) e.currentTarget.style.backgroundColor = ED_TEAL; }}
                  >
                    {loading ? (editingId ? 'Saving...' : 'Submitting...') : (editingId ? 'Save Changes' : 'Submit')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
