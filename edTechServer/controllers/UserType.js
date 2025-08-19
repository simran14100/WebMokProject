const UserType = require('../models/UserType');

// Create a new User Type
exports.createUserType = async (req, res) => {
  try {
    const { name, contentManagement = false, trainerManagement = false } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const exists = await UserType.findOne({ name: name.trim() });
    if (exists) {
      return res.status(409).json({ success: false, message: 'User type already exists' });
    }

    const doc = await UserType.create({
      name: name.trim(),
      contentManagement: Boolean(contentManagement),
      trainerManagement: Boolean(trainerManagement),
      createdBy: req.user?.id,
    });

    return res.status(201).json({ success: true, message: 'User type created', data: doc });
  } catch (err) {
    console.error('createUserType error', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// List user types (minimal for future use)
exports.listUserTypes = async (_req, res) => {
  try {
    const items = await UserType.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: items });
  } catch (err) {
    console.error('listUserTypes error', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
