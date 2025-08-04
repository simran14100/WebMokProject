import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { fetchUserProfile } from '../services/operations/profileApi';
import DashboardLayout from '../components/common/DashboardLayout';

const BG = '#f8f9fa';
const CARD_BG = '#fff';
const BORDER = '#e0e0e0';
const TEXT_DARK = '#191A1F';
const TEXT_GRAY = '#666';
const ED_TEAL = '#07A698';
const ED_TEAL_DARK = '#059a8c';

const labelStyle = { color: TEXT_GRAY, fontWeight: 500, fontSize: 15, marginBottom: 2 };
const valueStyle = { color: TEXT_DARK, fontWeight: 600, fontSize: 16 };

const AdminProfile = () => {
  const { user, loading } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fetch user profile when component mounts
  useEffect(() => {
    if (token && !user) {
      dispatch(fetchUserProfile(token));
    }
  }, [token, user, dispatch]);

  // Show loading spinner while fetching data
  if (loading || !user) {
    return (
      <DashboardLayout>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: 'calc(100vh - 80px)',
          background: BG 
        }}>
          <div style={{ textAlign: 'center', color: ED_TEAL, fontWeight: 600, fontSize: 20 }}>
            <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
            Loading profile...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Avatar initials
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

  return (
    <DashboardLayout>
      <div style={{ 
        width: '100%', 
        maxWidth: 1100, 
        margin: '0 auto', 
        padding: '22px 0',
        overflowX: 'hidden'
      }}>
          {/* Profile Card */}
          <div style={{ background: CARD_BG, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: `1px solid ${BORDER}`, padding: 36, marginBottom: 32, maxWidth: 1100, minHeight: 160, display: 'flex', alignItems: 'center', gap: 32, width: '100%' }}>
            {/* Avatar */}
            <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#f0f9f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, fontWeight: 700, color: ED_TEAL, flexShrink: 0 }}>
              {initials}
            </div>
            {/* Name and Email vertical stack */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, minWidth: 0 }}>
              <div style={{ color: ED_TEAL, fontWeight: 700, fontSize: 26, marginBottom: 6, wordBreak: 'break-word' }}>{user.firstName} {user.lastName}</div>
              <div style={{ color: TEXT_GRAY, fontSize: 17, wordBreak: 'break-all' }}>{user.email}</div>
            </div>
            {/* Edit Profile button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
              <button style={{ background: ED_TEAL, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 17, padding: '10px 28px', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseOver={e => e.target.style.background = ED_TEAL_DARK}
                onMouseOut={e => e.target.style.background = ED_TEAL}
                onClick={() => navigate("/dashboard/settings")}
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* About Card */}
          <div style={{ background: CARD_BG, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: `1px solid ${BORDER}`, padding: 32, marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ color: ED_TEAL, fontWeight: 700, fontSize: 20 }}>About</div>
              <button style={{ background: ED_TEAL, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, padding: '7px 22px', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseOver={e => e.target.style.background = ED_TEAL_DARK}
                onMouseOut={e => e.target.style.background = ED_TEAL}
                onClick={() => navigate("/dashboard/settings")}
              >
                Edit
              </button>
            </div>
            <div style={{ color: TEXT_GRAY, fontSize: 16 }}>
              {user.additionalDetails?.about ? user.additionalDetails.about : 'Write Something About Yourself'}
            </div>
          </div>

          {/* Personal Details Card */}
          <div style={{ background: CARD_BG, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: `1px solid ${BORDER}`, padding: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div style={{ color: ED_TEAL, fontWeight: 700, fontSize: 20 }}>Personal Details</div>
              <button style={{ background: ED_TEAL, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 15, padding: '7px 22px', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseOver={e => e.target.style.background = ED_TEAL_DARK}
                onMouseOut={e => e.target.style.background = ED_TEAL}
                onClick={() => navigate("/dashboard/settings")}
              >
                Edit
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div>
                <div style={labelStyle}>First Name</div>
                <div style={valueStyle}>{user.firstName || 'Add First Name'}</div>
              </div>
              <div>
                <div style={labelStyle}>Last Name</div>
                <div style={valueStyle}>{user.lastName || 'Add Last Name'}</div>
              </div>
              <div>
                <div style={labelStyle}>Email</div>
                <div style={valueStyle}>{user.email || 'Add Email'}</div>
              </div>
              <div>
                <div style={labelStyle}>Phone Number</div>
                <div style={valueStyle}>{user.additionalDetails?.contactNumber || 'Add Contact Number'}</div>
              </div>
              <div>
                <div style={labelStyle}>Gender</div>
                <div style={valueStyle}>{user.additionalDetails?.gender || 'Add Gender'}</div>
              </div>
              <div>
                <div style={labelStyle}>Date Of Birth</div>
                <div style={valueStyle}>{user.additionalDetails?.dateOfBirth || 'Add a Date of Birth'}</div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
  );
};

export default AdminProfile; 