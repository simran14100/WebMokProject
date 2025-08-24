const Guide = require('../models/Guide');

// List guides with search and pagination
exports.listGuides = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const q = (search || '').trim();
    const filter = q
      ? {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { subject: { $regex: q, $options: 'i' } },
            { designation: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } },
            { contactNumber: { $regex: q, $options: 'i' } },
            { institute: { $regex: q, $options: 'i' } },
            { address: { $regex: q, $options: 'i' } },
          ],
        }
      : {};

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageLimit = Math.max(1, parseInt(limit, 10) || 10);

    const [total, items] = await Promise.all([
      Guide.countDocuments(filter),
      Guide.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * pageLimit)
        .limit(pageLimit)
        .lean(),
    ]);

    return res.json({ success: true, items, meta: { total, page: pageNum, limit: pageLimit } });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to list guides', error: err.message });
  }
};

// Create guide
exports.createGuide = async (req, res) => {
  try {
    const { name, subject, designation, email, contactNumber, institute, address = '', status = 'Active' } = req.body;
    if (!name || !subject || !designation || !email || !contactNumber || !institute) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const doc = await Guide.create({ name, subject, designation, email, contactNumber, institute, address, status, createdBy: req.user.id });
    return res.status(201).json({ success: true, item: doc });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'Duplicate guide (name/email must be unique)' });
    }
    return res.status(500).json({ success: false, message: 'Failed to create guide', error: err.message });
  }
};

// Update guide
exports.updateGuide = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subject, designation, email, contactNumber, institute, address, status } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (subject !== undefined) updates.subject = subject;
    if (designation !== undefined) updates.designation = designation;
    if (email !== undefined) updates.email = email;
    if (contactNumber !== undefined) updates.contactNumber = contactNumber;
    if (institute !== undefined) updates.institute = institute;
    if (address !== undefined) updates.address = address;
    if (status !== undefined) updates.status = status;

    const doc = await Guide.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Guide not found' });
    return res.json({ success: true, item: doc });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update guide', error: err.message });
  }
};

// Delete guide
exports.deleteGuide = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Guide.findByIdAndDelete(id).lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Guide not found' });
    return res.json({ success: true, message: 'Guide deleted' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete guide', error: err.message });
  }
};
