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

  // Fetch student's timetable for a specific semester
  const fetchTimetable = async (selectedSemester) => {
    if (!selectedSemester) return;
    
    try {
      setLoading(true);
      const response = await apiConnector(
        'GET',
        '/api/v1/timetable/student',
        null,
        {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        { semester: selectedSemester }
      );
      
      if (response.data.success) {
        setTimetable(response.data.data);
        setCourse(response.data.course || {});
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      message.error('Failed to load timetable');
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
            <div className="timetable-cell">
              <div className="subject-name">{entry.subject?.name || 'N/A'}</div>
              <div className="faculty-name">{entry.faculty?.name || 'N/A'}</div>
              <div className="room">{entry.room}</div>
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
      width: 150,
      fixed: 'left',
      className: 'time-slot-column',
    },
    ...daysOfWeek.map(day => ({
      title: day,
      dataIndex: day,
      key: day,
      render: (text) => text || <div className="empty-slot">-</div>,
      className: 'day-column',
    })),
  ];

  // Handle semester change
  const handleSemesterChange = (value) => {
    fetchTimetable(value);
  };

  return (
    <div className="p-4">
      <Card
        title={
          <Row justify="space-between" align="middle">
            <Col>
              <h2>My Timetable</h2>
              {course && (
                <div className="text-sm text-gray-600">
                  {course.name} - {course.courseType}
                </div>
              )}
            </Col>
            <Col>
              <Select
                value={semester}
                style={{ width: 150 }}
                onChange={handleSemesterChange}
                loading={loading}
              >
                {availableSemesters.map(sem => (
                  <Option key={sem} value={sem}>{sem}</Option>
                ))}
              </Select>
            </Col>
          </Row>
        }
        bordered={false}
        className="shadow-sm"
      >
        <Spin spinning={loading}>
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              dataSource={processTimetableData()}
              rowKey="timeSlot"
              pagination={false}
              bordered
              size="middle"
              scroll={{ x: 'max-content' }}
              className="timetable-table"
            />
          </div>
        </Spin>
      </Card>

      <style jsx global>{`
        .timetable-table .ant-table-thead > tr > th {
          background: #f0f2f5;
          font-weight: 600;
          text-align: center;
        }
        .time-slot-column {
          background: #fafafa;
          font-weight: 500;
        }
        .timetable-cell {
          padding: 8px;
          min-height: 80px;
          border-radius: 4px;
          background: #f8f9fa;
        }
        .subject-name {
          font-weight: 500;
          margin-bottom: 4px;
        }
        .faculty-name {
          font-size: 12px;
          color: #666;
          margin-bottom: 2px;
        }
        .room {
          font-size: 11px;
          color: #888;
          font-style: italic;
        }
        .empty-slot {
          min-height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
        }
        .timetable-table .ant-table-tbody > tr > td {
          padding: 8px;
          vertical-align: top;
        }
        .timetable-table .ant-table-tbody > tr > td:not(:first-child) {
          border-left: 1px solid #f0f0f0;
        }
      `}</style>
    </div>
  );
};

export default TimeTable;