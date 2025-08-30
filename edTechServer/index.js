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
const universityRoutes = require("./routes/university.routes");
const subCategoryRoutes = require("./routes/SubCategory");
const paymentRoutes = require("./routes/Payments");
const contactUsRoute = require("./routes/Contact");
const adminRoutes = require("./routes/admin");
const enrollmentRoutes = require("./routes/enrollment");
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
 
// Middlewares
app.use(express.json());
app.use(cookieParser());


// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:4000',
  'http://localhost:4001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:4000',
  'http://127.0.0.1:4001',
  // Add other allowed origins as needed
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Log allowed origins for debugging
    console.log('Allowed origins:', allowedOrigins);
    console.log('Request origin:', origin);
    
    const msg = `The CORS policy for this site does not allow access from the specified origin: ${origin}`;
    console.error(msg);
    return callback(new Error(msg), false);
  },
  credentials: true,
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'X-Skip-Interceptor'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

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
app.use("/api/v1/university", universityRoutes);
app.use("/api/v1/sub-category", subCategoryRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/contact", contactUsRoute);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/enrollment", enrollmentRoutes);
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

// University routes
app.use("/api/v1/university", universityRoutes);

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