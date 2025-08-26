const UGPGCourse = require("../models/UGPGCourse");

// Create UGPG Course
exports.createCourse = async (req, res) => {
  try {
    const {
      school,
      category,
      courseName,
      courseType,
      durationYear,
      semester,
      totalCredit,
      totalPapers,
      seats,
      status,
    } = req.body;

    if (!school || !category || !courseName) {
      return res.status(400).json({ success: false, message: "school, category and courseName are required" });
    }

    const doc = await UGPGCourse.create({
      school,
      category,
      courseName: courseName.trim(),
      courseType: ["Semester", "Yearly"].includes(courseType) ? courseType : "Yearly",
      durationYear: Number(durationYear) || 0,
      semester: Number(semester) || 0,
      totalCredit: Number(totalCredit) || 0,
      totalPapers: Number(totalPapers) || 0,
      seats: Number(seats) || 0,
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
    const list = await UGPGCourse.find({}).populate("school", "name").sort({ createdAt: -1 });
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
