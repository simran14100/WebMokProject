import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { teacherApi } from '../../../../services/teacherApi';
import { showError, showSuccess } from '../../../../utils/toast';
import { Form, Input, Button, Select, Card, Spin, Row, Col, message } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const TeacherForm = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [schools, setSchools] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState('');

  const designations = [
    'Assistant Professor',
    'Professor',
    'Lecturer'
  ];

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Load schools
        const schoolsResponse = await teacherApi.getSchools();
        if (schoolsResponse.data && schoolsResponse.data.data) {
          setSchools(schoolsResponse.data.data);
        }

        // If in edit mode, load teacher data
        if (isEditMode) {
          const teacherResponse = await teacherApi.getTeacher(id);
          const teacher = teacherResponse.data?.data || teacherResponse.data;
          
          if (teacher) {
            form.setFieldsValue({
              name: teacher.name,
              email: teacher.email,
              phone: teacher.phone,
              school: teacher.school?._id || teacher.school,
              designation: teacher.designation,
              subjects: teacher.subjects?.map(sub => sub._id || sub) || [],
              address: teacher.address,
              salary: typeof teacher.salary === 'number' ? teacher.salary : 0,
              pfDeduct: typeof teacher.pfDeduct === 'number' 
                ? teacher.pfDeduct 
                : Number(((teacher.salary || 0) * 0.12).toFixed(2))
            });
            
            // Load subjects if school is selected
            if (teacher.school?._id || teacher.school) {
              setSelectedSchool(teacher.school._id || teacher.school);
              await loadSubjects(teacher.school._id || teacher.school);
            }
          }
        }
      } catch (error) {
        showError('Failed to load form data');
        console.error('Error loading form data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [id, form, isEditMode]);

  // Load subjects when school changes
  const loadSubjects = async (schoolId) => {
    try {
      const response = await teacherApi.getSubjectsBySchool(schoolId);
      if (response.data && response.data.data) {
        setSubjects(response.data.data);
      }
    } catch (error) {
      showError('Failed to load subjects');
      console.error('Error loading subjects:', error);
    }
  };

  // Handle school change
  const handleSchoolChange = async (value) => {
    setSelectedSchool(value);
    form.setFieldsValue({ subjects: [] }); // Reset subjects when school changes
    
    if (value) {
      await loadSubjects(value);
    } else {
      setSubjects([]);
    }
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      
      const teacherData = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        school: values.school,
        designation: values.designation,
        subjects: values.subjects || [],
        address: values.address,
        salary: Number(values.salary) || 0,
        pfDeduct: Number(values.pfDeduct) || 0
      };

      if (isEditMode) {
        await teacherApi.updateTeacher(id, teacherData);
        showSuccess('Teacher updated successfully');
      } else {
        await teacherApi.createTeacher(teacherData);
        showSuccess('Teacher created successfully');
      }
      
      navigate('/ugpg-admin/teachers');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to save teacher';
      showError(errorMessage);
      console.error('Error saving teacher:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/ugpg-admin/teachers')}
          className="mb-4"
        >
          Back to Teachers
        </Button>
        <h2 className="text-xl font-bold">
          {isEditMode ? 'Edit Teacher' : 'Add New Teacher'}
        </h2>
      </div>

      <Card>
        <Spin spinning={loading}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              name: '',
              email: '',
              phone: '',
              school: undefined,
              designation: undefined,
              subjects: [],
              address: '',
              salary: 0,
              pfDeduct: 0
            }}
          >
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Salary"
                  name="salary"
                  rules={[{ required: true, message: 'Please enter salary' }]}
                >
                  <Input
                    type="number"
                    min={0}
                    placeholder="Enter salary"
                    onChange={(e) => {
                      const salaryVal = Number(e.target.value) || 0;
                      const pf = Number((salaryVal * 0.12).toFixed(2));
                      form.setFieldsValue({ pfDeduct: pf });
                    }}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="PF Deduct (12%)"
                  name="pfDeduct"
                  tooltip="Automatically calculated as 12% of salary"
                >
                  <Input type="number" disabled />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Full Name"
                  name="name"
                  rules={[
                    { required: true, message: 'Please enter full name' },
                    { min: 3, message: 'Name must be at least 3 characters' }
                  ]}
                >
                  <Input placeholder="Enter full name" />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input placeholder="Enter email address" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Phone Number"
                  name="phone"
                  rules={[
                    { required: true, message: 'Please enter phone number' },
                    { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit phone number' }
                  ]}
                >
                  <Input placeholder="Enter phone number" />
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  label="Designation"
                  name="designation"
                  rules={[
                    { required: true, message: 'Please select designation' }
                  ]}
                >
                  <Select placeholder="Select designation">
                    {designations.map(designation => (
                      <Option key={designation} value={designation}>
                        {designation}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="School/Department"
                  name="school"
                  rules={[
                    { required: true, message: 'Please select school/department' }
                  ]}
                >
                  <Select 
                    placeholder="Select school/department"
                    onChange={handleSchoolChange}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {schools.map(school => (
                      <Option key={school._id} value={school._id}>
                        {school.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24} md={12}>
                <Form.Item
                  label="Subjects"
                  name="subjects"
                >
                  <Select 
                    mode="multiple"
                    placeholder="Select subjects (optional)"
                    disabled={!selectedSchool}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {subjects.map(subject => (
                      <Option key={subject._id} value={subject._id}>
                        {subject.name} 
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Col span={24}>
                <Form.Item
                  label="Address"
                  name="address"
                >
                  <TextArea rows={3} placeholder="Enter address (optional)" />
                </Form.Item>
              </Col>
            </Row>

            <div className="mt-6">
              <Button 
                type="primary" 
                htmlType="submit" 
                icon={<SaveOutlined />}
                loading={submitting}
                className="mr-2"
              >
                {isEditMode ? 'Update Teacher' : 'Add Teacher'}
              </Button>
              
              <Button 
                onClick={() => navigate('/dashboard/teachers')}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default TeacherForm;
