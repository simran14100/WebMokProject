import React, { useEffect, useMemo, useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { ED_TEAL, ED_TEAL_DARK } from '../../../utils/theme';
import { listDepartments } from '../../../services/departmentApi';
import { 
  getAllAdmissionEnquiries, 
  updateEnquiryStatus,
  deleteAdmissionEnquiry 
} from '../../../services/operations/admissionEnquiryApi';
import { showSuccess, showError, showLoading, dismissToast } from '../../../utils/toast';

const PAGE_SIZE = 10;


const BORDER = '#e0e0e0';
const TEXT_DARK = '#191A1F';

export default function NewApplications() {
  const [items, setItems] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('New');
  const [department, setDepartment] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: PAGE_SIZE });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    const token = localStorage.getItem('token');
    const tId = showLoading('Deleting application...');
    
    try {
      // Delete the item
      await deleteAdmissionEnquiry(itemToDelete.id, token);
      
      // Optimistically update the UI by removing the deleted item
      setItems(prevItems => prevItems.filter(item => item.id !== itemToDelete.id));
      
      // Update the total count
      setMeta(prevMeta => ({
        ...prevMeta,
        total: Math.max(0, prevMeta.total - 1)
      }));
      
      // If we're on the last page with only one item, go to previous page
      if (items.length === 1 && page > 1) {
        setPage(prevPage => prevPage - 1);
      }
      
      dismissToast(tId);
      showSuccess('Application deleted successfully');
    } catch (error) {
      console.error('Error deleting application:', error);
      showError(error.message || 'Failed to delete application');
      
      // If there's an error, reload the data
      try {
        const listRes = await getAllAdmissionEnquiries({
          programType: 'PHD',
          status: status || undefined,
          page,
          limit: PAGE_SIZE,
          search: query || undefined
        }, token);
        
        const enquiryData = listRes?.data?.data || [];
        const mapped = enquiryData.map((enquiry, index) => {
          // Debug log to see the raw enquiry data
          console.log('Processing enquiry:', JSON.stringify(enquiry, null, 2));
          
          // Handle name extraction
          let name = 'No Name';
          if (enquiry.name) {
            name = enquiry.name;
          } else if (enquiry.firstName || enquiry.lastName) {
            name = [enquiry.firstName, enquiry.lastName].filter(Boolean).join(' ').trim();
          } else if (enquiry.fullName) {
            name = enquiry.fullName;
          }
          
          return {
            id: enquiry._id || enquiry.id || `temp-${index}`,
            name: name,
            email: enquiry.email || 'No Email',
            phone: enquiry.phone || enquiry.phoneNumber || 'No Phone',
            programType: enquiry.programType || 'PHD',
            status: enquiry.status || 'pending',
            createdAt: enquiry.createdAt || new Date().toISOString(),
            firstName: enquiry.firstName || '',
            lastName: enquiry.lastName || '',
            fatherName: enquiry.fatherName || '',
            dateOfBirth: enquiry.dateOfBirth 
              ? new Date(enquiry.dateOfBirth).toLocaleDateString() 
              : 'N/A',
            qualification: enquiry.lastClass || enquiry.qualification || '',
            boardSchoolName: enquiry.boardSchoolName || enquiry.schoolName || '',
            percentage: enquiry.percentage || '',
            address: [
              enquiry.address,
              enquiry.city,
              enquiry.state,
              enquiry.pincode
            ].filter(Boolean).join(', ') || 'Not provided',
            _raw: enquiry
          };
        });
        
        setItems(mapped);
        setMeta({
          total: listRes?.data?.total || mapped.length,
          page: listRes?.data?.page || page,
          limit: listRes?.data?.limit || PAGE_SIZE
        });
      } catch (refreshError) {
        console.error('Error refreshing data:', refreshError);
      }
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const [viewId, setViewId] = useState(null);
  const viewItem = useMemo(() => items.find(i => i.id === viewId) || null, [items, viewId]);

  // initial load of departments and enquiries
  useEffect(() => {
    const init = async () => {
      let tId;
      try {
        tId = showLoading('Loading PhD admission enquiries...');
        
        console.log('=== FETCHING PHD ADMISSION ENQUIRIES ===');
        console.log('API Endpoint:', '/api/v1/admission-enquiries/program/PHD');
        console.log('Query Params:', {
          status,
          page,
          limit: PAGE_SIZE,
          search: query || '(none)'
        });
        
        // Get departments (for reference)
        console.log('Fetching departments...');
        const deptRes = await listDepartments();
        console.log('Departments API Response:', {
          status: deptRes?.status,
          dataCount: Array.isArray(deptRes?.data) ? deptRes.data.length : 'N/A'
        });
        
        const deptData = deptRes?.data || [];
        const deptItems = (Array.isArray(deptData) ? deptData : deptData.data || []).map((d) => ({
          id: d._id || d.id,
          name: d.name || ''
        }));
        
        setDepartments(deptItems);
        
        // Get PhD admission enquiries
        console.log('\nFetching PhD admission enquiries...');
        const token = localStorage.getItem('token');
        console.log('Using token:', token ? '***' + token.slice(-8) : 'No token found');
        
        // Convert status to lowercase to match database
        const statusFilter = status ? status.toLowerCase() : undefined;
        
        const listRes = await getAllAdmissionEnquiries({
          programType: 'PHD',
          status: statusFilter,
          page,
          limit: PAGE_SIZE,
          search: query || undefined
        }, token);
        
        console.log('\n=== PHD ADMISSION ENQUIRIES RESPONSE ===');
        console.log('Response Status:', listRes?.status);
        console.log('Response Data Structure:', {
          success: listRes?.data?.success,
          dataCount: listRes?.data?.data?.length || 0,
          total: listRes?.data?.total || 0,
          page: listRes?.data?.page,
          limit: listRes?.data?.limit
        });
        
        // Handle both response formats: data.data and data.enquiries
        const enquiryData = listRes?.data?.data || listRes?.data?.enquiries || [];
        console.log('\nProcessing Enquiries:', enquiryData.length);
        console.log('Sample Enquiry:', enquiryData[0] ? JSON.stringify(enquiryData[0], null, 2) : 'No enquiries found');
        
        const mapped = enquiryData.map((enquiry, index) => {
          const processedEnquiry = {
            id: enquiry._id || enquiry.id || `temp-${index}`,
            name: (enquiry.firstName && enquiry.lastName) 
              ? `${enquiry.firstName} ${enquiry.lastName}`.trim() 
              : enquiry.name || 'No Name',
            email: enquiry.email || 'No Email',
            phone: enquiry.phone || enquiry.phoneNumber || 'No Phone',
            programType: enquiry.programType || 'PHD',
            status: enquiry.status || 'pending',
            createdAt: enquiry.createdAt || new Date().toISOString(),
            fatherName: enquiry.fatherName || '',
            dateOfBirth: enquiry.dateOfBirth 
              ? new Date(enquiry.dateOfBirth).toLocaleDateString() 
              : 'N/A',
            qualification: enquiry.lastClass || enquiry.qualification || '',
            boardSchoolName: enquiry.boardSchoolName || enquiry.schoolName || '',
            percentage: enquiry.percentage || '',
            address: [
              enquiry.address,
              enquiry.city,
              enquiry.state,
              enquiry.pincode
            ].filter(Boolean).join(', ') || 'Not provided',
            _raw: enquiry
          };
          
          console.log(`\nEnquiry #${index + 1}:`, {
            id: processedEnquiry.id,
            name: processedEnquiry.name,
            status: processedEnquiry.status,
            program: processedEnquiry.programType,
            contact: `${processedEnquiry.email} | ${processedEnquiry.phone}`
          });
          
          return processedEnquiry;
        });
        
        setItems(mapped);
        setMeta({
          total: listRes?.data?.total || mapped.length,
          page: listRes?.data?.page || page,
          limit: listRes?.data?.limit || PAGE_SIZE
        });
      } catch (e) {
        showError(e?.response?.data?.message || 'Failed to load enquiries');
      } finally {
        if (tId) dismissToast(tId);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // load on filters/page/query
  // Handle status update
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const tId = showLoading('Updating status...');
      const token = localStorage.getItem('token');
      
      // Update status using the API
      await updateEnquiryStatus(id, { status: newStatus }, token);
      
      dismissToast(tId);
      showSuccess('Status updated successfully');
      
      // Refresh the list
      const listRes = await getAllAdmissionEnquiries({
        programType: 'PHD',
        status: status || undefined,
        page,
        limit: PAGE_SIZE,
        search: query || undefined
      }, token);
      
      // Process the response
      const enquiryData = listRes?.data?.data || [];
      const mapped = enquiryData.map((enquiry, index) => ({
        id: enquiry._id || enquiry.id || `temp-${index}`,
        name: (enquiry.firstName && enquiry.lastName) 
          ? `${enquiry.firstName} ${enquiry.lastName}`.trim() 
          : enquiry.name || 'No Name',
        email: enquiry.email || 'No Email',
        phone: enquiry.phone || enquiry.phoneNumber || 'No Phone',
        programType: enquiry.programType || 'PHD',
        status: enquiry.status || 'pending',
        createdAt: enquiry.createdAt || new Date().toISOString(),
        fatherName: enquiry.fatherName || '',
        dateOfBirth: enquiry.dateOfBirth 
          ? new Date(enquiry.dateOfBirth).toLocaleDateString() 
          : 'N/A',
        qualification: enquiry.lastClass || enquiry.qualification || '',
        boardSchoolName: enquiry.boardSchoolName || enquiry.schoolName || '',
        percentage: enquiry.percentage || '',
        address: enquiry.address || '',
        city: enquiry.city || '',
        state: enquiry.state || '',
        _raw: enquiry
      }));
      
      setItems(mapped);
      setMeta({
        total: listRes?.data?.total || mapped.length,
        page: listRes?.data?.page || page,
        limit: listRes?.data?.limit || PAGE_SIZE
      });
    } catch (error) {
      console.error('Error updating status:', error);
      showError(error.message || 'Failed to update status');
    }
  };  

  useEffect(() => {
    const load = async () => {
      let tId;
      try {
        tId = showLoading('Loading PhD admission enquiries...');
        const token = localStorage.getItem('token');
        // Convert status to lowercase to match database
        const statusFilter = status ? status.toLowerCase() : undefined;
        
        const listRes = await getAllAdmissionEnquiries({ 
          programType: 'PHD',
          status: statusFilter,
          page,
          limit: PAGE_SIZE,
          search: query || undefined
        }, token);
        
        console.log('\n=== LOADING PHD ENQUIRIES ===');
        console.log('API Response:', {
          status: listRes?.status,
          success: listRes?.data?.success,
          dataCount: listRes?.data?.data?.length || 0
        });
        
        // Handle both response formats: data.data and data.enquiries
        const enquiryData = listRes?.data?.data || listRes?.data?.enquiries || [];
        console.log(`Found ${enquiryData.length} PhD enquiries`);
        console.log('Sample Enquiry:', enquiryData[0] ? JSON.stringify(enquiryData[0], null, 2) : 'No enquiries found');
        
        const mapped = enquiryData.map((enquiry, index) => {
          const processedEnquiry = {
            id: enquiry._id || enquiry.id || `temp-${index}`,
            name: (enquiry.firstName && enquiry.lastName) 
              ? `${enquiry.firstName} ${enquiry.lastName}`.trim() 
              : enquiry.name || 'No Name',
            email: enquiry.email || 'No Email',
            phone: enquiry.phone || enquiry.phoneNumber || 'No Phone',
            programType: enquiry.programType || 'PHD',
            status: enquiry.status || 'pending',
            createdAt: enquiry.createdAt || new Date().toISOString(),
            fatherName: enquiry.fatherName || '',
            dateOfBirth: enquiry.dateOfBirth 
              ? new Date(enquiry.dateOfBirth).toLocaleDateString() 
              : 'N/A',
            qualification: enquiry.lastClass || enquiry.qualification || '',
            boardSchoolName: enquiry.boardSchoolName || enquiry.schoolName || '',
            percentage: enquiry.percentage || '',
            address: [
              enquiry.address,
              enquiry.city,
              enquiry.state,
              enquiry.pincode
            ].filter(Boolean).join(', ') || 'Not provided',
            _raw: enquiry
          };
          
          console.log(`\nEnquiry #${index + 1}:`, {
            id: processedEnquiry.id,
            name: processedEnquiry.name,
            status: processedEnquiry.status,
            program: processedEnquiry.programType,
            contact: `${processedEnquiry.email} | ${processedEnquiry.phone}`
          });
          
          return processedEnquiry;
        });
        
        setItems(mapped);
        setMeta({
          total: listRes?.data?.total || mapped.length,
          page: listRes?.data?.page || page,
          limit: listRes?.data?.limit || PAGE_SIZE
        });
      } catch (e) {
        showError(e?.response?.data?.message || 'Failed to load enquiries');
      } finally {
        if (tId) dismissToast(tId);
      }
    };
    load();
  }, [query, status, department, page]);

  // Export helpers (Copy/CSV/Print)
  // Delete functionality with confirmation modal
  const copyTable = async () => {
    const header = 'Date\tName\tEmail\tPhone\tProgram Type\tApplying Course\tPersonal Info\tLast Qualification\tAddress\tStatus';
    const rows = items.map(i => [
      formatDate(i.createdAt),
      i.name,
      i.email,
      i.phone,
      i.programType || 'N/A',
  
      `DOB: ${i.dateOfBirth || 'N/A'}`,
      i.qualification || 'N/A',
      i.address || 'N/A',
      i.status
    ].join('\t')).join('\n');
    const text = `${header}\n${rows}`;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.focus(); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
      }
      showSuccess('Copied to clipboard');
    } catch {
      showError('Copy failed');
    }
  };

  const exportCSV = () => {
    const header = 'Date,Name,Email,Phone,Program Type,Applying Course,Personal Info,Last Qualification,Address,Status\n';
    const rows = items.map(i => [
      formatDate(i.createdAt),
      i.name,
      i.email,
      i.phone,
      i.programType || 'N/A',
    
      `DOB: ${i.dateOfBirth || 'N/A'}`,
      i.qualification || 'N/A',
      i.address || 'N/A',
      i.status
    ].map(escapeCsv).join(',')).join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'new-applications.csv'; a.click(); URL.revokeObjectURL(url);
  };



const printTable = () => {
  // Debug: Log the items being printed
  console.log('Printing items:', JSON.stringify(items, null, 2));
  
  const win = window.open('', '_blank', 'width=900,height=600');
  if (!win) {
    console.error('Could not open print window');
    return;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata'
      };
      return date.toLocaleDateString('en-IN', options);
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Date Error';
    }
  };

  // Helper function to safely access nested properties
  const getNestedValue = (obj, path, defaultValue = 'N/A') => {
    return path.split('.').reduce((o, p) => (o && o[p] !== undefined ? o[p] : defaultValue), obj);
  };

  const formatItem = (item) => {
    if (!item) return '';
    
    // Log the complete item for debugging
    console.log('Processing item for print:', JSON.stringify(item, null, 2));
    
    // Get data from _raw if available, otherwise use item directly
    const data = item._raw || item;
    const admissionDetails = data.admissionDetails || {};
    
    // Get full name from either name or firstName+lastName
    let fullName = 'N/A';
    if (data.name) {
      fullName = data.name;
    } else if (data.firstName || data.lastName) {
      fullName = [data.firstName, data.lastName].filter(Boolean).join(' ').trim();
    } else if (data.fullName) {
      fullName = data.fullName;
    }
    
    // Log for debugging
    console.log('Name debug:', {
      dataName: data.name,
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: data.fullName,
      finalName: fullName
    });
    
    // Get address components
    const address = [
      data.address,
      data.city,
      data.state,
      data.pincode
    ].filter(Boolean).join(', ') || 'Not provided';

    return `
      <div style="page-break-inside: avoid; margin-bottom: 20px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #0f766e;">
          <h2 style="margin: 0; color: #0f766e;">Application #${data._id || data.id || 'N/A'}</h2>
          <div style="font-size: 14px; color: #64748b;">
            Applied on: ${formatDate(data.createdAt || data.appliedDate)}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
          <!-- Personal Information -->
          <div>
            <h3 style="color: #334155; margin: 0 0 10px 0; font-size: 16px; font-weight: 600; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Personal Information</h3>
            <div style="font-size: 14px; line-height: 1.8;">
              <div><strong>Name:</strong> ${fullName}</div>
              <div><strong>Date of Birth:</strong> ${formatDate(data.dateOfBirth)}</div>
              <div><strong>Gender:</strong> ${data.gender || 'N/A'}</div>
              <div><strong>Father's Name:</strong> ${data.fatherName || data.parentName || 'N/A'}</div>
             
              <div><strong>Nationality:</strong> ${data.nationality || 'Indian'}</div>
            </div>
          </div>

          <!-- Contact Information -->
          <div>
            <h3 style="color: #334155; margin: 0 0 10px 0; font-size: 16px; font-weight: 600; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Contact Information</h3>
            <div style="font-size: 14px; line-height: 1.8;">
              <div><strong>Email:</strong> ${data.email || 'N/A'}</div>
              <div><strong>Phone:</strong> ${data.phone || data.phoneNumber || 'N/A'}</div>
              <div><strong>Alternate Phone:</strong> ${data.alternateNumber || 'N/A'}</div>
              <div><strong>Address:</strong> ${address}</div>
            </div>
          </div>

          <!-- Academic Information -->
          <div>
            <h3 style="color: #334155; margin: 0 0 10px 0; font-size: 16px; font-weight: 600; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Academic Information</h3>
            <div style="font-size: 14px; line-height: 1.8;">
              <div><strong>Last Qualification:</strong> ${data.lastClass || data.qualification || 'N/A'}</div>
              <div><strong>Board/University:</strong> ${data.boardSchoolName || data.schoolName || 'N/A'}</div>
              <div><strong>Percentage/CGPA:</strong> ${data.percentage || 'N/A'}</div>
              <div><strong>Graduation Course:</strong> ${data.graduationCourse || 'N/A'}</div>
              <div><strong>Year of Passing:</strong> ${data.yearOfPassing || 'N/A'}</div>
            </div>
          </div>

          <!-- Admission Details -->
          <div>
            <h3 style="color: #334155; margin: 0 0 10px 0; font-size: 16px; font-weight: 600; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Admission Details</h3>
            <div style="font-size: 14px; line-height: 1.8;">
              <div><strong>Status:</strong> ${data.status || 'N/A'}</div>
              <div><strong>Program Type:</strong> ${data.programType || 'N/A'}</div>
              <div><strong>Source:</strong> ${admissionDetails.source || 'N/A'}</div>
              <div><strong>Scholarship:</strong> ${admissionDetails.isScholarship ? 'Yes' : 'No'}</div>
              <div><strong>Follow-up Date:</strong> ${formatDate(admissionDetails.followUpDate)}</div>
              <div><strong>Processed At:</strong> ${formatDate(admissionDetails.processedAt)}</div>
              <div><strong>Last Updated:</strong> ${formatDate(data.updatedAt)}</div>
            </div>
          </div>

          <!-- Notes Section -->
          ${data.notes?.length > 0 ? `
          <div style="grid-column: 1 / -1;">
            <h3 style="color: #334155; margin: 0 0 10px 0; font-size: 16px; font-weight: 600; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Notes</h3>
            <div style="background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0;">
              ${data.notes.map((note, index) => `
                <div style="margin-bottom: ${index < data.notes.length - 1 ? '15px' : '0'}; padding-bottom: ${index < data.notes.length - 1 ? '15px' : '0'}; border-bottom: ${index < data.notes.length - 1 ? '1px dashed #e2e8f0' : 'none'};">
                  <div style="margin-bottom: 5px;">${note.content || ''}</div>
                  <div style="font-size: 12px; color: #64748b; font-style: italic;">
                    Added on: ${formatDate(note.createdAt)}${note.addedBy ? ` by ${note.addedBy}` : ''}
                  </div>
                </div>`
              ).join('')}
            </div>
          </div>` : ''}
        </div>
      </div>
    `;
  };

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Application Details - ${new Date().toLocaleDateString()}</title>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4;
      margin: 1cm;
    }
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #1e293b;
      padding: 20px;
      background-color: #f8fafc;
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
      padding: 20px;
      background: #0f766e;
      color: white;
      border-radius: 8px;
    }
    .header h1 {
      margin: 0 0 5px 0;
      color: white;
    }
    .header p {
      margin: 0;
      opacity: 0.9;
    }
    .print-meta {
      text-align: right;
      margin-bottom: 20px;
      font-size: 14px;
      color: #64748b;
      padding: 10px;
      background: white;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    @media print {
      body {
        padding: 0;
        background: white;
      }
      .no-print {
        display: none !important;
      }
      .header {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Application Details</h1>
    <p>Generated on: ${new Date().toLocaleString()}</p>
  </div>
  
  <div class="print-meta">
    Total Applications: ${items.length} | Page <span class="page-number"></span>
  </div>

  ${items.map(item => formatItem(item)).join('<div style="page-break-after: always;"></div>')}

  <div class="no-print" style="text-align: center; margin-top: 30px; padding: 20px; border-top: 1px solid #e2e8f0;">
    <button onclick="window.print()" style="
      background: #0f766e;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin: 5px;
    ">
      Print This Page
    </button>
    <button onclick="window.close()" style="
      background: #ef4444;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      margin: 5px;
    ">
      Close Window
    </button>
  </div>

  <script>
    // Update page numbers
    document.addEventListener('DOMContentLoaded', function() {
      const pages = document.querySelectorAll('.page-number');
      pages.forEach((page, index) => {
        page.textContent = index + 1;
      });
    });
  </script>
</body>
</html>`;

  win.document.open();
  win.document.write(html);
  win.document.close();
  
  // Add a small delay to ensure the content is fully loaded before printing
  win.onload = () => {
    setTimeout(() => {
      win.focus();
      // Auto-print after a short delay
      setTimeout(() => {
        win.print();
      }, 500);
    }, 500);
  };
};

  // Check if there are any items to show
  const hasItems = items.length > 0;
  const hasFilters = status !== 'New' || department || query;

  return (
    <div style={{ padding: '1rem', marginTop: '14rem' }}>
      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
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
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '24px',
            borderRadius: '8px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '16px' }}>Confirm Deletion</h3>
            <p>Are you sure you want to delete this application? This action cannot be undone.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setDeleteModalOpen(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: '1px solid #e2e8f0',
                  background: 'white',
                  cursor: 'pointer',
                  color: TEXT_DARK
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: '8px 16px',
                  borderRadius: '4px',
                  border: 'none',
                  background: '#ef4444',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 600, color: TEXT_DARK, marginLeft: '100px' }}>New Applications</h1>
        {!hasItems && (
          <div style={{ marginRight: '100px', color: '#666', fontStyle: 'italic' }}>
            {hasFilters 
              ? 'No applications found matching your filters.'
              : 'No new applications found.'
            }
            {hasFilters && (
              <button 
                onClick={() => {
                  setStatus('New');
                  setDepartment('');
                  setQuery('');
                  setPage(1);
                }}
                style={{
                  marginLeft: '10px',
                  color: ED_TEAL,
                  textDecoration: 'underline',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
  
    {/* Toolbar */}
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 12 , marginLeft: '100px'}}>
      {[
        { label: 'Copy', action: copyTable },
        { label: 'CSV', action: exportCSV },
        { label: 'Print', action: printTable },
      ].map(btn => (
        <button
          key={btn.label}
          onClick={btn.action}
          style={{
            padding: '8px 14px',
            borderRadius: 6,
            background: ED_TEAL,
            color: 'white',
            fontWeight: 500,
            border: `1px solid ${ED_TEAL}`,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = ED_TEAL_DARK)}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = ED_TEAL)}
        >
          {btn.label}
        </button>
      ))}
  
      <div style={{ marginLeft: 'auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 , marginRight: '30px'}}>
        <label style={{ color: TEXT_DARK, fontSize: 14 }}>Status:</label>
        <select
          value={status}
          onChange={(e) => { setPage(1); setStatus(e.target.value); }}
          style={{
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            padding: '8px 10px',
            minWidth: 120,
          }}
        >
          <option>New</option>
          <option>Processed</option>
          <option>Converted</option>
        </select>
  
       
  
        <label style={{ color: TEXT_DARK, fontSize: 14 }}>Search:</label>
        <input
          value={query}
          onChange={(e) => { setPage(1); setQuery(e.target.value); }}
          placeholder="Name/Email/Phone"
          style={{
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            padding: '8px 10px',
            minWidth: 200,
          }}
        />
      </div>
    </div>
  
    {/* Table */}
    <div style={{ overflowX: 'auto', marginLeft: '100px', marginRight: '30px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px', minWidth: '1200px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f1f5f9' }}>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${BORDER}`, fontWeight: 500, color: TEXT_DARK, whiteSpace: 'nowrap' }}>Date</th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${BORDER}`, fontWeight: 500, color: TEXT_DARK, whiteSpace: 'nowrap' }}>Name</th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${BORDER}`, fontWeight: 500, color: TEXT_DARK, whiteSpace: 'nowrap' }}>Email</th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${BORDER}`, fontWeight: 500, color: TEXT_DARK, whiteSpace: 'nowrap' }}>Phone</th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${BORDER}`, fontWeight: 500, color: TEXT_DARK, whiteSpace: 'nowrap' }}>Program Type</th>
           
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${BORDER}`, fontWeight: 500, color: TEXT_DARK, whiteSpace: 'nowrap' }}>Last Qualification</th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${BORDER}`, fontWeight: 500, color: TEXT_DARK, whiteSpace: 'nowrap' }}>Address</th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${BORDER}`, fontWeight: 500, color: TEXT_DARK, whiteSpace: 'nowrap' }}>Status</th>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${BORDER}`, fontWeight: 500, color: TEXT_DARK, whiteSpace: 'nowrap' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} style={{ borderBottom: `1px solid ${BORDER}`, backgroundColor: 'white' }}>
              <td style={{ padding: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>{formatDate(item.createdAt)}</td>
              <td style={{ padding: '12px', color: TEXT_DARK, fontWeight: 500, whiteSpace: 'nowrap' }}>{item.name}</td>
              <td style={{ padding: '12px', color: '#3b82f6', wordBreak: 'break-all' }}>{item.email}</td>
              <td style={{ padding: '12px', color: TEXT_DARK, whiteSpace: 'nowrap' }}>{item.phone}</td>
              <td style={{ padding: '12px', color: TEXT_DARK, whiteSpace: 'nowrap' }}>{item.programType || 'N/A'}</td>
           
              <td style={{ padding: '12px', color: TEXT_DARK, whiteSpace: 'nowrap' }}>{item.qualification || 'N/A'}</td>
              <td style={{ padding: '12px', color: TEXT_DARK, maxWidth: '200px', wordBreak: 'break-word' }}>{item.address || 'N/A'}</td>
              <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                <span 
                  style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 500,
                    backgroundColor: item.status === 'approved' ? '#DCFCE7' : item.status === 'rejected' ? '#FEE2E2' : '#E0F2FE',
                    color: item.status === 'approved' ? '#166534' : item.status === 'rejected' ? '#991B1B' : '#075985',
                  }}
                >
                  {item.status || 'Pending'}
                </span>
              </td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                <button
                  onClick={() => handleDeleteClick(item)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  title="Delete Application"
                >
                  <FiTrash2 size={18} />
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
        <button
          disabled={page <= 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            background: page <= 1 ? '#cbd5e1' : ED_TEAL,
            color: 'white',
            fontWeight: 500,
            border: 'none',
            cursor: page <= 1 ? 'not-allowed' : 'pointer',
            opacity: page <= 1 ? 0.7 : 1
          }}
        >
          Previous
        </button>
        <span style={{ 
          padding: '6px 12px', 
          borderRadius: 6, 
          background: ED_TEAL, 
          color: 'white', 
          fontWeight: 500 
        }}>
          {page}
        </span>
        <button
          disabled={items.length < PAGE_SIZE}
          onClick={() => setPage(p => p + 1)}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            background: items.length < PAGE_SIZE ? '#cbd5e1' : ED_TEAL,
            color: 'white',
            fontWeight: 500,
            border: 'none',
            cursor: items.length < PAGE_SIZE ? 'not-allowed' : 'pointer',
            opacity: items.length < PAGE_SIZE ? 0.7 : 1
          }}
        >
          Next
        </button>
      </div>
    </div>
  </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
      <div style={{ border: '1px solid #e2e8f0', borderRadius: 6, padding: '10px 12px', color: '#334155' }}>{value || '-'}</div>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString(); } catch { return ''; }
}

function escapeCsv(str) {
  if (str == null) return '';
  const s = String(str);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
