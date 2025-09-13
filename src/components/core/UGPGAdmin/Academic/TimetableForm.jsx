import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Card, Row, Col, message, Spin } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import TIMETABLE_API from '../../../../services/timetableApi';
import { showError, showSuccess } from '../../../../utils/helpers';

const { Option } = Select;
const { TextArea } = Input;

const TimetableForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dropdownData, setDropdownData] = useState({
    sessions: [],
    schools: [],
    subjects: [],
    teachers: [],
    courses: [],
  });
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedCourseType, setSelectedCourseType] = useState('');
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  // Course types
  const courseTypes = ["Certificate", "Diploma", "Bachelor Degree", "Master Degree"];
  
  // Days of the week
  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];
  
  // Time slots (example - can be customized)
  const timeSlots = [
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:15 AM - 12:15 PM',
    '12:15 PM - 01:15 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
    '04:00 PM - 05:00 PM',
  ];

  // Load dropdown data with better error handling
  const loadDropdownData = async () => {
    setLoading(true);
    try {
      console.log('Fetching dropdown data...');
      const data = await TIMETABLE_API.getDropdownData();
      
      if (!data) {
        console.warn('No data received from API');
        return;
      }
      
      // Log detailed information about the received data
      console.log('=== DROPDOWN DATA RECEIVED ===');
      console.log('Sessions:', data.sessions?.length || 0, data.sessions);
      console.log('Schools:', data.schools?.length || 0, data.schools);
      console.log('Subjects:', data.subjects?.length || 0, data.subjects);
      console.log('Teachers:', data.teachers?.length || 0, data.teachers);
      console.log('Courses:', data.courses?.length || 0, data.courses);
      console.log('==============================');
      
      // Process courses to ensure they have the expected structure
      const processedCourses = (Array.isArray(data.courses) ? data.courses : []).map(course => {
        // Ensure semester is properly set based on course type
        const semesterCount = course.semester || (course.durationYear ? 
          (course.courseType?.toLowerCase() === 'yearly' ? course.durationYear : course.durationYear * 2) : 8);
          
        return {
          ...course,
          _id: course._id || course.id,
          courseName: course.courseName || course.name,
          school: course.school?._id || course.school,
          category: course.category || course.type,
          semester: semesterCount // Ensure semester count is set
        };
      });
      
      // Process teachers to ensure consistent structure
      const processedTeachers = (Array.isArray(data.teachers) ? data.teachers : []).map(teacher => ({
        ...teacher,
        _id: teacher._id || teacher.id,
        name: teacher.name || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim(),
        school: teacher.school?._id || teacher.school,
        designation: teacher.designation || 'Teacher',
        email: teacher.email || ''
      }));
      
      console.log('Processed courses:', processedCourses);
      console.log('Processed teachers:', processedTeachers);
      
      setDropdownData({
        sessions: Array.isArray(data.sessions) ? data.sessions : [],
        schools: Array.isArray(data.schools) ? data.schools : [],
        subjects: Array.isArray(data.subjects) ? data.subjects : [],
        teachers: processedTeachers,
        courses: processedCourses
      });
      
      setFilteredSubjects(Array.isArray(data.subjects) ? data.subjects : []);
      setFilteredCourses(processedCourses);
      setFilteredTeachers(processedTeachers);
      
    } catch (error) {
      console.error('Error loading dropdown data:', error);
      // Don't show error toast for missing data, just log it
      if (!error.message?.includes('404')) {
        showError('Failed to load some form data. Some dropdowns may be empty.');
      }
      
      // Initialize with empty arrays to prevent undefined errors
      setDropdownData({
        sessions: [],
        schools: [],
        subjects: [],
        teachers: [],
        courses: []
      });
      setFilteredSubjects([]);
      setFilteredCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // Load timetable data for editing
  const loadTimetableData = async () => {
    if (!isEditMode || !id) return;
    
    try {
      setLoading(true);
      
      // 1. First load the timetable data with all necessary population
      const response = await TIMETABLE_API.getTimetable(id);
      const timetable = response.data;
      
      // Ensure we have the full course data
      if (timetable.course && !timetable.course.name) {
        // If course is just an ID, fetch the full course details
        const courseResponse = await TIMETABLE_API.getCourse(timetable.course._id);
        if (courseResponse.data) {
          timetable.course = { ...timetable.course, ...courseResponse.data };
        }
      }
      
      if (!timetable) {
        throw new Error('Timetable not found');
      }
      
      console.log('Loaded timetable data:', timetable);
      
      console.log('Loaded timetable data:', {
        ...timetable,
        course: timetable.course?._id || timetable.course,
        faculty: timetable.faculty?._id || timetable.faculty,
        school: timetable.school?._id || timetable.school,
        session: timetable.session?._id || timetable.session,
        subject: timetable.subject?._id || timetable.subject,
      });
      
      // 2. Set the course type and school first to enable dependent fields
      if (timetable.courseType) {
        console.log('Setting course type:', timetable.courseType);
        setSelectedCourseType(timetable.courseType);
      }
      
      if (timetable.school?._id || timetable.school) {
        const schoolId = timetable.school?._id || timetable.school;
        console.log('Setting school and updating filters with:', { 
          schoolId,
          courseType: timetable.courseType 
        });
        
        setSelectedSchool(schoolId);
        
        // Wait for state to update
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Update filtered data based on the selected school and course type
        await updateFilteredData(schoolId, timetable.courseType);
        
        // Debug: Log the courses data
        console.log('All courses from dropdownData:', dropdownData.courses);
        console.log('Filtering courses with:', { 
          schoolId, 
          courseType: timetable.courseType,
          coursesCount: dropdownData.courses?.length || 0 
        });
        
        // Wait for courses to be filtered
        const filtered = dropdownData.courses.filter(course => {
          const schoolMatch = course.school?.toString() === schoolId?.toString();
          const typeMatch = course.category === timetable.courseType || 
                          course.courseType === timetable.courseType;
          
          console.log('Course:', { 
            id: course._id || course.id,
            name: course.name || course.courseName,
            school: course.school,
            category: course.category,
            courseType: course.courseType,
            matches: { schoolMatch, typeMatch }
          });
          
          return schoolMatch && typeMatch;
        });
        
        console.log('Filtered courses:', filtered);
        setFilteredCourses(filtered);
        
        // Extract the course ID for comparison
        const courseId = timetable.course?._id || timetable.course;
        console.log('Looking for course with ID:', courseId);
        
        // Find the selected course
        let selectedCourse = null;
        if (typeof courseId === 'string' || courseId?._bsontype === 'ObjectID') {
          // If course is an ID, find the corresponding course object
          selectedCourse = filtered.find(c => {
            const match = (c?._id?.toString() === courseId.toString()) || 
                         (c?.id?.toString() === courseId.toString());
            console.log('Checking course:', { 
              id: c?._id || c?.id, 
              match, 
              courseId: courseId.toString() 
            });
            return match;
          });
        } else if (timetable.course && typeof timetable.course === 'object') {
          // If course is already a populated object
          selectedCourse = timetable.course;
          console.log('Using populated course object:', selectedCourse);
        }
        
        if (selectedCourse) {
          console.log('Found selected course:', selectedCourse);
          setSelectedCourse(selectedCourse);
          
          // Set semester count based on course type
          const semesterCount = selectedCourse.semester || (selectedCourse.durationYear ? 
            (selectedCourse.courseType?.toLowerCase() === 'yearly' ? 
              selectedCourse.durationYear : selectedCourse.durationYear * 2) : 6);
          
          const semesters = Array.from({ length: semesterCount }, (_, i) => `Semester ${i + 1}`);
          setAvailableSemesters(semesters);
          
          // Set the form value for course
          form.setFieldsValue({
            course: selectedCourse._id || selectedCourse.id
          });
        }
      }
      
      // Set all form values after a small delay to ensure dropdowns are populated
      setTimeout(() => {
        // Get the course ID from either the selected course or the timetable data
        const courseId = selectedCourse?._id || selectedCourse?.id || 
                        (timetable.course?._id || timetable.course)?.toString();
                        
        console.log('Setting form values with course data:', { 
          courseId,
          selectedCourse,
          timetableCourse: timetable.course,
          filteredCourses: filteredCourses.map(c => ({ id: c._id || c.id, name: c.name || c.courseName }))
        });
        
        // If we have a course ID but no selected course, try to find it in filteredCourses
        if (courseId && !selectedCourse) {
          const foundCourse = filteredCourses.find(c => 
            (c._id && c._id.toString() === courseId) || 
            (c.id && c.id.toString() === courseId)
          );
          if (foundCourse) {
            setSelectedCourse(foundCourse);
          }
        }
        
        // Set form values
        form.setFieldsValue({
          courseType: timetable.courseType,
          course: courseId ? {
            value: courseId,
            label: selectedCourse ? 
              `${selectedCourse.courseName || selectedCourse.name} (${selectedCourse.courseType || selectedCourse.type || 'N/A'})` : 
              'Loading course...'
          } : undefined,
          session: timetable.session?._id || timetable.session,
          semester: timetable.semester,
          day: timetable.day,
          timeSlot: timetable.timeSlot,
          subject: timetable.subject?._id || timetable.subject,
          teacher: timetable.teacher?._id || timetable.teacher,
          room: timetable.room,
          remarks: timetable.remarks
        });
        
        console.log('Form values set:', form.getFieldsValue());
      }, 200); // Increased delay to ensure all state updates are processed
      
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to load timetable data');
      console.error('Error loading timetable data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle course selection to update available semesters
  const handleCourseChange = (selectedOption) => {
    if (!selectedOption) {
      setSelectedCourse(null);
      setAvailableSemesters([]);
      form.setFieldsValue({ 
        semester: undefined,
        course: undefined
      });
      return;
    }
    
    // selectedOption will be an object with { value, label } when using labelInValue
    const courseId = selectedOption?.value || selectedOption;
    
    // Find the complete course object from filteredCourses
    const course = filteredCourses.find(c => 
      (c._id && c._id.toString() === courseId?.toString()) || 
      (c.id && c.id.toString() === courseId?.toString())
    );
    
    if (course) {
      // Store the complete course object
      setSelectedCourse(course);
      
      // Reset semester when course changes
      form.setFieldsValue({ 
        semester: undefined,
        course: {
          value: course._id || course.id,
          label: `${course.courseName || course.name} (${course.courseType || course.type || 'N/A'})`
        }
      });
      
      // Calculate semester count based on course type
      const semesterCount = course.semester || (course.durationYear ? 
        (course.courseType?.toLowerCase() === 'yearly' ? course.durationYear : course.durationYear * 2) : 6);
      
      // Always show semesters, not years
      const semesters = Array.from({ length: semesterCount }, (_, i) => `Semester ${i + 1}`);
      setAvailableSemesters(semesters);
      
      console.log('Selected course:', course);
      console.log('Available semesters:', semesters);
    } else {
      setSelectedCourse(null);
      setAvailableSemesters([]);
      form.setFieldsValue({ 
        semester: undefined,
        course: undefined
      });
    }
  };

  // Handle school change to filter subjects and courses
  const handleSchoolChange = (value) => {
    // Reset course and semester when school changes
    setSelectedCourse(null);
    setAvailableSemesters([]);
    setSelectedSchool(value);
    form.setFieldsValue({ 
      course: undefined,
      subject: undefined
    });
    
    // Filter courses based on selected school and course type
    if (value && selectedCourseType) {
      const filtered = dropdownData.courses.filter(
        course => course.school.toString() === value.toString() && 
                 course.category === selectedCourseType
      );
      setFilteredCourses(filtered);
      console.log('Filtered courses after school change:', filtered);
    } else {
      setFilteredCourses([]);
    }
  };

  // Handle course type change to filter courses
  const handleCourseTypeChange = (value) => {
    setSelectedCourseType(value);
    setSelectedCourse(null);
    setAvailableSemesters([]);
    form.setFieldsValue({ 
      school: undefined,
      course: undefined,
      subject: undefined,
      semester: undefined
    });
    
    // Filter courses based on selected course type and school
    if (value && selectedSchool) {
      const filtered = dropdownData.courses.filter(
        course => course.category === value && 
                 course.school.toString() === selectedSchool.toString()
      );
      setFilteredCourses(filtered);
      console.log('Filtered courses after course type change:', filtered);
    } else {
      setFilteredCourses([]);
    }
  };

  // Reset form fields when course type or school changes
  const resetFormFields = () => {
    setSelectedCourse(null);
    setAvailableSemesters([]);
    form.setFieldsValue({
      course: undefined,
      subject: undefined,
      semester: undefined
    });
  };

  // Update filtered data based on school and course type
  const updateFilteredData = (schoolId, courseType) => {
    if (!schoolId || !courseType) return;
    
    console.log('Updating filtered data for school:', schoolId, 'course type:', courseType);
    
    // Filter subjects for the selected school
    let filteredSubjects = dropdownData.subjects.filter(subject => {
      if (!subject || !subject.school) return false;
      
      const subjectSchoolId = subject.school?._id || subject.school;
      return subjectSchoolId?.toString() === schoolId.toString();
    });
    
    console.log('Filtered subjects:', {
      total: dropdownData.subjects.length,
      filtered: filteredSubjects.length,
      schoolId,
      subjects: filteredSubjects.map(s => ({ id: s._id, name: s.name, school: s.school }))
    });
    
    setFilteredSubjects(filteredSubjects);

    // Filter teachers based on selected school
    const filteredTeachers = dropdownData.teachers.filter(teacher => {
      if (!teacher || !teacher.school) return false;
      
      const teacherSchoolId = teacher.school?._id || teacher.school;
      return teacherSchoolId?.toString() === schoolId.toString();
    });
    
    console.log('Filtered teachers:', {
      total: dropdownData.teachers.length,
      filtered: filteredTeachers.length,
      schoolId,
      teachers: filteredTeachers.map(t => ({ 
        id: t._id, 
        name: t.name, 
        school: t.school?._id || t.school 
      }))
    });
    
    setFilteredTeachers(filteredTeachers);
    
    // Filter courses based on school and course type
    const filteredCourses = dropdownData.courses.filter(course => {
      if (!course || !course.school) return false;
      
      const courseSchoolId = course.school?._id || course.school;
      return courseSchoolId?.toString() === schoolId.toString() && 
             course.category === courseType;
    });
    
    console.log('Filtered courses:', {
      total: dropdownData.courses.length,
      filtered: filteredCourses.length,
      schoolId,
      courseType,
      courses: filteredCourses.map(c => ({
        id: c._id,
        name: c.courseName || c.name,
        school: c.school?._id || c.school,
        category: c.category || c.type
      }))
    });
    
    setFilteredCourses(filteredCourses);
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      
      const timetableData = {
        ...values,
        // Ensure we're only sending IDs for references
        school: values.school,
        session: values.session,
        subject: values.subject,
        faculty: values.faculty,
        course: values.course,
        semester: values.semester, // Make sure semester is included
      };
      
      console.log('Submitting timetable data:', timetableData); // Debug log
      
      if (isEditMode) {
        await TIMETABLE_API.updateTimetable(id, timetableData);
        showSuccess('Timetable updated successfully');
      } else {
        await TIMETABLE_API.createTimetable(timetableData);
        showSuccess('Timetable created successfully');
      }
      
      // Navigate back to the list
      navigate('/ugpg-admin/academic/timetable');
      
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to save timetable');
      console.error('Error saving timetable:', error);
    }
  };

  // Function to load full course details by ID
  const loadCourseDetails = async (courseId) => {
    if (!courseId) return null;
    
    try {
      // Check if we already have the course in filtered courses
      const existingCourse = filteredCourses.find(c => 
        (c._id && c._id.toString() === courseId.toString())
      );
      
      if (existingCourse) return existingCourse;
      
      // If not found, try to fetch it
      const response = await TIMETABLE_API.getCourse(courseId);
      if (response.data) {
        // Add to filtered courses if not already there
        setFilteredCourses(prev => {
          const exists = prev.some(c => c._id === response.data._id);
          return exists ? prev : [...prev, response.data];
        });
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error loading course details:', error);
      return null;
    }
  };

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await loadDropdownData();
        if (isEditMode) {
          await loadTimetableData();
          
          // After loading timetable, ensure we have full course details
          const formValues = form.getFieldsValue();
          const courseId = formValues.course?.value || formValues.course;
          if (courseId) {
            const courseDetails = await loadCourseDetails(courseId);
            if (courseDetails) {
              setSelectedCourse(courseDetails);
              form.setFieldsValue({
                course: {
                  value: courseDetails._id,
                  label: `${courseDetails.courseName || courseDetails.name || 'Unnamed Course'} (${courseDetails.courseType || courseDetails.type || selectedCourseType || ''})`
                }
              });
            }
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id]);

  return (
    <div style={{ padding: '16px' }}>
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        Back
      </Button>
      
      <Card 
        title={isEditMode ? 'Edit Timetable Entry' : 'Add New Timetable Entry'}
        loading={loading}
      >
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              courseType: 'UG', // Default course type
            }}
          >
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="courseType"
                  label="Course Type"
                  rules={[{ required: true, message: 'Please select course type' }]}
                >
                  <Select 
                    placeholder="Select course type"
                    onChange={handleCourseTypeChange}
                  >
                    {courseTypes.map(type => (
                      <Option key={type} value={type}>{type}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24} md={8}>
                <Form.Item
                  name="school"
                  label="School/Department"
                  rules={[{ required: true, message: 'Please select school/department' }]}
                >
                  <Select 
                    placeholder="Select school/department"
                    onChange={handleSchoolChange}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    loading={loading}
                  >
                    {dropdownData.schools.map(school => (
                      <Option key={school._id} value={school._id}>
                        {school.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24} md={8}>
                <Form.Item
                  name="course"
                  label="Course"
                  rules={[{ required: true, message: 'Please select course' }]}
                >
                  <Select 
                    placeholder="Select course"
                    showSearch
                    optionFilterProp="children"
                    loading={loading}
                    disabled={!selectedSchool || !selectedCourseType}
                    onChange={handleCourseChange}
                    filterOption={(input, option) =>
                      (option?.children?.toLowerCase() || '').includes(input.toLowerCase())
                    }
                    notFoundContent={filteredCourses.length === 0 ? 'No courses found for the selected criteria' : null}
                    labelInValue
                    value={(() => {
                      // If we have a selected course with details, use it
                      if (selectedCourse) {
                        const courseName = selectedCourse.courseName || selectedCourse.name || 'Loading...';
                        const courseType = selectedCourse.courseType || selectedCourse.type || selectedCourseType || '';
                        
                        // If we only have course ID, try to find it in filtered courses
                        if ((!courseName || courseName === 'Loading...') && selectedCourse._id) {
                          const foundCourse = filteredCourses.find(c => 
                            c._id?.toString() === selectedCourse._id?.toString()
                          );
                          if (foundCourse) {
                            return {
                              value: foundCourse._id,
                              label: `${foundCourse.courseName || foundCourse.name || 'Unnamed Course'} (${foundCourse.courseType || foundCourse.type || selectedCourseType || ''})`
                            };
                          }
                        }
                        
                        return {
                          value: selectedCourse._id || selectedCourse.id,
                          label: courseType ? 
                            `${courseName} (${courseType})` : 
                            courseName
                        };
                      }
                      
                      // If we have a course ID in the form values, try to find it
                      const formValues = form.getFieldsValue();
                      if (formValues.course) {
                        const courseId = formValues.course.value || formValues.course;
                        if (!courseId) return undefined;
                        
                        // Try to find in filtered courses first
                        const course = filteredCourses.find(c => 
                          (c._id && c._id.toString() === courseId.toString())
                        );
                        
                        if (course) {
                          const courseName = course.courseName || course.name || 'Unnamed Course';
                          const courseType = course.courseType || course.type || selectedCourseType || '';
                          return {
                            value: course._id,
                            label: courseType ? 
                              `${courseName} (${courseType})` : 
                              courseName
                          };
                        }
                        
                        // If not found in filtered courses but we have a course ID, show loading state
                        return {
                          value: courseId,
                          label: 'Loading course...'
                        };
                      }
                      
                      return undefined;
                    })()}
                  >
                    {filteredCourses.length > 0 ? (
                      filteredCourses.map(course => {
                        // Handle different course data structures
                        const courseId = course._id || course.id || '';
                        const courseName = course.courseName || course.name || 'Unnamed Course';
                        const courseType = course.courseType || course.type || selectedCourseType || '';
                        const duration = course.durationYear || course.duration || 0;
                        
                        // Create display text
                        let displayText = courseName;
                        if (courseType) displayText += ` (${courseType}`;
                        if (duration) displayText += ` - ${duration} year${duration > 1 ? 's' : ''}`;
                        if (courseType) displayText += ')';
                        
                        return (
                          <Option key={courseId} value={courseId}>
                            {displayText}
                          </Option>
                        );
                      })
                    ) : (
                      <Option disabled value="no-courses">No courses available for the selected criteria</Option>
                    )}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24} md={8}>
                <Form.Item
                  name="semester"
                  label="Semester"
                  rules={[{ required: true, message: 'Please select semester' }]}
                >
                  <Select 
                    placeholder="Select semester"
                    disabled={!selectedCourse}
                    loading={loading}
                  >
                    {availableSemesters.map((semester, index) => (
                      <Option key={index} value={semester}>
                        {semester}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24} md={8}>
                <Form.Item
                  name="session"
                  label="Session"
                  rules={[{ required: true, message: 'Please select session' }]}
                >
                  <Select 
                    placeholder="Select session"
                    showSearch
                    optionFilterProp="children"
                    loading={loading}
                  >
                    {dropdownData.sessions.map(session => (
                      <Option key={session._id} value={session._id}>
                        {session.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="subject"
                  label="Subject"
                  rules={[{ required: true, message: 'Please select subject' }]}
                >
                  <Select 
                    placeholder="Select subject"
                    showSearch
                    optionFilterProp="children"
                    loading={loading}
                    disabled={!selectedSchool || !selectedCourseType}
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {filteredSubjects
                      .filter(subject => 
                        !selectedSchool || 
                        (subject.school && subject.school._id === selectedSchool) ||
                        (typeof subject.school === 'string' && subject.school === selectedSchool)
                      )
                      .map(subject => (
                        <Option key={subject._id} value={subject._id}>
                        {subject.name} 
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24} md={6}>
                <Form.Item
                  name="day"
                  label="Day"
                  rules={[{ required: true, message: 'Please select day' }]}
                >
                  <Select placeholder="Select day">
                    {daysOfWeek.map(day => (
                      <Option key={day} value={day}>{day}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24} md={6}>
                <Form.Item
                  name="timeSlot"
                  label="Time Slot"
                  rules={[{ required: true, message: 'Please select time slot' }]}
                >
                  <Select 
                    placeholder="Select time slot"
                    showSearch
                    optionFilterProp="children"
                  >
                    {timeSlots.map(slot => (
                      <Option key={slot} value={slot}>{slot}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="faculty"
                  label="Faculty"
                  rules={[{ required: true, message: 'Please select faculty' }]}
                >
                  <Select 
                    placeholder="Select faculty"
                    showSearch
                    optionFilterProp="children"
                    loading={loading}
                    filterOption={(input, option) =>
                      (option?.children?.toLowerCase() || '').includes(input.toLowerCase())
                    }
                    notFoundContent={filteredTeachers.length === 0 ? 'No faculty found for the selected school' : null}
                  >
                    {filteredTeachers.length > 0 ? (
                      filteredTeachers.map(teacher => ({
                        ...teacher,
                        displayName: `${teacher.name}${teacher.designation ? ` (${teacher.designation})` : ''}${teacher.email ? ` - ${teacher.email}` : ''}`
                      })).map(teacher => (
                        <Option key={teacher._id} value={teacher._id}>
                          {teacher.displayName}
                        </Option>
                      ))
                    ) : (
                      <Option disabled value="no-data">
                        {loading ? 'Loading teachers...' : 'No teachers available for selected school'}
                      </Option>
                    )}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  name="room"
                  label="Room"
                  rules={[{ required: true, message: 'Please enter room number' }]}
                >
                  <Input placeholder="Enter room number" />
                </Form.Item>
              </Col>
            </Row>
            
            <Row>
              <Col span={24}>
                <Form.Item
                  name="description"
                  label="Description"
                >
                  <TextArea rows={3} placeholder="Enter any additional details (optional)" />
                </Form.Item>
              </Col>
            </Row>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SaveOutlined />}
                loading={submitting}
              >
                {isEditMode ? 'Update' : 'Save'}
              </Button>
              
              <Button 
                style={{ marginLeft: 8 }}
                onClick={() => navigate('/ugpg-admin/academic/timetable')}
                disabled={submitting}
              >
                Cancel
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default TimetableForm;
