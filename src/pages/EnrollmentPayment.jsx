import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaLock } from 'react-icons/fa';
import { buyEnrollment } from '../services/operations/enrollmentApi';

const EnrollmentPayment = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success, failed

  useEffect(() => {
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

  const handleEnrollmentPayment = async () => {
    try {
      setLoading(true);
      await buyEnrollment(token, user, navigate, dispatch);
      setPaymentStatus('success');
    } catch (error) {
      setPaymentStatus('failed');
      console.log("ENROLLMENT PAYMENT ERROR............", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] py-12 px-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-10 flex flex-col gap-8 border border-[#e0e0e0]">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-[#22223b] mb-2">Enrollment Payment</h1>
          <p className="text-lg text-[#4a4e69]">Complete your enrollment to access all courses</p>
        </div>

        {/* Payment Status */}
        <div className="flex flex-col items-center mb-4">
          {paymentStatus === 'success' ? (
            <FaCheckCircle className="text-[#22c55e] text-5xl mb-2" />
          ) : paymentStatus === 'failed' ? (
            <FaTimesCircle className="text-[#ef4444] text-5xl mb-2" />
          ) : loading ? (
            <FaSpinner className="text-[#ffd60a] text-5xl mb-2 animate-spin" />
          ) : (
            <FaLock className="text-[#009e5c] text-5xl mb-2" />
          )}
          <h2 className={`text-xl font-semibold ${paymentStatus === 'success' ? 'text-[#22c55e]' : paymentStatus === 'failed' ? 'text-[#ef4444]' : paymentStatus === 'pending' ? 'text-[#009e5c]' : 'text-[#ffd60a]'}`}>
            {paymentStatus === 'success'
              ? 'Payment Successful!'
              : paymentStatus === 'failed'
              ? 'Payment Failed'
              : loading
              ? 'Processing Payment...'
              : 'Ready to Pay'}
          </h2>
        </div>

        <hr className="border-[#e0e0e0] my-2" />

        {/* Payment Details */}
        <div className="bg-[#f5f5f5] rounded-lg p-6 flex flex-col gap-3 border border-[#e0e0e0]">
          <div className="flex justify-between">
            <span className="text-[#4a4e69]">Enrollment Fee:</span>
            <span className="text-[#22223b] font-semibold">₹1,000</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#4a4e69]">Payment Method:</span>
            <span className="text-[#22223b]">Razorpay</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#4a4e69]">Currency:</span>
            <span className="text-[#22223b]">INR</span>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-[#f5f5f5] rounded-lg p-6 flex flex-col gap-2 border border-[#e0e0e0]">
          <h3 className="text-lg font-semibold text-[#22223b] mb-2">What you'll get:</h3>
          <ul className="space-y-2 text-[#4a4e69]">
            <li className="flex items-center"><span className="text-[#22c55e] mr-2">✓</span>Access to all courses</li>
            <li className="flex items-center"><span className="text-[#22c55e] mr-2">✓</span>Course certificates</li>
            <li className="flex items-center"><span className="text-[#22c55e] mr-2">✓</span>24/7 support</li>
            <li className="flex items-center"><span className="text-[#22c55e] mr-2">✓</span>Lifetime access</li>
          </ul>
        </div>

        {/* Payment Button */}
        {paymentStatus === 'pending' && (
          <button
            onClick={handleEnrollmentPayment}
            disabled={loading}
            className="w-full py-4 rounded-lg text-lg font-bold bg-[#009e5c] hover:bg-[#007a44] text-white shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <FaSpinner className="animate-spin h-6 w-6 mx-auto" /> : 'Pay ₹1,000 Enrollment Fee'}
          </button>
        )}

        {paymentStatus === 'success' && (
          <div className="text-center">
            <p className="text-[#22c55e] font-medium mb-4">Redirecting to dashboard...</p>
          </div>
        )}

        {paymentStatus === 'failed' && (
          <button
            onClick={handleEnrollmentPayment}
            className="w-full py-4 rounded-lg text-lg font-bold bg-[#ef4444] hover:bg-red-400 text-white shadow-lg transition"
          >
            Try Again
          </button>
        )}

        {/* Security Notice */}
        <div className="mt-4 text-center">
          <p className="text-xs text-[#4a4e69]">🔒 Your payment is secured by Razorpay</p>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentPayment; 