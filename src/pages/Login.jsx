import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { showSuccess } from '../utils/toast';
import { login } from '../services/operations/authApi';
import Logo from '../assets/img/logo/logo-1.png';

const ED_TEAL = '#07A698';
const ED_TEAL_DARK = '#059a8c';

const BORDER = '#e0e0e0';
const TEXT_DARK = '#191A1F';

const Login = ({ isUniversity = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get redirect path from URL query params
  const searchParams = new URLSearchParams(location.search);
  // For students, always default to /dashboard/my-profile
  const defaultPath = isUniversity ? '/university' : '/dashboard/my-profile';
  const redirectPath = searchParams.get('redirect') || defaultPath;

  // Secure admin mode (hide global navbar/footer via CSS)
  const isAdminMode = searchParams.get('admin') === '1';

  useEffect(() => {
    if (isAdminMode) {
      document.body.classList.add('hide-global-nav');
    }
    return () => {
      document.body.classList.remove('hide-global-nav');
    };
  }, [isAdminMode]);

  // If NOT in admin mode, clear any secure login scope cookie so normal login works
  useEffect(() => {
    if (!isAdminMode) {
      try {
        const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
        fetch(`${API_BASE}/api/v1/auth/secure/clear`, {
          credentials: 'include',
          mode: 'cors',
        }).catch(() => {});
      } catch (_) {}
    }
  }, [isAdminMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // For normal login (not admin mode), proactively clear the secure scope cookie
      if (!isAdminMode) {
        try {
          const API_BASE = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
          await fetch(`${API_BASE}/api/v1/auth/secure/clear`, {
            credentials: 'include',
            mode: 'cors',
          });
        } catch (_) {}
      }

      // Normalize email to avoid case/whitespace mismatches
      const normalizedEmail = String(email).trim().toLowerCase();
      // Call the login action and wait for it to complete
      const result = await dispatch(login(normalizedEmail, password, navigate));
      
      // Check if the login was successful
      if (result?.payload?.success) {
        showSuccess('Login successful!');
        
        // Get user data from the result
        const user = result.payload.user;
        
        // If navigate wasn't passed to login, handle navigation here
        if (!navigate) {
          setTimeout(() => {
            if (user?.accountType === 'Student' || user?.accountType === 'Admin' || user?.accountType === 'Super Admin') {
              navigate(redirectPath);
            } else if (user?.accountType === 'Instructor') {
              navigate('/instructor/dashboard/my-profile');
            } else {
              navigate('/');
            }
          }, 500);
        }
      } else if (result?.payload) {
        // If login failed but we have an error message
        setError(result.payload.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'ERR_NETWORK') {
        setError('Unable to connect to the server. Please check your internet connection.');
      } else if (err.response?.status === 401) {
        setError('Invalid email or password. Please try again.');
      } else if (err.response?.status === 404) {
        setError('No account found with this email. Please sign up first.');
      } else {
        setError(err.message || 'An error occurred during login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isAdminMode && (
        <style>{`
          /* Hide top bars/headers when in admin login mode */
          .top-bar, header.header, .header, .header-2 { display: none !important; }
        `}</style>
      )}
      <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: isAdminMode ? '2rem' : '2rem',
      paddingTop: isAdminMode ? '2rem' : '8rem',
      marginTop: isAdminMode ? '0' : '4rem',
      fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      transition: 'background 0.3s ease'
    }}>
      <div style={{ 
        background: '#fff', 
        border: `2px solid ${BORDER}`, 
        borderRadius: '20px', 
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)', 
        padding: '50px', 
        maxWidth: '450px', 
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
            fontSize: '2rem', 
            fontWeight: '700', 
            color: TEXT_DARK, 
            marginBottom: '1.5rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            Welcome Back
            <span style={{
              fontSize: '0.9rem',
              fontWeight: 'normal',
              color: '#666',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              Platform Login
            </span>
          </h2>
          <p style={{ 
            color: '#666', 
            fontSize: '16px', 
            marginBottom: '30px',
            lineHeight: '1.5'
          }}>
            Sign in to continue your learning journey
          </p>
        </div>

        <form onSubmit={handleSubmit}>
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
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="Enter your email address"
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

          {/* Password Field */}
          <div style={{ marginBottom: '30px' }}>
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
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
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
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          {/* Forgot Password Link */}
          <div style={{ 
            textAlign: 'center', 
            marginTop: '20px'
          }}>
            <Link 
              to="/forgot-password" 
              style={{ 
                color: ED_TEAL, 
                textDecoration: 'none', 
                fontSize: '14px',
                fontWeight: '600',
                transition: 'color 0.3s ease'
              }}
              onMouseOver={e => e.target.style.color = ED_TEAL_DARK}
              onMouseOut={e => e.target.style.color = ED_TEAL}
            >
              Forgot your password?
            </Link>
          </div>

          {/* Terms and Sign Up Link */}
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
              By signing in, you agree to our{' '}
              <span style={{ color: ED_TEAL, fontWeight: '600', cursor: 'pointer' }}>Terms of Service</span>
              {' '}and{' '}
              <span style={{ color: ED_TEAL, fontWeight: '600', cursor: 'pointer' }}>Privacy Policy</span>.
            </p>
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <p style={{ color: '#666', marginBottom: '10px' }}>Don't have an account?{' '}
                <Link 
                  to={`/signup${location.search}`} 
                  style={{ color: ED_TEAL, textDecoration: 'none', fontWeight: '600' }}
                >
                  Sign up
                </Link>
              </p>
              <Link 
                to="/forgot-password" 
                style={{ 
                  color: ED_TEAL, 
                  textDecoration: 'none', 
                  fontWeight: '500', 
                  fontSize: '0.9rem' 
                }}
                onMouseOver={e => (e.target.style.color = ED_TEAL_DARK)}
                onMouseOut={e => (e.target.style.color = ED_TEAL)}
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default Login; 