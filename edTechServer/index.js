



// Importing necessary modules and packages
require('dotenv').config();
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'NOT SET');
console.log('MONGODB_URL:', process.env.MONGODB_URL);
const express = require("express");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const { rateLimit } = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const morgan = require('morgan');
const fs = require("fs");
const os = require("os");
const path = require("path");

const app = express();
const userRoutes = require("./routes/user");
const profileRoutes = require("./routes/profile");
const courseRoutes = require("./routes/Course");
const subCategoryRoutes = require("./routes/SubCategory");
const paymentRoutes = require("./routes/Payments");
const contactUsRoute = require("./routes/Contact");
const adminRoutes = require("./routes/admin");
const enrollmentRoutes = require("./routes/enrollment");
const enrollmentManagementRoutes = require("./routes/enrollmentManagement");
const admissionRoutes = require("./routes/admission");
const admissionEnquiryRoutes = require("./routes/admissionEnquiryRoutes");
const enquiryRoutes = require("./routes/enquiryRoutes");
const installmentRoutes = require("./routes/installments");
const videoRoutes = require("./routes/Video");
const cartRoutes = require("./routes/cart");
const googleRoutes = require("./routes/google");
const sessionRoutes = require("./routes/session");
const ugpgSessionRoutes = require("./routes/ugpgSession");
const phdSessionRoutes = require("./routes/phdSession");
const ugpgExamSessionRoutes = require("./routes/ugpgExamSession");
const courseworkRoutes = require("./routes/coursework");
const ugpgSchoolRoutes = require("./routes/ugpgSchool");
const departmentRoutes = require("./routes/department");
const subjectRoutes = require("./routes/subject");
const ugpgCourseRoutes = require("./routes/ugpgCourse");
const ugpgSubjectRoutes = require("./routes/ugpgSubject");
const superAdminRoutes = require("./routes/superAdmin");

const languageRoutes = require("./routes/language");
const ugpgVisitorLogRoutes = require("./routes/ugpgVisitorLog");
const visitPurposeRoutes = require("./routes/visitPurpose");
const honoraryEnquiryRoutes = require("./routes/honoraryEnquiryRoutes");

const meetingTypeRoutes = require("./routes/meetingTypeRoutes");
const universityRegisteredStudentRoutes = require("./routes/universityRegisteredStudent");
const universityEnrolledStudentRoutes = require("./routes/universityEnrolledStudentRoutes");
const feeTypeRoutes = require("./routes/feeTypeRoutes");

const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

global.cloudinary = cloudinary;

// CORS configuration
app.use((req, res, next) => {
  // Allow all origins in development
  const allowedOrigins = [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:4000', 
    'http://localhost:4001'
  ];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, withCredentials, skipauth, X-Skip-Interceptor, cache-control, pragma, expires, headers');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).json({
      status: 200,
      message: 'Preflight check successful'
    });
  }
  
  next();
});

// Setting up port number
const PORT = process.env.PORT || 4000;

// Function to start the server
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying port ${Number(port) + 1}...`);
      startServer(Number(port) + 1);
    } else {
      console.error('Server error:', err);
      process.exit(1);
    }
  });
};

// Connect to database and start server
database.connect()
  .then(() => {
    startServer(PORT);
  })
  .catch(() => {
    console.error("Server not started due to DB connection failure");
  });

// Middlewares
app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Allow-Credentials',
    'withCredentials',
    'skipauth',
    'X-Skip-Interceptor',
    'signal',
    'X-XSRF-TOKEN',
    'headers',
    'content-type',
    'x-requested-with'
  ]
}));

// Handle preflight requests
app.options('*', cors());

// Body parsing middleware (for non-multipart requests)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Security middleware
app.use(helmet());
app.use(xss());
app.use(hpp());
app.use(mongoSanitize());
app.use(morgan('dev'));

// Log all requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === 'POST' && req.headers['content-type']?.includes('multipart/form-data')) {
    console.log('Multipart form data detected');
  }
  next();
});

// Configure a cross-platform temporary directory for uploads
const uploadTmpDir = path.join(os.tmpdir(), "webmok-uploads");
try {
  if (!fs.existsSync(uploadTmpDir)) {
    fs.mkdirSync(uploadTmpDir, { recursive: true });
    console.log("Created temp upload directory:", uploadTmpDir);
  }
} catch (e) {
  console.error("Failed to create temp upload directory:", e);
}

// IMPORTANT: DO NOT use express-fileupload globally
// File upload middleware should be applied only to specific routes that need it

// Connecting to cloudinary
cloudinaryConnect();

// Mount the routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reviews", profileRoutes);
app.use("/api/v1/contact", contactUsRoute);
app.use("/api/v1/razorpay", paymentRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);
app.use("/api/v1/enrollment-management", enrollmentManagementRoutes);
app.use("/api/v1/admission", admissionRoutes);
app.use("/api/v1/admission-enquiries", admissionEnquiryRoutes);
app.use("/api/v1/sub-categories", subCategoryRoutes);
app.use("/api/v1/enquiries", enquiryRoutes);
app.use("/api/v1/installments", installmentRoutes);
app.use("/api/v1/videos", videoRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/google", googleRoutes);
app.use("/api/v1/sessions", sessionRoutes);
app.use("/api/v1/ugpg/sessions", ugpgSessionRoutes);
app.use("/api/v1/phd/sessions", phdSessionRoutes);
app.use("/api/v1/ugpg-exam/sessions", ugpgExamSessionRoutes);
app.use("/api/v1/coursework", courseworkRoutes);
app.use("/api/v1/ugpg/schools", ugpgSchoolRoutes);
app.use("/api/v1/departments", departmentRoutes);
app.use("/api/v1/subjects", subjectRoutes);
app.use("/api/v1/ugpg/courses", ugpgCourseRoutes);
app.use("/api/v1/ugpg/subjects", ugpgSubjectRoutes);
app.use("/api/v1/super-admin", superAdminRoutes);
app.use("/api/v1/languages", languageRoutes);
app.use("/api/v1/ugpg/visitor-logs", ugpgVisitorLogRoutes);
app.use("/api/v1/visit-purposes", visitPurposeRoutes);
app.use("/api/v1/honorary-enquiries", honoraryEnquiryRoutes);
app.use("/api/v1/meeting-types", meetingTypeRoutes);
app.use("/api/v1/university/registered-students", universityRegisteredStudentRoutes);
app.use("/api/v1/university/enrolled-students", universityEnrolledStudentRoutes);
app.use("/api/v1/university/fee-types", feeTypeRoutes);

app.use("/api/v1/rac-members", require("./routes/racMember"));
app.use("/api/v1/external-experts", require("./routes/externalExpert"));

app.use("/api/v1/language", languageRoutes);

// Enquiry references routes
app.use("/api/v1/enquiry-references", require("./routes/enquiryReferenceRoutes"));
// Visitor logs route (UG/PG)
app.use("/api/v1/ugpg-visitor-log", ugpgVisitorLogRoutes);
app.use("/api/v1/visit-purposes", visitPurposeRoutes);
app.use("/api/v1/enquiry", honoraryEnquiryRoutes);

app.use("/api/v1/meeting-types", meetingTypeRoutes);

// Testing the server
app.get("/", (req, res) => {
	return res.json({
		success: true,
		message: "Your server is up and running ...",
	});
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start the server after database connection is established
database.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  });