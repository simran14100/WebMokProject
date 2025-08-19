// import React, { useEffect } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { useNavigate } from "react-router-dom";
// import { fetchUserProfile } from '../services/operations/profileApi';
// import DashboardLayout from '../components/common/DashboardLayout';

// const BG = '#f8f9fa';
// const CARD_BG = '#fff';
// const BORDER = '#e0e0e0';
// const TEXT_DARK = '#191A1F';
// const TEXT_GRAY = '#666';
// const ED_TEAL = '#07A698';
// const ED_TEAL_DARK = '#059a8c';

// const labelStyle = { color: TEXT_GRAY, fontWeight: 500, fontSize: 14, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' };
// const valueStyle = { color: TEXT_DARK, fontWeight: 600, fontSize: 16, lineHeight: '1.5' };

// const AdminProfile = () => {
//   const { user, loading } = useSelector((state) => state.profile);
//   const { token } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   // Fetch user profile when component mounts
//   useEffect(() => {
//     if (token && !user) {
//       dispatch(fetchUserProfile(token));
//     }
//   }, [token, user, dispatch]);

//   // Show loading spinner while fetching data
//   if (loading || !user) {
//     return (
//       <DashboardLayout>
//         <div style={{ 
//           display: 'flex', 
//           justifyContent: 'center', 
//           alignItems: 'center', 
//           minHeight: 'calc(100vh - 80px)',
//           background: BG 
//         }}>
//           <div style={{ textAlign: 'center', color: ED_TEAL, fontWeight: 600, fontSize: 20 }}>
//             <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
//             Loading profile...
//           </div>
//         </div>
//       </DashboardLayout>
//     );
//   }

//   // Avatar initials
//   const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

//   return (
//     <DashboardLayout>
//       <div style={{ 
//         width: '100%', 
//         maxWidth: 1200, 
//         margin: '0 auto', 
//         padding: '32px 24px',
//         overflowX: 'hidden'
//       }}>
//                  {/* Page Heading */}
//          <div style={{ 
//            textAlign: 'center', 
//            marginBottom: '32px',
//            marginTop: '-44px',
//            color: ED_TEAL,
//            fontWeight: '700',
//            fontSize: '36px',
//            letterSpacing: '-0.5px'
//          }}>
//            My Profile
//          </div>
        
//         {/* Profile Card */}
//         <div style={{ 
//           background: CARD_BG, 
//           borderRadius: 20, 
//           boxShadow: '0 10px 40px rgba(0,0,0,0.08)', 
//           border: `1px solid ${BORDER}`, 
//           padding: 48, 
//           marginBottom: 40, 
//           maxWidth: 1200, 
//           minHeight: 180, 
//           display: 'flex', 
//           alignItems: 'center', 
//           gap: 40, 
//           width: '100%',
//           position: 'relative',
//           overflow: 'hidden'
//         }}>
//           {/* Background decoration */}
//           <div style={{
//             position: 'absolute',
//             top: 0,
//             right: 0,
//             width: '200px',
//             height: '200px',
//             background: 'linear-gradient(135deg, rgba(7, 166, 152, 0.05) 0%, rgba(7, 166, 152, 0.02) 100%)',
//             borderRadius: '50%',
//             transform: 'translate(50%, -50%)',
//             zIndex: 0
//           }}></div>
          
//           {/* Avatar */}
//           <div style={{ 
//             width: 120, 
//             height: 120, 
//             borderRadius: '50%', 
//             background: 'linear-gradient(135deg, #f0f9f8 0%, #e6f7f5 100%)', 
//             display: 'flex', 
//             alignItems: 'center', 
//             justifyContent: 'center', 
//             fontSize: 48, 
//             fontWeight: 700, 
//             color: ED_TEAL, 
//             flexShrink: 0,
//             boxShadow: '0 8px 32px rgba(7, 166, 152, 0.15)',
//             border: '4px solid rgba(7, 166, 152, 0.1)',
//             position: 'relative',
//             zIndex: 1
//           }}>
//             {initials}
//           </div>
          
//           {/* Name and Email vertical stack */}
//           <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, minWidth: 0, position: 'relative', zIndex: 1 }}>
//             <div style={{ color: ED_TEAL, fontWeight: 700, fontSize: 32, marginBottom: 8, wordBreak: 'break-word', letterSpacing: '-0.5px' }}>
//               {user.firstName} {user.lastName}
//             </div>
//             <div style={{ color: TEXT_GRAY, fontSize: 18, wordBreak: 'break-all', lineHeight: '1.4' }}>
//               {user.email}
//             </div>
//           </div>
          
//           {/* Edit Profile button */}
//           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', height: '100%', position: 'relative', zIndex: 1 }}>
//                          <button style={{ 
//                background: ED_TEAL, 
//                color: '#fff', 
//                border: 'none', 
//                borderRadius: 10, 
//                fontWeight: 600, 
//                fontSize: 15, 
//                padding: '14px 28px', 
//                cursor: 'pointer', 
//                transition: 'all 0.3s ease',
//                boxShadow: '0 4px 16px rgba(7, 166, 152, 0.3)',
//                letterSpacing: '0.3px',
//                position: 'relative',
//                overflow: 'hidden'
//              }}
//                onMouseOver={e => {
//                  e.target.style.background = ED_TEAL_DARK;
//                  e.target.style.transform = 'translateY(-2px)';
//                  e.target.style.boxShadow = '0 8px 24px rgba(7, 166, 152, 0.4)';
//                  e.target.style.color = '#fff';
//                }}
//                onMouseOut={e => {
//                  e.target.style.background = ED_TEAL;
//                  e.target.style.transform = 'translateY(0)';
//                  e.target.style.boxShadow = '0 4px 16px rgba(7, 166, 152, 0.3)';
//                  e.target.style.color = '#fff';
//                }}
//               onClick={() => navigate("/dashboard/settings")}
//             >
//               Edit Profile
//             </button>
//           </div>
//         </div>

//         {/* About Card */}
//         <div style={{ 
//           background: CARD_BG, 
//           borderRadius: 20, 
//           boxShadow: '0 10px 40px rgba(0,0,0,0.08)', 
//           border: `1px solid ${BORDER}`, 
//           padding: 40, 
//           marginBottom: 40,
//           position: 'relative',
//           overflow: 'hidden'
//         }}>
//           {/* Background decoration */}
//           <div style={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             width: '100px',
//             height: '100px',
//             background: 'linear-gradient(135deg, rgba(7, 166, 152, 0.03) 0%, rgba(7, 166, 152, 0.01) 100%)',
//             borderRadius: '50%',
//             transform: 'translate(-50%, -50%)',
//             zIndex: 0
//           }}></div>
          
//           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, position: 'relative', zIndex: 1 }}>
//             <div style={{ color: ED_TEAL, fontWeight: 700, fontSize: 24, letterSpacing: '-0.3px' }}>About</div>
//             <button style={{ 
//               background: ED_TEAL, 
//               color: '#fff', 
//               border: 'none', 
//               borderRadius: 8, 
//               fontWeight: 600, 
//               fontSize: 13, 
//               padding: '12px 28px', 
//               cursor: 'pointer', 
//               transition: 'all 0.3s ease',
//               boxShadow: '0 2px 8px rgba(7, 166, 152, 0.3)',
//               letterSpacing: '0.3px',
//               position: 'relative',
//               overflow: 'hidden'
//             }}
//               onMouseOver={e => {
//                 e.target.style.background = ED_TEAL_DARK;
//                 e.target.style.transform = 'translateY(-1px)';
//                 e.target.style.boxShadow = '0 4px 12px rgba(7, 166, 152, 0.4)';
//                 e.target.style.color = '#fff';
//               }}
//               onMouseOut={e => {
//                 e.target.style.background = ED_TEAL;
//                 e.target.style.transform = 'translateY(0)';
//                 e.target.style.boxShadow = '0 2px 8px rgba(7, 166, 152, 0.3)';
//                 e.target.style.color = '#fff';
//               }}
//               onClick={() => navigate("/dashboard/settings")}
//             >
//               Edit
//             </button>
//           </div>
//           <div style={{ color: TEXT_GRAY, fontSize: 17, lineHeight: '1.6', position: 'relative', zIndex: 1 }}>
//             {user.additionalDetails?.about ? user.additionalDetails.about : 'Write Something About Yourself'}
//           </div>
//         </div>

//         {/* Personal Details Card */}
//         <div style={{ 
//           background: CARD_BG, 
//           borderRadius: 20, 
//           boxShadow: '0 10px 40px rgba(0,0,0,0.08)', 
//           border: `1px solid ${BORDER}`, 
//           padding: 40,
//           position: 'relative',
//           overflow: 'hidden'
//         }}>
//           {/* Background decoration */}
//           <div style={{
//             position: 'absolute',
//             bottom: 0,
//             right: 0,
//             width: '150px',
//             height: '150px',
//             background: 'linear-gradient(135deg, rgba(7, 166, 152, 0.03) 0%, rgba(7, 166, 152, 0.01) 100%)',
//             borderRadius: '50%',
//             transform: 'translate(50%, 50%)',
//             zIndex: 0
//           }}></div>
          
//           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, position: 'relative', zIndex: 1 }}>
//             <div style={{ color: ED_TEAL, fontWeight: 700, fontSize: 24, letterSpacing: '-0.3px' }}>Personal Details</div>
//             <button style={{ 
//               background: ED_TEAL, 
//               color: '#fff', 
//               border: 'none', 
//               borderRadius: 8, 
//               fontWeight: 600, 
//               fontSize: 13, 
//               padding: '12px 28px', 
//               cursor: 'pointer', 
//               transition: 'all 0.3s ease',
//               boxShadow: '0 2px 8px rgba(7, 166, 152, 0.3)',
//               letterSpacing: '0.3px',
//               position: 'relative',
//               overflow: 'hidden'
//             }}
//               onMouseOver={e => {
//                 e.target.style.background = ED_TEAL_DARK;
//                 e.target.style.transform = 'translateY(-1px)';
//                 e.target.style.boxShadow = '0 4px 12px rgba(7, 166, 152, 0.4)';
//                 e.target.style.color = '#fff';
//               }}
//               onMouseOut={e => {
//                 e.target.style.background = ED_TEAL;
//                 e.target.style.transform = 'translateY(0)';
//                 e.target.style.boxShadow = '0 2px 8px rgba(7, 166, 152, 0.3)';
//                 e.target.style.color = '#fff';
//               }}
//               onClick={() => navigate("/dashboard/settings")}
//             >
//               Edit
//             </button>
//           </div>
//           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, position: 'relative', zIndex: 1 }}>
//             <div style={{ padding: '20px', background: 'rgba(248, 249, 250, 0.5)', borderRadius: 12, border: '1px solid rgba(7, 166, 152, 0.1)' }}>
//               <div style={labelStyle}>First Name</div>
//               <div style={valueStyle}>{user.firstName || 'Add First Name'}</div>
//             </div>
//             <div style={{ padding: '20px', background: 'rgba(248, 249, 250, 0.5)', borderRadius: 12, border: '1px solid rgba(7, 166, 152, 0.1)' }}>
//               <div style={labelStyle}>Last Name</div>
//               <div style={valueStyle}>{user.lastName || 'Add Last Name'}</div>
//             </div>
//             <div style={{ padding: '20px', background: 'rgba(248, 249, 250, 0.5)', borderRadius: 12, border: '1px solid rgba(7, 166, 152, 0.1)' }}>
//               <div style={labelStyle}>Email</div>
//               <div style={valueStyle}>{user.email || 'Add Email'}</div>
//             </div>
//             <div style={{ padding: '20px', background: 'rgba(248, 249, 250, 0.5)', borderRadius: 12, border: '1px solid rgba(7, 166, 152, 0.1)' }}>
//               <div style={labelStyle}>Phone Number</div>
//               <div style={valueStyle}>{user.additionalDetails?.contactNumber || 'Add Contact Number'}</div>
//             </div>
//             <div style={{ padding: '20px', background: 'rgba(248, 249, 250, 0.5)', borderRadius: 12, border: '1px solid rgba(7, 166, 152, 0.1)' }}>
//               <div style={labelStyle}>Gender</div>
//               <div style={valueStyle}>{user.additionalDetails?.gender || 'Add Gender'}</div>
//             </div>
//             <div style={{ padding: '20px', background: 'rgba(248, 249, 250, 0.5)', borderRadius: 12, border: '1px solid rgba(7, 166, 152, 0.1)' }}>
//               <div style={labelStyle}>Date Of Birth</div>
//               <div style={valueStyle}>{user.additionalDetails?.dateOfBirth || 'Add a Date of Birth'}</div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default AdminProfile; 


import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { fetchUserProfile } from '../services/operations/profileApi';
import DashboardLayout from '../components/common/DashboardLayout';

// Color constants
const BG = '#f8f9fa';
const CARD_BG = '#fff';
const BORDER = '#e0e0e0';
const TEXT_DARK = '#191A1F';
const TEXT_GRAY = '#666';
const ED_TEAL = '#07A698';
const ED_TEAL_DARK = '#059a8c';
const ED_TEAL_LIGHT = '#E6F7F5';
const HOVER_SHADOW = '0 12px 24px rgba(7, 166, 152, 0.15)';
const CARD_SHADOW = '0 8px 24px rgba(0, 0, 0, 0.08)';

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
        <div className="loading-container">
          <div className="spinner"></div>
          <div className="loading-text">Loading profile...</div>
        </div>
      </DashboardLayout>
    );
  }

  // Avatar initials
  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();

  return (
    <DashboardLayout>
      <div className="profile-page-container">
        {/* Page Heading */}
        <div className="page-heading">
          My Profile
        </div>
        
        {/* Profile Card */}
        <div className="profile-card">
          {/* Background decoration */}
          <div className="card-decoration top-right"></div>
          
          {/* Avatar */}
          <div className="avatar-container">
            {initials}
          </div>
          
          {/* Name and Email vertical stack */}
          <div className="profile-info">
            <div className="profile-name">
              {user.firstName} {user.lastName}
            </div>
            <div className="profile-email">
              {user.email}
            </div>
          </div>
          
          {/* Edit Profile button */}
          <div className="profile-action">
            <button 
              className="edit-profile-btn"
              onClick={() => navigate("/dashboard/settings")}
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* About Card */}
        <div className="about-card">
          {/* Background decoration */}
          <div className="card-decoration top-left"></div>
          
          <div className="card-header">
            <div className="card-title">About</div>
            <button 
              className="edit-btn"
              onClick={() => navigate("/dashboard/settings")}
            >
              Edit
            </button>
          </div>
          <div className="about-content">
            {user.additionalDetails?.about ? user.additionalDetails.about : 'Write Something About Yourself'}
          </div>
        </div>

        {/* Personal Details Card */}
        <div className="details-card">
          {/* Background decoration */}
          <div className="card-decoration bottom-right"></div>
          
          <div className="card-header">
            <div className="card-title">Personal Details</div>
            <button 
              className="edit-btn"
              onClick={() => navigate("/dashboard/settings")}
            >
              Edit
            </button>
          </div>
          <div className="details-grid">
            <div className="detail-item">
              <div className="detail-label">First Name</div>
              <div className="detail-value">{user.firstName || 'Add First Name'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Last Name</div>
              <div className="detail-value">{user.lastName || 'Add Last Name'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Email</div>
              <div className="detail-value">{user.email || 'Add Email'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Phone Number</div>
              <div className="detail-value">{user.additionalDetails?.contactNumber || 'Add Contact Number'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Gender</div>
              <div className="detail-value">{user.additionalDetails?.gender || 'Add Gender'}</div>
            </div>
            <div className="detail-item">
              <div className="detail-label">Date Of Birth</div>
              <div className="detail-value">{user.additionalDetails?.dateOfBirth || 'Add a Date of Birth'}</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Global Styles */
        .profile-page-container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 32px 24px;
          overflow-x: hidden;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .loading-container {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          min-height: calc(100vh - 80px);
          background: ${BG};
        }
        
        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid ${ED_TEAL_LIGHT};
          border-top: 4px solid ${ED_TEAL};
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }
        
        .loading-text {
          text-align: center;
          color: ${ED_TEAL};
          font-weight: 600;
          font-size: 20px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        /* Page Heading */
        .page-heading {
          text-align: center;
          margin-bottom: 32px;
          margin-top: 1rem;
          color: ${ED_TEAL};
          font-weight: 700;
          font-size: 36px;
          letter-spacing: -0.5px;
          position: relative;
          padding-bottom: 16px;
        }
        
        .page-heading::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 4px;
          background: linear-gradient(90deg, ${ED_TEAL}, ${ED_TEAL_DARK});
          border-radius: 2px;
        }
        
        /* Card Styles */
        .profile-card, .about-card, .details-card {
          background: ${CARD_BG};
          border-radius: 20px;
          box-shadow: ${CARD_SHADOW};
          border: 1px solid ${BORDER};
          padding: 48px;
          margin-bottom: 40px;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .profile-card:hover, .about-card:hover, .details-card:hover {
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }
        
        .card-decoration {
          position: absolute;
          border-radius: 50%;
          z-index: 0;
          opacity: 0.6;
        }
        
        .top-right {
          top: 0;
          right: 0;
          width: 200px;
          height: 200px;
          background: linear-gradient(135deg, rgba(7, 166, 152, 0.08) 0%, rgba(7, 166, 152, 0.03) 100%);
          transform: translate(50%, -50%);
        }
        
        .top-left {
          top: 0;
          left: 0;
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, rgba(7, 166, 152, 0.05) 0%, rgba(7, 166, 152, 0.02) 100%);
          transform: translate(-50%, -50%);
        }
        
        .bottom-right {
          bottom: 0;
          right: 0;
          width: 150px;
          height: 150px;
          background: linear-gradient(135deg, rgba(7, 166, 152, 0.05) 0%, rgba(7, 166, 152, 0.02) 100%);
          transform: translate(50%, 50%);
        }
        
        /* Profile Card Specific Styles */
        .profile-card {
          display: flex;
          align-items: center;
          gap: 40px;
          min-height: 180px;
        }
        
        .avatar-container {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: linear-gradient(135deg, #f0f9f8 0%, #e6f7f5 100%);
          display: flex;
          align-items: center;
          justify: center;
          font-size: 48px;
          font-weight: 700;
          color: ${ED_TEAL};
          flex-shrink: 0;
          box-shadow: 0 8px 32px rgba(7, 166, 152, 0.15);
          border: 4px solid rgba(7, 166, 152, 0.1);
          position: relative;
          z-index: 1;
          transition: all 0.3s ease;
        }
        
        .avatar-container:hover {
          transform: scale(1.05);
          box-shadow: 0 12px 40px rgba(7, 166, 152, 0.25);
        }
        
        .profile-info {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex: 1;
          min-width: 0;
          position: relative;
          z-index: 1;
        }
        
        .profile-name {
          color: ${ED_TEAL};
          font-weight: 700;
          font-size: 32px;
          margin-bottom: 8px;
          word-break: break-word;
          letter-spacing: -0.5px;
          transition: color 0.3s ease;
        }
        
        .profile-email {
          color: ${TEXT_GRAY};
          font-size: 18px;
          word-break: break-all;
          line-height: 1.4;
          transition: color 0.3s ease;
        }
        
        .profile-action {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          height: 100%;
          position: relative;
          z-index: 1;
        }
        
        /* Button Styles */
        .edit-profile-btn, .edit-btn {
          background: ${ED_TEAL};
          color: #fff;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          padding: 14px 28px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 16px rgba(7, 166, 152, 0.3);
          letter-spacing: 0.3px;
          position: relative;
          overflow: hidden;
          font-size: 15px;
        }
        
        .edit-btn {
          border-radius: 8px;
          padding: 12px 28px;
          font-size: 13px;
          box-shadow: 0 2px 8px rgba(7, 166, 152, 0.3);
        }
        
        .edit-profile-btn:hover, .edit-btn:hover {
          background: ${ED_TEAL_DARK};
          transform: translateY(-2px);
          box-shadow: ${HOVER_SHADOW};
          color: #fff;
        }
        
        .edit-profile-btn:active, .edit-btn:active {
          transform: translateY(0);
        }
        
        /* Card Header */
        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          position: relative;
          z-index: 1;
        }
        
        .card-title {
          color: ${ED_TEAL};
          font-weight: 700;
          font-size: 24px;
          letter-spacing: -0.3px;
          position: relative;
          padding-bottom: 8px;
        }
        
        .card-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40px;
          height: 3px;
          background: ${ED_TEAL};
          border-radius: 2px;
        }
        
        /* About Card */
        .about-content {
          color: ${TEXT_GRAY};
          font-size: 17px;
          line-height: 1.6;
          position: relative;
          z-index: 1;
          padding: 16px;
          background: rgba(248, 249, 250, 0.5);
          border-radius: 12px;
          border: 1px solid rgba(7, 166, 152, 0.1);
          transition: all 0.3s ease;
        }
        
        .about-content:hover {
          background: rgba(248, 249, 250, 0.8);
          border-color: rgba(7, 166, 152, 0.2);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        /* Details Card */
        .details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          position: relative;
          z-index: 1;
        }
        
        .detail-item {
          padding: 24px;
          background: rgba(248, 249, 250, 0.5);
          border-radius: 12px;
          border: 1px solid rgba(7, 166, 152, 0.1);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .detail-item:hover {
          background: rgba(248, 249, 250, 0.8);
          border-color: rgba(7, 166, 152, 0.2);
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        }
        
        .detail-item::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 0;
          background: ${ED_TEAL};
          transition: height 0.3s ease;
        }
        
        .detail-item:hover::before {
          height: 100%;
        }
        
        .detail-label {
          color: ${TEXT_GRAY};
          font-weight: 500;
          font-size: 14px;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          transition: color 0.3s ease;
        }
        
        .detail-item:hover .detail-label {
          color: ${ED_TEAL};
        }
        
        .detail-value {
          color: ${TEXT_DARK};
          font-weight: 600;
          font-size: 16px;
          line-height: 1.5;
          transition: color 0.3s ease;
        }
        
        .detail-item:hover .detail-value {
          color: ${ED_TEAL_DARK};
        }
        
        /* Responsive Styles */
        @media (max-width: 1024px) {
          .profile-card {
            flex-direction: column;
            text-align: center;
            gap: 24px;
          }
          
          .profile-action {
            justify-content: center;
          }
        }
        
        @media (max-width: 768px) {
          .profile-page-container {
            padding: 24px 16px;
          }
          
          .page-heading {
            font-size: 28px;
            margin-top: -24px;
          }
          
          .profile-card, .about-card, .details-card {
            padding: 32px 24px;
          }
          
          .avatar-container {
            width: 100px;
            height: 100px;
            font-size: 36px;
          }
          
          .profile-name {
            font-size: 26px;
          }
          
          .profile-email {
            font-size: 16px;
          }
          
          .details-grid {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 480px) {
          .page-heading {
            font-size: 24px;
          }
          
          .profile-card, .about-card, .details-card {
            padding: 24px 16px;
          }
          
          .card-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
          }
          
          .edit-btn {
            align-self: flex-end;
          }
          
          .avatar-container {
            width: 80px;
            height: 80px;
            font-size: 28px;
          }
          
          .profile-name {
            font-size: 22px;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default AdminProfile;