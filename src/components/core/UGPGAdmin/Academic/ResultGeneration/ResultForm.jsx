import React, { useState, useEffect, useCallback } from 'react';
import { 
  Form, 
  Input, 
  Select, 
  Button, 
  Card, 
  Row, 
  Col, 
  Table, 
  InputNumber, 
  message, 
  Tag,
  Spin,
  Alert 
} from 'antd';
import { 
  PlusOutlined, 
  MinusCircleOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import { createResult, updateResult } from '../../../../../services/resultApi';
import { listStudents } from '../../../../../services/operations/studentApi';
import { listUGPGSubjects } from '../../../../../services/ugpgSubjectApi';
import PropTypes from 'prop-types';

const { Option } = Select;

const ResultForm = ({ initialValues, onSuccess, onCancel, courses, examSessions, initialStudents = [] }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [studentLoading, setStudentLoading] = useState(false);
  // Ensure students is always an array
  const [students, setStudents] = useState(Array.isArray(initialStudents) ? initialStudents : []);
  const [filteredStudents, setFilteredStudents] = useState(Array.isArray(initialStudents) ? initialStudents : []);
  // Update students state when initialStudents prop changes
  useEffect(() => {
    if (Array.isArray(initialStudents)) {
      setStudents(initialStudents);
      setFilteredStudents(initialStudents);
    }
  }, [initialStudents]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [studentError, setStudentError] = useState(null);
  const [ugpgSubjects, setUgpgSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Fetch UG/PG subjects for the selected course and semester
  const fetchUgpgSubjects = useCallback(async (courseId, semester) => {
    if (!courseId) {
      setUgpgSubjects([]);
      return [];
    }
    
    setLoadingSubjects(true);
    try {
      let response;
      try {
        const params = {
          course: courseId,
          status: 'Active',
          limit: 1000,
          populate: 'course,school',
          sort: 'name'
        };
        
        // Only add semester filter if it's provided and valid
        if (semester && !isNaN(semester) && semester > 0) {
          params.semester = semester;
        }
        
        response = await listUGPGSubjects(params);
        
        console.log('UG/PG Subjects response:', response?.data);
        
        if (!response?.data?.success) {
          throw new Error(response?.data?.message || 'Failed to fetch UG/PG subjects');
        }
        
        const subjectsData = response.data.data || [];
        setUgpgSubjects(subjectsData);
        return subjectsData;
        
      } catch (ugpgError) {
        console.warn('Error fetching UG/PG subjects, falling back to regular subjects:', ugpgError);
        
        // Fallback to regular subjects if UG/PG endpoint fails
        const fallbackResponse = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1'}/subjects`,
          {
            params: {
              course: courseId,
              status: 'Active',
              limit: 1000,
              populate: 'course,school'
            },
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const fallbackData = Array.isArray(fallbackResponse?.data?.data) 
          ? fallbackResponse.data.data 
          : [];
          
        setUgpgSubjects(fallbackData);
        return fallbackData;
      }
      
    } catch (error) {
      console.error('Error in fetchUgpgSubjects:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to load subjects';
      message.error(errorMsg);
      setUgpgSubjects([]);
      return [];
    } finally {
      setLoadingSubjects(false);
    }
  }, []);

  // Fetch students from API
  const fetchStudents = useCallback(async (options = {}) => {
    const { signal, ...filters } = options;
    
    try {
      setStudentLoading(true);
      setStudentError(null);
      console.log('Fetching students with filters:', filters);
      
      const response = await listStudents({
        ...filters,
        status: 'active', // Only fetch active students
        populate: 'user,course', // Include user and course details
        limit: 1000, // Increase limit to get more students
        signal // Pass the AbortSignal to the API call
      });
      
      // Check if the request was aborted
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }
      
      // Extract students array from response
      const studentsData = Array.isArray(response?.data?.students) ? 
        response.data.students : 
        (Array.isArray(response?.data) ? response.data : []);
      
      console.log('Fetched students:', studentsData);
      
      // Only update state if we're still mounted and not aborted
      if (!signal?.aborted) {
        setStudents(studentsData);
        setFilteredStudents(studentsData);
      }
      
      return studentsData;
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudentError(error.response?.data?.message || error.message || 'Failed to load students');
      message.error('Failed to load students. Please try again.');
      return [];
    } finally {
      setStudentLoading(false);
    }
  }, []);

  // Effect to handle initial values and data setup
  useEffect(() => {
    let isMounted = true;
    let abortController = new AbortController();
    
    const processInitialStudents = async () => {
      try {
        console.log('Processing initial students...');
        
        if (!initialStudents || initialStudents.length === 0) {
          console.log('No initial students provided, fetching students...');
          const fetchedStudents = await fetchStudents({ signal: abortController.signal });
          if (!isMounted) return;
          
          setStudents(fetchedStudents);
          setFilteredStudents(fetchedStudents);
        } else {
          console.log('Using provided initial students');
          const studentsData = Array.isArray(initialStudents) ? 
            initialStudents : 
            (initialStudents.students || []);
          
          if (isMounted) {
            setStudents(studentsData);
            setFilteredStudents(studentsData);
          }
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.log('Fetch aborted');
          return;
        }
        console.error('Error processing initial students:', error);
        if (isMounted) {
          setStudentError('Failed to load students');
        }
      }
    };
    
    // Only run this effect when component mounts
    if (isMounted) {
      processInitialStudents();
    }
    
    // Cleanup function
    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, []); // Empty dependency array means this runs once on mount
  
  // Effect to handle initial form values
  useEffect(() => {
    // Clear form when initialValues is empty (add mode)
    if (!initialValues || Object.keys(initialValues).length === 0) {
      form.resetFields();
      setSubjects([{
        key: `subject-${Date.now()}`,
        subject: '',
        subjectName: 'Subject',
        examType: 'theory',
        marksObtained: 0,
        maxMarks: 100,
        passingMarks: 40,
        grade: 'F',
        isPassed: false,
        attendance: 'present'
      }]);
      return;
    }
    
    // Handle edit mode with initial values
    if (initialValues) {
      // If we have subjectResults in initialValues (editing existing result)
      if (initialValues.subjectResults && initialValues.subjectResults.length > 0) {
        console.log('Setting initial subjects from subjectResults:', initialValues.subjectResults);
        
        // First, ensure we have the subject data loaded
        const loadSubjectData = async () => {
          try {
            const courseId = initialValues.course?._id || initialValues.course;
            if (courseId) {
              await fetchUgpgSubjects(courseId, initialValues.semester);
              
              // After loading subjects, format them with proper names
              const formattedSubjects = initialValues.subjectResults.map(sub => {
                const subject = ugpgSubjects.find(s => s._id === (sub.subject?._id || sub.subject));
                return {
                  ...sub,
                  subject: sub.subject?._id || sub.subject,
                  subjectName: subject?.name || sub.subject?.name || 'Subject',
                  examType: sub.examType || 'theory',
                  marksObtained: sub.marksObtained || 0,
                  maxMarks: sub.maxMarks || 100,
                  passingMarks: sub.passingMarks || 40,
                  grade: sub.grade || 'F',
                  isPassed: sub.isPassed || false,
                  attendance: sub.attendance || 'present',
                  key: sub._id || `subject-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                };
              });
              
              setSubjects(formattedSubjects);
              form.setFieldsValue({ subjects: formattedSubjects });
            }
          } catch (error) {
            console.error('Error loading subject data:', error);
          }
        };
        
        loadSubjectData();
      } 
      // If we have subjects array in initialValues
      else if (initialValues.subjects && initialValues.subjects.length > 0) {
        console.log('Setting initial subjects from subjects array:', initialValues.subjects);
        const formattedSubjects = initialValues.subjects.map((sub, index) => ({
          ...sub,
          key: sub.key || `subject-${index}-${Date.now()}`,
          subjectName: sub.subjectName || 'Subject'
        }));
        
        setSubjects(formattedSubjects);
        form.setFieldsValue({ subjects: formattedSubjects });
      } 
      // If no subjects, add an empty one
      else {
        console.log('No initial subjects found, adding default subject');
        const newSubject = {
          key: `subject-${Date.now()}`,
          subject: '',
          subjectName: 'Subject',
          examType: 'theory',
          marksObtained: 0,
          maxMarks: 100,
          passingMarks: 40,
          grade: 'F',
          isPassed: false,
          attendance: 'present'
        };
        setSubjects([newSubject]);
        form.setFieldsValue({ subjects: [newSubject] });
      }
      
      // Set other form values
      const formValues = { ...initialValues };
      
      // Handle course
      if (initialValues.course) {
        const courseId = initialValues.course?._id || initialValues.course;
        console.log('Setting initial course:', courseId);
        setSelectedCourse(courseId);
        formValues.course = courseId;
        
        // Only fetch subjects if we don't have any saved subjects
        if (!initialValues.subjectResults || initialValues.subjectResults.length === 0) {
          fetchUgpgSubjects(courseId, initialValues.semester);
        }
      }
      
      // Handle student
      if (initialValues.student) {
        const studentId = initialValues.student?._id || initialValues.student;
        const studentName = initialValues.student?.user?.name || 
                          `${initialValues.student.firstName || ''} ${initialValues.student.lastName || ''}`.trim();
        
        console.log('Setting initial student:', { id: studentId, name: studentName });
        
        // Add student to the students list if not already present
        setStudents(prev => {
          const studentExists = prev.some(s => s._id === studentId);
          if (!studentExists && initialValues.student) {
            return [...prev, initialValues.student];
          }
          return prev;
        });
        
        setFilteredStudents(prev => {
          const studentExists = prev.some(s => s._id === studentId);
          if (!studentExists && initialValues.student) {
            return [...prev, initialValues.student];
          }
          return prev;
        });
        
        setSelectedStudent({
          value: studentId,
          label: studentName
        });
        
        form.setFieldsValue({
          studentId: studentId,
          studentName: studentName
        });
      }
      
      // Set all form values
      form.setFieldsValue(formValues);
    }
    
    // Initialize filtered students
    if (students && students.length > 0) {
      setFilteredStudents(students);
    }
  }, [initialValues, form, courses, examSessions, students, fetchUgpgSubjects]);

  const handleCourseChange = async (courseId) => {
    if (!courseId) {
      setUgpgSubjects([]);
      setSelectedCourse('');
      form.setFieldsValue({ subjects: [] });
      setSubjects([]);
      return;
    }

    setSelectedCourse(courseId);
    setStudentLoading(true);
    setStudentError(null);
    
    try {
      // Get the selected semester
      const semester = form.getFieldValue('semester');
      
      // Fetch subjects for the selected course and semester
      await fetchUgpgSubjects(courseId, semester);
      
      // Initialize with one empty subject
      const newSubject = {
        subject: '',
        examType: 'theory',
        marksObtained: 0,
        maxMarks: 100,
        passingMarks: 40,
        grade: 'F',
        isPassed: false,
        attendance: 'present'
      };
      
      // Update both form and local state
      setSubjects([newSubject]);
      form.setFieldsValue({ subjects: [newSubject] });
      
      // If there's a selected student, try to find matching exam sessions
      const studentId = form.getFieldValue('studentId');
      if (studentId) {
        const student = students.find(s => s._id === studentId);
        if (student) {
          // Find exam sessions for this course and student's batch
          const studentBatch = student.batch;
          const sessions = Array.isArray(examSessions) ? examSessions : [];
          const relevantSessions = sessions.filter(session => 
            session.courseId === courseId && 
            (!studentBatch || !session.batch || session.batch === studentBatch)
          );
          
          if (relevantSessions.length > 0) {
            // Set the most recent session as default
            const latestSession = relevantSessions.sort((a, b) => 
              new Date(b.examDate || 0) - new Date(a.examDate || 0)
            )[0];
            
            form.setFieldsValue({
              examSession: latestSession._id
            });
          }
        }
      }
    } catch (error) {
      console.error('Error in handleCourseChange:', error);
      message.error('Failed to load course details');
    }
  };

  const handleStudentSearch = async (value) => {
    try {
      setStudentLoading(true);
      setStudentError(null);
      
      if (!value) {
        // If search is cleared, show all students
        setFilteredStudents(students);
        return;
      }
      
      // Search students by name or enrollment number in local state first
      const searchTerm = value.toLowerCase();
      const filtered = students.filter(student => {
        const studentName = student.user?.name?.toLowerCase() || 
                          `${student.firstName || ''} ${student.lastName || ''}`.toLowerCase();
        const enrollmentNumber = student.enrollmentNumber?.toLowerCase() || '';
        return (
          studentName.includes(searchTerm) ||
          enrollmentNumber.includes(searchTerm)
        );
      });
      
      // If no results in local state, try searching the API
      if (filtered.length === 0) {
        console.log('No local results, searching API...');
        const searchResults = await fetchStudents({
          $or: [
            { 'user.name': { $regex: searchTerm, $options: 'i' } },
            { enrollmentNumber: { $regex: searchTerm, $options: 'i' } },
            { firstName: { $regex: searchTerm, $options: 'i' } },
            { lastName: { $regex: searchTerm, $options: 'i' } }
          ]
        });
        // No need to setFilteredStudents here as fetchStudents already does it
      } else {
        setFilteredStudents(filtered);
      }
    } catch (error) {
      console.error('Error in handleStudentSearch:', error);
      message.error('Failed to search students');
      setStudentError('Error searching students');
    } finally {
      setStudentLoading(false);
    }
  };

  const handleStudentSelect = async (value) => {
    try {
      const studentId = value?.value || value;
      console.log('handleStudentSelect - studentId:', studentId);
      if (!studentId) {
        setSelectedStudent(null);
        form.setFieldsValue({ studentId: null });
        return;
      }
      
      const selected = students.find(s => s._id === studentId);
      console.log('handleStudentSelect - selected student:', selected);
      if (!selected) return;
      
      // Construct full name from firstName and lastName
      const studentName = [
        selected.firstName || '',
        selected.middleName || '',
        selected.lastName || ''
      ].filter(Boolean).join(' ');
      console.log('handleStudentSelect - studentName:', studentName);
      
      // Store the full student object for later use
      setSelectedStudent({
        ...selected,
        value: studentId,
        label: studentName
      });
      
      form.setFieldsValue({ 
        studentId: studentId,
        studentName: studentName 
      });
      
      // Handle semester change
      const handleSemesterChange = async (value) => {
        form.setFieldsValue({ semester: value });
        
        // Get the current course ID
        const courseId = form.getFieldValue('course');
        
        // If we have a course selected, refresh the subjects with the new semester filter
        if (courseId) {
          await fetchUgpgSubjects(courseId, value);
        }
      };
      
      // If student has a course, update the course field and fetch subjects
      if (selected.course) {
        const courseId = selected.course._id || selected.course;
        form.setFieldsValue({ course: courseId });
        setSelectedCourse(courseId);
        setStudentLoading(true);
        setStudentError(null);
        
        try {
          // Fetch subjects for the selected course
          await fetchUgpgSubjects(courseId);
          
          // Log relevant exam sessions if available
          if (Array.isArray(examSessions) && examSessions.length > 0) {
            const relevantSessions = examSessions.filter(session => 
              session.courseId === courseId || 
              (session.courseId?._id === courseId)
            );
            console.log('Relevant exam sessions:', relevantSessions);
          }
        } catch (error) {
          console.error('Error fetching subjects:', error);
          message.error('Failed to load course subjects');
          throw error; // Re-throw to be caught by the outer catch
        } finally {
          setStudentLoading(false);
        }
      } else {
        // If student has no course, clear subjects
        setUgpgSubjects([]);
        form.setFieldsValue({ subjects: [] });
      }
    } catch (error) {
      console.error('Error in handleStudentSelect:', error);
      message.error('Failed to load student details');
      setStudentError(error.message);
    }
  };

  const handleSubjectChange = (index, field, value, subjectId) => {
    const currentSubjects = [...(form.getFieldValue('subjects') || [])];
    const updatedSubjects = [...currentSubjects];
    
    // Initialize the subject object if it doesn't exist
    if (!updatedSubjects[index]) {
      updatedSubjects[index] = {
        subject: '',
        examType: 'theory',
        marksObtained: 0,
        maxMarks: 100,
        passingMarks: 40,
        grade: 'F',
        isPassed: false
      };
    }
    
    if (field === 'subject' && value) {
      const subject = ugpgSubjects.find(s => s._id === value || s._id === value._id);
      if (subject) {
        // Determine default exam type based on subject configuration
        let defaultExamType = 'theory';
        let defaultMaxMarks = 100; // Default fallback
        
        if (subject.hasTheory) {
          defaultExamType = 'theory';
          defaultMaxMarks = subject.theoryMaxMarks || 100;
        } else if (subject.hasPractical) {
          defaultExamType = 'practical';
          defaultMaxMarks = subject.practicalMaxMarks || 100;
        }
        
        // Update the subject with default values
        updatedSubjects[index] = {
          ...updatedSubjects[index],
          subject: value,
          examType: defaultExamType,
          maxMarks: defaultMaxMarks,
          marksObtained: 0,
          subjectConfig: {
            hasTheory: subject.hasTheory,
            theoryMaxMarks: subject.theoryMaxMarks,
            hasPractical: subject.hasPractical,
            practicalMaxMarks: subject.practicalMaxMarks
          }
        };
      }
    } else if (field === 'examType') {
      // When exam type changes, update max marks accordingly
      const subjectId = updatedSubjects[index]?.subject?._id || updatedSubjects[index]?.subject;
      if (subjectId) {
        const subject = ugpgSubjects.find(s => s._id === subjectId);
        if (subject) {
          const isTheory = value === 'theory';
          const newMaxMarks = isTheory ? 75 : (subject.practicalMaxMarks || 100);
          const newPassingMarks = Math.ceil(newMaxMarks * 0.4); // 40% of max marks
          
          updatedSubjects[index] = {
            ...updatedSubjects[index],
            examType: value,
            maxMarks: newMaxMarks,
            passingMarks: newPassingMarks,
            marksObtained: 0, // Reset marks when exam type changes
            isPassed: false, // Reset pass status
            grade: 'F' // Reset grade
          };
        }
      }
    } else {
      // For other fields, just update the value
      updatedSubjects[index] = {
        ...updatedSubjects[index],
        [field]: value
      };
    }
    
    // Calculate grade based on percentage
    if ((field === 'marksObtained' || field === 'maxMarks' || field === 'examType' || field === 'passingMarks') && 
        updatedSubjects[index].marksObtained !== undefined && 
        updatedSubjects[index].maxMarks > 0) {
      const marksObtained = parseFloat(updatedSubjects[index].marksObtained) || 0;
      const maxMarks = parseFloat(updatedSubjects[index].maxMarks) || 100;
      const percentage = maxMarks > 0 ? (marksObtained / maxMarks) * 100 : 0;
      const passingMarks = parseFloat(updatedSubjects[index].passingMarks) || Math.ceil(maxMarks * 0.4);
      
      let grade = 'F';
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B+';
      else if (percentage >= 60) grade = 'B';
      else if (percentage >= 50) grade = 'C';
      else if (percentage >= 40) grade = 'D';
      
      updatedSubjects[index].grade = grade;
      updatedSubjects[index].isPassed = percentage >= 40 && marksObtained >= passingMarks;
      updatedSubjects[index].percentage = parseFloat(percentage.toFixed(2));
    }
    
    // Update the form with the modified subjects
    form.setFieldsValue({
      subjects: updatedSubjects.map(subj => ({
        ...subj,
        maxMarks: subj.maxMarks || 100
      }))
    });
    
    // Update the local state
    setSubjects(updatedSubjects);
  };

  const handleAddSubject = () => {
    const isTheory = true; // Default to theory for new subjects
    const defaultMaxMarks = 75; // Default max marks for theory
    const defaultPassingMarks = Math.ceil(defaultMaxMarks * 0.4); // 40% of max marks
    
    const newSubject = {
      subject: '',
      examType: 'theory',
      marksObtained: 0,
      maxMarks: defaultMaxMarks,
      passingMarks: defaultPassingMarks,
      grade: 'F',
      isPassed: false,
      attendance: 'present' // Default to present
    };
    
    // Get current subjects from form
    const currentFormSubjects = form.getFieldValue('subjects') || [];
    const updatedSubjects = [...currentFormSubjects, newSubject];
    
    // Update form values first
    form.setFieldsValue({
      subjects: updatedSubjects
    });
    
    // Then update local state
    setSubjects(updatedSubjects);
    
    console.log('Added new subject. Current subjects:', updatedSubjects);
  };

  const handleRemoveSubject = (index) => {
    // Get current subjects from form
    const currentFormSubjects = [...(form.getFieldValue('subjects') || [])];
    
    // Remove the subject at the specified index
    currentFormSubjects.splice(index, 1);
    
    // Update form values
    form.setFieldsValue({
      subjects: currentFormSubjects
    });
    
    // Update local state
    setSubjects(currentFormSubjects);
    
    console.log('Removed subject at index', index, '. Remaining subjects:', currentFormSubjects);
  };

  // Validate marks against subject configuration
  const validateMarks = (subject, subjectData) => {
    if (!subject || !subjectData) return true; // Skip validation if subject not found
    
    if (subject.examType === 'theory' && subjectData.hasTheory) {
      return subject.marksObtained >= 0 && subject.marksObtained <= subjectData.theoryMaxMarks;
    } 
    
    if (subject.examType === 'practical' && subjectData.hasPractical) {
      return subject.marksObtained >= 0 && subject.marksObtained <= subjectData.practicalMaxMarks;
    }
    
    return true; // For other exam types, use default validation
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      setError(null);
      
      // Ensure subjects array exists and is not empty
      if (!values.subjects || !Array.isArray(values.subjects) || values.subjects.length === 0) {
        message.error('Please add at least one subject');
        setLoading(false);
        return;
      }
      
      // Filter out any invalid or empty subjects and validate required fields
      const validSubjects = values.subjects.map((subject, index) => {
        if (!subject) return null;
        
        const subjectId = subject.subject?._id || subject.subject;
        if (!subjectId) {
          message.error(`Subject at position ${index + 1} is missing a subject selection`);
          return null;
        }
        
        const subjectData = ugpgSubjects.find(s => s._id === subjectId);
        if (!subjectData) {
          message.error(`Invalid subject at position ${index + 1}`);
          return null;
        }
        
        if (subject.marksObtained === undefined || subject.marksObtained === null) {
          message.error(`Please enter marks for ${subjectData.name || 'the selected subject'}`);
          return null;
        }
        
        return {
          ...subject,
          subject: subjectId,
          subjectName: subjectData.name
        };
      }).filter(Boolean);
      
      if (validSubjects.length === 0) {
        message.error('Please add at least one valid subject with marks');
        setLoading(false);
        return;
      }
      
      // Update the form with validated subjects
      form.setFieldsValue({ subjects: validSubjects });
      setSubjects(validSubjects);
      
      // Validate marks against subject configuration
      const invalidSubjects = [];
      values.subjects.forEach((formSubject, index) => {
        if (!formSubject) return;
        
        const subjectId = formSubject.subject?._id || formSubject.subject;
        const subjectData = ugpgSubjects.find(s => s._id === subjectId);
        
        if (subjectData) {
          const marksObtained = formSubject.marksObtained || 0;
          const maxMarks = formSubject.examType === 'theory' ? 
            (subjectData.theoryMaxMarks || 0) : 
            (subjectData.practicalMaxMarks || 0);
            
          if (marksObtained < 0 || marksObtained > maxMarks) {
            invalidSubjects.push({
              index: index + 1,
              name: subjectData.name,
              examType: formSubject.examType,
              maxMarks: maxMarks
            });
          }
        }
      });
      
      if (invalidSubjects.length > 0) {
        const errorMsg = (
          <div>
            <p>Invalid marks for the following subjects:</p>
            <ul>
              {invalidSubjects.map((sub, i) => (
                <li key={i}>
                  {sub.name} ({sub.examType}): Marks must be between 0 and {sub.maxMarks}
                </li>
              ))}
            </ul>
          </div>
        );
        message.error(errorMsg);
        setLoading(false);
        return;
      }
      
      const selectedStudent = students.find(s => s._id === values.studentId);
      if (!selectedStudent) {
        message.error('Selected student not found');
        setLoading(false);
        return;
      }

      // Prepare the result data for submission
      // Extract exam session ID - handle both object and ID formats
      const getExamSessionId = (examSession) => {
        if (!examSession) return null;
        if (typeof examSession === 'string') return examSession;
        if (examSession._id) return examSession._id;
        if (examSession.value) return examSession.value;
        return null;
      };

      // Construct full name from selected student's firstName and lastName
      const studentName = selectedStudent ? [
        selectedStudent.firstName || '',
        selectedStudent.middleName || '',
        selectedStudent.lastName || ''
      ].filter(Boolean).join(' ') : '';
      
      console.log('Form submission - selectedStudent:', selectedStudent);
      console.log('Form submission - studentName:', studentName);
      
      if (!studentName) {
        console.error('Student name is missing in selectedStudent:', selectedStudent);
        throw new Error('Student name is required. Please select a student.');
      }

      // Prepare subject results with all required fields
      const subjectResults = values.subjects.map(formSubject => {
        if (!formSubject) return null;
        
        const subjectId = formSubject.subject?._id || formSubject.subject;
        if (!subjectId) return null;

        // Find the subject to get its details
        const subject = ugpgSubjects.find(s => s._id === subjectId);
        
        // Calculate grade and passing status if not already set
        const maxMarks = formSubject.maxMarks || 
                        (formSubject.examType === 'theory' ? 
                          (subject?.theoryMaxMarks || 100) : 
                          (subject?.practicalMaxMarks || 100));
        
        const marksObtained = formSubject.attendance === 'absent' ? 0 : (formSubject.marksObtained || 0);
        const passingMarks = formSubject.passingMarks || Math.ceil(maxMarks * 0.4);
        const percentage = maxMarks > 0 ? (marksObtained / maxMarks) * 100 : 0;
        
        // Calculate grade
        let grade = 'F';
        if (percentage >= 90) grade = 'A+';
        else if (percentage >= 80) grade = 'A';
        else if (percentage >= 70) grade = 'B+';
        else if (percentage >= 60) grade = 'B';
        else if (percentage >= 50) grade = 'C';
        else if (percentage >= 40) grade = 'D';
        
        const isPassed = percentage >= 40;

        return {
          subject: subjectId,
          marksObtained: marksObtained,
          maxMarks: maxMarks,
          passingMarks: passingMarks,
          examType: formSubject.examType || 'theory',
          attendance: formSubject.attendance || 'present',
          grade: grade,
          isPassed: isPassed,
          percentage: parseFloat(percentage.toFixed(2))
        };
      }).filter(Boolean); // Remove any null entries
      
      console.log('Prepared subjectResults:', subjectResults);
      
      // Check if we have any valid subjects
      if (subjectResults.length === 0) {
        throw new Error('No valid subjects found to submit');
      }
      
      // Calculate overall result
      const totalMarksObtained = subjectResults.reduce((sum, sub) => sum + (sub.marksObtained || 0), 0);
      const totalMaxMarks = subjectResults.reduce((sum, sub) => sum + (sub.maxMarks || 0), 0);
      const overallPercentage = subjectResults.length > 0 ? 
        parseFloat((subjectResults.reduce((sum, sub) => sum + (sub.percentage || 0), 0) / subjectResults.length).toFixed(2)) : 
        0;
      
      const resultData = {
        studentId: values.studentId,
        studentName: studentName,
        courseId: values.course,
        semester: values.semester,
        examSessionId: getExamSessionId(values.examSession),
        remarks: values.remarks || '',
        subjectResults: subjectResults,
        totalMarksObtained: totalMarksObtained,
        totalMaxMarks: totalMaxMarks,
        percentage: overallPercentage,
        status: subjectResults.every(sub => sub.isPassed) ? 'PASS' : 'FAIL'
      };
      
      console.log('Submitting result data:', resultData);
      
      // Submit the form
      console.log('Submitting form with data:', JSON.stringify(resultData, null, 2));
      let response;
      if (initialValues?._id) {
        console.log('Updating existing result with ID:', initialValues._id);
        try {
          response = await updateResult(initialValues._id, resultData);
          console.log('Update API Response:', JSON.stringify(response, null, 2));
          
          if (response?.success) {
            console.log('Update successful, response data:', response.data);
            message.success('Result updated successfully');
            
            // Log the updated data that was sent to the server
            console.log('Updated data sent to server:', {
              ...resultData,
              subjectResults: resultData.subjectResults?.map(sub => ({
                ...sub,
                subject: typeof sub.subject === 'object' ? sub.subject._id : sub.subject
              }))
            });
          } else {
            console.error('Update failed:', response?.message);
            throw new Error(response?.message || 'Failed to update result');
          }
        } catch (error) {
          console.error('Error in update API call:', {
            message: error.message,
            response: error.response?.data,
            stack: error.stack
          });
          throw error;
        }
      } else {
        response = await createResult(resultData);
        console.log('Create response:', response);
        if (response?.success) {
          message.success('Result created successfully');
        } else {
          throw new Error(response?.message || 'Failed to create result');
        }
      }
      
      // Call success callback if provided with the updated result data
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      return response;
    } catch (error) {
      console.error('Error saving result:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save result';
      message.error(errorMessage);
      setStudentError(`Submission failed: ${errorMessage}`);
      throw error; // Re-throw to allow form to catch it
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      render: (_, record, index) => {
        // Get the current subject ID from the record
        const subjectId = record.subject?._id || record.subject;
        // Find the full subject object
        const subject = ugpgSubjects.find(s => s._id === subjectId);
        
        // Get the display name for the selected subject
        const displayName = subject?.name || 
                          record.subject?.name || 
                          (typeof record.subject === 'string' ? 'Loading...' : 'Select subject');
        
        return (
          <Form.Item
            name={['subjects', index, 'subject']}
            rules={[{ required: true, message: 'Please select subject' }]}
            noStyle
          >
            <Select
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toString().toLowerCase().includes(input.toLowerCase())
              }
              style={{ width: '100%' }}
              placeholder={loadingSubjects ? 'Loading subjects...' : 'Select subject'}
              loading={loadingSubjects}
              onChange={(value) => {
                // Update both the form value and the subject name
                const selectedSubject = ugpgSubjects.find(s => s._id === value);
                if (selectedSubject) {
                  // Update the subject name in the form
                  const updatedSubjects = [...subjects];
                  updatedSubjects[index] = {
                    ...updatedSubjects[index],
                    subject: selectedSubject._id,
                    subjectName: selectedSubject.name
                  };
                  setSubjects(updatedSubjects);
                  
                  // Update the form values
                  form.setFieldsValue({
                    subjects: updatedSubjects.map(s => ({
                      ...s,
                      subject: s.subject,
                      subjectName: s.subjectName
                    }))
                  });
                }
              }}
              value={subjectId}
            >
              {ugpgSubjects && ugpgSubjects.length > 0 ? (
                ugpgSubjects.map((subject) => {
                  // Create a display label with both name and ID
                  const label = [
                    `${subject.name} (ID: ${subject._id})`,
                    subject.code && `[${subject.code}]`,
                    subject.school?.name && `[${subject.school.name}]`,
                    subject.hasTheory && subject.hasPractical ? 
                      `(T:${subject.theoryMaxMarks}/P:${subject.practicalMaxMarks})` :
                      subject.hasTheory ? `(Theory: ${subject.theoryMaxMarks} marks)` :
                      subject.hasPractical ? `(Practical: ${subject.practicalMaxMarks} marks)` : ''
                  ].filter(Boolean).join(' ');
                  
                  return (
                    <Option 
                      key={subject._id} 
                      value={subject._id}
                      title={`${subject.description || ''}\nTheory: ${subject.hasTheory ? 'Yes' : 'No'}${subject.hasTheory ? ` (${subject.theoryMaxMarks} marks)` : ''}\nPractical: ${subject.hasPractical ? 'Yes' : 'No'}${subject.hasPractical ? ` (${subject.practicalMaxMarks} marks)` : ''}`}
                    >
                      {label}
                    </Option>
                  );
                })
              ) : (
                <Option key="no-subjects" disabled>
                  {selectedCourse 
                    ? 'No active subjects found for this course' 
                    : 'Please select a course first'}
                </Option>
              )}
            </Select>
          </Form.Item>
        );
      },
    },
    {
      title: 'Exam Type',
      dataIndex: 'examType',
      key: 'examType',
      width: 200,
      render: (_, record, index) => {
        const subjectId = record.subject || form.getFieldValue(['subjects', index, 'subject']);
        const subject = ugpgSubjects.find(s => s?._id === subjectId || s?._id === subjectId?._id);
        
        if (!subject) {
          return <span style={{ color: '#ff4d4f' }}>Select subject first</span>;
        }
        
        // Determine available exam types based on subject configuration
        const availableExamTypes = [];
        
        if (subject.hasTheory) {
          availableExamTypes.push({
            value: 'theory',
            label: `Theory (${subject.theoryMaxMarks} marks)`,
            maxMarks: subject.theoryMaxMarks
          });
        }
        
        if (subject.hasPractical) {
          availableExamTypes.push({
            value: 'practical',
            label: `Practical (${subject.practicalMaxMarks} marks)`,
            maxMarks: subject.practicalMaxMarks
          });
        }
        
        // If no theory or practical, allow other exam types
        if (availableExamTypes.length === 0) {
          availableExamTypes.push(
            { value: 'viva', label: 'Viva', maxMarks: 100 },
            { value: 'project', label: 'Project', maxMarks: 100 },
            { value: 'assignment', label: 'Assignment', maxMarks: 100 }
          );
        }
        
        // Get current values from form
        const currentSubjects = form.getFieldValue('subjects') || [];
        const currentSubject = currentSubjects[index] || {};
        
        // Set default exam type if not set
        if (!currentSubject.examType && availableExamTypes.length > 0) {
          const updatedSubjects = [...currentSubjects];
          updatedSubjects[index] = {
            ...updatedSubjects[index],
            examType: availableExamTypes[0].value,
            maxMarks: availableExamTypes[0].maxMarks
          };
          form.setFieldsValue({ subjects: updatedSubjects });
        }
        
        return (
          <Form.Item
            name={['subjects', index, 'examType']}
            rules={[{ required: true, message: 'Required' }]}
            noStyle
          >
            <Select 
              style={{ width: '100%' }}
              onChange={(value) => {
                const selectedExam = availableExamTypes.find(t => t.value === value);
                const updatedSubjects = [...(form.getFieldValue('subjects') || [])];
                updatedSubjects[index] = {
                  ...(updatedSubjects[index] || {}),
                  examType: value,
                  maxMarks: selectedExam?.maxMarks || 100,
                  marksObtained: 0 // Reset marks when exam type changes
                };
                form.setFieldsValue({ subjects: updatedSubjects });
              }}
              placeholder="Select exam type"
              value={currentSubject.examType}
            >
              {availableExamTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        );
      },
    },
    {
      title: 'Marks Obtained',
      dataIndex: 'marksObtained',
      key: 'marksObtained',
      width: 150,
      render: (_, record, index) => (
        <Form.Item
          name={['subjects', index, 'marksObtained']}
          rules={[{ required: true, message: 'Required' }]}
          initialValue={0}
          noStyle
        >
          <InputNumber
            min={0}
            max={record.maxMarks || 100}
            style={{ width: '100%' }}
            onChange={(value) => handleSubjectChange(index, 'marksObtained', value)}
          />
        </Form.Item>
      ),
    },
    {
      title: 'Max Marks',
      dataIndex: 'maxMarks',
      key: 'maxMarks',
      width: 100,
      render: (_, record, index) => {
        const isTheory = record.examType === 'theory';
        const maxAllowedMarks = isTheory ? 75 : 100;
        
        return (
          <Form.Item
            name={['subjects', index, 'maxMarks']}
            rules={[{
              required: true,
              message: 'Required'
            }, {
              validator: (_, value) => {
                if (isTheory && value !== 75) {
                  return Promise.reject('Max marks for theory must be 75');
                }
                return Promise.resolve();
              }
            }]}
            initialValue={isTheory ? 75 : (record.maxMarks || 100)}
            noStyle
          >
            <InputNumber
              min={1}
              max={maxAllowedMarks}
              style={{ width: '100%' }}
              onChange={(value) => {
                const finalValue = isTheory ? 75 : value;
                handleSubjectChange(index, 'maxMarks', finalValue);
              }}
            />
          </Form.Item>
        );
      },
    },
    {
      title: 'Passing Marks',
      dataIndex: 'passingMarks',
      key: 'passingMarks',
      width: 120,
      render: (_, record, index) => {
        const isTheory = record.examType === 'theory';
        const maxMarks = isTheory ? 75 : (record.maxMarks || 100);
        
        return (
          <Form.Item
            name={['subjects', index, 'passingMarks']}
            rules={[{ 
              required: true, 
              message: 'Required' 
            }, {
              validator: (_, value) => {
                if (value > maxMarks) {
                  return Promise.reject(`Passing marks cannot exceed ${maxMarks}`);
                }
                return Promise.resolve();
              }
            }]}
            initialValue={Math.ceil(maxMarks * 0.4)}
            noStyle
          >
            <InputNumber
              min={0}
              max={maxMarks}
              style={{ width: '100%' }}
              onChange={(value) => handleSubjectChange(index, 'passingMarks', value)}
            />
          </Form.Item>
        );
      },
    },
    {
      title: 'Attendance',
      dataIndex: 'attendance',
      key: 'attendance',
      width: 120,
      render: (_, record, index) => (
        <Form.Item
          name={['subjects', index, 'attendance']}
          rules={[{ required: true, message: 'Required' }]}
          initialValue="present"
          noStyle
        >
          <Select style={{ width: '100%' }}>
            <Option value="present">Present</Option>
            <Option value="absent">Absent</Option>
          </Select>
        </Form.Item>
      ),
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
      width: 100,
      render: (grade) => (
        <Tag color={grade === 'F' ? 'red' : 'green'}>
          {grade}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 80,
      render: (_, __, index) => (
        <Button
          type="text"
          danger
          icon={<MinusCircleOutlined />}
          onClick={() => handleRemoveSubject(index)}
        />
      ),
    },
  ];

  // Show error card if there's a student error
  if (studentError) {
    return (
      <Card title="Error Loading Form">
        <Alert
          message="Error Loading Students"
          description={`Failed to load student data: ${studentError}. Please try refreshing the page.`}
          type="error"
          showIcon
          action={
            <Button type="primary" onClick={() => window.location.reload()}>
              Refresh Page
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={initialValues}
    >
      {studentLoading && (
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <Spin tip="Loading students..." size="large" />
        </div>
      )}
      <Card title="Student Information" className="mb-4">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="studentId"
              label="Student"
              rules={[{ required: true, message: 'Please select student' }]}
            >
              <div>
                <Select
                  showSearch
                  placeholder="Search student by name..."
                  optionFilterProp="children"
                  onSearch={handleStudentSearch}
                  onChange={handleStudentSelect}
                  filterOption={false}
                  style={{ 
                    width: '100%',
                    textAlign: 'left',
                    height: '40px',
                    borderRadius: '6px'
                  }}
                  dropdownStyle={{
                    padding: '8px 0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                  notFoundContent={
                    studentLoading 
                      ? <div style={{ padding: '8px 16px', color: '#666' }}>Searching...</div>
                      : studentError 
                        ? <div style={{ padding: '8px 16px', color: '#ff4d4f' }}>Error loading students</div>
                        : <div style={{ padding: '8px 16px', color: '#666' }}>No students found</div>
                  }
                  loading={studentLoading}
                  disabled={studentLoading}
                  allowClear
                  showArrow={!studentLoading}
                  value={selectedStudent?.value || form.getFieldValue('studentId')}
                  labelInValue
                  optionLabelProp="label"
                >
                  {Array.isArray(filteredStudents) && filteredStudents.length > 0 ? (
                  filteredStudents.map(student => {
                    if (!student) return null;
                    
                    const studentName = student.user?.name || 
                                     `${student.firstName || ''} ${student.lastName || ''}`.trim();
                    
                    return (
                      <Option 
                        key={student._id || Math.random().toString(36).substr(2, 9)}
                        value={student._id}
                        label={studentName}
                        title={studentName}
                        style={{ 
                          padding: '8px 12px',
                          margin: '2px 0'
                        }}
                      >
                        <div style={{ 
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontWeight: 500,
                          padding: '4px 0'
                        }}>
                          {studentName}
                        </div>
                      </Option>
                    );
                  })
                ) : (
                  <Option disabled value="no-students">
                    No students found
                  </Option>
                )}
                </Select>
                {studentError && (
                  <div style={{ color: '#ff4d4f', marginTop: '4px', fontSize: '12px' }}>
                    {studentError}
                  </div>
                )}
              </div>
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              name="course"
              label="Course"
              rules={[{ required: true, message: 'Please select course' }]}
            >
              <Select
                placeholder="Select Course"
                onChange={handleCourseChange}
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  (option.children?.toString() || '').toLowerCase().includes(input.toLowerCase())
                }
                style={{ width: '100%' }}
                notFoundContent={loading ? 'Loading...' : 'No courses found'}
                loading={loading}
              >
                {courses && courses.length > 0 ? (
                  courses.map(course => {
                    const displayLabel = [
                      course.courseName || course.name,
                      course.courseType && `(${course.courseType})`,
                      course.school?.name && `- ${course.school.name}`
                    ].filter(Boolean).join(' ');
                    
                    return (
                      <Option 
                        key={course._id}
                        value={course._id}
                        label={displayLabel}
                      >
                        {displayLabel}
                      </Option>
                    );
                  })
                ) : (
                  <Option disabled value="">
                    {loading ? 'Loading courses...' : 'No courses available'}
                  </Option>
                )}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={6}>
            <Form.Item
              name="semester"
              label="Semester"
              rules={[{ required: true, message: 'Please select semester' }]}
            >
              <Select 
                placeholder="Select Semester"
                onChange={async (value) => {
                  const courseId = form.getFieldValue('course');
                  if (courseId) {
                    await fetchUgpgSubjects(courseId, value);
                  }
                }}
              >
                {[...Array(8).keys()].map(sem => (
                  <Option key={sem + 1} value={sem + 1}>
                    Semester {sem + 1}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="examSession"
              label="Exam Session"
              rules={[{ required: true, message: 'Please select exam session' }]}
            >
              <Select
                placeholder="Select Exam Session"
                showSearch
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
                labelInValue
                loading={loading}
                style={{ width: '100%' }}
              >
                {!Array.isArray(examSessions) || examSessions.length === 0 ? (
                  <Option disabled value="no-sessions">
                    No exam sessions available
                  </Option>
                ) : (
                  // Sort by exam date (newest first)
                  [...examSessions]
                    .sort((a, b) => new Date(b.examDate || 0) - new Date(a.examDate || 0))
                    .map(session => {
                      const sessionId = session._id || session.value;
                      const sessionName = session.name || session.label || 
                                       `Session ${sessionId?.substring(0, 6) || ''}`;
                      
                      return (
                        <Option 
                          key={sessionId}
                          value={sessionId}
                          label={sessionName}
                        >
                          {sessionName}
                        </Option>
                      );
                    })
                )}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="remarks"
              label="Remarks"
            >
              <Input.TextArea rows={2} placeholder="Any additional remarks" />
            </Form.Item>
          </Col>
        </Row>
      </Card>

      <Card 
        title="Subject-wise Marks"
        className="mb-4"
        extra={
          <Button
            type="dashed"
            onClick={handleAddSubject}
            icon={<PlusOutlined />}
          >
            Add Subject
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={subjects}
          rowKey={(record, index) => index}
          pagination={false}
          size="middle"
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <div className="flex justify-end space-x-4">
        <Button onClick={onCancel}>
          Cancel
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          Save Result
        </Button>
      </div>
    </Form>
  );
};

ResultForm.propTypes = {
  initialValues: PropTypes.object,
  onSuccess: PropTypes.func,
  onCancel: PropTypes.func.isRequired,
  courses: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  })).isRequired,
  examSessions: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    examDate: PropTypes.string
  })).isRequired,
  initialStudents: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    enrollmentNumber: PropTypes.string,
    course: PropTypes.string,
    batch: PropTypes.string
  }))
};

ResultForm.defaultProps = {
  initialValues: {},
  initialStudents: []
};

export default ResultForm;
