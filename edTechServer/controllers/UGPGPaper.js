const UGPGPaper = require("../models/UGPGPaper");

// Create
exports.createPaper = async (req, res) => {
  try {
    const { code, name, theoryMax, theoryMinPass, iaMax, iaMinPass, credit, paperType, status } = req.body;
    if (!code || !name) return res.status(400).json({ success: false, message: "code and name are required" });
    const doc = await UGPGPaper.create({
      code: String(code).trim(),
      name: String(name).trim(),
      theoryMax: Number(theoryMax) || 0,
      theoryMinPass: Number(theoryMinPass) || 0,
      iaMax: Number(iaMax) || 0,
      iaMinPass: Number(iaMinPass) || 0,
      credit: Number(credit) || 0,
      paperType,
      status: status === "Inactive" ? "Inactive" : "Active",
      createdBy: req.user ? req.user.id : undefined,
    });
    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error("createPaper error", err);
    if (err.code === 11000) return res.status(409).json({ success: false, message: "Paper with this code & name already exists" });
    return res.status(500).json({ success: false, message: "Failed to create paper" });
  }
};

// List with basic pagination & search
exports.listPapers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const p = Math.max(1, parseInt(page));
    const l = Math.max(1, Math.min(100, parseInt(limit)));
    const q = String(search || "").trim();
    const filter = q ? { $or: [{ code: { $regex: q, $options: "i" } }, { name: { $regex: q, $options: "i" } }] } : {};

    const [items, total] = await Promise.all([
      UGPGPaper.find(filter).sort({ createdAt: -1 }).skip((p - 1) * l).limit(l),
      UGPGPaper.countDocuments(filter),
    ]);
    return res.json({ success: true, data: { items, meta: { total, page: p, limit: l } } });
  } catch (err) {
    console.error("listPapers error", err);
    return res.status(500).json({ success: false, message: "Failed to fetch papers" });
  }
};

// Get one
exports.getPaper = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await UGPGPaper.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: "Paper not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error("getPaper error", err);
    return res.status(500).json({ success: false, message: "Failed to fetch paper" });
  }
};

// Update
exports.updatePaper = async (req, res) => {
  try {
    const { id } = req.params;
    const update = { ...req.body };
    if (update.code) update.code = String(update.code).trim();
    if (update.name) update.name = String(update.name).trim();
    ["theoryMax", "theoryMinPass", "iaMax", "iaMinPass", "credit"].forEach((k) => {
      if (update[k] !== undefined) update[k] = Number(update[k]) || 0;
    });
    const doc = await UGPGPaper.findByIdAndUpdate(id, update, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: "Paper not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error("updatePaper error", err);
    return res.status(500).json({ success: false, message: "Failed to update paper" });
  }
};

// Delete
exports.deletePaper = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await UGPGPaper.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ success: false, message: "Paper not found" });
    return res.json({ success: true, message: "Paper deleted" });
  } catch (err) {
    console.error("deletePaper error", err);
    return res.status(500).json({ success: false, message: "Failed to delete paper" });
  }
};
