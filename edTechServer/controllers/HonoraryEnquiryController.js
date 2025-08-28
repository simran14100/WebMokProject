const HonoraryEnquiry = require('../models/HonoraryEnquiry');
const { validationResult } = require('express-validator');

// Get all honorary enquiries with pagination and search
exports.getHonoraryEnquiries = async (req, res) => {
    try {
        const { q = '', status = '', department = '', page = 1, limit = 10 } = req.query;
        
        const query = { type: 'honorary' };
        
        // Add search query
        if (q) {
            query.$or = [
                { studentName: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } },
                { phone: { $regex: q, $options: 'i' } }
            ];
        }
        
        // Add status filter
        if (status) {
            query.status = status;
        }
        
        // Add department filter
        if (department) {
            query.department = department;
        }
        
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 },
            populate: 'department',
            lean: true
        };
        
        const result = await HonoraryEnquiry.paginate(query, options);
        
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
        console.error('Error fetching honorary enquiries:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch honorary enquiries',
            error: error.message
        });
    }
};

// Get single honorary enquiry by ID
exports.getHonoraryEnquiryById = async (req, res) => {
    try {
        const enquiry = await HonoraryEnquiry.findById(req.params.id)
            .populate('department')
            .lean();
            
        if (!enquiry) {
            return res.status(404).json({
                success: false,
                message: 'Honorary enquiry not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: enquiry
        });
        
    } catch (error) {
        console.error('Error fetching honorary enquiry:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch honorary enquiry',
            error: error.message
        });
    }
};

// Create new honorary enquiry
exports.createHonoraryEnquiry = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const enquiryData = {
            ...req.body,
            type: 'honorary',
            status: 'pending'
        };
        
        if (req.user) {
            enquiryData.createdBy = req.user.id;
        }
        
        const enquiry = await HonoraryEnquiry.create(enquiryData);
        
        res.status(201).json({
            success: true,
            data: enquiry,
            message: 'Honorary enquiry created successfully'
        });
        
    } catch (error) {
        console.error('Error creating honorary enquiry:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create honorary enquiry',
            error: error.message
        });
    }
};

// Update honorary enquiry
exports.updateHonoraryEnquiry = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        
        const updateData = { ...req.body };
        
        if (req.user) {
            updateData.updatedBy = req.user.id;
        }
        
        const enquiry = await HonoraryEnquiry.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!enquiry) {
            return res.status(404).json({
                success: false,
                message: 'Honorary enquiry not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: enquiry,
            message: 'Honorary enquiry updated successfully'
        });
        
    } catch (error) {
        console.error('Error updating honorary enquiry:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update honorary enquiry',
            error: error.message
        });
    }
};

// Delete honorary enquiry
exports.deleteHonoraryEnquiry = async (req, res) => {
    try {
        const enquiry = await HonoraryEnquiry.findByIdAndDelete(req.params.id);
        
        if (!enquiry) {
            return res.status(404).json({
                success: false,
                message: 'Honorary enquiry not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Honorary enquiry deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting honorary enquiry:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete honorary enquiry',
            error: error.message
        });
    }
};
