



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
  Checkbox,
  Upload,
  Avatar,
  Progress
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
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;

const NewRegistration = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  
  const [showParentFields, setShowParentFields] = useState(true);
  const [showGuardianFields, setShowGuardianFields] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // For photo upload
  const handlePhotoChange = (info) => {
    if (info.file) {
      const file = info.file.originFileObj || info.file;
      if (file instanceof File) {
        setPhotoFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setPhotoPreview(e.target.result);
        reader.readAsDataURL(file);
      }
    }
    return false;
  };

  // For signature upload
  const handleSignatureChange = (info) => {
    if (info.file) {
      const file = info.file.originFileObj || info.file;
      if (file instanceof File) {
        setSignatureFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setSignaturePreview(e.target.result);
        reader.readAsDataURL(file);
      }
    }
    return false;
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG files!');
      return Upload.LIST_IGNORE;
    }
    
    const maxSizeMB = 10;
    const isLt10M = file.size / 1024 / 1024 < maxSizeMB;
    if (!isLt10M) {
      message.error(`Photo must be smaller than ${maxSizeMB}MB!`);
      return Upload.LIST_IGNORE;
    }
    
    return true;
  };
  
  const beforeUploadSignature = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG files!');
      return Upload.LIST_IGNORE;
    }
    
    const maxSizeMB = 5;
    const isLt5M = file.size / 1024 / 1024 < maxSizeMB;
    if (!isLt5M) {
      message.error(`Signature must be smaller than ${maxSizeMB}MB!`);
      return Upload.LIST_IGNORE;
    }
    
    return true;
  };

  const onFinish = async (values) => {
    if (submitting) return;
    
    setSubmitting(true);
    setUploading(true);
    setUploadProgress(0);
    
    try {
      console.log('=== FORM SUBMISSION STARTED ===');
      console.log('Form values:', JSON.stringify(values, null, 2));
      
      // Validate files
      if (!photoFile || !signatureFile) {
        message.error('Please upload both photo and signature files');
        setSubmitting(false);
        setUploading(false);
        return;
      }
      
      // Create a new FormData instance
      const formData = new FormData();
      
      // Append files first
      formData.append('photo', photoFile);
      formData.append('signature', signatureFile);
      
      // Process and append form values
      const { photo, signature, dateOfBirth, yearOfPassing, ...formValues } = values;
      
      // Convert dates to strings
      if (dateOfBirth) {
        formValues.dateOfBirth = dayjs(dateOfBirth).format('YYYY-MM-DD');
      }
      
      if (yearOfPassing) {
        formValues.yearOfPassing = dayjs(yearOfPassing).format('YYYY');
      }
      
      // Add all form fields with better handling
      Object.entries(formValues).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          // Handle nested objects (like address)
          if (typeof value === 'object' && !dayjs.isDayjs(value) && !Array.isArray(value)) {
            Object.entries(value).forEach(([nestedKey, nestedValue]) => {
              if (nestedValue !== null && nestedValue !== undefined && nestedValue !== '') {
                formData.append(`${key}.${nestedKey}`, nestedValue.toString());
              }
            });
          } 
          // Handle regular values
          else {
            formData.append(key, value.toString());
          }
        }
      });
      
      // Debug: Log all form data entries
      console.log('=== FORM DATA ENTRIES ===');
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: ${value.name} (${value.size} bytes, ${value.type})`);
        } else {
          console.log(`${key}: ${value}`);
        }
      }
      
      // Get the token
      const authToken = localStorage.getItem('token') || token;
      if (!authToken) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      // Prepare request config
      const config = {
        headers: {
          'Authorization': `Bearer ${authToken}`
          // Let the browser set Content-Type with boundary
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.lengthComputable) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        },
        timeout: 300000,
      };
      
      // Make the API request
      const apiUrl = `${process.env.REACT_APP_BASE_URL || 'http://localhost:4000'}/api/v1/university/registered-students/register`;
      console.log('Making request to:', apiUrl);
      
      const response = await axios.post(apiUrl, formData, config);
      const { data } = response;
      
      console.log('Server response:', data);
      
      if (data.success) {
        message.success(data.message || 'Student registered successfully!');
        
        // Reset form and file states
        form.resetFields();
        setPhotoFile(null);
        setSignatureFile(null);
        setPhotoPreview(null);
        setSignaturePreview(null);
        setUploadProgress(0);
        
        // Redirect if needed
        if (data.redirectUrl) {
          navigate(data.redirectUrl);
        }
        
        return data;
      } else {
        const errorMsg = data.message || 'Failed to register student';
        
        // Handle validation errors
        if (data.errors) {
          console.error('Validation errors:', data.errors);
          Object.entries(data.errors).forEach(([field, errorMessage]) => {
            try {
              const fieldPath = field.split('.');
              form.setFields([{
                name: fieldPath,
                errors: [errorMessage]
              }]);
            } catch (error) {
              console.error('Error setting field error:', error);
            }
          });
        }
        
        // Handle missing fields error
        if (data.missingFields) {
          message.error(`Please fill in all required fields: ${data.missingFields.join(', ')}`);
          throw new Error(`Missing fields: ${data.missingFields.join(', ')}`);
        }
        
        throw new Error(errorMsg);
      }
    } catch (error) {



      console.error('Validation errors:', error.response.data.errors);
    
    // Display validation errors on the form fields
    error.response.data.errors.forEach(errorMessage => {
      // Try to extract field name from error message
      if (errorMessage.includes('email')) {
        form.setFields([{ name: ['email'], errors: [errorMessage] }]);
      } else if (errorMessage.includes('phone')) {
        form.setFields([{ name: ['phone'], errors: [errorMessage] }]);
      } else if (errorMessage.includes('aadhar')) {
        form.setFields([{ name: ['aadharNumber'], errors: [errorMessage] }]);
      }
      // Add more field mappings as needed
    });
      
   

      // Enhanced error handling
      let errorMessage = 'Failed to submit form. Please try again.';
      let showDetailedError = false;
      
      if (error.response) {
        const { status, data } = error.response;
        console.error('Response error:', { status, data });
        
        if (status === 400) {
          errorMessage = data.message || 'Invalid request. Please check your input.';
          showDetailedError = true;
          
          // Handle specific error types
          if (data.code === 'MISSING_REQUIRED_FIELDS') {
            errorMessage = `Please fill in all required fields: ${data.missingFields?.join(', ') || 'unknown fields'}`;
          } else if (data.code === 'INVALID_FILE_TYPE') {
            errorMessage = 'Please upload only JPEG or PNG images for photo and signature.';
          } else if (data.code === 'FILE_TOO_LARGE') {
            errorMessage = 'File size is too large. Maximum size is 10MB for photos and 5MB for signatures.';
          } else if (data.errors) {
            // Show first error message
            const firstError = Object.values(data.errors)[0];
            errorMessage = firstError || errorMessage;
          }
        } else if (status === 401) {
          errorMessage = 'Session expired. Please log in again.';
          dispatch(setToken(null));
          localStorage.removeItem('token');
          navigate('/login');
          return;
        } else if (status === 413) {
          errorMessage = 'File size is too large. Maximum size is 10MB for photos and 5MB for signatures.';
        } else if (status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        errorMessage = 'No response from server. Please check your internet connection.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again with smaller files.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      // Show error message
      if (showDetailedError) {
        message.error({
          content: errorMessage,
          duration: 5, // Show for 5 seconds
        });
      } else {
        message.error(errorMessage);
      }
      
      // Re-throw for further debugging if needed
      throw error;
    } finally {
      setSubmitting(false);
      setUploading(false);
      console.log('=== FORM SUBMISSION COMPLETED ===');
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
        {uploading && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span>Uploading files...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress percent={uploadProgress} status="active" />
          </div>
        )}
        
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            gender: 'male',
            sameAsPermanent: true
          }}
          scrollToFirstError={true}
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
                      src={photoPreview}
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
                        type="link" 
                        icon={<CameraOutlined />}
                        className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md"
                      >
                        {photoFile ? 'Change' : 'Upload'}
                      </Button>
                    </Upload>
                  </div>
                  <div className="text-sm text-gray-500">Student Photo (Max 10MB)</div>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={6} lg={4} className="mb-4">
                <div className="text-center">
                  <div className="relative inline-block mb-2">
                    <div className="w-30 h-20 border-2 border-dashed border-gray-300 flex items-center justify-center">
                      {signaturePreview ? (
                        <img 
                          src={signaturePreview} 
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
                        type="link" 
                        icon={<EditOutlined />}
                        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-2 shadow-md"
                      >
                        {signatureFile ? 'Change' : 'Upload'}
                      </Button>
                    </Upload>
                  </div>
                  <div className="text-sm text-gray-500 mt-6">Signature (Max 5MB)</div>
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
                  name={['address', 'line1']}
                  label="Address Line 1"
                  rules={[{ required: true, message: 'Please enter address' }]}
                >
                  <Input placeholder="Address Line 1" />
                </Form.Item>
              </Col>
              <Col span={24} className="mb-4">
                <Form.Item
                  name={['address', 'line2']}
                  label="Address Line 2 (Optional)"
                >
                  <Input placeholder="Address Line 2" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name={['address', 'city']}
                  label="City"
                  rules={[{ required: true, message: 'Please enter city' }]}
                >
                  <Input placeholder="City" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name={['address', 'state']}
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
                  name={['address', 'pincode']}
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
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="isScholarship"
                  valuePropName="checked"
                  style={{ marginTop: '30px' }}
                >
                  <Checkbox>Scholarship Student</Checkbox>
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
                  <TextArea rows={4} placeholder="Enter any additional information here..." />
                </Form.Item>
              </Col>
            </Row>
          </div>
          
          <div className="flex justify-end mt-6">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={submitting}
              className="w-32"
              disabled={!photoFile || !signatureFile}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default NewRegistration;