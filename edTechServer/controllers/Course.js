const Course = require('../models/Course');
const Category = require('../models/Category');
const Section = require("../models/Section")
const SubSection = require("../models/Subsection");
const User = require('../models/User');
const { convertSecondsToDuration } = require("../utils/secToDuration")
const {uploadImageToCloudinary} = require('../utils/imageUploader');
const CourseProgress = require("../models/CourseProgress")

 exports.createCourse = async (req, res) => {
  try {
    // Get user ID from request object
    const userId = req.user.id

    // Get all required fields from request body
    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag: _tag,
      category,
      subCategory,
      status,
      instructions: _instructions,
    } = req.body
    
    // Get thumbnail image from request files
    const thumbnail = req.files.thumbnailImage

    // Convert instructions from stringified Array to Array with validation
    let instructions = [];
    try {
      instructions = _instructions ? JSON.parse(_instructions) : [];
      if (!Array.isArray(instructions)) {
        instructions = [];
      }
      // Ensure we have at least one valid instruction
      instructions = instructions.filter(i => i && typeof i === 'string' && i.trim() !== '');
      if (instructions.length === 0) {
        instructions = ['Complete all lectures and assignments'];
      }
    } catch (error) {
      console.error('Error parsing instructions:', error);
      instructions = ['Complete all lectures and assignments'];
    }
    
    // Handle optional tag field
    const tag = _tag ? JSON.parse(_tag) : []

    // Check if any of the required fields are missing
    // Note: instructions are now handled with defaults in the parsing step
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !thumbnail ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
        missingFields: {
          courseName: !courseName,
          courseDescription: !courseDescription,
          whatYouWillLearn: !whatYouWillLearn,
          price: !price,
          thumbnail: !thumbnail,
          category: !category,
          instructions: !instructions.length
        }
      });
    }
    if (!status || status === undefined) {
      status = "Draft"
    }
    // Check if the user is an instructor
    const instructorDetails = await User.findById(userId, {
      accountType: "Instructor",
    })

    if (!instructorDetails) {
      return res.status(404).json({
        success: false,
        message: "Instructor Details Not Found",
      })
    }

    // Check if the tag given is valid
    const categoryDetails = await Category.findById(category)
    if (!categoryDetails) {
      return res.status(404).json({
        success: false,
        message: "Category Details Not Found",
      })
    }
    // Optional: validate subCategory belongs to category when provided
    if (subCategory) {
      try {
        const SubCategory = require('../models/SubCategory');
        const subCatDoc = await SubCategory.findById(subCategory);
        if (!subCatDoc) {
          return res.status(404).json({ success: false, message: 'SubCategory not found' });
        }
        if (String(subCatDoc.parentCategory) !== String(categoryDetails._id)) {
          return res.status(400).json({ success: false, message: 'SubCategory does not belong to selected Category' });
        }
      } catch (e) {
        console.warn('SubCategory validation skipped due to error:', e.message);
      }
    }
    // Upload the Thumbnail to Cloudinary
    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    )
    console.log(thumbnailImage)
    
    // Optionally upload Intro Video to Cloudinary (if provided)
    let introVideoUrl
    try {
      if (req.files && req.files.introVideo) {
        const introVideoFile = req.files.introVideo
        const uploadedIntro = await uploadImageToCloudinary(
          introVideoFile,
          process.env.FOLDER_NAME
        )
        introVideoUrl = uploadedIntro.secure_url
      }
    } catch (e) {
      console.warn('Intro video upload failed:', e.message)
    }
    // Create a new course with the given details
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn: whatYouWillLearn,
      price,
      tag,
      category: categoryDetails._id,
      ...(subCategory ? { subCategory } : {}),
      thumbnail: thumbnailImage.secure_url,
      ...(introVideoUrl ? { introVideo: introVideoUrl } : {}),
      status: status,
      instructions,
    })

    // Add the new course to the User Schema of the Instructor
    await User.findByIdAndUpdate(
      {
        _id: instructorDetails._id,
      },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    )
    // Add the new course to the Categories
    const categoryDetails2 = await Category.findByIdAndUpdate(
      { _id: category },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    )
    console.log("HEREEEEEEEE", categoryDetails2)
    // Return the new course and a success message
    res.status(200).json({
      success: true,
      data: newCourse,
      message: "Course Created Successfully",
    })
  } catch (error) {
    // Handle any errors that occur during the creation of the course
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message,
    })
  }
}

exports.getAllCourses = async(req , res)=>{
    try{
        const allCourses = await Course.find({
      status: "Published"
    },{
            courseName:true,
            price:true,
            thumbnail:true,
            instructor:true,
            studentsEnrolled:true,
            ratingAndReviews:true,
            status:true,
            courseContent:true,
            duration:true,
            tag:true,
            category:true,
            whatYouWillLearn:true,
            instructions:true})
            .populate({
              path: "instructor",
              select: "firstName lastName image email"
            })
            .populate('category')
            .populate('subCategory')
            .populate("studentsEnrolled") // Populate student details
            .exec();

        return res.status(200).json({
            success:true,
            message:"Data for all courses fetched successfully",
            data:allCourses,
        })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Failed to fetch all course data",
            error:error.message
        });


    }
}

exports.getCourseDetails = async (req, res) => {
  try {
    const { courseId } = req.body
    const courseDetails = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      //.populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
          select: "-videoUrl",
        },
      })
      .exec()

    if (!courseDetails) {
      return res.status(400).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      })
    }

    // if (courseDetails.status === "Draft") {
    //   return res.status(403).json({
    //     success: false,
    //     message: `Accessing a draft course is forbidden`,
    //   });
    // }

    let totalDurationInSeconds = 0
    courseDetails.courseContent.forEach((content) => {
      content.subSection.forEach((subSection) => {
        const timeDurationInSeconds = parseInt(subSection.timeDuration)
        totalDurationInSeconds += timeDurationInSeconds
      })
    })

    const totalDuration = convertSecondsToDuration(totalDurationInSeconds)

    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
      },
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Get a list of Course for a given Instructor
exports.getInstructorCourses = async (req, res) => {
  try {
    // Get the instructor ID from the authenticated user or request body
    const instructorId = req.user.id

    // Find all courses belonging to the instructor
    const instructorCourses = await Course.find({
      instructor: instructorId,
    }).sort({ createdAt: -1 })

    // Return the instructor's courses
    res.status(200).json({
      success: true,
      data: instructorCourses,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to retrieve instructor courses",
      error: error.message,
    })
  }
}
// Get courses created by the requesting Admin/SuperAdmin (matched via instructor field)
exports.getAdminCourses = async (req, res) => {
  try {
    // Resolve the admin's ObjectId robustly; tokens may not always include id
    const userDoc = await User.findOne({ email: req.user.email }).select('_id');
    if (!userDoc) {
      return res.status(404).json({ success: false, message: 'Admin user not found' });
    }
    const adminId = userDoc._id;

    const adminCourses = await Course.find({ instructor: adminId })
      .sort({ createdAt: -1 })
      .populate({ path: 'instructor', select: 'firstName lastName image email' })
      .populate('category')
      .populate('subCategory')
      .exec();

    return res.status(200).json({ success: true, data: adminCourses });
  } catch (error) {
    console.error('getAdminCourses error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin courses',
      error: error.message,
    });
  }
}
// Delete the Course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body

    // Find the course
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Unenroll students from the course
    const studentsEnrolled = course.studentsEnrolled
    for (const studentId of studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      })
    }

    // Delete sections and sub-sections
    const courseSections = course.courseContent
    for (const sectionId of courseSections) {
      // Delete sub-sections of the section
      const section = await Section.findById(sectionId)
      if (section) {
        const subSections = section.subSection
        for (const subSectionId of subSections) {
          await SubSection.findByIdAndDelete(subSectionId)
        }
      }

      // Delete the section
      await Section.findByIdAndDelete(sectionId)
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId)

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}
// Edit Course Details
exports.editCourse = async (req, res) => {
  try {
    console.log('Edit course request body:', req.body);
    console.log('Edit course files:', req.files);
    
    const { courseId } = req.body;
    const updates = { ...req.body };
    
    // Remove courseId from updates to avoid updating it
    delete updates.courseId;
    
    if (!courseId) {
      return res.status(400).json({ 
        success: false,
        message: "Course ID is required for editing" 
      });
    }
    
    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({ 
        success: false,
        message: "Course not found" 
      });
    }

    // If Thumbnail Image is found, update it
    if (req.files) {
      console.log("thumbnail update")
      const thumbnail = req.files.thumbnailImage
      const thumbnailImage = await uploadImageToCloudinary(
        thumbnail,
        process.env.FOLDER_NAME
      )
      course.thumbnail = thumbnailImage.secure_url
    }

    // Handle intro video update
    // 1) If new introVideo file is provided, upload and set
    if (req.files && req.files.introVideo) {
      try {
        const uploadedIntro = await uploadImageToCloudinary(
          req.files.introVideo,
          process.env.FOLDER_NAME
        )
        course.introVideo = uploadedIntro.secure_url
      } catch (e) {
        console.warn('Intro video upload failed:', e.message)
      }
    }
    // 2) If a direct introVideoUrl is provided in body, set it
    if (updates.introVideoUrl) {
      course.introVideo = updates.introVideoUrl
      delete updates.introVideoUrl
    }

    // Update only the fields that are present in the request body
    for (const key in updates) {
      if (updates.hasOwnProperty(key)) {
        if (key === "tag" || key === "instructions") {
          course[key] = JSON.parse(updates[key])
        } else {
          course[key] = updates[key]
        }
      }
    }

    await course.save()

    const updatedCourse = await Course.findOne({
      _id: courseId,
    })
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate("category")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec()

    res.json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    })
  }
}

exports.getFullCourseDetails = async (req, res) => {
  try {
    // Try to get courseId from body, params, or query
    const courseId = req.body.courseId || req.params.courseId || req.query.courseId;
    const userId = req.user?.id;

    console.log("===== Incoming getFullCourseDetails Request =====");
    console.log("Request Body:", req.body);
    console.log("Request Params:", req.params);
    console.log("Request Query:", req.query);
    console.log("User ID:", userId);
    console.log("Course ID:", courseId);
    console.log("================================================");

    // Validate courseId
    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "courseId is required",
      });
    }

    // Fetch course details
    const courseDetails = await Course.findById(courseId)
      .populate({
        path: "instructor",
        populate: { path: "additionalDetails" },
      })
      .populate("category")
      .populate("subCategory")
      .populate("ratingAndReviews")
      .populate({
        path: "courseContent",
        populate: { path: "subSection" },
      })
      .exec();

    // If not found
    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: `Could not find course with id: ${courseId}`,
      });
    }

    // Fetch course progress for this user
    const courseProgressCount = await CourseProgress.findOne({
      courseID: courseId,
      userId: userId,
    });

    console.log("Course Found:", courseDetails.courseName);
    console.log("Progress Data:", courseProgressCount);

    // Calculate total duration in seconds
    let totalDurationInSeconds = 0;
    if (courseDetails.courseContent?.length > 0) {
      courseDetails.courseContent.forEach((content) => {
        content.subSection?.forEach((subSection) => {
          const timeDurationInSeconds = parseInt(subSection.timeDuration) || 0;
          totalDurationInSeconds += timeDurationInSeconds;
        });
      });
    } else {
      console.warn("No course content found for course:", courseId);
    }

    // Convert to readable format
    const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

    // Send response
    return res.status(200).json({
      success: true,
      data: {
        courseDetails,
        totalDuration,
        completedVideos: courseProgressCount?.completedVideos || [],
      },
    });
  } catch (error) {
    console.error("Error in getFullCourseDetails:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// exports.getFullCourseDetails = async (req, res) => {
//   try {
//       const { courseId } = req.body; // Extract courseId from request body
//       const userId = req.user.id; // Get userId from request user object

//       // Log request data for debugging
//       console.log("Request Body:", req.body);
//       console.log("User  ID:", userId);
//       console.log("Course ID:", courseId);

//       // Fetch course details with necessary population
//       const courseDetails = await Course.findOne({ _id: courseId })
//           .populate({
//               path: "instructor",
//               populate: { path: "additionalDetails" },
//           })
//           .populate("category")
//           .populate("ratingAndReviews")
//           .populate({
//               path: "courseContent",
//               populate: { path: "subSection" },
//           })
//           .exec();

//       // Check if course details are found
//       if (!courseDetails) {
//           return res.status(400).json({
//               success: false,
//               message: `Could not find course with id: ${courseId}`,
//           });
//       }

//       // Fetch course progress count for the user
//       let courseProgressCount = await CourseProgress.findOne({
//           courseID: courseId,
//           userId: userId,
//       });

//       // Log the fetched data for debugging
//       console.log("Course Details:", courseDetails);
//       console.log("Course Progress Count:", courseProgressCount);

//       // Initialize total duration
//       let totalDurationInSeconds = 0;

//       // Check if courseContent exists and calculate total duration
//       if (courseDetails.courseContent) {
//           courseDetails.courseContent.forEach((content) => {
//               if (content.subSection) {
//                   content.subSection.forEach((subSection) => {
//                       const timeDurationInSeconds = parseInt(subSection.timeDuration) || 0; // Default to 0 if NaN
//                       totalDurationInSeconds += timeDurationInSeconds;
//                   });
//               }
//           });
//       } else {
//           console.warn('No course content found for course:', courseId);
//       }

//       // Convert total duration from seconds to a more readable format
//       const totalDuration = convertSecondsToDuration(totalDurationInSeconds);

//       // Return the response with course details and calculated duration
//       return res.status(200).json({
//           success: true,
//           data: {
//               courseDetails,
//               totalDuration,
//               completedVideos: courseProgressCount?.completedVideos || [], // Default to empty array if undefined
//           },
//       });
//   } catch (error) {
//       // Log the error details for debugging
//       console.error('Error in getFullCourseDetails:', error);
//       return res.status(500).json({
//           success: false,
//           message: error.message,
//       });
//   }
// };