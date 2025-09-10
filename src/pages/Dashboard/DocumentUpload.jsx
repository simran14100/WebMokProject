import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';
import { FiDownload, FiFile, FiTrash2, FiUpload } from 'react-icons/fi';
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
    if (fileType.includes('pdf')) return 'PDF';
    if (fileType.includes('word') || fileType.includes('msword') || 
        fileType.includes('wordprocessingml')) return 'DOC';
    if (fileType.includes('excel') || fileType.includes('spreadsheetml')) return 'XLS';
    if (fileType.includes('image')) return 'IMG';
    return 'FILE';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { class: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      approved: { class: 'bg-green-100 text-green-800', label: 'Approved' },
      rejected: { class: 'bg-red-100 text-red-800', label: 'Rejected' }
    };
    
    // Default to pending if status is not provided
    const statusInfo = statusMap[status] || { class: 'bg-gray-100 text-gray-800', label: 'Pending' };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-richblack-5 mb-6">Document Upload</h1>
      
      <div className="bg-richblack-800 p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold text-richblack-5 mb-4">Upload New Document</h2>
        
        <div className="border-2 border-dashed border-richblack-500 rounded-lg p-6 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <FiUpload className="w-12 h-12 text-richblack-300" />
            <div className="text-sm text-richblack-200">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-richblack-600 rounded-md font-medium text-richblack-50 hover:text-richblack-25 focus-within:outline-none"
              >
                <span>Select a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-richblack-400">
              PDF, DOC, DOCX, XLS, XLSX, JPG, PNG up to 5MB
            </p>
            {selectedFile && (
              <div className="mt-2 text-sm text-richblack-100">
                <p>Selected: {selectedFile.name}</p>
                <p className="text-richblack-400">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            )}
          </div>
        </div>

        {selectedFile && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleUpload}
              disabled={loading}
              className={`px-4 py-2 rounded-md ${
                loading
                  ? 'bg-richblack-500 cursor-not-allowed'
                  : 'bg-yellow-50 hover:bg-yellow-100 text-richblack-900'
              } font-medium flex items-center`}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                'Upload Document'
              )}
            </button>
          </div>
        )}

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mt-4">
            <div className="w-full bg-richblack-600 rounded-full h-2.5">
              <div
                className="bg-yellow-50 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-right text-sm text-richblack-300 mt-1">
              {uploadProgress}% Complete
            </p>
          </div>
        )}
      </div>

      <div className="bg-richblack-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-richblack-5 mb-4">My Documents</h2>
        
        {loading && documents.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <FaSpinner className="animate-spin text-2xl text-yellow-50 mr-2" />
            <span>Loading documents...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 text-richblack-300">
            <FiFile className="mx-auto h-12 w-12 text-richblack-500" />
            <h3 className="mt-2 text-sm font-medium text-richblack-200">No documents</h3>
            <p className="mt-1 text-sm text-richblack-400">
              Get started by uploading a new document.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-richblack-700">
              <thead className="bg-richblack-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-richblack-200 uppercase tracking-wider">
                    Document
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-richblack-200 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-richblack-200 uppercase tracking-wider">
                    Size
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-richblack-200 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-richblack-200 uppercase tracking-wider">
                    Uploaded
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-richblack-800 divide-y divide-richblack-700">
                {documents.map((doc) => (
                  <tr key={doc._id} className="hover:bg-richblack-750">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-richblack-700 rounded-md flex items-center justify-center">
                          <span className="text-sm font-medium text-yellow-50">
                            {getFileIcon(doc.fileType)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-richblack-100">
                            {doc.fileName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-richblack-300">
                        {doc.fileType}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-richblack-300">
                      {formatFileSize(doc.fileSize)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(doc.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-richblack-300">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <a
                          href={`${doc.filePath.startsWith('http') ? '' : API_BASE_URL}${doc.filePath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-yellow-50 hover:text-yellow-100"
                          title="Download"
                        >
                          <FiDownload className="h-5 w-5" />
                        </a>
                        <button
                          onClick={() => handleDelete(doc._id)}
                          className="text-red-400 hover:text-red-300"
                          disabled={loading}
                          title="Delete"
                        >
                          <FiTrash2 className="h-5 w-5" />
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
  );
};

export default DocumentUpload;
