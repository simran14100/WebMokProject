import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/operations/authApi';
import Logo from '../assets/img/logo/logo-1.png';

const ED_TEAL = '#07A698';
const ED_TEAL_DARK = '#059a8c';
const BORDER = '#e0e0e0';
const TEXT_DARK = '#191A1F';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await dispatch(login(email, password, navigate));
    } catch (err) {
      setError('Login failed. Please check your credentials and try again.');
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
      fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ 
        background: '#fff', 
        border: '1px solid #e0e0e0', 
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
            color: TEXT_DARK, 
            fontWeight: '700', 
            fontSize: '32px', 
            marginBottom: '10px',
            letterSpacing: '-0.5px'
          }}>
            Welcome Back
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
            <p>
              Don't have an account?{' '}
              <Link to="/signup" style={{ 
                color: ED_TEAL, 
                fontWeight: '600', 
                textDecoration: 'none',
                transition: 'color 0.3s ease'
              }}
              onMouseOver={e => e.target.style.color = ED_TEAL_DARK}
              onMouseOut={e => e.target.style.color = ED_TEAL}
              >
                Sign up here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 