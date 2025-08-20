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

export default function AllUserTypes() {
  const { token } = useSelector((s) => s.auth);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiConnector('GET', adminApi.USER_TYPES_API, null, token ? { Authorization: `Bearer ${token}` } : undefined);
      if (res?.data?.success) {
        setItems(res.data.data || []);
      } else {
        setItems([]);
        setError('Failed to load user types');
      }
    } catch (e) {
      console.error(e);
      setError('Failed to load user types');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); /* eslint-disable-next-line */ }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(it => (it.name || '').toLowerCase().includes(q));
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  const paginated = useMemo(() => {
    const start = (page - 1) * limit;
    return filtered.slice(start, start + limit);
  }, [filtered, page, limit]);

  useEffect(() => { setPage(1); }, [search, limit]);

  return (
    <DashboardLayout>
      <div className="all-user-types-container">
        <h1 style={{ fontSize: 24, fontWeight: 800, color: ED_TEAL, marginBottom: 8 }}>All User Types</h1>
        <div style={{ color: '#777', fontSize: 13, marginBottom: 16 }}>User Type {'>'} All User Types</div>

        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <div className="controls-row">
            <div className="entries-row">
              <span style={{ color: TEXT_GRAY, fontSize: 13 }}>Show entries</span>
              <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); }} style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: '6px 10px', background: BG }}>
                {[10, 25, 50, 100].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <input className="search-input" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: '8px 12px', background: '#fff' }} />
          </div>
        </div>

        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: BG }}>
                <tr>
                  {['Serial No.', 'Name'].map((h) => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, letterSpacing: 0.5, color: TEXT_GRAY, borderBottom: `1px solid ${BORDER}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={2} style={{ padding: 24, textAlign: 'center', color: TEXT_GRAY }}>Loading...</td></tr>
                ) : error ? (
                  <tr><td colSpan={2} style={{ padding: 24, textAlign: 'center', color: 'crimson' }}>{error}</td></tr>
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={2} style={{ padding: 24, textAlign: 'center', color: TEXT_GRAY }}>No user types found</td></tr>
                ) : (
                  paginated.map((it, idx) => (
                    <tr key={it._id || it.name} style={{ borderBottom: `1px solid ${BORDER}` }}>
                      <td style={{ padding: '12px 16px', color: TEXT_DARK }}>{(page - 1) * limit + idx + 1}</td>
                      <td style={{ padding: '12px 16px', color: TEXT_DARK }}>{it.name}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={{ border: `1px solid ${BORDER}`, padding: '8px 12px', borderRadius: 8, color: page === 1 ? TEXT_GRAY : TEXT_DARK, background: '#fff' }}>Previous</button>
            <span style={{ alignSelf: 'center', color: TEXT_GRAY, fontSize: 13 }}>Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ border: `1px solid ${BORDER}`, padding: '8px 12px', borderRadius: 8, color: page === totalPages ? TEXT_GRAY : TEXT_DARK, background: '#fff' }}>Next</button>
          </div>
        )}
      </div>
      <style jsx>{`
        .all-user-types-container {
          width: calc(100% - 250px);
          margin-left: 250px;
          padding: 24px;
          min-height: 100vh;
          background: ${BG};
          
        }
        .controls-row {
          display: flex;
          gap: 12px;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
        }
        .entries-row {
          display: flex;
          gap: 12px;
          align-items: center;
        }
        .search-input {
          width: 240px;
        }
        @media (max-width: 1024px) {
          .all-user-types-container {
            width: calc(100% - 200px);
            margin-left: 200px;
            padding: 16px;
            margin-top: 4rem;
          }
        }
        @media (max-width: 768px) {
          .all-user-types-container {
            width: 100%;
            margin-left: 0;
            padding: 16px;
            
          }
          .search-input {
            width: 100%;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}