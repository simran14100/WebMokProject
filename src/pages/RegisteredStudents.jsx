import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { apiConnector } from '../services/apiConnector';
import { admin as adminApi } from '../services/apis';

const TAWKTO_GREEN = '#009e5c';

export default function RegisteredStudents() {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('Student');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);

  // Check if user has admin access
  const hasAdminAccess = user?.accountType === 'Admin' || 
                        user?.accountType === 'SuperAdmin' || 
                        user?.accountType === 'Staff';

  // Debug authentication status
  useEffect(() => {
    console.log('=== AUTHENTICATION DEBUG ===');
    console.log('Token exists:', !!token);
    console.log('Token length:', token ? token.length : 0);
    console.log('Current user:', user);
    console.log('User account type:', user?.accountType);
    console.log('User approved:', user?.approved);
    console.log('User active:', user?.active);
    console.log('Has admin access:', hasAdminAccess);
    console.log('Is SuperAdmin:', user?.accountType === 'SuperAdmin');
    console.log('===========================');
  }, [token, user, hasAdminAccess]);

  useEffect(() => {
    if (hasAdminAccess && token) {
      fetchRegisteredStudents();
    }
  }, [token, currentPage, searchTerm, filterRole, hasAdminAccess]);

  const fetchRegisteredStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        role: filterRole,
        search: searchTerm
      });

      console.log('Fetching registered students with params:', params.toString());
      console.log('API endpoint:', adminApi.GET_REGISTERED_USERS_API);

      const response = await apiConnector(
        'GET',
        `${adminApi.GET_REGISTERED_USERS_API}?${params.toString()}`,
        null,
        token ? { Authorization: `Bearer ${token}` } : undefined
      );

      console.log('API Response:', response);
      console.log('Response data:', response.data);

      if (response.data && response.data.success) {
        const data = response.data.data;
        console.log('Processed data:', data);
        setStudents(data.users || []);
        setTotalPages(data.totalPages || 1);
        setTotalStudents(data.totalUsers || 0);
      } else {
        console.log('API call failed - no success flag');
        setStudents([]);
        setError('Failed to load registered students.');
      }
    } catch (error) {
      console.error('Error fetching registered students:', error);
      setStudents([]);
      setError('Failed to load registered students.');
    } finally {
      setLoading(false);
    }
  };

  // Debug useEffect to log state changes
  useEffect(() => {
    console.log('Current students state:', students);
    console.log('Current filterRole:', filterRole);
    console.log('Current searchTerm:', searchTerm);
  }, [students, filterRole, searchTerm]);

  const getPaymentStatusBadge = (student) => {
    if (student.accountType !== 'Student') {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">N/A</span>;
    }

    if (student.enrollmentFeePaid && student.paymentStatus === 'Completed') {
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Paid</span>;
    } else if (student.paymentStatus === 'Pending') {
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending</span>;
    } else if (student.paymentStatus === 'Failed') {
      return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Failed</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Not Paid</span>;
    }
  };

  const getAccountTypeBadge = (accountType) => {
    const badgeColors = {
      'Student': 'bg-blue-100 text-blue-800',
      'Instructor': 'bg-purple-100 text-purple-800',
      'Admin': 'bg-red-100 text-red-800',
      'SuperAdmin': 'bg-orange-100 text-orange-800',
      'Staff': 'bg-indigo-100 text-indigo-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeColors[accountType] || 'bg-gray-100 text-gray-800'}`}>
        {accountType}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchRegisteredStudents();
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#009e5c] mb-2">Registered Students</h1>
            <p className="text-[#666]">All registered users with their enrollment status</p>
          </div>
          {hasAdminAccess && (
            <button
              onClick={fetchRegisteredStudents}
              className="bg-[#009e5c] text-white px-4 py-2 rounded-lg hover:bg-[#007a44] transition-colors"
            >
              Refresh
            </button>
          )}
        </div>

        {/* Show message for non-admin users */}
        {!hasAdminAccess && (
          <div className="text-center mt-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-red-800 font-semibold text-lg mb-2">Access Denied</h3>
              <p className="text-red-700 mb-4">
                You need admin privileges to view this page. 
                {user?.accountType === 'Student' && ' Students cannot access admin features.'}
                {user?.accountType === 'Instructor' && ' Instructors cannot access admin features.'}
                {!user?.accountType && ' Please log in with an admin account.'}
              </p>
              <p className="text-red-600 text-sm mb-2">
                Current user: {user?.firstName} {user?.lastName} ({user?.accountType})
              </p>
              <p className="text-green-600 text-sm">
                Required roles: Admin, SuperAdmin, or Staff
              </p>
            </div>
          </div>
        )}

        {/* Show content only for admin users */}
        {hasAdminAccess && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg border border-[#e0e0e0] shadow-sm">
                <h3 className="text-lg font-semibold text-[#009e5c] mb-2">Total Students</h3>
                <p className="text-3xl font-bold text-[#222]">{totalStudents}</p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-[#e0e0e0] shadow-sm">
                <h3 className="text-lg font-semibold text-green-600 mb-2">Enrollment Fee Paid</h3>
                <p className="text-3xl font-bold text-[#222]">
                  {students.filter(s => s.accountType === 'Student' && s.enrollmentFeePaid).length}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-[#e0e0e0] shadow-sm">
                <h3 className="text-lg font-semibold text-yellow-600 mb-2">Payment Pending</h3>
                <p className="text-3xl font-bold text-[#222]">
                  {students.filter(s => s.accountType === 'Student' && !s.enrollmentFeePaid).length}
                </p>
              </div>
              <div className="bg-white p-6 rounded-lg border border-[#e0e0e0] shadow-sm">
                <h3 className="text-lg font-semibold text-blue-600 mb-2">Active Students</h3>
                <p className="text-3xl font-bold text-[#222]">
                  {students.filter(s => s.active).length}
                </p>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <label className="font-semibold text-[#222]">Filter by Role:</label>
                <select
                  className="border border-[#009e5c] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#009e5c] text-[#222]"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="Student">Students</option>
                  <option value="Instructor">Instructors</option>
                  <option value="Admin">Admins</option>
                  <option value="SuperAdmin">Super Admins</option>
                  <option value="Staff">Staff</option>
                  <option value="all">All Users</option>
                </select>
              </div>
              
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-[#009e5c] rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#009e5c] text-[#222] min-w-[250px]"
                />
                <button
                  type="submit"
                  className="bg-[#009e5c] text-white px-6 py-2 rounded-lg hover:bg-[#007a44] transition-colors"
                >
                  Search
                </button>
              </form>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center mt-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#009e5c]"></div>
                <p className="mt-2 text-[#009e5c] font-semibold">Loading students...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center mt-12">
                <p className="text-red-500 font-semibold mb-4">{error}</p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
                  <h3 className="text-yellow-800 font-semibold mb-2">Debug Information:</h3>
                  <p className="text-yellow-700 text-sm mb-2">• Check if the backend server is running</p>
                  <p className="text-yellow-700 text-sm mb-2">• Verify admin authentication</p>
                  <p className="text-yellow-700 text-sm mb-2">• Check browser console for detailed error logs</p>
                  <p className="text-yellow-700 text-sm">• API Endpoint: {adminApi.GET_REGISTERED_USERS_API}</p>
                </div>
                <button
                  onClick={fetchRegisteredStudents}
                  className="mt-4 bg-[#009e5c] text-white px-4 py-2 rounded-lg hover:bg-[#007a44] transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Students Table */}
            {!loading && !error && (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-[#e0e0e0] rounded-lg shadow">
                  <thead>
                    <tr className="bg-[#e6fcf5]">
                      <th className="py-3 px-6 text-left text-[#009e5c] font-bold">Name</th>
                      <th className="py-3 px-6 text-left text-[#009e5c] font-bold">Email</th>
                      <th className="py-3 px-6 text-left text-[#009e5c] font-bold">Role</th>
                      <th className="py-3 px-6 text-left text-[#009e5c] font-bold">Enrollment Status</th>
                      <th className="py-3 px-6 text-left text-[#009e5c] font-bold">Account Status</th>
                      <th className="py-3 px-6 text-left text-[#009e5c] font-bold">Registered On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-[#222]">
                          <div>
                            <p className="mb-2">No students found.</p>
                            <p className="text-sm text-gray-500">This might be due to:</p>
                            <ul className="text-sm text-gray-500 list-disc list-inside">
                              <li>No users in the database</li>
                              <li>Filter criteria too restrictive</li>
                              <li>API connection issues</li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      students.map((student) => (
                        <tr key={student._id} className="border-b border-[#e0e0e0] hover:bg-[#f9fefb]">
                          <td className="py-3 px-6 text-[#222] font-medium">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="py-3 px-6 text-[#222]">{student.email}</td>
                          <td className="py-3 px-6">
                            {getAccountTypeBadge(student.accountType)}
                          </td>
                          <td className="py-3 px-6">
                            {getPaymentStatusBadge(student)}
                          </td>
                          <td className="py-3 px-6">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              student.active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {student.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-6 text-[#222]">
                            {formatDate(student.createdAt)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-[#009e5c] text-[#009e5c] rounded-lg hover:bg-[#009e5c] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-[#009e5c] text-white'
                          : 'border border-[#009e5c] text-[#009e5c] hover:bg-[#009e5c] hover:text-white'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-[#009e5c] text-[#009e5c] rounded-lg hover:bg-[#009e5c] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}