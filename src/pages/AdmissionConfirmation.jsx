import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { apiConnector } from '../services/apiConnector';
import { admission } from '../services/apis';
import { toast } from 'react-hot-toast';
import Sidebar from '../components/common/Sidebar';

const AdmissionConfirmation = () => {
  const { token } = useSelector((state) => state.auth);
  const [confirmations, setConfirmations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConfirmation, setSelectedConfirmation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'confirm' or 'reject'
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchConfirmations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(searchQuery && { search: searchQuery })
      });

      const response = await apiConnector(
        'GET',
        `${admission.GET_ALL_CONFIRMATIONS_API}?${params}`,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        setConfirmations(response.data.data.admissionConfirmations);
        setTotalPages(response.data.data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching confirmations:', error);
      toast.error('Failed to fetch admission confirmations');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiConnector(
        'GET',
        admission.GET_ADMISSION_STATS_API,
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

  useEffect(() => {
    fetchConfirmations();
    fetchStats();
  }, [currentPage, statusFilter, searchQuery]);

  const handleConfirm = async () => {
    if (!selectedConfirmation) return;

    try {
      const response = await apiConnector(
        'PUT',
        `${admission.CONFIRM_ADMISSION_API}/${selectedConfirmation._id}/confirm`,
        { notes },
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        toast.success('Admission confirmed successfully');
        setShowModal(false);
        setSelectedConfirmation(null);
        setNotes('');
        fetchConfirmations();
        fetchStats();
      }
    } catch (error) {
      console.error('Error confirming admission:', error);
      toast.error('Failed to confirm admission');
    }
  };

  const handleReject = async () => {
    if (!selectedConfirmation || !rejectionReason) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      const response = await apiConnector(
        'PUT',
        `${admission.REJECT_ADMISSION_API}/${selectedConfirmation._id}/reject`,
        { rejectionReason, notes },
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        toast.success('Admission rejected successfully');
        setShowModal(false);
        setSelectedConfirmation(null);
        setRejectionReason('');
        setNotes('');
        fetchConfirmations();
        fetchStats();
      }
    } catch (error) {
      console.error('Error rejecting admission:', error);
      toast.error('Failed to reject admission');
    }
  };

  const openModal = (confirmation, type) => {
    setSelectedConfirmation(confirmation);
    setModalType(type);
    setShowModal(true);
    setNotes('');
    setRejectionReason('');
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      Pending: 'bg-yellow-100 text-yellow-800',
      Confirmed: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800'
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#fff' }}>
      <Sidebar />
      <div style={{ flex: 1, padding: '2rem 0' }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-richblack-25 mb-2">
              Admission Confirmation
            </h1>
            <p className="text-richblack-100">
              Manage student admission confirmations after course payments
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-richblack-800 p-4 rounded-lg">
              <h3 className="text-richblack-100 text-sm font-medium">Total Pending</h3>
              <p className="text-2xl font-bold text-yellow-400">{stats.totalPending || 0}</p>
            </div>
            <div className="bg-richblack-800 p-4 rounded-lg">
              <h3 className="text-richblack-100 text-sm font-medium">Total Confirmed</h3>
              <p className="text-2xl font-bold text-green-400">{stats.totalConfirmed || 0}</p>
            </div>
            <div className="bg-richblack-800 p-4 rounded-lg">
              <h3 className="text-richblack-100 text-sm font-medium">Total Rejected</h3>
              <p className="text-2xl font-bold text-red-400">{stats.totalRejected || 0}</p>
            </div>
            <div className="bg-richblack-800 p-4 rounded-lg">
              <h3 className="text-richblack-100 text-sm font-medium">Total Confirmations</h3>
              <p className="text-2xl font-bold text-blue-400">{stats.totalConfirmations || 0}</p>
            </div>
            <div className="bg-richblack-800 p-4 rounded-lg">
              <h3 className="text-richblack-100 text-sm font-medium">Today's Confirmations</h3>
              <p className="text-2xl font-bold text-purple-400">{stats.todayConfirmations || 0}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-richblack-800 p-4 rounded-lg mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search by order ID or payment ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-richblack-700 text-richblack-25 rounded-md border border-richblack-600 focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-richblack-700 text-richblack-25 rounded-md border border-richblack-600 focus:outline-none focus:border-yellow-400"
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Confirmations Table */}
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
                      Payment Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-richblack-100 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-richblack-100 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-richblack-100 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-richblack-700">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-richblack-100">
                        Loading...
                      </td>
                    </tr>
                  ) : confirmations.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-richblack-100">
                        No admission confirmations found
                      </td>
                    </tr>
                  ) : (
                    confirmations.map((confirmation) => (
                      <tr key={confirmation._id} className="hover:bg-richblack-700">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-richblack-25">
                              {confirmation.student?.firstName} {confirmation.student?.lastName}
                            </div>
                            <div className="text-sm text-richblack-100">
                              {confirmation.student?.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-richblack-25">
                              {confirmation.course?.courseName}
                            </div>
                            <div className="text-sm text-richblack-100">
                              ₹{confirmation.course?.price}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-richblack-100">
                            <div>Order: {confirmation.paymentDetails.orderId}</div>
                            <div>Payment: {confirmation.paymentDetails.paymentId}</div>
                            <div>Amount: ₹{confirmation.paymentDetails.amount}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(confirmation.status)}
                        </td>
                        <td className="px-6 py-4 text-sm text-richblack-100">
                          {formatDate(confirmation.createdAt)}
                        </td>
                        <td className="px-6 py-4">
                          {confirmation.status === 'Pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openModal(confirmation, 'confirm')}
                                className="px-3 py-1 text-xs font-medium text-green-600 hover:text-green-500"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => openModal(confirmation, 'reject')}
                                className="px-3 py-1 text-xs font-medium text-red-600 hover:text-red-500"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          {confirmation.status !== 'Pending' && (
                            <div className="text-sm text-richblack-100">
                              {confirmation.confirmedBy && (
                                <div>By: {confirmation.confirmedBy.firstName} {confirmation.confirmedBy.lastName}</div>
                              )}
                              {confirmation.confirmedAt && (
                                <div>{formatDate(confirmation.confirmedAt)}</div>
                              )}
                            </div>
                          )}
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-richblack-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-richblack-25 mb-4">
              {modalType === 'confirm' ? 'Confirm Admission' : 'Reject Admission'}
            </h3>
            
            {modalType === 'reject' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-richblack-100 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 bg-richblack-700 text-richblack-25 rounded-md border border-richblack-600 focus:outline-none focus:border-yellow-400"
                  rows="3"
                  placeholder="Please provide a reason for rejection..."
                />
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-richblack-100 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-richblack-700 text-richblack-25 rounded-md border border-richblack-600 focus:outline-none focus:border-yellow-400"
                rows="3"
                placeholder="Additional notes..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-richblack-100 bg-richblack-700 rounded-md hover:bg-richblack-600"
              >
                Cancel
              </button>
              <button
                onClick={modalType === 'confirm' ? handleConfirm : handleReject}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  modalType === 'confirm' 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {modalType === 'confirm' ? 'Confirm' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdmissionConfirmation; 