import { FiTrash2 } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { deleteProfile } from "../../../services/operations/profileApi";

const CARD_BG = '#fff';
const BORDER = '#e0e0e0';
const TEXT_DARK = '#222';
const RED = '#e53935';




export default function DeleteAccount() {
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  function handleDeleteAccount() {
    dispatch(deleteProfile(token, navigate));
  }

  return (
    <div style={{ background: CARD_BG, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: `1px solid ${BORDER}`, padding: 32, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 24 }}>
      <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#ffeaea', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FiTrash2 style={{ fontSize: 32, color: RED }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, color: RED, fontSize: 20, marginBottom: 8 }}>Delete Account</div>
        <div style={{ color: TEXT_DARK, marginBottom: 12 }}>
          <p>Would you like to delete your account?</p>
          <p>This action is <b>permanent</b> and will remove all your data.</p>
        </div>
        <button
          type="button"
          onClick={handleDeleteAccount}
          style={{ background: RED, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
} 