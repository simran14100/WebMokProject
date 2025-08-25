import React, { useEffect, useMemo, useState } from 'react';
import { FiEye } from 'react-icons/fi';
import { ED_TEAL, ED_TEAL_DARK } from '../../../utils/theme';
import { listEnquiries } from '../../../services/enquiryApi';
import { listDepartments } from '../../../services/departmentApi';
import { showSuccess, showError, showLoading, dismissToast } from '../../../utils/toast';

const PAGE_SIZE = 10;


const BORDER = '#e0e0e0';
const TEXT_DARK = '#191A1F';

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
    <div style={{ padding: '1rem', marginTop: '14rem' }}>
    {/* Header */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 600, color: TEXT_DARK , marginLeft: '100px'}}>New Applications</h1>
    </div>
  
    {/* Toolbar */}
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 12 , marginLeft: '100px'}}>
      {[
        { label: 'Copy', action: copyTable },
        { label: 'CSV', action: exportCSV },
        { label: 'Print', action: printTable },
      ].map(btn => (
        <button
          key={btn.label}
          onClick={btn.action}
          style={{
            padding: '8px 14px',
            borderRadius: 6,
            background: ED_TEAL,
            color: 'white',
            fontWeight: 500,
            border: `1px solid ${ED_TEAL}`,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = ED_TEAL_DARK)}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = ED_TEAL)}
        >
          {btn.label}
        </button>
      ))}
  
      <div style={{ marginLeft: 'auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 , marginRight: '30px'}}>
        <label style={{ color: TEXT_DARK, fontSize: 14 }}>Status:</label>
        <select
          value={status}
          onChange={(e) => { setPage(1); setStatus(e.target.value); }}
          style={{
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            padding: '8px 10px',
            minWidth: 120,
          }}
        >
          <option>New</option>
          <option>Processed</option>
          <option>Converted</option>
        </select>
  
        <label style={{ color: TEXT_DARK, fontSize: 14 }}>School:</label>
        <select
          value={department}
          onChange={(e) => { setPage(1); setDepartment(e.target.value); }}
          style={{
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            padding: '8px 10px',
            minWidth: 150,
          }}
        >
          <option value="">All</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
  
        <label style={{ color: TEXT_DARK, fontSize: 14 }}>Search:</label>
        <input
          value={query}
          onChange={(e) => { setPage(1); setQuery(e.target.value); }}
          placeholder="Name/Email/Phone"
          style={{
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            padding: '8px 10px',
            minWidth: 200,
          }}
        />
      </div>
    </div>
  
    {/* Table */}
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: `1px solid ${BORDER}`,
        overflow: 'hidden',
        width: '90%',
        marginLeft: '100px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 2fr 2fr 2fr 2fr 2fr 1.5fr',
          backgroundColor: ED_TEAL,
          color: 'white',
          fontSize: '14px',
          fontWeight: 600,
          padding: '12px 16px',
        }}
      >
        <div>Action</div>
        <div>Date</div>
        <div>School</div>
        <div>Applicant</div>
        <div>Email</div>
        <div>Phone</div>
        <div>Status</div>
      </div>
  
      {/* Rows */}
      <div>
        {items.map((i, idx) => (
          <div
            key={i.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 2fr 2fr 2fr 2fr 2fr 1.5fr',
              alignItems: 'center',
              padding: '12px 16px',
              backgroundColor: idx % 2 === 0 ? '#fafafa' : 'white',
              borderBottom: `1px solid ${BORDER}`,
              fontSize: '14px',
              color: TEXT_DARK,
            }}
          >
            {/* Action Button */}
            <div>
              <button
                style={{
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: `1px solid ${ED_TEAL}`,
                  fontSize: '13px',
                  color: ED_TEAL,
                  backgroundColor: 'white',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ED_TEAL; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = ED_TEAL; }}
                onClick={() => setViewId(i.id)}
                title="View"
              >
                <FiEye />
              </button>
            </div>
            <div>{formatDate(i.createdAt)}</div>
            <div>{i.departmentName}</div>
            <div>{i.name}</div>
            <div>{i.email}</div>
            <div>{i.phone}</div>
            <div>{i.status}</div>
          </div>
        ))}
      </div>
    </div>
  
    {/* Pagination */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 12 , marginRight: '30px' }}>
      <button
        disabled={page <= 1}
        onClick={() => setPage(p => Math.max(1, p - 1))}
        style={{
          padding: '6px 12px',
          borderRadius: 6,
          background: page <= 1 ? '#cbd5e1' : ED_TEAL,
          color: 'white',
          fontWeight: 500,
        }}
      >
        Previous
      </button>
      <span style={{ padding: '6px 12px', borderRadius: 6, background: ED_TEAL, color: 'white', fontWeight: 500 }}>
        {page}
      </span>
      <button
        disabled={items.length < PAGE_SIZE}
        onClick={() => setPage(p => p + 1)}
        style={{
          padding: '6px 12px',
          borderRadius: 6,
          background: items.length < PAGE_SIZE ? '#cbd5e1' : ED_TEAL,
          color: 'white',
          fontWeight: 500,
        }}
      >
        Next
      </button>
    </div>
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
