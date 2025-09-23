const BatchDepartment = require("../models/BatchDepartment");

// Create Batch Department
exports.createBatchDepartment = async (req, res) => {
  try {
    const { name, status = "Active", shortcode = "" } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: "name is required" });
    }

    const normalizedName = String(name).trim();
    const exists = await BatchDepartment.findOne({ name: normalizedName });
    if (exists) {
      return res.status(409).json({ success: false, message: "Batch department already exists" });
    }

    const doc = await BatchDepartment.create({
      name: normalizedName,
      shortcode: String(shortcode || "").trim() || undefined,
      status: status === "Inactive" ? "Inactive" : "Active",
      createdBy: req.user ? (req.user._id || req.user.id) : undefined,
    });

    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error("createBatchDepartment error", err);
    return res.status(500).json({ success: false, message: "Failed to create batch department" });
  }
};

// List Batch Departments
exports.listBatchDepartments = async (req, res) => {
  try {
    const { onlyActive = "false" } = req.query;
    const query = onlyActive === "true" ? { status: "Active" } : {};
    const list = await BatchDepartment.find(query).sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: list });
  } catch (err) {
    console.error("listBatchDepartments error", err);
    return res.status(500).json({ success: false, message: "Failed to fetch batch departments" });
  }
};

// Update Batch Department
exports.updateBatchDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, shortcode } = req.body || {};
    const update = {};
    if (name !== undefined) update.name = String(name).trim();
    if (shortcode !== undefined) update.shortcode = String(shortcode).trim();
    if (status !== undefined) update.status = status === "Inactive" ? "Inactive" : "Active";

    if (update.name) {
      const exists = await BatchDepartment.findOne({ name: update.name, _id: { $ne: id } });
      if (exists) return res.status(409).json({ success: false, message: "Batch department with this name already exists" });
    }

    const doc = await BatchDepartment.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!doc) return res.status(404).json({ success: false, message: "Batch department not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error("updateBatchDepartment error", err);
    return res.status(500).json({ success: false, message: "Failed to update batch department" });
  }
};

// Delete Batch Department
exports.deleteBatchDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await BatchDepartment.findByIdAndDelete(id).lean();
    if (!doc) return res.status(404).json({ success: false, message: "Batch department not found" });
    return res.json({ success: true, message: "Batch department deleted" });
  } catch (err) {
    console.error("deleteBatchDepartment error", err);
    return res.status(500).json({ success: false, message: "Failed to delete batch department" });
  }
};


