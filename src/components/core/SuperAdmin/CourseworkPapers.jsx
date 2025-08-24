import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { 
  listCourseworkPapers,
  createCourseworkPaper,
  updateCourseworkPaper,
  deleteCourseworkPaper,
  toggleCourseworkPaper,
} from '../../../services/operations/adminApi'

export default function CourseworkPapers() {
  const token = useSelector((s) => s.auth?.token)
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10 })
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [show, setShow] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    code: '', name: '', theoryMax: '', theoryMinPass: '', iaMax: '', iaMinPass: '', credit: '', paperType: 'Elective'
  })

  const fetchData = async (page = meta.page, limit = meta.limit, s = search) => {
    setLoading(true)
    try {
      const data = await listCourseworkPapers({ page, limit, search: s }, token)
      setItems(data.items || [])
      setMeta(data.meta || { total: 0, page, limit })
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData(1) // initial
    // eslint-disable-next-line
  }, [])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      fetchData(1, meta.limit, search)
    }, 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line
  }, [search])

  const onAdd = () => {
    setEditing(null)
    setForm({ code: '', name: '', theoryMax: '', theoryMinPass: '', iaMax: '', iaMinPass: '', credit: '', paperType: 'Elective' })
    setShow(true)
  }

  const onEdit = (row) => {
    setEditing(row)
    setForm({
      code: row.code || '', name: row.name || '', theoryMax: row.theoryMax ?? '', theoryMinPass: row.theoryMinPass ?? '',
      iaMax: row.iaMax ?? '', iaMinPass: row.iaMinPass ?? '', credit: row.credit ?? '', paperType: row.paperType || 'Elective'
    })
    setShow(true)
  }

  const onSave = async () => {
    const payload = {
      code: String(form.code || '').trim(), name: String(form.name || '').trim(),
      theoryMax: Number(form.theoryMax || 0), theoryMinPass: Number(form.theoryMinPass || 0),
      iaMax: Number(form.iaMax || 0), iaMinPass: Number(form.iaMinPass || 0), credit: Number(form.credit || 0),
      paperType: form.paperType
    }
    // simple validations
    if (!payload.code || !payload.name) return
    if (payload.theoryMinPass > payload.theoryMax) return
    if (payload.iaMinPass > payload.iaMax) return
    if (editing) await updateCourseworkPaper(editing._id, payload, token)
    else await createCourseworkPaper(payload, token)
    setShow(false)
    await fetchData()
  }

  const onDelete = async (row) => {
    if (!window.confirm('Delete this paper?')) return
    await deleteCourseworkPaper(row._id, token)
    await fetchData()
  }

  // Styles
  const page = { padding: 16 }
  const card = { background: '#f1f5f9', padding: 16, borderRadius: 8, marginTop: '6rem' }
  const header = { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
  const title = { fontSize: 18, fontWeight: 700, color: '#334155' }
  const button = { background: '#2563eb', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }

  const exportHeaders = ["", "Action", "Paper Code", "Paper Name", "Theory (MM)", "Theory (MPM)"]
  const tableRows = items.map((r, i) => [r.isActive ? '✔' : '', '', r.code, r.name, r.theoryMax, r.theoryMinPass])

  const copyToClipboard = async () => {
    const lines = [exportHeaders.join('\t'), ...tableRows.map(row => row.join('\t'))]
    await navigator.clipboard.writeText(lines.join('\n'))
  }
  const downloadCSV = () => {
    const rows = [exportHeaders, ...tableRows]
    const csv = rows.map(r => r.map(String).map(s => '"' + s.replace(/"/g, '""') + '"').join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'papers.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  const printTable = () => {
    const html = `
      <html><head><title>Papers</title>
      <style>table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#111827;color:#fff}</style>
      </head><body>
      <table><thead><tr>${exportHeaders.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>
      ${items.map(r => `<tr><td>${r.isActive ? '✔' : ''}</td><td></td><td>${r.code}</td><td>${r.name}</td><td>${r.theoryMax}</td><td>${r.theoryMinPass}</td></tr>`).join('')}
      </tbody></table>
      </body></html>`
    const w = window.open('', '_blank')
    if (w) {
      w.document.write(html)
      w.document.close()
      w.focus()
      w.print()
    }
  }

  return (
    <div style={page}>
      <div style={card}>
        <div style={header}>
          <div style={title}>CW Papers Management</div>
          <button style={button} onClick={onAdd}>Add New Paper</button>
        </div>
        <div style={{ height: 1, background: '#cbd5e1', marginTop: 8, marginBottom: 12 }} />
        {/* Toolbar + Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={copyToClipboard} style={{ background: '#64748b', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>Copy</button>
            <button onClick={downloadCSV} style={{ background: '#1f2937', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>CSV</button>
            <button onClick={printTable} style={{ background: '#374151', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>Print</button>
          </div>
          <div>
            <label style={{ color: '#475569', fontSize: 13, marginRight: 8 }}>Search:</label>
            <input value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: 8, border: '1px solid #cbd5e1', borderRadius: 6 }} />
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ color: '#475569' }}>Loading...</div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ background: '#1f2937', color: '#fff', padding: '10px', textAlign: 'left' }}>↑↓</th>
                  <th style={{ background: '#1f2937', color: '#fff', padding: '10px', textAlign: 'left' }}>Action ↑↓</th>
                  <th style={{ background: '#1f2937', color: '#fff', padding: '10px', textAlign: 'left' }}>Paper Code ↑↓</th>
                  <th style={{ background: '#1f2937', color: '#fff', padding: '10px', textAlign: 'left' }}>Paper Name ↑↓</th>
                  <th style={{ background: '#1f2937', color: '#fff', padding: '10px', textAlign: 'left' }}>Theory (MM) ↑↓</th>
                  <th style={{ background: '#1f2937', color: '#fff', padding: '10px', textAlign: 'left' }}>Theory (MPM) ↑↓</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: 12, color: '#475569' }}>No Record Found</td>
                  </tr>
                ) : (
                  items.map((row, idx) => (
                    <tr key={row._id} style={{ borderTop: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '10px' }}>
                        <input type="checkbox" checked={!!row.isActive} onChange={async () => { await toggleCourseworkPaper(row._id, token); await fetchData() }} />
                      </td>
                      <td style={{ padding: '10px' }}>
                        <button title="Edit" onClick={() => onEdit(row)} style={{ background: '#64748b', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', marginRight: 6 }}>✎</button>
                        <button title="Delete" onClick={() => onDelete(row)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>🗑</button>
                      </td>
                      <td style={{ padding: '10px' }}>{row.code}</td>
                      <td style={{ padding: '10px' }}>{row.name}</td>
                      <td style={{ padding: '10px' }}>{row.theoryMax}</td>
                      <td style={{ padding: '10px' }}>{row.theoryMinPass}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 10, borderTop: '1px solid #e5e7eb' }}>
              <div style={{ color: '#475569', fontSize: 12 }}>
                Showing {(items.length === 0) ? 0 : ((meta.page - 1) * meta.limit + 1)} to {(meta.page - 1) * meta.limit + items.length} of {meta.total} entries
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button disabled={meta.page <= 1} onClick={() => fetchData(meta.page - 1)} style={{ background: '#e5e7eb', padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', opacity: meta.page <= 1 ? 0.6 : 1 }}>Previous</button>
                <div style={{ background: '#2563eb', color: '#fff', padding: '6px 10px', borderRadius: 6 }}>{meta.page}</div>
                <button disabled={(meta.page * meta.limit) >= meta.total} onClick={() => fetchData(meta.page + 1)} style={{ background: '#e5e7eb', padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', opacity: (meta.page * meta.limit) >= meta.total ? 0.6 : 1 }}>Next</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {show && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
          onKeyDown={(e) => { if (e.key === 'Escape') setShow(false) }}
        >
          <div style={{ background: '#fff', width: 760, borderRadius: 8, padding: 16, boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: '#334155', fontSize: 16 }}>{editing ? 'Edit Paper' : 'Add New Paper'}</div>
              <div style={{ cursor: 'pointer', color: '#64748b', fontWeight: 700 }} onClick={() => setShow(false)}>×</div>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); onSave() }}
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}
            >
              <label style={{ display: 'grid', rowGap: 6 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>Paper Code</span>
                <input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder=""
                  required
                  style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </label>
              <label style={{ display: 'grid', rowGap: 6 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>Paper Name</span>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder=""
                  required
                  style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }}
                />
              </label>

              <label style={{ display: 'grid', rowGap: 6 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>Theory (Max. Marks)</span>
                <input type="number" value={form.theoryMax} placeholder="70" required min={0}
                  onChange={(e) => setForm({ ...form, theoryMax: e.target.value })}
                  style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }} />
              </label>
              <label style={{ display: 'grid', rowGap: 6 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>Theory (Min. Pass Marks)</span>
                <input type="number" value={form.theoryMinPass} placeholder="39" required min={0}
                  onChange={(e) => setForm({ ...form, theoryMinPass: e.target.value })}
                  style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }} />
              </label>

              <label style={{ display: 'grid', rowGap: 6 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>Internal Assessment (Max. Marks)</span>
                <input type="number" value={form.iaMax} placeholder="30" required min={0}
                  onChange={(e) => setForm({ ...form, iaMax: e.target.value })}
                  style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }} />
              </label>
              <label style={{ display: 'grid', rowGap: 6 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>Internal Assessment (Min. Pass Marks)</span>
                <input type="number" value={form.iaMinPass} placeholder="16" required min={0}
                  onChange={(e) => setForm({ ...form, iaMinPass: e.target.value })}
                  style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }} />
              </label>

              <label style={{ display: 'grid', rowGap: 6 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>Credit</span>
                <input type="number" value={form.credit} placeholder="4" required min={0}
                  onChange={(e) => setForm({ ...form, credit: e.target.value })}
                  style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }} />
              </label>
              <label style={{ display: 'grid', rowGap: 6 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>Paper Type</span>
                <select value={form.paperType} onChange={(e) => setForm({ ...form, paperType: e.target.value })}
                  style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none', background: '#fff' }}>
                  <option>Elective</option>
                  <option>Core</option>
                  <option>Compulsory</option>
                </select>
              </label>
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
                <button type="button" style={{ background: '#64748b', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }} onClick={() => setShow(false)}>Cancel</button>
                <button
                  type="submit"
                  disabled={!(form.code && form.name && form.theoryMax !== '' && form.theoryMinPass !== '' && form.iaMax !== '' && form.iaMinPass !== '' && form.credit !== '')}
                  style={{ background: '#2563eb', opacity: (form.code && form.name && form.theoryMax !== '' && form.theoryMinPass !== '' && form.iaMax !== '' && form.iaMinPass !== '' && form.credit !== '') ? 1 : 0.6, color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}
                >{editing ? 'Update' : 'Submit'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
