const UGPGSession = require("../models/UGPGSession");

// Create a new UG/PG session
exports.createSession = async (req, res) => {
  try {
    const { name, startDate, endDate, registrationSeries, enrollmentSeries, series, status } = req.body;
    if (!name || !startDate || !endDate || !registrationSeries || !enrollmentSeries) {
      return res.status(400).json({ success: false, message: "name, startDate, endDate, registrationSeries, enrollmentSeries are required" });
    }
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ success: false, message: "startDate cannot be after endDate" });
    }
    const exists = await UGPGSession.findOne({ name: name.trim() });
    if (exists) return res.status(409).json({ success: false, message: "A session with this name already exists" });

    const doc = await UGPGSession.create({
      name: name.trim(),
      startDate,
      endDate,
      series: series ? String(series).trim() : undefined,
      registrationSeries: String(registrationSeries).trim(),
      enrollmentSeries: String(enrollmentSeries).trim(),
      status: status === "Inactive" ? "Inactive" : "Active",
      createdBy: req.user ? req.user.id : undefined,
    });
    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error("UGPG createSession error", err);
    return res.status(500).json({ success: false, message: "Failed to create session" });
  }
};

// List UG/PG sessions
exports.getSessions = async (_req, res) => {
  try {
    const list = await UGPGSession.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, data: list });
  } catch (err) {
    console.error("UGPG getSessions error", err);
    return res.status(500).json({ success: false, message: "Failed to fetch sessions" });
  }
};

// Get single
exports.getSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await UGPGSession.findById(id);
    if (!doc) return res.status(404).json({ success: false, message: "Session not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error("UGPG getSessionById error", err);
    return res.status(500).json({ success: false, message: "Failed to fetch session" });
  }
};

// Update
exports.updateSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, startDate, endDate, registrationSeries, enrollmentSeries, series, status } = req.body;

    const update = {};
    if (name) update.name = name.trim();
    if (startDate) update.startDate = startDate;
    if (endDate) update.endDate = endDate;
    if (series !== undefined) update.series = String(series).trim();
    if (registrationSeries !== undefined) update.registrationSeries = String(registrationSeries).trim();
    if (enrollmentSeries !== undefined) update.enrollmentSeries = String(enrollmentSeries).trim();
    if (status) update.status = status === "Inactive" ? "Inactive" : "Active";

    if (update.startDate && update.endDate && new Date(update.startDate) > new Date(update.endDate)) {
      return res.status(400).json({ success: false, message: "startDate cannot be after endDate" });
    }

    if (update.name) {
      const exists = await UGPGSession.findOne({ name: update.name, _id: { $ne: id } });
      if (exists) return res.status(409).json({ success: false, message: "A session with this name already exists" });
    }

    const doc = await UGPGSession.findByIdAndUpdate(id, update, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: "Session not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error("UGPG updateSession error", err);
    return res.status(500).json({ success: false, message: "Failed to update session" });
  }
};

// Delete
exports.deleteSession = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await UGPGSession.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ success: false, message: "Session not found" });
    return res.json({ success: true, message: "Session deleted" });
  } catch (err) {
    console.error("UGPG deleteSession error", err);
    return res.status(500).json({ success: false, message: "Failed to delete session" });
  }
};
