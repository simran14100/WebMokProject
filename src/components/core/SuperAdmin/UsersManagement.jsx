import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import { apiConnector } from '../../../services/apiConnector';
import { admin as adminApi, superAdmin as superAdminApi } from '../../../services/apis';
import { VscEdit, VscChromeClose, VscTrash } from 'react-icons/vsc';
import { FiX } from 'react-icons/fi';
// import { createUserByAdmin } from '../../../services/operations/adminApi';
import { toast } from 'react-hot-toast';

// Colors
const ED_TEAL = '#07A698';
const BORDER = '#e5e7eb';
const BG = '#f3f4f6';
const TEXT_DARK = '#111827';
const TEXT_GRAY = '#6b7280';

export default function UsersManagement() {
  const { token } = useSelector((s) => s.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // dataset filter: all users or PhD students
  const [dataset, setDataset] = useState('all'); // 'all' | 'phd'

  // Modal state
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userTypes, setUserTypes] = useState([]);
  const DEFAULT_USER_TYPES = [
    { _id: 'role-super-admin', name: 'Super Admin' },
    { _id: 'role-admission', name: 'Admission' },
    { _id: 'role-account', name: 'Account' },
    { _id: 'role-exam', name: 'Exam' },
  ];
  const [loadingUserTypes, setLoadingUserTypes] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
    userTypeId: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchUsers = async () => {
    console.log('fetchUsers called with:', { page, limit, search, dataset });
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit, search });
      const endpoint = dataset === 'phd' ? adminApi.GET_PHD_ENROLLED_STUDENTS_API : adminApi.GET_REGISTERED_USERS_API;
      const url = `${endpoint}?${params}`;
      console.log('Making API call to:', url);
      
      const res = await apiConnector(
        'GET',
        url,
        null,
        token ? { Authorization: `Bearer ${token}` } : undefined
      );
      
      console.log('API Response:', {
        status: res?.status,
        data: res?.data,
        success: res?.data?.success,
        hasData: !!res?.data?.data
      });
      
      if (res?.data?.success !== false) {
        const data = res?.data?.data ?? {};
        console.log('Response data structure:', {
          data,
          hasUsers: !!data.users,
          hasStudents: !!data.students,
          hasItems: !!data.items,
          hasResults: !!data.results,
          isArray: Array.isArray(data)
        });
        
        const list = data.users || data.students || data.items || data.results || (Array.isArray(data) ? data : []);
        const usersArr = Array.isArray(list) ? list : [];
        
        console.log('Processed users list:', {
          listLength: usersArr.length,
          firstUser: usersArr[0],
          totalPages: data.totalPages || 1
        });
        
        setUsers(usersArr);
        setTotalPages(data.totalPages || 1);
      } else {
        console.error('API returned success:false', res?.data);
        setUsers([]);
        setError('Failed to load users');
      }
    } catch (e) {
      console.error(e);
      setError('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, dataset]);

  // Fetch user types when opening modal (or once when token ready)
  const fetchUserTypes = async () => {
    setLoadingUserTypes(true);
    try {
      const res = await apiConnector(
        'GET',
        adminApi.USER_TYPES_API,
        {},
        token ? { Authorization: `Bearer ${token}` } : {}
      );
      const payload = res.data?.data;
      const list = Array.isArray(payload?.userTypes) ? payload.userTypes : (Array.isArray(payload) ? payload : []);
      setUserTypes(list);
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || 'Failed to fetch user types');
    } finally {
      setLoadingUserTypes(false);
    }
  };

  const openModal = () => {
    setForm({ firstName: '', lastName: '', email: '', contactNumber: '', password: '', confirmPassword: '', userTypeId: '' });
    setFormErrors({});
    setOpen(true);
    // lock scroll
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setOpen(false);
    document.body.style.overflow = '';
  };

  const setField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'First name is required';
    if (!form.lastName.trim()) e.lastName = 'Last name is required';
    if (!form.email.trim()) e.email = 'User id (email) is required';
    else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)) e.email = 'Invalid email';
    if (!form.contactNumber.trim()) e.contactNumber = 'Contact number is required';
    else if (!/^\d{10}$/.test(form.contactNumber.trim())) e.contactNumber = 'Enter 10 digit number';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Min 8 characters';
    if (!form.confirmPassword) e.confirmPassword = 'Confirm your password';
    else if (form.confirmPassword !== form.password) e.confirmPassword = 'Passwords do not match';
    if (!form.userTypeId) e.userTypeId = 'Select user type';
    setFormErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitNewUser = async (e) => {
    e.preventDefault();
    console.log('submitNewUser called');
    if (submitting) {
      console.log('Already submitting, returning');
      return;
    }
    if (!validate()) {
      console.log('Validation failed');
      return;
    }
    if (!token) {
      const errorMsg = 'Session expired. Please log in again.';
      console.error(errorMsg);
      toast.error(errorMsg);
      return;
    }
    
    setSubmitting(true);
    console.log('Creating user with data:', {
      ...form,
      password: '***', // Don't log actual password
      confirmPassword: '***'
    });
    
    try {
      const roleLabel = (DEFAULT_USER_TYPES.find(t => t._id === form.userTypeId)?.name) || 'Admin';
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        contactNumber: form.contactNumber,
        password: form.password,
        confirmPassword: form.confirmPassword,
        userTypeId: form.userTypeId,
        role: roleLabel,
        program: 'PhD',
      };
      
      console.log('Sending request to:', superAdminApi.CREATE_USER_API);
      const res = await apiConnector(
        'POST',
        superAdminApi.CREATE_USER_API,
        payload,
        token ? { Authorization: `Bearer ${token}` } : {}
      );
      
      console.log('Create user response:', {
        status: res?.status,
        data: res?.data,
        success: res?.data?.success
      });
      
      if (res?.data?.success) {
        const successMsg = res.data?.message || 'User created successfully';
        console.log(successMsg);
        toast.success(successMsg);
        
        // Close modal and reset form
        closeModal();
        
        // Reset search and pagination
        console.log('Resetting search and pagination');
        setSearch('');
        setPage(1);
        
        // Force refresh the users list
        console.log('Refreshing users list...');
        await fetchUsers();
        console.log('Users list refreshed');
      } else {
        const msg = res?.data?.message || 'Failed to create user';
        console.error('Create user failed:', msg);
        toast.error(msg);
        throw new Error(msg);
      }
    } catch (error) {
      console.error('Error in submitNewUser:', {
        error,
        message: error.message,
        response: error.response?.data
      });
      // Error toast is already handled by the API interceptor
    } finally {
      console.log('submitNewUser completed');
      setSubmitting(false);
    }
  };

  const orderedUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.trim().toLowerCase();
    const score = (u) => {
      const name = `${u.firstName || ''} ${u.lastName || ''}`.trim().toLowerCase();
      const email = (u.email || '').toLowerCase();
      let s = 0;
      if (name === q) s += 100;
      if (name.startsWith(q)) s += 50;
      if (name.includes(q)) s += 25;
      if (email.startsWith(q)) s += 15;
      return s;
    };
    return [...users].sort((a, b) => score(b) - score(a));
  }, [users, search]);

  return (
    <div className="users-mgmt">
      <div className="header">
        <h2>Users Management</h2>
        <button className="add-btn" onClick={openModal}>Add New User</button>
      </div>

      <div className="filter-box">
        <div className="filter-left">
          <span>Show entries</span>
          <select
            value={limit}
            onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
          >
            {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <select value={dataset} onChange={(e)=>{ setDataset(e.target.value); setPage(1); }}>
            <option value="all">All Users</option>
            <option value="phd">PhD Students</option>
          </select>
        </div>
        <input
          placeholder="Search"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <div className="card">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th style={{width: 140}}>Action</th>
                <th>Name</th>
                <th>User Id</th>
                <th>Contact Number</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="muted">Loading...</td></tr>
              ) : error ? (
                <tr><td colSpan={4} className="error-text">{error}</td></tr>
              ) : orderedUsers.length === 0 ? (
                <tr><td colSpan={4} className="muted">No users found</td></tr>
              ) : (
                orderedUsers.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="actions">
                        <span className="icon-btn" title="Edit"><VscEdit /></span>
                        <span className="icon-btn" title="Disable"><VscChromeClose /></span>
                        <span className="icon-btn" title="Delete"><VscTrash /></span>
                      </div>
                    </td>
                    <td>{`${u.firstName || ''} ${u.lastName || ''}`.trim()}</td>
                    <td style={{ textTransform: 'none' }}>{u.email}</td>
                    <td>{u?.additionalDetails?.contactNumber || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</button>
          <span>Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
        </div>
      )}

      {/* Add User Modal */}
      {open && createPortal(
        (
          <div
            className="modal-root"
            role="dialog"
            aria-modal="true"
            style={{ position: 'fixed', inset: 0, zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <div
              className="backdrop"
              onClick={closeModal}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 0 }}
            />
            <div
              className="wm-modal"
              style={{ position: 'relative', zIndex: 1, width: '95%', maxWidth: 900, background: '#fff', color: '#111827', borderRadius: 10, boxShadow: '0 10px 25px rgba(0,0,0,.2)', overflow: 'hidden', border: `2px solid ${BORDER}`, minHeight: 220, outline: '2px solid rgba(0,0,0,0.05)' }}
            >
              <div className="wm-modal-header" style={{ background: '#fff', color: '#111827' }}>
                <h3>Add New User</h3>
                <button aria-label="Close" className="wm-icon-x" onClick={closeModal}><FiX /></button>
              </div>
              <div className="wm-modal-body" style={{ background: '#fff', color: '#111827' }}>
                <div style={{padding: '4px 0 12px', fontSize: 12, color: '#6b7280'}}>Modal test: if you can read this, the container rendered.</div>
                <ModalErrorBoundary>
                <form onSubmit={submitNewUser} className="grid-2">
                <div className="field">
                  <label>First Name</label>
                  <input value={form.firstName} onChange={(e)=>setField('firstName', e.target.value)} />
                  {formErrors.firstName && <span className="err">{formErrors.firstName}</span>}
                </div>
                <div className="field">
                  <label>Last Name</label>
                  <input value={form.lastName} onChange={(e)=>setField('lastName', e.target.value)} />
                  {formErrors.lastName && <span className="err">{formErrors.lastName}</span>}
                </div>

                <div className="field">
                  <label>User id</label>
                  <input value={form.email} onChange={(e)=>setField('email', e.target.value)} placeholder="name@domain.com" />
                  {formErrors.email && <span className="err">{formErrors.email}</span>}
                </div>
                <div className="field">
                  <label>Contact Number</label>
                  <input value={form.contactNumber} onChange={(e)=>setField('contactNumber', e.target.value)} placeholder="10 digit number" />
                  {formErrors.contactNumber && <span className="err">{formErrors.contactNumber}</span>}
                </div>

                <div className="field">
                  <label>Password</label>
                  <input type="password" value={form.password} onChange={(e)=>setField('password', e.target.value)} />
                  {formErrors.password && <span className="err">{formErrors.password}</span>}
                </div>
                <div className="field">
                  <label>Confirm Password</label>
                  <input type="password" value={form.confirmPassword} onChange={(e)=>setField('confirmPassword', e.target.value)} />
                  {formErrors.confirmPassword && <span className="err">{formErrors.confirmPassword}</span>}
                </div>

                <div className="field" style={{ gridColumn: '1 / -1' }}>
                  <label>User Type</label>
                  <select value={form.userTypeId} onChange={(e)=>setField('userTypeId', e.target.value)}>
                    <option value="">-- Select User Type --</option>
                    {DEFAULT_USER_TYPES.map(ut => (
                      <option key={ut._id} value={ut._id}>{ut.name}</option>
                    ))}
                  </select>
                  {formErrors.userTypeId && <span className="err">{formErrors.userTypeId}</span>}
                </div>

                <div className="actions-row">
                  <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Creating...' : 'Submit'}</button>
                </div>
                </form>
                </ModalErrorBoundary>
              </div>
            </div>
          </div>
        ),
        document.body
      )}

      <style jsx>{`
        .users-mgmt { 
          max-width: 1200px; 
          margin-left: -5px; 
          padding: 20px;
          margin-top: 9rem; 
        }
        .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
        .header h2 { font-weight: 700; color: ${TEXT_DARK}; }
        .add-btn { background: #2563eb; color: #fff; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer; }

        .filter-box { background: #fff; border: 1px solid ${BORDER}; border-radius: 12px; padding: 14px; margin: 10px 0 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .filter-left { display: flex; gap: 10px; align-items: center; color: ${TEXT_GRAY}; font-size: 14px; }
        .filter-box select, .filter-box input { border: 1px solid ${BORDER}; border-radius: 8px; padding: 8px 12px; font-size: 14px; background: #fff; }
        .filter-box input { width: 260px; max-width: 100%; }

        .card { background: #fff; border: 1px solid ${BORDER}; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
        .table-scroll { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; min-width: 700px; }
        thead tr { background: #1f2937; color: #fff; }
        th { text-align: left; padding: 12px 16px; font-weight: 600; font-size: 14px; }
        td { padding: 14px 16px; border-bottom: 1px solid ${BORDER}; color: ${TEXT_DARK}; background: #fff; }
        tr:nth-child(even) td { background: ${BG}; }

        .actions { display: flex; gap: 10px; }
        .icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; border-radius: 999px; background: #e5e7eb; color: #6b7280; }

        .pagination { display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 16px; }
        .pagination button { border: 1px solid ${BORDER}; padding: 8px 12px; border-radius: 8px; background: #fff; cursor: pointer; }
        .pagination button:disabled { opacity: .5; cursor: not-allowed; }
        .pagination span { color: ${TEXT_GRAY}; font-size: 14px; }
        .muted { text-align: center; color: ${TEXT_GRAY}; padding: 20px; }
        .error-text { text-align: center; color: #ef4444; padding: 20px; }

        @media (max-width: 768px) {
          .users-mgmt { margin-left: 0; padding: 16px; }
          .filter-box { flex-direction: column; align-items: stretch; }
          .filter-left { justify-content: space-between; }
          .filter-box input { width: 100%; }
        }

        /* Modal styles */
        .modal-root { position: fixed; inset: 0; z-index: 20000; display: flex; align-items: center; justify-content: center; }
        .backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.4); z-index: 0; }
        .wm-modal { position: relative; z-index: 1; width: 95%; max-width: 900px; background: #fff; border-radius: 10px; box-shadow: 0 10px 25px rgba(0,0,0,.15); overflow: hidden; border: 1px solid ${BORDER}; }
        .wm-modal-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid ${BORDER}; }
        .wm-modal-header h3 { font-size: 18px; font-weight: 700; color: ${TEXT_DARK}; }
        .wm-icon-x { background: transparent; border: none; width: 36px; height: 36px; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; cursor: pointer; }
        .wm-modal-body { padding: 18px; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 18px 16px; }
        .field label { display: block; font-size: 14px; color: ${TEXT_DARK}; margin-bottom: 6px; }
        .field input, .field select { width: 100%; border: 1px solid ${BORDER}; border-radius: 6px; padding: 12px 12px; font-size: 14px; background: #fff; }
        .err { display: block; margin-top: 4px; font-size: 12px; color: #ef4444; }
        .actions-row { grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; }
        .btn-secondary { background: #fff; color: ${ED_TEAL}; border: 1px solid ${ED_TEAL}; padding: 10px 14px; border-radius: 8px; cursor: pointer; }
        .btn-primary { background: ${ED_TEAL}; color: #fff; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; }
        @media (max-width: 640px) {
          .grid-2 { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

// Local error boundary to catch render-time issues in the modal form
class ModalErrorBoundary extends React.Component {
  constructor(props){
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error){
    return { hasError: true, error };
  }
  componentDidCatch(error, info){
    console.error('Modal render error:', error, info);
  }
  render(){
    if (this.state.hasError){
      return (
        <div style={{ padding: 12, background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 8, color: '#991B1B' }}>
          Failed to render modal: {this.state.error?.message}
        </div>
      );
    }
    return this.props.children;
  }
}
