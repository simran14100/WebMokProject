import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, message, Typography, Empty, Spin, Row, Col, Select } from 'antd';
import { 
  DownloadOutlined,
  FilePdfOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  RightOutlined,
  DownOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { getMyResults, downloadResultPdf } from '../../services/resultApi';
import { useSelector } from 'react-redux';

const { Title, Text } = Typography;
const { Option } = Select;

const StudentResults = () => {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [selectedSemester, setSelectedSemester] = useState('all');
  const [semesters, setSemesters] = useState([]);
  const { token, user } = useSelector((state) => state.auth);
  const [messageApi, contextHolder] = message.useMessage();

  // Fetch results for the logged-in student
  useEffect(() => {
    const loadStudentResults = async () => {
      if (!user?._id) return;
      
      try {
        setLoading(true);
        const response = await getMyResults({
          semester: selectedSemester === 'all' ? undefined : selectedSemester
        });
        
        console.log('Complete API Response:', JSON.parse(JSON.stringify(response)));
        
        if (response.success) {
          console.log('Result 1:', JSON.parse(JSON.stringify(response.data[0])));
          
          // Log the subject results structure
          const firstResult = response.data[0];
          if (firstResult?.subjectResults?.length) {
            console.log('First subject result:', JSON.parse(JSON.stringify(firstResult.subjectResults[0])));
            console.log('Subject results count:', firstResult.subjectResults.length);
          }
          
          // Process the results to ensure we have all required fields
          const resultsData = Array.isArray(response.data) 
            ? response.data 
            : response.data 
              ? [response.data] 
              : [];
              
          // Process the results to ensure we have all required fields
          const sanitizedResults = resultsData.map((result, index) => {
            console.log(`Processing Result ${index + 1}:`, JSON.parse(JSON.stringify(result)));
            
            // Calculate total marks from subject results if not already present
            if (result.subjectResults?.length > 0) {
              console.log('Calculating marks from subject results...');
              
              // Log all subject results for debugging
              result.subjectResults.forEach((subj, i) => {
                console.log(`Subject ${i + 1}:`, {
                  subject: subj.subject?.name || subj.subject,
                  marksObtained: subj.marksObtained,
                  maxMarks: subj.maxMarks,
                  examType: subj.examType
                });
              });
              
              // Calculate total marks
              const totals = result.subjectResults.reduce((acc, subj) => {
                const obtained = parseFloat(subj.marksObtained) || 0;
                const max = parseFloat(subj.maxMarks) || 0;
                return {
                  totalObtained: acc.totalObtained + obtained,
                  totalMax: acc.totalMax + max
                };
              }, { totalObtained: 0, totalMax: 0 });
              
              console.log('Calculated totals from subject results:', totals);
              
              // Update the result with calculated totals
              result.totalMarksObtained = totals.totalObtained;
              result.totalMaxMarks = totals.totalMax;
            }
            
            // Ensure course is properly formatted
            let course = result.course;
            console.log('Course data after processing:', course);
            
            if (!course) {
              console.log('Course is null/undefined, setting to N/A');
              course = { name: 'N/A' };
            } else if (typeof course === 'string') {
              console.log('Course is a string, converting to object');
              course = { name: course };
            } else if (typeof course === 'object') {
              console.log('Course is an object with keys:', Object.keys(course));
            }
            
            return {
              ...result,
              course, // Use the formatted course
              examSession: result.examSession || { name: 'N/A' },
              semester: result.semester || 0,
              totalMarksObtained: result.totalMarksObtained || 0,
              totalMaxMarks: result.totalMaxMarks || 0,
              percentage: result.percentage || 0,
              status: result.status || 'N/A'
            };
          });
          
          setResults(sanitizedResults);
          
          // Extract unique semesters from the sanitized results
          const semestersSet = new Set();
          
          sanitizedResults.forEach(result => {
            // Add semester if it exists
            if (result.semester) {
              semestersSet.add(String(result.semester));
            }
          });
          
          setSemesters(Array.from(semestersSet).sort((a, b) => parseInt(a) - parseInt(b)));
        } else {
          messageApi.error(response.message || 'Failed to fetch results');
          setResults([]);
          setSemesters([]);
        }
      } catch (error) {
        console.error('Error loading student results:', error);
        messageApi.error(error.message || 'Failed to load results');
        setResults([]);
        setSemesters([]);
      } finally {
        setLoading(false);
      }
    };

    loadStudentResults();
  }, [user?._id, selectedSemester, messageApi]);

  const handleDownloadPdf = (result) => {
    const downloadPdf = async () => {
      // Show loading indicator
      const hideLoading = messageApi.loading('Preparing your download...', 0);
      
      try {
        // Sanitize filename
        const studentName = (user?.fullName || 'marksheet')
          .replace(/[^\w\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '_')       // Replace spaces with underscores
          .toLowerCase();
          
        const filename = `${studentName}_result_${result._id}.pdf`;
        
        // Download the PDF using our API function
        const pdfBlob = await downloadResultPdf(result._id);
        
        // Verify we got a valid blob
        if (!(pdfBlob instanceof Blob)) {
          throw new Error('Invalid file received from server');
        }
        
        // Create a blob URL and trigger download
        const blobUrl = window.URL.createObjectURL(pdfBlob);
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.setAttribute('download', filename);
        link.style.display = 'none';
        
        // Add to DOM, trigger download, then clean up
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        setTimeout(() => {
          window.URL.revokeObjectURL(blobUrl);
          document.body.removeChild(link);
          hideLoading();
          messageApi.success('Result downloaded successfully');
        }, 100);
        
      } catch (error) {
        console.error('Error downloading result:', error);
        hideLoading();
        
        // More specific error messages based on error type
        let errorMessage = 'Failed to download result. ';
        
        if (error.response) {
          // Server responded with an error status code
          if (error.response.status === 403) {
            errorMessage += 'You do not have permission to download this result.';
          } else if (error.response.status === 404) {
            errorMessage += 'The requested result was not found.';
          } else if (error.response.status >= 500) {
            errorMessage += 'Server error. Please try again later.';
          }
        } else if (error.request) {
          // Request was made but no response received
          errorMessage += 'Could not connect to the server. Please check your internet connection.';
        } else {
          // Something else happened
          errorMessage += error.message || 'An unexpected error occurred.';
        }
        
        messageApi.error(errorMessage);
      }
    };
    
    // Trigger the download in a separate event loop to avoid React warning
    setTimeout(downloadPdf, 0);
  };

  const columns = [
    {
      title: 'Course',
      dataIndex: 'course',
      key: 'course',
      render: (course, record, index) => {
        // Log the raw course data for debugging
        console.log(`[Course Render] Row ${index} course data:`, course);
        
        // If course is an empty object, try to get the course ID from the raw data
        if (course && typeof course === 'object' && Object.keys(course).length === 0) {
          console.log('Empty course object detected, checking raw data');
          const rawCourseId = record._doc?.course?.toString();
          if (rawCourseId) {
            console.log(`Found course ID in raw data: ${rawCourseId}`);
            return <span className="font-medium">Course {rawCourseId}</span>;
          }
        }
        
        // Handle different course data structures
        let displayText = 'N/A';
        
        if (course) {
          if (typeof course === 'object') {
            // Handle both courseName and name fields
            if (course.courseName) {
              displayText = course.courseName;
            } 
            else if (course.name) {
              displayText = course.name;
            }
            // If no name but we have an _id, use that
            else if (course._id) {
              displayText = `Course ${course._id}`;
            }
          } else if (typeof course === 'string') {
            // If it's just a string, use it directly
            displayText = course;
          }
        }
        
        console.log('Displaying course as:', displayText);
        return <span className="font-medium">{displayText}</span>;
      },
    },
    {
      title: 'Semester',
      dataIndex: 'semester',
      key: 'semester',
      render: (semester) => `Semester ${semester || 'N/A'}`,
    },
    {
      title: 'Marks',
      key: 'marks',
      render: (_, record, index) => {
        // Calculate marks if not already present
        let marksObtained = record.totalMarksObtained;
        let maxMarks = record.totalMaxMarks;
        
        // If marks are not set, calculate from subject results
        if ((!marksObtained && marksObtained !== 0) || (!maxMarks && maxMarks !== 0)) {
          if (record.subjectResults?.length > 0) {
            const totals = record.subjectResults.reduce((acc, subj) => {
              const obtained = parseFloat(subj.marksObtained) || 0;
              const max = parseFloat(subj.maxMarks) || 0;
              return {
                obtained: acc.obtained + obtained,
                max: acc.max + max
              };
            }, { obtained: 0, max: 0 });
            
            marksObtained = totals.obtained;
            maxMarks = totals.max;
            
            // Update the record with calculated values
            record.totalMarksObtained = marksObtained;
            record.totalMaxMarks = maxMarks;
          }
        }
        
        // Debug log
        console.log(`[Marks Render] Row ${index}:`, {
          recordId: record._id,
          marksObtained,
          maxMarks,
          hasSubjectResults: !!record.subjectResults?.length,
          subjectResults: record.subjectResults?.map(s => ({
            subject: s.subject?.name || s.subject,
            marksObtained: s.marksObtained,
            maxMarks: s.maxMarks,
            examType: s.examType
          }))
        });
        
        // Check if we have valid marks data
        const hasValidMarks = (marksObtained || marksObtained === 0) && 
                            (maxMarks || maxMarks === 0);
        
        return (
          <div>
            <span className="font-medium">
              {hasValidMarks ? marksObtained : 'N/A'}
            </span>
            <span className="text-gray-500">
              {hasValidMarks ? ` / ${maxMarks}` : ' / N/A'}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Percentage',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage) => {
        try {
          // Handle null/undefined/NaN cases
          const percentValue = Number(percentage);
          if (isNaN(percentValue)) return '0.00%';
          return `${percentValue.toFixed(2)}%`;
        } catch (error) {
          console.error('Error formatting percentage:', error);
          return '0.00%';
        }
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'PASS' ? 'green' : 'red'} className="font-medium">
          {status || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<FilePdfOutlined />} 
          onClick={() => handleDownloadPdf(record)}
          className="bg-blue-600 hover:bg-blue-700 flex items-center"
        >
          Download
        </Button>
      ),
    },
  ];

  const expandedRowRender = (record) => {
    if (!record.subjectResults?.length) {
      return <div className="p-4 text-gray-500">No subject details available</div>;
    }

    // Group subject results by subject ID
    const groupedResults = record.subjectResults.reduce((acc, item) => {
      // Get subject ID from the subject object or string
      const subjectId = typeof item.subject === 'object' 
        ? item.subject._id || item.subject._id
        : item.subject;
      
      if (!subjectId) return acc; // Skip if no subject ID
      
      // Initialize the subject entry if it doesn't exist
      if (!acc[subjectId]) {
        acc[subjectId] = {
          _id: subjectId,
          subject: item.subject, // Keep the full subject object
          isCombined: false,
          theoryMarks: null,
          practicalMarks: null,
          marksObtained: 0,
          maxMarks: 0,
          grade: null,
          percentage: 0,
          isPassed: true
        };
      }
      
      // Handle theory marks
      if (item.examType === 'theory') {
        acc[subjectId].theoryMarks = {
          obtained: parseFloat(item.marksObtained) || 0,
          max: parseFloat(item.maxMarks) || 0,
          passingMarks: parseFloat(item.passingMarks) || 0,
          grade: item.grade,
          percentage: parseFloat(item.percentage) || 0,
          isPassed: item.isPassed !== false
        };
      }
      
      // Handle practical marks
      if (item.examType === 'practical') {
        acc[subjectId].practicalMarks = {
          obtained: parseFloat(item.marksObtained) || 0,
          max: parseFloat(item.maxMarks) || 0,
          passingMarks: parseFloat(item.passingMarks) || 0,
          grade: item.grade,
          percentage: parseFloat(item.percentage) || 0,
          isPassed: item.isPassed !== false
        };
      }
      
      // Update combined totals
      const theoryObtained = acc[subjectId].theoryMarks?.obtained || 0;
      const practicalObtained = acc[subjectId].practicalMarks?.obtained || 0;
      const theoryMax = acc[subjectId].theoryMarks?.max || 0;
      const practicalMax = acc[subjectId].practicalMarks?.max || 0;
      
      acc[subjectId].marksObtained = theoryObtained + practicalObtained;
      acc[subjectId].maxMarks = theoryMax + practicalMax;
      
      // Calculate overall percentage
      if (acc[subjectId].maxMarks > 0) {
        acc[subjectId].percentage = Math.round(
          (acc[subjectId].marksObtained / acc[subjectId].maxMarks) * 100
        );
      }
      
      // Determine overall pass/fail status
      const theoryPassed = !acc[subjectId].theoryMarks || acc[subjectId].theoryMarks.isPassed;
      const practicalPassed = !acc[subjectId].practicalMarks || acc[subjectId].practicalMarks.isPassed;
      acc[subjectId].isPassed = theoryPassed && practicalPassed;
      
      // Set grade based on percentage if not already set
      if (!acc[subjectId].grade) {
        acc[subjectId].grade = acc[subjectId].isPassed ? 'Pass' : 'Fail';
      }
      
      return acc;
    }, {});
    
    // Log the grouped results for debugging
    console.log('Grouped Results:', JSON.parse(JSON.stringify(groupedResults)));
    
    // Calculate total marks across all subjects
    let totalMarksObtained = 0;
    let totalMaxMarks = 0;
    
    // First, log all subject results for debugging
    console.log('All Subject Results:', JSON.parse(JSON.stringify(record.subjectResults)));
    
    // Calculate totals directly from subject results
    record.subjectResults.forEach(subject => {
      const marksObtained = parseFloat(subject.marksObtained) || 0;
      const maxMarks = parseFloat(subject.maxMarks) || 0;
      
      console.log(`Subject ${subject.subject?.name || subject.subject}:`, {
        examType: subject.examType,
        marksObtained,
        maxMarks,
        isPassed: subject.isPassed
      });
      
      // Only add to totals if it's a valid number
      if (!isNaN(marksObtained) && !isNaN(maxMarks)) {
        totalMarksObtained += marksObtained;
        totalMaxMarks += maxMarks;
      }
    });
    
    // If we still have zero totals, try to get from the record directly
    if (totalMarksObtained === 0 && totalMaxMarks === 0) {
      totalMarksObtained = parseFloat(record.totalMarksObtained) || 0;
      totalMaxMarks = parseFloat(record.totalMaxMarks) || 0;
    }
    
    // Log the calculated totals
    console.log('Calculated Totals:', { 
      totalMarksObtained, 
      totalMaxMarks,
      recordTotalMarks: record.totalMarksObtained,
      recordMaxMarks: record.totalMaxMarks
    });
    
    // Update the record with calculated totals
    record.totalMarksObtained = totalMarksObtained;
    record.totalMaxMarks = totalMaxMarks;
    
    // Convert to array for the table
    const displayResults = Object.values(groupedResults);

    const subjectColumns = [
      {
        title: 'Subject',
        key: 'subjectName',
        width: '20%',
        render: (item) => {
          const subject = item.subject;
          let subjectName = 'N/A';
          
          if (subject) {
            if (typeof subject === 'object') {
              subjectName = subject.name || subject.subjectName || subject.code || 'N/A';
            } else if (typeof subject === 'string') {
              subjectName = subject;
            }
          }
          
          return (
            <div className="font-medium text-gray-900">
              {subjectName}
            </div>
          );
        },
      },
      {
        title: 'Theory',
        key: 'theory',
        align: 'center',
        width: '15%',
        render: (item) => {
          if (!item.theoryMarks) return <div className="text-gray-400">-</div>;
          const isPass = item.theoryMarks.obtained >= item.theoryMarks.passingMarks;
          
          return (
            <div className="text-center">
              <div className={`font-medium ${isPass ? 'text-gray-900' : 'text-red-600'}`}>
                {item.theoryMarks.obtained}
              </div>
              <div className="text-xs text-gray-500">
                / {item.theoryMarks.max} 
              </div>
              {item.theoryMarks.grade && (
                <div className="text-xs font-medium mt-1">
                  Grade: {item.theoryMarks.grade}
                </div>
              )}
            </div>
          );
        },
      },
      {
        title: 'Practicals',
        key: 'practicals',
        align: 'center',
        width: '15%',
        render: (item) => {
          if (!item.practicalMarks) return <div className="text-gray-400">-</div>;
          const isPass = item.practicalMarks.obtained >= item.practicalMarks.passingMarks;
          
          return (
            <div className="text-center">
              <div className={`font-medium ${isPass ? 'text-gray-900' : 'text-red-600'}`}>
                {item.practicalMarks.obtained}
              </div>
              <div className="text-xs text-gray-500">
                / {item.practicalMarks.max} 
              </div>
              {item.practicalMarks.grade && (
                <div className="text-xs font-medium mt-1">
                  Grade: {item.practicalMarks.grade}
                </div>
              )}
            </div>
          );
        },
      },
      {
        title: 'Total',
        key: 'total',
        align: 'center',
        width: '15%',
        render: (item) => {
          const theoryObtained = item.theoryMarks?.obtained || 0;
          const practicalObtained = item.practicalMarks?.obtained || 0;
          const theoryMax = item.theoryMarks?.max || 0;
          const practicalMax = item.practicalMarks?.max || 0;
          
          const totalObtained = theoryObtained + practicalObtained;
          const totalMax = theoryMax + practicalMax;
          const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
          
          // Calculate passing marks (sum of individual passing marks if both exist)
          let passingMarks = 0;
          if (item.theoryMarks && item.practicalMarks) {
            passingMarks = (item.theoryMarks.passingMarks || 0) + (item.practicalMarks.passingMarks || 0);
          } else if (item.theoryMarks) {
            passingMarks = item.theoryMarks.passingMarks || 0;
          } else if (item.practicalMarks) {
            passingMarks = item.practicalMarks.passingMarks || 0;
          }
          
          const isPass = item.isPassed !== false;
          
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
        title: 'Status',
        key: 'status',
        align: 'center',
        width: '15%',
        render: (item) => {
          const isPass = item.isPassed !== false;
          const statusText = isPass ? 'Passed' : 'Failed';
          
          return (
            <div className="flex flex-col items-center">
              <span 
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  isPass ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {statusText}
              </span>
              {item.grade && item.grade !== 'Pass' && item.grade !== 'Fail' && (
                <span className="mt-1 text-xs font-medium text-gray-600">
                  Grade: {item.grade}
                </span>
              )}
            </div>
          );
        },
      },
    ];

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Table
          columns={subjectColumns}
          dataSource={displayResults}
          rowKey={(item) => item._id || `${item.subject?._id || item.subject}-${Math.random().toString(36).substr(2, 9)}`}
          pagination={false}
          size="middle"
          bordered
          className="subject-results-table"
          rowClassName={(record, index) => 
            index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
          }
          onRow={(record) => ({
            className: record.grade === 'F' || record.grade === 'Fail' ? 'border-l-4 border-l-red-500' : ''
          })}
        />
        <style jsx global>{`
          .subject-results-table .ant-table-thead > tr > th {
            background-color: #f8fafc !important;
            color: #64748b;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.05em;
          }
          .subject-results-table .ant-table-tbody > tr > td {
            border-bottom: 1px solid #f1f5f9;
          }
          .subject-results-table .ant-table-tbody > tr:hover > td {
            background-color: #f8fafc !important;
          }
        `}</style>
      </div>
    );
  };
  
  const handleSemesterChange = (value) => {
    setSelectedSemester(value);
  };
  
  // Filter results based on selected semester
  const filteredResults = results.filter(result => {
    // Handle semester filtering
    const semesterValue = result.semester?.toString() || '';
    return selectedSemester === 'all' || semesterValue === selectedSemester;
  });

  return (
    <div className="p-4">
      <div className="mb-6">
        <Title level={3} className="mb-2">My Results</Title>
        <Text type="secondary">View and download your examination results</Text>
      </div>

      <Card className="mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Semester</label>
              <Select
                className="w-full"
                value={selectedSemester}
                onChange={handleSemesterChange}
              >
                <Option value="all">All Semesters</Option>
                {Array.from(new Set(
                  results
                    .map(r => r.semester?.toString())
                    .filter(Boolean)
                )).sort((a, b) => parseInt(a) - parseInt(b)).map(sem => (
                  <Option key={sem} value={sem}>
                    Semester {sem}
                  </Option>
                ))}
              </Select>
            </div>
          </Col>
        </Row>
      </Card>

      <Card>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : filteredResults.length > 0 ? (
          <Table
            columns={columns}
            dataSource={filteredResults}
            rowKey="_id"
            expandable={{
              expandedRowRender,
              expandIcon: ({ expanded, onExpand, record }) =>
                record.subjectResults?.length > 0 ? (
                  <Button
                    type="text"
                    size="small"
                    icon={expanded ? <DownOutlined /> : <RightOutlined />}
                    onClick={(e) => onExpand(record, e)}
                  />
                ) : null,
              rowExpandable: (record) => record.subjectResults?.length > 0,
              expandedRowKeys,
              onExpand: (expanded, record) => {
                if (expanded) {
                  setExpandedRowKeys([...expandedRowKeys, record._id]);
                } else {
                  setExpandedRowKeys(expandedRowKeys.filter((key) => key !== record._id));
                }
              },
            }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} results`,
            }}
          />
        ) : (
          <Empty 
            description={
              <span className="text-gray-500">
                {results.length === 0 
                  ? 'No results found. Your results will appear here once they are published.'
                  : 'No results match the selected filters.'}
              </span>
            }
          />
        )}
      </Card>
    </div>
  );
};

export default StudentResults;
