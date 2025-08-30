import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaUserGraduate, FaUserTie, FaSpinner } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProgram } from '../../services/operations/authApi';
import { setUser } from '../../store/slices/profileSlice';
import { setToken } from '../../store/slices/authSlice';
import { showError } from '../../utils/toast';
import store from '../../store';
import './University.css';

const ProgramSelection = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedProgram, setSelectedProgram] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useSelector((state) => state.profile);

  const programTypes = [
    {
      id: 'UG',
      title: 'Undergraduate (UG)',
      description: 'Pursuing Bachelor\'s degree',
      icon: <FaGraduationCap className="program-icon" />
    },
    {
      id: 'PG',
      title: 'Postgraduate (PG)',
      description: 'Pursuing Master\'s degree',
      icon: <FaUserGraduate className="program-icon" />
    },
    {
      id: 'PhD',
      title: 'Doctoral (PhD)',
      description: 'Pursuing Doctoral degree',
      icon: <FaUserTie className="program-icon" />
    }
  ];

  // Redirect to dashboard if program is already selected
  useEffect(() => {
    if (user?.programType) {
      navigate('/university/dashboard');
    }
  }, [user, navigate]);

  const handleProgramSelect = async (programId) => {
    if (loading) return; // Prevent multiple clicks
    
    setSelectedProgram(programId);
    setLoading(true);
    
    try {
      // Get current state
      const state = store.getState();
      let token = state?.auth?.token;
      
      // If no token in Redux, try to get it from localStorage
      if (!token) {
        try {
          const persistedAuth = localStorage.getItem('persist:auth');
          if (persistedAuth) {
            const authState = JSON.parse(persistedAuth);
            if (authState.token) {
              token = JSON.parse(authState.token);
              if (token) {
                // Update the token in Redux
                store.dispatch(setToken(token));
              }
            }
          }
        } catch (e) {
          console.error('Error parsing auth state:', e);
          throw new Error('Failed to retrieve authentication token');
        }
      }
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      // Update user's program type in the backend
      const result = await dispatch(updateUserProgram(programId));
      
      if (result?.success) {
        // Update Redux store with the new program type
        const updatedUser = {
          ...user,
          programType: programId,
          accountType: 'Student'
        };
        
        dispatch(setUser(updatedUser));
        
        // Force a complete page reload to ensure all state is reset
        window.location.href = '/university-dashboard';
        return;
      } else {
        throw new Error(result?.message || 'Failed to update program');
      }
    } catch (error) {
      console.error('Error updating program:', error);
      
      // Handle specific error cases
      if (error.message.includes('401') || 
          error.message.includes('token') || 
          error.message.includes('Session expired')) {
        showError('Session expired. Please refresh the page and try again.');
      } else {
        showError(error.message || 'Failed to update program');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="program-selection-container">
      <div className="program-selection-card">
        <h1>Select Your Program</h1>
        <p className="subtitle">Choose your academic level to continue</p>
        
        <div className="program-grid">
          {programTypes.map((program) => (
            <div 
              key={program.id}
              className={`program-card ${selectedProgram === program.id ? 'selected' : ''} ${
                loading ? 'disabled' : ''
              }`}
              onClick={() => !loading && handleProgramSelect(program.id)}
            >
              <div className="program-icon-container">
                {loading && selectedProgram === program.id ? (
                  <FaSpinner className="spinner" />
                ) : (
                  program.icon
                )}
              </div>
              <h3>{program.title}</h3>
              <p>{program.description}</p>
            </div>
          ))}
        </div>

        <p className="login-link">
          Already have an account? <span onClick={() => navigate('/university/login')}>Log in</span>
        </p>
      </div>
    </div>
  );
};

export default ProgramSelection;
