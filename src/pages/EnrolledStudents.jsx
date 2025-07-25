import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { apiConnector } from '../services/apiConnector';
import { course as courseApi, admin as adminApi } from '../services/apis';

const TAWKTO_GREEN = '#009e5c';

export default function EnrolledStudents() {
  const { token } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [students, setStudents] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [coursesError, setCoursesError] = useState(null);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentsError, setStudentsError] = useState(null);

  useEffect(() => {
    async function fetchCourses() {
      setLoadingCourses(true);
      setCoursesError(null);
      try {
        const response = await apiConnector(
          'GET',
          courseApi.GET_ALL_COURSES_API,
          null,
          token ? { Authorization: `Bearer ${token}` } : undefined
        );
        console.log('Raw courses API response:', response.data);
        if (response.data && response.data.success) {
          setCourses(response.data.data || []);
          console.log('Fetched courses:', response.data.data);
        } else {
          setCourses([]);
          setCoursesError('Failed to load courses.');
        }
      } catch (error) {
        setCourses([]);
        setCoursesError('Failed to load courses.');
      } finally {
        setLoadingCourses(false);
      }
    }
    fetchCourses();
  }, [token]);

  useEffect(() => {
    console.log('Courses in state:', courses);
  }, [courses]);

  useEffect(() => {
    async function fetchStudents() {
      setLoadingStudents(true);
      setStudentsError(null);
      try {
        const response = await apiConnector(
          'GET',
          adminApi.GET_ENROLLED_STUDENTS_API,
          null,
          token ? { Authorization: `Bearer ${token}` } : undefined
        );
        if (response.data && response.data.success) {
          setStudents(response.data.data.enrolledStudents || []);
        } else {
          setStudents([]);
          setStudentsError('Failed to load students.');
        }
      } catch (error) {
        setStudents([]);
        setStudentsError('Failed to load students.');
      } finally {
        setLoadingStudents(false);
      }
    }
    fetchStudents();
  }, [token]);

  // Helper to get unique students by _id
  function getUniqueStudents(studentsArr) {
    const map = new Map();
    for (const s of studentsArr) {
      if (s && s._id) map.set(s._id, s);
    }
    return Array.from(map.values());
  }

  // Filtering logic
  const getFilteredStudents = () => {
    if (selectedCourse === 'all') {
      // Show all unique students enrolled in any course
      const allStudents = courses.flatMap(course => course.studentsEnrolled || []);
      return getUniqueStudents(allStudents);
    } else {
      const course = courses.find(c => c._id === selectedCourse);
      return course && course.studentsEnrolled ? course.studentsEnrolled : [];
    }
  };

  const filteredStudents = getFilteredStudents();

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold text-[#009e5c] mb-8">Enrolled Students</h1>
      <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
        <label className="font-semibold text-[#222]">Filter by Course:</label>
        {loadingCourses ? (
          <span className="text-[#009e5c] font-semibold">Loading courses...</span>
        ) : coursesError ? (
          <span className="text-red-500 font-semibold">{coursesError}</span>
        ) : (
          <select
            className="border border-[#009e5c] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#009e5c] text-[#222]"
            value={selectedCourse}
            onChange={e => setSelectedCourse(e.target.value)}
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course._id} value={course._id}>{course.courseName}</option>
            ))}
          </select>
        )}
      </div>
      {loadingStudents ? (
        <div className="text-center mt-12">
          <span className="text-[#009e5c] font-semibold">Loading students...</span>
        </div>
      ) : studentsError ? (
        <div className="text-center mt-12">
          <span className="text-red-500 font-semibold">{studentsError}</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-[#e0e0e0] rounded-lg shadow">
            <thead>
              <tr className="bg-[#e6fcf5]">
                <th className="py-3 px-6 text-left text-[#009e5c] font-bold">Name</th>
                <th className="py-3 px-6 text-left text-[#009e5c] font-bold">Email</th>
                <th className="py-3 px-6 text-left text-[#009e5c] font-bold">Courses</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-[#222]">No students found.</td>
                </tr>
              ) : (
                filteredStudents.map(student => (
                  <tr key={student._id} className="border-b border-[#e0e0e0] hover:bg-[#f9fefb]">
                    <td className="py-3 px-6 text-[#222]">{student.firstName} {student.lastName}</td>
                    <td className="py-3 px-6 text-[#222]">{student.email}</td>
                    <td className="py-3 px-6 text-[#009e5c] font-semibold">
                      {student.courses && student.courses.length > 0
                        ? student.courses.map(c => c.courseName).join(', ')
                        : 'None'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 