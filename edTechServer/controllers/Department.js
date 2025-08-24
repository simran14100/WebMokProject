const Department = require("../models/Department");

// Create Department
exports.createDepartment = async (req, res) => {
  try {
    const { name, status } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "name is required" });

    const exists = await Department.findOne({ name: name.trim() });
    if (exists) return res.status(409).json({ success: false, message: "Department with this name already exists" });

    const doc = await Department.create({ name: name.trim(), status: status === "Inactive" ? "Inactive" : "Active", createdBy: req.user ? req.user.id : undefined });
    return res.status(201).json({ success: true, data: doc });
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
