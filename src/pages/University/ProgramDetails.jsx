import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiConnector } from "../../services/apiConnector";

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

export default function ProgramDetails() {
  const { schoolId } = useParams();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [schoolName, setSchoolName] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        // Fetch all courses and filter by school id
        const res = await apiConnector("GET", "/api/v1/ugpg/courses");
        const all = Array.isArray(res?.data?.data) ? res.data.data : [];
        const filteredRaw = all.filter((c) => (c?.school?._id || c?.school) === schoolId);
        // Normalize seats to 0 when null/undefined for consistent UI
        const filtered = filteredRaw.map(c => ({ ...c, seats: c?.seats ?? 0 }));
        // Debug logs for seats
        console.log("[ProgramDetails] schoolId:", schoolId);
        console.log("[ProgramDetails] courses count:", filtered.length);
        console.log("[ProgramDetails] seats snapshot (normalized):", filtered.map(c => ({ id: c?._id, name: c?.courseName, seats: c?.seats, type: typeof c?.seats })));
        console.log("[ProgramDetails] filtered courses (full):", filtered);
        setCourses(filtered);
        if (filtered.length > 0) {
          setSchoolName(filtered[0]?.school?.name || "School Programs");
        } else {
          // Fallback: try to find school name from schools list
          try {
            const sRes = await apiConnector("GET", "/api/v1/ugpg/schools");
            const list = Array.isArray(sRes?.data?.data) ? sRes.data.data : [];
            const s = list.find((x) => x._id === schoolId);
            setSchoolName(s?.name || "School Programs");
          } catch (_) {
            setSchoolName("School Programs");
          }
        }
      } catch (e) {
        setError(e?.response?.data?.message || e.message || "Failed to load programs");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [schoolId]);

  const title = useMemo(() => schoolName || "Programs" , [schoolName]);

  const renderLearnings = (what) => {
    const items = Array.isArray(what)
      ? what
      : typeof what === "string" && what.trim().startsWith("[")
        ? (() => { try { const arr = JSON.parse(what); return Array.isArray(arr) ? arr : []; } catch { return []; } })()
        : (what || "").split(",").map((s) => s.trim()).filter(Boolean);
    if (!items.length) return <div style={{ color: COLORS.subtext, fontSize: 14 }}>No specific learnings listed.</div>;
    return (
      <ul style={{ margin: 0, paddingLeft: 18, color: COLORS.text }}>
        {items.map((li, i) => (
          <li key={i} style={{ marginBottom: 6 }}>{li}</li>
        ))}
      </ul>
    );
  };

  return (
    <div style={{ background: COLORS.white, minHeight: "100vh" }}>
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.blue} 55%, ${COLORS.teal} 100%)`,
          color: COLORS.white,
          padding: "90px 20px 60px",
          marginTop: "8rem",
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
              {title}
            </h1>
            <p style={{ margin: 0, maxWidth: 680, color: "#E7F1FA", fontSize: 15 }}>
              Explore programs offered by this school. Review program descriptions, learnings, and details.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px 60px" }}>
        {/* Two-column layout: main + sidebar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 24 }}>
        <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.subtext, fontSize: 14 }}>
          <Link to="/" style={{ color: COLORS.blue, textDecoration: "none", fontWeight: 600 }}>
            Home
          </Link>
          <span style={{ opacity: 0.6 }}>/</span>
          <Link to="/university/schools" style={{ color: COLORS.blue, textDecoration: "none", fontWeight: 600 }}>
            Schools
          </Link>
          <span style={{ opacity: 0.6 }}>/</span>
          <span style={{ color: COLORS.text, fontWeight: 600 }}>Programs</span>
        </div>

        {loading ? (
          <div style={{ display: "grid", placeItems: "center", padding: 40 }}>
            <div style={{ width: 36, height: 36, border: "3px solid #e6eef5", borderTopColor: COLORS.teal, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
          </div>
        ) : error ? (
          <div style={{ marginTop: 16, color: "#b91c1c", background: "#fee2e2", border: "1px solid #fecaca", padding: 12, borderRadius: 12 }}>{error}</div>
        ) : courses.length === 0 ? (
          <div style={{ marginTop: 16, color: COLORS.subtext, background: "#F8FBFE", border: `1px solid ${COLORS.border}`, padding: 16, borderRadius: 12 }}>
            No programs found for this school.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 20, marginTop: 24 }}>
            {courses.map((course) => {
              const learnings = course.whatYouWillLearn;
              return (
                <div key={course._id} style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 16, boxShadow: "0 10px 30px rgba(16, 42, 67, 0.06)" }}>
                  {/* Accent header */}
                  <div style={{ height: 6, background: `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.teal})` }} />

                  <div style={{ padding: 18 }}>
                    <h2 style={{ margin: 0, fontSize: 22, color: COLORS.text, fontWeight: 800 }}>{course.courseName}</h2>

                    {/* Description */}
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontWeight: 700, color: COLORS.navy, marginBottom: 6 }}>Course Description</div>
                      <div style={{ color: COLORS.text, lineHeight: 1.6 }}>{course.courseDescription || "No description provided."}</div>
                    </div>

                    {/* What You'll Learn */}
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontWeight: 700, color: COLORS.navy, marginBottom: 6 }}>What You'll Learn</div>
                      {renderLearnings(learnings)}
                    </div>

                    {/* Details Table */}
                    <div style={{ marginTop: 18, overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
                        <tbody>
                          <tr>
                            <td style={{ padding: 10, background: "#F8FBFE", border: `1px solid ${COLORS.border}`, fontWeight: 700, width: 180 }}>Category</td>
                            <td style={{ padding: 10, border: `1px solid ${COLORS.border}` }}>{course.category || '-'}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: 10, background: "#F8FBFE", border: `1px solid ${COLORS.border}`, fontWeight: 700 }}>Type</td>
                            <td style={{ padding: 10, border: `1px solid ${COLORS.border}` }}>{course.courseType || '-'}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: 10, background: "#F8FBFE", border: `1px solid ${COLORS.border}`, fontWeight: 700 }}>Duration</td>
                            <td style={{ padding: 10, border: `1px solid ${COLORS.border}` }}>{course.durationYear ? `${course.durationYear} years` : '-'}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: 10, background: "#F8FBFE", border: `1px solid ${COLORS.border}`, fontWeight: 700 }}>Semesters</td>
                            <td style={{ padding: 10, border: `1px solid ${COLORS.border}` }}>{course.semester || '-'}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: 10, background: "#F8FBFE", border: `1px solid ${COLORS.border}`, fontWeight: 700 }}>Total Credit</td>
                            <td style={{ padding: 10, border: `1px solid ${COLORS.border}` }}>{course.totalCredit || '-'}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: 10, background: "#F8FBFE", border: `1px solid ${COLORS.border}`, fontWeight: 700 }}>Total Papers</td>
                            <td style={{ padding: 10, border: `1px solid ${COLORS.border}` }}>{course.totalPapers || '-'}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: 10, background: "#F8FBFE", border: `1px solid ${COLORS.border}`, fontWeight: 700 }}>Seats</td>
                            <td style={{ padding: 10, border: `1px solid ${COLORS.border}` }}>{course.seats ?? '-'}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: 10, background: "#F8FBFE", border: `1px solid ${COLORS.border}`, fontWeight: 700 }}>Session</td>
                            <td style={{ padding: 10, border: `1px solid ${COLORS.border}` }}>{course.session?.name || '-'}</td>
                          </tr>
                          <tr>
                            <td style={{ padding: 10, background: "#F8FBFE", border: `1px solid ${COLORS.border}`, fontWeight: 700 }}>Status</td>
                            <td style={{ padding: 10, border: `1px solid ${COLORS.border}` }}>{course.status || '-'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>
        {/* Sidebar CTA */}
        <aside style={{ position: 'relative' }}>
          <div style={{ position: 'sticky', top: 120 }}>
            <div style={{ background: COLORS.white, border: `1px solid ${COLORS.border}`, borderRadius: 16, boxShadow: '0 10px 30px rgba(16, 42, 67, 0.06)', padding: 18 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: COLORS.navy, marginBottom: 8 }}>Take the next step</div>
              <div style={{ color: COLORS.subtext, fontSize: 14, marginBottom: 16 }}>
                Have questions or ready to apply? Choose an option below.
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                <Link
                  to='/dashboard/AdmissionenquiryForm'
                  style={{
                    display: 'inline-block',
                    textAlign: 'center',
                    textDecoration: 'none',
                    background: COLORS.white,
                    color: COLORS.teal,
                    border: `2px solid ${COLORS.teal}`,
                    padding: '10px 12px',
                    borderRadius: 12,
                    fontWeight: 800,
                    letterSpacing: 0.3,
                    transition: 'all .2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = COLORS.sky; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = COLORS.white; }}
                >
                  Admission Enquiry
                </Link>
                <Link
                  to="/register"
                  style={{
                    display: 'inline-block',
                    textAlign: 'center',
                    textDecoration: 'none',
                    background: `linear-gradient(90deg, ${COLORS.teal}, ${COLORS.blue})`,
                    color: COLORS.white,
                    padding: '10px 12px',
                    borderRadius: 12,
                    fontWeight: 800,
                    letterSpacing: 0.3,
                    boxShadow: '0 6px 14px rgba(7, 166, 152, 0.18)',
                    transition: 'filter .2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.05)')}
                  onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
                >
                  Register Now
                </Link>
              </div>
              <div style={{ color: COLORS.subtext, fontSize: 12, marginTop: 12 }}>
                By registering, you can start your application and receive updates.
              </div>
            </div>
          </div>
        </aside>
        </div>
      </div>
    </div>
  );
}
