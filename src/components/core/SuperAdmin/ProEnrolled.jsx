import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { FiEye } from 'react-icons/fi';
import { getPhdEnrollmentPaidStudents } from '../../../services/operations/adminApi';
import { ED_TEAL, ED_TEAL_DARK } from '../../../utils/theme';
import { showSuccess, showError, showLoading, dismissToast } from '../../../utils/toast';

const PAGE_SIZE = 10;

export default function ProEnrolled() {
  const { token } = useSelector((state) => state.auth);

  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: PAGE_SIZE });

  const [viewId, setViewId] = useState(null);
  const viewItem = useMemo(() => items.find(i => i._id === viewId) || null, [items, viewId]);

  // Initial load
  useEffect(() => {
    loadData(1, query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Load on page or query change
  useEffect(() => {
    loadData(page, query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, query]);

  async function loadData(p, q) {
    let tId;
    try {
      tId = showLoading('Loading PhD enrollment-fee paid students...');
      const { items: list, meta: m } = await getPhdEnrollmentPaidStudents(token, { page: p, limit: PAGE_SIZE, search: q });
      setItems(Array.isArray(list) ? list : []);
      setMeta(m || { total: (list || []).length, page: p, limit: PAGE_SIZE });
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to load PhD enrollment-fee paid students');
    } finally {
      if (tId) dismissToast(tId);
    }
  }

  // Export helpers
  const copyTable = async () => {
    const header = 'Date\tName\tEmail\tPhone\tStatus\tAmount';
    const rows = items.map(i => `${formatDate(i?.paymentDetails?.createdAt || i?.createdAt)}\t${fullName(i)}\t${i?.email || ''}\t${i?.phoneNumber || ''}\t${i?.paymentStatus || ''}\t${formatAmount(i?.paymentDetails?.amount)}`).join('\n');
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
    const header = 'Date,Name,Email,Phone,Status,Amount\n';
    const rows = items.map(i => [
      formatDate(i?.paymentDetails?.createdAt || i?.createdAt),
      fullName(i),
      i?.email || '',
      i?.phoneNumber || '',
      i?.paymentStatus || '',
      formatAmount(i?.paymentDetails?.amount)
    ].map(escapeCsv).join(',')).join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'phd-enrollment-paid-students.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const printTable = () => {
    const win = window.open('', 'PRINT', 'height=700,width=1000');
    if (!win) return;
    const tableRows = items.map(i => `<tr>
      <td>${escapeHtml(formatDate(i?.paymentDetails?.createdAt || i?.createdAt))}</td>
      <td>${escapeHtml(fullName(i))}</td>
      <td>${escapeHtml(i?.email || '')}</td>
      <td>${escapeHtml(i?.phoneNumber || '')}</td>
      <td>${escapeHtml(i?.paymentStatus || '')}</td>
      <td>${escapeHtml(formatAmount(i?.paymentDetails?.amount))}</td>
    </tr>`).join('');
    const html = `<!doctype html>
<html><head><meta charset="utf-8" /><title>Pro Enrolled Students</title>
<style>body{font-family:Arial,sans-serif;padding:16px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left}thead{background:#f1f5f9}</style>
</head><body>
<h3>PhD Enrollment-Fee Paid Students</h3>
<table><thead><tr><th>Date</th><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Amount</th></tr></thead><tbody>${tableRows}</tbody></table>
</body></html>`;
    win.document.open(); win.document.write(html); win.document.close();
    win.onload = () => { win.focus(); win.print(); win.close(); };
  };

  return (
    <div style={{ paddingLeft: '8px', paddingRight: '8px', marginTop: '14rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#334155' }}>PhD Enrollment-Fee Paid Students</h1>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <button onClick={copyTable} style={{ padding: '6px 10px', borderRadius: 6, background: '#475569', color: 'white' }}>Copy</button>
        <button onClick={exportCSV} style={{ padding: '6px 10px', borderRadius: 6, background: '#475569', color: 'white' }}>CSV</button>
        <button onClick={printTable} style={{ padding: '6px 10px', borderRadius: 6, background: '#475569', color: 'white' }}>Print</button>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ color: '#334155', fontSize: 14 }}>Search:</label>
          <input value={query} onChange={(e) => { setPage(1); setQuery(e.target.value); }} placeholder="Name/Email/Phone" style={{ border: '1px solid #cbd5e1', borderRadius: 6, padding: '8px 10px' }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 3fr 3fr 2.5fr 2fr 2fr', backgroundColor: '#1f2937', color: 'white', fontSize: '14px', fontWeight: 500, padding: '12px 16px' }}>
          <div>Action</div>
          <div>Date</div>
          <div>Name</div>
          <div>Email</div>
          <div>Phone</div>
          <div>Status</div>
        </div>
        <div>
          {items.map((i) => (
            <div key={i._id} style={{ display: 'grid', gridTemplateColumns: '1.5fr 3fr 3fr 2.5fr 2fr 2fr', alignItems: 'center', padding: '12px 16px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  style={{ padding: '8px', borderRadius: '6px', border: `1px solid ${ED_TEAL}`, fontSize: '13px', color: ED_TEAL, backgroundColor: 'white', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ED_TEAL; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = ED_TEAL; }}
                  onClick={() => setViewId(i._id)}
                  title="View"
                >
                  <FiEye />
                </button>
              </div>
              <div style={{ color: '#334155' }}>{formatDate(i?.paymentDetails?.createdAt || i?.createdAt)}</div>
              <div style={{ color: '#334155' }}>{fullName(i)}</div>
              <div style={{ color: '#334155' }}>{i?.email}</div>
              <div style={{ color: '#334155' }}>{i?.phoneNumber}</div>
              <div style={{ color: '#334155' }}>{i?.paymentStatus || '-'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
        <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} style={{ padding: '6px 10px', borderRadius: 6, background: page <= 1 ? '#cbd5e1' : '#2563eb', color: 'white' }}>Previous</button>
        <span style={{ padding: '6px 10px', borderRadius: 6, background: '#2563eb', color: 'white' }}>{page}</span>
        <button disabled={items.length < PAGE_SIZE && !hasMore(meta, items)} onClick={() => setPage(p => p + 1)} style={{ padding: '6px 10px', borderRadius: 6, background: '#2563eb', color: 'white' }}>Next</button>
      </div>

      {/* View Modal */}
      {viewItem && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)' }} onClick={() => setViewId(null)} />
          <div style={{ position: 'relative', backgroundColor: 'white', width: '95%', maxWidth: 700, borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.2)', padding: 20 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Student Payment Details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Date" value={formatDate(viewItem?.paymentDetails?.createdAt || viewItem?.createdAt)} />
              <Field label="Name" value={fullName(viewItem)} />
              <Field label="Email" value={viewItem?.email} />
              <Field label="Phone" value={viewItem?.phoneNumber} />
              <Field label="Status" value={viewItem?.paymentStatus} />
              <Field label="Amount" value={formatAmount(viewItem?.paymentDetails?.amount)} />
              <Field label="Order ID" value={viewItem?.paymentDetails?.orderId} />
              <Field label="Payment ID" value={viewItem?.paymentDetails?.paymentId} />
              <Field label="Razorpay Signature" value={viewItem?.paymentDetails?.signature} />
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Raw Details</div>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 12px', minHeight: 80, whiteSpace: 'pre-wrap', color: '#334155' }}>{escapeHtml(JSON.stringify(viewItem?.paymentDetails || {}, null, 2))}</div>
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
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 12px', color: '#334155', wordBreak: 'break-all' }}>{value || '-'}</div>
    </div>
  );
}

function fullName(i) {
  const fn = i?.firstName || i?.name || '';
  const ln = i?.lastName || '';
  const combined = `${fn}${ln ? ' ' + ln : ''}`.trim();
  return combined || i?.fullName || i?.username || '-';
}

function formatDate(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString(); } catch { return ''; }
}

function formatAmount(paiseOrRupees) {
  if (paiseOrRupees == null) return '';
  // If looks like paise (big integer), convert to INR rupees
  const num = Number(paiseOrRupees);
  if (Number.isNaN(num)) return String(paiseOrRupees);
  if (num > 1000) return `₹${(num/100).toFixed(2)}`;
  return `₹${num.toFixed(2)}`;
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

function hasMore(meta, items) {
  if (!meta || !meta.total || !meta.limit || !meta.page) return items.length === PAGE_SIZE; // fallback
  const shown = meta.page * meta.limit;
  return shown < meta.total;
}
