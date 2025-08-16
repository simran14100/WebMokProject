import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { toast } from "react-hot-toast"
import DashboardLayout from "../../../common/DashboardLayout"
import { createStudent as createStudentApi, getBatches } from "../../../../services/operations/adminApi"

const ED_TEAL = "#07A698"
const ED_TEAL_DARK = "#059a8c"
const TEXT_DARK = "#2d3748"
const TEXT_LIGHT = "#718096"
const BG_LIGHT = "#f8fafc"
const BORDER_COLOR = "#e2e8f0"

export default function CreateStudent() {
  const navigate = useNavigate()
  const token = useSelector((state) => state.auth.token)
  const user = useSelector((state) => state.profile.user)
  const isAdmin = user?.accountType === "Admin"

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    batchId: "",
    enrollmentFeePaid: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [batches, setBatches] = useState([])

  useEffect(() => {
    let mounted = true
    const loadBatches = async () => {
      try {
        const data = await getBatches({ token, page: 1, limit: 1000, search: "" })
        if (!mounted) return
        setBatches(Array.isArray(data?.items) ? data.items : [])
      } catch (e) {
        console.log("LOAD BATCHES ERROR............", e)
        toast.error("Failed to load batches")
      }
    }
    if (isAdmin && token) {
      loadBatches()
    }
    return () => { mounted = false }
  }, [isAdmin, token])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }))
  }

  const validate = () => {
    const { name, email, phone, batchId } = formData
    if (!name.trim() || !email.trim() || !phone.trim() || !batchId) {
      toast.error("Please fill all required fields")
      return false
    }
    const emailRegex = /[^@\s]+@[^@\s]+\.[^@\s]+/
    if (!emailRegex.test(email)) {
      toast.error("Enter a valid email")
      return false
    }
    const phoneDigits = phone.replace(/\D/g, "")
    if (phoneDigits.length < 8) {
      toast.error("Enter a valid phone number")
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isAdmin) return
    if (!validate()) return

    setSubmitting(true)
    try {
      // Generate a secure random password client-side (backend currently requires it)
      const rand = () => Math.random().toString(36).slice(-8)
      const password = `${rand()}${rand()}` // ~16 chars
      const phoneDigits = formData.phone.replace(/\D/g, "")
      const payload = { ...formData, phone: phoneDigits, password, confirmPassword: password }

      await createStudentApi(payload, token)
      setFormData({ name: "", email: "", phone: "", batchId: "", enrollmentFeePaid: false })
    } catch (_) {
      // errors are toasted in API
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <div style={{
        width: 'calc(100% - 250px)',
        marginLeft: '250px',
        minHeight: '100vh',
        backgroundColor: BG_LIGHT,
        padding: '2rem'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: TEXT_DARK, marginBottom: '0.5rem' }}>
            Create Student
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: TEXT_LIGHT }}>
            <span>Students</span>
            <span style={{ color: BORDER_COLOR }}>/</span>
            <span style={{ color: ED_TEAL, fontWeight: 500 }}>Create Student</span>
          </div>
        </div>

        {!isAdmin ? (
          <div style={{
            width: '100%',
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${BORDER_COLOR}`
          }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#e53e3e', marginBottom: '0.5rem' }}>
              Unauthorized
            </h1>
            <p style={{ color: TEXT_LIGHT }}>Only Admin can create students.</p>
          </div>
        ) : (
          <div style={{
            width: '100%',
            maxWidth: '800px',
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${BORDER_COLOR}`
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: TEXT_DARK, marginBottom: '1.5rem' }}>
              New Student Details
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', maxWidth: '700px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: TEXT_DARK, marginBottom: '0.5rem' }}>Full Name</label>
                <input name="name" type="text" value={formData.name} onChange={handleChange} placeholder="Enter full name" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Email</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Enter email" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Phone</label>
                <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="Enter phone" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Batch</label>
                <select name="batchId" value={formData.batchId} onChange={handleChange} style={inputStyle}>
                  <option value="">Select batch...</option>
                  {batches.map((b) => (
                    <option key={b._id} value={b._id}>{`${b.name} (${b.department})`}</option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <input id="enrollmentFeePaid" name="enrollmentFeePaid" type="checkbox" checked={formData.enrollmentFeePaid} onChange={handleChange} />
                <label htmlFor="enrollmentFeePaid" style={{ color: TEXT_DARK }}>Enrollment fee paid</label>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <button type="submit" disabled={submitting} style={buttonStyle(submitting)}>
                  {submitting ? 'Creating...' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 500,
  color: TEXT_DARK,
  marginBottom: '0.5rem',
}

const inputStyle = {
  width: '100%',
  padding: '0.625rem',
  borderRadius: '0.375rem',
  border: `1px solid ${BORDER_COLOR}`,
  outline: 'none',
  transition: 'all 0.2s',
  fontSize: '0.875rem',
  color: TEXT_DARK,
  backgroundColor: 'white',
}

const buttonStyle = (disabled) => ({
  width: 'fit-content',
  padding: '0.625rem 1rem',
  borderRadius: '0.375rem',
  border: 'none',
  backgroundColor: disabled ? '#7fd6ce' : ED_TEAL,
  color: 'white',
  fontWeight: 500,
  fontSize: '0.875rem',
  cursor: disabled ? 'not-allowed' : 'pointer',
  transition: 'all 0.2s',
})
