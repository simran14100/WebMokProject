// Importing necessary modules and packages
require('dotenv').config();
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID);
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'NOT SET');
console.log('MONGODB_URL:', process.env.MONGODB_URL);
const express = require("express");
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


const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");



// Setting up port number
const PORT = process.env.PORT || 4000;

// Loading environment variables from .env file




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
 
// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // In development, allow all origins for easier testing
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    // In production, restrict to specific origins
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:4000',
      'http://127.0.0.1:4000',
      // Add your production domains here
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
    console.error(msg);
    return callback(new Error(msg), false);
  },
  credentials: true,
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-Skip-Interceptor',
    'skipauth',
    'withCredentials',
    'Access-Control-Allow-Credentials',
    'timeout',
    'signal',
    'headers',
    'x-api-key',
    'x-client-version',
    'x-app-version',
    'x-platform',
    'x-device-id',
    'x-device-type',
    'x-auth-token',
    'x-requested-with',
    'x-csrf-token',
    'x-forwarded-for',
    'x-forwarded-proto',
    'x-forwarded-port'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  exposedHeaders: [
    'Content-Range', 
    'X-Content-Range',
    'Set-Cookie',
    'Access-Control-Allow-Credentials'
  ],
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Set CORS headers for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, withCredentials, skipauth, X-Skip-Interceptor');
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
app.use("/api/v1/enrollment", enrollmentManagementRoutes);
app.use("/api/v1/admission", admissionRoutes);
app.use("/api/v1/admission/enquiries", admissionEnquiryRoutes);
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