const VisitorLog = require("../models/VisitorLog");

// Build a case-insensitive regex from query text
function like(q) {
  return new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
}

exports.createVisitorLog = async (req, res) => {
  try {
    const data = req.body || {};
    const log = await VisitorLog.create(data);
    return res.status(201).json({ success: true, data: log });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};

exports.listVisitorLogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const q = String(search || "").trim();

    const filter = q
      ? {
          $or: [
            { visitPurpose: like(q) },
            { department: like(q) },
            { name: like(q) },
            { fatherName: like(q) },
            { phone: like(q) },
            { email: like(q) },
            { idNumber: like(q) },
            { address: like(q) },
            { visitFrom: like(q) },
            { date: like(q) },
            { timeIn: like(q) },
            { timeOut: like(q) },
            { remarks: like(q) },
          ],
        }
      : {};

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      VisitorLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      VisitorLog.countDocuments(filter),
    ]);

    return res.json({ success: true, data: items, total });
  } catch (e) {
    return res.status(500).json({ success: false, message: e.message });
  }
};

exports.updateVisitorLog = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body || {};
    const updated = await VisitorLog.findByIdAndUpdate(id, data, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true, data: updated });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};

exports.deleteVisitorLog = async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await VisitorLog.findByIdAndDelete(id);
    if (!removed) return res.status(404).json({ success: false, message: "Not found" });
    return res.json({ success: true });
  } catch (e) {
    return res.status(400).json({ success: false, message: e.message });
  }
};
