const UGPGSubject = require("../models/UGPGSubject");

// Create UGPG Subject
exports.createSubject = async (req, res) => {
  try {
    const { name, department, status } = req.body;
    if (!name || !department) {
      return res.status(400).json({ success: false, message: "name and department are required" });
    }
    const exists = await UGPGSubject.findOne({ name: name.trim(), department });
    if (exists) return res.status(409).json({ success: false, message: "Subject already exists in this department" });

    const doc = await UGPGSubject.create({ name: name.trim(), department, status: status === "Inactive" ? "Inactive" : "Active", createdBy: req.user ? req.user.id : undefined });
    const populated = await doc.populate("department");
    return res.status(201).json({ success: true, data: populated });
  } catch (err) {
    console.error("UGPG createSubject error", err);
    return res.status(500).json({ success: false, message: "Failed to create subject" });
  }
};

// List UGPG Subjects with optional search and pagination
exports.getSubjects = async (req, res) => {
  try {
    const { q, page = 1, limit = 20, department } = req.query;
    const filter = {};
    const regex = q ? { $regex: String(q).trim(), $options: "i" } : null;
    if (department) filter.department = department;

    if (regex) {
      const Department = require("../models/Department");
      const matchedDepartments = await Department.find({ name: regex }).select("_id");
      const deptIds = matchedDepartments.map((d) => d._id);
      filter.$or = [{ name: regex }];
      if (deptIds.length) filter.$or.push({ department: { $in: deptIds } });
    }

    const skip = (Math.max(parseInt(page), 1) - 1) * Math.max(parseInt(limit), 1);

    const [items, total] = await Promise.all([
      UGPGSubject.find(filter)
        .populate("department")
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
    const doc = await UGPGSubject.findById(req.params.id).populate("department");
    if (!doc) return res.status(404).json({ success: false, message: "Subject not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error("UGPG getSubjectById error", err);
    return res.status(500).json({ success: false, message: "Failed to fetch subject" });
  }
};

// Update
exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department, status } = req.body;

    const update = {};
    if (name) update.name = name.trim();
    if (department) update.department = department;
    if (status) update.status = status === "Inactive" ? "Inactive" : "Active";

    if (update.name || update.department) {
      const docExisting = await UGPGSubject.findById(id);
      if (!docExisting) return res.status(404).json({ success: false, message: "Subject not found" });
      const uniqueName = update.name || docExisting.name;
      const uniqueDept = update.department || String(docExisting.department);
      const exists = await UGPGSubject.findOne({ _id: { $ne: id }, name: uniqueName, department: uniqueDept });
      if (exists) return res.status(409).json({ success: false, message: "Subject already exists in this department" });
    }

    const doc = await UGPGSubject.findByIdAndUpdate(id, update, { new: true }).populate("department");
    if (!doc) return res.status(404).json({ success: false, message: "Subject not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error("UGPG updateSubject error", err);
    return res.status(500).json({ success: false, message: "Failed to update subject" });
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
