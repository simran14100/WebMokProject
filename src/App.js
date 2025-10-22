import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './store';
import { debugLocalStorage } from './utils/localStorage';
import { ACCOUNT_TYPE } from './utils/constants';
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import TokenManager from "./components/common/TokenManager";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Catalog from "./pages/Catalog";
import EnrollmentPayment from "./pages/EnrollmentPayment";
import AdminDashboard from "./pages/AdminDashboard";
import InstructorDashboard from "./pages/InstructorDashboard";
import AdmissionConfirmation from "./pages/AdmissionConfirmation";
import PaymentInstallments from "./pages/PaymentInstallments";
import AdminProfile from './pages/AdminProfile';
import Settings from "./components/common/setting/Settings";
import AdminLayout from './components/common/AdminLayout';
import EnrolledStudents from './pages/AllStudentsCombined';
import RegisteredStudents from './pages/RegisteredStudents';
import AllUsers from './components/core/Admin/UserManagement/User/AllUser';
import Category from "./pages/Category";
import InstructorLayout from './components/common/InstructorLayout';
import Cart from './pages/Cart';
import ActiveCourses from './pages/ActiveCourses';

import DocumentUpload from "./pages/Dashboard/DocumentUpload";

import Assignments from "./pages/Assignments";
import AssignmentDetail from './pages/AssignmentDetail';
import AdminNotifications from './pages/AdminNotifications';
import Notifications from './pages/Notifications';
import EnrollmentStatus from './pages/University/EnrollmentStatus';
import ProgramSelection from './pages/University/ProgramSelection';
import UniversityStudentDashboard from './pages/University/UniversityStudentDashboard';
import AdmissionEnquiryForm from './components/AdmissionEnquiryForm';
import NewRegistration from './pages/SuperAdmin/NewRegistration';
import VerifiedStudents from './pages/SuperAdmin/VerifiedStudentss';
import AllRegisteredStudents from './pages/SuperAdmin/AllRegisteredStudents';

import EditCourse from './components/core/EditCourse';
import CourseViewer from './pages/CourseViewer';
import ViewCourse from './pages/ViewCourse';
import CourseDetails from './pages/CourseDetails';
import Checkout from './pages/Checkout';
import CreateCategory from './components/core/Admin/Category/createCategory';
import AllCategories from "./components/core/Admin/Category/allCategory";
import SubCategory from "./components/core/Admin/SubCategory/SubCategory";
import AllSubCategory from "./components/core/Admin/SubCategory/AllSubCategory";
import CreateCourse from './components/core/Admin/Course/createCourse';
import NewUser from './components/core/Admin/UserManagement/User/NewUser';
import AllCourse from './components/core/Admin/Course/AllCourse';
import CreateBatch from './components/core/Admin/BatchManagement/CreateBatch';
import AllBatches from './components/core/Admin/BatchManagement/AllBatches';
import EditPage from './components/core/Admin/BatchManagement/EditPage';
import CreateStudent from './components/core/Admin/StudentManagement/CreateStudent';
import CreateStudentsLanding from './components/core/Admin/StudentManagement/CreateStudentsLanding';
import BulkUploadStudents from './components/core/Admin/StudentManagement/BulkUploadStudents';
import CreateUserType from './components/core/Admin/UserManagement/UserType/CreateUserType';
import AllUserTypes from './components/core/Admin/UserManagement/UserType/AllUserTypes';
import AdminMyCourses from './pages/AdminMyCourses';
import PhDAdminLayout from './components/common/PhDAdminLayout';
import PhDSessionManagement from './components/core/SuperAdmin/PhDSessionManagement';
import DepartmentManagement from './components/core/SuperAdmin/DepartmentManagement';
import SubjectManagement from './components/core/SuperAdmin/SubjectManagement';
import NewApplications from './components/core/SuperAdmin/NewApplications';
import ProEnrolled from './components/core/SuperAdmin/ProEnrolled';

// import Coursework from './components/core/SuperAdmin/Coursework';
import CourseworkPapers from './components/core/SuperAdmin/CourseworkPapers';
import CourseworkSlot from './components/core/SuperAdmin/CourseworkSlot';
import CourseworkDatesheet from './components/core/SuperAdmin/CourseworkDatesheet';
import CourseworkResults from './components/core/SuperAdmin/CourseworkResults';
import StudentReports from './components/core/SuperAdmin/StudentReports';
import GuideManagement from './components/core/SuperAdmin/GuideManagement';
import TimeTable from './pages/Dashboard/TimeTable';
import RacMembers from './components/core/SuperAdmin/RacMembers';
import ResultGeneration from './components/core/UGPGAdmin/Academic/ResultGeneration';
import ExternalExperts from './components/core/SuperAdmin/ExternalExperts';
import Leave from './pages/Dashboard/Leave';
import FinalData from './components/core/SuperAdmin/FinalData';
import UsersManagement from './components/core/SuperAdmin/UsersManagement';
import Feetype from './components/core/UGPGAdmin/Fees/Feetype';
import ManageFee from './components/core/UGPGAdmin/Fees/ManageFee';
import StudentLedgers from './pages/UGPGAdmin/Fee/StudentLedgers';
import PaidFee from './pages/UGPGAdmin/Fee/PaidFee';
import TeacherList from './components/core/UGPGAdmin/Users/TeacherList';
import TeacherForm from './components/core/UGPGAdmin/Users/TeacherForm';
import HonoraryApplications from './components/core/SuperAdmin/HonoraryApplications';
import MyCourses from "./pages/MyCourses";
import LiveClasses from "./pages/LiveClasses";

// Sidebar centralized with variants
import Sidebar from './components/common/Sidebar';
// UG/PG SuperAdmin pages
import CourseCategory from './components/core/UGPGAdmin/Academic/CourseCategory';
import UGPGDashboard from './components/core/UGPGAdmin/Dashboard';
import UGPGSettings from './components/core/UGPGAdmin/Settings';
import UGPGAcademic from './components/core/UGPGAdmin/Academic';
import ExamSchedule from './pages/Dashboard/ExamSchedule';
import AdmissionEnquiry from './pages/SuperAdmin/AdmissionEnquiry';
import AcademicSession from './components/core/UGPGAdmin/Academic/AcademicSession';
import ExamSession from './components/core/UGPGAdmin/Academic/ExamSession';
import TimetableList from './components/core/UGPGAdmin/Academic/TimetableList';
import TimetableForm from './components/core/UGPGAdmin/Academic/TimetableForm';
import CourseTypes from './components/core/UGPGAdmin/Academic/CourseTypes';
import Courses from './components/core/UGPGAdmin/Academic/Courses';
import Streams from './components/core/UGPGAdmin/Academic/Streams';
import SubjectsPapers from './components/core/UGPGAdmin/Academic/SubjectsPapers';
import UGPGFrontDesk from './components/core/UGPGAdmin/FrontDesk';
import UGPGAdmissions from './components/core/UGPGAdmin/Admissions';
// import UGPGFee from './components/core/UGPGAdmin/Fee';
import UGPGAccounts from './components/core/UGPGAdmin/Accounts';

import UGPGSettingsSchool from './components/core/UGPGAdmin/Settings/School';
import UGPGSettingsLanguages from './components/core/UGPGAdmin/Settings/Languages';
import UGPGSettingsStates from './components/core/UGPGAdmin/Settings/States';
import UGPGSettingsCities from './components/core/UGPGAdmin/Settings/Cities';
// UG/PG Front Desk sub-pages
import VisitorLogs from './components/core/UGPGAdmin/FrontDesk/VisitorLogs';
import PhoneLogs from './components/core/UGPGAdmin/FrontDesk/PhoneLogs';
import Grievances from './components/core/UGPGAdmin/FrontDesk/Grievances';
import PostalExchange from './components/core/UGPGAdmin/FrontDesk/PostalExchange';
import VisitPurpose from './components/core/UGPGAdmin/FrontDesk/VisitPurpose';
import EnquirySource from './components/core/UGPGAdmin/FrontDesk/EnquirySource';
import EnquiryReferences from './components/core/UGPGAdmin/FrontDesk/EnquiryReferences';
import GrievanceTypes from './components/core/UGPGAdmin/FrontDesk/GrievanceTypes';
import PostalTypes from './components/core/UGPGAdmin/FrontDesk/PostalTypes';
import MeetingTypes from './components/core/UGPGAdmin/FrontDesk/MeetingTypes';
import BatchDepartments from './components/core/Admin/BatchManagement/BatchDepartments';
import UniversityDashboard from "./pages/UniversityDashboard";
import UniversityEnrolledStudent from "./pages/SuperAdmin/UniversityEnrolledStudent";
import { withEnrollmentVerification } from "./middleware/enrollmentMiddleware";
import DashboardLayout from './components/common/DashboardLayout';
import Accounts from "./pages/Dashboard/Accounts";
import StudentResults from "./pages/Dashboard/StudentResults";
import StudentFees from "./pages/Dashboard/StudentFees";
import VisitDepartments from './components/core/UGPGAdmin/FrontDesk/VisitDepartments';
import Schools from './pages/University/Schools';
import ProgramDetails from './pages/University/ProgramDetails';
import EnrollmentApproved from './pages/University/EnrollmentApproved';
// Debug Redux store on app start
console.log("App starting - Redux store state:", store.getState());
console.log("App starting - localStorage debug:");
debugLocalStorage();

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useSelector((state) => state.profile);
  const authState = useSelector((state) => state.auth);
  
  // Debug logging
  console.log('ProtectedRoute - User:', user);
  console.log('ProtectedRoute - Auth State:', authState);
  console.log('ProtectedRoute - Allowed Roles:', allowedRoles);
  
  if (!user) {
    console.log('ProtectedRoute - No user found, redirecting to login');
    return <Login />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.accountType)) {
    console.log('ProtectedRoute - User role not allowed, redirecting to profile');
    // Redirect to appropriate dashboard based on user role
    const redirectPath = 
      user.accountType === ACCOUNT_TYPE.STUDENT ? '/dashboard/my-profile' :
      user.accountType === ACCOUNT_TYPE.INSTRUCTOR ? '/dashboard/instructor' :
      user.accountType === ACCOUNT_TYPE.ADMIN ? '/admin/dashboard' :
      '/dashboard';
    
    return <Navigate to={redirectPath} replace />;
  }
  
  console.log('ProtectedRoute - Access granted');
  return children;
}

function AppRoutes() {
  const { user } = useSelector((state) => state.profile);
  
  // Inline layout to use centralized Sidebar with UG/PG variant
  const UGPGInlineLayout = () => {
    const [isMobile, setIsMobile] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    useEffect(() => {
      const check = () => setIsMobile(window.innerWidth <= 1024);
      check();
      window.addEventListener('resize', check);
      const openHandler = () => setIsSidebarOpen(true);
      const toggleHandler = () => setIsSidebarOpen(prev => !prev);
      window.addEventListener('dashboard:openSidebar', openHandler);
      window.addEventListener('dashboard:toggleSidebar', toggleHandler);
      return () => {
        window.removeEventListener('resize', check);
        window.removeEventListener('dashboard:openSidebar', openHandler);
        window.removeEventListener('dashboard:toggleSidebar', toggleHandler);
      };
    }, []);
    return (
      <div className="bg-white flex">
        <Sidebar variant="ugpg" isMobile={isMobile} isOpen={isSidebarOpen || !isMobile} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 pt-[120px] p-8" style={{ marginLeft: isMobile ? 0 : 260 }}>
          <Outlet />
        </div>
      </div>
    );
  };
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/university/schools" element={<Schools />} />
      <Route path="/university/schools/:schoolId" element={<ProgramDetails />} />
      <Route path="/register" element={<NewRegistration />} />
      {/* Enrolled Students - Using University Student Dashboard */}
      <Route path="/EnrolledStudents" element={
        <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.STUDENT]}>
          <DashboardLayout variant="university">
            <UniversityStudentDashboard />
          </DashboardLayout>
        </ProtectedRoute>
      }>
        <Route index element={<Accounts/>} />
        <Route path="accounts" element={<Accounts/>} />
        <Route path="document" element={<DocumentUpload />} />
        <Route path="attendance" element={<div>Attendance</div>} />
        <Route path="assignments" element={<div>Assignments</div>} />
        <Route path="exam-schedule" element={
          <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.STUDENT]}>
            <ExamSchedule />
          </ProtectedRoute>
        } />
        <Route path="timetable" element={
          <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.STUDENT]}>
            <TimeTable />
          </ProtectedRoute>
        } />
        <Route path="leave-requests" element={
            <Leave />
        } />
         <Route path="results" element={<StudentResults />} />
        <Route path="fees" element={
          <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.STUDENT]}>
            <StudentFees />
          </ProtectedRoute>
        } />
        <Route path="change-password" element={<div>Change Password</div>} />
        <Route path="notification-settings" element={<div>Notification Settings</div>} />
      </Route>
      
      <Route path="/university/enrollment/approved" element={<Navigate to="/university/approved" replace />} />
      <Route
  path="/university/approved"
  element={
    <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.STUDENT, ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.SUPER_ADMIN]}>
      <EnrollmentApproved />
    </ProtectedRoute>
  }
/>
      {/* University Admin Routes */}
      <Route path="/university" element={
        <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.STUDENT, ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.SUPER_ADMIN]}>
          <ProgramSelection />
        </ProtectedRoute>
      }>
        {/* Child enrollment routes render inside ProgramSelection via <Outlet /> */}
        {/* <Route path="enrollment" element={
          <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.STUDENT]}>
            <EnrollmentStatus />
          </ProtectedRoute>
        } /> */}
       
       
        {/* Dashboard route will be handled by the main Dashboard component */}
      </Route>
      
      {/* Admin Dashboard */}
      <Route path="/university-dashboard" element={
        <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.SUPER_ADMIN]}>
          <UniversityDashboard />
        </ProtectedRoute>
      } />
      
      {/* Admission Enquiry - Public route */}
      <Route path="/admission-enquiry" element={<AdmissionEnquiry />} />
      
      {/* Admission Enquiry Form */}
      <Route path="/dashboard/AdmissionenquiryForm" element={<AdmissionEnquiryForm />} />
      
      {/* Enrollment Status Routes */}
      <Route path="/university/enrollment" element={
        <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.STUDENT, ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.SUPER_ADMIN]}>
          <EnrollmentStatus />
        </ProtectedRoute>
      } />
      <Route path="/university/enrollment/pending" element={
        <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.STUDENT, ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.SUPER_ADMIN]}>
          <EnrollmentStatus />
        </ProtectedRoute>
      } />
      <Route path="/university/enrollment/rejected" element={
        <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.STUDENT, ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.SUPER_ADMIN]}>
          <EnrollmentStatus />
        </ProtectedRoute>
      } />
      <Route path="/university/enrollment/approved" element={
        <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.STUDENT, ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.SUPER_ADMIN]}>
          <EnrollmentStatus />
        </ProtectedRoute>
      } />
      
      
      
      {/* Redirect old dashboard route */}
      <Route path="/university-dashboard" element={<Navigate to="/university/dashboard" replace />} />
      {/* UG/PG Admin (SuperAdmin only) */}
      <Route path="/ugpg-admin" element={
        <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.SUPER_ADMIN]}>
          <UGPGInlineLayout />
        </ProtectedRoute>
      }>
        <Route index element={<UGPGDashboard />} />
        {/* <Route path="new-registration" element={
          
            <NewRegistration />
        } /> */}

          <Route path="assignments" element={<Assignments />} />
        
       
        <Route path="settings/school" element={<UGPGSettingsSchool />} />
        <Route path="settings/languages" element={<UGPGSettingsLanguages />} />
        <Route path="settings/states" element={<UGPGSettingsStates />} />
        <Route path="settings/cities" element={<UGPGSettingsCities />} />
        <Route path="settings/leave-request" element={
          <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.SUPER_ADMIN]}>
            <Leave />
          </ProtectedRoute>
        } />
        <Route path="academic" element={<UGPGAcademic />} />
        <Route path="academic/session" element={<AcademicSession />} />
        <Route path="academic/exam-session" element={<ExamSession />} />
        <Route path="academic/timetable" element={<TimetableList />} />
        <Route path="academic/timetable-add" element={<TimetableForm />} />
        <Route path="academic/timetable-edit/:id" element={<TimetableForm />} />
        <Route path="academic/course-categories" element={<CourseCategory />} />
        <Route path="academic/course-types" element={<CourseTypes />} />
        <Route path="academic/courses" element={<Courses />} />
        <Route path="academic/streams" element={<Streams />} />
        <Route path="academic/subjects-papers" element={<SubjectsPapers />} />
        <Route path="academic/result-generation" element={<ResultGeneration />} />
        {/* UGPG sidebar link intentionally removed per latest change */}
        <Route path="front-desk" element={<UGPGFrontDesk />} />
        <Route path="admissions" element={<UGPGAdmissions />}>
          <Route path="enquiries" element={<AdmissionEnquiry />} />
          <Route path="all-registered" element={<AllRegisteredStudents />} />
          <Route path="verification" element={<VerifiedStudents />} />
          <Route path="enrolled" element={<UniversityEnrolledStudent/>} />
          
        </Route>
        <Route path="front-desk/visitor-logs" element={<VisitorLogs />} />
        <Route path="front-desk/phone-logs" element={<PhoneLogs />} />
        <Route path="front-desk/visit-departments" element={<VisitDepartments />} />
        <Route path="front-desk/grievances" element={<Grievances />} />
        <Route path="front-desk/postal-exchange" element={<PostalExchange />} />
        <Route path="front-desk/visit-purpose" element={<VisitPurpose />} />
        <Route path="front-desk/enquiry-source" element={<EnquirySource />} />
        <Route path="front-desk/enquiry-references" element={<EnquiryReferences />} />
        <Route path="front-desk/grievance-types" element={<GrievanceTypes />} />
        <Route path="front-desk/postal-types" element={<PostalTypes />} />
        <Route path="front-desk/meeting-types" element={<MeetingTypes />} />
    
        <Route path="accounts" element={<UGPGAccounts />} />
        
        {/* Fee Management */}
        <Route path="fee/type" element={
          <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.SUPER_ADMIN]}>
            <Feetype />
          </ProtectedRoute>
        } />
        <Route path="fee/manage" element={
          <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.SUPER_ADMIN, 'accountant']}>
            <ManageFee />
          </ProtectedRoute>
        } />
        <Route path="fee/ledgers" element={
          <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.SUPER_ADMIN, 'accountant']}>
            <StudentLedgers />
          </ProtectedRoute>
        } />
        <Route path="fee/paid" element={
          <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.SUPER_ADMIN, 'accountant']}>
            <PaidFee />
          </ProtectedRoute>
        } />
        
        
        {/* Teacher Management */}
        <Route path="teachers">
          <Route index element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <TeacherList />
            </ProtectedRoute>
          } />
          <Route path="add" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <TeacherForm />
            </ProtectedRoute>
          } />
          <Route path="edit/:id" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <TeacherForm />
            </ProtectedRoute>
          } />
        </Route>
      </Route>
      <Route path="/phd-admin" element={
        <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.SUPER_ADMIN]}>
          <PhDAdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<PhDSessionManagement />} />
        <Route path="session-management" element={<PhDSessionManagement />} />
        <Route path="department" element={<DepartmentManagement />} />
        <Route path="subject-management" element={<SubjectManagement />} />
        <Route path="subjects" element={<SubjectManagement />} />
        <Route path="applications" element={<NewApplications />} />
        <Route path="pro-enrolled" element={<ProEnrolled />} />
        <Route path="paid-fee" element={<PaidFee />} />
        {/* Redirect base Coursework to Papers to avoid ambiguity */}
        <Route path="coursework" element={<Navigate to="coursework/papers" replace />} />
        {/* Explicit route for Coursework images admin */}
        {/* <Route path="coursework/images" element={<Coursework />} /> */}
        <Route path="coursework/slot" element={<CourseworkSlot />} />
        <Route path="coursework/papers" element={<CourseworkPapers />} />
        <Route path="coursework/datesheet" element={<CourseworkDatesheet />} />
        <Route path="coursework/results" element={<CourseworkResults />} />
        <Route path="student-reports" element={<StudentReports />} />
        <Route path="guides" element={<GuideManagement />} />
        <Route path="rac-members" element={<RacMembers />} />
        <Route path="external-experts" element={<ExternalExperts />} />
        {/* Alias route to support /phd-admin/experts */}
        <Route path="experts" element={<ExternalExperts />} />
        <Route path="final-data" element={<FinalData />} />
        <Route path="users" element={<UsersManagement />} />
        <Route path="honorary" element={<HonoraryApplications />} />
      </Route>
      <Route path="/category/:categoryId" element={<Category />} />
      <Route path="/catalog/:catalogName" element={<Catalog />} />
      <Route path="/courses/:courseId" element={<CourseDetails />} />
      <Route path="/enrollment-payment" element={<EnrollmentPayment />} />
      <Route path="/course/:courseId" element={<CourseViewer />} />
      <Route path="/course/:courseId/:sectionId/:subsectionId" element={<CourseViewer />} />

      {/* Alternate routes to keep legacy ViewCourse page accessible */}
      <Route path="/viewcourse/:courseId" element={<ViewCourse />} />
      <Route path="/viewcourse/:courseId/:sectionId/:subsectionId" element={<ViewCourse />} />

      {/* Dashboard Routes - Common for all authenticated users */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard isEnrolledStudentView={window.location.pathname.startsWith('/dashboard/accounts')} />
        </ProtectedRoute>
      }>
        <Route path="my-profile" element={<AdminProfile />} />
        <Route path="settings" element={<Settings />} />
        
        {/* Student Routes */}
        {user?.accountType === ACCOUNT_TYPE.STUDENT && (
          <>
            <Route path="my-courses" element={<MyCourses />} />
            <Route path="enrolled-courses" element={<ActiveCourses />} />
            <Route path="live-classes" element={<LiveClasses />} />
            <Route path="enrolled-students" element={<EnrolledStudents />} />
            <Route path="admission-confirmation" element={<AdmissionConfirmation />} />
            <Route path="new-registration" element={<NewRegistration />} />
            <Route path="notifications" element={<Notifications />} />
          </>
        )}
        
        {/* Cart routes - Accessible to Students, Admins, and SuperAdmins */}
        {[ACCOUNT_TYPE.STUDENT, ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.SUPER_ADMIN].includes(user?.accountType) && (
          <>
          <Route path="cart">
  <Route index element={<Cart />} />
  <Route 
    path="checkout" 
    element={
      <DashboardLayout>
        <Checkout />
      </DashboardLayout>
    } 
  />
</Route>
            {/* <Route path="cart" element={<Cart />} />
            <Route path="cart/checkout" element={<Checkout />} /> */}
          </>
        )}

        {/* Instructor Routes */}
        {user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
          <>
            <Route path="instructor" element={<InstructorDashboard />} />
            <Route path="my-courses" element={<MyCourses />} />
            {/* <Route path="add-course" element={<AddCourse />} /> */}
            <Route path="edit-course/:courseId" element={<EditCourse />} />
          </>
        )}
      </Route>

      {/* Admin Routes (Admin + Instructor + SuperAdmin) */}
      {(user?.accountType === ACCOUNT_TYPE.ADMIN || user?.accountType === ACCOUNT_TYPE.INSTRUCTOR || user?.accountType === ACCOUNT_TYPE.SUPER_ADMIN) && (
        <>
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/notifications" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <AdminNotifications />
            </ProtectedRoute>
          } />
          
          {/* Category Management */}
          <Route path="/admin/categories/create" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <CreateCategory />
            </ProtectedRoute>
          } />
          <Route path="/admin/categories/allCategories" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <AllCategories />
            </ProtectedRoute>
          } />
          
          {/* Sub Category Management */}
          <Route path="/admin/subcategories/create" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <SubCategory />
            </ProtectedRoute>
          } />
          <Route path="/admin/subcategories/allSubCategories" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <AllSubCategory />
            </ProtectedRoute>
          } />
          
          {/* Course Management */}
          <Route path="/admin/course/create" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <CreateCourse />
            </ProtectedRoute>
          } />
          <Route path="/admin/course/edit/:courseId" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <EditCourse />
            </ProtectedRoute>
          } />
          <Route path="/admin/my-courses" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <AdminMyCourses />
            </ProtectedRoute>
          } />
          <Route path="/admin/course/scromCourse" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <div>Create Scrom Course Page</div>
            </ProtectedRoute>
          } />
          <Route path="/admin/course/allScromCourses" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <div>All Scrom Courses Page</div>
            </ProtectedRoute>
          } />
          <Route path="/admin/course/allCourses" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
             <AllCourse />
            </ProtectedRoute>
          } />
          
          {/* Batch Management */}
          <Route path="/admin/batches/create" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <CreateBatch />
            </ProtectedRoute>
          } />
          <Route path="/admin/batches/departments" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <BatchDepartments />
            </ProtectedRoute>
          } />
          <Route path="/admin/batches" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <AllBatches />
            </ProtectedRoute>
          } />
          <Route path="/admin/batches/:batchId/edit" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <EditPage />
            </ProtectedRoute>
          } />
          
          {/* Student Management */}
          {/* <Route path="/admin/students/admission" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN]}>
              <AdmissionConfirmation />
            </ProtectedRoute>
          } /> */}
          <Route path="/admin/students/create" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <CreateStudentsLanding />
            </ProtectedRoute>
          } />
          <Route path="/admin/students/create/single" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <CreateStudent />
            </ProtectedRoute>
          } />
          <Route path="/admin/students/create/multiple" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <BulkUploadStudents />
            </ProtectedRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <EnrolledStudents />
            </ProtectedRoute>
          } />
          
          {/* User Management */}
          <Route path="/admin/users/create" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <NewUser/>
            </ProtectedRoute>
          } />
          <Route path="/admin/user-types/create" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <CreateUserType />
            </ProtectedRoute>
          } />
          <Route path="/admin/user-types" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <AllUserTypes />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={<Navigate to="/admin/all-users" replace />} />
          <Route path="/admin/all-users" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN]}>
              <AllUsers />
            </ProtectedRoute>
          } />
        </>
      )}

      {/* Content-manager limited Admin-like Routes */}
      {user?.accountType === ACCOUNT_TYPE.CONTENT_MANAGER && (
        <>
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.CONTENT_MANAGER, ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Course Management (Content-manager) */}
          <Route path="/admin/course/create" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.CONTENT_MANAGER, ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <CreateCourse />
            </ProtectedRoute>
          } />
          <Route path="/admin/course/allCourses" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.CONTENT_MANAGER, ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <AllCourse />
            </ProtectedRoute>
          } />

          {/* Batch Management (Content-manager) */}
          <Route path="/admin/batches/create" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.CONTENT_MANAGER, ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <CreateBatch />
            </ProtectedRoute>
          } />
          <Route path="/admin/batches" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.CONTENT_MANAGER, ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <AllBatches />
            </ProtectedRoute>
          } />
          <Route path="/admin/batches/:batchId/edit" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.CONTENT_MANAGER, ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <EditPage />
            </ProtectedRoute>
          } />
        </>
      )}

      {/* Instructor Routes */}
      {user?.accountType === ACCOUNT_TYPE.INSTRUCTOR && (
        <>
          {/* Add instructor-specific routes here */}
        </>
      )}
    </Routes>
  );
}

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <div className="flex min-h-screen flex-col">
            <TokenManager />
            <Navbar />
            <main className="flex-1">
              <AppRoutes />
            </main>
            {/* <Footer /> */}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  maxWidth: 450,
                  marginTop: 80,
                  zIndex: 99999
                }
              }}
            />
          </div>
        </Router>
      </PersistGate>
    </Provider>
  );
}

export default App;