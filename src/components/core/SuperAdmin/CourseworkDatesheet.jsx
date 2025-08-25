import React, { useEffect, useState } from 'react'

export default function CourseworkDatesheet() {
  // Local state (no backend yet)
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10 })
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [show, setShow] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    paperCode: '',
    paperName: '',
    examDate: '',
    startTime: '',
    endTime: '',
    venue: '',
    remarks: '',
    isActive: true,
  })

  const fetchData = async (page = 1, limit = meta.limit, s = search) => {
    setLoading(true)
    try {
      // Simulate client-side filtering & paging
      const source = JSON.parse(sessionStorage.getItem('cw_datesheet') || '[]')
      const filtered = s ? source.filter(r =>
        [r.paperCode, r.paperName, r.venue, r.remarks]
          .filter(Boolean)
          .some(v => String(v).toLowerCase().includes(s.toLowerCase()))
      ) : source
      const start = (page - 1) * limit
      const paged = filtered.slice(start, start + limit)
      setItems(paged)
      setMeta({ total: filtered.length, page, limit })
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData(1) }, [])

  useEffect(() => {
    const t = setTimeout(() => { fetchData(1, meta.limit, search) }, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line
  }, [search])

  const persist = (rows) => {
    sessionStorage.setItem('cw_datesheet', JSON.stringify(rows))
  }

  const onAdd = () => {
    setEditing(null)
    setForm({ paperCode: '', paperName: '', examDate: '', startTime: '', endTime: '', venue: '', remarks: '', isActive: true })
    setShow(true)
  }
  const onEdit = (row) => {
    setEditing(row)
    setForm({
      paperCode: row.paperCode || '',
      paperName: row.paperName || '',
      examDate: row.examDate || '',
      startTime: row.startTime || '',
      endTime: row.endTime || '',
      venue: row.venue || '',
      remarks: row.remarks || '',
      isActive: !!row.isActive,
    })
    setShow(true)
  }
  const onDelete = async (row) => {
    if (!window.confirm('Delete this datesheet entry?')) return
    const source = JSON.parse(sessionStorage.getItem('cw_datesheet') || '[]')
    const next = source.filter(r => r._id !== row._id)
    persist(next)
    await fetchData(meta.page)
  }
  const onToggleActive = async (row) => {
    const source = JSON.parse(sessionStorage.getItem('cw_datesheet') || '[]')
    const next = source.map(r => r._id === row._id ? { ...r, isActive: !r.isActive } : r)
    persist(next)
    await fetchData(meta.page)
  }

  const onSave = async () => {
    // Basic validation
    if (!form.paperCode || !form.paperName || !form.examDate || !form.startTime || !form.endTime) return
    // Compute a comparable sort key for date+time if needed later
    const dateKey = `${form.examDate} ${form.startTime}`
    const source = JSON.parse(sessionStorage.getItem('cw_datesheet') || '[]')
    if (editing?._id) {
      const next = source.map(r => r._id === editing._id ? { ...editing, ...form, dateKey } : r)
      persist(next)
    } else {
      const next = [
        ...source,
        { _id: crypto.randomUUID?.() || String(Date.now()), ...form, dateKey }
      ]
      persist(next)
    }
    setShow(false)
    await fetchData()
  }

  // Styles (standardized)
  const ED_TEAL = '#14b8a6'
  const ED_TEAL_DARK = '#0f766e'
  const BORDER = '#e5e7eb'
  const TEXT_DARK = '#334155'

  const page = { padding: 16, marginTop: '6rem' }
  const card = {
    background: '#fff',
    padding: 16,
    borderRadius: 12,
    border: `1px solid ${BORDER}`,
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
  }
  const header = { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
  const title = { fontSize: 20, fontWeight: 600, color: TEXT_DARK }
  const button = {
    background: ED_TEAL,
    color: '#fff',
    border: `1px solid ${ED_TEAL}`,
    padding: '8px 12px',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'background 0.2s ease',
  }

  const exportHeaders = ["", "Action", "Paper Code", "Paper Name", "Exam Date", "Start Time", "End Time", "Venue"]

  const getFilteredRows = () => {
    const source = JSON.parse(sessionStorage.getItem('cw_datesheet') || '[]')
    const filtered = search
      ? source.filter(r => [r.paperCode, r.paperName, r.venue, r.remarks].filter(Boolean).some(v => String(v).toLowerCase().includes(search.toLowerCase())))
      : source
    return filtered
  }

  const copyToClipboard = async () => {
    const all = getFilteredRows()
    const tableRows = all.map(r => [r.isActive ? '✔' : '', '', r.paperCode, r.paperName, r.examDate, r.startTime, r.endTime, r.venue])
    const lines = [exportHeaders.join('\t'), ...tableRows.map(row => row.join('\t'))].join('\n')
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(lines)
      } else {
        throw new Error('clipboard api unsupported')
      }
    } catch (e) {
      const ta = document.createElement('textarea')
      ta.value = lines
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
  }

  const downloadCSV = () => {
    const all = getFilteredRows()
    const rows = [exportHeaders, ...all.map(r => [r.isActive ? '✔' : '', '', r.paperCode, r.paperName, r.examDate, r.startTime, r.endTime, r.venue])]
    const csv = rows.map(r => r.map(String).map(s => '"' + s.replace(/"/g, '""') + '"').join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'datesheet.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const printTable = () => {
    const all = getFilteredRows()
    const html = `
      <html><head><title>Datesheet</title>
      <style>body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#111827;color:#fff}</style>
      </head><body>
      <table><thead><tr>${exportHeaders.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>
      ${all.map(r => `<tr><td>${r.isActive ? '✔' : ''}</td><td></td><td>${r.paperCode}</td><td>${r.paperName}</td><td>${r.examDate}</td><td>${r.startTime}</td><td>${r.endTime}</td><td>${r.venue}</td></tr>`).join('')}
      </tbody></table>
      </body></html>`
    const w = window.open('', '_blank')
    if (w) { w.document.write(html); w.document.close(); w.focus(); w.print() }
  }

  return (
    <div style={page}>
      <div style={card}>
        <div style={header}>
          <div style={title}>Coursework Datesheet</div>
          <button style={button} onClick={onAdd}>Add Datesheet</button>
        </div>
        <div style={{ height: 1, background: BORDER, marginTop: 8, marginBottom: 12 }} />

        {/* Toolbar + Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={copyToClipboard} style={{ ...button, padding: '6px 12px' }} onMouseOver={(e)=>e.currentTarget.style.background=ED_TEAL_DARK} onMouseOut={(e)=>e.currentTarget.style.background=ED_TEAL}>Copy</button>
            <button onClick={downloadCSV} style={{ ...button, padding: '6px 12px' }} onMouseOver={(e)=>e.currentTarget.style.background=ED_TEAL_DARK} onMouseOut={(e)=>e.currentTarget.style.background=ED_TEAL}>CSV</button>
            <button onClick={printTable} style={{ ...button, padding: '6px 12px' }} onMouseOver={(e)=>e.currentTarget.style.background=ED_TEAL_DARK} onMouseOut={(e)=>e.currentTarget.style.background=ED_TEAL}>Print</button>
          </div>
          <div>
            <label style={{ color: '#475569', fontSize: 13, marginRight: 8 }}>Search:</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: 8, border: `1px solid ${BORDER}`, borderRadius: 8 }} />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ color: '#475569' }}>Loading...</div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 12, overflow: 'hidden', border: `1px solid ${BORDER}`, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ background: '#0f172a', color: '#fff', padding: '10px', textAlign: 'left' }}>↑↓</th>
                  <th style={{ background: '#0f172a', color: '#fff', padding: '10px', textAlign: 'left' }}>Action ↑↓</th>
                  <th style={{ background: '#0f172a', color: '#fff', padding: '10px', textAlign: 'left' }}>Paper Code ↑↓</th>
                  <th style={{ background: '#0f172a', color: '#fff', padding: '10px', textAlign: 'left' }}>Paper Name ↑↓</th>
                  <th style={{ background: '#0f172a', color: '#fff', padding: '10px', textAlign: 'left' }}>Exam Date ↑↓</th>
                  <th style={{ background: '#0f172a', color: '#fff', padding: '10px', textAlign: 'left' }}>Start Time ↑↓</th>
                  <th style={{ background: '#0f172a', color: '#fff', padding: '10px', textAlign: 'left' }}>End Time ↑↓</th>
                  <th style={{ background: '#0f172a', color: '#fff', padding: '10px', textAlign: 'left' }}>Venue ↑↓</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: 12, color: '#475569' }}>No Record Found</td>
                  </tr>
                ) : (
                  items.map((row, idx) => (
                    <tr key={row._id} style={{ borderTop: `1px solid ${BORDER}`, background: idx % 2 ? '#f8fafc' : '#fff' }}>
                      <td style={{ padding: '10px' }}>
                        <input type="checkbox" checked={!!row.isActive} onChange={() => onToggleActive(row)} />
                      </td>
                      <td style={{ padding: '10px' }}>
                        <button title="Edit" onClick={() => onEdit(row)} style={{ ...button, padding: '6px 10px', marginRight: 6 }} onMouseOver={(e)=>e.currentTarget.style.background=ED_TEAL_DARK} onMouseOut={(e)=>e.currentTarget.style.background=ED_TEAL}>✎</button>
                        <button title="Delete" onClick={() => onDelete(row)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 8, cursor: 'pointer' }}>🗑</button>
                      </td>
                      <td style={{ padding: '10px' }}>{row.paperCode}</td>
                      <td style={{ padding: '10px' }}>{row.paperName}</td>
                      <td style={{ padding: '10px' }}>{row.examDate}</td>
                      <td style={{ padding: '10px' }}>{row.startTime}</td>
                      <td style={{ padding: '10px' }}>{row.endTime}</td>
                      <td style={{ padding: '10px' }}>{row.venue}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderTop: `1px solid ${BORDER}` }}>
              <div style={{ color: '#475569', fontSize: 12 }}>
                Showing {(items.length === 0) ? 0 : ((meta.page - 1) * meta.limit + 1)} to {(meta.page - 1) * meta.limit + items.length} of {meta.total} entries
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button disabled={meta.page <= 1} onClick={() => fetchData(meta.page - 1)} style={{ background: '#f1f5f9', padding: '6px 10px', borderRadius: 8, border: `1px solid ${BORDER}`, cursor: 'pointer', opacity: meta.page <= 1 ? 0.6 : 1 }}>Previous</button>
                <div style={{ background: ED_TEAL, color: '#fff', padding: '6px 10px', borderRadius: 8, border: `1px solid ${ED_TEAL}` }}>{meta.page}</div>
                <button disabled={(meta.page * meta.limit) >= meta.total} onClick={() => fetchData(meta.page + 1)} style={{ background: '#f1f5f9', padding: '6px 10px', borderRadius: 8, border: `1px solid ${BORDER}`, cursor: 'pointer', opacity: (meta.page * meta.limit) >= meta.total ? 0.6 : 1 }}>Next</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {show && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
          onKeyDown={(e) => { if (e.key === 'Escape') setShow(false) }}
        >
          <div style={{ background: '#fff', width: 760, borderRadius: 8, padding: 16, boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: '#334155', fontSize: 16 }}>{editing ? 'Edit Datesheet' : 'Add Datesheet'}</div>
              <div style={{ cursor: 'pointer', color: '#64748b', fontWeight: 700 }} onClick={() => setShow(false)}>×</div>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); onSave() }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <label style={{ display: 'grid', rowGap: 6 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>Paper Code</span>
                <input value={form.paperCode} onChange={(e) => setForm({ ...form, paperCode: e.target.value })} required style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }} />
              </label>
              <label style={{ display: 'grid', rowGap: 6 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>Paper Name</span>
                <input value={form.paperName} onChange={(e) => setForm({ ...form, paperName: e.target.value })} required style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }} />
              </label>
              <label style={{ display: 'grid', rowGap: 6 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>Exam Date</span>
                <input type="date" value={form.examDate} onChange={(e) => setForm({ ...form, examDate: e.target.value })} required style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }} />
              </label>
              <label style={{ display: 'grid', rowGap: 6 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>Start Time</span>
                <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }} />
              </label>
              <label style={{ display: 'grid', rowGap: 6 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>End Time</span>
                <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }} />
              </label>
              <label style={{ display: 'grid', rowGap: 6 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>Venue</span>
                <input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="Hall A" style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }} />
              </label>
              <label style={{ display: 'grid', rowGap: 6 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>Remarks</span>
                <input value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} placeholder="Any instructions" style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }} />
              </label>
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#475569' }}>
                  <input type="checkbox" checked={!!form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => setShow(false)} style={{ background: '#64748b', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" disabled={!(form.paperCode && form.paperName && form.examDate && form.startTime && form.endTime)} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', opacity: (form.paperCode && form.paperName && form.examDate && form.startTime && form.endTime) ? 1 : 0.6 }}>{editing ? 'Update' : 'Submit'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
