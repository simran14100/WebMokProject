const Language = require("../models/Language");

// List all languages
exports.getLanguages = async (_req, res) => {
  try {
    const list = await Language.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, data: list });
  } catch (err) {
    console.error("getLanguages error", err);
    return res.status(500).json({ success: false, message: "Failed to fetch languages" });
  }
};

// Create new language
exports.createLanguage = async (req, res) => {
  try {
    const { name, code, description = "", direction = "LTR", status = "Active", isDefault = false } = req.body || {};
    if (!name || !code) {
      return res.status(400).json({ success: false, message: "Name and code are required" });
    }
    const exists = await Language.findOne({ $or: [{ name: name.trim() }, { code: code.trim().toLowerCase() }] });
    if (exists) {
      return res.status(409).json({ success: false, message: "Language with same name/code already exists" });
    }
    // If this is to be default, unset any existing default first
    if (isDefault === true) {
      await Language.updateMany({ isDefault: true }, { $set: { isDefault: false } });
    }

    const doc = await Language.create({
      name: name.trim(),
      code: code.trim().toLowerCase(),
      description: description?.trim?.() || "",
      direction: ["LTR", "RTL"].includes(direction) ? direction : "LTR",
      status: ["Active", "Inactive"].includes(status) ? status : "Active",
      isDefault: !!isDefault,
      createdBy: req.user?.id,
    });
    return res.status(201).json({ success: true, data: doc, message: "Language created" });
  } catch (err) {
    console.error("createLanguage error", err);
    return res.status(500).json({ success: false, message: "Failed to create language" });
  }
};

// Update language
exports.updateLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, direction, status, isDefault } = req.body || {};
    const update = {};
    if (name !== undefined) update.name = name.trim();
    if (code !== undefined) update.code = code.trim().toLowerCase();
    if (description !== undefined) update.description = description?.trim?.() || "";
    if (direction !== undefined && ["LTR", "RTL"].includes(direction)) update.direction = direction;
    if (status !== undefined && ["Active", "Inactive"].includes(status)) update.status = status;

    // Handle default toggling: if setting current as default true, unset others first
    if (isDefault !== undefined) {
      if (isDefault === true) {
        await Language.updateMany({ isDefault: true }, { $set: { isDefault: false } });
        update.isDefault = true;
      } else if (isDefault === false) {
        update.isDefault = false;
      }
    }

    const doc = await Language.findByIdAndUpdate(id, update, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: "Language not found" });
    return res.json({ success: true, data: doc, message: "Language updated" });
  } catch (err) {
    console.error("updateLanguage error", err);
    return res.status(500).json({ success: false, message: "Failed to update language" });
  }
};

// Delete language
exports.deleteLanguage = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Language.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ success: false, message: "Language not found" });
    return res.json({ success: true, message: "Language deleted" });
  } catch (err) {
    console.error("deleteLanguage error", err);
    return res.status(500).json({ success: false, message: "Failed to delete language" });
  }
};
