
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { FaSpinner, FaFilePdf, FaFileWord, FaFileExcel } from 'react-icons/fa';
import { FiDownload, FiFile, FiTrash2, FiUpload, FiImage, FiFileText } from 'react-icons/fi';
import { setLoading } from '../../store/slices/profileSlice';

const API_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:4000/api/v1';

const DocumentUpload = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const { loading } = useSelector((state) => state.profile);
  const dispatch = useDispatch();

  // Fetch user's documents on component mount
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      dispatch(setLoading(true));
      console.log('Fetching documents...');
      const response = await fetch(`${API_BASE_URL}/api/v1/documents/my-documents`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log('Documents API response:', data);
      
      if (data.success) {
        console.log(`Found ${data.count} documents`);
        setDocuments(Array.isArray(data.documents) ? data.documents : []);
      } else {
        throw new Error(data.message || 'Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error(error.message || 'Error loading documents');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!allowedTypes.includes(file.type)) {
        toast.error('Invalid file type. Please upload PDF, Word, Excel, or image files only.');
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('document', selectedFile);

    try {
      dispatch(setLoading(true));
      setUploadProgress(0);

      const xhr = new XMLHttpRequest();
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.open('POST', `${API_BASE_URL}/api/v1/documents/upload`, true);
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      
      xhr.onload = async () => {
        try {
          const response = JSON.parse(xhr.responseText);
          if (xhr.status === 201) {
            toast.success('Document uploaded successfully');
            setSelectedFile(null);
            document.getElementById('file-upload').value = '';
            await fetchDocuments();
          } else {
            throw new Error(response.message || 'Upload failed');
          }
        } catch (error) {
          console.error('Upload error:', error);
          toast.error(error.message || 'Error uploading document');
        } finally {
          setUploadProgress(0);
          dispatch(setLoading(false));
        }
      };

      xhr.onerror = () => {
        toast.error('Network error. Please try again.');
        setUploadProgress(0);
        dispatch(setLoading(false));
      };

      xhr.send(formData);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Error uploading document');
      setUploadProgress(0);
      dispatch(setLoading(false));
    }
  };

  const handleDelete = async (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        dispatch(setLoading(true));
        const response = await fetch(
          `${API_BASE_URL}/api/v1/documents/${documentId}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        if (data.success) {
          toast.success('Document deleted successfully');
          await fetchDocuments();
        } else {
          throw new Error(data.message || 'Failed to delete document');
        }
      } catch (error) {
        console.error('Delete error:', error);
        toast.error(error.message || 'Error deleting document');
      } finally {
        dispatch(setLoading(false));
      }
    }
  };

  const getFileIcon = (fileType) => {
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return <FaFilePdf className="w-5 h-5 text-red-500" />;
    if (type.includes('word') || type.includes('msword') || type.includes('wordprocessingml')) 
      return <FaFileWord className="w-5 h-5 text-blue-500" />;
    if (type.includes('excel') || type.includes('spreadsheetml')) 
      return <FaFileExcel className="w-5 h-5 text-green-500" />;
    if (type.includes('image') || ['jpg', 'png', 'jpeg'].includes(type)) 
      return <FiImage className="w-5 h-5 text-purple-500" />;
    return <FiFileText className="w-5 h-5 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Pending' },
      approved: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
      verified: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Verified' },
      processing: { bg: 'bg-sky-100', text: 'text-sky-800', label: 'Processing' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (

    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f9fafb",
      padding: "2rem 0"
    }}>
      <div style={{
        maxWidth: "1400px", // Increased width
        margin: "0 auto",
        padding: "0 1.5rem" // Increased padding
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "2.5rem", // Increased gap
          alignItems: "start"
        }}>
          {/* Main Content Area */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "2rem" // Increased gap
          }}>
            {/* Header */}
            <div style={{
              backgroundColor: "#ffffff",
              borderRadius: "1rem",
              padding: "2rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              border: "1px solid #e2e8f0"
            }}>
              <h1 style={{
                fontSize: "2.25rem", // Larger font
                fontWeight: "bold",
                color: "#1e293b",
                marginBottom: "0.75rem",
                background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}>Document Upload</h1>
              <p style={{
                color: "#64748b",
                fontSize: "1.125rem", // Larger font
                lineHeight: "1.6",
                maxWidth: "600px"
              }}>Upload and manage your verification documents securely with our advanced document management system</p>
            </div>
    
            {/* Upload Box */}
            <div style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "1rem", // Larger border radius
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              overflow: "hidden"
            }}>
              <div style={{
                padding: "1.5rem 2rem", // Increased padding
                borderBottom: "1px solid #e2e8f0",
                background: "linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)"
              }}>
                <h2 style={{
                  fontSize: "1.5rem", // Larger font
                  fontWeight: 700,
                  color: "#1e293b",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem"
                }}>
                  <span style={{ 
                    fontSize: "1.75rem",
                    background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text"
                  }}>📤</span>
                  Upload New Document
                </h2>
              </div>
              
              <div style={{ padding: "2rem" }}> {/* Increased padding */}
                <div style={{
                  border: "3px dashed #d1d5db", // Thicker border
                  borderRadius: "1rem",
                  padding: "3rem 2rem", // Increased padding
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  background: "linear-gradient(135deg, #fafbff 0%, #f8fafc 100%)"
                }}>
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "1.5rem" // Increased gap
                  }}>
                    <div style={{
                      width: "5rem", // Larger icon
                      height: "5rem",
                      backgroundColor: "#dbeafe",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.3)"
                    }}>
                      <span style={{ fontSize: "2.5rem" }}>📁</span>
                    </div>
                    
                    <div style={{ color: "#64748b" }}>
                      <label
                        htmlFor="file-upload"
                        style={{
                          position: "relative",
                          cursor: "pointer",
                          background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                          borderRadius: "0.75rem",
                          padding: "0.75rem 1.5rem",
                          fontWeight: 600,
                          color: "#ffffff",
                          display: "inline-block",
                          marginBottom: "0.75rem",
                          boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.4)",
                          transition: "all 0.3s ease"
                        }}
                        onMouseOver={(e) => {
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow = "0 6px 8px -1px rgba(59, 130, 246, 0.5)";
                        }}
                        onMouseOut={(e) => {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "0 4px 6px -1px rgba(59, 130, 246, 0.4)";
                        }}
                      >
                        <span>Choose a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          style={{ display: "none" }}
                          onChange={handleFileChange}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                        />
                      </label>
                      <p style={{ 
                        margin: "0.75rem 0 0 0", 
                        color: "#6b7280",
                        fontSize: "1rem"
                      }}>or drag and drop files here</p>
                    </div>
                    
                    <p style={{
                      fontSize: "0.95rem",
                      color: "#9ca3af",
                      maxWidth: "400px",
                      lineHeight: "1.5"
                    }}>
                      Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF
                      <br />
                      Maximum file size: 5MB
                    </p>
                    
                    {selectedFile && (
                      <div style={{
                        marginTop: "1.5rem",
                        padding: "1rem 1.5rem",
                        backgroundColor: "#dbeafe",
                        borderRadius: "0.75rem",
                        border: "2px solid #93c5fd",
                        width: "100%",
                        maxWidth: "400px"
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                          <span style={{ fontSize: "1.5rem" }}>📄</span>
                          <div style={{ textAlign: "left", flex: 1 }}>
                            <p style={{ 
                              fontSize: "0.95rem", 
                              fontWeight: 600, 
                              color: "#1e293b",
                              marginBottom: "0.25rem"
                            }}>{selectedFile.name}</p>
                            <p style={{ 
                              fontSize: "0.85rem", 
                              color: "#6b7280" 
                            }}>{formatFileSize(selectedFile.size)}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
    
                {selectedFile && (
                  <div style={{ 
                    marginTop: "2rem", 
                    display: "flex", 
                    justifyContent: "flex-end",
                    gap: "1rem"
                  }}>
                    <button
                      onClick={() => setSelectedFile(null)}
                      style={{
                        padding: "0.75rem 1.5rem",
                        borderRadius: "0.75rem",
                        fontWeight: 600,
                        border: "2px solid #e5e7eb",
                        backgroundColor: "transparent",
                        color: "#64748b",
                        cursor: "pointer",
                        transition: "all 0.3s ease"
                      }}
                      onMouseOver={(e) => {
                        e.target.style.backgroundColor = "#f3f4f6";
                        e.target.style.borderColor = "#d1d5db";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.backgroundColor = "transparent";
                        e.target.style.borderColor = "#e5e7eb";
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpload}
                      disabled={loading}
                      style={{
                        padding: "0.75rem 2rem",
                        borderRadius: "0.75rem",
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        border: "none",
                        cursor: loading ? "not-allowed" : "pointer",
                        background: loading 
                          ? "linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)" 
                          : "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                        color: "#ffffff",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        transition: "all 0.3s ease",
                        transform: loading ? "none" : "translateY(0)"
                      }}
                      onMouseOver={(e) => {
                        if (!loading) {
                          e.target.style.transform = "translateY(-2px)";
                          e.target.style.boxShadow = "0 6px 8px -1px rgba(59, 130, 246, 0.5)";
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!loading) {
                          e.target.style.transform = "translateY(0)";
                          e.target.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
                        }
                      }}
                    >
                      {loading ? (
                        <>
                          <span style={{ 
                            animation: "spin 1s linear infinite", 
                            marginRight: "0.75rem",
                            fontSize: "1.1rem"
                          }}>⟳</span>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <span style={{ marginRight: "0.75rem", fontSize: "1.1rem" }}>📤</span>
                          Upload Document
                        </>
                      )}
                    </button>
                  </div>
                )}
    
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div style={{ marginTop: "1.5rem" }}>
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.95rem",
                      color: "#64748b",
                      marginBottom: "0.5rem",
                      fontWeight: 500
                    }}>
                      <span>Uploading... {selectedFile?.name}</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div style={{
                      width: "100%",
                      backgroundColor: "#e5e7eb",
                      borderRadius: "1rem",
                      height: "0.75rem",
                      overflow: "hidden"
                    }}>
                      <div
                        style={{
                          background: "linear-gradient(90deg, #3b82f6 0%, #1e40af 100%)",
                          height: "100%",
                          borderRadius: "1rem",
                          transition: "width 0.4s ease",
                          width: `${uploadProgress}%`,
                          boxShadow: "0 2px 4px rgba(59, 130, 246, 0.3)"
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
    
            {/* My Documents Section */}
            <div style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "1rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              overflow: "hidden"
            }}>
              <div style={{
                padding: "1.5rem 2rem",
                borderBottom: "1px solid #e2e8f0",
                background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <h2 style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#1e293b",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem"
                }}>
                  <span style={{ 
                    fontSize: "1.75rem",
                    background: "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text"
                  }}>📋</span>
                  My Documents
                </h2>
                <div style={{
                  backgroundColor: "#3b82f6",
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "2rem",
                  fontSize: "0.875rem",
                  fontWeight: 600
                }}>
                  {documents.length} {documents.length === 1 ? 'document' : 'documents'}
                </div>
              </div>
    
              <div style={{ overflow: "hidden" }}>
                {loading && documents.length === 0 ? (
                  <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    padding: "4rem",
                    flexDirection: "column",
                    gap: "1rem"
                  }}>
                    <span style={{
                      animation: "spin 1s linear infinite",
                      fontSize: "2rem",
                      color: "#3b82f6"
                    }}>⟳</span>
                    <span style={{ 
                      color: "#64748b",
                      fontSize: "1.125rem",
                      fontWeight: 500
                    }}>Loading your documents...</span>
                  </div>
                ) : documents.length === 0 ? (
                  <div style={{ 
                    textAlign: "center", 
                    padding: "4rem",
                    background: "linear-gradient(135deg, #fafbff 0%, #f8fafc 100%)"
                  }}>
                    <div style={{
                      width: "5rem",
                      height: "5rem",
                      backgroundColor: "#f3f4f6",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 1.5rem",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                    }}>
                      <span style={{ fontSize: "2.5rem", opacity: 0.7 }}>📄</span>
                    </div>
                    <h3 style={{
                      fontSize: "1.5rem",
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: "0.75rem"
                    }}>No documents uploaded yet</h3>
                    <p style={{ 
                      color: "#6b7280",
                      fontSize: "1.05rem",
                      maxWidth: "400px",
                      margin: "0 auto",
                      lineHeight: "1.6"
                    }}>Get started by uploading your first document using the upload section above.</p>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ 
                      width: "100%", 
                      borderCollapse: "collapse",
                      minWidth: "800px"
                    }}>
                      <thead style={{ 
                        backgroundColor: "#f8fafc",
                        borderBottom: "2px solid #e2e8f0"
                      }}>
                        <tr>
                          {["Document", "Type", "Size", "Status", "Uploaded", "Actions"].map((header, index) => (
                            <th key={index} style={{
                              padding: "1.25rem 1.5rem",
                              textAlign: "left",
                              fontSize: "0.875rem",
                              fontWeight: 700,
                              color: "#374151",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              borderBottom: "2px solid #e2e8f0"
                            }}>
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {documents.map((doc, index) => (
                          <tr key={doc._id} style={{
                            transition: "all 0.3s ease",
                            backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                            borderBottom: "1px solid #f1f5f9"
                          }}>
                            <td style={{ 
                              padding: "1.25rem 1.5rem", 
                              whiteSpace: "nowrap" 
                            }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                <div style={{
                                  width: "3rem",
                                  height: "3rem",
                                  backgroundColor: "#ffffff",
                                  border: "2px solid #e5e7eb",
                                  borderRadius: "0.75rem",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)"
                                }}>
                                  <span style={{ fontSize: "1.5rem" }}>📄</span>
                                </div>
                                <div>
                                  <div style={{
                                    fontSize: "1rem",
                                    fontWeight: 600,
                                    color: "#1e293b",
                                    marginBottom: "0.25rem"
                                  }}>
                                    {doc.fileName}
                                  </div>
                                  <div style={{
                                    fontSize: "0.8rem",
                                    color: "#6b7280"
                                  }}>
                                    Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: "1.25rem 1.5rem", whiteSpace: "nowrap" }}>
                              <span style={{
                                fontSize: "0.875rem",
                                color: "#64748b",
                                backgroundColor: "#f1f5f9",
                                padding: "0.5rem 0.75rem",
                                borderRadius: "0.5rem",
                                fontWeight: 500,
                                border: "1px solid #e2e8f0"
                              }}>
                                {doc.fileType.toUpperCase()}
                              </span>
                            </td>
                            <td style={{ 
                              padding: "1.25rem 1.5rem", 
                              whiteSpace: "nowrap", 
                              fontSize: "0.95rem", 
                              color: "#64748b",
                              fontWeight: 500
                            }}>
                              {formatFileSize(doc.fileSize)}
                            </td>
                            <td style={{ padding: "1.25rem 1.5rem", whiteSpace: "nowrap" }}>
                              {getStatusBadge(doc.status)}
                            </td>
                            <td style={{ 
                              padding: "1.25rem 1.5rem", 
                              whiteSpace: "nowrap", 
                              fontSize: "0.95rem", 
                              color: "#64748b",
                              fontWeight: 500
                            }}>
                              {new Date(doc.uploadedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>
                            <td style={{ 
                              padding: "1.25rem 1.5rem", 
                              whiteSpace: "nowrap", 
                              textAlign: "right" 
                            }}>
                              <div style={{ 
                                display: "flex", 
                                justifyContent: "flex-end", 
                                gap: "0.5rem" 
                              }}>
                                <a
                                  href={`${doc.filePath.startsWith("http") ? "" : API_BASE_URL}${doc.filePath}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    color: "#3b82f6",
                                    padding: "0.5rem",
                                    borderRadius: "0.5rem",
                                    transition: "all 0.3s ease",
                                    backgroundColor: "transparent",
                                    border: "none",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                  }}
                                  title="Download"
                                  onMouseOver={(e) => {
                                    e.target.style.backgroundColor = "#dbeafe";
                                    e.target.style.transform = "scale(1.1)";
                                  }}
                                  onMouseOut={(e) => {
                                    e.target.style.backgroundColor = "transparent";
                                    e.target.style.transform = "scale(1)";
                                  }}
                                >
                                  <span style={{ fontSize: "1.25rem" }}>📥</span>
                                </a>
                                <button
                                  onClick={() => handleDelete(doc._id)}
                                  style={{
                                    color: "#ef4444",
                                    padding: "0.5rem",
                                    borderRadius: "0.5rem",
                                    border: "none",
                                    backgroundColor: "transparent",
                                    cursor: loading ? "not-allowed" : "pointer",
                                    transition: "all 0.3s ease",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                  }}
                                  disabled={loading}
                                  title="Delete"
                                  onMouseOver={(e) => {
                                    if (!loading) {
                                      e.target.style.backgroundColor = "#fef2f2";
                                      e.target.style.transform = "scale(1.1)";
                                    }
                                  }}
                                  onMouseOut={(e) => {
                                    if (!loading) {
                                      e.target.style.backgroundColor = "transparent";
                                      e.target.style.transform = "scale(1)";
                                    }
                                  }}
                                >
                                  <span style={{ fontSize: "1.25rem" }}>🗑️</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
    
          {/* Right Side - Guidelines */}
          <div style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "1rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            height: "fit-content",
            position: "sticky",
            top: "2rem"
          }}>
            <div style={{
              padding: "1.5rem 2rem",
              borderBottom: "1px solid #e2e8f0",
              background: "linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%)"
            }}>
              <h2 style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#1e293b",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem"
              }}>
                <span style={{ 
                  fontSize: "1.75rem",
                  background: "linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text"
                }}>📝</span>
                Upload Guidelines
              </h2>
            </div>
            
            <div style={{ padding: "2rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {[
                  { label: 'Aadhaar Card', filename: 'aadhaar', required: true },
                  { label: 'Secondary Marksheet', filename: 'secondary', required: true },
                  { label: 'Senior Secondary Marksheet', filename: 'seniorsecondary', required: true },
                  { label: 'Graduation Marksheet', filename: 'graduation', required: false },
                  { label: 'Post Graduation Marksheet', filename: 'postgraduation', required: false }
                ].map((item, index) => (
                  <div key={index} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "1rem",
                    padding: "1.25rem",
                    borderRadius: "0.75rem",
                    backgroundColor: item.required ? "#fef2f2" : "#f8fafc",
                    border: `2px solid ${item.required ? "#fecaca" : "#e2e8f0"}`,
                    transition: "all 0.3s ease"
                  }}>
                    <div style={{
                      width: "0.75rem",
                      height: "0.75rem",
                      borderRadius: "50%",
                      marginTop: "0.4rem",
                      backgroundColor: item.required ? "#ef4444" : "#3b82f6",
                      flexShrink: 0
                    }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.5rem"
                      }}>
                        <p style={{ 
                          fontSize: "1rem", 
                          fontWeight: 600, 
                          color: item.required ? "#dc2626" : "#1e293b",
                          margin: 0
                        }}>{item.label}</p>
                        {!item.required && (
                          <span style={{
                            fontSize: "0.75rem",
                            color: "#3b82f6",
                            backgroundColor: "#dbeafe",
                            padding: "0.25rem 0.75rem",
                            borderRadius: "1rem",
                            fontWeight: 600
                          }}>Optional</span>
                        )}
                        {item.required && (
                          <span style={{
                            fontSize: "0.75rem",
                            color: "#dc2626",
                            backgroundColor: "#fecaca",
                            padding: "0.25rem 0.75rem",
                            borderRadius: "1rem",
                            fontWeight: 600
                          }}>Required</span>
                        )}
                      </div>
                      <p style={{ 
                        fontSize: "0.875rem", 
                        color: "#64748b", 
                        margin: "0.25rem 0 0 0",
                        lineHeight: "1.5"
                      }}>
                        File name: <code style={{
                          backgroundColor: "#ffffff",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "0.375rem",
                          color: "#2563eb",
                          fontFamily: "'Monaco', 'Consolas', monospace",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          border: "1px solid #dbeafe"
                        }}>{item.filename}</code>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div style={{
                marginTop: "2rem",
                padding: "1.5rem",
                backgroundColor: "#fffbeb",
                border: "2px solid #fcd34d",
                borderRadius: "0.75rem"
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                  <div style={{ 
                    fontSize: "1.5rem", 
                    color: "#d97706", 
                    flexShrink: 0 
                  }}>⚠️</div>
                  <div>
                    <h4 style={{ 
                      fontSize: "1.1rem", 
                      fontWeight: 700, 
                      color: "#92400e", 
                      marginBottom: "0.5rem" 
                    }}>Important Note</h4>
                    <p style={{ 
                      fontSize: "0.95rem", 
                      color: "#92400e",
                      lineHeight: "1.6",
                      margin: 0
                    }}>
                      Ensure files are named correctly before uploading. Incorrect file names may delay the verification process. All documents must be clear, readable, and valid.
                    </p>
                  </div>
                </div>
              </div>
              
              <div style={{
                marginTop: "1.5rem",
                padding: "1.5rem",
                backgroundColor: "#eff6ff",
                border: "2px solid #93c5fd",
                borderRadius: "0.75rem"
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                  <div style={{ 
                    fontSize: "1.5rem", 
                    color: "#2563eb", 
                    flexShrink: 0 
                  }}>💡</div>
                  <div>
                    <h4 style={{ 
                      fontSize: "1.1rem", 
                      fontWeight: 700, 
                      color: "#1e40af", 
                      marginBottom: "0.5rem" 
                    }}>Pro Tip</h4>
                    <p style={{ 
                      fontSize: "0.95rem", 
                      color: "#1e40af",
                      lineHeight: "1.6",
                      margin: 0
                    }}>
                      Keep file sizes under 5MB and use clear, high-quality scans for faster processing. PDF format is recommended for documents.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    // <div className="min-h-screen bg-gray-50 py-8">
    //   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    //     <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
    //       {/* Left Side - Upload + My Documents */}
    //       <div className="lg:col-span-2 space-y-6">
    //         <div>
    //           <h1 className="text-3xl font-bold text-slate-800 mb-2">Document Upload</h1>
    //           <p className="text-slate-600">Upload and manage your verification documents securely</p>
    //         </div>

    //         {/* Upload Box */}
    //         <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
    //           <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-sky-50">
    //             <h2 className="text-xl font-semibold text-slate-800 flex items-center">
    //               <FiUpload className="w-5 h-5 mr-2 text-blue-600" />
    //               Upload New Document
    //             </h2>
    //           </div>
              
    //           <div className="p-6">
    //             <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors duration-200">
    //               <div className="flex flex-col items-center justify-center space-y-4">
    //                 <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
    //                   <FiUpload className="w-8 h-8 text-blue-600" />
    //                 </div>
                    
    //                 <div className="text-slate-600">
    //                   <label
    //                     htmlFor="file-upload"
    //                     className="relative cursor-pointer bg-blue-600 rounded-lg px-4 py-2 font-medium text-white hover:bg-blue-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 transition-colors"
    //                   >
    //                     <span>Choose a file</span>
    //                     <input
    //                       id="file-upload"
    //                       name="file-upload"
    //                       type="file"
    //                       className="sr-only"
    //                       onChange={handleFileChange}
    //                       accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
    //                     />
    //                   </label>
    //                   <p className="mt-2 text-slate-500">or drag and drop files here</p>
    //                 </div>
                    
    //                 <p className="text-sm text-slate-400">
    //                   PDF, DOC, DOCX, XLS, XLSX, JPG, PNG up to 5MB
    //                 </p>
                    
    //                 {selectedFile && (
    //                   <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
    //                     <div className="flex items-center space-x-3">
    //                       {getFileIcon(selectedFile.type)}
    //                       <div className="text-left">
    //                         <p className="text-sm font-medium text-slate-700">{selectedFile.name}</p>
    //                         <p className="text-xs text-slate-500">{formatFileSize(selectedFile.size)}</p>
    //                       </div>
    //                     </div>
    //                   </div>
    //                 )}
    //               </div>
    //             </div>

    //             {selectedFile && (
    //               <div className="mt-6 flex justify-end">
    //                 <button
    //                   onClick={handleUpload}
    //                   disabled={loading}
    //                   className={`px-6 py-3 rounded-lg font-medium flex items-center transition-colors ${
    //                     loading
    //                       ? "bg-gray-400 cursor-not-allowed text-white"
    //                       : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
    //                   }`}
    //                 >
    //                   {loading ? (
    //                     <>
    //                       <FaSpinner className="animate-spin mr-2 w-4 h-4" />
    //                       Uploading...
    //                     </>
    //                   ) : (
    //                     <>
    //                       <FiUpload className="mr-2 w-4 h-4" />
    //                       Upload Document
    //                     </>
    //                   )}
    //                 </button>
    //               </div>
    //             )}

    //             {uploadProgress > 0 && uploadProgress < 100 && (
    //               <div className="mt-4">
    //                 <div className="flex justify-between text-sm text-slate-600 mb-1">
    //                   <span>Uploading...</span>
    //                   <span>{uploadProgress}%</span>
    //                 </div>
    //                 <div className="w-full bg-gray-200 rounded-full h-2">
    //                   <div
    //                     className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
    //                     style={{ width: `${uploadProgress}%` }}
    //                   ></div>
    //                 </div>
    //               </div>
    //             )}
    //           </div>
    //         </div>

    //         {/* My Documents */}
    //         <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
    //           <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50">
    //             <h2 className="text-xl font-semibold text-slate-800 flex items-center">
    //               <FiFile className="w-5 h-5 mr-2 text-slate-600" />
    //               My Documents ({documents.length})
    //             </h2>
    //           </div>

    //           <div className="overflow-hidden">
    //             {loading && documents.length === 0 ? (
    //               <div className="flex justify-center items-center py-12">
    //                 <FaSpinner className="animate-spin text-2xl text-blue-600 mr-3" />
    //                 <span className="text-slate-600">Loading documents...</span>
    //               </div>
    //             ) : documents.length === 0 ? (
    //               <div className="text-center py-12">
    //                 <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
    //                   <FiFile className="w-8 h-8 text-gray-400" />
    //                 </div>
    //                 <h3 className="text-lg font-medium text-slate-700 mb-2">No documents uploaded</h3>
    //                 <p className="text-slate-500">Get started by uploading your first document above.</p>
    //               </div>
    //             ) : (
    //               <div className="overflow-x-auto">
    //                 <table className="min-w-full divide-y divide-gray-200">
    //                   <thead className="bg-gray-50">
    //                     <tr>
    //                       <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
    //                         Document
    //                       </th>
    //                       <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
    //                         Type
    //                       </th>
    //                       <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
    //                         Size
    //                       </th>
    //                       <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
    //                         Status
    //                       </th>
    //                       <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
    //                         Uploaded
    //                       </th>
    //                       <th className="relative px-6 py-4">
    //                         <span className="sr-only">Actions</span>
    //                       </th>
    //                     </tr>
    //                   </thead>
    //                   <tbody className="bg-white divide-y divide-gray-200">
    //                     {documents.map((doc, index) => (
    //                       <tr key={doc._id} className={`hover:bg-blue-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
    //                         <td className="px-6 py-4 whitespace-nowrap">
    //                           <div className="flex items-center">
    //                             <div className="flex-shrink-0 w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm">
    //                               {getFileIcon(doc.fileType)}
    //                             </div>
    //                             <div className="ml-4">
    //                               <div className="text-sm font-medium text-slate-800">
    //                                 {doc.fileName}
    //                               </div>
    //                             </div>
    //                           </div>
    //                         </td>
    //                         <td className="px-6 py-4 whitespace-nowrap">
    //                           <span className="text-sm text-slate-600 bg-gray-100 px-2 py-1 rounded-md">
    //                             {doc.fileType}
    //                           </span>
    //                         </td>
    //                         <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
    //                           {formatFileSize(doc.fileSize)}
    //                         </td>
    //                         <td className="px-6 py-4 whitespace-nowrap">
    //                           {getStatusBadge(doc.status)}
    //                         </td>
    //                         <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
    //                           {new Date(doc.uploadedAt).toLocaleDateString('en-US', {
    //                             year: 'numeric',
    //                             month: 'short',
    //                             day: 'numeric'
    //                           })}
    //                         </td>
    //                         <td className="px-6 py-4 whitespace-nowrap text-right">
    //                           <div className="flex justify-end space-x-3">
    //                             <a
    //                               href={`${doc.filePath.startsWith("http") ? "" : API_BASE_URL}${doc.filePath}`}
    //                               target="_blank"
    //                               rel="noopener noreferrer"
    //                               className="text-blue-600 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition-colors"
    //                               title="Download"
    //                             >
    //                               <FiDownload className="h-5 w-5" />
    //                             </a>
    //                             <button
    //                               onClick={() => handleDelete(doc._id)}
    //                               className="text-red-500 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
    //                               disabled={loading}
    //                               title="Delete"
    //                             >
    //                               <FiTrash2 className="h-5 w-5" />
    //                             </button>
    //                           </div>
    //                         </td>
    //                       </tr>
    //                     ))}
    //                   </tbody>
    //                 </table>
    //               </div>
    //             )}
    //           </div>
    //         </div>
    //       </div>

    //       {/* Right Side - Instructions */}
    //       <div className="bg-white border border-gray-200 rounded-xl shadow-sm h-fit">
    //         <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-sky-50">
    //           <h2 className="text-xl font-semibold text-slate-800">Upload Guidelines</h2>
    //         </div>
            
    //         <div className="p-6">
    //           <div className="space-y-4">
    //             {[
    //               { label: 'Aadhaar Card', filename: 'aadhaar', required: true },
    //               { label: 'Secondary Marksheet', filename: 'secondary', required: true },
    //               { label: 'Senior Secondary Marksheet', filename: 'seniorsecondary', required: true },
    //               { label: 'Graduation Marksheet', filename: 'graduation', required: false },
    //               { label: 'Post Graduation Marksheet', filename: 'postgraduation', required: false }
    //             ].map((item, index) => (
    //               <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
    //                 <div className={`w-2 h-2 rounded-full mt-2 ${item.required ? 'bg-red-400' : 'bg-blue-400'}`}></div>
    //                 <div className="flex-1">
    //                   <p className="text-sm font-medium text-slate-700">{item.label}</p>
    //                   <p className="text-xs text-slate-500 mt-1">
    //                     File name: <code className="bg-white px-2 py-1 rounded text-blue-600 font-mono">{item.filename}</code>
    //                   </p>
    //                   {!item.required && (
    //                     <span className="inline-block mt-1 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Optional</span>
    //                   )}
    //                 </div>
    //               </div>
    //             ))}
    //           </div>
              
    //           <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
    //             <div className="flex items-start space-x-2">
    //               <div className="w-5 h-5 text-amber-600 mt-0.5">⚠️</div>
    //               <div>
    //                 <h4 className="text-sm font-medium text-amber-800 mb-1">Important Note</h4>
    //                 <p className="text-xs text-amber-700">
    //                   Ensure files are named correctly before uploading. Incorrect file names may delay verification process.
    //                 </p>
    //               </div>
    //             </div>
    //           </div>
              
    //           <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
    //             <div className="flex items-start space-x-2">
    //               <div className="w-5 h-5 text-blue-600 mt-0.5">💡</div>
    //               <div>
    //                 <h4 className="text-sm font-medium text-blue-800 mb-1">Pro Tip</h4>
    //                 <p className="text-xs text-blue-700">
    //                   Keep file sizes under 5MB and use clear, high-quality scans for faster processing.
    //                 </p>
    //               </div>
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
};

export default DocumentUpload;