import React, { useEffect, useMemo, useState } from "react";
import { apiConnector } from "../../../../services/apiConnector";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const fetchCourses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiConnector("GET", "/api/v1/ugpg/courses");
      // Ensure session data is properly populated
      const coursesWithSession = Array.isArray(res?.data?.data) 
        ? res.data.data.map(course => ({
            ...course,
            session: course.session || { name: '-' } // Handle undefined session
          }))
        : [];
      setCourses(coursesWithSession);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load courses");
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    if (!search.trim()) return courses;
    const searchTerm = search.toLowerCase();
    return courses.filter(course => 
      course.courseName?.toLowerCase().includes(searchTerm) ||
      course.category?.toLowerCase().includes(searchTerm) ||
      course.status?.toLowerCase().includes(searchTerm) ||
      course.session?.name?.toLowerCase().includes(searchTerm)
    );
  }, [courses, search]);

  const totalPages = Math.ceil(filteredCourses.length / limit) || 1;
  const paginatedCourses = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredCourses.slice(start, start + limit);
  }, [filteredCourses, page, limit]);

  return (
    <div style={{ marginTop: '12rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Courses</h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              minWidth: '250px',
              outline: 'none',
              ':focus': { borderColor: '#3b82f6' }
            }}
          />
          <select
            value={limit}
            onChange={(e) => {
              setPage(1);
              setLimit(Number(e.target.value));
            }}
            style={{
              padding: '8px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              outline: 'none'
            }}
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>Loading courses...</div>
      ) : error ? (
        <div style={{ color: '#ef4444', textAlign: 'center', padding: '20px' }}>{error}</div>
      ) : (
        <>
          <div style={{
            background: '#fff',
            border: '1px solid #eaeef3',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '16px'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Course Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Category</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Session</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Type</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Duration</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Semesters</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCourses.map((course) => (
                  <tr key={course._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px' }}>{course.courseName || '-'}</td>
                    <td style={{ padding: '12px' }}>{course.category || '-'}</td>
                    <td style={{ padding: '12px' }}>{course.session?.name || '-'}</td>
                    <td style={{ padding: '12px' }}>{course.courseType || '-'}</td>
                    <td style={{ padding: '12px' }}>{course.durationYear ? `${course.durationYear} years` : '-'}</td>
                    <td style={{ padding: '12px' }}>{course.semester || '-'}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: course.status === 'Active' ? '#dcfce7' : '#fee2e2',
                        color: course.status === 'Active' ? '#166534' : '#991b1b'
                      }}>
                        {course.status || 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
                {paginatedCourses.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                      No courses found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ color: '#64748b' }}>
              Showing {paginatedCourses.length ? ((page - 1) * limit) + 1 : 0} to {Math.min(page * limit, filteredCourses.length)} of {filteredCourses.length} entries
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  backgroundColor: page === 1 ? '#f1f5f9' : '#ffffff',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  color: page === 1 ? '#94a3b8' : '#334155'
                }}
              >
                Previous
              </button>
              <div style={{
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: '#ffffff'
              }}>
                Page {page} of {totalPages}
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  backgroundColor: page === totalPages ? '#f1f5f9' : '#ffffff',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  color: page === totalPages ? '#94a3b8' : '#334155'
                }}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
