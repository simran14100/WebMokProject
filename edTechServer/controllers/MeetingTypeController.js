const MeetingType = require('../models/MeetingType');
const { validationResult } = require('express-validator');

// Create a new meeting type
exports.createMeetingType = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const meetingTypeData = {
            ...req.body,
            createdBy: req.user._id
        };

        const meetingType = await MeetingType.create(meetingTypeData);

        res.status(201).json({
            success: true,
            data: meetingType,
            message: 'Meeting type created successfully'
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Meeting type with this name already exists'
            });
        }
        console.error('Error creating meeting type:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create meeting type',
            error: error.message
        });
    }
};

// Get all meeting types with pagination and filters
exports.getMeetingTypes = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search = '',
            isActive = ''
        } = req.query;

        const query = {};

        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Active status filter
        if (isActive === 'true' || isActive === 'false') {
            query.isActive = isActive === 'true';
        }

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { name: 1 },
            populate: [
                { path: 'createdBy', select: 'firstName lastName' },
                { path: 'updatedBy', select: 'firstName lastName' }
            ],
            lean: true
        };

        const result = await MeetingType.paginate(query, options);

        res.status(200).json({
            success: true,
            data: result.docs,
            meta: {
                total: result.totalDocs,
                page: result.page,
                limit: result.limit,
                totalPages: result.totalPages
            }
        });

    } catch (error) {
        console.error('Error fetching meeting types:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch meeting types',
            error: error.message
        });
    }
};

// Get meeting type by ID
exports.getMeetingTypeById = async (req, res) => {
    try {
        const meetingType = await MeetingType.findById(req.params.id)
            .populate([
                { path: 'createdBy', select: 'firstName lastName' },
                { path: 'updatedBy', select: 'firstName lastName' }
            ]);

        if (!meetingType) {
            return res.status(404).json({
                success: false,
                message: 'Meeting type not found'
            });
        }

        res.status(200).json({
            success: true,
            data: meetingType
        });

    } catch (error) {
        console.error('Error fetching meeting type:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch meeting type',
            error: error.message
        });
    }
};

// Update meeting type
exports.updateMeetingType = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const updateData = {
            ...req.body,
            updatedBy: req.user._id || req.user.id
        };

        const meetingType = await MeetingType.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!meetingType) {
            return res.status(404).json({
                success: false,
                message: 'Meeting type not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: meetingType,
            message: 'Meeting type updated successfully'
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Meeting type with this name already exists'
            });
        }
        console.error('Error updating meeting type:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update meeting type',
            error: error.message
        });
    }
};

// Delete meeting type
exports.deleteMeetingType = async (req, res) => {
    try {
        // Check if there are any meetings using this type (optional if Meeting model exists)
        let meetingsCount = 0;
        try {
            const Meeting = require('../models/Meeting');
            meetingsCount = await Meeting.countDocuments({ meetingType: req.params.id });
        } catch (e) {
            // Meeting model not present; proceed without blocking deletion
            meetingsCount = 0;
        }

        if (meetingsCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete meeting type as it is being used by one or more meetings'
            });
        }

        const meetingType = await MeetingType.findByIdAndDelete(req.params.id);
        if (!meetingType) {
            return res.status(404).json({
                success: false,
                message: 'Meeting type not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Meeting type deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting meeting type:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete meeting type',
            error: error.message
        });
    }
};

// Get active meeting types for dropdown
exports.getActiveMeetingTypes = async (req, res) => {
    try {
        const meetingTypes = await MeetingType.find({ isActive: true })
            .select('name duration color')
            .sort({ name: 1 })
            .lean();

        res.status(200).json({
            success: true,
            data: meetingTypes
        });

    } catch (error) {
        console.error('Error fetching active meeting types:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch active meeting types',
            error: error.message
        });
    }
};
