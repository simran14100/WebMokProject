# Backend Changes Summary

## Overview
This document summarizes the changes made to implement a 5-role system (Student, Instructor, Admin, SuperAdmin, Staff) with enrollment fee payment functionality for students.

## Changes Made

### 1. User Model Updates (`models/User.js`)
- **New Roles**: Updated `accountType` enum to include 5 roles: `["Student", "Instructor", "Admin", "SuperAdmin", "Staff"]`
- **Payment Fields**: Added new fields for enrollment fee tracking:
  - `paymentStatus`: "Pending", "Completed", "Failed"
  - `enrollmentFeePaid`: Boolean flag
  - `paymentDetails`: Object containing orderId, paymentId, amount, paidAt

### 2. Authentication Updates (`controllers/Auth.js`)
- **Registration Flow**: Modified signup to handle role-based approval logic:
  - Students: Auto-approved but need to pay enrollment fee
  - Instructors: Need admin approval
  - Admin/SuperAdmin/Staff: Auto-approved, no enrollment fee
- **Login Flow**: Updated to check enrollment fee payment for students
- **Response Enhancement**: Added `requiresPayment` flag in responses

### 3. Middleware Updates (`middlewares/auth.js`)
- **New Role Middleware**: Added `isSuperAdmin`, `isStaff`, `isAdminLevel`, `isAdminOrSuperAdmin`
- **Admin Level Access**: `isAdminLevel` allows Admin, SuperAdmin, and Staff access
- **Category Creation Access**: `isAdminOrSuperAdmin` allows only Admin and SuperAdmin (excludes Staff)
- **Enhanced Security**: Better role-based access control

### 4. New Controllers

#### Admin Dashboard (`controllers/AdminDashboard.js`)
- `getRegisteredUsers`: Get all registered users with pagination and filtering
- `getEnrolledStudents`: Get students who have paid enrollment fee
- `getPendingInstructors`: Get instructors awaiting approval
- `approveInstructor`: Approve instructor accounts
- `getDashboardStats`: Get dashboard statistics
- `updateUserStatus`: Activate/deactivate users

#### Enrollment Payment (`controllers/EnrollmentPayment.js`)
- `createEnrollmentOrder`: Create Razorpay order for enrollment fee
- `verifyEnrollmentPayment`: Verify payment and update user status
- `getEnrollmentStatus`: Get current enrollment payment status

### 5. New Routes

#### Admin Routes (`routes/admin.js`)
- `GET /api/v1/admin/registered-users`: Get registered users
- `GET /api/v1/admin/enrolled-students`: Get enrolled students
- `GET /api/v1/admin/pending-instructors`: Get pending instructors
- `POST /api/v1/admin/approve-instructor`: Approve instructor
- `GET /api/v1/admin/dashboard-stats`: Get dashboard statistics
- `PUT /api/v1/admin/update-user-status`: Update user status

#### Enrollment Routes (`routes/enrollment.js`)
- `POST /api/v1/enrollment/create-order`: Create enrollment order
- `POST /api/v1/enrollment/verify-payment`: Verify payment
- `GET /api/v1/enrollment/status`: Get payment status

### 6. Email Templates
- **Enrollment Fee Email** (`mail/templates/enrollmentFeeEmail.js`): Confirmation email for enrollment fee payment

### 7. Payment System Updates (`controllers/Payment.js`)
- **Enrollment Fee Check**: Added validation to ensure students have paid enrollment fee before course enrollment
- **Enhanced Security**: Prevents course enrollment without payment

### 8. Course Routes Updates (`routes/Course.js`)
- **Admin Level Access**: Updated category creation to use `isAdminLevel` middleware

### 9. Server Configuration (`index.js`)
- **New Route Mounting**: Added admin and enrollment routes to main server

## API Endpoints Summary

### Authentication
- `POST /api/v1/auth/signup` - User registration (now redirects to login)
- `POST /api/v1/auth/login` - User login (checks enrollment fee for students)

### Admin Dashboard
- `GET /api/v1/admin/registered-users` - View all registered users
- `GET /api/v1/admin/enrolled-students` - View students who paid enrollment fee
- `GET /api/v1/admin/pending-instructors` - View pending instructor approvals
- `POST /api/v1/admin/approve-instructor` - Approve instructor
- `GET /api/v1/admin/dashboard-stats` - Get dashboard statistics

### Enrollment Payment
- `POST /api/v1/enrollment/create-order` - Create enrollment fee order
- `POST /api/v1/enrollment/verify-payment` - Verify enrollment payment
- `GET /api/v1/enrollment/status` - Check enrollment status

## User Flow

### Student Registration Flow
1. User registers as Student
2. Account created with `enrollmentFeePaid: false`
3. Redirected to login page
4. After login, redirected to enrollment fee payment (₹1000)
5. After payment, account fully activated
6. Can now enroll in courses

### Admin Dashboard Flow
1. Admin/SuperAdmin/Staff can access dashboard
2. View all registered users
3. View enrolled students (who paid fee)
4. Approve pending instructors
5. Manage user status

### Instructor Registration Flow
1. User registers as Instructor
2. Account created with `approved: false`
3. Admin must approve instructor
4. After approval, instructor can create courses

## Security Features
- Role-based access control for all endpoints
- Enrollment fee validation before course enrollment
- Payment verification using Razorpay
- JWT authentication for all protected routes

## Database Changes
- New fields in User collection for payment tracking
- Enhanced role system with 5 distinct roles
- Payment details storage for audit trail

## Environment Variables Required
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `JWT_SECRET`
- `MONGODB_URL`
- Email configuration variables 