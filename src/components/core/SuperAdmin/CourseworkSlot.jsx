import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { 
  listCourseworkSlots,
  createCourseworkSlot,
  updateCourseworkSlot,
  deleteCourseworkSlot,
  toggleCourseworkSlot
} from '../../../services/operations/adminApi'

export default function CourseworkSlot() {
  const token = useSelector((state) => state.auth?.token)

  // State
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10 })
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', startDate: '', lateFeeDate: '', lateFee: '', marksheetSeries: '' })

  // Helpers
  const fetchData = async (page = meta.page, limit = meta.limit, s = search) => {
    setLoading(true)
    try {
      const data = await listCourseworkSlots({ page, limit, search: s }, token)
      setItems(data.items || [])
      setMeta(data.meta || { total: 0, page, limit })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Date format like 06-Aug-2025
  const formatDate = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/\./g, '')
  }

  // Actions
  const onAddNew = () => {
    setEditing(null)
    setForm({ name: '', startDate: '', lateFeeDate: '', lateFee: '', marksheetSeries: '' })
    setShowModal(true)
  }

  const onEdit = (row) => {
    setEditing(row)
    setForm({
      name: row.name || '',
      startDate: row.startDate ? new Date(row.startDate).toISOString().slice(0, 10) : '',
      lateFeeDate: row.lateFeeDate ? new Date(row.lateFeeDate).toISOString().slice(0, 10) : '',
      lateFee: row.lateFee ?? '',
      marksheetSeries: row.marksheetSeries || ''
    })
    setShowModal(true)
  }

  const onSave = async () => {
    const payload = {
      name: String(form.name || '').trim(),
      startDate: form.startDate,
      lateFeeDate: form.lateFeeDate,
      lateFee: Number(form.lateFee || 0),
      marksheetSeries: String(form.marksheetSeries || '').trim()
    }
    if (!payload.name || !payload.startDate || !payload.lateFeeDate) return
    if (editing) {
      await updateCourseworkSlot(editing._id, payload, token)
    } else {
      await createCourseworkSlot(payload, token)
    }
    setShowModal(false)
    await fetchData()
  }

  const onDelete = async (row) => {
    if (!window.confirm('Delete this slot?')) return
    await deleteCourseworkSlot(row._id, token)
    await fetchData()
  }

  const onToggle = async (row) => {
    await toggleCourseworkSlot(row._id, token)
    await fetchData()
  }

  // Copy/CSV/Print
  const handleCopy = async () => {
    const text = items.map(i => `${i.name}\t${formatDate(i.startDate)}\t${formatDate(i.lateFeeDate)}\t${i.lateFee}`).join('\n')
    try { await navigator.clipboard.writeText(text) } catch { /* noop */ }
  }
  const handleCSV = () => {
    const header = ['Slot Name', 'Start Date', 'Late Fee Date', 'Late Fee']
    const rows = items.map(i => [i.name, formatDate(i.startDate), formatDate(i.lateFeeDate), i.lateFee])
    const csv = [header, ...rows].map(r => r.map(x => `"${String(x).replaceAll('"', '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'coursework-slots.csv'
    a.click()
    URL.revokeObjectURL(url)
  }
  const handlePrint = () => {
    const safe = (v) => (v == null ? '' : String(v))
    const rowsHtml = items.map((i, idx) => (
      `<tr>
        <td style="text-align:center">${idx + 1}</td>
        <td>${safe(i.name)}</td>
        <td>${safe(formatDate(i.startDate))}</td>
        <td>${safe(formatDate(i.lateFeeDate))}</td>
        <td style="text-align:right">${safe(i.lateFee)}</td>
      </tr>`
    )).join('')
    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Coursework Slots</title>
  <style>
    body { font-family: Arial, Helvetica, sans-serif; background:#f3f4f6; padding:24px; }
    .toolbar { display:flex; justify-content:flex-end; margin-bottom:12px; }
    .btn { background:#2563eb; color:#fff; border:none; padding:8px 12px; border-radius:6px; font-weight:700; cursor:pointer; }
    .title { font-weight:700; color:#374151; margin-bottom:10px; font-size:18px; }
    table { width:100%; border-collapse:collapse; background:#fff; }
    thead th { background:#111827; color:#fff; padding:10px 12px; border:1px solid #111; font-weight:700; }
    tbody td { border:1px solid #111; padding:8px 10px; font-size:14px; }
    .wrap { border:2px solid #111; padding:10px; background:#fff; }
    @media print { .toolbar { display:none; } body { background:#fff; padding:0; } }
  </style>
  </head>
<body>
  <div class="toolbar"><button class="btn" onclick="window.print()">Print</button></div>
  <div class="title">Coursework Slot Management</div>
  <div class="wrap">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Slot Name</th>
          <th>Start Date</th>
          <th>Late Fee Date</th>
          <th>Late Fee</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  </div>
  <script>window.focus && window.focus();</script>
  </body>
</html>`
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(html)
    w.document.close()
    w.focus()
  }

  const totalPages = useMemo(() => Math.max(1, Math.ceil((meta.total || 0) / (meta.limit || 10))), [meta])

  // Styles
  const card = { background: '#f1f5f9', padding: 16, borderRadius: 8, marginTop: '6rem' }
  const header = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }
  const title = { fontSize: 18, fontWeight: 700, color: '#334155' }
  const button = { background: '#3b82f6', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }
  const toolbarBtn = { background: '#64748b', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', marginRight: 8 }
  const tableWrap = { background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }
  const tableHead = { background: '#111827', color: '#fff' }
  const th = { padding: '10px 12px', borderRight: '1px solid #334155', fontWeight: 600, fontSize: 14, textAlign: 'left' }
  const td = { padding: '10px 12px', borderRight: '1px solid #e2e8f0', color: '#111827', fontSize: 14 }
  const actionIcon = { background: '#e2e8f0', width: 28, height: 28, borderRadius: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginRight: 8 }
  const searchBox = { padding: 6, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }
  const pagerBtn = { padding: '6px 10px', border: '1px solid #cbd5e1', background: '#f8fafc', borderRadius: 6, cursor: 'pointer' }
  const pagerActive = { ...pagerBtn, background: '#2563eb', color: '#fff', borderColor: '#2563eb' }

  return (
    <div style={{ padding: 16 }}>
      <div style={card}>
        <div style={header}>
          <div style={title}>Coursework Slot Management</div>
          <button style={button} onClick={onAddNew}>Add New Slot</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div>
            <button style={toolbarBtn} onClick={handleCopy}>Copy</button>
            <button style={toolbarBtn} onClick={handleCSV}>CSV</button>
            <button style={toolbarBtn} onClick={handlePrint}>Print</button>
          </div>
          <div>
            <span style={{ marginRight: 8, color: '#334155' }}>Search:</span>
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); fetchData(1, meta.limit, e.target.value) }}
              placeholder="Search by name"
              style={searchBox}
            />
          </div>
        </div>

        <div style={tableWrap}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={tableHead}>
              <tr>
                <th style={th}>⇅</th>
                <th style={th}>Action</th>
                <th style={th}>Slot Name</th>
                <th style={th}>Start Date</th>
                <th style={th}>Late Fee Date</th>
                <th style={{ ...th, borderRight: 'none' }}>Late Fee</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ ...td, textAlign: 'center' }}>Loading...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} style={{ ...td, textAlign: 'center' }}>No data</td></tr>
              ) : (
                items.map((row) => (
                  <tr key={row._id} style={{ borderTop: '1px solid #e2e8f0' }}>
                    <td style={td}><input type="checkbox" checked={!!row.isActive} onChange={() => onToggle(row)} /></td>
                    <td style={td}>
                      <span title="Edit" style={actionIcon} onClick={() => onEdit(row)}>✏️</span>
                      <span title="Toggle" style={actionIcon} onClick={() => onToggle(row)}>🔔</span>
                      <span title="Delete" style={actionIcon} onClick={() => onDelete(row)}>🗑️</span>
                    </td>
                    <td style={td}>{row.name}</td>
                    <td style={td}>{formatDate(row.startDate)}</td>
                    <td style={td}>{formatDate(row.lateFeeDate)}</td>
                    <td style={{ ...td, borderRight: 'none' }}>{row.lateFee}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 8 }}>
          <div style={{ color: '#475569' }}>Showing {(items.length ? ((meta.page - 1) * meta.limit + 1) : 0)} to {((meta.page - 1) * meta.limit) + items.length} of {meta.total} entries</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={pagerBtn} disabled={meta.page <= 1} onClick={() => fetchData(meta.page - 1)}>
              Previous
            </button>
            <div style={pagerActive}>{meta.page}</div>
            <button style={pagerBtn} disabled={meta.page >= totalPages} onClick={() => fetchData(meta.page + 1)}>
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: '#fff', width: 720, borderRadius: 8, padding: 16, boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: '#334155', fontSize: 16 }}>{editing ? 'Edit Slot' : 'Add New Slot'}</div>
              <div style={{ cursor: 'pointer', color: '#64748b', fontWeight: 700 }} onClick={() => setShowModal(false)}>×</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <label style={{ display: 'grid', rowGap: 6 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>Coursework Slot Name</span>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }} />
              </label>
              <label style={{ display: 'grid', rowGap: 6 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>Start Date</span>
                <input type="date" placeholder="dd/mm/yyyy" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }} />
              </label>
              <label style={{ display: 'grid', rowGap: 6 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>Late Fee Date</span>
                <input type="date" placeholder="dd/mm/yyyy" value={form.lateFeeDate} onChange={(e) => setForm({ ...form, lateFeeDate: e.target.value })} style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }} />
              </label>
              <label style={{ display: 'grid', rowGap: 6 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>Late Fee</span>
                <input type="number" value={form.lateFee} onChange={(e) => setForm({ ...form, lateFee: e.target.value })} style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }} />
              </label>
              <label style={{ gridColumn: '1 / span 2', display: 'grid', rowGap: 6 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>Marksheet Series</span>
                <input value={form.marksheetSeries} onChange={(e) => setForm({ ...form, marksheetSeries: e.target.value })} style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }} />
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <button style={{ background: '#64748b', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }} onClick={() => setShowModal(false)}>Cancel</button>
              <button style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }} onClick={onSave}>{editing ? 'Update' : 'Submit'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
