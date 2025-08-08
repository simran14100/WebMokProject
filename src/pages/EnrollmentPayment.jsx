// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-hot-toast';
// import { FaSpinner, FaCheckCircle, FaTimesCircle, FaLock } from 'react-icons/fa';
// import { buyEnrollment } from '../services/operations/enrollmentApi';

// const EnrollmentPayment = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { user } = useSelector((state) => state.profile);
//   const { token } = useSelector((state) => state.auth);

//   const [loading, setLoading] = useState(false);
//   const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, success, failed


// const ED_TEAL = "#07A698"; // brand teal
// const ED_TEAL_DARK = "#059a8c"; // darker hover teal

//   useEffect(() => {
//     if (!token) {
//       toast.error('Please login to access enrollment payment');
//       navigate('/login');
//       return;
//     }
//     if (user?.accountType !== 'Student') {
//       toast.error('Only students can access enrollment payment');
//       navigate('/dashboard');
//       return;
//     }
//     if (user?.enrollmentFeePaid) {
//       setPaymentStatus('alreadyPaid');
//       return;
//     }
//   }, [token, user, navigate]);

//   const handleEnrollmentPayment = async () => {
//     try {
//       setLoading(true);
//       await buyEnrollment(token, user, navigate, dispatch);
//       setPaymentStatus('success');
//     } catch (error) {
//       setPaymentStatus('failed');
//       console.log("ENROLLMENT PAYMENT ERROR............", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[#f9fafb] py-12 mt-9 px-4  ">
//       <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-10 flex flex-col gap-8 border border-[#e0e0e0]">
//         <div className="text-center">
//           <h1 className="text-4xl font-extrabold text-[#22223b] mb-2">Enrollment Payment</h1>
//           <p className="text-lg text-[#4a4e69]">Complete your enrollment to access all courses</p>
//         </div>

//         {/* Payment Status */}
//         <div className="flex flex-col items-center mb-4">
//           {paymentStatus === 'success' ? (
//             <FaCheckCircle className="text-[#22c55e] text-5xl mb-2" />
//           ) : paymentStatus === 'failed' ? (
//             <FaTimesCircle className="text-[#ef4444] text-5xl mb-2" />
//           ) : loading ? (
//             <FaSpinner className="text-[#ffd60a] text-5xl mb-2 animate-spin" />
//           ) : (
//             <FaLock className="text-[#009e5c] text-5xl mb-2" />
//           )}
//           <h2 className={`text-xl font-semibold ${paymentStatus === 'success' ? 'text-[#22c55e]' : paymentStatus === 'failed' ? 'text-[#ef4444]' : paymentStatus === 'pending' ? 'text-[#009e5c]' : 'text-[#ffd60a]'}`}>
//             {paymentStatus === 'success'
//               ? 'Payment Successful!'
//               : paymentStatus === 'failed'
//               ? 'Payment Failed'
//               : loading
//               ? 'Processing Payment...'
//               : 'Ready to Pay'}
//           </h2>
//         </div>

//         <hr className="border-[#e0e0e0] my-2" />

//         {/* Payment Details */}
//         <div className="bg-[#f5f5f5] rounded-lg p-6 flex flex-col gap-3 border border-[#e0e0e0]">
//           <div className="flex justify-between">
//             <span className="text-[#4a4e69]">Enrollment Fee:</span>
//             <span className="text-[#22223b] font-semibold">₹1,000</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-[#4a4e69]">Payment Method:</span>
//             <span className="text-[#22223b]">Razorpay</span>
//           </div>
//           <div className="flex justify-between">
//             <span className="text-[#4a4e69]">Currency:</span>
//             <span className="text-[#22223b]">INR</span>
//           </div>
//         </div>

//         {/* Benefits */}
//         <div className="bg-[#f5f5f5] rounded-lg p-6 flex flex-col gap-2 border border-[#e0e0e0]">
//           <h3 className="text-lg font-semibold text-[#22223b] mb-2">What you'll get:</h3>
//           <ul className="space-y-2 text-[#4a4e69]">
//             <li className="flex items-center"><span className="text-[#22c55e] mr-2">✓</span>Access to all courses</li>
//             <li className="flex items-center"><span className="text-[#22c55e] mr-2">✓</span>Course certificates</li>
//             <li className="flex items-center"><span className="text-[#22c55e] mr-2">✓</span>24/7 support</li>
//             <li className="flex items-center"><span className="text-[#22c55e] mr-2">✓</span>Lifetime access</li>
//           </ul>
//         </div>

//         {/* Payment Button */}
//         {paymentStatus === 'pending' && (
//           <button
//             onClick={handleEnrollmentPayment}
//             disabled={loading}
//             className="w-full py-4 rounded-lg text-lg font-bold bg-[#009e5c] hover:bg-[#007a44] text-white shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {loading ? <FaSpinner className="animate-spin h-6 w-6 mx-auto" /> : 'Pay ₹1,000 Enrollment Fee'}
//           </button>
//         )}

//         {paymentStatus === 'success' && (
//           <div className="text-center">
//             <p className="text-[#22c55e] font-medium mb-4">Redirecting to dashboard...</p>
//           </div>
//         )}

//         {paymentStatus === 'failed' && (
//           <button
//             onClick={handleEnrollmentPayment}
//             className="w-full py-4 rounded-lg text-lg font-bold bg-[#ef4444] hover:bg-red-400 text-white shadow-lg transition"
//           >
//             Try Again
//           </button>
//         )}

//         {paymentStatus === 'alreadyPaid' && (
//           <div style={{
//             textAlign: 'center',
//             padding: '16px',
//             backgroundColor: '#f0fdf4',
//             borderRadius: '12px',
//             border: `1px solid ${SUCCESS_GREEN}20`
//           }}>
//             <FaCheckCircle style={{
//               color: SUCCESS_GREEN,
//               fontSize: '36px',
//               margin: '0 auto 8px'
//             }} />
//             <p style={{
//               color: SUCCESS_GREEN,
//               fontWeight: '600'
//             }}>Enrollment fee already paid!</p>
//             <button
//               style={{
//                 marginTop: '16px',
//                 padding: '12px 24px',
//                 borderRadius: '8px',
//                 backgroundColor: ED_TEAL,
//                 color: 'white',
//                 border: 'none',
//                 fontWeight: '600',
//                 cursor: 'pointer'
//               }}
//               onClick={() => navigate('/dashboard')}
//             >
//               Go to Dashboard
//             </button>
//           </div>
//         )}

//         {/* Security Notice */}
//         <div className="mt-4 text-center">
//           <p className="text-xs text-[#4a4e69]">🔒 Your payment is secured by Razorpay</p>
//         </div>
//       </div>
//     </div>
    

//   );
// };

// export default EnrollmentPayment; 

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaLock } from 'react-icons/fa';
import { buyEnrollment } from '../services/operations/enrollmentApi';

// Color constants
const ED_TEAL = "#07A698";
const ED_TEAL_DARK = "#059a8c";
const BG_LIGHT = "#f8fafc";
const TEXT_DARK = "#1e293b";
const TEXT_LIGHT = "#64748b";
const BORDER_COLOR = "#e2e8f0";
const SUCCESS_GREEN = "#16a34a";
const ERROR_RED = "#dc2626";
const WARNING_YELLOW = "#f59e0b";

const EnrollmentPayment = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');

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
      setPaymentStatus('alreadyPaid');
      return;
    }
    setPaymentStatus('pending');
  }, [token, user, navigate]);

  const handleEnrollmentPayment = async () => {
    try {
      setLoading(true);
      setPaymentStatus('processing');
      await buyEnrollment(token, user, navigate, dispatch);
      setPaymentStatus('success');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error) {
      setPaymentStatus('failed');
      console.error("ENROLLMENT PAYMENT ERROR:", error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: BG_LIGHT,
      padding: '48px 16px',
      marginTop:'8rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '640px',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        gap: '32px',
        border: `1px solid ${BORDER_COLOR}`
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            color: TEXT_DARK,
            fontSize: '32px',
            fontWeight: '800',
            marginBottom: '8px'
          }}>Enrollment Payment</h1>
          <p style={{
            color: TEXT_LIGHT,
            fontSize: '18px',
            fontWeight: '500'
          }}>Complete your enrollment to access all courses</p>
        </div>

        {/* Status Indicator */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          {paymentStatus === 'success' ? (
            <FaCheckCircle style={{
              color: SUCCESS_GREEN,
              fontSize: '48px',
              marginBottom: '12px'
            }} />
          ) : paymentStatus === 'failed' ? (
            <FaTimesCircle style={{
              color: ERROR_RED,
              fontSize: '48px',
              marginBottom: '12px'
            }} />
          ) : loading ? (
            <FaSpinner style={{
              color: WARNING_YELLOW,
              fontSize: '48px',
              marginBottom: '12px',
              animation: 'spin 1s linear infinite'
            }} />
          ) : (
            <FaLock style={{
              color: ED_TEAL,
              fontSize: '48px',
              marginBottom: '12px'
            }} />
          )}
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: paymentStatus === 'success' ? SUCCESS_GREEN :
                  paymentStatus === 'failed' ? ERROR_RED :
                  paymentStatus === 'processing' ? WARNING_YELLOW : ED_TEAL
          }}>
            {paymentStatus === 'success' ? 'Payment Successful!' :
             paymentStatus === 'failed' ? 'Payment Failed' :
             loading ? 'Processing Payment...' : 'Ready to Pay'}
          </h2>
        </div>

        <div style={{
          height: '1px',
          backgroundColor: BORDER_COLOR,
          margin: '8px 0'
        }} />

        {/* Payment Details */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          border: `1px solid ${BORDER_COLOR}`
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span style={{ color: TEXT_LIGHT }}>Enrollment Fee:</span>
            <span style={{ color: TEXT_DARK, fontWeight: '600' }}>₹1,000</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span style={{ color: TEXT_LIGHT }}>Payment Method:</span>
            <span style={{ color: TEXT_DARK }}>Razorpay</span>
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span style={{ color: TEXT_LIGHT }}>Currency:</span>
            <span style={{ color: TEXT_DARK }}>INR</span>
          </div>
        </div>

        {/* Benefits */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          border: `1px solid ${BORDER_COLOR}`
        }}>
          <h3 style={{
            color: TEXT_DARK,
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '8px'
          }}>What you'll get:</h3>
          <ul style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            color: TEXT_LIGHT
          }}>
            <li style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: SUCCESS_GREEN, marginRight: '8px' }}>✓</span>
              Access to all courses
            </li>
            <li style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: SUCCESS_GREEN, marginRight: '8px' }}>✓</span>
              Course certificates
            </li>
            <li style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: SUCCESS_GREEN, marginRight: '8px' }}>✓</span>
              24/7 support
            </li>
            <li style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ color: SUCCESS_GREEN, marginRight: '8px' }}>✓</span>
              Lifetime access
            </li>
          </ul>
        </div>

        {/* Payment Action */}
        <div style={{ marginTop: '16px' }}>
          {paymentStatus === 'pending' && (
            <button
              onClick={handleEnrollmentPayment}
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '700',
                backgroundColor: loading ? WARNING_YELLOW : ED_TEAL,
                color: 'white',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
                opacity: loading ? 0.8 : 1,
                ':hover': {
                  backgroundColor: loading ? WARNING_YELLOW : ED_TEAL_DARK
                }
              }}
            >
              {loading ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                  Processing...
                </div>
              ) : (
                'Pay ₹1,000 Enrollment Fee'
              )}
            </button>
          )}

          {paymentStatus === 'success' && (
            <div style={{
              textAlign: 'center',
              padding: '16px',
              backgroundColor: '#f0fdf4',
              borderRadius: '12px',
              border: `1px solid ${SUCCESS_GREEN}20`
            }}>
              <FaCheckCircle style={{
                color: SUCCESS_GREEN,
                fontSize: '36px',
                margin: '0 auto 8px'
              }} />
              <p style={{
                color: SUCCESS_GREEN,
                fontWeight: '600'
              }}>Payment Successful! Redirecting...</p>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                textAlign: 'center',
                padding: '16px',
                backgroundColor: '#fef2f2',
                borderRadius: '12px',
                border: `1px solid ${ERROR_RED}20`
              }}>
                <FaTimesCircle style={{
                  color: ERROR_RED,
                  fontSize: '36px',
                  margin: '0 auto 8px'
                }} />
                <p style={{
                  color: ERROR_RED,
                  fontWeight: '600'
                }}>Payment Failed</p>
              </div>
              <button
                onClick={handleEnrollmentPayment}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '700',
                  backgroundColor: ERROR_RED,
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s ease',
                  ':hover': {
                    backgroundColor: '#b91c1c'
                  }
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {paymentStatus === 'alreadyPaid' && (
            <div style={{
              textAlign: 'center',
              padding: '16px',
              backgroundColor: '#f0fdf4',
              borderRadius: '12px',
              border: `1px solid ${SUCCESS_GREEN}20`
            }}>
              <FaCheckCircle style={{
                color: SUCCESS_GREEN,
                fontSize: '36px',
                margin: '0 auto 8px'
              }} />
              <p style={{
                color: SUCCESS_GREEN,
                fontWeight: '600'
              }}>Enrollment fee already paid!</p>
              <button
                style={{
                  marginTop: '16px',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  backgroundColor: ED_TEAL,
                  color: 'white',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>

        {/* Security Notice */}
        <div style={{ textAlign: 'center', marginTop: '8px' }}>
          <p style={{
            fontSize: '12px',
            color: TEXT_LIGHT,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}>
            <span>🔒</span> Your payment is secured by Razorpay
          </p>
        </div>
      </div>

      {/* Add global spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default EnrollmentPayment;