import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setToken } from '../../store/slices/authSlice';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Select, 
  DatePicker, 
  Row, 
  Col, 
  message,
  Radio,
  InputNumber,
  Upload,
  Avatar
} from 'antd';
import { UploadOutlined, CameraOutlined, EditOutlined } from '@ant-design/icons';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  IdcardOutlined,
  CalendarOutlined,
  HomeOutlined,
  BookOutlined,
  BankOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const NewRegistration = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  
  // Authentication is handled by ProtectedRoute at the route level
  const [showParentFields, setShowParentFields] = useState(true);
  const [showGuardianFields, setShowGuardianFields] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  
  // For photo upload
  const handlePhotoChange = (info) => {
    if (info.file) {
      // Ensure we're working with a proper File object
      const file = info.file.originFileObj || info.file;
      if (file instanceof File) {
        setPhotoFile(file);
        // Create preview URL
        const reader = new FileReader();
        reader.onload = (e) => setPhotoPreview(e.target.result);
        reader.readAsDataURL(file);
      }
    }
    return false; // Prevent default upload behavior
  };

  // For signature upload
  const handleSignatureChange = (info) => {
    if (info.file) {
      // Ensure we're working with a proper File object
      const file = info.file.originFileObj || info.file;
      if (file instanceof File) {
        setSignatureFile(file);
        // Create preview URL
        const reader = new FileReader();
        reader.onload = (e) => setSignaturePreview(e.target.result);
        reader.readAsDataURL(file);
      }
    }
    return false; // Prevent default upload behavior
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG files!');
      return Upload.LIST_IGNORE;
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
      return Upload.LIST_IGNORE;
    }
    return true;
  };
  
  // For signature upload
  const beforeUploadSignature = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG file!');
      return Upload.LIST_IGNORE;
    }
    const isLt1M = file.size / 1024 / 1024 < 1;
    if (!isLt1M) {
      message.error('Signature must be smaller than 1MB!');
      return Upload.LIST_IGNORE;
    }
    // Don't set the file here, let handleSignatureChange handle it
    return true;
  };

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('http://localhost:4000/api/v1/university/registered-students/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }
      
      const data = await response.json();
      return data.url || data.secure_url; // Handle both response formats
    } catch (error) {
      console.error('Error uploading file:', error);
      message.error('Failed to upload file. Please try again.');
      throw error;
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);
      
      // Log form values for debugging
      console.log('Form values:', values);
      
      // Create FormData for the entire form
      const formData = new FormData();
      
      // Add all form values to FormData
      Object.keys(values).forEach(key => {
        // Skip file fields as we'll add them separately
        if (key === 'photo' || key === 'signature') return;
        
        if (key === 'dateOfBirth' && values[key]) {
          const dateValue = values[key].format('YYYY-MM-DD');
          formData.append(key, dateValue);
          console.log('Added date:', { key, value: dateValue });
        } else if (values[key] !== undefined && values[key] !== null) {
          // Convert objects/arrays to JSON strings
          const value = typeof values[key] === 'object' && !(values[key] instanceof File)
            ? JSON.stringify(values[key])
            : values[key];
          formData.append(key, value);
          console.log('Added field:', { key, value });
        }
      });
      
      // Add parent data as JSON string if it exists
      if (values.parent) {
        formData.append('parent', JSON.stringify(values.parent));
      }
      
      // Add address data as JSON string if it exists
      if (values.address) {
        formData.append('address', JSON.stringify(values.address));
      }
      
      // Add files to FormData if they exist
      if (photoFile) {
        console.log('Adding photo file:', photoFile.name, photoFile.size, 'bytes', 'type:', photoFile.type);
        // Use the same field name that the server expects
        formData.append('photo', photoFile, photoFile.name);
      } else {
        console.log('No photo file to upload');
      }
      
      if (signatureFile) {
        console.log('Adding signature file:', signatureFile.name, signatureFile.size, 'bytes', 'type:', signatureFile.type);
        // Use the same field name that the server expects
        formData.append('signature', signatureFile, signatureFile.name);
      } else {
        console.log('No signature file to upload');
      }
      
      // Log the form data keys for debugging
      console.log('FormData entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
      
      // Check if we have a valid token
      if (!token) {
        const errorMsg = 'Your session has expired. Please log in again.';
        message.error(errorMsg);
        // Redirect to login after showing the message
        setTimeout(() => navigate('/login', { 
          state: { from: '/super-admin/new-registration' } 
        }), 1500);
        throw new Error(errorMsg);
      }
      
      // Make API call to your backend
      console.log('Sending request to server...');
      const response = await fetch('http://localhost:4000/api/v1/university/registered-students/', {
        method: 'POST',
        // Don't set Content-Type header - let the browser set it with the correct boundary
        headers: {
          'Authorization': `Bearer ${token}`
          // Let the browser set the Content-Type with the correct boundary
        },
        body: formData
      });
      
      console.log('Response status:', response.status);
      
      // Try to parse the response as JSON, but handle non-JSON responses
      let responseData;
      const contentType = response.headers.get('content-type');
      
      // Log response headers for debugging
      console.log('Response headers:');
      response.headers.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });
      
      // Get response text first to handle both JSON and non-JSON responses
      const responseText = await response.text();
      console.log('Raw response:', responseText);
      
      // Try to parse as JSON if content-type is JSON
      if (contentType && contentType.includes('application/json')) {
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          console.error('Error parsing JSON response:', e);
          throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}...`);
        }
      } else {
        console.log('Non-JSON response:', responseText.substring(0, 500));
        responseData = { message: responseText };
      }
      
      if (!response.ok) {
        // Log detailed error information
        console.error('Server error response:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // Handle different types of errors
        if (response.status === 401) {
          const errorMsg = 'Session expired. Please log in again.';
          message.error(errorMsg);
          // Redirect to login or handle session expiration
          // window.location.href = '/login';
          throw new Error(errorMsg);
        } else if (response.status === 400) {
          const errorMsg = responseData.message || 'Invalid data. Please check your inputs.';
          message.error(errorMsg);
          throw new Error(errorMsg);
        } else if (response.status === 413) {
          const errorMsg = 'File size is too large. Maximum 20MB per file allowed.';
          message.error(errorMsg);
          throw new Error(errorMsg);
        } else if (response.status >= 500) {
          const errorMsg = responseData.message || 'Server error. Please try again later.';
          message.error(errorMsg);
          throw new Error(`Server error: ${response.status} - ${response.statusText}`);
        } else {
          const errorMsg = responseData.message || 'An unexpected error occurred.';
          message.error(errorMsg);
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
      }
      
      // Handle successful response
      console.log('Registration successful:', responseData);
      message.success('Registration submitted successfully!');
      
      // Reset form and clear file states
      form.resetFields();
      setPhotoFile(null);
      setPhotoPreview(null);
      setSignatureFile(null);
      setSignaturePreview(null);
    } catch (error) {
      console.error('Error in form submission:', error);
      message.error(error.message || 'Failed to submit registration. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card 
        title={
          <div className="flex items-center">
            <IdcardOutlined className="mr-2 text-blue-600" />
            <span>New Student Registration</span>
          </div>
        }
        className="shadow-lg"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            gender: 'male',
            sameAsPermanent: true
          }}
        >
          {/* Personal Information Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <UserOutlined className="mr-2 text-blue-500" />
              Personal Information
            </h3>
            
            {/* Photo and Signature Upload */}
            <Row gutter={24} className="mb-6">
              <Col xs={24} sm={12} md={6} lg={4} className="mb-4">
                <div className="text-center">
                  <div className="relative inline-block mb-2">
                    <Avatar 
                      size={120} 
                      icon={<UserOutlined />} 
                      src={photoFile ? URL.createObjectURL(photoFile) : null}
                      className="border-2 border-dashed border-gray-300"
                    />
                    <Upload
                      name="photo"
                      accept="image/*"
                      showUploadList={false}
                      beforeUpload={beforeUpload}
                      onChange={handlePhotoChange}
                      customRequest={({ onSuccess }) => onSuccess('ok')}
                    >
                      <Button 
                        type="primary" 
                        size="small" 
                        icon={<CameraOutlined />}
                        className="absolute bottom-0 right-0 transform translate-y-1/2 translate-x-1/2"
                      >
                        Change
                      </Button>
                    </Upload>
                  </div>
                  <div className="text-sm text-gray-500">Student Photo (Max 2MB)</div>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={6} lg={4} className="mb-4">
                <div className="text-center">
                  <div className="relative inline-block mb-2">
                    <div className="w-30 h-20 border-2 border-dashed border-gray-300 flex items-center justify-center">
                      {signatureFile ? (
                        <img 
                          src={URL.createObjectURL(signatureFile)} 
                          alt="Signature Preview" 
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <div className="text-gray-400">Signature</div>
                      )}
                    </div>
                    <Upload
                      name="signature"
                      accept="image/*"
                      showUploadList={false}
                      beforeUpload={beforeUploadSignature}
                      onChange={handleSignatureChange}
                      customRequest={({ onSuccess }) => onSuccess('ok')}
                    >
                      <Button 
                        type="primary" 
                        size="small" 
                        icon={<UploadOutlined />}
                        className="bg-blue-500"
                      >
                        {signatureFile ? 'Change' : 'Upload'}
                      </Button>
                    </Upload>
                  </div>
                  <div className="text-sm text-gray-500 mt-6">Signature (Max 1MB)</div>
                </div>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="firstName"
                  label="First Name"
                  rules={[{ required: true, message: 'Please enter first name' }]}
                >
                  <Input placeholder="First Name" prefix={<UserOutlined />} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="lastName"
                  label="Last Name"
                  rules={[{ required: true, message: 'Please enter last name' }]}
                >
                  <Input placeholder="Last Name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="dateOfBirth"
                  label="Date of Birth"
                  rules={[{ required: true, message: 'Please select date of birth' }]}
                >
                  <DatePicker 
                    style={{ width: '100%' }} 
                    placeholder="Select date of birth"
                    suffixIcon={<CalendarOutlined />}
                    disabledDate={(current) => {
                      return current && current > dayjs().endOf('day');
                    }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="gender"
                  label="Gender"
                  rules={[{ required: true, message: 'Please select gender' }]}
                >
                  <Radio.Group>
                    <Radio value="male">Male</Radio>
                    <Radio value="female">Female</Radio>
                    <Radio value="other">Other</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="aadharNumber"
                  label="Aadhar Number"
                  rules={[
                    { required: true, message: 'Please enter Aadhar number' },
                    { pattern: /^[2-9]{1}[0-9]{11}$/, message: 'Please enter a valid 12-digit Aadhar number' }
                  ]}
                >
                  <Input 
                    placeholder="Enter 12-digit Aadhar number" 
                    maxLength={12}
                    type="number"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Contact Information Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <PhoneOutlined className="mr-2 text-blue-500" />
              Contact Information
            </h3>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="source"
                  label="How did you hear about us?"
                  rules={[{ required: true, message: 'Please select source' }]}
                >
                  <Select placeholder="Select source">
                    <Option value="newspaper">Newspaper</Option>
                    <Option value="social_media">Social Media</Option>
                    <Option value="friend">Friend/Family</Option>
                    <Option value="hoarding">Hoarding/Poster</Option>
                    <Option value="website">Website</Option>
                    <Option value="other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="referenceName"
                  label="Reference Name (If any)"
                >
                  <Input placeholder="Reference person name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="referenceContact"
                  label="Reference Contact"
                  rules={[
                    { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit number' }
                  ]}
                >
                  <Input placeholder="Reference contact number" maxLength={10} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="referenceRelation"
                  label="Reference Relation"
                >
                  <Input placeholder="e.g., Friend, Relative, etc." />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input placeholder="Email" prefix={<MailOutlined />} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="phone"
                  label="Phone Number"
                  rules={[
                    { required: true, message: 'Please enter phone number' },
                    { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit number' }
                  ]}
                >
                  <Input 
                    placeholder="Phone Number" 
                    prefix={<PhoneOutlined />} 
                    maxLength={10}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="alternatePhone"
                  label="Alternate Phone"
                >
                  <Input 
                    placeholder="Alternate Phone" 
                    prefix={<PhoneOutlined />} 
                    maxLength={10}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Address Information Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <HomeOutlined className="mr-2 text-blue-500" />
              Address Information
            </h3>
            <Row gutter={16}>
              <Col span={24} className="mb-4">
                <Form.Item
                  name="addressLine1"
                  label="Address Line 1"
                  rules={[{ required: true, message: 'Please enter address' }]}
                >
                  <Input placeholder="Address Line 1" />
                </Form.Item>
              </Col>
              <Col span={24} className="mb-4">
                <Form.Item
                  name="addressLine2"
                  label="Address Line 2 (Optional)"
                >
                  <Input placeholder="Address Line 2" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="city"
                  label="City"
                  rules={[{ required: true, message: 'Please enter city' }]}
                >
                  <Input placeholder="City" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="state"
                  label="State"
                  rules={[{ required: true, message: 'Please select state' }]}
                >
                  <Select placeholder="Select state">
                    <Option value="delhi">Delhi</Option>
                    <Option value="maharashtra">Maharashtra</Option>
                    <Option value="karnataka">Karnataka</Option>
                    <Option value="tamilnadu">Tamil Nadu</Option>
                    <Option value="kerala">Kerala</Option>
                    <Option value="up">Uttar Pradesh</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="pincode"
                  label="Pincode"
                  rules={[
                    { required: true, message: 'Please enter pincode' },
                    { pattern: /^[0-9]{6}$/, message: 'Please enter a valid 6-digit pincode' }
                  ]}
                >
                  <Input placeholder="Pincode" maxLength={6} />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Academic Information Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <BookOutlined className="mr-2 text-blue-500" />
              Academic Information
            </h3>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="lastQualification"
                  label="Last Qualification"
                  rules={[{ required: true, message: 'Please select last qualification' }]}
                >
                  <Select placeholder="Select qualification">
                    <Option value="10th">10th Standard</Option>
                    <Option value="12th">12th Standard</Option>
                    <Option value="diploma">Diploma</Option>
                    <Option value="bachelor">Bachelor's Degree</Option>
                    <Option value="master">Master's Degree</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="boardUniversity"
                  label="Board/University"
                  rules={[{ required: true, message: 'Please enter board/university' }]}
                >
                  <Input placeholder="Board/University" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="yearOfPassing"
                  label="Year of Passing"
                  rules={[{ required: true, message: 'Please select year of passing' }]}
                >
                  <DatePicker 
                    picker="year" 
                    style={{ width: '100%' }} 
                    placeholder="Select year"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="percentage"
                  label="Percentage/CGPA"
                  rules={[{ required: true, message: 'Please enter percentage/CGPA' }]}
                >
                  <InputNumber 
                    style={{ width: '100%' }}
                    min={0}
                    max={100}
                    placeholder="Percentage/CGPA"
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Course Selection Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <BankOutlined className="mr-2 text-blue-500" />
              Course Selection
            </h3>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="course"
                  label="Select Course"
                  rules={[{ required: true, message: 'Please select a course' }]}
                >
                  <Select placeholder="Select course">
                    <Option value="btech">B.Tech</Option>
                    <Option value="mtech">M.Tech</Option>
                    <Option value="bca">BCA</Option>
                    <Option value="mca">MCA</Option>
                    <Option value="bba">BBA</Option>
                    <Option value="mba">MBA</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="specialization"
                  label="Specialization"
                >
                  <Select placeholder="Select specialization">
                    <Option value="cse">Computer Science</Option>
                    <Option value="it">Information Technology</Option>
                    <Option value="mechanical">Mechanical</Option>
                    <Option value="civil">Civil</Option>
                    <Option value="electrical">Electrical</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Parent/Guardian Information */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium flex items-center">
                <UserOutlined className="mr-2 text-blue-500" />
                Parent/Guardian Information
              </h3>
              <div className="space-x-4">
                <Button 
                  type={showParentFields ? 'primary' : 'default'} 
                  onClick={() => {
                    setShowParentFields(true);
                    setShowGuardianFields(false);
                  }}
                >
                  Parent
                </Button>
                <Button 
                  type={showGuardianFields ? 'primary' : 'default'} 
                  onClick={() => {
                    setShowGuardianFields(true);
                    setShowParentFields(false);
                  }}
                >
                  Guardian
                </Button>
              </div>
            </div>

            {showParentFields && (
              <Row gutter={16}>
                <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                  <Form.Item
                    name="fatherName"
                    label="Father's Name"
                    rules={[{ required: true, message: "Please enter father's name" }]}
                  >
                    <Input placeholder="Father's Name" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                  <Form.Item
                    name="fatherOccupation"
                    label="Father's Occupation"
                  >
                    <Input placeholder="Father's Occupation" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                  <Form.Item
                    name="motherName"
                    label="Mother's Name"
                    rules={[{ required: true, message: "Please enter mother's name" }]}
                  >
                    <Input placeholder="Mother's Name" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                  <Form.Item
                    name="motherOccupation"
                    label="Mother's Occupation"
                  >
                    <Input placeholder="Mother's Occupation" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                  <Form.Item
                    name="parentPhone"
                    label="Parent's Phone"
                    rules={[
                      { required: true, message: "Please enter parent's phone number" },
                      { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit number' }
                    ]}
                  >
                    <Input placeholder="Parent's Phone" maxLength={10} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                  <Form.Item
                    name="parentEmail"
                    label="Parent's Email"
                    rules={[
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input placeholder="Parent's Email" />
                  </Form.Item>
                </Col>
              </Row>
            )}

            {showGuardianFields && (
              <Row gutter={16}>
                <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                  <Form.Item
                    name="guardianName"
                    label="Guardian's Name"
                    rules={[{ required: true, message: "Please enter guardian's name" }]}
                  >
                    <Input placeholder="Guardian's Name" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                  <Form.Item
                    name="relationWithGuardian"
                    label="Relation with Guardian"
                  >
                    <Input placeholder="Relation with Guardian" />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                  <Form.Item
                    name="guardianPhone"
                    label="Guardian's Phone"
                    rules={[
                      { required: true, message: "Please enter guardian's phone number" },
                      { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit number' }
                    ]}
                  >
                    <Input placeholder="Guardian's Phone" maxLength={10} />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                  <Form.Item
                    name="guardianEmail"
                    label="Guardian's Email"
                    rules={[
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input placeholder="Guardian's Email" />
                  </Form.Item>
                </Col>
              </Row>
            )}
          </div>

          {/* Additional Information */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <EnvironmentOutlined className="mr-2 text-blue-500" />
              Additional Information
            </h3>
            <Row gutter={16}>
              <Col span={24} className="mb-4">
                <Form.Item
                  name="additionalInfo"
                  label="Any Additional Information"
                >
                  <TextArea rows={4} placeholder="Any additional information you would like to share" />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 mt-8">
            <Button 
              type="default" 
              onClick={() => form.resetFields()}
              className="w-32"
            >
              Reset
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              className="w-32"
            >
              {loading ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default NewRegistration;
