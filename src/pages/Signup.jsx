import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { signUp, sendOtp } from '../services/operations/authApi';
import Logo from '../assets/Logo/Logo-Full-Light.png';

const TAWKTO_GREEN = '#009e5c'; // two shades darker
const TAWKTO_GREEN_DARK = '#007a44'; // two shades darker
const BORDER = '#e0e0e0';
const TEXT_DARK = '#222';

const accountTypes = [
  { value: 'Student', label: 'Student' },
  { value: 'Instructor', label: 'Instructor' },
  { value: 'Admin', label: 'Admin' },
  { value: 'SuperAdmin', label: 'Super Admin' },
  { value: 'Staff', label: 'Staff' },
];

const validateEmail = (email) => {
  // Simple email regex
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    accountType: 'Student',
    password: '',
    confirmPassword: '',
    otp: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setEmailError("");
    if (!form.email || !validateEmail(form.email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setOtpLoading(true);
    setError(null);
    try {
      await dispatch(sendOtp(form.email, navigate));
      setOtpSent(true);
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    }
    setOtpLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Trim all values before submitting
    const payload = {
      accountType: form.accountType.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword,
      otp: form.otp.trim(),
    };
    try {
      console.log("Signup payload:", payload);
      await dispatch(signUp(
        payload.accountType,
        payload.firstName,
        payload.lastName,
        payload.email,
        payload.password,
        payload.confirmPassword,
        payload.otp,
        navigate
      ));
    } catch (err) {
      setError('Signup failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fefb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 18, boxShadow: '0 8px 32px rgba(0,206,125,0.08)', padding: 40, maxWidth: 440, width: '100%', position: 'relative' }}>
        {/* Green accent bar at the top */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 8, background: TAWKTO_GREEN, borderTopLeftRadius: 18, borderTopRightRadius: 18 }} />
        {/* Remove logo here */}
        <h2 style={{ color: TAWKTO_GREEN, fontWeight: 800, fontSize: 32, marginBottom: 24, textAlign: 'center', letterSpacing: '-1px' }}>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20, display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="firstName" style={{ color: TEXT_DARK, fontWeight: 600, display: 'block', marginBottom: 6 }}>First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange}
                required
                placeholder="Enter first name"
                style={{ width: '100%', padding: '12px 14px', border: `1.5px solid ${BORDER}`, borderRadius: 8, background: '#f9fefb', color: TEXT_DARK, outline: 'none', fontSize: 17, fontWeight: 500, transition: 'border 0.2s' }}
                onFocus={e => e.target.style.border = `2px solid ${TAWKTO_GREEN}`}
                onBlur={e => e.target.style.border = `1.5px solid ${BORDER}`}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="lastName" style={{ color: TEXT_DARK, fontWeight: 600, display: 'block', marginBottom: 6 }}>Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange}
                required
                placeholder="Enter last name"
                style={{ width: '100%', padding: '12px 14px', border: `1.5px solid ${BORDER}`, borderRadius: 8, background: '#f9fefb', color: TEXT_DARK, outline: 'none', fontSize: 17, fontWeight: 500, transition: 'border 0.2s' }}
                onFocus={e => e.target.style.border = `2px solid ${TAWKTO_GREEN}`}
                onBlur={e => e.target.style.border = `1.5px solid ${BORDER}`}
              />
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="email" style={{ color: TEXT_DARK, fontWeight: 600, display: 'block', marginBottom: 6 }}>Email</label>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                style={{ flex: 1, padding: '12px 14px', border: `1.5px solid ${BORDER}`, borderRadius: 8, background: '#f9fefb', color: TEXT_DARK, outline: 'none', fontSize: 17, fontWeight: 500, transition: 'border 0.2s' }}
                onFocus={e => e.target.style.border = `2px solid ${TAWKTO_GREEN}`}
                onBlur={e => e.target.style.border = `1.5px solid ${BORDER}`}
              />
              <button type="button" onClick={handleSendOtp} disabled={otpLoading || !form.email || !validateEmail(form.email)} style={{ background: TAWKTO_GREEN, color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 700, fontSize: 15, cursor: otpLoading ? 'not-allowed' : 'pointer', transition: 'background 0.2s', minWidth: 110 }}
                onMouseOver={e => e.target.style.background = TAWKTO_GREEN_DARK}
                onMouseOut={e => e.target.style.background = TAWKTO_GREEN}
              >
                {otpLoading ? 'Sending OTP...' : otpSent ? 'OTP Sent' : 'Send OTP'}
              </button>
            </div>
            {emailError && <div style={{ color: '#e53935', marginTop: 6, fontWeight: 500 }}>{emailError}</div>}
          </div>
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="otp" style={{ color: TEXT_DARK, fontWeight: 600, display: 'block', marginBottom: 6 }}>Enter OTP</label>
            <input
              id="otp"
              name="otp"
              type="text"
              value={form.otp}
              onChange={handleChange}
              required
              placeholder="Enter OTP"
              style={{ width: '100%', padding: '12px 14px', border: `1.5px solid ${BORDER}`, borderRadius: 8, background: '#f9fefb', color: TEXT_DARK, outline: 'none', fontSize: 17, fontWeight: 500, transition: 'border 0.2s' }}
              onFocus={e => e.target.style.border = `2px solid ${TAWKTO_GREEN}`}
              onBlur={e => e.target.style.border = `1.5px solid ${BORDER}`}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="phone" style={{ color: TEXT_DARK, fontWeight: 600, display: 'block', marginBottom: 6 }}>Mobile Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="Enter your mobile number"
              style={{ width: '100%', padding: '12px 14px', border: `1.5px solid ${BORDER}`, borderRadius: 8, background: '#f9fefb', color: TEXT_DARK, outline: 'none', fontSize: 17, fontWeight: 500, transition: 'border 0.2s' }}
              onFocus={e => e.target.style.border = `2px solid ${TAWKTO_GREEN}`}
              onBlur={e => e.target.style.border = `1.5px solid ${BORDER}`}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="accountType" style={{ color: TEXT_DARK, fontWeight: 600, display: 'block', marginBottom: 6 }}>Account Type</label>
            <select
              id="accountType"
              name="accountType"
              value={form.accountType}
              onChange={handleChange}
              required
              style={{ width: '100%', padding: '12px 14px', border: `1.5px solid ${BORDER}`, borderRadius: 8, background: '#f9fefb', color: TEXT_DARK, outline: 'none', fontSize: 17, fontWeight: 500, transition: 'border 0.2s' }}
              onFocus={e => e.target.style.border = `2px solid ${TAWKTO_GREEN}`}
              onBlur={e => e.target.style.border = `1.5px solid ${BORDER}`}
            >
              {accountTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="password" style={{ color: TEXT_DARK, fontWeight: 600, display: 'block', marginBottom: 6 }}>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Enter password"
              style={{ width: '100%', padding: '12px 14px', border: `1.5px solid ${BORDER}`, borderRadius: 8, background: '#f9fefb', color: TEXT_DARK, outline: 'none', fontSize: 17, fontWeight: 500, transition: 'border 0.2s' }}
              onFocus={e => e.target.style.border = `2px solid ${TAWKTO_GREEN}`}
              onBlur={e => e.target.style.border = `1.5px solid ${BORDER}`}
            />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label htmlFor="confirmPassword" style={{ color: TEXT_DARK, fontWeight: 600, display: 'block', marginBottom: 6 }}>Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm password"
              style={{ width: '100%', padding: '12px 14px', border: `1.5px solid ${BORDER}`, borderRadius: 8, background: '#f9fefb', color: TEXT_DARK, outline: 'none', fontSize: 17, fontWeight: 500, transition: 'border 0.2s' }}
              onFocus={e => e.target.style.border = `2px solid ${TAWKTO_GREEN}`}
              onBlur={e => e.target.style.border = `1.5px solid ${BORDER}`}
            />
          </div>
          {error && <div style={{ color: '#e53935', marginBottom: 14, textAlign: 'center', fontWeight: 600 }}>{error}</div>}
          <button type="submit" style={{ width: '100%', background: TAWKTO_GREEN, color: '#fff', border: 'none', borderRadius: 24, padding: '16px 0', fontWeight: 800, fontSize: 18, marginTop: 8, cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 2px 8px rgba(0,206,125,0.08)' }} disabled={loading}
            onMouseOver={e => e.target.style.background = TAWKTO_GREEN_DARK}
            onMouseOut={e => e.target.style.background = TAWKTO_GREEN}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
          <div style={{ margin: '24px 0 0 0', borderTop: `1px solid ${BORDER}`, paddingTop: 16, textAlign: 'center', color: '#888', fontSize: 13 }}>
            By signing up, you agree to our <span style={{ color: TAWKTO_GREEN, fontWeight: 600 }}>Terms of Service</span> and <span style={{ color: TAWKTO_GREEN, fontWeight: 600 }}>Privacy Policy</span>.
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup; 