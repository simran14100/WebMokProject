import React, { useState, useEffect, useCallback } from "react";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';

const API_URL = "http://localhost:4000/api/v1/visit-purposes";

export default function VisitPurpose() {
  const ED_TEAL = "#14b8a6";
  const BORDER = "#e5e7eb";
  const TEXT = "#334155";
  
  // State declarations at the top of the component
  const { token } = useSelector((state) => state.auth);
  
  // Log token for debugging
  useEffect(() => {
    console.log('Current token:', token ? 'Token exists' : 'No token');
  }, [token]);
  const [purposes, setPurposes] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true
  });
  const [searchTerm, setSearchTerm] = useState("");
  
  // Define fetchPurposes function with useCallback
  const fetchPurposes = useCallback(async () => {
    console.log('Starting fetchPurposes');
    if (!token) {
      console.log('No token available, skipping fetch');
      return;
    }

    try {
      console.log('Setting loading to true');
      setIsLoading(true);
      
      console.log('Making fetch request to:', API_URL);
      const response = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log('Got response, status:', response.status);
      const responseData = await response.json().catch(err => {
        console.error('Error parsing JSON:', err);
        return [];
      });
      
      console.log('Response data:', responseData);
      
      if (!response.ok) {
        const errorMsg = (responseData && responseData.message) || 'Failed to load visit purposes';
        console.error('API Error:', errorMsg);
        throw new Error(errorMsg);
      }
      
      // Handle both response formats: { data: [...] } and [...]
      const purposesData = Array.isArray(responseData) 
        ? responseData 
        : (responseData.data || []);
      
      if (!Array.isArray(purposesData)) {
        console.error('Unexpected data format:', responseData);
        throw new Error('Expected an array of purposes but got something else');
      }
      
      console.log(`Successfully fetched ${purposesData.length} purposes`);
      setPurposes(purposesData);
      
    } catch (error) {
      console.error('Error in fetchPurposes:', error);
      toast.error(error.message || 'Failed to load visit purposes');
    } finally {
      console.log('Setting loading to false');
      setIsLoading(false);
    }
  }, [token]); // Add token as dependency

  // Fetch purposes when component mounts and when token changes
  useEffect(() => {
    console.log('useEffect triggered', { hasToken: !!token });
    fetchPurposes();
    
    // Cleanup function
    return () => {
      console.log('Cleaning up fetchPurposes effect');
    };
  }, [token]); // Removed fetchPurposes from dependencies to prevent infinite loops

  // Log modal state changes for debugging
  useEffect(() => {
    console.log('Modal state changed:', modalOpen);
  }, [modalOpen]);

  const filteredPurposes = purposes.filter(purpose =>
    (purpose.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (purpose.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission started', { formData, editingId });
    
    // Validate form data
    const name = formData.name?.trim();
    if (!name) {
      toast.error('Purpose name is required');
      return;
    }

    const maxRetries = 3;
    let retryCount = 0;
    let lastError = null;

    try {
      while (retryCount < maxRetries) {
        try {
          setIsSubmitting(true);
          
          const url = editingId ? `${API_URL}/${editingId}` : API_URL;
          const method = editingId ? 'PUT' : 'POST';
          
          const requestBody = {
            name: name,
            description: formData.description?.trim() || '',
            isActive: Boolean(formData.isActive)
          };
          
          console.log(`Attempt ${retryCount + 1}/${maxRetries} - Sending request to:`, url);
          
          const response = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            },
            body: JSON.stringify(requestBody)
          });
          
          const responseData = await response.json().catch(() => ({}));
          console.log('Response status:', response.status);
          console.log('Response data:', responseData);
          
          if (!response.ok) {
            // Handle duplicate name error
            if (response.status === 400 && responseData.message && 
                (responseData.message.includes('already exists') || 
                responseData.message === 'A visit purpose with this name already exists')) {
              throw new Error('A visit purpose with this name already exists');
            }
            throw new Error(responseData.message || `Request failed with status ${response.status}`);
          }
          
          // Success case
          toast.success(editingId ? 'Purpose updated successfully' : 'Purpose created successfully');
          
          // Reset form and close modal
          setFormData({ name: "", description: "", isActive: true });
          setEditingId(null);
          setModalOpen(false);
          
          // Refresh the list
          await fetchPurposes();
          return; // Exit on success
          
        } catch (error) {
          lastError = error;
          console.error(`Attempt ${retryCount + 1} failed:`, error);
          
          if (error.name === 'AbortError' || error.message.includes('timeout')) {
            console.warn('Request timed out, retrying...');
          }
          
          // Don't retry for validation errors
          if (error.message.includes('already exists')) {
            throw error; // Will be caught by outer try-catch
          }
          
          // Add delay before retry
          if (retryCount < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          }
          
          retryCount++;
        }
      }
      
      // If we get here, all retries failed
      throw new Error(lastError?.message || 'Failed to save purpose after multiple attempts');
      
    } catch (error) {
      console.error('Form submission failed:', error);
      toast.error(error.message || 'Failed to save purpose. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddNew = () => {
    console.log('Add new button clicked');
    setFormData({
      name: "",
      description: "",
      isActive: true
    });
    setEditingId(null);
    setModalOpen(true);
  };

  const handleEdit = (purpose) => {
    console.log('Editing purpose:', purpose);
    setFormData({
      name: purpose.name,
      description: purpose.description || '',
      isActive: purpose.isActive
    });
    setEditingId(purpose._id);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this purpose?')) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete purpose');
      }
      
      toast.success('Purpose deleted successfully');
      fetchPurposes();
      
    } catch (error) {
      console.error('Error deleting purpose:', error);
      toast.error(error.message || 'Failed to delete purpose');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle active status
  const toggleStatus = async (id, currentStatus) => {
    try {
      setIsSubmitting(true);
      
      const response = await fetch(`${API_URL}/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update status');
      }
      
      const message = data?.data?.isActive ? 'activated' : 'deactivated';
      toast.success(`Purpose ${message} successfully`);
      fetchPurposes();
      
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error(error.message || 'Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && purposes.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        fontFamily: 'sans-serif'
      }}>
        <div>Loading visit purposes...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif", marginTop: "11rem" }}>
      <div style={{ 
        background: "#fff", 
        border: `1px solid ${BORDER}`, 
        borderRadius: 12, 
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)", 
        padding: 20
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, color: TEXT, marginLeft: "120px" }}>Manage Visit Purposes</h3>
          <button 
            onClick={handleAddNew}
            style={{ 
              background: ED_TEAL, 
              color: "#fff", 
              border: `1px solid ${ED_TEAL}`, 
              padding: "8px 16px", 
              borderRadius: 8,
              cursor: "pointer",
              marginRight: "120px"
            }}
          >
            + Add New Purpose
          </button>
        </div>

        {/* Search */}
        <div style={{ margin: "20px 120px" }}>
          <div style={{ maxWidth: "400px" }}>
            <input
              type="text"
              placeholder="Search purposes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 15px",
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                fontSize: "14px"
              }}
            />
          </div>
        </div>

        {/* Purpose Table */}
        <div style={{ margin: "0 120px" }}>
          <div style={{ 
            border: `1px solid ${BORDER}`, 
            borderRadius: 8,
            overflow: "hidden"
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ 
                  background: ED_TEAL,
                  color: "#fff",
                  textAlign: 'left'
                }}>
                  <th style={{ padding: "12px 16px", fontWeight: 500 }}>Purpose Name</th>
                  <th style={{ padding: "12px 16px", fontWeight: 500 }}>Description</th>
                  <th style={{ padding: "12px 16px", fontWeight: 500, textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurposes.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ 
                      padding: "20px", 
                      textAlign: "center", 
                      color: TEXT,
                      borderBottom: `1px solid ${BORDER}`
                    }}>
                      No visit purposes found
                    </td>
                  </tr>
                ) : (
                  filteredPurposes.map((purpose) => (
                    <tr key={purpose._id}>
                      <td style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, color: TEXT }}>
                        {purpose.name}
                      </td>
                      <td style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, color: TEXT }}>
                        {purpose.description || "-"}
                      </td>
                      <td style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, textAlign: "center" }}>
                        <span 
                          style={{
                            background: purpose.isActive ? "#e8f5e9" : "#ffebee",
                            color: purpose.isActive ? "#2e7d32" : "#c62828",
                            padding: "4px 8px",
                            borderRadius: 12,
                            fontSize: 12,
                            fontWeight: 500,
                            marginRight: 12
                          }}
                        >
                          {purpose.isActive ? "Active" : "Inactive"}
                        </span>
                        <button 
                          onClick={() => toggleStatus(purpose._id, purpose.isActive)}
                          style={{
                            background: purpose.isActive ? "#ffebee" : "#e8f5e9",
                            color: purpose.isActive ? "#c62828" : "#2e7d32",
                            border: "none",
                            padding: "4px 12px",
                            borderRadius: 4,
                            marginRight: 8,
                            cursor: "pointer",
                            fontSize: 13
                          }}
                        >
                          {purpose.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button 
                          onClick={() => handleEdit(purpose)}
                          style={{
                            background: "transparent",
                            border: `1px solid ${ED_TEAL}`,
                            color: ED_TEAL,
                            padding: "4px 12px",
                            borderRadius: 4,
                            marginRight: 8,
                            cursor: "pointer",
                            fontSize: 13
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(purpose._id)}
                          style={{
                            background: "#f44336",
                            border: "1px solid #f44336",
                            color: "#fff",
                            padding: "4px 12px",
                            borderRadius: 4,
                            cursor: "pointer",
                            fontSize: 13
                          }}
                        >
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
      </div>

      {/* Modal */}
      {console.log('Rendering modal with open state:', modalOpen) || modalOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "#fff",
            borderRadius: 8,
            padding: 24,
            width: "100%",
            maxWidth: 500,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
          }}>
            <h3 style={{ marginTop: 0, color: TEXT }}>
              {editingId ? "Edit Visit Purpose" : "Add New Visit Purpose"}
            </h3>
            
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: 500,
                  color: TEXT
                }}>
                  Purpose Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 4,
                    fontSize: 14
                  }}
                  required
                />
              </div>
              
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: 500,
                  color: TEXT
                }}>
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    minHeight: 80,
                    padding: "8px 12px",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 4,
                    fontSize: 14,
                    resize: "vertical"
                  }}
                />
              </div>

              {editingId && (
                <div style={{ 
                  marginBottom: 24,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    style={{
                      width: 16,
                      height: 16,
                      cursor: 'pointer'
                    }}
                  />
                  <label 
                    htmlFor="isActive"
                    style={{
                      color: TEXT,
                      fontSize: 14,
                      cursor: 'pointer'
                    }}
                  >
                    Active
                  </label>
                </div>
              )}
              
              <div style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setFormData({ name: "", description: "", isActive: true });
                    setEditingId(null);
                    setModalOpen(false);
                  }}
                  style={{
                    background: "#fff",
                    border: `1px solid ${BORDER}`,
                    color: TEXT,
                    padding: "8px 16px",
                    borderRadius: 4,
                    cursor: "pointer"
                  }}
    disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    background: ED_TEAL,
                    border: `1px solid ${ED_TEAL}`,
                    color: "#fff",
                    padding: "8px 16px",
                    borderRadius: 4,
                    cursor: "pointer",
                    opacity: isSubmitting ? 0.7 : 1,
                    pointerEvents: isSubmitting ? 'none' : 'auto'
                  }}
    disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : editingId ? 'Update' : 'Add'} Purpose
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>

    
  );
}
