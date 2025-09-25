import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { signUp, sendOtp } from '../services/operations/authApi';
import Logo from '../assets/img/logo/logo-1.png';

const ED_TEAL = '#07A698';
const ED_TEAL_DARK = '#059a8c';
const BORDER = '#e0e0e0';
const TEXT_DARK = '#191A1F';

const accountTypes = [
  { value: 'Student', label: 'Student' },
  // { value: 'Instructor', label: 'Instructor' },
  // { value: 'Admin', label: 'Admin' },
  // { value: 'SuperAdmin', label: 'Super Admin' },
  // { value: 'Staff', label: 'Staff' },
];

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get redirect path and program type from URL query params
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || '/dashboard';
  const programType = searchParams.get('program') || '';
  
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
    setError('');
    
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare additional data including program type if present
      const additionalData = programType ? { programType } : {};
      
      // Dispatch the signup action with all required parameters
      const result = await dispatch(
        signUp(
          form.accountType,
          form.firstName,
          form.lastName,
          form.email,
          form.password,
          form.confirmPassword,
          form.otp,
          additionalData,
          // Pass a callback that will be called after successful signup
          (userData) => {
            // After successful signup, navigate to the redirect path
            navigate(redirectPath);
          }
        )
      );

      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '2rem',
      paddingTop: '4rem',
      marginTop:'8rem',
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '2rem',
      fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ 
        background: '#fff', 
        border: '1px solid #e0e0e0', 
        borderRadius: '20px', 
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)', 
        padding: '50px', 
        maxWidth: '500px', 
        width: '100%', 
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Top accent bar */}
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '6px', 
          background: `linear-gradient(90deg, ${ED_TEAL} 0%, ${ED_TEAL_DARK} 100%)`, 
          borderTopLeftRadius: '20px', 
          borderTopRightRadius: '20px' 
        }} />
        
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img src={Logo} alt="EdCare Logo" style={{ height: '50px', marginBottom: '20px' }} />
          <h2 style={{ 
            color: TEXT_DARK, 
            fontWeight: '700', 
            fontSize: '32px', 
            marginBottom: '10px',
            letterSpacing: '-0.5px'
          }}>
            Create Account
          </h2>
          <p style={{ 
            color: '#666', 
            fontSize: '16px', 
            marginBottom: '30px',
            lineHeight: '1.5'
          }}>
            Join EdCare and start your learning journey today
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name Fields */}
          <div style={{ marginBottom: '25px', display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="firstName" style={{ 
                color: TEXT_DARK, 
                fontWeight: '600', 
                display: 'block', 
                marginBottom: '8px',
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange}
                required
                placeholder="Enter first name"
                style={{ 
                  width: '100%', 
                  padding: '15px 18px', 
                  border: '2px solid #e0e0e0', 
                  borderRadius: '12px', 
                  background: '#f8f9fa', 
                  color: TEXT_DARK, 
                  outline: 'none', 
                  fontSize: '16px', 
                  fontWeight: '500', 
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={e => {
                  e.target.style.border = `2px solid ${ED_TEAL}`;
                  e.target.style.background = '#ffffff';
                  e.target.style.boxShadow = `0 0 0 3px rgba(7, 166, 152, 0.1)`;
                }}
                onBlur={e => {
                  e.target.style.border = '2px solid #e0e0e0';
                  e.target.style.background = '#f8f9fa';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label htmlFor="lastName" style={{ 
                color: TEXT_DARK, 
                fontWeight: '600', 
                display: 'block', 
                marginBottom: '8px',
                fontSize: '14px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange}
                required
                placeholder="Enter last name"
                style={{ 
                  width: '100%', 
                  padding: '15px 18px', 
                  border: '2px solid #e0e0e0', 
                  borderRadius: '12px', 
                  background: '#f8f9fa', 
                  color: TEXT_DARK, 
                  outline: 'none', 
                  fontSize: '16px', 
                  fontWeight: '500', 
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={e => {
                  e.target.style.border = `2px solid ${ED_TEAL}`;
                  e.target.style.background = '#ffffff';
                  e.target.style.boxShadow = `0 0 0 3px rgba(7, 166, 152, 0.1)`;
                }}
                onBlur={e => {
                  e.target.style.border = '2px solid #e0e0e0';
                  e.target.style.background = '#f8f9fa';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Email Field */}
          <div style={{ marginBottom: '25px' }}>
            <label htmlFor="email" style={{ 
              color: TEXT_DARK, 
              fontWeight: '600', 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Email Address
            </label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
                style={{ 
                  flex: 1, 
                  padding: '15px 18px', 
                  border: '2px solid #e0e0e0', 
                  borderRadius: '12px', 
                  background: '#f8f9fa', 
                  color: TEXT_DARK, 
                  outline: 'none', 
                  fontSize: '16px', 
                  fontWeight: '500', 
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={e => {
                  e.target.style.border = `2px solid ${ED_TEAL}`;
                  e.target.style.background = '#ffffff';
                  e.target.style.boxShadow = `0 0 0 3px rgba(7, 166, 152, 0.1)`;
                }}
                onBlur={e => {
                  e.target.style.border = '2px solid #e0e0e0';
                  e.target.style.background = '#f8f9fa';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button 
                type="button" 
                onClick={handleSendOtp} 
                disabled={otpLoading || !form.email || !validateEmail(form.email)} 
                style={{ 
                  background: otpSent ? '#28a745' : ED_TEAL, 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '12px', 
                  padding: '15px 20px', 
                  fontWeight: '600', 
                  fontSize: '14px', 
                  cursor: otpLoading ? 'not-allowed' : 'pointer', 
                  transition: 'all 0.3s ease', 
                  minWidth: '120px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  opacity: otpLoading ? 0.7 : 1
                }}
                onMouseOver={e => {
                  if (!otpLoading) {
                    e.target.style.background = otpSent ? '#218838' : ED_TEAL_DARK;
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(7, 166, 152, 0.3)';
                  }
                }}
                onMouseOut={e => {
                  e.target.style.background = otpSent ? '#28a745' : ED_TEAL;
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                {otpLoading ? 'Sending...' : otpSent ? 'OTP Sent' : 'Send OTP'}
              </button>
            </div>
            {emailError && (
              <div style={{ 
                color: '#dc3545', 
                marginTop: '8px', 
                fontWeight: '500', 
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <i className="fa-solid fa-exclamation-circle"></i>
                {emailError}
              </div>
            )}
          </div>

          {/* OTP Field */}
          <div style={{ marginBottom: '25px' }}>
            <label htmlFor="otp" style={{ 
              color: TEXT_DARK, 
              fontWeight: '600', 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Verification Code
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              value={form.otp}
              onChange={handleChange}
              required
              placeholder="Enter 6-digit OTP"
              style={{ 
                width: '100%', 
                padding: '15px 18px', 
                border: '2px solid #e0e0e0', 
                borderRadius: '12px', 
                background: '#f8f9fa', 
                color: TEXT_DARK, 
                outline: 'none', 
                fontSize: '16px', 
                fontWeight: '500', 
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                letterSpacing: '2px',
                textAlign: 'center'
              }}
              onFocus={e => {
                e.target.style.border = `2px solid ${ED_TEAL}`;
                e.target.style.background = '#ffffff';
                e.target.style.boxShadow = `0 0 0 3px rgba(7, 166, 152, 0.1)`;
              }}
              onBlur={e => {
                e.target.style.border = '2px solid #e0e0e0';
                e.target.style.background = '#f8f9fa';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Phone Field */}
          <div style={{ marginBottom: '25px' }}>
            <label htmlFor="phone" style={{ 
              color: TEXT_DARK, 
              fontWeight: '600', 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Phone Number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={handleChange}
              required
              placeholder="Enter your phone number"
              style={{ 
                width: '100%', 
                padding: '15px 18px', 
                border: '2px solid #e0e0e0', 
                borderRadius: '12px', 
                background: '#f8f9fa', 
                color: TEXT_DARK, 
                outline: 'none', 
                fontSize: '16px', 
                fontWeight: '500', 
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={e => {
                e.target.style.border = `2px solid ${ED_TEAL}`;
                e.target.style.background = '#ffffff';
                e.target.style.boxShadow = `0 0 0 3px rgba(7, 166, 152, 0.1)`;
              }}
              onBlur={e => {
                e.target.style.border = '2px solid #e0e0e0';
                e.target.style.background = '#f8f9fa';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Account Type Field */}
          <div style={{ marginBottom: '25px' }}>
            <label htmlFor="accountType" style={{ 
              color: TEXT_DARK, 
              fontWeight: '600', 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Account Type
            </label>
            <select
              id="accountType"
              name="accountType"
              value={form.accountType}
              onChange={handleChange}
              required
              style={{ 
                width: '100%', 
                padding: '15px 18px', 
                border: '2px solid #e0e0e0', 
                borderRadius: '12px', 
                background: '#f8f9fa', 
                color: TEXT_DARK, 
                outline: 'none', 
                fontSize: '16px', 
                fontWeight: '500', 
                transition: 'all 0.3s ease',
                boxSizing: 'border-box',
                cursor: 'pointer'
              }}
              onFocus={e => {
                e.target.style.border = `2px solid ${ED_TEAL}`;
                e.target.style.background = '#ffffff';
                e.target.style.boxShadow = `0 0 0 3px rgba(7, 166, 152, 0.1)`;
              }}
              onBlur={e => {
                e.target.style.border = '2px solid #e0e0e0';
                e.target.style.background = '#f8f9fa';
                e.target.style.boxShadow = 'none';
              }}
            >
              {accountTypes.map((type) => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Password Fields */}
          <div style={{ marginBottom: '25px' }}>
            <label htmlFor="password" style={{ 
              color: TEXT_DARK, 
              fontWeight: '600', 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              placeholder="Create a strong password"
              style={{ 
                width: '100%', 
                padding: '15px 18px', 
                border: '2px solid #e0e0e0', 
                borderRadius: '12px', 
                background: '#f8f9fa', 
                color: TEXT_DARK, 
                outline: 'none', 
                fontSize: '16px', 
                fontWeight: '500', 
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={e => {
                e.target.style.border = `2px solid ${ED_TEAL}`;
                e.target.style.background = '#ffffff';
                e.target.style.boxShadow = `0 0 0 3px rgba(7, 166, 152, 0.1)`;
              }}
              onBlur={e => {
                e.target.style.border = '2px solid #e0e0e0';
                e.target.style.background = '#f8f9fa';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label htmlFor="confirmPassword" style={{ 
              color: TEXT_DARK, 
              fontWeight: '600', 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
              style={{ 
                width: '100%', 
                padding: '15px 18px', 
                border: '2px solid #e0e0e0', 
                borderRadius: '12px', 
                background: '#f8f9fa', 
                color: TEXT_DARK, 
                outline: 'none', 
                fontSize: '16px', 
                fontWeight: '500', 
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={e => {
                e.target.style.border = `2px solid ${ED_TEAL}`;
                e.target.style.background = '#ffffff';
                e.target.style.boxShadow = `0 0 0 3px rgba(7, 166, 152, 0.1)`;
              }}
              onBlur={e => {
                e.target.style.border = '2px solid #e0e0e0';
                e.target.style.background = '#f8f9fa';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ 
              color: '#dc3545', 
              marginBottom: '20px', 
              textAlign: 'center', 
              fontWeight: '600',
              fontSize: '14px',
              padding: '12px',
              background: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <i className="fa-solid fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            style={{ 
              width: '100%', 
              background: ED_TEAL, 
              color: '#fff', 
              border: 'none', 
              borderRadius: '50px', 
              padding: '18px 0', 
              fontWeight: '700', 
              fontSize: '16px', 
              cursor: 'pointer', 
              transition: 'all 0.3s ease', 
              boxShadow: '0 4px 15px rgba(7, 166, 152, 0.2)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              opacity: loading ? 0.7 : 1
            }} 
            disabled={loading}
            onMouseOver={e => {
              if (!loading) {
                e.target.style.background = ED_TEAL_DARK;
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(7, 166, 152, 0.3)';
              }
            }}
            onMouseOut={e => {
              e.target.style.background = ED_TEAL;
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(7, 166, 152, 0.2)';
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>

          {/* Terms and Login Link */}
          <div style={{ 
            margin: '30px 0 0 0', 
            borderTop: '1px solid #e0e0e0', 
            paddingTop: '20px', 
            textAlign: 'center', 
            color: '#666', 
            fontSize: '14px',
            lineHeight: '1.6'
          }}>
            <p style={{ marginBottom: '15px' }}>
              By creating an account, you agree to our{' '}
              <span style={{ color: ED_TEAL, fontWeight: '600', cursor: 'pointer' }}>Terms of Service</span>
              {' '}and{' '}
              <span style={{ color: ED_TEAL, fontWeight: '600', cursor: 'pointer' }}>Privacy Policy</span>.
            </p>
            <p>
              Already have an account?{' '}
              <Link to="/login" style={{ 
                color: ED_TEAL, 
                fontWeight: '600', 
                textDecoration: 'none',
                transition: 'color 0.3s ease'
              }}
              onMouseOver={e => e.target.style.color = ED_TEAL_DARK}
              onMouseOut={e => e.target.style.color = ED_TEAL}
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup; 