import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { listGuides, createGuide, updateGuide, deleteGuide } from '../../../services/guideApi';
import { listSubjects } from '../../../services/subjectApi';

const BG = '#f3f4f6';
const CARD = '#ffffff';
const BORDER = '#e5e7eb';
const TEXT = '#111827';
const MUTED = '#6b7280';

export default function GuideManagement() {
  const token = useSelector((s) => s.auth?.token);
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10 });
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const editingItem = useMemo(() => items.find(i => i._id === editingId) || null, [items, editingId]);
  const [form, setForm] = useState({
    name: '',
    subject: '',
    contactNumber: '',
    email: '',
    designation: '',
    institute: '',
    address: '',
    status: 'Active',
  });
  const [subjects, setSubjects] = useState([]);
  const loadSubjects = async () => {
    try {
      const res = await listSubjects({ limit: 1000 });
      // axios response shape => res.data = { success, data: [...], meta }
      const arr = res?.data?.data || res?.data || res || [];
      const onlyActive = Array.isArray(arr) ? arr.filter((s)=> (s?.status || 'Active') === 'Active') : [];
      setSubjects(onlyActive);
    } catch (_) {
      setSubjects([]);
    }
  };

  const fetchData = async (page = 1, limit = meta.limit) => {
    setLoading(true);
    try {
      const data = await listGuides({ page, limit, search: query.trim() }, token);
      setItems(data.items || []);
      setMeta(data.meta || { total: 0, page, limit });
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(1); /* eslint-disable-next-line */ }, []);
  useEffect(() => {
    const id = setTimeout(() => { fetchData(1); }, 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line
  }, [query]);

  const openAdd = async () => {
    setEditingId(null);
    setForm({ name: '', subject: '', contactNumber: '', email: '', designation: '', institute: '', address: '', status: 'Active' });
    if (subjects.length === 0) await loadSubjects();
    setModalOpen(true);
  };
  const openEdit = async (id) => {
    setEditingId(id);
    const it = items.find(x => x._id === id) || {};
    setForm({
      name: it.name || '',
      subject: it.subject || '',
      contactNumber: it.contactNumber || '',
      email: it.email || '',
      designation: it.designation || '',
      institute: it.institute || '',
      address: it.address || '',
      status: it.status || 'Active',
    });
    if (subjects.length === 0) {
      try { const res = await listSubjects(); setSubjects(res?.data || res || []); } catch { /* ignore */ }
    }
    setModalOpen(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const body = { ...form };
    if (!body.subject || !body.name || !body.contactNumber || !body.email || !body.designation || !body.institute) {
      return alert('Subject, Guide Name, Contact Number, E-mail, Designation and Institute are required');
    }
    setLoading(true);
    try {
      if (editingId) await updateGuide(editingId, body, token);
      else await createGuide(body, token);
      setModalOpen(false);
      await fetchData(meta.page);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to save');
    } finally { setLoading(false); }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this guide?')) return;
    setLoading(true);
    try {
      await deleteGuide(id, token);
      await fetchData(meta.page);
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete');
    } finally { setLoading(false); }
  };

  // Export helpers
  const copyTable = async () => {
    const header = 'Name\tSubject\tDesignation\tEmail';
    const rows = items.map(s => `${s.name}\t${s.subject}\t${s.designation}\t${s.email}`).join('\n');
    const text = `${header}\n${rows}`;
    try { await navigator.clipboard.writeText(text); alert('Copied'); } catch { alert('Copy failed'); }
  };
  const downloadCSV = () => {
    const header = 'Name,Subject,Designation,Email';
    const rows = items.map(s => [s.name, s.subject, s.designation, s.email].map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const csv = `${header}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'guides.csv'; a.click(); URL.revokeObjectURL(url);
  };
  const printTable = () => {
    const html = `<!doctype html><html><head><title>Guides</title></head><body><h2>Guide Management</h2><table border="1" cellpadding="6" cellspacing="0"><thead><tr><th>Name</th><th>Subject</th><th>Designation</th><th>Email</th></tr></thead><tbody>${items.map(s=>`<tr><td>${s.name}</td><td>${s.subject}</td><td>${s.designation}</td><td>${s.email}</td></tr>`).join('')}</tbody></table></body></html>`;
    const w = window.open('', '_blank'); w.document.write(html); w.document.close(); w.focus(); w.print(); w.close();
  };

  const tableHeaderCell = { background: '#111827', color: '#fff', padding: '10px 12px', fontWeight: 600, borderRight: `1px solid ${BORDER}` };
  const tableCell = { padding: '10px 12px', borderRight: `1px solid ${BORDER}`, color: TEXT };
  const button = { padding: '6px 12px', borderRadius: 6, color: '#fff', fontWeight: 600, fontSize: 14 };
  const iconBtn = { width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, background: '#e5e7eb', color: '#374151' };

  // Print a single guide in the requested format
  const printGuide = (g) => {
    const safe = (v) => (v == null ? '' : String(v));
    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Guide Details</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; background: #f3f4f6; padding: 24px; }
    .toolbar { display:flex; justify-content:flex-end; margin-bottom:12px; }
    .btn { background:#2563eb; color:#fff; border:none; padding:8px 12px; border-radius:6px; font-weight:700; cursor:pointer; }
    .wrap { background:#fff; border:2px solid #111; padding:10px; }
    .title { font-weight:700; color:#4b5563; margin-bottom:10px; font-size:18px; }
    .row { display:grid; grid-template-columns: 180px 1fr; border:1px solid #111; border-bottom:0; }
    .row:last-of-type { border-bottom:1px solid #111; }
    .cell-label { padding:6px 8px; border-right:1px solid #111; background:#f3f4f6; }
    .cell-value { padding:6px 8px; font-weight:700; }
    .spacer { height:10px; }
    table.print { width:100%; border-collapse:collapse; border:1px solid #111; }
    table.print th, table.print td { border:1px solid #111; padding:6px 8px; font-size:14px; }
    @media print { .toolbar { display:none; } body { background:#fff; padding:0; } }
  </style>
  </head>
<body>
  <div class="toolbar"><button class="btn" onclick="window.print()">Print Details</button></div>
  <div class="title">Guide Information</div>
  <div class="wrap">
    <div class="row"><div class="cell-label">Name</div><div class="cell-value">${safe(g.name)}</div></div>
    <div class="row"><div class="cell-label">Subject</div><div class="cell-value">${safe(g.subject)}</div></div>
    <div class="row"><div class="cell-label">Designation</div><div class="cell-value">${safe(g.designation)}</div></div>
    <div class="row"><div class="cell-label">Address</div><div class="cell-value">${safe(g.address)}</div></div>
    <div class="row"><div class="cell-label">Email id</div><div class="cell-value">${safe(g.email)}</div></div>
    <div class="row"><div class="cell-label">Contact No</div><div class="cell-value">${safe(g.contactNumber)}</div></div>
    <div class="spacer"></div>
    <table class="print">
      <thead>
        <tr>
          <th>SR. No</th>
          <th>REGISTRATION NO</th>
          <th>DRC DATE</th>
          <th>STUDENT NAME</th>
          <th>SUBJECT</th>
          <th>PRE VIVA DATE</th>
          <th>AWARD DATE</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="height:28px"></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      </tbody>
    </table>
  </div>
  <script>window.focus && window.focus();</script>
  </body>
</html>`;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
  };

  return (
    <div style={{ padding: 24, background: BG, minHeight: '100vh', marginTop:"9rem" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>Guide Management</div>
        <button onClick={openAdd} style={{ ...button, background: '#2563eb' }}>Add New Guide</button>
      </div>

      <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={copyTable} style={{ ...button, background: '#6b7280' }}>Copy</button>
            <button onClick={downloadCSV} style={{ ...button, background: '#6b7280' }}>CSV</button>
            <button onClick={printTable} style={{ ...button, background: '#6b7280' }}>Print</button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: TEXT, fontWeight: 600 }}>Search:</span>
            <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="" style={{ border: `1px solid ${BORDER}`, borderRadius: 6, padding: '6px 10px', outline: 'none' }} />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr>
                <th style={{ ...tableHeaderCell, width: 60 }}>↑↓</th>
                <th style={{ ...tableHeaderCell, width: 120 }}>Action ↑↓</th>
                <th style={{ ...tableHeaderCell }}>Name ↑↓</th>
                <th style={{ ...tableHeaderCell }}>Subject ↑↓</th>
                <th style={{ ...tableHeaderCell }}>Designation ↑↓</th>
                <th style={{ ...tableHeaderCell }}>Email ↑↓</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} style={{ ...tableCell, textAlign: 'center', color: MUTED }}>Loading...</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={6} style={{ ...tableCell, textAlign: 'center', color: MUTED }}>No records</td></tr>
              )}
              {!loading && items.map((it) => (
                <tr key={it._id}>
                  <td style={tableCell}></td>
                  <td style={tableCell}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button title="Edit" onClick={() => openEdit(it._id)} style={iconBtn}>✏️</button>
                      <button title="Print" onClick={() => printGuide(it)} style={iconBtn}>🖨️</button>
                      <button title="Delete" onClick={() => onDelete(it._id)} style={iconBtn}>🗑️</button>
                    </div>
                  </td>
                  <td style={tableCell}>{it.name}</td>
                  <td style={tableCell}>{it.subject}</td>
                  <td style={tableCell}>{it.designation}</td>
                  <td style={tableCell}>{it.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10 }}>
          <div style={{ color: MUTED }}>Showing {(items.length > 0) ? ((meta.page - 1) * meta.limit + 1) : 0} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} entries</div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button disabled={meta.page <= 1} onClick={() => fetchData(meta.page - 1)} style={{ ...button, background: '#e5e7eb', color: '#111827' }}>Previous</button>
            <span style={{ background: '#2563eb', color: '#fff', padding: '6px 10px', borderRadius: 6 }}>{meta.page}</span>
            <button disabled={meta.page * meta.limit >= meta.total} onClick={() => fetchData(meta.page + 1)} style={{ ...button, background: '#e5e7eb', color: '#111827' }}>Next</button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: CARD, borderRadius: 10, border: `1px solid ${BORDER}`, width: '100%', maxWidth: 740, maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ padding: 16, borderBottom: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: TEXT }}>{editingId ? 'Edit Guide' : 'Add New Guide'}</div>
              <button onClick={()=>setModalOpen(false)} style={{ fontSize: 20 }}>✖</button>
            </div>
            <form onSubmit={onSubmit} style={{ padding: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 14, color: TEXT, fontWeight: 600, marginBottom: 6 }}>Subject</label>
                  <select value={form.subject} onChange={(e)=>setForm(f=>({...f, subject: e.target.value}))} style={{ width: '100%', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '8px 10px' }}>
                    <option value="">Select Subject</option>
                    {Array.isArray(subjects) && subjects.map((s) => (
                      <option key={s._id || s.name} value={s.name}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, color: TEXT, fontWeight: 600, marginBottom: 6 }}>Guide Name</label>
                  <input value={form.name} onChange={(e)=>setForm(f=>({...f, name: e.target.value}))} style={{ width: '100%', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '8px 10px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, color: TEXT, fontWeight: 600, marginBottom: 6 }}>Contact Number</label>
                  <input value={form.contactNumber} onChange={(e)=>setForm(f=>({...f, contactNumber: e.target.value}))} style={{ width: '100%', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '8px 10px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, color: TEXT, fontWeight: 600, marginBottom: 6 }}>E-mail</label>
                  <input type="email" value={form.email} onChange={(e)=>setForm(f=>({...f, email: e.target.value}))} style={{ width: '100%', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '8px 10px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, color: TEXT, fontWeight: 600, marginBottom: 6 }}>Designation</label>
                  <input value={form.designation} onChange={(e)=>setForm(f=>({...f, designation: e.target.value}))} style={{ width: '100%', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '8px 10px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, color: TEXT, fontWeight: 600, marginBottom: 6 }}>Institute/University</label>
                  <input value={form.institute} onChange={(e)=>setForm(f=>({...f, institute: e.target.value}))} style={{ width: '100%', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '8px 10px' }} />
                </div>
                <div style={{ gridColumn: '1 / span 2' }}>
                  <label style={{ display: 'block', fontSize: 14, color: TEXT, fontWeight: 600, marginBottom: 6 }}>Address</label>
                  <input value={form.address} onChange={(e)=>setForm(f=>({...f, address: e.target.value}))} style={{ width: '100%', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '8px 10px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                <button type="button" onClick={()=>setModalOpen(false)} style={{ ...button, background: '#9ca3af' }}>Cancel</button>
                <button type="submit" style={{ ...button, background: '#10b981' }}>{editingId ? 'Update' : 'Submit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
