const UGPGSubject = require("../models/UGPGSubject");

// Create UGPG Subject
exports.createSubject = async (req, res) => {
  try {
    const { 
      name, 
      school, 
      course, 
      semester, 
      status, 
      hasTheory = true, 
      theoryMaxMarks = 100, 
      hasPractical = false, 
      practicalMaxMarks = 0 
    } = req.body;
    
    // Validate required fields
    if (!name || !school || !course || !semester) {
      return res.status(400).json({ 
        success: false, 
        message: "name, school, course, and semester are required" 
      });
    }

    // Validate marks
    if (hasTheory && (!theoryMaxMarks || theoryMaxMarks <= 0)) {
      return res.status(400).json({ 
        success: false, 
        message: "Theory max marks must be greater than 0 when hasTheory is true" 
      });
    }

    if (hasPractical && (!practicalMaxMarks || practicalMaxMarks <= 0)) {
      return res.status(400).json({ 
        success: false, 
        message: "Practical max marks must be greater than 0 when hasPractical is true" 
      });
    }

    const totalMarks = (hasTheory ? Number(theoryMaxMarks) : 0) + 
                      (hasPractical ? Number(practicalMaxMarks) : 0);
    
    if (totalMarks > 100) {
      return res.status(400).json({ 
        success: false, 
        message: "Total marks (theory + practical) cannot exceed 100" 
      });
    }

    if (totalMarks <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "At least one of theory or practical must be enabled with marks greater than 0" 
      });
    }

    // Check if subject with same name exists for the same course and semester
    const exists = await UGPGSubject.findOne({ 
      name: name.trim(), 
      course,
      semester: Number(semester)
    });
    
    if (exists) {
      return res.status(409).json({ 
        success: false, 
        message: "Subject with this name already exists for the selected course and semester" 
      });
    }

    // Create new subject
    const doc = await UGPGSubject.create({ 
      name: name.trim(), 
      school,
      course,
      semester: Number(semester),
      status: status === "Inactive" ? "Inactive" : "Active",
      hasTheory: Boolean(hasTheory),
      theoryMaxMarks: hasTheory ? Number(theoryMaxMarks) : 0,
      hasPractical: Boolean(hasPractical),
      practicalMaxMarks: hasPractical ? Number(practicalMaxMarks) : 0,
      createdBy: req.user ? req.user.id : undefined 
    });
    
    const populated = await doc.populate(["school", "course"]);
    return res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error("UGPG createSubject error", err);
    return res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to create subject" 
    });
  }
};

// List UGPG Subjects with optional search and pagination
exports.getSubjects = async (req, res) => {
  try {
    const { q, page = 1, limit = 20, school, course, semester } = req.query;
    const filter = {};
    const regex = q ? { $regex: String(q).trim(), $options: "i" } : null;
    
    // Apply filters
    if (school) filter.school = school;
    if (course) filter.course = course;
    if (semester) filter.semester = Number(semester);

    if (regex) {
      filter.$or = [
        { name: regex },
        { 'school.name': regex },
        { 'course.courseName': regex }
      ];
    }

    const skip = (Math.max(parseInt(page), 1) - 1) * Math.max(parseInt(limit), 1);

    const [items, total] = await Promise.all([
      UGPGSubject.find(filter)
        .populate(["school", "course"])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Math.max(parseInt(limit), 1)),
      UGPGSubject.countDocuments(filter),
    ]);

    return res.json({ success: true, data: items, meta: { total, page: Number(page), limit: Number(limit) } });
  } catch (err) {
    console.error("UGPG getSubjects error", err);
    return res.status(500).json({ success: false, message: "Failed to fetch subjects" });
  }
};

// Get by ID
exports.getSubjectById = async (req, res) => {
  try {
    const doc = await UGPGSubject.findById(req.params.id)
      .populate(["department", "school", "course"]);
      
    if (!doc) return res.status(404).json({ success: false, message: "Subject not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error("UGPG getSubjectById error", err);
    return res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to fetch subject" 
    });
  }
};

// Update
exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      school, 
      course, 
      semester, 
      status, 
      hasTheory, 
      theoryMaxMarks, 
      hasPractical, 
      practicalMaxMarks 
    } = req.body;

    // Validate required fields
    if (!name || !school || !course || !semester) {
      return res.status(400).json({ 
        success: false, 
        message: "name, school, course, and semester are required" 
      });
    }

    // Validate marks
    if (hasTheory && (!theoryMaxMarks || theoryMaxMarks <= 0)) {
      return res.status(400).json({ 
        success: false, 
        message: "Theory max marks must be greater than 0 when hasTheory is true" 
      });
    }

    if (hasPractical && (!practicalMaxMarks || practicalMaxMarks <= 0)) {
      return res.status(400).json({ 
        success: false, 
        message: "Practical max marks must be greater than 0 when hasPractical is true" 
      });
    }

    const totalMarks = (hasTheory ? Number(theoryMaxMarks) : 0) + 
                      (hasPractical ? Number(practicalMaxMarks) : 0);
    
    if (totalMarks > 100) {
      return res.status(400).json({ 
        success: false, 
        message: "Total marks (theory + practical) cannot exceed 100" 
      });
    }

    if (totalMarks <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: "At least one of theory or practical must be enabled with marks greater than 0" 
      });
    }

    // Check for duplicate subject in the same course and semester
    const exists = await UGPGSubject.findOne({ 
      name: name.trim(), 
      course,
      semester: Number(semester),
      _id: { $ne: id } 
    });
    
    if (exists) {
      return res.status(409).json({ 
        success: false, 
        message: "Subject with this name already exists for the selected course and semester" 
      });
    }

    // Update subject
    const updateData = { 
      name: name.trim(), 
      school,
      course,
      semester: Number(semester),
      status: status === "Inactive" ? "Inactive" : "Active",
      hasTheory: Boolean(hasTheory),
      theoryMaxMarks: hasTheory ? Number(theoryMaxMarks) : 0,
      hasPractical: Boolean(hasPractical),
      practicalMaxMarks: hasPractical ? Number(practicalMaxMarks) : 0
    };

    const doc = await UGPGSubject.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate(["school", "course"]);

    if (!doc) return res.status(404).json({ success: false, message: "Subject not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error("UGPG updateSubject error", err);
    return res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to update subject" 
    });
  }
};

// Delete
exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await UGPGSubject.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ success: false, message: "Subject not found" });
    return res.json({ success: true, message: "Subject deleted" });
  } catch (err) {
    console.error("UGPG deleteSubject error", err);
    return res.status(500).json({ success: false, message: "Failed to delete subject" });
  }
};
