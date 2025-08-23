import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
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

      {/* Admin Routes (Admin + Instructor) */}
      {(user?.accountType === ACCOUNT_TYPE.ADMIN || user?.accountType === ACCOUNT_TYPE.INSTRUCTOR) && (
        <>
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/notifications" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <AdminNotifications />
            </ProtectedRoute>
          } />
          
          {/* Category Management */}
          <Route path="/admin/categories/create" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <CreateCategory />
            </ProtectedRoute>
          } />
          <Route path="/admin/categories/allCategories" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <AllCategories />
            </ProtectedRoute>
          } />
          
          {/* Sub Category Management */}
          <Route path="/admin/subcategories/create" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <SubCategory />
            </ProtectedRoute>
          } />
          <Route path="/admin/subcategories/allSubCategories" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <AllSubCategory />
            </ProtectedRoute>
          } />
          
          {/* Course Management */}
          <Route path="/admin/course/create" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <CreateCourse />
            </ProtectedRoute>
          } />
          <Route path="/admin/course/edit/:courseId" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <EditCourse />
            </ProtectedRoute>
          } />
          <Route path="/admin/my-courses" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <AdminMyCourses />
            </ProtectedRoute>
          } />
          <Route path="/admin/course/scromCourse" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <div>Create Scrom Course Page</div>
            </ProtectedRoute>
          } />
          <Route path="/admin/course/allScromCourses" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <div>All Scrom Courses Page</div>
            </ProtectedRoute>
          } />
          <Route path="/admin/course/allCourses" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
             <AllCourse />
            </ProtectedRoute>
          } />
          
          {/* Batch Management */}
          <Route path="/admin/batches/create" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <CreateBatch />
            </ProtectedRoute>
          } />
          <Route path="/admin/batches" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <AllBatches />
            </ProtectedRoute>
          } />
          <Route path="/admin/batches/:batchId/edit" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
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
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <CreateStudentsLanding />
            </ProtectedRoute>
          } />
          <Route path="/admin/students/create/single" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <CreateStudent />
            </ProtectedRoute>
          } />
          <Route path="/admin/students/create/multiple" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <BulkUploadStudents />
            </ProtectedRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <EnrolledStudents />
            </ProtectedRoute>
          } />
          
          {/* User Management */}
          <Route path="/admin/users/create" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <NewUser/>
            </ProtectedRoute>
          } />
          <Route path="/admin/user-types/create" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <CreateUserType />
            </ProtectedRoute>
          } />
          <Route path="/admin/user-types" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
              <AllUserTypes />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={<Navigate to="/admin/all-users" replace />} />
          <Route path="/admin/all-users" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR]}>
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