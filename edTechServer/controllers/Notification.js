const Notification = require("../models/Notification");

// POST /api/v1/admin/notifications
exports.createNotification = async (req, res) => {
  try {
    const { title = "", message = "" } = req.body || {};
    if (!title.trim() || !message.trim()) {
      return res.status(400).json({ success: false, message: "Title and message are required" });
    }
    const doc = await Notification.create({ title: title.trim(), message: message.trim(), createdBy: req.user._id });
    return res.status(201).json({ success: true, data: doc });
  } catch (error) {
    console.error("CREATE NOTIFICATION ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/v1/admin/notifications
exports.listNotifications = async (_req, res) => {
  try {
    const docs = await Notification.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, data: docs });
  } catch (error) {
    console.error("LIST NOTIFICATIONS ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// DELETE /api/v1/admin/notifications/:id
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Notification.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: "Notification not found" });
    return res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    console.error("DELETE NOTIFICATION ERROR:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
