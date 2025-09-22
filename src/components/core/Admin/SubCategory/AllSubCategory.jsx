import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { apiConnector } from '../../../../services/apiConnector';
import { subCategory, categories } from '../../../../services/apis';
import DashboardLayout from '../../../common/DashboardLayout';
import { FiEdit2, FiTrash2, FiX, FiSave } from 'react-icons/fi';

const ED_TEAL = '#07A698';
const TEXT_DARK = '#2d3748';

const TEXT_LIGHT = '#718096';

const AllSubCategory = () => {
  const [loading, setLoading] = useState(false);
  const [subCategories, setSubCategories] = useState([]);
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentSubCategory, setCurrentSubCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategory: '',
  });
  const [allCategories, setAllCategories] = useState([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const modalRef = useRef(null);

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentSubCategory(null);
    setFormData({
      name: '',
      description: '',
      parentCategory: '',
    });
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setCurrentSubCategory(null);
  };

  const handleModalClose = (e) => {
    e.stopPropagation();
    closeEditModal();
    closeDeleteModal();
  };

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsEditModalOpen(false);
        setIsDeleteModalOpen(false);
      }
    }

    // Add event listener when modal is open
    if (isEditModalOpen || isDeleteModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditModalOpen, isDeleteModalOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isEditModalOpen || isDeleteModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isEditModalOpen, isDeleteModalOpen]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch sub-categories
        const subCatResponse = await apiConnector('GET', subCategory.SHOW_ALL_SUBCATEGORIES_API);
        setSubCategories(subCatResponse.data.data || []);
        
        // Fetch all categories for the dropdown
        const catResponse = await apiConnector('GET', categories.CATEGORIES_API);
        setAllCategories(catResponse.data.data || []);
      } catch (error) {
        console.error('Fetch data error:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch data');
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredSubCategories = subCategories.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         sub.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (sub.parentCategory?.name && sub.parentCategory.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  }).slice(0, entriesToShow);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditClick = (subCategory, e) => {
    e.stopPropagation();
    setCurrentSubCategory(subCategory);
    setFormData({
      name: subCategory.name,
      description: subCategory.description,
      parentCategory: subCategory.parentCategory?._id || '',
    });
    setIsEditModalOpen(true);
    setIsDeleteModalOpen(false);
  };

  const handleUpdateSubCategory = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.parentCategory) {
      toast.error('All fields are required');
      return;
    }

    try {
      const response = await apiConnector(
        'PUT',
        subCategory.UPDATE_SUBCATEGORY_API(currentSubCategory._id),
        formData
      );

      if (response.data.success) {
        // Update the subcategory in the list
        setSubCategories(prev => 
          prev.map(item => 
            item._id === currentSubCategory._id 
              ? { ...item, ...formData, parentCategory: allCategories.find(cat => cat._id === formData.parentCategory) }
              : item
          )
        );
        toast.success('Sub-category updated successfully');
        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error('Update sub-category error:', error);
      toast.error(error.response?.data?.message || 'Failed to update sub-category');
    }
  };

  const handleDeleteClick = (subCategory, e) => {
    e.stopPropagation();
    setCurrentSubCategory(subCategory);
    setIsDeleteModalOpen(true);
    setIsEditModalOpen(false);
  };

  const confirmDelete = async () => {
    try {
      const response = await apiConnector(
        'DELETE',
        subCategory.DELETE_SUBCATEGORY_API(currentSubCategory._id)
      );

      if (response.data.success) {
        // Remove the subcategory from the list
        setSubCategories(prev => prev.filter(item => item._id !== currentSubCategory._id));
        toast.success('Sub-category deleted successfully');
        setIsDeleteModalOpen(false);
      }
    } catch (error) {
      console.error('Delete sub-category error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete sub-category');
    }
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    if (isChecked) {
      setSelectedSubCategories(filteredSubCategories.map(item => item._id));
    } else {
      setSelectedSubCategories([]);
    }
  };

  const handleSelectSubCategory = (e, subCategoryId) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      setSelectedSubCategories(prev => [...prev, subCategoryId]);
    } else {
      setSelectedSubCategories(prev => prev.filter(id => id !== subCategoryId));
      setSelectAll(false);
    }
  };

  const deleteSelectedSubCategories = async () => {
    if (selectedSubCategories.length === 0) {
      toast.error('Please select at least one sub-category to delete');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedSubCategories.length} selected sub-category(s)?`)) {
      return;
    }

    try {
      setIsBulkDeleting(true);
      const response = await apiConnector(
        'POST',
        subCategory.BULK_DELETE_SUBCATEGORIES_API,
        { subCategoryIds: selectedSubCategories }
      );

      if (response.data.success) {
        // Remove the deleted subcategories from the list
        setSubCategories(prev => 
          prev.filter(item => !selectedSubCategories.includes(item._id))
        );
        setSelectedSubCategories([]);
        setSelectAll(false);
        toast.success(`Successfully deleted ${selectedSubCategories.length} sub-category(s)`);
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete selected sub-categories');
    } finally {
      setIsBulkDeleting(false);
    }
  };
  return (

    //     <div className="table-card">
    //       <h3>Sub-Category List</h3>
    //       <div className="table-responsive">
    //         <table>
    //           <thead>
    //             <tr>
    //               <th>Name</th>
    //               <th>Description</th>
    //               <th>Parent Category</th>
    //             </tr>
    //           </thead>
    //           <tbody>
    //             {loading ? (
    //               <tr><td colSpan="3" style={{ textAlign: 'center' }}>Loading...</td></tr>
    //             ) : subCategories.length > 0 ? (
    //               subCategories.map((sub) => (
    //                 <tr key={sub._id}>
    //                   <td>{sub.name}</td>
    //                   <td>{sub.description}</td>
    //                   <td>{sub.parentCategory?.name || 'N/A'}</td>
    //                 </tr>
    //               ))
    //             ) : (
    //               <tr><td colSpan="3" style={{ textAlign: 'center' }}>No sub-categories found.</td></tr>
    //             )}
    //           </tbody>
    //         </table>
    //       </div>
    //     </div>

    //     <style jsx>{`
    //     .category-header {
    //         margin-bottom: 2rem;
    //       }

    //       .category-header h2 {
    //         font-size: 1.5rem;
    //         font-weight: 600;
    //         color: ${TEXT_DARK};
    //         margin-bottom: 0.5rem;
    //       }

    //       .all-sub-category-container { width: calc(100% - 250px); margin-left: 250px; padding: 2rem; background-color: #f8fafc; }
    //       .header h2 { font-size: 1.5rem; font-weight: 600; color: ${TEXT_DARK}; margin-bottom: 2rem; }
    //       .table-card { background: white; border-radius: 0.5rem; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    //       h3 { font-size: 1.25rem; font-weight: 600; color: ${TEXT_DARK}; margin-bottom: 1.5rem; }
    //       table { width: 100%; border-collapse: collapse; }
    //       th, td { padding: 0.75rem 1rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
    //       th { background-color: ${ED_TEAL}; color: white; }
    //     `}</style>
    //   </div>
    // </DashboardLayout>

    <DashboardLayout>
  <div className="all-sub-category-container">
    <div className="category-header">
      <h2>All Sub Categories</h2>
      <div className="breadcrumb">
        <span>Category</span>
        <span className="divider">/</span>
        <span className="active">All Sub Categories</span>
      </div>
    </div>

    <div className="table-card">
      <div className="table-controls">
        <div className="left-controls">
          <div className="entries-control">
            <label>Show entries</label>
            <select
              value={entriesToShow}
              onChange={(e) => setEntriesToShow(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          {selectedSubCategories.length > 0 && (
            <button 
              className="delete-selected-btn"
              onClick={deleteSelectedSubCategories}
              disabled={isBulkDeleting}
            >
              {isBulkDeleting ? 'Deleting...' : `Delete Selected (${selectedSubCategories.length})`}
            </button>
          )}
        </div>
        <div className="search-control">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table>
          <thead>
            <tr>
              <th>
                <input 
                  type="checkbox" 
                  checked={selectAll} 
                  onChange={handleSelectAll} 
                />
              </th>
              <th>Serial No.</th>
              <th>Name</th>
              <th>Description</th>
              <th>Parent Category</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>Loading...</td>
              </tr>
            ) : filteredSubCategories.length > 0 ? (
              filteredSubCategories.map((sub, index) => (
                <tr key={sub._id} className={selectedSubCategories.includes(sub._id) ? 'selected' : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedSubCategories.includes(sub._id)}
                      onChange={(e) => handleSelectSubCategory(e, sub._id)}
                    />
                  </td>
                  <td>{index + 1}</td>
                  <td>{sub.name}</td>
                  <td>{sub.description}</td>
                  <td>{sub.parentCategory?.name || 'N/A'}</td>
                  <td className="actions">
                    <button 
                      className="edit-btn" 
                      onClick={(e) => handleEditClick(sub, e)}
                      title="Edit"
                      aria-label={`Edit ${sub.name}`}
                    >
                      <FiEdit2 />
                    </button>
                    <button 
                      className="delete-btn" 
                      onClick={(e) => handleDeleteClick(sub, e)}
                      title="Delete"
                      aria-label={`Delete ${sub.name}`}
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>No sub-categories found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-footer">
        <div className="showing-entries">
          Showing 1 to {filteredSubCategories.length} of {filteredSubCategories.length} entries
        </div>
        <div className="pagination">
          <button disabled className="pagination-btn">Previous</button>
          <button className="pagination-btn active">1</button>
          <button disabled className="pagination-btn">Next</button>
        </div>
      </div>
    </div>

    {/* Edit Modal */}
    {isEditModalOpen && (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Edit Sub-Category</h3>
            <button className="close-btn" onClick={closeEditModal}>
              <FiX />
            </button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleUpdateSubCategory}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Parent Category</label>
                <select
                  name="parentCategory"
                  value={formData.parentCategory}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  {allCategories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={closeEditModal}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-save"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )}

    {/* Delete Confirmation Modal */}
    {isDeleteModalOpen && (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Delete Sub-Category</h3>
            <button className="close-btn" onClick={closeDeleteModal}>
              <FiX />
            </button>
          </div>
          <div className="modal-body">
            <p>Are you sure you want to delete the sub-category "{currentSubCategory?.name}"?</p>
            <p className="warning-text">
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={closeDeleteModal}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-delete"
                onClick={confirmDelete}
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    <style jsx>{`
      /* Modal Styles */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }

      .modal-content {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        margin-top: 1.5rem;
      }

      .btn-cancel, .btn-delete, .btn-save {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
      }

      .btn-cancel {
        background: #f1f5f9;
        color: #64748b;
        border: 1px solid #e2e8f0;
      }

      .btn-cancel:hover {
        background: #e2e8f0;
      }

      .btn-save {
        background: ${ED_TEAL};
        color: white;
      }

      .btn-save:hover {
        background: #059a8c;
      }

      .btn-delete {
        background: #ef4444;
        color: white;
      }

      .btn-delete:hover {
        background: #dc2626;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #e2e8f0;
      }

      .modal-header h3 {
        margin: 0;
        font-size: 1.25rem;
        color: #1a202c;
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #718096;
        padding: 0.25rem;
      }

      .form-group {
        margin-bottom: 1.25rem;
      }

      .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #4a5568;
      }

      .form-group input,
      .form-group textarea,
      .form-group select {
        width: 100%;
        padding: 0.625rem;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        font-size: 0.9375rem;
      }

      .form-group input:focus,
      .form-group textarea:focus,
      .form-group select:focus {
        outline: none;
        border-color: ${ED_TEAL};
        box-shadow: 0 0 0 3px rgba(7, 166, 152, 0.1);
      }

      .form-group textarea {
        min-height: 100px;
        resize: vertical;
      }

      .warning-text {
        color: #e53e3e;
        font-size: 0.875rem;
        margin-top: 0.5rem;
      }

      /* Main Container */
      .all-sub-category-container {
        width: calc(100% - 250px);
        margin-left: 250px;
        padding: 2rem;
        min-height: 100vh;
        background-color: #f8fafc;
      }

      /* Table Controls */
      .table-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .left-controls {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .entries-control {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .entries-control label {
        font-size: 0.875rem;
        color: ${TEXT_DARK};
      }

      .entries-control select {
        padding: 0.5rem;
        border: 1px solid #e2e8f0;
        border-radius: 0.375rem;
        font-size: 0.875rem;
      }

      .delete-selected-btn {
        background-color: #f56565;
        color: white;
        border: none;
        border-radius: 0.375rem;
        padding: 0.5rem 1rem;
        font-size: 0.875rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: background-color 0.2s;
      }

      .delete-selected-btn:hover {
        background-color: #e53e3e;
      }

      .delete-selected-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      .search-control input {
        padding: 0.5rem 1rem;
        border: 1px solid #e2e8f0;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        min-width: 250px;
      }

      /* Table Styles */
      .table-responsive {
        overflow-x: auto;
        margin-bottom: 1.5rem;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        border-radius: 0.5rem;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      th, td {
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid #edf2f7;
      }

      th {
        background-color: ${ED_TEAL};
        color: white;
        font-weight: 500;
      }

      tr:hover {
        background-color: #f8fafc;
      }

      tr.selected {
        background-color: #ebf8ff;
      }

      .actions {
        display: flex;
        gap: 0.5rem;
        justify-content: flex-end;
      }

      .edit-btn, .delete-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 0.25rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .edit-btn {
        color: #3182ce;
      }

      .edit-btn:hover {
        background-color: #ebf8ff;
      }

      .delete-btn {
        color: #e53e3e;
      }

      .delete-btn:hover {
        background-color: #fff5f5;
      }

      /* Modal Styles */
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 20px;
      }

      .modal {
        background: white;
        border-radius: 0.5rem;
        width: 100%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        position: relative;
        z-index: 10000;
      }

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.25rem 1.5rem;
        border-bottom: 1px solid #e2e8f0;
      }

      .modal-header h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
        color: ${TEXT_DARK};
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 1.25rem;
        cursor: pointer;
        color: #a0aec0;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.25rem;
        border-radius: 0.25rem;
      }

      .close-btn:hover {
        background-color: #f7fafc;
        color: #718096;
      }

      .form-group {
        margin-bottom: 1.25rem;
        padding: 0 1.5rem;
      }

      .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: ${TEXT_DARK};
      }

      .form-group input,
      .form-group textarea,
      .form-group select {
        width: 100%;
        padding: 0.625rem 0.875rem;
        border: 1px solid #e2e8f0;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        transition: border-color 0.2s, box-shadow 0.2s;
      }

      .form-group input:focus,
      .form-group textarea:focus,
      .form-group select:focus {
        outline: none;
        border-color: ${ED_TEAL};
        box-shadow: 0 0 0 3px rgba(7, 166, 152, 0.1);
      }

      .form-group textarea {
        min-height: 100px;
        resize: vertical;
      }

      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        padding: 1.25rem 1.5rem;
        border-top: 1px solid #e2e8f0;
        background-color: #f8fafc;
        border-radius: 0 0 0.5rem 0.5rem;
      }

      .cancel-btn,
      .save-btn,
      .delete-confirm-btn {
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .cancel-btn {
        background-color: #e2e8f0;
        color: #4a5568;
        border: 1px solid #cbd5e0;
      }

      .cancel-btn:hover {
        background-color: #cbd5e0;
      }

      .save-btn {
        background-color: ${ED_TEAL};
        color: white;
        border: 1px solid ${ED_TEAL};
      }

      .save-btn:hover {
        background-color: #059669;
        border-color: #059669;
      }

      .delete-confirm-btn {
        background-color: #e53e3e;
        color: white;
        border: 1px solid #e53e3e;
      }

      .delete-confirm-btn:hover {
        background-color: #c53030;
        border-color: #c53030;
      }

      .warning-text {
        color: #e53e3e;
        font-size: 0.875rem;
        margin-top: 0.5rem;
        font-weight: 500;
      }

      /* Delete Modal Specific */
      .delete-modal .modal-body {
        padding: 1.5rem;
      }

      .delete-modal p {
        margin: 0 0 0.5rem;
        color: ${TEXT_DARK};
      }

      /* Responsive */
      @media (max-width: 768px) {
        .all-sub-category-container {
          width: 100%;
          margin-left: 0;
          padding: 1rem;
        }

        .table-controls {
          flex-direction: column;
          align-items: stretch;
        }

        .left-controls {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .entries-control {
          width: 100%;
          justify-content: space-between;
        }

        .search-control input {
          width: 100%;
        }

        .modal {
          margin: 1rem;
          max-width: calc(100% - 2rem);
        }
      }

      .category-header {
        margin-bottom: 2rem;
      }

      .category-header h2 {
        font-size: 1.5rem;
        font-weight: 600;
        color: ${TEXT_DARK};
        margin-bottom: 0.5rem;
      }

      .breadcrumb {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.875rem;
        color: ${TEXT_LIGHT};
      }

      .divider {
        color: #cbd5e0;
      }

      .active {
        color: ${ED_TEAL};
        font-weight: 500;
      }

      .table-card {
        background: white;
        border-radius: 0.5rem;
        padding: 1.5rem;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .table-controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .entries-control {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .entries-control label {
        font-size: 0.875rem;
        color: ${TEXT_DARK};
      }

      .entries-control select {
        padding: 0.5rem;
        border: 1px solid #e2e8f0;
        border-radius: 0.375rem;
        font-size: 0.875rem;
      }

      .search-control input {
        padding: 0.5rem 1rem;
        border: 1px solid #e2e8f0;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        min-width: 200px;
      }

      .table-responsive {
        overflow-x: auto;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.875rem;
      }

      th {
        background-color: ${ED_TEAL};
        color: white;
        padding: 0.75rem 1rem;
        text-align: left;
        font-weight: 500;
      }

      td {
        padding: 0.75rem 1rem;
        border-bottom: 1px solid #e2e8f0;
        color: ${TEXT_DARK};
      }

      tr:hover {
        background-color: #f8fafc;
      }

      .table-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #e2e8f0;
      }

      .showing-entries {
        font-size: 0.875rem;
        color: ${TEXT_LIGHT};
      }

      .pagination {
        display: flex;
        gap: 0.5rem;
      }

      .pagination-btn {
        padding: 0.5rem 1rem;
        border: 1px solid #e2e8f0;
        border-radius: 0.375rem;
        background-color: white;
        color: ${TEXT_DARK};
        cursor: pointer;
        font-size: 0.875rem;
        transition: background-color 0.2s, color 0.2s;
      }

      .pagination-btn:hover {
        background-color: #f1f5f9;
      }

      .pagination-btn.active {
        background-color: ${ED_TEAL};
        color: white;
        border-color: ${ED_TEAL};
      }

      .pagination-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      @media (max-width: 1024px) {
        .all-sub-category-container {
          width: calc(100% - 200px);
          margin-left: 200px;
          padding: 1.5rem;
        }
      }

      @media (max-width: 768px) {
        .all-sub-category-container {
          width: 100%;
          margin-left: 0;
          padding: 1rem;
        }

        .table-card {
          padding: 1rem;
        }

        .table-controls {
          flex-direction: column;
          align-items: flex-start;
        }

        .search-control input {
          width: 100%;
        }

        .table-footer {
          flex-direction: column;
          gap: 1rem;
          align-items: flex-start;
        }
      }
    `}</style>
  </div>
</DashboardLayout>
  );
};

export default AllSubCategory;



