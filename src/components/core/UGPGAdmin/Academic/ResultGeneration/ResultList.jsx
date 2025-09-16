import React from 'react';
import { Table, Tag, Button, Space, Tooltip, Typography, Empty, Skeleton, Card } from 'antd';
import { 
  EyeOutlined, 
  DownloadOutlined, 
  EditOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  DownOutlined,
  RightOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { downloadMarksheet } from '../../../../../../src/services/resultApi';
import './ResultList.css'; // We'll create this for custom styles

const { Text } = Typography;

const ResultList = ({ data = [], loading, pagination, onChange, onDownload, onView }) => {
  console.log('Raw data received in ResultList:', data);
  
  // Process data for the table
  const tableData = React.useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map(item => {
      const processedItem = {
        ...item,
        key: item._id || Math.random().toString(36).substr(2, 9)
      };
      console.log('Processed item:', processedItem);
      return processedItem;
    });
  }, [data]);
  
  console.log('Processed tableData:', tableData);
  
  // Log each result being processed
  tableData.forEach((result, index) => {
    console.log(`Processing result ${index}:`, result);
  });
  
  // Expand each result into multiple rows (one per subject)
  const expandedData = tableData.flatMap((result, index) => {
    if (!result.subjectResults || !result.subjectResults.length) {
      return [{
        ...result,
        key: result._id,
        isParent: true,
        hasChildren: false
      }];
    }
    
    return [
      // Parent row
      {
        ...result,
        key: `${result._id}-parent`,
        isParent: true,
        hasChildren: true,
        expanded: true
      },
      // Child rows for each subject
      ...result.subjectResults.map((subject, index) => ({
        ...result,
        key: `${result._id}-${index}`,
        subjectResult: subject,
        isParent: false,
        parentId: result._id
      }))
    ];
  });


  const columns = [
    {
      title: 'STUDENT INFORMATION',
      dataIndex: 'student',
      key: 'studentName',
      fixed: 'left',
      width: 250,
      render: (student, record) => {
        if (!record.isParent) return null;
        
        // Handle different student data structures
        const studentName = (() => {
          if (!student) return 'N/A';
          if (typeof student === 'string') return student;
          if (student.firstName || student.lastName) {
            // If we have both first and last name, join them with a space
            const nameParts = [];
            if (student.firstName) nameParts.push(student.firstName);
            if (student.lastName) nameParts.push(student.lastName);
            return nameParts.join(' ').trim();
          }
          return student.name || student.fullName || 'N/A';
        })();

        // Get enrollment info
        console.log('Student data in render:', student);
        console.log('Record data in render:', record);
        
        // Get the enrollment series - check multiple possible locations
        const enrollmentSeries = record?.examSession?.enrollmentSeries || 
                              record?.enrollmentSeries || 
                              student?.enrollmentSeries ||
                              '';
        
        // Get the enrollment number - check multiple possible locations
        const enrollmentNumber = student?.enrollmentNumber || 
                              student?.originalEnrollmentNumber || 
                              record?.enrollmentNumber ||
                              'N/A';
        
        console.log('Enrollment Series:', enrollmentSeries);
        console.log('Enrollment Number:', enrollmentNumber);
        
        // Format the display
        let displayEnrollment = enrollmentSeries || 'N/A';
        
        console.log('Final Display Enrollment:', displayEnrollment);
        
        return (
          <div className="student-info">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600 font-medium">
                  {studentName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '?'}
                </span>
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {studentName}
                </div>
                <div className="text-xs text-gray-500">
                  {displayEnrollment}
                </div>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: 'COURSE & SEMESTER',
      dataIndex: 'course',
      key: 'course',
      width: 200,
      render: (course, record) => {
        if (!record.isParent) return null;
        
        // Get course name from the record or course object
        const courseName = (() => {
          // First check if course name is in the record itself
          if (record.courseName) return record.courseName;
          
          // Then check the course object
          if (!course) return 'Course Not Found';
          
          // Try different possible name fields
          const possibleNameFields = ['name', 'courseName', 'title', 'courseTitle'];
          for (const field of possibleNameFields) {
            if (course[field]) return course[field];
          }
          
          // Check if course is populated with a name
          if (course.name) return course.name;
          
          // If only ID is available, show a formatted version
          if (course._id) {
            return `Course ${course._id.substring(0, 6).toUpperCase()}`;
          }
          
          return 'Course Name Not Available';
        })();
        
        const semester = record.semester || record.semesterNumber || 'N/A';
        
        return (
          <div className="course-info">
            <div className="font-medium text-gray-900">
              {courseName}
            </div>
            {semester && (
              <div className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full mt-1">
                Sem {semester}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'SUBJECT DETAILS',
      key: 'subject',
      width: 250,
      render: (_, record) => {
        if (record.isParent) return (
          <div className="flex items-center">
            <span className="text-gray-500">Click to view subjects</span>
            <RightOutlined className="ml-2 text-xs text-gray-400" />
          </div>
        );
        const examType = record.subjectResult?.examType;
        const examTypeColor = examType === 'practical' ? 'purple' : 'blue';
        
        return (
          <div className="subject-cell">
            <div className="font-medium text-gray-900">
              {record.subjectResult?.subject?.name || 'N/A'}
            </div>
            <Tag 
              color={examTypeColor} 
              className="mt-1 capitalize"
              style={{ textTransform: 'capitalize' }}
            >
              {examType || 'N/A'}
            </Tag>
          </div>
        );
      },
    },
    {
      title: 'MARKS & GRADE',
      key: 'marks',
      width: 180,
      render: (_, record) => {
        if (record.isParent) {
          const percentage = parseFloat(record.percentage) || 0;
          const isPass = record.status === 'PASS';
          
          return (
            <div className="marks-cell">
              <div className="flex items-baseline">
                <span className="text-2xl font-bold text-gray-900">
                  {record.totalMarksObtained || 0}
                </span>
                <span className="text-gray-500 mx-1">/</span>
                <span className="text-gray-600">{record.totalMaxMarks || 0}</span>
              </div>
              <div className="flex items-center mt-1">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${isPass ? 'bg-green-500' : 'bg-red-500'}`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>
                <span className={`ml-2 text-sm font-medium ${isPass ? 'text-green-600' : 'text-red-600'}`}>
                  {percentage}%
                </span>
              </div>
            </div>
          );
        }
        
        const isPassed = record.subjectResult?.isPassed;
        return (
          <div className="marks-cell">
            <div className="font-medium text-gray-900">
              <span className="text-lg">{record.subjectResult?.marksObtained || 0}</span>
              <span className="text-gray-500"> / {record.subjectResult?.maxMarks || 0}</span>
            </div>
            <div className="flex items-center mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {record.subjectResult?.grade || 'N/A'}
              </span>
              <span className={`ml-2 text-xs ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                {isPassed ? 'Pass' : 'Fail'}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: 'STATUS',
      key: 'status',
      width: 150,
      render: (_, record) => {
        const isPassed = record.isParent ? record.status === 'PASS' : record.subjectResult?.isPassed;
        const statusText = record.isParent ? (record.status || 'N/A') : (record.subjectResult?.isPassed ? 'PASS' : 'FAIL');
        
        return (
          <div className="status-cell">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isPassed ? (
                <CheckCircleOutlined className="mr-1.5 h-3.5 w-3.5 text-green-600" />
              ) : (
                <CloseCircleOutlined className="mr-1.5 h-3.5 w-3.5 text-red-600" />
              )}
              {statusText}
            </div>
            {record.updatedAt && (
              <div className="mt-2 text-xs text-gray-500">
                {new Date(record.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      align: 'right',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <div className="flex items-center justify-end space-x-2">
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined className="text-blue-600" />} 
              size="small"
              className="action-btn"
              onClick={() => onView && onView(record)}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined className="text-yellow-600" />} 
              size="small"
              className="action-btn"
              onClick={() => onView && onView(record)}
            />
          </Tooltip>
          <Tooltip title="Download Marksheet">
            <Button 
              type="text" 
              icon={<DownloadOutlined className="text-green-600" />} 
              size="small"
              className="action-btn"
              onClick={() => onDownload && onDownload(record._id)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];


  // Row expansion configuration
  const expandedRowRender = (record) => {
    if (!record.hasChildren) return null;
    
    const columns = [
      {
        title: 'Subject',
        dataIndex: ['subjectResult', 'subject', 'name'],
        key: 'subjectName',
        render: (_, record) => (
          <div>
            <div className="font-medium">
              {record.subjectResult?.subject?.name || 'N/A'}
            </div>
            <Tag color={record.subjectResult?.examType === 'theory' ? 'blue' : 'green'} className="mt-1">
              {record.subjectResult?.examType?.toUpperCase() || 'N/A'}
            </Tag>
          </div>
        ),
      },
      {
        title: 'Marks Obtained',
        key: 'marksObtained',
        render: (_, record) => (
          <div>
            <div className="font-medium">
              {record.subjectResult?.marksObtained || 0} / {record.subjectResult?.maxMarks || 0}
            </div>
            <div className="text-xs">
              Passing: {record.subjectResult?.passingMarks || 0}
            </div>
          </div>
        ),
      },
      {
        title: 'Grade',
        dataIndex: ['subjectResult', 'grade'],
        key: 'grade',
        render: (grade) => <span className="font-medium">{grade || 'N/A'}</span>,
      },
      {
        title: 'Status',
        key: 'status',
        render: (_, record) => (
          <div>
            <Tag color={record.subjectResult?.isPassed ? 'green' : 'red'} className="mb-1">
              {record.subjectResult?.isPassed ? 'Pass' : 'Fail'}
            </Tag>
            <div className="text-xs text-gray-500">
              {record.updatedAt ? new Date(record.updatedAt).toLocaleDateString() : 'N/A'}
            </div>
          </div>
        ),
      },
      {
        title: 'Declaration Date',
        key: 'declarationDate',
        render: (_, record) => (
          <div className="text-sm">
            {record.updatedAt ? new Date(record.updatedAt).toLocaleString() : 'N/A'}
          </div>
        ),
      },
    ];

    const childData = expandedData.filter(item => 
      item.parentId === record._id && !item.isParent
    );

    return (
      <Table
        columns={columns}
        dataSource={childData}
        rowKey="key"
        pagination={false}
        size="small"
        className="bg-gray-50"
      />
    );
  };

  // Custom expand icon
  const expandIcon = ({ expanded, onExpand, record }) =>
    record.hasChildren ? (
      <Button
        type="text"
        size="small"
        icon={expanded ? <DownOutlined /> : <RightOutlined />}
        onClick={(e) => onExpand(record, e)}
        className="expand-icon"
      />
    ) : null;

  if (loading && tableData.length === 0) {
    return (
      <Card className="result-card">
        {[1, 2, 3].map((i) => (
          <div key={i} className="mb-4">
            <Skeleton active paragraph={{ rows: 1 }} />
          </div>
        ))}
      </Card>
    );
  }

  if (tableData.length === 0) {
    return (
      <Card className="result-card">
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No results found"
        />
      </Card>
    );
  }

  return (
    <div className="result-list-container">
      <Table
        columns={columns}
        dataSource={expandedData.filter(item => item.isParent)}
        rowKey="key"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total, range) => (
            <span className="text-sm text-gray-600">
              Showing {range[0]}-{range[1]} of {total} results
            </span>
          ),
          pageSizeOptions: ['10', '20', '50', '100'],
          size: 'default',
          className: 'pagination-container'
        }}
        onChange={onChange}
        scroll={{ x: 'max-content' }}
        expandable={{
          expandedRowRender: (record) => record.hasChildren ? expandedRowRender(record) : null,
          rowExpandable: (record) => record.hasChildren,
          defaultExpandedRowKeys: expandedData
            .filter(item => item.isParent && item.hasChildren)
            .map(item => item.key),
          expandIcon: expandIcon,
          expandRowByClick: true
        }}
        rowClassName={(record) => 
          `result-row ${record.isParent ? 'parent-row' : 'child-row'}`
        }
        className="result-table"
      />
    </div>
  );
};

export default ResultList;
