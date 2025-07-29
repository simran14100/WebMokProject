export const NavbarLinks = [
    {
        title: "Home",
        path: "/",
    },
    {
        title: "About",
        path: "/about",
    },
    {
        title: "Contact",
        path: "/contact",
    },
];

// Role-based navigation links that will be added dynamically
export const RoleBasedLinks = {
    STUDENT: [
        {
            title: "My Courses",
            path: "/dashboard/my-courses",
        },
        {
            title: "Enrollment Payment",
            path: "/enrollment-payment",
        },
    ],
    INSTRUCTOR: [
        {
            title: "Instructor Dashboard",
            path: "/instructor/dashboard",
        },
        {
            title: "My Courses",
            path: "/instructor/my-courses",
        },
        {
            title: "Create Course",
            path: "/instructor/create-course",
        },
    ],
    ADMIN: [
        {
            title: "Admin Dashboard",
            path: "/admin/dashboard",
        },
        {
            title: "Manage Users",
            path: "/admin/users",
        },
        {
            title: "Manage Categories",
            path: "/admin/categories",
        },
    ],
    SUPER_ADMIN: [
        {
            title: "Admin Dashboard",
            path: "/admin/dashboard",
        },
        {
            title: "Manage Users",
            path: "/admin/users",
        },
        {
            title: "Manage Categories",
            path: "/admin/categories",
        },
        {
            title: "System Settings",
            path: "/admin/settings",
        },
    ],
    STAFF: [
        {
            title: "Admin Dashboard",
            path: "/admin/dashboard",
        },
        {
            title: "Manage Users",
            path: "/admin/users",
        },
    ],
}; 