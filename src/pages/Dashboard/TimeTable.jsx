


import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Spin, message, Row, Col, Select } from 'antd';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { apiConnector } from '../../services/apiConnector';

const { Option } = Select;

const TimeTable = () => {
  const [loading, setLoading] = useState(true);
  const [timetable, setTimetable] = useState([]);
  const [semester, setSemester] = useState('');
  const [course, setCourse] = useState({});
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const { user } = useSelector((state) => state.auth);

  // Days of the week in order
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Time slots in order (you can adjust these based on your actual time slots)
  const timeSlots = [
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:15 AM - 12:15 PM',
    '12:15 PM - 01:15 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
    '04:00 PM - 05:00 PM',
  ];

  // Color scheme
  const colors = {
    darkBlue: '#1e3a8a',
    mediumBlue: '#3b82f6', 
    lightBlue: '#e0f2fe',
    lightestBlue: '#f0f9ff',
    darkGray: '#374151',
    mediumGray: '#6b7280',
    lightGray: '#f3f4f6',
    white: '#ffffff',
    border: '#e5e7eb'
  };

  // Fetch all semesters with timetable entries
  const fetchAvailableSemesters = async () => {
    try {
      const response = await apiConnector(
        'GET',
        '/api/v1/timetable/semesters',
        null,
        {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      );
      
      if (response.data.success) {
        setAvailableSemesters(response.data.semesters);
        // If no semester is selected, select the first one
        if (response.data.semesters.length > 0 && !semester) {
          setSemester(response.data.semesters[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching available semesters:', error);
    }
  };

  // Function to extract subject name from entry
  const getSubjectName = (entry) => {
    // If subject is an object with name property (populated)
    if (entry.subject && typeof entry.subject === 'object' && entry.subject.name) {
      return entry.subject.name;
    }
    // If subject is just an ID (not populated)
    if (entry.subject) {
      return `Subject (${entry.subject})`;
    }
    // Fallback
    return 'No Subject';
  };

  // Fetch student's timetable for a specific semester
  const fetchTimetable = async (selectedSemester) => {
    if (!selectedSemester) return;
    
    try {
      setLoading(true);
      
      // First, fetch the timetable with subject IDs
      const response = await fetch(
        `http://localhost:4000/api/v1/timetable/student?semester=${selectedSemester}`, 
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      
      if (responseData.success) {
        console.log('Timetable response:', responseData.data);
        setTimetable(responseData.data);
        setCourse(responseData.course || {});
      }
    } catch (error) {
      console.error('Error in fetchTimetable:', error);
      message.error('Error loading timetable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      // First fetch available semesters, then fetch timetable for the selected semester
      fetchAvailableSemesters();
    }
  }, [user]);
  
  // Fetch timetable when semester changes
  useEffect(() => {
    if (semester) {
      fetchTimetable(semester);
    }
  }, [semester]);

  // Process timetable data for the table
  const processTimetableData = () => {
    if (!timetable || !timetable.length) return [];

    // Create a map for each time slot and day
    return timeSlots.map(timeSlot => {
      const row = { timeSlot, key: timeSlot };
      
      daysOfWeek.forEach(day => {
        const entry = timetable.find(item => 
          item.timeSlot === timeSlot && item.day === day
        );
        
        if (entry) {
          row[day] = (
            <div style={{
              padding: '12px',
              minHeight: '90px',
              borderRadius: '8px',
              background: `linear-gradient(135deg, ${colors.lightestBlue} 0%, ${colors.lightBlue} 100%)`,
              border: `1px solid ${colors.border}`,
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0px)';
              e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
            }}>
              <div style={{
                fontWeight: '600',
                marginBottom: '6px',
                color: colors.darkBlue,
                fontSize: '14px',
                lineHeight: '1.3'
              }}>
                {getSubjectName(entry)}
              </div>
              <div style={{
                fontSize: '12px',
                color: colors.mediumGray,
                marginBottom: '4px',
                fontWeight: '500'
              }}>
                {entry.faculty?.name || 'N/A'}
              </div>
              <div style={{
                fontSize: '11px',
                color: colors.mediumGray,
                fontStyle: 'italic',
                padding: '2px 6px',
                backgroundColor: colors.white,
                borderRadius: '4px',
                display: 'inline-block'
              }}>
                📍 {entry.room}
              </div>
            </div>
          );
        }
      });

      return row;
    });
  };

  // Columns for the table
  const columns = [
    {
      title: 'Time Slot',
      dataIndex: 'timeSlot',
      key: 'timeSlot',
      width: 160,
      fixed: 'left',
      render: (text) => (
        <div style={{
          fontWeight: '600',
          color: colors.darkBlue,
          fontSize: '13px',
          textAlign: 'center',
          padding: '8px 4px'
        }}>
          {text}
        </div>
      )
    },
    ...daysOfWeek.map(day => ({
      title: day,
      dataIndex: day,
      key: day,
      render: (text) => text || (
        <div style={{
          minHeight: '90px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.mediumGray,
          fontStyle: 'italic',
          backgroundColor: colors.lightGray,
          borderRadius: '6px',
          border: `1px dashed ${colors.border}`
        }}>
          No Class
        </div>
      ),
    })),
  ];

  // Handle semester change
  const handleSemesterChange = (value) => {
    setSemester(value);
    fetchTimetable(value);
  };

  return (
    <div style={{ 
      padding: '24px', 
      backgroundColor: colors.lightGray,
      minHeight: '100vh'
    }}>
      <Card
        title={
          <Row justify="space-between" align="middle">
            <Col>
              <div style={{ marginBottom: '4px' }}>
                <h2 style={{
                  margin: 0,
                  color: colors.darkBlue,
                  fontSize: '24px',
                  fontWeight: '700'
                }}>
                  📅 My Timetable
                </h2>
              </div>
              {course && (
                <div style={{
                  fontSize: '14px',
                  color: colors.mediumGray,
                  fontWeight: '500'
                }}>
                  {course.name} - {course.courseType}
                </div>
              )}
            </Col>
            <Col>
              <Select
                value={semester}
                style={{ 
                  width: 180,
                  borderRadius: '8px'
                }}
                onChange={handleSemesterChange}
                loading={loading}
                placeholder="Select Semester"
              >
                {availableSemesters.map(sem => (
                  <Option key={sem} value={sem}>{sem}</Option>
                ))}
              </Select>
            </Col>
          </Row>
        }
        bordered={false}
        style={{
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: `1px solid ${colors.border}`,
          background: colors.white
        }}
        headStyle={{
          borderBottom: `2px solid ${colors.lightBlue}`,
          borderRadius: '16px 16px 0 0',
          background: `linear-gradient(135deg, ${colors.lightestBlue} 0%, ${colors.white} 100%)`
        }}
        bodyStyle={{ 
          padding: '24px',
          borderRadius: '0 0 16px 16px'
        }}
      >
        <Spin spinning={loading}>
          <div style={{ 
            overflowX: 'auto',
            borderRadius: '12px',
            border: `1px solid ${colors.border}`,
            backgroundColor: colors.white
          }}>
            <Table
              columns={columns}
              dataSource={processTimetableData()}
              rowKey="timeSlot"
              pagination={false}
              bordered
              size="middle"
              scroll={{ x: 'max-content' }}
              style={{
                borderRadius: '12px'
              }}
            />
          </div>
        </Spin>
      </Card>

      <style jsx global>{`
        .ant-table-thead > tr > th {
          background: linear-gradient(135deg, ${colors.darkBlue} 0%, ${colors.mediumBlue} 100%) !important;
          color: ${colors.white} !important;
          font-weight: 600 !important;
          text-align: center !important;
          border: none !important;
          padding: 16px 12px !important;
          font-size: 14px !important;
          letter-spacing: 0.5px !important;
        }
        
        .ant-table-thead > tr > th:first-child {
          border-radius: 12px 0 0 0 !important;
        }
        
        .ant-table-thead > tr > th:last-child {
          border-radius: 0 12px 0 0 !important;
        }
        
        .ant-table-tbody > tr > td {
          padding: 12px 8px !important;
          vertical-align: top !important;
          border-color: ${colors.border} !important;
          background-color: ${colors.white} !important;
        }
        
        .ant-table-tbody > tr > td:first-child {
          background: linear-gradient(135deg, ${colors.lightGray} 0%, ${colors.white} 100%) !important;
          border-right: 2px solid ${colors.lightBlue} !important;
        }
        
        .ant-table-tbody > tr:hover > td {
          background-color: ${colors.lightestBlue} !important;
        }
        
        .ant-table-tbody > tr:hover > td:first-child {
          background: linear-gradient(135deg, ${colors.lightBlue} 0%, ${colors.lightestBlue} 100%) !important;
        }
        
        .ant-table-container {
          border-radius: 12px !important;
          overflow: hidden !important;
        }
        
        .ant-table {
          border-radius: 12px !important;
        }
        
        .ant-select-selector {
          border: 2px solid ${colors.lightBlue} !important;
          border-radius: 8px !important;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15) !important;
        }
        
        .ant-select-selector:hover {
          border-color: ${colors.mediumBlue} !important;
        }
        
        .ant-select-focused .ant-select-selector {
          border-color: ${colors.darkBlue} !important;
          box-shadow: 0 0 0 2px rgba(30, 58, 138, 0.1) !important;
        }
        
        .ant-spin-blur {
          opacity: 0.3 !important;
        }
        
        .ant-spin-container {
          transition: all 0.3s ease !important;
        }
      `}</style>
    </div>
  );
};

export default TimeTable;