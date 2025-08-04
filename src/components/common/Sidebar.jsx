import { useState } from "react";
import { VscAccount, VscDashboard, VscSettingsGear, VscSignOut, VscChecklist } from "react-icons/vsc";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/operations/authApi";
import ConfirmationModal from "./ConfirmationModal";
import Logo from "../../assets/img/logo/logo-1.png";

const ED_TEAL = "#07A698"; // EdCare teal for sidebar
const ED_TEAL_DARK = "#059a8c";
const BORDER = "#e0e0e0";
const TEXT_DARK = "#191A1F";

const adminSidebarLinks = [
  { name: "Dashboard", path: "/admin/dashboard", icon: <VscDashboard style={{ fontSize: 20, color: ED_TEAL }} /> },
  { name: "Admission Confirm", path: "/admin/admission-confirmation", icon: <VscChecklist style={{ fontSize: 20, color: ED_TEAL }} /> },
  { name: "Enrolled Students", path: "/admin/enrolled-students", icon: <VscChecklist style={{ fontSize: 20, color: ED_TEAL }} /> },
  { name: "Manage Users", path: "/admin/users", icon: <VscAccount style={{ fontSize: 20, color: ED_TEAL }} /> },
  { name: "Manage Categories", path: "/admin/categories", icon: <VscSettingsGear style={{ fontSize: 20, color: ED_TEAL }} /> },
];

const studentSidebarLinks = [
  { name: "My Profile", path: "/dashboard/my-profile", icon: <VscAccount style={{ fontSize: 20, color: ED_TEAL }} /> },
  { name: "Cart", path: "/dashboard/cart", icon: <VscChecklist style={{ fontSize: 20, color: ED_TEAL }} /> },
  { name: "Settings", path: "/dashboard/settings", icon: <VscSettingsGear style={{ fontSize: 20, color: ED_TEAL }} /> },
  { name: "Active Courses", path: "/dashboard/active-courses", icon: <VscChecklist style={{ fontSize: 20, color: ED_TEAL }} /> },
];

const instructorSidebarLinks = [
  { name: "My Profile", path: "/dashboard/my-profile", icon: <VscAccount style={{ fontSize: 20, color: ED_TEAL }} /> },
  { name: "Dashboard", path: "/instructor/dashboard", icon: <VscDashboard style={{ fontSize: 20, color: ED_TEAL }} /> },
  { name: "Cart", path: "/dashboard/cart", icon: <VscChecklist style={{ fontSize: 20, color: ED_TEAL }} /> },
  { name: "Settings", path: "/dashboard/settings", icon: <VscSettingsGear style={{ fontSize: 20, color: ED_TEAL }} /> },
];

const getSidebarLinks = (user) => {
  if (user?.accountType === "Instructor") return [
    { name: "My Profile", path: "/dashboard/my-profile", icon: <VscAccount style={{ fontSize: 20, color: ED_TEAL }} /> },
    { name: "Enrolled Students", path: "/dashboard/enrolled-students", icon: <VscChecklist style={{ fontSize: 20, color: ED_TEAL }} /> },
    { name: "My Courses", path: "/instructor/my-courses", icon: <VscChecklist style={{ fontSize: 20, color: ED_TEAL }} /> },
    { name: "Add a Course", path: "/instructor/add-course", icon: <VscChecklist style={{ fontSize: 20, color: ED_TEAL }} /> },
    { name: "Cart", path: "/dashboard/cart", icon: <VscChecklist style={{ fontSize: 20, color: ED_TEAL }} /> },
    { name: "Settings", path: "/dashboard/settings", icon: <VscSettingsGear style={{ fontSize: 20, color: ED_TEAL }} /> },
  ];
  if (user?.accountType === "Admin" || user?.accountType === "SuperAdmin") return [
    { name: "Dashboard", path: "/admin/dashboard", icon: <VscDashboard style={{ fontSize: 20, color: ED_TEAL }} /> },
    { name: "Admission Confirm", path: "/admin/admission-confirmation", icon: <VscChecklist style={{ fontSize: 20, color: ED_TEAL }} /> },
    { name: "Enrolled Students", path: "/admin/enrolled-students", icon: <VscChecklist style={{ fontSize: 20, color: ED_TEAL }} /> },
    { name: "Manage Users", path: "/admin/users", icon: <VscAccount style={{ fontSize: 20, color: ED_TEAL }} /> },
    { name: "Manage Categories", path: "/admin/categories", icon: <VscSettingsGear style={{ fontSize: 20, color: ED_TEAL }} /> },
    { name: "Settings", path: "/admin/settings", icon: <VscSettingsGear style={{ fontSize: 20, color: ED_TEAL }} /> },
  ];
  return [
    { name: "My Profile", path: "/dashboard/my-profile", icon: <VscAccount style={{ fontSize: 20, color: ED_TEAL }} /> },
    { name: "Active Courses", path: "/dashboard/active-courses", icon: <VscChecklist style={{ fontSize: 20, color: ED_TEAL }} /> },
    { name: "Cart", path: "/dashboard/cart", icon: <VscChecklist style={{ fontSize: 20, color: ED_TEAL }} /> },
    { name: "Settings", path: "/dashboard/settings", icon: <VscSettingsGear style={{ fontSize: 20, color: ED_TEAL }} /> },
  ];
};

export default function Sidebar() {
  const { user, loading: profileLoading } = useSelector((state) => state.profile);
  const { loading: authLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [confirmationModal, setConfirmationModal] = useState(null);

  // Debug log for user and accountType
  console.log('Sidebar user:', user);
  console.log('Sidebar user.accountType:', user?.accountType);

     if (profileLoading || authLoading) {
     return (
       <div style={{
         position: 'fixed',
         left: 0,
         top: 120,
         height: 'calc(100vh - 120px)',
         width: 220,
         display: "grid",
         alignItems: "center",
         borderRight: `1px solid ${BORDER}`,
         background: "#fff",
         zIndex: 100
       }}>
         <div className="spinner"></div>
       </div>
     );
   }

  return (
    <>
             <div style={{
         position: 'fixed',
         left: 0,
         top: 120, // navbar height in px - increased to prevent overlap
         height: 'calc(100vh - 120px)',
         width: 220,
         display: 'flex',
         flexDirection: 'column',
         borderRight: `1px solid ${BORDER}`,
         background: '#fff',
         padding: '2rem 0',
         zIndex: 100,
         boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
         overflowY: 'auto', // Allow sidebar to scroll if needed
       }}>
        {/* No brand/company name at the top */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 14 }}>
          {getSidebarLinks(user).map((link) => (
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
              onMouseOver={e => {
                e.currentTarget.style.background = "#f0f9f8";
                e.currentTarget.style.color = ED_TEAL;
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = "none";
                e.currentTarget.style.color = TEXT_DARK;
              }}
            >
              {link.icon}
              <span>{link.name}</span>
            </button>
          ))}
        </div>
        <div style={{ margin: "24px 0", height: 1, width: "85%", background: BORDER, alignSelf: "center" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 24, paddingRight: 24, marginBottom: 24 }}>
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
            }}
          >
            <VscSignOut style={{ fontSize: 20, color: ED_TEAL }} />
            <span>Logout</span>
          </button>
        </div>
      </div>
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  );
} 