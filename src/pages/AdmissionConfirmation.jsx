import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { apiConnector } from '../services/apiConnector';
import { admission } from '../services/apis';
import { showSuccess, showError } from '../utils/toast';
import DashboardLayout from '../components/common/DashboardLayout';

// EdCare Design System Colors
const ED_TEAL = '#07A698';
const ED_TEAL_DARK = '#059a8c';
const BG = '#f8f9fa';
const CARD_BG = '#fff';
const BORDER = '#e0e0e0';
const TEXT_DARK = '#191A1F';
const TEXT_GRAY = '#666';
const SUCCESS_GREEN = '#10B981';
const WARNING_YELLOW = '#F59E0B';
const ERROR_RED = '#EF4444';
const INFO_BLUE = '#3B82F6';

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

  // Hide footer for this page
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (footer) {
      footer.style.display = 'none';
    }
    
    return () => {
      if (footer) {
        footer.style.display = 'block';
      }
    };
  }, []);

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
      showError('Failed to fetch admission confirmations');
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
        showSuccess('Admission confirmed successfully');
        setShowModal(false);
        setSelectedConfirmation(null);
        setNotes('');
        fetchConfirmations();
        fetchStats();
      }
    } catch (error) {
      console.error('Error confirming admission:', error);
      showError('Failed to confirm admission');
    }
  };

  const handleReject = async () => {
    if (!selectedConfirmation || !rejectionReason) {
      showError('Please provide a rejection reason');
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
        showSuccess('Admission rejected successfully');
        setShowModal(false);
        setSelectedConfirmation(null);
        setRejectionReason('');
        setNotes('');
        fetchConfirmations();
        fetchStats();
      }
    } catch (error) {
      console.error('Error rejecting admission:', error);
      showError('Failed to reject admission');
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
    const statusStyles = {
      Pending: {
        background: 'rgba(245, 158, 11, 0.1)',
        color: WARNING_YELLOW,
        border: `1px solid ${WARNING_YELLOW}`
      },
      Confirmed: {
        background: 'rgba(16, 185, 129, 0.1)',
        color: SUCCESS_GREEN,
        border: `1px solid ${SUCCESS_GREEN}`
      },
      Rejected: {
        background: 'rgba(239, 68, 68, 0.1)',
        color: ERROR_RED,
        border: `1px solid ${ERROR_RED}`
      }
    };

    const style = statusStyles[status] || statusStyles.Pending;

    return (
      <span style={{
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        ...style
      }}>
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

  // Loading state
  if (loading && confirmations.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: 'calc(100vh - 200px)',
        background: BG 
      }}>
        <div style={{ textAlign: 'center', color: ED_TEAL, fontWeight: 600, fontSize: 20 }}>
          <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
          Loading admission confirmations...
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ 
        width: '100%', 
        maxWidth: '100%', 
        margin: '0 auto', 
        marginLeft: '250px',
        padding: '0',
        overflowX: 'hidden'
      }}>
        {/* Page Heading */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '48px',
          marginTop: '0',
          color: ED_TEAL,
          fontWeight: '700',
          fontSize: '36px',
          letterSpacing: '-0.5px'
        }}>
              Admission Confirmation
          </div>

          {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '24px', 
        marginBottom: '40px'
      }}>
        <div style={{ 
          background: CARD_BG, 
          borderRadius: '16px', 
          padding: '24px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
          border: `1px solid ${BORDER}`,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: WARNING_YELLOW
          }}></div>
          <div style={{ color: TEXT_GRAY, fontSize: '14px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Pending
          </div>
          <div style={{ color: WARNING_YELLOW, fontSize: '32px', fontWeight: '700' }}>
            {stats.totalPending || 0}
          </div>
        </div>

        <div style={{ 
          background: CARD_BG, 
          borderRadius: '16px', 
          padding: '24px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
          border: `1px solid ${BORDER}`,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: SUCCESS_GREEN
          }}></div>
          <div style={{ color: TEXT_GRAY, fontSize: '14px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Confirmed
          </div>
          <div style={{ color: SUCCESS_GREEN, fontSize: '32px', fontWeight: '700' }}>
            {stats.totalConfirmed || 0}
          </div>
        </div>

        <div style={{ 
          background: CARD_BG, 
          borderRadius: '16px', 
          padding: '24px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
          border: `1px solid ${BORDER}`,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: ERROR_RED
          }}></div>
          <div style={{ color: TEXT_GRAY, fontSize: '14px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Rejected
          </div>
          <div style={{ color: ERROR_RED, fontSize: '32px', fontWeight: '700' }}>
            {stats.totalRejected || 0}
          </div>
            </div>

        <div style={{ 
          background: CARD_BG, 
          borderRadius: '16px', 
          padding: '24px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
          border: `1px solid ${BORDER}`,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: INFO_BLUE
          }}></div>
          <div style={{ color: TEXT_GRAY, fontSize: '14px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Confirmations
            </div>
          <div style={{ color: INFO_BLUE, fontSize: '32px', fontWeight: '700' }}>
            {stats.totalConfirmations || 0}
            </div>
            </div>

        <div style={{ 
          background: CARD_BG, 
          borderRadius: '16px', 
          padding: '24px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
          border: `1px solid ${BORDER}`,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: ED_TEAL
          }}></div>
          <div style={{ color: TEXT_GRAY, fontSize: '14px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Today's Confirmations
          </div>
          <div style={{ color: ED_TEAL, fontSize: '32px', fontWeight: '700' }}>
            {stats.todayConfirmations || 0}
          </div>
            </div>
          </div>

          {/* Filters */}
      <div style={{ 
        background: CARD_BG, 
        borderRadius: '16px', 
        padding: '24px', 
        marginBottom: '32px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
        border: `1px solid ${BORDER}`
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px',
          alignItems: 'stretch'
        }}>
          <div style={{ flex: 1 }}>
                <input
                  type="text"
                  placeholder="Search by order ID or payment ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: `1px solid ${BORDER}`,
                fontSize: '14px',
                background: BG,
                color: TEXT_DARK,
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = ED_TEAL;
                e.target.style.boxShadow = `0 0 0 3px rgba(7, 166, 152, 0.1)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = BORDER;
                e.target.style.boxShadow = 'none';
              }}
                />
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: `1px solid ${BORDER}`,
                fontSize: '14px',
                background: BG,
                color: TEXT_DARK,
                outline: 'none',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = ED_TEAL;
                e.target.style.boxShadow = `0 0 0 3px rgba(7, 166, 152, 0.1)`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = BORDER;
                e.target.style.boxShadow = 'none';
              }}
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
      <div style={{ 
        background: CARD_BG, 
        borderRadius: '16px', 
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
        border: `1px solid ${BORDER}`
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: BG }}>
              <tr>
                <th style={{ 
                  padding: '16px 24px', 
                  textAlign: 'left', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: TEXT_GRAY, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px',
                  borderBottom: `1px solid ${BORDER}`
                }}>
                      Student
                    </th>
                <th style={{ 
                  padding: '16px 24px', 
                  textAlign: 'left', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: TEXT_GRAY, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px',
                  borderBottom: `1px solid ${BORDER}`
                }}>
                      Course
                    </th>
                <th style={{ 
                  padding: '16px 24px', 
                  textAlign: 'left', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: TEXT_GRAY, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px',
                  borderBottom: `1px solid ${BORDER}`
                }}>
                      Payment Details
                    </th>
                <th style={{ 
                  padding: '16px 24px', 
                  textAlign: 'left', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: TEXT_GRAY, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px',
                  borderBottom: `1px solid ${BORDER}`
                }}>
                      Status
                    </th>
                <th style={{ 
                  padding: '16px 24px', 
                  textAlign: 'left', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: TEXT_GRAY, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px',
                  borderBottom: `1px solid ${BORDER}`
                }}>
                      Date
                    </th>
                <th style={{ 
                  padding: '16px 24px', 
                  textAlign: 'left', 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: TEXT_GRAY, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.5px',
                  borderBottom: `1px solid ${BORDER}`
                }}>
                      Actions
                    </th>
                  </tr>
                </thead>
            <tbody>
                  {loading ? (
                    <tr>
                  <td colSpan="6" style={{ 
                    padding: '40px 24px', 
                    textAlign: 'center', 
                    color: TEXT_GRAY,
                    fontSize: '16px'
                  }}>
                    <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
                    Loading confirmations...
                      </td>
                    </tr>
                  ) : confirmations.length === 0 ? (
                    <tr>
                  <td colSpan="6" style={{ 
                    padding: '40px 24px', 
                    textAlign: 'center', 
                    color: TEXT_GRAY,
                    fontSize: '16px'
                  }}>
                        No admission confirmations found
                      </td>
                    </tr>
                  ) : (
                confirmations.map((confirmation, index) => (
                  <tr key={confirmation._id} style={{ 
                    borderBottom: index < confirmations.length - 1 ? `1px solid ${BORDER}` : 'none',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = BG;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}>
                    <td style={{ padding: '20px 24px' }}>
                          <div>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: '600', 
                          color: TEXT_DARK,
                          marginBottom: '4px'
                        }}>
                              {confirmation.student?.firstName} {confirmation.student?.lastName}
                            </div>
                        <div style={{ 
                          fontSize: '13px', 
                          color: TEXT_GRAY 
                        }}>
                              {confirmation.student?.email}
                            </div>
                          </div>
                        </td>
                    <td style={{ padding: '20px 24px' }}>
                          <div>
                        <div style={{ 
                          fontSize: '14px', 
                          fontWeight: '600', 
                          color: TEXT_DARK,
                          marginBottom: '4px'
                        }}>
                              {confirmation.course?.courseName}
                            </div>
                        <div style={{ 
                          fontSize: '13px', 
                          color: TEXT_GRAY 
                        }}>
                              ₹{confirmation.course?.price}
                            </div>
                          </div>
                        </td>
                    <td style={{ padding: '20px 24px' }}>
                      <div style={{ fontSize: '13px', color: TEXT_GRAY }}>
                        <div style={{ marginBottom: '2px' }}>Order: {confirmation.paymentDetails.orderId}</div>
                        <div style={{ marginBottom: '2px' }}>Payment: {confirmation.paymentDetails.paymentId}</div>
                        <div style={{ fontWeight: '600', color: TEXT_DARK }}>Amount: ₹{confirmation.paymentDetails.amount}</div>
                          </div>
                        </td>
                    <td style={{ padding: '20px 24px' }}>
                          {getStatusBadge(confirmation.status)}
                        </td>
                    <td style={{ 
                      padding: '20px 24px', 
                      fontSize: '13px', 
                      color: TEXT_GRAY 
                    }}>
                          {formatDate(confirmation.createdAt)}
                        </td>
                    <td style={{ padding: '20px 24px' }}>
                      {confirmation.status === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => openModal(confirmation, 'confirm')}
                            style={{
                              padding: '8px 16px',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: SUCCESS_GREEN,
                              background: 'rgba(16, 185, 129, 0.1)',
                              border: `1px solid ${SUCCESS_GREEN}`,
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = SUCCESS_GREEN;
                              e.target.style.color = '#fff';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'rgba(16, 185, 129, 0.1)';
                              e.target.style.color = SUCCESS_GREEN;
                            }}
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => openModal(confirmation, 'reject')}
                            style={{
                              padding: '8px 16px',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: ERROR_RED,
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: `1px solid ${ERROR_RED}`,
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = ERROR_RED;
                              e.target.style.color = '#fff';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                              e.target.style.color = ERROR_RED;
                            }}
                              >
                                Reject
                              </button>
                        </div>
                      ) : (
                        <div style={{ fontSize: '13px', color: TEXT_GRAY }}>
                          {confirmation.confirmedBy && (
                            <div style={{ marginBottom: '4px' }}>
                              By: {confirmation.confirmedBy.firstName} {confirmation.confirmedBy.lastName}
                            </div>
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
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginTop: '32px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            background: CARD_BG,
            padding: '12px 24px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
            border: `1px solid ${BORDER}`
          }}>
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                color: currentPage === 1 ? TEXT_GRAY : TEXT_DARK,
                background: currentPage === 1 ? BG : CARD_BG,
                border: `1px solid ${BORDER}`,
                borderRadius: '8px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (currentPage !== 1) {
                  e.target.style.borderColor = ED_TEAL;
                  e.target.style.color = ED_TEAL;
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 1) {
                  e.target.style.borderColor = BORDER;
                  e.target.style.color = TEXT_DARK;
                }
              }}
                >
                  Previous
                </button>
            <span style={{ 
              padding: '8px 16px', 
              fontSize: '14px', 
              color: TEXT_DARK,
              fontWeight: '600'
            }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
              style={{
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                color: currentPage === totalPages ? TEXT_GRAY : TEXT_DARK,
                background: currentPage === totalPages ? BG : CARD_BG,
                border: `1px solid ${BORDER}`,
                borderRadius: '8px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (currentPage !== totalPages) {
                  e.target.style.borderColor = ED_TEAL;
                  e.target.style.color = ED_TEAL;
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== totalPages) {
                  e.target.style.borderColor = BORDER;
                  e.target.style.color = TEXT_DARK;
                }
              }}
                >
                  Next
                </button>
            </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: CARD_BG,
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            border: `1px solid ${BORDER}`
          }}>
            <h3 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: TEXT_DARK,
              marginBottom: '24px',
              textAlign: 'center'
            }}>
              {modalType === 'confirm' ? 'Confirm Admission' : 'Reject Admission'}
            </h3>
            
            {modalType === 'reject' && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: TEXT_DARK,
                  marginBottom: '8px'
                }}>
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: `1px solid ${BORDER}`,
                    fontSize: '14px',
                    background: BG,
                    color: TEXT_DARK,
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '80px',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = ED_TEAL;
                    e.target.style.boxShadow = `0 0 0 3px rgba(7, 166, 152, 0.1)`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = BORDER;
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Please provide a reason for rejection..."
                />
              </div>
            )}
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: TEXT_DARK,
                marginBottom: '8px'
              }}>
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: `1px solid ${BORDER}`,
                  fontSize: '14px',
                  background: BG,
                  color: TEXT_DARK,
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: '80px',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = ED_TEAL;
                  e.target.style.boxShadow = `0 0 0 3px rgba(7, 166, 152, 0.1)`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = BORDER;
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Additional notes..."
              />
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              gap: '12px' 
            }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: TEXT_GRAY,
                  background: BG,
                  border: `1px solid ${BORDER}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#e9ecef';
                  e.target.style.borderColor = '#adb5bd';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = BG;
                  e.target.style.borderColor = BORDER;
                }}
              >
                Cancel
              </button>
              <button
                onClick={modalType === 'confirm' ? handleConfirm : handleReject}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#fff',
                  background: modalType === 'confirm' ? SUCCESS_GREEN : ERROR_RED,
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = modalType === 'confirm' ? '#059669' : '#dc2626';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = modalType === 'confirm' ? SUCCESS_GREEN : ERROR_RED;
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                {modalType === 'confirm' ? 'Confirm' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
};

export default AdmissionConfirmation; 