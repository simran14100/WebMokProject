import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import LeaveRequestForm from './LeaveRequestForm';

const LeaveRequestList = ({ isAdmin = false, onStatusUpdate, requests = [], loading = false }) => {
  const { token, user } = useSelector((state) => state.auth);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [editingRequest, setEditingRequest] = useState(null);
  const [adminComment, setAdminComment] = useState('');
  
  // If not explicitly set, check user role
  const userIsAdmin = isAdmin || user?.accountType === 'Admin' || user?.accountType === 'SuperAdmin';


  const handleStatusUpdate = async (requestId, status) => {
    try {
      if (!userIsAdmin) {
        throw new Error('Only admins can update leave request status');
      }
      
      const response = await fetch(`${process.env.REACT_APP_BASE_URL || 'http://localhost:4000'}/api/v1/leave-requests/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, adminComment })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update request status');
      }
      
      toast.success(`Request ${status.toLowerCase()} successfully`);
      setSelectedRequest(null);
      setAdminComment('');
      // Call the parent's status update handler
      if (onStatusUpdate) {
        onStatusUpdate(requestId, status, adminComment);
      }
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error(error.message || 'Failed to update request status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return <div className="text-center py-4">Loading leave requests...</div>;
  }

  return (
   
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0A2F5A' }}>
      {userIsAdmin ? 'All Leave Requests' : 'My Leave Requests'}
    </h2>
  
    {/* Table */}
    <div style={{ overflowX: 'auto', borderRadius: '0.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
        <thead style={{ backgroundColor: '#0A2F5A' }}>
          <tr>
            {['Student','Email','Date Range','Status','Actions'].map((col) => (
              <th
                key={col}
                style={{
                  padding: '0.75rem 1.5rem',
                  textAlign: 'left',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  color: '#fff',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody style={{ backgroundColor: '#fff' }}>
          {requests.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ padding: '1rem 1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#6B7280' }}>
                No leave requests found
              </td>
            </tr>
          ) : (
            requests.map((request) => (
              <tr key={request._id} style={{ transition: 'background-color 0.2s', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
                    {typeof request.student === 'object'
                      ? `${request.student?.firstName || ''} ${request.student?.lastName || ''}`.trim() || 'N/A'
                      : `Student ID: ${request.student}`}
                  </div>
                </td>
                <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#6B7280' }}>
                  {typeof request.student === 'object' ? request.student?.email || 'N/A' : 'Not available'}
                </td>
                <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#6B7280' }}>
                  {formatDate(request.startDate)} - {formatDate(request.endDate)}
                </td>
                <td style={{ padding: '1rem 1.5rem' }}>
                  <span
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      borderRadius: '9999px',
                      color:
                        request.status === 'Approved'
                          ? '#166534'
                          : request.status === 'Rejected'
                          ? '#991B1B'
                          : '#78350F',
                      backgroundColor:
                        request.status === 'Approved'
                          ? '#DCFCE7'
                          : request.status === 'Rejected'
                          ? '#FEE2E2'
                          : '#FEF3C7',
                    }}
                  >
                    {request.status}
                  </span>
                </td>
                <td style={{ padding: '1rem 1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', fontSize: '0.875rem', fontWeight: '500' }}>
                  {userIsAdmin ? (
                    <>
                      {request.status === 'Pending' ? (
                        <>
                          <button
                            onClick={() => { setSelectedRequest(request); setAdminComment(request.adminComment || ''); }}
                            style={{ color: '#1E90FF', fontWeight: '600', border: 'none', background: 'none', cursor: 'pointer' }}
                          >
                            Review
                          </button>
                          <button
                            onClick={() => setSelectedRequest({ ...request, viewOnly: true })}
                            style={{ color: '#0A2F5A', fontWeight: '600', border: 'none', background: 'none', cursor: 'pointer' }}
                          >
                            View
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setSelectedRequest({ ...request, viewOnly: true })}
                          style={{ color: '#0A2F5A', fontWeight: '600', border: 'none', background: 'none', cursor: 'pointer' }}
                        >
                          View
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {request.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => setEditingRequest(request)}
                            style={{ color: '#1E90FF', fontWeight: '600', border: 'none', background: 'none', cursor: 'pointer' }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              if (window.confirm('Are you sure you want to delete this leave request?')) {
                                try {
                                  const response = await fetch(
                                    `${process.env.REACT_APP_BASE_URL || 'http://localhost:4000'}/api/v1/leave-requests/${request._id}`,
                                    { method: 'DELETE', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } }
                                  );
                                  if (response.ok) {
                                    toast.success('Leave request deleted successfully');
                                    if (onStatusUpdate) onStatusUpdate();
                                  } else {
                                    const error = await response.json();
                                    throw new Error(error.message || 'Failed to delete leave request');
                                  }
                                } catch (error) {
                                  toast.error(error.message || 'Failed to delete leave request');
                                }
                              }
                            }}
                            style={{ color: '#DC2626', fontWeight: '600', border: 'none', background: 'none', cursor: 'pointer' }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  
    {/* View Modal */}
    {selectedRequest?.viewOnly && (
      <div style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 50
      }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', width: '100%', maxWidth: '32rem', borderTop: '4px solid #0A2F5A' }}>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#0A2F5A' }}>Leave Request Details</h3>
              <button onClick={() => setSelectedRequest(null)} style={{ color: '#9CA3AF', cursor: 'pointer', border: 'none', background: 'none' }}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" width={24} height={24}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
  
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#374151' }}>
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6B7280' }}>Student</h4>
                <p style={{ marginTop: '0.25rem', fontSize: '0.875rem' }}>
                  {typeof selectedRequest.student === 'object'
                    ? `${selectedRequest.student?.firstName || ''} ${selectedRequest.student?.lastName || ''}`.trim()
                    : `Student ID: ${selectedRequest.student}`}
                </p>
              </div>
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6B7280' }}>Leave Period</h4>
                <p style={{ marginTop: '0.25rem', fontSize: '0.875rem' }}>
                  {formatDate(selectedRequest.startDate)} to {formatDate(selectedRequest.endDate)}
                </p>
              </div>
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6B7280' }}>Reason</h4>
                <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', whiteSpace: 'pre-line' }}>
                  {selectedRequest.reason || 'No reason provided'}
                </p>
              </div>
              {selectedRequest.status !== 'Pending' && selectedRequest.adminComment && (
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6B7280' }}>Admin Comments</h4>
                  <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', whiteSpace: 'pre-line' }}>
                    {selectedRequest.adminComment}
                  </p>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem' }}>
                <button
                  onClick={() => setSelectedRequest(null)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', padding: '0.5rem 1rem',
                    border: '1px solid #0A2F5A', backgroundColor: '#fff', color: '#0A2F5A',
                    borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '500'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  
    {/* Review Modal */}
    {selectedRequest && !selectedRequest.viewOnly && (
      <div style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 50 , marginTop:"8rem"
      }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.3)', width: '100%', maxWidth: '32rem', borderTop: '4px solid #0A2F5A' }}>
          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#0A2F5A' }}>Review Leave Request</h3>
              <button onClick={() => setSelectedRequest(null)} style={{ color: '#9CA3AF', cursor: 'pointer', border: 'none', background: 'none' }}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" width={24} height={24}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
  
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#374151' }}>
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6B7280' }}>Student</h4>
                <p style={{ marginTop: '0.25rem', fontSize: '0.875rem' }}>
                  {typeof selectedRequest.student === 'object'
                    ? `${selectedRequest.student?.firstName || ''} ${selectedRequest.student?.lastName || ''}`.trim()
                    : `Student ID: ${selectedRequest.student}`}
                </p>
              </div>
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6B7280' }}>Leave Period</h4>
                <p style={{ marginTop: '0.25rem', fontSize: '0.875rem' }}>
                  {formatDate(selectedRequest.startDate)} to {formatDate(selectedRequest.endDate)}
                </p>
              </div>
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6B7280' }}>Reason</h4>
                <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', whiteSpace: 'pre-line' }}>
                  {selectedRequest.reason || 'No reason provided'}
                </p>
              </div>
  
              <div>
                <label htmlFor="adminComment" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                  Your Comments (Optional)
                </label>
                <textarea
                  id="adminComment"
                  rows={3}
                  placeholder="Add any comments for the student..."
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  style={{
                    width: '100%', padding: '0.5rem', fontSize: '0.875rem', borderRadius: '0.375rem',
                    border: '1px solid #D1D5DB', outline: 'none', resize: 'vertical'
                  }}
                />
              </div>
  
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem' }}>
                <button
                  onClick={() => { setSelectedRequest(null); setAdminComment(''); }}
                  style={{
                    padding: '0.5rem 1rem', borderRadius: '0.375rem', border: '1px solid #0A2F5A', backgroundColor: '#fff',
                    color: '#0A2F5A', fontWeight: '500', cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => { await handleStatusUpdate(selectedRequest._id, 'Rejected'); setSelectedRequest(null); }}
                  style={{
                    padding: '0.5rem 1rem', borderRadius: '0.375rem', backgroundColor: '#DC2626',
                    color: '#fff', fontWeight: '500', cursor: 'pointer', border: 'none'
                  }}
                >
                  Reject
                </button>
                <button
                  onClick={async () => { await handleStatusUpdate(selectedRequest._id, 'Approved'); setSelectedRequest(null); }}
                  style={{
                    padding: '0.5rem 1rem', borderRadius: '0.375rem', backgroundColor: '#1E90FF',
                    color: '#fff', fontWeight: '500', cursor: 'pointer', border: 'none'
                  }}
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  
    {/* Edit Modal */}
    {editingRequest && (
      <div style={{
        position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 50, overflowY: 'auto'
      }}>
        <div style={{
          backgroundColor: '#fff', borderRadius: '1rem', boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          width: '100%', maxWidth: '48rem', margin: '2rem 0', display: 'flex', flexDirection: 'column', borderTop: '4px solid #0A2F5A'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem', borderBottom: '1px solid #E5E7EB' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0A2F5A' }}>Edit Leave Request</h2>
            <button onClick={() => setEditingRequest(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6B7280' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" width={24} height={24}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
  
          {/* Body */}
          <div style={{ padding: '1.5rem', maxHeight: '60vh', overflowY: 'auto', flex: 1 }}>
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#E6F0FA', borderRadius: '0.5rem', borderLeft: '4px solid #1E90FF', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" style={{ color: '#1E90FF' }}>
                <path fillRule="evenodd" clipRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" />
              </svg>
              <p style={{ fontSize: '0.875rem', color: '#0A2F5A' }}>
                You can modify your leave request details below. Please ensure all information is accurate before submitting.
              </p>
            </div>
  
            <LeaveRequestForm
              initialData={editingRequest}
              onSuccess={() => {
                toast.success('Leave request updated successfully!');
                setEditingRequest(null);
                if (onStatusUpdate) onStatusUpdate();
              }}
              onCancel={() => setEditingRequest(null)}
            />
          </div>
        </div>
      </div>
    )}
  </div>
  

    // <div className="space-y-6">
    //   <h2 className="text-2xl font-bold">
    //     {userIsAdmin ? 'All Leave Requests' : 'My Leave Requests'}
    //   </h2>

    //   <div className="overflow-x-auto">
    //     <table className="min-w-full divide-y divide-gray-200">
    //       <thead className="bg-gray-50">
    //         <tr>
    //           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
    //           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              
    //           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
    //           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
    //           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
    //         </tr>
    //       </thead>
    //       <tbody className="bg-white divide-y divide-gray-200">
    //         {requests.length === 0 ? (
    //           <tr>
    //             <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
    //               No leave requests found
    //             </td>
    //           </tr>
    //         ) : (
    //           requests.map((request) => (
    //             <tr key={request._id}>
    //               <td className="px-6 py-4 whitespace-nowrap">
    //                 <div className="text-sm font-medium text-gray-900">
    //                   {typeof request.student === 'object' ? (
    //                     `${request.student?.firstName || ''} ${request.student?.lastName || ''}`.trim() || 'N/A'
    //                   ) : (
    //                     <span className="text-gray-400">Student ID: {request.student}</span>
    //                   )}
    //                 </div>
    //               </td>
    //               <td className="px-6 py-4 whitespace-nowrap">
    //                 <div className="text-sm text-gray-500">
    //                   {typeof request.student === 'object' ? (
    //                     request.student?.email || 'N/A'
    //                   ) : (
    //                     <span className="text-gray-400">Not available</span>
    //                   )}
    //                 </div>
    //               </td>
    //               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
    //                 {formatDate(request.startDate)} - {formatDate(request.endDate)}
    //               </td>
    //               <td className="px-6 py-4 whitespace-nowrap">
    //                 <span
    //                   className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
    //                     request.status === 'Approved'
    //                       ? 'bg-green-100 text-green-800'
    //                       : request.status === 'Rejected'
    //                       ? 'bg-red-100 text-red-800'
    //                       : 'bg-yellow-100 text-yellow-800'
    //                   }`}
    //                 >
    //                   {request.status}
    //                 </span>
    //               </td>
    //               <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
    //                 {userIsAdmin ? (
    //                   // Admin actions
    //                   <>
    //                     {request.status === 'Pending' ? (
    //                       <>
    //                         <button
    //                           onClick={() => {
    //                             setSelectedRequest(request);
    //                             setAdminComment(request.adminComment || '');
    //                           }}
    //                           className="text-blue-600 hover:text-blue-900 mr-3"
    //                         >
    //                           Review
    //                         </button>
    //                         <button
    //                           onClick={() => {
    //                             setSelectedRequest({...request, viewOnly: true});
    //                           }}
    //                           className="text-indigo-600 hover:text-indigo-900"
    //                         >
    //                           View
    //                         </button>
    //                       </>
    //                     ) : (
    //                       <button
    //                         onClick={() => {
    //                           setSelectedRequest({...request, viewOnly: true});
    //                         }}
    //                         className="text-indigo-600 hover:text-indigo-900"
    //                       >
    //                         View
    //                       </button>
    //                     )}
    //                   </>
    //                 ) : (
    //                   // Student actions
    //                   <>
    //                     {request.status === 'Pending' && (
    //                       <>
    //                         <button
    //                           onClick={() => setEditingRequest(request)}
    //                           className="text-blue-600 hover:text-blue-900 mr-3"
    //                         >
    //                           Edit
    //                         </button>
    //                         <button
    //                           onClick={async () => {
    //                             // Delete logic
    //                             if (window.confirm('Are you sure you want to delete this leave request?')) {
    //                               try {
    //                                 const response = await fetch(
    //                                   `${process.env.REACT_APP_BASE_URL || 'http://localhost:4000'}/api/v1/leave-requests/${request._id}`,
    //                                   {
    //                                     method: 'DELETE',
    //                                     headers: {
    //                                       'Content-Type': 'application/json',
    //                                       'Authorization': `Bearer ${token}`
    //                                     }
    //                                   }
    //                                 );
                                    
    //                                 if (response.ok) {
    //                                   toast.success('Leave request deleted successfully');
    //                                   // Refresh the list
    //                                   if (onStatusUpdate) onStatusUpdate();
    //                                 } else {
    //                                   const error = await response.json();
    //                                   throw new Error(error.message || 'Failed to delete leave request');
    //                                 }
    //                               } catch (error) {
    //                                 console.error('Error deleting leave request:', error);
    //                                 toast.error(error.message || 'Failed to delete leave request');
    //                               }
    //                             }
    //                           }}
    //                           className="text-red-600 hover:text-red-900"
    //                         >
    //                           Delete
    //                         </button>
    //                       </>
    //                     )}
    //                   </>
    //                 )}
    //               </td>
    //             </tr>
    //           ))
    //         )}
    //       </tbody>
    //     </table>
    //   </div>

    //   {/* View Details Modal */}
    //   {selectedRequest?.viewOnly && (
    //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    //       <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
    //         <div className="p-6">
    //           <div className="flex justify-between items-center mb-4">
    //             <h3 className="text-lg font-medium text-gray-900">Leave Request Details</h3>
    //             <button
    //               onClick={() => setSelectedRequest(null)}
    //               className="text-gray-400 hover:text-gray-500"
    //             >
    //               <span className="sr-only">Close</span>
    //               <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    //               </svg>
    //             </button>
    //           </div>
              
    //           <div className="space-y-4">
    //             <div>
    //               <h4 className="text-sm font-medium text-gray-500">Student</h4>
    //               <p className="mt-1 text-sm text-gray-900">
    //                 {typeof selectedRequest.student === 'object' 
    //                   ? `${selectedRequest.student?.firstName || ''} ${selectedRequest.student?.lastName || ''}`.trim() 
    //                   : `Student ID: ${selectedRequest.student}`}
    //               </p>
    //             </div>
                
    //             <div>
    //               <h4 className="text-sm font-medium text-gray-500">Leave Period</h4>
    //               <p className="mt-1 text-sm text-gray-900">
    //                 {formatDate(selectedRequest.startDate)} to {formatDate(selectedRequest.endDate)}
    //               </p>
    //             </div>
                
    //             <div>
    //               <h4 className="text-sm font-medium text-gray-500">Reason</h4>
    //               <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">
    //                 {selectedRequest.reason || 'No reason provided'}
    //               </p>
    //             </div>
                
    //             {selectedRequest.status !== 'Pending' && selectedRequest.adminComment && (
    //               <div>
    //                 <h4 className="text-sm font-medium text-gray-500">Admin Comments</h4>
    //                 <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">
    //                   {selectedRequest.adminComment}
    //                 </p>
    //               </div>
    //             )}
                
    //             <div className="flex justify-end pt-4">
    //               <button
    //                 type="button"
    //                 onClick={() => setSelectedRequest(null)}
    //                 className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    //               >
    //                 Close
    //               </button>
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   )}

    //   {/* Review Modal */}
    //   {selectedRequest && !selectedRequest.viewOnly && (
    //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    //       <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
    //         <div className="p-6">
    //           <div className="flex justify-between items-center mb-4">
    //             <h3 className="text-lg font-medium text-gray-900">Review Leave Request</h3>
    //             <button
    //               onClick={() => setSelectedRequest(null)}
    //               className="text-gray-400 hover:text-gray-500"
    //             >
    //               <span className="sr-only">Close</span>
    //               <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    //                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    //               </svg>
    //             </button>
    //           </div>
              
    //           <div className="space-y-4">
    //             <div>
    //               <h4 className="text-sm font-medium text-gray-500">Student</h4>
    //               <p className="mt-1 text-sm text-gray-900">
    //                 {typeof selectedRequest.student === 'object' 
    //                   ? `${selectedRequest.student?.firstName || ''} ${selectedRequest.student?.lastName || ''}`.trim() 
    //                   : `Student ID: ${selectedRequest.student}`}
    //               </p>
    //             </div>
                
    //             <div>
    //               <h4 className="text-sm font-medium text-gray-500">Leave Period</h4>
    //               <p className="mt-1 text-sm text-gray-900">
    //                 {formatDate(selectedRequest.startDate)} to {formatDate(selectedRequest.endDate)}
    //               </p>
    //             </div>
                
    //             <div>
    //               <h4 className="text-sm font-medium text-gray-500">Reason</h4>
    //               <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">
    //                 {selectedRequest.reason || 'No reason provided'}
    //               </p>
    //             </div>
                
    //             <div>
    //               <label htmlFor="adminComment" className="block text-sm font-medium text-gray-700 mb-1">
    //                 Your Comments (Optional)
    //               </label>
    //               <textarea
    //                 id="adminComment"
    //                 rows={3}
    //                 className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
    //                 placeholder="Add any comments for the student..."
    //                 value={adminComment}
    //                 onChange={(e) => setAdminComment(e.target.value)}
    //               />
    //             </div>
                
    //             <div className="flex justify-end space-x-3 pt-4">
    //               <button
    //                 type="button"
    //                 onClick={() => {
    //                   setSelectedRequest(null);
    //                   setAdminComment('');
    //                 }}
    //                 className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    //               >
    //                 Cancel
    //               </button>
    //               <button
    //                 type="button"
    //                 onClick={async () => {
    //                   try {
    //                     await handleStatusUpdate(selectedRequest._id, 'Rejected');
    //                     setSelectedRequest(null);
    //                   } catch (error) {
    //                     console.error('Error rejecting request:', error);
    //                   }
    //                 }}
    //                 className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
    //               >
    //                 Reject
    //               </button>
    //               <button
    //                 type="button"
    //                 onClick={async () => {
    //                   try {
    //                     await handleStatusUpdate(selectedRequest._id, 'Approved');
    //                     setSelectedRequest(null);
    //                   } catch (error) {
    //                     console.error('Error approving request:', error);
    //                   }
    //                 }}
    //                 className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
    //               >
    //                 Approve
    //               </button>
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   )}

    //   {/* Edit Modal */}
    //   {editingRequest && (
    //     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
    //       <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl my-8 flex flex-col">
    //         {/* Modal Header */}
    //         <div className="flex items-center justify-between p-6 border-b border-gray-200">
    //           <h2 className="text-2xl font-bold text-gray-800">Edit Leave Request</h2>
    //           <button
    //             onClick={() => setEditingRequest(null)}
    //             className="text-gray-500 hover:text-gray-700 focus:outline-none"
    //             aria-label="Close modal"
    //           >
    //             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    //             </svg>
    //           </button>
    //         </div>
            
    //         {/* Modal Body */}
    //         <div className="p-6 max-h-[60vh] overflow-y-auto flex-1">
    //           <div className="mb-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
    //             <div className="flex">
    //               <div className="flex-shrink-0">
    //                 <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
    //                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    //                 </svg>
    //               </div>
    //               <div className="ml-3">
    //                 <p className="text-sm text-blue-700">
    //                   You can modify your leave request details below. Please ensure all information is accurate before submitting.
    //                 </p>
    //               </div>
    //             </div>
    //           </div>
              
    //           <LeaveRequestForm
    //             initialData={editingRequest}
    //             onSuccess={() => {
    //               toast.success('Leave request updated successfully!');
    //               setEditingRequest(null);
    //               if (onStatusUpdate) onStatusUpdate();
    //             }}
    //             onCancel={() => setEditingRequest(null)}
    //           />
    //         </div>

           
           
    //       </div>
    //     </div>
    //   )}
    // </div>
  );
};

export default LeaveRequestList;
