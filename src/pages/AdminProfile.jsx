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

const labelStyle = { color: TEXT_GRAY, fontWeight: 500, fontSize: 14, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' };
const valueStyle = { color: TEXT_DARK, fontWeight: 600, fontSize: 16, lineHeight: '1.5' };

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
        maxWidth: 1200, 
        margin: '0 auto', 
        padding: '32px 24px',
        overflowX: 'hidden'
      }}>
                 {/* Page Heading */}
         <div style={{ 
           textAlign: 'center', 
           marginBottom: '32px',
           marginTop: '-44px',
           color: ED_TEAL,
           fontWeight: '700',
           fontSize: '36px',
           letterSpacing: '-0.5px'
         }}>
           My Profile
         </div>
        
        {/* Profile Card */}
        <div style={{ 
          background: CARD_BG, 
          borderRadius: 20, 
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)', 
          border: `1px solid ${BORDER}`, 
          padding: 48, 
          marginBottom: 40, 
          maxWidth: 1200, 
          minHeight: 180, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 40, 
          width: '100%',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background decoration */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '200px',
            height: '200px',
            background: 'linear-gradient(135deg, rgba(7, 166, 152, 0.05) 0%, rgba(7, 166, 152, 0.02) 100%)',
            borderRadius: '50%',
            transform: 'translate(50%, -50%)',
            zIndex: 0
          }}></div>
          
          {/* Avatar */}
          <div style={{ 
            width: 120, 
            height: 120, 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #f0f9f8 0%, #e6f7f5 100%)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: 48, 
            fontWeight: 700, 
            color: ED_TEAL, 
            flexShrink: 0,
            boxShadow: '0 8px 32px rgba(7, 166, 152, 0.15)',
            border: '4px solid rgba(7, 166, 152, 0.1)',
            position: 'relative',
            zIndex: 1
          }}>
            {initials}
          </div>
          
          {/* Name and Email vertical stack */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
            <div style={{ color: ED_TEAL, fontWeight: 700, fontSize: 32, marginBottom: 8, wordBreak: 'break-word', letterSpacing: '-0.5px' }}>
              {user.firstName} {user.lastName}
            </div>
            <div style={{ color: TEXT_GRAY, fontSize: 18, wordBreak: 'break-all', lineHeight: '1.4' }}>
              {user.email}
            </div>
          </div>
          
          {/* Edit Profile button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%', position: 'relative', zIndex: 1 }}>
                         <button style={{ 
               background: ED_TEAL, 
               color: '#fff', 
               border: 'none', 
               borderRadius: 10, 
               fontWeight: 600, 
               fontSize: 15, 
               padding: '14px 28px', 
               cursor: 'pointer', 
               transition: 'all 0.3s ease',
               boxShadow: '0 4px 16px rgba(7, 166, 152, 0.3)',
               letterSpacing: '0.3px',
               position: 'relative',
               overflow: 'hidden'
             }}
               onMouseOver={e => {
                 e.target.style.background = ED_TEAL_DARK;
                 e.target.style.transform = 'translateY(-2px)';
                 e.target.style.boxShadow = '0 8px 24px rgba(7, 166, 152, 0.4)';
                 e.target.style.color = '#fff';
               }}
               onMouseOut={e => {
                 e.target.style.background = ED_TEAL;
                 e.target.style.transform = 'translateY(0)';
                 e.target.style.boxShadow = '0 4px 16px rgba(7, 166, 152, 0.3)';
                 e.target.style.color = '#fff';
               }}
              onClick={() => navigate("/dashboard/settings")}
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* About Card */}
        <div style={{ 
          background: CARD_BG, 
          borderRadius: 20, 
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)', 
          border: `1px solid ${BORDER}`, 
          padding: 40, 
          marginBottom: 40,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background decoration */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100px',
            height: '100px',
            background: 'linear-gradient(135deg, rgba(7, 166, 152, 0.03) 0%, rgba(7, 166, 152, 0.01) 100%)',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 0
          }}></div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, position: 'relative', zIndex: 1 }}>
            <div style={{ color: ED_TEAL, fontWeight: 700, fontSize: 24, letterSpacing: '-0.3px' }}>About</div>
            <button style={{ 
              background: ED_TEAL, 
              color: '#fff', 
              border: 'none', 
              borderRadius: 8, 
              fontWeight: 600, 
              fontSize: 13, 
              padding: '12px 28px', 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(7, 166, 152, 0.3)',
              letterSpacing: '0.3px',
              position: 'relative',
              overflow: 'hidden'
            }}
              onMouseOver={e => {
                e.target.style.background = ED_TEAL_DARK;
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(7, 166, 152, 0.4)';
                e.target.style.color = '#fff';
              }}
              onMouseOut={e => {
                e.target.style.background = ED_TEAL;
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(7, 166, 152, 0.3)';
                e.target.style.color = '#fff';
              }}
              onClick={() => navigate("/dashboard/settings")}
            >
              Edit
            </button>
          </div>
          <div style={{ color: TEXT_GRAY, fontSize: 17, lineHeight: '1.6', position: 'relative', zIndex: 1 }}>
            {user.additionalDetails?.about ? user.additionalDetails.about : 'Write Something About Yourself'}
          </div>
        </div>

        {/* Personal Details Card */}
        <div style={{ 
          background: CARD_BG, 
          borderRadius: 20, 
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)', 
          border: `1px solid ${BORDER}`, 
          padding: 40,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background decoration */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: '150px',
            height: '150px',
            background: 'linear-gradient(135deg, rgba(7, 166, 152, 0.03) 0%, rgba(7, 166, 152, 0.01) 100%)',
            borderRadius: '50%',
            transform: 'translate(50%, 50%)',
            zIndex: 0
          }}></div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, position: 'relative', zIndex: 1 }}>
            <div style={{ color: ED_TEAL, fontWeight: 700, fontSize: 24, letterSpacing: '-0.3px' }}>Personal Details</div>
            <button style={{ 
              background: ED_TEAL, 
              color: '#fff', 
              border: 'none', 
              borderRadius: 8, 
              fontWeight: 600, 
              fontSize: 13, 
              padding: '12px 28px', 
              cursor: 'pointer', 
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(7, 166, 152, 0.3)',
              letterSpacing: '0.3px',
              position: 'relative',
              overflow: 'hidden'
            }}
              onMouseOver={e => {
                e.target.style.background = ED_TEAL_DARK;
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(7, 166, 152, 0.4)';
                e.target.style.color = '#fff';
              }}
              onMouseOut={e => {
                e.target.style.background = ED_TEAL;
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(7, 166, 152, 0.3)';
                e.target.style.color = '#fff';
              }}
              onClick={() => navigate("/dashboard/settings")}
            >
              Edit
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, position: 'relative', zIndex: 1 }}>
            <div style={{ padding: '20px', background: 'rgba(248, 249, 250, 0.5)', borderRadius: 12, border: '1px solid rgba(7, 166, 152, 0.1)' }}>
              <div style={labelStyle}>First Name</div>
              <div style={valueStyle}>{user.firstName || 'Add First Name'}</div>
            </div>
            <div style={{ padding: '20px', background: 'rgba(248, 249, 250, 0.5)', borderRadius: 12, border: '1px solid rgba(7, 166, 152, 0.1)' }}>
              <div style={labelStyle}>Last Name</div>
              <div style={valueStyle}>{user.lastName || 'Add Last Name'}</div>
            </div>
            <div style={{ padding: '20px', background: 'rgba(248, 249, 250, 0.5)', borderRadius: 12, border: '1px solid rgba(7, 166, 152, 0.1)' }}>
              <div style={labelStyle}>Email</div>
              <div style={valueStyle}>{user.email || 'Add Email'}</div>
            </div>
            <div style={{ padding: '20px', background: 'rgba(248, 249, 250, 0.5)', borderRadius: 12, border: '1px solid rgba(7, 166, 152, 0.1)' }}>
              <div style={labelStyle}>Phone Number</div>
              <div style={valueStyle}>{user.additionalDetails?.contactNumber || 'Add Contact Number'}</div>
            </div>
            <div style={{ padding: '20px', background: 'rgba(248, 249, 250, 0.5)', borderRadius: 12, border: '1px solid rgba(7, 166, 152, 0.1)' }}>
              <div style={labelStyle}>Gender</div>
              <div style={valueStyle}>{user.additionalDetails?.gender || 'Add Gender'}</div>
            </div>
            <div style={{ padding: '20px', background: 'rgba(248, 249, 250, 0.5)', borderRadius: 12, border: '1px solid rgba(7, 166, 152, 0.1)' }}>
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