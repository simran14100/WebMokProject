import React, { useEffect, useState } from 'react'
import { Link, matchPath } from 'react-router-dom'
import { NavbarLinks } from "../../data/navbar-links"
import { useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { AiOutlineShoppingCart, AiOutlineMenu } from "react-icons/ai"
import ProfileDropDown from "../core/Auth/ProfileDropDown"
import { apiConnector } from '../../services/apiConnector'
import { categories } from '../../services/apis'
import { BsChevronDown } from "react-icons/bs"
import { ACCOUNT_TYPE } from "../../utils/constants"

const Navbar = () => {
    console.log("Printing base url: ", process.env.REACT_APP_BASE_URL);
    const { token } = useSelector((state) => state.auth);
    const { user } = useSelector((state) => state.profile);
    const { totalItems } = useSelector((state) => state.cart)
    const location = useLocation();

    const [loading, setLoading] = useState(false)
    const [subLinks, setSubLinks] = useState([]);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCatalogOpen, setIsCatalogOpen] = useState(false);

    // Check if user needs to pay enrollment fee
    const needsEnrollmentPayment = user?.accountType === ACCOUNT_TYPE.STUDENT && !user?.enrollmentFeePaid;

    const fetchSublinks = async () => {
        try {
            setLoading(true);
            console.log("Fetching categories from:", `${process.env.REACT_APP_BASE_URL}/api/v1/course/showAllCategories`);
            const result = await apiConnector("GET", categories.CATEGORIES_API);
            console.log("Printing Sublinks result:", result);
            if (result && result.data) {
                setSubLinks(result.data || []);
            } else {
                console.log("No data in response");
                setSubLinks([]);
            }
        } catch (error) {
            console.log("Could not fetch the category list:", error);
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

    // Function to get role-based navigation links
    const getRoleBasedLinks = () => {
        // Ensure NavbarLinks exists, otherwise return default links
        const defaultLinks = [
            { title: "Home", path: "/" },
            { title: "Catalog", path: "/catalog" },
            { title: "About", path: "/about" },
            { title: "Contact", path: "/contact" },
        ];

        const baseLinks = NavbarLinks || defaultLinks;

        if (!user) return baseLinks;

        const roleBasedLinks = [...baseLinks];

        // Add admin dashboard link for admin roles
        if ([ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.SUPER_ADMIN, ACCOUNT_TYPE.STAFF].includes(user.accountType)) {
            roleBasedLinks.push({
                title: "Admin Dashboard",
                path: "/admin/dashboard"
            });
        }

        // Add instructor dashboard link for approved instructors
        if (user.accountType === ACCOUNT_TYPE.INSTRUCTOR && user.approved) {
            roleBasedLinks.push({
                title: "Instructor Dashboard",
                path: "/instructor/dashboard"
            });
        }

        return roleBasedLinks;
    }

    const navbarLinks = getRoleBasedLinks() || [];

    return (
        <div className='flex h-16 items-center justify-center border-b-[1px] border-b-richblack-700 bg-richblack-900 shadow-lg backdrop-blur-sm'>
            <div className='flex w-11/12 max-w-maxContent items-center justify-between'>
                {/* Logo */}
                <Link to="/" className="group">
                    <div className="flex items-center space-x-2">
                        <div className="text-3xl font-bold bg-gradient-to-r from-yellow-25 to-yellow-100 bg-clip-text text-transparent group-hover:from-yellow-100 group-hover:to-yellow-25 transition-all duration-300">
                            StudyNotion
                        </div>
                    </div>
                </Link>

                {/* Navigation links */}
                <nav className="hidden md:block">
                    <ul className="flex gap-x-8 text-richblack-25">
                        {navbarLinks && navbarLinks.length > 0 && navbarLinks.map((link, index) => (
                            <li key={index}>
                                {link.title === "Catalog" ? (
                                    <>
                                        <div
                                            className={`group relative flex cursor-pointer items-center gap-1 transition-all duration-300 hover:text-yellow-25 ${
                                                matchRoute("/catalog/:catalogName")
                                                    ? "text-yellow-25"
                                                    : "text-richblack-25"
                                            }`}
                                        >
                                            <p className="font-medium">{link.title}</p>
                                            <BsChevronDown className="transition-transform duration-300 group-hover:rotate-180" />
                                            <div className="invisible absolute left-[50%] top-[50%] z-[1000] flex w-[250px] translate-x-[-50%] translate-y-[3em] flex-col rounded-xl bg-richblack-800 p-4 text-richblack-25 opacity-0 transition-all duration-300 group-hover:visible group-hover:translate-y-[1.65em] group-hover:opacity-100 lg:w-[300px] shadow-2xl border border-richblack-600">
                                                <div className="absolute left-[50%] top-0 -z-10 h-4 w-4 translate-x-[80%] translate-y-[-40%] rotate-45 select-none rounded bg-richblack-800 border-l border-t border-richblack-600"></div>
                                                {loading ? (
                                                    <div className="flex items-center justify-center py-4">
                                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-25"></div>
                                                    </div>
                                                ) : subLinks && subLinks.length > 0 ? (
                                                    <>
                                                        {subLinks.map((subLink, i) => (
                                                            <Link
                                                                to={`/catalog/${subLink.name
                                                                    .split(" ")
                                                                    .join("-")
                                                                    .toLowerCase()}`}
                                                                className="rounded-lg bg-transparent py-3 px-4 hover:bg-richblack-700 transition-all duration-200 hover:text-yellow-25 font-medium"
                                                                key={i}
                                                            >
                                                                <p>{subLink.name}</p>
                                                            </Link>
                                                        ))}
                                                    </>
                                                ) : (
                                                    <p className="text-center py-4 text-richblack-300">No Courses Found</p>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <Link to={link?.path} className="group">
                                        <p
                                            className={`font-medium transition-all duration-300 group-hover:text-yellow-25 ${
                                                matchRoute(link?.path)
                                                    ? "text-yellow-25"
                                                    : "text-richblack-25"
                                            }`}
                                        >
                                            {link.title}
                                        </p>
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Login / Signup / Dashboard */}
                <div className="hidden items-center gap-x-4 md:flex">
                    {/* Enrollment Fee Payment Alert for Students */}
                    {needsEnrollmentPayment && (
                        <div className="mr-4 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-2 text-sm font-semibold text-black shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                            <Link to="/enrollment-payment" className="flex items-center space-x-2">
                                <span>💰</span>
                                <span>Pay Enrollment Fee (₹1000)</span>
                            </Link>
                        </div>
                    )}

                    {/* Cart for non-instructors */}
                    {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
                        <Link to="/dashboard/cart" className="relative group">
                            <div className="p-2 rounded-lg hover:bg-richblack-700 transition-all duration-300">
                                <AiOutlineShoppingCart className="text-2xl text-richblack-100 group-hover:text-yellow-25 transition-colors duration-300" />
                                {totalItems > 0 && (
                                    <span className="absolute -top-1 -right-1 grid h-6 w-6 place-items-center overflow-hidden rounded-full bg-yellow-25 text-center text-xs font-bold text-richblack-900 shadow-lg">
                                        {totalItems}
                                    </span>
                                )}
                            </div>
                        </Link>
                    )}

                    {/* Auth Buttons */}
                    {token === null && (
                        <Link to="/login">
                            <button className="rounded-lg border border-richblack-700 bg-richblack-800 px-4 py-2 text-richblack-100 font-medium hover:bg-richblack-700 hover:border-richblack-600 transition-all duration-300 shadow-md hover:shadow-lg">
                                Log in
                            </button>
                        </Link>
                    )}
                    {token === null && (
                        <Link to="/signup">
                            <button className="rounded-lg bg-gradient-to-r from-yellow-25 to-yellow-100 px-4 py-2 text-richblack-900 font-semibold hover:from-yellow-100 hover:to-yellow-25 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105">
                                Sign up
                            </button>
                        </Link>
                    )}

                    {/* Profile Dropdown for logged in users */}
                    {token !== null && <ProfileDropDown />}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="mr-4 md:hidden p-2 rounded-lg hover:bg-richblack-700 transition-all duration-300"
                    onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                >
                    <AiOutlineMenu fontSize={24} fill="#AFB2BF" />
                </button>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="absolute top-16 left-0 z-50 w-full bg-richblack-900 px-6 py-6 shadow-2xl border-b border-richblack-700 md:hidden backdrop-blur-sm">
                        {/* Enrollment Fee Alert for Mobile */}
                        {needsEnrollmentPayment && (
                            <div className="mb-6 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-3 text-sm font-semibold text-black shadow-lg">
                                <Link 
                                    to="/enrollment-payment"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center space-x-2"
                                >
                                    <span>💰</span>
                                    <span>Pay Enrollment Fee (₹1000)</span>
                                </Link>
                            </div>
                        )}

                        {/* Nav Links */}
                        <ul className="flex flex-col gap-4 text-richblack-25 mb-6">
                            {navbarLinks && navbarLinks.length > 0 && navbarLinks.map((link, index) => (
                                <li key={index}>
                                    {link.title === "Catalog" ? (
                                        <div>
                                            <button
                                                className="flex w-full items-center justify-between text-left text-richblack-100 font-medium hover:text-yellow-25 transition-colors duration-300"
                                                onClick={() => setIsCatalogOpen((prev) => !prev)}
                                            >
                                                <span className="flex items-center gap-2">
                                                    Catalog
                                                    <BsChevronDown
                                                        className={`transition-transform duration-300 ${
                                                            isCatalogOpen ? "rotate-180" : ""
                                                        }`}
                                                    />
                                                </span>
                                            </button>

                                            {isCatalogOpen && (
                                                <div className="ml-4 mt-3 flex flex-col gap-2 border-l-2 border-richblack-700 pl-4">
                                                    {subLinks && subLinks.length > 0 && subLinks.map((subLink, i) => (
                                                        <Link
                                                            to={`/catalog/${subLink.name
                                                                .split(" ")
                                                                .join("-")
                                                                .toLowerCase()}`}
                                                            key={i}
                                                            className="rounded-lg px-3 py-2 text-sm text-richblack-100 hover:bg-richblack-700 hover:text-yellow-25 transition-all duration-300"
                                                            onClick={() => {
                                                                setIsCatalogOpen(false)
                                                                setIsMobileMenuOpen(false)
                                                            }}
                                                        >
                                                            {subLink.name}
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <Link
                                            to={link?.path}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={`block text-richblack-100 font-medium hover:text-yellow-25 transition-colors duration-300 ${
                                                matchRoute(link?.path) ? "text-yellow-25" : ""
                                            }`}
                                        >
                                            {link.title}
                                        </Link>
                                    )}
                                </li>
                            ))}
                        </ul>

                        {/* Auth Buttons / Cart / Profile for Mobile */}
                        <div className="flex flex-col gap-3">
                            {user && user?.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
                                <Link
                                    to="/dashboard/cart"
                                    className="relative w-fit p-2 rounded-lg hover:bg-richblack-700 transition-all duration-300"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <AiOutlineShoppingCart className="text-2xl text-richblack-100" />
                                    {totalItems > 0 && (
                                        <span className="absolute -top-1 -right-1 grid h-6 w-6 place-items-center overflow-hidden rounded-full bg-yellow-25 text-center text-xs font-bold text-richblack-900">
                                            {totalItems}
                                        </span>
                                    )}
                                </Link>
                            )}

                            {token === null && (
                                <div className="flex flex-col gap-3">
                                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                        <button className="w-full rounded-lg border border-richblack-700 bg-richblack-800 px-4 py-3 text-richblack-100 font-medium hover:bg-richblack-700 transition-all duration-300">
                                            Log in
                                        </button>
                                    </Link>
                                    <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                                        <button className="w-full rounded-lg bg-gradient-to-r from-yellow-25 to-yellow-100 px-4 py-3 text-richblack-900 font-semibold hover:from-yellow-100 hover:to-yellow-25 transition-all duration-300">
                                            Sign up
                                        </button>
                                    </Link>
                                </div>
                            )}

                            {token !== null && (
                                <div className="mt-4">
                                    <ProfileDropDown mobile={true} />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Navbar
