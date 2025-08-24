import React, { useEffect, useMemo, useState } from 'react';
import { FiEye } from 'react-icons/fi';
import { ED_TEAL, ED_TEAL_DARK } from '../../../utils/theme';
import { listEnquiries } from '../../../services/enquiryApi';
import { listDepartments } from '../../../services/departmentApi';
import { showSuccess, showError, showLoading, dismissToast } from '../../../utils/toast';

const PAGE_SIZE = 10;

export default function NewApplications() {
  const [items, setItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('New');
  const [department, setDepartment] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: PAGE_SIZE });

  const [viewId, setViewId] = useState(null);
  const viewItem = useMemo(() => items.find(i => i.id === viewId) || null, [items, viewId]);

  // initial load of departments and enquiries
  useEffect(() => {
    const init = async () => {
      let tId;
      try {
        tId = showLoading('Loading...');
        const [deptRes, listRes] = await Promise.all([
          listDepartments(),
          listEnquiries({ q: query, status, department, page, limit: PAGE_SIZE })
        ]);
        const deptItems = (deptRes?.data?.data || []).map((d) => ({ id: d._id, name: d.name }));
        setDepartments(deptItems);
        const resData = listRes?.data || {};
        const mapped = (resData.data || []).map((e) => ({
          id: e._id,
          name: e.name,
          email: e.email || '',
          phone: e.phone || '',
          departmentId: e.department?._id || '',
          departmentName: e.department?.name || '',
          status: e.status || 'New',
          createdAt: e.createdAt,
          message: e.message || '',
          source: e.source || '',
        }));
        setItems(mapped);
        setMeta(resData.meta || { total: mapped.length, page, limit: PAGE_SIZE });
      } catch (e) {
        showError(e?.response?.data?.message || 'Failed to load enquiries');
      } finally {
        if (tId) dismissToast(tId);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // load on filters/page/query
  useEffect(() => {
    const load = async () => {
      let tId;
      try {
        tId = showLoading('Loading enquiries...');
        const listRes = await listEnquiries({ q: query, status, department, page, limit: PAGE_SIZE });
        const resData = listRes?.data || {};
        const mapped = (resData.data || []).map((e) => ({
          id: e._id,
          name: e.name,
          email: e.email || '',
          phone: e.phone || '',
          departmentId: e.department?._id || '',
          departmentName: e.department?.name || '',
          status: e.status || 'New',
          createdAt: e.createdAt,
          message: e.message || '',
          source: e.source || '',
        }));
        setItems(mapped);
        setMeta(resData.meta || { total: mapped.length, page, limit: PAGE_SIZE });
      } catch (e) {
        showError(e?.response?.data?.message || 'Failed to load enquiries');
      } finally {
        if (tId) dismissToast(tId);
      }
    };
    load();
  }, [query, status, department, page]);

  // Read-only UI: no delete/convert actions

  // Export helpers (Copy/CSV/Print)
  const copyTable = async () => {
    const header = 'Date\tSchool\tName\tEmail\tPhone\tStatus';
    const rows = items.map(i => `${formatDate(i.createdAt)}\t${i.departmentName}\t${i.name}\t${i.email}\t${i.phone}\t${i.status}`).join('\n');
    const text = `${header}\n${rows}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.focus(); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
      }
      showSuccess('Copied to clipboard');
    } catch {
      showError('Copy failed');
    }
  };

  const exportCSV = () => {
    const header = 'Date,School,Name,Email,Phone,Status\n';
    const rows = items.map(i => [formatDate(i.createdAt), i.departmentName, i.name, i.email, i.phone, i.status].map(escapeCsv).join(',')).join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'new-applications.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const printTable = () => {
    const win = window.open('', 'PRINT', 'height=700,width=1000');
    if (!win) return;
    const tableRows = items.map(i => `<tr><td>${escapeHtml(formatDate(i.createdAt))}</td><td>${escapeHtml(i.departmentName)}</td><td>${escapeHtml(i.name)}</td><td>${escapeHtml(i.email)}</td><td>${escapeHtml(i.phone)}</td><td>${escapeHtml(i.status)}</td></tr>`).join('');
    const html = `<!doctype html>
<html><head><meta charset="utf-8" /><title>New Applications</title>
<style>body{font-family:Arial,sans-serif;padding:16px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left}thead{background:#f1f5f9}</style>
</head><body>
<h3>New Applications</h3>
<table><thead><tr><th>Date</th><th>School</th><th>Name</th><th>Email</th><th>Phone</th><th>Status</th></tr></thead><tbody>${tableRows}</tbody></table>
</body></html>`;
    win.document.open(); win.document.write(html); win.document.close();
    win.onload = () => { win.focus(); win.print(); win.close(); };
  };

  return (
    <div style={{ paddingLeft: '8px', paddingRight: '8px', marginTop: '14rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#334155' }}>New Applications</h1>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <button onClick={copyTable} style={{ padding: '6px 10px', borderRadius: 6, background: '#475569', color: 'white' }}>Copy</button>
        <button onClick={exportCSV} style={{ padding: '6px 10px', borderRadius: 6, background: '#475569', color: 'white' }}>CSV</button>
        <button onClick={printTable} style={{ padding: '6px 10px', borderRadius: 6, background: '#475569', color: 'white' }}>Print</button>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ color: '#334155', fontSize: 14 }}>Status:</label>
          <select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }} style={{ border: '1px solid #cbd5e1', borderRadius: 6, padding: '8px 10px' }}>
            <option>New</option>
            <option>Processed</option>
            <option>Converted</option>
          </select>
          <label style={{ color: '#334155', fontSize: 14 }}>School:</label>
          <select value={department} onChange={(e) => { setPage(1); setDepartment(e.target.value); }} style={{ border: '1px solid #cbd5e1', borderRadius: 6, padding: '8px 10px' }}>
            <option value="">All</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <label style={{ color: '#334155', fontSize: 14 }}>Search:</label>
          <input value={query} onChange={(e) => { setPage(1); setQuery(e.target.value); }} placeholder="Name/Email/Phone" style={{ border: '1px solid #cbd5e1', borderRadius: 6, padding: '8px 10px' }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 3fr 3fr 3fr 2fr 2fr 2fr', backgroundColor: '#1f2937', color: 'white', fontSize: '14px', fontWeight: 500, padding: '12px 16px' }}>
          <div>Action</div>
          <div>Date</div>
          <div>School</div>
          <div>Applicant</div>
          <div>Email</div>
          <div>Phone</div>
          <div>Status</div>
        </div>
        <div>
          {items.map((i) => (
            <div key={i.id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 3fr 3fr 3fr 2fr 2fr 2fr', alignItems: 'center', padding: '12px 16px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${ED_TEAL}`, fontSize: '13px', color: ED_TEAL, backgroundColor: 'white', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ED_TEAL; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = ED_TEAL; }}
                  onClick={() => setViewId(i.id)}
                  title="View"
                >
                  <FiEye />
                </button>
              </div>
              <div style={{ color: '#334155' }}>{formatDate(i.createdAt)}</div>
              <div style={{ color: '#334155' }}>{i.departmentName}</div>
              <div style={{ color: '#334155' }}>{i.name}</div>
              <div style={{ color: '#334155' }}>{i.email}</div>
              <div style={{ color: '#334155' }}>{i.phone}</div>
              <div style={{ color: '#334155' }}>{i.status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
        <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} style={{ padding: '6px 10px', borderRadius: 6, background: page <= 1 ? '#cbd5e1' : '#2563eb', color: 'white' }}>Previous</button>
        <span style={{ padding: '6px 10px', borderRadius: 6, background: '#2563eb', color: 'white' }}>{page}</span>
        <button disabled={items.length < PAGE_SIZE} onClick={() => setPage(p => p + 1)} style={{ padding: '6px 10px', borderRadius: 6, background: '#2563eb', color: 'white' }}>Next</button>
      </div>

      {/* View Modal */}
      {viewItem && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)' }} onClick={() => setViewId(null)} />
          <div style={{ position: 'relative', backgroundColor: 'white', width: '95%', maxWidth: 700, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', padding: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Enquiry Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Date" value={formatDate(viewItem.createdAt)} />
              <Field label="School" value={viewItem.departmentName} />
              <Field label="Name" value={viewItem.name} />
              <Field label="Email" value={viewItem.email} />
              <Field label="Phone" value={viewItem.phone} />
              <Field label="Status" value={viewItem.status} />
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Message</div>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 12px', minHeight: 80, whiteSpace: 'pre-wrap', color: '#334155' }}>{viewItem.message || '-'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button onClick={() => setViewId(null)} style={{ padding: '8px 16px', borderRadius: 6, color: 'white', backgroundColor: ED_TEAL }} onMouseEnter={(e)=> e.currentTarget.style.backgroundColor = ED_TEAL_DARK} onMouseLeave={(e)=> e.currentTarget.style.backgroundColor = ED_TEAL}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 12px', color: '#334155' }}>{value || '-'}</div>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString(); } catch { return ''; }
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
