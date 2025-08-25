
import React, { useEffect, useMemo, useState } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi';
import { ED_TEAL, ED_TEAL_DARK } from '../../../utils/theme';
import { listSessions, createSession as apiCreateSession, updateSession as apiUpdateSession, deleteSession as apiDeleteSession } from '../../../services/sessionApi';
import { showSuccess, showError, showLoading, dismissToast } from '../../../utils/toast';



const BORDER = '#e0e0e0';
const TEXT_DARK = '#191A1F';


export default function PhDSessionManagement() {
  const [sessions, setSessions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const editingItem = useMemo(() => sessions.find(s => s.id === editingId) || null, [sessions, editingId]);

  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', series: '', status: 'Active' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch sessions from backend
  useEffect(() => {
    const load = async () => {
      try {
        const tId = showLoading('Loading sessions...');
        const res = await listSessions();
        const items = (res?.data?.data || []).map((s) => ({
          id: s._id,
          name: s.name,
          startDate: s.startDate ? String(s.startDate).slice(0, 10) : '',
          endDate: s.endDate ? String(s.endDate).slice(0, 10) : '',
          series: s.series || '',
          status: s.status || 'Active',
        }));
        setSessions(items);
        dismissToast(tId);
      } catch (e) {
        showError(e?.response?.data?.message || 'Failed to load sessions');
      }
    };
    load();
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: '', startDate: '', endDate: '', series: '', status: 'Active' });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({ name: row.name, startDate: row.startDate, endDate: row.endDate, series: row.series, status: row.status });
    setErrors({});
    setModalOpen(true);
  };

  const validateForm = () => {
    const e = {};
    if (!form.name?.trim()) e.name = 'Session name is required';
    if (!form.startDate) e.startDate = 'Start date is required';
    if (!form.endDate) e.endDate = 'End date is required';
    if (form.startDate && form.endDate && new Date(form.startDate) > new Date(form.endDate)) {
      e.endDate = 'End date must be after start date';
    }
    if (!/^\d{8}$/.test(String(form.series || ''))) e.series = 'Series must be 8 digits, e.g., 20250801';
    if (!['Active', 'Inactive'].includes(form.status)) e.status = 'Invalid status';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (!validateForm()) return;
    setLoading(true);
    const payload = {
      name: form.name.trim(),
      startDate: form.startDate,
      endDate: form.endDate,
      series: form.series,
      status: form.status,
    };
    let tId;
    try {
      tId = showLoading(editingId ? 'Saving changes...' : 'Creating session...');
      if (editingId) {
        await apiUpdateSession(editingId, payload);
        showSuccess('Session updated');
      } else {
        await apiCreateSession(payload);
        showSuccess('Session created');
      }
      // Refresh list
      const res = await listSessions();
      const items = (res?.data?.data || []).map((s) => ({
        id: s._id,
        name: s.name,
        startDate: s.startDate ? String(s.startDate).slice(0, 10) : '',
        endDate: s.endDate ? String(s.endDate).slice(0, 10) : '',
        series: s.series || '',
        status: s.status || 'Active',
      }));
      setSessions(items);
      setModalOpen(false);
    } catch (err) {
      showError(err?.response?.data?.message || 'Operation failed');
    } finally {
      if (tId) dismissToast(tId);
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    if (!id) return;
    const confirm = window.confirm('Delete this session?');
    if (!confirm) return;
    let tId;
    try {
      tId = showLoading('Deleting...');
      await apiDeleteSession(id);
      showSuccess('Session deleted');
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      showError(err?.response?.data?.message || 'Failed to delete');
    } finally {
      if (tId) dismissToast(tId);
    }
  };

  return (
    <div style={{ paddingLeft: '8px', paddingRight: '8px' , marginTop:"14rem"}}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#191A1F' , marginLeft:"130px" }}>Session Management</h1>
        <button
          onClick={openAdd}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '14px', fontWeight: 500, padding: '8px 12px', borderRadius: '6px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', backgroundColor: ED_TEAL , marginRight:"120px"}}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ED_TEAL_DARK)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ED_TEAL)}
        >
          <FiPlus /> Add New Session
        </button>
      </div>

      {/* Table Card */}
      <div style={{ backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' , width:"80%" , marginLeft:"130px"   }}>
        {/* Table Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', backgroundColor: '#07A698', color: 'white', fontSize: '14px', fontWeight: 500, padding: '12px 16px' }}>
          <div>Action</div>
          <div>Session</div>
          <div>Start Date</div>
          <div>End Date</div>
          <div>Series</div>
          <div>Status</div>
        </div>

        {/* Rows */}
        <div>
          {sessions.length === 0 && (
            <div style={{ padding: '24px 16px', fontSize: '14px', color: '#64748b' }}>No sessions yet. Click "Add New Session" to create one.</div>
          )}
          {sessions.map((s) => (
            <div key={s.id} style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', alignItems: 'center', padding: '12px 16px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${ED_TEAL}`, fontSize: '13px', color: ED_TEAL, backgroundColor: 'white', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ED_TEAL; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = ED_TEAL; }}
                  onClick={() => openEdit(s)}
                  title="Edit"
                >
                  <FiEdit2 />
                </button>
                <button
                  style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${ED_TEAL}`, fontSize: '13px', color: ED_TEAL, backgroundColor: 'white', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ED_TEAL; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = ED_TEAL; }}
                  onClick={() => onDelete(s.id)}
                  title="Delete"
                >
                  <FiTrash2 />
                </button>
              </div>
              <div style={{ color: '#334155' }}>{s.name}</div>
              <div style={{ color: '#334155' }}>{s.startDate}</div>
              <div style={{ color: '#334155' }}>{s.endDate}</div>
              <div style={{ color: '#334155' }}>{s.series}</div>
              <div style={{ color: '#334155' }}>{s.status}</div>
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
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{editingId ? 'Edit Session' : 'Add New Session'}</h3>
              <button aria-label="Close" style={{ padding: '8px', borderRadius: '6px' }} onClick={() => setModalOpen(false)}>
                <FiX />
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Session</label>
                  <input
                    type="text"
                    style={{ marginTop: '4px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', outline: 'none' }}
                    placeholder="2025–2026"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  {errors.name && <p style={{ fontSize: '12px', color: 'red', marginTop: '4px' }}>{errors.name}</p>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Start Date</label>
                    <input
                      type={form.startDate ? 'date' : 'text'}
                      placeholder="dd/mm/yyyy"
                      onFocus={(e) => (e.currentTarget.type = 'date')}
                      onBlur={(e) => { if (!e.currentTarget.value) e.currentTarget.type = 'text'; }}
                      style={{ marginTop: '4px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', outline: 'none' }}
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    />
                    {errors.startDate && <p style={{ fontSize: '12px', color: 'red', marginTop: '4px' }}>{errors.startDate}</p>}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#334155' }}>End Date</label>
                    <input
                      type={form.endDate ? 'date' : 'text'}
                      placeholder="dd/mm/yyyy"
                      onFocus={(e) => (e.currentTarget.type = 'date')}
                      onBlur={(e) => { if (!e.currentTarget.value) e.currentTarget.type = 'text'; }}
                      style={{ marginTop: '4px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', outline: 'none' }}
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    />
                    {errors.endDate && <p style={{ fontSize: '12px', color: 'red', marginTop: '4px' }}>{errors.endDate}</p>}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Registration Series Start</label>
                    <input
                      type="text"
                      style={{ marginTop: '4px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', outline: 'none' }}
                      placeholder="YYYYMMDD e.g., 20250801"
                      value={form.series}
                      onChange={(e) => setForm({ ...form, series: e.target.value })}
                    />
                    {errors.series && <p style={{ fontSize: '12px', color: 'red', marginTop: '4px' }}>{errors.series}</p>}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Status</label>
                    <select
                      style={{ marginTop: '4px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', outline: 'none', backgroundColor: 'white' }}
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                    {errors.status && <p style={{ fontSize: '12px', color: 'red', marginTop: '4px' }}>{errors.status}</p>}
                  </div>
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
