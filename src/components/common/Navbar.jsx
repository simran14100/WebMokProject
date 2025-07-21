import React, { useEffect, useState } from 'react';
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
    const needsEnrollmentPayment = user?.accountType === ACCOUNT_TYPE.STUDENT && !user?.enrollmentFeePaid;

    const fetchSublinks = async () => {
        try {
            setLoading(true);
            const result = await apiConnector("GET", categories.CATEGORIES_API);
            if (result && result.data) {
                setSubLinks(result.data || []);
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
                <ul style={{ display: 'flex', gap: 24, alignItems: 'center', margin: 0, padding: 0, listStyle: 'none' }}>
                    {NavbarLinks.map((link, i) => (
                        <li key={i}>
                            <Link to={link.path} style={{
                                color: matchRoute(link.path) ? LIGHT_GREEN : TEXT_DARK,
                                fontWeight: 500,
                                fontSize: 16,
                                textDecoration: 'none',
                                padding: '0.25em 0.5em',
                                borderRadius: 4,
                                transition: 'color 0.2s',
                            }}>{link.title}</Link>
                        </li>
                    ))}
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
