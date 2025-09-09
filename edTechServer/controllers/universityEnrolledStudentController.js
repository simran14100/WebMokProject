
const UniversityRegisteredStudent = require('../models/UniversityRegisteredStudent');
const User = require('../models/User');
const { Types: { ObjectId } } = require('mongoose');


exports.getAllApprovedStudents = async (req, res) => {
    try {
        const { search = '' } = req.query;
        console.log('Search query:', search);
        
        // Build query for approved students
        const query = { status: 'approved' };
        
        // Add search functionality
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { registrationNumber: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } },
                { 'address.city': { $regex: search, $options: 'i' } },
                { 'address.state': { $regex: search, $options: 'i' } },
                { course: { $regex: search, $options: 'i' } },
                { specialization: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Get all approved students with necessary fields
        const students = await UniversityRegisteredStudent.find(query)
            .select('-password -__v -updatedAt -verificationToken -verificationTokenExpires')
            .sort({ createdAt: -1 });
            
        console.log(`Found ${students.length} approved students`);
        
        res.status(200).json({
            success: true,
            data: students
        });
    } catch (error) {
        console.error('Error fetching approved students:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch approved students',
            error: error.message
        });
    }
};



// Update enrollment status
exports.updateEnrollmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        // Validate status
        if (!['enrolled', 'withdrawn', 'completed', 'suspended'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: enrolled, withdrawn, completed, suspended'
            });
        }

        // Find and update the enrollment
        const enrollment = await UniversityEnrolledStudent.findByIdAndUpdate(
            id, 
            { 
                status,
                updatedBy: req.user._id, // Track who made the update
                statusUpdatedAt: new Date()
            }, 
            { 
                new: true,
                runValidators: true
            }
        )
        .populate('student', 'firstName lastName email phone')
        .lean();
        
        if (!enrollment) {
            return res.status(404).json({ 
                success: false, 
                message: 'Enrollment not found' 
            });
        }

        // Log the status update
        console.log(`Enrollment status updated for enrollment ID: ${id} to ${status}`);

        res.status(200).json({
            success: true,
            message: 'Enrollment status updated successfully',
            data: enrollment
        });
    } catch (error) {
        console.error('Error updating enrollment status:', error);
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: Object.values(error.errors).map(e => e.message)
            });
        }
        
        // Handle cast errors (invalid ID format)
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid enrollment ID format'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Failed to update enrollment status',
            error: error.message
        });
    }
};


