const CourseCategory = require("../models/CourseCategory");

// Create Course Category
exports.createCourseCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: "Category name is required" 
      });
    }

    const doc = await CourseCategory.create({
      name: name.trim(),
      description: description?.trim() || "",
      status: status === "Inactive" ? "Inactive" : "Active",
      createdBy: req.user ? req.user.id : undefined,
    });

    return res.status(201).json({ 
      success: true, 
      data: doc 
    });
  } catch (err) {
    console.error("createCourseCategory error", err);
    if (err.code === 11000) {
      return res.status(409).json({ 
        success: false, 
        message: "Course category with this name already exists" 
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: "Failed to create course category" 
    });
  }
};

// List Course Categories
exports.listCourseCategories = async (req, res) => {
  try {
    const { status } = req.query;
    
    let filter = {};
    if (status && ["Active", "Inactive"].includes(status)) {
      filter.status = status;
    }

    const list = await CourseCategory.find(filter)
      .populate("createdBy", "firstName lastName")
      .sort({ createdAt: -1 });
      
    return res.json({ 
      success: true, 
      data: list 
    });
  } catch (err) {
    console.error("listCourseCategories error", err);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch course categories" 
    });
  }
};

// Get Active Course Categories (for dropdowns)
exports.getActiveCourseCategories = async (req, res) => {
  try {
    const list = await CourseCategory.find({ status: "Active" })
      .select("name")
      .sort({ name: 1 });
      
    return res.json({ 
      success: true, 
      data: list 
    });
  } catch (err) {
    console.error("getActiveCourseCategories error", err);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch active course categories" 
    });
  }
};

// Update Course Category
exports.updateCourseCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const update = { ...req.body };
    
    if (update.name) {
      update.name = update.name.trim();
    }
    if (update.description) {
      update.description = update.description.trim();
    }

    const doc = await CourseCategory.findByIdAndUpdate(id, update, { 
      new: true,
      runValidators: true 
    });
    
    if (!doc) {
      return res.status(404).json({ 
        success: false, 
        message: "Course category not found" 
      });
    }
    
    return res.json({ 
      success: true, 
      data: doc 
    });
  } catch (err) {
    console.error("updateCourseCategory error", err);
    if (err.code === 11000) {
      return res.status(409).json({ 
        success: false, 
        message: "Course category with this name already exists" 
      });
    }
    return res.status(500).json({ 
      success: false, 
      message: "Failed to update course category" 
    });
  }
};

// Delete Course Category
exports.deleteCourseCategory = async (req, res) => {
  try {
    const { id } = req.params;
    // First, retrieve the category document to get its name
    const categoryDoc = await CourseCategory.findById(id);
    if (!categoryDoc) {
      return res.status(404).json({ 
        success: false, 
        message: "Course category not found" 
      });
    }

    // Check if category is being used by any courses (by name, since UGPGCourse stores a string)
    const UGPGCourse = require("../models/UGPGCourse");
    const coursesUsingCategory = await UGPGCourse.countDocuments({ category: categoryDoc.name });
    if (coursesUsingCategory > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete category. It is being used by ${coursesUsingCategory} course(s)` 
      });
    }

    const doc = await CourseCategory.findByIdAndDelete(id);
    
    if (!doc) {
      return res.status(404).json({ 
        success: false, 
        message: "Course category not found" 
      });
    }
    
    return res.json({ 
      success: true, 
      message: "Course category deleted successfully" 
    });
  } catch (err) {
    console.error("deleteCourseCategory error", err);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to delete course category" 
    });
  }
};
 