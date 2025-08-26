const ExamSession = require("../models/ExamSession");

// Create a new Exam Session
exports.createExamSession = async (req, res) => {
  try {
    const { batchName, month, year, lateFeeDate, lateFee, resultDate, status } = req.body;

    if (!batchName || !month || !year) {
      return res.status(400).json({ success: false, message: "batchName, month, year are required" });
    }

    // uniqueness by batchName + month + year
    const exists = await ExamSession.findOne({ batchName: batchName.trim(), month: month.trim(), year: String(year).trim() });
    if (exists) {
      return res.status(409).json({ success: false, message: "Exam session already exists for this batch, month and year" });
    }

    const doc = await ExamSession.create({
      batchName: batchName.trim(),
      month: month.trim(),
      year: String(year).trim(),
      lateFeeDate: lateFeeDate || undefined,
      lateFee: lateFee ? Number(lateFee) : 0,
      resultDate: resultDate || undefined,
      status: status === "Inactive" ? "Inactive" : "Active",
      createdBy: req.user ? req.user.id : undefined,
    });

    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error("ExamSession create error", err);
    return res.status(500).json({ success: false, message: "Failed to create exam session" });
  }
};

// List exam sessions
exports.listExamSessions = async (_req, res) => {
  try {
    const list = await ExamSession.find({}).sort({ createdAt: -1 });
    return res.json({ success: true, data: list });
  } catch (err) {
    console.error("ExamSession list error", err);
    return res.status(500).json({ success: false, message: "Failed to fetch exam sessions" });
  }
};

// Update
exports.updateExamSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { batchName, month, year, lateFeeDate, lateFee, resultDate, status } = req.body;

    const update = {};
    if (batchName !== undefined) update.batchName = batchName.trim();
    if (month !== undefined) update.month = month.trim();
    if (year !== undefined) update.year = String(year).trim();
    if (lateFeeDate !== undefined) update.lateFeeDate = lateFeeDate || undefined;
    if (lateFee !== undefined) update.lateFee = Number(lateFee) || 0;
    if (resultDate !== undefined) update.resultDate = resultDate || undefined;
    if (status !== undefined) update.status = status === "Inactive" ? "Inactive" : "Active";

    if (update.batchName || update.month || update.year) {
      const docCurrent = await ExamSession.findById(id);
      if (!docCurrent) return res.status(404).json({ success: false, message: "Exam session not found" });
      const next = {
        batchName: update.batchName || docCurrent.batchName,
        month: update.month || docCurrent.month,
        year: update.year || docCurrent.year,
      };
      const dupe = await ExamSession.findOne({ _id: { $ne: id }, batchName: next.batchName, month: next.month, year: next.year });
      if (dupe) return res.status(409).json({ success: false, message: "Another exam session exists with same batch, month and year" });
    }

    const doc = await ExamSession.findByIdAndUpdate(id, update, { new: true });
    if (!doc) return res.status(404).json({ success: false, message: "Exam session not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error("ExamSession update error", err);
    return res.status(500).json({ success: false, message: "Failed to update exam session" });
  }
};

// Delete
exports.deleteExamSession = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await ExamSession.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ success: false, message: "Exam session not found" });
    return res.json({ success: true, message: "Exam session deleted" });
  } catch (err) {
    console.error("ExamSession delete error", err);
    return res.status(500).json({ success: false, message: "Failed to delete exam session" });
  }
};
