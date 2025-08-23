// import { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { showSuccess, showError, showLoading, dismissToast } from '../utils/toast';
// import {apiConnector} from '../services/apiConnector';
// import { buyCourse } from '../services/operations/coursePaymentApi';
// import{
//   fetchCartDetails, 
//   removeFromCart, 
//   updateCartItem ,
//   clearCart
// } from "../services/operations/cartApi";
// import pageHeaderBg from '../assets/img/bg-img/page-header-bg.png';
// import { useSelector } from 'react-redux';
// import { FaArrowUpLong } from 'react-icons/fa6';
// import { useParams } from 'react-router-dom';
// import navigate from 'react-router-dom';
// import { fetchCourseDetails, getFullDetailsOfCourse } from '../services/operations/courseDetailsAPI';

// const CheckoutPage = () => {

//    const { courseId } = useParams();
//   const navigate = useNavigate();
//   const { token } = useSelector((state) => state.auth);
//   const { user } = useSelector((state) => state.profile);
//   const [course, setCourse] = useState(null);
//     const [courseData, setCourseData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState('info');
//   const [paymentVerificationFailed, setPaymentVerificationFailed] = useState(false);
//   const [enrollmentStatus, setEnrollmentStatus] = useState(false);
//   const [cartData, setCartData] = useState({
//     items: [],
//     total: 0,
//     shipping: 50, // Default shipping cost
//     discount: 0,
//     grandTotal: 0
//   });
//   const [formData, setFormData] = useState({
//     email: '',
//     firstName: '',
//     lastName: '',
//     company: '',
//     country: 'United States (US)',
//     street: '',
//     street2: '',
//     town: '',
//     state: 'California',
//     zip: '',
//     phone: '',
//     notes: ''
//   });
//   const [paymentMethod, setPaymentMethod] = useState('');
//   const [agreeTerms, setAgreeTerms] = useState(false);
//   const [processingPayment, setProcessingPayment] = useState(false);
//   const [error, setError] = useState(null);

//  const ED_TEAL = '#07A698';
// const ED_TEAL_DARK = '#059a8c';
 

//   useEffect(() => {
//     const fetchCourse = async () => {
//       if (!courseId) return;
      
//       try {
//         setLoading(true);
//         let result;
        
//         if (token) {
//           try {
//             result = await getFullDetailsOfCourse(courseId, token);
//           } catch (error) {
//             result = await fetchCourseDetails(courseId);
//           }
//         } else {
//           result = await fetchCourseDetails(courseId);
//         }
        
//         if (result?.courseDetails) {
//           setCourse(result);
//         } else if (result?.success) {
//           setCourse(result.data);
//         } else {
//           throw new Error(result?.message || 'Failed to fetch course details');
//         }
//       } catch (error) {
//         console.error('Error fetching course:', error);
//         showError(error.message || 'Failed to load course details');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCourse();
//   }, [courseId, token]);

//   // Fetch cart data
//   const fetchCartData = async () => {
//     try {
//       setLoading(true);
//       const response = await fetchCartDetails(token);

//       if (!response?.success) {
//         throw new Error(response?.message || "Failed to load cart data");
//       }

//       setCartData(prev => ({
//         ...prev,
//         items: response.cartData?.items || [],
//         total: response.cartData?.total || 0,
//         grandTotal: (response.cartData?.total || 0) + prev.shipping - prev.discount
//       }));

//     } catch (error) {
//       console.error("Error in fetchCartData:", error);
//       setError(error.message || "Network error while loading cart data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (token) {
//       fetchCartData();
//     } else {
//       navigate('/login');
//     }
//   }, [token, navigate]);

//   const courseDetails = course?.courseDetails || {};
//   const isUserEnrolled = enrollmentStatus || 
//     courseDetails.studentsEnrolled?.some(student => student._id === user?._id) || 
//     user?.courses?.includes(courseId) || 
//     false;

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handlePaymentMethodChange = (method) => {
//     setPaymentMethod(method);
//   };

//   const handleTermsChange = (e) => {
//     setAgreeTerms(e.target.checked);
//   };

//   const handleRemoveFromCart = async (courseId) => {
//     try {
//       await removeFromCart({ courseId }, token);
//       await fetchCartData(); // Refresh cart data
//       showSuccess("Item removed from cart");
//     } catch (error) {
//       showError(error.message || "Failed to remove item from cart");
//     }
//   };

//  const handleBuyCourse = async () => {
//   if (!token) {
//     showError('Please login to purchase');
//     navigate('/login');
//     return;
//   }

//   if (user?.accountType !== 'Student') {
//     showError('Only students can purchase courses');
//     return;
//   }

//   if (!user?.enrollmentFeePaid) {
//     showError('Please complete enrollment fee payment');
//     navigate('/enrollment-payment');
//     return;
//   }

//   if (!agreeTerms) {
//     showError('You must agree to the terms');
//     return;
//   }

//   setProcessingPayment(true);
//   const toastId = showLoading('Processing payment...');

  

//   try {


//      // 1. Get Razorpay key first
//     const keyResponse = await apiConnector(
//       "GET",
//       "/api/v1/payment/getRazorpayKey"
//     );

//     if (!keyResponse.data.success) {
//       throw new Error("Failed to get payment gateway");
//     }

//     const razorpayKey = keyResponse.data.key;

//     console.log("Razorpay Key:", razorpayKey);
//     let courseIds = [];
//     let courseNames = [];
//    let totalAmount = cartData.grandTotal; 

//     if (cartData.items.length > 0) {
//       courseIds = cartData.items.map(item => item.course?._id || item._id);
//       courseNames = cartData.items.map(item => item.course?.courseName || item.courseName);
//     } else if (courseId && courseDetails) {
//       courseIds = [courseId];
//       courseNames = [courseDetails.courseName];
//       totalAmount = courseDetails.price;
//     }
//     // Step 1: Initiate payment
//     const paymentResponse = await apiConnector(
//       "POST",
//       "/api/v1/payment/capturePayment",
//       { courses: courseIds ,
//         amount: totalAmount // Send calculated total amount

//       },
//       {
//         Authorization: `Bearer ${token}`
//       }
//     );

//     if (!paymentResponse.data.success) {
//       throw new Error(paymentResponse.data.message);
//     }

//   // 4. Open Razorpay with proper key
//     const options = {
//       key: razorpayKey, // Use the key from backend
//       amount: paymentResponse.data.amount,
//       currency: "INR",
//       order_id: paymentResponse.data.orderId,
//       name: "Course Purchase",
//       description: `Purchasing ${courseNames.join(', ')}`,
//       prefill: {
//         name: `${user.firstName} ${user.lastName}`,
//         email: user.email
//       },
//       handler: async function(response) {
//         console.log("Razorpay success handler response:", response)
//         const verifyToast = showLoading("Verifying payment...")
//         try {
//           const payload = { ...response, courses: courseIds }
//           console.log("Sending verify payload:", payload)
//           const verifyRes = await apiConnector(
//             "POST",
//             "/api/v1/payment/verifyPayment",
//             payload,
//             { Authorization: `Bearer ${token}` }
//           )
//           console.log("Verify response:", verifyRes)
//           if (!verifyRes?.data?.success) {
//             throw new Error(verifyRes?.data?.message || "Payment verification failed")
//           }
//           showSuccess("Payment successful. You are enrolled!")
//           // Clear cart (server-side) if applicable
//           try { await clearCart(token) } catch (e) { console.warn("clearCart failed", e) }
//           setEnrollmentStatus(true)
//           navigate("/dashboard/enrolled-courses")
//         } catch (err) {
//           console.error("Payment verification error:", err)
//           setPaymentVerificationFailed(true)
//           const backendMsg = err?.response?.data?.message || err?.message || "Payment verification failed"
//           showError(backendMsg)
//         } finally {
//           dismissToast(verifyToast)
//         }
//       },
//       theme: {
//         color: "#07A698"
//       }
//     };

//     const rzp = new window.Razorpay(options);
//     rzp.on("payment.failed", function (resp) {
//       console.error("Razorpay payment.failed:", resp)
//       showError(resp?.error?.description || "Payment failed. Please try again.")
//     })
//     rzp.open();

//   } catch (error) {
//     console.error('Payment error:', error);
//     showError(error.message || 'Payment failed');
//   } finally {
//     setProcessingPayment(false);
//     dismissToast(toastId);
//   }
// };

//   if (error) {
//     return (
//       <div className="error-container">
//         <h3>Error loading cart</h3>
//         <p>{error}</p>
//         <button 
//           onClick={() => {
//             setError(null);
//             fetchCartData();
//           }}
//           className="retry-button"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }

//   if (loading) {
//     return <div className="loading-container">Loading your cart...</div>;
//   }
//   return (
//     <>

//        <section style={{ 
//       position: 'relative', 
//       padding: '160px 0 110px', 
//       overflow: 'hidden',
//       backgroundImage: `url(${pageHeaderBg})`,
//       backgroundSize: 'cover',
//       backgroundPosition: 'center',
//       backgroundRepeat: 'no-repeat',
//       marginTop: '8rem'
//     }}>
//       {/* Background Overlay */}
//       <div style={{ 
//         position: 'absolute', 
//         inset: 0, 
//         backgroundColor: 'rgba(255, 255, 255, 0.5)',
//         backdropFilter: 'blur(1px)'
//       }}></div>
      
//       {/* Decorative Elements */}
//       <div style={{ position: 'absolute', inset: 0 }}>
//         {/* Orange Triangle */}
//         <div style={{ 
//           position: 'absolute', 
//           top: '50px', 
//           left: '80px',
//           width: '0',
//           height: '0',
//           borderLeft: '20px solid transparent',
//           borderRight: '20px solid transparent',
//           borderBottom: '35px solid #f59e0b',
//           transform: 'rotate(35deg)',
//           opacity: 0.9,
//           zIndex: 3
//         }}></div>
        
//         {/* Dashed Circle */}
//         <div style={{ 
//           position: 'absolute', 
//           top: '20px', 
//           left: '20px',
//           width: '100px',
//           height: '100px',
//           border: '2px dashed #9ca3af',
//           borderRadius: '50%',
//           opacity: 0.6,
//           zIndex: 10
//         }}></div>
        
//         {/* Green Circles Pattern on Right */}
//         <div style={{ 
//           position: 'absolute', 
//           top: '30px', 
//           right: '150px',
//           width: '60px',
//           height: '60px',
//           background: `linear-gradient(135deg, ${ED_TEAL}, ${ED_TEAL_DARK})`,
//           borderRadius: '50%',
//           opacity: 0.8,
//           zIndex: 3
//         }}></div>
        
//         <div style={{ 
//           position: 'absolute', 
//           top: '100px', 
//           right: '80px',
//           width: '90px',
//           height: '90px',
//           background: `linear-gradient(135deg, ${ED_TEAL}, ${ED_TEAL_DARK})`,
//           borderRadius: '50%',
//           opacity: 0.5,
//           zIndex: 2
//         }}></div>
        
//         <div style={{ 
//           position: 'absolute', 
//           bottom: '20px', 
//           right: '200px',
//           width: '40px',
//           height: '40px',
//           background: ED_TEAL,
//           borderRadius: '50%',
//           opacity: 0.7,
//           zIndex: 3
//         }}></div>
        
//         {/* Diagonal Stripes Pattern on Far Right */}
//         <div style={{ 
//           position: 'absolute', 
//           top: '0', 
//           right: '0',
//           width: '150px',
//           height: '100%',
//           background: `repeating-linear-gradient(
//             45deg,
//             transparent,
//             transparent 6px,
//             ${ED_TEAL} 6px,
//             ${ED_TEAL} 9px
//           )`,
//           opacity: 0.15,
//           zIndex: 1
//         }}></div>
//       </div>
      
//       {/* Content Container */}
//       <div style={{ 
//         position: 'relative', 
//         maxWidth: '1280px', 
//         margin: '0 auto', 
//         padding: '0 16px',
//         zIndex: 2
//       }}>
//         <div style={{ 
//           display: 'flex',
//           flexDirection: 'column',
//           justifyContent: 'center',
//           minHeight: '120px',
//           gap: '12px'
//         }}>
//           {/* Main Title */}
//           <h1 style={{ 
//             fontSize: '48px', 
//             fontWeight: '800', 
//             color: '#1f2937', 
//             margin: 0,
//             display: 'flex',
//             alignItems: 'center',
//             gap: '16px'
//           }}>
//             Checkout
//             <span style={{ 
//               display: 'inline-block',
//               width: '12px',
//               height: '12px',
//               backgroundColor: ED_TEAL,
//               borderRadius: '50%',
//               marginLeft: '8px'
//             }}></span>
//           </h1>
          
//           {/* Breadcrumb Navigation */}
//           <div style={{ 
//             display: 'flex', 
//             alignItems: 'center', 
//             gap: '8px', 
//             color: '#6b7280',
//             fontSize: '16px',
//             fontWeight: '500'
//           }}>
//             <span style={{ 
//               color: '#6b7280', 
//               textDecoration: 'none',
//               transition: 'color 0.3s',
//               cursor: 'pointer'
//             }}>
//               Home
//             </span>
//             <span style={{
//               color: ED_TEAL,
//               fontWeight: '600'
//             }}>/</span>
//             <span style={{ 
//               color: ED_TEAL,
//               fontWeight: '600'
//             }}>
//               Checkout
//             </span>
//           </div>
//         </div>
//       </div>
      
//       {/* Bottom subtle border */}
//       <div style={{
//         position: 'absolute',
//         bottom: '0',
//         left: '0',
//         right: '0',
//         height: '1px',
//         background: 'linear-gradient(to right, transparent, #e5e7eb, transparent)'
//       }}></div>
//     </section>
//         <section className="checkout-section pt-10 pb-100 " style={{ padding: '10px 0' }}>
//       <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 15px' }}>
//         <div className="checkout-top" style={{ marginBottom: '30px' , marginTop: '3rem'}}>
//            <div className="coupon-list">
//              <div className="verify-item mb-30" style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
//                 <h4 className="title" style={{ fontSize: '16px', marginBottom: 0 }}>Returning customers?<button type="button" className="rr-checkout-login-form-reveal-btn" style={{ background: 'none', border: 'none', color: '#14b8a6', cursor: 'pointer', padding: 0, marginLeft: '5px' }}>Click here</button> to login</h4>
//                 <div id="rrReturnCustomerLoginForm" className="login-form" style={{ marginTop: '15px', display: 'none' }}><form>
//                     <input type="text" id="fullname" name="fullname" className="form-control" style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} placeholder="Your Name" />
//                      <input type="text" id="password" name="password" className="form-control" style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} placeholder="Password" />
//                    </form>
//                    <div className="checkbox-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
//                     <div className="checkbox-item" style={{ display: 'flex', alignItems: 'center' }}>
//                      <input type="checkbox" id="vehicle3" name="vehicle3" value="Boat" style={{ marginRight: '8px' }} />
//                      <label htmlFor="vehicle3">Remember Me</label>
//                     </div>
//                     <Link to="#" className="forgot" style={{ color: '#14b8a6', textDecoration: 'none' }}>Forgot Password?</Link>
//                   </div>
//                   <button className="ed-primary-btn" style={{ background: '#14b8a6', color: '#fff', padding: '10px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Login</button>
//                 </div>
// </div>
//               <div className="verify-item" style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
//                 <h4 className="title" style={{ fontSize: '16px', marginBottom: 0 }}>Have a coupon?<button type="button" className="rr-checkout-coupon-form-reveal-btn" style={{ background: 'none', border: 'none', color: '#14b8a6', cursor: 'pointer', padding: 0, marginLeft: '5px' }}>Click here</button> to enter your code</h4>
//                 <div id="rrCheckoutCouponForm" className="login-form" style={{ marginTop: '15px', display: 'none' }}>
//                   <form>
//                     <input type="text" id="code" name="code" className="form-control" style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} placeholder="Coupon Code" />
//                   </form>
//                   <button className="ed-primary-btn" style={{ background: '#14b8a6', color: '#fff', padding: '10px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Apply</button>
//                 </div>
//               </div>
//             </div>
//           </div>

        
//         <div className="row" style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -15px' }}>
//           {/* Billing Details Form (left column) */}
//           <div className="col-lg-6 col-md-12" style={{ padding: '0 15px', flex: '0 0 50%', maxWidth: '50%' }}>
//             <div className="checkout-left">
//               <h3 className="form-header" style={{ fontSize: '24px', marginBottom: '30px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>Billing Details</h3>
//               <form >
//                 <div className="checkout-form-wrap">
//                   {/* Email */}
//                   <div className="form-group row" style={{ margin: '0 -15px' }}>
//                     <div className="col-md-12" style={{ padding: '0 15px' }}>
//                       <div className="form-item">
//                         <h4 className="form-title" style={{ fontSize: '16px', marginBottom: '10px' }}>Email Address*</h4>
//                         <input 
//                           type="email" 
//                           id="email" 
//                           name="email" 
//                           className="form-control" 
//                           style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} 
//                           value={formData.email}
//                           onChange={handleInputChange}
//                           required
//                         />
//                       </div>
//                     </div>
//                   </div>
                  
//                   {/* First and Last Name */}
//                   <div className="form-group row" style={{ margin: '0 -15px' }}>
//                     <div className="col-md-6" style={{ padding: '0 15px' }}>
//                       <div className="form-item name">
//                         <h4 className="form-title" style={{ fontSize: '16px', marginBottom: '10px' }}>First Name*</h4>
//                         <input 
//                           type="text" 
//                           id="firstName" 
//                           name="firstName" 
//                           className="form-control" 
//                           style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} 
//                           value={formData.firstName}
//                           onChange={handleInputChange}
//                           required
//                         />
//                       </div>
//                     </div>
//                     <div className="col-md-6" style={{ padding: '0 15px' }}>
//                       <div className="form-item">
//                         <h4 className="form-title" style={{ fontSize: '16px', marginBottom: '10px' }}>Last Name*</h4>
//                         <input 
//                           type="text" 
//                           id="lastName" 
//                           name="lastName" 
//                           className="form-control" 
//                           style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} 
//                           value={formData.lastName}
//                           onChange={handleInputChange}
//                           required
//                         />
//                       </div>
//                     </div>
//                   </div>
                  
//                   {/* Company (optional) */}
//                   <div className="form-group row" style={{ margin: '0 -15px' }}>
//                     <div className="col-md-12" style={{ padding: '0 15px' }}>
//                       <div className="form-item">
//                         <h4 className="form-title" style={{ fontSize: '16px', marginBottom: '10px' }}>Company Name (Optional)</h4>
//                         <input 
//                           type="text" 
//                           id="company" 
//                           name="company" 
//                           className="form-control" 
//                           style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} 
//                           value={formData.company}
//                           onChange={handleInputChange}
//                         />
//                       </div>
//                     </div>
//                   </div>
                  
//                   {/* Country */}
//                   <div className="form-group row" style={{ margin: '0 -15px' }}>
//                     <div className="col-md-12" style={{ padding: '0 15px' }}>
//                       <div className="form-item">
//                         <h4 className="form-title" style={{ fontSize: '16px', marginBottom: '10px' }}>Country / Region*</h4>
//                         <input 
//                           type="text" 
//                           id="country" 
//                           name="country" 
//                           className="form-control" 
//                           style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} 
//                           placeholder="United States (US)" 
//                           value={formData.country}
//                           onChange={handleInputChange}
//                           required
//                         />
//                       </div>
//                     </div>
//                   </div>
                  
//                   {/* Street Address */}
//                   <div className="form-group row" style={{ margin: '0 -15px' }}>
//                     <div className="col-md-12" style={{ padding: '0 15px' }}>
//                       <div className="form-item">
//                         <h4 className="form-title" style={{ fontSize: '16px', marginBottom: '10px' }}>Street Address*</h4>
//                         <input 
//                           type="text" 
//                           id="street" 
//                           name="street" 
//                           className="form-control street-control" 
//                           style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} 
//                           placeholder="House number and street number" 
//                           value={formData.street}
//                           onChange={handleInputChange}
//                           required
//                         />
//                         <input 
//                           type="text" 
//                           id="street2" 
//                           name="street2" 
//                           className="form-control street-control-2" 
//                           style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} 
//                           placeholder="Apartment, suite, unit, etc. (optional)" 
//                           value={formData.street2}
//                           onChange={handleInputChange}
//                         />
//                       </div>
//                     </div>
//                   </div>
                  
//                   {/* Town/City */}
//                   <div className="form-group row" style={{ margin: '0 -15px' }}>
//                     <div className="col-md-12" style={{ padding: '0 15px' }}>
//                       <div className="form-item">
//                         <h4 className="form-title" style={{ fontSize: '16px', marginBottom: '10px' }}>Town / City*</h4>
//                         <input 
//                           type="text" 
//                           id="town" 
//                           name="town" 
//                           className="form-control" 
//                           style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} 
//                           value={formData.town}
//                           onChange={handleInputChange}
//                           required
//                         />
//                       </div>
//                     </div>
//                   </div>
                  
//                   {/* State */}
//                   <div className="form-group row" style={{ margin: '0 -15px' }}>
//                     <div className="col-md-12" style={{ padding: '0 15px' }}>
//                       <div className="form-item">
//                         <h4 className="form-title" style={{ fontSize: '16px', marginBottom: '10px' }}>State*</h4>
//                         <select 
//                           className="form-control" 
//                           style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }}
//                           name="state"
//                           value={formData.state}
//                           onChange={handleInputChange}
//                           required
//                         >
//                           <option value="California">California</option>
//                           <option value="New York">New York</option>
//                           <option value="Texas">Texas</option>
//                           <option value="Florida">Florida</option>
//                         </select>
//                       </div>
//                     </div>
//                   </div>
                  
//                   {/* Zip Code */}
//                   <div className="form-group row" style={{ margin: '0 -15px' }}>
//                     <div className="col-md-12" style={{ padding: '0 15px' }}>
//                       <div className="form-item">
//                         <h4 className="form-title" style={{ fontSize: '16px', marginBottom: '10px' }}>Zip Code*</h4>
//                         <input 
//                           type="text" 
//                           id="zip" 
//                           name="zip" 
//                           className="form-control" 
//                           style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} 
//                           value={formData.zip}
//                           onChange={handleInputChange}
//                           required
//                         />
//                       </div>
//                     </div>
//                   </div>
                  
//                   {/* Phone */}
//                   <div className="form-group row" style={{ margin: '0 -15px' }}>
//                     <div className="col-md-12" style={{ padding: '0 15px' }}>
//                       <div className="form-item">
//                         <h4 className="form-title" style={{ fontSize: '16px', marginBottom: '10px' }}>Phone*</h4>
//                         <input 
//                           type="text" 
//                           id="phone" 
//                           name="phone" 
//                           className="form-control" 
//                           style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} 
//                           value={formData.phone}
//                           onChange={handleInputChange}
//                           required
//                         />
//                       </div>
//                     </div>
//                   </div>
                  
//                   {/* Order Notes */}
//                   <div className="form-group row" style={{ margin: '0 -15px' }}>
//                     <div className="col-md-12" style={{ padding: '0 15px' }}>
//                       <div className="form-item">
//                         <h4 className="form-title" style={{ fontSize: '16px', marginBottom: '10px' }}>Order Notes</h4>
//                         <textarea 
//                           id="notes" 
//                           name="notes" 
//                           cols="30" 
//                           rows="5" 
//                           className="form-control address" 
//                           style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }}
//                           value={formData.notes}
//                           onChange={handleInputChange}
//                         ></textarea>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </form>
//             </div>
//           </div>
          
//           {/* Order Summary (right column) */}
//           <div className="col-lg-6 col-md-12" style={{ padding: '0 15px', flex: '0 0 50%', maxWidth: '50%' }}>
//             <div className="checkout-right">
//               <h3 className="form-header" style={{ fontSize: '24px', marginBottom: '30px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>Your Order</h3>
//               <div className="order-box" style={{ background: '#f8f9fa', padding: '30px', borderRadius: '8px' }}>
//                 <div className="order-items" style={{ marginBottom: '30px' }}>
//                   {/* Order Items Header */}
//                   <div className="order-item item-1" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #ccc', fontWeight: 600 }}>
//                     <div className="order-left" style={{ display: 'flex', alignItems: 'center' }}>
//                       <span className="product">Product</span>
//                     </div>
//                     <div className="order-right" style={{ display: 'flex', alignItems: 'center' }}>
//                       <span className="price">Price</span>
//                     </div>
//                   </div>
                  
//                   {/* Order Items List */}
//                   {cartData.items.length === 0 ? (
//                     <div style={{ padding: '20px', textAlign: 'center' }}>
//                       Your cart is empty
//                     </div>
//                   ) : (
//                     cartData.items.map((item) => (
//                       <div className="order-item" key={item.course._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #eee' }}>
//                         <div className="order-left" style={{ display: 'flex', alignItems: 'center' }}>
//                           <div className="order-img" style={{ width: '60px', height: '60px', marginRight: '15px' }}>
//                             <img 
//                               src={item.course.thumbnail || "/assets/img/shop/shop-1.png"} 
//                               alt={item.course.courseName} 
//                               style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} 
//                             />
//                           </div>
//                           <div className="content">
//                             <h4 className="title" style={{ fontSize: '16px', margin: 0 }}>
//                               {item.course.courseName}
//                             </h4>
//                             <span className="quantity" style={{ fontSize: '14px', color: '#666' }}>
//                               Qty: {item.quantity}
//                             </span>
//                           </div>
//                         </div>
//                         <div className="order-right" style={{ display: 'flex', alignItems: 'center' }}>
//                           <span className="price" style={{ fontWeight: 600 }}>
//                             ₹{(item.course.price * item.quantity).toFixed(2)}
//                           </span>
//                         </div>
//                       </div>
//                     ))
//                   )}
                  
//                   {/* Order Summary */}
//                   {/* <div className="order-item item-1" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #eee', fontWeight: 600 }}>
//                     <div className="order-left" style={{ display: 'flex', alignItems: 'center' }}>
//                       <span className="left-title">Subtotal</span>
//                     </div>
//                     <div className="order-right" style={{ display: 'flex', alignItems: 'center' }}>
//                       <span className="right-title">₹{cartData.total.toFixed(2)}</span>
//                     </div>
//                   </div> */}
                  
//                   {/* <div className="order-item item-1" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #eee', fontWeight: 600 }}>
//                     <div className="order-left" style={{ display: 'flex', alignItems: 'center' }}>
//                       <span className="left-title">Shipping</span>
//                     </div>
//                     <div className="order-right" style={{ display: 'flex', alignItems: 'center' }}>
//                       <span className="right-title">
//                         <span>Flat rate:</span> ₹{cartData.shipping.toFixed(2)}
//                       </span>
//                     </div>
//                   </div> */}
                  
//                   {cartData.discount > 0 && (
//                     <div className="order-item item-1" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #eee', fontWeight: 600 }}>
//                       <div className="order-left" style={{ display: 'flex', alignItems: 'center' }}>
//                         <span className="left-title">Discount</span>
//                       </div>
//                       <div className="order-right" style={{ display: 'flex', alignItems: 'center' }}>
//                         <span className="right-title" style={{ color: '#14b8a6' }}>
//                           -₹{cartData.discount.toFixed(2)}
//                         </span>
//                       </div>
//                     </div>
//                   )}
                  
//                   <div className="order-item item-1" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #eee', fontWeight: 600 }}>
//                     <div className="order-left" style={{ display: 'flex', alignItems: 'center' }}>
//                       <span className="left-title">Total Price:</span>
//                     </div>
//                     <div className="order-right" style={{ display: 'flex', alignItems: 'center' }}>
//                       <span className="right-title title-2" style={{ color: '#14b8a6', fontSize: '18px' }}>
//                         {/* ₹{cartData.grandTotal.toFixed(2)} */}₹{cartData.total.toFixed(2)}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
                
//                  {/* Payment Options */}
//                 <div className="payment-option-wrap">
                  
                  
//                   <p className="desc" style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
//                     Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our <span style={{ color: '#14b8a6' }}>privacy policy.</span>
//                   </p>
                  
//                   <div className="form-check" style={{ marginBottom: '20px' }}>
//                     <input 
//                       className="form-check-input" 
//                       type="checkbox" 
//                       id="termsCheckbox" 
//                       style={{ marginRight: '10px' }} 
//                       checked={agreeTerms}
//                       onChange={handleTermsChange}
//                     />
//                     <label className="form-check-label" htmlFor="termsCheckbox">
//                       I have read and agree to the terms and conditions *
//                     </label>
//                   </div>
                  
//                   <button 
//                   onClick={handleBuyCourse}
//                     className="ed-primary-btn order-btn" 
//                     style={{ 
//                       background: '#14b8a6', 
//                       color: '#fff', 
//                       padding: '15px', 
//                       borderRadius: '4px', 
//                       border: 'none', 
//                       cursor: 'pointer', 
//                       fontWeight: 600, 
//                       width: '100%', 
//                       textAlign: 'center', 
//                       fontSize: '16px',
//                       opacity: cartData.items.length === 0 ? 0.5 : 1,
//                       pointerEvents: cartData.items.length === 0 ? 'none' : 'auto'
//                     }}
                    
//                     disabled={cartData.items.length === 0}
//                   >
//                     Make Payment
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//     </>
    
//   );
// };

// export default CheckoutPage;

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { showSuccess, showError, showLoading, dismissToast } from '../utils/toast';
import {apiConnector} from '../services/apiConnector';
import { buyCourse } from '../services/operations/coursePaymentApi';
import{
  fetchCartDetails, 
  removeFromCart, 
  updateCartItem ,
  clearCart
} from "../services/operations/cartApi";
import pageHeaderBg from '../assets/img/bg-img/page-header-bg.png';
import { useSelector } from 'react-redux';
import { FaArrowUpLong } from 'react-icons/fa6';
import { useParams } from 'react-router-dom';
import navigate from 'react-router-dom';
import { fetchCourseDetails, getFullDetailsOfCourse } from '../services/operations/courseDetailsAPI';

const CheckoutPage = () => {
  // ... (all your existing code remains exactly the same)

     const { courseId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const [course, setCourse] = useState(null);
    const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [paymentVerificationFailed, setPaymentVerificationFailed] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState(false);
  const [cartData, setCartData] = useState({
    items: [],
    total: 0,
    shipping: 50, // Default shipping cost
    discount: 0,
    grandTotal: 0
  });
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    company: '',
    country: 'United States (US)',
    street: '',
    street2: '',
    town: '',
    state: 'California',
    zip: '',
    phone: '',
    notes: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState(null);

 const ED_TEAL = '#07A698';
const ED_TEAL_DARK = '#059a8c';
 

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      
      try {
        setLoading(true);
        let result;
        
        if (token) {
          try {
            result = await getFullDetailsOfCourse(courseId, token);
          } catch (error) {
            result = await fetchCourseDetails(courseId);
          }
        } else {
          result = await fetchCourseDetails(courseId);
        }
        
        if (result?.courseDetails) {
          setCourse(result);
        } else if (result?.success) {
          setCourse(result.data);
        } else {
          throw new Error(result?.message || 'Failed to fetch course details');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        showError(error.message || 'Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, token]);

  // Fetch cart data
  const fetchCartData = async () => {
    try {
      setLoading(true);
      const response = await fetchCartDetails(token);

      if (!response?.success) {
        throw new Error(response?.message || "Failed to load cart data");
      }

      setCartData(prev => ({
        ...prev,
        items: response.cartData?.items || [],
        total: response.cartData?.total || 0,
        grandTotal: (response.cartData?.total || 0) + prev.shipping - prev.discount
      }));

    } catch (error) {
      console.error("Error in fetchCartData:", error);
      setError(error.message || "Network error while loading cart data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCartData();
    } else {
      navigate('/login');
    }
  }, [token, navigate]);

  const courseDetails = course?.courseDetails || {};
  const isUserEnrolled = enrollmentStatus || 
    courseDetails.studentsEnrolled?.some(student => student._id === user?._id) || 
    user?.courses?.includes(courseId) || 
    false;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  const handleTermsChange = (e) => {
    setAgreeTerms(e.target.checked);
  };

  const handleRemoveFromCart = async (courseId) => {
    try {
      await removeFromCart({ courseId }, token);
      await fetchCartData(); // Refresh cart data
      showSuccess("Item removed from cart");
    } catch (error) {
      showError(error.message || "Failed to remove item from cart");
    }
  };

 const handleBuyCourse = async () => {
  if (!token) {
    showError('Please login to purchase');
    navigate('/login');
    return;
  }

  if (user?.accountType !== 'Student') {
    showError('Only students can purchase courses');
    return;
  }

  if (!user?.enrollmentFeePaid) {
    showError('Please complete enrollment fee payment');
    navigate('/enrollment-payment', { state: { returnTo: '/checkout' } });
    return;
  }

  if (!agreeTerms) {
    showError('You must agree to the terms');
    return;
  }

  setProcessingPayment(true);
  const toastId = showLoading('Processing payment...');

  

  try {


     // 1. Get Razorpay key first
    const keyResponse = await apiConnector(
      "GET",
      "/api/v1/payment/getRazorpayKey"
    );

    if (!keyResponse.data.success) {
      throw new Error("Failed to get payment gateway");
    }

    const razorpayKey = keyResponse.data.key;

    console.log("Razorpay Key:", razorpayKey);
    let courseIds = [];
    let courseNames = [];
   let totalAmount = cartData.grandTotal; 

    if (cartData.items.length > 0) {
      courseIds = cartData.items.map(item => item.course?._id || item._id);
      courseNames = cartData.items.map(item => item.course?.courseName || item.courseName);
    } else if (courseId && courseDetails) {
      courseIds = [courseId];
      courseNames = [courseDetails.courseName];
      totalAmount = courseDetails.price;
    }
    // Step 1: Initiate payment
    const paymentResponse = await apiConnector(
      "POST",
      "/api/v1/payment/capturePayment",
      { courses: courseIds },
      {
        Authorization: `Bearer ${token}`
      }
    );

    if (!paymentResponse.data.success) {
      throw new Error(paymentResponse.data.message);
    }

  // 4. Open Razorpay with proper key
    const options = {
      key: razorpayKey, // Use the key from backend
      amount: paymentResponse.data.amount,
      currency: "INR",
      order_id: paymentResponse.data.orderId,
      name: "Course Purchase",
      description: `Purchasing ${courseNames.join(', ')}`,
      prefill: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email
      },
      handler: async function(response) {
        console.log("Razorpay success handler response:", response)
        const verifyToast = showLoading("Verifying payment...")
        try {
          const payload = { ...response, courses: courseIds }
          console.log("Sending verify payload:", payload)
          const verifyRes = await apiConnector(
            "POST",
            "/api/v1/payment/verifyPayment",
            payload,
            { Authorization: `Bearer ${token}` }
          )
          console.log("Verify response:", verifyRes)
          if (!verifyRes?.data?.success) {
            throw new Error(verifyRes?.data?.message || "Payment verification failed")
          }
          showSuccess("Payment successful. You are enrolled!")
          // Clear cart (server-side) if applicable
          try { await clearCart(token) } catch (e) { console.warn("clearCart failed", e) }
          setEnrollmentStatus(true)
          navigate("/dashboard/enrolled-courses")
        } catch (err) {
          console.error("Payment verification error:", err)
          setPaymentVerificationFailed(true)
          const backendMsg = err?.response?.data?.message || err?.message || "Payment verification failed"
          showError(backendMsg)
        } finally {
          dismissToast(verifyToast)
        }
      },
      theme: {
        color: "#07A698"
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", function (resp) {
      console.error("Razorpay payment.failed:", resp)
      showError(resp?.error?.description || "Payment failed. Please try again.")
    })
    rzp.open();

  } catch (error) {
    console.error('Payment error:', error);
    showError(error.message || 'Payment failed');
  } finally {
    setProcessingPayment(false);
    dismissToast(toastId);
  }
};

  if (error) {
    return (
      <div className="error-container">
        <h3>Error loading cart</h3>
        <p>{error}</p>
        <button 
          onClick={() => {
            setError(null);
            fetchCartData();
          }}
          className="retry-button"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="loading-container">Loading your cart...</div>;
  }

  return (
    <>
      {/* Header Section */}
      <section className="checkout-header-section">
        {/* Background Overlay */}
        <div className="header-overlay"></div>
        
        {/* Decorative Elements */}
        <div className="decorative-elements">
          <div className="orange-triangle"></div>
          <div className="dashed-circle"></div>
          <div className="green-circle small"></div>
          <div className="green-circle medium"></div>
          <div className="green-circle tiny"></div>
          <div className="diagonal-stripes"></div>
        </div>
        
        {/* Content Container */}
        <div className="header-content">
          <div className="header-text">
            <h1 className="main-title">
              Checkout
              <span className="title-dot"></span>
            </h1>
            
            {/* Breadcrumb Navigation */}
            <div className="breadcrumb">
              <span className="breadcrumb-item">Home</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">Checkout</span>
            </div>
          </div>
        </div>
        
        {/* Bottom subtle border */}
        <div className="header-bottom-border"></div>
      </section>

      {/* Checkout Form Section */}
      <section className="checkout-form-section">
        <div className="container">
          <div className="checkout-top">
            <div className="coupon-list">
              {/* Coupon and login forms */}
              <div className="verify-item">
                <h4 className="title">Returning customers?<button type="button" className="rr-checkout-login-form-reveal-btn">Click here</button> to login</h4>
                <div id="rrReturnCustomerLoginForm" className="login-form">
                  <form>
                    <input type="text" id="fullname" name="fullname" className="form-control" placeholder="Your Name" />
                    <input type="text" id="password" name="password" className="form-control" placeholder="Password" />
                  </form>
                  <div className="checkbox-wrap">
                    <div className="checkbox-item">
                      <input type="checkbox" id="vehicle3" name="vehicle3" value="Boat" />
                      <label htmlFor="vehicle3">Remember Me</label>
                    </div>
                    <Link to="#" className="forgot">Forgot Password?</Link>
                  </div>
                  <button className="ed-primary-btn">Login</button>
                </div>
              </div>
              
              <div className="verify-item">
                <h4 className="title">Have a coupon?<button type="button" className="rr-checkout-coupon-form-reveal-btn">Click here</button> to enter your code</h4>
                <div id="rrCheckoutCouponForm" className="login-form">
                  <form>
                    <input type="text" id="code" name="code" className="form-control" placeholder="Coupon Code" />
                  </form>
                  <button className="ed-primary-btn">Apply</button>
                </div>
              </div>
            </div>
          </div>

          <div className="checkout-row">
            {/* Billing Details Form (left column) */}
            <div className="checkout-col-left">
  <div className="checkout-left">
    <h3 className="form-header">Billing Details</h3>
    <form>
      <div className="checkout-form-wrap">
        {/* Email */}
        <div className="form-group">
          <div className="form-full-width">
            <div className="form-item">
              <h4 className="form-title">Email Address*</h4>
              <input 
                type="email" 
                id="email" 
                name="email" 
                className="form-control" 
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>
        
        {/* First and Last Name */}
        <div className="form-group">
          <div className="form-half-width">
            <div className="form-item name">
              <h4 className="form-title">First Name*</h4>
              <input 
                type="text" 
                id="firstName" 
                name="firstName" 
                className="form-control" 
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div className="form-half-width">
            <div className="form-item">
              <h4 className="form-title">Last Name*</h4>
              <input 
                type="text" 
                id="lastName" 
                name="lastName" 
                className="form-control" 
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>
        
        {/* Company (optional) */}
        <div className="form-group">
          <div className="form-full-width">
            <div className="form-item">
              <h4 className="form-title">Company Name (Optional)</h4>
              <input 
                type="text" 
                id="company" 
                name="company" 
                className="form-control" 
                value={formData.company}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        
        {/* Country */}
        <div className="form-group">
          <div className="form-full-width">
            <div className="form-item">
              <h4 className="form-title">Country / Region*</h4>
              <input 
                type="text" 
                id="country" 
                name="country" 
                className="form-control" 
                placeholder="United States (US)" 
                value={formData.country}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>
        
        {/* Street Address */}
        <div className="form-group">
          <div className="form-full-width">
            <div className="form-item">
              <h4 className="form-title">Street Address*</h4>
              <input 
                type="text" 
                id="street" 
                name="street" 
                className="form-control street-control" 
                placeholder="House number and street number" 
                value={formData.street}
                onChange={handleInputChange}
                required
              />
              <input 
                type="text" 
                id="street2" 
                name="street2" 
                className="form-control street-control-2" 
                placeholder="Apartment, suite, unit, etc. (optional)" 
                value={formData.street2}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </div>
        
        {/* Town/City */}
        <div className="form-group">
          <div className="form-full-width">
            <div className="form-item">
              <h4 className="form-title">Town / City*</h4>
              <input 
                type="text" 
                id="town" 
                name="town" 
                className="form-control" 
                value={formData.town}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>
        
        {/* State */}
        <div className="form-group">
          <div className="form-full-width">
            <div className="form-item">
              <h4 className="form-title">State*</h4>
              <select 
                className="form-control" 
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
              >
                <option value="California">California</option>
                <option value="New York">New York</option>
                <option value="Texas">Texas</option>
                <option value="Florida">Florida</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Zip Code */}
        <div className="form-group">
          <div className="form-full-width">
            <div className="form-item">
              <h4 className="form-title">Zip Code*</h4>
              <input 
                type="text" 
                id="zip" 
                name="zip" 
                className="form-control" 
                value={formData.zip}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>
        
        {/* Phone */}
        <div className="form-group">
          <div className="form-full-width">
            <div className="form-item">
              <h4 className="form-title">Phone*</h4>
              <input 
                type="text" 
                id="phone" 
                name="phone" 
                className="form-control" 
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
        </div>
        
        {/* Order Notes */}
        <div className="form-group">
          <div className="form-full-width">
            <div className="form-item">
              <h4 className="form-title">Order Notes</h4>
              <textarea 
                id="notes" 
                name="notes" 
                cols="30" 
                rows="5" 
                className="form-control address" 
                value={formData.notes}
                onChange={handleInputChange}
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</div>
          
                    {/* ... rest of the form fields remain exactly the same ... */}
                 
            
            {/* Order Summary (right column) */}
            <div className="checkout-col-right">
              <div className="checkout-right">
                <h3 className="form-header">Your Order</h3>
                <div className="order-box">
                  <div className="order-items">
                    {/* Order Items Header */}
                    <div className="order-item header">
                      <div className="order-left">
                        <span className="product">Product</span>
                      </div>
                      <div className="order-right">
                        <span className="price">Price</span>
                      </div>
                    </div>
                    
                    {/* Order Items List */}
                    {cartData.items.length === 0 ? (
                      <div className="empty-cart">
                        Your cart is empty
                      </div>
                    ) : (
                      cartData.items.map((item) => (
                        <div className="order-item" key={item.course._id}>
                          <div className="order-left">
                            <div className="order-img">
                              <img 
                                src={item.course.thumbnail || "/assets/img/shop/shop-1.png"} 
                                alt={item.course.courseName} 
                              />
                            </div>
                            <div className="content">
                              <h4 className="title">{item.course.courseName}</h4>
                              <span className="quantity">Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <div className="order-right">
                            <span className="price">
                              ₹{(item.course.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                    
                    {/* Order Summary */}
                    <div className="order-item total">
                      <div className="order-left">
                        <span className="left-title">Total Price:</span>
                      </div>
                      <div className="order-right">
                        <span className="right-title title-2">
                          ₹{cartData.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Payment Options */}
                  <div className="payment-option-wrap">
                    <p className="desc">
                      Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our <span>privacy policy.</span>
                    </p>
                    
                    <div className="form-check">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="termsCheckbox" 
                        checked={agreeTerms}
                        onChange={handleTermsChange}
                      />
                      <label className="form-check-label" htmlFor="termsCheckbox">
                        I have read and agree to the terms and conditions *
                      </label>
                    </div>
                    
                    <button 
                      onClick={handleBuyCourse}
                      className="ed-primary-btn order-btn"
                      disabled={cartData.items.length === 0}
                    >
                      Make Payment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Responsive CSS */}
      <style jsx>{`
        /* Header Section Styles */
        .checkout-header-section {
          position: relative; 
          padding: 120px 0 80px; 
          overflow: hidden;
          background-image: url(${pageHeaderBg});
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          margin-top: 6rem;
        }
        
        .header-overlay {
          position: absolute; 
          inset: 0; 
          background-color: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(1px);
        }
        
        .decorative-elements {
          position: absolute; 
          inset: 0;
        }
        
        .orange-triangle {
          position: absolute; 
          top: 50px; 
          left: 80px;
          width: 0;
          height: 0;
          border-left: 20px solid transparent;
          border-right: 20px solid transparent;
          border-bottom: 35px solid #f59e0b;
          transform: rotate(35deg);
          opacity: 0.9;
          z-index: 3;
        }
        
        .dashed-circle {
          position: absolute; 
          top: 20px; 
          left: 20px;
          width: 100px;
          height: 100px;
          border: 2px dashed #9ca3af;
          border-radius: 50%;
          opacity: 0.6;
          z-index: 10;
          margin-left: 20px;
        }
        
        .green-circle {
          position: absolute; 
          background: linear-gradient(135deg, ${ED_TEAL}, ${ED_TEAL_DARK});
          border-radius: 50%;
          z-index: 3;
        }
        
        .green-circle.small {
          top: 30px; 
          right: 150px;
          width: 60px;
          height: 60px;
          opacity: 0.8;
        }
        
        .green-circle.medium {
          top: 100px; 
          right: 80px;
          width: 90px;
          height: 90px;
          opacity: 0.5;
          z-index: 2;
        }
        
        .green-circle.tiny {
          bottom: 20px; 
          right: 200px;
          width: 40px;
          height: 40px;
          opacity: 0.7;
        }
        
        .diagonal-stripes {
          position: absolute; 
          top: 0; 
          right: 0;
          width: 150px;
          height: 100%;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 6px,
            ${ED_TEAL} 6px,
            ${ED_TEAL} 9px
          );
          opacity: 0.15;
          z-index: 1;
        }
        
        .header-content {
          position: relative; 
          max-width: 1280px; 
          // margin: 0 auto; 
          margin-left: 120px;
          padding: 0 16px;
          z-index: 2;
        }
        
        .header-text {
          display: flex;
          flex-direction: column;
          justify-content: center;
          min-height: 120px;
          gap: 12px;
        }
        
        .main-title {
          font-size: 48px; 
          font-weight: 800; 
          color: #1f2937; 
          margin: 0;
          display: flex;
          align-items: center;
          gap: 16px;
        }
        
        .title-dot {
          display: inline-block;
          width: 12px;
          height: 12px;
          background-color: ${ED_TEAL};
          border-radius: 50%;
          margin-left: 8px;
        }
        
        .breadcrumb {
          display: flex; 
          align-items: center; 
          gap: 8px; 
          color: #6b7280;
          font-size: 16px;
          font-weight: 500;
        }
        
        .breadcrumb-item {
          color: #6b7280; 
          text-decoration: none;
          transition: color 0.3s;
          cursor: pointer;
        }
        
        .breadcrumb-separator {
          color: ${ED_TEAL};
          font-weight: 600;
        }
        
        .breadcrumb-current {
          color: ${ED_TEAL};
          font-weight: 600;
        }
        
        .header-bottom-border {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(to right, transparent, #e5e7eb, transparent);
        }
        
        /* Checkout Form Section */
        .checkout-form-section {
          padding: 60px 0;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 15px;
        }
        
        .checkout-top {
          margin-bottom: 30px;
          margin-top: 2rem;
        }
        
        .coupon-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .verify-item {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
        }
        
        .verify-item .title {
          font-size: 16px;
          margin-bottom: 0;
        }
        
        .rr-checkout-login-form-reveal-btn,
        .rr-checkout-coupon-form-reveal-btn {
          background: none;
          border: none;
          color: #14b8a6;
          cursor: pointer;
          padding: 0;
          margin-left: 5px;
        }
        
        .login-form {
          margin-top: 15px;
          display: none;
        }
        
        .form-control {
          width: 100%;
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 15px;
          box-sizing: border-box;
        }
        
        .checkbox-wrap {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .checkbox-item {
          display: flex;
          align-items: center;
        }
        
        .checkbox-item input {
          margin-right: 8px;
        }
        
        .forgot {
          color: #14b8a6;
          text-decoration: none;
        }
        
        .ed-primary-btn {
          background: #14b8a6;
          color: #fff;
          padding: 10px 20px;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-weight: 600;
        }
          /* Form Styles */
.form-group {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
}

.form-full-width {
  width: 100%;
}

.form-half-width {
  width: 100%;
}

.form-item {
  width: 100%;
}

.form-title {
  font-size: 16px;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #14b8a6;
  box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.1);
}

.form-control.street-control {
  margin-bottom: 10px;
}

.form-control.street-control-2 {
  margin-bottom: 0;
}

.form-control.address {
  resize: vertical;
  min-height: 100px;
}

/* Responsive adjustments for form */
@media (min-width: 768px) {
  .form-half-width {
    width: calc(50% - 8px);
  }
  
  .form-group {
    margin-bottom: 20px;
  }
}

@media (max-width: 767px) {
  .form-group {
    flex-direction: column;
    gap: 10px;
  }
  
  .form-title {
    font-size: 14px;
  }
  
  .form-control {
    padding: 10px 12px;
    font-size: 16px; /* Prevents zoom on iOS */
  }
}

/* Remove any inline styles from the JSX and use these classes instead */
        
        /* Checkout Row and Columns */
        .checkout-row {
          display: flex;
          flex-wrap: wrap;
          margin: 0 -15px;
        }
        
        .checkout-col-left,
        .checkout-col-right {
          padding: 0 15px;
          width: 100%;
        }
        
        .checkout-left,
        .checkout-right {
          margin-bottom: 30px;
        }
        
        .form-header {
          font-size: 24px;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }
        
        .checkout-form-wrap {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .form-group {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }
        
        .form-full-width {
          width: 100%;
        }
        
        .form-half-width {
          width: 100%;
        }
        
        .form-title {
          font-size: 16px;
          margin-bottom: 10px;
        }
        
        /* Order Box */
        .order-box {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 8px;
        }
        
        .order-items {
          margin-bottom: 30px;
        }
        
        .order-item {
          display: flex;
          justify-content: space-between;
          padding: 15px 0;
          border-bottom: 1px solid #eee;
        }
        
        .order-item.header {
          border-bottom: 1px solid #ccc;
          font-weight: 600;
        }
        
        .order-item.total {
          font-weight: 600;
        }
        
        .order-left {
          display: flex;
          align-items: center;
        }
        
        .order-right {
          display: flex;
          align-items: center;
        }
        
        .order-img {
          width: 60px;
          height: 60px;
          margin-right: 15px;
        }
        
        .order-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 4px;
        }
        
        .content .title {
          font-size: 16px;
          margin: 0;
        }
        
        .quantity {
          font-size: 14px;
          color: #666;
        }
        
        .price {
          font-weight: 600;
        }
        
        .empty-cart {
          padding: 20px;
          text-align: center;
        }
        
        .right-title.title-2 {
          color: #14b8a6;
          font-size: 18px;
        }
        
        /* Payment Options */
        .payment-option-wrap {
          margin-top: 20px;
        }
        
        .desc {
          font-size: 14px;
          color: #666;
          margin-bottom: 20px;
        }
        
        .desc span {
          color: #14b8a6;
        }
        
        .form-check {
          margin-bottom: 20px;
          display: flex;
          align-items: center;
        }
        
        .form-check-input {
          margin-right: 10px;
        }
        
        .order-btn {
          padding: 15px;
          width: 100%;
          text-align: center;
          font-size: 16px;
          opacity: 1;
          pointer-events: auto;
        }
        
        .order-btn:disabled {
          opacity: 0.5;
          pointer-events: none;
        }
        
        /* Responsive Styles */
        @media (min-width: 768px) {
          .checkout-header-section {
            padding: 160px 0 110px;
            margin-top: 8rem;
          }
          
          .checkout-col-left,
          .checkout-col-right {
            width: 50%;
          }
          
          .form-half-width {
            width: calc(50% - 10px);
          }
          
          .checkout-top {
            margin-top: 3rem;
          }
        }
        
        @media (max-width: 767px) {
          .main-title {
            font-size: 36px;
          }
          
          .checkout-header-section {
            padding: 100px 0 70px;
            margin-top: 5rem;
          }
          
          .orange-triangle {
            top: 30px;
            left: 40px;
            border-left: 15px solid transparent;
            border-right: 15px solid transparent;
            border-bottom: 25px solid #f59e0b;
          }
          
          .dashed-circle {
            top: 15px;
            left: 15px;
            width: 70px;
            height: 70px;
          }
          
          .green-circle.small {
            top: 20px;
            right: 100px;
            width: 40px;
            height: 40px;
          }
          
          .green-circle.medium {
            top: 70px;
            right: 50px;
            width: 60px;
            height: 60px;
          }
          
          .green-circle.tiny {
            bottom: 15px;
            right: 120px;
            width: 30px;
            height: 30px;
          }
          
          .diagonal-stripes {
            width: 100px;
          }
          
          .order-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .order-right {
            align-self: flex-end;
          }
        }
        
        @media (max-width: 480px) {
          .main-title {
            font-size: 28px;
          flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          margin-bottom: 10px;
          margin-top: -20px;
          text-align: center;
          padding: 0 10px;
          margin-top: -20px;
          margin-bottom: 10px;
          line-height: 1.2;
          text-align: center;
          width: 100%;
          justify-content: center;
        }
          
          .title-dot {
            margin-left: 0;
          align-self: center;
          margin-top: 8px;
          margin-left: 8px;
          display: inline-block;
        }
          
          .breadcrumb {
            justify-content: center;
            font-size: 14px;
          }
          
          .checkout-header-section {
            padding: 80px 0 60px;
            margin-top: 4rem;
          }
          
          .container {
            padding: 0 10px;
          }
          
          .order-box {
            padding: 20px;
          }
          
          .form-header {
            font-size: 20px;
          }
          
          .order-img {
            width: 50px;
            height: 50px;
            margin-right: 10px;
          }
          
          .content .title {
            font-size: 14px;
          }
          
          .quantity {
            font-size: 12px;
          }
          
          .price {
            font-size: 14px;
          }
          
          .right-title.title-2 {
            font-size: 16px;
          }
          
          .checkbox-wrap {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
          }
          
          .forgot {
            align-self: flex-end;
          }
        }
        
        @media (max-width: 360px) {
          .main-title {
            font-size: 24px;
          }
          
          .form-header {
            font-size: 18px;
          }
          
          .order-item {
            padding: 10px 0;
          }
          
          .order-left {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .order-img {
            margin-right: 0;
            margin-bottom: 10px;
          }
        }
      `}</style>
    </>
  );
};

export default CheckoutPage;