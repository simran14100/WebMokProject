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
const admissionRoutes = require("./routes/admission");
const installmentRoutes = require("./routes/installments");
const videoRoutes = require("./routes/Video");
const cartRoutes = require("./routes/cart");
const googleRoutes = require("./routes/google");


const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");



// Setting up port number
const PORT = process.env.PORT || 4000;

// Loading environment variables from .env file




// Connecting to database
database.connect();
 
// Middlewares
app.use(express.json());
app.use(cookieParser());


app.use(
	cors({
		origin: "*",
		credentials: true,
	})
);

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


// Setting up routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/subCategory", subCategoryRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/reach", contactUsRoute);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/enrollment", enrollmentRoutes);
app.use("/api/v1/admission", admissionRoutes);
app.use("/api/v1/installments", installmentRoutes);
app.use("/api/v1/video", videoRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/google", googleRoutes);

// Testing the server
app.get("/", (req, res) => {
	return res.json({
		success: true,
		message: "Your server is up and running ...",
	});
});

// Listening to the server
app.listen(PORT, () => {
	console.log(`App is listening at ${PORT}`);
});

// Connecting to database
database.connect();
console.log('Backend Razorpay Key:', process.env.RAZORPAY_KEY_ID);
// End of code.
//mongodb+srv://simmijha1410:3e1RpwhtiA9hfzB8@cluster0.1kc31.mongodb.net/studyNotation"//