import React, { useEffect, useRef, useState } from 'react';
import { Link, matchPath } from 'react-router-dom';
import { NavbarLinks } from "../../data/navbar-links";
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileDropDown from "../core/Auth/ProfileDropDown";
import { AiOutlineShoppingCart, AiOutlineMenu } from "react-icons/ai";
import { apiConnector } from '../../services/apiConnector';
import { categories } from '../../services/apis';
import { BsChevronDown } from "react-icons/bs";
import { ACCOUNT_TYPE } from "../../utils/constants";
import { debugLocalStorage } from "../../utils/localStorage";

const LIGHT_GREEN = "#009e5c";
const TEXT_DARK = "#222";
const BORDER = "#e0e0e0";

const Navbar = () => {
    const { token } = useSelector((state) => state.auth);
    const { user } = useSelector((state) => state.profile);
    const { totalItems } = useSelector((state) => state.cart)
    const location = useLocation();
    const [loading, setLoading] = useState(false)
    const [subLinks, setSubLinks] = useState([]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);
    const categoryDropdownRef = useRef(null);
    const needsEnrollmentPayment = user?.accountType === ACCOUNT_TYPE.STUDENT && !user?.enrollmentFeePaid;

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
                setIsCatalogOpen(false);
            }
        }
        if (isCatalogOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isCatalogOpen]);

    const fetchSublinks = async () => {
        try {
            setLoading(true);
            const result = await apiConnector("GET", categories.CATEGORIES_API);
            if (result && Array.isArray(result.data?.data)) {
                setSubLinks(result.data.data);
            } else {
                setSubLinks([]);
            }
        } catch (error) {
            setSubLinks([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchSublinks();
    }, [])

    const matchRoute = (route) => {
        return matchPath({ path: route }, location.pathname);
    }

    return (
        <div style={{ background: '#fff', borderBottom: `1px solid ${BORDER}`, padding: '1em 0', position: 'sticky', top: 0, zIndex: 50 }}>
            <nav style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontWeight: 700, color: LIGHT_GREEN, fontSize: 24 }}>WebMok</div>
                <ul className="flex gap-6 items-center m-0 p-0 list-none">
                    {NavbarLinks.map((link, i) => (
                        <li key={i}>
                            <Link to={link.path} className={`${matchRoute(link.path) ? 'text-green-600' : 'text-gray-900'} font-medium text-base no-underline px-2 py-1 rounded transition-colors duration-200`}>{link.title}</Link>
                        </li>
                    ))}
                    {/* Category Dropdown */}
                    <li
                        className="relative"
                        ref={categoryDropdownRef}
                        // Removed onMouseEnter and onMouseLeave for click-only behavior
                    >
                        <button
                            className={`flex items-center font-medium text-base px-2 py-1 rounded transition-colors duration-200 focus:outline-none border border-transparent hover:border-green-500 hover:bg-green-50 ${isCatalogOpen ? 'text-green-700 bg-green-100 border-green-500' : 'text-gray-900'}`}
                            type="button"
                            onClick={() => setIsCatalogOpen((open) => !open)}
                        >
                            Category <BsChevronDown className={`ml-1 transition-transform duration-200 ${isCatalogOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isCatalogOpen && (
                            <ul className="absolute left-0 top-full bg-white border border-gray-200 shadow-xl rounded-lg min-w-[200px] z-50 py-2 mt-2 animate-fade-in">
                                {loading && <li className="px-4 py-2 text-gray-500">Loading...</li>}
                                {!loading && subLinks.length === 0 && <li className="px-4 py-2 text-gray-500">No categories</li>}
                                {!loading && subLinks.map((cat) => (
                                    <li key={cat._id}>
                                        <Link
                                            to={`/catalog/${encodeURIComponent(cat.name)}`}
                                            className="block px-4 py-2 text-gray-900 hover:bg-green-100 hover:text-green-700 transition-colors duration-150 no-underline border-b border-gray-100 last:border-b-0"
                                            onClick={() => setIsCatalogOpen(false)}
                                        >
                                            {cat.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </li>
                </ul>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {needsEnrollmentPayment && (
                        <Link to="/enrollment-payment" style={{
                            display: 'flex', alignItems: 'center', background: LIGHT_GREEN, color: '#fff', borderRadius: 6, padding: '0.5em 1em', fontWeight: 600, textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,158,92,0.08)', marginRight: 16
                        }}>
                            <span role="img" aria-label="money">💰</span>
                            <span style={{ marginLeft: 8 }}>Pay Enrollment Fee (₹1000)</span>
                        </Link>
                    )}
                    {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
                        <Link to="/dashboard/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center', color: TEXT_DARK, textDecoration: 'none' }}>
                            <AiOutlineShoppingCart style={{ fontSize: 24 }} />
                            {totalItems > 0 && (
                                <span style={{ position: 'absolute', top: -8, right: -8, background: LIGHT_GREEN, color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{totalItems}</span>
                            )}
                        </Link>
                    )}
                    {token === null && (
                        <Link to="/login" style={{ background: LIGHT_GREEN, color: '#fff', borderRadius: 6, padding: '0.5em 1em', fontWeight: 600, textDecoration: 'none', marginRight: 8 }}>Log in</Link>
                    )}
                    {token === null && (
                        <Link to="/signup" style={{ background: '#e6fcf5', color: LIGHT_GREEN, borderRadius: 6, padding: '0.5em 1em', fontWeight: 600, textDecoration: 'none', border: `1px solid ${LIGHT_GREEN}` }}>Sign up</Link>
                    )}
                    {token !== null && <ProfileDropDown />}
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
