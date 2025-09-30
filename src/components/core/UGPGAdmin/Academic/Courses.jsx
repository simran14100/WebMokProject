import React, { useEffect, useMemo, useState } from "react";
import { apiConnector } from "../../../../services/apiConnector";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { showSuccess } from "../../../../utils/toast";

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [form, setForm] = useState({
    courseName: "",
    category: "",
    session: "",
    courseType: "",
    durationYear: "",
    semester: "",
    courseDescription: "",
    whatYouWillLearn: "",
    status: "Active"
  });

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
  
  const fetchSessions = async () => {
    try {
      const res = await apiConnector("GET", "/api/v1/ugpg/sessions");
      setSessions(res?.data?.data || []);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    }
  };
  
  const handleEdit = (course) => {
    setSelectedCourse(course);
    setIsEditMode(true);
    setForm({
      courseName: course.courseName || "",
      category: course.category || "",
      session: course.session?._id || "",
      courseType: course.courseType || "",
      durationYear: course.durationYear || "",
      semester: course.semester || "",
      courseDescription: course.courseDescription || "",
      whatYouWillLearn: Array.isArray(course.whatYouWillLearn) 
        ? course.whatYouWillLearn.join("\n") 
        : (course.whatYouWillLearn || ""),
      status: course.status || "Active"
    });
    setOpen(true);
  };
  
  const handleDelete = async () => {
    if (!selectedCourse?._id) return;
    
    setSubmitting(true);
    try {
      await apiConnector("DELETE", `/api/v1/ugpg/courses/${selectedCourse._id}`);
      await fetchCourses();
      setShowDeleteConfirm(false);
      setSelectedCourse(null);
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to delete course");
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const data = {
        ...form,
        whatYouWillLearn: form.whatYouWillLearn.split(",").map(s => s.trim()).filter(Boolean)
      };
      
      if (isEditMode && selectedCourse?._id) {
        await apiConnector("PUT", `/api/v1/ugpg/courses/${selectedCourse._id}`, data);
        showSuccess('Course updated successfully!');
      } else {
        await apiConnector("POST", "/api/v1/ugpg/courses", data);
        showSuccess('Course added successfully!');
      }
      
      await fetchCourses();
      setOpen(false);
      setForm({
        courseName: "",
        category: "",
        session: "",
        courseType: "",
        durationYear: "",
        semester: "",
        courseDescription: "",
        whatYouWillLearn: "",
        status: "Active"
      });
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to save course");
    } finally {
      setSubmitting(false);
    }
  };
  
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    fetchCourses();
    fetchSessions();
  }, []);

  const filteredCourses = useMemo(() => {
    if (!search.trim()) return courses;
    const searchTerm = search.toLowerCase();
    return courses.filter(course => 
      course.courseName?.toLowerCase().includes(searchTerm) ||
      course.category?.toLowerCase().includes(searchTerm) ||
      course.status?.toLowerCase().includes(searchTerm) ||
      course.session?.name?.toLowerCase().includes(searchTerm) ||
      course.courseDescription?.toLowerCase().includes(searchTerm) ||
      (Array.isArray(course.whatYouWillLearn) ? course.whatYouWillLearn.join(" ").toLowerCase().includes(searchTerm) : (course.whatYouWillLearn || "").toLowerCase().includes(searchTerm))
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
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#475569', minWidth: 220 }}>Description</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#475569', minWidth: 220 }}>What You'll Learn</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: '#475569' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCourses.map((course) => {
                  const learn = Array.isArray(course.whatYouWillLearn)
                    ? course.whatYouWillLearn.filter(Boolean).join(', ')
                    : (course.whatYouWillLearn || '');
                  const desc = course.courseDescription || '';
                  const truncate = (str, n = 140) => (str && str.length > n ? str.slice(0, n) + '…' : str);
                  return (
                  <tr key={course._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px' }}>{course.courseName || '-'}</td>
                    <td style={{ padding: '12px' }}>{course.category || '-'}</td>
                    <td style={{ padding: '12px' }}>{course.session?.name || '-'}</td>
                    <td style={{ padding: '12px' }}>{course.courseType || '-'}</td>
                    <td style={{ padding: '12px' }}>{course.durationYear ? `${course.durationYear} years` : '-'}</td>
                    <td style={{ padding: '12px' }}>{course.semester || '-'}</td>
                    <td style={{ padding: '12px', color: '#475569' }} title={desc}>{truncate(desc)}</td>
                    <td style={{ padding: '12px', color: '#475569' }} title={learn}>{truncate(learn)}</td>
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
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEdit(course)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#3b82f6',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            ':hover': { backgroundColor: '#f1f5f9' }
                          }}
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCourse(course);
                            setShowDeleteConfirm(true);
                          }}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#ef4444',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            ':hover': { backgroundColor: '#f1f5f9' }
                          }}
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
                {paginatedCourses.length === 0 && (
                  <tr>
                    <td colSpan="9" style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
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

      {/* Edit Modal */}
      {open && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>
              {isEditMode ? 'Edit Course' : 'Add New Course'}
            </h3>
            
            {error && (
              <div style={{ 
                backgroundColor: '#fee2e2', 
                color: '#991b1b', 
                padding: '12px', 
                borderRadius: '8px', 
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Course Name *</label>
                  <input
                    type="text"
                    name="courseName"
                    value={form.courseName}
                    onChange={onChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      outline: 'none',
                      ':focus': { borderColor: '#3b82f6' }
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Category *</label>
                  <input
                    type="text"
                    name="category"
                    value={form.category}
                    onChange={onChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      outline: 'none',
                      ':focus': { borderColor: '#3b82f6' }
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Session *</label>
                  <select
                    name="session"
                    value={form.session}
                    onChange={onChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      outline: 'none',
                      backgroundColor: 'white',
                      ':focus': { borderColor: '#3b82f6' }
                    }}
                  >
                    <option value="">Select Session</option>
                    {sessions.map(session => (
                      <option key={session._id} value={session._id}>
                        {session.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Course Type *</label>
                  <input
                    type="text"
                    name="courseType"
                    value={form.courseType}
                    onChange={onChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      outline: 'none',
                      ':focus': { borderColor: '#3b82f6' }
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Duration (Years) *</label>
                  <input
                    type="number"
                    name="durationYear"
                    value={form.durationYear}
                    onChange={onChange}
                    min="1"
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      outline: 'none',
                      ':focus': { borderColor: '#3b82f6' }
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Semester *</label>
                  <input
                    type="text"
                    name="semester"
                    value={form.semester}
                    onChange={onChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      outline: 'none',
                      ':focus': { borderColor: '#3b82f6' }
                    }}
                  />
                </div>
                
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Course Description</label>
                  <textarea
                    name="courseDescription"
                    value={form.courseDescription}
                    onChange={onChange}
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      outline: 'none',
                      resize: 'vertical',
                      minHeight: '80px',
                      ':focus': { borderColor: '#3b82f6' }
                    }}
                  />
                </div>
                
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>What You'll Learn (one per line)</label>
                  <textarea
                    name="whatYouWillLearn"
                    value={form.whatYouWillLearn}
                    onChange={onChange}
                    rows="4"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      outline: 'none',
                      resize: 'vertical',
                      minHeight: '120px',
                      ':focus': { borderColor: '#3b82f6' }
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Status *</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={onChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      outline: 'none',
                      backgroundColor: 'white',
                      ':focus': { borderColor: '#3b82f6' }
                    }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setError("");
                  }}
                  disabled={submitting}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    color: '#475569',
                    cursor: 'pointer',
                    fontWeight: 500,
                    ':hover': { backgroundColor: '#f8fafc' },
                    ':disabled': { opacity: 0.7, cursor: 'not-allowed' }
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#1E40AF',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 500,
                    ':hover': { backgroundColor: '#1e3a8a' },
                    ':disabled': { opacity: 0.7, cursor: 'not-allowed' }
                  }}
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '400px',
            padding: '24px'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Confirm Delete</h3>
            <p style={{ marginBottom: '24px', color: '#475569' }}>
              Are you sure you want to delete the course "{selectedCourse?.courseName}"? This action cannot be undone.
            </p>
            
            {error && (
              <div style={{ 
                backgroundColor: '#fee2e2', 
                color: '#991b1b', 
                padding: '12px', 
                borderRadius: '8px', 
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedCourse(null);
                  setError("");
                }}
                disabled={submitting}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  color: '#475569',
                  cursor: 'pointer',
                  fontWeight: 500,
                  ':hover': { backgroundColor: '#f8fafc' },
                  ':disabled': { opacity: 0.7, cursor: 'not-allowed' }
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 500,
                  ':hover': { backgroundColor: '#dc2626' },
                  ':disabled': { opacity: 0.7, cursor: 'not-allowed' }
                }}
              >
                {submitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit/Add Modal */}
      {open && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '10px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>
                {isEditMode ? 'Edit Course' : 'Add New Course'}
              </h3>
              <button 
                onClick={() => setOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#475569'
                  }}>
                    Course Name
                  </label>
                  <input
                    type="text"
                    name="courseName"
                    value={form.courseName}
                    onChange={onChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#475569'
                  }}>
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={form.category}
                    onChange={onChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#475569'
                  }}>
                    Session
                  </label>
                  <select
                    name="session"
                    value={form.session}
                    onChange={onChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">Select Session</option>
                    {sessions.map(session => (
                      <option key={session._id} value={session._id}>
                        {session.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#475569'
                  }}>
                    Course Type
                  </label>
                  <select
                    name="courseType"
                    value={form.courseType}
                    onChange={onChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">Select Type</option>
                    <option value="Yearly">Yearly</option>
                    <option value="Semester">Semester</option>
                  </select>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#475569'
                  }}>
                    Duration (Years)
                  </label>
                  <input
                    type="number"
                    name="durationYear"
                    value={form.durationYear}
                    onChange={onChange}
                    required
                    min="1"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#475569'
                  }}>
                    Semesters
                  </label>
                  <input
                    type="number"
                    name="semester"
                    value={form.semester}
                    onChange={onChange}
                    required
                    min="1"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#475569'
                  }}>
                    Course Description
                  </label>
                  <textarea
                    name="courseDescription"
                    value={form.courseDescription}
                    onChange={onChange}
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#475569'
                  }}>
                    What You'll Learn (comma separated)
                  </label>
                  <textarea
                    name="whatYouWillLearn"
                    value={form.whatYouWillLearn}
                    onChange={onChange}
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#475569'
                  }}>
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={onChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                paddingTop: '16px',
                borderTop: '1px solid #e2e8f0'
              }}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={submitting}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    background: 'white',
                    color: '#475569',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    background: '#3b82f6',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 500,
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 600,
              marginBottom: '16px',
              color: '#1e293b'
            }}>
              Confirm Deletion
            </h3>
            <p style={{
              marginBottom: '24px',
              color: '#475569',
              lineHeight: '1.5'
            }}>
              Are you sure you want to delete the course "{selectedCourse?.courseName}"? This action cannot be undone.
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={submitting}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#475569',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  background: '#ef4444',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 500,
                  opacity: submitting ? 0.7 : 1
                }}
              >
                {submitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Modal */}
      {open && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '10px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Edit Course</h3>
              <button 
                onClick={() => setOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '20px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#475569'
                  }}>
                    Course Name
                  </label>
                  <input
                    type="text"
                    name="courseName"
                    value={form.courseName}
                    onChange={onChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#475569'
                  }}>
                    Category
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={form.category}
                    onChange={onChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#475569'
                  }}>
                    Session
                  </label>
                  <select
                    name="session"
                    value={form.session}
                    onChange={onChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">Select Session</option>
                    {sessions.map(session => (
                      <option key={session._id} value={session._id}>
                        {session.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#475569'
                  }}>
                    Course Type
                  </label>
                  <select
                    name="courseType"
                    value={form.courseType}
                    onChange={onChange}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">Select Type</option>
                    <option value="Yearly">Yearly</option>
                    <option value="Semester">Semester</option>
                  </select>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#475569'
                  }}>
                    Duration (Years)
                  </label>
                  <input
                    type="number"
                    name="durationYear"
                    value={form.durationYear}
                    onChange={onChange}
                    required
                    min="1"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#475569'
                  }}>
                    Semesters
                  </label>
                  <input
                    type="number"
                    name="semester"
                    value={form.semester}
                    onChange={onChange}
                    required
                    min="1"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#475569'
                  }}>
                    Course Description
                  </label>
                  <textarea
                    name="courseDescription"
                    value={form.courseDescription}
                    onChange={onChange}
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#475569'
                  }}>
                    What You'll Learn (comma separated)
                  </label>
                  <textarea
                    name="whatYouWillLearn"
                    value={form.whatYouWillLearn}
                    onChange={onChange}
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#475569'
                  }}>
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={onChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                paddingTop: '16px',
                borderTop: '1px solid #e2e8f0'
              }}>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={submitting}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    background: 'white',
                    color: '#475569',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    background: '#3b82f6',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: 500,
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: 600,
              marginBottom: '16px',
              color: '#1e293b'
            }}>
              Confirm Deletion
            </h3>
            <p style={{
              marginBottom: '24px',
              color: '#475569',
              lineHeight: '1.5'
            }}>
              Are you sure you want to delete the course "{selectedCourse?.courseName}"? This action cannot be undone.
            </p>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={submitting}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#475569',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  background: '#ef4444',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 500,
                  opacity: submitting ? 0.7 : 1
                }}
              >
                {submitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
