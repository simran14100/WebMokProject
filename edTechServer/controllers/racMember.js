const RacMember = require("../models/RacMember");

exports.listMembers = async (req, res) => {
  try {
    const members = await RacMember.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: members });
  } catch (error) {
    console.error("List RAC members error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch RAC members" });
  }
};

exports.createMember = async (req, res) => {
  try {
    const { name, designation, department } = req.body;
    if (!name || !designation || !department) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    const member = await RacMember.create({ name: name.trim(), designation: designation.trim(), department: department.trim() });
    return res.status(201).json({ success: true, data: member, message: "RAC member created" });
  } catch (error) {
    console.error("Create RAC member error:", error);
    return res.status(500).json({ success: false, message: "Failed to create RAC member" });
  }
};

exports.deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await RacMember.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: "Member not found" });
    await RacMember.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Member deleted" });
  } catch (error) {
    console.error("Delete RAC member error:", error);
    return res.status(500).json({ success: false, message: "Failed to delete RAC member" });
  }
};

exports.updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, designation, department } = req.body;
    const existing = await RacMember.findById(id);
    if (!existing) return res.status(404).json({ success: false, message: "Member not found" });
    if (!name || !designation || !department) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    existing.name = name.trim();
    existing.designation = designation.trim();
    existing.department = department.trim();
    await existing.save();
    return res.status(200).json({ success: true, data: existing, message: "Member updated" });
  } catch (error) {
    console.error("Update RAC member error:", error);
    return res.status(500).json({ success: false, message: "Failed to update RAC member" });
  }
};
