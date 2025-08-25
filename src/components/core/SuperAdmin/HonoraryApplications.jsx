import React, { useEffect, useMemo, useState } from 'react';
import { FiPrinter } from 'react-icons/fi';
import { ED_TEAL, ED_TEAL_DARK } from '../../../utils/theme';
import { listEnquiries } from '../../../services/enquiryApi';
import { listDepartments } from '../../../services/departmentApi';
import { showSuccess, showError, showLoading, dismissToast } from '../../../utils/toast';

const PAGE_SIZE = 10;

const BORDER = '#e0e0e0';
const TEXT_DARK = '#191A1F';

export default function HonoraryApplications() {
  const [items, setItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [query, setQuery] = useState('honorary');
  const [status, setStatus] = useState(''); // show all statuses by default
  const [department, setDepartment] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: PAGE_SIZE });

  // try to auto-pick department that looks like "Honorary"
  const honoraryDeptId = useMemo(() => {
    const d = departments.find((x) => /honorary|honourary|honarary|honor/i.test(x.name));
    return d?.id || '';
  }, [departments]);

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
          studentName: e.name,
          fatherName: e.fatherName || '', // backend may not have this yet
          subject: e.department?.name || e.source || '',
          contact: e.phone || '',
          qualification: e.qualification || '', // backend may not have this yet
          createdAt: e.createdAt,
        }));
        setItems(mapped);
        setMeta(resData.meta || { total: mapped.length, page, limit: PAGE_SIZE });

        // if a likely Honorary department exists and not set yet, apply it once
        if (!department && deptItems.length) {
          const match = deptItems.find((x) => /honorary|honourary|honarary|honor/i.test(x.name));
          if (match) setDepartment(match.id);
        }
      } catch (e) {
        showError(e?.response?.data?.message || 'Failed to load honorary enquiries');
      } finally {
        if (tId) dismissToast(tId);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const load = async () => {
      let tId;
      try {
        tId = showLoading('Loading enquiries...');
        const listRes = await listEnquiries({ q: query, status, department, page, limit: PAGE_SIZE });
        const resData = listRes?.data || {};
        const mapped = (resData.data || []).map((e) => ({
          id: e._id,
          studentName: e.name,
          fatherName: e.fatherName || '',
          subject: e.department?.name || e.source || '',
          contact: e.phone || '',
          qualification: e.qualification || '',
          createdAt: e.createdAt,
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

  const copyTable = async () => {
    const header = 'Student Name\tFather Name\tSubject\tContact\tQualification';
    const rows = items.map(i => [i.studentName, i.fatherName || '-', i.subject || '-', i.contact || '-', i.qualification || '-'].join('\t')).join('\n');
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
    const header = 'Student Name,Father Name,Subject,Contact,Qualification\n';
    const rows = items.map(i => [escapeCsv(i.studentName), escapeCsv(i.fatherName || '-'), escapeCsv(i.subject || '-'), escapeCsv(i.contact || '-'), escapeCsv(i.qualification || '-')].join(',')).join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'honorary-applications.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const printTable = () => {
    const win = window.open('', 'PRINT', 'height=700,width=1000');
    if (!win) return;
    const tableRows = items.map(i => `<tr><td>${escapeHtml(i.studentName)}</td><td>${escapeHtml(i.fatherName || '-')}</td><td>${escapeHtml(i.subject || '-')}</td><td>${escapeHtml(i.contact || '-')}</td><td>${escapeHtml(i.qualification || '-')}</td></tr>`).join('');
    const html = `<!doctype html>
<html><head><meta charset="utf-8" /><title>Honorary Applications</title>
<style>body{font-family:Arial,sans-serif;padding:16px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left}thead{background:#f1f5f9}</style>
</head><body>
<h3>Honorary Applications</h3>
<table><thead><tr><th>Student Name</th><th>Father Name</th><th>Subject</th><th>Contact Number</th><th>Qualification</th></tr></thead><tbody>${tableRows}</tbody></table>
</body></html>`;
    win.document.open(); win.document.write(html); win.document.close();
    win.onload = () => { win.focus(); win.print(); win.close(); };
  };

  return (
    <div style={{ padding: '1rem', marginTop: '14rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 600, color: TEXT_DARK , marginLeft: '100px'}}>Honorary Applications</h1>
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
            <option value="">All</option>
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
            gridTemplateColumns: '1.2fr 2fr 2fr 2fr 2fr 2fr',
            backgroundColor: ED_TEAL,
            color: 'white',
            fontSize: '14px',
            fontWeight: 600,
            padding: '12px 16px',
          }}
        >
          <div>Action</div>
          <div>Student Name</div>
          <div>Father Name</div>
          <div>Subject</div>
          <div>Contact Number</div>
          <div>Qualification</div>
        </div>

        {/* Rows */}
        <div>
          {items.map((i, idx) => (
            <div
              key={i.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 2fr 2fr 2fr 2fr 2fr',
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
                  title="Print Row"
                  onClick={() => printSingle(i)}
                >
                  <FiPrinter />
                </button>
              </div>
              <div>{i.studentName}</div>
              <div>{i.fatherName || '-'}</div>
              <div>{i.subject || '-'}</div>
              <div>{i.contact || '-'}</div>
              <div>{i.qualification || '-'}</div>
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

function printSingle(i) {
  const win = window.open('', 'PRINT', 'height=600,width=800');
  if (!win) return;
  const html = `<!doctype html>
<html><head><meta charset="utf-8" /><title>Honorary Application</title>
<style>body{font-family:Arial,sans-serif;padding:16px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left}thead{background:#f1f5f9}</style>
</head><body>
<h3>Honorary Application</h3>
<table><tbody>
<tr><th>Student Name</th><td>${escapeHtml(i.studentName)}</td></tr>
<tr><th>Father Name</th><td>${escapeHtml(i.fatherName || '-')}</td></tr>
<tr><th>Subject</th><td>${escapeHtml(i.subject || '-')}</td></tr>
<tr><th>Contact</th><td>${escapeHtml(i.contact || '-')}</td></tr>
<tr><th>Qualification</th><td>${escapeHtml(i.qualification || '-')}</td></tr>
</tbody></table>
</body></html>`;
  win.document.open(); win.document.write(html); win.document.close();
  win.onload = () => { win.focus(); win.print(); win.close(); };
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
