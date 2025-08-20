import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import DashboardLayout from '../../../../common/DashboardLayout';
import { apiConnector } from '../../../../../services/apiConnector';
import { admin as adminApi } from '../../../../../services/apis';
import toast from 'react-hot-toast';

const ED_TEAL = '#07A698';
const BORDER = '#e0e0e0';
const BG = '#f8f9fa';

export default function CreateUserType() {
  const { token } = useSelector((s) => s.auth);
  const [name, setName] = useState('');
  const [contentManagement, setContentManagement] = useState(false);
  const [trainerManagement, setTrainerManagement] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter a name');
      return;
    }
    try {
      setLoading(true);
      const res = await apiConnector(
        'POST',
        adminApi.USER_TYPES_API,
        { name: name.trim(), contentManagement, trainerManagement },
        token ? { Authorization: `Bearer ${token}` } : undefined
      );
      if (res?.data?.success) {
        toast.success('User type created');
        setName('');
        setContentManagement(false);
        setTrainerManagement(false);
      } else {
        toast.error(res?.data?.message || 'Failed to create user type');
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to create user type');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="create-user-type-container">
        <h1 style={{ fontSize: 24, fontWeight: 800, color: ED_TEAL, marginBottom: 8 }}>Create User Type</h1>
        <div style={{ color: '#777', fontSize: 13, marginBottom: 16 }}>User Type {'>'} Create User Type</div>

        <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, padding: 16 }}>
          <form onSubmit={onSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, color: '#555', fontSize: 14 }}>Name</label>
                <input
                  type="text"
                  placeholder="Enter User Type Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    border: `1px solid ${BORDER}`,
                    borderRadius: 6,
                    padding: '10px 12px',
                    background: BG,
                  }}
                />
              </div>

              <div className="perm-grid">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#555' }}>
                  <input
                    type="checkbox"
                    checked={contentManagement}
                    onChange={(e) => setContentManagement(e.target.checked)}
                  />
                  <span>Content Management</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#555' }}>
                  <input
                    type="checkbox"
                    checked={trainerManagement}
                    onChange={(e) => setTrainerManagement(e.target.checked)}
                  />
                  <span>Trainer Management</span>
                </label>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: loading ? '#8ad2c9' : ED_TEAL,
                    color: '#fff',
                    padding: '10px 18px',
                    borderRadius: 6,
                    border: 'none',
                    fontWeight: 600,
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </form>
        </div>
        <style jsx>{`
          .create-user-type-container {
            width: calc(100% - 250px);
            margin-left: 250px;
            padding: 24px;
            min-height: 100vh;
            background: ${BG};
          }
          .perm-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
          }
          @media (max-width: 1024px) {
            .create-user-type-container {
              width: calc(100% - 200px);
              margin-left: 200px;
              padding: 16px;
            }
          }
          @media (max-width: 768px) {
            .create-user-type-container {
              width: 100%;
              margin-left: 0;
              padding: 16px;
            }
            .perm-grid { grid-template-columns: 1fr; }
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
}