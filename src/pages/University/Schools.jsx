import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiConnector } from "../../services/apiConnector";
import { listDepartments } from "../../services/departmentApi";
import { showError, showLoading, dismissToast } from "../../utils/toast";

// Color palette inspired by the provided image
const COLORS = {
  navy: "#0E3A5D",
  blue: "#1F7AAF",
  teal: "#07A698",
  sky: "#E6F7F5",
  white: "#FFFFFF",
  text: "#122B49",
  subtext: "#526581",
  border: "#E6EEF5",
  badge: "#0D6EFD",
};

export default function Schools() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Departments state
  const [departments, setDepartments] = useState([]);
  const [depLoading, setDepLoading] = useState(false);

  useEffect(() => {
    const fetchSchools = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiConnector("GET", "/api/v1/ugpg/schools");
        const list = Array.isArray(res?.data?.data) ? res.data.data : [];
        setSchools(list);
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Failed to load schools");
      } finally {
        setLoading(false);
      }
    };
    fetchSchools();
  }, []);

  // Load departments on mount
  useEffect(() => {
    const load = async () => {
      let tId;
      try {
        setDepLoading(true);
        tId = showLoading('Loading departments...');
        const res = await listDepartments();
        const items = (res?.data?.data || []).map((d) => ({
          id: d._id,
          name: d.name,
          status: d.status || 'Active',
        }));
        setDepartments(items);
      } catch (e) {
        showError(e?.response?.data?.message || 'Failed to load departments');
      } finally {
        if (tId) dismissToast(tId);
        setDepLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div style={{ backgroundColor: COLORS.white, minHeight: "100vh" }}>
      {/* Hero Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.blue} 55%, ${COLORS.teal} 100%)`,
          color: COLORS.white,
          padding: "90px 20px 60px",
          marginTop:"8rem"
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ opacity: 0.95 }}>
            <div
              style={{
                display: "inline-block",
                backgroundColor: "rgba(255,255,255,0.12)",
                color: COLORS.white,
                padding: "6px 12px",
                borderRadius: 999,
                fontWeight: 600,
                letterSpacing: 0.5,
                fontSize: 12,
                textTransform: "uppercase",
              }}
            >
              University
            </div>
            <h1
              style={{
                margin: "14px 0 8px",
                fontSize: 36,
                lineHeight: 1.2,
                fontWeight: 800,
              }}
            >
              Programs  Offered
            </h1>
            <p style={{ margin: 0, maxWidth: 680, color: "#E7F1FA", fontSize: 15 }}>
              Explore our undergraduate and postgraduate schools. Discover programs, learning
              paths, and opportunities designed to prepare you for the future.
            </p>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px 60px" }}>
        {/* Breadcrumbs */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.subtext, fontSize: 14 }}>
          <Link to="/" style={{ color: COLORS.blue, textDecoration: "none", fontWeight: 600 }}>
            Home
          </Link>
          <span style={{ opacity: 0.6 }}>/</span>
          <span style={{ color: COLORS.text, fontWeight: 600 }}>University</span>
          <span style={{ opacity: 0.6 }}>/</span>
          <span>Programs Offered</span>
        </div>

        <h2 style={{ marginTop: "3rem", fontSize: 20, fontWeight: 800, color: COLORS.navy }}>UG / PG Departments</h2>

        {/* Grid of school cards */}
        {error && (
          <div style={{ marginTop: 16, color: "#b91c1c", background: "#fee2e2", border: "1px solid #fecaca", padding: 12, borderRadius: 12 }}>{error}</div>
        )}
        {loading ? (
          <div style={{ display: "grid", placeItems: "center", padding: 40 }}>
            <div style={{ width: 36, height: 36, border: "3px solid #e6eef5", borderTopColor: COLORS.teal, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          </div>
        ) : (
          <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: 20,
              marginTop: 24,
            }}
          >
          {schools.map((s, idx) => {
            const color = idx % 2 === 0 ? COLORS.blue : COLORS.teal;
            const level = "UG/PG";
            const shortcode = s?.shortcode || "";
            const status = s?.status || "Active";
            const name = s?.name || "School";
            const key = s?._id || `${name}-${idx}`;
            return (
            <div
              key={key}
              style={{
                background: COLORS.white,
                borderRadius: 16,
                border: `1px solid ${COLORS.border}`,
                boxShadow: "0 10px 30px rgba(16, 42, 67, 0.06)",
                overflow: "hidden",
                transition: "transform .25s ease, box-shadow .25s ease",
                minHeight: 280,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(16, 42, 67, 0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 10px 30px rgba(16, 42, 67, 0.06)";
              }}
            >
              {/* Accent header */}
              <div
                style={{
                  height: 6,
                  background: `linear-gradient(90deg, ${color}, ${COLORS.teal})`,
                }}
              />

              {/* Body */}
              <div style={{ padding: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: COLORS.sky,
                      display: "grid",
                      placeItems: "center",
                      color: color,
                      fontSize: 22,
                      fontWeight: 700,
                    }}
                  >
                    {idx % 2 === 0 ? "🎓" : "🏛️"}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 18, color: COLORS.text, fontWeight: 800 }}>{name}</h3>
                    <div
                      style={{
                        display: "inline-block",
                        marginTop: 6,
                        backgroundColor: "#F0F7FF",
                        color: COLORS.badge,
                        borderRadius: 999,
                        padding: "2px 10px",
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: 0.5,
                      }}
                    >
                      {level}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                  <div style={{ flex: 1, background: "#F8FBFE", border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: COLORS.subtext }}>Shortcode</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: COLORS.text }}>{shortcode || "—"}</div>
                  </div>
                  <div style={{ flex: 1, background: "#F8FBFE", border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: "10px 12px", textAlign: "center" }}>
                    <div style={{ fontSize: 12, color: COLORS.subtext }}>Status</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: status === "Active" ? COLORS.teal : COLORS.text }}>{status}</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10  }}>
                  <Link
                    to={`/university/schools/${key}`}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      textDecoration: "none",
                      background: color,
                      color: COLORS.white,
                      padding: "10px 12px",
                      borderRadius: 12,
                      fontWeight: 700,
                      letterSpacing: 0.3,
                      boxShadow: "0 6px 14px rgba(7, 166, 152, 0.18)",
                      transition: "filter .2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.05)")}
                    onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
                  >
                    View Details
                  </Link>
                  {/* <button
                    type="button"
                    style={{
                      flex: 1,
                      background: COLORS.white,
                      color: color,
                      border: `1px solid ${COLORS.border}`,
                      padding: "10px 12px",
                      borderRadius: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all .2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = COLORS.sky;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = COLORS.white;
                    }}
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  >
                    Enquire Now
                  </button> */}
                </div>
              </div>
            </div>
          );})}
          </div>
          {/* Departments Section */}
          {/* <div style={{ marginTop: 36 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: COLORS.navy }}>PHD Departments</h2>
              {depLoading && (
                <span style={{ fontSize: 13, color: COLORS.subtext }}>Loading…</span>
              )}
            </div>

            {departments.length === 0 && !depLoading ? (
              <div style={{
                background: '#F8FBFE',
                border: `1px solid ${COLORS.border}`,
                color: COLORS.subtext,
                borderRadius: 12,
                padding: 16,
                textAlign: 'center'
              }}>
                No departments found
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 16
              }}>
                {departments.map((d) => (
                  <div key={d.id} style={{
                    background: COLORS.white,
                    border: `1px solid ${COLORS.border}`,
                    borderRadius: 14,
                    boxShadow: '0 8px 20px rgba(16,42,67,0.06)',
                    padding: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12
                  }}>
                    <div>
                      <div style={{ fontWeight: 800, color: COLORS.navy }}>{d.name}</div>
                      <div style={{ fontSize: 12, color: COLORS.subtext }}>Status: {d.status}</div>
                    </div>
                    <div style={{
                      background: d.status === 'Active' ? '#E8FFF6' : '#FFF5F5',
                      color: d.status === 'Active' ? COLORS.teal : '#B91C1C',
                      border: `1px solid ${d.status === 'Active' ? '#B3F7E5' : '#FECACA'}`,
                      fontSize: 12,
                      fontWeight: 800,
                      padding: '6px 10px',
                      borderRadius: 999
                    }}>
                      {d.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div> */}
          </>
        )}

        
      </div>
    </div>
  );
}
