import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import { Provider, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './store';
import { Toaster } from 'react-hot-toast';
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
import EnrolledStudents from './pages/EnrolledStudents';
import RegisteredStudents from './pages/RegisteredStudents';
import AllUsers from './components/core/Admin/UserManagement/User/AllUser';
import Category from "./pages/Category";
import InstructorLayout from './components/common/InstructorLayout';
import Cart from './pages/Cart';
import ActiveCourses from './pages/ActiveCourses';
import MyCourses from './pages/MyCourses';
import LiveClasses from './pages/LiveClasses';
import Assignments from './pages/Assignments';
import AssignmentDetail from './pages/AssignmentDetail';
import AdminNotifications from './pages/AdminNotifications';
import Notifications from './pages/Notifications';


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
import UniversityDashboard from './pages/UniversityDashboard';
import PhDAdminLayout from './components/common/PhDAdminLayout';
import PhDSessionManagement from './components/core/SuperAdmin/PhDSessionManagement';
import DepartmentManagement from './components/core/SuperAdmin/DepartmentManagement';
import SubjectManagement from './components/core/SuperAdmin/SubjectManagement';
import NewApplications from './components/core/SuperAdmin/NewApplications';
import ProEnrolled from './components/core/SuperAdmin/ProEnrolled';
import PaidFee from './components/core/SuperAdmin/PaidFee';
// import Coursework from './components/core/SuperAdmin/Coursework';
import CourseworkPapers from './components/core/SuperAdmin/CourseworkPapers';
import CourseworkSlot from './components/core/SuperAdmin/CourseworkSlot';
import CourseworkDatesheet from './components/core/SuperAdmin/CourseworkDatesheet';
import CourseworkResults from './components/core/SuperAdmin/CourseworkResults';
import StudentReports from './components/core/SuperAdmin/StudentReports';
import GuideManagement from './components/core/SuperAdmin/GuideManagement';
import RacMembers from './components/core/SuperAdmin/RacMembers';
import ExternalExperts from './components/core/SuperAdmin/ExternalExperts';
import FinalData from './components/core/SuperAdmin/FinalData';
import UsersManagement from './components/core/SuperAdmin/UsersManagement';
import HonoraryApplications from './components/core/SuperAdmin/HonoraryApplications';
// Sidebar centralized with variants
import Sidebar from './components/common/Sidebar';
// UG/PG SuperAdmin pages
import UGPGDashboard from './components/core/UGPGAdmin/Dashboard';
import UGPGSettings from './components/core/UGPGAdmin/Settings';
import UGPGAcademic from './components/core/UGPGAdmin/Academic';
import AcademicSession from './components/core/UGPGAdmin/Academic/AcademicSession';
import ExamSession from './components/core/UGPGAdmin/Academic/ExamSession';
import CourseTypes from './components/core/UGPGAdmin/Academic/CourseTypes';
import Courses from './components/core/UGPGAdmin/Academic/Courses';
import Streams from './components/core/UGPGAdmin/Academic/Streams';
import SubjectsPapers from './components/core/UGPGAdmin/Academic/SubjectsPapers';
import UGPGFrontDesk from './components/core/UGPGAdmin/FrontDesk';
import UGPGAdmissions from './components/core/UGPGAdmin/Admissions';
import UGPGFee from './components/core/UGPGAdmin/Fee';
import UGPGAccounts from './components/core/UGPGAdmin/Accounts';
import UGPGSettingsUsers from './components/core/UGPGAdmin/Settings/Users';
import UGPGSettingsSchool from './components/core/UGPGAdmin/Settings/School';
import UGPGSettingsLanguages from './components/core/UGPGAdmin/Settings/Languages';
import UGPGSettingsStates from './components/core/UGPGAdmin/Settings/States';
import UGPGSettingsCities from './components/core/UGPGAdmin/Settings/Cities';

// Debug Redux store on app start
console.log("App starting - Redux store state:", store.getState());
console.log("App starting - localStorage debug:");
debugLocalStorage();

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useSelector((state) => state.profile);
  
  if (!user) {
    return <Login />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.accountType)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }
  
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
      {/* SuperAdmin only - University entry points */}
      <Route path="/university-dashboard" element={
        <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.SUPER_ADMIN]}>
          <UniversityDashboard />
        </ProtectedRoute>
      } />
      {/* UG/PG Admin (SuperAdmin only) */}
      <Route path="/ugpg-admin" element={
        <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.SUPER_ADMIN]}>
          <UGPGInlineLayout />
        </ProtectedRoute>
      }>
        <Route index element={<UGPGDashboard />} />
        <Route path="settings" element={<UGPGSettings />} />
        <Route path="settings/users" element={<UGPGSettingsUsers />} />
        <Route path="settings/school" element={<UGPGSettingsSchool />} />
        <Route path="settings/languages" element={<UGPGSettingsLanguages />} />
        <Route path="settings/states" element={<UGPGSettingsStates />} />
        <Route path="settings/cities" element={<UGPGSettingsCities />} />
        <Route path="academic" element={<UGPGAcademic />} />
        <Route path="academic/session" element={<AcademicSession />} />
        <Route path="academic/exam-session" element={<ExamSession />} />
        <Route path="academic/course-types" element={<CourseTypes />} />
        <Route path="academic/courses" element={<Courses />} />
        <Route path="academic/streams" element={<Streams />} />
        <Route path="academic/subjects-papers" element={<SubjectsPapers />} />
        <Route path="front-desk" element={<UGPGFrontDesk />} />
        <Route path="admissions" element={<UGPGAdmissions />} />
        <Route path="fee" element={<UGPGFee />} />
        <Route path="accounts" element={<UGPGAccounts />} />
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
          <Dashboard />
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
            <Route path="assignments" element={<Assignments />} />
            <Route path="assignments/:taskId" element={<AssignmentDetail />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="cart" element={<Cart />} />
            <Route path="cart/checkout" element={<Checkout />} />
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
          <Route path="/instructor/dashboard" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.INSTRUCTOR]}>
              <InstructorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/instructor/my-courses" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.INSTRUCTOR]}>
              <MyCourses />
            </ProtectedRoute>
          } />
          <Route path="/instructor/add-course" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.INSTRUCTOR]}>
              <CreateCourse/>
            </ProtectedRoute>
          } />
          <Route path="/instructor/edit-course/:id" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.INSTRUCTOR]}>
              <EditCourse />
            </ProtectedRoute>
          } />
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
              containerStyle={{ zIndex: 40000 }}
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#ffffff',
                  color: '#191A1F',
                  marginLeft: 'auto',
                  marginRight: 40,
                  maxWidth: 450,
                  marginTop: 120,
                  borderRadius: '16px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  border: '1px solid #e0e0e0',
                  fontFamily: 'Poppins, sans-serif',
                  fontSize: '14px',
                  fontWeight: '500',
                  padding: '16px 20px',
                  lineHeight: '1.5',
                },
                success: {
                  style: {
                    background: 'linear-gradient(135deg, #07A698 0%, #059a8c 100%)',
                    color: '#ffffff',
                    border: '1px solid #07A698',
                    boxShadow: '0 20px 25px -5px rgba(7, 166, 152, 0.2), 0 10px 10px -5px rgba(7, 166, 152, 0.1)',
                  },
                  iconTheme: {
                    primary: '#ffffff',
                    secondary: '#07A698',
                  },
                },
                error: {
                  style: {
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: '#ffffff',
                    border: '1px solid #ef4444',
                    boxShadow: '0 20px 25px -5px rgba(239, 68, 68, 0.2), 0 10px 10px -5px rgba(239, 68, 68, 0.1)',
                  },
                  iconTheme: {
                    primary: '#ffffff',
                    secondary: '#ef4444',
                  },
                },
                loading: {
                  style: {
                    background: 'linear-gradient(135deg, #07A698 0%, #059a8c 100%)',
                    color: '#ffffff',
                    border: '1px solid #07A698',
                    boxShadow: '0 20px 25px -5px rgba(7, 166, 152, 0.2), 0 10px 10px -5px rgba(7, 166, 152, 0.1)',
                  },
                  iconTheme: {
                    primary: '#ffffff',
                    secondary: '#07A698',
                  },
                },
              }}
            />
          </div>
        </Router>
      </PersistGate>
    </Provider>
  );
}

export default App;