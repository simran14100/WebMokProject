import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { apiConnector } from '../services/apiConnector';
import { course as courseApi } from '../services/apis';

const TAWKTO_GREEN = '#009e5c';

export default function EnrolledStudents() {
  const { token } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [coursesError, setCoursesError] = useState(null);

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
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#009e5c] mb-4">Enrolled Students</h1>
        <p className="text-[#666] mb-8">Students who are actively enrolled in courses</p>
        
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
        
        {loadingCourses ? (
          <div className="text-center mt-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#009e5c]"></div>
            <p className="mt-2 text-[#009e5c] font-semibold">Loading courses...</p>
          </div>
        ) : coursesError ? (
          <div className="text-center mt-12">
            <p className="text-red-500 font-semibold">{coursesError}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-[#e0e0e0] rounded-lg shadow">
              <thead>
                <tr className="bg-[#e6fcf5]">
                  <th className="py-3 px-6 text-left text-[#009e5c] font-bold">Name</th>
                  <th className="py-3 px-6 text-left text-[#009e5c] font-bold">Email</th>
                  <th className="py-3 px-6 text-left text-[#009e5c] font-bold">Courses Enrolled</th>
                  <th className="py-3 px-6 text-left text-[#009e5c] font-bold">Total Courses</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[#222]">No enrolled students found.</td>
                  </tr>
                ) : (
                  filteredStudents.map(student => (
                    <tr key={student._id} className="border-b border-[#e0e0e0] hover:bg-[#f9fefb]">
                      <td className="py-3 px-6 text-[#222] font-medium">{student.firstName} {student.lastName}</td>
                      <td className="py-3 px-6 text-[#222]">{student.email}</td>
                      <td className="py-3 px-6 text-[#009e5c] font-semibold">
                        {student.courses && student.courses.length > 0
                          ? student.courses.map(c => c.courseName).join(', ')
                          : 'None'}
                      </td>
                      <td className="py-3 px-6 text-[#009e5c] font-semibold">
                        {student.courses ? student.courses.length : 0}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 