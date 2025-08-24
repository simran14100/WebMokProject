import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  listCourseworkResults,
  createCourseworkResult,
  updateCourseworkResult,
  deleteCourseworkResult,
  toggleCourseworkResult,
} from '../../../services/operations/adminApi'

export default function CourseworkResults() {
  const token = useSelector((s) => s.auth?.token)
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10 })
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [show, setShow] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    studentId: '',
    studentName: '',
    paperCode: '',
    paperName: '',
    theoryObt: '',
    iaObt: '',
    passMarks: '',
    total: 0,
    result: 'Pending',
    grade: '',
    remarks: '',
    isActive: true,
  })

  const calc = (f) => {
    const theory = Number(f.theoryObt || 0)
    const ia = Number(f.iaObt || 0)
    const total = theory + ia
    const passMarks = Number(f.passMarks || 0)
    const result = (passMarks > 0) ? (total >= passMarks ? 'Pass' : 'Fail') : 'Pending'
    let grade = ''
    if (result === 'Pass') {
      if (total >= 90) grade = 'A+'
      else if (total >= 80) grade = 'A'
      else if (total >= 70) grade = 'B+'
      else if (total >= 60) grade = 'B'
      else if (total >= 50) grade = 'C'
      else grade = 'D'
    } else if (result === 'Fail') {
      grade = 'F'
    }
    return { ...f, total, result, grade }
  }

  const fetchData = async (page = 1, limit = meta.limit, s = search) => {
    setLoading(true)
    try {
      const data = await listCourseworkResults({ page, limit, search: s }, token)
      setItems(data.items || [])
      setMeta(data.meta || { total: 0, page, limit })
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchData(1) // initial
    // eslint-disable-next-line
  }, [])
  useEffect(() => { const t = setTimeout(() => fetchData(1, meta.limit, search), 400); return () => clearTimeout(t) }, [search])

  const onAdd = () => { setEditing(null); setForm({ studentId: '', studentName: '', paperCode: '', paperName: '', theoryObt: '', iaObt: '', passMarks: '', total: 0, result: 'Pending', grade: '', remarks: '', isActive: true }); setShow(true) }
  const onEdit = (row) => { setEditing(row); setForm({ studentId: row.studentId||'', studentName: row.studentName||'', paperCode: row.paperCode||'', paperName: row.paperName||'', theoryObt: row.theoryObt??'', iaObt: row.iaObt??'', passMarks: row.passMarks??'', total: row.total||0, result: row.result||'Pending', grade: row.grade||'', remarks: row.remarks||'', isActive: !!row.isActive }); setShow(true) }
  const onDelete = async (row) => { if (!window.confirm('Delete this result?')) return; await deleteCourseworkResult(row._id, token); await fetchData(meta.page) }
  const onToggleActive = async (row) => { await toggleCourseworkResult(row._id, token); await fetchData(meta.page) }

  const onSave = async () => {
    if (!form.studentId || !form.studentName || !form.paperCode || !form.paperName) return
    const computed = calc(form)
    const payload = {
      studentId: String(computed.studentId || '').trim(),
      studentName: String(computed.studentName || '').trim(),
      paperCode: String(computed.paperCode || '').trim(),
      paperName: String(computed.paperName || '').trim(),
      theoryObt: Number(computed.theoryObt || 0),
      iaObt: Number(computed.iaObt || 0),
      passMarks: Number(computed.passMarks || 0),
      remarks: String(computed.remarks || ''),
      isActive: !!computed.isActive,
    }
    if (editing?._id) await updateCourseworkResult(editing._id, payload, token)
    else await createCourseworkResult(payload, token)
    setShow(false)
    await fetchData()
  }

  // Styles
  const page = { padding: 16, marginTop: '10rem' }
  const card = { background: '#f1f5f9', padding: 16, borderRadius: 8 }
  const header = { display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
  const title = { fontSize: 18, fontWeight: 700, color: '#334155' }
  const button = { background: '#2563eb', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }

  const exportHeaders = ["", "Action", "Student ID", "Student Name", "Paper Code", "Paper Name", "Theory", "IA", "Total", "Result", "Grade"]
  const fetchAllForExport = async () => {
    const data = await listCourseworkResults({ page: 1, limit: meta.total || 1000, search }, token)
    return Array.isArray(data.items) ? data.items : []
  }
  const copyToClipboard = async () => {
    const all = await fetchAllForExport()
    const rows = all.map(r => [r.isActive?'✔':'', '', r.studentId, r.studentName, r.paperCode, r.paperName, r.theoryObt, r.iaObt, r.total, r.result, r.grade])
    const lines = [exportHeaders.join('\t'), ...rows.map(r => r.join('\t'))].join('\n')
    try { await navigator.clipboard.writeText(lines) } catch {
      const ta = document.createElement('textarea'); ta.value = lines; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta)
    }
  }
  const downloadCSV = async () => {
    const all = await fetchAllForExport()
    const rows = [exportHeaders, ...all.map(r => [r.isActive?'✔':'', '', r.studentId, r.studentName, r.paperCode, r.paperName, r.theoryObt, r.iaObt, r.total, r.result, r.grade])]
    const csv = rows.map(r => r.map(String).map(s => '"' + s.replace(/"/g, '""') + '"').join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'results.csv'; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
  }
  const printTable = async () => {
    const all = await fetchAllForExport()
    const html = `
      <html><head><title>Results</title>
      <style>body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial}table{border-collapse:collapse;width:100%}th,td{border:1px solid #ccc;padding:8px;text-align:left}th{background:#111827;color:#fff}</style>
      </head><body>
      <table><thead><tr>${exportHeaders.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>
      ${all.map(r => `<tr><td>${r.isActive?'✔':''}</td><td></td><td>${r.studentId}</td><td>${r.studentName}</td><td>${r.paperCode}</td><td>${r.paperName}</td><td>${r.theoryObt}</td><td>${r.iaObt}</td><td>${r.total}</td><td>${r.result}</td><td>${r.grade}</td></tr>`).join('')}
      </tbody></table>
      </body></html>`
    const w = window.open('', '_blank'); if (w) { w.document.write(html); w.document.close(); w.focus(); w.print() }
  }

  return (
    <div style={page}>
      <div style={card}>
        <div style={header}>
          <div style={title}>Coursework Exam Results</div>
          <button style={button} onClick={onAdd}>Add Result</button>
        </div>
        <div style={{ height: 1, background: '#cbd5e1', marginTop: 8, marginBottom: 12 }} />

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

        {loading ? (
          <div style={{ color: '#475569' }}>Loading...</div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ background: '#1f2937', color: '#fff', padding: '10px', textAlign: 'left' }}>↑↓</th>
                  <th style={{ background: '#1f2937', color: '#fff', padding: '10px', textAlign: 'left' }}>Action ↑↓</th>
                  <th style={{ background: '#1f2937', color: '#fff', padding: '10px', textAlign: 'left' }}>Student ID ↑↓</th>
                  <th style={{ background: '#1f2937', color: '#fff', padding: '10px', textAlign: 'left' }}>Student Name ↑↓</th>
                  <th style={{ background: '#1f2937', color: '#fff', padding: '10px', textAlign: 'left' }}>Paper Code ↑↓</th>
                  <th style={{ background: '#1f2937', color: '#fff', padding: '10px', textAlign: 'left' }}>Paper Name ↑↓</th>
                  <th style={{ background: '#1f2937', color: '#fff', padding: '10px', textAlign: 'left' }}>Theory ↑↓</th>
                  <th style={{ background: '#1f2937', color: '#fff', padding: '10px', textAlign: 'left' }}>IA ↑↓</th>
                  <th style={{ background: '#1f2937', color: '#fff', padding: '10px', textAlign: 'left' }}>Total ↑↓</th>
                  <th style={{ background: '#1f2937', color: '#fff', padding: '10px', textAlign: 'left' }}>Result ↑↓</th>
                  <th style={{ background: '#1f2937', color: '#fff', padding: '10px', textAlign: 'left' }}>Grade ↑↓</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr><td colSpan={11} style={{ padding: 12, color: '#475569' }}>No Record Found</td></tr>
                ) : (
                  items.map((row) => (
                    <tr key={row._id} style={{ borderTop: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '10px' }}>
                        <input type="checkbox" checked={!!row.isActive} onChange={() => onToggleActive(row)} />
                      </td>
                      <td style={{ padding: '10px' }}>
                        <button title="Edit" onClick={() => onEdit(row)} style={{ background: '#64748b', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', marginRight: 6 }}>✎</button>
                        <button title="Delete" onClick={() => onDelete(row)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer' }}>🗑</button>
                      </td>
                      <td style={{ padding: '10px' }}>{row.studentId}</td>
                      <td style={{ padding: '10px' }}>{row.studentName}</td>
                      <td style={{ padding: '10px' }}>{row.paperCode}</td>
                      <td style={{ padding: '10px' }}>{row.paperName}</td>
                      <td style={{ padding: '10px' }}>{row.theoryObt}</td>
                      <td style={{ padding: '10px' }}>{row.iaObt}</td>
                      <td style={{ padding: '10px' }}>{row.total}</td>
                      <td style={{ padding: '10px' }}>{row.result}</td>
                      <td style={{ padding: '10px' }}>{row.grade}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, marginTop:"9rem", marginLeft:"200px", overflowY: 'auto', padding: '24px 16px' }} onKeyDown={(e) => { if (e.key === 'Escape') setShow(false) }}>
          <div style={{ background: '#fff', width: 820, borderRadius: 8, padding: 16, boxShadow: '0 10px 25px rgba(0,0,0,0.15)', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 700, color: '#334155', fontSize: 16 }}>{editing ? 'Edit Result' : 'Add Result'}</div>
              <div style={{ cursor: 'pointer', color: '#64748b', fontWeight: 700 }} onClick={() => setShow(false)}>×</div>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); onSave() }} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <label style={{ display: 'grid', rowGap: 6 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>Student ID</span>
                <input value={form.studentId} onChange={(e) => setForm(calc({ ...form, studentId: e.target.value }))} required style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }} />
              </label>
              <label style={{ display: 'grid', rowGap: 6 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>Student Name</span>
                <input value={form.studentName} onChange={(e) => setForm(calc({ ...form, studentName: e.target.value }))} required style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }} />
              </label>
              <label style={{ display: 'grid', rowGap: 6 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>Paper Code</span>
                <input value={form.paperCode} onChange={(e) => setForm(calc({ ...form, paperCode: e.target.value }))} required style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }} />
              </label>
              <label style={{ display: 'grid', rowGap: 6 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>Paper Name</span>
                <input value={form.paperName} onChange={(e) => setForm(calc({ ...form, paperName: e.target.value }))} required style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }} />
              </label>
              <label style={{ display: 'grid', rowGap: 6 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>Theory Marks Obtained</span>
                <input type="number" min={0} value={form.theoryObt} onChange={(e) => setForm(calc({ ...form, theoryObt: e.target.value }))} required style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }} />
              </label>
              <label style={{ display: 'grid', rowGap: 6 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>Internal Assessment (IA) Obtained</span>
                <input type="number" min={0} value={form.iaObt} onChange={(e) => setForm(calc({ ...form, iaObt: e.target.value }))} required style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }} />
              </label>
              <label style={{ display: 'grid', rowGap: 6 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>Pass Marks (Total)</span>
                <input type="number" min={0} value={form.passMarks} placeholder="e.g., 50" onChange={(e) => setForm(calc({ ...form, passMarks: e.target.value }))} style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }} />
              </label>
              <label style={{ display: 'grid', rowGap: 6 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>Total</span>
                <input value={form.total} readOnly style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155' }} />
              </label>
              <label style={{ display: 'grid', rowGap: 6 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>Result</span>
                <input value={form.result} readOnly style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc', color: form.result === 'Pass' ? '#059669' : form.result === 'Fail' ? '#dc2626' : '#334155' }} />
              </label>
              <label style={{ display: 'grid', rowGap: 6 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>Grade</span>
                <input value={form.grade} readOnly style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', background: '#f8fafc', color: '#334155' }} />
              </label>
              <label style={{ gridColumn: '1 / -1', display: 'grid', rowGap: 6 }}>
                <span style={{ color: '#475569', fontSize: 13 }}>Remarks</span>
                <input value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} placeholder="Any notes for this result" style={{ padding: 10, borderRadius: 6, border: '1px solid #cbd5e1', outline: 'none' }} />
              </label>
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#475569' }}>
                  <input type="checkbox" checked={!!form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> Active
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => setShow(false)} style={{ background: '#64748b', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" disabled={!(form.studentId && form.studentName && form.paperCode && form.paperName)} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', opacity: (form.studentId && form.studentName && form.paperCode && form.paperName) ? 1 : 0.6 }}>{editing ? 'Update' : 'Submit'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
