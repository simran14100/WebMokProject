// API endpoints for the application
export const categories = {
    CATEGORIES_API: "/api/v1/course/showAllCategories",
    CATEGORY_PAGE_DETAILS_API: "/api/v1/course/categoryPageDetails",
};

export const auth = {
    SENDOTP_API: "/api/v1/auth/sendotp",
    SIGNUP_API: "/api/v1/auth/signup",
    LOGIN_API: "/api/v1/auth/login",
    RESETPASSTOKEN_API: "/api/v1/auth/reset-password-token",
    RESETPASSWORD_API: "/api/v1/auth/reset-password",
};

export const profile = {
    UPDATE_PROFILE_API: "/api/v1/profile/updateProfile",
    DELETE_PROFILE_API: "/api/v1/profile/deleteProfile",
    GET_USER_DETAILS_API: "/api/v1/profile/getUserDetails",
    GET_ENROLLED_COURSES_API: "/api/v1/profile/getEnrolledCourses",
    UPDATE_DISPLAY_PICTURE_API: "/api/v1/profile/updateDisplayPicture",
};

export const course = {
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
};

export const payment = {
    CAPTURE_PAYMENT_API: "/api/v1/payment/capturePayment",
    VERIFY_PAYMENT_API: "/api/v1/payment/verifyPayment",
    SEND_PAYMENT_SUCCESS_EMAIL_API: "/api/v1/payment/sendPaymentSuccessEmail",
};

export const enrollment = {
    CREATE_ENROLLMENT_ORDER_API: "/api/v1/enrollment/create-order",
    VERIFY_ENROLLMENT_PAYMENT_API: "/api/v1/enrollment/verify-payment",
    GET_ENROLLMENT_STATUS_API: "/api/v1/enrollment/status",
};

export const admin = {
    GET_REGISTERED_USERS_API: "/api/v1/admin/registered-users",
    GET_ENROLLED_STUDENTS_API: "/api/v1/admin/enrolled-students",
    GET_PENDING_INSTRUCTORS_API: "/api/v1/admin/pending-instructors",
    APPROVE_INSTRUCTOR_API: "/api/v1/admin/approve-instructor",
    GET_DASHBOARD_STATS_API: "/api/v1/admin/dashboard-stats",
    UPDATE_USER_STATUS_API: "/api/v1/admin/update-user-status",
};

export const admission = {
    GET_ALL_CONFIRMATIONS_API: "/api/v1/admission/confirmations",
    GET_CONFIRMATION_BY_ID_API: "/api/v1/admission/confirmations",
    CONFIRM_ADMISSION_API: "/api/v1/admission/confirmations",
    REJECT_ADMISSION_API: "/api/v1/admission/confirmations",
    GET_ADMISSION_STATS_API: "/api/v1/admission/stats",
};

export const installments = {
    CREATE_INSTALLMENT_PLAN_API: "/api/v1/installments/create-plan",
    GET_STUDENT_INSTALLMENTS_API: "/api/v1/installments/student",
    GET_INSTALLMENT_DETAILS_API: "/api/v1/installments/details",
    CREATE_INSTALLMENT_PAYMENT_ORDER_API: "/api/v1/installments/create-payment-order",
    VERIFY_INSTALLMENT_PAYMENT_API: "/api/v1/installments/verify-payment",
    SEND_PAYMENT_REMINDERS_API: "/api/v1/installments/send-reminders",
    GET_ALL_INSTALLMENTS_API: "/api/v1/installments/all",
    GET_INSTALLMENT_STATS_API: "/api/v1/installments/stats",
};

export const contact = {
    CONTACT_US_API: "/api/v1/reach/contact",
}; 