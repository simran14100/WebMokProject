const Department = require("../models/Department");
const Course = require("../models/Course");

// Create Department
exports.createDepartment = async (req, res) => {
  try {
    const { name, status, shortcode } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "name is required" });

    const exists = await Department.findOne({ name: name.trim() });
    if (exists) return res.status(409).json({ success: false, message: "Department with this name already exists" });

    const doc = await Department.create({ name: name.trim(), shortcode: (shortcode || "").trim() || undefined, status: status === "Inactive" ? "Inactive" : "Active", createdBy: req.user ? req.user.id : undefined });

    // Also create a minimal UG/PG course entry to be used later
    // We intentionally keep required fields only. Instructor set to current user.
    let course = null;
    try {
      course = await Course.create({
        courseName: doc.name,
        instructor: req.user && req.user.id ? req.user.id : undefined,
        price: 0,
        tag: ["UGPG", `DEPARTMENT:${doc._id.toString()}`],
        status: "Draft",
      });
    } catch (courseErr) {
      console.error("createDepartment: failed to create linked course", courseErr);
      // Do not fail the department creation if course creation fails
    }

    return res.status(201).json({ success: true, data: { department: doc, course } });
  } catch (err) {
    console.error("createDepartment error", err);
    return res.status(500).json({ success: false, message: "Failed to create department" });
  }
};

// List Departments
exports.getDepartments = async (_req, res) => {
  try {
    const list = await Department.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, data: list });
  } catch (err) {
    console.error("getDepartments error", err);
    return res.status(500).json({ success: false, message: "Failed to fetch departments" });
  }
};

// List only UG/PG Departments (based on linked courses tagged with 'UGPG' and 'DEPARTMENT:<id>')
exports.getUgpgDepartments = async (_req, res) => {
  try {
    const ugpgCourses = await Course.find({ tag: { $in: ["UGPG"] } }).select("tag");
    const deptIdSet = new Set();
    ugpgCourses.forEach((c) => {
      const tags = Array.isArray(c.tag) ? c.tag : [];
      tags.forEach((t) => {
        if (typeof t === "string" && t.startsWith("DEPARTMENT:")) {
          const id = t.substring("DEPARTMENT:".length);
          if (id) deptIdSet.add(id);
        }
      });
    });

    const ids = Array.from(deptIdSet);
    if (ids.length === 0) {
      return res.json({ success: true, data: [] });
    }

    const list = await Department.find({ _id: { $in: ids } }).sort({ createdAt: -1 });
    return res.json({ success: true, data: list });
  } catch (err) {
    console.error("getUgpgDepartments error", err);
    return res.status(500).json({ success: false, message: "Failed to fetch UG/PG departments" });
  }
};

// Get Department by ID
exports.getDepartmentById = async (req, res) => {
  try {
    const doc = await Department.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "Department not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error("getDepartmentById error", err);
    return res.status(500).json({ success: false, message: "Failed to fetch department" });
  }
};

// Update Department
exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;
    const update = {};
    if (name) update.name = name.trim();
    if (status) update.status = status === "Inactive" ? "Inactive" : "Active";

    if (update.name) {
      const exists = await Department.findOne({ name: update.name, _id: { $ne: id } });
      if (exists) return res.status(409).json({ success: false, message: "Department with this name already exists" });
    }

    const doc = await Department.findByIdAndUpdate(id, update, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: "Department not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error("updateDepartment error", err);
    return res.status(500).json({ success: false, message: "Failed to update department" });
  }
};

// Delete Department
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Department.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ success: false, message: "Department not found" });
    return res.json({ success: true, message: "Department deleted" });
  } catch (err) {
    console.error("deleteDepartment error", err);
    return res.status(500).json({ success: false, message: "Failed to delete department" });
  }
};
