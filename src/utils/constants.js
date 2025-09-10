// Account Types - must match the backend's User model enum values
export const ACCOUNT_TYPE = {
    STUDENT: "Student",
    INSTRUCTOR: "Instructor",
    ADMIN: "Admin",
    SUPER_ADMIN: "SuperAdmin",  // Note the capital 'S' and 'A'
    CONTENT_MANAGER: "Content-management"
};

// Student program types - for role-based access
export const PROGRAM_TYPE = {
    UG: "UG",
    PG: "PG",
    PHD: "PhD"
};

// UI Constants
export const ED_TEAL = "#07A698";

// API Endpoints
export const API_ENDPOINTS = {
    // Auth endpoints
    SENDOTP_API: "/api/v1/auth/sendotp",
    SIGNUP_API: "/api/v1/auth/signup",
    LOGIN_API: "/api/v1/auth/login",
    RESETPASSTOKEN_API: "/api/v1/auth/reset-password-token",
    RESETPASSWORD_API: "/api/v1/auth/reset-password",
    
    // Profile endpoints
    UPDATE_PROFILE_API: "/api/v1/profile/updateProfile",
    DELETE_PROFILE_API: "/api/v1/profile/deleteProfile",
    GET_USER_DETAILS_API: "/api/v1/profile/getUserDetails",
    GET_ENROLLED_COURSES_API: "/api/v1/profile/getEnrolledCourses",
    UPDATE_DISPLAY_PICTURE_API: "/api/v1/profile/updateDisplayPicture",
    
    // Course endpoints
    CREATE_COURSE_API: "/api/v1/course/createCourse",
    GET_ALL_COURSES_API: "/api/v1/course/getAllCourses",
    GET_COURSE_DETAILS_API: "/api/v1/course/getCourseDetails",
    GET_FULL_COURSE_DETAILS_API: "/api/v1/course/getFullCourseDetails",
    EDIT_COURSE_API: "/api/v1/course/editCourse",
    GET_INSTRUCTOR_COURSES_API: "/api/v1/course/getInstructorCourses",
    DELETE_COURSE_API: "/api/v1/course/deleteCourse",
    CREATE_CATEGORY_API: "/api/v1/course/createCategory",
    SHOW_ALL_CATEGORIES_API: "/api/v1/course/showAllCategories",
    CATEGORY_PAGE_DETAILS_API: "/api/v1/course/categoryPageDetails",
    
    // Section endpoints
    CREATE_SECTION_API: "/api/v1/course/addSection",
    UPDATE_SECTION_API: "/api/v1/course/updateSection",
    DELETE_SECTION_API: "/api/v1/course/deleteSection",
    
    // Subsection endpoints
    CREATE_SUBSECTION_API: "/api/v1/course/addSubSection",
    UPDATE_SUBSECTION_API: "/api/v1/course/updateSubSection",
    DELETE_SUBSECTION_API: "/api/v1/course/deleteSubSection",
    
    // Rating and Review endpoints
    CREATE_RATING_API: "/api/v1/course/createRating",
    GET_AVERAGE_RATING_API: "/api/v1/course/getAverageRating",
    GET_REVIEWS_API: "/api/v1/course/getReviews",
    
    // Payment endpoints
    CAPTURE_PAYMENT_API: "/api/v1/payment/capturePayment",
    VERIFY_PAYMENT_API: "/api/v1/payment/verifyPayment",
    SEND_PAYMENT_SUCCESS_EMAIL_API: "/api/v1/payment/sendPaymentSuccessEmail",
    
    // Enrollment endpoints
    CREATE_ENROLLMENT_ORDER_API: "/api/v1/enrollment/create-order",
    VERIFY_ENROLLMENT_PAYMENT_API: "/api/v1/enrollment/verify-payment",
    GET_ENROLLMENT_STATUS_API: "/api/v1/enrollment/status",
    
    // Admin endpoints
    GET_REGISTERED_USERS_API: "/api/v1/admin/registered-users",
    GET_ENROLLED_STUDENTS_API: "/api/v1/admin/enrolled-students",
    GET_PENDING_INSTRUCTORS_API: "/api/v1/admin/pending-instructors",
    APPROVE_INSTRUCTOR_API: "/api/v1/admin/approve-instructor",
    GET_ALL_INSTRUCTORS_API: "/api/v1/admin/all-instructors",
    GET_DASHBOARD_STATS_API: "/api/v1/admin/dashboard-stats",
    UPDATE_USER_STATUS_API: "/api/v1/admin/update-user-status",
    
    // Contact endpoints
    CONTACT_US_API: "/api/v1/reach/contact",
    
    // Course Progress endpoints
    UPDATE_COURSE_PROGRESS_API: "/api/v1/course/updateCourseProgress"
};

// Status codes
export const STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500
};

// Payment status
export const PAYMENT_STATUS = {
    PENDING: "Pending",
    COMPLETED: "Completed",
    FAILED: "Failed"
};

// Course status
export const COURSE_STATUS = {
    DRAFT: "Draft",
    PUBLISHED: "Published"
};

// User approval status
export const USER_APPROVAL = {
    PENDING: false,
    APPROVED: true
};

// Enrollment fee amount
export const ENROLLMENT_FEE = 1000; // ₹1000

// Local storage keys
export const LOCAL_STORAGE_KEYS = {
    TOKEN: "token",
    USER: "user"
};

// Route paths
export const ROUTES = {
    HOME: "/",
    ABOUT: "/about",
    CONTACT: "/contact",
    LOGIN: "/login",
    SIGNUP: "/signup",
    DASHBOARD: "/dashboard",
    ENROLLMENT_PAYMENT: "/enrollment-payment",
    ADMIN_DASHBOARD: "/admin/dashboard",
    INSTRUCTOR_DASHBOARD: "/instructor/dashboard",
    CART: "/dashboard/cart"
}; 