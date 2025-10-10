const UGPGCourse = require("../models/UGPGCourse");

// Create UGPG Course
exports.createCourse = async (req, res) => {
  try {
    const {
      school,
      session,
      category,
      courseName,
      courseType,
      durationYear,
      semester,
      totalCredit,
      totalPapers,
      seats,
      courseDescription,
      whatYouWillLearn,
      status,
    } = req.body;

    if (!school || !session || !category || !courseName) {
      return res.status(400).json({ success: false, message: "school, session, category and courseName are required" });
    }

    // Normalize learnings to an array of strings
    let learnings = [];
    try {
      if (Array.isArray(whatYouWillLearn)) {
        learnings = whatYouWillLearn.map((s) => (typeof s === 'string' ? s.trim() : '')).filter(Boolean);
      } else if (typeof whatYouWillLearn === 'string') {
        // allow comma-separated or JSON string
        const maybeJson = whatYouWillLearn.trim();
        if (maybeJson.startsWith('[')) {
          const parsed = JSON.parse(maybeJson);
          if (Array.isArray(parsed)) {
            learnings = parsed.map((s) => (typeof s === 'string' ? s.trim() : '')).filter(Boolean);
          }
        } else {
          learnings = whatYouWillLearn.split(',').map((s) => s.trim()).filter(Boolean);
        }
      }
    } catch (_) {
      learnings = [];
    }

    const doc = await UGPGCourse.create({
      school,
      session,
      category,
      courseName: courseName.trim(),
      courseType: ["Semester", "Yearly"].includes(courseType) ? courseType : "Yearly",
      durationYear: Number(durationYear) || 0,
      semester: Number(semester) || 0,
      totalCredit: Number(totalCredit) || 0,
      totalPapers: Number(totalPapers) || 0,
      seats: Number(seats) || 0,
      courseDescription: (courseDescription || '').toString().trim(),
      whatYouWillLearn: learnings,
      status: status === "Inactive" ? "Inactive" : "Active",
      createdBy: req.user ? req.user.id : undefined,
    });

    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error("createCourse error", err);
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: "Course with this name already exists for the school" });
    }
    return res.status(500).json({ success: false, message: "Failed to create course" });
  }
};

// List courses
exports.listCourses = async (_req, res) => {
  try {
    const list = await UGPGCourse.find({})
      .populate("school", "name")
      .populate("session", "name")
      .sort({ createdAt: -1 });
    return res.json({ success: true, data: list });
  } catch (err) {
    console.error("listCourses error", err);
    return res.status(500).json({ success: false, message: "Failed to fetch courses" });
  }
};

// Update
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const update = { ...req.body };
    if (update.courseName) update.courseName = update.courseName.trim();
    const doc = await UGPGCourse.findByIdAndUpdate(id, update, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: "Course not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error("updateCourse error", err);
    return res.status(500).json({ success: false, message: "Failed to update course" });
  }
};

// Delete
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await UGPGCourse.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ success: false, message: "Course not found" });
    return res.json({ success: true, message: "Course deleted" });
  } catch (err) {
    console.error("deleteCourse error", err);
    return res.status(500).json({ success: false, message: "Failed to delete course" });
  }
};

// Get one by ID
// exports.getCourseById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const doc = await UGPGCourse.findById(id)
//       .populate("school", "name")
//       .populate("session", "name")
//       .exec();
//     if (!doc) return res.status(404).json({ success: false, message: "Course not found" });
//     return res.json({ success: true, data: doc });
//   } catch (err) {
//     console.error("getCourseById error", err);
//     return res.status(500).json({ success: false, message: "Failed to fetch course" });
//   }
// };
   // In UGPGCourse.js controller
   exports.getCourseById = async (req, res) => {
    console.log('getCourseById called with ID:', req.params.id);
    try {
      const course = await UGPGCourse.findById(req.params.id)
        .populate('school', 'name')
        .populate('session', 'name');
      
      if (!course) {
        console.log('Course not found with ID:', req.params.id);
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      
      console.log('Found course:', course);
      res.json({ success: true, data: course });
    } catch (err) {
      console.error('Error in getCourseById:', err);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };