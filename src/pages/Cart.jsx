


import React, { useState, useEffect } from 'react';

import pageHeaderShape1 from '../assets/img/shapes/page-header-shape-1.png';
import pageHeaderShape2 from '../assets/img/shapes/page-header-shape-2.png';
import pageHeaderShape3 from '../assets/img/shapes/page-header-shape-3.png';
import pageHeaderBg from '../assets/img/bg-img/page-header-bg.png';
import '../index.css';
import DashboardLayout from '../components/common/DashboardLayout';
import { FaXmark, FaArrowUpLong } from 'react-icons/fa6';
import { FaPlus} from 'react-icons/fa6';
import { FaMinus } from 'react-icons/fa6';
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchCartDetails, 
  removeFromCart, 
  updateCartItem 
} from "../services/operations/cartApi";
import { showSuccess, showError, showLoading, dismissToast } from "../utils/toast";
import { Link, useNavigate } from 'react-router-dom';

import RatingStars from '../components/common/RatingStars';

const CartPage = () => {
  const { token } = useSelector((state) => state.auth);
  const [cartData, setCartData] = useState({
    items: [],
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const navigate = useNavigate();


   useEffect(() => {
  const handler = (e) => e.preventDefault();
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', handler);
  });
  return () => {
    document.querySelectorAll('form').forEach(form => {
      form.removeEventListener('submit', handler);
    });
  };
}, []);

  // Fetch cart data
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetchCartDetails(token);
      if (response.success) {
        setCartData(response.cartData);
      } else {
        showError(response.message);
      }
    } catch (error) {
      showError("Failed to load cart data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCart();
    } else {
      navigate('/login');
    }
  }, [token, navigate]);

  // Handle quantity change
  const handleQuantityChange = async (courseId, newQuantity) => {
  if (newQuantity < 1 || newQuantity > 10) {
    showError("Quantity must be between 1 and 10");
    return;
  }

  // Optimistic UI update
  setCartData(prev => {
    const updatedItems = prev.items.map(item =>
      item.course._id === courseId
        ? { ...item, quantity: newQuantity }
        : item
    );
    const updatedTotal = updatedItems.reduce((sum, it) => sum + (it.course.price * it.quantity), 0);
    return { ...prev, items: updatedItems, total: updatedTotal };
  });

  try {
    const response = await updateCartItem({ courseId, quantity: newQuantity }, token);
    if (!response.success) {
      showError(response.message);
      // Optionally revert if failed
      fetchCart();
    }
  } catch (error) {
    showError("Failed to update cart");
    fetchCart();
  }
};


//   const handleQuantityChange = async (courseId, newQuantity) => {
//   if (newQuantity < 1 || newQuantity > 10) {
//     showError("Quantity must be between 1 and 10");
//     return;
//   }
  
//   try {
//     const toastId = showLoading("Updating quantity...");
    
//     // Get current scroll position
//     const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    
//     const response = await updateCartItem({ courseId, quantity: newQuantity }, token);
//     dismissToast(toastId);

//     if (response.success) {
//       showSuccess("Cart updated successfully");
//       await fetchCart(); // Refresh cart data
//       console.log("Still on cart page after update");
//       // Restore scroll position after update
//       window.requestAnimationFrame(() => {
//         window.scrollTo(0, scrollPosition);
//       });
//     } else {
//       showError(response.message);
//     }
//   } catch (error) {
//     showError("Failed to update cart");
//     console.error("Cart update error:", error);
//   }
// };
  
  // Handle remove item
  const handleRemoveItem = async (courseId) => {
    // Optimistic UI update: remove item locally and recalc total
    setCartData((prev) => {
      const updatedItems = prev.items.filter((it) => it.course._id !== courseId);
      const updatedTotal = updatedItems.reduce(
        (sum, it) => sum + it.course.price * it.quantity,
        0
      );
      return { ...prev, items: updatedItems, total: updatedTotal };
    });

    try {
      const toastId = showLoading("Removing item...");
      const response = await removeFromCart({ courseId }, token);
      dismissToast(toastId);

      if (response.success) {
        showSuccess("Item removed from cart");
      } else {
        showError(response.message);
        // Revert to server state
        fetchCart();
      }
    } catch (error) {
      showError("Failed to remove item");
      // Revert to server state on error
      fetchCart();
    }
  };

  // Apply coupon
  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      showError("Please enter a coupon code");
      return;
    }
    showSuccess("Coupon applied successfully");
    // Here you would typically call an API to validate and apply the coupon
  };

  // Proceed to checkout
  const handleCheckout = () => {
    if (cartData.items.length === 0) {
      showError("Your cart is empty");
      return;
    }
    navigate("/dashboard/cart/checkout");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (

    <> 


      <section style={{ 
              position: 'relative', 
              padding: '120px 0', 
              overflow: 'hidden',
              borderBottom: '1px solid #e5e7eb',
              marginTop:"2rem"
             
            }}>
              {/* Background Image */}
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                backgroundImage: `url(${pageHeaderBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                marginTop: '6rem',
               
              }}></div>
              
              {/* Dark Overlay */}
              <div style={{ 
                position: 'absolute', 
                inset: 0, 
                backgroundColor: 'black', 
                opacity: 0.4 
              }}></div>
              
              {/* Background Shapes */}
              <div style={{ position: 'absolute', inset: 0 }}>
                <div style={{ 
                  position: 'absolute', 
                  top: '40px', 
                  left: '40px', 
                  opacity: 0.1 
                }}>
                  <img src={pageHeaderShape1} alt="shape" style={{ width: '80px', height: '80px' }} />
                </div>
                <div style={{ 
                  position: 'absolute', 
                  top: '80px', 
                  right: '80px', 
                  opacity: 0.1 
                }}>
                  <img src={pageHeaderShape2} alt="shape" style={{ width: '64px', height: '64px' }} />
                </div>
                <div style={{ 
                  position: 'absolute', 
                  bottom: '40px', 
                  left: '25%', 
                  opacity: 0.1 
                }}>
                  <img src={pageHeaderShape3} alt="shape" style={{ width: '48px', height: '48px' }} />
                </div>
              </div>
              
              {/* Content Container */}
              <div style={{ 
                position: 'relative', 
                maxWidth: '1280px', 
                margin: '0 auto', 
                padding: '0 16px' 
              }}>
                <div style={{ 
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  minHeight: '220px',
                  gap: '16px'
                }}>
      
                   {/* Main Title */}
                  <h1 style={{ 
                    fontSize: '48px', 
                    fontWeight: '800', 
                    color: 'white', 
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <span style={{ 
                      display: 'inline-block',
                      width: '4px',
                      height: '40px',
                      backgroundColor: '#07A698',
                      borderRadius: '2px'
                    }}></span>
                    Course Details
                  </h1>
                  {/* Breadcrumb Navigation */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    color: 'rgba(255,255,255,0.8)',
                    fontSize: '14px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    <Link to="/" style={{ 
                      color: 'rgba(255,255,255,0.8)', 
                      textDecoration: 'none',
                      transition: 'color 0.3s',
                      ':hover': {
                        color: 'white'
                      }
                    }}>
                      Home
                    </Link>
                    <span>/</span>
                    <Link to="/catalog" style={{ 
                      color: 'rgba(255,255,255,0.8)', 
                      textDecoration: 'none',
                      transition: 'color 0.3s',
                      ':hover': {
                        color: 'white'
                      }
                    }}>
                      Course Details
                    </Link>
                    
                  </div>
                  
                 
                  
                  {/* Description */}
                  {/* <p style={{ 
                    maxWidth: '600px',
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: '18px',
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    {catalogPageData?.data?.selectedCategory?.description}
                  </p> */}
                </div>
              </div>
            </section>
       <DashboardLayout>
      <div style={{ fontFamily: "'Poppins', sans-serif", color: "#333" }}>
       


        {/* Cart Section */}
<section className="cart-section">
  <div className="cart-container">
    <div className="cart-layout">
      {/* Cart Items */}
    {/* Cart Items */}
<div style={{ 
  backgroundColor: '#ffffff', 
  borderRadius: '8px', 
  padding: '2rem',
  boxShadow: '0 3px 12px rgba(0, 0, 0, 0.05)',
  marginBottom: '2rem'
}}>
  {/* Cart Banner */}
  <div style={{
    backgroundColor: '#14b8a6',
    color: '#fff',
    padding: '1rem 1.2rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    fontWeight: '500',
    marginBottom: '2rem'
  }}>
    <p style={{ margin: 0 }}>
      {cartData.items.length > 0
        ? (cartData.total < 1000
            ? `Add ₹${(1000 - cartData.total).toFixed(2)} to cart and get free shipping`
            : 'You have unlocked free shipping!')
        : "Your cart is empty"}
    </p>
    <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.3)' }}></div>
  </div>

  {/* Empty Cart */}
  {cartData.items.length === 0 ? (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '8px',
      padding: '3rem 2rem',
      textAlign: 'center',
      boxShadow: '0 3px 12px rgba(0, 0, 0, 0.05)'
    }}>
      <h3 style={{ marginBottom: '0.5rem' }}>Your cart is empty</h3>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>Start shopping to add items to your cart</p>
      <Link 
        to="/courses" 
        style={{
          display: 'inline-block',
          marginTop: '1rem',
          backgroundColor: '#14b8a6',
          color: '#fff',
          padding: '0.7rem 1.5rem',
          borderRadius: '6px',
          fontWeight: '600',
          textDecoration: 'none',
          transition: 'background 0.2s ease-in-out'
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#0d9b8b'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#14b8a6'}
      >
        Browse Courses
      </Link>
    </div>
  ) : (
    <>
      {/* Cart Table */}
      <div style={{ 
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 3px 12px rgba(0, 0, 0, 0.05)',
        marginBottom: '2rem'
      }}>
        <table style={{ 
          width: '100%',
          borderCollapse: 'collapse'
        }}>
          <thead>
            <tr>
              <th style={{ 
                backgroundColor: '#f8f9fa',
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '600'
              }}></th>
              <th style={{ 
                backgroundColor: '#f8f9fa',
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '600'
              }}>Course</th>
              <th style={{ 
                backgroundColor: '#f8f9fa',
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '600'
              }}>Price</th>
              <th style={{ 
                backgroundColor: '#f8f9fa',
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '600'
              }}>Reviews</th>
              <th style={{ 
                backgroundColor: '#f8f9fa',
                padding: '1rem',
                textAlign: 'left',
                fontWeight: '600'
              }}>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {cartData.items.map((item) => (
              <tr key={item.course._id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.course._id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#888',
                      fontSize: '1.2rem',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#e63946'}
                    onMouseLeave={(e) => e.target.style.color = '#888'}
                  >
                    <FaXmark />
                  </button>
                </td>
                <td style={{ 
                  padding: '2rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2rem'
                }}>
                  <img
                    src={item.course.thumbnail || "/default-course-thumbnail.jpg"}
                    alt={item.course.courseName}
                    style={{
                      width: '80px',
                      height: '80px',
                      objectFit: 'cover',
                      borderRadius: '6px'
                    }}
                  />
                  <div>
                    <h4 style={{ 
                      margin: '0 0 0.25rem 0',
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}>
                      {item.course.courseName}
                    </h4>
                    <p style={{ 
                      margin: 0,
                      color: '#666',
                      fontSize: '0.875rem'
                    }}>
                      By {item.course.instructor?.firstName || "Instructor"} {item.course.instructor?.lastName || ""}
                    </p>
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  ₹{item.course.price.toFixed(2)}
                </td>
                <td style={{ padding: '1rem' }}>
                  {/* <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    height: '100%'
                  }}>
                    <button
  type="button"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    const newQuantity = Math.max(1, item.quantity - 1);
    handleQuantityChange(item.course._id, newQuantity);
  }}
  style={{
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#333',
    fontSize: '1rem',
    transition: 'color 0.2s'
  }}
  onMouseEnter={(e) => e.target.style.color = '#e63946'}
  onMouseLeave={(e) => e.target.style.color = '#333'}
>
  <FaMinus size={12} />
</button>
       
                    
                    <span style={{ 
                      minWidth: '30px', 
                      textAlign: 'center',
                      display: 'inline-block'
                    }}>
                      {item.quantity}
                    </span>
                    
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const newQuantity = Math.min(10, item.quantity + 1);
                        await handleQuantityChange(item.course._id, newQuantity);
                      }}
                      style={{
                        background: '#f8f9fa',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        padding: '0.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#333'
                      }}
                    >
                      <FaPlus size={12} />
                    </button>
                  </div> */}
<RatingStars courseId={item.course._id} Star_Size={16} />
                </td>
                <td style={{ padding: '1rem', fontWeight: '600' }}>
                  ₹{(item.course.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* {cartData.items.length > 0 && (
        <div style={{ 
          display: 'flex',
          gap: '1rem',
          marginTop: '2rem',
          flexWrap: 'wrap'
        }}>
          <input
            type="text"
            placeholder="Coupon Code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value)}
            style={{
              padding: '0.8rem 1rem',
              border: '1px solid #ddd',
              borderRadius: '6px',
              minWidth: '200px',
              flex: '1'
            }}
          />
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleApplyCoupon();
            }}
            style={{
              backgroundColor: '#14b8a6',
              color: '#fff',
              border: 'none',
              padding: '0.8rem 1.5rem',
              borderRadius: '6px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s',
              minWidth: '150px'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#0d9b8b'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#14b8a6'}
          >
            Apply Coupon
          </button>
        </div>
      )} */}
    </>
  )}
</div>
   

      {/* Cart Totals */}
      {cartData.items.length > 0 && (
        <div className="cart-totals">
          <div className="totals-card">
            <div className="totals-header">
              <h3>Cart Totals</h3>
            </div>
            <div className="totals-row">
              <h4>Subtotal</h4>
              <span>₹{cartData.total.toFixed(2)}</span>
            </div>
            <div className="totals-shipping">
              <h4>Shipping</h4>
              <label>
                <input type="radio" name="shipping" defaultChecked /> Free
                Shipping
              </label>
              <label>
                <input type="radio" name="shipping" /> Flat Rate
              </label>
              <p>Shipping options will be updated during checkout</p>
            </div>
            <div className="totals-row total-amount">
              <h4>Total</h4>
              <span>₹{cartData.total.toFixed(2)}</span>
            </div>
          </div>
          <button className="checkout-btn" onClick={handleCheckout}>
            Proceed to Checkout
          </button>
        </div>
      )}
    </div>
  </div>
</section>


        {/* Scroll to Top */}
        <div style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          zIndex: 99,
        }}>
          <button
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              backgroundColor: "#14b8a6",
              color: "white",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
          >
            <FaArrowUpLong />
          </button>
        </div>
      </div>
    </DashboardLayout>
     </>
    
  );
};

export default CartPage;