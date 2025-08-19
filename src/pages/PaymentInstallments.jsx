import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { apiConnector } from '../services/apiConnector';
import { installments } from '../services/apis';
import { showSuccess, showError } from '../utils/toast';
import DashboardLayout from '../components/common/DashboardLayout';

const PaymentInstallments = () => {
  const { token, user } = useSelector((state) => state.auth);
  const [installmentPlans, setInstallmentPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'create', 'details', 'payment'
  const [formData, setFormData] = useState({
    courseId: '',
    paymentMethod: 'Installment',
    installmentCount: 2
  });

  const isAdmin = user?.accountType === 'Admin' || user?.accountType === 'SuperAdmin';

  // Check if we're in admin context by looking at the current path
  const isAdminContext = window.location.pathname.startsWith('/admin');

  const fetchInstallments = async () => {
    setLoading(true);
    try {
      const endpoint = isAdmin ? installments.GET_ALL_INSTALLMENTS_API : installments.GET_STUDENT_INSTALLMENTS_API;
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery })
      });

      const response = await apiConnector(
        'GET',
        `${endpoint}?${params}`,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        setInstallmentPlans(response.data.data.installments || response.data.data);
        if (response.data.data.totalPages) {
          setTotalPages(response.data.data.totalPages);
        }
      }
    } catch (error) {
      console.error('Error fetching installments:', error);
      showError('Failed to fetch installment plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!isAdmin) return;
    
    try {
      const response = await apiConnector(
        'GET',
        installments.GET_INSTALLMENT_STATS_API,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const sendReminders = async () => {
    try {
      const response = await apiConnector(
        'POST',
        installments.SEND_PAYMENT_REMINDERS_API,
        {},
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        showSuccess(`Reminders sent successfully! ${response.data.data.remindersSent} reminders sent.`);
        fetchInstallments();
      }
    } catch (error) {
      console.error('Error sending reminders:', error);
      showError('Failed to send reminders');
    }
  };

  const handleCreatePlan = async () => {
    try {
      const response = await apiConnector(
        'POST',
        installments.CREATE_INSTALLMENT_PLAN_API,
        formData,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        showSuccess('Installment plan created successfully');
        setShowModal(false);
        setFormData({ courseId: '', paymentMethod: 'Installment', installmentCount: 2 });
        fetchInstallments();
      }
    } catch (error) {
      console.error('Error creating installment plan:', error);
      showError('Failed to create installment plan');
    }
  };

  const openModal = (installment, type) => {
    setSelectedInstallment(installment);
    setModalType(type);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      Active: 'bg-blue-100 text-blue-800',
      Completed: 'bg-green-100 text-green-800',
      Defaulted: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status]}`}>
        {status}
      </span>
    );
  };

  const getInstallmentStatusBadge = (status) => {
    const statusClasses = {
      Paid: 'bg-green-100 text-green-800',
      Pending: 'bg-yellow-100 text-yellow-800',
      Overdue: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status]}`}>
        {status}
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

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  useEffect(() => {
    fetchInstallments();
    fetchStats();
  }, [currentPage, statusFilter, searchQuery]);

  // If we're in admin context, wrap with DashboardLayout
  if (isAdminContext) {
    return (
      <DashboardLayout>
        <div style={{ 
          width: '100%', 
          maxWidth: 1400, 
          margin: '0 auto', 
          padding: '32px 24px',
          overflowX: 'hidden'
        }}>
          {/* Page Heading */}
          <div style={{ 
            textAlign: 'center', 
            marginBottom: '48px',
            marginTop: '-16px',
            color: '#07A698',
            fontWeight: '700',
            fontSize: '36px',
            letterSpacing: '-0.5px'
          }}>
            Payment Installments
          </div>

          {/* Content */}
          <div className="max-w-7xl mx-auto">
            {/* Admin Stats Cards */}
            {isAdmin && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-richblack-800 p-4 rounded-lg">
                  <h3 className="text-richblack-100 text-sm font-medium">Active Plans</h3>
                  <p className="text-2xl font-bold text-blue-400">{stats.totalActive || 0}</p>
                </div>
                <div className="bg-richblack-800 p-4 rounded-lg">
                  <h3 className="text-richblack-100 text-sm font-medium">Completed</h3>
                  <p className="text-2xl font-bold text-green-400">{stats.totalCompleted || 0}</p>
                </div>
                <div className="bg-richblack-800 p-4 rounded-lg">
                  <h3 className="text-richblack-100 text-sm font-medium">Defaulted</h3>
                  <p className="text-2xl font-bold text-red-400">{stats.totalDefaulted || 0}</p>
                </div>
                <div className="bg-richblack-800 p-4 rounded-lg">
                  <h3 className="text-richblack-100 text-sm font-medium">Pending Revenue</h3>
                  <p className="text-2xl font-bold text-yellow-400">{formatCurrency(stats.pendingRevenue || 0)}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-richblack-800 p-4 rounded-lg mb-6">
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex flex-col md:flex-row gap-4 flex-1">
                  <input
                    type="text"
                    placeholder="Search by student name or course..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 px-3 py-2 bg-richblack-700 text-richblack-25 rounded-md border border-richblack-600 focus:outline-none focus:border-yellow-400"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-richblack-700 text-richblack-25 rounded-md border border-richblack-600 focus:outline-none focus:border-yellow-400"
                  >
                    <option value="all">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Defaulted">Defaulted</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  {!isAdmin && (
                    <button
                      onClick={() => openModal(null, 'create')}
                      className="px-4 py-2 bg-yellow-500 text-richblack-900 font-medium rounded-md hover:bg-yellow-400 transition-colors"
                    >
                      Create Plan
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={sendReminders}
                      className="px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition-colors"
                    >
                      Send Reminders
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Installments Table */}
            <div className="bg-richblack-800 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-richblack-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-richblack-100 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-richblack-100 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-richblack-100 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-richblack-100 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-richblack-100 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-richblack-700">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-richblack-100">
                          Loading...
                        </td>
                      </tr>
                    ) : installmentPlans.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-richblack-100">
                          No installment plans found
                        </td>
                      </tr>
                    ) : (
                      installmentPlans.map((installment) => (
                        <tr key={installment._id} className="hover:bg-richblack-700">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-richblack-25">
                                {installment.student?.firstName} {installment.student?.lastName}
                              </div>
                              <div className="text-sm text-richblack-100">
                                {installment.student?.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-richblack-25">
                              {installment.course?.courseName}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-richblack-25">
                            {formatCurrency(installment.totalAmount)}
                          </td>
                          <td className="px-6 py-4">
                            {getStatusBadge(installment.status)}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => openModal(installment, 'details')}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <nav className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 text-sm font-medium text-richblack-100 bg-richblack-700 rounded-md hover:bg-richblack-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-2 text-sm text-richblack-100">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 text-sm font-medium text-richblack-100 bg-richblack-700 rounded-md hover:bg-richblack-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-richblack-800 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {modalType === 'create' && (
                  <div>
                    <h3 className="text-lg font-medium text-richblack-25 mb-4">
                      Create Installment Plan
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-richblack-100 mb-2">
                          Course ID
                        </label>
                        <input
                          type="text"
                          value={formData.courseId}
                          onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                          className="w-full px-3 py-2 bg-richblack-700 text-richblack-25 rounded-md border border-richblack-600 focus:outline-none focus:border-yellow-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-richblack-100 mb-2">
                          Number of Installments
                        </label>
                        <input
                          type="number"
                          min="2"
                          max="12"
                          value={formData.installmentCount}
                          onChange={(e) => setFormData({ ...formData, installmentCount: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 bg-richblack-700 text-richblack-25 rounded-md border border-richblack-600 focus:outline-none focus:border-yellow-400"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-6 space-x-3">
                      <button
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 text-sm font-medium text-richblack-100 bg-richblack-700 rounded-md hover:bg-richblack-600"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreatePlan}
                        className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-400"
                      >
                        Create Plan
                      </button>
                    </div>
                  </div>
                )}

                {modalType === 'details' && selectedInstallment && (
                  <div>
                    <h3 className="text-lg font-medium text-richblack-25 mb-4">
                      Installment Details
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-richblack-25 mb-2">Student Information</h4>
                          <p className="text-sm text-richblack-100">
                            {selectedInstallment.student?.firstName} {selectedInstallment.student?.lastName}
                          </p>
                          <p className="text-sm text-richblack-100">
                            {selectedInstallment.student?.email}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-richblack-25 mb-2">Course Information</h4>
                          <p className="text-sm text-richblack-100">
                            {selectedInstallment.course?.courseName}
                          </p>
                          <p className="text-sm text-richblack-100">
                            Total: {formatCurrency(selectedInstallment.totalAmount)}
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-richblack-25 mb-2">Payment Summary</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-richblack-100">Paid Amount</p>
                            <p className="text-green-400 font-medium">{formatCurrency(selectedInstallment.paidAmount)}</p>
                          </div>
                          <div>
                            <p className="text-richblack-100">Remaining Amount</p>
                            <p className="text-yellow-400 font-medium">{formatCurrency(selectedInstallment.remainingAmount)}</p>
                          </div>
                          <div>
                            <p className="text-richblack-100">Status</p>
                            <div className="mt-1">{getStatusBadge(selectedInstallment.status)}</div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-richblack-25 mb-2">Installment Schedule</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-richblack-700">
                              <tr>
                                <th className="px-3 py-2 text-left text-richblack-100">#</th>
                                <th className="px-3 py-2 text-left text-richblack-100">Amount</th>
                                <th className="px-3 py-2 text-left text-richblack-100">Due Date</th>
                                <th className="px-3 py-2 text-left text-richblack-100">Status</th>
                                <th className="px-3 py-2 text-left text-richblack-100">Paid Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-richblack-700">
                              {selectedInstallment.installmentDetails?.map((inst) => (
                                <tr key={inst.installmentNumber}>
                                  <td className="px-3 py-2 text-richblack-100">{inst.installmentNumber}</td>
                                  <td className="px-3 py-2 text-richblack-100">{formatCurrency(inst.amount)}</td>
                                  <td className="px-3 py-2 text-richblack-100">{formatDate(inst.dueDate)}</td>
                                  <td className="px-3 py-2">{getInstallmentStatusBadge(inst.status)}</td>
                                  <td className="px-3 py-2 text-richblack-100">
                                    {inst.paidAt ? formatDate(inst.paidAt) : '-'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end mt-6">
                      <button
                        onClick={() => setShowModal(false)}
                        className="px-4 py-2 text-sm font-medium text-richblack-100 bg-richblack-700 rounded-md hover:bg-richblack-600"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // Original return for non-admin context (with footer)
  return (
    <div className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-richblack-25 mb-2">
            Payment Installments
          </h1>
          <p className="text-richblack-100">
            {isAdmin ? 'Manage all payment installments and send reminders' : 'View and manage your payment installments'}
          </p>
        </div>

        {/* Admin Stats Cards */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-richblack-800 p-4 rounded-lg">
              <h3 className="text-richblack-100 text-sm font-medium">Active Plans</h3>
              <p className="text-2xl font-bold text-blue-400">{stats.totalActive || 0}</p>
            </div>
            <div className="bg-richblack-800 p-4 rounded-lg">
              <h3 className="text-richblack-100 text-sm font-medium">Completed</h3>
              <p className="text-2xl font-bold text-green-400">{stats.totalCompleted || 0}</p>
            </div>
            <div className="bg-richblack-800 p-4 rounded-lg">
              <h3 className="text-richblack-100 text-sm font-medium">Defaulted</h3>
              <p className="text-2xl font-bold text-red-400">{stats.totalDefaulted || 0}</p>
            </div>
            <div className="bg-richblack-800 p-4 rounded-lg">
              <h3 className="text-richblack-100 text-sm font-medium">Pending Revenue</h3>
              <p className="text-2xl font-bold text-yellow-400">{formatCurrency(stats.pendingRevenue || 0)}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="bg-richblack-800 p-4 rounded-lg mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <input
                type="text"
                placeholder="Search by student name or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 bg-richblack-700 text-richblack-25 rounded-md border border-richblack-600 focus:outline-none focus:border-yellow-400"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-richblack-700 text-richblack-25 rounded-md border border-richblack-600 focus:outline-none focus:border-yellow-400"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Defaulted">Defaulted</option>
              </select>
            </div>
            <div className="flex gap-2">
              {!isAdmin && (
                <button
                  onClick={() => openModal(null, 'create')}
                  className="px-4 py-2 bg-yellow-500 text-richblack-900 font-medium rounded-md hover:bg-yellow-400 transition-colors"
                >
                  Create Plan
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={sendReminders}
                  className="px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition-colors"
                >
                  Send Reminders
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Installments Table */}
        <div className="bg-richblack-800 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-richblack-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-richblack-100 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-richblack-100 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-richblack-100 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-richblack-100 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-richblack-100 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-richblack-700">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-richblack-100">
                      Loading...
                    </td>
                  </tr>
                ) : installmentPlans.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-richblack-100">
                      No installment plans found
                    </td>
                  </tr>
                ) : (
                  installmentPlans.map((installment) => (
                    <tr key={installment._id} className="hover:bg-richblack-700">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-richblack-25">
                            {installment.student?.firstName} {installment.student?.lastName}
                          </div>
                          <div className="text-sm text-richblack-100">
                            {installment.student?.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-richblack-25">
                          {installment.course?.courseName}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-richblack-25">
                        {formatCurrency(installment.totalAmount)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(installment.status)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openModal(installment, 'details')}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <nav className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-richblack-100 bg-richblack-700 rounded-md hover:bg-richblack-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-2 text-sm text-richblack-100">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-richblack-100 bg-richblack-700 rounded-md hover:bg-richblack-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </nav>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-richblack-800 p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {modalType === 'create' && (
              <div>
                <h3 className="text-lg font-medium text-richblack-25 mb-4">
                  Create Installment Plan
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-richblack-100 mb-2">
                      Course ID
                    </label>
                    <input
                      type="text"
                      value={formData.courseId}
                      onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                      className="w-full px-3 py-2 bg-richblack-700 text-richblack-25 rounded-md border border-richblack-600 focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-richblack-100 mb-2">
                      Number of Installments
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="12"
                      value={formData.installmentCount}
                      onChange={(e) => setFormData({ ...formData, installmentCount: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 bg-richblack-700 text-richblack-25 rounded-md border border-richblack-600 focus:outline-none focus:border-yellow-400"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-6 space-x-3">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-richblack-100 bg-richblack-700 rounded-md hover:bg-richblack-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreatePlan}
                    className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-md hover:bg-yellow-400"
                  >
                    Create Plan
                  </button>
                </div>
              </div>
            )}

            {modalType === 'details' && selectedInstallment && (
              <div>
                <h3 className="text-lg font-medium text-richblack-25 mb-4">
                  Installment Details
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-richblack-25 mb-2">Student Information</h4>
                      <p className="text-sm text-richblack-100">
                        {selectedInstallment.student?.firstName} {selectedInstallment.student?.lastName}
                      </p>
                      <p className="text-sm text-richblack-100">
                        {selectedInstallment.student?.email}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-richblack-25 mb-2">Course Information</h4>
                      <p className="text-sm text-richblack-100">
                        {selectedInstallment.course?.courseName}
                      </p>
                      <p className="text-sm text-richblack-100">
                        Total: {formatCurrency(selectedInstallment.totalAmount)}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-richblack-25 mb-2">Payment Summary</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-richblack-100">Paid Amount</p>
                        <p className="text-green-400 font-medium">{formatCurrency(selectedInstallment.paidAmount)}</p>
                      </div>
                      <div>
                        <p className="text-richblack-100">Remaining Amount</p>
                        <p className="text-yellow-400 font-medium">{formatCurrency(selectedInstallment.remainingAmount)}</p>
                      </div>
                      <div>
                        <p className="text-richblack-100">Status</p>
                        <div className="mt-1">{getStatusBadge(selectedInstallment.status)}</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-richblack-25 mb-2">Installment Schedule</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-richblack-700">
                          <tr>
                            <th className="px-3 py-2 text-left text-richblack-100">#</th>
                            <th className="px-3 py-2 text-left text-richblack-100">Amount</th>
                            <th className="px-3 py-2 text-left text-richblack-100">Due Date</th>
                            <th className="px-3 py-2 text-left text-richblack-100">Status</th>
                            <th className="px-3 py-2 text-left text-richblack-100">Paid Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-richblack-700">
                          {selectedInstallment.installmentDetails?.map((inst) => (
                            <tr key={inst.installmentNumber}>
                              <td className="px-3 py-2 text-richblack-100">{inst.installmentNumber}</td>
                              <td className="px-3 py-2 text-richblack-100">{formatCurrency(inst.amount)}</td>
                              <td className="px-3 py-2 text-richblack-100">{formatDate(inst.dueDate)}</td>
                              <td className="px-3 py-2">{getInstallmentStatusBadge(inst.status)}</td>
                              <td className="px-3 py-2 text-richblack-100">
                                {inst.paidAt ? formatDate(inst.paidAt) : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-richblack-100 bg-richblack-700 rounded-md hover:bg-richblack-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentInstallments; 