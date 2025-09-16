import React, { useState } from 'react';
import { Upload, Button, message, Card, Form, Select, Row, Col, Table, Tag, Progress } from 'antd';
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';

// Upload results from file
export const uploadResults = async (formData, onUploadProgress) => {
  try {
    const response = await axios.post(`${API_URL}/results/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      onUploadProgress
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

const { Option } = Select;

const ResultUpload = ({ courses, examSessions, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const beforeUpload = (file) => {
    const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const isCSV = file.type === 'text/csv' || file.name.endsWith('.csv');
    
    if (!isExcel && !isCSV) {
      message.error('You can only upload Excel/CSV files!');
      return Upload.LIST_IGNORE;
    }
    
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('File must be smaller than 5MB!');
      return Upload.LIST_IGNORE;
    }
    
    return true;
  };

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handlePreview = async (file) => {
    if (!file.originFileObj) return;
    
    try {
      const formData = new FormData();
      formData.append('file', file.originFileObj);
      
      // In a real app, you would send this to a preview endpoint
      // For now, we'll just show a success message
      message.info('Preview functionality would be implemented here');
      
      // Simulate preview data
      setPreviewData({
        total: 15,
        valid: 13,
        invalid: 2,
        previewRows: [
          { 
            enrollmentNo: 'ENR001', 
            name: 'John Doe', 
            subject: 'Mathematics', 
            marks: 85, 
            status: 'valid',
            errors: []
          },
          { 
            enrollmentNo: 'ENR002', 
            name: 'Jane Smith', 
            subject: 'Physics', 
            marks: 92, 
            status: 'valid',
            errors: []
          },
          { 
            enrollmentNo: 'ENR003', 
            name: 'Invalid Student', 
            subject: 'Chemistry', 
            marks: 'ABC', 
            status: 'invalid',
            errors: ['Invalid marks format']
          }
        ]
      });
    } catch (error) {
      console.error('Error previewing file:', error);
      message.error('Failed to preview file');
    }
  };

  const handleRemove = () => {
    setFileList([]);
    setPreviewData(null);
  };

  const downloadTemplate = () => {
    // In a real app, you would serve the template file from the server
    const templateUrl = `${API_URL}/templates/results-upload-template.xlsx`;
    const link = document.createElement('a');
    link.href = templateUrl;
    link.download = 'results-upload-template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const onFinish = async (values) => {
    if (fileList.length === 0) {
      message.error('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append('file', fileList[0].originFileObj);
      formData.append('examSession', values.examSession);
      formData.append('course', values.course);
      formData.append('semester', values.semester);
      
      await uploadResults(formData, (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / (progressEvent.total || 1)
        );
        setUploadProgress(percentCompleted);
      });
      
      message.success('Results uploaded successfully!');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error uploading file:', error);
      message.error(error.message || 'Failed to upload results');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const columns = [
    {
      title: 'Enrollment No',
      dataIndex: 'enrollmentNo',
      key: 'enrollmentNo',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Marks',
      dataIndex: 'marks',
      key: 'marks',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'valid' ? 'green' : 'red'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Errors',
      dataIndex: 'errors',
      key: 'errors',
      render: (errors) => (
        <span className="text-red-500">
          {errors?.join(', ') || '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="result-upload">
      <Card title="Upload Results" className="mb-4">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ semester: 1 }}
        >
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                name="course"
                label="Course"
                rules={[{ required: true, message: 'Please select course' }]}
              >
                <Select placeholder="Select Course">
                  {courses.map(course => (
                    <Option key={course._id} value={course._id}>
                      {course.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="semester"
                label="Semester"
                rules={[{ required: true, message: 'Please select semester' }]}
              >
                <Select placeholder="Select Semester">
                  {[...Array(8).keys()].map(sem => (
                    <Option key={sem + 1} value={sem + 1}>
                      Semester {sem + 1}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="examSession"
                label="Exam Session"
                rules={[{ required: true, message: 'Please select exam session' }]}
              >
                <Select placeholder="Select Exam Session">
                  {examSessions.map(session => (
                    <Option key={session._id} value={session._id}>
                      {session.name} ({session.examType})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Upload File</span>
              <Button 
                type="link" 
                icon={<DownloadOutlined />} 
                onClick={downloadTemplate}
                size="small"
              >
                Download Template
              </Button>
            </div>
            <Upload
              accept=".xlsx,.xls,.csv"
              fileList={fileList}
              beforeUpload={beforeUpload}
              onChange={handleChange}
              onPreview={handlePreview}
              onRemove={handleRemove}
              maxCount={1}
            >
              <Button icon={<UploadOutlined />} block>
                Select File
              </Button>
            </Upload>
            <div className="text-xs text-gray-500 mt-1">
              Supported formats: .xlsx, .xls, .csv (Max 5MB)
            </div>
          </div>

          {uploading && (
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress percent={uploadProgress} status="active" />
            </div>
          )}

          {previewData && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Preview</span>
                <div>
                  <Tag color="green">Valid: {previewData.valid}</Tag>
                  <Tag color="red">Invalid: {previewData.invalid}</Tag>
                  <Tag>Total: {previewData.total}</Tag>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table
                  columns={columns}
                  dataSource={previewData.previewRows}
                  rowKey={(record, index) => index}
                  pagination={false}
                  size="small"
                  scroll={{ x: 'max-content' }}
                  className="border rounded"
                />
              </div>
              <div className="mt-2 text-sm text-gray-600">
                {previewData.invalid > 0 ? (
                  <span className="text-red-500">
                    Please fix the {previewData.invalid} error(s) before uploading.
                  </span>
                ) : (
                  <span className="text-green-500">
                    All records are valid. Ready to upload!
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4 mt-6">
            <Button onClick={onCancel} disabled={uploading}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={uploading}
              disabled={!fileList.length || (previewData?.invalid > 0)}
              icon={<UploadOutlined />}
            >
              {uploading ? 'Uploading...' : 'Upload Results'}
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default ResultUpload;
