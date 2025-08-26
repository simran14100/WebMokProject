const UGPGSchool = require("../models/UGPGSchool");

// Create UGPG School
exports.createSchool = async (req, res) => {
  try {
    const { name, shortcode, status } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "name is required" });
    }

    const exists = await UGPGSchool.findOne({ name: name.trim() });
    if (exists) {
      return res.status(409).json({ success: false, message: "School with this name already exists" });
    }

    const doc = await UGPGSchool.create({
      name: name.trim(),
      shortcode: (shortcode || "").trim() || undefined,
      status: status === "Inactive" ? "Inactive" : "Active",
      createdBy: req.user ? req.user.id : undefined,
    });

    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error("createSchool error", err);
    return res.status(500).json({ success: false, message: "Failed to create school" });
  }
};

// List
exports.listSchools = async (_req, res) => {
  try {
    const list = await UGPGSchool.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, data: list });
  } catch (err) {
    console.error("listSchools error", err);
    return res.status(500).json({ success: false, message: "Failed to fetch schools" });
  }
};

// Get by ID
exports.getSchoolById = async (req, res) => {
  try {
    const doc = await UGPGSchool.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: "School not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error("getSchoolById error", err);
    return res.status(500).json({ success: false, message: "Failed to fetch school" });
  }
};

// Update
exports.updateSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, shortcode } = req.body;
    const update = {};
    if (name) update.name = name.trim();
    if (status) update.status = status === "Inactive" ? "Inactive" : "Active";
    if (typeof shortcode !== "undefined") update.shortcode = (shortcode || "").trim() || undefined;

    if (update.name) {
      const exists = await UGPGSchool.findOne({ name: update.name, _id: { $ne: id } });
      if (exists) return res.status(409).json({ success: false, message: "School with this name already exists" });
    }

    const doc = await UGPGSchool.findByIdAndUpdate(id, update, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: "School not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error("updateSchool error", err);
    return res.status(500).json({ success: false, message: "Failed to update school" });
  }
};

// Delete
exports.deleteSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await UGPGSchool.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ success: false, message: "School not found" });
    return res.json({ success: true, message: "School deleted" });
  } catch (err) {
    console.error("deleteSchool error", err);
    return res.status(500).json({ success: false, message: "Failed to delete school" });
  }
};
