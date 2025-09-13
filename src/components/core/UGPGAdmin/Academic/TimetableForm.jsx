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
      const processedCourses = (Array.isArray(data.courses) ? data.courses : []).map(course => ({
        ...course,
        _id: course._id || course.id,
        courseName: course.courseName || course.name,
        school: course.school?._id || course.school,
        category: course.category || course.type
      }));
      
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
    if (!isEditMode) return;
    
    try {
      setLoading(true);
      
      // 1. First load the timetable data
      const response = await TIMETABLE_API.getTimetable(id);
      const timetable = response.data;
      
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
        // Update filtered data based on the selected school and course type
        updateFilteredData(schoolId, timetable.courseType);
      }
      
      // 3. Wait for dropdown data to be loaded and filtered
      const waitForDropdowns = () => {
        return new Promise((resolve) => {
          const check = () => {
            if (dropdownData.courses.length > 0 && dropdownData.teachers.length > 0) {
              resolve();
            } else {
              setTimeout(check, 100);
            }
          };
          check();
        });
      };
      
      await waitForDropdowns();
      
      // 4. Set all form values after state updates and dropdowns are ready
      const formValues = {
        courseType: timetable.courseType,
        school: timetable.school?._id || timetable.school,
        course: timetable.course?._id || timetable.course,
        session: timetable.session?._id || timetable.session,
        subject: timetable.subject?._id || timetable.subject,
        day: timetable.day,
        timeSlot: timetable.timeSlot,
        room: timetable.room,
        faculty: timetable.faculty?._id || timetable.faculty,
        description: timetable.description || '',
      };
      
      console.log('Setting form values:', formValues);
      form.setFieldsValue(formValues);
      
      // 5. Force update the form to ensure all fields are properly set
      setTimeout(() => {
        form.validateFields();
      }, 200);
      
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to load timetable data');
      console.error('Error loading timetable data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle school change to filter subjects and courses
  const handleSchoolChange = (value) => {
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
    form.setFieldsValue({ 
      school: undefined,
      course: undefined,
      subject: undefined
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
      };
      
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
    } finally {
      setSubmitting(false);
    }
  };

  // Load initial data
  useEffect(() => {
    loadDropdownData();
    
    if (isEditMode) {
      loadTimetableData();
    }
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
                    filterOption={(input, option) =>
                      (option?.children?.toLowerCase() || '').includes(input.toLowerCase())
                    }
                    notFoundContent={filteredCourses.length === 0 ? 'No courses found for the selected criteria' : null}
                  >
                    {filteredCourses.length > 0 ? (
                      filteredCourses.map(course => {
                        // Handle different course data structures
                        const courseId = course._id || course.id || '';
                        const courseName = course.courseName || course.name || 'Unnamed Course';
                        const courseType = course.courseType || course.type || selectedCourseType || 'N/A';
                        const duration = course.durationYear || course.duration || 0;
                        
                        return (
                          <Option key={courseId} value={courseId}>
                            {courseName} ({courseType} - {duration} years)
                          </Option>
                        );
                      })
                    ) : (
                      <Option disabled value="no-data">
                        {loading ? 'Loading...' : 'No courses available for selected criteria'}
                      </Option>
                    )}
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
                        {subject.name} ({subject.code || 'No Code'})
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
