import React from 'react';
import { Table, Tag, Button, Space, Tooltip, Typography, Empty, Skeleton, Card, message } from 'antd';
import { 
  EyeOutlined, 
  DownloadOutlined, 
  EditOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  DownOutlined,
  RightOutlined,
  FileTextOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { downloadMarksheet } from '../../../../../../src/services/resultApi';
import './ResultList.css'; // We'll create this for custom styles

const { Text } = Typography;

const ResultList = ({ data = [], loading, pagination, onChange, onDownload, onView, onDelete }) => {
  console.log('Raw data received in ResultList:', data);
  
  // Process data for the table
  const tableData = React.useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.map(item => ({
      ...item,
      key: item._id || Math.random().toString(36).substr(2, 9)
    }));
  }, [data]);
  
  // Process the data to group subject results by subject
  const expandedData = tableData.flatMap((result) => {
    if (!result.subjectResults || !result.subjectResults.length) {
      return [{
        ...result,
        key: result._id,
        isParent: true,
        hasChildren: false
      }];
    }
    
    // Group subject results by subject ID
    const subjectGroups = result.subjectResults.reduce((acc, subject) => {
      const subjectId = subject.subject?._id || subject.subject;
      if (!acc[subjectId]) {
        acc[subjectId] = {
          subject: subject.subject,
          theoryMarks: null,
          practicalMarks: null,
          isPassed: true
        };
      }
      
      // Handle theory marks
      if (subject.examType === 'theory') {
        acc[subjectId].theoryMarks = {
          obtained: parseFloat(subject.marksObtained) || 0,
          max: parseFloat(subject.maxMarks) || 0,
          passingMarks: parseFloat(subject.passingMarks) || 0,
          grade: subject.grade,
          percentage: parseFloat(subject.percentage) || 0,
          isPassed: subject.isPassed !== false
        };
      }
      
      // Handle practical marks
      if (subject.examType === 'practical') {
        acc[subjectId].practicalMarks = {
          obtained: parseFloat(subject.marksObtained) || 0,
          max: parseFloat(subject.maxMarks) || 0,
          passingMarks: parseFloat(subject.passingMarks) || 0,
          grade: subject.grade,
          percentage: parseFloat(subject.percentage) || 0,
          isPassed: subject.isPassed !== false
        };
      }
      
      // Update combined pass/fail status
      if (subject.examType === 'theory' || subject.examType === 'practical') {
        acc[subjectId].isPassed = acc[subjectId].isPassed && subject.isPassed !== false;
      }
      
      return acc;
    }, {});
    
    // Convert to array of subjects with combined data
    const subjectResults = Object.values(subjectGroups).map((subject, index) => ({
      ...result,
      key: `${result._id}-${index}`,
      subjectResult: subject,
      isParent: false,
      parentId: result._id
    }));
    
    return [
      // Parent row
      {
        ...result,
        key: `${result._id}-parent`,
        isParent: true,
        hasChildren: subjectResults.length > 0,
        expanded: true
      },
      // Child rows for each subject (combined theory/practical)
      ...subjectResults
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
      width: 300,
      render: (_, record) => {
        if (record.isParent) return (
          <div className="flex items-center">
            <span className="text-gray-500">Click to view subjects</span>
            <RightOutlined className="ml-2 text-xs text-gray-400" />
          </div>
        );
        
        const subjectName = record.subjectResult?.subject?.name || 'N/A';
        const subjectCode = record.subjectResult?.subject?.code || '';
        
        return (
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <FileTextOutlined className="text-blue-600" />
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {subjectName}
              </div>
              {subjectCode && (
                <div className="text-xs text-gray-500">
                  Code: {subjectCode}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    
    {
      title: 'TOTAL',
      key: 'total',
      align: 'center',
      width: 120,
      render: (_, record) => {
        if (record.isParent) {
          const percentage = parseFloat(record.percentage) || 0;
          const isPass = record.status === 'PASS';
          
          return (
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {record.totalMarksObtained || 0}
              </div>
              <div className="text-xs text-gray-500">
                / {record.totalMaxMarks || 0}
              </div>
              <div className="text-sm font-medium mt-1" style={{ color: isPass ? '#10B981' : '#EF4444' }}>
                {percentage}%
              </div>
            </div>
          );
        }
        
        const theoryObtained = record.subjectResult?.theoryMarks?.obtained || 0;
        const practicalObtained = record.subjectResult?.practicalMarks?.obtained || 0;
        const theoryMax = record.subjectResult?.theoryMarks?.max || 0;
        const practicalMax = record.subjectResult?.practicalMarks?.max || 0;
        
        const totalObtained = theoryObtained + practicalObtained;
        const totalMax = theoryMax + practicalMax;
        const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
        const isPass = record.subjectResult?.isPassed !== false;
        
        return (
          <div className="text-center">
            <div className={`font-medium ${isPass ? 'text-gray-900' : 'text-red-600'}`}>
              {totalObtained}
            </div>
            <div className="text-xs text-gray-500">
              / {totalMax}
            </div>
            <div className="text-xs font-medium mt-1" style={{ color: isPass ? '#10B981' : '#EF4444' }}>
              {percentage}%
            </div>
          </div>
        );
      },
    },
    {
      title: 'STATUS',
      key: 'status',
      width: 120,
      render: (_, record) => {
        if (record.isParent) {
          const isPassed = record.status === 'PASS';
          return (
            <div className="flex flex-col items-center">
              <span 
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {isPassed ? (
                  <CheckCircleOutlined className="mr-1.5 h-3.5 w-3.5 text-green-600" />
                ) : (
                  <CloseCircleOutlined className="mr-1.5 h-3.5 w-3.5 text-red-600" />
                )}
                {record.status || 'N/A'}
              </span>
              {record.updatedAt && (
                <div className="mt-1 text-xs text-gray-500">
                  {new Date(record.updatedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              )}
            </div>
          );
        }
        
        const isPassed = record.subjectResult?.isPassed !== false;
        const statusText = isPassed ? 'PASS' : 'FAIL';
        
        return (
          <div className="flex flex-col items-center">
            <span 
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                isPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {statusText}
            </span>
            {record.subjectResult?.grade && record.subjectResult.grade !== 'PASS' && record.subjectResult.grade !== 'FAIL' && (
              <span className="mt-1 text-xs font-medium text-gray-600">
                Grade: {record.subjectResult.grade}
              </span>
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
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined className="text-blue-600" />} 
              size="small"
              className="action-btn"
              onClick={() => onView && onView(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              type="text" 
              danger
              icon={<DeleteOutlined />} 
              size="small"
              className="action-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDelete && onDelete(record._id);
              }}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const calculateGrade = (p) => {
    if (!p && p !== 0) return 'N/A';
    if (p >= 90) return 'A+';
    if (p >= 80) return 'A';
    if (p >= 70) return 'B+';
    if (p >= 60) return 'B';
    if (p >= 50) return 'C';
    if (p >= 40) return 'D';
    return 'F';
  };

  // Render the main component
  console.log('Rendering ResultList with expandedData:', expandedData);
  console.log('Parent records:', expandedData.filter(item => item.isParent));
  
  return (
    <div className="result-list-container">
      <Table
        columns={columns}
        dataSource={expandedData.filter(item => item.isParent)}
        rowKey="key"
        loading={loading}
        pagination={{
          ...pagination,
          showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} results`,
          pageSizeOptions: ['10', '20', '50', '100'],
          size: 'default',
          className: 'pagination-container'
        }}
        onChange={onChange}
        expandable={{
          expandedRowRender: (record) => {
            console.log('Rendering expanded row for record:', record);
            if (!record.subjectResults || !record.subjectResults.length) {
              return <div className="p-4 text-gray-500">No subject details available</div>;
            }

            // Group subject results by subject ID
            const subjectGroups = record.subjectResults.reduce((acc, subject) => {
              const subjectId = subject.subject?._id || subject.subject;
              if (!acc[subjectId]) {
                acc[subjectId] = {
                  ...subject,
                  theoryMarks: {},
                  practicalMarks: {}
                };
              }
              
              // Combine theory and practical marks for the same subject
              if (subject.examType === 'theory') {
                acc[subjectId].theoryMarks = {
                  obtained: subject.marksObtained,
                  max: subject.maxMarks,
                  isPassed: subject.isPassed
                };
              } else if (subject.examType === 'practical') {
                acc[subjectId].practicalMarks = {
                  obtained: subject.marksObtained,
                  max: subject.maxMarks,
                  isPassed: subject.isPassed
                };
              }
              
              return acc;
            }, {});

            // Convert to array for rendering
            const groupedSubjects = Object.values(subjectGroups);

            return (
              <div className="p-4 bg-white">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border p-2 text-left">Subjects</th>
                      <th className="border p-2 text-center">Theory (Grade)</th>
                      <th className="border p-2 text-center">Practical (Grade)</th>
                      <th className="border p-2 text-center">Total (Grade)</th>
                      <th className="border p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupedSubjects.map((subject, index) => {
                      const subjectData = subject.subject || {};
                      const theory = subject.theoryMarks || {};
                      const practical = subject.practicalMarks || {};
                      
                      const theoryObtained = theory.obtained !== undefined ? parseInt(theory.obtained) : 0;
                      const theoryMax = theory.max !== undefined ? parseInt(theory.max) : 0;
                      const practicalObtained = practical.obtained !== undefined ? parseInt(practical.obtained) : 0;
                      const practicalMax = practical.max !== undefined ? parseInt(practical.max) : 0;
                      
                      const totalObtained = theoryObtained + practicalObtained;
                      const totalMax = theoryMax + practicalMax;
                      
                      // Calculate percentages
                      const theoryPercentage = theoryMax > 0 ? Math.round((theoryObtained / theoryMax) * 100) : 0;
                      const practicalPercentage = practicalMax > 0 ? Math.round((practicalObtained / practicalMax) * 100) : 0;
                      const totalPercentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
                      
                      // Get grades
                      const theoryGrade = calculateGrade(theoryPercentage);
                      const practicalGrade = calculateGrade(practicalPercentage);
                      const totalGrade = calculateGrade(totalPercentage);
                      
                      const isPassed = (theory.isPassed !== false && practical.isPassed !== false);
                      
                      return (
                        <tr key={subject._id || index} className="hover:bg-gray-50">
                          <td className="border p-2 font-medium">
                            {typeof subjectData === 'object' ? subjectData.name : subject.subject || 'N/A'}
                          </td>
                          <td className="border p-2 text-center">
                            <div>{theory.obtained !== undefined ? `${theory.obtained}/${theory.max}` : 'N/A'}</div>
                            {theory.obtained !== undefined && (
                              <div className="text-xs text-gray-600">
                                {theoryGrade} ({theoryPercentage}%)
                              </div>
                            )}
                          </td>
                          <td className="border p-2 text-center">
                            <div>{practical.obtained !== undefined ? `${practical.obtained}/${practical.max}` : 'N/A'}</div>
                            {practical.obtained !== undefined && (
                              <div className="text-xs text-gray-600">
                                {practicalGrade} ({practicalPercentage}%)
                              </div>
                            )}
                          </td>
                          <td className="border p-2 text-center font-medium">
                            <div>{totalObtained > 0 ? `${totalObtained}${totalMax > 0 ? `/${totalMax}` : ''}` : 'N/A'}</div>
                            {totalObtained > 0 && (
                              <div className="text-xs text-gray-600">
                                {totalGrade} ({totalPercentage}%)
                              </div>
                            )}
                          </td>
                          <td className="border p-2 text-center">
                            <Tag color={isPassed ? 'green' : 'red'} className="font-medium">
                              {isPassed ? 'PASS' : 'FAIL'}
                            </Tag>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          },
          rowExpandable: record => {
            const expandable = record.hasChildren && record.subjectResults?.length > 0;
            console.log('Row expandable:', record.key, 'expandable:', expandable);
            return expandable;
          },
          defaultExpandedRowKeys: expandedData
            .filter(item => item.isParent && item.hasChildren && item.subjectResults?.length > 0)
            .map(item => item.key),
          expandIcon: ({ expanded, onExpand, record }) => {
            console.log('Expand icon clicked. Record:', record.key, 'Expanded:', expanded);
            if (!record.isParent || !record.hasChildren) {
              console.log('Row not expandable:', record.key);
              return null;
            }
            return (
              <button
                onClick={e => {
                  e.stopPropagation();
                  onExpand(record, e);
                }}
                className="expand-icon"
              >
                {expanded ? (
                  <DownOutlined className="text-gray-400" />
                ) : (
                  <RightOutlined className="text-gray-400" />
                )}
              </button>
            );
          },
          expandRowByClick: true
        }}
        className="result-table"
        scroll={{ x: true }}
        bordered
      />
    </div>
  );
};

export default ResultList;
