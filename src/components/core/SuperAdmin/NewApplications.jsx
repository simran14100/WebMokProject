import React, { useEffect, useMemo, useState } from 'react';
import { FiEye } from 'react-icons/fi';
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

  // Read-only UI: no delete/convert actions

  // Export helpers (Copy/CSV/Print)
  const copyTable = async () => {
    const header = 'Date\tName\tEmail\tPhone\tStatus';
    const rows = items.map(i => `${formatDate(i.createdAt)}\t${i.name}\t${i.email}\t${i.phone}\t${i.status}`).join('\n');
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
    const header = 'Date,Name,Email,Phone,Status\n';
    const rows = items.map(i => [formatDate(i.createdAt), i.name, i.email, i.phone, i.status].map(escapeCsv).join(',')).join('\n');
    const bom = '\uFEFF';
    const blob = new Blob([bom + header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'new-applications.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const printTable = () => {
    const win = window.open('', 'PRINT', 'height=700,width=1000');
    if (!win) return;
    const tableRows = items.map(i => `<tr><td>${escapeHtml(formatDate(i.createdAt))}</td><td>${escapeHtml(i.name)}</td><td>${escapeHtml(i.email)}</td><td>${escapeHtml(i.phone)}</td><td>${escapeHtml(i.status)}</td></tr>`).join('');
    const html = `<!doctype html>
<html><head><meta charset="utf-8" /><title>New Applications</title>
<style>body{font-family:Arial,sans-serif;padding:16px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #cbd5e1;padding:8px;text-align:left}thead{background:#f1f5f9}</style>
</head><body>
<h3>New Applications</h3>
<table><thead><tr><th>Date</th><th>Name</th><th>Email</th><th>Phone</th><th>Status</th></tr></thead><tbody>${tableRows}</tbody></table>
</body></html>`;
    win.document.open(); win.document.write(html); win.document.close();
    win.onload = () => { win.focus(); win.print(); win.close(); };
  };

  // Check if there are any items to show
  const hasItems = items.length > 0;
  const hasFilters = status !== 'New' || department || query;

  return (
    <div style={{ padding: '1rem', marginTop: '14rem' }}>
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
  
        <label style={{ color: TEXT_DARK, fontSize: 14 }}>School:</label>
        <select
          value={department}
          onChange={(e) => { setPage(1); setDepartment(e.target.value); }}
          style={{
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            padding: '8px 10px',
            minWidth: 150,
          }}
        >
          <option value="">All</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
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
    <div
      style={{
        backgroundColor: '#fff',
        borderRadius: '10px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: `1px solid ${BORDER}`,
        overflow: 'hidden',
        width: '90%',
        marginLeft: '100px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '100px 1.5fr 2fr 1.5fr 150px',
          backgroundColor: ED_TEAL,
          color: 'white',
          fontSize: '14px',
          fontWeight: 600,
          padding: '12px 16px',
        }}
      >
        <div>Action</div>
        <div>Date</div>
        <div>Applicant</div>
        <div>Email</div>
        <div>Status</div>
      </div>
  
      {/* Rows */}
      <div>
        {items.map((i, idx) => (
          <div
            key={i.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '100px 1.5fr 2fr 1.5fr 150px',
              alignItems: 'center',
              padding: '12px 16px',
              backgroundColor: idx % 2 === 0 ? '#fafafa' : 'white',
              borderBottom: `1px solid ${BORDER}`,
              fontSize: '14px',
              color: TEXT_DARK,
            }}
          >
            {/* Action Button */}
            <div>
              <button
                style={{
                  padding: '6px 8px',
                  borderRadius: '6px',
                  border: `1px solid ${ED_TEAL}`,
                  fontSize: '13px',
                  color: ED_TEAL,
                  backgroundColor: 'white',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = ED_TEAL; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = ED_TEAL; }}
                onClick={() => setViewId(i.id)}
              >
                <FiEye />
              </button>
            </div>
            <div style={{ color: '#555' }}>{i.createdAt ? formatDate(i.createdAt) : 'N/A'}</div>
            <div>
              <div style={{ fontWeight: 500 }}>{i.name}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{i.phone}</div>
            </div>
            <div>{i.email}</div>
            <div>
              <span 
                style={{
                  display: 'inline-block',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 500,
                  backgroundColor: i.status === 'approved' ? '#DCFCE7' : i.status === 'rejected' ? '#FEE2E2' : '#E0F2FE',
                  color: i.status === 'approved' ? '#166534' : i.status === 'rejected' ? '#991B1B' : '#075985',
                }}
              >
                {i.status || 'Pending'}
              </span>
            </div>
          </div>
        ))}
      </div>
  
      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 12 , marginRight: '30px' }}>
        <button
          disabled={page <= 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
          style={{
            padding: '6px 12px',
            borderRadius: 6,
            background: page <= 1 ? '#cbd5e1' : ED_TEAL,
            color: 'white',
            fontWeight: 500,
          }}
        >
          Previous
        </button>
        <span style={{ padding: '6px 12px', borderRadius: 6, background: ED_TEAL, color: 'white', fontWeight: 500 }}>
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
