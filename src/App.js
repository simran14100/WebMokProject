import "./App.css";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './store';
import { Toaster } from 'react-hot-toast';
import { debugLocalStorage } from './utils/localStorage';
import Navbar from "./components/common/Navbar";
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
import InstructorLayout from './components/common/InstructorLayout';
import Cart from './pages/Cart';
import ActiveCourses from './pages/ActiveCourses';
import MyCourses from './pages/MyCourses';
import AddCourse from './pages/AddCourse';
import EditCourse from './components/core/EditCourse';


// Debug Redux store on app start
console.log("App starting - Redux store state:", store.getState());
console.log("App starting - localStorage debug:");
debugLocalStorage();

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />}>
                <Route path="my-profile" element={<AdminProfile />} />
                <Route path="settings" element={<Settings />} />
                <Route path="cart" element={<Cart />} />
                <Route path="active-courses" element={<ActiveCourses />} />
                <Route path="enrolled-students" element={<EnrolledStudents />} />
                {/* <Route path="instructor" element={<InstructorDashboard />} /> */}
                {/* Add more nested dashboard routes here */}
              </Route>
              <Route path="/catalog/:catalogName" element={<Catalog />} />
              <Route path="/enrollment-payment" element={<EnrollmentPayment />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="my-profile" element={<AdminProfile />} />
                <Route path="admission-confirmation" element={<AdmissionConfirmation />} />
                <Route path="registered-students" element={<RegisteredStudents />} />
                <Route path="enrolled-students" element={<EnrolledStudents />} />
                <Route path="installments" element={<PaymentInstallments />} />
                {/* Add more admin routes here */}
              </Route>
              <Route path="/installments" element={<PaymentInstallments />} />
              <Route path="/instructor" element={<InstructorLayout />}>
                <Route path="dashboard" element={<InstructorDashboard />} />
                <Route path="my-courses" element={<MyCourses />} />
                <Route path="add-course" element={<AddCourse />} />
                <Route path="edit-course/:id" element={<EditCourse />} />
                {/* Add more instructor routes here as needed */}
              </Route>
            </Routes>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#1f2937',
                  color: '#f9fafb',
                  marginLeft: 'auto',
                  marginRight: 40,
                  maxWidth: 400,
                  marginTop: 80, // push below navbar/profile
                },
                success: {
                  style: {
                    background: '#10b981',
                  },
                },
                error: {
                  style: {
                    background: '#ef4444',
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
