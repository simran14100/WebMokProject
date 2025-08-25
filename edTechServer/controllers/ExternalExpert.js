const ExternalExpert = require("../models/ExternalExpert");

exports.listExperts = async (req, res) => {
  try {
    const experts = await ExternalExpert.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: experts });
  } catch (error) {
    console.error("List External Experts error:", error);
    return res.status(500).json({ success: false, message: "Failed to load external experts" });
  }
};

exports.createExpert = async (req, res) => {
  try {
    const { subject, name, email, contactNumber, designation, institute, address } = req.body;
    if (!subject || !name || !email) {
      return res.status(400).json({ success: false, message: "Subject, Name and Email are required" });
    }
    const created = await ExternalExpert.create({ subject: subject.trim(), name: name.trim(), email: email.trim(), contactNumber, designation, institute, address });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error("Create External Expert error:", error);
    return res.status(500).json({ success: false, message: "Failed to create external expert" });
  }
};

exports.updateExpert = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, name, email, contactNumber, designation, institute, address } = req.body;
    const existing = await ExternalExpert.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: "Expert not found" });
    if (!subject || !name || !email) {
      return res.status(400).json({ success: false, message: "Subject, Name and Email are required" });
    }
    existing.subject = subject.trim();
    existing.name = name.trim();
    existing.email = email.trim();
    existing.contactNumber = contactNumber || "";
    existing.designation = designation || "";
    existing.institute = institute || "";
    existing.address = address || "";
    await existing.save();
    return res.status(200).json({ success: true, data: existing });
  } catch (error) {
    console.error("Update External Expert error:", error);
    return res.status(500).json({ success: false, message: "Failed to update external expert" });
  }
};

exports.deleteExpert = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await ExternalExpert.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: "Expert not found" });
    await ExternalExpert.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Expert deleted" });
  } catch (error) {
    console.error("Delete External Expert error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete external expert" });
  }
};
