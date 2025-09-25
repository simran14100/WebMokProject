import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout as logoutAction } from '../../store/slices/authSlice';
import { clearUser } from '../../store/slices/profileSlice';
import { setTotalItems } from '../../store/slices/cartSlice';
import { logout } from '../../services/operations/authApi';
import { fetchCourseCategories } from '../../services/operations/courseDetailsAPI';
import { getCartCount } from "../../services/operations/cartApi";


const Navbar = () => {
  const { user } = useSelector((state) => state.profile);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const categoryDropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const { token } = useSelector((state) => state.auth);
  const cartCount = useSelector((state) => state.cart.totalItems);

  // Fetch initial cart count
  useEffect(() => {
    let isMounted = true;
    
    const fetchCartCount = async () => {
      if (!token) {
        console.log('No token, setting cart count to 0');
        dispatch(setTotalItems(0));
        return;
      }
      
      try {
        console.log("Fetching cart count...");
        const response = await getCartCount();
        console.log("Cart count response:", response);
        
        if (!isMounted) return;
        
        if (response.success) {
          console.log('Setting cart count to:', response.count);
          dispatch(setTotalItems(response.count));
        } else {
          console.log('Cart count fetch failed, setting to 0. Error:', response.message);
          dispatch(setTotalItems(0));
          // If we got an error, check if we need to refresh the token
          if (response.message?.includes('jwt') || response.message?.includes('token')) {
            console.log('Token might be invalid, attempting refresh...');
            // The interceptor should handle the refresh automatically
          }
        }
      } catch (error) {
        console.error("Error fetching cart count:", error);
        if (isMounted) {
          dispatch(setTotalItems(0));
        }
      }
    };

    fetchCartCount();
    
    return () => {
      isMounted = false;
    };
  }, [token, dispatch]);

  // Listen for cart updates and auth changes
  useEffect(() => {
    let isMounted = true;
    
    const handleCartUpdate = async () => {
      if (!token) {
        if (isMounted) dispatch(setTotalItems(0));
        return;
      }
      
      try {
        console.log("Cart updated, refreshing cart count...");
        const response = await getCartCount();
        console.log("Updated cart count response:", response);
        
        if (!isMounted) return;
        
        if (response.success) {
          dispatch(setTotalItems(response.count));
        } else {
          console.error("Failed to update cart count:", response.message);
          dispatch(setTotalItems(0));
        }
      } catch (error) {
        console.error("Error updating cart count:", error);
        if (isMounted) dispatch(setTotalItems(0));
      }
    };

    // Add a small delay to ensure token is refreshed if needed
    const timer = setTimeout(handleCartUpdate, 100);
    
    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      isMounted = false;
      clearTimeout(timer);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [token]);

  // Debug cart count changes
  useEffect(() => {
    console.log("Current cart count:", cartCount);
  }, [cartCount]);

  // Fetch categories on component mount
  useEffect(() => {
    const getCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const categoriesData = await fetchCourseCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    getCategories();
  }, []);

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY >= 110);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Detect mobile viewport for responsive behaviors
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle click outside dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    };

    if (isCategoryDropdownOpen || isProfileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoryDropdownOpen, isProfileDropdownOpen]);

  const handleLogout = () => {
    dispatch(logout(navigate));
  };

  const hide =
  location.pathname === "/admin/login" ||
  (location.pathname === "/login" && params.get("admin") === "1");
if (hide) {
  return null;
}
  
  return (
    <>
      {/* Top Bar - Hidden on mobile */}
      <div className="top-bar" style={{ position: 'fixed', top: '0', left: 0, right: 0, zIndex: 30010, display: isSticky || isMobile ? 'none' : 'block', transition: 'opacity 0.3s ease' }}>
        <div className="container">
          <div className="top-bar-inner">
            <div className="top-bar-left">
              <ul className="top-bar-list">
                <li><i className="fa-regular fa-phone"></i><a href="tel:256214203215">256 214 203 215</a></li>
                <li><i className="fa-regular fa-location-dot"></i><span>258 Helano Street, New York</span></li>
                <li><i className="fa-regular fa-clock"></i><span>Mon - Sat: 8:00 - 15:00</span></li>
              </ul>
            </div>
            <div className="top-bar-right">
              <div className="top-social-wrap">
                <span>Follow Us</span>
                <ul className="social-list">
                  <li><a href="#"><i className="fab fa-facebook-f"></i></a></li>
                  <li><a href="#"><i className="fab fa-instagram"></i></a></li>
                  <li><a href="#"><i className="fab fa-behance"></i></a></li>
                  <li><a href="#"><i className="fab fa-skype"></i></a></li>
                  <li><a href="#"><i className="fab fa-youtube"></i></a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Header - Modified for centered navigation and right-side auth buttons */}
      <header className={`header header-2 ${isSticky ? 'sticky-active' : ''}`} style={{ position: 'fixed', top: (isSticky || isMobile) ? '0' : '40px', left: 0, right: 0, zIndex: 30000, background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', transition: 'top 0.3s ease' }}>
        <div className="primary-header">
          <div className="container">
            <div className="primary-header-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Logo on the left */}
              <div className="header-logo d-lg-block" style={{ flex: '0 0 auto' }}>
                <Link to="/">
                  <img src="/assets/img/logo/logo-1.png" alt="Logo" />
                </Link>
              </div>

              {/* Centered Navigation Menu */}
              <div className="header-menu-wrap" style={{ flex: '1', display: 'flex', justifyContent: 'center' }}>
                  <div className="mobile-menu-items">
                  <ul className="sub-menu" style={{ display: 'flex', gap: '2rem', margin: 0, padding: 0, listStyle: 'none' }}>
                      <li className="nav-item active">
                                             <Link to="/" style={{ 
                         textDecoration: 'none', 
                         color: '#191A1F', 
                         fontWeight: '600',
                         fontSize: '18px',
                         fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important',
                         letterSpacing: '0.5px',
                         transition: 'all 0.3s ease',
                         position: 'relative',
                         padding: '8px 0',
                         textTransform:'none'
                       }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#07A698';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = '#191A1F';
                        e.target.style.transform = 'translateY(0)';
                      }}>
                        Home
                      </Link>
                      </li>
                                                                                                                 <li className="category-dropdown" ref={categoryDropdownRef} style={{position: 'relative'}}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                        <a href="javascript:void(0)" 
                           onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                           style={{ 
                             textDecoration: 'none', 
                             color: '#191A1F', 
                             fontWeight: '600',
                             fontSize: '18px',
                             fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important',
                             letterSpacing: '0.5px',
                             transition: 'all 0.3s ease',
                             position: 'relative',
                             padding: '8px 0',
                              textTransform:'none'
                           }}
                           onMouseEnter={(e) => {
                             e.target.style.color = '#07A698';
                             e.target.style.transform = 'translateY(-1px)';
                           }}
                           onMouseLeave={(e) => {
                             e.target.style.color = '#191A1F';
                             e.target.style.transform = 'translateY(0)';
                           }}>
                              Category
                            </a>
                            <button 
                              className={`chevron-icon ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} 
                              style={{
                                background: 'none',
                                border: 'none',
                                fontSize: '12px',
                                color: '#333',
                                cursor: 'pointer',
                                padding: '0',
                                margin: '0',
                                display: 'inline-block',
                                transition: 'transform 0.3s ease'
                              }}
                              onClick={() => {
                                console.log('Chevron clicked! Current state:', isCategoryDropdownOpen);
                                setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                              }}
                            >
                              ▼
                            </button>
                          </div>
                          
                                                     {isCategoryDropdownOpen && (
                             <div style={{
                               position: 'absolute',
                               top: '100%',
                               left: '0',
                               background: '#fff',
                               border: '1px solid #e0e0e0',
                               borderRadius: '8px',
                               boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                               minWidth: '220px',
                               zIndex: 9999,
                               marginTop: '10px',
                               padding: '8px 0',
                               listStyle: 'none',
                               maxHeight: '300px',
                               overflowY: 'auto',
                               WebkitOverflowScrolling: 'touch'
                             }}>
                               {isLoadingCategories ? (
                                 <div style={{
                                   padding: '12px 20px',
                                   color: '#666',
                                   fontSize: '14px',
                                   fontStyle: 'italic'
                                 }}>
                                   Loading categories...
                                 </div>
                               ) : categories.length > 0 ? (
                                 categories.map((category) => (
                                   <div key={category._id} style={{
                                     borderBottom: '1px solid #f5f5f5',
                                     transition: 'all 0.3s ease'
                                   }}>
                                     <Link 
                                       to={`/category/${category._id}`}
                                       onClick={() => setIsCategoryDropdownOpen(false)}
                                       style={{
                                         color: '#333',
                                         textDecoration: 'none',
                                         display: 'block',
                                         padding: '12px 20px',
                                         fontSize: '14px',
                                         fontWeight: '500',
                                         transition: 'all 0.3s ease',
                                         ':hover': {
                                           backgroundColor: '#f8f9fa',
                                      color: '#07A698'
                                    },
                                     textTransform:'none',
                                     marginLeft:'10px'
                                       }}
                                       onMouseEnter={(e) => {
                                         e.target.style.backgroundColor = '#f8f9fa';
                                    e.target.style.color = '#07A698';
                                       }}
                                       onMouseLeave={(e) => {
                                         e.target.style.backgroundColor = 'transparent';
                                         e.target.style.color = '#333';
                                       }}
                                     >
                                       {category.name}
                                     </Link>
                                   </div>
                                 ))
                               ) : (
                                 <div style={{
                                   padding: '12px 20px',
                                   color: '#666',
                                   fontSize: '14px',
                                   fontStyle: 'italic'
                                 }}>
                                   No categories available
                                 </div>
                               )}
                             </div>
                           )}
                        </li>
                    <li>
                      <Link to="/about" style={{ 
                        textDecoration: 'none', 
                        color: '#191A1F', 
                        fontWeight: '600',
                        fontSize: '18px',
                        fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important',
                        letterSpacing: '0.5px',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        padding: '8px 0',
                         textTransform:'none'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#07A698';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = '#191A1F';
                        e.target.style.transform = 'translateY(0)';
                      }}>
                        About
                      </Link>
                    </li>
                    <li>
                      <Link to="/contact" style={{ 
                        textDecoration: 'none', 
                        color: '#191A1F', 
                        fontWeight: '600',
                        fontSize: '18px',
                        fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important',
                        letterSpacing: '0.5px',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        padding: '8px 0',
                         textTransform:'none'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#07A698';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = '#191A1F';
                        e.target.style.transform = 'translateY(0)';
                      }}>
                       Contact
                      </Link>
                    </li>
                    <li>
                      <Link to="/university" style={{ 
                        textDecoration: 'none', 
                        color: '#191A1F', 
                        fontWeight: '600',
                        fontSize: '18px',
                        fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important',
                        letterSpacing: '0.5px',
                        transition: 'all 0.3s ease',
                        position: 'relative',
                        padding: '8px 0',
                        textTransform:'none'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#07A698';
                        e.target.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = '#191A1F';
                        e.target.style.transform = 'translateY(0)';
                      }}>
                       University
                      </Link>
                    </li>
                   
                     {/* <li>
                      <Link
                        to="/enrollment-payment"
                        style={{
                          textDecoration: 'none',
                          color: '#191A1F',
                          fontWeight: '600',
                          fontSize: '18px',
                          fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important',
                          letterSpacing: '0.5px',
                          transition: 'all 0.3s ease',
                          position: 'relative',
                          padding: '8px 0',
                          textTransform: 'none'
                        }}
                        onMouseEnter={e => {
                          e.target.style.color = '#07A698';
                          e.target.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={e => {
                          e.target.style.color = '#191A1F';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        {user?.enrollmentFeePaid ? 'Enrollment Fee Paid' : 'Enrollment fee'}
                      </Link>
                    </li> */}
                    </ul>
                  </div>
                </div>

              {/* Right side - Auth buttons and other elements */}
              <div className="header-right" style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {user ? (
                  <>
                    <div className="header-right-icon shop-btn">
                      <Link to="/dashboard/cart">
                        <i className="fa-solid fa-shopping-cart"></i>
                      </Link>
                      <span className="number">{cartCount}</span>
                    </div>
                    
                    {/* Profile Dropdown */}
                    <div ref={profileDropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
                      <div 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '10px',
                          padding: '8px 16px',
                          borderRadius: '25px',
                          border: '2px solid #e0e0e0',
                          backgroundColor: '#f8f9fa',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          minWidth: '180px'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.borderColor = '#07A698';
                          e.target.style.backgroundColor = '#ffffff';
                          e.target.style.boxShadow = '0 4px 12px rgba(7, 166, 152, 0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.borderColor = '#e0e0e0';
                          e.target.style.backgroundColor = '#f8f9fa';
                          e.target.style.boxShadow = 'none';
                        }}
                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                      >
                        <img 
                          src={user.image || `https://api.dicebear.com/5.x/initials/svg?seed=${user.firstName} ${user.lastName}`} 
                          alt="Profile" 
                          style={{ 
                            width: '32px', 
                            height: '32px', 
                            borderRadius: '50%',
                            objectFit: 'cover'
                          }} 
                        />
                        <div style={{ flex: 1, textAlign: 'left' }}>
                          <div style={{ 
                            fontSize: '14px', 
                            fontWeight: '600', 
                            color: '#191A1F',
                            lineHeight: '1.2'
                          }}>
                            {user.firstName} {user.lastName}
                          </div>
                          <div style={{ 
                            fontSize: '12px', 
                            color: '#666',
                            textTransform: 'capitalize'
                          }}>
                            {user.accountType}
                          </div>
                        </div>
                        <i 
                          className={`fa-solid fa-chevron-down ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                          style={{ 
                            fontSize: '12px', 
                            color: '#666',
                            transition: 'transform 0.3s ease'
                          }}
                        />
                      </div>
                      
                      {/* Profile Dropdown Menu */}
                      {isProfileDropdownOpen && (
                        <div style={isMobile ? {
                          position: 'fixed',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          background: '#fff',
                          border: '1px solid #e0e0e0',
                          borderRadius: '12px',
                          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                          width: 'min(90vw, 220px)',
                          zIndex: 2001,
                          padding: '8px 0',
                          listStyle: 'none',
                          maxHeight: '80vh',
                          overflowY: 'auto',
                        } : {
                          position: 'absolute',
                          top: '100%',
                          right: '0',
                          background: '#fff',
                          border: '1px solid #e0e0e0',
                          borderRadius: '12px',
                          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
                          minWidth: '220px',
                          zIndex: 1000,
                          marginTop: '8px',
                          padding: '8px 0',
                          listStyle: 'none'
                        }}>
                          <div style={{
                            padding: '12px 16px',
                            borderBottom: '1px solid #f0f0f0',
                            marginBottom: '4px'
                          }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: '#191A1F' }}>
                              {user.firstName} {user.lastName}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                              {user.email}
                            </div>
                          </div>
                          
                          <Link 
                            to="/dashboard/my-profile"
                            style={{
                              display: 'block',
                              padding: '10px 16px',
                              color: '#191A1F',
                              textDecoration: 'none',
                              fontSize: '14px',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#f8f9fa';
                              e.target.style.color = '#07A698';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'transparent';
                              e.target.style.color = '#191A1F';
                            }}
                            onClick={() => setIsProfileDropdownOpen(false)}
                          >
                            <i className="fa-solid fa-user" style={{ marginRight: '8px', width: '16px' }}></i>
                            My Profile
                          </Link>

                          {/* {(user.accountType === 'Instructor' || user.accountType === 'Admin') && (
                            <Link 
                              to="/admin/my-courses"
                              style={{
                                display: 'block',
                                padding: '10px 16px',
                                color: '#191A1F',
                                textDecoration: 'none',
                                fontSize: '14px',
                                transition: 'all 0.3s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#f8f9fa';
                                e.target.style.color = '#07A698';
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.backgroundColor = 'transparent';
                                e.target.style.color = '#191A1F';
                              }}
                              onClick={() => setIsProfileDropdownOpen(false)}
                            >
                              <i className="fa-solid fa-book-open" style={{ marginRight: '8px', width: '16px' }}></i>
                              My Courses
                            </Link>
                          )}
                           */}
                          {user.accountType === 'Student' && user?.createdByAdmin && (
                            <>
                              <Link 
                                to="/dashboard/my-courses"
                                style={{
                                  display: 'block',
                                  padding: '10px 16px',
                                  color: '#191A1F',
                                  textDecoration: 'none',
                                  fontSize: '14px',
                                  transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = '#f8f9fa';
                                  e.target.style.color = '#07A698';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = 'transparent';
                                  e.target.style.color = '#191A1F';
                                }}
                                onClick={() => setIsProfileDropdownOpen(false)}
                              >
                                <i className="fa-solid fa-graduation-cap" style={{ marginRight: '8px', width: '16px' }}></i>
                                My Courses
                              </Link>
                              <Link 
                                to="/enrollment-payment"
                                style={{
                                  display: 'block',
                                  padding: '10px 16px',
                                  color: '#191A1F',
                                  textDecoration: 'none',
                                  fontSize: '14px',
                                  transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={e => {
                                  e.target.style.backgroundColor = '#f8f9fa';
                                  e.target.style.color = '#07A698';
                                }}
                                onMouseLeave={e => {
                                  e.target.style.backgroundColor = 'transparent';
                                  e.target.style.color = '#191A1F';
                                }}
                                onClick={() => setIsProfileDropdownOpen(false)}
                              >
                                <i className="fa-solid fa-credit-card" style={{ marginRight: '8px', width: '16px' }}></i>
                                Enrollment Payment
                              </Link>
                            </>
                          )}
                          
                          {(user.accountType === 'Admin' || user.accountType === 'SuperAdmin') && (
                            <>
                              {user.accountType === 'SuperAdmin' && (
                                <Link 
                                  to="/university-dashboard"
                                  style={{
                                    display: 'block',
                                    padding: '10px 16px',
                                    color: '#191A1F',
                                    textDecoration: 'none',
                                    fontSize: '14px',
                                    transition: 'all 0.3s ease'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.target.style.backgroundColor = '#f8f9fa';
                                    e.target.style.color = '#07A698';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.backgroundColor = 'transparent';
                                    e.target.style.color = '#191A1F';
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    setIsProfileDropdownOpen(false);
                                    window.location.href = '/university-dashboard';
                                  }}
                                >
                                  <i className="fa-solid fa-building-columns" style={{ marginRight: '8px', width: '16px' }}></i>
                                  University Dashboard
                                </Link>
                              )}
                              <Link 
                                to="/admin/dashboard"
                                style={{
                                  display: 'block',
                                  padding: '10px 16px',
                                  color: '#191A1F',
                                  textDecoration: 'none',
                                  fontSize: '14px',
                                  transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = '#f8f9fa';
                                  e.target.style.color = '#07A698';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = 'transparent';
                                  e.target.style.color = '#191A1F';
                                }}
                                onClick={() => setIsProfileDropdownOpen(false)}
                              >
                                <i className="fa-solid fa-chalkboard-teacher" style={{ marginRight: '8px', width: '16px' }}></i>
                                Admin Dashboard
                              </Link>
                              {user.accountType === 'Instructor' && (
                                <>
                                  <Link 
                                    to="/admin/courses"
                                    style={{
                                      display: 'block',
                                      padding: '10px 16px',
                                      color: '#191A1F',
                                      textDecoration: 'none',
                                      fontSize: '14px',
                                      transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.backgroundColor = '#f8f9fa';
                                      e.target.style.color = '#07A698';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.backgroundColor = 'transparent';
                                      e.target.style.color = '#191A1F';
                                    }}
                                    onClick={() => setIsProfileDropdownOpen(false)}
                                  >
                                    <i className="fa-solid fa-book" style={{ marginRight: '8px', width: '16px' }}></i>
                                    Manage Courses
                                  </Link>
                                  <Link 
                                    to="/admin/add-course"
                                    style={{
                                      display: 'block',
                                      padding: '10px 16px',
                                      color: '#191A1F',
                                      textDecoration: 'none',
                                      fontSize: '14px',
                                      transition: 'all 0.3s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.target.style.backgroundColor = '#f8f9fa';
                                      e.target.style.color = '#07A698';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.target.style.backgroundColor = 'transparent';
                                      e.target.style.color = '#191A1F';
                                    }}
                                    onClick={() => setIsProfileDropdownOpen(false)}
                                  >
                                    <i className="fa-solid fa-plus" style={{ marginRight: '8px', width: '16px' }}></i>
                                    Add Course
                                  </Link>
                                </>
                              )}
                            </>
                          )}
                          
                          {( user.accountType === 'Super Admin' || user.accountType === 'Staff') && (
                            <>
                              <Link 
                                to="/admin/users"
                                style={{
                                  display: 'block',
                                  padding: '10px 16px',
                                  color: '#191A1F',
                                  textDecoration: 'none',
                                  fontSize: '14px',
                                  transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = '#f8f9fa';
                                  e.target.style.color = '#07A698';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = 'transparent';
                                  e.target.style.color = '#191A1F';
                                }}
                                onClick={() => setIsProfileDropdownOpen(false)}
                              >
                                <i className="fa-solid fa-users" style={{ marginRight: '8px', width: '16px' }}></i>
                                Manage Registered Users
                              </Link>
                              <Link 
                                to="/admin/categories"
                                style={{
                                  display: 'block',
                                  padding: '10px 16px',
                                  color: '#191A1F',
                                  textDecoration: 'none',
                                  fontSize: '14px',
                                  transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = '#f8f9fa';
                                  e.target.style.color = '#07A698';
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = 'transparent';
                                  e.target.style.color = '#191A1F';
                                }}
                                onClick={() => setIsProfileDropdownOpen(false)}
                              >
                                <i className="fa-solid fa-tags" style={{ marginRight: '8px', width: '16px' }}></i>
                                Manage Categories
                              </Link>
                            </>
                          )}
                          
                          <div style={{ borderTop: '1px solid #f0f0f0', margin: '4px 0' }}></div>
                          
                          <button 
                            onClick={() => {
                              handleLogout();
                              setIsProfileDropdownOpen(false);
                            }}
                            style={{
                              display: 'block',
                              width: '100%',
                              padding: '10px 16px',
                              color: '#dc3545',
                              textDecoration: 'none',
                              fontSize: '14px',
                              background: 'transparent',
                              border: 'none',
                              textAlign: 'left',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#f8d7da';
                              e.target.style.color = '#dc3545';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'transparent';
                              e.target.style.color = '#dc3545';
                            }}
                          >
                            <i className="fa-solid fa-sign-out-alt" style={{ marginRight: '8px', width: '16px' }}></i>
                            Sign Out
                          </button>
                        </div>
                      )}
                      {isProfileDropdownOpen && isMobile && (
                        <div onClick={() => setIsProfileDropdownOpen(false)} style={{
                          position: 'fixed',
                          inset: 0,
                          background: 'rgba(0,0,0,0.35)',
                          zIndex: 2000
                        }} />
                      )}
                    </div>
                  </>
                                 ) : (
                   <div style={{ display: 'flex', gap: '0.5rem' }}>
                     <Link 
                       to="/login" 
                       style={{ 
                         padding: '10px 20px', 
                         borderRadius: '6px', 
                         textDecoration: 'none', 
                                                     color: '#333', 
                         border: '2px solid #07A698',
                         backgroundColor: 'transparent',
                         fontSize: '14px',
                         fontWeight: '600',
                         transition: 'all 0.3s ease',
                         display: 'inline-block',
                         position: 'relative',
                         overflow: 'hidden',
                         boxShadow: '0 2px 4px rgba(7, 166, 152, 0.1)'
                       }}
                       onMouseEnter={(e) => {
                         e.target.style.backgroundColor = '#07A698';
                         e.target.style.color = '#fff';
                         e.target.style.transform = 'translateY(-2px)';
                         e.target.style.boxShadow = '0 4px 12px rgba(7, 166, 152, 0.3)';
                       }}
                       onMouseLeave={(e) => {
                         e.target.style.backgroundColor = 'transparent';
                         e.target.style.color = '#07A698';
                         e.target.style.transform = 'translateY(0)';
                         e.target.style.boxShadow = '0 2px 4px rgba(7, 166, 152, 0.1)';
                       }}
                     >
                       Sign In
                     </Link>
                     <Link 
                       to="/signup" 
                       style={{ 
                         padding: '10px 20px', 
                        
                         borderRadius: '6px', 
                         textDecoration: 'none', 
                         color: '#fff', 
                         backgroundColor: '#07A698',
                         fontSize: '14px',
                         fontWeight: '600',
                         border: '2px solid #07A698',
                         transition: 'all 0.3s ease',
                         display: 'inline-block',
                         position: 'relative',
                         overflow: 'hidden',
                         boxShadow: '0 2px 4px rgba(7, 166, 152, 0.2)'
                       }}
                       onMouseEnter={(e) => {
                         e.target.style.backgroundColor = '#059a8c';
                         e.target.style.borderColor = '#059a8c';
                         e.target.style.transform = 'translateY(-2px)';
                         e.target.style.boxShadow = '0 4px 12px rgba(7, 166, 152, 0.4)';
                       }}
                       onMouseLeave={(e) => {
                         e.target.style.backgroundColor = '#07A698';
                         e.target.style.borderColor = '#07A698';
                         e.target.style.transform = 'translateY(0)';
                         e.target.style.boxShadow = '0 2px 4px rgba(7, 166, 152, 0.2)';
                       }}
                                           >
                        Sign Up <i className="fa-solid fa-arrow-right"></i>
                  </Link>
                   </div>
                                 )}
                 
                  <div className="header-logo d-none d-lg-none">
                    <Link to="/">
                      <img src="/assets/img/logo/logo-1.png" alt="Logo" />
                    </Link>
                  </div>
                
                  <div className="header-right-item d-lg-none d-md-block">
                    <a
                      href="javascript:void(0)"
                      className="mobile-side-menu-toggle"
                      onClick={() => {
                        // Toggle dashboard sidebar when in dashboard area; otherwise open site mobile menu
                        const isDashboardArea = /(dashboard|admin|instructor)/i.test(location.pathname);
                        if (isDashboardArea) {
                          window.dispatchEvent(new CustomEvent('dashboard:toggleSidebar'));
                        } else {
                          setIsMobileMenuOpen(true);
                        }
                      }}
                    >
                      <i className="fa-sharp fa-solid fa-bars"></i>
                    </a>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search Popup Box - Exact EdCare Template */}
      <div id="popup-search-box" className={isSearchOpen ? 'show' : ''}>
        <div className="box-inner-wrap d-flex align-items-center">
          <form id="form" action="#" method="get" role="search">
            <input id="popup-search" type="text" name="s" placeholder="Type keywords here..." />
          </form>
          <div className="search-close" onClick={() => setIsSearchOpen(false)}>
            <i className="fa-sharp fa-regular fa-xmark"></i>
          </div>
        </div>
      </div>

      {/* Mobile Side Menu - Exact EdCare Template */}
      <div className={`mobile-side-menu ${isMobileMenuOpen ? 'show' : ''}`}>
        <div className="side-menu-content">
          <div className="side-menu-head">
            <Link to="/">
              <img src="/assets/img/logo/logo-1.png" alt="logo" />
            </Link>
            <button className="mobile-side-menu-close" onClick={() => setIsMobileMenuOpen(false)}>
              <i className="fa-regular fa-xmark"></i>
            </button>
          </div>
          <div className="side-menu-wrap">
            <ul className="side-menu-list">
              <li><Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link></li>
              <li><Link to="/catalog/all" onClick={() => setIsMobileMenuOpen(false)}>Courses</Link></li>
              <li><Link to="/shop" onClick={() => setIsMobileMenuOpen(false)}>Shop</Link></li>
              <li><Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>About</Link></li>
              <li><Link to="/blog" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link></li>
              <li><Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link></li>
              <li><Link to="/university" onClick={() => setIsMobileMenuOpen(false)}>University</Link></li>
              {user ? (
                <>
                  <li><Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link></li>
                  <li><button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>Logout</button></li>
                </>
              ) : (
                <>
                  <li><Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link></li>
                  <li><Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>Signup</Link></li>
                </>
              )}
            </ul>
          </div>
          <ul className="side-menu-list">
            <li><i className="fa-light fa-location-dot"></i>Address : <span>Amsterdam, 109-74</span></li>
            <li><i className="fa-light fa-phone"></i>Phone : <a href="tel:+01569896654">+01 569 896 654</a></li>
            <li><i className="fa-light fa-envelope"></i>Email : <a href="mailto:info@example.com">info@example.com</a></li>
          </ul>
        </div>
      </div>
      <div className={`mobile-side-menu-overlay ${isMobileMenuOpen ? 'show' : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>
    </>
  );
};

export default Navbar;