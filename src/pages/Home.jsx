import React from 'react';
import { Link } from 'react-router-dom';

const TAWKTO_GREEN = '#009e5c'; // new default button color
const TAWKTO_GREEN_DARK = '#007a44'; // darker for hover
const BORDER = '#e0e0e0';
const TEXT_DARK = '#222';

const Home = () => {
  return (
    <div style={{ background: '#f9fefb', minHeight: '100vh' }}>
      {/* Hero Section */}
      <div style={{ padding: '5rem 0 3rem 0', textAlign: 'center', background: '#fff' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative' }}>
          <h1 style={{ fontSize: 54, fontWeight: 900, color: TEXT_DARK, marginBottom: 18, letterSpacing: '-2px', lineHeight: 1.1 }}>
            Welcome to WebMok
          </h1>
          {/* Green accent underline */}
          <div style={{ width: 120, height: 6, background: TAWKTO_GREEN, borderRadius: 4, margin: '0 auto 24px' }} />
          <p style={{ fontSize: 24, color: TEXT_DARK, marginBottom: 40, fontWeight: 500, lineHeight: 1.4 }}>
            Your gateway to quality education with a comprehensive 5-role system designed for students, instructors, and administrators.
          </p>
          <div style={{ display: 'flex', gap: 28, justifyContent: 'center', marginBottom: 48, flexWrap: 'wrap' }}>
            <Link to="/signup">
              <button style={{ background: TAWKTO_GREEN, color: '#fff', border: 'none', borderRadius: 28, fontWeight: 800, fontSize: 22, padding: '1em 2.8em', boxShadow: '0 2px 8px rgba(0,158,92,0.10)', cursor: 'pointer', transition: 'background 0.2s', letterSpacing: '0.5px' }}
                onMouseOver={e => e.target.style.background = TAWKTO_GREEN_DARK}
                onMouseOut={e => e.target.style.background = TAWKTO_GREEN}
              >
                Get Started
              </button>
            </Link>
            <Link to="/about">
              <button style={{ background: '#e6fcf5', color: TAWKTO_GREEN, border: `2px solid ${TAWKTO_GREEN}`, borderRadius: 28, fontWeight: 800, fontSize: 22, padding: '1em 2.8em', cursor: 'pointer', transition: 'color 0.2s, background 0.2s', letterSpacing: '0.5px' }}
                onMouseOver={e => { e.target.style.background = TAWKTO_GREEN; e.target.style.color = '#fff'; }}
                onMouseOut={e => { e.target.style.background = '#e6fcf5'; e.target.style.color = TAWKTO_GREEN; }}
              >
                Learn More
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div style={{ padding: '3rem 0', background: '#f9fefb' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 36, fontWeight: 700, color: TEXT_DARK, marginBottom: 16 }}>
            Designed for Everyone
          </h2>
          <p style={{ fontSize: 22, color: TEXT_DARK, maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}>
            Our platform caters to different user roles with specialized features and dashboards.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32, padding: '0 20px' }}>
          {/* Students Card */}
          <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 32 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, background: 'linear-gradient(to right, #4facfe, #00f2fe)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <span style={{ fontSize: 48 }}>🎓</span>
              </div>
              <h3 style={{ fontSize: 28, fontWeight: 700, color: TEXT_DARK, marginBottom: 16 }}>For Students</h3>
              <p style={{ color: TEXT_DARK, marginBottom: 24 }}>
                Access quality courses, track your progress, and pay enrollment fees to unlock premium content.
              </p>
              <ul style={{ textAlign: 'left', color: TEXT_DARK, marginBottom: 24 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: TAWKTO_GREEN }}>✓</span>
                  <span>Course enrollment system</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: TAWKTO_GREEN }}>✓</span>
                  <span>Progress tracking</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: TAWKTO_GREEN }}>✓</span>
                  <span>Payment integration</span>
                </li>
              </ul>
              <Link to="/signup">
                <button style={{ width: '100%', background: 'linear-gradient(to right, #4facfe, #00f2fe)', color: '#fff', border: 'none', borderRadius: 24, fontWeight: 700, fontSize: 20, padding: '0.75em 2.5em', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseOver={e => e.target.style.background = 'linear-gradient(to right, #3a86e0, #00b86b)' }
                  onMouseOut={e => e.target.style.background = 'linear-gradient(to right, #4facfe, #00f2fe)' }
                >
                  Join as Student
                </button>
              </Link>
            </div>
          </div>

          {/* Instructors Card */}
          <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 32 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, background: 'linear-gradient(to right, #4CAF50, #66BB6A)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <span style={{ fontSize: 48 }}>👨‍🏫</span>
              </div>
              <h3 style={{ fontSize: 28, fontWeight: 700, color: TEXT_DARK, marginBottom: 16 }}>For Instructors</h3>
              <p style={{ color: TEXT_DARK, marginBottom: 24 }}>
                Create and manage your courses, get approved by admins, and reach students worldwide.
              </p>
              <ul style={{ textAlign: 'left', color: TEXT_DARK, marginBottom: 24 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: TAWKTO_GREEN }}>✓</span>
                  <span>Course creation tools</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: TAWKTO_GREEN }}>✓</span>
                  <span>Approval workflow</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: TAWKTO_GREEN }}>✓</span>
                  <span>Student management</span>
                </li>
              </ul>
              <Link to="/signup">
                <button style={{ width: '100%', background: 'linear-gradient(to right, #4CAF50, #66BB6A)', color: '#fff', border: 'none', borderRadius: 24, fontWeight: 700, fontSize: 20, padding: '0.75em 2.5em', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseOver={e => e.target.style.background = 'linear-gradient(to right, #3a86e0, #00b86b)' }
                  onMouseOut={e => e.target.style.background = 'linear-gradient(to right, #4CAF50, #66BB6A)' }
                >
                  Become Instructor
                </button>
              </Link>
            </div>
          </div>

          {/* Admins Card */}
          <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 32 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 64, height: 64, background: 'linear-gradient(to right, #9C27B0, #AB47BC)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <span style={{ fontSize: 48 }}>⚙️</span>
              </div>
              <h3 style={{ fontSize: 28, fontWeight: 700, color: TEXT_DARK, marginBottom: 16 }}>For Admins</h3>
              <p style={{ color: TEXT_DARK, marginBottom: 24 }}>
                Manage the platform, approve instructors, and oversee user management with powerful tools.
              </p>
              <ul style={{ textAlign: 'left', color: TEXT_DARK, marginBottom: 24 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: TAWKTO_GREEN }}>✓</span>
                  <span>User management</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: TAWKTO_GREEN }}>✓</span>
                  <span>Instructor approval</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: TAWKTO_GREEN }}>✓</span>
                  <span>Platform analytics</span>
                </li>
              </ul>
              <Link to="/signup">
                <button style={{ width: '100%', background: 'linear-gradient(to right, #9C27B0, #AB47BC)', color: '#fff', border: 'none', borderRadius: 24, fontWeight: 700, fontSize: 20, padding: '0.75em 2.5em', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseOver={e => e.target.style.background = 'linear-gradient(to right, #7b1fa2, #8e24aa)' }
                  onMouseOut={e => e.target.style.background = 'linear-gradient(to right, #9C27B0, #AB47BC)' }
                >
                  Admin Access
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ padding: '3.5rem 0', background: '#f9fefb' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 36, textAlign: 'center' }}>
          <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 40 }}>
            <div style={{ fontSize: 40, fontWeight: 900, color: TAWKTO_GREEN, marginBottom: 10 }}>5</div>
            <div style={{ color: TEXT_DARK, fontWeight: 600, fontSize: 18 }}>User Roles</div>
          </div>
          <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 40 }}>
            <div style={{ fontSize: 40, fontWeight: 900, color: TAWKTO_GREEN, marginBottom: 10 }}>₹1000</div>
            <div style={{ color: TEXT_DARK, fontWeight: 600, fontSize: 18 }}>Enrollment Fee</div>
          </div>
          <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 40 }}>
            <div style={{ fontSize: 40, fontWeight: 900, color: TAWKTO_GREEN, marginBottom: 10 }}>24/7</div>
            <div style={{ color: TEXT_DARK, fontWeight: 600, fontSize: 18 }}>Support</div>
          </div>
          <div style={{ background: '#fff', border: `1px solid ${BORDER}`, borderRadius: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', padding: 40 }}>
            <div style={{ fontSize: 40, fontWeight: 900, color: TAWKTO_GREEN, marginBottom: 10 }}>100%</div>
            <div style={{ color: TEXT_DARK, fontWeight: 600, fontSize: 18 }}>Secure</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 