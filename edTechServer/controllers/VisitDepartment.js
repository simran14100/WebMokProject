const VisitDepartment = require('../models/VisitDepartment');

// List all visit departments
exports.getVisitDepartments = async (req, res) => {
  try {
    const list = await VisitDepartment.find({}).sort({ name: 1 });
    return res.json(list);
  } catch (err) {
    console.error('Error fetching visit departments:', err);
    return res.status(500).json({ error: 'Failed to fetch visit departments' });
  }
};

// Get single department
exports.getVisitDepartment = async (req, res) => {
  try {
    const doc = await VisitDepartment.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Visit department not found' });
    return res.json(doc);
  } catch (err) {
    console.error('Error fetching visit department:', err);
    return res.status(500).json({ error: 'Failed to fetch visit department' });
  }
};

// Create
exports.createVisitDepartment = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }
    const doc = await VisitDepartment.create({
      name: name.trim(),
      description: (description || '').trim(),
      status: status === 'Inactive' ? 'Inactive' : 'Active',
    });
    return res.status(201).json(doc);
  } catch (err) {
    console.error('Error creating visit department:', err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'A visit department with this name already exists' });
    }
    return res.status(500).json({ error: 'Failed to create visit department' });
  }
};

// Update
exports.updateVisitDepartment = async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name.trim();
    if (req.body.description !== undefined) updates.description = (req.body.description || '').trim();
    if (req.body.status !== undefined) updates.status = req.body.status === 'Inactive' ? 'Inactive' : 'Active';

    const doc = await VisitDepartment.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ error: 'Visit department not found' });
    return res.json(doc);
  } catch (err) {
    console.error('Error updating visit department:', err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'A visit department with this name already exists' });
    }
    return res.status(500).json({ error: 'Failed to update visit department' });
  }
};

// Delete
exports.deleteVisitDepartment = async (req, res) => {
  try {
    const doc = await VisitDepartment.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Visit department not found' });
    return res.json({ message: 'Visit department deleted successfully' });
  } catch (err) {
    console.error('Error deleting visit department:', err);
    return res.status(500).json({ error: 'Failed to delete visit department' });
  }
};
