// import React from 'react';
// import DashboardLayout from '../components/common/DashboardLayout';

// const Cart = () => (
//   <DashboardLayout>
//     <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
//       <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#191A1F', marginBottom: '2rem' }}>Your Cart</h1>
//       {/* Add your cart content here */}
//     </div>
//   </DashboardLayout>
// );

// export default Cart; 


import React from 'react';
import { useState, useEffect } from 'react';

import DashboardLayout from '../components/common/DashboardLayout';
import { FaPhone, FaLocationDot, FaClock, FaUser, FaHeart, FaCartShopping, FaXmark, FaArrowUpLong } from 'react-icons/fa6';
import { FaFacebookF, FaInstagram, FaBehance, FaSkype, FaYoutube } from 'react-icons/fa';

import { useDispatch, useSelector } from "react-redux";
import { fetchCartDetails } from "../services/operations/cartApi";

import { toast } from "react-hot-toast";
import pageHeaderShape1 from '../assets/img/shapes/page-header-shape-1.png';
import pageHeaderShape2 from '../assets/img/shapes/page-header-shape-2.png';
import pageHeaderShape3 from '../assets/img/shapes/page-header-shape-3.png';
import pageHeaderBg from '../assets/img/bg-img/page-header-bg.png';
import { Link } from 'react-router-dom';


const CartPage = () => {


   const { token } = useSelector((state) => state.auth);
  const [cartData, setCartData] = useState({
    items: [],
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCartData = async () => {
      try {
        setLoading(true);
        const response = await fetchCartDetails(token);
        if (response.success) {
          setCartData(response.cartData);
        } else {
          toast.error(response.message);
        }
      } catch (error) {
        toast.error("Failed to load cart data");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      getCartData();
    }
  }, [token]);

  const handleQuantityChange = async (courseId, newQuantity) => {
    // Implement quantity update logic
  };

  const handleRemoveItem = async (courseId) => {
    // Implement remove item logic
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
  return (   <> 

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
        <section
          style={{
            padding: "100px 0",
            backgroundColor: "#f8f9fa",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "0 15px",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "30px",
                flexWrap: "wrap",
              }}
            >
              {/* Cart Items */}
              <div style={{ flex: "2", minWidth: "300px" }}>
                <div
                  style={{
                    backgroundColor: "#14b8a6",
                    color: "white",
                    padding: "15px",
                    borderRadius: "5px",
                    marginBottom: "30px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <p style={{ margin: 0 }}>
                    Add{" "}
                    <span style={{ fontWeight: "bold" }}>
                      ${(100 - cartData.total).toFixed(2)}
                    </span>{" "}
                    to cart and get free shipping
                  </p>
                  <div
                    style={{
                      flex: 1,
                      height: "1px",
                      backgroundColor: "rgba(255,255,255,0.3)",
                    }}
                  ></div>
                </div>

                {/* Cart Table */}
                {cartData.items.length === 0 ? (
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "5px",
                      padding: "40px",
                      textAlign: "center",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                    }}
                  >
                    <h3>Your cart is empty</h3>
                    <p>Start shopping to add items to your cart</p>
                  </div>
                ) : (
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "5px",
                      overflow: "hidden",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                    }}
                  >
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ backgroundColor: "#f8f9fa" }}>
                          <th
                            style={{
                              padding: "15px",
                              textAlign: "left",
                              width: "50px",
                            }}
                          ></th>
                          <th style={{ padding: "15px", textAlign: "center" }}>
                            Course
                          </th>
                          <th style={{ padding: "15px", textAlign: "left" }}>
                            Price
                          </th>
                          <th style={{ padding: "15px", textAlign: "left" }}>
                            Quantity
                          </th>
                          <th style={{ padding: "15px", textAlign: "left" }}>
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {cartData.items.map((item) => (
                          <tr
                            key={item.course._id}
                            style={{ borderBottom: "1px solid #e0e0e0" }}
                          >
                            <td style={{ padding: "15px", textAlign: "center" }}>
                              <button
                                onClick={() => handleRemoveItem(item.course._id)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  cursor: "pointer",
                                  color: "#666",
                                }}
                              >
                                <FaXmark />
                              </button>
                            </td>
                            <td
                              style={{
                                padding: "15px",
                                display: "flex",
                                alignItems: "center",
                                gap: "15px",
                              }}
                            >
                              <img
                                src={
                                  item.course.thumbnail ||
                                  "/default-course-thumbnail.jpg"
                                }
                                alt={item.course.courseName}
                                style={{
                                  width: "80px",
                                  height: "80px",
                                  objectFit: "cover",
                                  borderRadius: "5px",
                                }}
                              />
                              <div>
                                <h4 style={{ margin: 0 }}>
                                  {item.course.courseName}
                                </h4>
                                <p style={{ margin: 0, color: "#666" }}>
                                  By {item.course.instructor.firstName}{" "}
                                  {item.course.instructor.lastName}
                                </p>
                              </div>
                            </td>
                            <td style={{ padding: "15px" }}>
                              ${item.course.price.toFixed(2)}
                            </td>
                            <td style={{ padding: "15px" }}>
                              <div style={{ display: "flex", alignItems: "center" }}>
                                <input
                                  type="number"
                                  min="1"
                                  max="10"
                                  value={item.quantity}
                                  onChange={(e) =>
                                    handleQuantityChange(
                                      item.course._id,
                                      parseInt(e.target.value)
                                    )
                                  }
                                  style={{
                                    width: "60px",
                                    padding: "8px",
                                    border: "1px solid #e0e0e0",
                                    borderRadius: "5px",
                                    textAlign: "center",
                                  }}
                                />
                              </div>
                            </td>
                            <td style={{ padding: "15px" }}>
                              ${(item.course.price * item.quantity).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Cart Buttons */}
                {cartData.items.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "30px",
                      flexWrap: "wrap",
                      gap: "15px",
                    }}
                  >
                    <div
                      style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}
                    >
                      <input
                        type="text"
                        placeholder="Coupon Code"
                        style={{
                          padding: "12px 15px",
                          border: "1px solid #e0e0e0",
                          borderRadius: "5px",
                          minWidth: "200px",
                        }}
                      />
                      <button
                        style={{
                          backgroundColor: "#14b8a6",
                          color: "white",
                          border: "none",
                          padding: "12px 25px",
                          borderRadius: "5px",
                          fontWeight: "600",
                          cursor: "pointer",
                        }}
                      >
                        Apply Coupon
                      </button>
                    </div>
                    <button
                      style={{
                        backgroundColor: "#14b8a6",
                        color: "white",
                        border: "none",
                        padding: "12px 25px",
                        borderRadius: "5px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Update Cart
                    </button>
                  </div>
                )}
              </div>

              {/* Cart Totals - Only show if there are items */}
              {cartData.items.length > 0 && (
                <div style={{ flex: "1", minWidth: "300px" }}>
                  <div
                    style={{
                      backgroundColor: "white",
                      borderRadius: "5px",
                      overflow: "hidden",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div
                      style={{
                        padding: "20px",
                        borderBottom: "1px solid #e0e0e0",
                      }}
                    >
                      <h3 style={{ margin: 0 }}>Cart Totals</h3>
                    </div>
                    <div
                      style={{
                        padding: "20px",
                        borderBottom: "1px solid #e0e0e0",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <h4 style={{ margin: 0 }}>Subtotal</h4>
                      <span>${cartData.total.toFixed(2)}</span>
                    </div>
                    <div
                      style={{
                        padding: "20px",
                        borderBottom: "1px solid #e0e0e0",
                      }}
                    >
                      <h4 style={{ margin: "0 0 15px 0" }}>Shipping</h4>
                      <div style={{ marginBottom: "15px" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            marginBottom: "10px",
                          }}
                        >
                          <input
                            type="radio"
                            id="flat_rate"
                            name="shipping"
                            defaultChecked
                          />
                          <label htmlFor="flat_rate">Free Shipping</label>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            marginBottom: "10px",
                          }}
                        >
                          <input
                            type="radio"
                            id="local_pickup"
                            name="shipping"
                          />
                          <label htmlFor="local_pickup">Flat Rate</label>
                        </div>
                      </div>
                      <p
                        style={{
                          margin: "0 0 10px 0",
                          fontSize: "14px",
                          color: "#666",
                        }}
                      >
                        Shipping options will be updated during checkout
                      </p>
                    </div>
                    <div
                      style={{
                        padding: "20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <h4 style={{ margin: 0 }}>Total</h4>
                      <span style={{ fontSize: "18px", fontWeight: "bold" }}>
                        ${cartData.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    style={{
                      width: "100%",
                      backgroundColor: "#14b8a6",
                      color: "white",
                      border: "none",
                      padding: "15px",
                      borderRadius: "5px",
                      fontWeight: "600",
                      cursor: "pointer",
                      marginTop: "20px",
                      fontSize: "16px",
                    }}
                  >
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Scroll to Top */}
        <div
          style={{
            position: "fixed",
            bottom: "30px",
            right: "30px",
            zIndex: 99,
          }}
        >
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



     <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      </DashboardLayout>
  
    </>

    
  );
};

export default CartPage;