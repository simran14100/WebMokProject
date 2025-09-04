// Importing necessary modules and packages
require('dotenv').config();
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'NOT SET');
console.log('MONGODB_URL:', process.env.MONGODB_URL);
const express = require("express");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
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
// Temporarily disabled due to missing validators
// const enquiryReferenceRoutes = require("./routes/enquiryReferenceRoutes");
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
const universityRegisteredStudentRoutes = require("./routes/universityRegisteredStudentRoutes");

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

// CORS configuration for development
app.use((req, res, next) => {
  // Allow all origins in development
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, withCredentials, skipauth, X-Skip-Interceptor');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '600');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
    'headers'
  ]
}));

app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(xss());
app.use(hpp());
app.use(mongoSanitize());
app.use(morgan('dev'));

// File upload middleware with increased limits and better error handling
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: os.tmpdir(),
  createParentPath: true,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB per file (increased from 10MB)
    files: 2, // Max 2 files per request
    fields: 200, // Increased from 100
    parts: 400, // Increased from 200
    headerPairs: 400 // Increased from 200
  },
  limitHandler: (req, res) => {
    console.error('File upload limit exceeded:', {
      fileSize: req.headers['content-length'],
      files: req.files ? Object.keys(req.files) : 'none',
      fields: Object.keys(req.body || {})
    });
    return res.status(413).json({
      success: false,
      message: 'File upload limit exceeded. Maximum 20MB per file and 2 files per request.'
    });
  },
  parseNested: true,
  abortOnLimit: false, // Don't abort, handle limits in limitHandler
  responseOnLimit: 'File size or count exceeds the limit',
  debug: true, // Enable debug for now to see more logs
  safeFileNames: true,
  preserveExtension: 4,
  // Add timeout for file uploads (5 minutes)
  uploadTimeout: 5 * 60 * 1000
}));

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

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: uploadTmpDir,
  })
);

// Connecting to cloudinary
cloudinaryConnect();

// Mount the routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/sub-category", subCategoryRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/contact", contactUsRoute);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/enrollment", enrollmentRoutes);
app.use("/api/v1/enrollment-management", enrollmentManagementRoutes);
app.use("/api/v1/admission", admissionRoutes);
app.use("/api/v1/university/registered-students", universityRegisteredStudentRoutes);

// Protected routes
app.use("/api/v1/admission-enquiries", admissionEnquiryRoutes);
app.use("/api/v1/enquiries", enquiryRoutes);
app.use("/api/v1/installments", installmentRoutes);
app.use("/api/v1/video", videoRoutes);
app.use("/api/v1/guide", require("./routes/guide"));
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/google", googleRoutes);
app.use("/api/v1/session", sessionRoutes); // legacy/general
app.use("/api/v1/ugpg-session", ugpgSessionRoutes);
app.use("/api/v1/phd-session", phdSessionRoutes);
app.use("/api/v1/ugpg-exam-session", ugpgExamSessionRoutes);
app.use("/api/v1/coursework", courseworkRoutes);
app.use("/api/v1/department", departmentRoutes);
app.use("/api/v1/ugpg-school", ugpgSchoolRoutes);
app.use("/api/v1/subject", subjectRoutes);
app.use("/api/v1/ugpg-subject", ugpgSubjectRoutes);
app.use("/api/v1/ugpg-course", ugpgCourseRoutes);

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

// End of code.