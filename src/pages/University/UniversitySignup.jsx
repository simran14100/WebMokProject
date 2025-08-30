import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { universitySignup } from '../../services/operations/authApi';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaUserGraduate, FaUserTie, FaCheckCircle } from 'react-icons/fa';
import './University.css';

const ED_TEAL = '#07A698';
const ED_TEAL_DARK = '#059a8c';

const UniversitySignup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const programType = searchParams.get('program')?.toUpperCase() || 'UG';
  const { user } = useSelector((state) => state.profile);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [userProgram, setUserProgram] = useState('');

  // Check if user is already registered and has a program type
  useEffect(() => {
    if (user) {
      // Extract program from accountType (e.g., 'UG Student' -> 'UG')
      const userProgramType = user.accountType?.split(' ')[0];
      setUserProgram(userProgramType);
      
      if (userProgramType && userProgramType !== programType) {
        setAlreadyRegistered(true);
      } else if (userProgramType === programType) {
        // If already registered for this program, redirect to dashboard
        navigate('/university/dashboard');
      }
    }
  }, [user, programType, navigate]);
  
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    accountType: programType === 'PhD' ? 'PhD Student' : 
                programType === 'PG' ? 'PG Student' : 'UG Student',
    password: '',
    confirmPassword: '',
    program: programType,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Program types configuration
  const programTypes = {
    'UG': {
      title: 'Undergraduate Program',
      description: 'Bachelor\'s Degree',
      icon: <FaGraduationCap className="program-icon" />
    },
    'PG': {
      title: 'Postgraduate Program',
      description: 'Master\'s Degree',
      icon: <FaUserGraduate className="program-icon" />
    },
    'PhD': {
      title: 'Doctoral Program',
      description: 'Doctor of Philosophy',
      icon: <FaUserTie className="program-icon" />
    }
  };
  
  const selectedProgram = programTypes[programType] || programTypes['UG'];

  const validateForm = () => {
    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.password || !form.confirmPassword) {
      setError('All fields are required');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const result = await dispatch(universitySignup({
        ...form,
        navigate
      }));

      if (result?.error) {
        throw new Error(result.error);
      }

      // If we get here, signup was successful
      navigate('/university/login', { 
        state: { 
          message: 'Registration successful! Please login to continue.',
          email: form.email
        },
        replace: true
      });
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.response?.data?.message || error.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Show message if already registered for a different program
  if (alreadyRegistered) {
    return (
      <div className="university-auth-container">
        <div className="university-auth-box" style={{ textAlign: 'center' }}>
          <div className="program-icon-container" style={{ margin: '0 auto 1.5rem' }}>
            <FaCheckCircle style={{ color: '#4CAF50', fontSize: '4rem' }} />
          </div>
          <h2>Already Registered</h2>
          <p className="program-description">
            You are already registered for the <strong>{userProgram} Program</strong>.
          </p>
          <p>Please log in to access your dashboard.</p>
          <div style={{ marginTop: '2rem' }}>
            <Link to="/university/login" className="btn btn-primary">
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="university-auth-container">
      <div className="university-auth-box">
        <div className="program-header">
          <div className="program-icon-container">
            {selectedProgram.icon}
          </div>
          <h2>{selectedProgram.title}</h2>
          <p className="program-description">
            {selectedProgram.description}
            {user && !alreadyRegistered && (
              <span style={{ display: 'block', marginTop: '0.5rem', color: '#4CAF50' }}>
                You're registering for a new program
              </span>
            )}
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="university-auth-form">
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="Enter your first name"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Enter your last name"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a password (min 8 characters)"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
          
          <div className="auth-links">
            Already have an account?{' '}
            <Link to="/university/login">Log in</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UniversitySignup;
