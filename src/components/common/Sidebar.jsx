import { useState } from "react";
import { VscAccount, VscDashboard, VscSettingsGear, VscSignOut, VscChecklist } from "react-icons/vsc";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/operations/authApi";
import ConfirmationModal from "./ConfirmationModal";
import Logo from "../../assets/Logo/Logo-Full-Light.png";

const TAWKTO_GREEN = "#009e5c"; // dark green for sidebar
const BORDER = "#e0e0e0";
const TEXT_DARK = "#222";

const adminSidebarLinks = [
  { name: "My Profile", path: "/dashboard/my-profile", icon: <VscAccount style={{ fontSize: 20, color: TAWKTO_GREEN }} /> },
  { name: "Dashboard", path: "/admin/dashboard", icon: <VscDashboard style={{ fontSize: 20, color: TAWKTO_GREEN }} /> },
  { name: "Admission Confirm", path: "/admin/admission-confirmation", icon: <VscChecklist style={{ fontSize: 20, color: TAWKTO_GREEN }} /> },
  { name: "Settings", path: "/dashboard/settings", icon: <VscSettingsGear style={{ fontSize: 20, color: TAWKTO_GREEN }} /> },
];

export default function Sidebar() {
  const { user, loading: profileLoading } = useSelector((state) => state.profile);
  const { loading: authLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [confirmationModal, setConfirmationModal] = useState(null);

  if (profileLoading || authLoading) {
    return (
      <div style={{
        height: "calc(100vh - 3.5rem)",
        minWidth: 220,
        display: "grid",
        alignItems: "center",
        borderRight: `1px solid ${BORDER}`,
        background: "#fff"
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <div style={{
        height: "calc(100vh - 3.5rem)",
        minWidth: 220,
        display: "flex",
        flexDirection: "column",
        borderRight: `1px solid ${BORDER}`,
        background: "#fff",
        padding: "2.5rem 0"
      }}>
        {/* No brand/company name at the top */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          {adminSidebarLinks.map((link) => (
            <button
              key={link.name}
              onClick={() => navigate(link.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 24px",
                background: "none",
                border: "none",
                borderRadius: 8,
                color: TEXT_DARK,
                fontWeight: 600,
                fontSize: 16,
                cursor: "pointer",
                transition: "background 0.2s, color 0.2s",
                textAlign: "left",
              }}
              onMouseOver={e => e.currentTarget.style.background = "#f9fefb"}
              onMouseOut={e => e.currentTarget.style.background = "none"}
            >
              {link.icon}
              <span>{link.name}</span>
            </button>
          ))}
        </div>
        <div style={{ margin: "24px 0", height: 1, width: "85%", background: BORDER, alignSelf: "center" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={() =>
              setConfirmationModal({
                text1: "Are you sure?",
                text2: "You will be logged out of your account.",
                btn1Text: "Logout",
                btn2Text: "Cancel",
                btn1Handler: () => dispatch(logout(navigate)),
                btn2Handler: () => setConfirmationModal(null),
              })
            }
            style={{
              padding: "10px 0",
              fontSize: 15,
              fontWeight: 600,
              color: TEXT_DARK,
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginLeft: 24
            }}
          >
            <VscSignOut style={{ fontSize: 20, color: TAWKTO_GREEN }} />
            <span>Logout</span>
          </button>
        </div>
      </div>
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  );
} 