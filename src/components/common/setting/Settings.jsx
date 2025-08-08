import ChangeProfilePicture from "./ChangeProfilePicture";
import EditProfile from "./EditProfile";
import UpdatePassword from "./UpdatePassword";
import DeleteAccount from "./DeleteAccount";
import DashboardLayout from "../DashboardLayout";

const BG = '#f8f9fa';
const TEXT_DARK = '#191A1F';

export default function Settings() {
  return (
    // <DashboardLayout>
    //   <div style={{ 
    //     width: '100%', 
    //     maxWidth: 1000, 
    //     margin: '0 auto', 
    //    marginLeft: isInstructor ? '250px' : '100px', // Adjust based on user type
    //     padding: '32px 20px',
    //     display: 'flex',
    //     flexDirection: 'column',
    //     alignItems: 'center'
    //   }}>
    //     <h1 style={{ color: TEXT_DARK, fontWeight: 700, fontSize: 28, marginBottom: 32, textAlign: 'center' }}>Account Settings</h1>
    //     <div style={{ width: '100%', maxWidth: 800 }}>
    //       <ChangeProfilePicture />
    //       <div style={{ marginBottom: 32 }} />
    //       <EditProfile />
    //       <UpdatePassword />
    //       <DeleteAccount />
    //     </div>
    //   </div>
    // </DashboardLayout>
     <DashboardLayout contentStyle={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '32px 20px'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: 800, 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop:'4rem'
      }}>
        <h1 style={{ color: TEXT_DARK, fontWeight: 700, fontSize: 28, marginBottom: 32 , textAlign: 'center' }}>
          Account Settings
        </h1>
        <div style={{ width: '100%' }}>
          <ChangeProfilePicture />
          <div style={{ marginBottom: 32 }} />
          <EditProfile />
          <UpdatePassword />
          <DeleteAccount />
        </div>
      </div>
    </DashboardLayout>
  );
} 