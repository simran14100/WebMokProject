const Enquiry = require("../models/Enquiry");

// Public create (e.g., web enquiry form)
exports.createEnquiryPublic = async (req, res) => {
  try {
    const { name, email, phone, department, source, message } = req.body || {};
    if (!name) return res.status(400).json({ success: false, message: "name is required" });
    const doc = await Enquiry.create({ name: name.trim(), email, phone, department, source, message, status: "New" });
    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error("createEnquiryPublic error", err);
    return res.status(500).json({ success: false, message: "Failed to submit enquiry" });
  }
};

// Admin create
exports.createEnquiry = async (req, res) => {
  try {
    const { name, email, phone, department, source, message, status } = req.body || {};
    if (!name) return res.status(400).json({ success: false, message: "name is required" });
    const doc = await Enquiry.create({ name: name.trim(), email, phone, department, source, message, status: status || "New", createdBy: req.user?.id });
    return res.status(201).json({ success: true, data: doc });
  } catch (err) {
    console.error("createEnquiry error", err);
    return res.status(500).json({ success: false, message: "Failed to create enquiry" });
  }
};

// List with filters (q, status, department, page, limit)
exports.getEnquiries = async (req, res) => {
  try {
    const { q, status, department, page = 1, limit = 20 } = req.query || {};
    const filter = {};
    if (status) filter.status = status;
    if (department) filter.department = department;

    if (q) {
      const regex = { $regex: String(q).trim(), $options: "i" };
      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { source: regex },
        { message: regex },
      ];
    }

    const skip = (Math.max(parseInt(page), 1) - 1) * Math.max(parseInt(limit), 1);

    const [items, total] = await Promise.all([
      Enquiry.find(filter).populate("department").sort({ createdAt: -1 }).skip(skip).limit(Math.max(parseInt(limit), 1)),
      Enquiry.countDocuments(filter),
    ]);

    return res.json({ success: true, data: items, meta: { total, page: Number(page), limit: Number(limit) } });
  } catch (err) {
    console.error("getEnquiries error", err);
    return res.status(500).json({ success: false, message: "Failed to fetch enquiries" });
  }
};

// Update (status or details)
exports.updateEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body || {};
    const doc = await Enquiry.findByIdAndUpdate(id, update, { new: true }).populate("department");
    if (!doc) return res.status(404).json({ success: false, message: "Enquiry not found" });
    return res.json({ success: true, data: doc });
  } catch (err) {
    console.error("updateEnquiry error", err);
    return res.status(500).json({ success: false, message: "Failed to update enquiry" });
  }
};

// Delete
exports.deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Enquiry.findByIdAndDelete(id);
    if (!doc) return res.status(404).json({ success: false, message: "Enquiry not found" });
    return res.json({ success: true, message: "Enquiry deleted" });
  } catch (err) {
    console.error("deleteEnquiry error", err);
    return res.status(500).json({ success: false, message: "Failed to delete enquiry" });
  }
};
