import ChangeProfilePicture from "./ChangeProfilePicture";
import EditProfile from "./EditProfile";
import UpdatePassword from "./UpdatePassword";
import DeleteAccount from "./DeleteAccount";
import Sidebar from "../Sidebar";

const BG = '#fff';
const TEXT_DARK = '#222';

export default function Settings() {
  return (
    <div style={{ background: BG, minHeight: '100vh', display: 'flex' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 600, margin: '0 auto', padding: '32px 0' }}>
          <h1 style={{ color: TEXT_DARK, fontWeight: 700, fontSize: 28, marginBottom: 32, textAlign: 'center' }}>Account Settings</h1>
          <ChangeProfilePicture />
          <EditProfile />
          <UpdatePassword />
          <DeleteAccount />
        </div>
      </div>
    </div>
  );
} 