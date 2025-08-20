// import ChangeProfilePicture from "./ChangeProfilePicture";
// import EditProfile from "./EditProfile";
// import UpdatePassword from "./UpdatePassword";
// import DeleteAccount from "./DeleteAccount";
// import DashboardLayout from "../DashboardLayout";

// const BG = '#f8f9fa';
// const TEXT_DARK = '#191A1F';

// export default function Settings() {
//   return (
    
//     // </DashboardLayout>
//      <DashboardLayout contentStyle={{ 
//       display: 'flex',
//       flexDirection: 'column',
//       alignItems: 'center',
//       padding: '32px 20px'
//     }}>
//       <div style={{ 
//         width: '100%', 
//         maxWidth: 800, 
//         display: 'flex',
//         flexDirection: 'column',
//         alignItems: 'center',
//         marginTop:'4rem'
//       }}>
//         <h1 style={{ color: TEXT_DARK, fontWeight: 700, fontSize: 28, marginBottom: 32 , textAlign: 'center' }}>
//           Account Settings
//         </h1>
//         <div style={{ width: '100%' }}>
//           <ChangeProfilePicture />
//           <div style={{ marginBottom: 32 }} />
//           <EditProfile />
//           <UpdatePassword />
//           <DeleteAccount />
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// } 


import ChangeProfilePicture from "./ChangeProfilePicture";
import EditProfile from "./EditProfile";
import UpdatePassword from "./UpdatePassword";
import DeleteAccount from "./DeleteAccount";
import DashboardLayout from "../DashboardLayout";

const BG = '#f8f9fa';
const TEXT_DARK = '#191A1F';
const ED_TEAL = '#07A698';
const ED_TEAL_DARK = '#059a8c';
const CARD_BG = '#ffffff';
const BORDER = '#e0e0e0';
const SHADOW = '0 8px 24px rgba(0, 0, 0, 0.08)';
const HOVER_SHADOW = '0 12px 32px rgba(0, 0, 0, 0.12)';

export default function Settings() {
  return (
    <DashboardLayout contentStyle={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '32px 20px',
      minHeight: '100vh',
      background: BG,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      <div className="settings-container">
        <h1 className="settings-heading">
          Account Settings
        </h1>
        <div className="settings-content">
          <ChangeProfilePicture />
          <EditProfile />
          <UpdatePassword />
          <DeleteAccount />
        </div>
      </div>

      <style jsx>{`
        .settings-container {
          width: 100%;
          max-width: 800px;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: -40px;
          // margin-right: 15rem;
          animation: fadeIn 0.5s ease-out;
        }
        
        .settings-heading 
          color: ${TEXT_DARK};
          font-weight: 700;
          font-size: 2.5rem;
          margin-bottom: 2.5rem;
          text-align: center;
          position: relative;
          padding-bottom: 0.5rem;
          letter-spacing: -0.5px;
        }
        
        .settings-heading::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 4px;
          background: linear-gradient(90deg, ${ED_TEAL}, ${ED_TEAL_DARK});
          border-radius: 2px;
        }
        
        .settings-content {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        /* Component wrapper styles */
        .settings-content > div {
          background: ${CARD_BG};
          border-radius: 16px;
          box-shadow: ${SHADOW};
          border: 1px solid ${BORDER};
          padding: 2rem;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .settings-content > div::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 4px;
          height: 0;
          background: ${ED_TEAL};
          transition: height 0.4s ease;
        }
        
        .settings-content > div:hover {
          box-shadow: ${HOVER_SHADOW};
          transform: translateY(-2px);
        }
        
        .settings-content > div:hover::before {
          height: 100%;
        }
        
        /* Animation for page load */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Responsive design */
        @media (max-width: 768px) {
          .settings-container {
            margin-top: 1rem;
          }
          
          .settings-heading {
            font-size: 2rem;
            margin-bottom: 2rem;
          }
          
          .settings-content {
            gap: 1.5rem;
          }
          
          .settings-content > div {
            padding: 1.5rem;
            border-radius: 12px;
          }
        }
        
        @media (max-width: 480px) {
          .settings-heading {
            font-size: 1.75rem;
          }
          
          .settings-content > div {
            padding: 1.25rem;
            border-radius: 10px;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}