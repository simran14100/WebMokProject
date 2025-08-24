// API endpoints for the application
export const categories = {
    CREATE_CATEGORY_API: "/api/v1/course/createCategory", 
    CATEGORIES_API: "/api/v1/course/showAllCategories",
    CATEGORY_PAGE_DETAILS_API: "/api/v1/course/categoryPageDetails",
};

export const auth = {
    SENDOTP_API: "/api/v1/auth/sendotp",
    SIGNUP_API: "/api/v1/auth/signup",
    LOGIN_API: "/api/v1/auth/login",
    RESETPASSTOKEN_API: "/api/v1/auth/reset-password-token",
    RESETPASSWORD_API: "/api/v1/auth/reset-password",
    REFRESH_TOKEN_API: "/api/v1/auth/refresh-token",
};

export const profile = {
    UPDATE_PROFILE_API: "/api/v1/profile/updateProfile",
    DELETE_PROFILE_API: "/api/v1/profile/deleteProfile",
    GET_USER_DETAILS_API: "/api/v1/profile/getUserDetails",
    GET_ENROLLED_COURSES_API: "/api/v1/profile/getEnrolledCourses",
    UPDATE_DISPLAY_PICTURE_API: "/api/v1/profile/updateDisplayPicture",
    LIVE_CLASSES_API: "/api/v1/profile/live-classes",
    BATCH_COURSES_API: "/api/v1/profile/batch-courses",
    // Student Assignments
    STUDENT_ASSIGNMENTS_API: "/api/v1/profile/assignments", // GET list
    STUDENT_ASSIGNMENT_DETAIL_API: "/api/v1/profile/assignments", // GET `${...}/${taskId}`
    STUDENT_ASSIGNMENT_SUBMIT_API: "/api/v1/profile/assignments", // POST `${...}/${taskId}/submit`
    // Student Notifications
    STUDENT_NOTIFICATIONS_API: "/api/v1/profile/notifications", // GET list
};

export const subCategory = {
    GET_SUBCATEGORIES_BY_PARENT_API: "/api/v1/subCategory/getSubCategory",
    SHOW_ALL_SUBCATEGORIES_API: "/api/v1/subCategory/showAllSubCategories",
    SUBCATEGORY_PAGE_DETAILS_API: "/api/v1/subCategory/subCategoryPageDetails",
};

export const course = {
    CREATE_COURSE_API: "/api/v1/course/createCourse",
    GET_ALL_COURSES_API: "/api/v1/course/getAllCourses",
    GET_COURSE_DETAILS_API: "/api/v1/course/getCourseDetails",
    GET_FULL_COURSE_DETAILS_API: "/api/v1/course/getFullCourseDetails",
    GET_FULL_COURSE_DETAILS_AUTHENTICATED: "/api/v1/course/getFullCourseDetails",
    EDIT_COURSE_API: "/api/v1/course/editCourse",
    GET_INSTRUCTOR_COURSES_API: "/api/v1/course/getInstructorCourses",
    GET_ADMIN_COURSES_API: "/api/v1/course/getAdminCourses",
    DELETE_COURSE_API: "/api/v1/course/deleteCourse",
    CREATE_CATEGORY_API: "/api/v1/course/createCategory",
    SHOW_ALL_CATEGORIES_API: "/api/v1/course/showAllCategories",
    CATEGORY_PAGE_DETAILS_API: "/api/v1/course/categoryPageDetails",
    // Section and Subsection APIs
    CREATE_SECTION_API: "/api/v1/course/addSection",
    UPDATE_SECTION_API: "/api/v1/course/updateSection",
    DELETE_SECTION_API: "/api/v1/course/deleteSection",
    CREATE_SUBSECTION_API: "/api/v1/course/addSubSection",
    UPDATE_SUBSECTION_API: "/api/v1/course/updateSubSection",
    DELETE_SUBSECTION_API: "/api/v1/course/deleteSubSection",
    // Rating and Review APIs
    CREATE_RATING_API: "/api/v1/course/createRating",
    GET_AVERAGE_RATING_API: "/api/v1/course/getAverageRating",
    GET_REVIEWS_API: "/api/v1/course/getReviews",
    // Course Progress API
    LECTURE_COMPLETION_API: "/api/v1/course/updateCourseProgress",
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
    GET_PHD_ENROLLED_STUDENTS_API: "/api/v1/admin/phd-enrolled-students",
    GET_PHD_ENROLLMENT_PAID_STUDENTS_API: "/api/v1/admin/phd-enrollment-paid-students",
    GET_PENDING_INSTRUCTORS_API: "/api/v1/admin/pending-instructors",
    APPROVE_INSTRUCTOR_API: "/api/v1/admin/approve-instructor",
    GET_ALL_INSTRUCTORS_API: "/api/v1/admin/all-instructors",
    GET_DASHBOARD_STATS_API: "/api/v1/admin/dashboard-stats",
    UPDATE_USER_STATUS_API: "/api/v1/admin/update-user-status",
    CREATE_BATCH_API: "/api/v1/admin/create-batch",
    LIST_BATCHES_API: "/api/v1/admin/batches",
    EXPORT_BATCHES_API: "/api/v1/admin/batches/export",
    CREATE_STUDENT_API: "/api/v1/admin/create-student",
    CREATE_USER_API: "/api/v1/admin/create-user",
    // User Types
    USER_TYPES_API: "/api/v1/admin/user-types",
    // Bulk Students
    STUDENTS_TEMPLATE_API: "/api/v1/admin/students/template",
    BULK_UPLOAD_STUDENTS_API: "/api/v1/admin/students/bulk-upload",
    // Batch Students management
    LIST_BATCH_STUDENTS_API: "/api/v1/admin/batches", // use `${LIST_BATCH_STUDENTS_API}/${batchId}/students`
    ADD_STUDENT_TO_BATCH_API: "/api/v1/admin/batches", // POST `${ADD_STUDENT_TO_BATCH_API}/${batchId}/students`
    REMOVE_STUDENT_FROM_BATCH_API: "/api/v1/admin/batches", // DELETE `${REMOVE_STUDENT_FROM_BATCH_API}/${batchId}/students/:studentId`
    // Batch Temp Students (not persisted as Users)
    LIST_TEMP_STUDENTS_IN_BATCH_API: "/api/v1/admin/batches", // GET `${LIST_TEMP_STUDENTS_IN_BATCH_API}/${batchId}/temp-students`
    ADD_TEMP_STUDENT_TO_BATCH_API: "/api/v1/admin/batches", // POST `${ADD_TEMP_STUDENT_TO_BATCH_API}/${batchId}/temp-students`
    REMOVE_TEMP_STUDENT_FROM_BATCH_API: "/api/v1/admin/batches", // DELETE `${REMOVE_TEMP_STUDENT_FROM_BATCH_API}/${batchId}/temp-students/:tempId`
    // Batch Trainers management
    LIST_BATCH_TRAINERS_API: "/api/v1/admin/batches", // GET `${LIST_BATCH_TRAINERS_API}/${batchId}/trainers`
    ADD_TRAINER_TO_BATCH_API: "/api/v1/admin/batches", // POST `${ADD_TRAINER_TO_BATCH_API}/${batchId}/trainers`
    REMOVE_TRAINER_FROM_BATCH_API: "/api/v1/admin/batches", // DELETE `${REMOVE_TRAINER_FROM_BATCH_API}/${batchId}/trainers/:trainerId`
    // Batch Courses management
    LIST_BATCH_COURSES_API: "/api/v1/admin/batches", // GET `${LIST_BATCH_COURSES_API}/${batchId}/courses`
    ADD_COURSE_TO_BATCH_API: "/api/v1/admin/batches", // POST `${ADD_COURSE_TO_BATCH_API}/${batchId}/courses`
    REMOVE_COURSE_FROM_BATCH_API: "/api/v1/admin/batches", // DELETE `${REMOVE_COURSE_FROM_BATCH_API}/${batchId}/courses/:courseId`
    // Batch Live Classes management
    ADD_LIVE_CLASS_TO_BATCH_API: "/api/v1/admin/batches", // POST `${ADD_LIVE_CLASS_TO_BATCH_API}/${batchId}/live-classes`
    // Batch Tasks management
    LIST_BATCH_TASKS_API: "/api/v1/admin/batches", // GET `${LIST_BATCH_TASKS_API}/${batchId}/tasks`
    CREATE_BATCH_TASK_API: "/api/v1/admin/batches", // POST `${CREATE_BATCH_TASK_API}/${batchId}/tasks`
    UPDATE_TASK_API: "/api/v1/admin/tasks", // PUT `${UPDATE_TASK_API}/${taskId}`
    DELETE_TASK_API: "/api/v1/admin/tasks", // DELETE `${DELETE_TASK_API}/${taskId}`
    GET_TASK_STATUSES_API: "/api/v1/admin/tasks", // GET `${GET_TASK_STATUSES_API}/${taskId}/statuses`
    GET_TASK_SUMMARY_API: "/api/v1/admin/tasks", // GET `${GET_TASK_SUMMARY_API}/${taskId}/summary`
    // Admin Reviews
    CREATE_ADMIN_REVIEW_API: "/api/v1/admin/reviews",
    // Google Calendar integration
    CREATE_MEET_LINK_API: "/api/v1/admin/calendar/create-meet",
    // Notifications
    CREATE_NOTIFICATION_API: "/api/v1/admin/notifications",
    LIST_NOTIFICATIONS_API: "/api/v1/admin/notifications",
    DELETE_NOTIFICATION_API: "/api/v1/admin/notifications", // DELETE `${...}/${id}`
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

export const videoProtection = {
    GET_PROTECTED_VIDEO_STREAM: "/api/v1/video/stream",
    GET_VIDEO_SERVE: "/api/v1/video/serve",
    TRACK_VIDEO_PROGRESS: "/api/v1/video/progress",
    GET_VIDEO_ANALYTICS: "/api/v1/video/analytics",
}; 

// src/services/apis.js
export const cart = {
  GET_CART_DETAILS_API: "/api/v1/cart",
  ADD_TO_CART_API: "/api/v1/cart/add",
  UPDATE_CART_ITEM_API: "/api/v1/cart/update",
  REMOVE_FROM_CART_API: "/api/v1/cart/remove",
  CLEAR_CART_API: "/api/v1/cart/clear",
 GET_CART_COUNT_API: "api/v1/cart/count"  // Add this new endpoint
};

// Coursework (PhD Admin)
export const coursework = {
  GET_IMAGES_API: "/api/v1/coursework/images",
  UPDATE_IMAGES_API: "/api/v1/coursework/images",
  LIST_SLOTS_API: "/api/v1/coursework/slots",
  CREATE_SLOT_API: "/api/v1/coursework/slots",
  UPDATE_SLOT_API: "/api/v1/coursework/slots", // use `${...}/${id}`
  DELETE_SLOT_API: "/api/v1/coursework/slots", // use `${...}/${id}`
  TOGGLE_SLOT_API: "/api/v1/coursework/slots", // use `${...}/${id}/toggle`
  // Papers
  LIST_PAPERS_API: "/api/v1/coursework/papers",
  CREATE_PAPER_API: "/api/v1/coursework/papers",
  UPDATE_PAPER_API: "/api/v1/coursework/papers", // use `${...}/${id}`
  DELETE_PAPER_API: "/api/v1/coursework/papers", // use `${...}/${id}`
  TOGGLE_PAPER_API: "/api/v1/coursework/papers", // use `${...}/${id}/toggle`
  // Results
  LIST_RESULTS_API: "/api/v1/coursework/results",
  CREATE_RESULT_API: "/api/v1/coursework/results",
  UPDATE_RESULT_API: "/api/v1/coursework/results", // use `${...}/${id}`
  DELETE_RESULT_API: "/api/v1/coursework/results", // use `${...}/${id}`
  TOGGLE_RESULT_API: "/api/v1/coursework/results", // use `${...}/${id}/toggle`
};