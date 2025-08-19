import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../../../common/DashboardLayout';
import { apiConnector } from '../../../../../services/apiConnector';
import { admin as adminApi } from '../../../../../services/apis';
const ED_TEAL = '#07A698';
const BORDER = '#e0e0e0';
const BG = '#f8f9fa';
const TEXT_DARK = '#191A1F';
const TEXT_GRAY = '#666';

export default function AllUsers() {
  const { token } = useSelector((s) => s.auth);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page, limit, search });
      const res = await apiConnector(
        'GET',
        `${adminApi.GET_REGISTERED_USERS_API}?${params}`,
        null,
        token ? { Authorization: `Bearer ${token}` } : undefined
      );
      if (res?.data?.success) {
        setUsers(res.data.data.users || []);
        setTotalPages(res.data.data.totalPages || 1);
      } else {
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
  }, [page, limit, search]);

  // Bring searched user to top without removing others
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

  const onSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px', marginLeft: '250px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: ED_TEAL, marginBottom: 16 }}>All Users</h1>

        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ color: TEXT_GRAY, fontSize: 13 }}>Show entries</span>
              <select
                value={limit}
                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: '6px 10px', background: BG }}
              >
                {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <input
              placeholder="Search"
              value={search}
              onChange={onSearchChange}
              style={{ width: 240, border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px 12px', background: '#fff' }}
            />
          </div>
        </div>

        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: BG }}>
                <tr>
                  {['Serial No.', 'Name', 'Email', 'Phone Number'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, letterSpacing: 0.5, color: TEXT_GRAY, borderBottom: `1px solid ${BORDER}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} style={{ padding: 24, textAlign: 'center', color: TEXT_GRAY }}>Loading...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={4} style={{ padding: 24, textAlign: 'center', color: 'crimson' }}>{error}</td>
                  </tr>
                ) : orderedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: 24, textAlign: 'center', color: TEXT_GRAY }}>No users found</td>
                  </tr>
                ) : (
                  orderedUsers.map((u, idx) => (
                    <tr key={u._id} style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <td style={{ padding: '12px 16px', color: TEXT_DARK }}>{(page - 1) * limit + idx + 1}</td>
                      <td style={{ padding: '12px 16px', color: TEXT_DARK }}>{`${u.firstName || ''} ${u.lastName || ''}`.trim()}</td>
                      <td style={{ padding: '12px 16px', color: TEXT_DARK }}>{u.email}</td>
                      <td style={{ padding: '12px 16px', color: TEXT_DARK }}>{u?.additionalDetails?.contactNumber || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ border: `1px solid ${BORDER}`, padding: '8px 12px', borderRadius: 8, color: page === 1 ? TEXT_GRAY : TEXT_DARK, background: '#fff' }}
            >
              Previous
            </button>
            <span style={{ alignSelf: 'center', color: TEXT_GRAY, fontSize: 13 }}>Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{ border: `1px solid ${BORDER}`, padding: '8px 12px', borderRadius: 8, color: page === totalPages ? TEXT_GRAY : TEXT_DARK, background: '#fff' }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
