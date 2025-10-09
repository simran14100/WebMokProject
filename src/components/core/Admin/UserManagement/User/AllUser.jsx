
import React, { useEffect, useMemo, useState } from 'react'; 
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../../../../common/DashboardLayout';
import { apiConnector } from '../../../../../services/apiConnector';
import { admin as adminApi } from '../../../../../services/apis';
import { updateUserStatus } from '../../../../../services/operations/adminApi';

const ED_TEAL = '#07A698';
const BORDER = '#e0e0e0';
const BG = '#f8f9fa';
const TEXT_DARK = '#191A1F';
const TEXT_GRAY = '#666';
const SIDEBAR_WIDTH = 220;

export default function AllUsers() {
  const { token } = useSelector((s) => s.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    accountType: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle edit button click
  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      contactNumber: user.additionalDetails?.contactNumber || '',
      accountType: user.accountType || 'Student'
    });
    setIsEditModalOpen(true);
  };

  // Handle input changes in the form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    
    setIsSubmitting(true);
    try {
      const response = await apiConnector(
        'PUT',
        adminApi.UPDATE_USER_API(editingUser._id),
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          contactNumber: formData.contactNumber,
          accountType: formData.accountType
        },
        { 'Authorization': `Bearer ${token}` }
      );
      
      if (response.data.success) {
        toast.success('User updated successfully');
        fetchUsers(); // Refresh the user list
        setIsEditModalOpen(false);
      } else {
        toast.error(response.data.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit, search });
      const res = await apiConnector(
        'GET',
        `${adminApi.GET_REGISTERED_USERS_API}?${params}`,
        null,
        token ? { Authorization: `Bearer ${token}` } : undefined
      );
      if (res?.data?.success) {
        setUsers(res.data.data.users || []);
        setTotalPages(res.data.data.totalPages || 1);
      } else {
        setUsers([]);
        setError('Failed to load users');
      }
    } catch (e) {
      console.error(e);
      setError('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search]);

  const orderedUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.trim().toLowerCase();
    const score = (u) => {
      const name = `${u.firstName || ''} ${u.lastName || ''}`.trim().toLowerCase();
      const email = (u.email || '').toLowerCase();
      let s = 0;
      if (name === q) s += 100;
      if (name.startsWith(q)) s += 50;
      if (name.includes(q)) s += 25;
      if (email.startsWith(q)) s += 15;
      return s;
    };
    return [...users].sort((a, b) => score(b) - score(a));
  }, [users, search]);

  const onSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <DashboardLayout>
      <div className="all-users-container">
        <h1 className="page-title">All Users</h1>

        <div className="filter-box">
          <div className="filter-left">
            <span>Show entries</span>
            <select
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
            >
              {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <input
            placeholder="Search by name or email"
            value={search}
            onChange={onSearchChange}
          />
        </div>

        <div className="table-wrapper">
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {['Serial No.', 'Name', 'Email', 'Phone Number', 'Actions'].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5}>Loading...</td></tr>
                ) : error ? (
                  <tr><td colSpan={5} style={{ color: 'crimson' }}>{error}</td></tr>
                ) : orderedUsers.length === 0 ? (
                  <tr><td colSpan={5}>No users found</td></tr>
                ) : (
                  orderedUsers.map((u, idx) => (
                    <tr key={u._id}>
                      <td>{(page - 1) * limit + idx + 1}</td>
                      <td>{`${u.firstName || ''} ${u.lastName || ''}`.trim()}</td>
                      <td>{u.email}</td>
                      <td>{u?.additionalDetails?.contactNumber || '-'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleEditClick(u)}
                            style={{ 
                              padding: '6px 10px', 
                              background: '#e0f2fe', 
                              color: '#0369a1', 
                              border: '1px solid #bae6fd', 
                              borderRadius: 6, 
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M11 4H4V20H20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.278 1.87868 20.554 1.93355 20.8118 2.04015C21.0696 2.14676 21.304 2.30308 21.5 2.5C21.6969 2.69602 21.8522 2.9304 21.957 3.1882C22.0618 3.446 22.1139 3.72198 22.11 4C22.1061 4.27802 22.0464 4.55294 21.9346 4.80825C21.8227 5.06357 21.6609 5.2942 21.46 5.485L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={async () => {
                              if (!window.confirm('Deactivate this user?')) return;
                              try {
                                await updateUserStatus(u._id, 'Inactive', token);
                                setUsers(prev => prev.filter(x => x._id !== u._id));
                                toast.success('User deactivated successfully');
                              } catch (e) {
                                toast.error('Failed to deactivate user');
                              }
                            }}
                            style={{ 
                              padding: '6px 10px', 
                              background: '#fee2e2', 
                              color: '#b91c1c', 
                              border: '1px solid #fecaca', 
                              borderRadius: 6, 
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && editingUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              paddingBottom: '10px',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#1a202c',
                margin: 0
              }}>Edit User</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  color: '#718096'
                }}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#4a5568'
                }}>
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.875rem'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#4a5568'
                }}>
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.875rem'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#4a5568'
                }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.875rem',
                    backgroundColor: '#f7fafc',
                    color: '#718096'
                  }}
                  disabled
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#4a5568'
                }}>
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#4a5568'
                }}>
                  Account Type
                </label>
                <select
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleInputChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.875rem',
                    backgroundColor: formData.accountType === 'Admin' ? '#f7fafc' : 'white',
                    color: formData.accountType === 'Admin' ? '#718096' : '#1a202c'
                  }}
                  disabled={formData.accountType === 'Admin'}
                >
                  <option value="Student">Student</option>
                  <option value="Instructor">Instructor</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                paddingTop: '16px',
                borderTop: '1px solid #e2e8f0'
              }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  disabled={isSubmitting}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: '1px solid #e2e8f0',
                    background: 'white',
                    color: '#4a5568',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '4px',
                    border: 'none',
                    background: '#4299e1',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    opacity: isSubmitting ? 0.7 : 1
                  }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Responsive CSS */}
      <style jsx>{`
        .all-users-container {
          max-width: 1400px;
          
          margin-left:-60px;
          padding: 32px 24px;
          padding-left: ${SIDEBAR_WIDTH + 22}px;
        }

        .page-title {
          font-size: 32px;
          font-weight: 800;
          color: ${ED_TEAL};
          margin-bottom: 24px;
        }

        .filter-box {
          background: #fff;
          border: 1px solid ${BORDER};
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          display: flex;
          gap: 16px;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
        }

        .filter-left {
          display: flex;
          gap: 12px;
          align-items: center;
          font-size: 14px;
          color: ${TEXT_GRAY};
        }

        .filter-box select,
        .filter-box input {
          border: 1px solid ${BORDER};
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 14px;
          background: #fff;
        }

        .filter-box input {
          width: 300px;
          max-width: 100%;
        }

        .table-wrapper {
          background: #fff;
          border: 1px solid ${BORDER};
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .table-scroll {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 700px;
        }

        th {
          padding: 14px 18px;
          text-align: left;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.5px;
          color: ${TEXT_GRAY};
          border-bottom: 1px solid ${BORDER};
          background: ${BG};
        }

        td {
          padding: 14px 18px;
          font-size: 15px;
          color: ${TEXT_DARK};
          border-bottom: 1px solid ${BORDER};
        }

        tr:hover td {
          background: #fafafa;
        }

        .pagination {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-top: 20px;
          align-items: center;
          flex-wrap: wrap;
        }

        .pagination button {
          border: 1px solid ${BORDER};
          padding: 10px 14px;
          border-radius: 8px;
          background: #fff;
          cursor: pointer;
          font-size: 14px;
        }

        .pagination button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination span {
          font-size: 14px;
          color: ${TEXT_GRAY};
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .all-users-container {
            padding-left: ${SIDEBAR_WIDTH / 2}px;
          }
          .page-title {
            font-size: 28px;
          }
        }

        @media (max-width: 768px) {
          .all-users-container {
            padding-left: 16px;
            padding-right: 16px;
          }
          .page-title {
            font-size: 24px;
          }
          .filter-box {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          .filter-left {
            justify-content: space-between;
            width: 100%;
          }
          .filter-box input {
            width: 100%;
          }
          table {
            font-size: 14px;
          }
          th, td {
            padding: 10px 12px;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
