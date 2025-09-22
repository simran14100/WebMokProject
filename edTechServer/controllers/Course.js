const fs = require('fs');
const path = require('path');
const Course = require('../models/Course');
const Category = require('../models/Category');
const Section = require("../models/Section");
const SubSection = require("../models/Subsection");
const User = require('../models/User');
const { convertSecondsToDuration } = require("../utils/secToDuration");
const { uploadImageToCloudinary, uploadVideoToCloudinary } = require('../utils/imageUploader');
const CourseProgress = require("../models/CourseProgress");

 exports.createCourse = async (req, res) => {
  try {
    // Log the incoming request for debugging
    console.log('Create course request received with body:', {
      ...req.body,
      thumbnailImage: req.body.thumbnailImage ? '[thumbnail exists]' : 'missing',
      introVideo: req.body.introVideo ? '[video exists]' : 'missing'
    });

    // Get user ID from request object
    const userId = req.user._id;

    // Get all required fields from request body
    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag: _tag,
      category,
      subCategory,
      status = "Draft",
      instructions: _instructions,
      thumbnailImage: thumbnailUrl,  // This will be the Cloudinary URL
      introVideo                    // This will be the Cloudinary URL
    } = req.body;

    // Validate required fields with more detailed error messages
    const missingFields = [];
    if (!courseName) missingFields.push('courseName');
    if (!courseDescription) missingFields.push('courseDescription');
    if (!whatYouWillLearn) missingFields.push('whatYouWillLearn');
    if (!price && price !== 0) missingFields.push('price');
    if (!category) missingFields.push('category');
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return res.status(400).json({
        success: false,
        message: `The following required fields are missing: ${missingFields.join(', ')}`,
        missingFields: {
          courseName: !courseName,
          courseDescription: !courseDescription,
          whatYouWillLearn: !whatYouWillLearn,
          price: !price && price !== 0,
          category: !category,
          thumbnail: !thumbnailUrl
        },
        receivedData: {
          courseName: !!courseName,
          courseDescription: !!courseDescription,
          whatYouWillLearn: !!whatYouWillLearn,
          price: price || price === 0,
          category: !!category,
          thumbnail: !!thumbnailUrl
        }
      });
    }

    // Convert instructions from stringified Array to Array with validation
    let instructions = [];
    try {
      instructions = _instructions ? (typeof _instructions === 'string' ? JSON.parse(_instructions) : _instructions) : [];
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
    const tag = _tag ? (typeof _tag === 'string' ? JSON.parse(_tag) : _tag) : [];
    
    // Check if thumbnail was uploaded
    if (!thumbnailUrl) {
      return res.status(400).json({
        success: false,
        message: "Course thumbnail is required"
      });
    }
    
    // Handle thumbnail upload
    if (thumbnailUrl) {
      console.log('Processing thumbnail...');
      try {
        if (typeof thumbnailUrl === 'string' && thumbnailUrl.startsWith('http')) {
          console.log('Using provided thumbnail URL:', thumbnailUrl);
          // Optionally, you can re-upload the thumbnail to your Cloudinary account
          try {
            const thumbnailUpload = await uploadImageToCloudinary(
              thumbnailUrl,
              process.env.FOLDER_NAME || 'webmok-uploads'
            );
            thumbnailUrl = thumbnailUpload.secure_url;
            console.log('Thumbnail re-uploaded to Cloudinary successfully');
          } catch (uploadError) {
            console.error('Error re-uploading thumbnail URL to Cloudinary:', uploadError);
            // Continue with the original URL if re-upload fails
          }
        } else if (typeof thumbnailUrl === 'object' && thumbnailUrl.path) {
          console.log('Uploading thumbnail file to Cloudinary...');
          const thumbnailUpload = await uploadImageToCloudinary(
            thumbnailUrl.path,
            process.env.FOLDER_NAME || 'webmok-uploads'
          );
          thumbnailUrl = thumbnailUpload.secure_url;
          console.log('Thumbnail uploaded successfully');

          // Clean up the temporary file if it exists
          try {
            try {
              await fsp.access(thumbnailUrl.path);
              await fsp.unlink(thumbnailUrl.path);
              console.log('Temporary thumbnail file cleaned up');
            } catch (accessError) {
              console.log('Temporary thumbnail file not found or already removed');
            }
          } catch (cleanupError) {
            console.error('Error cleaning up temporary thumbnail file:', cleanupError);
          }
        } else if (typeof thumbnailUrl === 'string') {
          console.log('Using provided thumbnail path/URL:', thumbnailUrl);
          // Try to upload the file from the path/URL
          try {
            const thumbnailUpload = await uploadImageToCloudinary(
              thumbnailUrl,
              process.env.FOLDER_NAME || 'webmok-uploads'
            );
            thumbnailUrl = thumbnailUpload.secure_url;
            console.log('Thumbnail uploaded successfully from path/URL');
          } catch (uploadError) {
            console.error('Error uploading thumbnail from path/URL:', uploadError);
            return res.status(400).json({
              success: false,
              message: 'Error processing thumbnail',
              error: uploadError.message
            });
          }
        }
      } catch (error) {
        console.error('Error processing thumbnail:', error);
        return res.status(500).json({
          success: false,
          message: 'Error processing thumbnail',
          error: error.message
        });
      }
    }

    // Handle intro video upload
    if (introVideo && introVideo !== 'none') {
      console.log('Processing intro video...');
      console.log('introVideo type:', typeof introVideo, 'value:', introVideo);
      
      try {
        // If it's a base64 string
        if (typeof introVideo === 'string' && introVideo.startsWith('data:')) {
          console.log('Uploading video from base64 data...');
          try {
            const videoUpload = await uploadVideoToCloudinary(
              introVideo,
              process.env.FOLDER_NAME || 'webmok-videos'
            );
            introVideo = videoUpload.secure_url;
            console.log('Video uploaded successfully from base64 data');
          } catch (uploadError) {
            console.error('Error uploading video from base64 data:', uploadError);
            introVideo = '';
          }
        }
        // If it's a URL
        else if (typeof introVideo === 'string' && /^https?:\/\//.test(introVideo)) {
          console.log('Using provided video URL:', introVideo);
          try {
            const videoUpload = await uploadVideoToCloudinary(
              introVideo,
              process.env.FOLDER_NAME || 'webmok-videos'
            );
            introVideo = videoUpload.secure_url;
            console.log('Video re-uploaded to Cloudinary successfully');
          } catch (uploadError) {
            console.error('Error re-uploading video URL to Cloudinary:', uploadError);
            // Continue with the original URL if re-upload fails
          }
        }
        // If it's a file upload from multer (buffer or path)
        else if (introVideo && typeof introVideo === 'object') {
          console.log('Processing video file object:', {
            keys: Object.keys(introVideo),
            hasBuffer: !!introVideo.buffer,
            hasPath: !!introVideo.path,
            path: introVideo.path
          });

          try {
            // If we have a buffer, use that first (from memory storage)
            if (introVideo.buffer) {
              console.log('Uploading video from buffer...');
              const videoUpload = await uploadVideoToCloudinary(
                introVideo, // Pass the file object which contains the buffer
                process.env.FOLDER_NAME || 'webmok-videos'
              );
              
              if (!videoUpload || !videoUpload.secure_url) {
                throw new Error('Invalid response from Cloudinary');
              }
              
              introVideo = videoUpload.secure_url;
              console.log('Video uploaded successfully from buffer');
            } 
            // If we have a path, try to use that
            else if (introVideo.path) {
              console.log('Processing video from path:', introVideo.path);
              
              // Resolve to absolute path if it's relative
              const absolutePath = path.isAbsolute(introVideo.path) 
                ? introVideo.path 
                : path.resolve(process.cwd(), introVideo.path);
              
              console.log('Resolved absolute path:', absolutePath);
              
              // Check if file exists at the resolved path
              if (!fs.existsSync(absolutePath)) {
                console.warn('File not found at resolved path:', absolutePath);
                throw new Error(`File not found at path: ${absolutePath}`);
              }
              
              // Upload the file
              const videoUpload = await uploadVideoToCloudinary(
                absolutePath,
                process.env.FOLDER_NAME || 'webmok-videos'
              );
              
              if (!videoUpload || !videoUpload.secure_url) {
                throw new Error('Invalid response from Cloudinary');
              }
              
              introVideo = videoUpload.secure_url;
              console.log('Video uploaded successfully from file path');
            } 
            // If we don't have a buffer or a valid path
            else {
              console.warn('Unsupported file object format - missing both buffer and valid path');
              throw new Error('Unsupported file format');
            }
          } catch (uploadError) {
            console.error('Error processing video file:', {
              error: uploadError.message,
              stack: uploadError.stack,
              fileInfo: {
                originalPath: introVideo.path,
                resolvedPath: introVideo.path ? path.resolve(process.cwd(), introVideo.path) : 'N/A',
                exists: introVideo.path ? fs.existsSync(path.resolve(process.cwd(), introVideo.path)) : 'N/A'
              }
            });
            introVideo = '';
          }
        }
        // If it's a file path string
        else if (typeof introVideo === 'string') {
          console.log('Processing video from path string:', introVideo);
          
          // Skip if it's 'none' or empty
          if (introVideo === 'none' || !introVideo.trim()) {
            console.log('Skipping video upload - no file specified');
            introVideo = '';
            return;
          }
          
          try {
            // Resolve to absolute path if it's relative
            const absolutePath = path.isAbsolute(introVideo) 
              ? introVideo 
              : path.resolve(process.cwd(), introVideo);
            
            console.log('Resolved absolute path:', absolutePath);
            
            // Check if file exists before attempting to upload
            if (!fs.existsSync(absolutePath)) {
              console.warn('File not found at resolved path:', absolutePath);
              throw new Error(`File not found at path: ${absolutePath}`);
            }
            
            const videoUpload = await uploadVideoToCloudinary(
              absolutePath,
              process.env.FOLDER_NAME || 'webmok-videos'
            );
            
            if (!videoUpload || !videoUpload.secure_url) {
              throw new Error('Invalid response from Cloudinary');
            }
            
            introVideo = videoUpload.secure_url;
            console.log('Video uploaded successfully from path string');
          } catch (uploadError) {
            console.error('Error uploading video from path string:', {
              error: uploadError.message,
              stack: uploadError.stack,
              resolvedPath: path.isAbsolute(introVideo) 
                ? introVideo 
                : path.resolve(process.cwd(), introVideo),
              currentWorkingDir: process.cwd()
            });
            introVideo = '';
          }
        } else {
          console.warn('Unsupported introVideo format:', {
            type: typeof introVideo,
            isObject: introVideo && typeof introVideo === 'object',
            hasBuffer: !!(introVideo && introVideo.buffer),
            hasPath: !!(introVideo && introVideo.path)
          });
          introVideo = '';
        }
      } catch (error) {
        console.error('Unexpected error processing intro video:', {
          error: error.message,
          stack: error.stack,
          introVideoType: typeof introVideo
        });
        // Don't fail the entire request if video upload fails
        introVideo = '';
      }
    }

    // Status is already set with default value in destructuring
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
    // Create the course
    const courseData = {
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn: whatYouWillLearn,
      price,
      tag: tag,
      category,
      subCategory,
      thumbnail: thumbnailUrl,
      status: status,
      instructions: instructions,
      ...(introVideo && { introVideo }) // Only include introVideo if it exists
    };
    
    console.log('Creating course with data:', {
      ...courseData,
      thumbnail: '[thumbnail URL]',
      introVideo: introVideo ? '***video-url***' : 'none'
    });
    
    const newCourse = await Course.create(courseData);
    console.log('Course created successfully:', newCourse._id);

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
    if (updates.introVideo) {
      // If introVideo is an object, extract the URL
      if (typeof updates.introVideo === 'object') {
        if (updates.introVideo.secure_url) {
          course.introVideo = updates.introVideo.secure_url;
        } else if (updates.introVideo.url) {
          course.introVideo = updates.introVideo.url;
        } else if (updates.introVideo.public_id) {
          course.introVideo = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/video/upload/${updates.introVideo.public_id}`;
        } else {
          console.warn('Unexpected introVideo format in update:', JSON.stringify(updates.introVideo));
          // Don't update if format is unexpected
          delete updates.introVideo;
        }
      } else if (typeof updates.introVideo === 'string') {
        // If it's already a string, use it directly
        course.introVideo = updates.introVideo;
      }
      // Remove from updates as we've processed it
      delete updates.introVideo;
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