import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import ManageUsers from './pages/ManageUsers';
import Categories from './pages/Categories';
import InstructorLayout from './components/common/InstructorLayout';
import Cart from './pages/Cart';
import ActiveCourses from './pages/ActiveCourses';
import MyCourses from './pages/MyCourses';

import EditCourse from './components/core/EditCourse';
import CourseViewer from './pages/CourseViewer';
import CourseDetails from './pages/CourseDetails';
import Checkout from './pages/Checkout';
import CreateCategory from './components/core/Admin/Category/createCategory';
import AllCategories from "./components/core/Admin/Category/allCategory";
import SubCategory from "./components/core/Admin/SubCategory/SubCategory";
import AllSubCategory from "./components/core/Admin/SubCategory/AllSubCategory";
import CreateCourse from './components/core/Admin/Course/createCourse';
import NewUser from './components/core/Admin/UserManagement/User/NewUser';
import AllCourse from './components/core/Admin/Course/AllCourse';
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
      <Route path="/catalog/:catalogName" element={<Catalog />} />
      <Route path="/courses/:courseId" element={<CourseDetails />} />
      <Route path="/enrollment-payment" element={<EnrollmentPayment />} />
      <Route path="/course/:courseId" element={<CourseViewer />} />

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
            <Route path="enrolled-courses" element={<ActiveCourses />} />
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

      {/* Admin Routes */}
      {user?.accountType === ACCOUNT_TYPE.ADMIN && (
        <>
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          
          {/* Category Management */}
          <Route path="/admin/categories/create" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN]}>
              <CreateCategory />
            </ProtectedRoute>
          } />
          <Route path="/admin/categories/allCategories" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN]}>
              <AllCategories />
            </ProtectedRoute>
          } />
          
          {/* Sub Category Management */}
          <Route path="/admin/subcategories/create" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN]}>
              <SubCategory />
            </ProtectedRoute>
          } />
          <Route path="/admin/subcategories/allSubCategories" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN]}>
              <AllSubCategory />
            </ProtectedRoute>
          } />
          
          {/* Course Management */}
          <Route path="/admin/course/create" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN]}>
              <CreateCourse />
            </ProtectedRoute>
          } />
          <Route path="/admin/course/scromCourse" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN]}>
              <div>Create Scrom Course Page</div>
            </ProtectedRoute>
          } />
          <Route path="/admin/course/allScromCourses" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN]}>
              <div>All Scrom Courses Page</div>
            </ProtectedRoute>
          } />
          <Route path="/admin/course/allCourses" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN]}>
             <AllCourse />
            </ProtectedRoute>
          } />
          
          {/* Batch Management */}
          <Route path="/admin/batches/create" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN]}>
              <div>Create Batch Page</div>
            </ProtectedRoute>
          } />
          <Route path="/admin/batches" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN]}>
              <div>All Batches Page</div>
            </ProtectedRoute>
          } />
          
          {/* Student Management */}
          <Route path="/admin/students/admission" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN]}>
              <AdmissionConfirmation />
            </ProtectedRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN]}>
              <EnrolledStudents />
            </ProtectedRoute>
          } />
          
          {/* User Management */}
          <Route path="/admin/users/create" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN]}>
              <NewUser/>
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={[ACCOUNT_TYPE.ADMIN]}>
              <ManageUsers />
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
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#ffffff',
                  color: '#191A1F',
                  marginLeft: 'auto',
                  marginRight: 40,
                  maxWidth: 450,
                  marginTop: 80,
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