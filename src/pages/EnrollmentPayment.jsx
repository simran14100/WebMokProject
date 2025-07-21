import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaSpinner, FaCreditCard, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { buyEnrollment } from '../services/operations/enrollmentApi';



const EnrollmentPayment = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);

  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success, failed

  useEffect(() => {
    // Check if user is logged in and is a student
    if (!token) {
      toast.error('Please login to access enrollment payment');
      navigate('/login');
      return;
    }

    if (user?.accountType !== 'Student') {
      toast.error('Only students can access enrollment payment');
      navigate('/dashboard');
      return;
    }

    if (user?.enrollmentFeePaid) {
      toast.success('Enrollment fee already paid!');
      navigate('/dashboard');
      return;
    }
  }, [token, user, navigate]);

  // Handle enrollment payment
  const handleEnrollmentPayment = async () => {
    try {
      await buyEnrollment(token, user, navigate, dispatch);
    } catch (error) {
      console.log("ENROLLMENT PAYMENT ERROR............", error);
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'success':
        return <FaCheckCircle className="text-green-500 text-4xl" />;
      case 'failed':
        return <FaTimesCircle className="text-red-500 text-4xl" />;
      case 'processing':
        return <FaSpinner className="text-yellow-500 text-4xl animate-spin" />;
      default:
        return <FaCreditCard className="text-yellow-500 text-4xl" />;
    }
  };

  const getStatusText = () => {
    switch (paymentStatus) {
      case 'success':
        return 'Payment Successful!';
      case 'failed':
        return 'Payment Failed';
      case 'processing':
        return 'Processing Payment...';
      default:
        return 'Ready to Pay';
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus) {
      case 'success':
        return 'text-green-500';
      case 'failed':
        return 'text-red-500';
      case 'processing':
        return 'text-yellow-500';
      default:
        return 'text-yellow-500';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-richblack-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-richblack-25 mb-2">
            Enrollment Payment
          </h1>
          <p className="text-lg text-richblack-100">
            Complete your enrollment to access courses
          </p>
        </div>

        <div className="bg-richblack-800 rounded-lg shadow-xl p-8">
          {/* Payment Status */}
          <div className="text-center mb-6">
            {getStatusIcon()}
            <h2 className={`text-xl font-semibold mt-2 ${getStatusColor()}`}>
              {getStatusText()}
            </h2>
          </div>

          {/* Payment Details */}
          <div className="bg-richblack-700 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-richblack-25 mb-4">
              Payment Details
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-richblack-100">Enrollment Fee:</span>
                <span className="text-richblack-25 font-semibold">₹1,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-richblack-100">Payment Method:</span>
                <span className="text-richblack-25">Razorpay</span>
              </div>
              <div className="flex justify-between">
                <span className="text-richblack-100">Currency:</span>
                <span className="text-richblack-25">INR</span>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-richblack-700 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-richblack-25 mb-4">
              What you'll get:
            </h3>
            <ul className="space-y-2 text-richblack-100">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Access to all courses
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Course certificates
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                ️24/7 support
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Lifetime access
              </li>
            </ul>
          </div>

          {/* Payment Button */}
          {paymentStatus === 'pending' && (
            <button
              onClick={handleEnrollmentPayment}
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-richblack-900 bg-yellow-500 hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <FaSpinner className="animate-spin h-5 w-5" />
              ) : (
                'Pay ₹1,000 Enrollment Fee'
              )}
            </button>
          )}

          {paymentStatus === 'success' && (
            <div className="text-center">
              <p className="text-green-500 font-medium mb-4">
                Redirecting to dashboard...
              </p>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <button
              onClick={handleEnrollmentPayment}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-richblack-900 bg-red-500 hover:bg-red-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Try Again
            </button>
          )}

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-richblack-300">
              🔒 Your payment is secured by Razorpay
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentPayment; 