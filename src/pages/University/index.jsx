import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { updateUserProgram } from '../../services/operations/authApi';

const University = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedProgram, setSelectedProgram] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProgramSelect = async (programType) => {
    console.log('Program selected:', programType);
    setSelectedProgram(programType);
    setLoading(true);
    
    try {
      console.log('Dispatching updateUserProgram with:', programType);
      const result = await dispatch(updateUserProgram(programType));
      console.log('Update program result:', result);
      
      if (result?.error) {
        console.error('Update program failed:', result.error);
        return; // Don't navigate if there was an error
      }
      
      navigate('/university/dashboard');
    } catch (error) {
      console.error('Error in handleProgramSelect:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      });
    } finally {
      setLoading(false);
    }
  };
  // Inline styles
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '2rem',
      minHeight: 'calc(100vh - 200px)',
      backgroundColor: '#f8f9fa',
    },
    hero: {
      textAlign: 'center',
      marginBottom: '3rem',
      padding: '2rem',
      background: 'linear-gradient(135deg, #07a698, #0c7b6c)',
      color: 'white',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    heroTitle: {
      fontSize: '2.5rem',
      marginBottom: '1rem',
    },
    heroSubtitle: {
      fontSize: '1.2rem',
      opacity: '0.9',
    },
    cardsContainer: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      marginTop: '2rem',
    },
    card: {
      background: 'white',
      borderRadius: '10px',
      padding: '2rem',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
    },
    cardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
    },
    cardTitle: {
      color: '#07a698',
      marginBottom: '1rem',
      fontSize: '1.5rem',
    },
    cardText: {
      color: '#555',
      marginBottom: '2rem',
      flexGrow: '1',
    },
    buttonGroup: {
      display: 'flex',
      gap: '1rem',
      marginTop: 'auto',
    },
    button: {
      padding: '0.75rem 1.5rem',
      borderRadius: '5px',
      textDecoration: 'none',
      fontWeight: '600',
      textAlign: 'center',
      transition: 'all 0.3s ease',
      border: 'none',
      cursor: 'pointer',
      flex: '1',
    },
    primaryButton: {
      backgroundColor: '#07a698',
      color: 'white',
    },
    primaryButtonHover: {
      backgroundColor: '#0c7b6c',
      transform: 'translateY(-2px)',
    },
    secondaryButton: {
      backgroundColor: 'white',
      color: '#07a698',
      border: '2px solid #07a698',
    },
    secondaryButtonHover: {
      backgroundColor: '#f0f9f8',
      transform: 'translateY(-2px)',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Welcome to Our University</h1>
        <p style={styles.heroSubtitle}>Choose your academic level and start your journey with us</p>
      </div>
      
      <div style={styles.cardsContainer}>
        <div 
          style={styles.card} 
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} 
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          onClick={() => handleProgramSelect('UG')}
          className="cursor-pointer"
        >
          <h2 style={styles.cardTitle}>Undergraduate (UG)</h2>
          <p style={styles.cardText}>
            Begin your academic journey with our undergraduate programs. 
            Choose from a wide range of bachelor's degree programs designed to help you 
            achieve your career goals.
          </p>
          <div style={styles.buttonGroup}>
            <button 
              style={{...styles.button, ...styles.primaryButton, opacity: loading && selectedProgram === 'UG' ? 0.7 : 1}}
              disabled={loading && selectedProgram === 'UG'}
            >
              {loading && selectedProgram === 'UG' ? 'Processing...' : 'Select Program'}
            </button>
          </div>
        </div>

        <div 
          style={styles.card} 
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} 
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          onClick={() => handleProgramSelect('PG')}
          className="cursor-pointer"
        >
          <h2 style={styles.cardTitle}>Postgraduate (PG)</h2>
          <p style={styles.cardText}>
            Advance your career with our postgraduate programs. 
            Choose from a range of master's degree programs designed to help you 
            specialize in your field of interest.
          </p>
          <div style={styles.buttonGroup}>
            <button 
              style={{...styles.button, ...styles.primaryButton, opacity: loading && selectedProgram === 'PG' ? 0.7 : 1}}
              disabled={loading && selectedProgram === 'PG'}
            >
              {loading && selectedProgram === 'PG' ? 'Processing...' : 'Select Program'}
            </button>
          </div>
        </div>

        <div 
          style={styles.card} 
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'} 
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          onClick={() => handleProgramSelect('PhD')}
          className="cursor-pointer"
        >
          <h2 style={styles.cardTitle}>PhD Programs</h2>
          <p style={styles.cardText}>
            Pursue advanced research and contribute to knowledge creation with our doctoral programs. 
            Work with distinguished faculty and access world-class research facilities.
          </p>
          <div style={styles.buttonGroup}>
            <button 
              style={{...styles.button, ...styles.primaryButton, opacity: loading && selectedProgram === 'PhD' ? 0.7 : 1}}
              disabled={loading && selectedProgram === 'PhD'}
            >
              {loading && selectedProgram === 'PhD' ? 'Processing...' : 'Select Program'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default University;
