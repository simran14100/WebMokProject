import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Sidebar from '../components/common/Sidebar';
import { fetchEnrolledStudents } from "../services/operations/enrollmentApi";
import { jwtDecode } from "jwt-decode";

const TAWKTO_GREEN = "#009e5c";
const TAWKTO_GREEN_DARK = "#007a44";
const LIGHT_BG = "#fff";
const BORDER = "#e0e0e0";
const TEXT_DARK = "#222";

const AdminDashboard = () => {
  const { token } = useSelector((state) => state.auth);
  // Debug log: show token and decoded user info
  console.log("AdminDashboard token:", token);
  if (token) {
    try {
      const decoded = jwtDecode(token);
      console.log("Logged in user:", decoded.email, "| Role:", decoded.accountType);
    } catch (e) {
      console.log("Could not decode token");
    }
  }
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getStudents() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchEnrolledStudents(token);
        console.log("Fetched enrolled students data:", data);
        console.log("enrolledStudents array:", data.data?.enrolledStudents);
        setStudents(data.data?.enrolledStudents || []);
      } catch (err) {
        setError("Failed to fetch enrolled students");
      }
      setLoading(false);
    }
    getStudents();
  }, [token]);

  return (
    <div style={{ background: LIGHT_BG, minHeight: "100vh", display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '2rem 0' }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <h1 style={{ fontSize: 36, fontWeight: 700, color: TEXT_DARK, marginBottom: 12 }}>
              Admin Dashboard
            </h1>
            <p style={{ fontSize: 18, color: TEXT_DARK }}>
              Manage users, courses, and platform settings.
            </p>
          </div>
          <div style={{ background: LIGHT_BG, borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.04)", padding: 32, marginBottom: 32, border: `1px solid ${BORDER}` }}>
            <h2 style={{ fontSize: 24, fontWeight: 600, color: TAWKTO_GREEN, marginBottom: 24 }}>Enrolled Students</h2>
            {/* Total Enrolled Students Summary */}
            <div style={{ marginBottom: 18, fontWeight: 700, color: TAWKTO_GREEN, fontSize: 20 }}>
              Total Enrolled: {students.length}
            </div>
            {loading ? (
              <p style={{ color: TAWKTO_GREEN, fontWeight: 500 }}>Loading...</p>
            ) : error ? (
              <p style={{ color: "#e53935", fontWeight: 500 }}>{error}</p>
            ) : students.length === 0 ? (
              <p style={{ color: TEXT_DARK }}>No enrolled students found.</p>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", background: LIGHT_BG }}>
                  <thead>
                    <tr style={{ background: TAWKTO_GREEN + "10" }}>
                      <th style={{ padding: "12px 16px", textAlign: "left", color: TAWKTO_GREEN, fontWeight: 700, fontSize: 16, borderBottom: `2px solid ${TAWKTO_GREEN}` }}>Name</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", color: TAWKTO_GREEN, fontWeight: 700, fontSize: 16, borderBottom: `2px solid ${TAWKTO_GREEN}` }}>Email</th>
                      <th style={{ padding: "12px 16px", textAlign: "left", color: TAWKTO_GREEN, fontWeight: 700, fontSize: 16, borderBottom: `2px solid ${TAWKTO_GREEN}` }}>Payment Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, idx) => (
                      <tr key={s._id} style={{ background: idx % 2 === 0 ? "#f9fefb" : LIGHT_BG }}>
                        <td style={{ padding: "12px 16px", color: TEXT_DARK, borderBottom: `1px solid ${BORDER}` }}>{s.firstName} {s.lastName}</td>
                        <td style={{ padding: "12px 16px", color: TEXT_DARK, borderBottom: `1px solid ${BORDER}` }}>{s.email}</td>
                        <td style={{ padding: "12px 16px", color: TEXT_DARK, borderBottom: `1px solid ${BORDER}` }}>{s.paymentDetails?.paidAt ? new Date(s.paymentDetails.paidAt).toLocaleString() : "N/A"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 