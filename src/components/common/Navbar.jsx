import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { clearCart } from '../../store/slices/cartSlice';
import { fetchCourseCategories } from '../../services/operations/courseDetailsAPI';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const categoryDropdownRef = useRef(null);

  // Fetch categories on component mount
  useEffect(() => {
    const getCategories = async () => {
      setIsLoadingCategories(true);
      try {
        console.log("Fetching categories...");
        const categoriesData = await fetchCourseCategories();
        console.log("Categories fetched:", categoriesData);
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

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
    };

    if (isCategoryDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoryDropdownOpen]);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
  };

  return (
    <>
      {/* Top Bar - Exact EdCare Template */}
      <div className="top-bar">
        <div className="container">
          <div className="top-bar-inner">
            <div className="top-bar-left">
              <ul className="top-bar-list">
                <li><i className="fa-regular fa-phone"></i><a href="tel:256214203215">256 214 203 215</a></li>
                <li><i className="fa-regular fa-location-dot"></i><span>258 Helano Street, New York</span></li>
                <li><i className="fa-regular fa-clock"></i><span>Mon - Sat: 8:00 - 15:00</span></li>
              </ul>
            </div>
                         <div className="top-bar-right" style={{ justifyContent: 'flex-start', gap: '30px' }}>
               <div className="register-box">
                 {user ? (
                   <Link to="/dashboard">Dashboard</Link>
                 ) : null}
               </div>
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

      {/* Primary Header - Exact EdCare Template */}
      <header className={`header header-2 ${isSticky ? 'sticky-active' : ''}`}>
        <div className="primary-header">
          <div className="container">
            <div className="primary-header-inner">
              <div className="header-logo d-lg-block">
                <Link to="/">
                  <img src="/assets/img/logo/logo-1.png" alt="Logo" />
                </Link>
              </div>
              <div className="header-right-wrap">
                <div className="header-menu-wrap">
                  <div className="mobile-menu-items">
                    <ul className="sub-menu">
                      <li className="nav-item active">
                        <Link to="/">Home</Link>
                      </li>
                                                                                                                 <li className="category-dropdown" ref={categoryDropdownRef} style={{position: 'relative'}}>
                          <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                            <a href="javascript:void(0)" onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                                                               style={{
                                  color: '#333',
                                  textDecoration: 'none',
                                  transition: 'all 0.3s ease',
                                  padding: '10px 0',
                                  display: 'block',
                                  marginRight: '2px'
                                }}
                               onMouseEnter={(e) => {
                                 e.target.style.color = '#07A698';
                               }}
                               onMouseLeave={(e) => {
                                 e.target.style.color = '#333';
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
                               listStyle: 'none'
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
                                       to={`/catalog/${category._id}`}
                                       onClick={() => setIsCategoryDropdownOpen(false)}
                                       style={{
                                         color: '#333',
                                         textDecoration: 'none',
                                         display: 'block',
                                         padding: '12px 20px',
                                         fontSize: '14px',
                                         fontWeight: '500',
                                         marginLeft:'10px',
                                         transition: 'all 0.3s ease',
                                         ':hover': {
                                           backgroundColor: '#f8f9fa',
                                           color: '#007bff'
                                         }
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
                      
                     
                      <li><Link to="/about">About</Link></li>
                      <li><Link to="/contact">Contact</Link></li>
                      {user && (
                        <li className="dashboard-dropdown">
                          <a href="#">Dashboard</a>
                          <ul className="dashboard-menu">
                            {user.accountType === 'Student' && (
                              <>
                                <li><Link to="/dashboard/my-courses">My Courses</Link></li>
                                <li><Link to="/enrollment-payment">Enrollment Payment</Link></li>
                              </>
                            )}
                            {user.accountType === 'Instructor' && (
                              <>
                                <li><Link to="/instructor/dashboard">Instructor Dashboard</Link></li>
                                <li><Link to="/instructor/my-courses">My Courses</Link></li>
                                <li><Link to="/instructor/add-course">Create Course</Link></li>
                              </>
                            )}
                            {(user.accountType === 'Admin' || user.accountType === 'Super Admin' || user.accountType === 'Staff') && (
                              <>
                                <li><Link to="/admin/dashboard">Admin Dashboard</Link></li>
                                <li><Link to="/admin/users">Manage Users</Link></li>
                                <li><Link to="/admin/categories">Manage Categories</Link></li>
                              </>
                            )}
                          </ul>
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
                {/* /.header-menu-wrap */}
                                 <div className="header-right">
                   {user && (
                     <div className="header-right-icon shop-btn">
                       <Link to="/cart">
                         <i className="fa-regular fa-cart-shopping"></i>
                       </Link>
                       <span className="number">{cart?.length || 0}</span>
                     </div>
                   )}
                  <div className="header-logo d-none d-lg-none">
                    <Link to="/">
                      <img src="/assets/img/logo/logo-1.png" alt="Logo" />
                    </Link>
                  </div>
                  <div className="header-right-item d-lg-none d-md-block">
                    <a href="javascript:void(0)" className="mobile-side-menu-toggle" onClick={() => setIsMobileMenuOpen(true)}>
                      <i className="fa-sharp fa-solid fa-bars"></i>
                    </a>
                  </div>
                </div>
                {/* /.header-right */}
              </div>
            </div>
            {/* /.primary-header-inner */}
          </div>
        </div>
      </header>
      {/* /.Main Header */}

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
      {/* /#popup-search-box */}

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
                             {user ? (
                 <>
                   <li><Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link></li>
                   <li><button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>Logout</button></li>
                 </>
               ) : null}
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
      {/* /.mobile-side-menu */}
    </>
  );
};

export default Navbar;
