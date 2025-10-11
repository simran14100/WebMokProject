import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import DashboardLayout from '../components/common/DashboardLayout';
import { getEnrolledStudents, getRegisteredUsers, updateUserStatus } from '../services/operations/adminApi';
import { apiConnector } from '../services/apiConnector';

export default function AllStudentsCombined() {
  const { token } = useSelector((state) => state.auth);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [{ items: enrolled = [] }, registeredAll] = await Promise.all([
          getEnrolledStudents(token, { page: 1, limit: 1000, search: '' }).catch(() => ({ items: [] })),
          getRegisteredUsers(token, { page: 1, limit: 2000, role: 'Student', search: '' }).catch(() => []),
        ]);

        const reg = Array.isArray(registeredAll) ? registeredAll : [];
        const combined = [...enrolled, ...reg];
        const map = new Map();
        combined.forEach((s) => {
          if (s && (s._id || s.id)) {
            const key = String(s._id || s.id);
            if (!map.has(key)) map.set(key, s);
          }
        });
        // Filter out non-student roles explicitly (Admin, SuperAdmin, Instructor)
        const onlyStudents = Array.from(map.values()).filter((s) => {
          const role = String(s.accountType || '').toLowerCase();
          return role === '' || role === 'student';
        });
        if (mounted) setStudents(onlyStudents);
      } catch (e) {
        if (mounted) setError('Failed to load students');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (token) load();
    return () => { mounted = false };
  }, [token]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => {
      const name = [s.firstName, s.lastName].filter(Boolean).join(' ').toLowerCase();
      const email = String(s.email || '').toLowerCase();
      const phone = String(s.phone || s.contactNumber || '').toLowerCase();
      return name.includes(q) || email.includes(q) || phone.includes(q);
    });
  }, [students, search]);

  const handleDelete = async (userId) => {
    if (!userId) return;
    
    if (!window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await apiConnector(
            'DELETE',
            `/api/v1/admin/users/${userId}`,
            null,
            {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        );

        if (response.data?.success) {
            setStudents(prevStudents => 
                prevStudents.filter(student => (student._id || student.id) !== userId)
            );
            alert('Student deleted successfully');
        } else {
            throw new Error(response.data?.message || 'Failed to delete student');
        }
    } catch (error) {
        console.error('Error deleting student:', error);
        alert(error.response?.data?.message || error.message || 'Failed to delete student. Please try again.');
    }
  };

  return (
    <DashboardLayout>
      <div style={{ 
        width: '100%', 
        maxWidth: '100%', 
        margin: '0 auto', 
        marginLeft: '250px',
        padding: '20px',
        overflowX: 'hidden',
        backgroundColor: '#f8fafc',
        minHeight: '100vh'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb',
          padding: '16px 24px',
          marginBottom: '16px',
          marginTop: '20px'
        }}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            style={{
              width: '100%',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '16px',
              outline: 'none'
            }}
          />
        </div>

        {loading ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            padding: '48px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              border: '3px solid #07A698',
              borderTop: '3px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p style={{ fontSize: '18px', color: '#07A698', fontWeight: '600', margin: '0 0 8px 0' }}>Loading students...</p>
            <p style={{ color: '#6b7280', margin: '0' }}>Please wait while we fetch the data</p>
          </div>
        ) : error ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            padding: '48px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#fef2f2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <svg style={{ width: '32px', height: '32px', color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p style={{ fontSize: '18px', color: '#ef4444', fontWeight: '600', margin: '0 0 8px 0' }}>{error}</p>
            <p style={{ color: '#6b7280', margin: '0' }}>Please try refreshing the page</p>
          </div>
        ) : (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            overflow: 'hidden'
          }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'linear-gradient(135deg, #07A698 0%, #059a8c 100%)' }}>
                    <th style={{ padding: '16px 24px', textAlign: 'left', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>Student Name</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>Email</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>Phone</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>Source</th>
                    <th style={{ padding: '16px 24px', textAlign: 'left', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: '48px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{
                            width: '64px',
                            height: '64px',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '16px'
                          }}>
                            <svg style={{ width: '32px', height: '32px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <p style={{ fontSize: '20px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>No students found</p>
                          <p style={{ color: '#6b7280', margin: '0' }}>Try adjusting your search.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, index) => (
                      <tr key={student._id || student.id} style={{ 
                        borderBottom: '1px solid #f3f4f6',
                        backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb'
                      }}>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div style={{
                              width: '40px',
                              height: '40px',
                              background: 'linear-gradient(135deg, #07A698 0%, #059a8c 100%)',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: '12px'
                            }}>
                              <span style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>
                                {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p style={{ fontWeight: '600', color: '#111827', margin: '0' }}>{student.firstName} {student.lastName}</p>
                              <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>ID: {String(student._id || student.id || '').slice(-6)}</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <svg style={{ width: '16px', height: '16px', color: '#9ca3af', marginRight: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span style={{ color: '#374151' }}>{student.email}</span>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{ color: '#374151' }}>{student.phone || student.contactNumber || '-'}</span>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            backgroundColor: (student.enrollmentFeePaid || student.isEnrolled) ? '#dcfce7' : '#e5e7eb',
                            color: (student.enrollmentFeePaid || student.isEnrolled) ? '#166534' : '#374151'
                          }}>
                            {(student.enrollmentFeePaid || student.isEnrolled) ? 'Enrolled' : 'Admin Created'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <button 
                            onClick={() => handleDelete(student._id || student.id)} 
                            style={{ 
                              padding: '6px 12px', 
                              background: '#fee2e2', 
                              color: '#b91c1c', 
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: '500',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              transition: 'all 0.2s ease',
                              ':hover': {
                                background: '#fecaca'
                              }
                            }}
                          >
                            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </DashboardLayout>
  );
}


