import React, { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiDollarSign, FiCheckCircle, FiXCircle, FiX, FiCheck, FiPlus } from 'react-icons/fi';
import { apiConnector } from '../../../../services/apiConnector';
import { fee } from '../../../../services/apis';

// Reusable Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

const FeeTypePage = () => {
  const { token, isAuthenticated } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [authChecked, setAuthChecked] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feeTypes, setFeeTypes] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedItem, setSelectedItem] = useState(null);
  const entriesPerPage = 10;

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    type: '',
    refundable: 'No',
    session: '',
    course: '',
    amount: ''
  });

  // Check authentication and fetch fee types
  const checkAuthAndFetchData = async () => {
    console.log('Checking authentication status...');
    console.log('Token exists:', !!token);
    console.log('User authenticated:', isAuthenticated);
    console.log('User data:', user);

    if (!token || !isAuthenticated) {
      console.log('No valid token found, attempting token refresh...');
      try {
        const { refreshToken } = require('../../../../services/operations/authApi');
        await refreshToken();
        // After refresh, fetch the data
        await fetchFeeTypes();
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        toast.error('Your session has expired. Please log in again.');
        // Redirect to login or handle as needed
        window.location.href = '/login';
      }
      return;
    }
    
    // If we have a valid token, fetch the data
    await fetchFeeTypes();
  };

  // Fetch fee types from API
  const fetchFeeTypes = async () => {
    if (!token) {
      console.error('No token available for API call');
      return;
    }

    try {
      setLoading(true);
      
      console.log('Fetching fee types with params:', {
        page: currentPage,
        limit: entriesPerPage,
        search: searchText
      });
      
      const response = await apiConnector(
        'GET',
        `${process.env.REACT_APP_API_URL || 'http://localhost:4001'}/api/v1/university/fee-types`,
        null,
        { 'Content-Type': 'application/json' },
        {
          page: currentPage,
          limit: entriesPerPage,
          search: searchText,
        }
      );
      
      if (response.data.success) {
        setFeeTypes(response.data.data);
        setTotalItems(response.data.pagination?.total || response.data.data?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching fee types:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        // If unauthorized, try to refresh token and retry once
        try {
          const { refreshToken } = require('../../../services/operations/authApi');
          await refreshToken();
          await fetchFeeTypes(); // Retry the request
          return;
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          toast.error('Your session has expired. Please log in again.');
          // Redirect to login or handle as needed
          return;
        }
      }
      
      toast.error(error.response?.data?.message || 'Failed to fetch fee types. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchText(e.target.value);
    setCurrentPage(1);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission for adding new fee type
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        refundable: formData.refundable === 'Yes'
      };
      
      console.log('Sending payload:', payload); // Log the payload being sent
      
      const response = await apiConnector(
        'POST',
        `${process.env.REACT_APP_API_URL || 'http://localhost:4001'}/api/v1/university/fee-types`,
        payload,
        { 'Content-Type': 'application/json' }
      );

      console.log('Response:', response.data); // Log the response
      
      if (response.data.success) {
        toast.success('Fee type added successfully');
        setShowAddModal(false);
        setFormData({
          name: '',
          category: '',
          type: '',
          refundable: 'No',
        });
        fetchFeeTypes();
      }
    } catch (error) {
      console.error('Error adding fee type:', error);
      const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error || 
                         'Failed to add fee type. Please try again.';
      
      console.error('Error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      
      toast.error(errorMessage);
    }
  };

  // Handle update fee type
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedItem) {
      toast.error('No fee type selected for update');
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        ...formData,
        refundable: formData.refundable === 'Yes'
      };

      const response = await apiConnector(
        'PUT',
        `${process.env.REACT_APP_API_URL || 'http://localhost:4001'}/api/v1/university/fee-types/${selectedItem._id}`,
        payload,
        { 'Content-Type': 'application/json' }
      );

      if (response.data.success) {
        toast.success('Fee type updated successfully');
        setShowUpdateModal(false);
        setSelectedItem(null);
        setFormData({
          name: '',
          category: '',
          type: '',
          refundable: 'No',
        });
        fetchFeeTypes();
      }
    } catch (error) {
      console.error('Error updating fee type:', error);
      toast.error(error.response?.data?.message || 'Failed to update fee type');
    }
  };

  // Handle assign fee
  const handleAssignFee = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      await apiConnector(
        'POST',
        `${process.env.REACT_APP_API_URL || 'http://localhost:4001'}/api/v1/university/fee-assignments`,
        {
          feeTypeId: selectedItem._id,
          session: formData.session,
          course: formData.course,
          amount: parseFloat(formData.amount),
          status: 'Pending'
        },
        { 'Content-Type': 'application/json' }
      );
      toast.success('Fee assigned successfully');
      setShowAssignModal(false);
      fetchFeeTypes();
      
      // Reset form data
      setFormData({
        ...formData,
        session: '',
        course: '',
        amount: ''
      });
    } catch (error) {
      console.error('Error assigning fee:', error);
      toast.error(error.response?.data?.message || 'Failed to assign fee');
    }
  };

  // Handle delete fee type
  const handleDelete = async (id) => {
    if (!id) {
      toast.error('Invalid fee type ID');
      return;
    }

    if (window.confirm('Are you sure you want to delete this fee type? This action cannot be undone.')) {
      try {
        const response = await apiConnector(
          'DELETE',
          `${process.env.REACT_APP_API_URL || 'http://localhost:4001'}/api/v1/university/fee-types/${id}`,
          null, // Explicitly pass null as bodyData
          { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        );

        if (response.data?.success) {
          toast.success('Fee type deleted successfully');
          fetchFeeTypes();
        } else {
          throw new Error(response.data?.message || 'Failed to delete fee type');
        }
      } catch (error) {
        console.error('Error deleting fee type:', error);
        const errorMessage = error.response?.data?.message || 
                           error.message || 
                           'Failed to delete fee type. Please try again.';
        toast.error(errorMessage);
      }
    }
  };

  // Set form data when editing
  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      type: item.type,
      refundable: item.refundable ? 'Yes' : 'No',
      status: item.status || 'Active',
      // Add any additional fields that need to be edited
    });
    setShowUpdateModal(true);
  };

  // Handle assign fee button click
  const handleAssignClick = (item, e) => {
    e.stopPropagation(); // Prevent event bubbling
    e.preventDefault(); // Prevent default action
    
    setSelectedItem(item);
    setFormData({
      ...formData,
      name: item.name,
      category: item.category,
      type: item.type,
      refundable: item.refundable,
      session: '',
      course: '',
      amount: ''
    });
    // Close any other open modals
    setShowAddModal(false);
    setShowUpdateModal(false);
    // Open assign modal
    setShowAssignModal(true);
  };

  // Fetch fee types on component mount and when search or page changes
  useEffect(() => {
    const init = async () => {
      console.log('Component mounted, checking auth...');
      await checkAuthAndFetchData();
      setAuthChecked(true);
    };
    
    init();
  }, [currentPage, searchText]);
  
  // Show loading state until auth check is complete
  if (!authChecked) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const totalPages = Math.ceil(totalItems / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" , marginTop: "8rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "600" }}>Manage Fee Type</h2>
        <button
          style={{
            backgroundColor: "#6a0dad",
            color: "white",
            padding: "8px 16px",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "500",
          }}
          onClick={() => setShowAddModal(true)}
        >
          + Add New
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "10px" }}>
        <input
          type="text"
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            padding: "6px 10px",
            width: "250px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </div>

     

      {/* Assign Fee Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          setSelectedItem(null);
        }}
        title="Assign Fee"
      >
        <form onSubmit={handleAssignFee} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session <span className="text-red-500">*</span>
            </label>
            <select
              name="session"
              value={formData.session || ''}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 p-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select Session</option>
              <option value="2023-24">2023-24</option>
              <option value="2024-25">2024-25</option>
              <option value="2025-26">2025-26</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course <span className="text-red-500">*</span>
            </label>
            <select
              name="course"
              value={formData.course || ''}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 p-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              <option value="">Select Course</option>
              {/* Bachelor's Degrees */}
              <optgroup label="Bachelor's Degrees">
                <option value="btech_cs">B.Tech Computer Science (4 Years)</option>
                <option value="btech_it">B.Tech Information Technology (4 Years)</option>
                <option value="btech_me">B.Tech Mechanical Engineering (4 Years)</option>
                <option value="btech_ce">B.Tech Civil Engineering (4 Years)</option>
                <option value="btech_eee">B.Tech Electrical & Electronics (4 Years)</option>
                <option value="btech_ece">B.Tech Electronics & Communication (4 Years)</option>
                <option value="bca">BCA - Bachelor of Computer Applications (3 Years)</option>
                <option value="bsc_cs">B.Sc Computer Science (3 Years)</option>
                <option value="bcom">B.Com (3 Years)</option>
                <option value="bba">BBA - Bachelor of Business Administration (3 Years)</option>
                <option value="bsc_it">B.Sc Information Technology (3 Years)</option>
                <option value="ba">BA - Bachelor of Arts (3 Years)</option>
                <option value="bsc">B.Sc (3 Years)</option>
                <option value="bpharm">B.Pharm (4 Years)</option>
                <option value="llb">LLB - Bachelor of Law (3/5 Years)</option>
              </optgroup>
              
              {/* Master's Degrees */}
              <optgroup label="Master's Degrees">
                <option value="mtech_cs">M.Tech Computer Science (2 Years)</option>
                <option value="mtech_it">M.Tech Information Technology (2 Years)</option>
                <option value="mca">MCA - Master of Computer Applications (2/3 Years)</option>
                <option value="msc_cs">M.Sc Computer Science (2 Years)</option>
                <option value="mcom">M.Com (2 Years)</option>
                <option value="mba">MBA - Master of Business Administration (2 Years)</option>
                <option value="ma">MA - Master of Arts (2 Years)</option>
                <option value="msc">M.Sc (2 Years)</option>
                <option value="mpharm">M.Pharm (2 Years)</option>
                <option value="llm">LLM - Master of Law (2 Years)</option>
              </optgroup>
              
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="number"
                name="amount"
                value={formData.amount || ''}
                onChange={handleInputChange}
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                placeholder="Enter amount"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAssignModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Assign Fee
            </button>
          </div>
        </form>
      </Modal>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "white" }}>
        <thead>
          <tr style={{ backgroundColor: "#f9f9f9", textAlign: "left" }}>
            <th style={thStyle}>Action</th>
            <th style={thStyle}>Fee Category</th>
            <th style={thStyle}>Fee Type</th>
            <th style={thStyle}>Fee Name</th>
            <th style={thStyle}>Refundable</th>
            <th style={thStyle}>Status</th>
          </tr>
        </thead>
        <tbody>
          {feeTypes.filter(item => 
            !searchText || 
            item.name.toLowerCase().includes(searchText.toLowerCase()) ||
            item.category.toLowerCase().includes(searchText.toLowerCase()) ||
            item.type.toLowerCase().includes(searchText.toLowerCase())
          ).map((item) => (
            <tr key={item.id} style={{ borderBottom: "1px solid #eee" }}>
              <td style={tdStyle}>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                    title="Edit"
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => handleAssignClick(item, e)}
                    className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-50"
                    title="Assign Fee"
                  >
                    <FiDollarSign className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50"
                    title="Delete"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
              <td style={tdStyle}>{item.category}</td>
              <td style={tdStyle}>{item.type}</td>
              <td style={tdStyle}>{item.name}</td>
              <td style={tdStyle}>{item.refundable}</td>
              <td style={tdStyle}>
                <span
                  style={{
                    backgroundColor: item.status === "Active" ? "#d4edda" : "#f8d7da",
                    color: item.status === "Active" ? "#155724" : "#721c24",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                  }}
                >
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{ marginTop: "15px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: "14px", color: '#6c757d' }}>
          Showing {Math.min(startIndex + 1, totalItems)} to {Math.min(startIndex + feeTypes.length, totalItems)} of {totalItems} entries
        </p>
        <div>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={paginationBtn}
          >
            Previous
          </button>
          <span style={{ margin: "0 10px" }}>{currentPage} / {totalPages}</span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={paginationBtn}
          >
            Next
          </button>
        </div>
      </div>

      {/* Add/Edit Fee Type Modal */}
      <Modal
        isOpen={showAddModal || showUpdateModal}
        onClose={() => {
          setShowAddModal(false);
          setShowUpdateModal(false);
          setSelectedItem(null);
          setFormData({
            name: '',
            category: '',
            type: '',
            refundable: 'No'
          });
        }}
        title={showAddModal ? 'Add New Fee Type' : 'Update Fee Type'}
      >
        <form onSubmit={showAddModal ? handleSubmit : handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fee Category <span className="text-red-500">*</span>
            </label>
            <select 
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 p-2 focus:ring-indigo-500 focus:border-indigo-500 mb-4"
              required
            >
              <option value="">-- Select Fee Category --</option>
              <option value="Course">Course</option>
              <option value="Hostel">Hostel</option>
              <option value="Transport">Transport</option>
              <option value="Miscellaneous">Miscellaneous</option>
              <option value="Other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fee Type <span className="text-red-500">*</span>
            </label>
            <select 
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 p-2 focus:ring-indigo-500 focus:border-indigo-500 mb-4"
              required
            >
              <option value="">-- Select Fee Type --</option>
              <option value="Semester Wise">Semester Wise</option>
              <option value="Yearly">Yearly</option>
              <option value="After Course">After Course</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fee Name <span className="text-red-500">*</span>
            </label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 p-2 focus:ring-indigo-500 focus:border-indigo-500 mb-4"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Refundable
            </label>
            <select 
              name="refundable"
              value={formData.refundable}
              onChange={handleInputChange}
              className="w-full rounded-md border border-gray-300 p-2 focus:ring-indigo-500 focus:border-indigo-500 mb-4"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-2">
            <button 
              type="button" 
              onClick={() => {
                setShowAddModal(false);
                setShowUpdateModal(false);
                setFormData({
                  name: '',
                  category: '',
                  type: '',
                  refundable: 'No'
                });
              }}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {showAddModal ? 'Add Fee Type' : 'Update Fee Type'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

// Styles
const thStyle = { padding: "10px", borderBottom: "2px solid #ddd", fontWeight: "600", fontSize: "14px" };
const tdStyle = { padding: "10px", fontSize: "14px" };
const paginationBtn = { padding: "5px 10px", margin: "0 2px", border: "1px solid #ccc", borderRadius: "4px", backgroundColor: "white", cursor: "pointer" };
const actionStyle = { margin: 0, padding: "5px", cursor: "pointer", fontSize: "14px" };
const modalOverlay = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" };
const modalContent = { background: "white", padding: "20px", borderRadius: "6px", width: "400px" };
const inputStyle = { display: "block", width: "100%", padding: "8px", margin: "8px 0", border: "1px solid #ccc", borderRadius: "4px" };
const closeBtn = { backgroundColor: "#dc3545", color: "white", padding: "6px 12px", marginRight: "8px", border: "none", borderRadius: "4px", cursor: "pointer" };
const submitBtn = { backgroundColor: "#6a0dad", color: "white", padding: "6px 12px", border: "none", borderRadius: "4px", cursor: "pointer" };

export default FeeTypePage;
