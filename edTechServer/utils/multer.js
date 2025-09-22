const multer = require('multer');

// Configure memory storage (files will be in memory as Buffer objects)
const storage = multer.memoryStorage();

// File filter to only allow certain file types
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'thumbnailImage') {
    // Accept images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for thumbnails'), false);
    }
  } else if (file.fieldname === 'introVideo') {
    // Accept videos
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed for intro videos'), false);
    }
  } else {
    cb(new Error('Unexpected field'), false);
  }
};

// Initialize multer with memory storage and file filter
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 100, // 100MB limit for files
  },
  // Preserve file extension in memory
  preservePath: false
});

// Middleware to handle file uploads for course creation
const uploadCourseFiles = upload.fields([
  { name: 'thumbnailImage', maxCount: 1 },
  { name: 'introVideo', maxCount: 1 }
]);

module.exports = uploadCourseFiles;
