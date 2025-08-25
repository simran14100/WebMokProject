import React, { useEffect, useMemo, useState } from 'react';
import { FiEdit2, FiTrash2, FiPlus, FiX } from 'react-icons/fi';
import { ED_TEAL, ED_TEAL_DARK } from '../../../utils/theme';
import { listSubjects, createSubject as apiCreateSubject, updateSubject as apiUpdateSubject, deleteSubject as apiDeleteSubject } from '../../../services/subjectApi';
import { listDepartments } from '../../../services/departmentApi';
import { showSuccess, showError, showLoading, dismissToast } from '../../../utils/toast';

const PAGE_SIZE = 10;

export default function SubjectManagement() {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const editingItem = useMemo(() => subjects.find(s => s.id === editingId) || null, [subjects, editingId]);

  const [form, setForm] = useState({ name: '', department: '', status: 'Active' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Table controls
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);

  // Load departments and data
  useEffect(() => {
    const init = async () => {
      let tId;
      try {
        tId = showLoading('Loading...');
        const [deptRes, subjRes] = await Promise.all([
          listDepartments(),
          listSubjects({ q: query, page, limit: PAGE_SIZE }),
        ]);
        const deptItems = (deptRes?.data?.data || []).map((d) => ({ id: d._id, name: d.name }));
        setDepartments(deptItems);
        const subjItems = (subjRes?.data?.data || []).map((s) => ({
          id: s._id,
          name: s.name,
          departmentId: s.department?._id || '',
          departmentName: s.department?.name || '',
          status: s.status || 'Active',
        }));
        setSubjects(subjItems);
      } catch (e) {
        showError(e?.response?.data?.message || 'Failed to load data');
      } finally {
        if (tId) dismissToast(tId);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Search or page change
  useEffect(() => {
    const load = async () => {
      let tId;
      try {
        tId = showLoading('Loading subjects...');
        const res = await listSubjects({ q: query, page, limit: PAGE_SIZE });
        const items = (res?.data?.data || []).map((s) => ({
          id: s._id,
          name: s.name,
          departmentId: s.department?._id || '',
          departmentName: s.department?.name || '',
          status: s.status || 'Active',
        }));
        setSubjects(items);
      } catch (e) {
        showError(e?.response?.data?.message || 'Failed to load subjects');
      } finally {
        if (tId) dismissToast(tId);
      }
    };
    load();
  }, [query, page]);

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: '', department: departments[0]?.id || '', status: 'Active' });
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditingId(row.id);
    setForm({ name: row.name, department: row.departmentId, status: row.status });
    setErrors({});
    setModalOpen(true);
  };

  const validate = () => {
    const e = {};
    if (!form.department) e.department = 'School is required';
    if (!form.name?.trim()) e.name = 'Subject name is required';
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
      tId = showLoading(editingId ? 'Saving changes...' : 'Creating subject...');
      if (editingId) {
        await apiUpdateSubject(editingId, { name: form.name, department: form.department, status: form.status });
        showSuccess('Subject updated');
      } else {
        await apiCreateSubject({ name: form.name, department: form.department, status: form.status });
        showSuccess('Subject created');
      }
      // Refresh
      const res = await listSubjects({ q: query, page, limit: PAGE_SIZE });
      const items = (res?.data?.data || []).map((s) => ({ id: s._id, name: s.name, departmentId: s.department?._id || '', departmentName: s.department?.name || '', status: s.status || 'Active' }));
      setSubjects(items);
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
    const confirm = window.confirm('Delete this subject?');
    if (!confirm) return;
    let tId;
    try {
      tId = showLoading('Deleting...');
      await apiDeleteSubject(id);
      showSuccess('Subject deleted');
      setSubjects(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      showError(err?.response?.data?.message || 'Failed to delete');
    } finally {
      if (tId) dismissToast(tId);
    }
  };

  // Export helpers
  const copyTable = async () => {
    const header = 'School\tSubject\tStatus';
    const rows = subjects.map(s => `${s.departmentName}\t${s.name}\t${s.status}`).join('\n');
    const text = `${header}\n${rows}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for insecure contexts
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      showSuccess('Copied to clipboard');
    } catch (e) {
      showError('Copy failed');
    }
  };

  const exportCSV = () => {
    const header = 'School,Subject,Status\n';
    const rows = subjects.map(s => `${escapeCsv(s.departmentName)},${escapeCsv(s.name)},${escapeCsv(s.status)}`).join('\n');
    // Add BOM for Excel compatibility
    const bom = '\uFEFF';
    const blob = new Blob([bom + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'subjects.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const printTable = () => {
    const win = window.open('', 'PRINT', 'height=600,width=800');
    if (!win) return;
    const tableRows = subjects.map(s => `<tr><td>${escapeHtml(s.departmentName)}</td><td>${escapeHtml(s.name)}</td><td>${escapeHtml(s.status)}</td></tr>`).join('');
    const html = `<!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Subjects</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 16px; }
          h3 { margin-bottom: 12px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
          thead { background: #f1f5f9; }
        </style>
      </head>
      <body>
        <h3>Subject Management</h3>
        <table>
          <thead><tr><th>School</th><th>Subject</th><th>Status</th></tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
    </html>`;
    win.document.open();
    win.document.write(html);
    win.document.close();
    // Wait for content to render before printing
    win.onload = () => {
      win.focus();
      win.print();
      win.close();
    };
  };

  return (
    <div style={{ paddingLeft: '8px', paddingRight: '8px', marginTop: '14rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#191A1F' , marginLeft:"130px"}}>Subject Management</h1>
        <button
          onClick={openAdd}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '14px', fontWeight: 500, padding: '8px 12px', borderRadius: '6px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', backgroundColor: ED_TEAL , marginRight:"120px"}}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = ED_TEAL_DARK)}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = ED_TEAL)}
        >
          <FiPlus /> Add New Subject
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 12 , marginLeft:"130px" }}>
        <button onClick={copyTable} style={{ padding: '6px 10px', borderRadius: 6, background: '#07A698', color: 'white' }}>Copy</button>
        <button onClick={exportCSV} style={{ padding: '6px 10px', borderRadius: 6, background: '#07A698', color: 'white' }}>CSV</button>
        <button onClick={printTable} style={{ padding: '6px 10px', borderRadius: 6, background: '#07A698', color: 'white' }}>Print</button>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 , marginRight:"120px" }}>
          <label style={{ color: '#334155', fontSize: 14 }}>Search:</label>
          <input value={query} onChange={(e) => { setPage(1); setQuery(e.target.value); }} placeholder="Search subject..." style={{ border: '1px solid #cbd5e1', borderRadius: 6, padding: '8px 10px' }} />
        </div>
      </div>

      {/* Table Card */}
      <div style={{ backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden', width:"80%", marginLeft:"130px" }}>
        {/* Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 4fr 4fr 2fr', backgroundColor:'#07A698', color: 'white', fontSize: '14px', fontWeight: 500, padding: '12px 16px' }}>
          <div>Action</div>
          <div>School</div>
          <div>Subject</div>
          <div>Status</div>
        </div>
        {/* Rows */}
        <div>
          {subjects.map((s) => (
            <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '2fr 4fr 4fr 2fr', alignItems: 'center', padding: '12px 16px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>
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
              <div style={{ color: '#334155' }}>{s.departmentName}</div>
              <div style={{ color: '#334155' }}>{s.name}</div>
              <div style={{ color: '#334155' }}>{s.status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 12 , marginRight:"120px"}}>
        <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} style={{ padding: '6px 10px', borderRadius: 6, background: page <= 1 ? '#07A698' : '#07A698', color: 'white' }}>Previous</button>
        <span style={{ padding: '6px 10px', borderRadius: 6, background: '#07A698', color: 'white' }}>{page}</span>
        <button onClick={() => setPage(p => p + 1)} style={{ padding: '6px 10px', borderRadius: 6, background: '#07A698', color: 'white' }}>Next</button>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)' }} onClick={() => setModalOpen(false)} />
          <div style={{ position: 'relative', backgroundColor: 'white', width: '95%', maxWidth: '720px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{editingId ? 'Edit Subject' : 'Add New Subject'}</h3>
              <button aria-label="Close" style={{ padding: '8px', borderRadius: '6px' }} onClick={() => setModalOpen(false)}>
                <FiX />
              </button>
            </div>
            <div style={{ padding: '20px' }}>
              <form onSubmit={onSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#334155' }}>School</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    style={{ marginTop: '8px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 12px', outline: 'none', backgroundColor: 'white' }}
                  >
                    <option value="">Select School</option>
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  {errors.department && <p style={{ fontSize: '12px', color: 'red', marginTop: '4px' }}>{errors.department}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#334155' }}>Subject</label>
                  <input
                    type="text"
                    style={{ marginTop: '8px', width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 12px', outline: 'none' }}
                    placeholder="Digital Marketing"
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

                <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
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

function escapeCsv(str) {
  if (str == null) return '';
  const s = String(str);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
