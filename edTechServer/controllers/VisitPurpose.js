const VisitPurpose = require('../models/VisitPurpose');
const mongoose = require('mongoose');

// Get all visit purposes
exports.getVisitPurposes = async (req, res) => {
    try {
        const purposes = await VisitPurpose.find({}).sort({ name: 1 });
        res.json(purposes);
    } catch (err) {
        console.error('Error fetching visit purposes:', err);
        res.status(500).json({ error: 'Failed to fetch visit purposes' });
    }
};

// Get single visit purpose
exports.getVisitPurpose = async (req, res) => {
    try {
        const purpose = await VisitPurpose.findById(req.params.id);
        if (!purpose) {
            return res.status(404).json({ error: 'Visit purpose not found' });
        }
        res.json(purpose);
    } catch (err) {
        console.error('Error fetching visit purpose:', err);
        res.status(500).json({ error: 'Failed to fetch visit purpose' });
    }
};

// Create visit purpose
exports.createVisitPurpose = async (req, res) => {
    try {
        const { name, description } = req.body;
        
        if (!name) {
            return res.status(400).json({ error: 'Name is required' });
        }

        const purpose = new VisitPurpose({
            name: name.trim(),
            description: description ? description.trim() : '',
            isActive: true
        });

        const savedPurpose = await purpose.save();
        res.status(201).json(savedPurpose);
    } catch (err) {
        console.error('Error creating visit purpose:', err);
        if (err.code === 11000) {
            res.status(400).json({ error: 'A visit purpose with this name already exists' });
        } else {
            res.status(500).json({ error: 'Failed to create visit purpose' });
        }
    }
};

// Update visit purpose
exports.updateVisitPurpose = async (req, res) => {
    try {
        const { name, description, isActive } = req.body;
        const updates = {};
        
        if (name) updates.name = name.trim();
        if (description !== undefined) updates.description = description.trim();
        if (isActive !== undefined) updates.isActive = isActive;

        const purpose = await VisitPurpose.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!purpose) {
            return res.status(404).json({ error: 'Visit purpose not found' });
        }

        res.json(purpose);
    } catch (err) {
        console.error('Error updating visit purpose:', err);
        if (err.code === 11000) {
            res.status(400).json({ error: 'A visit purpose with this name already exists' });
        } else {
            res.status(500).json({ error: 'Failed to update visit purpose' });
        }
    }
};

// Delete visit purpose
exports.deleteVisitPurpose = async (req, res) => {
    try {
        const purpose = await VisitPurpose.findByIdAndDelete(req.params.id);
        if (!purpose) {
            return res.status(404).json({ error: 'Visit purpose not found' });
        }
        res.json({ message: 'Visit purpose deleted successfully' });
    } catch (err) {
        console.error('Error deleting visit purpose:', err);
        res.status(500).json({ error: 'Failed to delete visit purpose' });
    }
};
