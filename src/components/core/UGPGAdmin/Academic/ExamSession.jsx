import React, { useCallback, useEffect, useMemo, useState } from "react";
import { showError, showSuccess } from "../../../../utils/toast";
import { apiConnector } from "../../../../services/apiConnector";
import { Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon, Add as AddIcon } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Pagination,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Chip,
  Alert,
  Snackbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormHelperText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

const EXAM_SESSION_LIMIT = 10;

// Validation function outside component to prevent recreation
const validateFormData = (formData) => {
  const { session, school, course, subject, semester, examDate, examType } = formData;
  const errors = {};
  
  if (!session) errors.session = 'Session is required';
  if (!school) errors.school = 'School is required';
  if (!course) errors.course = 'Course is required';
  if (!subject) errors.subject = 'Subject is required';
  if (!semester) errors.semester = 'Semester is required';
  if (!examDate) {
    errors.examDate = 'Exam date is required';
  } else if (new Date(examDate) < new Date()) {
    errors.examDate = 'Exam date must be in the future';
  }
  if (!examType) errors.examType = 'Exam type is required';
  
  return { isValid: Object.keys(errors).length === 0, errors };
};

export default function ExamSession() {
  const TEAL = "#0d9488"; // ED Teal accent
  
  // Table state
  const [examSessions, setExamSessions] = useState([]);
  const [items, setItems] = useState([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const initialFormState = useMemo(() => ({
    session: "",
    school: "",
    course: "",
    subject: "",
    semester: "",
    examDate: "",
    examType: "theory",
    status: "Active"
  }), []);
  
  const [form, setForm] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});

  // Dropdown data state
  const [dropdownData, setDropdownData] = useState({
    schools: [],
    courses: [],
    subjects: [],
    sessions: []
  });

  // Loading states for dropdowns
  const [loadingDropdowns, setLoadingDropdowns] = useState({
    schools: false,
    courses: false,
    subjects: false,
    sessions: false
  });

  // Load schools
  const loadSchools = useCallback(async () => {
    setLoadingDropdowns(prev => ({ ...prev, schools: true }));
    try {
      const res = await apiConnector("GET", "/api/v1/ugpg/schools");
      setDropdownData(prev => ({
        ...prev,
        schools: res?.data?.data || []
      }));
    } catch (error) {
      console.error('Failed to load schools:', error);
      setError('Failed to load schools');
      showError('Failed to load schools');
    } finally {
      setLoadingDropdowns(prev => ({ ...prev, schools: false }));
    }
  }, []);

  // Load academic sessions
  const loadAcademicSessions = useCallback(async () => {
    setLoadingDropdowns(prev => ({ ...prev, sessions: true }));
    try {
      const res = await apiConnector("GET", "/api/v1/ugpg/sessions");
      console.log('Sessions API response:', res);
      
      // Handle different response structures
      if (res?.data?.data) {
        // If response has data.data (common structure)
        setDropdownData(prev => ({
          ...prev,
          sessions: Array.isArray(res.data.data) ? res.data.data : []
        }));
      } else if (Array.isArray(res?.data)) {
        // If response.data is directly the array
        setDropdownData(prev => ({
          ...prev,
          sessions: res.data
        }));
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to load academic sessions:', error);
      setError('Failed to load academic sessions');
      showError(error?.response?.data?.message || 'Failed to load academic sessions');
    } finally {
      setLoadingDropdowns(prev => ({ ...prev, sessions: false }));
    }
  }, []);

  // Load exam sessions
  const loadExamSessions = useCallback(async (opts = {}) => {
    const currentPage = opts.page ?? page;
    const searchQuery = opts.q ?? search;
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching exam sessions with params:', { 
        page: currentPage, 
        limit: EXAM_SESSION_LIMIT,
        search: searchQuery 
      });
      
      console.log('Making API request to /api/v1/ugpg-exam/sessions with params:', {
        page: currentPage,
        limit: EXAM_SESSION_LIMIT,
        search: searchQuery,
        populate: 'session,school,subject'
      });
      
      const response = await apiConnector("GET", "/api/v1/ugpg-exam/sessions", null, {}, { 
        page: currentPage,
        limit: EXAM_SESSION_LIMIT,
        search: searchQuery,
        populate: 'session,school,subject'
      });
      
      console.log('Exam sessions response - full:', response);
      console.log('Response data structure:', {
        hasData: !!response?.data,
        dataIsArray: Array.isArray(response?.data),
        dataKeys: response?.data ? Object.keys(response.data) : 'no data',
        firstItem: response?.data?.[0] ? {
          keys: Object.keys(response.data[0]),
          hasSession: 'session' in (response.data[0] || {}),
          sessionType: typeof response.data[0]?.session,
          sessionKeys: response.data[0]?.session ? Object.keys(response.data[0].session) : 'no session'
        } : 'no items'
      });
      
      if (response.data) {
        const data = response.data.data || [];
        const total = response.data.meta?.total || data.length;
        
        console.log('Raw API response data:', data);
        
        // Transform the data to ensure we have the expected structure
        const formattedSessions = data.map(session => {
          console.log('Processing session:', session);
          return {
            ...session,
            session: session.session || { _id: '', name: 'N/A' },
            school: session.school || { _id: '', name: 'N/A' },
            subject: session.subject || { _id: '', name: 'N/A' }
          };
        });
        
        console.log('Formatted sessions:', formattedSessions);
        setExamSessions(formattedSessions);
        setTotalSessions(total);
      }
    } catch (err) {
      console.error('Failed to load exam sessions:', err);
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to load exam sessions';
      setError(errorMessage);
      setExamSessions([]);
      setTotalSessions(0);
    } finally {
      setLoading(false);
    }
  }, [page, search]);
  
  // Fetch initial data on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      await Promise.all([
        loadSchools(),
        loadAcademicSessions(),
        loadExamSessions()
      ]);
    };

    fetchInitialData();
  }, [loadSchools, loadAcademicSessions, loadExamSessions]);

  // Fetch courses when school changes
  useEffect(() => {
    if (!form.school) {
      setDropdownData(prev => ({ ...prev, courses: [], subjects: [], semesters: [] }));
      setForm(prev => ({ ...prev, course: '', subject: '', semester: '' }));
      return;
    }

    const fetchCourses = async () => {
      setLoadingDropdowns(prev => ({ ...prev, courses: true }));
      try {
        const res = await apiConnector("GET", "/api/v1/ugpg/courses", null, {}, { 
          school: form.school,
          limit: 100
        });
        
        setDropdownData(prev => ({
          ...prev,
          courses: res?.data?.data || []
        }));
        
        // Clear course, subject and semester selection when school changes
        setForm(prev => ({
          ...prev,
          course: '',
          subject: '',
          semester: ''
        }));
      } catch (error) {
        console.error('Error fetching courses:', error);
        showError('Failed to load courses');
        setDropdownData(prev => ({ ...prev, courses: [], subjects: [], semesters: [] }));
      } finally {
        setLoadingDropdowns(prev => ({ ...prev, courses: false }));
      }
    };

    fetchCourses();
  }, [form.school]);

  // Fetch subjects when course changes
  useEffect(() => {
    if (!form.course) {
      setDropdownData(prev => ({ ...prev, subjects: [], semesters: [] }));
      setForm(prev => ({ ...prev, subject: '', semester: '' }));
      return;
    }

    const fetchSubjects = async () => {
      setLoadingDropdowns(prev => ({ ...prev, subjects: true }));
      try {
        const res = await apiConnector("GET", "/api/v1/ugpg/subjects", null, {}, { 
          course: form.course,
          limit: 100
        });
        
        setDropdownData(prev => ({
          ...prev,
          subjects: res?.data?.data || []
        }));
        
        // Clear subject and semester selection when course changes
        setForm(prev => ({
          ...prev,
          subject: '',
          semester: ''
        }));
      } catch (error) {
        console.error('Error fetching subjects:', error);
        showError('Failed to load subjects');
        setDropdownData(prev => ({ ...prev, subjects: [], semesters: [] }));
      } finally {
        setLoadingDropdowns(prev => ({ ...prev, subjects: false }));
      }
    };

    fetchSubjects();
  }, [form.course]);
  
  // No need to fetch semesters separately as they come with the subject

  // Load courses for selected school
  const loadCourses = useCallback(async (schoolId) => {
    if (!schoolId) {
      setDropdownData(prev => ({ ...prev, courses: [], subjects: [], semesters: [] }));
      return [];
    }
    
    setLoadingDropdowns(prev => ({ ...prev, courses: true }));
    try {
      const response = await apiConnector("GET", "/api/v1/ugpg/courses", null, {}, {
        school: schoolId,
        limit: 100
      });
      
      const coursesList = response?.data?.data || [];
      setDropdownData(prev => ({
        ...prev,
        courses: coursesList,
        subjects: [],
        semesters: []
      }));
      
      return coursesList;
    } catch (error) {
      console.error('Error loading courses:', error);
      showError('Failed to load courses');
      setDropdownData(prev => ({
        ...prev,
        courses: [],
        subjects: [],
        semesters: []
      }));
      return [];
    } finally {
      setLoadingDropdowns(prev => ({ ...prev, courses: false }));
    }
  }, []);
  
  // Handle form input changes
  const onChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setForm(prev => {
      const updatedForm = {
        ...prev,
        [name]: newValue
      };
      
      // Reset dependent fields when school changes
      if (name === 'school') {
        updatedForm.course = '';
        updatedForm.subject = '';
        updatedForm.semester = '';
        loadCourses(newValue);
      }
      // Reset subject and semester when course changes
      else if (name === 'course') {
        updatedForm.subject = '';
        updatedForm.semester = '';
      }
      
      // If subject changes, reset semester
      if (name === 'subject') {
        updatedForm.semester = '';
      }
      
      return updatedForm;
    });
    
    // Clear error when user starts typing/selecting
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [formErrors]);


  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Load all initial data
  const loadAllData = useCallback(async () => {
    try {
      console.log('Starting to load initial data...');
      setLoading(true);
      
      // Load schools, sessions, and exam sessions in parallel
      console.log('Fetching schools and sessions...');
      let schoolsRes, sessionsRes;
      
      try {
        [schoolsRes, sessionsRes] = await Promise.all([
          apiConnector("GET", "/api/v1/ugpg/schools").catch(err => {
            console.error('Error fetching schools:', err);
            throw new Error('Failed to load schools');
          }),
          apiConnector("GET", "/api/v1/ugpg/sessions").catch(err => {
            console.error('Error fetching academic sessions:', err);
            throw new Error('Failed to load academic sessions');
          })
        ]);
        
        console.log('Schools response:', schoolsRes);
        console.log('Sessions response:', sessionsRes);
        
        // Update dropdown data
        setDropdownData(prev => ({
          ...prev,
          schools: schoolsRes?.data?.data || [],
          sessions: sessionsRes?.data?.data || []
        }));
        
        console.log('Dropdown data updated, loading exam sessions...');
        
        // Load exam sessions
        await loadExamSessions().catch(err => {
          console.error('Error in loadExamSessions:', err);
          throw new Error('Failed to load exam sessions');
        });
        
      } catch (err) {
        console.error('Error in parallel loading:', err);
        throw err; // Re-throw to be caught by the outer catch
      }
      
    } catch (err) {
      console.error('Error in loadAllData:', {
        message: err.message,
        stack: err.stack,
        response: err.response
      });
      showError(`Failed to load initial data: ${err.message}`);
    } finally {
      console.log('Finished loading initial data');
      setLoading(false);
    }
  }, [loadExamSessions]);
  
  // Load all data on component mount
  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 350);
    return () => clearTimeout(t);
  }, [search]);

  const filtered = useMemo(() => {
    try {
      if (!Array.isArray(examSessions)) return [];
      if (!debouncedSearch) return examSessions;
      
      return examSessions.filter((d) =>
        [
          d?.session?.name,
          d?.school?.name,
          d?.subject?.name,
          d?.examType,
          d?.status,
          d?.examDate ? new Date(d.examDate).toLocaleDateString() : ''
        ]
          .map((v) => (v || "").toString().toLowerCase())
          .some((s) => s.includes(debouncedSearch))
      );
    } catch (error) {
      console.error('Error filtering items:', error);
      return [];
    }
  }, [examSessions, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil((filtered?.length || 1) / limit));
  
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const paged = useMemo(() => {
    if (!Array.isArray(filtered)) return [];
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page, limit]);

  // Fetch subjects when school changes
  useEffect(() => {
    if (!form.school) {
      setDropdownData(prev => ({ ...prev, subjects: [], semesters: [] }));
      setForm(prev => ({ ...prev, subject: '', semester: '' }));
      return;
    }

    const fetchSubjects = async () => {
      setLoadingDropdowns(prev => ({ ...prev, subjects: true }));
      try {
        const res = await apiConnector("GET", "/api/v1/ugpg/subjects", null, {}, {
          school: form.school,
          limit: 100 // Increase limit to get all subjects
        });
        
        setDropdownData(prev => ({
          ...prev,
          subjects: res?.data?.data || []
        }));
        
        // Clear any previous subject selection
        setForm(prev => ({
          ...prev,
          subject: ''
        }));
      } catch (error) {
        console.error('Error fetching subjects:', error);
        setError('Failed to load subjects');
        showError('Failed to load subjects');
        setDropdownData(prev => ({ ...prev, subjects: [], semesters: [] }));
      } finally {
        setLoadingDropdowns(prev => ({ ...prev, subjects: false }));
      }
    };

    fetchSubjects();
  }, [form.school]);

  // Memoize form validation
  const isFormValid = useMemo(() => {
    const { isValid } = validateFormData(form);
    console.log('Form validation result:', { isValid, form });
    return isValid;
  }, [form]);

  // Format data for the table
  const tableData = useMemo(() => {
    console.log('Formatting table data from paged:', paged);
    
    return paged.map((item) => {
      console.log('Exam session item - raw:', JSON.parse(JSON.stringify(item)));
      
      const formattedItem = {
        ...item,
        id: item._id,
        // Keep original nested objects for debugging
        _rawSession: item.session,
        _rawSchool: item.school,
        _rawSubject: item.subject,
        // Add flat properties for easier access
        sessionName: item.session?.name || 'N/A',
        schoolName: item.school?.name || 'N/A',
        subjectName: item.subject?.name || 'N/A',
        semester: item.semester || 'N/A',
        examDate: item.examDate,
        examType: item.examType || 'N/A',
        status: item.status || 'N/A'
      };
      
      console.log('Exam session item - formatted:', formattedItem);
      return formattedItem;
    });
  }, [paged]);

  // Get semester from selected subject
  const selectedSemester = useMemo(() => {
    if (!form.subject) return null;
    const selectedSubject = dropdownData.subjects.find(s => s._id === form.subject);
    if (!selectedSubject) return null;
    
    return {
      _id: selectedSubject.semester?.toString(),
      name: `Semester ${selectedSubject.semester}`,
      number: selectedSubject.semester
    };
  }, [form.subject, dropdownData.subjects]);
  
  // Auto-select semester when subject changes
  useEffect(() => {
    if (selectedSemester && !form.semester) {
      setForm(prev => ({
        ...prev,
        semester: selectedSemester._id
      }));
    }
  }, [selectedSemester, form.semester]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    // Validate form
    const { isValid, errors: validationErrors } = validateFormData(form);
    setFormErrors(validationErrors);
    
    if (!isValid) {
      return;
    }
    
    try {
      setSubmitting(true);
      
      const selectedSubject = dropdownData.subjects.find(s => s._id === form.subject);
      const selectedSemester = selectedSubject ? {
        _id: selectedSubject.semester?.toString(),
        name: `Semester ${selectedSubject.semester}`,
        number: selectedSubject.semester
      } : null;
      
      const payload = {
        sessionId: form.session,
        schoolId: form.school,
        courseId: selectedSubject?.course, // Get course ID from subject
        subjectId: form.subject,
        semester: selectedSemester?.number || form.semester,
        semesterName: selectedSemester?.name || `Semester ${form.semester}`,
        examDate: new Date(form.examDate).toISOString(),
        examType: form.examType,
        status: form.status.toLowerCase()
      };
      
      if (editId) {
        await apiConnector("PATCH", `/api/v1/ugpg-exam/sessions/${editId}`, payload);
        showSuccess('Exam session updated successfully');
      } else {
        await apiConnector("POST", "/api/v1/ugpg-exam/sessions", payload);
        showSuccess('Exam session created successfully');
      }
      
      await loadExamSessions();
      setForm(initialFormState);
      setEditId(null);
      setOpen(false);
      setFormErrors({});
    } catch (error) {
      console.error('Error saving exam session:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save exam session';
      showError(errorMessage);
      
      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors.reduce((acc, err) => ({
          ...acc,
          [err.path]: err.msg
        }), {});
        setFormErrors(apiErrors);
      }
    } finally {
      setSubmitting(false);
    }
  }, [form, initialFormState, showError, editId, loadExamSessions]);
  
  // Handle edit action
  const handleEdit = useCallback((session) => {
    // Format the date for the datetime-local input
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().slice(0, 16);
    };

    setForm({
      session: session.session?._id || '',
      school: session.school?._id || '',
      course: session.course?._id || '',
      subject: session.subject?._id || '',
      semester: session.semester?.toString() || '',
      examDate: formatDateForInput(session.examDate),
      examType: session.examType || 'theory',
      status: session.status || 'Active'
    });

    // If we have a subject, load its data
    if (session.subject?._id) {
      const loadSubjectData = async () => {
        try {
          setLoadingDropdowns(prev => ({ ...prev, subjects: true }));
          const res = await apiConnector("GET", "/api/v1/ugpg/subjects", null, {}, {
            school: session.school._id,
            limit: 100
          });
          
          setDropdownData(prev => ({
            ...prev,
            subjects: res?.data?.data || []
          }));
        } catch (error) {
          console.error('Error loading subjects for school:', error);
          showError('Failed to load subjects for the selected school');
        } finally {
          setLoadingDropdowns(prev => ({ ...prev, subjects: false }));
        }
      };
      
      loadSubjectData();
    }
    
    setEditId(session._id);
    setOpen(true);
  }, [showError]);
  
  // Handle delete action
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this exam session?')) return;
    
    try {
      setLoading(true);
      await apiConnector("DELETE", `/api/v1/ugpg-exam/sessions/${id}`);
      showSuccess('Exam session deleted successfully');
      await loadExamSessions();
    } catch (error) {
      console.error('Error deleting exam session:', error);
      showError(error.response?.data?.message || 'Failed to delete exam session');
    } finally {
      setLoading(false);
    }
  };

  const months = [
    "January","February","March","April","May","June","July","August","September","October","November","December"
  ];

  const fmt = (d) => {
    if (!d) return "";
    try {
      const dt = new Date(d);
      return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
    } catch {
      return d;
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: "12rem" }}>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Manage Exam Session</h2>
        <button onClick={() => setOpen(true)} style={{ background: TEAL, color: "#fff", border: 0, borderRadius: 8, padding: "8px 12px", fontWeight: 600 }}>+ ADD NEW</button>
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span>Show</span>
          <select value={limit} onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }} style={{ padding: 6, border: "1px solid #e2e8f0", borderRadius: 6 }}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
          <span>entries</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <label>Search:</label>
          <input value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: 8, border: "1px solid #e2e8f0", borderRadius: 8 }} />
        </div>
      </div>

      <div style={{ background: "#fff", border: "1px solid #eaeef3", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
          <thead>
            <tr style={{ background: "#f8fafc", color: "#475569" }}>
              <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3" }}>Session</th>
              <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3" }}>Subject</th>
              <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3" }}>School</th>
              <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3" }}>Semester</th>
              <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3" }}>Exam Date</th>
              <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3" }}>Exam Timing</th>
              <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3" }}>Exam Type</th>
              <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3" }}>Status</th>
              <th style={{ textAlign: "left", padding: 12, borderBottom: "1px solid #eaeef3" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} style={{ padding: 16, textAlign: "center", color: "#64748b" }}>Loading...</td>
              </tr>
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: 16, textAlign: "center", color: "#64748b" }}>No data found</td>
              </tr>
            ) : (
              paged.map((row, idx) => (
                <tr key={idx} style={{ borderTop: "1px solid #f1f5f9" }}>
                  <td style={{ padding: 12 }}>{row.sessionId?.name || 'N/A'}</td>
                  <td style={{ padding: 12 }}>{row.subjectId?.name || 'N/A'}</td>
                  <td style={{ padding: 12 }}>{row.schoolId?.name || 'N/A'}</td>
                  <td style={{ padding: 12 }}>{row.semester || 'N/A'}</td>
                  <td style={{ padding: 12, whiteSpace: 'nowrap' }}>
                    {row.examDate ? new Date(row.examDate).toLocaleDateString('en-IN') : 'N/A'}
                  </td>
                  <td style={{ padding: 12, whiteSpace: 'nowrap' }}>
                    {row.examDate ? new Date(row.examDate).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    }) : 'N/A'}
                  </td>
                  <td style={{ padding: 12 }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 500,
                      backgroundColor: row.examType === 'theory' ? '#dbeafe' : row.examType === 'practical' ? '#d1fae5' : '#f3e8ff',
                      color: row.examType === 'theory' ? '#1e40af' : row.examType === 'practical' ? '#065f46' : '#6b21a8',
                      textTransform: 'capitalize',
                      display: 'inline-block',
                      minWidth: '80px',
                      textAlign: 'center'
                    }}>
                      {row.examType || 'N/A'}
                    </span>
                  </td>
                  <td style={{ padding: 12 }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 12,
                      fontSize: 12,
                      fontWeight: 500,
                      backgroundColor: row.status === 'active' ? '#d1fae5' : row.status === 'completed' ? '#fef3c7' : '#f3f4f6',
                      color: row.status === 'active' ? '#065f46' : row.status === 'completed' ? '#92400e' : '#6b7280',
                      display: 'inline-block',
                      minWidth: '80px',
                      textAlign: 'center',
                      textTransform: 'capitalize'
                    }}>
                      {row.status || 'N/A'}
                    </span>
                  </td>
                  <td style={{ padding: 12, whiteSpace: 'nowrap' }}>
                    <button 
                      onClick={() => handleEdit(row)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: TEAL,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 8px',
                        borderRadius: 4
                      }}
                    >
                      <EditIcon fontSize="small" />
                      <span>Edit</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(row._id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '4px 8px',
                        borderRadius: 4
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
        <div style={{ color: "#64748b" }}>Showing {(paged.length && (page - 1) * limit + 1) || 0}-{(page - 1) * limit + paged.length} of {filtered.length} entries</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 8, background: page === 1 ? "#f1f5f9" : "#fff" }}>Previous</button>
          <div style={{ padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 8 }}>Page {page} / {totalPages}</div>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: "6px 10px", border: "1px solid #e2e8f0", borderRadius: 8, background: page === totalPages ? "#f1f5f9" : "#fff" }}>Next</button>
        </div>
      </div>

      {open && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.25)", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "10vh", zIndex: 50 }}>
          <div style={{ width: "min(950px, 95vw)", background: "#fff", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
            <div style={{ background: "#fbcfe8", padding: 16, borderTopLeftRadius: 12, borderTopRightRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 700, fontSize: 18, color: "#111827" }}>Add Exam Session</div>
              <button onClick={() => setOpen(false)} style={{ background: "transparent", border: 0, fontSize: 18, color: "#7f1d1d" }}>×</button>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {/* School Dropdown */}
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6, fontWeight: 500 }}>School *</label>
                  <select 
                    name="school" 
                    value={form.school} 
                    onChange={onChange}
                    disabled={loadingDropdowns.schools}
                    style={{ 
                      width: "100%", 
                      padding: "10px 12px", 
                      border: `1px solid ${formErrors.school ? '#ef4444' : '#d1d5db'}`, 
                      borderRadius: 8,
                      fontSize: 14,
                      outlineColor: TEAL,
                      backgroundColor: loadingDropdowns.schools ? '#f3f4f6' : 'white',
                      marginBottom: '16px'
                    }}
                  >
                    <option value="">
                      {loadingDropdowns.schools ? 'Loading schools...' : 'Select School'}
                    </option>
                    {dropdownData.schools.map((school) => (
                      <option key={school._id} value={school._id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                  {formErrors.school && (
                    <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{formErrors.school}</div>
                  )}
                </div>

                {/* Session Dropdown */}
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6, fontWeight: 500 }}>Session *</label>
                  <select 
                    name="session" 
                    value={form.session} 
                    onChange={onChange}
                    disabled={loadingDropdowns.sessions}
                    style={{ 
                      width: "100%", 
                      padding: "10px 12px", 
                      border: `1px solid ${formErrors.session ? '#ef4444' : '#d1d5db'}`, 
                      borderRadius: 8,
                      fontSize: 14,
                      outlineColor: TEAL,
                      backgroundColor: loadingDropdowns.sessions ? '#f3f4f6' : 'white',
                      marginBottom: '16px'
                    }}
                  >
                    <option value="">
                      {loadingDropdowns.sessions ? 'Loading sessions...' : 'Select Session'}
                    </option>
                    {dropdownData.sessions.map((session) => (
                      <option key={session._id} value={session._id}>
                        {session.name || `Session ${session.year || ''}`.trim()}
                      </option>
                    ))}
                  </select>
                  {formErrors.session && (
                    <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{formErrors.session}</div>
                  )}
                </div>

                {/* Course Dropdown */}
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6, fontWeight: 500 }}>Course *</label>
                  <select 
                    name="course" 
                    value={form.course} 
                    onChange={onChange}
                    disabled={!form.school || loadingDropdowns.courses}
                    style={{ 
                      width: "100%", 
                      padding: "10px 12px", 
                      border: `1px solid ${formErrors.course ? '#ef4444' : '#d1d5db'}`, 
                      borderRadius: 8,
                      fontSize: 14,
                      outlineColor: TEAL,
                      backgroundColor: loadingDropdowns.courses ? '#f3f4f6' : 'white',
                      marginBottom: '16px'
                    }}
                  >
                    <option value="">
                      {!form.school 
                        ? 'Select a school first' 
                        : loadingDropdowns.courses 
                          ? 'Loading courses...' 
                          : 'Select Course'}
                    </option>
                    {dropdownData.courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.courseName || `Course ${course.code || ''}`.trim()}
                      </option>
                    ))}
                  </select>
                  {formErrors.course && (
                    <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{formErrors.course}</div>
                  )}
                </div>

                {/* Subject Dropdown */}
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6, fontWeight: 500 }}>Subject *</label>
                  <select 
                    name="subject" 
                    value={form.subject} 
                    onChange={onChange}
                    disabled={!form.course || loadingDropdowns.subjects}
                    style={{ 
                      width: "100%", 
                      padding: "10px 12px", 
                      border: `1px solid ${formErrors.subject ? '#ef4444' : '#d1d5db'}`, 
                      borderRadius: 8,
                      fontSize: 14,
                      outlineColor: TEAL,
                      backgroundColor: loadingDropdowns.subjects ? '#f3f4f6' : 'white',
                      marginBottom: '16px'
                    }}
                  >
                    <option value="">
                      {!form.course 
                        ? 'Select a course first' 
                        : loadingDropdowns.subjects 
                          ? 'Loading subjects...' 
                          : 'Select Subject'}
                    </option>
                    {dropdownData.subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name || `Subject ${subject.code || ''}`.trim()}
                      </option>
                    ))}
                  </select>
                  {formErrors.subject && (
                    <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{formErrors.subject}</div>
                  )}
                </div>

                {/* Semester Display (read-only) */}
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6, fontWeight: 500 }}>Semester *</label>
                  <div 
                    style={{ 
                      width: "100%", 
                      padding: "10px 12px", 
                      border: `1px solid #d1d5db`, 
                      borderRadius: 8,
                      fontSize: 14,
                      backgroundColor: '#f3f4f6',
                      marginBottom: '16px',
                      minHeight: '40px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    {selectedSemester 
                      ? `Semester ${selectedSemester.number}`
                      : 'Select a subject to see semester'}
                  </div>
                  <input 
                    type="hidden" 
                    name="semester" 
                    value={selectedSemester?._id || ''} 
                  />
                </div>

                {/* Exam Date */}
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6, fontWeight: 500 }}>Exam Date *</label>
                  <input
                    type="datetime-local"
                    name="examDate"
                    value={form.examDate}
                    onChange={onChange}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: `1px solid ${formErrors.examDate ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: 8,
                      fontSize: 14,
                      outlineColor: TEAL
                    }}
                  />
                  {formErrors.examDate && (
                    <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{formErrors.examDate}</div>
                  )}
                </div>

                {/* Exam Type */}
                {/* <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6, fontWeight: 500 }}>Exam Type *</label>
                  <select
                    name="examType"
                    value={form.examType}
                    onChange={onChange}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: `1px solid ${formErrors.examType ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: 8,
                      fontSize: 14,
                      outlineColor: TEAL
                    }}
                  >
                    <option value="theory">Theory</option>
                    <option value="practical">Practical</option>
                    <option value="viva">Viva</option>
                    <option value="project">Project</option>
                  </select>
                  {formErrors.examType && (
                    <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{formErrors.examType}</div>
                  )}
                </div> */}

                {/* Status */}
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6, fontWeight: 500 }}>Status *</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={onChange}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: `1px solid ${formErrors.status ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: 8,
                      fontSize: 14,
                      outlineColor: TEAL
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  {formErrors.status && (
                    <div style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>{formErrors.status}</div>
                  )}
                </div>
               

                {/* Exam Type */}
                <div>
                  <label style={{ display: "block", fontSize: 14, marginBottom: 6, fontWeight: 500 }}>Exam Type *</label>
                  <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
                    {['Theory', 'Practical', 'Viva', 'Project'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, examType: type.toLowerCase() }))}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 6,
                          border: `1px solid ${form.examType === type.toLowerCase() ? TEAL : '#e2e8f0'}`,
                          background: form.examType === type.toLowerCase() ? TEAL : '#fff',
                          color: form.examType === type.toLowerCase() ? '#fff' : '#1e293b',
                          cursor: 'pointer',
                          fontSize: 14,
                          transition: 'all 0.2s'
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Form Actions */}
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      setForm(initialFormState);
                      setEditId(null);
                      setFormErrors({});
                    }}
                    style={{
                      padding: '10px 20px',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      background: 'white',
                      color: '#4b5563',
                      cursor: 'pointer',
                      fontWeight: 500
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || !isFormValid}
                    style={{
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: 8,
                      background: isFormValid ? TEAL : '#9ca3af',
                      color: 'white',
                      cursor: isFormValid ? 'pointer' : 'not-allowed',
                      fontWeight: 500,
                      opacity: submitting ? 0.7 : 1
                    }}
                  >
                    {submitting ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        {editId ? 'Updating...' : 'Creating...'}
                      </span>
                    ) : editId ? 'Update Exam Session' : 'Create Exam Session'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
