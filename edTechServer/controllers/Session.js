const Session = require("../models/Session");

// Create a new session
exports.createSession = async (req, res) => {
  try {
    const { name, startDate, endDate, series, status } = req.body;

    if (!name || !startDate || !endDate || !series) {
      return res.status(400).json({ success: false, message: "name, startDate, endDate, series are required" });
    }

    // Ensure startDate <= endDate
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ success: false, message: "startDate cannot be after endDate" });
    }

    // Unique name constraint
    const exists = await Session.findOne({ name: name.trim() });
    if (exists) {
      return res.status(409).json({ success: false, message: "A session with this name already exists" });
    }

    const doc = await Session.create({
      name: name.trim(),
      startDate,
      endDate,
      series: String(series).trim(),
      status: status === "Inactive" ? "Inactive" : "Active",
      createdBy: req.user ? req.user.id : undefined,
    });

    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error("createSession error", err);
    return res.status(500).json({ success: false, message: "Failed to create session" });
  }
};

// Get all sessions
exports.getSessions = async (_req, res) => {
  try {
    const list = await Session.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, data: list });
  } catch (err) {
    console.error("getSessions error", err);
    return res.status(500).json({ success: false, message: "Failed to fetch sessions" });
  }
};

// Get single session
exports.getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Session.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: "Session not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error("getSessionById error", err);
    return res.status(500).json({ success: false, message: "Failed to fetch session" });
  }
};

// Update session
exports.updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate, series, status } = req.body;

    const update = {};
    if (name) update.name = name.trim();
    if (startDate) update.startDate = startDate;
    if (endDate) update.endDate = endDate;
    if (series !== undefined) update.series = String(series).trim();
    if (status) update.status = status === "Inactive" ? "Inactive" : "Active";

    if (update.startDate && update.endDate && new Date(update.startDate) > new Date(update.endDate)) {
      return res.status(400).json({ success: false, message: "startDate cannot be after endDate" });
    }

    if (update.name) {
      const exists = await Session.findOne({ name: update.name, _id: { $ne: id } });
      if (exists) return res.status(409).json({ success: false, message: "A session with this name already exists" });
    }

    const doc = await Session.findByIdAndUpdate(id, update, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: "Session not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error("updateSession error", err);
    return res.status(500).json({ success: false, message: "Failed to update session" });
  }
};

// Delete session
exports.deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Session.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ success: false, message: "Session not found" });
    return res.json({ success: true, message: "Session deleted" });
  } catch (err) {
    console.error("deleteSession error", err);
    return res.status(500).json({ success: false, message: "Failed to delete session" });
  }
};