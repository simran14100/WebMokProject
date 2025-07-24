import ChangeProfilePicture from "./ChangeProfilePicture";
import EditProfile from "./EditProfile";
import UpdatePassword from "./UpdatePassword";
import DeleteAccount from "./DeleteAccount";

const BG = '#fff';
const TEXT_DARK = '#222';

export default function Settings() {
  return (
    <div style={{ background: BG, minHeight: '100vh', width: '100%' }}>
      <div style={{ width: '70vw', maxWidth: 1000, margin: '0 auto', padding: '32px 0' }}>
        <h1 style={{ color: TEXT_DARK, fontWeight: 700, fontSize: 28, marginBottom: 32, textAlign: 'center' }}>Account Settings</h1>
        <ChangeProfilePicture />
        <div style={{ marginBottom: 32 }} />
        <EditProfile />
        <UpdatePassword />
        <DeleteAccount />
      </div>
    </div>
  );
} 