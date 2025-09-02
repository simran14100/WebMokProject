import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { apiConnector } from '../../services/apiConnector';
import { enrollment } from '../../services/apis';
import { toast } from 'react-hot-toast';
import { FaCheckCircle, FaClock, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';
import AdmissionEnquiryForm from '../../components/AdmissionEnquiryForm';

export default function EnrollmentStatus() {
    const [status, setStatus] = useState('loading');
    const [enrollmentData, setEnrollmentData] = useState(null);
    const [selectedProgram, setSelectedProgram] = useState('');
    const { token } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        // Get selected program from localStorage
        const savedProgram = localStorage.getItem('selectedProgram');
        if (savedProgram) {
            setSelectedProgram(savedProgram);
        }

        const checkEnrollment = async () => {
            try {
                const response = await apiConnector(
                    'GET',
                    enrollment.CHECK_ENROLLMENT,
                    null,
                    { Authorization: `Bearer ${token}` }
                );

                if (response.data.isEnrolled) {
                    navigate('/dashboard');
                    return;
                }

                setStatus(response.data.status || 'not_enrolled');
                setEnrollmentData(response.data.enrollment);
            } catch (error) {
                console.error('Error checking enrollment:', error);
                toast.error('Failed to check enrollment status');
                setStatus('error');
            }
        };

        if (token) {
            checkEnrollment();
        } else {
            navigate('/login');
        }
    }, [token, navigate]);

    const handleApplyNow = () => {
        navigate('/program-selection');
    };

    const renderStatusContent = () => {
        switch (status) {
            case 'approved':
                return (
                    <div className="text-center p-8 bg-green-50 rounded-lg">
                        <FaCheckCircle className="text-6xl text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Enrollment Approved!</h2>
                        <p className="mb-4">Your enrollment for {enrollmentData?.programType || 'the program'} has been approved.</p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                );

            case 'pending':
                return (
                    <div className="text-center p-8 bg-yellow-50 rounded-lg">
                        <FaClock className="text-6xl text-yellow-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Enrollment Pending</h2>
                        <p className="mb-4">
                            Your enrollment for {enrollmentData?.programType || 'the program'} is under review.
                            We'll notify you once it's processed.
                        </p>
                        <div className="mt-6 space-y-4">
                            <p className="text-sm text-gray-600">
                                <FaInfoCircle className="inline mr-2" />
                                You'll receive an email with further instructions once your enrollment is processed.
                            </p>
                        </div>
                    </div>
                );

            case 'rejected':
                return (
                    <div className="text-center p-8 bg-red-50 rounded-lg">
                        <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Enrollment Not Approved</h2>
                        {enrollmentData?.rejectionReason && (
                            <div className="mb-4 p-4 bg-red-100 rounded-md text-left">
                                <p className="font-semibold">Reason:</p>
                                <p>{enrollmentData.rejectionReason}</p>
                            </div>
                        )}
                        <p className="mb-4">
                            Your enrollment for {enrollmentData?.programType || 'the program'} was not approved.
                        </p>
                        <button
                            onClick={() => navigate('/contact')}
                            className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 mr-4"
                        >
                            Contact Support
                        </button>
                        <button
                            onClick={handleApplyNow}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                        >
                            Apply Again
                        </button>
                    </div>
                );

            case 'not_enrolled':
                // Show the detailed admission form if we have a selected program
                if (selectedProgram) {
                    return <AdmissionEnquiryForm />;
                }
                
                // Otherwise show the enrollment prompt
                return (
                    <div className="text-center p-8 bg-blue-50 rounded-lg">
                        <FaInfoCircle className="text-6xl text-blue-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">No Active Enrollment</h2>
                        <p className="mb-6">
                            You have not enrolled in any program yet.
                        </p>
                        <button
                            onClick={handleApplyNow}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                        >
                            Enroll Now
                        </button>
                    </div>
                );

            case 'error':
                return (
                    <div className="text-center p-8 bg-red-50 rounded-lg">
                        <FaTimesCircle className="text-6xl text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold mb-2">Error</h2>
                        <p className="mb-4">There was an error loading your enrollment status.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                        >
                            Try Again
                        </button>
                    </div>
                );

            default:
                return (
                    <div className="text-center p-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p>Loading your enrollment status...</p>
                    </div>
                );
        }
            case 'pending':
                return (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    Your enrollment application is under review. Please check back later for updates.
                                    {enrollmentData?.rejectionReason && (
                                        <span className="block mt-2 font-medium">
                                            Note: {enrollmentData.rejectionReason}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            
            case 'rejected':
                return (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Application Not Accepted
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>
                                        We're sorry, but your application was not accepted.
                                        {enrollmentData?.rejectionReason && (
                                            <span className="block mt-1">
                                                Reason: {enrollmentData.rejectionReason}
                                            </span>
                                        )}
                                    </p>
                                    <p className="mt-2">
                                        Please contact the admission office for more information.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'not_enrolled':
            default:
                return (
                    <div className="text-center">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No enrollment found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            You are not enrolled in any program yet.
                        </p>
                        <div className="mt-6">
                            <button
                                type="button"
                                onClick={handleApplyNow}
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Apply for Admission
                            </button>
                        </div>
                    </div>
                );
        }
    };

    if (status === 'loading') {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Enrollment Status
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        Current status of your program enrollment
                    </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <div className="py-4 sm:py-5 sm:px-6">
                        {renderStatusContent()}
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Need Help?
                    </h3>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    <p className="text-sm text-gray-500">
                        If you have any questions about your enrollment status, please contact our admission office:
                    </p>
                    <div className="mt-4">
                        <p className="text-sm text-gray-500">
                            Email: <a href="mailto:admissions@webmok.edu" className="text-indigo-600 hover:text-indigo-500">admissions@webmok.edu</a>
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            Phone: +1 (555) 123-4567
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            Office Hours: Monday - Friday, 9:00 AM - 5:00 PM
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
