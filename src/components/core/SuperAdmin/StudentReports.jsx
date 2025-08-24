import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { listCourseworkResults } from '../../../services/operations/adminApi'

export default function StudentReports() {
  const token = useSelector((s) => s.auth?.token)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10 })

  const activeStudent = useMemo(() => {
    if (!items.length) return null
    // Derive a canonical student from first row
    const s = items[0]
    return { id: s.studentId, name: s.studentName }
  }, [items])

  const stats = useMemo(() => {
    const total = items.length
    const pass = items.filter(r => r.result === 'Pass').length
    const fail = items.filter(r => r.result === 'Fail').length
    const pending = items.filter(r => r.result === 'Pending').length
    const avg = total ? Math.round(items.reduce((a, b) => a + (Number(b.total) || 0), 0) / total) : 0
    const grades = items.reduce((acc, r) => { const g = r.grade || 'NA'; acc[g] = (acc[g] || 0) + 1; return acc }, {})
    return { total, pass, fail, pending, avg, grades }
  }, [items])

  const fetchData = async (page = 1, limit = meta.limit) => {
    if (!query.trim()) { setItems([]); setMeta({ total: 0, page: 1, limit }); return }
    setLoading(true)
    try {
      // Use backend filtering by search (studentId or studentName)
      const data = await listCourseworkResults({ page, limit, search: query.trim() }, token)
      setItems(data.items || [])
      setMeta(data.meta || { total: 0, page, limit }) 
    } finally { setLoading(false) }
  }

  useEffect(() => { const t = setTimeout(() => fetchData(1), 400); return () => clearTimeout(t) }, [query])

  const exportHeaders = ["Paper Code", "Paper Name", "Theory", "IA", "Total", "Result", "Grade", "Active"]

  const copyToClipboard = async () => {
    const rows = items.map(r => [r.paperCode, r.paperName, r.theoryObt, r.iaObt, r.total, r.result, r.grade, r.isActive ? 'Yes' : 'No'])
    const lines = [exportHeaders.join('\t'), ...rows.map(r => r.join('\t'))].join('\n')
    try { await navigator.clipboard.writeText(lines) } catch {
      const ta = document.createElement('textarea'); ta.value = lines; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta)
    }
  }

  const downloadCSV = () => {
    const rows = [exportHeaders, ...items.map(r => [r.paperCode, r.paperName, r.theoryObt, r.iaObt, r.total, r.result, r.grade, r.isActive ? 'Yes' : 'No'])]
    const csv = rows.map(r => r.map(String).map(s => '"' + s.replace(/"/g, '""') + '"').join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${activeStudent?.id || 'student'}-report.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
  }

  const printReport = () => {
    const head = `Student Report${activeStudent ? ` - ${activeStudent.name} (${activeStudent.id})` : ''}`
    const table = items.map(r => `<tr><td>${r.paperCode}</td><td>${r.paperName}</td><td>${r.theoryObt}</td><td>${r.iaObt}</td><td>${r.total}</td><td>${r.result}</td><td>${r.grade}</td><td>${r.isActive?'Yes':'No'}</td></tr>`).join('')
    const html = `
    <html><head><title>${head}</title>
    <style>body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#111827;color:#fff}</style>
    </head><body>
    <h2>${head}</h2>
    <p>Total Papers: ${stats.total} | Pass: ${stats.pass} | Fail: ${stats.fail} | Pending: ${stats.pending} | Avg Total: ${stats.avg}</p>
    <table><thead><tr>${exportHeaders.map(h => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${table}</tbody></table>
    </body></html>`
    const w = window.open('', '_blank'); if (w) { w.document.write(html); w.document.close(); w.focus(); w.print() }
  }

  // Styles
  const page = { padding: 16, marginTop: '10rem' }
  const card = { background: '#f1f5f9', padding: 16, borderRadius: 8 }
  const title = { fontSize: 18, fontWeight: 700, color: '#334155' }
  const button = { background: '#2563eb', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }

  return (
    <div style={page}>
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={title}>Student Report</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={copyToClipboard} style={{ ...button, background: '#0ea5e9' }}>Copy</button>
            <button onClick={downloadCSV} style={{ ...button, background: '#22c55e' }}>CSV</button>
            <button onClick={printReport} style={{ ...button, background: '#111827' }}>Print</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 10, marginBottom: 12 }}>
          <input
            placeholder="Search by Student ID or Name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ padding: 10, borderRadius: 8, border: '1px solid #cbd5e1', outline: 'none' }}
          />
          <button disabled={!query.trim()} onClick={() => fetchData(1)} style={button}>Search</button>
        </div>

        {/* Summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 10, marginBottom: 12 }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: 12, border: '1px solid #e5e7eb' }}>
            <div style={{ color: '#64748b', fontSize: 12 }}>Total Papers</div>
            <div style={{ fontWeight: 700, color: '#334155', fontSize: 22 }}>{stats.total}</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 8, padding: 12, border: '1px solid #e5e7eb' }}>
            <div style={{ color: '#64748b', fontSize: 12 }}>Pass</div>
            <div style={{ fontWeight: 700, color: '#059669', fontSize: 22 }}>{stats.pass}</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 8, padding: 12, border: '1px solid #e5e7eb' }}>
            <div style={{ color: '#64748b', fontSize: 12 }}>Fail</div>
            <div style={{ fontWeight: 700, color: '#dc2626', fontSize: 22 }}>{stats.fail}</div>
          </div>
          <div style={{ background: '#fff', borderRadius: 8, padding: 12, border: '1px solid #e5e7eb' }}>
            <div style={{ color: '#64748b', fontSize: 12 }}>Pending</div>
            <div style={{ fontWeight: 700, color: '#eab308', fontSize: 22 }}>{stats.pending}</div>
          </div>
        </div>

        {/* Results table */}
        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#111827', color: '#fff' }}>
                <th style={{ textAlign: 'left', padding: 10 }}>Paper Code</th>
                <th style={{ textAlign: 'left', padding: 10 }}>Paper Name</th>
                <th style={{ textAlign: 'left', padding: 10 }}>Theory</th>
                <th style={{ textAlign: 'left', padding: 10 }}>IA</th>
                <th style={{ textAlign: 'left', padding: 10 }}>Total</th>
                <th style={{ textAlign: 'left', padding: 10 }}>Result</th>
                <th style={{ textAlign: 'left', padding: 10 }}>Grade</th>
                <th style={{ textAlign: 'left', padding: 10 }}>Active</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} style={{ padding: 12, textAlign: 'center', color: '#64748b' }}>Loading...</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={8} style={{ padding: 12, textAlign: 'center', color: '#64748b' }}>No records</td></tr>
              )}
              {!loading && items.map((r) => (
                <tr key={r._id}>
                  <td style={{ padding: 10, borderTop: '1px solid #e5e7eb' }}>{r.paperCode}</td>
                  <td style={{ padding: 10, borderTop: '1px solid #e5e7eb' }}>{r.paperName}</td>
                  <td style={{ padding: 10, borderTop: '1px solid #e5e7eb' }}>{r.theoryObt}</td>
                  <td style={{ padding: 10, borderTop: '1px solid #e5e7eb' }}>{r.iaObt}</td>
                  <td style={{ padding: 10, borderTop: '1px solid #e5e7eb' }}>{r.total}</td>
                  <td style={{ padding: 10, borderTop: '1px solid #e5e7eb', color: r.result === 'Pass' ? '#059669' : r.result === 'Fail' ? '#dc2626' : '#334155' }}>{r.result}</td>
                  <td style={{ padding: 10, borderTop: '1px solid #e5e7eb' }}>{r.grade}</td>
                  <td style={{ padding: 10, borderTop: '1px solid #e5e7eb' }}>{r.isActive ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
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
      </div>
    </div>
  )
}
