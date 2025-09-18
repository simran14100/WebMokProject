import { useState } from "react";
import {
  VscDashboard,
  VscFiles,
  VscOrganization,
  VscGift,
  VscAccount,
  VscGear,
  VscListTree,
  VscListFlat,
  VscVersions,
  VscChevronRight,
  VscSignOut,
  VscChecklist,
  VscSettingsGear,
  VscBook,
  VscLibrary,
  VscMortarBoard,
  VscBriefcase,
  VscListSelection,
  VscListUnordered,
  VscHistory,
  VscAdd,
  VscVerified,
  VscHome,
  VscPerson,
  VscFileSubmodule,
  VscCalendar,
  VscGraph,
  VscBell,
} from "react-icons/vsc";
import { FaRegMoneyBillAlt, FaRegFileAlt, FaTasks, FaSchool } from "react-icons/fa";
import { MdOutlineManageAccounts, MdPayment, MdSummarize } from "react-icons/md";
import { RiMoneyDollarCircleLine } from "react-icons/ri";

import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/operations/authApi";
import ConfirmationModal from "./ConfirmationModal";
import SidebarLink from "./SidebarLink";

const ED_TEAL = "#07A698"; // EdCare teal for sidebar
const ED_TEAL_DARK = "#059a8c";
const BORDER = "#e0e0e0";
const TEXT_DARK = "#191A1F";

// Helper: detect if current user is a student created by admin
const isAdminCreatedStudent = (user) => {
  if (!user) return false;
  // Common flags we may receive from backend
  const flags = [
    user.createdByAdmin,
    user.adminCreated,
    user.isAdminCreated,
    user.created_by_admin,
  ];
  if (flags.some(Boolean)) return true;
  // Creator/source fields
  const by = (user.createdBy || user.created_by || user.meta?.createdBy || user.meta?.creator || '').toString().toLowerCase();
  const src = (user.source || user.signupSource || user.signup_source || '').toString().toLowerCase();
  return by === 'admin' || by === 'administrator' || src === 'admin' || src === 'administrator';
};

const getSidebarLinks = (user, variant = 'default') => {
  // Define default student links
  const studentLinks = [
    {
      id: 1,
      name: "My Profile",
      path: "/dashboard/my-profile",
      icon: <VscAccount style={{ fontSize: 20, color: ED_TEAL }} />,
    },
    {
      id: 2,
      name: "Notifications",
      path: "/dashboard/notifications",
      icon: <VscBell style={{ fontSize: 20, color: ED_TEAL }} />,
    },
    {
      id: 3,
      name: "Enrolled Courses",
      path: "/dashboard/enrolled-courses",
      icon: <VscLibrary style={{ fontSize: 20, color: ED_TEAL }} />,
    },
    {
      id: 4,
      name: "Live Classes",
      path: "/dashboard/live-classes",
      icon: <VscCalendar style={{ fontSize: 20, color: ED_TEAL }} />,
    },
    // Assignments appears only for students created by admin
    ...(isAdminCreatedStudent(user) ? [{
      id: 5,
      name: "Assignments",
      path: "/dashboard/assignments",
      icon: <VscChecklist style={{ fontSize: 20, color: ED_TEAL }} />,
    }] : []),
    {
      id: 6,
      name: "Cart",
      path: "/dashboard/cart",
      icon: <VscBriefcase style={{ fontSize: 20, color: ED_TEAL }} />,
    },
    {
      id: 7,
      name: "Settings",
      path: "/dashboard/settings",
      icon: <VscGear style={{ fontSize: 20, color: ED_TEAL }} />,
    }
  ];
  
  // Return early for specific variants or user types
  if ((variant === 'university' || variant === 'EnrolledStudents') && user?.isUniversityStudent) {
    return [
      { 
        id: 1, 
        name: 'Account details', 
        path: '/EnrolledStudents/accounts', 
        icon: <VscChecklist style={{ fontSize: 20, color: ED_TEAL }} /> 
      },
      { 
        id: 2, 
        name: 'Document Upload', 
        path: '/EnrolledStudents/document', 
        icon: <VscChecklist style={{ fontSize: 20, color: ED_TEAL }} /> 
      },
      { 
        id: 3, 
        name: 'Leave Request', 
        path: '/EnrolledStudents/leave-requests', 
        icon: <VscChecklist style={{ fontSize: 20, color: ED_TEAL }} /> 
      },
      { 
        id: 4, 
        name: 'Time Table', 
        path: '/EnrolledStudents/Timetable', 
        icon: <FaTasks style={{ fontSize: 20, color: ED_TEAL }} /> 
      },
      { 
        id: 5, 
        name: 'Exam Schedule', 
        path: '/EnrolledStudents/exam-schedule', 
        icon: <FaRegFileAlt style={{ fontSize: 20, color: ED_TEAL }} /> 
      },
      { 
        id: 6, 
        name: 'Results', 
        path: '/EnrolledStudents/results', 
        icon: <VscGraph style={{ fontSize: 20, color: ED_TEAL }} /> 
      },
      { 
        id: 7, 
        name: 'Fees & Payments', 
        path: '/EnrolledStudents/fees', 
        icon: <FaRegMoneyBillAlt style={{ fontSize: 20, color: ED_TEAL }} /> 
      }
     
    ];
  }
  
  // PhD Admin sidebar for SuperAdmin
  if (variant === 'phd' && (user?.accountType === 'SuperAdmin' || user?.accountType === 'Admin')) {
    return [
      // { id: 1, name: 'Dashboard', path: '/phd-admin', icon: <VscDashboard style={{ fontSize: 20, color: ED_TEAL }} /> },
      { id: 2, name: 'Session Management', path: '/phd-admin/session-management', icon: <VscCalendar style={{ fontSize: 20, color: ED_TEAL }} /> },
      { id: 3, name: 'Department Management', path: '/phd-admin/department', icon: <VscOrganization style={{ fontSize: 20, color: ED_TEAL }} /> },
      { id: 4, name: 'Subject Management', path: '/phd-admin/subjects', icon: <VscBook style={{ fontSize: 20, color: ED_TEAL }} /> },
      { id: 5, name: 'New Applications', path: '/phd-admin/applications', icon: <VscFiles style={{ fontSize: 20, color: ED_TEAL }} /> },
      // { id: 6, name: 'Entrance', path: '/phd-admin/entrance', icon: <VscHome style={{ fontSize: 20, color: ED_TEAL }} /> },
      { id: 7, name: 'Pro Enrolled Students', path: '/phd-admin/pro-enrolled', icon: <VscPerson style={{ fontSize: 20, color: ED_TEAL }} /> },
      { id: 8, name: 'Paid Fee', path: '/phd-admin/paid-fee', icon: <VscGift style={{ fontSize: 20, color: ED_TEAL }} /> },
      {
        id: 9,
        name: 'Coursework',
        icon: <VscLibrary style={{ fontSize: 20, color: ED_TEAL }} />,
        subLinks: [
          { name: 'Coursework Slot', path: '/phd-admin/coursework/slot' },
          { name: 'Coursework Papers', path: '/phd-admin/coursework/papers' },
          { name: 'Coursework Datesheet', path: '/phd-admin/coursework/datesheet' },
          { name: 'Exam Result', path: '/phd-admin/coursework/results' },
        ],
      },
      // { id: 10, name: 'Enrolled Students', path: '/phd-admin/enrolled-students', icon: <VscMortarBoard style={{ fontSize: 20, color: ED_TEAL }} /> },
      { id: 11, name: 'Student Report', path: '/phd-admin/student-reports', icon: <VscGraph style={{ fontSize: 20, color: ED_TEAL }} /> },
      { id: 12, name: 'Guide Management', path: '/phd-admin/guides', icon: <VscPerson style={{ fontSize: 20, color: ED_TEAL }} /> },
      { id: 13, name: 'RAC Members', path: '/phd-admin/rac-members', icon: <VscListSelection style={{ fontSize: 20, color: ED_TEAL }} /> },
      { id: 14, name: 'External Experts', path: '/phd-admin/experts', icon: <VscAccount style={{ fontSize: 20, color: ED_TEAL }} /> },
      { id: 15, name: 'Users Management', path: '/phd-admin/users', icon: <VscAccount style={{ fontSize: 20, color: ED_TEAL }} /> },
      { id: 16, name: 'Final Data', path: '/phd-admin/final-data', icon: <VscAccount style={{ fontSize: 20, color: ED_TEAL }} /> },
      { id: 17, name: 'Honorary Registration', path: '/phd-admin/honorary', icon: <VscAccount style={{ fontSize: 20, color: ED_TEAL }} /> },
    
    ];

  }

  // UG/PG Admin sidebar for SuperAdmin (centralized here)
  if (variant === 'ugpg' && (user?.accountType === 'SuperAdmin')) {
    return [
      { id: 100, name: 'MAIN', isHeader: true, icon: <VscDashboard style={{ fontSize: 20, color: ED_TEAL }} /> },
      { id: 101, name: 'Dashboard', path: '/ugpg-admin', icon: <VscDashboard style={{ fontSize: 20, color: ED_TEAL }} /> },
      { 
        id: 102, 
        name: 'Settings', 
        icon: <VscGear style={{ fontSize: 20, color: ED_TEAL }} />, 
        subLinks: [
          { name: 'Users', path: '/ugpg-admin/teachers', icon: <VscAccount style={{ fontSize: 20, color: ED_TEAL }} /> },
          { name: 'School', path: '/ugpg-admin/settings/school', icon: <VscOrganization style={{ fontSize: 20, color: ED_TEAL }} /> },
          { name: 'Languages', path: '/ugpg-admin/settings/languages', icon: <VscBook style={{ fontSize: 20, color: ED_TEAL }} /> },
          { name: 'States', path: '/ugpg-admin/settings/states', icon: <VscListTree style={{ fontSize: 20, color: ED_TEAL }} /> },
          { name: 'Leave Request', path: '/ugpg-admin/settings/leave-request', icon: <VscCalendar style={{ fontSize: 20, color: ED_TEAL }} /> },
        ]
      },
      { 
        id: 103, 
        name: 'Academic', 
        icon: <VscBook style={{ fontSize: 20, color: ED_TEAL }} />,
        subLinks: [
          { name: 'Academic Session', path: '/ugpg-admin/academic/session', icon: <VscCalendar style={{ fontSize: 20, color: ED_TEAL }} /> },
         
          { name: 'Courses Type', path: '/ugpg-admin/academic/course-types', icon: <VscListFlat style={{ fontSize: 20, color: ED_TEAL }} /> },
          { name: 'Courses', path: '/ugpg-admin/academic/courses', icon: <VscBook style={{ fontSize: 20, color: ED_TEAL }} /> },

          // { name: 'Streams', path: '/ugpg-admin/academic/streams', icon: <VscFiles style={{ fontSize: 20, color: ED_TEAL }} /> },
          { name: 'Subjects/Papers', path: '/ugpg-admin/academic/subjects-papers', icon: <VscLibrary style={{ fontSize: 20, color: ED_TEAL }} /> },
          { name: 'Timetable', path: '/ugpg-admin/academic/timetable', icon: <VscCalendar style={{ fontSize: 20, color: ED_TEAL }} /> },
          { name: 'Exam Session', path: '/ugpg-admin/academic/exam-session', icon: <VscListSelection style={{ fontSize: 20, color: ED_TEAL }} /> },
          { name: 'Result Generation', path: '/ugpg-admin/academic/result-generation', icon: <VscGraph style={{ fontSize: 20, color: ED_TEAL }} /> },

        ]
      },

      { id: 200, name: 'STUDENTS', isHeader: true, icon: <VscMortarBoard style={{ fontSize: 20, color: ED_TEAL }} /> },
      {
        id: 201,
        name: 'Front Desk',
        icon: <VscHome style={{ fontSize: 20, color: ED_TEAL }} />,
        subLinks: [
          { name: 'Visitor Logs', path: '/ugpg-admin/front-desk/visitor-logs', icon: <VscAccount style={{ fontSize: 20, color: ED_TEAL }} /> },
          { name: 'Phone Logs', path: '/ugpg-admin/front-desk/phone-logs', icon: <VscBell style={{ fontSize: 20, color: ED_TEAL }} /> },
          // { name: 'Grievances', path: '/ugpg-admin/front-desk/grievances', icon: <VscChecklist style={{ fontSize: 20, color: ED_TEAL }} /> },
          // { name: 'Postal Exchange', path: '/ugpg-admin/front-desk/postal-exchange', icon: <VscFiles style={{ fontSize: 20, color: ED_TEAL }} /> },
          { name: 'Visit Purpose', path: '/ugpg-admin/front-desk/visit-purpose', icon: <VscListSelection style={{ fontSize: 20, color: ED_TEAL }} /> },
          // { name: 'Enquiry Source', path: '/ugpg-admin/front-desk/enquiry-source', icon: <VscListTree style={{ fontSize: 20, color: ED_TEAL }} /> },
          { name: 'Enquiry References', path: '/ugpg-admin/front-desk/enquiry-references', icon: <VscVersions style={{ fontSize: 20, color: ED_TEAL }} /> },
          // { name: 'Grievance Type', path: '/ugpg-admin/front-desk/grievance-types', icon: <VscListFlat style={{ fontSize: 20, color: ED_TEAL }} /> },
          // { name: 'Postal Types', path: '/ugpg-admin/front-desk/postal-types', icon: <VscListFlat style={{ fontSize: 20, color: ED_TEAL }} /> },
          { name: 'Meeting Types', path: '/ugpg-admin/front-desk/meeting-types', icon: <VscCalendar style={{ fontSize: 20, color: ED_TEAL }} /> },
        ]
      },
      { 
        id: 202, 
        name: 'Admissions', 
        icon: <VscChecklist style={{ fontSize: 20, color: ED_TEAL }} />,
        subLinks: [
          { name: 'Admission Enquiries', path: '/ugpg-admin/admissions/enquiries', icon: <VscListUnordered style={{ fontSize: 20, color: ED_TEAL }} /> },
          { name: 'New Registration', path: '/ugpg-admin/new-registration', icon: <VscAdd style={{ fontSize: 20, color: ED_TEAL }} /> },
          { name: 'All Registered Students', path: '/ugpg-admin/admissions/all-registered', icon: <VscListUnordered style={{ fontSize: 20, color: ED_TEAL }} /> },
          { name: 'Verification', path: '/ugpg-admin/admissions/verification', icon: <VscVerified style={{ fontSize: 20, color: ED_TEAL }} /> },

          { name: 'Enrolled Students', path: '/ugpg-admin/admissions/enrolled', icon: <VscOrganization style={{ fontSize: 20, color: ED_TEAL }} /> },
        ]
      },
      // Newly added: Timetable link right after Admissions
     

      { id: 250, name: 'TEACHER MANAGEMENT', isHeader: true, icon: <VscPerson style={{ fontSize: 20, color: ED_TEAL }} /> },
      {
        id: 251,
        name: 'Teachers',
        icon: <VscPerson style={{ fontSize: 20, color: ED_TEAL }} />,
        subLinks: [
          { name: 'All Teachers', path: '/ugpg-admin/teachers', icon: <VscListUnordered style={{ fontSize: 20, color: ED_TEAL }} /> },
          { name: 'Add New Teacher', path: '/ugpg-admin/teachers/add', icon: <VscAdd style={{ fontSize: 20, color: ED_TEAL }} /> },
        ]
      },
      
      { id: 300, name: 'ACCOUNTS', isHeader: true, icon: <VscBriefcase style={{ fontSize: 20, color: ED_TEAL }} /> },
      {
        id: 301,
        name: 'Fee',
        icon: <VscGift style={{ fontSize: 20, color: ED_TEAL }} />,
        subLinks: [
          { name: 'Fee Type', path: '/ugpg-admin/fee/type', icon: <FaRegMoneyBillAlt style={{ fontSize: 20, color: ED_TEAL }} /> },
          { name: 'Manage Course Fee', path: '/ugpg-admin/fee/manage', icon: <MdOutlineManageAccounts style={{ fontSize: 20, color: ED_TEAL }} /> },
          { name: 'Student Ledgers', path: '/ugpg-admin/fee/ledgers', icon: <FaRegFileAlt style={{ fontSize: 20, color: ED_TEAL }} /> },
          { name: 'Paid Fee', path: '/ugpg-admin/fee/paid', icon: <MdPayment style={{ fontSize: 20, color: ED_TEAL }} /> },
          { name: 'Daily Collection', path: '/ugpg-admin/fee/collection', icon: <RiMoneyDollarCircleLine style={{ fontSize: 20, color: ED_TEAL }} /> },
          { name: 'Fee Summary', path: '/ugpg-admin/fee/summary', icon: <MdSummarize style={{ fontSize: 20, color: ED_TEAL }} /> },
          { name: 'Session Wise Pending', path: '/ugpg-admin/fee/session-pending', icon: <FaTasks style={{ fontSize: 20, color: ED_TEAL }} /> },
          { name: 'School Wise Pending', path: '/ugpg-admin/fee/school-pending', icon: <FaSchool style={{ fontSize: 20, color: ED_TEAL }} /> },
        ]
      },
      
      { id: 302, name: 'Accounts', path: '/ugpg-admin/accounts', icon: <VscAccount style={{ fontSize: 20, color: ED_TEAL }} /> },
    ];
  }
  // Admin UI for Admin & SuperAdmin
  if (user?.accountType === 'Admin' || user?.accountType === 'SuperAdmin') {
    return [
      {
        id: 1,
        name: "Dashboard",
        path: "/admin/dashboard",
        icon: <VscDashboard style={{ fontSize: 20, color: ED_TEAL }} />,
      },
      {
        id: 12,
        name: "Notifications",
        path: "/admin/notifications",
        icon: <VscBell style={{ fontSize: 20, color: ED_TEAL }} />,
      },
      // CONTENT MANAGEMENT - Section Header
      {
        id: 2,
        name: "CONTENT MANAGEMENT",
        isHeader: true,
        icon: <VscFiles style={{ fontSize: 20, color: ED_TEAL }} />,
      },
      {
        id: 3,
        name: "Category",
        icon: <VscListTree style={{ fontSize: 20, color: ED_TEAL }} />,
        subLinks: [
          { name: "Create New Category", path: "/admin/categories/create" },
          { name: "All Categories", path: "/admin/categories/allCategories" }
        ]
      },
      {
        id: 4,
        name: "Sub Category", 
        icon: <VscListFlat style={{ fontSize: 20, color: ED_TEAL }} />,
        subLinks: [
          { name: "Create New Sub Category", path: "/admin/subcategories/create" },
          { name: "All Sub Categories", path: "/admin/subcategories/allSubCategories" }
        ]
      },
      {
        id: 5,
        name: "Course", 
        icon: <VscBook style={{ fontSize: 20, color: ED_TEAL }} />,
        subLinks: [
          { name: "Create New Course", path: "/admin/course/create" },
          // { name: "Create New Scrom Course", path: "/admin/course/scromCourse" },
          // { name: "All Scrom Course", path: "/admin/course/allScromCourses" },
          { name: "All Courses", path: "/admin/course/allCourses" },
        ]
      },
      // BATCH MANAGEMENT - Section Header
      {
        id: 6,
        name: "BATCH MANAGEMENT",
        isHeader: true,
        icon: <VscOrganization style={{ fontSize: 20, color: ED_TEAL }} />,
      },
      {
        id: 7,
        name: "Batch",
        icon: <VscVersions style={{ fontSize: 20, color: ED_TEAL }} />,
        subLinks: [
          { name: "Create Batch", path: "/admin/batches/create" },
          { name: "All Batches", path: "/admin/batches" }
        ]
      },
      // STUDENT MANAGEMENT - Section Header
      {
        id: 8,
        name: "STUDENT MANAGEMENT",
        isHeader: true,
        icon: <VscMortarBoard style={{ fontSize: 20, color: ED_TEAL }} />,
      },
      {
        id: 9,
        name: "Students",
        icon: <VscAccount style={{ fontSize: 20, color: ED_TEAL }} />,
        subLinks: [
          { name: "Create New Student", path: "/admin/students/create" },
          { name: "All Students", path: "/admin/students" }
        ]
      },
      // USER MANAGEMENT - Section Header
      {
        id: 10,
        name: "USER MANAGEMENT", 
        isHeader: true,
        icon: <VscGear style={{ fontSize: 20, color: ED_TEAL }} />,
      },
      {
        id: 11,
        name: "Users",
        icon: <VscAccount style={{ fontSize: 20, color: ED_TEAL }} />,
        subLinks: [
          { name: "Create User", path: "/admin/users/create" },
          { name: "All Users", path: "/admin/all-users" }
        ]
      },
      
      {
        id: 13,
        name: "User Type",
        icon: <VscVersions style={{ fontSize: 20, color: ED_TEAL }} />,
        subLinks: [
          { name: "Create User Type", path: "/admin/user-types/create" },
          { name: "All User Types", path: "/admin/user-types" }
        ]
      },
    ];
  }

  // Instructor UI - same menu, but Dashboard points to instructor dashboard
  if (user?.accountType === 'Instructor') {
    return [
      {
        id: 1,
        name: "Dashboard",
        path: "/instructor/dashboard",
        icon: <VscDashboard style={{ fontSize: 20, color: ED_TEAL }} />,
      },
      // CONTENT MANAGEMENT - Section Header
      {
        id: 2,
        name: "CONTENT MANAGEMENT",
        isHeader: true,
        icon: <VscFiles style={{ fontSize: 20, color: ED_TEAL }} />,
      },
      {
        id: 3,
        name: "Category",
        icon: <VscListTree style={{ fontSize: 20, color: ED_TEAL }} />,
        subLinks: [
          { name: "Create New Category", path: "/admin/categories/create" },
          { name: "All Categories", path: "/admin/categories/allCategories" }
        ]
      },
      {
        id: 4,
        name: "Sub Category", 
        icon: <VscListFlat style={{ fontSize: 20, color: ED_TEAL }} />,
        subLinks: [
          { name: "Create New Sub Category", path: "/admin/subcategories/create" },
          { name: "All Sub Categories", path: "/admin/subcategories/allSubCategories" }
        ]
      },
      {
        id: 5,
        name: "Course", 
        icon: <VscBook style={{ fontSize: 20, color: ED_TEAL }} />,
        subLinks: [
          { name: "Create New Course", path: "/admin/course/create" },
          // { name: "Create New Scrom Course", path: "/admin/course/scromCourse" },
          // { name: "All Scrom Course", path: "/admin/course/allScromCourses" },
          { name: "All Courses", path: "/admin/course/allCourses" },
        ]
      },
      // BATCH MANAGEMENT - Section Header
      {
        id: 6,
        name: "BATCH MANAGEMENT",
        isHeader: true,
        icon: <VscOrganization style={{ fontSize: 20, color: ED_TEAL }} />,
      },
      {
        id: 7,
        name: "Batch",
        icon: <VscVersions style={{ fontSize: 20, color: ED_TEAL }} />,
        subLinks: [
          { name: "Create Batch", path: "/admin/batches/create" },
          { name: "All Batches", path: "/admin/batches" }
        ]
      },
      // STUDENT MANAGEMENT - Section Header
      {
        id: 8,
        name: "STUDENT MANAGEMENT",
        isHeader: true,
        icon: <VscMortarBoard style={{ fontSize: 20, color: ED_TEAL }} />,
      },
      {
        id: 9,
        name: "Students",
        icon: <VscAccount style={{ fontSize: 20, color: ED_TEAL }} />,
        subLinks: [
          { name: "Create New Student", path: "/admin/students/create" },
          { name: "All Students", path: "/admin/students" }
        ]
      },
      // USER MANAGEMENT - Section Header
      {
        id: 10,
        name: "USER MANAGEMENT", 
        isHeader: true,
        icon: <VscGear style={{ fontSize: 20, color: ED_TEAL }} />,
      },
      {
        id: 11,
        name: "Users",
        icon: <VscAccount style={{ fontSize: 20, color: ED_TEAL }} />,
        subLinks: [
          { name: "Create User", path: "/admin/users/create" },
          { name: "All Users", path: "/admin/all-users" }
        ]
      },
      {
        id: 13,
        name: "User Type",
        icon: <VscVersions style={{ fontSize: 20, color: ED_TEAL }} />,
        subLinks: [
          { name: "Create User Type", path: "/admin/user-types/create" },
          { name: "All User Types", path: "/admin/user-types" }
        ]
      },
    ];
  }

  // Content-manager: limited admin-like UI (Course + Batch only)
  if (user?.accountType === 'Content-management') {
    return [
      {
        id: 1,
        name: "Dashboard",
        path: "/admin/dashboard",
        icon: <VscDashboard style={{ fontSize: 20, color: ED_TEAL }} />,
      },
      // CONTENT MANAGEMENT - Section Header
      {
        id: 2,
        name: "CONTENT MANAGEMENT",
        isHeader: true,
        icon: <VscFiles style={{ fontSize: 20, color: ED_TEAL }} />,
      },
      {
        id: 5,
        name: "Course", 
        icon: <VscBook style={{ fontSize: 20, color: ED_TEAL }} />,
        subLinks: [
          { name: "Create New Course", path: "/admin/course/create" },
          { name: "All Courses", path: "/admin/course/allCourses" },
        ]
      },
      // BATCH MANAGEMENT - Section Header
      {
        id: 6,
        name: "BATCH MANAGEMENT",
        isHeader: true,
        icon: <VscOrganization style={{ fontSize: 20, color: ED_TEAL }} />,
      },
      {
        id: 7,
        name: "Batch",
        icon: <VscVersions style={{ fontSize: 20, color: ED_TEAL }} />,
        subLinks: [
          { name: "Create Batch", path: "/admin/batches/create" },
          { name: "All Batches", path: "/admin/batches" }
        ]
      },
    ];
  }

  // Return default student links for all other cases
  return studentLinks;
};

export default function Sidebar({ isMobile = false, isOpen = true, onClose = () => {}, variant = 'default' }) {
  const { user, loading: profileLoading } = useSelector((state) => state.profile);
  const { loading: authLoading } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionName) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

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

  const renderSidebarItem = (link, depth = 0) => {
    // Handle section headers
    if (link.isHeader) {
      return (
        <div key={link.name} style={{
          padding: "18px 24px 12px 24px",
          marginTop: depth === 0 ? 32 : 20,
          marginBottom: 16,
          color: ED_TEAL,
          fontWeight: (user?.accountType === 'SuperAdmin') ? 600 : 700,
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: 1.2,
          display: "flex",
          alignItems: "center",
          gap: 10,
          whiteSpace: "nowrap",
          borderBottom: `1px solid rgba(0,0,0,0.08)`,
          background: "linear-gradient(135deg, rgba(0,128,128,0.05) 0%, rgba(0,128,128,0.02) 100%)",
        }}>
          <span style={{ 
            fontSize: 16, 
            opacity: 0.8,
            filter: "drop-shadow(0 1px 2px rgba(0,128,128,0.3))" 
          }}>
            {link.icon}
          </span>
          <span style={{ 
            flex: 1,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
          }}>
            {link.name}
          </span>
        </div>
      );
    }

    // Regular clickable items
    const hasSublinks = link.subLinks && link.subLinks.length > 0;
    const isExpanded = expandedSections[link.name];
    
    return (
      <div key={link.name} style={{ 
        display: 'flex', 
        flexDirection: 'column',
        paddingLeft: depth > 0 ? 16 : 0
      }}>
        <button
          onClick={() => {
            if (hasSublinks) {
              toggleSection(link.name);
            } else if (link.path) {
              navigate(link.path);
            }
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            padding: depth === 0 ? "14px 24px" : "12px 16px",
            background: "none",
            border: "none",
            borderRadius: depth === 0 ? 10 : 8,
            color: depth === 0 ? TEXT_DARK : "rgba(0,0,0,0.75)",
            fontWeight: (user?.accountType === 'SuperAdmin')
              ? (depth === 0 ? 500 : 400)
              : (depth === 0 ? 600 : 500),
            fontSize: depth === 0 ? 15 : 14,
            cursor: "pointer",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            textAlign: "left",
            width: "100%",
            marginLeft: depth * 4,
            position: "relative",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            transform: "translateZ(0)", // Enable hardware acceleration
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = depth === 0 
              ? "linear-gradient(135deg, rgba(0,128,128,0.08) 0%, rgba(0,128,128,0.12) 100%)"
              : "linear-gradient(135deg, rgba(0,128,128,0.06) 0%, rgba(0,128,128,0.08) 100%)";
            e.currentTarget.style.color = ED_TEAL;
            e.currentTarget.style.transform = "translateX(4px) translateZ(0)";
            e.currentTarget.style.boxShadow = depth === 0 
              ? "0 4px 12px rgba(0,128,128,0.15), 0 2px 4px rgba(0,128,128,0.1)"
              : "0 2px 8px rgba(0,128,128,0.1)";
            e.currentTarget.style.borderLeft = `3px solid ${ED_TEAL}`;
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = "none";
            e.currentTarget.style.color = depth === 0 ? TEXT_DARK : "rgba(0,0,0,0.75)";
            e.currentTarget.style.transform = "translateX(0) translateZ(0)";
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.borderLeft = "3px solid transparent";
          }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12,
            flex: 1,
            minWidth: 0 // Allow text truncation if needed
          }}>
            <span style={{ 
              fontSize: depth === 0 ? 18 : 16,
              opacity: 0.9,
              transition: "all 0.3s ease",
              filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
            }}>
              {link.icon}
            </span>
            <span style={{
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}>
              {link.name}
            </span>
          </div>
          {hasSublinks && (
            <span style={{ 
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
              transform: isExpanded ? 'rotate(90deg) scale(1.1)' : 'rotate(0deg) scale(1)',
              opacity: 0.7,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: isExpanded ? "rgba(0,128,128,0.1)" : "transparent"
            }}>
              <VscChevronRight style={{ fontSize: 14 }} />
            </span>
          )}
        </button>

        {hasSublinks && isExpanded && (
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            borderLeft: depth > 0 ? `2px solid rgba(0,128,128,0.15)` : `2px solid rgba(0,128,128,0.1)`,
            marginLeft: depth > 0 ? 12 : 16,
            marginTop: 4,
            paddingTop: 4,
            paddingBottom: 4,
            background: "linear-gradient(to right, rgba(0,128,128,0.02) 0%, transparent 50%)",
            borderRadius: "0 8px 8px 0"
          }}>
            {link.subLinks.map(sublink => renderSidebarItem(sublink, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            top: 120,
            bottom: 0,
            background: 'rgba(0,0,0,0.35)',
            zIndex: 20000,
          }}
        />
      )}
      <div style={{
        position: 'fixed',
        left: 0,
        top: 110,
        height: 'calc(100vh - 110px)',
        paddingTop: "180px",
        width: 260,
        display: 'flex',
        flexDirection: 'column',
        borderRight: `1px solid rgba(0,0,0,0.1)`,
        background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)',
        padding: '2rem 0',
        zIndex: 20001,
        boxShadow: '0 8px 32px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)',
        overflowY: 'auto',
        overflowX: 'auto',
        // slide-in on mobile
        transform: isMobile ? (isOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
        transition: isMobile ? 'transform 0.3s ease' : 'none',
        visibility: isMobile ? (isOpen ? 'visible' : 'hidden') : 'visible',
        pointerEvents: isMobile ? (isOpen ? 'auto' : 'none') : 'auto',
        // Custom scrollbar
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(0,128,0,0.3) transparent',
      }}>
        <style>
          {`
            div::-webkit-scrollbar {
              width: 6px;
            }
            div::-webkit-scrollbar-track {
              background: transparent;
            }
            div::-webkit-scrollbar-thumb {
              background: rgba(0,128,128,0.2);
              border-radius: 3px;
            }
            div::-webkit-scrollbar-thumb:hover {
              background: rgba(0,128,128,0.4);
            }
          `}
        </style>
        
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: 8, 
          paddingTop: 16,
          paddingBottom: 16
        }}>
          {getSidebarLinks(user, variant).map(link => renderSidebarItem(link))}
        </div>
        
        <div style={{ 
          margin: "16px 24px", 
          height: 2, 
          background: "linear-gradient(90deg, transparent 0%, rgba(0,128,128,0.2) 50%, transparent 100%)",
          borderRadius: 1
        }} />
        
        <div style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: 8, 
          paddingLeft: 24, 
          paddingRight: 24, 
          marginBottom: 28 
        }}>
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
              padding: "14px 16px",
              fontSize: 15,
              fontWeight: (user?.accountType === 'SuperAdmin') ? 500 : 600,
              color: "#dc3545",
              background: "linear-gradient(135deg, rgba(220,53,69,0.05) 0%, rgba(220,53,69,0.08) 100%)",
              border: "1px solid rgba(220,53,69,0.2)",
              borderRadius: 10,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 10,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              transform: "translateZ(0)",
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(220,53,69,0.1) 0%, rgba(220,53,69,0.15) 100%)";
              e.currentTarget.style.transform = "translateY(-2px) translateZ(0)";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(220,53,69,0.2), 0 3px 8px rgba(220,53,69,0.1)";
              e.currentTarget.style.borderColor = "rgba(220,53,69,0.4)";
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(220,53,69,0.05) 0%, rgba(220,53,69,0.08) 100%)";
              e.currentTarget.style.transform = "translateY(0) translateZ(0)";
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.borderColor = "rgba(220,53,69,0.2)";
            }}
          >
            <VscSignOut style={{ 
              fontSize: 18, 
              filter: "drop-shadow(0 1px 2px rgba(220,53,69,0.3))" 
            }} />
            <span>Logout</span>
          </button>
        </div>
      </div>
      {confirmationModal && <ConfirmationModal modalData={confirmationModal} />}
    </>
  );
}

