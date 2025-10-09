import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { FiEdit, FiTrash2, FiSave, FiX, FiCheck } from 'react-icons/fi';
import DashboardLayout from '../../../../common/DashboardLayout';
import { apiConnector } from '../../../../../services/apiConnector';
import { admin as adminApi } from '../../../../../services/apis';

const ED_TEAL = '#07A698';
const BORDER = '#e0e0e0';
const BG = '#f8f9fa';
const TEXT_DARK = '#191A1F';
const TEXT_GRAY = '#666';

export default function AllUserTypes() {
  const { token } = useSelector((s) => s.auth);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    contentManagement: false,
    trainerManagement: false
  });

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiConnector('GET', adminApi.USER_TYPES_API, null, 
        token ? { Authorization: `Bearer ${token}` } : undefined
      );
      if (res?.data?.success) {
        setItems(res.data.data || []);
      } else {
        setItems([]);
        setError('Failed to load user types');
      }
    } catch (e) {
      console.error(e);
      setError('Failed to load user types');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchAll();
  }, []);

  const handleEdit = (item) => {
    setEditingId(item._id);
    setEditForm({
      name: item.name,
      contentManagement: item.contentManagement,
      trainerManagement: item.trainerManagement
    });
  };

  const handleUpdate = async (id) => {
    try {
      const response = await apiConnector(
        'PUT',
        adminApi.UPDATE_USER_TYPE(id),
        editForm,
        { 'Authorization': `Bearer ${token}` }
      );
      
      if (response.data.success) {
        toast.success('User type updated successfully');
        setEditingId(null);
        fetchAll();
      } else {
        toast.error(response.data.message || 'Failed to update user type');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update user type');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user type?')) {
      return;
    }

    try {
      const response = await apiConnector(
        'DELETE',
        adminApi.DELETE_USER_TYPE(id),
        null,
        { 'Authorization': `Bearer ${token}` }
      );
      
      if (response.data.success) {
        toast.success('User type deleted successfully');
        fetchAll();
      } else {
        toast.error(response.data.message || 'Failed to delete user type');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user type');
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(it => (it.name || '').toLowerCase().includes(q));
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const paginatedItems = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page, limit]);

  return (
    <DashboardLayout>
      <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '20px' 
        }}>
          <h2 style={{ color: TEXT_DARK, margin: 0 }}>User Types</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              placeholder="Search user types..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: `1px solid ${BORDER}`,
                minWidth: '250px'
              }}
            />
          </div>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '8px', 
            border: `1px solid ${BORDER}`,
            overflow: 'hidden'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ 
                  backgroundColor: BG, 
                  borderBottom: `1px solid ${BORDER}`,
                  textAlign: 'left'
                }}>
                  <th style={{ padding: '12px 16px' }}>Name</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Content Management</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Trainer Management</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item) => (
                  <tr key={item._id} style={{ 
                    borderBottom: `1px solid ${BORDER}`,
                    '&:last-child': { borderBottom: 'none' }
                  }}>
                    <td style={{ padding: '12px 16px' }}>
                      {editingId === item._id ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          style={{
                            padding: '6px 8px',
                            borderRadius: '4px',
                            border: `1px solid ${BORDER}`,
                            width: '100%'
                          }}
                        />
                      ) : (
                        <div style={{ fontWeight: 500 }}>{item.name}</div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {editingId === item._id ? (
                        <input
                          type="checkbox"
                          checked={editForm.contentManagement}
                          onChange={(e) => setEditForm({...editForm, contentManagement: e.target.checked})}
                        />
                      ) : (
                        item.contentManagement ? <FiCheck color="green" /> : <FiX color="red" />
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {editingId === item._id ? (
                        <input
                          type="checkbox"
                          checked={editForm.trainerManagement}
                          onChange={(e) => setEditForm({...editForm, trainerManagement: e.target.checked})}
                        />
                      ) : (
                        item.trainerManagement ? <FiCheck color="green" /> : <FiX color="red" />
                      )}
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px 16px' }}>
                      {editingId === item._id ? (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleUpdate(item._id)}
                            style={{
                              background: ED_TEAL,
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '6px 12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <FiSave size={16} /> Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            style={{
                              background: '#6c757d',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '6px 12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <FiX size={16} /> Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleEdit(item)}
                            style={{
                              background: '#17a2b8',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '6px 12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <FiEdit size={16} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            style={{
                              background: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '6px 12px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <FiTrash2 size={16} /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && paginatedItems.length === 0 && (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            color: TEXT_GRAY,
            backgroundColor: 'white',
            borderRadius: '8px',
            border: `1px solid ${BORDER}`,
            marginTop: '20px'
          }}>
            No user types found
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginTop: '20px',
            padding: '12px 16px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: `1px solid ${BORDER}`
          }}>
            <div>
              <span>Show </span>
              <select 
                value={limit} 
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: `1px solid ${BORDER}`,
                  margin: '0 8px'
                }}
              >
                {[5, 10, 20, 50].map(num => (
                  <option key={num} value={num}>{num}</option>
                ))}
              </select>
              <span> entries</span>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '6px 12px',
                  border: `1px solid ${BORDER}`,
                  borderRadius: '4px',
                  background: 'white',
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  opacity: page === 1 ? 0.5 : 1
                }}
              >
                Previous
              </button>
              
              <div style={{ display: 'flex', gap: '4px' }}>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '4px',
                        border: `1px solid ${page === pageNum ? ED_TEAL : BORDER}`,
                        background: page === pageNum ? ED_TEAL : 'white',
                        color: page === pageNum ? 'white' : TEXT_DARK,
                        cursor: 'pointer'
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: '6px 12px',
                  border: `1px solid ${BORDER}`,
                  borderRadius: '4px',
                  background: 'white',
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  opacity: page === totalPages ? 0.5 : 1
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}