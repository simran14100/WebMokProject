

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { apiConnector } from "../../../../services/apiConnector";

// Constants
const S_LIMIT = 10;
const ED_TEAL = "#14b8a6";
const BORDER = "#e5e7eb";
const TEXT = "#334155";

export default function SubjectsPapers() {
  // State for the component
  const [schools, setSchools] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sTotal, setSTotal] = useState(0);
  const [sPage, setSPage] = useState(1);
  const [sSearch, setSSearch] = useState('');
  const [sLoading, setSLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sModal, setSModal] = useState(false);
  const [sEdit, setSEdit] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [sForm, setSForm] = useState({
    school: '',
    course: '',
    semester: '',
    name: '',
    status: 'Active'
  });
  
  // Memoized loadCourses function - FIXED
  const loadCourses = useCallback(async (schoolId) => {
    if (!schoolId) {
      setCourses([]);
      return [];
    }
    try {
      // Use the correct API endpoint with query parameters
      const response = await apiConnector("GET", "/api/v1/ugpg/courses", null, {}, {
        school: schoolId
      });
      
      const list = response?.data?.data || [];
      setCourses(Array.isArray(list) ? list : []);
      return list;
    } catch (err) {
      console.error('Failed to load courses:', err);
      setError(err?.response?.data?.message || 'Failed to load courses');
      setCourses([]);
      return [];
    }
  }, []);
  
  // Memoized values
  const editSubject = useMemo(() => subjects.find((x) => x.id === sEdit) || null, [subjects, sEdit]);
  
  // Available semesters based on course type
  const semesters = useMemo(() => {
    const selectedCourse = courses.find(c => c._id === sForm.course);
    if (!selectedCourse) return [];
    
    const count = selectedCourse.semester || 6; // Default to 6 if not specified
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [sForm.course, courses]);

  // Load schools for dropdown
  const loadSchools = useCallback(async () => {
    setSLoading(true);
    setError('');
    try {
      console.log('Fetching UG/PG schools...');
      const res = await apiConnector("GET", "/api/v1/ugpg/schools");
      console.log('UG/PG schools response:', res);
      
      const list = res?.data?.data || [];
      const schoolsList = Array.isArray(list) ? list : [];
      setSchools(schoolsList);
      return schoolsList;
    } catch (err) {
      console.error('Failed to load schools:', err);
      const errorMsg = err?.response?.data?.message || err.message || 'Failed to load schools';
      setError(errorMsg);
      setSchools([]);
      return [];
    } finally {
      setSLoading(false);
    }
  }, []);

  // Load subjects function
  const loadSubjects = useCallback(async (opts = {}) => {
    const page = opts.page ?? sPage;
    const q = opts.q ?? sSearch;
    setSLoading(true);
    setError(''); // Clear any previous errors
    
    try {
      console.log('Fetching subjects with params:', { q, page, limit: S_LIMIT });
      const response = await apiConnector("GET", "/api/v1/ugpg/subjects", null, {}, { 
        q, 
        page, 
        limit: S_LIMIT,
        populate: 'school,course' // Ensure we get school and course data
      });
      
      console.log('Subjects response:', response);
      
      if (response.data.success) {
        // Transform the data to ensure we have the expected structure
        const formattedSubjects = response.data.data.map(subject => ({
          ...subject,
          school: subject.school || { _id: '', name: 'N/A' },
          course: subject.course || { _id: '', courseName: 'N/A' }
        }));
        
        setSubjects(formattedSubjects);
        setSTotal(response.data.meta?.total || 0);
      } else {
        throw new Error(response.data.message || 'Failed to load subjects');
      }
    } catch (err) {
      console.error('Failed to load subjects:', err);
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to load subjects';
      setError(errorMessage);
      setSubjects([]);
      setSTotal(0);
    } finally {
      setSLoading(false);
    }
  }, [sPage, sSearch]);

  // Load all data
  const loadAllData = useCallback(async () => {
    try {
      setSLoading(true);
      setError('');
      
      // Load schools first
      const schoolsList = await loadSchools();
      
      if (schoolsList.length === 0) {
        setError('No schools found. Please add a school first.');
        return;
      }
      
      // If no school is selected, select the first one
      const schoolId = sForm.school || schoolsList[0]._id;
      
      if (!sForm.school) {
        setSForm(prev => ({
          ...prev,
          school: schoolId
        }));
      }
      
      // Load courses for the selected school
      await loadCourses(schoolId);
      
      // Load subjects
      await loadSubjects();
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err?.response?.data?.message || 'Failed to load data. Please refresh the page.');
    } finally {
      setSLoading(false);
    }
  }, [sForm.school, loadSchools, loadCourses, loadSubjects]);
  
  // Load all data when component mounts
  useEffect(() => {
    loadAllData();
  }, []);
  
  // Load courses when school changes
  useEffect(() => {
    if (sForm.school) {
      loadCourses(sForm.school);
    }
  }, [sForm.school, loadCourses]);

  // Handle search with debounce
  useEffect(() => {
    const t = setTimeout(() => { 
      setSPage(1); 
      loadSubjects({ page: 1, q: sSearch }); 
    }, 400);
    
    return () => clearTimeout(t);
  }, [sSearch, loadSubjects]);

  const openAddSubject = () => { 
    setSEdit(null); 
    setSForm({ 
      school: "", 
      course: "", 
      semester: "",
      name: "", 
      status: "Active" 
    }); 
    setSModal(true); 
  };
  
  const openEditSubject = async (row) => {
    try {
      setSEdit(row._id);
      setSForm({
        school: row.school?._id || "",
        course: row.course?._id || "",
        semester: row.semester || "",
        name: row.name || "",
        status: row.status || "Active"
      });
      
      // If we have a school, make sure its courses are loaded
      if (row.school?._id) {
        await loadCourses(row.school._id);
      }
      
      setSModal(true);
    } catch (err) {
      console.error('Error opening edit subject:', err);
      setError('Failed to load subject data. Please try again.');
    }
  };

  const saveSubject = async () => {
    if (!sForm.school || !sForm.course || !sForm.semester || !sForm.name.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    
    setSubmitting(true);
    setError('');
    
    try {
      const payload = {
        name: sForm.name.trim(),
        school: sForm.school,
        course: sForm.course,
        semester: parseInt(sForm.semester),
        status: sForm.status
      };
      
      let response;
      if (sEdit) {
        // Update existing subject
        response = await apiConnector("PATCH", `/api/v1/ugpg/subjects/${sEdit}`, payload);
      } else {
        // Create new subject
        response = await apiConnector("POST", "/api/v1/ugpg/subjects", payload);
      }
      
      if (response.data.success) {
        // Refresh the subjects list
        await loadSubjects();
        setSModal(false);
      } else {
        throw new Error(response.data.message || 'Failed to save subject');
      }
    } catch (err) {
      console.error('Error saving subject:', {
        error: err,
        message: err.message,
        response: err.response?.data
      });
      
      const errorMessage = err?.response?.data?.message || 
                         err.message || 
                         'Failed to save subject. Please try again.';
      
      // Update error state to show in the UI
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteSubject = async (row) => {
    if (!window.confirm(`Are you sure you want to delete "${row.name}"?`)) return;
    
    try {
      const response = await apiConnector("DELETE", `/api/v1/ugpg/subjects/${row._id}`);
      
      if (response?.data?.success) {
        alert('Subject deleted successfully!');
        await loadAllData();
      } else {
        throw new Error(response?.data?.message || 'Failed to delete subject');
      }
    } catch (error) {
      console.error('Failed to delete subject:', {
        name: error.name,
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to delete subject. Please try again.';
      
      alert(errorMessage);
    }
  };

  // Alias for deleteSubject to fix the reference error
  const removeSubject = deleteSubject;

  // Add spinner styles
  const spinnerStyle = {
    display: 'inline-block',
    width: '1rem',
    height: '1rem',
    border: '0.2em solid rgba(255, 255, 255, 0.3)',
    borderRadius: '50%',
    borderTopColor: '#fff',
    animation: 'spinner 0.6s linear infinite',
    marginRight: '0.5rem'
  };

  return (
    <div style={{ padding: 16 }}>
      <style>
        {`
          @keyframes spinner {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      {/* Error Message Display */}
      {error && (
        <div style={{ 
          marginTop: "6rem",
          marginBottom: 16,
          padding: 12,
          backgroundColor: '#FEE2E2',
          border: '1px solid #FCA5A5',
          borderRadius: 8,
          color: '#B91C1C',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>{error}</span>
          <button 
            onClick={() => setError('')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#B91C1C',
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 'bold'
            }}
          >
            ×
          </button>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: error ? 12 : "6rem", marginBottom: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Subjects</h2>
       
      </div>

      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: TEXT, marginLeft:"120px" }}>Subject Management</h3>
          <button 
          onClick={openAddSubject}
          style={{ 
            padding: "8px 16px", 
            borderRadius: 8, 
            border: `1px solid ${ED_TEAL}`, 
            background: ED_TEAL, 
            color: "#fff",
            cursor: "pointer"
          }}
        >
          + Add New Subject
        </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "12px 120px" }}>
          <label style={{ color: TEXT }}>Search:</label>
          <input value={sSearch} onChange={(e)=>{ setSPage(1); setSSearch(e.target.value); }} placeholder="Search subject..." style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 10px", width: 240 }} />
        </div>
        <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden", width:"80%", marginLeft:"120px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr 3fr 2fr 2fr 2fr", background: ED_TEAL, color: "#fff", padding: "12px 16px", fontWeight: 500 }}>
            <div>Action</div>
            <div>School</div>
            <div>Course</div>
            <div>Semester</div>
            <div>Subject</div>
            <div>Status</div>
          </div>
          <div>
            {sLoading ? (
              <div style={{ padding: 12, color: TEXT }}>Loading...</div>
            ) : (
              subjects.map((row) => (
                <div key={row._id} style={{ display: "grid", gridTemplateColumns: "2fr 3fr 3fr 2fr 2fr 2fr", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={()=>openEditSubject(row)} style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid ${ED_TEAL}`, background: "#fff", color: ED_TEAL }}>Edit</button>
                    <button onClick={()=>removeSubject(row)} style={{ padding: "6px 10px", borderRadius: 6, border: `1px solid #ef4444`, background: "#fff", color: "#ef4444" }}>Delete</button>
                  </div>
                  <div style={{ color: TEXT }}>{row.school?.name || 'N/A'}</div>
                  <div style={{ color: TEXT }}>{row.course?.courseName || 'N/A'}</div>
                  <div style={{ color: TEXT }}>Semester {row.semester || 'N/A'}</div>
                  <div style={{ color: TEXT }}>{row.name || 'N/A'}</div>
                  <div style={{ color: TEXT }}>{row.status || 'Active'}</div>
                </div>
              ))
            )}
            {(!sLoading && subjects.length === 0) && (
              <div style={{ padding: 12, color: TEXT }}>No subjects found.</div>
            )}
          </div>
        </div>

        {sModal && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
            <div style={{ background: "#fff", borderRadius: 12, width: 520, maxWidth: "92vw", padding: 16, border: `1px solid ${BORDER}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h4 style={{ fontSize: 16, fontWeight: 600, color: TEXT }}>{sEdit ? "Edit Subject" : "Add Subject"}</h4>
                <button onClick={()=>setSModal(false)} style={{ padding: 6, borderRadius: 6, border: `1px solid ${BORDER}` }}>✕</button>
              </div>
              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>School <span style={{color: "red"}}>*</span></label>
                  <select 
                    value={sForm.school} 
                    onChange={(e) => {
                      const selectedSchoolId = e.target.value;
                      setSForm(v => ({ 
                        ...v, 
                        school: selectedSchoolId, 
                        course: "", 
                        semester: "" 
                      }));
                    }}
                    style={{ 
                      width: "100%", 
                      border: `1px solid ${BORDER}`, 
                      borderRadius: 8, 
                      padding: 8,
                      backgroundColor: '#fff',
                      color: TEXT,
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">-- Select School --</option>
                    {schools.length > 0 ? (
                      schools.map((school) => (
                        <option key={school._id} value={school._id}>
                          {school.name} {school.shortcode ? `(${school.shortcode})` : ''}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>Loading schools...</option>
                    )}
                  </select>
                  {schools.length === 0 && !sLoading && (
                    <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                      No schools found. Please add schools first.
                    </div>
                  )}
                </div>
                
                <div>
                  <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>Course <span style={{color: "red"}}>*</span></label>
                  <select 
                    value={sForm.course} 
                    onChange={(e) => {
                      const selectedCourseId = e.target.value;
                      setSForm(v => ({ 
                        ...v, 
                        course: selectedCourseId, 
                        semester: "" 
                      }));
                    }}
                    disabled={!sForm.school || courses.length === 0}
                    style={{ 
                      width: "100%", 
                      border: `1px solid ${sForm.school ? BORDER : '#d1d5db'}`, 
                      borderRadius: 8, 
                      padding: 8,
                      backgroundColor: '#fff',
                      color: TEXT,
                      cursor: sForm.school ? 'pointer' : 'not-allowed',
                      opacity: sForm.school ? 1 : 0.7
                    }}
                  >
                    <option value="">-- Select Course --</option>
                    {sForm.school ? (
                      courses.length > 0 ? (
                        courses.map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.courseName} {course.shortcode ? `(${course.shortcode})` : ''}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No courses available for this school</option>
                      )
                    ) : (
                      <option value="" disabled>Please select a school first</option>
                    )}
                  </select>
                  {sForm.school && courses.length === 0 && (
                    <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                      No courses found for this school. Please add courses first.
                    </div>
                  )}
                </div>
                
                <div>
                  <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>Semester <span style={{color: "red"}}>*</span></label>
                  <select 
                    value={sForm.semester} 
                    onChange={(e) => setSForm(v => ({ ...v, semester: e.target.value }))} 
                    disabled={!sForm.course || semesters.length === 0}
                    style={{ 
                      width: "100%", 
                      border: `1px solid ${sForm.course ? BORDER : '#d1d5db'}`, 
                      borderRadius: 8, 
                      padding: 8,
                      backgroundColor: '#fff',
                      color: TEXT,
                      cursor: sForm.course ? 'pointer' : 'not-allowed',
                      opacity: sForm.course ? 1 : 0.7
                    }}
                  >
                    <option value="">-- Select Semester --</option>
                    {sForm.course ? (
                      semesters.length > 0 ? (
                        semesters.map((sem) => (
                          <option key={sem} value={sem}>
                            Semester {sem}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No semesters available</option>
                      )
                    ) : (
                      <option value="" disabled>Please select a course first</option>
                    )}
                  </select>
                  {sForm.course && semesters.length === 0 && (
                    <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                      No semesters defined for this course. Please update the course details.
                    </div>
                  )}
                </div>
                
                <div>
                  <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>Subject Name <span style={{color: "red"}}>*</span></label>
                  <input 
                    value={sForm.name} 
                    onChange={(e) => setSForm(v => ({ ...v, name: e.target.value }))} 
                    placeholder="Enter subject name" 
                    style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }} 
                  />
                </div>
                
                <div>
                  <label style={{ display: "block", color: TEXT, marginBottom: 6 }}>Status</label>
                  <select 
                    value={sForm.status} 
                    onChange={(e) => setSForm(v => ({ ...v, status: e.target.value }))} 
                    style={{ width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: 8 }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
                <button 
                  onClick={() => setSModal(false)} 
                  disabled={submitting}
                  style={{ 
                    padding: "8px 16px", 
                    border: `1px solid ${BORDER}`, 
                    borderRadius: 8, 
                    background: "#fff",
                    opacity: submitting ? 0.7 : 1,
                    cursor: submitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  onClick={saveSubject} 
                  disabled={submitting}
                  style={{ 
                    padding: "8px 16px", 
                    borderRadius: 8, 
                    background: ED_TEAL, 
                    color: "#fff", 
                    border: 0,
                    opacity: submitting ? 0.7 : 1,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {submitting ? (
                    <>
                      <span style={spinnerStyle} role="status" aria-hidden="true"></span>
                      Saving...
                    </>
                  ) : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}