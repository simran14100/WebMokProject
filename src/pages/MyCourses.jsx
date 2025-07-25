import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { apiConnector } from '../services/apiConnector';
import { course as courseApi } from '../services/apis';

const TAWKTO_GREEN = '#009e5c';

export default function MyCourses() {
  const { token, user } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchInstructorCourses() {
      setLoading(true);
      setError(null);
      try {
        const response = await apiConnector(
          'GET',
          courseApi.GET_INSTRUCTOR_COURSES_API,
          null,
          token ? { Authorization: `Bearer ${token}` } : undefined
        );
        if (response.data && response.data.success) {
          setCourses(response.data.data || []);
        } else {
          setCourses([]);
          setError('Failed to load courses.');
        }
      } catch (err) {
        setCourses([]);
        setError('Failed to load courses.');
      } finally {
        setLoading(false);
      }
    }
    if (user?.accountType === 'Instructor') {
      fetchInstructorCourses();
    }
  }, [token, user]);

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-3xl font-bold text-[#009e5c] mb-8">My Courses</h1>
      {loading ? (
        <div className="text-center mt-12">
          <span className="text-[#009e5c] font-semibold">Loading courses...</span>
        </div>
      ) : error ? (
        <div className="text-center mt-12">
          <span className="text-red-500 font-semibold">{error}</span>
        </div>
      ) : courses.length === 0 ? (
        <div className="text-center mt-12">
          <span className="text-[#222]">You have not created any courses yet.</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-[#e0e0e0] rounded-lg shadow">
            <thead>
              <tr className="bg-[#e6fcf5]">
                <th className="py-3 px-6 text-left text-[#009e5c] font-bold">Course Name</th>
                <th className="py-3 px-6 text-left text-[#009e5c] font-bold">Status</th>
                <th className="py-3 px-6 text-left text-[#009e5c] font-bold">Price</th>
                <th className="py-3 px-6 text-left text-[#009e5c] font-bold">Enrolled Students</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course._id} className="border-b border-[#e0e0e0] hover:bg-[#f9fefb]">
                  <td className="py-3 px-6 text-[#222]">{course.courseName}</td>
                  <td className="py-3 px-6 text-[#222]">{course.status}</td>
                  <td className="py-3 px-6 text-[#222]">₹{course.price}</td>
                  <td className="py-3 px-6 text-[#009e5c] font-semibold">{course.studentsEnrolled ? course.studentsEnrolled.length : 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 