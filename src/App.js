import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from 'react-redux';
import store from './store';
import { Toaster } from 'react-hot-toast';
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

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/catalog/:catalogName" element={<Catalog />} />
            <Route path="/enrollment-payment" element={<EnrollmentPayment />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/admission-confirmation" element={<AdmissionConfirmation />} />
            <Route path="/admin/installments" element={<PaymentInstallments />} />
            <Route path="/installments" element={<PaymentInstallments />} />
            <Route path="/instructor/dashboard" element={<InstructorDashboard />} />
          </Routes>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#f9fafb',
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
    </Provider>
  );
}

export default App;
