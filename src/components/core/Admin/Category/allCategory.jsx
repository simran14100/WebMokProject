import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../common/DashboardLayout";
import { apiConnector } from "../../../../services/apiConnector";
import { categories as categoryEndpoints } from "../../../../services/apis";
import { toast } from "react-hot-toast";
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

const ED_TEAL = "#07A698";
const ED_TEAL_DARK = "#059a8c";
const TEXT_DARK = "#2d3748";
const TEXT_LIGHT = "#718096";
const RED = "#e53e3e";
const RED_DARK = "#c53030";
const GRAY_LIGHT = "#f7fafc";
const GRAY_MEDIUM = "#e2e8f0";

// Styles
const styles = `
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

  .btn-cancel, .btn-delete {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
  }

  .btn-cancel {
    background-color: ${GRAY_MEDIUM};
    color: ${TEXT_DARK};
  }

  .btn-cancel:hover {
    background-color: #cbd5e0;
  }

  .btn-delete {
    background-color: ${RED};
    color: white;
  }

  .btn-delete:hover:not(:disabled) {
    background-color: ${RED_DARK};
  }

  .btn-delete:disabled, .btn-save:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .btn-save {
    background-color: ${ED_TEAL};
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
  }

  .btn-save:hover:not(:disabled) {
    background-color: ${ED_TEAL_DARK};
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid ${GRAY_MEDIUM};
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: ${TEXT_LIGHT};
    padding: 0 0.5rem;
    line-height: 1;
  }

  .close-btn:hover {
    color: ${TEXT_DARK};
  }

  .form-group {
    margin-bottom: 1.25rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: ${TEXT_DARK};
  }

  .form-group input[type="text"],
  .form-group textarea {
    width: 100%;
    padding: 0.625rem 0.75rem;
    border: 1px solid ${GRAY_MEDIUM};
    border-radius: 4px;
    font-size: 0.9375rem;
    transition: border-color 0.2s;
  }

  .form-group input[type="text"]:focus,
  .form-group textarea:focus {
    outline: none;
    border-color: ${ED_TEAL};
    box-shadow: 0 0 0 2px rgba(7, 166, 152, 0.2);
  }

  .form-group textarea {
    resize: vertical;
    min-height: 100px;
  }

  .action-btn {
    display: inline-flex;
    align-items: center;
    padding: 0.375rem 0.75rem;
    margin: 0 0.25rem;
    border: 1px solid transparent;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .action-btn.edit {
    background-color: ${ED_TEAL};
    color: white;
  }

  .action-btn.edit:hover {
    background-color: ${ED_TEAL_DARK};
  }

  .action-btn.delete {
    background-color: ${RED};
    color: white;
  }

  .action-btn.delete:hover {
    background-color: ${RED_DARK};
  }

  .table-responsive {
    overflow-x: auto;
    margin-top: 1.5rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }

  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid ${GRAY_MEDIUM};
  }

  th {
    background-color: ${GRAY_LIGHT};
    font-weight: 600;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.05em;
    color: ${TEXT_LIGHT};
  }

  tr:hover {
    background-color: ${GRAY_LIGHT};
  }

  .table-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
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

  .entries-control select {
    padding: 0.375rem 0.75rem;
    border: 1px solid ${GRAY_MEDIUM};
    border-radius: 4px;
  }

  th input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  td input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }

  .search-control input {
    padding: 0.5rem 1rem;
    border: 1px solid ${GRAY_MEDIUM};
    border-radius: 4px;
    width: 250px;
  }
`;

// Add styles to the document head
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

export default function AllCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const result = await apiConnector("GET", categoryEndpoints.CATEGORIES_API);
        if (result?.data?.data) {
          setCategories(result.data.data);
        }
      } catch (error) {
        toast.error("Could not fetch categories");
        console.error("FETCH_CATEGORIES_API ERROR............", error);
      }
      setLoading(false);
    };
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(cat =>
    (cat.name && cat.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Update selected categories when categories change
  useEffect(() => {
    setSelectedCategories(prevSelected => 
      prevSelected.filter(id => categories.some(cat => cat._id === id))
    );
  }, [categories]);

  // Handle select/deselect all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCategories(filteredCategories.map(cat => cat._id));
      setSelectAll(true);
    } else {
      setSelectedCategories([]);
      setSelectAll(false);
    }
  };

  // Handle individual category selection
  const handleSelectCategory = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        setSelectAll(false);
        return prev.filter(id => id !== categoryId);
      } else {
        const newSelected = [...prev, categoryId];
        // If all filtered categories are selected, update selectAll
        if (newSelected.length === filteredCategories.length) {
          setSelectAll(true);
        }
        return newSelected;
      }
    });
  };

  // Delete selected categories
  const deleteSelectedCategories = async () => {
    if (selectedCategories.length === 0) {
      toast.error("No categories selected");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedCategories.length} selected category(ies)?`)) {
      return;
    }

    setIsBulkDeleting(true);
    try {
      // Delete categories one by one
      for (const id of selectedCategories) {
        await apiConnector("DELETE", categoryEndpoints.DELETE_CATEGORY_API(id));
      }
      
      // Refresh the categories list
      const result = await apiConnector("GET", categoryEndpoints.CATEGORIES_API);
      if (result?.data?.data) {
        setCategories(result.data.data);
        setSelectedCategories([]);
        setSelectAll(false);
        toast.success(`${selectedCategories.length} categories deleted successfully`);
      }
    } catch (error) {
      console.error("BULK_DELETE_ERROR:", error);
      toast.error(error.response?.data?.message || "Failed to delete selected categories");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditClick = (category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      description: category.description || ''
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentCategory(null);
    setFormData({
      name: "",
      description: ""
    });
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    setIsUpdating(true);
    try {
      // Since we don't have an update endpoint, we'll delete the old one and create a new one
      // First delete the old category
      await apiConnector("DELETE", 
        categoryEndpoints.DELETE_CATEGORY_API(currentCategory._id)
      );
      
      // Then create a new one with the updated data
      const response = await apiConnector(
        "POST",
        categoryEndpoints.CREATE_CATEGORY_API,
        formData
      );
      
      if (response.data.success) {
        // Refresh the categories list
        const result = await apiConnector("GET", categoryEndpoints.CATEGORIES_API);
        if (result?.data?.data) {
          setCategories(result.data.data);
        }
        
        toast.success("Category updated successfully");
        closeEditModal();
      }
    } catch (error) {
      console.error("UPDATE_CATEGORY_ERROR:", error);
      toast.error(error.response?.data?.message || "Failed to update category");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      setIsDeleting(true);
      const response = await apiConnector(
        "DELETE", 
        categoryEndpoints.DELETE_CATEGORY_API(deleteId)
      );
      
      if (response.data.success) {
        setCategories(categories.filter(cat => cat._id !== deleteId));
        toast.success("Category deleted successfully");
      } else {
        throw new Error(response.data.message || "Failed to delete category");
      }
    } catch (error) {
      console.error("DELETE_CATEGORY_ERROR:", error);
      toast.error(error.response?.data?.message || "Failed to delete category");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setDeleteId(null);
  };

  return (
    <DashboardLayout>
      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this category? This action cannot be undone.</p>
            <div className="modal-actions">
              <button 
                onClick={cancelDelete}
                className="btn-cancel"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="btn-delete"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && closeEditModal()}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Category</h3>
              <button onClick={closeEditModal} className="close-btn">&times;</button>
            </div>
            <form onSubmit={handleUpdateCategory}>
              <div className="form-group">
                <label htmlFor="name">Category Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter category description"
                  rows="4"
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={closeEditModal}
                  className="btn-cancel"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-save"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="all-categories-container">
        <div className="category-header">
          <h2>All Categories</h2>
          <div className="breadcrumb">
            <span>Category</span>
            <span className="divider">/</span>
            <span className="active">All Categories</span>
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
              {selectedCategories.length > 0 && (
                <button 
                  className="btn-delete"
                  onClick={deleteSelectedCategories}
                  disabled={isBulkDeleting}
                >
                  {isBulkDeleting ? 'Deleting...' : `Delete Selected (${selectedCategories.length})`}
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
                      disabled={filteredCategories.length === 0}
                    />
                  </th>
                  <th>Serial No.</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center' }}>Loading...</td>
                  </tr>
                ) : filteredCategories.length > 0 ? (
                  filteredCategories.map((cat, index) => (
                    <tr key={cat._id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat._id)}
                          onChange={() => handleSelectCategory(cat._id)}
                        />
                      </td>
                      <td>{index + 1}</td>
                      <td>{cat.name}</td>
                      <td>{cat.description}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                      <div className="actions">
                        <button 
                          onClick={() => handleEditClick(cat)}
                          className="action-btn edit"
                          title="Edit Category"
                        >
                          <FiEdit2 style={{ marginRight: '4px' }} /> Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(cat._id)}
                          className="action-btn delete"
                          title="Delete Category"
                        >
                          <FiTrash2 style={{ marginRight: '4px' }} /> Delete
                        </button>
                      </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center' }}>No categories found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="table-footer">
            <div className="showing-entries">
              Showing 1 to {Math.min(entriesToShow, filteredCategories.length)} of {filteredCategories.length} entries
            </div>
          </div>
        </div>

        <style jsx>{`
          .all-categories-container {
            width: calc(100% - 250px);
            margin-left: 250px;
            padding: 2rem;
            min-height: 100vh;
            background-color: #f8fafc;
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
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          padding: 1.5rem;
          margin-top: 1.5rem;
          position: relative;
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

          .actions {
            display: flex;
            flex-direction: row;
            gap: 0.5rem;
            justify-content: center;
            align-items: center;
            white-space: nowrap;
          }

          .action-btn {
            cursor: pointer;
            padding: 0.4rem 0.75rem;
            border-radius: 4px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            font-size: 0.8rem;
            font-weight: 500;
            border: 1px solid transparent;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
            white-space: nowrap;
            min-width: 70px;
          }

          .action-btn svg {
            margin-right: 0.25rem;
            font-size: 1rem;
          }

          .action-btn.edit {
            background-color: #e8f2ff;
            color: #1a73e8;
            border-color: #d2e3fc;
          }

          .action-btn.edit:hover {
            background-color: #d2e3fc;
            transform: translateY(-1px);
          }

          .action-btn.delete {
            background-color: #ffebee;
            color: #d32f2f;
            border-color: #ffcdd2;
          }

          .action-btn.delete:hover {
            background-color: #ffcdd2;
            transform: translateY(-1px);
          }

          .action-btn + .action-btn {
            margin-left: 0.25rem;
          }

          .modal-header {
            padding: 1.25rem;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            justify-content: space-between;
            align-items: center;
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
            font-size: 1.5rem;
            cursor: pointer;
            color: #718096;
            padding: 0.25rem;
            line-height: 1;
          }

          .modal-body {
            padding: 1.5rem;
          }

          .form-group {
            margin-bottom: 1.25rem;
          }

          .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: ${TEXT_DARK};
          }

          .form-group input,
          .form-group textarea {
            width: 100%;
            padding: 0.625rem 0.875rem;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            font-size: 0.9375rem;
            transition: border-color 0.2s;
          }

          .form-group input:focus,
          .form-group textarea:focus {
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
            padding: 1rem 1.5rem;
            border-top: 1px solid #e2e8f0;
          }

          .btn-cancel,
          .btn-save,
          .btn-delete {
            padding: 0.5rem 1.25rem;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
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
            border: 1px solid ${ED_TEAL_DARK};
          }

          .btn-save:hover {
            background: ${ED_TEAL_DARK};
          }

          .btn-delete {
            background: #ef4444;
            color: white;
            border: 1px solid #dc2626;
          }

          .btn-delete:hover {
            background: #dc2626;
          }

          .btn-delete:disabled,
          .btn-save:disabled,
          .btn-cancel:disabled {
            opacity: 0.7;
            cursor: not-allowed;
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
            .all-categories-container {
              width: calc(100% - 200px);
              margin-left: 200px;
              padding: 1.5rem;
            }
          }

          @media (max-width: 768px) {
            .all-categories-container {
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
}