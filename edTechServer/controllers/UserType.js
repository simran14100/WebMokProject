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

// Update a User Type
exports.updateUserType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contentManagement, trainerManagement } = req.body;

    const userType = await UserType.findById(id);
    if (!userType) {
      return res.status(404).json({ success: false, message: 'User type not found' });
    }

    // Check if name is being updated and if it already exists
    if (name && name.trim() !== userType.name) {
      const exists = await UserType.findOne({ name: name.trim(), _id: { $ne: id } });
      if (exists) {
        return res.status(409).json({ success: false, message: 'User type with this name already exists' });
      }
      userType.name = name.trim();
    }

    // Update other fields if provided
    if (typeof contentManagement !== 'undefined') {
      userType.contentManagement = Boolean(contentManagement);
    }
    if (typeof trainerManagement !== 'undefined') {
      userType.trainerManagement = Boolean(trainerManagement);
    }

    userType.updatedAt = Date.now();
    await userType.save();

    return res.status(200).json({ 
      success: true, 
      message: 'User type updated successfully', 
      data: userType 
    });
  } catch (err) {
    console.error('updateUserType error', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Delete a User Type
exports.deleteUserType = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if any users are using this user type
    const User = require('../models/User');
    const userCount = await User.countDocuments({ accountType: id });
    
    if (userCount > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete user type as it is assigned to one or more users' 
      });
    }

    const result = await UserType.findByIdAndDelete(id);
    if (!result) {
      return res.status(404).json({ success: false, message: 'User type not found' });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'User type deleted successfully' 
    });
  } catch (err) {
    console.error('deleteUserType error', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
