import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/operations/authApi';

const TAWKTO_GREEN = '#007a44'; // dark green
const TAWKTO_GREEN_DARK = '#005c32'; // even darker for hover
const BORDER = '#e0e0e0';
const TEXT_DARK = '#222';

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
      setError('Login failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f9fefb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 18, boxShadow: '0 8px 32px rgba(0,158,92,0.08)', padding: 40, maxWidth: 400, width: '100%', position: 'relative' }}>
        {/* Green accent bar at the top */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 8, background: TAWKTO_GREEN, borderTopLeftRadius: 18, borderTopRightRadius: 18 }} />
        <h2 style={{ color: TAWKTO_GREEN, fontWeight: 800, fontSize: 32, marginBottom: 28, textAlign: 'center', letterSpacing: '-1px' }}>Sign In</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 24 }}>
            <label htmlFor="email" style={{ color: TEXT_DARK, fontWeight: 600, display: 'block', marginBottom: 8 }}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
              style={{ width: '100%', padding: '14px 16px', border: `1.5px solid ${BORDER}`, borderRadius: 8, background: '#f9fefb', color: TEXT_DARK, outline: 'none', fontSize: 17, fontWeight: 500, transition: 'border 0.2s' }}
              onFocus={e => e.target.style.border = `2px solid ${TAWKTO_GREEN}`}
              onBlur={e => e.target.style.border = `1.5px solid ${BORDER}`}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label htmlFor="password" style={{ color: TEXT_DARK, fontWeight: 600, display: 'block', marginBottom: 8 }}>Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              style={{ width: '100%', padding: '14px 16px', border: `1.5px solid ${BORDER}`, borderRadius: 8, background: '#f9fefb', color: TEXT_DARK, outline: 'none', fontSize: 17, fontWeight: 500, transition: 'border 0.2s' }}
              onFocus={e => e.target.style.border = `2px solid ${TAWKTO_GREEN}`}
              onBlur={e => e.target.style.border = `1.5px solid ${BORDER}`}
            />
          </div>
          {error && <div style={{ color: '#e53935', marginBottom: 16, textAlign: 'center', fontWeight: 600 }}>{error}</div>}
          <button type="submit" style={{ width: '100%', background: TAWKTO_GREEN, color: '#fff', border: 'none', borderRadius: 24, padding: '16px 0', fontWeight: 800, fontSize: 18, marginTop: 8, cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 2px 8px rgba(0,158,92,0.08)' }} disabled={loading}
            onMouseOver={e => e.target.style.background = TAWKTO_GREEN_DARK}
            onMouseOut={e => e.target.style.background = TAWKTO_GREEN}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          <div style={{ margin: '28px 0 0 0', borderTop: `1px solid ${BORDER}`, paddingTop: 16, textAlign: 'center', color: '#888', fontSize: 13 }}>
            By signing in, you agree to our <span style={{ color: TAWKTO_GREEN, fontWeight: 600 }}>Terms of Service</span> and <span style={{ color: TAWKTO_GREEN, fontWeight: 600 }}>Privacy Policy</span>.
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 