import React, { useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux"
import { bulkUploadStudents, downloadStudentsTemplate, getBatches } from "../../../../services/operations/adminApi"

export default function BulkUploadStudents() {
  const { token } = useSelector((state) => state.auth)
  const [batches, setBatches] = useState([])
  const [batchId, setBatchId] = useState("")
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const canSubmit = useMemo(() => Boolean(batchId && file), [batchId, file])

  useEffect(() => {
    async function fetchBatches() {
      try {
        const data = await getBatches({ token, page: 1, limit: 100 })
        const list = Array.isArray(data?.batches) ? data.batches : (Array.isArray(data) ? data : [])
        setBatches(list)
      } catch (_) {}
    }
    if (token) fetchBatches()
  }, [token])

  const onDownloadTemplate = async () => {
    try {
      const blob = await downloadStudentsTemplate(token)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "students_template.csv"
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (_) {}
  }

  const onFileChange = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const allowed = ["text/csv", "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]
    if (!allowed.includes(f.type) && !f.name.toLowerCase().endsWith(".csv") && !f.name.toLowerCase().endsWith(".xlsx")) {
      alert("Please select a CSV or XLSX file")
      return
    }
    setFile(f)
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    try {
      const result = await bulkUploadStudents({ batchId, file }, token)
      // Simple feedback
      alert(`Created: ${result.created} | Skipped: ${result.skipped}\nErrors: ${result.errors?.length || 0}`)
      setFile(null)
      // reset file input
      const input = document.getElementById("bulk-file-input")
      if (input) input.value = ""
    } catch (_) {
      // errors already toasted
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Bulk Upload Students</h1>
      <p className="text-sm text-gray-600 mb-6">
        Upload a CSV or XLSX file to create students in bulk and assign them to a selected batch. Existing emails will be added to the batch and skipped from creation.
      </p>

      <div className="mb-6">
        <button onClick={onDownloadTemplate} className="px-4 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">
          Download CSV Template
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">Select Batch</label>
          <select
            className="w-full border rounded-md px-3 py-2"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
          >
            <option value="" disabled>{batches?.length ? "Select a batch" : "No batches found"}</option>
            {batches?.length ? (
              batches.map((b) => {
                const label = b.name || b.title || b.batchName || b._id
                return (
                  <option key={b._id} value={b._id}>
                    {label}
                  </option>
                )
              })
            ) : null}
          </select>
          {!batches?.length && (
            <p className="text-xs text-gray-600 mt-2">
              You have no batches yet. Create one from Admin → Batches → Create.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Upload File (CSV or XLSX)</label>
          <input
            id="bulk-file-input"
            type="file"
            accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="w-full"
            onChange={onFileChange}
          />
          {file && (
            <p className="text-xs text-gray-600 mt-2">Selected: {file.name}</p>
          )}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={!canSubmit || loading}
            className={`px-4 py-2 rounded-md text-white ${canSubmit ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-400 cursor-not-allowed"}`}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </form>
    </div>
  )
}
