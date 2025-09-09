import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { FaGraduationCap, FaUserGraduate, FaUserTie, FaSpinner } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { apiConnector } from '../../services/apiConnector';
import { profile } from '../../services/apis';
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

  // Use ref to track initial render
  const initialRender = React.useRef(true);
  const redirectedOnLoad = React.useRef(false);

  // Prefill from URL/localStorage once; do not navigate here to avoid loops
  useEffect(() => {
    if (showEnrollmentModal) return;
    if (initialRender.current) {
      initialRender.current = false;
      const searchParams = new URLSearchParams(location.search);
      const programFromUrl = searchParams.get('program');
      const isUpdating = searchParams.get('update') === 'true';

      // If user already has a programType, redirect once to enrollment status (but NOT during update flow)
      if (!redirectedOnLoad.current && token && currentUser?.programType && !isUpdating) {
        redirectedOnLoad.current = true;
        navigate(`/university/enrollment?program=${currentUser.programType}`);
        return;
      }

      if (programFromUrl) {
        const program = programTypes.find(p => p.id === programFromUrl);
        if (program) {
          setSelectedProgram(programFromUrl);
          setFormData(prev => ({
            ...prev,
            programType: programFromUrl,
            email: currentUser?.email || '',
            firstName: currentUser?.firstName || '',
            lastName: currentUser?.lastName || '',
            phone: currentUser?.phone || ''
          }));
          return;
        }
      }

      const savedProgram = localStorage.getItem('selectedProgram');
      if (savedProgram) {
        setSelectedProgram(savedProgram);
        setFormData(prev => ({
          ...prev,
          programType: savedProgram,
          email: currentUser?.email || '',
          firstName: currentUser?.firstName || '',
          lastName: currentUser?.lastName || '',
          phone: currentUser?.phone || ''
        }));
      }

      // If update flow requested, auto-open modal using known program
      if (isUpdating) {
        const updateProgram = programFromUrl || currentUser?.programType || savedProgram;
        if (updateProgram) {
          setSelectedProgram(updateProgram);
          setFormData(prev => ({
            ...prev,
            programType: updateProgram,
            email: currentUser?.email || '',
            firstName: currentUser?.firstName || '',
            lastName: currentUser?.lastName || '',
            phone: currentUser?.phone || ''
          }));
          // Only open modal if authenticated; otherwise user must login first
          if (token) {
            setShowEnrollmentModal(true);
          }
        }
      }
    }
  }, [location.search, showEnrollmentModal, token, currentUser?.programType, navigate]);

  // Handle program selection
  const handleProgramSelect = async (program) => {
    try {
      setLoading(true);
      
      // Save the selected program to localStorage
      localStorage.setItem('selectedProgram', program);
      
      // Update the local state
      setSelectedProgram(program);
      setFormData(prev => ({
        ...prev,
        programType: program,
        email: currentUser?.email || '',
        firstName: currentUser?.firstName || '',
        lastName: currentUser?.lastName || '',
        phone: currentUser?.phone || ''
      }));
      
      // If user is not logged in, redirect to login with return URL
      if (!token) {
        navigate(`/login?redirect=/university?program=${program}`);
        return;
      }

      // Respect update flow: if ?update=true, always open modal even if same program
      const searchParams = new URLSearchParams(location.search);
      const isUpdating = searchParams.get('update') === 'true';

      // If user already has this program type and NOT updating, go directly to enrollment status
      if (!isUpdating && currentUser?.programType === program) {
        navigate(`/university/enrollment?program=${program}`);
        return;
      }

      // Open the enrollment modal; do not navigate or call backend here
      setShowEnrollmentModal(true);
    } catch (error) {
      console.error('Error in handleProgramSelect:', {
        error: error.response?.data || error.message,
        stack: error.stack
      });
      
      toast.error('Failed to start enrollment. Please try again.');
    } finally {
      setLoading(false);
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
      
      // Update Redux user so ProtectedRoute allows /university/enrollment
      if (response.data?.data) {
        dispatch(updateUser(response.data.data));
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Select Your Program
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Choose your academic level to continue
          </p>
        </div>

        <div className="mt-10 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {programTypes.map((program) => {
            const isSelected = selectedProgram === program.id;
            const isLoading = loading && isSelected;
            
            return (
              <div
                key={program.id}
                onClick={() => !isLoading && handleProgramSelect(program.id)}
                className={`relative bg-white overflow-hidden shadow rounded-lg cursor-pointer border-2 transition-all duration-200 ${
                  isSelected 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                } ${isLoading ? 'opacity-75 cursor-wait' : ''}`}
              >
                <div className="px-6 py-8">
                  <div className={`flex items-center justify-center h-16 w-16 rounded-full mx-auto mb-4 ${
                    isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {React.cloneElement(program.icon, {
                      className: 'h-8 w-8 transition-transform duration-200 group-hover:scale-110'
                    })}
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 text-center">
                    {program.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 text-center">
                    {program.description}
                  </p>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                  <div className="text-center">
                    <span className={`inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium ${
                      isSelected 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800 group-hover:bg-blue-50 group-hover:text-blue-700'
                    }`}>
                      {isLoading ? (
                        <>
                          <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                          Processing...
                        </>
                      ) : isSelected ? (
                        'Selected'
                      ) : (
                        'Select Program'
                      )}
                    </span>
                  </div>
                </div>
                
                {isLoading && (
                  <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
                    <FaSpinner className="animate-spin h-8 w-8 text-blue-500" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {!token && (
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>You'll need to be signed in to continue. You'll be redirected to login after selecting a program.</p>
          </div>
        )}
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
      {/* Render nested university routes (e.g., /university/enrollment) */}
      <Outlet />
     
    </div>
  );
};

export default ProgramSelection;
