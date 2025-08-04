import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { apiConnector } from '../services/apiConnector';
import { categories as categoriesApi } from '../services/apis';
import { toast } from 'react-hot-toast';
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

const Categories = () => {
  const { token } = useSelector((state) => state.auth);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'create', 'edit', 'delete'
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: ''
  });

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

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchQuery && { search: searchQuery })
      });

      const response = await apiConnector(
        'GET',
        `${categoriesApi.CATEGORIES_API}?${params}`,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        setCategories(response.data.data.categories || response.data.data || []);
        setTotalPages(response.data.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiConnector(
        'GET',
        categoriesApi.GET_CATEGORY_STATS_API || '/api/v1/categories/stats',
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
    fetchCategories();
    fetchStats();
  }, [currentPage, searchQuery]);

  const handleCreateCategory = async () => {
    try {
      const response = await apiConnector(
        'POST',
        categoriesApi.CREATE_CATEGORY_API || '/api/v1/categories',
        formData,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        toast.success('Category created successfully');
        setShowModal(false);
        setFormData({ name: '', description: '', icon: '' });
        fetchCategories();
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
    }
  };

  const handleUpdateCategory = async () => {
    try {
      const response = await apiConnector(
        'PUT',
        `${categoriesApi.UPDATE_CATEGORY_API || '/api/v1/categories'}/${selectedCategory._id}`,
        formData,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        toast.success('Category updated successfully');
        setShowModal(false);
        setFormData({ name: '', description: '', icon: '' });
        setSelectedCategory(null);
        fetchCategories();
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
    }
  };

  const handleDeleteCategory = async () => {
    try {
      const response = await apiConnector(
        'DELETE',
        `${categoriesApi.DELETE_CATEGORY_API || '/api/v1/categories'}/${selectedCategory._id}`,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      if (response.data.success) {
        toast.success('Category deleted successfully');
        setShowModal(false);
        setSelectedCategory(null);
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  const openModal = (category, type) => {
    setSelectedCategory(category);
    setModalType(type);
    setShowModal(true);
    if (type === 'edit' && category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        icon: category.icon || ''
      });
    } else {
      setFormData({ name: '', description: '', icon: '' });
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      Active: {
        background: 'rgba(16, 185, 129, 0.1)',
        color: SUCCESS_GREEN,
        border: `1px solid ${SUCCESS_GREEN}`
      },
      Inactive: {
        background: 'rgba(239, 68, 68, 0.1)',
        color: ERROR_RED,
        border: `1px solid ${ERROR_RED}`
      }
    };

    const style = statusStyles[status] || statusStyles.Active;

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
  if (loading && categories.length === 0) {
    return (
      <DashboardLayout>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: 'calc(100vh - 200px)',
          background: BG 
        }}>
          <div style={{ textAlign: 'center', color: ED_TEAL, fontWeight: 600, fontSize: 20 }}>
            <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
            Loading categories...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ 
        width: '100%', 
        maxWidth: 1400, 
        margin: '0 auto', 
        marginLeft: '250px',
        padding: '32px 24px',
        overflowX: 'hidden'
      }}>
        {/* Page Heading */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '48px',
          marginTop: '-16px',
          color: ED_TEAL,
          fontWeight: '700',
          fontSize: '36px',
          letterSpacing: '-0.5px'
        }}>
          Manage Categories
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
              background: INFO_BLUE
            }}></div>
            <div style={{ color: TEXT_GRAY, fontSize: '14px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Categories
            </div>
            <div style={{ color: INFO_BLUE, fontSize: '32px', fontWeight: '700' }}>
              {stats.totalCategories || categories.length || 0}
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
              Active Categories
            </div>
            <div style={{ color: SUCCESS_GREEN, fontSize: '32px', fontWeight: '700' }}>
              {stats.activeCategories || categories.filter(cat => cat.active !== false).length || 0}
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
              background: WARNING_YELLOW
            }}></div>
            <div style={{ color: TEXT_GRAY, fontSize: '14px', fontWeight: '600', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Courses
            </div>
            <div style={{ color: WARNING_YELLOW, fontSize: '32px', fontWeight: '700' }}>
              {stats.totalCourses || 0}
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
              Today's Additions
            </div>
            <div style={{ color: ED_TEAL, fontSize: '32px', fontWeight: '700' }}>
              {stats.todayAdditions || 0}
            </div>
          </div>
        </div>

        {/* Search and Actions */}
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
                placeholder="Search categories..."
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
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => openModal(null, 'create')}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#fff',
                  background: ED_TEAL,
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = ED_TEAL_DARK;
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = ED_TEAL;
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                Add Category
              </button>
            </div>
          </div>
        </div>

        {/* Categories Table */}
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
                    Category
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
                    Description
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
                    Created Date
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
                    <td colSpan="5" style={{ 
                      padding: '40px 24px', 
                      textAlign: 'center', 
                      color: TEXT_GRAY,
                      fontSize: '16px'
                    }}>
                      <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
                      Loading categories...
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ 
                      padding: '40px 24px', 
                      textAlign: 'center', 
                      color: TEXT_GRAY,
                      fontSize: '16px'
                    }}>
                      No categories found
                    </td>
                  </tr>
                ) : (
                  categories.map((category, index) => (
                    <tr key={category._id} style={{ 
                      borderBottom: index < categories.length - 1 ? `1px solid ${BORDER}` : 'none',
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
                            {category.name}
                          </div>
                          {category.icon && (
                            <div style={{ 
                              fontSize: '13px', 
                              color: TEXT_GRAY 
                            }}>
                              Icon: {category.icon}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ 
                          fontSize: '13px', 
                          color: TEXT_GRAY,
                          maxWidth: '200px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {category.description || 'No description'}
                        </div>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        {getStatusBadge(category.active !== false ? 'Active' : 'Inactive')}
                      </td>
                      <td style={{ 
                        padding: '20px 24px', 
                        fontSize: '13px', 
                        color: TEXT_GRAY 
                      }}>
                        {formatDate(category.createdAt)}
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => openModal(category, 'edit')}
                            style={{
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: WARNING_YELLOW,
                              background: 'rgba(245, 158, 11, 0.1)',
                              border: `1px solid ${WARNING_YELLOW}`,
                              borderRadius: '6px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = WARNING_YELLOW;
                              e.target.style.color = '#fff';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'rgba(245, 158, 11, 0.1)';
                              e.target.style.color = WARNING_YELLOW;
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => openModal(category, 'delete')}
                            style={{
                              padding: '6px 12px',
                              fontSize: '12px',
                              fontWeight: '600',
                              color: ERROR_RED,
                              background: 'rgba(239, 68, 68, 0.1)',
                              border: `1px solid ${ERROR_RED}`,
                              borderRadius: '6px',
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
      </div>

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
              {modalType === 'create' ? 'Create Category' : 
               modalType === 'edit' ? 'Edit Category' : 
               modalType === 'delete' ? 'Delete Category' : 'Category Details'}
            </h3>
            
            {modalType === 'delete' ? (
              <div>
                <p style={{
                  fontSize: '16px',
                  color: TEXT_DARK,
                  marginBottom: '24px',
                  textAlign: 'center'
                }}>
                  Are you sure you want to delete "{selectedCategory?.name}"? This action cannot be undone.
                </p>
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
                    onClick={handleDeleteCategory}
                    style={{
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#fff',
                      background: ERROR_RED,
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#dc2626';
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = ERROR_RED;
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: TEXT_DARK,
                    marginBottom: '8px'
                  }}>
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                    placeholder="Enter category name"
                  />
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: TEXT_DARK,
                    marginBottom: '8px'
                  }}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                    placeholder="Enter category description"
                  />
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: TEXT_DARK,
                    marginBottom: '8px'
                  }}>
                    Icon (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
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
                    placeholder="Enter icon name or class"
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
                    onClick={modalType === 'create' ? handleCreateCategory : handleUpdateCategory}
                    style={{
                      padding: '12px 24px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#fff',
                      background: ED_TEAL,
                      border: 'none',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = ED_TEAL_DARK;
                      e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = ED_TEAL;
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    {modalType === 'create' ? 'Create' : 'Update'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Categories; 