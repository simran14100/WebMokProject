import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaUserGraduate, FaUserTie } from 'react-icons/fa';
import './University.css';

const University = () => {
  const navigate = useNavigate();

  const programTypes = [
    {
      id: 'UG',
      title: 'Undergraduate (UG)',
      description: 'Pursuing Bachelor\'s degree',
      icon: <FaGraduationCap className="program-icon" />,
      path: '/signup?program=UG&redirect=/university/enrollment?program=UG'
    },
    {
      id: 'PG',
      title: 'Postgraduate (PG)',
      description: 'Pursuing Master\'s degree',
      icon: <FaUserGraduate className="program-icon" />,
      path: '/signup?program=PG&redirect=/university/enrollment?program=PG'
    },
    {
      id: 'PhD',
      title: 'Doctoral (PhD)',
      description: 'Pursuing Doctoral degree',
      icon: <FaUserTie className="program-icon" />,
      path: '/signup?program=PhD&redirect=/university/enrollment?program=PhD'
    }
  ];

  return (
    <div className="university-container">
      <div className="university-hero">
        <h1>Welcome to University Portal</h1>
        <p>Select your program type to get started</p>
      </div>
      
      <div className="program-grid">
        {programTypes.map((program) => (
          <div 
            key={program.id}
            className="program-card"
            onClick={() => navigate(program.path)}
          >
            <div className="program-icon-container">
              {program.icon}
            </div>
            <h3>{program.title}</h3>
            <p>{program.description}</p>
          </div>
        ))}
      </div>

      <div className="auth-links">
        <span>Already have an account? </span>
        <Link to="/login?redirect=/university">Log in here</Link>
      </div>
    </div>
  );
};

export default University;