import React, { useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { Pie } from 'react-chartjs-2';
Chart.register(...registerables);

// Mock data for demonstration
const instructorName = "John Doe";
const courses = [
  { id: 1, courseName: "React Basics", totalStudentsEnrolled: 30, status: "Published" },
  { id: 2, courseName: "Advanced JS", totalStudentsEnrolled: 18, status: "Draft" },
  { id: 3, courseName: "UI/UX Design", totalStudentsEnrolled: 12, status: "Published" },
];

export default function InstructorDashboard() {
  // Pie chart data for enrolled students per course
  const chartData = {
    labels: courses.map((course) => course.courseName),
    datasets: [
      {
        label: "Enrolled Students",
        data: courses.map((course) => course.totalStudentsEnrolled),
        backgroundColor: [
          "#009e5c",
          "#4facfe",
          "#9C27B0",
          "#FF9800",
          "#00bcd4",
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Enrolled Students per Course' },
    },
  };

  return (
    <div className="flex flex-col gap-8 p-8 bg-white min-h-screen w-full">
      {/* Welcome and Quick Stats */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {instructorName}!
        </h1>
        <div className="flex gap-8 mt-4">
          <div className="bg-green-50 p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-green-700">{courses.length}</div>
            <div className="text-gray-600">Courses</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow text-center">
            <div className="text-2xl font-bold text-blue-700">
              {courses.reduce((sum, c) => sum + c.totalStudentsEnrolled, 0)}
            </div>
            <div className="text-gray-600">Enrolled Students</div>
          </div>
        </div>
      </div>

      {/* Enrolled Students Pie Chart */}
      <div className="bg-gray-50 p-6 rounded-lg shadow max-w-xl">
        <Pie data={chartData} options={options} height={300} />
      </div>

      {/* Courses Overview */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Courses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div key={course.id} className="bg-white p-4 rounded-lg shadow flex flex-col gap-2">
              <div className="font-bold text-lg">{course.courseName}</div>
              <div className="text-gray-600">Enrolled: {course.totalStudentsEnrolled}</div>
              <div className="text-gray-500 text-sm">Status: {course.status}</div>
              <button className="mt-2 bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 transition">
                View Course
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity (placeholder) */}
      <div className="bg-gray-50 p-6 rounded-lg shadow max-w-xl mt-8">
        <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
        <p className="text-gray-500">No recent activity yet.</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition font-semibold">
          Create New Course
        </button>
        <button className="bg-gray-200 text-gray-800 px-6 py-2 rounded hover:bg-gray-300 transition font-semibold">
          View All Courses
        </button>
      </div>
    </div>
  );
} 