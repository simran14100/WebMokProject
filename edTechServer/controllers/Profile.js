const Profile = require("../models/Profile")
const CourseProgress = require("../models/CourseProgress");
const Course = require("../models/Course")
const User = require("../models/User")
const Batch = require("../models/Batch")
const Notification = require("../models/Notification")
const { uploadImageToCloudinary } = require("../utils/imageUploader")
const mongoose = require("mongoose")
const {convertSecondsToDuration} = require("../utils/secToDuration")

// Method for updating a profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName = "",
      lastName = "",
      dateOfBirth = "",
      about = "",
      contactNumber = "",
      gender = "",
    } = req.body
    const id = req.user.id

    // Find the profile by id
    const userDetails = await User.findById(id)
    const profile = await Profile.findById(userDetails.additionalDetails)

    

    // Update the profile fields
    profile.dateOfBirth = dateOfBirth
    profile.about = about
    profile.contactNumber = contactNumber
    profile.gender = gender

    // Save the updated profile
    await profile.save()

    // Find the updated user details
    const updatedUserDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec()

    return res.json({
      success: true,
      message: "Profile updated successfully",
      updatedUserDetails,
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

// GET /api/v1/profile/live-classes
// Returns all upcoming and past live classes for batches the student is assigned to
exports.getStudentLiveClasses = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find batches where the student is assigned
    // We only check persisted students array
    const batches = await Batch.find({ students: userId }, { name: 1, liveClasses: 1 })
      .lean();

    const events = [];
    for (const b of batches) {
      for (const e of (b.liveClasses || [])) {
        events.push({
          id: String(e._id || `${b._id}-${e.startTime}`),
          title: e.title || "Live Class",
          description: e.description || "",
          batchId: String(b._id),
          batchName: b.name,
          link: e.link || "",
          startTime: e.startTime,
          createdAt: e.createdAt,
        });
      }
    }
    
    // Sort by startTime ascending
    events.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    return res.status(200).json({ success: true, data: events });
  } catch (error) {
    console.error("GET STUDENT LIVE CLASSES ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

// =============================
// Student Notifications
// =============================
// GET /api/v1/profile/notifications
exports.getStudentNotifications = async (req, res) => {
  try {
    // For now, return all notifications in latest-first order.
    // In future, can filter by audience (role, batch, user-specific).
    const items = await Notification.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, data: items });
  } catch (error) {
    console.error("GET STUDENT NOTIFICATIONS ERROR:", error)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

// GET /api/v1/profile/batch-courses
// Returns unique list of courses assigned to batches the student belongs to
exports.getStudentBatchCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find batches the student is in and populate minimal course fields
    const batches = await Batch.find({ students: userId }, { name: 1 })
      .populate({
        path: "courses",
        select: "courseName price thumbnail instructor createdAt",
        populate: { path: "instructor", select: "firstName lastName" },
      })
      .lean();

    const courseMap = new Map();
    for (const b of batches) {
      for (const c of (b.courses || [])) {
        const id = String(c._id);
        if (!courseMap.has(id)) {
          courseMap.set(id, {
            _id: id,
            courseName: c.courseName || "Untitled Course",
            price: c.price || 0,
            thumbnail: c.thumbnail || "",
            createdAt: c.createdAt,
            instructor: c.instructor ? {
              _id: String(c.instructor._id || ""),
              firstName: c.instructor.firstName || "",
              lastName: c.instructor.lastName || "",
            } : null,
          });
        }
      }
    }

    const courses = Array.from(courseMap.values());
    return res.status(200).json({ success: true, data: courses });
  } catch (error) {
    console.error("GET STUDENT BATCH COURSES ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
exports.deleteAccount = async (req, res) => {
  try {
    const id = req.user.id
    console.log(id)
    const userDetails = await User.findById({ _id: id })
    if (!userDetails) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }
    // Delete Assosiated Profile with the User
    await Profile.findByIdAndDelete({
      _id: userDetails.additionalDetails,
    })
    for (const courseId of userDetails.courses) {
      await Course.findByIdAndUpdate(
        courseId,
        { $pull: { studentsEnroled: id } },
        { new: true }
      )
    }
    // Now Delete User
    await User.findByIdAndDelete({ _id: id })
    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    })
    await CourseProgress.deleteMany({ userId: id })
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ success: false, message: "User Cannot be deleted successfully" })
  }
}

exports.getAllUserDetails = async (req, res) => {
    try {
      const id = req.user.id
      const userDetails = await User.findById(id)
        .populate("additionalDetails")
        .exec()
      console.log(userDetails)
      res.status(200).json({
        success: true,
        message: "User Data fetched successfully",
        data: userDetails,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  exports.updateDisplayPicture = async (req, res) => {
    try {
      const displayPicture = req.files.displayPicture
      const userId = req.user.id
      const image = await uploadImageToCloudinary(
        displayPicture,
        process.env.FOLDER_NAME,
        1000,
        1000
      )
      console.log(image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  exports.getEnrolledCourses = async (req, res) => {
    try {
      const userId = req.user.id
      let userDetails = await User.findOne({
        _id: userId,
      })
        .populate({
          path: "courses",
          populate: {
            path: "courseContent",
            populate: {
              path: "subSection",
            },
          },
        })
        .exec()
      userDetails = userDetails.toObject()
      var SubsectionLength = 0
    for (var i = 0; i < userDetails.courses.length; i++) {
        let totalDurationInSeconds = 0
        SubsectionLength = 0
      for (var j = 0; j < userDetails.courses[i].courseContent.length; j++) {
          totalDurationInSeconds += userDetails.courses[i].courseContent[
            j
          ].subSection.reduce((acc, curr) => acc + parseInt(curr.timeDuration), 0)
          userDetails.courses[i].totalDuration = convertSecondsToDuration(
            totalDurationInSeconds
          )
          SubsectionLength +=
            userDetails.courses[i].courseContent[j].subSection.length
        }
        // Get course progress for this specific course and user
        const courseProgress = await CourseProgress.findOne({
          courseID: userDetails.courses[i]._id,
          userId: userId,
        })
        
        // Get the number of completed videos (default to 0 if no progress found)
        const completedVideosCount = courseProgress?.completedVideos?.length || 0
        
        // Calculate progress percentage
        if (SubsectionLength === 0) {
          // If course has no content, progress is 0%
          userDetails.courses[i].progressPercentage = 0
        } else {
          // Calculate percentage: (completed videos / total videos) * 100
          const progressPercentage = (completedVideosCount / SubsectionLength) * 100
          
          // Round to 2 decimal places
          const multiplier = Math.pow(10, 2)
          userDetails.courses[i].progressPercentage = Math.round(progressPercentage * multiplier) / multiplier
        }
      }
  
      if (!userDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find user with id: ${userDetails}`,
        })
      }
      return res.status(200).json({
        success: true,
        data: userDetails.courses,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  exports.instructorDashboard = async (req, res) => {
    try {
      const courseDetails = await Course.find({ instructor: req.user.id })
  
      const courseData = courseDetails.map((course) => {
        const totalStudentsEnrolled = course.studentsEnrolled.length
        const totalAmountGenerated = totalStudentsEnrolled * course.price
  
        // Create a new object with the additional fields
        const courseDataWithStats = {
          _id: course._id,
          courseName: course.courseName,
          courseDescription: course.courseDescription,
          // Include other course properties as needed
          totalStudentsEnrolled,
          totalAmountGenerated,
        }
  
        return courseDataWithStats
      })
  
      res.status(200).json({ courses: courseData })
    } catch (error) {
      console.error(error)
      res.status(500).json({ message: "Server Error" })
    }
  }

// =============================
// Student Assignments Endpoints
// =============================
const Task = require("../models/Task")
const TaskSubmission = require("../models/TaskSubmission")

// GET /api/v1/profile/assignments
// Returns tasks assigned to the logged-in student based on batch membership and direct assignment
exports.getStudentAssignments = async (req, res) => {
  try {
    const userId = req.user.id

    // Find batches the student belongs to
    const batches = await Batch.find({ students: userId }, { _id: 1 }).lean()
    const batchIds = batches.map((b) => b._id)

    // Find tasks in those batches, either assigned to all (assignedTo null) or directly to this student
    const tasks = await Task.find({
      batch: { $in: batchIds },
      $or: [{ assignedTo: { $exists: false } }, { assignedTo: null }, { assignedTo: userId }],
    })
      .populate("createdBy", "firstName lastName email accountType")
      .populate("batch", "name")
      .populate("assignedTo", "firstName lastName email accountType")
      .sort({ createdAt: -1 })
      .lean()

    // Load this student's submissions for these tasks
    const taskIds = tasks.map((t) => t._id)
    const submissions = await TaskSubmission.find({ task: { $in: taskIds }, student: userId })
      .lean()
    const subByTask = new Map(submissions.map((s) => [String(s.task), s]))

    const data = tasks.map((t) => {
      const sub = subByTask.get(String(t._id))
      return {
        ...t,
        submission: sub
          ? {
              _id: sub._id,
              submittedAt: sub.submittedAt,
              score: typeof sub.score === "number" ? sub.score : null,
              feedback: sub.feedback || null,
            }
          : null,
        status: sub ? "submitted" : "pending",
      }
    })

    return res.status(200).json({ success: true, data })
  } catch (error) {
    console.error("GET STUDENT ASSIGNMENTS ERROR:", error)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

// GET /api/v1/profile/assignments/:taskId
// Returns task details with this student's submission (if any)
exports.getStudentAssignmentDetail = async (req, res) => {
  try {
    const userId = req.user.id
    const { taskId } = req.params

    const task = await Task.findById(taskId)
      .populate("createdBy", "firstName lastName email accountType")
      .populate("batch", "name")
      .populate("assignedTo", "firstName lastName email accountType")
    if (!task) return res.status(404).json({ success: false, message: "Task not found" })

    // Ensure student belongs to the task's batch
    const inBatch = await Batch.exists({ _id: task.batch, students: userId })
    if (!inBatch) return res.status(403).json({ success: false, message: "Not authorized for this task" })

    const submission = await TaskSubmission.findOne({ task: taskId, student: userId })
    return res.status(200).json({ success: true, data: { task, submission } })
  } catch (error) {
    console.error("GET STUDENT ASSIGNMENT DETAIL ERROR:", error)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}

// POST /api/v1/profile/assignments/:taskId/submit
// Create or update a student's submission
exports.submitAssignment = async (req, res) => {
  try {
    const userId = req.user.id
    const { taskId } = req.params
    const { text = "", links = [] } = req.body

    const task = await Task.findById(taskId)
    if (!task) return res.status(404).json({ success: false, message: "Task not found" })

    // Ensure the student is part of the batch
    const inBatch = await Batch.exists({ _id: task.batch, students: userId })
    if (!inBatch) return res.status(403).json({ success: false, message: "Not authorized for this task" })

    // Handle links (ensure array)
    const linksArr = Array.isArray(links)
      ? links
      : typeof links === "string"
      ? links.split(",").map((s) => s.trim()).filter(Boolean)
      : []

    // Handle files (optional, may be a single file or array from express-fileupload)
    let uploadedFiles = []
    if (req.files && req.files.files) {
      const fileItems = Array.isArray(req.files.files) ? req.files.files : [req.files.files]
      for (const f of fileItems) {
        try {
          const uploaded = await uploadImageToCloudinary(f, process.env.FOLDER_NAME || "webmok-uploads/assignments")
          uploadedFiles.push({ url: uploaded.secure_url, publicId: uploaded.public_id, name: f.name, size: f.size })
        } catch (e) {
          console.error("File upload failed:", e)
        }
      }
    }

    // Upsert submission
    const update = {
      text: String(text || "").trim(),
      links: linksArr,
      submittedAt: new Date(),
      batch: task.batch,
    }
    if (uploadedFiles.length) {
      update.$push = { files: { $each: uploadedFiles } }
    }

    const submission = await TaskSubmission.findOneAndUpdate(
      { task: taskId, student: userId },
      update,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )

    return res.status(200).json({ success: true, data: submission })
  } catch (error) {
    console.error("SUBMIT ASSIGNMENT ERROR:", error)
    return res.status(500).json({ success: false, message: "Internal server error" })
  }
}