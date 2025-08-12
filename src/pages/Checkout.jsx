
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
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
 
//   useEffect(() => {
//     const fetchCourse = async () => {
//       try {
//         setLoading(true);
//         console.log('Fetching course with ID:', courseId);
        
//         // Try to get full course details first (requires authentication)
//         let result;
//         if (token) {
//           try {
//             result = await getFullDetailsOfCourse(courseId, token);
//             console.log('Full course details result:', result);
//           } catch (error) {
//             console.log('Full course details failed, trying basic details:', error);
//             result = await fetchCourseDetails(courseId);
//           }
//         } else {
//           // If no token, use basic course details
//           result = await fetchCourseDetails(courseId);
//         }
        
//         console.log('Course fetch result:', result);
//         if (result?.courseDetails) {
//           // API returned data directly without success wrapper
//           setCourse(result);
//         } else if (result?.success) {
//           // API returned data with success wrapper
//           setCourse(result.data);
//         } else {
//           console.error('Failed to fetch course:', result);
//           toast.error(result?.message || 'Failed to fetch course details');
//         }
//       } catch (error) {
//         console.error('Error fetching course:', error);
//         toast.error('Failed to load course details');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (courseId) {
//       fetchCourse();
//     }
//   }, [courseId, token]);
//   const fetchCartData = async () => {
//   try {
//     setLoading(true);
//     console.log("Fetching cart data...");
    
//     // fetchCartDetails already returns parsed JSON
//     const response = await fetchCartDetails(token);
//     console.log("API Response:", response);

//     if (!response) {
//       throw new Error("No response received from server");
//     }

//     if (!response.success) {
//       throw new Error(response.message || "Failed to load cart data");
//     }

//     // Note: Using response.cartData instead of response.data
//     setCartData(prev => ({
//       ...prev,
//       items: response.cartData?.items || [],
//       total: response.cartData?.total || 0,
//       grandTotal: (response.cartData?.total || 0) + prev.shipping - prev.discount
//     }));

//   } catch (error) {
//     console.error("Error in fetchCartData:", error);
//     toast.error(error.message || "Network error while loading cart data");
//   } finally {
//     setLoading(false);
//   }
// };

// const courseDetails = course?.courseDetails || {};

// //  Enhanced enrollment check - also check if user has this course in their enrolled courses
//   const isUserEnrolled = enrollmentStatus || 
//     courseDetails.studentsEnrolled?.some(student => student._id === user?._id) || 
//     user?.courses?.includes(courseId) || 
//     false;


//   useEffect(() => {
//     if (token) {
//       fetchCartData();
//     } else {
//       navigate('/login');
//     }
//   }, [token, navigate]);

//   // Handle form input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//   };

//   // Handle payment method selection
//   const handlePaymentMethodChange = (method) => {
//     setPaymentMethod(method);
//   };

//   // Handle terms checkbox
//   const handleTermsChange = (e) => {
//     setAgreeTerms(e.target.checked);
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!paymentMethod) {
//       toast.error("Please select a payment method");
//       return;
//     }
    
//     if (!agreeTerms) {
//       toast.error("You must agree to the terms and conditions");
//       return;
//     }
    
//     try {
//       const response = await fetch('/api/checkout', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify({
//           ...formData,
//           paymentMethod,
//           items: cartData.items,
//           total: cartData.grandTotal
//         })
//       });
      
//       const data = await response.json();
      
//       if (response.ok) {
//         toast.success("Order placed successfully!");
//         // Redirect to order confirmation page
//         navigate(`/order-confirmation/${data.orderId}`);
//       } else {
//         toast.error(data.message || "Failed to place order");
//       }
//     } catch (error) {
//       toast.error("Network error while placing order");
//     }
//   };
// const handleBuyCourse = async () => {
//   if (!token) {
//     toast.error('Please login to purchase');
//     navigate('/login');
//     return;
//   }

//   if (user?.accountType !== 'Student') {
//     toast.error('Only students can purchase courses');
//     return;
//   }

//   if (!user?.enrollmentFeePaid) {
//     toast.error('Please complete enrollment fee payment before purchasing courses');
//     navigate('/enrollment-payment');
//     return;
//   }

//   try {
//     let coursesToBuy = [];

//     if (cartData.items.length > 0) {
//       // Multiple courses from cart
//     //   coursesToBuy = cartData.items.map(item => ({
//     //     courseId: item._id,
//     //     name: item.courseName,
//     //     price: item.price
//     //   }));

  
//   coursesToBuy = cartData.items.map(item => ({
//     courseId: item.course?._id || item._id, // prefer course._id
//     name: item.course?.courseName || item.courseName,
//     price: item.course?.price || item.price
//   }));

//     } else if (courseId && courseDetails) {
//       // Single course direct buy
//       coursesToBuy = [{
//         courseId,
//         name: courseDetails.courseName,
//         price: courseDetails.price
//       }];
//     } else {
//       toast.error("No course(s) selected for purchase");
//       return;
//     }

//     // Loop through each course to buy
//     for (const course of coursesToBuy) {
//       await buyCourse(
//         token,
//         user,
//         course.courseId,
//         course.name,
//         course.price,
//         navigate,
//         (paymentData) => {
//           setPaymentVerificationFailed(true);
//           console.log('Payment verification failed for:', course.name, paymentData);
//         }
//       );
//     }

//     toast.success("Purchase completed!");
//   } catch (error) {
//     console.error('Error purchasing course(s):', error);
//     if (error.message?.includes('Student is already Enrolled')) {
//       toast.info('You are already enrolled in one or more of these courses!');
//       setEnrollmentStatus(true);
//       navigate('/dashboard/active-courses');
//       return;
//     }
//     toast.error('Failed to process payment');
//   }
// };


//     // Render error state
// if (error) {
//   return (
//     <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
//       <h3>Error loading cart</h3>
//       <p>{error}</p>
//       <button 
//         onClick={() => {
//           setError(null);
//           fetchCartData();
//         }}
//         style={{
//           padding: '10px 20px',
//           background: '#14b8a6',
//           color: 'white',
//           border: 'none',
//           borderRadius: '4px',
//           cursor: 'pointer'
//         }}
//       >
//         Retry
//       </button>
//     </div>
//   );
// }
//   if (loading) {
//     return <div style={{ textAlign: 'center', padding: '50px' }}>Loading your cart...</div>;
//   }




// Fetch course details if courseId is present (direct purchase)
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
        toast.error(error.message || 'Failed to load course details');
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
      await removeFromCart(courseId, token);
      await fetchCartData(); // Refresh cart data
      toast.success("Item removed from cart");
    } catch (error) {
      toast.error(error.message || "Failed to remove item from cart");
    }
  };

 const handleBuyCourse = async () => {
  if (!token) {
    toast.error('Please login to purchase');
    navigate('/login');
    return;
  }

  if (user?.accountType !== 'Student') {
    toast.error('Only students can purchase courses');
    return;
  }

  if (!user?.enrollmentFeePaid) {
    toast.error('Please complete enrollment fee payment');
    navigate('/enrollment-payment');
    return;
  }

  if (!agreeTerms) {
    toast.error('You must agree to the terms');
    return;
  }

  setProcessingPayment(true);
  const toastId = toast.loading('Processing payment...');

  

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
      { courses: courseIds ,
        amount: totalAmount // Send calculated total amount

      },
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
        // ... verification logic ...
      },
      theme: {
        color: "#07A698"
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();

  } catch (error) {
    console.error('Payment error:', error);
    toast.error(error.message || 'Payment failed');
  } finally {
    setProcessingPayment(false);
    toast.dismiss(toastId);
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

       <section style={{ 
      position: 'relative', 
      padding: '160px 0 110px', 
      overflow: 'hidden',
      backgroundImage: `url(${pageHeaderBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      marginTop: '8rem'
    }}>
      {/* Background Overlay */}
      <div style={{ 
        position: 'absolute', 
        inset: 0, 
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        backdropFilter: 'blur(1px)'
      }}></div>
      
      {/* Decorative Elements */}
      <div style={{ position: 'absolute', inset: 0 }}>
        {/* Orange Triangle */}
        <div style={{ 
          position: 'absolute', 
          top: '50px', 
          left: '80px',
          width: '0',
          height: '0',
          borderLeft: '20px solid transparent',
          borderRight: '20px solid transparent',
          borderBottom: '35px solid #f59e0b',
          transform: 'rotate(35deg)',
          opacity: 0.9,
          zIndex: 3
        }}></div>
        
        {/* Dashed Circle */}
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          left: '20px',
          width: '100px',
          height: '100px',
          border: '2px dashed #9ca3af',
          borderRadius: '50%',
          opacity: 0.6,
          zIndex: 10
        }}></div>
        
        {/* Green Circles Pattern on Right */}
        <div style={{ 
          position: 'absolute', 
          top: '30px', 
          right: '150px',
          width: '60px',
          height: '60px',
          background: `linear-gradient(135deg, ${ED_TEAL}, ${ED_TEAL_DARK})`,
          borderRadius: '50%',
          opacity: 0.8,
          zIndex: 3
        }}></div>
        
        <div style={{ 
          position: 'absolute', 
          top: '100px', 
          right: '80px',
          width: '90px',
          height: '90px',
          background: `linear-gradient(135deg, ${ED_TEAL}, ${ED_TEAL_DARK})`,
          borderRadius: '50%',
          opacity: 0.5,
          zIndex: 2
        }}></div>
        
        <div style={{ 
          position: 'absolute', 
          bottom: '20px', 
          right: '200px',
          width: '40px',
          height: '40px',
          background: ED_TEAL,
          borderRadius: '50%',
          opacity: 0.7,
          zIndex: 3
        }}></div>
        
        {/* Diagonal Stripes Pattern on Far Right */}
        <div style={{ 
          position: 'absolute', 
          top: '0', 
          right: '0',
          width: '150px',
          height: '100%',
          background: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 6px,
            ${ED_TEAL} 6px,
            ${ED_TEAL} 9px
          )`,
          opacity: 0.15,
          zIndex: 1
        }}></div>
      </div>
      
      {/* Content Container */}
      <div style={{ 
        position: 'relative', 
        maxWidth: '1280px', 
        margin: '0 auto', 
        padding: '0 16px',
        zIndex: 2
      }}>
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: '120px',
          gap: '12px'
        }}>
          {/* Main Title */}
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: '800', 
            color: '#1f2937', 
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            Checkout
            <span style={{ 
              display: 'inline-block',
              width: '12px',
              height: '12px',
              backgroundColor: ED_TEAL,
              borderRadius: '50%',
              marginLeft: '8px'
            }}></span>
          </h1>
          
          {/* Breadcrumb Navigation */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: '#6b7280',
            fontSize: '16px',
            fontWeight: '500'
          }}>
            <span style={{ 
              color: '#6b7280', 
              textDecoration: 'none',
              transition: 'color 0.3s',
              cursor: 'pointer'
            }}>
              Home
            </span>
            <span style={{
              color: ED_TEAL,
              fontWeight: '600'
            }}>/</span>
            <span style={{ 
              color: ED_TEAL,
              fontWeight: '600'
            }}>
              Checkout
            </span>
          </div>
        </div>
      </div>
      
      {/* Bottom subtle border */}
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        height: '1px',
        background: 'linear-gradient(to right, transparent, #e5e7eb, transparent)'
      }}></div>
    </section>
        <section className="checkout-section pt-10 pb-100 " style={{ padding: '10px 0' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 15px' }}>
        <div className="checkout-top" style={{ marginBottom: '30px' , marginTop: '3rem'}}>
           <div className="coupon-list">
             <div className="verify-item mb-30" style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h4 className="title" style={{ fontSize: '16px', marginBottom: 0 }}>Returning customers?<button type="button" className="rr-checkout-login-form-reveal-btn" style={{ background: 'none', border: 'none', color: '#14b8a6', cursor: 'pointer', padding: 0, marginLeft: '5px' }}>Click here</button> to login</h4>
                <div id="rrReturnCustomerLoginForm" className="login-form" style={{ marginTop: '15px', display: 'none' }}><form>
                    <input type="text" id="fullname" name="fullname" className="form-control" style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} placeholder="Your Name" />
                     <input type="text" id="password" name="password" className="form-control" style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} placeholder="Password" />
                   </form>
                   <div className="checkbox-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <div className="checkbox-item" style={{ display: 'flex', alignItems: 'center' }}>
                     <input type="checkbox" id="vehicle3" name="vehicle3" value="Boat" style={{ marginRight: '8px' }} />
                     <label htmlFor="vehicle3">Remember Me</label>
                    </div>
                    <Link to="#" className="forgot" style={{ color: '#14b8a6', textDecoration: 'none' }}>Forgot Password?</Link>
                  </div>
                  <button className="ed-primary-btn" style={{ background: '#14b8a6', color: '#fff', padding: '10px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Login</button>
                </div>
</div>
              <div className="verify-item" style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h4 className="title" style={{ fontSize: '16px', marginBottom: 0 }}>Have a coupon?<button type="button" className="rr-checkout-coupon-form-reveal-btn" style={{ background: 'none', border: 'none', color: '#14b8a6', cursor: 'pointer', padding: 0, marginLeft: '5px' }}>Click here</button> to enter your code</h4>
                <div id="rrCheckoutCouponForm" className="login-form" style={{ marginTop: '15px', display: 'none' }}>
                  <form>
                    <input type="text" id="code" name="code" className="form-control" style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} placeholder="Coupon Code" />
                  </form>
                  <button className="ed-primary-btn" style={{ background: '#14b8a6', color: '#fff', padding: '10px 20px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Apply</button>
                </div>
              </div>
            </div>
          </div>

        
        <div className="row" style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -15px' }}>
          {/* Billing Details Form (left column) */}
          <div className="col-lg-6 col-md-12" style={{ padding: '0 15px', flex: '0 0 50%', maxWidth: '50%' }}>
            <div className="checkout-left">
              <h3 className="form-header" style={{ fontSize: '24px', marginBottom: '30px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>Billing Details</h3>
              <form >
                <div className="checkout-form-wrap">
                  {/* Email */}
                  <div className="form-group row" style={{ margin: '0 -15px' }}>
                    <div className="col-md-12" style={{ padding: '0 15px' }}>
                      <div className="form-item">
                        <h4 className="form-title" style={{ fontSize: '16px', marginBottom: '10px' }}>Email Address*</h4>
                        <input 
                          type="email" 
                          id="email" 
                          name="email" 
                          className="form-control" 
                          style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} 
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* First and Last Name */}
                  <div className="form-group row" style={{ margin: '0 -15px' }}>
                    <div className="col-md-6" style={{ padding: '0 15px' }}>
                      <div className="form-item name">
                        <h4 className="form-title" style={{ fontSize: '16px', marginBottom: '10px' }}>First Name*</h4>
                        <input 
                          type="text" 
                          id="firstName" 
                          name="firstName" 
                          className="form-control" 
                          style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} 
                          value={formData.firstName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-6" style={{ padding: '0 15px' }}>
                      <div className="form-item">
                        <h4 className="form-title" style={{ fontSize: '16px', marginBottom: '10px' }}>Last Name*</h4>
                        <input 
                          type="text" 
                          id="lastName" 
                          name="lastName" 
                          className="form-control" 
                          style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} 
                          value={formData.lastName}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Company (optional) */}
                  <div className="form-group row" style={{ margin: '0 -15px' }}>
                    <div className="col-md-12" style={{ padding: '0 15px' }}>
                      <div className="form-item">
                        <h4 className="form-title" style={{ fontSize: '16px', marginBottom: '10px' }}>Company Name (Optional)</h4>
                        <input 
                          type="text" 
                          id="company" 
                          name="company" 
                          className="form-control" 
                          style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} 
                          value={formData.company}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Country */}
                  <div className="form-group row" style={{ margin: '0 -15px' }}>
                    <div className="col-md-12" style={{ padding: '0 15px' }}>
                      <div className="form-item">
                        <h4 className="form-title" style={{ fontSize: '16px', marginBottom: '10px' }}>Country / Region*</h4>
                        <input 
                          type="text" 
                          id="country" 
                          name="country" 
                          className="form-control" 
                          style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} 
                          placeholder="United States (US)" 
                          value={formData.country}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Street Address */}
                  <div className="form-group row" style={{ margin: '0 -15px' }}>
                    <div className="col-md-12" style={{ padding: '0 15px' }}>
                      <div className="form-item">
                        <h4 className="form-title" style={{ fontSize: '16px', marginBottom: '10px' }}>Street Address*</h4>
                        <input 
                          type="text" 
                          id="street" 
                          name="street" 
                          className="form-control street-control" 
                          style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} 
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
                          style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} 
                          placeholder="Apartment, suite, unit, etc. (optional)" 
                          value={formData.street2}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Town/City */}
                  <div className="form-group row" style={{ margin: '0 -15px' }}>
                    <div className="col-md-12" style={{ padding: '0 15px' }}>
                      <div className="form-item">
                        <h4 className="form-title" style={{ fontSize: '16px', marginBottom: '10px' }}>Town / City*</h4>
                        <input 
                          type="text" 
                          id="town" 
                          name="town" 
                          className="form-control" 
                          style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} 
                          value={formData.town}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* State */}
                  <div className="form-group row" style={{ margin: '0 -15px' }}>
                    <div className="col-md-12" style={{ padding: '0 15px' }}>
                      <div className="form-item">
                        <h4 className="form-title" style={{ fontSize: '16px', marginBottom: '10px' }}>State*</h4>
                        <select 
                          className="form-control" 
                          style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }}
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
                  <div className="form-group row" style={{ margin: '0 -15px' }}>
                    <div className="col-md-12" style={{ padding: '0 15px' }}>
                      <div className="form-item">
                        <h4 className="form-title" style={{ fontSize: '16px', marginBottom: '10px' }}>Zip Code*</h4>
                        <input 
                          type="text" 
                          id="zip" 
                          name="zip" 
                          className="form-control" 
                          style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} 
                          value={formData.zip}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Phone */}
                  <div className="form-group row" style={{ margin: '0 -15px' }}>
                    <div className="col-md-12" style={{ padding: '0 15px' }}>
                      <div className="form-item">
                        <h4 className="form-title" style={{ fontSize: '16px', marginBottom: '10px' }}>Phone*</h4>
                        <input 
                          type="text" 
                          id="phone" 
                          name="phone" 
                          className="form-control" 
                          style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }} 
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Order Notes */}
                  <div className="form-group row" style={{ margin: '0 -15px' }}>
                    <div className="col-md-12" style={{ padding: '0 15px' }}>
                      <div className="form-item">
                        <h4 className="form-title" style={{ fontSize: '16px', marginBottom: '10px' }}>Order Notes</h4>
                        <textarea 
                          id="notes" 
                          name="notes" 
                          cols="30" 
                          rows="5" 
                          className="form-control address" 
                          style={{ width: '100%', padding: '12px 15px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '15px' }}
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
          
          {/* Order Summary (right column) */}
          <div className="col-lg-6 col-md-12" style={{ padding: '0 15px', flex: '0 0 50%', maxWidth: '50%' }}>
            <div className="checkout-right">
              <h3 className="form-header" style={{ fontSize: '24px', marginBottom: '30px', paddingBottom: '15px', borderBottom: '1px solid #eee' }}>Your Order</h3>
              <div className="order-box" style={{ background: '#f8f9fa', padding: '30px', borderRadius: '8px' }}>
                <div className="order-items" style={{ marginBottom: '30px' }}>
                  {/* Order Items Header */}
                  <div className="order-item item-1" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #ccc', fontWeight: 600 }}>
                    <div className="order-left" style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="product">Product</span>
                    </div>
                    <div className="order-right" style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="price">Price</span>
                    </div>
                  </div>
                  
                  {/* Order Items List */}
                  {cartData.items.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center' }}>
                      Your cart is empty
                    </div>
                  ) : (
                    cartData.items.map((item) => (
                      <div className="order-item" key={item.course._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #eee' }}>
                        <div className="order-left" style={{ display: 'flex', alignItems: 'center' }}>
                          <div className="order-img" style={{ width: '60px', height: '60px', marginRight: '15px' }}>
                            <img 
                              src={item.course.thumbnail || "/assets/img/shop/shop-1.png"} 
                              alt={item.course.courseName} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} 
                            />
                          </div>
                          <div className="content">
                            <h4 className="title" style={{ fontSize: '16px', margin: 0 }}>
                              {item.course.courseName}
                            </h4>
                            <span className="quantity" style={{ fontSize: '14px', color: '#666' }}>
                              Qty: {item.quantity}
                            </span>
                          </div>
                        </div>
                        <div className="order-right" style={{ display: 'flex', alignItems: 'center' }}>
                          <span className="price" style={{ fontWeight: 600 }}>
                            ₹{(item.course.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                  
                  {/* Order Summary */}
                  {/* <div className="order-item item-1" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #eee', fontWeight: 600 }}>
                    <div className="order-left" style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="left-title">Subtotal</span>
                    </div>
                    <div className="order-right" style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="right-title">₹{cartData.total.toFixed(2)}</span>
                    </div>
                  </div> */}
                  
                  {/* <div className="order-item item-1" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #eee', fontWeight: 600 }}>
                    <div className="order-left" style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="left-title">Shipping</span>
                    </div>
                    <div className="order-right" style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="right-title">
                        <span>Flat rate:</span> ₹{cartData.shipping.toFixed(2)}
                      </span>
                    </div>
                  </div> */}
                  
                  {cartData.discount > 0 && (
                    <div className="order-item item-1" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #eee', fontWeight: 600 }}>
                      <div className="order-left" style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="left-title">Discount</span>
                      </div>
                      <div className="order-right" style={{ display: 'flex', alignItems: 'center' }}>
                        <span className="right-title" style={{ color: '#14b8a6' }}>
                          -₹{cartData.discount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="order-item item-1" style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderBottom: '1px solid #eee', fontWeight: 600 }}>
                    <div className="order-left" style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="left-title">Total Price:</span>
                    </div>
                    <div className="order-right" style={{ display: 'flex', alignItems: 'center' }}>
                      <span className="right-title title-2" style={{ color: '#14b8a6', fontSize: '18px' }}>
                        {/* ₹{cartData.grandTotal.toFixed(2)} */}₹{cartData.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
                
                 {/* Payment Options */}
                <div className="payment-option-wrap">
                  
                  
                  <p className="desc" style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
                    Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our <span style={{ color: '#14b8a6' }}>privacy policy.</span>
                  </p>
                  
                  <div className="form-check" style={{ marginBottom: '20px' }}>
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="termsCheckbox" 
                      style={{ marginRight: '10px' }} 
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
                    style={{ 
                      background: '#14b8a6', 
                      color: '#fff', 
                      padding: '15px', 
                      borderRadius: '4px', 
                      border: 'none', 
                      cursor: 'pointer', 
                      fontWeight: 600, 
                      width: '100%', 
                      textAlign: 'center', 
                      fontSize: '16px',
                      opacity: cartData.items.length === 0 ? 0.5 : 1,
                      pointerEvents: cartData.items.length === 0 ? 'none' : 'auto'
                    }}
                    
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
    </>
    
  );
};

export default CheckoutPage;