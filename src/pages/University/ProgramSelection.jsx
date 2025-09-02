import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaGraduationCap, FaUserGraduate, FaUserTie, FaSpinner } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { apiConnector } from '../../services/apiConnector';
import { enrollment, profile } from '../../services/apis';
import { toast } from 'react-hot-toast';
import { setUser, updateUser } from '../../store/slices/profileSlice';
import { setToken } from '../../store/slices/authSlice';
import './University.css';

const ProgramSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showEnquiryModal, setShowEnquiryModal] = useState(false);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    fatherName: '',
    programType: '',
    firstName: '',
    lastName: ''
  });
  const { token } = useSelector((state) => state.auth);
  const currentUser = useSelector((state) => state.profile.user);

  // Program types
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

  // Check for existing program type on component mount
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const isUpdating = searchParams.get('update') === 'true';
    
    const checkExistingProgram = async () => {
      // If we're updating the program, don't redirect
      if (isUpdating) {
        console.log('Update mode: Allowing program selection');
        return;
      }
      
      // If user already has a program type, redirect to enrollment status
      if (currentUser?.programType) {
        console.log('User already has a program type, redirecting to enrollment status');
        navigate('/university/enrollment');
        return;
      }
      
      // Check localStorage for saved program type
      const savedProgram = localStorage.getItem('selectedProgram');
      if (savedProgram) {
        console.log('Found saved program in localStorage, redirecting to enrollment status');
        navigate('/university/enrollment');
      }
    };

    checkExistingProgram();
  }, [currentUser, navigate, location.search]);

  // Handle program selection
  const handleProgramSelect = async (program) => {
    // Save the selected program to localStorage
    localStorage.setItem('selectedProgram', program);
    
    // Update the local state
    setSelectedProgram(program);
    
    // Update the form data
    setFormData(prev => ({
      ...prev,
      programType: program,
      email: currentUser?.email || '',
      firstName: currentUser?.firstName || '',
      lastName: currentUser?.lastName || '',
      phone: currentUser?.phone || ''
    }));
    
    // If user is not logged in, show enquiry form
    if (!token) {
      console.log('User not authenticated, showing enquiry form');
      setShowEnquiryModal(true);
      return;
    }
    
    // If user is logged in, update their profile with the selected program
    try {
      await apiConnector(
        'PUT',
        '/api/v1/profile/updateProfile',
        { programType: program },
        {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      );
      
      // Redirect to enrollment status page
      navigate('/university/enrollment');
    } catch (error) {
      console.error('Error updating program type:', error);
      toast.error('Failed to save program selection. Please try again.');
    }
  };

  // Handle enquiry form submission
  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Basic validation
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Submitting your enquiry...');
    
    try {
      // Submit the enquiry
      const enquiryResponse = await apiConnector(
        'POST',
        '/api/v1/enquiry',
        {
          ...formData,
          programType: selectedProgram,
          status: 'new',
          source: 'website'
        },
        {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : undefined,
          'X-Skip-Interceptor': 'true'
        }
      );
      
      if (!enquiryResponse.data?.success) {
        throw new Error(enquiryResponse.data?.message || 'Failed to submit enquiry');
      }
      
      // If user is logged in, create enrollment as well
      if (token) {
        await apiConnector(
          'POST',
          '/api/v1/enrollment/status',
          {
            programType: selectedProgram,
            enquiryId: enquiryResponse.data.enquiry?._id
          },
          {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Skip-Interceptor': 'true'
          }
        );
      }
      
      toast.success('Your enquiry has been submitted successfully!');
      setShowEnquiryModal(false);
      
      // Redirect based on authentication status
      if (token) {
        navigate('/dashboard');
      } else {
        navigate('/thank-you', { 
          state: { 
            message: 'Thank you for your interest! We will contact you shortly.',
            showLogin: true
          } 
        });
      }
      
    } catch (error) {
      console.error('Error submitting enquiry:', {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      
      let errorMessage = 'Failed to submit enquiry. ';
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      toast.dismiss(toastId);
    }
  };

  // Handle input change for the forms
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle program selection submission
  const handleProgramSelectSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.fatherName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Saving your program selection...');
    
    try {
      // Update user's program selection
      const response = await apiConnector(
        'PUT',
        '/api/v1/profile/updateProfile',
        {
          programType: formData.programType,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          fatherName: formData.fatherName
        },
        {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-Skip-Interceptor': 'true'
        }
      );
      console.log(response.data);
      
      if (!response.data?.success) {
        throw new Error(response.data?.message || 'Failed to save program selection');
      }
      
      // Show success message
      toast.success('Program selection saved successfully!');
      setShowEnrollmentModal(false);

      // Navigate based on enrollment status
      if (response.data?.data?.enrollmentStatus === 'Approved') {
        // If enrolled, go to respective dashboard
        if (formData.programType === 'phd') {
          navigate('/phd-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        // If not enrolled, go to enrollment status page with program type
        navigate(`/university/enrollment?program=${encodeURIComponent(formData.programType)}`);
      }
      
    } catch (error) {
      console.error('Error submitting enrollment:', {
        message: error.message,
        response: error.response?.data,
        request: {
          url: error.config?.url,
          method: error.config?.method,
          data: error.config?.data,
          headers: error.config?.headers
        }
      });
      
      let errorMessage = 'Failed to submit enrollment. ';
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      toast.dismiss(toastId);
    }
  };


  // Get program title by ID
  const getProgramTitle = (id) => {
    const program = programTypes.find(p => p.id === id);
    return program ? program.title : '';
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
              className={`program-card ${selectedProgram === program.id ? 'selected' : ''}`}
              onClick={() => handleProgramSelect(program.id)}
            >
              <div className="program-icon-container">
                {program.icon}
              </div>
              <h3>{program.title}</h3>
              <p>{program.description}</p>
              {loading && selectedProgram === program.id && (
                <div className="loading-spinner">
                  <FaSpinner className="spinner" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

     

      {/* Enrollment Modal */}
      {showEnrollmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Enroll in {getProgramTitle(formData.programType)}</h2>
            <form onSubmit={handleProgramSelectSubmit}>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Father's Name *
                </label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Program *
                </label>
                <select
                  name="programType"
                  value={formData.programType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Program</option>
                  {programTypes.map(program => (
                    <option key={program.id} value={program.id}>
                      {program.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => setShowEnrollmentModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 mr-2"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-lg text-white ${isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Enrollment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

     
    </div>
  );
};

export default ProgramSelection;
