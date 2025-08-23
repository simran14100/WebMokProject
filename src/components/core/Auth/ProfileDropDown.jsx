import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { VscDashboard, VscSignOut } from "react-icons/vsc";
import { FiBookOpen } from "react-icons/fi";
import { AiOutlineCaretDown } from "react-icons/ai";
import { ACCOUNT_TYPE } from '../../../utils/constants';
import { logout } from '../../../services/operations/authApi';

const ProfileDropDown = ({ mobile = false }) => {
    const { user } = useSelector((state) => state.profile);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const location = useLocation();
    const isAdminLike = [ACCOUNT_TYPE.ADMIN, ACCOUNT_TYPE.INSTRUCTOR, ACCOUNT_TYPE.SUPER_ADMIN].includes(user?.accountType);

    // Close dropdown when clicking outside
    useEffect(() => {
        if (!isOpen) return;
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Close dropdown on route change
    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        // Use the logout operation function
        dispatch(logout(navigate));
        setIsOpen(false);
    };

    const getRoleDisplayName = (accountType) => {
        switch (accountType) {
            case ACCOUNT_TYPE.STUDENT:
                return "Student";
            case ACCOUNT_TYPE.INSTRUCTOR:
                return "Instructor";
            case ACCOUNT_TYPE.ADMIN:
                return "Admin";
            case ACCOUNT_TYPE.SUPER_ADMIN:
                return "Super Admin";
            case ACCOUNT_TYPE.STAFF:
                return "Staff";
            default:
                return "User";
        }
    };

    const getDashboardLink = () => {
        switch (user?.accountType) {
            case ACCOUNT_TYPE.STUDENT:  
                return "/dashboard/my-profile";
            case ACCOUNT_TYPE.INSTRUCTOR:
                return "/dashboard/my-profile";
            case ACCOUNT_TYPE.ADMIN:
            case ACCOUNT_TYPE.SUPER_ADMIN:
            case ACCOUNT_TYPE.STAFF:
                return "/admin/dashboard";
            default:
                return "/dashboard/my-profile";
        }
    };

    if (mobile) {
        return (
            <div className="w-full">
                <div className="flex items-center gap-3 p-4 border-b border-richblack-700 bg-richblack-800 rounded-lg mb-4">
                    <img
                        src={user?.image || `https://api.dicebear.com/5.x/initials/svg?seed=${user?.firstName || 'User'}`}
                        alt="Profile"
                        className="w-12 h-12 rounded-full border-2 border-yellow-25 shadow-lg"
                    />
                    <div className="flex flex-col">
                        <span className="text-lg font-semibold text-richblack-25">
                            {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'User'}
                            {user?.accountType === ACCOUNT_TYPE.STUDENT && user?.enrollmentFeePaid && (
                                <span className="ml-2 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full align-middle">Paid</span>
                            )}
                        </span>
                        <span className="text-sm text-yellow-25 font-medium">
                            {getRoleDisplayName(user?.accountType)}
                        </span>
                    </div>
                </div>
                
                <div className="flex flex-col gap-2">
                    <Link
                        to={getDashboardLink()}
                        className="flex items-center gap-3 px-4 py-3 text-richblack-100 hover:bg-richblack-700 hover:text-yellow-25 rounded-lg transition-all duration-300 font-medium"
                        onClick={() => setIsOpen(false)}
                    >
                        <VscDashboard className="text-lg" />
                        <span>Dashboard</span>
                    </Link>
                    {isAdminLike && (
                        <Link
                            to="/admin/my-courses"
                            className="flex items-center gap-3 px-4 py-3 text-richblack-100 hover:bg-richblack-700 hover:text-yellow-25 rounded-lg transition-all duration-300 font-medium"
                            onClick={() => setIsOpen(false)}
                        >
                            <FiBookOpen className="text-lg" />
                            <span>My Courses</span>
                        </Link>
                    )}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-all duration-300 font-medium text-left w-full"
                    >
                        <VscSignOut className="text-lg" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-2 rounded-lg border border-[#009e5c] bg-white hover:bg-[#f9fefb] transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-[#009e5c]"
                aria-haspopup="true"
                aria-expanded={isOpen}
            >
                <img
                    src={user?.image || `https://api.dicebear.com/5.x/initials/svg?seed=${user?.firstName || 'User'}`}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-[#009e5c] shadow group-hover:border-[#007a44] transition-all duration-300"
                />
                <span className="text-gray-900 text-sm font-medium group-hover:text-[#009e5c] transition-colors duration-300">
                    {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'User'}
                    {user?.accountType === ACCOUNT_TYPE.STUDENT && user?.enrollmentFeePaid && (
                        <span className="ml-2 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full align-middle">Paid</span>
                    )}
                </span>
                <AiOutlineCaretDown className={`text-base text-[#009e5c] group-hover:text-[#007a44] transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 bg-white rounded-xl shadow-2xl border border-[#009e5c] z-50 animate-fade-in">
                    <div className="p-4 border-b border-[#e0e0e0]">
                        <div className="flex items-center gap-3">
                            <img
                                src={user?.image || `https://api.dicebear.com/5.x/initials/svg?seed=${user?.firstName || 'User'}`}
                                alt="Profile"
                                className="w-12 h-12 rounded-full border-2 border-[#009e5c] shadow"
                            />
                            <div>
                                <div className="text-sm font-semibold text-gray-900">
                                    {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'User'}
                                    {user?.accountType === ACCOUNT_TYPE.STUDENT && user?.enrollmentFeePaid && (
                                        <span className="ml-2 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full align-middle">Paid</span>
                                    )}
                                </div>
                                <div className="text-xs text-[#009e5c] font-medium">
                                    {getRoleDisplayName(user?.accountType)}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="py-2">
                        <Link
                            to={getDashboardLink()}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-gray-800 hover:bg-[#f9fefb] hover:text-[#007a44] transition-all duration-300 font-medium rounded-lg"
                            onClick={() => setIsOpen(false)}
                        >
                            <VscDashboard className="text-lg text-[#009e5c] group-hover:text-[#007a44]" />
                            <span>Dashboard</span>
                        </Link>
                        {isAdminLike && (
                            <Link
                                to="/admin/my-courses"
                                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-800 hover:bg-[#f9fefb] hover:text-[#007a44] transition-all duration-300 font-medium rounded-lg"
                                onClick={() => setIsOpen(false)}
                            >
                                <FiBookOpen className="text-lg text-[#009e5c] group-hover:text-[#007a44]" />
                                <span>My Courses</span>
                            </Link>
                        )}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 hover:text-red-700 transition-all duration-300 font-medium w-full text-left rounded-lg"
                        >
                            <VscSignOut className="text-lg text-red-500" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileDropDown;