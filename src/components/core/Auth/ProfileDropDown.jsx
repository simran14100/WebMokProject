import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { ACCOUNT_TYPE } from '../../../utils/constants';
import { logout } from '../../../store/slices/authSlice';
import { clearUser } from '../../../store/slices/profileSlice';

const ProfileDropDown = ({ mobile = false }) => {
    const { user } = useSelector((state) => state.profile);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        // Clear Redux state
        dispatch(logout());
        dispatch(clearUser());
        
        // Navigate to home
        navigate("/");
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
                return "/dashboard";
            case ACCOUNT_TYPE.INSTRUCTOR:
                return "/instructor/dashboard";
            case ACCOUNT_TYPE.ADMIN:
            case ACCOUNT_TYPE.SUPER_ADMIN:
            case ACCOUNT_TYPE.STAFF:
                return "/admin/dashboard";
            default:
                return "/dashboard";
        }
    };

    if (mobile) {
        return (
            <div className="w-full">
                <div className="flex items-center gap-3 p-4 border-b border-richblack-700 bg-richblack-800 rounded-lg mb-4">
                    <img
                        src={user?.image || "https://api.dicebear.com/5.x/initials/svg?seed=User"}
                        alt="Profile"
                        className="w-12 h-12 rounded-full border-2 border-yellow-25 shadow-lg"
                    />
                    <div className="flex flex-col">
                        <span className="text-lg font-semibold text-richblack-25">
                            {user?.firstName} {user?.lastName}
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
                        <span className="text-lg">📊</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link
                        to="/dashboard/settings"
                        className="flex items-center gap-3 px-4 py-3 text-richblack-100 hover:bg-richblack-700 hover:text-yellow-25 rounded-lg transition-all duration-300 font-medium"
                        onClick={() => setIsOpen(false)}
                    >
                        <span className="text-lg">⚙️</span>
                        <span>Settings</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-all duration-300 font-medium text-left w-full"
                    >
                        <span className="text-lg">🚪</span>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-richblack-700 transition-all duration-300 group"
            >
                <img
                    src={user?.image || "https://api.dicebear.com/5.x/initials/svg?seed=User"}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-yellow-25 shadow-lg group-hover:border-yellow-100 transition-all duration-300"
                />
                <span className="text-richblack-25 text-sm font-medium group-hover:text-yellow-25 transition-colors duration-300">
                    {user?.firstName} {user?.lastName}
                </span>
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-3 w-64 bg-richblack-800 rounded-xl shadow-2xl border border-richblack-600 z-50 backdrop-blur-sm">
                    <div className="p-4 border-b border-richblack-700">
                        <div className="flex items-center gap-3">
                            <img
                                src={user?.image || "https://api.dicebear.com/5.x/initials/svg?seed=User"}
                                alt="Profile"
                                className="w-12 h-12 rounded-full border-2 border-yellow-25 shadow-lg"
                            />
                            <div>
                                <div className="text-sm font-semibold text-richblack-25">
                                    {user?.firstName} {user?.lastName}
                                </div>
                                <div className="text-xs text-yellow-25 font-medium">
                                    {getRoleDisplayName(user?.accountType)}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="py-2">
                        <Link
                            to={getDashboardLink()}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-richblack-100 hover:bg-richblack-700 hover:text-yellow-25 transition-all duration-300 font-medium"
                            onClick={() => setIsOpen(false)}
                        >
                            <span className="text-lg">📊</span>
                            <span>Dashboard</span>
                        </Link>
                        <Link
                            to="/dashboard/settings"
                            className="flex items-center gap-3 px-4 py-3 text-sm text-richblack-100 hover:bg-richblack-700 hover:text-yellow-25 transition-all duration-300 font-medium"
                            onClick={() => setIsOpen(false)}
                        >
                            <span className="text-lg">⚙️</span>
                            <span>Settings</span>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all duration-300 font-medium w-full text-left"
                        >
                            <span className="text-lg">🚪</span>
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileDropDown; 